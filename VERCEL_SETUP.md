# Vercel Deployment Setup Guide

## Critical: Environment Variables Must Be Set in Vercel

The production error you're experiencing is due to missing Firebase environment variables in Vercel. Follow these steps to fix it:

### Step 1: Access Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Select your project: `key-2-rent-ecru`
3. Click on **Settings** tab
4. Navigate to **Environment Variables** section

### Step 2: Add Required Firebase Environment Variables

Add the following environment variables with their corresponding values:

**Note:** These variables are REQUIRED for production. The fallback values in the code are only used if environment variables are not set.

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDXDbd7n6pATyZnvEosKMWseWA8fg1mnU8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-8585842935-1485a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-8585842935-1485a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-8585842935-1485a.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=183517980169
NEXT_PUBLIC_FIREBASE_APP_ID=1:183517980169:web:7a35cafdec76d857553ad8
```

**Optional:**
```
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
GOOGLE_GENAI_API_KEY=your_google_ai_key_here
```

### Step 3: Configure Environment Variable Scope

For each environment variable:
- **Environment:** Select `Production`, `Preview`, and `Development`
- This ensures the variables are available in all deployment environments

### Step 4: Redeploy Your Application

After adding all environment variables:

1. Go to the **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Select **Redeploy**
5. Check the box for "Use existing Build Cache" (optional, faster)
6. Click **Redeploy**

Alternatively, you can trigger a new deployment by:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 5: Verify Deployment

1. Wait for the deployment to complete
2. Visit https://key-2-rent-ecru.vercel.app/
3. Open browser console (F12)
4. Look for Firebase initialization logs:
   ```
   [FirebaseClientProvider] Initializing Firebase...
   [initializeFirebase] Starting initialization...
   [Firebase Config] Configuration validated successfully
   [initializeFirebase] Firebase app initialized successfully
   ```

## What Was Fixed

### Code Changes Made:

1. **Firebase Config Validation** (`src/firebase/config.ts`):
   - Added validation to ensure all required Firebase config fields are present
   - Added helpful error messages if configuration is invalid

2. **Enhanced Error Handling** (`src/firebase/client-provider.tsx`):
   - Added try-catch block around Firebase initialization
   - Added detailed logging to help debug initialization issues
   - Errors are now properly caught by the ErrorBoundary

3. **Detailed Logging** (`src/firebase/index.ts`):
   - Added comprehensive logging throughout the initialization process
   - Logs show which config values are being used
   - Helps identify exactly where initialization fails

### Why This Happened:

The error `Firebase: No Firebase App '[DEFAULT]' has been created` occurs when:
1. Firebase is not initialized before being used
2. The initialization fails silently due to missing/invalid config
3. Environment variables are not set in the deployment platform

In your case, the Firebase environment variables were not set in Vercel, so the app couldn't initialize Firebase properly in production.

## Testing Locally

To test the same production configuration locally:

1. Update `.env.local` with Firebase variables:
   ```bash
   # Copy from .env.example
   cp .env.example .env.local

   # Edit .env.local and add Firebase values
   nano .env.local
   ```

2. Build and test production build:
   ```bash
   npm run build
   npm run start
   ```

3. Check console for Firebase initialization logs

## Troubleshooting

### If you still see errors after deployment:

1. **Check environment variables are saved:**
   - Go to Vercel Settings → Environment Variables
   - Verify all Firebase variables are listed

2. **Check deployment logs:**
   - Go to Deployments → Latest deployment → Building
   - Look for any errors during the build process

3. **Check browser console:**
   - Visit your site
   - Open DevTools console (F12)
   - Look for Firebase initialization logs

4. **Verify Firebase project is active:**
   - Go to https://console.firebase.google.com/
   - Check that your project `studio-8585842935-1485a` is active
   - Verify API key is valid

## Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
