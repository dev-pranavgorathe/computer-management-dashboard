#!/bin/bash

# Git Push Helper - For Computer Management Dashboard

echo "🚀 Git Push Helper"
echo "===================="
echo ""
echo "To push to GitHub, you need a Personal Access Token."
echo ""
echo "Step 1: Create GitHub Personal Access Token"
echo "-------------------------------------------"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Fill in:"
echo "   - Note: Computer Dashboard Deployment"
echo "   - Expiration: No expiration (or 90 days)"
echo "   - Select scopes: ✅ repo"
echo "4. Click 'Generate token'"
echo "5. Copy the token (starts with ghp_)"
echo ""
echo "Step 2: Push to GitHub"
echo "---------------------------"
echo ""
read -p "Paste your GitHub token here: " GITHUB_TOKEN
echo ""
echo "Pushing to GitHub..."
git push https://$GITHUB_TOKEN@github.com/dev-pranavgorathe/computer-management-dashboard.git main
echo ""
echo "✅ Push complete!"
echo ""
echo "Your repository is now at: https://github.com/dev-pranavgorathe/computer-management-dashboard"
echo ""
