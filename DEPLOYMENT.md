# 🚀 Production Deployment Guide

This guide will help you deploy the Computer Management Dashboard to production using Vercel and Supabase.

## Prerequisites

- GitHub account (for code hosting)
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Resend account for emails (https://resend.com) - Optional

---

## Step 1: Set up Supabase Database

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name it: `computer-management-dashboard`
4. Set a strong database password (save this!)
5. Choose a region close to you
6. Click "Create new project" (wait ~2 minutes)

### 1.2 Get Database Credentials

1. In Supabase dashboard, go to **Settings** → **Database**
2. Under "Connection string", select **URI** format
3. Copy the connection string
4. It looks like: `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

### 1.3 Get Direct Connection (for migrations)

1. Still in **Settings** → **Database**
2. Under "Connection string", select **JDBC** format
3. Copy the host (e.g., `aws-0-region.pooler.supabase.com`)
4. Change port from `6543` to `5432` for direct connection
5. Format: `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres`

---

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Push your code to GitHub (already done ✅)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository: `dev-pranavgorathe/computer-management-dashboard`
5. Click "Import"

### 2.2 Configure Environment Variables

In the Vercel deployment setup, add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `POSTGRES_PRISMA_URL` | `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true` | Supabase pooled connection (runtime) |
| `POSTGRES_URL_NON_POOLING` | `postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require` | Supabase direct connection (migrations) |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Your Vercel app URL |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Random 32-character secret |
| `RESEND_API_KEY` | Your Resend API key | Optional - for emails |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Optional - sender email |

### 2.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (~2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

---

## Step 3: Initialize Database

### 3.1 Push Database Schema

After the first deployment, you need to create the database tables:

1. Go to your Vercel dashboard
2. Click on your project
3. Go to **Deployments** → Click on the latest deployment
4. Click **Functions** tab
5. Run terminal command: `npx prisma db push`

**OR** run locally:

```bash
# Set your production Supabase Prisma vars locally temporarily
export POSTGRES_PRISMA_URL="your-production-pooled-url"
export POSTGRES_URL_NON_POOLING="your-production-direct-url"

# Push schema to production database
npx prisma db push

# Seed initial data
npx prisma db seed
```

### 3.2 Create Admin User

After deploying, create your first admin user:

1. Go to your live app: `https://your-app-name.vercel.app`
2. Click "Create Account"
3. Sign up with your email
4. In Supabase SQL Editor, run:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

---

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `dashboard.yourcompany.com`)
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` environment variable to your custom domain

---

## Step 5: Set up Email (Optional)

### Using Resend for Transactional Emails

1. Create account at [Resend](https://resend.com)
2. Get your API key from dashboard
3. Add to Vercel environment variables:
   - `RESEND_API_KEY=your-api-key`
   - `EMAIL_FROM=noreply@yourdomain.com`
4. Redeploy your app

---

## Environment Variables Checklist

Before going live, ensure you have:

- ✅ `POSTGRES_PRISMA_URL` (Supabase pooled connection)
- ✅ `POSTGRES_URL_NON_POOLING` (Supabase direct connection)
- ✅ `NEXTAUTH_URL` (Your Vercel app URL)
- ✅ `NEXTAUTH_SECRET` (Random 32-char secret)
- ⬜ `RESEND_API_KEY` (Optional - for emails)
- ⬜ `EMAIL_FROM` (Optional - sender email)
- ⬜ `GITHUB_ID` & `GITHUB_SECRET` (Optional - OAuth)

---

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are correct
2. Check Supabase project is not paused (free tier pauses after 7 days)
3. Ensure IP restrictions in Supabase allow all connections

### Authentication Not Working

If login/registration fails:
1. Verify `NEXTAUTH_URL` matches your exact Vercel URL (including https://)
2. Check `NEXTAUTH_SECRET` is set and is 32+ characters
3. Clear browser cookies and try again

### Prisma Errors

If you see Prisma schema errors:
1. Run `npx prisma generate` locally to regenerate client
2. Ensure all migrations are applied: `npx prisma migrate deploy`
3. Check database tables exist in Supabase dashboard

---

## Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# View logs
vercel logs your-app-name
```

---

## Monitoring

- **Vercel Analytics**: Built-in monitoring in Vercel dashboard
- **Supabase Dashboard**: Monitor database performance and queries
- **Error Tracking**: Consider adding Sentry for error monitoring

---

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org

---

## Security Recommendations

1. **Enable Row Level Security (RLS)** in Supabase for extra security
2. **Set up rate limiting** using Upstash Redis
3. **Use strong passwords** for database and admin accounts
4. **Enable 2FA** on Vercel, Supabase, and GitHub accounts
5. **Regular backups**: Supabase automatically backs up daily (Pro plan)
6. **Review audit logs** regularly for suspicious activity

---

## Cost Estimate

**Free Tier (Development/Testing):**
- Vercel: Free (Hobby plan)
- Supabase: Free (500MB database, 2GB bandwidth)
- Resend: Free (3,000 emails/month)
- **Total: $0/month**

**Production (Recommended):**
- Vercel: $20/month (Pro plan)
- Supabase: $25/month (Pro plan - 8GB database)
- Resend: $20/month (50,000 emails/month)
- **Total: ~$65/month**

---

## Next Steps

After successful deployment:

1. ✅ Test all functionality (shipments, complaints, repossessions, redeployments)
2. ✅ Create additional user accounts for team members
3. ✅ Set up monitoring and alerts
4. ✅ Configure regular database backups
5. ✅ Add custom branding (logo, colors, etc.)
6. ✅ Set up email notifications
7. ✅ Review and adjust user roles/permissions

---

**Need help?** Check the troubleshooting section or reach out to support.
