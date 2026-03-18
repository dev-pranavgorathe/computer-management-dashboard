# Computer Management Dashboard

A comprehensive web-based application for managing computer equipment operations across multiple Points of Distribution (PODs).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dev-pranavgorathe/computer-management-dashboard.git
cd computer-management-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"
POSTGRES_PRISMA_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

## 📖 Documentation

- **[PRD.md](./PRD.md)** - Product Requirements Document
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints guide
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions

## 🛠️ Features

### Core Modules
- **📦 Shipments** - Create, track, and manage equipment shipments
- **🎫 Complaints** - Register and resolve issues
- **🔄 Redeployments** - Track equipment movements between locations
- **♻️ Repossessions** - Manage equipment recovery
- **📊 Dashboard** - Real-time analytics and reporting
- **👥 User Management** - Role-based access control

### Key Features
- ✅ Mobile-responsive design
- ✅ Role-based permissions (ADMIN, MANAGER, USER, VIEWER)
- ✅ Real-time status tracking
- ✅ Document uploads (QC Reports)
- ✅ Export to CSV/Excel
- ✅ Audit logging
- ✅ Automated reference ID generation

## 🔐 User Roles

| Role | Create | Edit Own | Edit All | Delete | Approve |
|------|-------|----------|----------|--------|---------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ❌ | ✅ |
| USER | ✅ | ✅ | ❌ | ❌ | ❌ |
| VIEWER | ❌ | ❌ | ❌ | ❌ | ❌ |

## 🏗️ Tech Stack

**Frontend:**
- Next.js 16.1.6 (React 18+)
- TypeScript 5.0+
- Tailwind CSS 3.4+
- Lucide React Icons

**Backend:**
- Next.js API Routes
- Prisma ORM 5.22.0
- NextAuth.js 4.24.11
- Zod validation

**Database:**
- PostgreSQL 15+ (Supabase)
- Prisma migrations

**Deployment:**
- Vercel (Production)
- Environment: Node.js 18+

## 📁 Project Structure

```
computer-management-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── shipments/     # Shipment endpoints
│   │   │   ├── complaints/    # Complaint endpoints
│   │   │   ├── redeployments/ # Redeployment endpoints
│   │   │   └── repossessions/ # Repossession endpoints
│   │   ├── (with-sidebar)/   # Protected routes with sidebar
│   │   └── auth/             # Authentication pages
│   ├── components/           # React components
│   │   ├── ui/              # UI components
│   │   └── ...              # Feature components
│   └── lib/                  # Utilities
│       ├── prisma.ts         # Prisma client
│       ├── auth.ts           # Auth helpers
│       └── validations.ts    # Zod schemas
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── public/                  # Static files
├── .env.local              # Environment variables (not in git)
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database operations
npx prisma studio       # Open Prisma GUI
npx prisma migrate dev  # Create migration
npx prisma generate     # Generate client

# Linting
npm run lint
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name describe_your_change

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- shipments.test.ts

# Run tests in watch mode
npm test -- --watch
```

## 🐛 Debugging

### Database Connection Issues
```bash
# Test database connection
npm run test-db

# Check Prisma schema
npx prisma validate
```

### Common Issues

1. **"Cannot read properties of undefined"**
   - Check API response format
   - Verify authentication token
   - Check console for errors

2. **"Database connection failed"**
   - Verify DATABASE_URL in .env.local
   - Check if database is accessible
   - Run `npx prisma generate`

3. **"Authentication required"**
   - Clear browser cookies
   - Re-login to application
   - Check NEXTAUTH_SECRET

## 📝 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/shipments | List all shipments |
| POST | /api/shipments | Create shipment |
| GET | /api/shipments/:id | Get shipment details |
| PUT | /api/shipments/:id | Update shipment |
| GET | /api/complaints | List complaints |
| POST | /api/complaints | Create complaint |

## 🔒 Security

- ✅ All API routes require authentication
- ✅ Role-based access control (RBAC)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React)
- ✅ CSRF protection (NextAuth)
- ✅ Password hashing (bcrypt)
- ✅ HTTPS only in production

## 📱 Mobile Support

The dashboard is fully responsive and supports:
- iOS Safari 14+
- Android Chrome 90+
- Responsive breakpoints: 320px - 2560px
- Touch-friendly UI (44px minimum targets)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/dev-pranavgorathe/computer-management-dashboard/issues)
- **Documentation**: See `/docs` folder
- **Email**: support@example.com

---

**Built with ❤️ using Next.js and Prisma**
