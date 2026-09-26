'use strict';

/**
 * @file api/health.js
 * @description GET /api/health — returns service health without exposing secrets.
 */

/**
 * GET /api/health
 * Returns status, whether the API key is configured, active model, and timestamp.
 * Never exposes the actual key value.
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
  const hasApiKey = apiKey.length > 0 && apiKey !== 'your_groq_api_key_here';
  const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

  return res.status(200).json({
    status: hasApiKey ? 'ok' : 'degraded',
    hasApiKey,
    model,
    timestamp: new Date().toISOString(),
  });
}
