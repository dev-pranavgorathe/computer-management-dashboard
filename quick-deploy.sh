#!/bin/bash

# Computer Management Dashboard - Quick Deployment Script
# This script will help you deploy to Vercel + Supabase

echo "🚀 Computer Management Dashboard - Quick Deployment"
echo "=================================================="
echo ""

# Generated secrets
NEXTAUTH_SECRET="GKI/fCUrN+ES5nnqIm/lvaueKboIOPbkgJMr1ZVjktM="
VERCEL_APP_NAME="computer-management-dashboard"

echo "✅ Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""

echo "📋 STEP 1: Create Supabase Project"
echo "-----------------------------------"
echo "1. Open: https://supabase.com"
echo "2. Sign up/Login"
echo "3. Click 'New Project'"
echo "4. Name: computer-management-dashboard"
echo "5. Set a strong password (SAVE THIS!)"
echo "6. Click 'Create new project'"
echo ""
echo "After creating, you'll get:"
echo "  DATABASE_URL (from Settings → Database → Connection String)"
echo ""
read -p "Press Enter when you've created the Supabase project..."

echo ""
echo "📋 STEP 2: Deploy to Vercel"
echo "----------------------------"
echo "1. Open: https://vercel.com/dashboard"
echo "2. Click 'Add New... → Project'"
echo "3. Import: dev-pranavgorathe/computer-management-dashboard"
echo "4. Add these Environment Variables:"
echo ""
echo "   DATABASE_URL=<paste-your-supabase-connection-string>?pgbouncer=true&connection_limit=1"
echo "   DIRECT_DATABASE_URL=<paste-your-supabase-direct-connection>"
echo "   NEXTAUTH_URL=https://$VERCEL_APP_NAME.vercel.app"
echo "   NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""
echo "5. Click 'Deploy'"
echo ""
read -p "Press Enter when deployment is complete..."

echo ""
echo "📋 STEP 3: Get Your Live URL"
echo "-----------------------------"
echo "Your app is live at: https://$VERCEL_APP_NAME.vercel.app"
echo ""
read -p "Enter your actual Vercel URL (or press Enter to use default): " custom_url
if [ ! -z "$custom_url" ]; then
    VERCEL_URL="$custom_url"
else
    VERCEL_URL="https://$VERCEL_APP_NAME.vercel.app"
fi

echo ""
echo "✅ Deployment Complete!"
echo "-----------------------"
echo "Your app: $VERCEL_URL"
echo ""
echo "Next steps:"
echo "1. Visit your app and create an account"
echo "2. Run database migrations (see below)"
echo ""

read -p "Do you want to run database migrations now? (y/n): " run_migrations
if [ "$run_migrations" = "y" ]; then
    echo ""
    echo "Running migrations..."
    echo "Paste your DATABASE_URL (direct connection): "
    read -s db_url
    export DATABASE_URL="$db_url"
    npx prisma db push
    echo "✅ Database schema created!"
fi

echo ""
echo "🎉 All done! Your dashboard is live!"
