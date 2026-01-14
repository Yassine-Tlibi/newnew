/**
 * Types for the scraper system
 */

export interface ScrapedProduct {
  title: string;
  url: string;
  price: number;
  currency: string;
  imageUrl?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  originalPrice?: number;
}

export interface StorePlugin {
  domain: string;
  name: string;
  
  /**
   * Extract product data from HTML
   */
  extractProducts(html: string, url: string): ScrapedProduct[];
  
  /**
   * Get category URLs for crawling
   */
  getCategoryUrls(): string[];
  
  /**
   * Extract product details from a product page
   */
  extractProductDetails?(html: string, url: string): ScrapedProduct | null;
}

export interface CrawlOptions {
  maxPages?: number;
  delay?: number;
  usePlaywright?: boolean;
  respectRobotsTxt?: boolean;
}

export interface CrawlResult {
  products: ScrapedProduct[];
  errors: string[];
  stats: {
    pagesVisited: number;
    productsFound: number;
    duration: number;
  };
}
