# API Documentation

Complete API reference for the Computer Management Dashboard.

## 🔐 Authentication

All API endpoints require authentication via NextAuth.js session, except where noted.

**Headers:**
```http
Cookie: next-auth.session-token=...
```

**Error Response:**
```json
{
  "error": "Authentication required",
  "statusCode": 401
}
```

---

## 📦 Shipments

### List Shipments

```http
GET /api/shipments
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |
| search | string | - | Search in POD name, ref ID |
| status | string | - | Filter by status |
| dateFrom | string | - | Start date (DD-MM-YYYY) |
| dateTo | string | - | End date (DD-MM-YYYY) |

**Response:**
```json
{
  "shipments": [
    {
      "id": "uuid",
      "refId": "SHP-001",
      "podName": "Main Office",
      "status": "PENDING",
      "createdAt": "2026-03-18T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### Create Shipment

```http
POST /api/shipments
```

**Request Body:**
```json
{
  "podName": "Main Office",
  "shippingAddress": "123 Street, City",
  "state": "Maharashtra",
  "pincode": "400001",
  "contactPerson": "John Doe",
  "mobileNumber": "+919876543210",
  "cpus": 5,
  "components": "5 CPUs, 5 Monitors, etc.",
  "serials": "CPU001, CPU002",
  "trackingId": "TRK123456",
  "purpose": "NEW_POD",
  "orderDate": "18-03-2026",
  "notes": "Urgent delivery"
}
```

**Required Fields:**
- `podName` - Name of POD
- `shippingAddress` - Delivery address
- `contactPerson` - Contact name
- `mobileNumber` - Phone number
- `orderDate` - Order date (DD-MM-YYYY or ISO)

**Response:**
```json
{
  "id": "uuid",
  "refId": "SHP-001",
  "podName": "Main Office",
  "status": "PENDING",
  "createdAt": "2026-03-18T00:00:00.000Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (VIEWER role)
- `500` - Server error

---

### Get Shipment

```http
GET /api/shipments/:id
```

**Response:**
```json
{
  "id": "uuid",
  "refId": "SHP-001",
  "podName": "Main Office",
  "shippingAddress": "123 Street",
  "status": "PENDING",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Not found

---

### Update Shipment

```http
PUT /api/shipments/:id
```

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingId": "TRK123456",
  "notes": "Shipped via express"
}
```

**Response:**
```json
{
  "id": "uuid",
  "refId": "SHP-001",
  "status": "SHIPPED",
  "updatedAt": "2026-03-18T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - Updated
- `400` - Validation error / Cannot edit completed
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Not found

---

### Delete Shipment

```http
DELETE /api/shipments/:id
```

**Response:**
```json
{
  "message": "Shipment deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found

---

## 🎫 Complaints

### List Complaints

```http
GET /api/complaints
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |
| search | string | - | Search query |
| status | string | - | Filter by status |
| priority | string | - | Filter by priority |

**Response:**
```json
{
  "complaints": [...],
  "pagination": {...}
}
```

---

### Create Complaint

```http
POST /api/complaints
```

**Request Body:**
```json
{
  "podName": "Main Office",
  "issue": "System not booting",
  "category": "HARDWARE",
  "priority": "HIGH",
  "shipmentId": "uuid"
}
```

**Required Fields:**
- `podName` - POD name
- `issue` - Issue description

**Response:**
```json
{
  "id": "uuid",
  "refId": "CMP-001",
  "ticket": "TKT-00001",
  "status": "OPEN"
}
```

---

## 🔄 Redeployments

### List Redeployments

```http
GET /api/redeployments
```

### Create Redeployment

```http
POST /api/redeployments
```

**Request Body:**
```json
{
  "podName": "Main Office",
  "fromLocation": "Building A",
  "toLocation": "Building B",
  "reason": "Office relocation",
  "shipmentId": "uuid"
}
```

**Required Fields:**
- `podName` - POD name
- `fromLocation` - Current location
- `toLocation` - New location
- `reason` - Reason for redeployment

---

## ♻️ Repossessions

### List Repossessions

```http
GET /api/repossessions
```

### Create Repossession

```http
POST /api/repossessions
```

**Request Body:**
```json
{
  "podName": "Main Office",
  "reason": "Contract ended",
  "shipmentId": "uuid"
}
```

**Required Fields:**
- `podName` - POD name
- `reason` - Reason for repossession

---

## 🏥 Health Check

### Database Health

```http
GET /api/health/db
```

**Response:**
```json
{
  "ok": true,
  "db": "connected",
  "shipmentCount": 10,
  "complaintCount": 4,
  "ts": "2026-03-18T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - Connected
- `500` - Connection failed

---

## 🔍 Search & Filters

### Search Syntax

All list endpoints support search:

```
GET /api/shipments?search=main+office
```

Searches across:
- POD name
- Reference ID
- Contact person
- Tracking ID

### Date Filters

```
GET /api/shipments?dateFrom=01-03-2026&dateTo=31-03-2026
```

Date format: `DD-MM-YYYY` or ISO 8601

---

## ⚠️ Error Responses

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "podName",
      "message": "POD Name is required"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "error": "Authentication required"
}
```

### Forbidden (403)

```json
{
  "error": "You do not have permission to perform this action"
}
```

### Not Found (404)

```json
{
  "error": "Shipment not found"
}
```

### Server Error (500)

```json
{
  "error": "Failed to create shipment",
  "details": "Database connection failed"
}
```

---

## 🔒 Permission Matrix

| Endpoint | ADMIN | MANAGER | USER | VIEWER |
|----------|-------|---------|------|--------|
| GET /api/shipments | ✅ | ✅ | ✅ Own | ✅ Own |
| POST /api/shipments | ✅ | ✅ | ✅ | ❌ |
| PUT /api/shipments/:id | ✅ | ✅ | ✅ Own | ❌ |
| DELETE /api/shipments/:id | ✅ | ✅ | ❌ | ❌ |

---

## 📊 Pagination

All list endpoints return paginated data:

**Request:**
```
GET /api/shipments?page=2&limit=20
```

**Response:**
```json
{
  "shipments": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 95,
    "totalPages": 5
  }
}
```

---

## 🔄 Rate Limiting

Production deployments have rate limiting:
- **100 requests/minute** per IP
- **1000 requests/hour** per user

Rate limit headers included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645000000
```

---

## 📝 Request/Response Examples

### Complete Shipment Creation

**Request:**
```bash
curl -X POST https://your-domain.com/api/shipments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "podName": "Headquarters",
    "shippingAddress": "123 Business Park, Mumbai",
    "contactPerson": "Jane Smith",
    "mobileNumber": "+919876543210",
    "cpus": 10,
    "orderDate": "18-03-2026"
  }'
```

**Response:**
```json
{
  "id": "clg1234567890",
  "refId": "SHP-011",
  "podName": "Headquarters",
  "shippingAddress": "123 Business Park, Mumbai",
  "contactPerson": "Jane Smith",
  "mobileNumber": "+919876543210",
  "cpus": 10,
  "status": "PENDING",
  "createdAt": "2026-03-18T05:30:00.000Z",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

**Last Updated:** March 18, 2026
