# Image Upload Debug Checklist

## Step 1: Check Firebase Storage Console

1. Go to: https://console.firebase.google.com/
2. Select project: `studio-8585842935-1485a`
3. Click **Storage** in left sidebar
4. Check if you see any folders under `listings/`

**Expected:** You should see folders like:
```
listings/
  {userId}/
    {listingId}/
      1728312000000_image1.jpg
```

**If empty:** Images aren't uploading. Check browser console for errors.

---

## Step 2: Test Upload with Browser Console

1. Open your site: http://localhost:9002
2. Login as a user
3. Click "Post a Listing"
4. Open browser DevTools (F12) → Console tab
5. Select 1-2 images
6. Watch console for logs:

**Expected logs:**
```
Image bedroom.jpg upload is 0% done
Image bedroom.jpg upload is 50% done
Image bedroom.jpg upload is 100% done
```

**If you see errors:**
```
❌ storage/unauthorized → Check Storage security rules
❌ storage/bucket-not-found → Verify bucket name in Firebase config
❌ storage/unauthenticated → User not logged in
```

---

## Step 3: Check Firestore Data

1. Go to Firebase Console → Firestore Database
2. Navigate to: `listings/{listingId}`
3. Check the `images` field

**Expected:**
```json
{
  "images": [
    "https://firebasestorage.googleapis.com/v0/b/studio-8585842935-1485a.firebasestorage.app/o/listings%2F...",
    "https://firebasestorage.googleapis.com/v0/b/studio-8585842935-1485a.firebasestorage.app/o/listings%2F..."
  ]
}
```

**If `images: []` (empty array):**
- Wait 10 seconds (non-blocking upload takes time)
- Refresh Firestore console
- If still empty, upload failed - check Storage console and browser console

---

## Step 4: Check Firebase Storage Rules

1. Firebase Console → Storage → Rules tab
2. Rules should look like:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{userId}/{listingId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish** if you made changes

---

## Step 5: Test Image Display

1. After upload completes, go to listing detail page
2. Right-click on image → "Open image in new tab"

**Expected:** Image opens in new tab at Firebase Storage URL

**If broken:**
```
❌ 404 Not Found → Image didn't upload
❌ 403 Forbidden → Storage rules too restrictive
❌ CORS error → CORS not configured (but yours should be fine)
```

---

## Step 6: Check Network Tab

1. DevTools → Network tab
2. Filter: "Img"
3. Upload an image
4. Look for requests to `firebasestorage.googleapis.com`

**Expected:**
- `POST` request with 200 status (upload)
- `GET` request with 200 status (display)

---

## Quick Test Script (Paste in Browser Console)

```javascript
// After creating a listing, run this:
const testListingId = "YOUR_LISTING_ID"; // Replace with actual ID

db.collection('listings').doc(testListingId).get().then(doc => {
  const data = doc.data();
  console.log('Listing data:', data);
  console.log('Images field:', data.images);
  console.log('Images count:', data.images?.length || 0);

  if (data.images?.length > 0) {
    console.log('✅ Images uploaded successfully!');
    console.log('First image URL:', data.images[0]);
  } else {
    console.log('❌ No images found. Check upload process.');
  }
});
```

---

## Expected Working Flow:

1. **User uploads 3 images**
2. **Listing created with `images: []`** (instant)
3. **Browser console shows:**
   ```
   Image bedroom.jpg upload is 100% done
   Image livingroom.jpg upload is 100% done
   Image kitchen.jpg upload is 100% done
   ```
4. **5-10 seconds later:** Firestore updated with URLs
5. **Refresh page:** Images appear on listing card

---

## If Still Not Working:

### Check Environment Variables:

```bash
# .env.local should have:
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-8585842935-1485a.firebasestorage.app
```

### Verify Firebase Config:

```typescript
// src/firebase/config.ts
export const firebaseConfig = {
  storageBucket: "studio-8585842935-1485a.firebasestorage.app",
  // ... other config
};
```

### Check CORS Configuration:

```bash
# Your cors.json looks correct. If needed, redeploy:
gsutil cors set cors.json gs://studio-8585842935-1485a.firebasestorage.app
```

---

## Contact Support If:

- [ ] Firebase Storage console shows uploaded images
- [ ] Firestore `images` field has URLs
- [ ] But images still don't display on frontend

**Then:** It's a Next.js Image component issue or CORS issue.

**Quick fix:** Try using regular `<img>` tag instead of Next.js `Image`:
```tsx
<img
  src={listing.images[0]}
  alt={listing.name || listing.type}
  className="w-full h-full object-cover"
/>
```

If this works, it's a Next.js Image configuration issue.
