export interface ParsedLinks {
  validLinks: string[];
  invalidLines: string[];
}

function isValidHttpUrl(line: string): boolean {
  if (!/^https?:\/\//i.test(line)) return false;
  try {
    const url = new URL(line);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseLinks(raw: string): ParsedLinks {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const seen = new Set<string>();
  const validLinks: string[] = [];
  const invalidLines: string[] = [];

  for (const line of lines) {
    if (!isValidHttpUrl(line)) {
      invalidLines.push(line);
      continue;
    }
    if (seen.has(line)) continue;
    seen.add(line);
    validLinks.push(line);
  }

  return { validLinks, invalidLines };
}

export function isAmazonUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return /amazon\./i.test(host);
  } catch {
    return false;
  }
}

export const EXAMPLE_LINKS = [
  'https://www.amazon.com/dp/B0EXAMPLE1',
  'https://www.amazon.com/dp/B0EXAMPLE2',
  'https://www.amazon.com/dp/B0EXAMPLE3',
].join('\n');
