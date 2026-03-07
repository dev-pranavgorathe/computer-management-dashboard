#!/bin/bash

# Computer Management Dashboard - Deployment Script
# This script helps deploy the dashboard to Vercel

set -e  # Exit on error

echo "🚀 Computer Management Dashboard - Deployment Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo -e "${GREEN}✅${NC} Found project directory"
echo ""

# Step 2: Git status
echo "📝 Step 1: Check Git Status"
echo "---------------------------"
git status
echo ""

# Step 3: Push to GitHub if needed
echo -e "${YELLOW}📦 Step 2: Push to GitHub${NC}"
echo "-----------------------------------"
echo "If you haven't pushed yet, run these commands:"
echo ""
echo "git branch -M main"
echo "git remote add origin https://github.com/pranavgorathe/computer-management-dashboard.git"
echo "git push -u origin main"
echo ""
read -p "Have you pushed to GitHub? (y/n) " -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅${NC} GitHub is up to date"
else
    echo "Please push to GitHub first, then run this script again."
    exit 0
fi

# Step 4: Deploy to Vercel
echo -e "${YELLOW}🚀 Step 3: Deploy to Vercel${NC}"
echo "------------------------------"
echo ""
echo "Options:"
echo "  1. Deploy to Preview (test)"
echo "  2. Deploy to Production"
echo ""
read -p "Choose deployment type (1/2): " -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo -e "${BLUE}🧪 Deploying to Preview...${NC}"
    vercel
elif [[ $REPLY == "2" ]]; then
    echo -e "${BLUE}🚀 Deploying to Production...${NC}"
    vercel --prod
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo -e "${GREEN}✅${NC} Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Vercel Dashboard"
echo "2. Add environment variables:"
echo "   - NEXTAUTH_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - GITHUB_ID"
echo "   - GITHUB_SECRET"
echo "3. Redeploy after adding variables"
echo ""
echo "🌐 Your dashboard will be live at: https://computer-management-dashboard.vercel.app"
echo ""
