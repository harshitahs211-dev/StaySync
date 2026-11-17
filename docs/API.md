# StaySync REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Service (`/api/auth`)

### `POST /api/auth/register`
Registers a new user account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password@123",
    "role": "GUEST",
    "phone": "+1-555-0199"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "usr_abc123", "name": "Jane Doe", "email": "jane@example.com", "role": "GUEST" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing user credentials and returns JWT token.
- **Request Body**:
  ```json
  {
    "email": "guest@staysync.com",
    "password": "StaySync@2026"
  }
  ```

### `GET /api/auth/me`
*Requires `Authorization: Bearer <token>`*
Returns currently authenticated user profile.

---

## 2. Room & Inventory Service (`/api/rooms`)

### `GET /api/rooms`
Returns complete catalog of all physical rooms and their associated suite types.

### `GET /api/rooms/available`
Real-time database availability check. Filters out rooms with overlapping active bookings for the specified date range.
- **Query Parameters**:
  - `checkIn` (Required, YYYY-MM-DD): e.g. `2026-09-01`
  - `checkOut` (Required, YYYY-MM-DD): e.g. `2026-09-05`
  - `guests` (Optional, integer): Minimum guest capacity filter
  - `roomTypeId` (Optional, string): Filter by specific suite type ID
  - `maxPrice` (Optional, number): Maximum price filter

### `GET /api/rooms/:id`
Returns detailed room information, amenities list, and hotel specs.

---

## 3. Booking Service (`/api/bookings`)

### `POST /api/bookings`
*Requires `Authorization: Bearer <token>`*
Creates a new room reservation. Performs date range sanity checks, guest capacity validation, and overlap checks.
- **Request Body**:
  ```json
  {
    "roomId": "rm_201",
    "checkIn": "2026-09-01",
    "checkOut": "2026-09-05",
    "totalGuests": 2,
    "specialRequests": "Ocean view balcony"
  }
  ```

### `GET /api/bookings`
*Requires `Authorization: Bearer <token>`*
Returns bookings. Guests receive only their own reservations; Staff/Manager roles receive the full hotel master roster.

### `PUT /api/bookings/:id/cancel`
*Requires `Authorization: Bearer <token>`*
Cancels a reservation and updates payment status to `REFUNDED`.

---

## 4. Manager & Staff Operational Services

- `GET /api/analytics/dashboard` -> *(Manager Role)* Occupancy rate %, revenue analytics, dynamic pricing multiplier.
- `GET /api/housekeeping/tasks` -> *(Housekeeping/Manager)* Room cleaning task queue.
- `GET /api/maintenance/tickets` -> *(Maintenance/Manager)* Support ticket queue.
- `GET /api/restaurant/orders` -> *(Restaurant/Manager)* Room service order dispatch.
- `POST /api/checkin/digital-key` -> Digital NFC room key issuance token.
