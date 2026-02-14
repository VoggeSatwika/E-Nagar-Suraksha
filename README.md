# e-Nagar Suraksha - Complaint Management System

A full-stack complaint management system built with Node.js, Express, MongoDB, and React.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Citizen Portal**: Submit geo-tagged complaints with photos
- **Real-time Tracking**: Track complaint status with live updates
- **Department Assignment**: Assign complaints to Police/Municipal departments
- **Admin Dashboard**: Analytics and management tools
- **Responsive UI**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time updates
- Multer for file uploads

### Frontend
- React.js
- React Router
- Axios for API calls
- Socket.io-client
- Google Maps Integration

## Project Structure

```
e-nagar-suraksha/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```powershell
   cd e-nagar-suraksha\backend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Edit .env file
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/e-nagar-suraksha
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```powershell
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```powershell
   cd e-nagar-suraksha\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. (Optional) Configure Google Maps API:
   Create a `.env` file in the frontend directory:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```powershell
   npm start
   ```

5. Open http://localhost:3000 in your browser

## Default Users (after seeding)

After running the seed command, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@enangarsuraksha.gov | admin123 |
| Police | police@enangarsuraksha.gov | police123 |
| Municipal | municipal@enangarsuraksha.gov | municipal123 |
| Citizen | john@example.com | citizen123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints` - Submit complaint (Citizen)
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/:id` - Get single complaint
- `PUT /api/complaints/:id/update` - Update complaint status (Officer/Admin)
- `POST /api/complaints/:id/assign` - Assign complaint (Admin)
- `GET /api/complaints` - Get all complaints (Admin/Officer)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/departments` - Manage departments
- `POST /api/admin/seed` - Seed initial data

## User Roles

- **Citizen**: Submit complaints, track status, provide feedback
- **Police**: Handle security-related complaints
- **Municipal**: Handle civic issues (roads, garbage, water, etc.)
- **Admin**: Full system access, assign complaints, view analytics

## Complaint Status Flow

```
Pending → Assigned → In Progress → Resolved
              ↓
           Rejected
```

## License

ISC
