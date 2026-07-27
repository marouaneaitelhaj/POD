import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidatesPage } from './CandidatesPage';
import { ToastProvider } from '../components/ToastProvider';
import type { Candidate } from '../types/api';

function makeCandidate(overrides: Partial<Candidate>): Candidate {
  return {
    asin: 'B0DEFAULT',
    status: 'NEW',
    productIdea: 'A fun idea',
    score: 80,
    copyrightRisk: 'LOW',
    trademarkRisk: 'LOW',
    platformRisk: 'LOW',
    reason: 'Looks safe',
    saferAlternative: '',
    title: 'Default product',
    brand: 'Default Brand',
    category: 'Category > Sub',
    amazonUrl: 'https://amazon.com/dp/B0DEFAULT',
    imageUrl: '',
    screenshotPath: '',
    ...overrides,
  };
}

function renderPage(candidates: Candidate[], selectedAsin: string | null = null) {
  const onSelect = vi.fn();
  render(
    <ToastProvider>
      <CandidatesPage
        candidates={candidates}
        selectedAsin={selectedAsin}
        onSelect={onSelect}
        onGenerate={vi.fn()}
        onStartOver={vi.fn()}
        error={null}
        onDismissError={vi.fn()}
        onRetry={vi.fn()}
      />
    </ToastProvider>,
  );
  return { onSelect };
}

describe('CandidatesPage selection', () => {
  it('only shows one candidate as selected at a time', () => {
    const candidates = [
      makeCandidate({ asin: 'B0ONE', title: 'Product one' }),
      makeCandidate({ asin: 'B0TWO', title: 'Product two' }),
    ];

    render(
      <ToastProvider>
        <CandidatesPage
          candidates={candidates}
          selectedAsin="B0ONE"
          onSelect={vi.fn()}
          onGenerate={vi.fn()}
          onStartOver={vi.fn()}
          error={null}
          onDismissError={vi.fn()}
          onRetry={vi.fn()}
        />
      </ToastProvider>,
    );

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios).toHaveLength(2);
    const checked = radios.filter((r) => r.checked);
    expect(checked).toHaveLength(1);
  });

  it('calls onSelect with the clicked candidate ASIN', () => {
    const candidates = [
      makeCandidate({ asin: 'B0ONE', title: 'Product one' }),
      makeCandidate({ asin: 'B0TWO', title: 'Product two' }),
    ];
    const { onSelect } = renderPage(candidates, null);

    fireEvent.click(screen.getAllByText('Select candidate')[1]);
    expect(onSelect).toHaveBeenCalledWith('B0TWO');
  });

  it('shows the sticky selection bar only once a candidate is selected', () => {
    const candidates = [makeCandidate({ asin: 'B0ONE', title: 'Product one' })];
    renderPage(candidates, null);
    expect(screen.queryByText('Generate Design & Listing')).not.toBeInTheDocument();

    renderPage(candidates, 'B0ONE');
    expect(screen.getByText('Generate Design & Listing')).toBeInTheDocument();
  });

  it('shows an empty state when there are no candidates', () => {
    renderPage([], null);
    expect(screen.getByText(/No safe candidates were returned/i)).toBeInTheDocument();
  });
});
