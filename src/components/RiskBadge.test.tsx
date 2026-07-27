import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from './RiskBadge';

describe('RiskBadge', () => {
  it('renders a green style for LOW risk', () => {
    render(<RiskBadge label="Copyright" level="LOW" />);
    const badge = screen.getByText(/Copyright: LOW/i);
    expect(badge.className).toContain('text-risk-low');
  });

  it('renders an amber style for MEDIUM risk', () => {
    render(<RiskBadge label="Trademark" level="MEDIUM" />);
    const badge = screen.getByText(/Trademark: MEDIUM/i);
    expect(badge.className).toContain('text-risk-medium');
  });

  it('renders a red style for HIGH risk', () => {
    render(<RiskBadge label="Platform" level="HIGH" />);
    const badge = screen.getByText(/Platform: HIGH/i);
    expect(badge.className).toContain('text-risk-high');
  });

  it('renders a neutral style for UNKNOWN risk', () => {
    render(<RiskBadge label="Platform" level="UNKNOWN" />);
    const badge = screen.getByText(/Platform: UNKNOWN/i);
    expect(badge.className).toContain('text-risk-unknown');
  });
});
