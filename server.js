'use strict';

/**
 * @file server.js
 * @description Local Express development server with full security middleware.
 * In production, Vercel serverless functions (api/chat.js, api/health.js) are used instead.
 */

const http = require('http');
const { URL } = require('url');

// ─── Constants ────────────────────────────────────────────────────────────────

/** @type {Readonly<object>} All tunable limits in one place — no magic numbers */
const CONFIG = Object.freeze({
  PORT: parseInt(process.env.PORT || '3001', 10),
  MAX_MESSAGES: 50,
  MAX_CONTENT_LENGTH: 12000,
  ALLOWED_ROLES: Object.freeze(['user', 'assistant', 'system']),
  REQUEST_TIMEOUT_MS: 60000,
  /** Sliding-window rate limit: window length in ms */
  RATE_LIMIT_WINDOW_MS: 60000,
  /** Max requests per window for general routes */
  RATE_LIMIT_MAX_GENERAL: 60,
  /** Max requests per window for AI routes */
  RATE_LIMIT_MAX_AI: 20,
  /** Max conversation turns stored per session — prevents unbounded growth */
  MAX_HISTORY_TURNS: 20,
  /** Primary model; fallbacks tried in order on 404/429/503 */
  MODEL_FALLBACK_LADDER: Object.freeze([
    process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ]),
});

/** Prompt-injection patterns blocked on every AI request */
const INJECTION_PATTERNS = Object.freeze([
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+instructions/i,
  /disregard/i,
  /new\s+instructions:/i,
  /you\s+are\s+now/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
]);

/** In-memory sliding-window rate limiter store (keyed by IP) */
const _rateLimitStore = new Map();

// ─── Security helpers ─────────────────────────────────────────────────────────

/**
 * Escape HTML entities — used before returning any AI-generated content.
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Returns true if the text contains a prompt-injection pattern.
 * @param {string} text
 * @returns {boolean}
 */
function containsInjection(text) {
  if (typeof text !== 'string') return false;
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

/**
 * Validate and sanitize the messages array from the request body.
 * @param {unknown} messages
 * @returns {{ valid: boolean, error?: string }}
 */
function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'messages must be an array' };
  }
  if (messages.length === 0) {
    return { valid: false, error: 'messages array must not be empty' };
  }
  if (messages.length > CONFIG.MAX_MESSAGES) {
    return { valid: false, error: `messages array exceeds limit of ${CONFIG.MAX_MESSAGES}` };
  }
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: 'each message must be an object' };
    }
    if (!CONFIG.ALLOWED_ROLES.includes(msg.role)) {
      return { valid: false, error: `invalid role "${msg.role}"` };
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'message content must be a string' };
    }
    if (msg.content.length > CONFIG.MAX_CONTENT_LENGTH) {
      return { valid: false, error: `message content exceeds ${CONFIG.MAX_CONTENT_LENGTH} characters` };
    }
    if (containsInjection(msg.content)) {
      return { valid: false, error: 'message contains disallowed content' };
    }
  }
  return { valid: true };
}

/**
 * Map-based sliding-window rate limiter.
 * @param {string} key     - request identifier (usually IP + route category)
 * @param {number} limit   - max requests allowed per window
 * @param {number} windowMs - window duration in milliseconds
 * @returns {boolean} true = request allowed, false = rate-limited
 */
function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let entry = _rateLimitStore.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    entry = { windowStart: now, count: 1 };
    _rateLimitStore.set(key, entry);
    return true;
  }
  entry.count += 1;
  if (entry.count > limit) return false;
  return true;
}

/**
 * Add security response headers to every response.
 * @param {http.ServerResponse} res
 */
function applySecurityHeaders(res) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://api.groq.com; frame-ancestors 'none'; base-uri 'self'"
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
}

// ─── Model fallback call ──────────────────────────────────────────────────────

/**
 * Call the Groq API with automatic model fallback (404/429/503 → next model).
 * Uses AbortController for timeout enforcement; AbortError is handled silently.
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} apiKey
 * @returns {Promise<object>} Parsed Groq response JSON
 */
async function callGroqWithFallback(messages, apiKey) {
  const ladder = CONFIG.MODEL_FALLBACK_LADDER;
  let lastError;

  for (const model of ladder) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          max_tokens: 4000,
        }),
      });

      clearTimeout(timer);

      if (response.status === 404 || response.status === 429 || response.status === 503) {
        lastError = new Error(`Model ${model} returned ${response.status}`);
        continue;
      }

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Groq API ${response.status}: ${body}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        lastError = new Error('Request timed out');
        continue;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('All models in the fallback ladder failed');
}

// ─── Request body reader ──────────────────────────────────────────────────────

/**
 * Collect the request body as a parsed JSON object.
 * @param {http.IncomingMessage} req
 * @returns {Promise<object>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

/**
 * Send a JSON response.
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {object} body
 */
function jsonResponse(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

// ─── Route handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Returns { status, hasApiKey, model, timestamp } — never exposes the key value.
 * @param {http.IncomingMessage} _req
 * @param {http.ServerResponse} res
 */
function handleHealth(_req, res) {
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
  const hasApiKey = apiKey.length > 0 && apiKey !== 'your_groq_api_key_here';
  jsonResponse(res, 200, {
    status: hasApiKey ? 'ok' : 'degraded',
    hasApiKey,
    model: CONFIG.MODEL_FALLBACK_LADDER[0],
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/chat
 * Validates, rate-limits, injection-filters, and proxies messages to Groq.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleChat(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString().split(',')[0].trim();

  if (!checkRateLimit(`ai:${clientIp}`, CONFIG.RATE_LIMIT_MAX_AI, CONFIG.RATE_LIMIT_WINDOW_MS)) {
    return jsonResponse(res, 429, { error: 'Rate limit exceeded. Please wait before retrying.' });
  }

  let body;
  try { body = await readBody(req); }
  catch { return jsonResponse(res, 400, { error: 'Invalid JSON body' }); }

  const validation = validateMessages(body.messages);
  if (!validation.valid) {
    return jsonResponse(res, 400, { error: validation.error });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return jsonResponse(res, 500, { error: 'API not configured' });
  }

  try {
    const groqData = await callGroqWithFallback(body.messages, apiKey);
    const rawContent = groqData?.choices?.[0]?.message?.content;
    if (!rawContent) return jsonResponse(res, 502, { error: 'Empty response from AI model' });

    const safeContent = sanitizeString(rawContent);
    return jsonResponse(res, 200, { content: safeContent });
  } catch (err) {
    console.error('[/api/chat] error:', err.message);
    return jsonResponse(res, 502, { error: 'AI service error. Please retry.' });
  }
}

// ─── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  applySecurityHeaders(res);

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString().split(',')[0].trim();

  // General rate limit (all routes)
  if (!checkRateLimit(`gen:${clientIp}`, CONFIG.RATE_LIMIT_MAX_GENERAL, CONFIG.RATE_LIMIT_WINDOW_MS)) {
    return jsonResponse(res, 429, { error: 'Too many requests' });
  }

  const pathname = new URL(req.url || '/', `http://localhost`).pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    return handleHealth(req, res);
  }

  if (pathname === '/api/chat') {
    return await handleChat(req, res);
  }

  jsonResponse(res, 404, { error: 'Not found' });
});

server.listen(CONFIG.PORT, () => {
  console.log(`[server] LexAI API server running on http://localhost:${CONFIG.PORT}`);
  console.log(`[server] Health: http://localhost:${CONFIG.PORT}/api/health`);
});

module.exports = {
  sanitizeString,
  containsInjection,
  validateMessages,
  checkRateLimit,
  CONFIG,
  INJECTION_PATTERNS,
  _rateLimitStore,
};
