# Ride-Sharing Backend

**Ride-Sharing Backend** is a robust RESTful API designed to power a ride-sharing platform. It provides comprehensive features for **user authentication, ride management, driver tracking, payments, ratings, notifications, and administrative monitoring**, supporting roles such as Rider, Driver, and Admin.  

The backend is built with **Node.js and Express**, featuring secure authentication with **JWT**, password hashing with **Argon2**, and structured, maintainable APIs for scalable applications.

---

## 🔹 Features Overview

### 1. Authentication & User Management
**Base URLs:** `/api/v1/auth`, `/api/v1/users`

**Auth APIs:**
- `POST /api/v1/auth/signup` – Register a new user (Rider/Driver) with name, email, password, and role.  
- `POST /api/v1/auth/login` – Login using email and password, returns JWT token.  
- `POST /api/v1/auth/logout` – Invalidate user session/token.  
- `POST /api/v1/auth/refresh` – Refresh JWT token before expiry.

**User APIs:**
- `GET /api/v1/users/me` – Retrieve the profile of the logged-in user.  
- `PUT /api/v1/users/me` – Update user profile (phone, photo, vehicle details for drivers).  
- `GET /api/v1/users/:id` – Retrieve user details by ID (**Admin only**).

---

### 2. Ride Booking & Management
**Base URL:** `/api/v1/rides`

- `POST /api/v1/rides/request` – Rider requests a ride with pickup and drop coordinates.  
- `GET /api/v1/rides/:id` – Get ride details (status: requested, accepted, ongoing, completed, cancelled).  
- `POST /api/v1/rides/:id/accept` – Driver accepts a ride request.  
- `POST /api/v1/rides/:id/start` – Driver starts the ride (pickup completed).  
- `POST /api/v1/rides/:id/complete` – Driver completes the ride; fare is calculated.  
- `POST /api/v1/rides/:id/cancel` – Cancel a ride (refund processed if applicable).  
- `GET /api/v1/rides/user/:userId` – Retrieve all rides of a specific user (ride history).

---

### 3. Driver Location & Matching
**Base URL:** `/api/v1/drivers`

- `POST /api/v1/drivers/:id/location` – Update driver’s live location.  
- `GET /api/v1/drivers/nearby?lat=..&lng=..` – Find nearby drivers within a defined radius.

---

### 4. Payment Service
**Base URL:** `/api/v1/payments`

- `POST /api/v1/payments/initiate` – Start payment for a ride (Stripe/Razorpay).  
- `POST /api/v1/payments/confirm` – Confirm payment after success from payment gateway.  
- `GET /api/v1/payments/history` – Retrieve user’s payment history, including completed and refunded transactions.

---

### 5. Ratings & Reviews
**Base URL:** `/api/v1/ratings`

- `POST /api/v1/ratings/ride/:rideId` – Rider rates a driver after a ride (stars + comments).  
- `GET /api/v1/ratings/driver/:id` – Fetch all reviews for a specific driver.  
- `GET /api/v1/ratings/rider/:id` – Fetch all reviews for a specific rider.

---

### 6. Notifications (Optional)
**Base URL:** `/api/v1/notifications`

- `POST /api/v1/notifications/send` – Send push or SMS notifications (e.g., “Ride Accepted”).  
- `GET /api/v1/notifications/user/:id` – Retrieve notification history for a user.

---

### 7. Administrative APIs
**Base URL:** `/api/v1/admin`

- `GET /api/v1/admin/users` – List all users (riders & drivers).  
- `GET /api/v1/admin/rides` – Monitor all rides.  
- `PATCH /api/v1/admin/users/block/:id` – Block fraudulent users or drivers.  
- `GET /api/v1/admin/payments` – Monitor all payments.  

**Bonus:** Admin can cancel rides not started by drivers today and process refunds automatically.

---

## 🔹 Database Schema

### Auth Table
| Column       | Type      | Description                        |
|--------------|----------|------------------------------------|
| id           | PK       | Primary key                        |
| username     | string   | User login name                     |
| email        | string   | Unique user email                   |
| password_hash| string   | Securely hashed password            |
| role         | enum     | rider \| driver \| admin            |
| created_at   | datetime | Record creation timestamp           |

### User Profile Table
| Column          | Type    | Description                         |
|-----------------|--------|-------------------------------------|
| id              | PK, FK | References Auth.id                   |
| full_name       | string | Full name of user                    |
| mobile          | string | Unique phone number                  |
| profile_picture | string | Profile image URL                    |
| lat, lng        | float  | Optional coordinates                  |
| created_at      | datetime | Record creation timestamp           |
| updated_at      | datetime | Last update timestamp               |

### Driver Table
| Column        | Type    | Description                       |
|---------------|--------|-----------------------------------|
| id            | PK, FK | References Auth.id                 |
| license_number| string | Driver license number              |
| vehicle_number| string | Vehicle registration number        |
| vehicle_type  | string | car, bike, auto, etc.             |
| photo         | string | Driver photo URL                   |
| driver_status | enum   | available \| on_trip \| offline   |
| lat, lng      | float  | Current driver location            |
| rating_avg    | float  | Average driver rating              |
| created_at    | datetime | Record creation timestamp         |

### Ride Requests Table
| Column         | Type      | Description                        |
|----------------|----------|------------------------------------|
| id             | PK       | Primary key                        |
| user_id        | FK       | References User.id                 |
| driver_id      | FK       | References Driver.id (nullable)   |
| pickup_lat,lng | float    | Pickup coordinates                  |
| drop_lat,lng   | float    | Drop coordinates                    |
| pickup_address | string   | Optional pickup address             |
| drop_address   | string   | Optional drop address               |
| requested_at   | datetime | Ride request timestamp              |
| status         | enum     | pending, accepted, cancelled, completed |
| payment_status | enum     | pending, paid, failed               |
| payment_value  | float    | Fare amount                         |

### Ratings & Reviews Table
| Column    | Type   | Description                              |
|-----------|-------|------------------------------------------|
| id        | PK    | Primary key                               |
| ride_id   | FK    | References Ride Requests.id               |
| user_id   | FK    | Reviewer (who gave rating)                |
| driver_id | FK    | Reviewee (driver who received rating)     |
| rating    | int   | 1–5 stars                                 |
| review    | text  | Optional text review                       |
| created_at| datetime | Timestamp of review                     |

---

## 🔹 Technology Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB
- **Authentication:** JWT, Argon2 password hashing  
- **Documentation:** Swagger (OpenAPI 3.0)  
- **Payment Integration:** Razorpay  

---

## 🔹 Base URLs

| Module          | Base URL                     |
|-----------------|------------------------------|
| Authentication  | `/api/v1/auth`               |
| Users           | `/api/v1/users`              |
| Ride Booking    | `/api/v1/rides`              |
| Drivers         | `/api/v1/drivers`            |
| Payments        | `/api/v1/payments`           |
| Ratings         | `/api/v1/ratings`            |
| Notifications   | `/api/v1/notifications`      |
| Admin           | `/api/v1/admin`              |
