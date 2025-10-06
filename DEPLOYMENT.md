# 🚀 Deployment Guide - Key-2-Rent

## Pre-Deployment Checklist

### 1. Environment Setup

```bash
# Create .env.local file with your credentials
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_GENAI_API_KEY=your_google_ai_key
```

### 2. Update Firestore Rules

Deploy the updated Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Type Check

```bash
npm run typecheck
```

### 5. Build Test

```bash
npm run build
```

## Deployment Steps

### Option A: Firebase Hosting

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Option B: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Dashboard > Settings > Environment Variables
```

## Post-Deployment Verification

### 1. Test Authentication
- [ ] Email/Password signup
- [ ] Email/Password login
- [ ] Phone OTP signup
- [ ] Phone OTP login
- [ ] GitHub OAuth

### 2. Test Listing Creation
- [ ] Upload images (test compression)
- [ ] Create residential listing
- [ ] Create business listing
- [ ] Verify image uploads complete
- [ ] Check AI image analysis

### 3. Test Listing Views
- [ ] View categorized listings
- [ ] Toggle between grid/category views
- [ ] Filter by location
- [ ] Filter by type
- [ ] Filter by price

### 4. Test User Features
- [ ] View my listings
- [ ] Update listing status
- [ ] Delete listing
- [ ] View contact information

## Common Issues & Solutions

### Issue: Images not uploading
**Solution:**
1. Check Storage rules are deployed
2. Verify Firebase Storage is enabled
3. Check browser console for errors
4. Ensure file size < 5MB

### Issue: Authentication fails
**Solution:**
1. Verify `.env.local` has correct credentials
2. Enable authentication methods in Firebase Console
3. For GitHub: Add OAuth app credentials
4. For Phone: Set up billing in Firebase

### Issue: Firestore permission denied
**Solution:**
1. Deploy latest Firestore rules: `firebase deploy --only firestore:rules`
2. Check user is authenticated
3. Verify user owns the listing they're modifying

## Performance Optimization

### Image Optimization
- Images are automatically compressed before upload
- Max dimensions: 1920x1080
- Quality: 85%
- Format: JPEG

### Caching Strategy
- Static assets cached for 1 year
- API responses cached for 5 minutes
- Images served via Firebase CDN

## Monitoring

### Recommended Tools
1. **Firebase Console**: Monitor auth, database, storage usage
2. **Vercel Analytics** (if using Vercel): Track page views, performance
3. **Google Analytics**: User behavior tracking
4. **Sentry**: Error tracking (recommended for production)

### Key Metrics to Monitor
- Authentication success rate
- Image upload success rate
- Listing creation success rate
- Page load times
- Error rates

## Security Checklist

- [x] API keys in environment variables
- [x] Firestore security rules enforce ownership
- [x] Storage rules prevent unauthorized uploads
- [x] Input validation on all forms
- [x] XSS protection (input sanitization)
- [ ] Rate limiting (recommended)
- [ ] Firebase App Check (recommended)

## Rollback Plan

If deployment fails:

```bash
# Revert to previous Firebase deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Or redeploy previous version
git checkout <previous-commit>
npm run build
firebase deploy
```

## Support

For issues or questions:
- Check Firebase Console logs
- Review browser console errors
- Check Firestore security rules
- Verify environment variables are set correctly
