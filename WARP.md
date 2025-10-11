# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Key-2-Rent is a property rental marketplace for Kenya built with Next.js 15, Firebase, and Google Genkit AI. The platform connects landlords with tenants through categorized listings with advanced filtering, AI-powered image analysis, M-Pesa payment integration, and messaging system.

## Development Commands

```bash
# Development
npm run dev              # Start dev server on port 9002 with Turbopack
npm run genkit:dev       # Start Genkit AI development server  
npm run genkit:watch     # Start Genkit with auto-reload

# Build & Quality
npm run build            # Production build (sets NODE_ENV=production)
npm run start            # Start production server
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint

# Testing & Security
npm run security-audit   # Run security checks (secrets, env files, npm audit)
npm run check-secrets    # Check for hardcoded API keys/secrets
npm run verify-gitignore # Verify no .env files are tracked

# Firebase
firebase deploy --only firestore:rules    # Deploy Firestore security rules
firebase deploy --only storage:rules      # Deploy Storage security rules
firebase deploy                          # Full deployment
```

## Architecture Overview

### Firebase Integration Pattern

**Critical: Never modify `initializeFirebase()` in `/src/firebase/index.ts`**

The app uses a custom Firebase initialization to prevent production errors:
- Firebase config from `/src/firebase/config.ts` 
- All Firebase SDKs accessed via provider hooks: `useFirestore()`, `useAuth()`, `useUser()`
- Custom reactive data hooks from `/src/firebase/firestore/`

### Non-Blocking Updates Architecture

Critical pattern for Firestore operations to prevent UI blocking:

**Functions in `/src/firebase/non-blocking-updates.tsx`:**
- `updateDocumentNonBlocking()` - Fire-and-forget updates
- `setDocumentNonBlocking()` - Fire-and-forget sets  
- `addDocumentNonBlocking()` - Fire-and-forget creates
- `deleteDocumentNonBlocking()` - Fire-and-forget deletes

**Error handling:** Uses `errorEmitter` from `/src/firebase/error-emitter.ts` with global `FirebaseErrorListener` component.

**Use non-blocking for:** Image uploads, profile updates, background sync
**Don't use for:** Critical operations requiring immediate feedback

### Data Model & Security

**Firestore Collections:**
- `/users/{userId}` - User profiles (owner-only access)
- `/listings/{listingId}` - Property listings (public read, owner write)  
- `/conversations/{conversationId}` - Messaging between users
- `/transactions/{transactionId}` - M-Pesa payment records
- `/platformSettings/config` - Admin toggleable features

**Key Security Rules:**
- Denormalized `userId` fields for ownership (avoids expensive `get()` calls)
- Admin functions protected by `isAdmin()` utility (admin email: `titwzmaihya@gmail.com`)
- User suspension via `suspended` field in UserProfile

### AI Integration (Genkit)

**Configuration:** `/src/ai/genkit.ts` - Uses Gemini 2.5 Flash model
**Flows:** `/src/ai/flows/` - Image analysis for property listings
**Server Actions:** `/src/app/actions.ts` - Bridge between UI and AI flows

To add AI flows:
1. Create flow in `/src/ai/flows/` with Zod schemas
2. Export function and call from server actions  
3. Test with `npm run genkit:dev`

### Image Management System

**Components:**
- `/src/components/image-gallery.tsx` - Horizontal scrolling viewer
- `/src/components/image-upload.tsx` - Drag-to-reorder upload interface

**Critical:** Always use Next.js `Image` component with `unoptimized` prop for Firebase Storage URLs. First image becomes cover photo.

### Payment Integration (M-Pesa)

**Services:** `/src/lib/mpesa/` - M-Pesa STK Push integration
**Types:** `Transaction`, `PlatformSettings` in `/src/types/index.ts`
**Features:** Contact access subscriptions, featured listings, boosted listings
**Admin Control:** All payment features toggle via `/platformSettings/config`

### Location & Property Data

**Constants:** `/src/lib/constants.ts`
- `kenyanCounties` - All 47 Kenyan counties
- `popularAreasByCounty` - Common areas within counties
- `houseTypes` - Property categories  
- `allFeatureOptions` - Separate features for residential vs business

### Component Patterns

**Listing Display:**
- Main card: `/src/components/listing-card.tsx`
- Grid views: `/src/components/listing-grid.tsx` and `/src/components/categorized-listing-grid.tsx`
- Status badges with dynamic colors via `getStatusClass()`

**Forms:**
- React Hook Form + Zod validation
- shadcn/ui form components from `/src/components/ui/`
- Form schemas defined within component files

**Authentication:**
- Multiple methods: Email/Password, Phone/OTP, GitHub OAuth
- Hooks: `useUser()`, `useAuth()`, `useFirestore()`
- Non-blocking login via `/src/firebase/non-blocking-login.tsx`

### Admin System

**Access:** `/admin` routes (redirects non-admins to home)
**Features:** User management, listing moderation, analytics dashboard
**Protection:** `isAdmin()` utility checks against hardcoded admin email

## Environment Variables

Required for development:
```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GOOGLE_GENAI_API_KEY
```

## Development Conventions

### Adding New Listing Fields
1. Update types in `/src/types/index.ts`
2. Update form schema in `/src/components/add-listing-modal.tsx`
3. Update Firestore security rules if needed
4. Update display components (cards, detail pages)

### Working with Images
**Upload Flow:**
1. User selects → preview in `ImageUpload` 
2. Listing created with empty `images: []`
3. Images upload to Storage in parallel
4. Firestore updated with URLs via `updateDocumentNonBlocking()`

**Why this pattern:** Prevents UI blocking during large image uploads

### Error Handling
- Permission errors auto-detected via `errorEmitter` 
- Display via `useToast()` hook
- Global listener in `FirebaseErrorListener` component
- Always wrap critical operations in try/catch with user-facing messages

### Security Practices
- Pre-commit hooks check for hardcoded secrets
- Environment variable validation at runtime
- Phone number validation for Kenyan format
- Input sanitization and XSS protection
- Image file type and size restrictions

## Key Technical Details

**Port:** Development server runs on 9002 (not default 3000)
**Styling:** Tailwind CSS with shadcn/ui components + dark/light mode
**TypeScript:** Strict mode enabled, path aliases configured (`@/*`)
**Build:** Explicitly sets `NODE_ENV=production` (required for Firebase)
**Icons:** Lucide React for consistent icon system
**Deployment:** Firebase Hosting with Firestore/Storage rules

## Testing

Currently no automated test suite. When adding tests:
- Use the security audit commands for secret detection
- Test Firebase security rules in Firebase console
- Manually test payment flows with M-Pesa sandbox
- Test AI flows with `npm run genkit:dev` interface

## Common Issues

**Images not uploading:** Check Firebase Storage rules and file size limits
**Authentication failing:** Verify environment variables and Firebase console settings  
**Permission denied:** Redeploy Firestore rules with `firebase deploy --only firestore:rules`
**Build failures:** Ensure `NODE_ENV=production` is set during build
**AI flows not working:** Verify `GOOGLE_GENAI_API_KEY` is set and valid