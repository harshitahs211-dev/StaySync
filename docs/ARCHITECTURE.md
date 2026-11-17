# StaySync Architecture & System Design Specification

StaySync is an intelligent, scalable hotel management system designed around a Service-Oriented Architecture (SOA) and API Gateway Pattern.

---

## 🏛️ System Architecture Diagram

```
                     ┌──────────────────────────────────────────┐
                     │          React 18 Single Page App        │
                     │          (Vite + Glassmorphism UI)       │
                     └────────────────────┬─────────────────────┘
                                          │  HTTP / REST (JSON)
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │         Express API Gateway (Port 5000)  │
                     │   (CORS, Auth Guard, JWT, Request Log)   │
                     └──────┬──────────────┬──────────────┬─────┘
                            │              │              │
        ┌───────────────────┴──┐   ┌───────┴──────┐   ┌───┴───────────────────┐
        │ Redis Concurrency    │   │ Async Event  │   │  Microservice Routes  │
        │ Lock Manager         │   │ Broker Engine│   │  - Auth & RBAC        │
        │ (Atomic Room Locks)  │   │ (Kafka/MQ)   │   │  - Room Inventory     │
        └──────────────────────┘   └───────┬──────┘   │  - Booking Engine     │
                                           │          │  - Idempotent Payment │
                                           ▼          │  - Online Check-in    │
                                 ┌─────────────────┐  │  - AI Recommendation  │
                                 │ Notification    │  │  - Sentiment Analyzer │
                                 │ Worker          │  │  - Executive Analytics│
                                 └─────────────────┘  └───────────┬───────────┘
                                                                  │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │  Relational Database  │
                                                      │  PostgreSQL / SQLite  │
                                                      └───────────────────────┘
```

---

## 🔑 Core Microservices

1. **API Gateway (`server.js`)**: Entry point managing CORS, authentication, RBAC, and service routing.
2. **Redis Concurrency Lock Manager (`redisLock.js`)**: Prevents room double-booking under high concurrent load with short-lived locks (`SET room_lock:rm_201:dates user_id NX PX 300000`) and query result caching.
3. **Event Broker (`eventBroker.js`)**: Asynchronous pub/sub event engine broadcasting domain topics (`staysync.booking.created`, `staysync.payment.success`) to background notification workers.
4. **Idempotent Payment Gateway (`paymentRoutes.js`)**: Payment processing with `idempotency_key` verification to prevent duplicate charges.
5. **Digital NFC Room Key Service (`checkinRoutes.js`)**: Identity verification, digital NFC room key pass generation, and door lock access validation.
6. **AI Recommendations & Sentiment Engine (`recommendationRoutes.js`)**: Preference vector matching and NLP sentiment analysis on guest reviews.
