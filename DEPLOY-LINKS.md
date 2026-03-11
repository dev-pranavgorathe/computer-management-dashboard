# 🚀 Quick Deployment - Action Required

## Generated for You:

**NEXTAUTH_SECRET:** `GKI/fCUrN+ES5nnqIm/lvaueKboIOPbkgJMr1ZVjktM=`

**Your GitHub Repo:** https://github.com/dev-pranavgorathe/computer-management-dashboard

---

## 🎯 3 Simple Steps:

### Step 1: Create Supabase Database (2 minutes)

**➡️ Click here:** https://supabase.com

1. Sign up or login
2. Click **"New Project"**
3. Name it: `computer-management-dashboard`
4. Set password: (use a strong password - save this!)
5. Click **"Create new project"**

**After creation:**
- Go to **Settings → Database**
- Copy the **Connection String (URI)**
- It looks like: `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

---

### Step 2: Deploy to Vercel (3 minutes)

**➡️ Click here:** https://vercel.com/dashboard

1. Click **"Add New... → Project"**
2. Import repository: `dev-pranavgorathe/computer-management-dashboard`
3. Add these **Environment Variables**:

```
DATABASE_URL = postgresql://postgres.[REST]?pgbouncer=true&connection_limit=1
DIRECT_DATABASE_URL = postgresql://postgres.[REST]  (same but without ?pgbouncer)
NEXTAUTH_URL = https://computer-management-dashboard.vercel.app
NEXTAUTH_SECRET = GKI/fCUrN+ES5nnqIm/lvaueKboIOPbkgJMr1ZVjktM=
```

4. Click **"Deploy"**
5. Wait 2-3 minutes

**Your live URL:** `https://computer-management-dashboard.vercel.app`

---

### Step 3: Initialize Database (1 minute)

After deployment, run this command in your terminal:

```bash
cd /home/apnipathshala/.openclaw/workspace/computer-management-dashboard

# Set your production database URL (paste your DIRECT_DATABASE_URL here)
export DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# Create database tables
npx prisma db push

# Optional: Seed test data
npx prisma db seed
```

---

## ✅ Done! Visit Your Live App:

**Dashboard:** https://computer-management-dashboard.vercel.app

**First Steps:**
1. Click "Create Account"
2. Sign up with your email
3. In Supabase, run this SQL to make yourself admin:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

---

## Need Help?

Run the automated deployment helper:
```bash
./quick-deploy.sh
```

Or check the full guide: `DEPLOYMENT.md`
