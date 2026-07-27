import type {
  AnalyzeResponse,
  ApiError,
  Candidate,
  GenerateResponse,
} from '../types/api';
import { normalizeRisk, asString, asNumber } from '../utils/validation';

const BASE_URL = import.meta.env.VITE_N8N_BASE_URL ?? '/n8n-api';
const ANALYZE_PATH = import.meta.env.VITE_ANALYZE_WEBHOOK_PATH ?? '/webhook/pod/analyze';
const GENERATE_PATH = import.meta.env.VITE_GENERATE_WEBHOOK_PATH ?? '/webhook/pod/generate';

export const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export class N8nApiError extends Error {
  public readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'N8nApiError';
    this.apiError = apiError;
  }
}

function buildUrl(path: string): string {
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

interface FetchJsonOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function fetchJson(path: string, options: FetchJsonOptions): Promise<unknown> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      method: options.method,
      headers: { 'Content-Type': 'application/json' },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      if (options.signal?.aborted) {
        throw new N8nApiError({
          kind: 'ABORTED',
          message: 'Request was cancelled.',
        });
      }
      throw new N8nApiError({
        kind: 'TIMEOUT',
        message: `The request took longer than ${Math.round(timeoutMs / 60000)} minutes and was cancelled. n8n workflows that scrape and analyze many products can be slow — try fewer links or check the workflow execution log in n8n.`,
      });
    }

    throw new N8nApiError({
      kind: 'NETWORK',
      message:
        'Could not reach n8n at localhost:5678. Check that the Docker container (or n8n process) is running and that the port is correct.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
  clearTimeout(timeoutId);

  const rawText = await response.text();

  if (response.status === 404) {
    throw new N8nApiError({
      kind: 'NOT_FOUND',
      message:
        'The workflow webhook was not found (404). Make sure the workflow is active/published in n8n, or that you are using the correct webhook path.',
      status: 404,
      details: rawText.slice(0, 500),
    });
  }

  if (!response.ok) {
    const lower = rawText.toLowerCase();
    if (lower.includes('webhook') && (lower.includes('not registered') || lower.includes('not active'))) {
      throw new N8nApiError({
        kind: 'WEBHOOK_INACTIVE',
        message:
          'The workflow webhook is not active. Publish the workflow in n8n, or open it and click "Listen for test event" if you are using the test webhook URL.',
        status: response.status,
        details: rawText.slice(0, 500),
      });
    }
    throw new N8nApiError({
      kind: 'SERVER_ERROR',
      message: `n8n returned an error (HTTP ${response.status}).`,
      status: response.status,
      details: rawText.slice(0, 500),
    });
  }

  let parsed: unknown;
  try {
    parsed = rawText.length > 0 ? JSON.parse(rawText) : {};
  } catch {
    throw new N8nApiError({
      kind: 'INVALID_RESPONSE',
      message:
        'n8n returned a non-JSON response. This usually means the webhook is not configured to "Respond immediately with data", or an upstream node failed.',
      status: response.status,
      details: rawText.slice(0, 500),
    });
  }

  return parsed;
}

function normalizeCandidate(raw: unknown): Candidate | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const asin = asString(obj.asin);
  if (!asin) return null;

  return {
    asin,
    status: asString(obj.status, 'NEW'),
    productIdea: asString(obj.productIdea),
    score: asNumber(obj.score, 0),
    copyrightRisk: normalizeRisk(obj.copyrightRisk),
    trademarkRisk: normalizeRisk(obj.trademarkRisk),
    platformRisk: normalizeRisk(obj.platformRisk),
    reason: asString(obj.reason),
    saferAlternative: asString(obj.saferAlternative),
    title: asString(obj.title, 'Untitled product'),
    brand: asString(obj.brand),
    category: asString(obj.category),
    amazonUrl: asString(obj.amazonUrl),
    imageUrl: asString(obj.imageUrl),
    screenshotPath: asString(obj.screenshotPath),
  };
}

export async function analyzeProducts(
  links: string[],
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<AnalyzeResponse> {
  const parsed = await fetchJson(ANALYZE_PATH, {
    method: 'POST',
    body: { links },
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });

  if (typeof parsed !== 'object' || parsed === null) {
    throw new N8nApiError({
      kind: 'INVALID_RESPONSE',
      message: 'n8n returned an unexpected response shape for the analysis request.',
    });
  }

  const obj = parsed as Record<string, unknown>;
  const rawCandidates = Array.isArray(obj.candidates) ? obj.candidates : [];
  const candidates = rawCandidates
    .map(normalizeCandidate)
    .filter((c): c is Candidate => c !== null);

  if (obj.success === false) {
    throw new N8nApiError({
      kind: 'SERVER_ERROR',
      message: asString(obj.message, 'The analysis workflow reported a failure.'),
    });
  }

  return {
    success: true,
    count: candidates.length,
    candidates,
  };
}

export async function generateCandidate(
  asin: string,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<GenerateResponse> {
  if (!asin) {
    throw new N8nApiError({
      kind: 'INVALID_RESPONSE',
      message: 'No ASIN was provided for generation.',
    });
  }

  const parsed = await fetchJson(GENERATE_PATH, {
    method: 'POST',
    body: { asin },
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });

  if (typeof parsed !== 'object' || parsed === null) {
    throw new N8nApiError({
      kind: 'INVALID_RESPONSE',
      message: 'n8n returned an unexpected response shape for the generation request.',
    });
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.success === false) {
    throw new N8nApiError({
      kind: 'SERVER_ERROR',
      message: asString(obj.message, 'The generation workflow reported a failure.'),
    });
  }

  const resultAsin = asString(obj.asin, asin);
  const designTitle = asString(obj.designTitle);
  const productDescription = asString(obj.productDescription);

  if (!resultAsin || !designTitle || !productDescription) {
    throw new N8nApiError({
      kind: 'INVALID_RESPONSE',
      message:
        'The generation response is missing required fields (asin, designTitle, productDescription). Check the "Respond to Webhook" node in Workflow 2.',
    });
  }

  return {
    success: true,
    asin: resultAsin,
    designPath: asString(obj.designPath),
    designImageUrl: asString(obj.designImageUrl),
    designTitle,
    brand: asString(obj.brand),
    featureBullet1: asString(obj.featureBullet1),
    featureBullet2: asString(obj.featureBullet2),
    productDescription,
  };
}
