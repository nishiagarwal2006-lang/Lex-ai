import axios from 'axios';

// Groq uses an OpenAI-compatible endpoint — just swap the base URL and key.
const GROQ_URL = import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = import.meta.env.VITE_GROQ_MODEL    || 'openai/gpt-oss-120b';
const API_KEY  = import.meta.env.VITE_GROQ_API_KEY  || '';

/** Max chars sent per document — prevents token overrun */
const MAX_CHARS = 12_000;

/** Max chars for a user question — prevents question-injection via padding */
const MAX_QUESTION_CHARS = 500;

/**
 * Sanitise document text before sending to the model.
 * - Strips null bytes and non-printable control characters.
 * - Collapses runs of whitespace to a single space.
 * - Hard-caps at MAX_CHARS.
 * @param {string} text
 * @returns {string}
 */
export function sanitiseText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\0/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
    .slice(0, MAX_CHARS);
}

/**
 * Escape HTML entities in a string so AI output is safe to render as text.
 * React renders text nodes safely by default, but this guards any future
 * dangerouslySetInnerHTML usage elsewhere.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Return a user-readable error message — never expose raw keys */
function friendlyError(err) {
  if (err?.response?.status === 401) return 'Invalid API key. Please check your VITE_GROQ_API_KEY in .env.';
  if (err?.response?.status === 429) return 'Rate limit reached. Please wait a moment and try again.';
  if (err?.response?.status >= 500)  return 'The AI service is temporarily unavailable. Please retry.';
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout'))
    return 'Request timed out. Try a shorter document or retry.';
  return err?.response?.data?.error?.message || err?.message || 'Unexpected error. Please retry.';
}

async function callGrok(prompt, maxTokens = 4000) {
  if (!API_KEY || API_KEY === 'your_groq_api_key_here') {
    throw new Error(
      'Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.'
    );
  }

  let response;
  try {
    response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );
  } catch (err) {
    throw new Error(friendlyError(err));
  }

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI model. Please retry.');

  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    throw new Error('AI returned an unreadable response. Please retry.');
  }
}

export async function analyzeRisk(documentText) {
  const safe = sanitiseText(documentText);
  if (!safe) throw new Error('Document text is empty.');
  const prompt = `You are a legal risk analysis AI. Analyse the following legal document for risks.
Return ONLY a valid JSON object with this exact structure:
{
  "overallRiskScore": <integer 0-100>,
  "riskLevel": "<HIGH|MEDIUM|LOW>",
  "risks": [
    {
      "category": "<short category name>",
      "severity": "<HIGH|MEDIUM|LOW>",
      "clause": "<exact excerpt from document, max 200 chars>",
      "explanation": "<plain-english explanation of the risk>",
      "recommendation": "<actionable recommendation>"
    }
  ]
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}`;
  return callGrok(prompt);
}

export async function simplifyClauses(documentText) {
  const safe = sanitiseText(documentText);
  if (!safe) throw new Error('Document text is empty.');
  const prompt = `You are a legal document simplifier AI. Analyse the following legal document and simplify its clauses.
Return ONLY a valid JSON object with this exact structure:
{
  "documentType": "<type of document>",
  "summary": "<2-3 sentence summary>",
  "clauses": [
    {
      "title": "<clause title>",
      "original": "<original clause text, max 300 chars>",
      "simplified": "<plain-english simplification>",
      "type": "<Obligations|Rights|Payments|Termination>",
      "importance": "<HIGH|MEDIUM|LOW>"
    }
  ],
  "keyDates": [{ "label": "<date description>", "date": "<date string>" }],
  "obligations": ["<obligation>"],
  "rights": ["<right>"]
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}`;
  return callGrok(prompt);
}

export async function compareDocuments(doc1Text, doc2Text) {
  const safeA = sanitiseText(doc1Text);
  const safeB = sanitiseText(doc2Text);
  if (!safeA || !safeB) throw new Error('Both document texts are required for comparison.');
  const prompt = `You are a legal document comparison AI. Compare the two legal documents below.
Return ONLY a valid JSON object with this exact structure:
{
  "similarityScore": <integer 0-100>,
  "summary": "<brief comparison summary>",
  "changes": [
    {
      "type": "<added|removed|modified>",
      "section": "<section name>",
      "doc1Text": "<text in doc A or empty string>",
      "doc2Text": "<text in doc B or empty string>",
      "significance": "<why this change matters>"
    }
  ],
  "recommendation": "<which document is more favourable and why>"
}
Do NOT include markdown fences or extra text outside the JSON.

Document A:
${safeA}

Document B:
${safeB}`;
  return callGrok(prompt, 6000);
}

export async function askQuestion(documentText, question) {
  const safe = sanitiseText(documentText);
  const safeQ = sanitiseText(String(question || '')).slice(0, MAX_QUESTION_CHARS);
  if (!safe)  throw new Error('Document text is empty.');
  if (!safeQ) throw new Error('Question cannot be empty.');
  const prompt = `You are a legal Q&A AI. Answer the user's question about the legal document below.
Return ONLY a valid JSON object with this exact structure:
{
  "answer": "<detailed plain-English answer>",
  "confidence": <integer 0-100>,
  "relevantClauses": ["<relevant clause titles or references>"],
  "disclaimer": "This response is for informational purposes only and is not a substitute for professional legal advice."
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}

Question: ${safeQ}`;
  return callGrok(prompt, 2000);
}

export async function generateChecklist(documentText) {
  const safe = sanitiseText(documentText);
  if (!safe) throw new Error('Document text is empty.');
  const prompt = `You are a legal action checklist AI. Generate a prioritised action checklist from the legal document below.
Return ONLY a valid JSON object with this exact structure:
{
  "immediate": ["<action to take within 24-48 hours>"],
  "shortTerm": ["<action to take within the next few weeks>"],
  "longTerm": ["<action to take over the next months>"],
  "lawyerQuestions": ["<question to ask your lawyer>"],
  "redFlags": ["<red-flag warning requiring urgent attention>"]
}
Do NOT include markdown fences or extra text outside the JSON.

Document:
${safe}`;
  return callGrok(prompt);
}
