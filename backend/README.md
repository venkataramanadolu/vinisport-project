# VINISPORT Backend

Backend API for VINISPORT - a sports league management platform.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory with:

```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/vini
JWT_SECRET=your_secure_secret_key_here
PORT=5000
```

**Important:** Replace the MongoDB URI with your actual MongoDB connection string.

To get your MongoDB connection string:
1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. Make sure `vini` is the database name in the URI

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### POST `/api/auth/signup`
Register a new user

**Request:**
```json
{
  "firstName": "John",
  "middleName": "Andrew",
  "lastName": "Doe",
  "email": "john@gmail.com",
  "password": "password123",
  "confirm": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@gmail.com"
  }
}
```

### POST `/api/auth/login`
Login user

**Request:**
```json
{
  "email": "john@gmail.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@gmail.com"
  }
}
```

## Project Structure

```
backend/
├── models/
│   └── User.js              # User schema and model
├── routes/
│   └── auth.js              # Authentication routes
├── server.js                # Main server file
├── .env                      # Environment variables (create this)
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
└── README.md                # This file
```

## Notes

- All passwords are hashed using bcryptjs before storing
- JWT tokens expire after 7 days
- Email validation only accepts: Gmail, Yahoo, Outlook, Hotmail, iCloud, AOL, ProtonMail, and Zoho
- First name and last name are required fields
- Middle name is optional

## Connecting Frontend to Backend

Update your frontend `.env` file or API calls to use:
```
VITE_API_BASE_URL=http://localhost:5000
```

Then in your React code, update the signup to call:
```javascript
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ firstName, middleName, lastName, email, password, confirm })
});
```
