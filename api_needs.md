# Backend API Specification
**Author:** Antigravity (Senior Backend Engineer)
**Date:** 2026-01-11
**Context:** Valancis E-Commerce Platform

This document serves as the **definitive source of truth** for the backend API implementation. It details every endpoint required to power the `valancis-frontend` application.

## 1. Global Standards
*   **Base URL**: `/api/v1`
*   **Content-Type**: `application/json`
*   **Authentication**: Bearer Token in `Authorization` header OR `HttpOnly` Cookie (preferred).
*   **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
*   **Currency**: BDT (Bangladesh Taka)

---

## 2. Authentication Service
**Base Path:** `/auth`

### 2.1 Google Login / Signup
Exchange a Google ID Token for an application session. Handles both registration (first time) and login.
*   **POST** `/auth/google`
*   **Auth**: Public
*   **Body**:
    ```json
    {
      "idToken": "eyJhbGciOiJSUzI1NiIs..." // JWT from Google
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "accessToken": "eyJ...", // Short-lived access token
      "user": {
        "id": "u_12345",
        "email": "user@example.com",
        "firstName": "Rahim",
        "lastName": "Ahmed",
        "avatar": "https://lh3.googleusercontent.com/..."
      }
    }
    ```
*   **Set-Cookie**: `refreshToken=...; HttpOnly; Secure; SameSite=Strict`

### 2.2 Get Current User
Retrieve the currently authenticated user's profile. Used to hydrate session state on page load.
*   **GET** `/auth/me`
*   **Auth**: Required
*   **Response (200 OK)**:
    ```json
    {
      "id": "u_12345",
      "email": "user@example.com",
      "role": "customer",
      "preferences": {
        "newsletter": true
      }
    }
    ```
*   **Response (401 Unauthorized)**: If token is invalid/expired.

### 2.3 Logout
Invalidate the session and clear cookies.
*   **POST** `/auth/logout`
*   **Auth**: Required
*   **Response (204 No Content)**

---

## 3. Catalog Service
**Base Path:** `/catalog` or root `/`

### 3.1 Get Category Tree
Fetch the hierarchical category structure for the Mega Menu.
*   **GET** `/categories/tree`
*   **Auth**: Public
*   **Query Params**:
    *   `depth` (optional): `1` for top-level only, `2` for subcats. Default: `max`.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "cat_women",
        "name": "Women",
        "slug": "women",
        "children": [
          { "id": "cat_sarees", "name": "Sarees", "slug": "sarees" }
        ]
      }
    ]
    ```

### 3.2 List Products (Filtering & Sorting)
The primary endpoint for PLP (Product Listing Page).
*   **GET** `/products`
*   **Auth**: Public
*   **Query Params**:
    *   `category_slug`: Filter by category (e.g., `sarees`). Implies valid children.
    *   `q`: Search query text (e.g., `silk`).
    *   `min_price`, `max_price`: Range filtering.
    *   `sort`: `newest` | `price_asc` | `price_desc` | `best_selling`
    *   `tags`: Comma-separated (e.g., `eid,party`).
    *   `is_featured`: `true` | `false`
    *   `page`, `limit`: Pagination.
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "p_001",
          "name": "Midnight Katan",
          "slug": "midnight-katan",
          "price": { "base": 12000, "sale": 10500, "currency": "BDT" },
          "thumbnail": "https://...",
          "stock_status": "in_stock"
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 20,
        "totalPages": 3
      }
    }
    ```

### 3.3 Get Product Details (PDP)
Fetch full details for a single product.
*   **GET** `/products/{slug}`
*   **Auth**: Public
*   **Response (200 OK)**:
    ```json
    {
      "id": "p_001",
      "name": "Midnight Katan",
      "description": "Full HTML description...",
      "pricing": { "basePrice": 12000, "salePrice": null },
      "inventory": { "stockLevel": 5, "status": "in_stock" },
      "isFeatured": true,
      "media": [
        { "type": "image", "url": "..." },
        { "type": "video", "url": "..." }
      ],
      "attributes": {
        "Fabric": "Silk",
        "Weave": "Jacquard"
      },
      "weaversNote": "A revivement of the lost art...",
      "fabricStory": "Spun from the Phuti karpas cotton...",
      "specifications": {
         "material": "100% Mulberry Silk",
         "weave": "Handloom",
         "origin": "Dhaka",
         "care": ["Dry clean only"]
      },
      "variants": [
        { "id": "v_1", "name": "Red", "stock": 2 }
      ],
      "seo": { "title": "...", "description": "..." }
    }
    ```

### 3.4 Get Filter Metadata
Dynamic boundaries for the filter sidebar based on current search context.
*   **GET** `/products/filters`
*   **Auth**: Public
*   **Query Params**: Same as `/products` (to get relevant ranges).
*   **Response (200 OK)**:
    ```json
    {
      "price_range": { "min": 1500, "max": 45000 },
      "categories": [ { "slug": "sarees", "count": 20 } ],
      "colors": [ "Blue", "Red", "Gold" ],
      "sizes": [ "S", "M", "L" ]
    }
    ```

---

## 4. Order & Checkout Service
**Base Path:** `/orders`

### 4.1 Validate Cart
Check stock availability before checkout proceeds.
*   **POST** `/cart/validate`
*   **Auth**: Public (Guest) or Required
*   **Body**:
    ```json
    {
      "items": [
        { "productId": "p_001", "variantId": "v_1", "quantity": 1 }
      ]
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "valid": true,
      "changes": [] // If price changed or stock limited, list here
    }
    ```
*   **Response (409 Conflict)**: If an item is OOS.

### 4.2 Calculate Shipping
Get precise shipping costs.
*   **POST** `/shipping/rates`
*   **Body**:
    ```json
    {
      "district": "Dhaka",
      "thana": "Gulshan",
      "subTotal": 5000
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "methods": [
        { "id": "inside_dhaka", "label": "Inside Dhaka", "cost": 80, "eta": "2-3 Days" }
      ]
    }
    ```

### 4.3 Place Order
Create a new order.
*   **POST** `/orders`
*   **Body**:
    ```json
    {
      "items": [...],
      "customer": {
        "firstName": "Sadia",
        "phone": "+8801..."
      },
      "shippingAddress": { ... },
      "paymentMethod": "cod"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "orderId": "ORD-2026-001",
      "status": "pending_confirmation",
      "trackingUrl": "/orders/ORD-2026-001"
    }
    ```

### 4.4 Get Order Details
View receipt or tracking status.
*   **GET** `/orders/{id}`
*   **Auth**: Required (Owner) or Guest Token (via Email Link)
*   **Response (200 OK)**:
    ```json
    {
      "id": "ORD-2026-001",
      "status": "processing",
      "createdAt": "2026-01-11T...",
      "items": [...],
      "total": 12080,
      "timeline": [
        { "status": "placed", "time": "..." }
      ]
    }
    ```

### 4.5 List User Orders
Order history for profile.
*   **GET** `/orders`
*   **Auth**: Required
*   **Query Params**: `page`, `limit`
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        { "id": "ORD-1", "total": 5000, "status": "delivered", "date": "..." }
      ]
    }
    ```

---

## 5. Marketing & Support
**Base Path:** `/`

### 5.1 Newsletter Subscription
*   **POST** `/newsletter/subscribe`
*   **Body**: `{ "email": "user@example.com" }`
*   **Response (201 Created)**

### 5.2 Contact Form
*   **POST** `/contact`
*   **Body**: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
*   **Response (200 OK)**

---

## 6. CMS / Configuration
**Base Path:** `/content`

### 6.1 Get Homepage Content
Fetch dynamic blocks for the homepage layout.
*   **GET** `/pages/home`
*   **Response (200 OK)**:
    ```json
    {
      "hero_slides": [
        { "image": "...", "title": "Eid Edit", "cta_link": "..." }
      ],
      "featured_collections": [...],
      "editorial_spotlight": {...}
    }
    ```

### 6.2 Get Global Config
Fetch settings like logo, nav links, footer info.
*   **GET** `/config`
*   **Response (200 OK)**:
    ```json
    {
      "site_name": "Valancis",
      "maintenance_mode": false,
      "support_phone": "+880..."
    }
    ```
