export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface Candidate {
  asin: string;
  status: string;
  productIdea: string;
  score: number;
  copyrightRisk: RiskLevel;
  trademarkRisk: RiskLevel;
  platformRisk: RiskLevel;
  reason: string;
  saferAlternative: string;
  title: string;
  brand: string;
  category: string;
  amazonUrl: string;
  imageUrl: string;
  screenshotPath: string;
}

export interface AnalyzeRequest {
  links: string[];
}

export interface AnalyzeResponse {
  success: boolean;
  count: number;
  candidates: Candidate[];
}

export interface GenerateRequest {
  asin: string;
}

export interface GenerateResponse {
  success: boolean;
  asin: string;
  designPath: string;
  designImageUrl: string;
  designTitle: string;
  brand: string;
  featureBullet1: string;
  featureBullet2: string;
  productDescription: string;
}

export type ApiErrorKind =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'NOT_FOUND'
  | 'WEBHOOK_INACTIVE'
  | 'INVALID_RESPONSE'
  | 'SERVER_ERROR'
  | 'EMPTY_RESULT'
  | 'UNKNOWN';

export interface ApiError {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  details?: string;
}
