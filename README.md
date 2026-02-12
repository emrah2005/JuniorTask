# Booking SaaS Application

A complete full-stack booking management system for businesses like barbers, gyms, training halls, and car washes.

## Features

- **Multi-role System**: SuperAdmin, Admin (Business Owner), and User (Customer)
- **Business Management**: Create, edit, and delete businesses with services
- **Booking System**: Real-time booking with status management (pending, accepted, rejected)
- **Dashboard Analytics**: Interactive charts and statistics for all roles
- **Authentication**: JWT-based secure authentication with bcrypt password hashing
- **Modern UI**: Responsive design built with React, Tailwind CSS, and Recharts

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express
- MySQL
- JWT Authentication
- bcrypt
- Express Validator

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- npm or yarn

### 1. Database Setup

1. Create a MySQL database named `booking_saas`
2. Run the schema file to create tables:
   ```bash
   mysql -u root -p booking_saas < backend/database/schema.sql
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=booking_saas
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Default Accounts

### SuperAdmin
- Email: admin@booking.com
- Password: password

## Application Structure

### Backend Routes
- `/api/auth` - Authentication (register, login)
- `/api/users` - User management
- `/api/businesses` - Business CRUD operations
- `/api/services` - Service management
- `/api/bookings` - Booking operations
- `/api/dashboard` - Dashboard statistics

### Frontend Pages
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard/superadmin` - SuperAdmin dashboard
- `/dashboard/admin` - Admin (Business Owner) dashboard
- `/dashboard/user` - User (Customer) dashboard

## Role-Based Access Control

1. **SuperAdmin**: 
   - View all businesses and users
   - Global statistics and analytics
   - System-wide overview

2. **Admin (Business Owner)**:
   - Manage own businesses
   - Add/edit services
   - Accept/reject bookings
   - View business analytics

3. **User (Customer)**:
   - Browse businesses
   - Book appointments
   - View and cancel bookings

## Business Types Supported
- Barber
- Gym
- Training Hall
- Car Wash

## Booking Flow
1. User selects business and service
2. Chooses date and time
3. Booking created with "pending" status
4. Admin can accept or reject
5. Accepted bookings appear in calendar

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## Database Schema

### Users Table
- id, name, email, password, role, created_at, updated_at

### Businesses Table
- id, owner_id, name, type, created_at, updated_at

### Services Table
- id, business_id, name, price, duration, created_at, updated_at

### Bookings Table
- id, user_id, business_id, service_id, date, status, created_at, updated_at

## Security Features
- JWT token-based authentication
- bcrypt password hashing
- Role-based access control
- Input validation and sanitization
- SQL injection prevention with prepared statements

## License
MIT License
