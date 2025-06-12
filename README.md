# Backend Zero Koin

A professional Node.js backend application with MongoDB integration.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
└── app.js         # Main application file
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb+srv://admin:root@cluster0.ye7aj3h.mongodb.net/
NODE_ENV=development
```

3. Run the development server:
```bash
npm run dev
```

4. For production:
```bash
npm start
```

## Features

- Express.js server
- MongoDB integration
- Environment configuration
- Error handling middleware
- Security middleware (helmet, cors)
- Request logging (morgan) 