#!/bin/bash
set -euo pipefail

# Kumo Docs Staging Deployment Script
# Deploys kumo-docs to staging environment on merge to main

echo "📚 Starting kumo-docs staging deployment..."

# Verify Company credentials
if [ -z "$COMPANY_API_TOKEN" ] || [ -z "$COMPANY_ACCOUNT_ID" ]; then
  echo "❌ COMPANY_API_TOKEN and COMPANY_ACCOUNT_ID are required"
  exit 1
fi

echo "🔨 Building @astron-collection/react library..."
pnpm --filter @astron-collection/react build

echo "🔨 Building kumo-docs..."
pnpm --filter @astron-collection/react-docs-astro build

echo "🚀 Deploying to staging..."
cd packages/kumo-docs-astro
pnpm exec wrangler deploy --env staging

echo "🎉 Kumo docs staging deployment complete!"
