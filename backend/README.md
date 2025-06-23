# AITutor Flask Backend

This is the Flask backend server for the AITutor application with Supabase authentication and LiveKit video integration.

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

2. Update the `.env` file with your Supabase and LiveKit credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_SERVER_URL=wss://your-livekit-server.com
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url
```

**Note:** Replace `your-livekit-server.com` with your actual LiveKit server URL.

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Run the SQL schema in your Supabase SQL editor:
   - Copy the contents of `database/schema.sql`
   - Paste and execute in Supabase SQL editor

### 4. Run the Server

```bash
python app.py
# or
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

### LiveKit Video

- `POST /livekit/create-room` - Create a new video room
- `POST /livekit/generate-token` - Generate a LiveKit access token
- `GET /livekit/active-rooms` - List all active rooms
- `DELETE /livekit/room/<room_id>` - Delete a room by ID or name
- `GET /livekit/room/<room_name>/info` - Get info about a specific room
- `GET /livekit/health` - LiveKit service health check

### Health Check

- `GET /health` - Server health check

## LiveKit Integration Usage

### 1. Create a Room

**POST** `/livekit/create-room`

```json
{
  "roomName": "test-room", // optional, auto-generated if omitted
  "maxParticipants": 2, // optional, default 2
  "subject": "Math Tutoring", // optional
  "tutorType": "AI Tutor" // optional
}
```

### 2. Generate a Token

**POST** `/livekit/generate-token`

```json
{
  "roomName": "test-room",
  "participantName": "alice", // optional, uses your user name if omitted
  "role": "student" // optional, "student" or "tutor"
}
```

### 3. List Active Rooms

**GET** `/livekit/active-rooms`

### 4. Delete a Room

**DELETE** `/livekit/room/<room_id>`

### 5. Get Room Info

**GET** `/livekit/room/<room_name>/info`

### 6. LiveKit Health Check

**GET** `/livekit/health`

**All LiveKit endpoints (except /livekit/health) require an Authorization header:**

```
Authorization: Bearer <your_jwt_token>
```

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

### Create LiveKit Room (with token)

```bash
curl -X POST http://localhost:5000/livekit/create-room \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "test-room",
    "maxParticipants": 2
  }'
```

### Generate LiveKit Token (with token)

```bash
curl -X POST http://localhost:5000/livekit/generate-token \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "test-room",
    "participantName": "alice",
    "role": "student"
  }'
```

## Frontend Integration

Update your frontend to use this backend:

1. Change the API base URL to `http://localhost:5000`
2. Use the session tokens returned from login/signup
3. Include the access token in Authorization headers for protected routes

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
├── run.py              # Application runner
├── .env.example        # Environment variables template
├── database/
│   └── schema.sql      # Database schema
├── routes/
│   ├── auth.py         # Authentication routes
│   └── livekit_routes.py # LiveKit routes
└── utils/
    ├── auth.py         # Authentication utilities
    └── livekit_service.py # LiveKit integration
```

## Security Notes

- All routes requiring authentication use JWT token verification
- Supabase handles password hashing and security
- CORS is configured for your frontend domain
- Row Level Security (RLS) is enabled on all tables
- LiveKit credentials must be kept secret and never exposed to the frontend

## Troubleshooting

1. **Supabase connection issues**: Verify your URL and keys in `.env`
2. **CORS errors**: Check the `CORS_ORIGINS` setting in `.env`
3. **Token errors**: Ensure tokens are passed as `Bearer <token>` in Authorization header
4. **LiveKit errors**: Ensure your LiveKit server URL and credentials are correct in `.env`
