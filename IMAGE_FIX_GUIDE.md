# 🖼️ Image Loading Fix Guide

## Problem
Images not displaying on Vercel deployment (https://studio1-ecru.vercel.app/)

## Root Causes Identified

### 1. **Firebase Storage CORS Configuration**
Firebase Storage requires CORS configuration to allow images to be loaded from external domains (like Vercel).

### 2. **Next.js Image Optimization**
Next.js Image component requires proper remote pattern configuration.

### 3. **Error Handling**
Images failing silently without fallback.

---

## ✅ Solutions Implemented

### 1. **Created OptimizedImage Component**
- **File**: `src/components/optimized-image.tsx`
- **Features**:
  - Automatic error handling
  - Loading state
  - Fallback to placeholder
  - Forces HTTPS for Firebase URLs
  - Disables Next.js optimization for Firebase Storage (prevents 400 errors)

### 2. **Updated All Image References**
- ✅ `src/components/listing-card.tsx`
- ✅ `src/app/listings/[id]/page.tsx`
- ✅ `src/app/my-listings/page.tsx`

### 3. **Created CORS Configuration**
- **File**: `cors.json`
- Allows GET requests from all origins

---

## 🚀 Deployment Steps

### Step 1: Configure Firebase Storage CORS

Run this command to set CORS rules on your Firebase Storage bucket:

```bash
gsutil cors set cors.json gs://studio-8585842935-1485a.appspot.com
```

**Alternative (if gsutil not installed):**

1. Install Google Cloud SDK:
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. Set CORS:
   ```bash
   gsutil cors set cors.json gs://studio-8585842935-1485a.appspot.com
   ```

3. Verify CORS is set:
   ```bash
   gsutil cors get gs://studio-8585842935-1485a.appspot.com
   ```

### Step 2: Rebuild and Deploy to Vercel

```bash
# Build locally to test
npm run build

# If successful, push to GitHub
git add .
git commit -m "Fix: Image loading issues with OptimizedImage component"
git push origin main

# Vercel will auto-deploy from GitHub
```

### Step 3: Clear Vercel Cache (if needed)

If images still don't load after deployment:

1. Go to Vercel Dashboard
2. Select your project (studio1-ecru)
3. Go to Settings → Data Cache
4. Click "Purge Everything"
5. Redeploy

---

## 🧪 Testing Checklist

After deployment, test these scenarios:

### Homepage
- [ ] Category view displays property images
- [ ] Grid view displays property images
- [ ] Images load with smooth fade-in animation
- [ ] Placeholder shows for listings without images

### Listing Detail Page
- [ ] Carousel images load correctly
- [ ] Multiple images can be navigated
- [ ] Images display at correct aspect ratio
- [ ] Fallback placeholder shows if images fail

### My Listings Dashboard
- [ ] User's listing images display
- [ ] Status badges visible over images
- [ ] Images maintain aspect ratio

### Network Tab Check
Open browser DevTools → Network tab:
- [ ] Images return status 200 (not 403, 404, or 400)
- [ ] No CORS errors in console
- [ ] Images load from `firebasestorage.googleapis.com`

---

## 🐛 Common Issues & Solutions

### Issue 1: Images show 403 Forbidden
**Cause**: CORS not configured or Firebase Storage rules too strict

**Solution**:
```bash
# Set CORS
gsutil cors set cors.json gs://studio-8585842935-1485a.appspot.com

# Check Storage rules allow read access
firebase deploy --only storage
```

### Issue 2: Images show 400 Bad Request
**Cause**: Next.js trying to optimize Firebase Storage images

**Solution**: Already fixed! `OptimizedImage` component sets `unoptimized={true}` for Firebase images.

### Issue 3: Images don't load, but console shows no errors
**Cause**: Next.js static optimization caching old image URLs

**Solution**:
```bash
# Clear .next cache
rm -rf .next
npm run build
```

### Issue 4: Images load locally but not on Vercel
**Cause**: Environment variables not set in Vercel

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all variables from `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. Redeploy

---

## 📊 Verification

### Check Image URLs
Images should follow this pattern:
```
https://firebasestorage.googleapis.com/v0/b/studio-8585842935-1485a.appspot.com/o/listings%2F{userId}%2F{listingId}%2F{imageId}?alt=media&token={token}
```

### Inspect Element
Right-click on an image → Inspect:
```html
<img
  src="https://firebasestorage.googleapis.com/..."
  loading="lazy"
  class="object-cover"
  style="opacity: 1;"
/>
```

### Console Logs
Should see:
- ✅ No CORS errors
- ✅ No 403/404/400 errors
- ✅ Images loading successfully

---

## 🔄 Rollback Plan

If images still don't work after these fixes:

1. **Revert to basic Image component**:
   ```tsx
   <img
     src={listing.images[0]}
     alt={listing.type}
     className="w-full h-full object-cover"
   />
   ```

2. **Check Firebase Console**:
   - Storage → Rules → Verify read access is allowed
   - Storage → Files → Verify images exist

3. **Test individual image URL**:
   - Copy image URL from Firestore
   - Paste in browser address bar
   - Should download/display image

---

## 📝 Next Steps After Fix

1. Monitor error logs in Vercel
2. Check Firebase Storage usage/quotas
3. Consider CDN caching for better performance
4. Implement image lazy loading optimization
5. Add Sentry for production error tracking

---

## ✅ Expected Result

After applying these fixes:
- ✅ All property images display correctly
- ✅ Smooth loading animations
- ✅ Fallback placeholders for missing images
- ✅ No CORS errors
- ✅ Fast image loading times
- ✅ Mobile responsive images

---

## 🆘 Still Having Issues?

If images still don't load after following this guide:

1. **Check browser console** for specific errors
2. **Test a direct Firebase Storage URL** in browser
3. **Verify CORS is set**: `gsutil cors get gs://your-bucket`
4. **Check Vercel deployment logs** for build errors
5. **Ensure Firebase credentials are correct** in Vercel environment variables

Contact support with:
- Browser console errors
- Network tab screenshot
- Vercel deployment URL
- Example image URL that's failing
