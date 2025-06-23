# AITutor Flask Backend

This is the Flask backend server for the AITutor application with Supabase authentication.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Run the SQL schema in your Supabase SQL editor:
   - Copy the contents of `database/schema.sql`
   - Paste and execute in Supabase SQL editor

### 4. Run the Server

```bash
python app.py
```

Or using the run script:
```bash
python run.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/user` - Get current user info
- `POST /auth/refresh` - Refresh access token

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Health Check
- `GET /health` - Server health check

## Request/Response Examples

### Sign Up
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get User (with token)
```bash
curl -X GET http://localhost:5000/auth/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Integration

Update your Next.js frontend to use this backend:

1. Change the API base URL to `http://localhost:5000`
2. Use the session tokens returned from login/signup
3. Include the access token in Authorization headers for protected routes

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
├── run.py             # Application runner
├── .env.example       # Environment variables template
├── database/
│   └── schema.sql     # Database schema
├── routes/
│   └── auth.py        # Authentication routes
└── utils/
    └── auth.py        # Authentication utilities
```

## Security Notes

- All routes requiring authentication use JWT token verification
- Supabase handles password hashing and security
- CORS is configured for your frontend domain
- Row Level Security (RLS) is enabled on all tables

## Troubleshooting

1. **Supabase connection issues**: Verify your URL and keys in `.env`
2. **CORS errors**: Check the CORS_ORIGINS setting in `config.py`
3. **Token errors**: Ensure tokens are passed as `Bearer <token>` in Authorization header