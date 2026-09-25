import axios from 'axios';

const GROK_URL = import.meta.env.VITE_GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
const MODEL = import.meta.env.VITE_GROK_MODEL || 'grok-3-latest';
const API_KEY = import.meta.env.VITE_GROK_API_KEY || '';

async function callGrok(prompt, maxTokens = 4000) {
  if (!API_KEY || API_KEY === 'your_grok_api_key_here') {
    throw new Error('Grok API key not configured. Add VITE_GROK_API_KEY to your .env file.');
  }

  const response = await axios.post(
    GROK_URL,
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

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Grok API.');

  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from the content
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse Grok API response as JSON.');
  }
}

export async function analyzeRisk(documentText) {
  const prompt = `You are a legal risk analysis AI. Analyze the following legal document for risks.
Return a JSON object with this exact structure:
{
  "overallRiskScore": <number 0-100>,
  "riskLevel": "<HIGH|MEDIUM|LOW>",
  "risks": [
    {
      "category": "<short category name>",
      "severity": "<HIGH|MEDIUM|LOW>",
      "clause": "<exact excerpt from document>",
      "explanation": "<plain-english explanation of the risk>",
      "recommendation": "<actionable recommendation>"
    }
  ]
}

Document:
${documentText}`;

  return callGrok(prompt);
}

export async function simplifyClauses(documentText) {
  const prompt = `You are a legal document simplifier AI. Analyze the following legal document and simplify its clauses.
Return a JSON object with this exact structure:
{
  "documentType": "<type of document>",
  "summary": "<2-3 sentence summary of the document>",
  "clauses": [
    {
      "title": "<clause title>",
      "original": "<original clause text>",
      "simplified": "<plain-english simplification>",
      "type": "<Obligations|Rights|Payments|Termination>",
      "importance": "<HIGH|MEDIUM|LOW>"
    }
  ],
  "keyDates": [
    { "label": "<date description>", "date": "<date string>" }
  ],
  "obligations": ["<obligation 1>", "<obligation 2>"],
  "rights": ["<right 1>", "<right 2>"]
}

Document:
${documentText}`;

  return callGrok(prompt);
}

export async function compareDocuments(doc1Text, doc2Text) {
  const prompt = `You are a legal document comparison AI. Compare these two legal documents.
Return a JSON object with this exact structure:
{
  "similarityScore": <number 0-100>,
  "summary": "<brief comparison summary>",
  "changes": [
    {
      "type": "<added|removed|modified>",
      "section": "<section name>",
      "doc1Text": "<text in doc1 or empty>",
      "doc2Text": "<text in doc2 or empty>",
      "significance": "<why this matters>"
    }
  ],
  "recommendation": "<which document is more favorable and why>"
}

Document A:
${doc1Text}

Document B:
${doc2Text}`;

  return callGrok(prompt);
}

export async function askQuestion(documentText, question) {
  const prompt = `You are a legal Q&A AI. Answer the user's question about the following legal document.
Return a JSON object with this exact structure:
{
  "answer": "<detailed answer>",
  "confidence": <number 0-100>,
  "relevantClauses": ["<relevant clause references>"],
  "disclaimer": "This response is for informational purposes only and is not a substitute for professional legal advice."
}

Document:
${documentText}

Question: ${question}`;

  return callGrok(prompt);
}

export async function generateChecklist(documentText) {
  const prompt = `You are a legal action checklist AI. Generate an action checklist from the following legal document.
Return a JSON object with this exact structure:
{
  "immediate": ["<action to take immediately>"],
  "shortTerm": ["<action to take within weeks>"],
  "longTerm": ["<action to take over months>"],
  "lawyerQuestions": ["<question to ask your lawyer>"],
  "redFlags": ["<red flag warning>"]
}

Document:
${documentText}`;

  return callGrok(prompt);
}
