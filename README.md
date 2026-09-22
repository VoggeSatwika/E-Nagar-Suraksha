# e-Nagar Suraksha - Complaint Management System

A full-stack complaint management platform developed using Node.js, Express, MongoDB, and React.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Citizen Portal**: Citizens can submit geo-tagged complaints along with photos
- **Real-time Tracking**: Monitor complaint status through live updates
- **Department Assignment**: Assign complaints to Police or Municipal departments
- **Admin Dashboard**: Provides analytics and complaint management tools
- **Responsive UI**: Designed to work across desktop and mobile devices

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time communication
- Multer for handling file uploads

### Frontend

- React.js
- React Router
- Axios for API requests
- Socket.io-client
- Google Maps Integration

## Project Structure

```text
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
│
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
│
└── README.md