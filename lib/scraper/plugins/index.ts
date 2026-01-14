/**
 * Store plugin registry
 */

import { StorePlugin, ScrapedProduct } from '../types';
import { GameWorldPlugin } from './gameworld';

// Plugin registry
const plugins: Map<string, StorePlugin> = new Map();

// Register all plugins
plugins.set('gameworld.tn', new GameWorldPlugin());

// Generic plugin for stores without specific implementation
class GenericStorePlugin implements StorePlugin {
  constructor(public domain: string, public name: string) {}
  
  getCategoryUrls(): string[] {
    return [`https://${this.domain}`];
  }
  
  extractProducts(html: string, url: string): ScrapedProduct[] {
    // Generic extraction logic using common patterns
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const products: ScrapedProduct[] = [];
    
    // Try common product container selectors
    const containerSelectors = [
      '.product-item',
      '.product',
      '.product-card',
      '[itemtype*="Product"]',
      '[data-product]',
    ];
    
    for (const selector of containerSelectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_: number, elem: Element) => {
          const $elem = $(elem);
          
          // Extract title
          const title = $elem.find('h2, h3, .product-title, .product-name').first().text().trim();
          
          // Extract URL
          const href = $elem.find('a').first().attr('href');
          const productUrl = href ? (href.startsWith('http') ? href : `https://${this.domain}${href}`) : '';
          
          // Extract price
          const priceText = $elem.find('.price, .product-price, [data-price]').first().text().trim();
          const priceMatch = priceText.match(/(\d+(?:[,\s]\d{3})*(?:\.\d{2,3})?)/);
          const price = priceMatch ? parseFloat(priceMatch[1].replace(/[,\s]/g, '')) : null;
          
          // Extract image
          const img = $elem.find('img').first();
          const imageUrl = img.attr('src') || img.attr('data-src') || '';
          
          if (title && productUrl && price) {
            products.push({
              title,
              url: productUrl,
              price,
              currency: 'TND',
              imageUrl: imageUrl || undefined,
              availability: 'in_stock' as const,
            });
          }
        });
        break;
      }
    }
    
    return products;
  }
}

// Register generic plugins for other stores
const otherStores = [
  { domain: 'skymil-informatique.com', name: 'Skymil Informatique' },
  { domain: 'sbsinformatique.com', name: 'SBS Informatique' },
  { domain: 'mytek.tn', name: 'MyTek' },
  { domain: 'bestbuytunisie.tn', name: 'Best Buy Tunisie' },
];

otherStores.forEach(store => {
  if (!plugins.has(store.domain)) {
    plugins.set(store.domain, new GenericStorePlugin(store.domain, store.name));
  }
});

/**
 * Get plugin for a domain
 */
export function getPluginForDomain(domain: string): StorePlugin | null {
  return plugins.get(domain) || null;
}

/**
 * Get all registered plugins
 */
export function getAllPlugins(): StorePlugin[] {
  return Array.from(plugins.values());
}

/**
 * Register a custom plugin
 */
export function registerPlugin(domain: string, plugin: StorePlugin): void {
  plugins.set(domain, plugin);
}
