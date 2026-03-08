#!/bin/bash

# Database Setup Script for Vercel + Supabase

echo "🚀 Setting up Supabase Database for Computer Management Dashboard"
echo "================================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with DATABASE_URL first"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ Error: DATABASE_URL not found in .env"
    echo ""
    echo "Please add your Supabase database URL to .env:"
    echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    exit 1
fi

echo "✅ Database URL found"
echo ""

# Install Prisma CLI if not installed
echo "📦 Checking Prisma installation..."
if ! command -v npx prisma &> /dev/null; then
    echo "Installing Prisma..."
    npm install -D prisma
fi

# Generate Prisma Client
echo ""
echo "⚙️  Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error generating Prisma client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Push schema to database
echo "🗄️  Pushing schema to database..."
echo "This will create all necessary tables in your Supabase database"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 1
fi

npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Error pushing schema to database"
    echo ""
    echo "Common issues:"
    echo "1. Check your DATABASE_URL is correct"
    echo "2. Make sure your Supabase project is running"
    echo "3. Verify network access to Supabase"
    exit 1
fi

echo "✅ Database schema pushed successfully"
echo ""

# Create initial admin user (optional)
echo "👤 Would you like to create an admin user? (y/n)"
read -p "> " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Creating admin user..."
    read -p "Email: " email
    read -p "Name: " name
    read -s -p "Password: " password
    echo ""

    # Run user creation script
    npx ts-node --transpile-only scripts/create-user.ts "$email" "$name" "$password"

    echo "✅ Admin user created"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: vercel env add DATABASE_URL production"
echo "2. Paste your database URL"
echo "3. Run: vercel --prod"
echo ""
echo "Your app will now use Supabase for persistent data storage! 🚀"
