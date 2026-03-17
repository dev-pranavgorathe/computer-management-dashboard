#!/bin/bash
# Push CMD improvements to GitHub
# Run this script from your terminal

cd /home/apnipathshala/computer-management-dashboard

echo "Pushing IMP-01 changes to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed!"
    echo ""
    echo "Commit: feat: wire Complaints, Repossessions, Redeployments to real APIs (IMP-01)"
    echo "Files changed: 3 (complaints, repossessions, redeployments pages)"
else
    echo "❌ Push failed. Make sure you're logged into GitHub."
    echo "Try: gh auth login"
fi
