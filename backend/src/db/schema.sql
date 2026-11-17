-- StaySync Complete Distributed Hotel Management Database Schema
-- Dual-Engine Compatible: PostgreSQL & SQLite

-- 1. Users Table (RBAC Accounts)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('GUEST', 'RECEPTIONIST', 'MANAGER', 'HOUSEKEEPING', 'MAINTENANCE', 'RESTAURANT')),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    rating NUMERIC(3, 2) DEFAULT 4.9,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Room Types Table (Categories & Base Rates in INR)
CREATE TABLE IF NOT EXISTS room_types (
    id VARCHAR(64) PRIMARY KEY,
    hotel_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price_per_night DECIMAL(10, 2) NOT NULL,
    max_occupancy INT NOT NULL DEFAULT 2,
    bed_type VARCHAR(50) DEFAULT 'King Bed',
    room_size_sqm INT DEFAULT 45,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- 4. Rooms Table (Physical Units)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    hotel_id VARCHAR(64) NOT NULL,
    room_type_id VARCHAR(64) NOT NULL,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    floor INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY')),
    dnd_enabled INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

-- 5. Amenities Table
CREATE TABLE IF NOT EXISTS amenities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'GENERAL',
    icon VARCHAR(50) DEFAULT 'sparkles',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Room Amenities Junction Table
CREATE TABLE IF NOT EXISTS room_amenities (
    room_type_id VARCHAR(64) NOT NULL,
    amenity_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (room_type_id, amenity_id),
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- 7. Bookings Table (Lifecycle: HELD -> CONFIRMED -> COMPLETED / CANCELLED)
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    room_id VARCHAR(64) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_guests INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'HELD', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 8. Room Concurrency Locks Table (Database-backed Redlock alternative)
CREATE TABLE IF NOT EXISTS room_locks (
    lock_key VARCHAR(120) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Payments Table (Idempotent Razorpay Payment Engine)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT 'RAZORPAY',
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED')),
    transaction_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature TEXT,
    error_code VARCHAR(50),
    error_description TEXT,
    refund_id VARCHAR(100),
    refund_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Check-Ins Table (Online Check-in & KYC Document Verification)
CREATE TABLE IF NOT EXISTS checkins (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    guest_id VARCHAR(64) NOT NULL,
    document_type VARCHAR(50) DEFAULT 'PASSPORT',
    document_number VARCHAR(100) NOT NULL,
    arrival_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'VERIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Digital Keys Table (Simulated QR & NFC Key Passes)
CREATE TABLE IF NOT EXISTS digital_keys (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    room_id VARCHAR(64) NOT NULL,
    key_token VARCHAR(100) NOT NULL,
    qr_payload TEXT NOT NULL,
    is_active INT DEFAULT 1,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 12. Service Requests Table (In-Stay Guest Services)
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64),
    room_number VARCHAR(20) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('ROOM_SERVICE', 'HOUSEKEEPING', 'LAUNDRY', 'SPA', 'RESTAURANT', 'MAINTENANCE')),
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
    cost DECIMAL(10, 2) DEFAULT 0.00,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Housekeeping Tasks Table
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    task_type VARCHAR(50) DEFAULT 'CHECKOUT_CLEAN' CHECK (task_type IN ('CHECKOUT_CLEAN', 'DAILY_TURNDOWN', 'EXPRESS_CLEAN')),
    priority VARCHAR(50) DEFAULT 'NORMAL' CHECK (priority IN ('HIGH', 'NORMAL', 'LOW')),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'INSPECTED', 'CLEAN')),
    assigned_to VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 14. Maintenance Tickets Table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    issue_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    technician VARCHAR(100),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 15. Restaurant & Dining Orders Table
CREATE TABLE IF NOT EXISTS restaurant_orders (
    id VARCHAR(64) PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    guest_id VARCHAR(64) NOT NULL,
    items_json TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED')),
    billed_to_room INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. Reviews & Aspect Sentiment Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    hotel_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64),
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    overall_sentiment VARCHAR(20) DEFAULT 'POSITIVE' CHECK (overall_sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
    comment TEXT,
    cleanliness_rating INT DEFAULT 5,
    food_rating INT DEFAULT 5,
    room_rating INT DEFAULT 5,
    staff_rating INT DEFAULT 5,
    wifi_rating INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. Loyalty Accounts Table
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    user_id VARCHAR(64) PRIMARY KEY,
    points_balance INT DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'SILVER' CHECK (tier IN ('SILVER', 'GOLD', 'PLATINUM')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. Loyalty Transactions Table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64),
    points INT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('EARNED', 'REDEEMED')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. Dynamic Pricing Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id VARCHAR(64) PRIMARY KEY,
    hotel_id VARCHAR(64) NOT NULL,
    base_multiplier DECIMAL(3, 2) DEFAULT 1.00,
    weekend_surge DECIMAL(3, 2) DEFAULT 1.15,
    occupancy_surge DECIMAL(3, 2) DEFAULT 1.25,
    seasonal_surge DECIMAL(3, 2) DEFAULT 1.10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- 20. Audit Logs Table (Administrative Traceability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & concurrency safety
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_service_booking ON service_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_hk_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mnt_status ON maintenance_tickets(status);
