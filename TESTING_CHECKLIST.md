# 🧪 Key-2-Rent Testing Checklist

**Last Updated**: Oct 7, 2025
**Status**: Pre-Launch Testing
**Target Launch**: Monday, Oct 13, 2025

---

## 📋 PRE-LAUNCH TESTING CHECKLIST

### ✅ Phase 1: Core Features (Must Test Before Launch)

#### **1. Authentication**
- [ ] **Email/Password Signup**
  - Navigate to `/signup`
  - Create account with email/password
  - Verify redirect to homepage
  - Check user profile created in Firestore (`/users/{userId}`)
  - Verify `canViewContacts: true` is set

- [ ] **Phone/OTP Signup**
  - Navigate to `/signup`
  - Enter Kenyan phone number (+254...)
  - Receive and enter OTP
  - Verify redirect to homepage
  - Check user profile created

- [ ] **GitHub OAuth**
  - Click "Sign in with GitHub"
  - Authorize access
  - Verify redirect to homepage

- [ ] **Login**
  - Navigate to `/login`
  - Login with existing account
  - Verify successful authentication

- [ ] **Logout**
  - Click user menu
  - Click logout
  - Verify redirect to homepage

---

#### **2. Listing CRUD (Create, Read, Update, Delete)**

##### **Create Listing**
- [ ] Navigate to `/` (homepage)
- [ ] Click "Post a Listing" button
- [ ] Fill out form:
  - Property type (select from dropdown)
  - Location (select from list)
  - Price (enter number)
  - Contact (phone number)
  - Features (select relevant ones)
  - Upload 2-3 images
- [ ] Submit form
- [ ] Verify success toast appears
- [ ] Check listing appears in Firestore (`/listings/{listingId}`)
- [ ] Verify images uploaded to Storage (`listings/{userId}/...`)

##### **Read Listing**
- [ ] Navigate to homepage
- [ ] See listings displayed in cards
- [ ] Click on a listing card
- [ ] Verify detail page loads (`/listings/{id}`)
- [ ] Verify all fields display correctly:
  - Images (carousel if multiple)
  - Price
  - Location
  - Features
  - Contact (should be visible in FREE mode)
  - Status badge

##### **Update Listing**
- [ ] Navigate to `/my-listings`
- [ ] Click "Mark as Occupied" on a listing
- [ ] Verify status changes
- [ ] Check Firestore updated
- [ ] Verify badge color changes on card

##### **Delete Listing**
- [ ] Navigate to `/my-listings`
- [ ] Click delete button (trash icon)
- [ ] Confirm deletion in dialog
- [ ] Verify listing removed from page
- [ ] Check listing deleted in Firestore

---

#### **3. Image Upload System**
- [ ] Create new listing with 5 images
- [ ] Verify images compress (check file sizes in Storage)
- [ ] Verify thumbnails generated
- [ ] Check first image becomes cover photo
- [ ] Navigate to listing detail
- [ ] Verify image gallery works (left/right navigation)
- [ ] Verify thumbnail row displays
- [ ] Click thumbnails → verify main image changes

---

#### **4. Filtering & Search**
- [ ] Navigate to homepage
- [ ] Use location filter → verify results update
- [ ] Use property type filter → verify results update
- [ ] Use price filter → verify results update
- [ ] Combine multiple filters → verify correct results
- [ ] Clear filters → verify all listings show

---

### ✅ Phase 2: Admin Features (Admin Testing Only)

#### **5. Admin Dashboard Access**
- [ ] Login as admin (`titwzmaihya@gmail.com`)
- [ ] Navigate to `/admin`
- [ ] Verify dashboard loads (not redirected)
- [ ] Verify 3 tabs visible:
  - Users Management
  - Listings Management
  - Payment Settings

#### **6. Admin - Users Management**
- [ ] Click "Users Management" tab
- [ ] Verify users table displays
- [ ] Check user count matches
- [ ] Test suspend user:
  - Click suspend button
  - Confirm action
  - Verify user suspended in Firestore
- [ ] Test delete user (if applicable)

#### **7. Admin - Listings Management**
- [ ] Click "Listings Management" tab
- [ ] Verify listings table displays
- [ ] Test update status:
  - Click status dropdown
  - Change to different status
  - Verify Firestore updated
- [ ] Test delete listing
  - Click delete
  - Confirm
  - Verify deletion

#### **8. Admin - Payment Settings** ⭐ **CRITICAL**
- [ ] Click "Payment Settings" tab
- [ ] **Verify Platform Status shows: 🟢 FREE**

##### **Test Contact Payment Toggle**
- [ ] Click "Enable Contact Payments" toggle
- [ ] **IMPORTANT: DO NOT LEAVE IT ON - This is just a test**
- [ ] Verify confirmation dialog appears
- [ ] Click "Activate Now"
- [ ] Verify platform status changes to: 🔴 PAID
- [ ] Open new tab → go to homepage
- [ ] Click on any listing
- [ ] **Verify contact is now hidden** (shows "Unlock Contact" button)
- [ ] Click "Unlock Contact" → verify payment modal opens
- [ ] **TURN OFF TOGGLE** → verify contact shows again
- [ ] **IMPORTANT: Leave toggle OFF for launch**

##### **Test Featured Listings Toggle**
- [ ] Click "Enable Featured Listings" toggle
- [ ] Verify confirmation dialog
- [ ] Click activate → verify settings update
- [ ] Turn OFF toggle (don't leave enabled)

##### **Test Boosted Vacancy Toggle**
- [ ] Click "Enable Boosted Vacancy" toggle
- [ ] Verify confirmation dialog
- [ ] Click activate → verify settings update
- [ ] Turn OFF toggle (don't leave enabled)

##### **Test Price Updates**
- [ ] Change "Contact Payment Amount" to 150
- [ ] Click "Save Price"
- [ ] Verify toast confirmation
- [ ] Check Firestore updated (`/platformSettings/config`)

##### **Verify Real-Time Updates**
- [ ] Open admin panel in two browser tabs
- [ ] Toggle feature in Tab 1
- [ ] **Verify Tab 2 updates automatically** (no refresh needed)

---

### ✅ Phase 3: Feature Flags (Verify Smart Behavior)

#### **9. Payment Gate Logic**

##### **When Contact Payments OFF (Default)**
- [ ] Navigate to homepage
- [ ] Verify ALL listings show contact directly (green button)
- [ ] Click contact button → verify phone call initiates
- [ ] Go to listing detail page
- [ ] Verify contact visible
- [ ] No "Unlock Contact" button should appear

##### **When Contact Payments ON (Admin Toggled)**
- [ ] Admin toggles "Enable Contact Payments" ON
- [ ] Navigate to homepage
- [ ] Verify listings show "Unlock Contact - KES 100" button
- [ ] Click button → verify payment modal opens
- [ ] Modal should say "🚧 Coming Soon: M-Pesa integration"
- [ ] Click cancel → modal closes
- [ ] **Turn toggle OFF before continuing**

---

#### **10. Featured/Boosted Badges (Future Testing)**

##### **Test Featured Badge Display**
- [ ] Manually add `isFeatured: true` to a listing in Firestore
- [ ] Navigate to homepage
- [ ] Verify listing shows **yellow "Featured"** badge (top-left)
- [ ] Badge should have star icon
- [ ] Remove `isFeatured` field after testing

##### **Test Boosted Badge Display**
- [ ] Manually add `isBoosted: true` to a listing in Firestore
- [ ] Navigate to homepage
- [ ] Verify listing shows **purple "Boosted"** badge (top-left)
- [ ] Badge should have zap icon
- [ ] Remove `isBoosted` field after testing

##### **Test Badge Priority (Featured > Boosted)**
- [ ] Set both `isFeatured: true` AND `isBoosted: true`
- [ ] Verify only "Featured" badge shows (featured takes priority)

---

### ✅ Phase 4: Mobile Testing

#### **11. Mobile Responsiveness**
- [ ] Open site on mobile device (or Chrome DevTools mobile view)
- [ ] Test homepage layout:
  - Listings display in single column
  - Images load correctly
  - Filters accessible via menu
- [ ] Test listing detail page:
  - Image gallery swipeable
  - All info visible
  - Contact button accessible
- [ ] Test forms (signup, create listing):
  - Inputs properly sized
  - Keyboard doesn't obscure inputs
  - Image upload works
- [ ] Test admin panel:
  - Tabs work on mobile
  - Toggles easily clickable
  - Tables scroll horizontally

---

### ✅ Phase 5: Performance & Error Handling

#### **12. Performance Checks**
- [ ] Homepage loads in < 3 seconds
- [ ] Images load progressively (blur → full)
- [ ] No layout shifts during load
- [ ] Smooth scrolling on listing grid
- [ ] Admin dashboard loads fast

#### **13. Error Handling**
- [ ] **Test offline mode**:
  - Disconnect internet
  - Try to load page
  - Verify error message appears
  - Reconnect → verify recovery

- [ ] **Test bad listing ID**:
  - Navigate to `/listings/fake-id-12345`
  - Verify "Listing not found" message
  - Verify back button works

- [ ] **Test unauthorized admin access**:
  - Logout
  - Navigate to `/admin`
  - Verify redirect to homepage OR login

- [ ] **Test image upload failure**:
  - Try uploading 10MB image (over limit)
  - Verify error toast appears
  - Verify form doesn't submit

---

## 🚀 PRE-DEPLOYMENT CHECKLIST

### **Before Running `npm run build`**
- [ ] All tests above passed
- [ ] Admin panel toggles are ALL OFF (FREE mode)
- [ ] No test data in Firestore (clean database)
- [ ] Firebase rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Environment variables set (`.env.local`)

### **After Build, Before Deploy**
- [ ] `npm run build` succeeds (no errors)
- [ ] `npm run typecheck` passes (or acceptable errors documented)
- [ ] No console errors in dev mode
- [ ] All images display correctly
- [ ] Admin panel accessible

### **Firebase Configuration**
- [ ] Firestore rules deployed
- [ ] Storage rules allow read/write
- [ ] Storage CORS configured (`gsutil cors set cors.json ...`)
- [ ] Authentication methods enabled (Email, Phone, GitHub)

### **Final Verification**
- [ ] Test on production URL (not localhost)
- [ ] Create test account on production
- [ ] Post test listing on production
- [ ] Verify admin panel on production
- [ ] **Confirm all payment toggles OFF on production**

---

## 📝 TESTING NOTES & ISSUES LOG

### **Issues Found During Testing**:
*(Add notes here as you test)*

| Date | Issue | Status | Notes |
|------|-------|--------|-------|
| Oct 7 | Example: Image upload slow | Open | Need to investigate compression |

---

## 🎯 POST-LAUNCH MONITORING CHECKLIST

### **First 24 Hours After Launch**
- [ ] Monitor Firebase Console for errors
- [ ] Check Firestore write/read counts (ensure within quota)
- [ ] Monitor Storage usage
- [ ] Check for user-reported issues
- [ ] Verify no payment gates blocking users (toggle should be OFF)

### **First Week**
- [ ] Gather user feedback
- [ ] Track signup rate
- [ ] Track listing creation rate
- [ ] Monitor page load times (Google Analytics)
- [ ] Check for any security issues

---

## 🔧 TROUBLESHOOTING GUIDE

### **Contact Not Showing**
1. Check admin panel → Payment Settings
2. Verify "Contact Payments" toggle is **OFF**
3. Check browser console for errors
4. Verify Firestore rules allow read on `platformSettings`

### **Admin Panel Not Loading**
1. Verify logged in as admin email
2. Check browser console for errors
3. Verify Firebase auth working
4. Check `/admin` route exists in Next.js

### **Images Not Displaying**
1. Check Firebase Storage rules
2. Verify CORS configured
3. Check browser Network tab for 403/404 errors
4. Verify image URLs valid in Firestore

### **Payment Toggle Doesn't Work**
1. Check Firestore rules (admin write permission)
2. Verify admin email matches `isAdmin()` check
3. Check browser console for permission errors
4. Verify `platformSettings/config` document exists

---

## ✅ READY FOR LAUNCH CRITERIA

**All of these must be TRUE before Monday launch:**

- ✅ All Phase 1 tests passed
- ✅ Admin panel accessible and working
- ✅ **All payment toggles OFF** (platform in FREE mode)
- ✅ Firebase rules deployed
- ✅ Production build succeeds
- ✅ Mobile tested
- ✅ No critical errors in console
- ✅ Backup plan documented (rollback procedure)

**Platform Mode for Launch**: 🟢 **FREE**

---

**Testing Status**: 🔴 Not Yet Tested
**Next Step**: Run through checklist systematically
**Estimated Testing Time**: 2-3 hours
**Best Time to Test**: Thursday-Friday (before weekend)

---

**⚠️ CRITICAL REMINDER**:
**DO NOT activate payment features before launch. Launch in FREE mode, gather users, then activate payments later via admin toggle.**
