import { describe, expect, it } from 'vitest';
import { parseLinks, isAmazonUrl } from './links';

describe('parseLinks', () => {
  it('parses one URL per line', () => {
    const { validLinks } = parseLinks('https://www.amazon.com/dp/A\nhttps://www.amazon.com/dp/B');
    expect(validLinks).toEqual(['https://www.amazon.com/dp/A', 'https://www.amazon.com/dp/B']);
  });

  it('removes blank lines', () => {
    const { validLinks } = parseLinks('https://www.amazon.com/dp/A\n\n\nhttps://www.amazon.com/dp/B\n');
    expect(validLinks).toHaveLength(2);
  });

  it('removes duplicate URLs', () => {
    const { validLinks } = parseLinks(
      'https://www.amazon.com/dp/A\nhttps://www.amazon.com/dp/A\nhttps://www.amazon.com/dp/B',
    );
    expect(validLinks).toEqual(['https://www.amazon.com/dp/A', 'https://www.amazon.com/dp/B']);
  });

  it('flags lines that do not start with http:// or https://', () => {
    const { validLinks, invalidLines } = parseLinks('www.amazon.com/dp/A\nftp://example.com\nnot a url');
    expect(validLinks).toHaveLength(0);
    expect(invalidLines).toEqual(['www.amazon.com/dp/A', 'ftp://example.com', 'not a url']);
  });

  it('accepts any valid http(s) URL, not only Amazon', () => {
    const { validLinks, invalidLines } = parseLinks('https://example.com/product/1');
    expect(validLinks).toEqual(['https://example.com/product/1']);
    expect(invalidLines).toHaveLength(0);
  });

  it('rejects malformed URLs even if they start with http', () => {
    const { validLinks, invalidLines } = parseLinks('http://');
    expect(validLinks).toHaveLength(0);
    expect(invalidLines).toEqual(['http://']);
  });
});

describe('isAmazonUrl', () => {
  it('detects amazon hostnames', () => {
    expect(isAmazonUrl('https://www.amazon.com/dp/B0EXAMPLE')).toBe(true);
    expect(isAmazonUrl('https://amazon.co.uk/dp/B0EXAMPLE')).toBe(true);
  });

  it('returns false for non-amazon hosts', () => {
    expect(isAmazonUrl('https://example.com/dp/B0EXAMPLE')).toBe(false);
  });
});
