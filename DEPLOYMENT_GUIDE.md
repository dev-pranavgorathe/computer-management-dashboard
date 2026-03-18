# Deployment Guide

Complete deployment guide for Computer Management Dashboard.

## 🚀 Deployment Overview

**Platform:** Vercel  
**Region:** Washington, D.C., USA (iad1)  
**Environment:** Production

---

## 📋 Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com)
- [Supabase Account](https://supabase.com)
- [GitHub Account](https://github.com)

### Local Tools
- Node.js 18+
- npm or yarn
- Git
- Vercel CLI (optional)

---

## 🔧 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Application
NODE_ENV="production"

# Optional
NEXT_PUBLIC_APP_NAME="Computer Management Dashboard"
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 🚢 Vercel Deployment (Recommended)

### Method 1: Git Integration

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

**Step 2: Import to Vercel**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables
4. Click "Deploy"

**Step 3: Configure Domain**
- Add custom domain in Vercel dashboard
- Update `NEXTAUTH_URL` to match domain

### Method 2: Vercel CLI

**Step 1: Install CLI**
```bash
npm i -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Deploy**
```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

**Step 4: Set Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

---

## 🗄️ Database Setup

### Supabase Configuration

**Step 1: Create Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note the connection string

**Step 2: Get Connection String**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Step 3: Configure Prisma**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("POSTGRES_PRISMA_URL")
}
```

**Step 4: Run Migrations**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## 🔐 Security Configuration

### Vercel Security Headers

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Protection

**Vercel Deployment Protection:**
- Enable "Vercel Authentication" in project settings
- OR disable for public APIs
- Configure bypass tokens for automation

---

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- **Web Analytics:** User visits, page views
- **Speed Insights:** Performance metrics
- **Logs:** Function logs

### Database Monitoring

**Supabase Dashboard:**
- Connection pool status
- Query performance
- Database size

### Health Checks

**Endpoint:** `/api/health/db`

```bash
# Manual check
curl https://your-app.vercel.app/api/health/db

# Automated monitoring (cron)
*/5 * * * * curl -f https://your-app.vercel.app/api/health/db || alert-command
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🚨 Rollback Procedure

### Quick Rollback

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find last working deployment
3. Click "⋯" → "Promote to Production"

**Via CLI:**
```bash
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_20260318.sql

# Or rollback migration
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## 📈 Scaling

### Vercel Scaling

**Auto-scaling enabled by default:**
- Scales to 0 when idle
- Scales up automatically with traffic
- Max instances: Configurable in settings

### Database Scaling

**Supabase Options:**
- **Free tier:** 500 MB database
- **Pro tier:** Up to 8 GB (upgrade as needed)
- **Connection pooling:** Enabled by default

### Performance Optimization

**Edge Functions:**
```javascript
export const config = {
  runtime: 'edge',
}
```

**Caching:**
```javascript
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  // ...
}
```

---

## 🔧 Post-Deployment Checklist

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] Authentication flow tested
- [ ] API endpoints responding
- [ ] Custom domain configured
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured
- [ ] Backup schedule confirmed
- [ ] Error tracking enabled

---

## 🐛 Troubleshooting

### Build Failures

**Error:** "Build failed"
```bash
# Check build logs
vercel logs [deployment-id]

# Test locally
npm run build
```

**Error:** "Type error"
```bash
# Check TypeScript
npx tsc --noEmit
```

### Database Connection Issues

**Error:** "Can't reach database server"
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db push --skip-generate
```

### Authentication Issues

**Error:** "JWT_INVALID"
```bash
# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32

# Update in Vercel
vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production
```

### 500 Errors

**Check logs:**
```bash
vercel logs --follow
```

**Common causes:**
- Missing environment variables
- Database connection failed
- Unhandled promise rejection

---

## 📝 Deployment Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs [url]

# List deployments
vercel list

# Remove deployment
vercel remove [url]

# Set environment variable
vercel env add [NAME] [environment]

# List environment variables
vercel env ls
```

---

## 🔐 Production Security Checklist

- [ ] HTTPS enforced
- [ ] Environment variables encrypted
- [ ] Database connection secured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Security headers set
- [ ] Authentication required
- [ ] Role-based access working
- [ ] Audit logging enabled
- [ ] Error messages sanitized

---

**Last Updated:** March 18, 2026
