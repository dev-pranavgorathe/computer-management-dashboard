# 🖥️ Computer Management Dashboard

A comprehensive dashboard for managing and monitoring computer assets deployed across PODs (Project Out for Development) at Apni Pathshala.

## ✨ Features

### 🎯 Core Functionality
- **Overview Dashboard** - Real-time metrics and analytics
  - Total PCs Deployed
  - Complaints tracking with resolution rates
  - Repossession & Redeployment statistics
  - Deployment trends and visualizations

### 📦 Module Management
- **Shipment Management** - Track computer shipments to PODs
  - Real-time status tracking (Processing → In Transit → Delivered)
  - Cost management and reporting
  - Contact information tracking

- **Complaint Management** - Resolve POD complaints efficiently
  - Priority-based tracking (High/Medium/Low)
  - Status workflow (Pending → In Progress → Solved)
  - Issue type categorization (Hardware/Software/Network)

- **Repossession Management** - Track recovered hardware
  - Condition assessment (Good/Fair/Needs Repair)
  - Storage location tracking
  - Status workflow (Available → Under Repair → Redeployed)

- **Redeployment Management** - Manage asset redistribution
  - Source & destination tracking
  - Link to resolved complaints
  - Flow visualization

### 🚀 Advanced Features
- **Export Functionality**
  - Download data as CSV
  - Export to Excel (.xlsx)
  - Filtered data export

- **Advanced Filtering**
  - Date range filters (from/to)
  - Multi-select status filters
  - Global search across all fields
  - Collapsible filter panel

- **Google Sheets Integration** (Ready for setup)
  - Connect to existing Google Sheets
  - Real-time data sync
  - Type-safe data models

### 🔐 Authentication
- **GitHub OAuth** via NextAuth.js
- Secure access control
- Session management

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Export**: xlsx (Excel), CSV
- **Authentication**: NextAuth.js
- **TypeScript**: Full type safety

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd computer-management-dashboard

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## ⚙️ Environment Variables

Create a `.env.local` file (single database setup: **Supabase Postgres via Prisma**):

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-random-secret-key>

# Prisma datasource vars (used by prisma/schema.prisma)
POSTGRES_PRISMA_URL=<supabase-pooler-connection-string>
POSTGRES_URL_NON_POOLING=<supabase-direct-connection-string>

# Optional OAuth
GITHUB_ID=<your-github-client-id>
GITHUB_SECRET=<your-github-client-secret>
```

### Important
- This project uses **one database only**: Supabase Postgres.
- Do **not** use mixed DB URLs (like Accelerate/SQLite/other providers) in local setup.
- Prisma Client reads connection details from `prisma/schema.prisma` env vars above.

## 🚀 Deployment to Vercel

### Step 1: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub
```bash
# Create repository on GitHub first, then:
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repository directly in [Vercel Dashboard](https://vercel.com/new).

### Step 4: Configure Environment Variables in Vercel

1. Go to your project → Settings → Environment Variables
2. Add the variables from `.env.local` above
3. Redeploy

## 🔌 Google Sheets Setup (Optional)

To connect to real Google Sheets data:

### 1. Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create Service Account
5. Download JSON credentials

### 2. Share Your Google Sheet
1. Open your Google Sheet
2. Click "Share"
3. Add service account email (from credentials JSON)
4. Grant "Editor" access

### 3. Configure in Dashboard
Add the following to your environment variables:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=<sheet-id-from-url>
GOOGLE_SHEETS_CREDENTIALS=<base64-of-credentials-json>
```

### 4. Sheet Structure

Ensure your Google Sheets have these tabs and columns:

**Shipments Tab:**
| ID | POD Name | Shipping Address | Contact Person | Mobile Number | Peripherals | Order Date | Dispatch Date | Delivery Date | Setup Date | Status | Total Cost |

**Complaints Tab:**
| ID | POD Name | Complaint Date | Issue Type | Description | Priority | Status | Assigned To | Resolution Date |

**Repossessions Tab:**
| ID | POD Name | Repo Date | PC Count | Reason | Condition | Storage Location | Status | Remarks |

**Redeployments Tab:**
| ID | Source Repo | Source POD | Destination POD | PC Count | Ship Date | Delivery Date | Status | Complaint Resolved |

## 📊 Mock Data

The dashboard currently uses mock data for demonstration. To use real data:

1. **Option A**: Connect Google Sheets (see above)
2. **Option B**: Create an API endpoint that returns your data
3. **Option C**: Replace the mock data arrays in component files

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... adjust colors
      }
    }
  }
}
```

### Add New Status/Types
Update the `statusColors` or `statusOptions` in the respective page files.

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop** (>1024px): Full layout with all features
- **Tablet** (768px-1024px): Adapted layout
- **Mobile** (<768px): Collapsible sidebar, stacked components

## 🔒 Security

- Authentication required for all pages
- GitHub OAuth for secure login
- Environment variables for sensitive data
- No hardcoded credentials

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary to Apni Pathshala.

## 📞 Support

For questions or issues, contact:
- **Email**: pranavgorathe@gmail.com
- **Team**: Computer Management Department

---

Built with ❤️ for Apni Pathshala
