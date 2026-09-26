'use strict';

/**
 * @file src/utils/riskScorer.js
 * @description Deterministic risk-scoring utilities.
 * Pure functions — no side effects, no network calls.
 */

/** @type {Readonly<{HIGH_THRESHOLD: number, MEDIUM_THRESHOLD: number}>} */
const RISK_THRESHOLDS = Object.freeze({
  HIGH_THRESHOLD:   70,
  MEDIUM_THRESHOLD: 40,
});

/** @type {Readonly<{HIGH: string, MEDIUM: string, LOW: string}>} */
const RISK_COLORS = Object.freeze({
  HIGH:   'risk-high',
  MEDIUM: 'risk-medium',
  LOW:    'risk-low',
});

/** @type {Readonly<{HIGH: string, MEDIUM: string, LOW: string}>} */
const RISK_HEX = Object.freeze({
  HIGH:   '#ff2d55',
  MEDIUM: '#ff9f0a',
  LOW:    '#30d158',
});

/**
 * Map a severity string to its CSS class name.
 * @param {string|null|undefined} severity - 'HIGH', 'MEDIUM', or 'LOW' (case-insensitive)
 * @returns {string} CSS class name
 */
export function severityToColor(severity) {
  const s = (severity || '').toUpperCase();
  switch (s) {
    case 'HIGH':   return RISK_COLORS.HIGH;
    case 'MEDIUM': return RISK_COLORS.MEDIUM;
    case 'LOW':    return RISK_COLORS.LOW;
    default:       return RISK_COLORS.MEDIUM;
  }
}

/**
 * Map a severity string to its hex colour value.
 * @param {string|null|undefined} severity - 'HIGH', 'MEDIUM', or 'LOW' (case-insensitive)
 * @returns {string} Hex colour string
 */
export function severityToHex(severity) {
  const s = (severity || '').toUpperCase();
  switch (s) {
    case 'HIGH':   return RISK_HEX.HIGH;
    case 'MEDIUM': return RISK_HEX.MEDIUM;
    case 'LOW':    return RISK_HEX.LOW;
    default:       return RISK_HEX.MEDIUM;
  }
}

/**
 * Map a numeric risk score to its CSS class name.
 * @param {number} score - Integer 0–100
 * @returns {string} CSS class name
 */
export function scoreToColor(score) {
  if (score >= RISK_THRESHOLDS.HIGH_THRESHOLD)   return RISK_COLORS.HIGH;
  if (score >= RISK_THRESHOLDS.MEDIUM_THRESHOLD) return RISK_COLORS.MEDIUM;
  return RISK_COLORS.LOW;
}

/**
 * Map a numeric risk score to its hex colour value.
 * @param {number} score - Integer 0–100
 * @returns {string} Hex colour string
 */
export function scoreToHex(score) {
  if (score >= RISK_THRESHOLDS.HIGH_THRESHOLD)   return RISK_HEX.HIGH;
  if (score >= RISK_THRESHOLDS.MEDIUM_THRESHOLD) return RISK_HEX.MEDIUM;
  return RISK_HEX.LOW;
}

/**
 * Map a numeric risk score to a human-readable label.
 * @param {number} score - Integer 0–100
 * @returns {'HIGH'|'MEDIUM'|'LOW'}
 */
export function scoreToLabel(score) {
  if (score >= RISK_THRESHOLDS.HIGH_THRESHOLD)   return 'HIGH';
  if (score >= RISK_THRESHOLDS.MEDIUM_THRESHOLD) return 'MEDIUM';
  return 'LOW';
}
