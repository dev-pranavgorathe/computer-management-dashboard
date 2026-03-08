# Database Setup Guide for Vercel

## Option 1: Supabase (Recommended) ⭐

### Why Supabase?
- ✅ Free tier: 500MB database, 1GB storage
- ✅ PostgreSQL (production-ready)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Easy Vercel integration
- ✅ Dashboard UI

### Setup Steps:

#### Step 1: Create Supabase Account
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Create a new project:
   - Name: `computer-management-dashboard`
   - Database password: (save this!)
   - Region: Choose closest to you

#### Step 2: Get Database Credentials
1. Go to Project Settings → Database
2. Copy the following:
   - Host
   - Database name
   - Port
   - User
   - Password

3. Build connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Step 3: Configure Vercel Environment Variables
Add to Vercel:
- `DATABASE_URL` = `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- `DIRECT_URL` = `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

---

## Option 2: Neon (Alternative)

### Setup Steps:
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create project
4. Copy connection string
5. Add to Vercel as `DATABASE_URL`

---

## Option 3: PlanetScale (MySQL)

### Setup Steps:
1. Go to: https://planetscale.com
2. Sign up with GitHub
3. Create database
4. Get connection string
5. Add to Vercel as `DATABASE_URL`

---

## Quick Setup Command

Once you have your database URL, run:

```bash
# Set environment variable
vercel env add DATABASE_URL production
# Paste your database URL when prompted

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Deploy to Vercel
vercel --prod
```

---

## Next Steps

1. Create Supabase account (5 minutes)
2. Get database URL
3. I'll update the code to use it
4. Deploy to Vercel

**Ready to set up?** Just create the account and share the connection string!
