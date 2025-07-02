# Google OAuth Setup for RentGuy

This guide explains how to configure Google OAuth authentication for RentGuy.

## Frontend Setup

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add your domain to authorized origins:
     - `http://localhost:5173` (for development)
     - `https://your-domain.com` (for production)

### 2. Configure Frontend

1. Copy `.env.example` to `.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Add your Google Client ID to `frontend/.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
   ```

## Backend Setup

### 1. Add Google Client ID to Backend Environment

Add to your backend environment variables:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

For Railway deployment, add this environment variable in the Railway dashboard.

### 2. Install Dependencies

The required dependencies are already in `requirements.txt`:
- `google-auth==2.23.4`
- `google-auth-oauthlib==1.1.0`
- `google-auth-httplib2==0.1.1`

## How It Works

1. User clicks "Continue with Google" button
2. Google login popup opens
3. User authenticates with Google
4. Google returns a token to the frontend
5. Frontend sends the token to backend `/auth/google` endpoint
6. Backend verifies the token with Google
7. Backend creates or finds the user and returns an access token
8. Frontend stores the access token and redirects to dashboard

## Security Notes

- Never expose your Google Client Secret in frontend code
- Always verify tokens on the backend
- Use HTTPS in production
- Validate all user data from Google tokens

## Troubleshooting

### "Google login not configured" error
- Make sure `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Make sure `GOOGLE_CLIENT_ID` is set in backend environment

### "Invalid Google token" error
- Check that your Google Client ID matches between frontend and backend
- Ensure your domain is authorized in Google Cloud Console
- Check that the Google+ API is enabled

### Button doesn't appear
- Check browser console for errors
- Verify the Google Client ID is properly configured
- Make sure `react-google-login` dependency is installed