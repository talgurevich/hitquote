# Google OAuth Setup Instructions

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project or create a new one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-heroku-app-name.herokuapp.com/api/auth/callback/google`
   - Click "Create"
   - Copy the Client ID and Client Secret

## Step 2: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `NEXTAUTH_SECRET`: Generate a random secret (you can use: `openssl rand -base64 32`)

## Step 3: Configure Heroku Environment Variables

For production deployment, add these environment variables to Heroku:

```bash
heroku config:set GOOGLE_CLIENT_ID="your_client_id_here"
heroku config:set GOOGLE_CLIENT_SECRET="your_client_secret_here"
heroku config:set NEXTAUTH_SECRET="your_secret_here"
heroku config:set NEXTAUTH_URL="https://your-heroku-app-name.herokuapp.com"
```

## Step 4: Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Click "Sign in with Google" to test the flow

## Notes

- Make sure to replace `your-heroku-app-name` with your actual Heroku app name
- The authentication middleware protects all routes except the sign-in page
- Users will need a Google account to access the system