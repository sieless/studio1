# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Key-2-Rent is a property rental marketplace built for Machakos, Kenya, using Next.js 15, Firebase, and Google Genkit AI. The platform connects landlords with tenants through an intuitive interface with AI-powered listing analysis.

## Development Commands

```bash
# Development
npm run dev              # Start dev server on port 9002 with Turbopack
npm run genkit:dev       # Start Genkit AI dev server
npm run genkit:watch     # Start Genkit with auto-reload

# Build & Deploy
npm run build            # Production build (sets NODE_ENV=production)
npm run start            # Start production server
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint

# Firebase
firebase deploy --only firestore:rules    # Deploy Firestore security rules
firebase deploy                           # Full Firebase deployment
```

## Architecture Overview

### Firebase Integration Pattern

**Critical: Do NOT modify `initializeFirebase()` function in `/src/firebase/index.ts`**

The app uses a custom Firebase initialization pattern to prevent "no-options" errors in production:

1. Firebase is initialized client-side with config from `/src/firebase/config.ts`
2. All Firebase SDKs are accessed via provider hooks: `useFirestore()`, `useAuth()`, `useUser()`
3. Custom hooks from `/src/firebase/firestore/` provide reactive data access

### Non-Blocking Updates Architecture

The app uses a **non-blocking update pattern** for Firestore writes to prevent UI blocking:

- **Non-blocking functions** in `/src/firebase/non-blocking-updates.tsx`:
  - `updateDocumentNonBlocking()` - Fire-and-forget updates
  - `setDocumentNonBlocking()` - Fire-and-forget sets
  - `addDocumentNonBlocking()` - Fire-and-forget creates
  - `deleteDocumentNonBlocking()` - Fire-and-forget deletes

- **Error handling**: Uses `errorEmitter` from `/src/firebase/error-emitter.ts` to emit permission errors to a global listener (`FirebaseErrorListener` component)

**When to use non-blocking updates:**
- Image uploads (listing creation with images)
- User profile updates that don't affect immediate UI
- Background sync operations

**When NOT to use:**
- Critical updates that require confirmation before proceeding
- Operations where user needs immediate feedback on success/failure

### Image Management System

The app uses a **new image system** (as of latest update):

**Components:**
- `/src/components/image-gallery.tsx` - Horizontal scrolling gallery with thumbnails for viewing
- `/src/components/image-upload.tsx` - Drag-to-reorder upload interface with preview grid
- Images are uploaded to Firebase Storage via `/src/firebase/storage.ts`

**Important:**
- Old `optimized-image.tsx` and `image-utils.ts` have been removed
- Use native Next.js `Image` component with `unoptimized` prop for Firebase Storage URLs
- Image ordering matters: first image becomes the cover photo

### Admin System

**Admin Email:** `titwzmaihya@gmail.com` (defined in `/src/lib/admin.ts`)

Admin features accessible at `/admin`:
- User management (suspend/delete users)
- Listing management (update status, delete listings)
- Analytics dashboard (stats, breakdowns)
- Route protection via `isAdmin()` utility

Admin routes are protected - non-admin users are redirected to home.

### AI Integration (Genkit)

AI flows in `/src/ai/flows/`:
- `image-analysis-for-listing.ts` - Analyzes property images and suggests tags/improvements
- Uses Gemini 2.5 Flash model (configured in `/src/ai/genkit.ts`)
- Called via server actions in `/src/app/actions.ts`

**To add new AI flows:**
1. Create flow in `/src/ai/flows/`
2. Define input/output schemas with Zod
3. Export function and call from server actions
4. Test with `npm run genkit:dev`

### Data Model & Security

**Firestore Collections:**
- `/users/{userId}` - User profiles (private, owner-only access)
- `/listings/{listingId}` - Property listings (public read, owner write)
- `/rental_types/{rentalTypeId}` - Rental categories (public read-only)

**Key Security Rules (from `firestore.rules`):**
- Users can only read/write their own profiles
- Listings use **denormalized `userId`** for ownership checks (avoids costly `get()` calls)
- Listing creation requires: `type, location, price, contact, status, userId, createdAt`
- Ownership transfers are prevented (userId cannot change on update)

**UserProfile type includes:**
- `suspended?: boolean` - Admin can suspend users
- `createdAt?: Timestamp` - For analytics

**Listing type includes:**
- `status: 'Vacant' | 'Occupied' | 'Available Soon'`
- `businessTerms?: string` - For business listings
- `deposit`, `depositMonths` - Optional deposit info

### Constants & Configuration

Location and property types are defined in `/src/lib/constants.ts`:
- `locations[]` - Hardcoded Machakos locations
- `houseTypes[]` - Property categories
- `allFeatureOptions` - Separate features for residential vs business listings

**When adding locations/types:** Update constants file and rebuild.

### Authentication Flow

Multiple auth methods supported:
- Email/Password (Firebase Auth)
- Phone/OTP (Kenyan format validation)
- GitHub OAuth

**Auth hooks:**
- `useUser()` - Returns `{ user, isUserLoading }`
- `useAuth()` - Returns Firebase Auth instance
- `useFirestore()` - Returns Firestore instance

**Non-blocking login:** Uses `/src/firebase/non-blocking-login.tsx` for background auth state updates.

### Component Patterns

**Listing Cards:**
- Main card: `/src/components/listing-card.tsx`
- Shows cover image with photo count badge
- Displays status badge with dynamic colors (via `getStatusClass()`)

**Forms:**
- Use React Hook Form + Zod validation
- Form schemas defined in component files
- shadcn/ui form components from `/src/components/ui/form.tsx`

**Image Display:**
- Always use Next.js `Image` with `unoptimized` prop for Firebase URLs
- Fallback to `DefaultPlaceholder` component for missing images
- Use `ImageGallery` for multi-image display

## Environment Variables Required

```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GOOGLE_GENAI_API_KEY
```

## Common Patterns & Conventions

### Adding New Listing Fields

1. Update TypeScript types in `/src/types/index.ts`
2. Update form schema in `/src/components/add-listing-modal.tsx`
3. Update Firestore security rules if field affects authorization
4. Update listing cards/detail pages to display new field

### Working with Images

**Upload flow:**
1. User selects images → preview in `ImageUpload` component
2. Listing created with empty `images: []`
3. Images upload to Storage in parallel (via `uploadImage()`)
4. Firestore updated with image URLs using `updateDocumentNonBlocking()`

**Why this pattern?** Prevents blocking UI while large images upload.

### Error Handling

- Permission errors auto-detected via `errorEmitter` pattern
- Display errors via `useToast()` hook
- Firestore permission errors trigger global listener in `FirebaseErrorListener`
- Always wrap critical operations in try/catch with user-facing toast messages

## Development Port

The dev server runs on **port 9002** (not the default 3000) to avoid conflicts. This is configured in `package.json`.

## Deployment Notes

- Build sets `NODE_ENV=production` explicitly (required for Firebase config)
- Firestore rules must be deployed separately: `firebase deploy --only firestore:rules`
- See `DEPLOYMENT.md` for full deployment guide
- Admin features require manual email configuration in `/src/lib/admin.ts`
