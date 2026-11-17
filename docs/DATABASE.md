# StaySync Relational Database Schema Documentation

StaySync uses a clean relational schema compatible with **PostgreSQL** (and portable zero-config SQLite driver for local evaluation).

---

## Entity Relationship Schema Summary

```
+--------------------+        +--------------------+        +--------------------+
|       users        |        |       hotels       |        |     room_types     |
+--------------------+        +--------------------+        +--------------------+
| PK  id             |        | PK  id             |<-------| FK  hotel_id       |
|     name           |        |     name           |        | PK  id             |
| UNQ email          |        |     address        |        |     name           |
|     password_hash  |        |     rating         |        |     base_price     |
|     role (ENUM)    |        +--------------------+        |     max_occupancy  |
+--------------------+                                      +--------------------+
          │                                                           │
          │                                                           │
          │                   +--------------------+                  │
          └──────────────────>|      bookings      |                  │
                              +--------------------+                  │
                              | PK  id             |                  │
                              | UNQ reference      |                  │
                              | FK  user_id        |                  │
                              | FK  room_id        |<───────┐         │
                              |     check_in       |        │         │
                              |     check_out      |        │         │
                              |     total_price    |        │         │
                              |     status         |        │         │
                              +--------------------+        │         │
                                                            │         │
                              +--------------------+        │         │
                              |       rooms        |────────┘         │
                              +--------------------+                  │
                              | PK  id             |                  │
                              | FK  hotel_id       |                  │
                              | FK  room_type_id   |──────────────────┘
                              | UNQ room_number    |
                              |     status         |
                              +--------------------+
```

---

## Table Specs & Indexes

### 1. `users`
- Primary Key: `id` (VARCHAR 64)
- Unique Index: `idx_users_email` on `email`
- Role Constraints: `CHECK (role IN ('GUEST', 'RECEPTIONIST', 'MANAGER', 'HOUSEKEEPING', 'MAINTENANCE', 'RESTAURANT'))`

### 2. `rooms` & `room_types`
- Foreign Keys: `rooms.room_type_id` -> `room_types.id`, `rooms.hotel_id` -> `hotels.id`
- Status Constraints: `CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY'))`
- Index: `idx_rooms_status` on `status`

### 3. `bookings`
- Foreign Keys: `user_id` -> `users.id`, `room_id` -> `rooms.id`
- Status Constraints: `CHECK (status IN ('PENDING', 'HELD', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))`
- Critical Concurrency Index: `idx_bookings_dates` on `(check_in, check_out)` for fast real-time availability check queries.

### 4. `payments`
- Foreign Key: `user_id` -> `users.id`
- Unique Constraints: `transaction_id`, `idempotency_key`
