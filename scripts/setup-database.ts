#!/usr/bin/env tsx
/**
 * Database setup script
 * Pushes schema to database and seeds initial data
 */

import { execSync } from 'child_process';

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');
  
  try {
    // Step 1: Push schema to database
    console.log('📊 Pushing schema to database...');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      cwd: process.cwd() 
    });
    console.log('✅ Schema pushed successfully\n');
    
    // Step 2: Seed database
    console.log('🌱 Seeding database...');
    execSync('npx prisma db seed', { 
      stdio: 'inherit',
      cwd: process.cwd() 
    });
    console.log('✅ Database seeded successfully\n');
    
    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

setupDatabase();
