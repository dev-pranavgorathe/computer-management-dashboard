# 🚀 Quick Database Setup - 5 Minutes

## Step 1: Create Supabase Account (2 minutes)

### Option A: Quick Setup (Recommended)
1. Open: **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub** (fastest)
4. Authorize Supabase

### Option B: Manual Setup
1. Go to: https://supabase.com
2. Click "Sign up"
3. Enter email and password
4. Verify email

---

## Step 2: Create Project (1 minute)

1. Click **"New Project"**
2. Fill in:
   - **Name:** `computer-management-dashboard`
   - **Database Password:** (save this!)
   - **Region:** Mumbai (ap-south-1) or Singapore (ap-southeast-1)
   - **Pricing Plan:** Free tier
3. Click **"Create new project"**
4. Wait 1-2 minutes for setup

---

## Step 3: Get Database URL (1 minute)

1. Go to **Project Settings** (gear icon)
2. Click **Database** in sidebar
3. Scroll to **Connection string** section
4. Copy the **Connection string** (URI format):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```

5. **Important:** Replace `[YOUR-PASSWORD]` with your database password

---

## Step 4: Add to Vercel (1 minute)

### Method A: Using Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your project: `computer-management-dashboard`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste your connection string)
   - **Environment:** Production
5. Click **Save**

### Method B: Using CLI
```bash
vercel env add DATABASE_URL production
# Paste your connection string when prompted
```

---

## Step 5: Deploy (30 seconds)

```bash
# Push database schema
npx prisma db push

# Deploy to Vercel
vercel --prod
```

---

## 🎉 Done!

Your app now uses Supabase for:
- ✅ Persistent user accounts
- ✅ Shipments data
- ✅ Complaints tracking
- ✅ Repossessions
- ✅ Redeployments

**Data will persist across server restarts!**

---

## 📊 Supabase Dashboard

Access your data:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor** to view data
4. Run SQL queries in **SQL Editor**

---

## 🔧 Configuration Files

Your project now has:
- `prisma/schema.prisma` - Database schema
- `src/lib/prisma.ts` - Database client
- `setup-database.sh` - Setup script
- `DATABASE_SETUP.md` - Full documentation

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 500MB database
   - 1GB file storage
   - 5GB bandwidth/month
   - Perfect for small-medium apps

2. **Security:**
   - Enable Row Level Security (RLS)
   - Use API keys for external access
   - Set up proper CORS

3. **Monitoring:**
   - View queries in Dashboard
   - Set up alerts
   - Monitor usage

---

## ❓ Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://prisma.io/docs
- **Vercel Integration:** https://vercel.com/integrations/supabase

---

**Ready?** Follow the steps above and share your DATABASE_URL when done! 🚀
