/**
 * Web crawler for scraping store pages
 */

import { ScrapedProduct, CrawlOptions, CrawlResult } from './types';
import { getPluginForDomain } from './plugins';

export class Crawler {
  private userAgent = 'TN-Game-Price-Finder-Bot/1.0 (Price Comparison Service)';
  
  /**
   * Fetch HTML from a URL with rate limiting and proper headers
   */
  async fetchHtml(url: string, options?: { delay?: number }): Promise<string> {
    try {
      // Add delay if specified
      if (options?.delay) {
        await this.sleep(options.delay);
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-TN,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * Crawl a store domain
   */
  async crawlStore(domain: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    const startTime = Date.now();
    const plugin = getPluginForDomain(domain);
    
    if (!plugin) {
      throw new Error(`No plugin found for domain: ${domain}`);
    }
    
    const allProducts: ScrapedProduct[] = [];
    const errors: string[] = [];
    let pagesVisited = 0;
    
    const categoryUrls = plugin.getCategoryUrls();
    const maxPages = options.maxPages || categoryUrls.length;
    const delay = options.delay || 1000;
    
    for (const url of categoryUrls.slice(0, maxPages)) {
      try {
        console.log(`Crawling: ${url}`);
        const html = await this.fetchHtml(url, { delay });
        const products = plugin.extractProducts(html, url);
        
        allProducts.push(...products);
        pagesVisited++;
      } catch (error) {
        const errorMsg = `Failed to crawl ${url}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    const duration = Date.now() - startTime;
    
    return {
      products: allProducts,
      errors,
      stats: {
        pagesVisited,
        productsFound: allProducts.length,
        duration,
      },
    };
  }
  
  /**
   * Check robots.txt for a domain
   */
  async checkRobotsTxt(domain: string): Promise<string | null> {
    try {
      const url = `https://${domain}/robots.txt`;
      const response = await fetch(url);
      
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error(`Failed to fetch robots.txt for ${domain}:`, error);
    }
    
    return null;
  }
  
  /**
   * Parse sitemap.xml for product URLs
   */
  async parseSitemap(domain: string): Promise<string[]> {
    try {
      const sitemapUrl = `https://${domain}/sitemap.xml`;
      const response = await fetch(sitemapUrl);
      
      if (!response.ok) {
        return [];
      }
      
      const xml = await response.text();
      
      // Extract URLs from sitemap
      const urlPattern = /<loc>(.*?)<\/loc>/g;
      const urls: string[] = [];
      let match;
      
      while ((match = urlPattern.exec(xml)) !== null) {
        urls.push(match[1]);
      }
      
      return urls;
    } catch (error) {
      console.error(`Failed to parse sitemap for ${domain}:`, error);
      return [];
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const crawler = new Crawler();
