import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const categories = [
    { name: 'Consoles', slug: 'consoles', description: 'PlayStation, Xbox, Nintendo Switch and handhelds' },
    { name: 'Video Games', slug: 'video-games', description: 'Games for PC, PlayStation, Xbox, and Nintendo' },
    { name: 'PC Components', slug: 'pc-components', description: 'CPU, GPU, RAM, motherboard, PSU, storage' },
    { name: 'Accessories', slug: 'accessories', description: 'Controllers, headsets, mouse, keyboard, chairs' },
    { name: 'Gift Cards', slug: 'gift-cards', description: 'PSN, Xbox, Steam, Nintendo eShop cards' },
    { name: 'PC Gaming', slug: 'pc-gaming', description: 'Gaming PCs and laptops' },
    { name: 'Peripherals', slug: 'peripherals', description: 'Monitors, keyboards, mice, and gaming peripherals' },
  ];

  console.log('Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const stores = [
    {
      domain: 'gameworld.tn',
      name: 'Game World',
      active: true,
      crawlEnabled: true,
      rateLimit: 1000,
      sitemapUrl: 'https://gameworld.tn/sitemap.xml',
    },
    {
      domain: 'skymil-informatique.com',
      name: 'Skymil Informatique',
      active: true,
      crawlEnabled: true,
      rateLimit: 1000,
      sitemapUrl: 'https://skymil-informatique.com/sitemap.xml',
    },
    {
      domain: 'sbsinformatique.com',
      name: 'SBS Informatique',
      active: true,
      crawlEnabled: true,
      rateLimit: 1000,
      sitemapUrl: 'https://sbsinformatique.com/sitemap.xml',
    },
    {
      domain: 'mytek.tn',
      name: 'MyTek',
      active: true,
      crawlEnabled: true,
      rateLimit: 1000,
      sitemapUrl: 'https://mytek.tn/sitemap.xml',
    },
    {
      domain: 'bestbuytunisie.tn',
      name: 'Best Buy Tunisie',
      active: true,
      crawlEnabled: true,
      rateLimit: 1000,
      sitemapUrl: 'https://bestbuytunisie.tn/sitemap.xml',
    },
  ];

  console.log('Creating stores...');
  for (const store of stores) {
    await prisma.store.upsert({
      where: { domain: store.domain },
      update: store,
      create: store,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
