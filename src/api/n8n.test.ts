import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeProducts, generateCandidate, N8nApiError } from './n8n';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('analyzeProducts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the links array as JSON to the analyze webhook path', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ success: true, count: 0, candidates: [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await analyzeProducts(['https://www.amazon.com/dp/A', 'https://www.amazon.com/dp/B']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/webhook/pod/analyze');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({
      links: ['https://www.amazon.com/dp/A', 'https://www.amazon.com/dp/B'],
    });
  });

  it('normalizes risk fields and filters out candidates missing an ASIN', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: true,
          count: 2,
          candidates: [
            {
              asin: 'B0GOOD',
              title: 'Good product',
              score: 88,
              copyrightRisk: 'low',
              trademarkRisk: 'medium',
              platformRisk: 'weird-value',
            },
            { title: 'Missing ASIN, should be dropped' },
          ],
        }),
      ),
    );

    const result = await analyzeProducts(['https://www.amazon.com/dp/A']);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].asin).toBe('B0GOOD');
    expect(result.candidates[0].copyrightRisk).toBe('LOW');
    expect(result.candidates[0].trademarkRisk).toBe('MEDIUM');
    expect(result.candidates[0].platformRisk).toBe('UNKNOWN');
  });

  it('throws an N8nApiError for a non-2xx server response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })));

    await expect(analyzeProducts(['https://www.amazon.com/dp/A'])).rejects.toBeInstanceOf(N8nApiError);
  });

  it('throws an N8nApiError with kind NOT_FOUND for a 404 (inactive webhook)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not found', { status: 404 })));

    await expect(analyzeProducts(['https://www.amazon.com/dp/A'])).rejects.toMatchObject({
      apiError: { kind: 'NOT_FOUND' },
    });
  });

  it('throws an N8nApiError when the response body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>not json</html>', { status: 200 })),
    );

    await expect(analyzeProducts(['https://www.amazon.com/dp/A'])).rejects.toMatchObject({
      apiError: { kind: 'INVALID_RESPONSE' },
    });
  });

  it('throws a NETWORK error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(analyzeProducts(['https://www.amazon.com/dp/A'])).rejects.toMatchObject({
      apiError: { kind: 'NETWORK' },
    });
  });
});

describe('generateCandidate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the asin as JSON to the generate webhook path', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        asin: 'B0EXAMPLE',
        designPath: 'C:\\n8n\\generated\\B0EXAMPLE-generated.png',
        designImageUrl: '',
        designTitle: 'A design title',
        brand: 'A brand',
        featureBullet1: 'Bullet 1',
        featureBullet2: 'Bullet 2',
        productDescription: 'A sufficiently long product description for testing purposes here.',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await generateCandidate('B0EXAMPLE');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/webhook/pod/generate');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ asin: 'B0EXAMPLE' });
  });

  it('rejects locally when no ASIN is provided', async () => {
    await expect(generateCandidate('')).rejects.toBeInstanceOf(N8nApiError);
  });

  it('throws INVALID_RESPONSE when required fields are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ success: true, asin: 'B0EXAMPLE' })),
    );

    await expect(generateCandidate('B0EXAMPLE')).rejects.toMatchObject({
      apiError: { kind: 'INVALID_RESPONSE' },
    });
  });
});
