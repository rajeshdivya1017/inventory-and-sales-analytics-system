# Inventory & Sales Analytics System

A full-stack Inventory & Sales Analytics System built using React, TypeScript, Flask, MySQL, JWT Authentication, TanStack Query, Zustand, React Hook Form, Zod, and Recharts.

This application allows administrators to manage products and monitor inventory and sales analytics, while managers can view products and record sales.

## Features

### Authentication and Authorization

* JWT-based authentication
* Access token and refresh token support
* Session restoration using `/api/me`
* Protected routes for authenticated users
* Role-based access control
* Admin and Manager roles
* Admin has full access
* Manager can view products and add sales
* Manager cannot manage products or user accounts
* JWT token is automatically attached to API requests using Axios interceptors
* Automatic token refresh when the access token expires

### Product Management

* View all products
* Search products by name
* Filter products by category
* Filter low-stock products
* Add products
* Edit products
* Delete products
* Product management actions are available only to administrators
* Product form validation using React Hook Form and Zod
* Inline validation error messages
* Delete operation is protected when the product already has sales

### Sales Management

* View sales records
* Search sales by product or seller
* Filter sales by product
* Filter sales by seller
* Filter sales by date range
* Record a new sale
* Sale form validation using React Hook Form and Zod
* Stock is reduced when a sale is created
* Sale stores the product price at the time of sale
* Logged-in user is stored as the seller
* Success and error toast messages are displayed after sale operations

### Dashboard and Analytics

The dashboard provides:

* Total revenue
* Total sales
* Total products
* Low-stock product count
* Monthly revenue line chart
* Category revenue bar chart
* Category revenue pie chart
* Top products table

Analytics can be filtered using:

* Category
* From date
* To date

Dashboard analytics are fetched using TanStack Query and automatically refresh every 30 seconds.

### UI Features

* Responsive layout
* Sidebar navigation
* Light mode
* Dark mode
* Toast notifications
* Loading states
* Error states
* Empty states
* Responsive charts using Recharts

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* TanStack Query
* Zustand
* React Hook Form
* Zod
* Recharts
* Lucide React

### Backend

* Python
* Flask
* Flask-JWT-Extended
* Flask-Bcrypt
* Flask-CORS
* MySQL Connector

### Database

* MySQL
* Database name: `inventory_sales`

## Project Structure

```text
inventory-app/
│
├── backend/
│   ├── app.py
│   └── seed.py
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── analytics.ts
    │   │   ├── axios.ts
    │   │   ├── products.ts
    │   │   └── sales.ts
    │   │
    │   ├── components/
    │   │   ├── charts/
    │   │   ├── FilterBar.tsx
    │   │   ├── KPICards.tsx
    │   │   ├── ProductForm.tsx
    │   │   ├── SaleForm.tsx
    │   │   └── ...
    │   │
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   │
    │   ├── hooks/
    │   │   ├── useAnalytics.ts
    │   │   ├── useDebounce.ts
    │   │   ├── useProducts.ts
    │   │   ├── useSales.ts
    │   │   └── useToast.ts
    │   │
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── ProductsPage.tsx
    │   │   └── SalesPage.tsx
    │   │
    │   ├── routes/
    │   │   ├── ProtectedRoute.tsx
    │   │   └── RoleRoute.tsx
    │   │
    │   ├── schemas/
    │   │   └── index.ts
    │   │
    │   ├── store/
    │   │   ├── useFilterStore.ts
    │   │   └── useUIStore.ts
    │   │
    │   ├── types/
    │   │   └── index.ts
    │   │
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    │
    ├── package.json
    └── README.md
```

## Backend API

### Authentication

```text
POST /api/login
POST /api/refresh
GET  /api/me
```

### Categories

```text
GET /api/categories
```

### Products

```text
GET    /api/products
POST   /api/products
PUT    /api/products/<id>
DELETE /api/products/<id>
```

Product listing supports:

```text
category_id
search
low_stock
```

### Sales

```text
GET  /api/sales
POST /api/sales
GET  /api/sales/<id>
```

Sales support filtering by:

```text
product_id
from
to
sold_by
```

### Analytics

```text
GET /api/analytics/kpis
GET /api/analytics/by-category
GET /api/analytics/monthly-revenue
GET /api/analytics/top-products
```

Analytics supports the dashboard filters such as:

```text
from
to
category_id
```

## Database and Seed Data

The application uses the `inventory_sales` MySQL database.

The seed data contains:

* 2 users
* Admin user
* Manager user
* 6 categories
* 30 products
* 150+ sales records
* Sales data covering approximately 6 months

The database is populated using the backend seed script.

## Role Permissions

### Admin

Admin users can:

* Login
* View dashboard
* View analytics
* View products
* Add products
* Edit products
* Delete products
* View sales
* Add sales

### Manager

Manager users can:

* Login
* View dashboard
* View analytics
* View products
* View sales
* Add sales

Managers cannot:

* Add products
* Edit products
* Delete products
* Manage user accounts

The frontend hides restricted actions from managers, and the backend also checks the user's role before allowing protected write operations.

## State Management

Zustand is used for client-side application state.

The project uses two separate stores.

### useFilterStore

This store manages filtering-related state such as:

* Category
* Product
* Seller
* From date
* To date
* Search
* Reset filters

### useUIStore

This store manages UI-related state such as:

* Sidebar state
* Theme
* Toast notifications

The stores are separated so that data/filter state and UI state have clear responsibilities.

## Server State Management

TanStack Query is used for server state.

The project uses query hooks for:

* Products
* Sales
* KPIs
* Monthly revenue
* Category revenue
* Top products

Query keys include the relevant filter values.

For example:

```text
["analytics", "kpis", filters]
```

When a filter changes, the query key changes and TanStack Query fetches or retrieves the corresponding filtered data.

After mutations, related queries are invalidated so the UI receives updated data.

## Form Validation

React Hook Form is used for form handling.

Zod is used for schema validation.

Validation is implemented for:

* Login form
* Product form
* Sale form

For the sale form, quantity must be a positive integer.

Backend validation is also performed because frontend validation can be bypassed. The backend checks business rules such as whether the requested sale quantity is available in stock.

## Sales Flow

When a manager records a sale, the flow is:

```text
SaleForm
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
SalesPage handleSubmit
    ↓
useCreateSale
    ↓
createSale API
    ↓
Axios JWT Interceptor
    ↓
Flask /api/sales
    ↓
MySQL
    ↓
Stock Reduction
    ↓
TanStack Query Cache Invalidation
    ↓
Analytics API
    ↓
Updated KPI and Charts
    ↓
Dashboard
```

After a successful sale:

* The sale is stored
* Product stock is reduced
* Sales queries are refreshed
* Product queries are refreshed
* Analytics queries are refreshed
* Dashboard revenue is updated

## Analytics

The dashboard contains four main analytics sections.

### KPI Cards

Displays:

* Total Revenue
* Total Sales
* Total Products
* Low Stock Count

### Monthly Revenue

A Recharts line chart displays revenue by month.

### Category Revenue

A bar chart displays revenue generated by each category.

### Category Revenue Distribution

A pie chart displays the distribution of revenue across categories.

### Top Products

A table displays the top-performing products based on revenue and units sold.

All charts use data fetched from the backend analytics APIs.

## Search and Debouncing

Product and sales search functionality is implemented using the custom `useDebounce` hook.

The debounce delay is 300 milliseconds.

This prevents unnecessary processing while the user is typing and provides a smoother search experience.

## Toast Notifications

The application uses a custom `useToast` hook with Zustand UI state.

Toast messages are displayed for important actions such as:

* Successful product creation
* Product update
* Product deletion
* Successful sale creation
* Failed operations

Toast messages automatically disappear after a short duration.

## Running the Project

### Backend

Go to the backend directory:

```bash
cd backend
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
python app.py
```

The Flask API runs on:

```text
http://127.0.0.1:5000
```

### Frontend

Go to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

## Application Routes

```text
/login
/dashboard
/products
/sales
```

Protected pages require authentication.

Product management routes and actions are restricted according to the user's role.

## Testing Flow

The application was tested using the following flow:

1. Login as admin.
2. Open the dashboard.
3. Verify KPI cards.
4. Verify monthly revenue chart.
5. Verify category bar chart.
6. Verify category pie chart.
7. Verify top products.
8. Change the category filter.
9. Verify that analytics update according to the selected category.
10. Open Products.
11. Try submitting invalid product data and verify Zod validation.
12. Add a product as admin.
13. Record a sale.
14. Verify the success toast.
15. Return to the dashboard.
16. Verify that revenue and related analytics are updated.
17. Logout.
18. Login as manager.
19. Verify that manager can view products and add sales.
20. Verify that admin-only product actions are hidden for manager.
21. Verify light and dark mode.

## Key Concepts Demonstrated

This project demonstrates:

* JWT authentication
* Refresh token handling
* Role-based authorization
* Axios interceptors
* React Router protected routes
* TypeScript interfaces
* TanStack Query server-state management
* Zustand client-state management
* React Hook Form
* Zod validation
* Custom React hooks
* Debounced search
* Recharts data visualization
* REST API integration
* MySQL database integration
* Inventory stock management
* Sales analytics
* Responsive UI
* Light and dark themes

## Project Outcome

The Inventory & Sales Analytics System provides a complete workflow for managing inventory and recording sales while giving administrators a clear view of business performance through analytics.

The project combines authentication, role-based access, product management, sales management, inventory tracking, server-state management, form validation, and interactive analytics in a single full-stack application.
