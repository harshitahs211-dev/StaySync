# StaySync – Viva Code Walkthrough & System Architecture Guide

This document is designed to help B.Tech students explain the codebase, data flow, entry points, and architectural decisions to evaluation faculty during viva presentations.

---

## 1. Where the Code Starts (Entry Points)

### Backend Entry Point
- **File**: [backend/src/server.js](file:///C:/Users/KASHISH%20JAIN/.gemini/antigravity/scratch/staysync/backend/src/server.js)
- **What it does**:
  1. Loads environment variables from `.env`.
  2. Initializes Express application.
  3. Attaches global middleware: `cors()`, `express.json()`, and API Gateway request logger.
  4. Calls `initSchema()` from `db/db.js` to ensure PostgreSQL/SQLite tables exist.
  5. Checks if users exist in DB; if empty, automatically executes `seed.js` to populate demo data.
  6. Mounts modular routes (`/api/auth`, `/api/rooms`, `/api/bookings`, `/api/analytics`, etc.).
  7. Attaches global `errorHandler` middleware.
  8. Listens on port `5000`.

### Frontend Entry Point
- **Files**: [frontend/src/main.jsx](file:///C:/Users/KASHISH%20JAIN/.gemini/antigravity/scratch/staysync/frontend/src/main.jsx) and [frontend/src/App.jsx](file:///C:/Users/KASHISH%20JAIN/.gemini/antigravity/scratch/staysync/frontend/src/App.jsx)
- **What it does**:
  1. `main.jsx` renders `App` inside the DOM root element (`#root`).
  2. `App.jsx` wraps the application inside `AuthProvider` context so user logged-in state is accessible everywhere.
  3. Configures React Router (`BrowserRouter`) defining public routes (`/`, `/search`, `/rooms/:id`, `/login`, `/register`) and protected routes (`/booking`, `/dashboard/guest`, `/dashboard/reception`, `/dashboard/manager`, `/dashboard/staff`).

---

## 2. Important Modules & Viva Explanation

### Module A: Database Abstraction & SQL Availability Engine
- **Key Files**:
  - `backend/src/db/db.js`
  - `backend/src/services/room/roomController.js`
- **Important Functions**:
  - `query(sql, params)`: Dual-engine executor converting `?` placeholders to PostgreSQL `$1, $2` or running SQLite queries seamlessly.
  - `getAvailableRooms(req, res)`: Executes the real-time room availability SQL query.
- **How Data Flows**:
  ```
  User selects Check-in (28 Aug) & Check-out (30 Aug)
    └─► GET /api/rooms/available?checkIn=2026-08-28&checkOut=2026-08-30
          └─► roomController executes SQL:
                WHERE room.id NOT IN (
                  SELECT room_id FROM bookings
                  WHERE status IN ('CONFIRMED', 'HELD')
                    AND NOT (check_out <= '2026-08-28' OR check_in >= '2026-08-30')
                )
  ```
- **Why this approach was used**:
  Checking for date overlap using `NOT (check_out <= requested_in OR check_in >= requested_out)` is mathematically guaranteed to detect any collision, ensuring no physical room can ever be double-booked.

---

### Module B: Authentication & Role-Based Access Control (RBAC)
- **Key Files**:
  - `backend/src/utils/jwt.js`
  - `backend/src/middleware/authMiddleware.js`
  - `backend/src/middleware/rbacMiddleware.js`
  - `frontend/src/components/ProtectedRoute.jsx`
- **Important Functions**:
  - `generateToken(user)`: Encodes `id`, `email`, `name`, and `role` into a signed JWT token.
  - `authenticate(req, res, next)`: Extracts `Bearer <token>` from HTTP headers, verifies signature, and attaches `req.user`.
  - `requireRole(['MANAGER', 'RECEPTIONIST'])`: Verifies `req.user.role` matches allowed roles before granting endpoint access.
- **Why this approach was used**:
  Stateful session cookies require centralized server memory. Stateless JWT tokens scale effortlessly across distributed microservices while enforcing strict security rules on both frontend and backend.

---

### Module C: Dynamic Pricing & Hotel Date-Picker
- **Key Files**:
  - `frontend/src/components/DatePickerField.jsx`
  - `frontend/src/utils/formatCurrency.js`
  - `frontend/src/pages/RoomDetailPage.jsx`
  - `frontend/src/pages/BookingPage.jsx`
- **Important Functions**:
  - `formatCurrency(amount)`: Formats numbers into Indian Rupees using `en-IN` locale (`₹12,500`).
  - `calculateNights(checkIn, checkOut)`: Computes stay duration in days.
- **How Data Flows**:
  ```
  User changes check-in / check-out dates
    └─► calculateNights() updates nights state
          └─► roomSubtotal = pricePerNight * nights
                └─► gstTax = Math.round(roomSubtotal * 0.18)
                      └─► grandTotal = roomSubtotal + gstTax
                            └─► UI updates instantly in Indian Rupees (₹)
  ```
- **Why this approach was used**:
  Demonstrates dynamic client-side calculation with server-side validation to provide instant visual feedback while guaranteeing price integrity upon database insertion.

---

## 3. Viva Question & Answer Cheatsheet

### Q1: What architecture does StaySync follow?
> **Answer**: StaySync follows a Service-Oriented Architecture (SOA) structured around an API Gateway pattern. The Express API Gateway manages request routing, authentication, and role authorization before forwarding requests to modular microservices (`auth`, `room`, `booking`, `analytics`, etc.).

### Q2: How does the system handle real-time room availability without Redis?
> **Answer**: The backend executes an optimized relational SQL query with an index on `(check_in, check_out)`. It filters out any room that has an active booking overlapping with the requested date range using the formula `NOT (check_out <= requested_check_in OR check_in >= requested_check_out)`.

### Q3: How is RBAC implemented?
> **Answer**: Roles (`GUEST`, `RECEPTIONIST`, `MANAGER`, `HOUSEKEEPING`, `MAINTENANCE`, `RESTAURANT`) are encoded directly inside the signed JWT token payload. Backend endpoints use `requireRole(['MANAGER'])` middleware guards, and the frontend uses `ProtectedRoute.jsx` to prevent unauthorized route access.

### Q4: How does StaySync handle Indian currency formatting and GST?
> **Answer**: Currency is formatted using the `en-IN` locale helper `formatCurrency(amount)` to format numbers into Rupees (`₹12,500`, `₹1,25,000`). Room bookings automatically apply an itemized 18% GST tax matching luxury hotel regulations in India.
