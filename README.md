# CueMaster - Billiard Management System

A complete frontend-only billiard management system MVP built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Admin Dashboard
- **Dashboard**: Real-time statistics, revenue charts, table floor map with live updates
- **Tables Management**: Visual grid of all tables with status management
- **Bookings**: Create, confirm, and cancel customer bookings
- **Menu Management**: Full CRUD for food, drinks, and services with images
- **Orders**: Create orders linked to bookings, close orders to trigger payments
- **Payments**: Transaction history with invoice generation
- **Reports**: Revenue trends, table usage analytics, weekly booking patterns
- **Notifications**: System alerts with read/unread status

### Customer Portal (Public Site)
- **Landing Page**: Hero section with booking CTA
- **Available Tables**: Real-time table availability (updates every 5s)
- **Menu Showcase**: Browse food and beverages
- **My Bookings**: View upcoming reservations

### Authentication
- Mock login system supporting Admin, Staff, and Customer roles
- Registration page with form validation
- Role-based routing and access control

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **State Management**: Zustand (with persist middleware)
- **Charts**: Recharts
- **Theme**: Dark/Light mode with next-themes

## Mock Data

All data is simulated using:
- Mock JSON data in `/lib/mock-data.ts`
- Zustand store in `/lib/store.ts` for state management
- Real-time updates simulated with `setInterval`

## Design Features

- Modern billiard theme with dark slate colors and emerald green accents
- Fully responsive layout (mobile to desktop)
- Smooth transitions and hover effects
- Consistent spacing using 8px grid system
- Inter font family
- Gradient backgrounds and glass morphism effects

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  /admin          - Admin dashboard pages
  /login          - Login page
  /register       - Registration page
  page.tsx        - Public customer portal
/components
  /admin          - Admin layout components
  /public         - Public site components
  /ui             - Shadcn UI components
/lib
  types.ts        - TypeScript interfaces
  mock-data.ts    - Mock data
  store.ts        - Zustand state management
```

## Login Credentials

Use any email/password combination and select a role:
- **Admin**: Full access to admin dashboard
- **Staff**: Access to admin dashboard
- **Customer**: Access to customer portal

## Features Highlights

- Real-time table status updates (every 5 seconds)
- Interactive CRUD operations for all entities
- Beautiful charts and analytics
- Toast notifications for user feedback
- Modal dialogs for forms
- Responsive data tables
- Badge status indicators
- Filter and search functionality
