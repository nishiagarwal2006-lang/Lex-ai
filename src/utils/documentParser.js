'use strict';

/**
 * @file src/utils/documentParser.js
 * @description Browser-side document parsing helpers.
 * All parsing is client-side only — no file bytes are transmitted to any server.
 */

import mammoth from 'mammoth';

/** @type {Readonly<{WORDS_PER_MINUTE: number, DEFAULT_DISPLAY_MAX_CHARS: number}>} */
const PARSER_CONFIG = Object.freeze({
  /** Average adult reading speed in words per minute */
  WORDS_PER_MINUTE: 200,
  /** Default max chars shown in the UI before truncation */
  DEFAULT_DISPLAY_MAX_CHARS: 5000,
});

/**
 * Parse a File object into plain text.
 * Supports .txt, .docx, and .pdf files.
 * @param {File} file
 * @returns {Promise<string>} Extracted plain text
 */
export async function parseFile(file) {
  if (!file) throw new Error('No file provided.');

  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'txt') {
    return await file.text();
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (ext === 'pdf') {
    return await parsePdf(file);
  }

  throw new Error(`Unsupported file type: .${ext}. Supported types: PDF, DOCX, TXT.`);
}

/**
 * Extract text from a PDF file using PDF.js.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdfjs = await import('pdfjs-dist');

  // Derive a clean major.minor.patch version for the CDN URL
  const ver = (pdfjs.version || '').split('-')[0];
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.mjs`;

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

/**
 * Compute word count and estimated reading time for a block of text.
 * @param {string} text
 * @returns {{ wordCount: number, readingTime: number }}
 */
export function getFileMetadata(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / PARSER_CONFIG.WORDS_PER_MINUTE);
  return { wordCount, readingTime };
}

/**
 * Truncate text for display, appending a marker when truncation occurs.
 * @param {string} text
 * @param {number} [maxChars] - defaults to PARSER_CONFIG.DEFAULT_DISPLAY_MAX_CHARS
 * @returns {string}
 */
export function truncateForDisplay(text, maxChars = PARSER_CONFIG.DEFAULT_DISPLAY_MAX_CHARS) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n... [truncated for display]';
}
