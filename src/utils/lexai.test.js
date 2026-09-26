// Comprehensive test suite for LexAI utility layer.
// Covers: riskScorer, documentParser, grokService helpers (sanitiseText, escapeHtml).
import { describe, it, expect } from 'vitest';
import {
  severityToColor, severityToHex,
  scoreToColor,    scoreToHex,   scoreToLabel,
} from './riskScorer.js';
import {
  getFileMetadata, truncateForDisplay,
} from './documentParser.js';
import { sanitiseText, escapeHtml } from '../services/grokService.js';

// ── riskScorer ─────────────────────────────────────────────────────────────

describe('severityToColor', () => {
  it('returns risk-high for HIGH',             () => expect(severityToColor('HIGH')).toBe('risk-high'));
  it('returns risk-medium for MEDIUM',         () => expect(severityToColor('MEDIUM')).toBe('risk-medium'));
  it('returns risk-low for LOW',               () => expect(severityToColor('LOW')).toBe('risk-low'));
  it('returns risk-medium for unknown',        () => expect(severityToColor('UNKNOWN')).toBe('risk-medium'));
  it('handles lowercase input',                () => expect(severityToColor('high')).toBe('risk-high'));
  it('handles mixed case input',               () => expect(severityToColor('Medium')).toBe('risk-medium'));
  it('handles null / undefined gracefully',    () => expect(severityToColor(null)).toBe('risk-medium'));
  it('handles undefined gracefully',           () => expect(severityToColor(undefined)).toBe('risk-medium'));
});

describe('severityToHex', () => {
  it('returns red hex for HIGH',    () => expect(severityToHex('HIGH')).toBe('#ff2d55'));
  it('returns amber hex for MEDIUM',() => expect(severityToHex('MEDIUM')).toBe('#ff9f0a'));
  it('returns green hex for LOW',   () => expect(severityToHex('LOW')).toBe('#30d158'));
  it('returns amber for unknown',   () => expect(severityToHex('XYZ')).toBe('#ff9f0a'));
});

describe('scoreToColor', () => {
  it('risk-high at boundary 70',   () => expect(scoreToColor(70)).toBe('risk-high'));
  it('risk-high above 70',         () => expect(scoreToColor(100)).toBe('risk-high'));
  it('risk-medium at boundary 40', () => expect(scoreToColor(40)).toBe('risk-medium'));
  it('risk-medium below 70',       () => expect(scoreToColor(69)).toBe('risk-medium'));
  it('risk-low below 40',          () => expect(scoreToColor(39)).toBe('risk-low'));
  it('risk-low at 0',              () => expect(scoreToColor(0)).toBe('risk-low'));
});

describe('scoreToHex', () => {
  it('red for 80',   () => expect(scoreToHex(80)).toBe('#ff2d55'));
  it('amber for 50', () => expect(scoreToHex(50)).toBe('#ff9f0a'));
  it('green for 20', () => expect(scoreToHex(20)).toBe('#30d158'));
});

describe('scoreToLabel', () => {
  it('HIGH for 70',   () => expect(scoreToLabel(70)).toBe('HIGH'));
  it('MEDIUM for 55', () => expect(scoreToLabel(55)).toBe('MEDIUM'));
  it('LOW for 10',    () => expect(scoreToLabel(10)).toBe('LOW'));
});

// ── documentParser helpers ─────────────────────────────────────────────────

describe('getFileMetadata', () => {
  it('counts words correctly', () => {
    const { wordCount } = getFileMetadata('hello world foo bar');
    expect(wordCount).toBe(4);
  });

  it('calculates reading time (ceil at 200 wpm)', () => {
    const text = Array(200).fill('word').join(' ');
    const { readingTime } = getFileMetadata(text);
    expect(readingTime).toBe(1);
  });

  it('reading time rounds up', () => {
    const text = Array(201).fill('word').join(' ');
    const { readingTime } = getFileMetadata(text);
    expect(readingTime).toBe(2);
  });

  it('handles empty string', () => {
    const { wordCount, readingTime } = getFileMetadata('');
    expect(wordCount).toBe(0);
    expect(readingTime).toBe(0);
  });
});

describe('truncateForDisplay', () => {
  it('does not truncate short text', () => {
    const text = 'short text';
    expect(truncateForDisplay(text)).toBe(text);
  });

  it('truncates long text and appends ellipsis marker', () => {
    const long = 'a'.repeat(6000);
    const result = truncateForDisplay(long);
    expect(result.length).toBeLessThan(6000);
    expect(result).toContain('[truncated for display]');
  });

  it('respects custom maxChars', () => {
    const result = truncateForDisplay('hello world', 5);
    expect(result).toContain('[truncated for display]');
    expect(result.startsWith('hello')).toBe(true);
  });

  it('returns exact text at boundary', () => {
    const text = 'a'.repeat(5000);
    expect(truncateForDisplay(text)).toBe(text);
  });
});

// ── Edge-case guard tests ──────────────────────────────────────────────────

describe('scoreToLabel edge cases', () => {
  it('handles negative score as LOW', () => expect(scoreToLabel(-1)).toBe('LOW'));
  it('handles score > 100 as HIGH',   () => expect(scoreToLabel(101)).toBe('HIGH'));
});

describe('getFileMetadata whitespace handling', () => {
  it('ignores extra whitespace', () => {
    const { wordCount } = getFileMetadata('  hello   world  ');
    expect(wordCount).toBe(2);
  });
});

// ── sanitiseText ───────────────────────────────────────────────────────────

describe('sanitiseText', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitiseText(null)).toBe('');
    expect(sanitiseText(undefined)).toBe('');
    expect(sanitiseText(42)).toBe('');
    expect(sanitiseText({})).toBe('');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitiseText('  hello  ')).toBe('hello');
  });

  it('strips null bytes', () => {
    // \0 is removed entirely — adjacent words close up
    expect(sanitiseText('hello\0world')).toBe('helloworld');
  });

  it('strips non-printable control characters', () => {
    // \x01 is a non-printable control character
    expect(sanitiseText('hello\x01world')).toBe('helloworld');
  });

  it('preserves legitimate whitespace characters (tab → collapsed)', () => {
    const result = sanitiseText('hello\t\tworld');
    // two tabs collapse to a single space
    expect(result).toBe('hello world');
  });

  it('preserves newlines (they are not in the stripped range)', () => {
    const result = sanitiseText('line1\nline2');
    expect(result).toContain('line1');
    expect(result).toContain('line2');
  });

  it('truncates at 12 000 characters', () => {
    const long = 'a'.repeat(15_000);
    expect(sanitiseText(long).length).toBe(12_000);
  });

  it('does not truncate text shorter than 12 000 chars', () => {
    const short = 'hello world';
    expect(sanitiseText(short)).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(sanitiseText('')).toBe('');
  });
});

// ── escapeHtml ────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes greater-than', () => {
    expect(escapeHtml('1 > 0')).toBe('1 &gt; 0');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('escapes a full XSS payload', () => {
    const xss = '<img src=x onerror="alert(1)">';
    const result = escapeHtml(xss);
    expect(result).not.toContain('<img');
    expect(result).not.toContain('>');
    expect(result).toContain('&lt;img');
  });

  it('returns empty string for non-string input', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(0)).toBe('');
  });

  it('does not modify safe text', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});
