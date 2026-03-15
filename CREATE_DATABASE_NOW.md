# ✅ Single Database Setup (Supabase only)

This project should use **one database provider only: Supabase Postgres**.

## Localhost Setup

1. Create/open `.env.local`
2. Add only these Prisma DB vars:

```env
POSTGRES_PRISMA_URL="postgres://<user>:<password>@<pooler-host>:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://<user>:<password>@<direct-host>:5432/postgres?sslmode=require"
```

3. Sync schema:

```bash
npx prisma db push
```

4. (Optional) seed demo users:

```bash
npm run seed:demo
```

## Important

- Do **not** mix Neon / SQLite / Prisma Accelerate URLs for local setup.
- Keep DB provider consistent: **Supabase Postgres**.
- Prisma reads from `prisma/schema.prisma` datasource env vars above.
