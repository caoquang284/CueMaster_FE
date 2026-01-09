# CueMaster API

Billiard Management System MVP API Documentation

**Version:** 0.0.1

## Servers

- **Development**: `http://localhost:3000`
- **Production**: `https://api.cuemaster.local`

## Authentication

This API uses **Bearer Token (JWT)** authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## App

### GET /

#### Responses

**200** - 

---

### GET /test-email

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `email` | query | string | ✅ | - |

#### Responses

**200** - 

---

### GET /test-email/pending

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `email` | query | string | ✅ | - |

#### Responses

**200** - 

---

### GET /test-email/confirmed

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `email` | query | string | ✅ | - |

#### Responses

**200** - 

---

### GET /test-email/cancelled

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `email` | query | string | ✅ | - |

#### Responses

**200** - 

---

### GET /test-email/reminder

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `email` | query | string | ✅ | - |

#### Responses

**200** - 

---

## Auth

Authentication endpoints

### POST /auth/register

**Register a new user**

#### Request Body

```json
{
  "email": "john.doe@cuemaster.com",
  "password": "mySecurePass123",
  "name": "John Doe"
}
```

#### Responses

**201** - User successfully registered

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGN1ZW1hc3Rlci5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3MDM2ODUyMDAsImV4cCI6MTcwMzc3MTYwMH0.abc123xyz",
  "user": null
}
```

**400** - Invalid input data

**409** - User with this email already exists

---

### POST /auth/login

**Login user**

#### Request Body

```json
{
  "email": "admin@cuemaster.com",
  "password": "123456"
}
```

#### Responses

**200** - User successfully logged in

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGN1ZW1hc3Rlci5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3MDM2ODUyMDAsImV4cCI6MTcwMzc3MTYwMH0.abc123xyz",
  "user": null
}
```

**400** - Invalid input data

**401** - Invalid email or password

---

### GET /auth/me

**Get current user profile**

🔒 **Authentication Required**

#### Responses

**200** - User profile retrieved successfully

**401** - Unauthorized - Invalid or missing token

---

## Users

User management endpoints

### GET /users

**Get all users (ADMIN only)**

🔒 **Authentication Required**

#### Responses

**200** - List of all users

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@cuemaster.com",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2025-12-27T10:30:00Z",
    "updatedAt": "2025-12-27T10:30:00Z"
  }
]
```

**403** - Forbidden

---

### POST /users

**Create new user (ADMIN only)**

🔒 **Authentication Required**

#### Request Body

```json
{
  "email": "staff@cuemaster.com",
  "password": "securePass123",
  "role": "STAFF"
}
```

#### Responses

**201** - User created successfully

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**403** - Forbidden

**409** - Email already exists

---

### GET /users/me

**Get my profile**

🔒 **Authentication Required**

#### Responses

**200** - Current user profile

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**401** - Unauthorized

---

### PATCH /users/me

**Update my profile**

🔒 **Authentication Required**

#### Request Body

```json
{
  "email": "newemail@cuemaster.com",
  "password": "newPassword123",
  "isActive": true
}
```

#### Responses

**200** - Profile updated successfully

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Bad request

**401** - Unauthorized

---

### GET /users/{id}

**Get user by ID (ADMIN only)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | User ID |

#### Responses

**200** - User details

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**403** - Forbidden

**404** - User not found

---

### PATCH /users/{id}

**Update user (ADMIN only)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | User ID |

#### Request Body

```json
{
  "email": "newemail@cuemaster.com",
  "password": "newPassword123",
  "isActive": true
}
```

#### Responses

**200** - User updated successfully

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**403** - Forbidden

**404** - User not found

---

### PATCH /users/{id}/role

**Update user role (ADMIN only)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | User ID |

#### Request Body

```json
{
  "role": "STAFF"
}
```

#### Responses

**200** - User role updated successfully

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**403** - Forbidden - Cannot remove own ADMIN role

**404** - User not found

---

### PATCH /users/{id}/deactivate

**Deactivate user (ADMIN only)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | User ID |

#### Responses

**200** - User deactivated successfully

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@cuemaster.com",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-12-27T10:30:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**403** - Forbidden - Cannot deactivate own account

**404** - User not found

---

## Tables

Billiard table endpoints

### GET /tables

**Get all tables with optional filters**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `type` | query | string | ❌ | Filter by table type |
| `status` | query | string | ❌ | Filter by table status |

#### Responses

**200** - List of tables retrieved successfully

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": "T001",
    "type": "POOL",
    "status": "IDLE",
    "priceHour": 50000,
    "startedAt": "2025-12-27T10:30:00Z",
    "endedAt": "2025-12-27T12:30:00Z",
    "createdAt": "2025-12-27T08:00:00Z",
    "updatedAt": "2025-12-27T10:30:00Z"
  }
]
```

---

### POST /tables

**Create a new table (ADMIN only)**

🔒 **Authentication Required**

#### Request Body

```json
{
  "code": "T001",
  "type": "POOL",
  "priceHour": 50000
}
```

#### Responses

**201** - Table created successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "T001",
  "type": "POOL",
  "status": "IDLE",
  "priceHour": 50000,
  "startedAt": "2025-12-27T10:30:00Z",
  "endedAt": "2025-12-27T12:30:00Z",
  "createdAt": "2025-12-27T08:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**403** - Forbidden - Admin only

**409** - Table code already exists

---

### GET /tables/{id}

**Get a single table by ID**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Responses

**200** - Table retrieved successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "T001",
  "type": "POOL",
  "status": "IDLE",
  "priceHour": 50000,
  "startedAt": "2025-12-27T10:30:00Z",
  "endedAt": "2025-12-27T12:30:00Z",
  "createdAt": "2025-12-27T08:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**404** - Table not found

---

### PATCH /tables/{id}/status

**Update table status (STAFF, ADMIN)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Request Body

```json
{
  "status": "PLAYING"
}
```

#### Responses

**200** - Table status updated successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "T001",
  "type": "POOL",
  "status": "IDLE",
  "priceHour": 50000,
  "startedAt": "2025-12-27T10:30:00Z",
  "endedAt": "2025-12-27T12:30:00Z",
  "createdAt": "2025-12-27T08:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Invalid status transition

**403** - Forbidden - Staff or Admin only

**404** - Table not found

---

### PATCH /tables/{id}/start

**Start playing on a table (STAFF, ADMIN)**

Sets startedAt and changes status to PLAYING. Table must be IDLE.

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Responses

**200** - Table started successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "T001",
  "type": "POOL",
  "status": "IDLE",
  "priceHour": 50000,
  "startedAt": "2025-12-27T10:30:00Z",
  "endedAt": "2025-12-27T12:30:00Z",
  "createdAt": "2025-12-27T08:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Cannot start - table is not IDLE

**403** - Forbidden - Staff or Admin only

**404** - Table not found

---

### PATCH /tables/{id}/end

**End playing on a table (STAFF, ADMIN)**

Sets endedAt, calculates duration and cost, changes status to IDLE. Table must be PLAYING.

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Responses

**200** - Table ended successfully with duration and cost

```json
null
```

**400** - Cannot end - table is not PLAYING

**403** - Forbidden - Staff or Admin only

**404** - Table not found

---

## Notifications

Notification endpoints

### GET /notifications/my

**Get my notifications (CUSTOMER, STAFF, ADMIN)**

Returns all notifications for the authenticated user

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `isRead` | query | boolean | ❌ | Filter by read status |

#### Responses

**200** - Notifications retrieved successfully

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "123e4567-e89b-12d3-a456-426614174001",
    "title": "Booking Confirmed",
    "content": "Your booking has been confirmed",
    "type": "BOOKING",
    "isRead": false,
    "createdAt": "2026-01-02T10:30:00.000Z"
  }
]
```

---

### GET /notifications/my/unread-count

**Get unread notification count (CUSTOMER, STAFF, ADMIN)**

🔒 **Authentication Required**

#### Responses

**200** - Unread count retrieved successfully

```json
{
  "count": 5
}
```

---

### POST /notifications

**Create and send a notification (ADMIN, STAFF)**

Sends a notification to a specific user and saves it to database

🔒 **Authentication Required**

#### Request Body

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Booking Confirmed",
  "content": "Your booking for Table A1 has been confirmed for 2026-01-03 at 14:00",
  "type": "BOOKING"
}
```

#### Responses

**201** - Notification created and sent successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "title": "Booking Confirmed",
  "content": "Your booking has been confirmed",
  "type": "BOOKING",
  "isRead": false,
  "createdAt": "2026-01-02T10:30:00.000Z"
}
```

---

### PATCH /notifications/{id}/read

**Mark a notification as read (CUSTOMER, STAFF, ADMIN)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Responses

**200** - Notification marked as read

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "title": "Booking Confirmed",
  "content": "Your booking has been confirmed",
  "type": "BOOKING",
  "isRead": false,
  "createdAt": "2026-01-02T10:30:00.000Z"
}
```

**404** - Notification not found

---

### PATCH /notifications/read/multiple

**Mark multiple notifications as read (CUSTOMER, STAFF, ADMIN)**

🔒 **Authentication Required**

#### Request Body

```json
{
  "notificationIds": [
    "123e4567-e89b-12d3-a456-426614174000"
  ]
}
```

#### Responses

**200** - Notifications marked as read

```json
{
  "count": 3
}
```

---

### PATCH /notifications/read/all

**Mark all notifications as read (CUSTOMER, STAFF, ADMIN)**

🔒 **Authentication Required**

#### Responses

**200** - All notifications marked as read

```json
{
  "count": 10
}
```

---

## Bookings

Booking management endpoints

### GET /bookings

**Get all bookings**

🔒 **Authentication Required**

#### Responses

**200** - List of all bookings

---

### POST /bookings

**Create a new booking (authenticated users)**

🔒 **Authentication Required**

#### Request Body

```json
{
  "tableId": "123e4567-e89b-12d3-a456-426614174000",
  "startTime": "2025-12-27T10:00:00Z",
  "endTime": "2025-12-27T12:00:00Z",
  "notes": "Please prepare the table with cues",
  "guestName": "Nguyễn Văn A",
  "guestEmail": "guest@example.com",
  "guestPhone": "+84123456789"
}
```

#### Responses

**201** - Booking created successfully

**400** - Invalid input or table not available

---

### GET /bookings/pending/count

**Get pending bookings count**

🔒 **Authentication Required**

#### Responses

**200** - Number of pending bookings

```json
{
  "count": 5
}
```

---

### GET /bookings/timeline

**Get timeline view of bookings for a specific date**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `date` | query | string | ❌ | Date in YYYY-MM-DD format. Defaults to today. |

#### Responses

**200** - Timeline data with all tables and their bookings

---

### GET /bookings/{id}

**Get booking by ID**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Booking ID |

#### Responses

**200** - Booking details

**404** - Booking not found

---

### PUT /bookings/{id}

**Update a booking**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Booking ID |

#### Request Body

```json
{
  "startTime": "2025-12-27T10:00:00Z",
  "endTime": "2025-12-27T12:00:00Z",
  "totalPrice": 100000,
  "status": "CONFIRMED"
}
```

#### Responses

**200** - Booking updated successfully

**404** - Booking not found

---

### DELETE /bookings/{id}

**Delete a booking**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Booking ID |

#### Responses

**200** - Booking deleted

**404** - Booking not found

---

### GET /bookings/user/{userId}

**Get bookings by user ID**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `userId` | path | string | ✅ | User ID |

#### Responses

**200** - List of user bookings

---

### POST /bookings/public

**Create a booking as guest (no login required)**

#### Request Body

```json
{
  "tableId": "123e4567-e89b-12d3-a456-426614174000",
  "startTime": "2025-12-27T10:00:00Z",
  "endTime": "2025-12-27T12:00:00Z",
  "notes": "Please prepare the table with cues",
  "guestName": "Nguyễn Văn A",
  "guestEmail": "guest@example.com",
  "guestPhone": "+84123456789"
}
```

#### Responses

**201** - Booking created successfully

**400** - Invalid input or table not available

---

### PUT /bookings/{id}/confirm

**Confirm a booking**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Booking ID |

#### Responses

**200** - Booking confirmed

**400** - Cannot confirm booking

---

### PATCH /bookings/{id}/complete

**Complete a booking**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Booking ID |

#### Responses

**200** - Booking completed

**400** - Cannot complete booking

---

### PUT /bookings/{id}/cancel

**Cancel a booking**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Booking ID |

#### Responses

**200** - Booking cancelled

**400** - Cannot cancel booking

---

## Menu

Menu items endpoints

### GET /menu

**Get all menu items**

#### Responses

**200** - List of all available menu items

---

### POST /menu

**Create a new menu item**

🔒 **Authentication Required**

#### Request Body

```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce, mozzarella, and basil",
  "price": 15.99,
  "category": "Pizza",
  "image": "https://example.com/pizza.jpg"
}
```

#### Responses

**201** - Menu item created successfully

**401** - Unauthorized

**403** - Forbidden - Admin or Staff role required

---

### GET /menu/category/{category}

**Get menu items by category**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `category` | path | string | ✅ | Menu category |

#### Responses

**200** - List of menu items in the specified category

---

### GET /menu/{id}

**Get menu item by ID**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Menu item ID |

#### Responses

**200** - Menu item details

**404** - Menu item not found

---

### PUT /menu/{id}

**Update a menu item**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Menu item ID |

#### Request Body

```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce, mozzarella, and basil",
  "price": 15.99,
  "category": "Pizza",
  "image": "https://example.com/pizza.jpg",
  "isAvailable": true
}
```

#### Responses

**200** - Menu item updated successfully

**401** - Unauthorized

**403** - Forbidden - Admin or Staff role required

**404** - Menu item not found

---

### DELETE /menu/{id}

**Delete a menu item**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | Menu item ID |

#### Responses

**200** - Menu item deleted successfully

**401** - Unauthorized

**403** - Forbidden - Admin role required

**404** - Menu item not found

---

## Orders

Order management endpoints

### GET /orders

**Get all orders with optional filters (STAFF, ADMIN)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `tableId` | query | string | ❌ | Filter by table ID |
| `status` | query | string | ❌ | Filter by order status |

#### Responses

**200** - List of orders retrieved successfully

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "tableId": "123e4567-e89b-12d3-a456-426614174001",
    "tableCode": "T001",
    "bookingId": "123e4567-e89b-12d3-a456-426614174002",
    "status": "OPEN",
    "total": 150000,
    "items": [
      "..."
    ],
    "createdAt": "2025-12-27T10:00:00Z",
    "updatedAt": "2025-12-27T10:30:00Z"
  }
]
```

---

### POST /orders

**Create a new order (STAFF, ADMIN)**

Creates an order for a table that is currently PLAYING. Booking is optional.

🔒 **Authentication Required**

#### Request Body

```json
{
  "tableId": "123e4567-e89b-12d3-a456-426614174000",
  "bookingId": "123e4567-e89b-12d3-a456-426614174001"
}
```

#### Responses

**201** - Order created successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tableId": "123e4567-e89b-12d3-a456-426614174001",
  "tableCode": "T001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "status": "OPEN",
  "total": 150000,
  "items": [
    "..."
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Table is not PLAYING or validation error

**404** - Table or booking not found

**409** - Table already has an open order

---

### GET /orders/{id}

**Get order by ID (STAFF, ADMIN)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Responses

**200** - Order retrieved successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tableId": "123e4567-e89b-12d3-a456-426614174001",
  "tableCode": "T001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "status": "OPEN",
  "total": 150000,
  "items": [
    "..."
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**404** - Order not found

---

### POST /orders/{id}/items

**Add item to order (STAFF, ADMIN)**

Adds a menu item to an open order and updates total

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Request Body

```json
{
  "menuItemId": "123e4567-e89b-12d3-a456-426614174002",
  "quantity": 2
}
```

#### Responses

**200** - Item added successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tableId": "123e4567-e89b-12d3-a456-426614174001",
  "tableCode": "T001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "status": "OPEN",
  "total": 150000,
  "items": [
    "..."
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Order is not OPEN or menu item not available

**404** - Order or menu item not found

---

### PATCH /orders/{id}/items/{itemId}

**Update order item quantity (STAFF, ADMIN)**

Updates the quantity of an existing order item and recalculates total

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |
| `itemId` | path | string | ✅ | - |

#### Request Body

```json
{
  "quantity": 3
}
```

#### Responses

**200** - Order item updated successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tableId": "123e4567-e89b-12d3-a456-426614174001",
  "tableCode": "T001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "status": "OPEN",
  "total": 150000,
  "items": [
    "..."
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Order is not OPEN or item does not belong to order

**404** - Order or order item not found

---

### DELETE /orders/{id}/items/{itemId}

**Delete order item (STAFF, ADMIN)**

Removes an item from the order and recalculates total

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |
| `itemId` | path | string | ✅ | - |

#### Responses

**200** - Order item deleted successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tableId": "123e4567-e89b-12d3-a456-426614174001",
  "tableCode": "T001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "status": "OPEN",
  "total": 150000,
  "items": [
    "..."
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Order is not OPEN or item does not belong to order

**404** - Order or order item not found

---

### PATCH /orders/{id}/status

**Update order status**

STAFF/ADMIN can mark as PAID. Only ADMIN can CANCEL. Cannot modify after PAID.

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Request Body

```json
{
  "status": "PAID"
}
```

#### Responses

**200** - Order status updated successfully

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tableId": "123e4567-e89b-12d3-a456-426614174001",
  "tableCode": "T001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174002",
  "status": "OPEN",
  "total": 150000,
  "items": [
    "..."
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T10:30:00Z"
}
```

**400** - Invalid status transition

**404** - Order not found

---

## Payments

Payment processing endpoints

### GET /payments

**Get all payments (STAFF, ADMIN)**

🔒 **Authentication Required**

#### Responses

**200** - List of all payments

```json
[
  {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "orderId": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    "tableCost": 150000,
    "orderCost": 75000,
    "total": 225000,
    "method": "CASH",
    "status": "PAID",
    "paidAt": "2026-01-02T10:30:00.000Z",
    "createdAt": "2026-01-02T10:25:00.000Z"
  }
]
```

---

### POST /payments

**Create a new payment (STAFF, ADMIN)**

Creates a payment for an order. Calculates table cost based on play time and adds order items cost. Updates order to PAID and table to IDLE.

🔒 **Authentication Required**

#### Request Body

```json
{
  "orderId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "method": "CASH"
}
```

#### Responses

**201** - Payment created successfully

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "orderId": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "tableCost": 150000,
  "orderCost": 75000,
  "total": 225000,
  "method": "CASH",
  "status": "PAID",
  "paidAt": "2026-01-02T10:30:00.000Z",
  "createdAt": "2026-01-02T10:25:00.000Z"
}
```

**400** - Order is not OPEN or table has not ended playing

**404** - Order not found

**409** - Payment already exists for this order

---

### GET /payments/{id}

**Get payment by ID (STAFF, ADMIN)**

🔒 **Authentication Required**

#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `id` | path | string | ✅ | - |

#### Responses

**200** - Payment retrieved successfully

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "orderId": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "tableCost": 150000,
  "orderCost": 75000,
  "total": 225000,
  "method": "CASH",
  "status": "PAID",
  "paidAt": "2026-01-02T10:30:00.000Z",
  "createdAt": "2026-01-02T10:25:00.000Z"
}
```

**404** - Payment not found

---

