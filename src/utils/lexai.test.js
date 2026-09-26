// Comprehensive test suite for LexAI utility layer.
// Covers: riskScorer helpers and documentParser utilities.
import { describe, it, expect } from 'vitest';
import {
  severityToColor, severityToHex,
  scoreToColor,    scoreToHex,   scoreToLabel,
} from './riskScorer.js';
import {
  getFileMetadata, truncateForDisplay,
} from './documentParser.js';

// ── riskScorer ─────────────────────────────────────────────────────────────

describe('severityToColor', () => {
  it('returns risk-high for HIGH',             () => expect(severityToColor('HIGH')).toBe('risk-high'));
  it('returns risk-medium for MEDIUM',         () => expect(severityToColor('MEDIUM')).toBe('risk-medium'));
  it('returns risk-low for LOW',               () => expect(severityToColor('LOW')).toBe('risk-low'));
  it('returns risk-medium for unknown',        () => expect(severityToColor('UNKNOWN')).toBe('risk-medium'));
  it('handles lowercase input',                () => expect(severityToColor('high')).toBe('risk-high'));
  it('handles mixed case input',               () => expect(severityToColor('Medium')).toBe('risk-medium'));
  it('handles null / undefined gracefully',    () => expect(severityToColor(null)).toBe('risk-medium'));
});

describe('severityToHex', () => {
  it('returns red hex for HIGH',   () => expect(severityToHex('HIGH')).toBe('#ff2d55'));
  it('returns amber hex for MEDIUM', () => expect(severityToHex('MEDIUM')).toBe('#ff9f0a'));
  it('returns green hex for LOW',  () => expect(severityToHex('LOW')).toBe('#30d158'));
  it('returns amber for unknown',  () => expect(severityToHex('XYZ')).toBe('#ff9f0a'));
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
    // 200 words => 1 min
    const text = Array(200).fill('word').join(' ');
    const { readingTime } = getFileMetadata(text);
    expect(readingTime).toBe(1);
  });

  it('reading time rounds up', () => {
    // 201 words => 2 min
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
