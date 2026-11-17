# StaySync – Intelligent & Scalable Hotel Management System
> **Major B.Tech Computer Engineering Capstone Project**  
> **Authors**: Kashish Jain & Harshita Sharma  
> **Institution**: Thapar Institute of Engineering & Technology (TIET), Patiala, Punjab, India  
> **Evaluation**: Academic Year 2026  

---

## 🏛️ Executive Summary & Product Vision

**StaySync** is an enterprise-grade, service-oriented hotel management platform engineered from scratch to solve real-world operational bottlenecks in hospitality operations. Unlike rudimentary hotel websites, StaySync implements an end-to-end guest and hotel lifecycle:

- **Multi-Property Discovery & Booking Engine**: Real-time room inventory management across flagship properties in Mumbai, Udaipur, and Goa with strict Indian Rupee (`₹ INR`) currency enforcement.
- **Distributed Concurrency Control**: Redis Redlock mutex locking with short-lived TTLs to prevent double-booking under high-concurrency race conditions.
- **Resilient Financial Transactions**: Idempotent payment processing supporting UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking with 18% Luxury GST tax invoicing.
- **Contactless Guest Operations**: Online check-in with simulated Aadhaar/Passport KYC verification, and dynamic QR/NFC digital room pass generation.
- **In-Stay Smart Amenities**: Real-time running folio aggregator, interactive simulated IoT room controls (thermostat, lighting moods, TV power, DND toggle), and in-room F&B dining orders.
- **Departmental Workflows**: Dedicated role-based portals for Receptionists, Housekeeping staff, Engineering Maintenance technicians, and Kitchen F&B staff.
- **Machine Intelligence**: Aspect-based sentiment analysis on guest reviews (cleanliness, dining, room comfort, staff courtesies, Wi-Fi), rule-based Smart Concierge chatbot, and dynamic surge pricing algorithms.
- **Automated Settlement & Turnover**: One-click express checkout that settles folios, revokes digital keys, automatically dispatches urgent turnover tasks to Housekeeping, and credits guest loyalty points.

---

## 🎨 Strict Light Luxury Design System

StaySync is built with an uncompromising **Light Luxury aesthetic** tailored for premium Indian hospitality. It contains zero dark-mode surfaces, pitch-black canvases, or neon gradients:

| Element | Hex Code | Visual Identity |
| :--- | :--- | :--- |
| **Primary Background** | `#FAF9F6` | Warm Ivory |
| **Secondary Background** | `#F4F0E8` | Soft Cream |
| **Cards & Surfaces** | `#FFFFFF` | Pure White with subtle drop shadow |
| **Primary Accent** | `#5B6A53` / `#A8B5A0` | Muted Sage Green |
| **Secondary Accent** | `#8C754E` / `#D8C7A9` | Champagne Beige |
| **Highlight Canvas** | `#E8DDCC` | Soft Sand |
| **Primary Typography** | `#343B36` | Deep Charcoal |
| **Secondary Typography** | `#85877F` | Warm Grey |
| **Borders & Dividers** | `#E8E4DC` | Light Beige |
| **Available Status** | `#4D734B` / `#EBF2EA` | Soft Sage Tint |
| **Occupied Status** | `#C98176` / `#F7EBE8` | Muted Terracotta |
| **Pending Status** | `#B58A38` / `#F9F3E5` | Muted Amber |

---

## 🔑 Demonstration Accounts (Role-Based Access Control)

StaySync implements 6 distinct role-based portals with granular JWT claims. Evaluators can seamlessly switch accounts using the **1-Click Evaluator Bar** pinned to the top of every page or through the login console:

| Role | Demo Email | Password | Dedicated Portal Route | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Guest** | `guest@staysync.com` | `StaySync@2026` | `/dashboard/guest` | Suite discovery, bookings, KYC check-in, NFC key, IoT controls, in-stay dining & spa, GST invoices |
| **Receptionist** | `reception@staysync.com` | `StaySync@2026` | `/dashboard/reception` | Front desk guest roster, walk-in reservations, physical room floor matrix, express check-out |
| **Manager / Admin** | `manager@staysync.com` | `StaySync@2026` | `/dashboard/manager` | Executive KPI dashboard (RevPAR, ADR, Occupancy), 7-day revenue velocity, sentiment breakdown, CSV audit export |
| **Housekeeping** | `housekeeping@staysync.com` | `StaySync@2026` | `/dashboard/housekeeping` | Cleaning turnover queue, priority sorting, inspection workflow, live DND sync |
| **Maintenance** | `maintenance@staysync.com` | `StaySync@2026` | `/dashboard/maintenance` | Engineering work order queue, ticket logging, technician dispatch, resolution notes |
| **F&B Restaurant** | `service@staysync.com` | `StaySync@2026` | `/dashboard/restaurant` | In-stay kitchen dining display, preparation tracking, room folio charge verification |

---

## 🏗️ System Architecture & Engineering Blueprint

StaySync adopts a modular Service-Oriented Architecture (SOA) designed to run seamlessly on local evaluator machines while adhering to distributed-system best practices:

```
[ Web Client: React 18 + Vite + Pure CSS Light Luxury System ]
                           │
                           ▼ HTTPS / REST APIs + JWT Bearer Tokens
[ API Gateway & RBAC Security Middleware (Express.js on Port 5000) ]
                           │
 ┌─────────────────────────┼─────────────────────────┬─────────────────────────┐
 ▼                         ▼                         ▼                         ▼
[ Auth & User Mgmt ]  [ Room & Inventory ]      [ Distributed Lock ]       [ Booking Engine ]
 - Bcrypt Hashing      - Real-Time SQL Query     - Redlock Mutex (5m TTL)   - Overlap Collision Check
 - 6-Role Hierarchy    - Dynamic Rate Rules      - Race-Condition Safety    - Running Folio Aggregator
 ├─────────────────────────┼─────────────────────────┼─────────────────────────┤
 ▼                         ▼                         ▼                         ▼
[ Automated Check-In ] [ Simulated IoT Room ]    [ Resilient Payment ]      [ In-Stay Operations ]
 - KYC Doc Verification- AC / Mood Lights / TV   - Idempotent API Keys      - Housekeeping Matrix
 - QR / NFC Key Pass   - Live DND Status Sync    - Auto GST Calculation     - Maintenance Queue
 ├─────────────────────────┼─────────────────────────┼─────────────────────────┤
 ▼                         ▼                         ▼                         ▼
[ F&B Dining Orders ]  [ NLP Review Sentiment ]  [ Loyalty & Rewards ]     [ Executive Analytics ]
 - Kitchen Workflow    - Aspect Tag Extraction   - 4-Tier Rewards Club      - ADR, RevPAR, Occupancy
 - Room Folio Charging - Star Rating Analysis    - Points Accrual/Redeem    - CSV Audit Export
 └─────────────────────────┴─────────────┬───────────┴─────────────────────────┘
                                         ▼
                 [ Dual-Driver Persistence: SQLite / PostgreSQL ]
                     20 Normalized Relational Tables + ACID Indexes
```

---

## 💾 Relational Data Model (20 Tables)

StaySync's database engine is fully normalized (3NF) and indexed:

1. `users`: Credentials, role claim, phone, created timestamp.
2. `hotels`: Luxury property registry (Mumbai, Udaipur, Goa), star rating, state, amenities.
3. `room_types`: Suite tiers (Deluxe, Executive, Heritage, Villa, Penthouse) with base INR pricing.
4. `rooms`: Physical room inventory (number, floor, status: `AVAILABLE`, `OCCUPIED`, `DIRTY`, `MAINTENANCE`, `dnd_enabled`).
5. `amenities`: Catalog of 18+ luxury amenities with category tags and Lucide icons.
6. `room_amenities`: Many-to-many junction joining suites to amenities.
7. `bookings`: Reservation records with date overlap constraints, guest count, and total INR price.
8. `room_locks`: Distributed concurrency lock table recording active holds with expiry timestamps.
9. `payments`: Transaction journal with idempotency keys, payment methods, and bank reference numbers.
10. `checkins`: Online check-in records containing KYC document types and arrival times.
11. `digital_keys`: Digital QR/NFC key registry with active status and automatic revocation timestamp.
12. `service_requests`: Unified in-stay guest service orders (dining, spa, laundry, turndown).
13. `housekeeping_tasks`: Cleaning turnover queue with priorities (`URGENT`, `HIGH`, `NORMAL`) and statuses.
14. `maintenance_tickets`: Engineering work orders with technician assignment and resolution notes.
15. `restaurant_orders`: In-stay kitchen dining tickets with JSON item breakdowns and folio posting flags.
16. `reviews`: Guest reviews with overall star ratings and aspect-level scores.
17. `loyalty_accounts`: 4-tier loyalty program balances (`SILVER`, `GOLD`, `PLATINUM`, `DIAMOND`).
18. `loyalty_transactions`: Points ledger tracking points earned from stays and redeemed for discounts.
19. `pricing_rules`: Dynamic surge pricing multipliers based on occupancy thresholds and weekend periods.
20. `audit_logs`: Immutable security ledger tracking staff actions and check-out transactions.

---

## ⚡ Concurrency & Distributed Lock Verification

StaySync prevents catastrophic double-booking race conditions when multiple guests attempt to book the same suite simultaneously:
1. When a room detail page is opened, the client attempts to acquire a short-lived **Redis Mutex Lock** with a 5-minute TTL (`getRoomLockStatus`).
2. When creating a reservation, `createBooking` executes:
   ```sql
   SELECT b.id FROM bookings b
   WHERE b.room_id = ?
     AND b.status IN ('CONFIRMED', 'HELD')
     AND NOT (b.check_out <= ? OR b.check_in >= ?)
   ```
3. If an overlapping stay exists or another user holds the lock, the transaction immediately fails with HTTP `409 Conflict`, guaranteeing zero double-bookings.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm run seed      # Initializes staysync_dev.db with 20 tables & luxury seed data
npm start         # Launches API Gateway on http://localhost:5000
```
Health Check: `http://localhost:5000/api/health`

### 2. Start the Frontend React Client
```bash
cd frontend
npm install
npm run dev       # Launches Vite dev server on http://localhost:3000
```
Open your browser at: `http://localhost:3000`

### 3. Run Automated End-to-End Test Suite
To verify all 11 core workflows programmatically:
```bash
node "C:\Users\KASHISH JAIN\.gemini\antigravity\brain\62c085fa-7e29-4739-b155-cf518c76d308\scratch\e2e_verification.js"
```
Output:
```
====================================================
   StaySync Full-Stack Capstone End-to-End Test Suite
====================================================
1. System Gateway Health Check: [PASS]
2. RBAC Authentication (6 Roles): [PASS]
3. Multi-Property & Room Discovery: [PASS]
4. Booking & Idempotency Guarantee: [PASS]
5. Automated KYC Check-In & Digital NFC Key: [PASS]
6. In-Stay F&B Dining & Running Folio Sync: [PASS]
7. Express Automated Checkout & Turnover Dispatch: [PASS]
8. Housekeeping Matrix Operations & Room Release: [PASS]
9. Aspect-Based Review NLP Sentiment Classification: [PASS]
10. Guest Loyalty Rewards Balance: [PASS]
11. Executive Analytics & Dynamic Pricing: [PASS]
====================================================
   Verification Summary: 25 PASSED, 0 FAILED
====================================================
```

---

## 📜 Academic Capstone Certification
This project was conceptualized, designed, and developed by **Kashish Jain** & **Harshita Sharma** as a major capstone project in the Department of Computer Science and Engineering at Thapar Institute of Engineering & Technology, Patiala.
