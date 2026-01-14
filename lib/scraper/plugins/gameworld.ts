/**
 * Scraper plugin for gameworld.tn
 */

import { BaseStorePlugin } from './base';
import { ScrapedProduct } from '../types';

export class GameWorldPlugin extends BaseStorePlugin {
  domain = 'gameworld.tn';
  name = 'Game World';
  
  getCategoryUrls(): string[] {
    return [
      'https://gameworld.tn/consoles',
      'https://gameworld.tn/jeux-video',
      'https://gameworld.tn/accessoires',
      'https://gameworld.tn/pc-gaming',
      'https://gameworld.tn/cartes-cadeaux',
    ];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extractProducts(html: string, url: string): ScrapedProduct[] {
    const $ = this.loadHtml(html);
    const products: ScrapedProduct[] = [];
    
    // Try common e-commerce selectors
    const productSelectors = [
      '.product-item',
      '.product',
      '.product-card',
      '[data-product]',
      '.item-product',
    ];
    
    for (const selector of productSelectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_, elem) => {
          try {
            const $elem = $(elem);
            const product = this.extractProductFromElement($elem);
            if (product) products.push(product);
          } catch (error) {
            console.error('Error extracting product:', error);
          }
        });
        break;
      }
    }
    
    return products;
  }
  
  private extractProductFromElement($elem: ReturnType<cheerio.CheerioAPI>): ScrapedProduct | null {
    // Try to find title
    const titleSelectors = ['.product-title', '.product-name', 'h2', 'h3', '.title'];
    let title = '';
    for (const sel of titleSelectors) {
      const text = ($elem as ReturnType<cheerio.CheerioAPI>).find(sel).first().text().trim();
      if (text) {
        title = text;
        break;
      }
    }
    
    // Try to find URL
    const linkSelectors = ['a.product-link', 'a[href*="/product"]', 'a', 'h2 a', 'h3 a'];
    let productUrl = '';
    for (const sel of linkSelectors) {
      const href = ($elem as ReturnType<cheerio.CheerioAPI>).find(sel).first().attr('href');
      if (href) {
        productUrl = this.normalizeProductUrl(href);
        break;
      }
    }
    
    // Try to find price
    const priceSelectors = ['.price', '.product-price', '[data-price]', '.amount'];
    let price: number | null = null;
    for (const sel of priceSelectors) {
      const priceText = ($elem as ReturnType<cheerio.CheerioAPI>).find(sel).first().text().trim();
      if (priceText) {
        price = this.extractPriceFromText(priceText);
        if (price !== null) break;
      }
    }
    
    // Try to find image
    const imgSelectors = ['img.product-image', 'img', '[data-image]'];
    let imageUrl = '';
    for (const sel of imgSelectors) {
      const src = ($elem as ReturnType<cheerio.CheerioAPI>).find(sel).first().attr('src') || ($elem as ReturnType<cheerio.CheerioAPI>).find(sel).first().attr('data-src');
      if (src) {
        imageUrl = this.normalizeProductUrl(src);
        break;
      }
    }
    
    // Check availability
    let availability: 'in_stock' | 'out_of_stock' | 'preorder' = 'in_stock';
    const availabilityText = ($elem as ReturnType<cheerio.CheerioAPI>).text().toLowerCase();
    if (availabilityText.includes('rupture') || availabilityText.includes('out of stock')) {
      availability = 'out_of_stock';
    } else if (availabilityText.includes('preorder') || availabilityText.includes('précommande')) {
      availability = 'preorder';
    }
    
    if (!title || !productUrl || price === null) {
      return null;
    }
    
    return {
      title,
      url: productUrl,
      price,
      currency: 'TND',
      imageUrl: imageUrl || undefined,
      availability,
    };
  }
}
