import type { RiskLevel } from '../types/api';

const RISK_LEVELS: readonly RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'];

export function normalizeRisk(value: unknown): RiskLevel {
  if (typeof value !== 'string') return 'UNKNOWN';
  const upper = value.trim().toUpperCase();
  return (RISK_LEVELS as readonly string[]).includes(upper) ? (upper as RiskLevel) : 'UNKNOWN';
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}
