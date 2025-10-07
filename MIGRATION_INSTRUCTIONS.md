# Migration Instructions for Key-2-Rent Image & Multi-Unit Fix

## What Was Fixed

### ✅ Completed Automatically:
1. **TypeScript Types Updated** - Added `totalUnits` and `availableUnits` to Listing type
2. **Form Updated** - Add-listing-modal now includes multi-unit fields
3. **Status Badge Colors Fixed** - Changed from Yellow to proper colors:
   - 🟢 Green = Vacant
   - 🔴 Red = Occupied
   - 🟠 Orange = Available Soon
4. **Multi-Unit Display** - Listing cards now show "X of Y units available" badge
5. **Firestore Rules Updated** - Added `images` to required fields and documented new optional fields
6. **Firestore Rules Deployed** - Security rules successfully deployed to Firebase

## ⚠️ Manual Step Required: Run Migration Script

The migration script needs to run ONCE to fix existing listings in the database.

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/studio-8585842935-1485a/settings/serviceaccounts/adminsdk)
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Save the downloaded file as `serviceAccountKey.json` in the project root

### Step 2: Run Migration

```bash
# The script is already at: scripts/migrate-listings.js
# firebase-admin is already installed

# Simply run:
node scripts/migrate-listings.js
```

### What the Migration Does:

The script will:
1. Add empty `images: []` array to any listing that doesn't have one
2. Add `totalUnits: 1` to listings without it
3. Set `availableUnits` based on current status:
   - Vacant → availableUnits = totalUnits (or 1)
   - Occupied → availableUnits = 0
   - Available Soon → availableUnits = 0

### Expected Output:

```
✅ Firebase Admin initialized successfully

🔄 Starting migration...

📊 Found X listings to check

  📷 Adding images array to listing: xxx
  🏢 Adding totalUnits (1) to listing: xxx
  ✨ Adding availableUnits (1) to listing: xxx

💾 Committing X updates to Firestore...
✅ Migration completed successfully!

📈 Migration Summary:
   Updated: X
   Skipped: Y
   Total: Z

🎉 Migration script completed
```

## Image Upload Flow (Already Working)

The image upload system is already properly configured:

1. ✅ Firebase Storage initialized (`src/firebase/storage.ts`)
2. ✅ Storage rules configured (`storage.rules`)
3. ✅ Listings created with empty `images: []` array
4. ✅ Images uploaded to Storage in parallel
5. ✅ Firestore updated with image URLs (non-blocking)

**The only issue was existing listings missing the images field - the migration fixes this.**

## Testing Checklist

After running the migration:

- [ ] Create a new listing with images
- [ ] Verify images appear on listing card
- [ ] Create a multi-unit listing (totalUnits > 1)
- [ ] Verify "X of Y units available" badge appears
- [ ] Check status badges have correct colors:
  - [ ] Vacant = Green
  - [ ] Occupied = Red
  - [ ] Available Soon = Orange
- [ ] Update availableUnits on a multi-unit listing
- [ ] Verify badge updates correctly

## Files Modified

- `src/types/index.ts` - Added totalUnits, availableUnits fields
- `src/components/add-listing-modal.tsx` - Added multi-unit form fields
- `src/components/listing-card.tsx` - Added multi-unit badge display
- `src/lib/utils.ts` - Fixed status badge colors
- `firestore.rules` - Added images to required fields, documented new fields
- `firebase.json` - Fixed rules file path (was "firestore rules", now "firestore.rules")
- `scripts/migrate-listings.js` - NEW migration script

## Security Notes

- Service account key has **admin access** to your Firebase project
- **Never commit** `serviceAccountKey.json` to git (already in .gitignore)
- Delete the key after migration if you don't need it for other admin tasks

## Questions?

- Check Firebase Console: https://console.firebase.google.com/project/studio-8585842935-1485a
- Check deployment logs: `firebase deploy --only firestore:rules` (already done)
- Verify Storage rules: `firebase deploy --only storage` (if needed)
