/**
 * Product name normalization utilities
 * Normalizes product titles for better matching across stores
 */

const BRAND_PATTERNS = {
  amd: /\b(amd|ryzen|radeon)\b/i,
  intel: /\b(intel|core i[3579]|xeon|pentium|celeron)\b/i,
  nvidia: /\b(nvidia|geforce|rtx|gtx)\b/i,
  playstation: /\b(playstation|ps[1-5]|psvr|psn)\b/i,
  xbox: /\b(xbox|series [xs])\b/i,
  nintendo: /\b(nintendo|switch|wii)\b/i,
  corsair: /\bcorsair\b/i,
  kingston: /\bkingston\b/i,
  gskill: /\bg\.?skill\b/i,
  asus: /\basus\b/i,
  msi: /\bmsi\b/i,
  gigabyte: /\bgigabyte\b/i,
  asrock: /\basrock\b/i,
  evga: /\bevga\b/i,
  samsung: /\bsamsung\b/i,
  crucial: /\bcrucial\b/i,
  western_digital: /\b(western digital|wd)\b/i,
  seagate: /\bseagate\b/i,
  logitech: /\blogitech\b/i,
  razer: /\brazer\b/i,
  steelseries: /\bsteelseries\b/i,
};

const MODEL_PATTERNS = {
  ryzen: /ryzen\s*([3579])\s*(\d{4}[xXgG]?[tT]?[iI]?)/i,
  intel_core: /core\s*i([3579])\s*[-\s]*(\d{4,5}[kKfF]?[sS]?)/i,
  nvidia_gpu: /(rtx|gtx)\s*(\d{4})\s*(ti|super)?/i,
  amd_gpu: /(rx|radeon)\s*(\d{4})\s*(xt|xfx)?/i,
  playstation: /ps([1-5])/i,
  xbox: /xbox\s*(series\s*[xs]|one|360)?/i,
  ram_speed: /(\d{4})\s*mhz/i,
  storage_size: /(\d+)\s*(gb|tb)/i,
};

export interface NormalizedProduct {
  normalizedTitle: string;
  originalTitle: string;
  brand?: string;
  model?: string;
  tokens: string[];
  searchTerms: string[];
}

/**
 * Normalize a product title for comparison and matching
 */
export function normalizeProductTitle(title: string): NormalizedProduct {
  const originalTitle = title;
  
  // Convert to lowercase
  let normalized = title.toLowerCase();
  
  // Remove special characters but keep spaces and alphanumeric
  normalized = normalized.replace(/[^\w\s]/g, ' ');
  
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Extract brand
  let brand: string | undefined;
  for (const [brandName, pattern] of Object.entries(BRAND_PATTERNS)) {
    if (pattern.test(normalized)) {
      brand = brandName;
      break;
    }
  }
  
  // Extract model
  let model: string | undefined;
  for (const pattern of Object.values(MODEL_PATTERNS)) {
    const match = normalized.match(pattern);
    if (match) {
      model = match[0];
      break;
    }
  }
  
  // Create tokens (words)
  const tokens = normalized.split(' ').filter(t => t.length > 0);
  
  // Generate search terms (combinations)
  const searchTerms = generateSearchTerms(normalized, brand, model);
  
  return {
    normalizedTitle: normalized,
    originalTitle,
    brand,
    model,
    tokens,
    searchTerms,
  };
}

/**
 * Generate search terms for a product
 */
function generateSearchTerms(normalized: string, brand?: string, model?: string): string[] {
  const terms = [normalized];
  
  if (brand) terms.push(brand);
  if (model) terms.push(model);
  if (brand && model) terms.push(`${brand} ${model}`);
  
  return terms;
}

/**
 * Calculate similarity score between two normalized titles
 * Returns a score between 0 and 1 (1 = exact match)
 */
export function calculateSimilarity(
  a: NormalizedProduct,
  b: NormalizedProduct
): number {
  // Exact match
  if (a.normalizedTitle === b.normalizedTitle) return 1.0;
  
  // Brand and model match
  if (a.brand && b.brand && a.brand === b.brand && a.model && b.model && a.model === b.model) {
    return 0.95;
  }
  
  // Token-based similarity (Jaccard index)
  const setA = new Set(a.tokens);
  const setB = new Set(b.tokens);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  const jaccardIndex = intersection.size / union.size;
  
  // Boost score if brand matches
  let score = jaccardIndex;
  if (a.brand && b.brand && a.brand === b.brand) {
    score = Math.min(1.0, score + 0.2);
  }
  
  return score;
}

/**
 * Check if two products are likely the same
 */
export function areProductsSimilar(
  a: NormalizedProduct,
  b: NormalizedProduct,
  threshold = 0.7
): boolean {
  return calculateSimilarity(a, b) >= threshold;
}

/**
 * Extract price from text
 */
export function extractPrice(text: string): number | null {
  // Look for patterns like: 1,234.56 or 1234.56 or 1 234,56
  const patterns = [
    /(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2,3})?)/,
    /(\d+(?:\.\d{2,3})?)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Remove spaces and commas, parse as float
      const priceStr = match[1].replace(/[\s,]/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price)) {
        return price;
      }
    }
  }
  
  return null;
}

/**
 * Normalize price to TND
 */
export function normalizePriceToTND(price: number, currency: string): number {
  currency = currency.toLowerCase();
  
  // If already TND, return as is
  if (currency === 'tnd' || currency === 'dt' || currency === 'د.ت') {
    return price;
  }
  
  // Rough conversion rates (these should be updated periodically)
  const conversionRates: Record<string, number> = {
    'usd': 3.1,
    'eur': 3.4,
    'gbp': 4.0,
  };
  
  if (conversionRates[currency]) {
    return price * conversionRates[currency];
  }
  
  // Default: assume it's TND
  return price;
}

/**
 * Clean and normalize URL
 */
export function normalizeUrl(url: string, baseUrl?: string): string {
  try {
    // If relative URL and baseUrl provided, make it absolute
    if (url.startsWith('/') && baseUrl) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${url}`;
    }
    
    // Parse and normalize
    const parsed = new URL(url);
    
    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    
    return parsed.toString();
  } catch {
    return url;
  }
}
