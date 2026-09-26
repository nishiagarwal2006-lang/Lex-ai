import mammoth from 'mammoth';

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

export function getFileMetadata(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200);
  return { wordCount, readingTime };
}

export function truncateForDisplay(text, maxChars = 5000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n... [truncated for display]';
}
