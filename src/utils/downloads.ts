import type { GenerateResponse } from '../types/api';

function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadListingAsJson(result: GenerateResponse): void {
  const payload = {
    asin: result.asin,
    designTitle: result.designTitle,
    brand: result.brand,
    featureBullet1: result.featureBullet1,
    featureBullet2: result.featureBullet2,
    productDescription: result.productDescription,
    designPath: result.designPath,
    designImageUrl: result.designImageUrl,
  };
  triggerDownload(`${result.asin}-listing.json`, JSON.stringify(payload, null, 2), 'application/json');
}

export function downloadListingAsTxt(result: GenerateResponse): void {
  const lines = [
    `ASIN: ${result.asin}`,
    `Design Title: ${result.designTitle}`,
    `Brand: ${result.brand}`,
    `Feature Bullet 1: ${result.featureBullet1}`,
    `Feature Bullet 2: ${result.featureBullet2}`,
    '',
    'Product Description:',
    result.productDescription,
    '',
    `Design Path: ${result.designPath}`,
  ];
  triggerDownload(`${result.asin}-listing.txt`, lines.join('\n'), 'text/plain');
}

export function listingAsPlainText(result: GenerateResponse): string {
  return [
    `Design Title: ${result.designTitle}`,
    `Brand: ${result.brand}`,
    `Feature Bullet 1: ${result.featureBullet1}`,
    `Feature Bullet 2: ${result.featureBullet2}`,
    `Product Description: ${result.productDescription}`,
  ].join('\n\n');
}
