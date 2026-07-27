import { describe, expect, it } from 'vitest';
import { normalizeRisk, asString, asNumber } from './validation';

describe('normalizeRisk', () => {
  it('normalizes known risk levels regardless of case', () => {
    expect(normalizeRisk('low')).toBe('LOW');
    expect(normalizeRisk('Medium')).toBe('MEDIUM');
    expect(normalizeRisk('HIGH')).toBe('HIGH');
  });

  it('falls back to UNKNOWN for unrecognized or missing values', () => {
    expect(normalizeRisk('severe')).toBe('UNKNOWN');
    expect(normalizeRisk(undefined)).toBe('UNKNOWN');
    expect(normalizeRisk(42)).toBe('UNKNOWN');
  });
});

describe('asString / asNumber', () => {
  it('returns the fallback for non-string / non-number values', () => {
    expect(asString(undefined, 'fallback')).toBe('fallback');
    expect(asString(42)).toBe('');
    expect(asNumber('not-a-number', 5)).toBe(5);
    expect(asNumber('12')).toBe(12);
  });
});
