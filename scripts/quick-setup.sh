#!/bin/bash

# Quick Setup Script for TN Game Price Finder
# This script sets up the database and adds test products

set -e

echo "🚀 TN Game Price Finder - Quick Setup"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "   Please set it in your .env file or environment"
  exit 1
fi

# Check if dev server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "⚠️  Dev server is not running"
  echo "   Please run 'npm run dev' in another terminal first"
  exit 1
fi

echo "✅ Dev server is running"
echo ""

# Step 1: Initialize database
echo "📊 Step 1: Initializing database (categories + stores)..."
if curl -s -X POST http://localhost:3000/api/admin/init-db | grep -q "success"; then
  echo "✅ Database initialized"
else
  echo "❌ Failed to initialize database"
  exit 1
fi
echo ""

# Step 2: Add test products
echo "🎮 Step 2: Adding test products..."
if curl -s -X POST http://localhost:3000/api/admin/add-test-products | grep -q "success"; then
  echo "✅ Test products added"
else
  echo "❌ Failed to add test products"
  exit 1
fi
echo ""

# Step 3: Verify setup
echo "🔍 Step 3: Verifying setup..."
HEALTH=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH" | grep -q "healthy"; then
  echo "✅ Setup verified successfully"
  echo ""
  echo "$HEALTH" | grep -o '"products":[0-9]*' | sed 's/"products":/   Products: /'
  echo "$HEALTH" | grep -o '"offers":[0-9]*' | sed 's/"offers":/   Offers: /'
  echo "$HEALTH" | grep -o '"stores":[0-9]*' | sed 's/"stores":/   Stores: /'
  echo "$HEALTH" | grep -o '"categories":[0-9]*' | sed 's/"categories":/   Categories: /'
else
  echo "⚠️  Setup verification returned unexpected result"
fi
echo ""

# Step 4: Test search
echo "🔎 Step 4: Testing search..."
SEARCH=$(curl -s "http://localhost:3000/api/search?q=ryzen")
RESULT_COUNT=$(echo "$SEARCH" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ "$RESULT_COUNT" -gt 0 ]; then
  echo "✅ Search is working! Found $RESULT_COUNT products"
else
  echo "⚠️  Search returned 0 results"
fi
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Try searching for: 'Ryzen', 'PS5', or 'processor'"
echo "  3. To crawl real stores, run:"
echo "     curl -X POST http://localhost:3000/api/admin/crawl \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"domain\": \"gameworld.tn\", \"maxPages\": 5}'"
echo ""
