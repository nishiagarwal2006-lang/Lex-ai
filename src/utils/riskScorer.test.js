
import { describe, it, expect } from 'vitest';
import {
  severityToColor,
  severityToHex,
  scoreToColor,
  scoreToHex,
  scoreToLabel,
} from './riskScorer.js';

describe('severityToColor', () => {
  it('returns risk-high for HIGH', () => {
    expect(severityToColor('HIGH')).toBe('risk-high');
  });
  it('returns risk-medium for MEDIUM', () => {
    expect(severityToColor('MEDIUM')).toBe('risk-medium');
  });
  it('returns risk-low for LOW', () => {
    expect(severityToColor('LOW')).toBe('risk-low');
  });
  it('returns risk-medium for unknown severity', () => {
    expect(severityToColor('UNKNOWN')).toBe('risk-medium');
  });
  it('is case-insensitive', () => {
    expect(severityToColor('high')).toBe('risk-high');
  });
});

describe('severityToHex', () => {
  it('returns red hex for HIGH', () => {
    expect(severityToHex('HIGH')).toBe('#ff2d55');
  });
  it('returns amber hex for MEDIUM', () => {
    expect(severityToHex('MEDIUM')).toBe('#ff9f0a');
  });
  it('returns green hex for LOW', () => {
    expect(severityToHex('LOW')).toBe('#30d158');
  });
});

describe('scoreToColor', () => {
  it('returns risk-high for score >= 70', () => {
    expect(scoreToColor(70)).toBe('risk-high');
    expect(scoreToColor(100)).toBe('risk-high');
  });
  it('returns risk-medium for score 40-69', () => {
    expect(scoreToColor(40)).toBe('risk-medium');
    expect(scoreToColor(69)).toBe('risk-medium');
  });
  it('returns risk-low for score < 40', () => {
    expect(scoreToColor(0)).toBe('risk-low');
    expect(scoreToColor(39)).toBe('risk-low');
  });
});

describe('scoreToHex', () => {
  it('returns red hex for high score', () => {
    expect(scoreToHex(80)).toBe('#ff2d55');
  });
  it('returns amber hex for medium score', () => {
    expect(scoreToHex(50)).toBe('#ff9f0a');
  });
  it('returns green hex for low score', () => {
    expect(scoreToHex(20)).toBe('#30d158');
  });
});

describe('scoreToLabel', () => {
  it('returns HIGH for score >= 70', () => {
    expect(scoreToLabel(70)).toBe('HIGH');
  });
  it('returns MEDIUM for score 40-69', () => {
    expect(scoreToLabel(55)).toBe('MEDIUM');
  });
  it('returns LOW for score < 40', () => {
    expect(scoreToLabel(10)).toBe('LOW');
  });
});
