'use strict';

/**
 * @file api/chat.js
 * @description Vercel serverless function — secure AI chat proxy.
 * The Groq API key lives ONLY in process.env (server-side) and is never
 * sent to the browser.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** @type {Readonly<{MAX_MESSAGES: number, MAX_CONTENT_LENGTH: number, MAX_QUESTION_LENGTH: number, ALLOWED_ROLES: ReadonlyArray<string>, REQUEST_TIMEOUT_MS: number, RATE_LIMIT_WINDOW_MS: number, RATE_LIMIT_MAX_GENERAL: number, RATE_LIMIT_MAX_AI: number, MODEL_FALLBACK_LADDER: ReadonlyArray<string>}>} */
const CONFIG = Object.freeze({
  MAX_MESSAGES: 50,
  MAX_CONTENT_LENGTH: 12000,
  MAX_QUESTION_LENGTH: 500,
  ALLOWED_ROLES: Object.freeze(['user', 'assistant', 'system']),
  REQUEST_TIMEOUT_MS: 60000,
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_GENERAL: 60,
  RATE_LIMIT_MAX_AI: 20,
  /** Primary model tried first; falls back in order on 404/429/503 */
  MODEL_FALLBACK_LADDER: Object.freeze([
    process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ]),
});

/** Prompt-injection patterns that must be blocked on the server side */
const INJECTION_PATTERNS = Object.freeze([
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+instructions/i,
  /disregard/i,
  /new\s+instructions:/i,
  /you\s+are\s+now/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
]);

/** Map-based sliding-window rate limiter (keyed by IP) */
const _rateLimitStore = new Map();

// ─── Security helpers ─────────────────────────────────────────────────────────

/**
 * Escape HTML entities so AI output cannot inject markup.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Returns true when the text contains a known prompt-injection pattern.
 * @param {string} text
 * @returns {boolean}
 */
export function containsInjection(text) {
  if (typeof text !== 'string') return false;
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

/**
 * Validate the messages array from the request body.
 * @param {unknown} messages
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMessages(messages) {
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
      return { valid: false, error: `invalid role "${msg.role}"; allowed: ${CONFIG.ALLOWED_ROLES.join(', ')}` };
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
 * @param {string} key    - usually the client IP
 * @param {number} limit  - max requests per window
 * @param {number} windowMs
 * @returns {boolean} true = allowed, false = rate-limited
 */
export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let entry = _rateLimitStore.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    entry = { windowStart: now, count: 1 };
    _rateLimitStore.set(key, entry);
    return true;
  }
  entry.count += 1;
  if (entry.count > limit) return false;
  return true;
}

// ─── Model fallback call ──────────────────────────────────────────────────────

/**
 * Call the Groq API with automatic fallback across the model ladder.
 * Retries next model on HTTP 404, 429, or 503.
 * Uses AbortController to enforce the request timeout.
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
        continue; // try next model
      }

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Groq API error ${response.status}: ${body}`);
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

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate-limit — AI endpoint is stricter
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString().split(',')[0].trim();

  if (!checkRateLimit(`ai:${clientIp}`, CONFIG.RATE_LIMIT_MAX_AI, CONFIG.RATE_LIMIT_WINDOW_MS)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait before retrying.' });
  }

  // Validate request body
  const { messages } = req.body || {};
  const validation = validateMessages(messages);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // API key — server-side only
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return res.status(500).json({ error: 'API not configured' });
  }

  try {
    const groqResponse = await callGroqWithFallback(messages, apiKey);

    const rawContent = groqResponse?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return res.status(502).json({ error: 'Empty response from AI model' });
    }

    // Sanitize AI output before returning
    const safeContent = sanitizeString(rawContent);

    return res.status(200).json({ content: safeContent });
  } catch (err) {
    // Never expose raw error details to the client
    console.error('[api/chat] error:', err.message);
    return res.status(502).json({ error: 'AI service error. Please retry.' });
  }
}
