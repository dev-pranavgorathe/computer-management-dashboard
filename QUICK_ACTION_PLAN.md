# APNI PATHSHALA
# Computer Management Dashboard

## MVP Improvement Plan
### Post-Launch Gap Analysis & Feature Roadmap

| Item | Value |
| --- | --- |
| Live URL | https://computer-management-dashboard.vercel.app |
| Repository | https://github.com/dev-pranavgorathe/computer-management-dashboard |
| Stack | Next.js 15, TypeScript, Prisma, PostgreSQL (Supabase), NextAuth, Vercel |
| Current Phase | MVP v1.0 - Deployed |
| Date Prepared | March 2026 |
| Total Issues | 18 improvement points across 4 priority levels |

## 1. Executive Summary

The Computer Management Dashboard (CMD) MVP has been successfully deployed to Vercel with a solid technical foundation: PostgreSQL persistence, NextAuth authentication, full Prisma schema, and working REST APIs for all four modules. However, a significant gap exists between the backend capabilities and what is actually wired into the front-end UI.

Three of the five main modules (Complaints, Repossessions, Redeployments) display hardcoded 2024 mock data and call zero real APIs. The Reports module generates entirely fake numbers. Export buttons do not export. Edit and Delete buttons on Shipments do nothing. The Status Pipeline UI, the primary operational workflow, is not connected to any advancement action.

All 18 improvements identified below are achievable within the existing codebase without rebuilding anything. The APIs, schema, validation, and auth are already in place. The work is predominantly front-end wiring and UI completion.

### Priority Breakdown

| Priority | Items | Description |
| --- | --- | --- |
| CRITICAL | 2 | Implement immediately, core data is fake |
| HIGH | 6 | Needed for operational use |
| MEDIUM | 7 | Significant improvements |
| LOW | 3 | Polish and quality |

## 2. Effort & Priority Matrix

All 18 items ordered by priority and estimated development effort. One developer familiar with the existing codebase is assumed.

| ID | Task | Est. Effort | Priority |
| --- | --- | --- | --- |
| IMP-01 | API wiring: Complaints, Repossessions, Redeployments | 6-9 days | CRITICAL |
| IMP-02 | Reports API endpoint + real data wiring | 2 days | CRITICAL |
| IMP-03 | Shipments Edit + Delete actions | 1 day | HIGH |
| IMP-04 | Status Pipeline UI on Shipments | 1-2 days | HIGH |
| IMP-05 | Detail View modal across all modules | 2-3 days | HIGH |
| IMP-06 | Active POD count logic + drill-down modal | 2 days | HIGH |
| IMP-07 | Wire export buttons (CSV / Excel) | 0.5 days | HIGH |
| IMP-08 | PDF export for Reports | 2-3 days | HIGH |
| IMP-09 | Pagination controls on all tables | 1 day | MEDIUM |
| IMP-10 | Sortable column headers | 1 day | MEDIUM |
| IMP-11 | Recent Activity feed from AuditLog | 1-2 days | MEDIUM |
| IMP-12 | User info + Sign Out in Sidebar | 0.5 days | MEDIUM |
| IMP-13 | Priority + Device Type filters on Complaints | 0.5 days | MEDIUM |
| IMP-14 | Email Send API + send action | 1-2 days | MEDIUM |
| IMP-15 | India state map on Overview | 2-3 days | MEDIUM |
| IMP-16 | Skeleton loaders instead of spinners | 1 day | LOW |
| IMP-17 | Fix copyright year + metadata | under 1 hour | LOW |
| IMP-18 | Error boundary + offline banner | 0.5 days | LOW |

## 3. Improvement Items - Full Detail

### IMP-01 Replace Mock Data with Real API Data on 3 Modules
**Priority:** CRITICAL  
**Module:** Complaints / Repossessions / Redeployments  
**Category:** Data Integrity

**Problem**  
The Complaints, Repossessions, and Redeployments pages are entirely built on hardcoded mock arrays. They do not call any API, so zero real database data is displayed. Buttons (Add, Edit, View) are non-functional stubs. The live site shows fake 2024 data from the source code.

**Solution**  
Wire all three pages to their existing API routes (`/api/complaints`, `/api/repossessions`, `/api/redeployments`) exactly as the Shipments page already does. Each page has a complete, working API with GET/POST, authentication, pagination, and filtering. They just are not connected to the front-end yet.

**Implementation Steps**
- Complaints page: call `/api/complaints` on load, render real records in the table, wire the Add/Edit/View buttons to modal forms backed by POST/PUT
- Repossessions page: call `/api/repossessions` on load, wire Add button to a create modal, wire status advancement
- Redeployments page: call `/api/redeployments` on load, wire Add/Edit/Delete to API calls
- All three APIs already exist with full validation, auth, and audit logging. Only the front-end fetch calls are missing

**Effort:** Medium (2-3 days per module)  
**Impact:** All operational modules become functional. This is the core purpose of the dashboard.

### IMP-02 Connect Summary Reports to Real API Data
**Priority:** CRITICAL  
**Module:** Reports  
**Category:** Data Integrity

**Problem**  
The Reports page uses entirely hardcoded mock numbers (`pcsDeployed: 45`, `totalShipments: 52`, etc.). The Generate Report button does not call any API. KPI numbers, charts, and the activity breakdown all display fake, static data regardless of what is actually in the database.

**Solution**  
Build a `/api/reports` endpoint that accepts `dateFrom` and `dateTo` parameters and queries the Prisma database for real aggregates. Replace the mock `fetchReportData` function with a real API call. The endpoint can reuse the same filter logic already written in `/api/shipments`.

**Implementation Steps**
- Create `GET /api/reports?dateFrom=&dateTo=` that returns aggregated counts from all four tables
- Move existing dashboard stat computation from `page.tsx` to this shared API endpoint
- Wire the date range selector and Generate button to trigger the fetch with the right params
- Activity breakdown chart should show weekly/daily buckets of real events

**Effort:** Medium (2 days)  
**Impact:** The Reports module becomes operationally useful instead of decorative.

### IMP-03 Add Functional Edit and Delete Actions
**Priority:** HIGH  
**Module:** Shipments  
**Category:** Core Feature

**Problem**  
The Shipments page has Edit and Delete icon buttons in every table row, but neither button does anything. Users cannot edit or delete any shipment from the live site. The supporting API routes (`PUT` and `DELETE` on `/api/shipments/[id]`) are fully implemented in the backend but never called.

**Solution**  
Implement the edit modal with a pre-populated form and a `PUT` request, and add a delete confirmation dialog backed by a `DELETE` request. The shipment form already exists for creation. Reuse it for editing by loading the existing record into `formData` state.

**Implementation Steps**
- Add `selectedShipment` state and an `openEditModal` function that sets `formData` from the existing record
- Render the same add modal in edit mode when `selectedShipment` is set, posting to `PUT /api/shipments/[id]`
- Add a delete confirmation modal triggered by the Delete icon, calling `DELETE /api/shipments/[id]`
- Refresh the list after each action with `fetchShipments()`

**Effort:** Low (1 day)  
**Impact:** Makes the Shipments module fully CRUD-complete as intended.

### IMP-04 Implement the Status Advancement Pipeline UI
**Priority:** HIGH  
**Module:** Shipments  
**Category:** Core Feature

**Problem**  
The `StatusPipeline` component exists in the codebase but is never rendered in the Shipments table or detail view. Users have no way to advance a shipment through its pipeline (`Pending -> Order Sent -> Dispatched -> In Transit -> Delivered -> Completed`) from the live UI. The status column just shows a badge with no interaction.

**Solution**  
Add a status advance button or dropdown to each shipment row/detail modal. On click, call `PUT /api/shipments/[id]` with the next status. Gate advancement so each step is sequential. Disable advancement once `Completed` is reached.

**Implementation Steps**
- Add an Advance Status button in the detail modal or inline in the row actions
- Compute `nextStatus` from current status using the `SHIPMENT_PIPELINE` constant already defined in `StatusPipeline.tsx`
- Call `PUT /api/shipments/[id]` with `{ status: nextStatus }`
- Show the `StatusPipeline` component visually in the detail view to display progress
- Disable the button when `status === 'COMPLETED'`

**Effort:** Low-Medium (1-2 days)  
**Impact:** The primary operational workflow of the dashboard becomes usable.

### IMP-05 Implement the View Detail Panel / Modal
**Priority:** HIGH  
**Module:** All Modules  
**Category:** Core Feature

**Problem**  
Every module has Eye (View) icon buttons in the table rows, but clicking them does nothing on Complaints, Repossessions, and Redeployments. On Shipments, clicking the row opens a partial detail view. No module shows a full, structured detail panel with all record fields, status pipeline, and action buttons in one place.

**Solution**  
Build a consistent detail modal or side-panel for each module that displays all record fields, the visual status pipeline, edit/delete/advance actions, and linked records. Use a shared modal component pattern.

**Implementation Steps**
- Create a reusable `DetailModal` component with header (`refId`, status badge), field grid, `StatusPipeline`, and action footer
- On Eye button click, fetch the individual record from `GET /api/{module}/[id]` and render the modal
- Include all schema fields in the detail view including optional and nullable ones
- On Shipments, add serials, QC report, signed QC, and tracking ID fields to the existing view

**Effort:** Medium (2-3 days across all modules)  
**Impact:** Users can inspect and act on any record without navigating away.

### IMP-06 Add Active POD Count and POD-Level Drill-Down
**Priority:** HIGH  
**Module:** Overview  
**Category:** Missing Feature

**Problem**  
The Overview dashboard shows `totalPCsDeployed`, but the Active PODs metric uses a naive count: unique POD names from all shipments regardless of status. A POD that received equipment and then had it repossessed still counts as active. There is also no way to see which specific PODs are active from the dashboard.

**Solution**  
Compute Active PODs as PODs with at least one Completed shipment and no subsequent full repossession. Add a clickable Active PODs card that opens a modal listing all active PODs with their PC count, state, and last activity date.

**Implementation Steps**
- Backend: compute `activePODs` as distinct `podNames` from completed shipments minus fully repossessed ones
- Add a `podDetails` array to the dashboard API response with per-POD breakdown
- Front-end: clicking the Active PODs card opens a modal table showing each POD's name, state, PC count, and shipment date
- Add a geographic state-level breakdown (`Maharashtra`, `UP`, `Delhi`, etc.) as a small summary below the main cards

**Effort:** Medium (2 days)  
**Impact:** The most important KPI on the dashboard becomes operationally accurate.

### IMP-07 Enable CSV / Excel Export on All Module Tables
**Priority:** HIGH  
**Module:** All Modules  
**Category:** Missing Feature

**Problem**  
The `export.ts` library (`exportToCSV` and `exportToExcel`) is fully implemented and imported in the Shipments page, but the Export button is defined without an `onClick` handler. On all other modules, export functionality is entirely absent.

**Solution**  
Wire the export buttons to the existing `exportToCSV` and `exportToExcel` functions, passing the current filtered dataset. Add export buttons to Complaints, Repossessions, and Redeployments pages.

**Implementation Steps**
- On Shipments, connect the CSV and Excel menu items to `exportToCSV(filteredShipments, 'shipments')` and `exportToExcel(...)`
- Map database field names to human-readable column headers before passing data to export functions
- Add an Export button with the same pattern to the Complaints, Repossessions, and Redeployments headers
- Format dates using the existing `formatDate` helper before exporting

**Effort:** Low (half a day)  
**Impact:** Users can extract data for external use, reports, and audits.

### IMP-08 Implement Real PDF Export for Reports
**Priority:** HIGH  
**Module:** Reports  
**Category:** Missing Feature

**Problem**  
The Export PDF button on the Reports page calls `toast.success('PDF export coming in v2!')`. It is a placeholder. The Reports page is the only place where a structured PDF output is critically needed, but it generates nothing.

**Solution**  
Use a client-side PDF generation library (`jsPDF` + `html2canvas` or `@react-pdf/renderer`) to render the report content to a downloadable PDF. The PDF should include KPI numbers, charts, and the achievements/challenges text.

**Implementation Steps**
- Install `@react-pdf/renderer` or `jsPDF` with `html2canvas`
- Create a `ReportDocument` component that renders KPI cards, resolution rate bar, and insights text in PDF layout
- On Export PDF click, render the document and trigger browser download
- Include the report date range, generation timestamp, and Apni Pathshala branding in the PDF header

**Effort:** Medium (2-3 days)  
**Impact:** The reporting workflow becomes end-to-end, with real data in and shareable PDF out.

### IMP-09 Add Pagination Controls to Module Tables
**Priority:** MEDIUM  
**Module:** All Modules  
**Category:** UX Enhancement

**Problem**  
The API supports pagination (`page`, `limit`, `totalPages` returned in every response) but no pagination UI exists on any module page. The tables always request `limit=50` and there are no next/previous controls. As data grows, the table will silently truncate records beyond 50.

**Solution**  
Add a pagination footer to each module table showing current page, total pages, and next/previous buttons. Connect the page state to the API fetch call.

**Implementation Steps**
- Add `currentPage` state (default `1`) and `totalPages` state derived from API pagination response
- Append `?page={currentPage}&limit=25` to all API fetch calls
- Render a pagination bar below each table: `Previous | Page 1 of 4 | Next`
- Show total record count: `Showing 1-25 of 87 records`

**Effort:** Low (1 day)  
**Impact:** Prevents invisible data loss as records accumulate.

### IMP-10 Make Sort Columns Clickable on All Tables
**Priority:** MEDIUM  
**Module:** All Modules  
**Category:** UX Enhancement

**Problem**  
Table column headers are plain text with no sort affordance. Users cannot sort by date, status, POD name, or any other field. Internally the API supports `sortBy` and `sortOrder` query parameters, but no UI exposes this.

**Solution**  
Add a sort toggle with chevron icons to each column header. On click, set `sortBy` and `sortOrder` state and re-fetch from the API with the new params.

**Implementation Steps**
- Add `sortColumn` and `sortDirection` state (default: `createdAt`, `desc`)
- Render clickable column headers with `ChevronUp` and `ChevronDown` icons from `lucide-react`
- Pass `sortBy` and `sortOrder` to the API fetch call
- Visually highlight the active sort column

**Effort:** Low (1 day)  
**Impact:** Lets users quickly find records by date and identify aging operational issues.

### IMP-11 Add a Recent Activity / Audit Log Feed to the Overview
**Priority:** MEDIUM  
**Module:** Overview  
**Category:** UX Enhancement

**Problem**  
The Overview dashboard has no real-time activity indicator. The `AuditLog` table is populated by every create/update/delete action, but nothing on the dashboard reads or displays it. Users have no quick way to see what changed recently.

**Solution**  
Add a Recent Activity card to the Overview that fetches the last 10 audit log entries and displays them as a timeline feed (action, entity, user, timestamp).

**Implementation Steps**
- Add `GET /api/audit-logs` returning the last 10 `AuditLog` records with user relation included
- Render a timeline list in the Overview: `[Shipment SHP-013 created by Pranav - 2 hours ago]`
- Color-code by action type: `CREATE` (green), `UPDATE` (blue), `DELETE` (red)
- Link each entry to the relevant module page

**Effort:** Low-Medium (1-2 days)  
**Impact:** Transforms the Overview from a static snapshot into a live operational feed.

### IMP-12 Show Logged-In User Name and Role in Sidebar
**Priority:** MEDIUM  
**Module:** Sidebar / Global  
**Category:** UX Enhancement

**Problem**  
The sidebar footer only shows `2024 Apni Pathshala` with no indication of which user is logged in or their role. There is no sign-out button visible anywhere in the UI.

**Solution**  
Use the NextAuth `useSession` hook to display the user's name and role in the sidebar footer, with a Sign Out button. Update the copyright year dynamically.

**Implementation Steps**
- Add `useSession()` to `Sidebar.tsx` and render `user.name` and `user.role` in the footer section
- Add a Sign Out button that calls `signOut()` from `next-auth/react`
- Replace the hardcoded `2024` with `{new Date().getFullYear()}`
- Optionally show a user avatar circle with initials

**Effort:** Low (half a day)  
**Impact:** Basic usability and trust. Users know who they are logged in as.

### IMP-13 Add Priority Filter and Device Type Filter to Complaints
**Priority:** MEDIUM  
**Module:** Complaints  
**Category:** Missing Feature

**Problem**  
The Complaints API supports `priority` and `deviceType` as filter parameters, and the database schema stores both fields, but the Complaints page only has a status filter. There is no way to see all high-priority complaints or all CPU complaints without scanning the full list.

**Solution**  
Add Priority (`All / Low / Medium / High / Critical`) and Device Type (`CPU / Monitor / Keyboard / Mouse / Webcam / Headphones / Other`) filter dropdowns to the Complaints filter bar, passing them as query params to the API.

**Implementation Steps**
- Add `priorityFilter` and `deviceTypeFilter` state variables
- Render two dropdown selects or button groups in the filter bar
- Pass `priority=` and `deviceType=` to `/api/complaints` fetch calls
- Show active filter count badge on the Filter button when filters are active

**Effort:** Low (half a day)  
**Impact:** Ops team can quickly triage the most urgent complaints.

### IMP-14 Connect Email Templates to Real Send Action
**Priority:** MEDIUM  
**Module:** Email Templates  
**Category:** Missing Feature

**Problem**  
The Email Templates page allows composing emails with variable substitution and preview, but the Send button is not implemented. There is no POST call to any email sending endpoint. The `email.ts` library (Resend integration) is already in place but never triggered from the UI.

**Solution**  
Add a Send Email API endpoint (`POST /api/email/send`) that accepts `to`, `subject`, and `html`, and calls the `sendEmail` function from `email.ts`. Wire the Preview modal's Send button to this endpoint.

**Implementation Steps**
- Create `POST /api/email/send` with auth guard and rate limiting
- In the Email Templates modal, populate the To field from the relevant record's contact email
- On send, show a success toast with the recipient address
- Log the email send to the `AuditLog` table
- Handle the case where `RESEND_API_KEY` is not configured with a clear error message

**Effort:** Medium (1-2 days)  
**Impact:** The vendor and POD email workflow becomes functional end-to-end.

### IMP-15 Add an Interactive India Map for Geographic Distribution
**Priority:** MEDIUM  
**Module:** Overview  
**Category:** Missing Feature

**Problem**  
The current Overview dashboard lists state names extracted from shipping addresses as plain text. There is no visual representation of where PODs are geographically distributed. The state extraction logic also only checks 12 hardcoded states and misses others.

**Solution**  
Add a simple SVG choropleth map of India states, colored by number of active PODs per state. Use a lightweight React India map component or a small D3-based SVG. On hover, show a tooltip with state name and POD count.

**Implementation Steps**
- Use `react-india-states-map` or an equivalent lightweight package
- On the backend, compute state-wise POD counts from shipment addresses using better keyword extraction
- Map state names to state codes for the component
- Color scale: light blue (1-2 PODs) to dark blue (10+ PODs)
- Fall back to a state-wise bar chart if the map library is too heavy

**Effort:** Medium (2-3 days)  
**Impact:** Gives immediate geographic insight for a program spanning many states.

### IMP-16 Add Proper Loading Skeletons Instead of Full-Page Spinners
**Priority:** LOW  
**Module:** Global  
**Category:** Quality

**Problem**  
Every module shows a full-page centered spinner while data loads. This blocks the entire UI and gives no structural preview. On slow connections, users see a blank or spinning page for several seconds.

**Solution**  
Replace full-page spinners with skeleton loaders that mirror the table/card layout, using animated shimmer placeholders.

**Implementation Steps**
- Create a `SkeletonRow` component that renders 6-8 gray shimmer cells matching table column widths
- Render 5-8 skeleton rows immediately while `loading === true`
- Render skeleton stat cards above the table during initial load
- Use Tailwind's `animate-pulse` utility for the shimmer effect

**Effort:** Low (1 day)  
**Impact:** Perceived load time drops significantly and the UI feels more polished.

### IMP-17 Fix the 2024 Copyright Year and Update Stale Metadata
**Priority:** LOW  
**Module:** Global  
**Category:** Quality

**Problem**  
The sidebar footer displays `2024 Apni Pathshala`, which is already out of date. The page HTML title and meta description may also still reflect placeholder text.

**Solution**  
Set the copyright year dynamically. Update `layout.tsx` metadata (title, description, favicon) to reflect Apni Pathshala branding.

**Implementation Steps**
- In `Sidebar.tsx`, replace `2024` with `{new Date().getFullYear()}`
- In `layout.tsx`, set `metadata.title = 'CMD - Apni Pathshala'` and add a description
- Add an appropriate favicon (AP logo or computer icon)

**Effort:** Trivial (under an hour)  
**Impact:** Professional polish and current branding.

### IMP-18 Add a Global Error Boundary and Offline State Handler
**Priority:** LOW  
**Module:** Global  
**Category:** Quality

**Problem**  
If the Supabase database is unreachable or the network drops, individual pages show a basic error box. There is no global error boundary, so an unhandled JavaScript error could crash the entire app.

**Solution**  
Wrap the app in a React error boundary that catches unhandled errors and shows a friendly fallback UI with a Reload button. Add an offline detector that shows a banner when the browser is offline.

**Implementation Steps**
- Create an `ErrorBoundary` class component and wrap the main layout children with it
- Add `window` online/offline event listeners that show a yellow banner: `You are offline - data may be stale`
- The error boundary fallback should show the AP logo, a friendly message, and a Reload button

**Effort:** Low (half a day)  
**Impact:** The app degrades gracefully instead of crashing silently.

## 4. Recommended Sprint Plan

The following three sprints prioritize items by impact and dependency order. Each sprint assumes 1-2 developers. The goal is to have a fully functional, real-data dashboard within 6 weeks.

### Sprint 1 - Make It Real (Weeks 1-2)
**Goal:** Replace all mock data with live API data. By the end of this sprint, every page shows real database records.

- IMP-01: Wire Complaints, Repossessions, Redeployments to real APIs
- IMP-02: Build Reports API endpoint and wire the Reports page
- IMP-03: Implement Shipments Edit and Delete actions
- IMP-04: Implement Status Advancement UI on Shipments
- IMP-07: Wire CSV/Excel export buttons (already built, just connect them)

### Sprint 2 - Complete the Workflow (Weeks 3-4)
**Goal:** Every action a user needs to take in the dashboard is now possible end-to-end.

- IMP-05: Build detail view modals across all modules
- IMP-06: Fix Active POD calculation and add drill-down modal
- IMP-11: Add Recent Activity feed from AuditLog
- IMP-12: Show logged-in user + Sign Out button in Sidebar
- IMP-13: Add Priority and Device Type filters to Complaints
- IMP-09: Add pagination controls to all tables
- IMP-10: Make table column headers sortable

### Sprint 3 - Polish & Power (Weeks 5-6)
**Goal:** The dashboard is polished, reliable, and has the advanced features that make it stand out.

- IMP-08: Implement real PDF export for Summary Reports
- IMP-14: Connect Email Templates to real send action (Resend API)
- IMP-15: Add India state map to Overview
- IMP-16: Replace full-page spinners with skeleton loaders
- IMP-17: Fix copyright year, update metadata, and favicon
- IMP-18: Add error boundary and offline detection banner

## 5. Live Site - What Works vs What Needs Work

| Feature / Module | Current State on Live Site | What It Should Do |
| --- | --- | --- |
| Auth / Sign In | Works, secure login and session management | No change needed |
| Overview Dashboard | Real data from DB but Active PODs overcounts | Accurate active PODs + activity feed |
| Shipments - View List | Real data from API, search works | Add pagination + sort |
| Shipments - Add New | Form works, saves to DB | No change needed |
| Shipments - Edit | Button does nothing | Open pre-filled form, save via PUT |
| Shipments - Delete | Button does nothing | Confirm dialog + DELETE API call |
| Shipments - Status | No way to advance status from UI | Pipeline UI with Advance button |
| Shipments - Export | Export button/dropdown does nothing | Wire to existing export helpers |
| Complaints - All | Hardcoded mock data, no API calls | Full CRUD wired to `/api/complaints` |
| Repossessions - All | Hardcoded mock data, no API calls | Full CRUD wired to `/api/repossessions` |
| Redeployments - All | Hardcoded mock data, no API calls | Full CRUD wired to `/api/redeployments` |
| Email Templates | Preview works; Send button missing | `POST /api/email/send` to trigger Resend |
| Summary Reports | All numbers are fake hardcoded data | Real API endpoint + date-range filters |
| PDF Export | Toast says "coming in v2!" | `jsPDF` or `@react-pdf/renderer` |
| User in Sidebar | No user info shown, no Sign Out | `useSession()` + `signOut()` button |
| Database / Prisma | PostgreSQL on Supabase, all schema deployed | No change needed |
| Authentication | NextAuth + bcrypt, role-based | No change needed |
| Audit Logging | AuditLog written on every API action | Surface it in UI as activity feed |

---

CMD Improvement Plan | Apni Pathshala | March 2026 | 18 improvements identified
