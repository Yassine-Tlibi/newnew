/**
 * Base plugin with common utilities for store scrapers
 */

import * as cheerio from 'cheerio';
import { ScrapedProduct, StorePlugin } from '../types';
import { extractPrice, normalizeUrl } from '../normalizer';

export abstract class BaseStorePlugin implements StorePlugin {
  abstract domain: string;
  abstract name: string;
  
  protected loadHtml(html: string) {
    return cheerio.load(html);
  }
  
  protected extractTextContent($: cheerio.CheerioAPI, selector: string): string | null {
    const elem = $(selector);
    return elem.length > 0 ? elem.text().trim() : null;
  }
  
  protected extractAttribute($: cheerio.CheerioAPI, selector: string, attr: string): string | null {
    const elem = $(selector);
    return elem.length > 0 ? (elem.attr(attr) || null) : null;
  }
  
  protected extractPriceFromText(text: string): number | null {
    return extractPrice(text);
  }
  
  protected normalizeProductUrl(url: string, baseUrl?: string): string {
    return normalizeUrl(url, baseUrl || `https://${this.domain}`);
  }
  
  abstract extractProducts(html: string, url: string): ScrapedProduct[];
  abstract getCategoryUrls(): string[];
  
  extractProductDetails?(html: string, url: string): ScrapedProduct | null;
}
