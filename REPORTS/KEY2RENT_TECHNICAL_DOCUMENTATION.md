# KEY-2-RENT: TECHNICAL DOCUMENTATION

**Document Version**: 1.0
**Date**: October 8, 2025
**Classification**: Technical Documentation
**Target Audience**: Developers, DevOps Engineers, Technical Stakeholders

---

## TABLE OF CONTENTS

1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API & Integrations](#api--integrations)
5. [Security Implementation](#security-implementation)
6. [Performance & Optimization](#performance--optimization)
7. [Development Workflow](#development-workflow)
8. [Deployment Architecture](#deployment-architecture)
9. [Monitoring & Error Tracking](#monitoring--error-tracking)
10. [Technical Specifications](#technical-specifications)

---

## TECHNOLOGY STACK

### Frontend Technologies

#### Core Framework
- **Next.js 15.3.3** - React framework with App Router
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Turbopack for fast development
  - Image optimization

- **React 18.3.1** - UI library
  - Hooks-based architecture
  - Concurrent rendering
  - Automatic batching
  - Suspense support

- **TypeScript 5.x** - Type-safe development
  - Strict mode enabled
  - Type inference
  - Interface-based design
  - Compile-time error detection

#### UI & Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
  - Mobile-first responsive design
  - Dark mode support
  - Custom theme configuration
  - JIT (Just-In-Time) compilation

- **shadcn/ui** - Component library built on Radix UI
  - 25+ pre-built components
  - Accessible (ARIA compliant)
  - Customizable with Tailwind
  - Keyboard navigation support

- **Radix UI** - Unstyled, accessible components
  - Dialog, Dropdown, Select, Tabs, etc.
  - WAI-ARIA compliant
  - Focus management
  - Screen reader optimized

- **Lucide React** - Icon library (475+ icons)
  - Lightweight (tree-shakeable)
  - Consistent design
  - SVG-based

#### State & Forms
- **React Hook Form 7.54.2** - Form state management
  - Minimal re-renders
  - Built-in validation
  - TypeScript support
  - Controlled/uncontrolled inputs

- **Zod 3.24.2** - Schema validation
  - Type-safe validation
  - Runtime type checking
  - Custom error messages
  - Composable schemas

#### Additional Libraries
- **next-themes 0.3.0** - Dark/light mode
- **date-fns 3.6.0** - Date manipulation
- **embla-carousel-react 8.6.0** - Image carousels
- **recharts 2.15.1** - Analytics charts
- **axios 1.12.2** - HTTP client

### Backend Technologies

#### Backend-as-a-Service (BaaS)
- **Firebase 11.9.1** - Complete backend solution
  - **Firestore** - NoSQL database
  - **Authentication** - User management
  - **Storage** - File/image storage
  - **Hosting** - Static site hosting
  - **Security Rules** - Access control

#### AI & Machine Learning
- **Google Genkit 1.14.1** - AI framework
  - **@genkit-ai/googleai** - Google AI integration
  - **@genkit-ai/next** - Next.js integration
  - Gemini 2.5 Flash model
  - Image analysis
  - Text generation

#### Cloud Services
- **Cloudinary 2.7.0** - Image CDN
  - Image upload & storage
  - Automatic optimization
  - Format conversion
  - Responsive delivery

### DevOps & Monitoring

#### Error Tracking
- **Sentry 10.17.0** - Error monitoring
  - Client-side error tracking
  - Server-side error tracking
  - Performance monitoring
  - Session replay
  - Source maps support

#### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **npm** - Package management

### Version Summary

```json
{
  "node": ">=18.x",
  "next": "15.3.3",
  "react": "18.3.1",
  "typescript": "5.x",
  "firebase": "11.9.1",
  "tailwindcss": "3.4.1"
}
```

---

## SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  (Next.js 15 + React 18 + TypeScript)                   │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Web App │  │  Mobile  │  │  Admin   │              │
│  │  (PWA)   │  │  Browser │  │  Panel   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                             │
│  (Next.js API Routes + Server Actions)                  │
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  REST API  │  │   Server   │  │  Webhooks  │        │
│  │  Routes    │  │   Actions  │  │  (M-Pesa)  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FIREBASE   │  │  GOOGLE AI   │  │  CLOUDINARY  │
│              │  │              │  │              │
│ • Firestore  │  │ • Genkit     │  │ • Images     │
│ • Auth       │  │ • Gemini 2.5 │  │ • CDN        │
│ • Storage    │  │ • Analysis   │  │ • Transform  │
│ • Rules      │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Application Structure

```
Key-2-Rent/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── listings/
│   │   │   └── [id]/page.tsx    # Dynamic route
│   │   ├── my-listings/
│   │   │   ├── page.tsx         # Landlord dashboard
│   │   │   └── analytics.tsx    # Analytics component
│   │   ├── favorites/
│   │   │   └── page.tsx         # Saved listings
│   │   ├── messages/
│   │   │   └── page.tsx         # Messaging system
│   │   ├── admin/
│   │   │   ├── page.tsx         # Admin dashboard
│   │   │   └── diagnostics/
│   │   ├── api/
│   │   │   └── mpesa/
│   │   │       └── callback/route.ts
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Homepage
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── messaging/           # Chat components
│   │   ├── agreement/           # Agreement components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── listing-card.tsx
│   │   ├── image-gallery.tsx
│   │   └── [50+ more components]
│   │
│   ├── firebase/                # Firebase configuration
│   │   ├── config.ts            # Firebase credentials
│   │   ├── index.ts             # Initialization
│   │   ├── storage.ts           # Storage utilities
│   │   ├── firestore/           # Firestore hooks
│   │   │   ├── use-listings.ts
│   │   │   ├── use-user-profile.ts
│   │   │   └── [more hooks]
│   │   ├── non-blocking-updates.tsx
│   │   └── error-emitter.ts
│   │
│   ├── ai/                      # AI/Genkit flows
│   │   ├── genkit.ts            # Genkit configuration
│   │   ├── flows/
│   │   │   └── image-analysis-for-listing.ts
│   │   └── dev.ts
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── admin.ts
│   │   ├── validation.ts
│   │   ├── error-logger.ts
│   │   └── security/
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-favorites.ts
│   │   ├── use-start-conversation.ts
│   │   └── [more hooks]
│   │
│   ├── services/                # Business logic
│   │   └── favorites.ts
│   │
│   └── types/                   # TypeScript types
│       └── index.ts
│
├── public/                      # Static assets
│   ├── logo-1.png
│   └── [images]
│
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

### Data Flow Architecture

#### Listing Creation Flow
```
1. User fills form → React Hook Form validates
2. Form submits → Client-side validation (Zod)
3. Image upload → Firebase Storage (parallel uploads)
4. Create listing → Firestore document
5. Non-blocking update → Add image URLs to listing
6. Real-time update → UI reflects changes
7. AI analysis (optional) → Genkit analyzes images
```

#### Authentication Flow
```
1. User enters credentials → React Hook Form
2. Submit → Firebase Auth API
3. Success → User token stored in session
4. Fetch user profile → Firestore query
5. Update context → useUser hook
6. Redirect → Dashboard or intended page
```

#### Real-Time Updates Flow
```
1. User views listings page
2. useListings hook subscribes to Firestore
3. Firestore listener established
4. Any listing change → Firestore triggers update
5. Listener callback → State update
6. React re-renders → UI updates automatically
```

---

## DATABASE SCHEMA

### Firestore Collections

#### 1. `/users/{userId}`
User profile and account information

```typescript
interface UserProfile {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  displayName?: string;           // Full name
  phoneNumber?: string;           // Phone (254XXXXXXXXX)
  photoURL?: string;              // Profile picture URL
  createdAt: Timestamp;           // Account creation
  updatedAt?: Timestamp;          // Last update
  suspended?: boolean;            // Admin suspension flag
  role?: 'user' | 'admin';       // User role
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}
```

**Access Control**:
- Read: Owner only
- Write: Owner only
- Admin: Can read/write all

#### 2. `/listings/{listingId}`
Property listings

```typescript
interface Listing {
  id: string;                     // Auto-generated ID
  userId: string;                 // Owner UID
  landlordName: string;           // Owner display name

  // Property details
  type: 'Bedsitter' | '1BR' | '2BR' | '3BR' | 'House' | 'Hostel' | 'Business';
  location: string;               // Machakos location
  price: number;                  // Monthly rent (KES)
  deposit?: number;               // Security deposit (KES)
  depositMonths?: number;         // Deposit in months

  // Descriptions
  title: string;                  // Listing title
  description: string;            // Full description
  features: string[];             // Amenities list
  businessTerms?: string;         // For business properties

  // Images
  images: string[];               // Firebase Storage URLs
  coverImage?: string;            // Primary image

  // Status
  status: 'Vacant' | 'Occupied' | 'Available Soon';

  // Multi-unit support
  isMultiUnit: boolean;
  totalUnits?: number;
  availableUnits?: number;

  // Contact
  contact: string;                // Phone number
  whatsappNumber?: string;        // WhatsApp (optional)

  // Premium features
  isFeatured: boolean;            // Featured listing flag
  isBoosted: boolean;             // Boosted listing flag
  featuredUntil?: Timestamp;      // Expiry for featured
  boostedUntil?: Timestamp;       // Expiry for boosted

  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  views?: number;                 // View counter (future)
  contactClicks?: number;         // Contact clicks (future)
}
```

**Access Control**:
- Read: Public (anyone)
- Create: Authenticated users
- Update: Owner only (userId match)
- Delete: Owner or admin

**Indexes**:
- Composite: `(status, createdAt DESC)`
- Composite: `(location, status, createdAt DESC)`
- Composite: `(type, status, createdAt DESC)`
- Composite: `(isFeatured, isBoosted, status, createdAt DESC)`

#### 3. `/platformSettings/config`
Global platform configuration (admin-controlled)

```typescript
interface PlatformSettings {
  // Payment toggles
  contactPaymentEnabled: boolean;      // Contact payment gate
  featuredListingsEnabled: boolean;    // Featured listings
  boostedVacancyEnabled: boolean;      // Boosted listings

  // Pricing
  contactPaymentPrice: number;         // KES (default: 100)
  featuredListingPrice: number;        // KES (default: 500)
  boostedVacancyPrice: number;         // KES (default: 300)

  // Metadata
  lastUpdated: Timestamp;
  updatedBy: string;                   // Admin UID
}
```

**Access Control**:
- Read: Public
- Write: Admin only

#### 4. `/conversations/{conversationId}`
Messaging conversations (Phase 4)

```typescript
interface Conversation {
  id: string;
  participants: string[];           // [tenantId, landlordId]
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
}
```

#### 5. `/messages/{messageId}`
Individual messages (Phase 4)

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;               // Optional image attachment
  read: boolean;
  createdAt: Timestamp;
}
```

#### 6. `/viewings/{viewingId}`
Viewing schedule requests (Phase 4)

```typescript
interface Viewing {
  id: string;
  listingId: string;
  listingTitle: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId: string;
  landlordName: string;
  requestedDate: Timestamp;
  alternateDate?: Timestamp;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  declineReason?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### 7. `/applications/{applicationId}`
Rental applications (Phase 4)

```typescript
interface Application {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId: string;
  idNumber: string;                // National ID
  employment: {
    status: 'EMPLOYED' | 'SELF_EMPLOYED' | 'STUDENT' | 'OTHER';
    employer?: string;
    position?: string;
    monthlyIncome?: number;
  };
  references: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  moveInDate: Timestamp;
  additionalInfo?: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  declineReason?: string;
  approvedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### 8. `/agreements/{agreementId}`
Rental agreement templates (Phase 5)

```typescript
interface Agreement {
  id: string;
  listingId: string;
  landlordId: string;
  templateUrl: string;             // Firebase Storage URL
  templateName: string;
  uploadedAt: Timestamp;
}
```

#### 9. `/signedAgreements/{signedId}`
Signed agreements (Phase 5)

```typescript
interface SignedAgreement {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
  tenantDetails: {
    fullName: string;
    idNumber: string;
    phone: string;
    email: string;
    signatureUrl: string;          // Canvas signature image
  };
  originalAgreementUrl: string;
  signedAgreementUrl: string;      // PDF with signature overlay
  signedAt: Timestamp;
  createdAt: Timestamp;
}
```

### Firebase Storage Structure

```
/listings/{userId}/{listingId}/
  ├── image-0.jpg
  ├── image-1.jpg
  └── image-N.jpg

/agreements/{listingId}/
  └── template.pdf

/signatures/{listingId}/
  └── {tenantId}-signature.png

/messages/{conversationId}/
  ├── {messageId}-image.jpg
  └── ...

/profiles/{userId}/
  └── avatar.jpg
```

---

## API & INTEGRATIONS

### Firebase APIs

#### Authentication API
```typescript
// Email/Password
await signInWithEmailAndPassword(auth, email, password);
await createUserWithEmailAndPassword(auth, email, password);

// Phone/OTP
await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
await confirmationResult.confirm(code);

// OAuth (GitHub)
await signInWithPopup(auth, githubProvider);
```

#### Firestore API
```typescript
// Create
await addDoc(collection(db, 'listings'), listingData);

// Read
const docSnap = await getDoc(doc(db, 'listings', listingId));

// Update
await updateDoc(doc(db, 'listings', listingId), updates);

// Delete
await deleteDoc(doc(db, 'listings', listingId));

// Real-time listener
onSnapshot(query(collection(db, 'listings')), (snapshot) => {
  // Handle updates
});
```

#### Storage API
```typescript
// Upload
const storageRef = ref(storage, `listings/${userId}/${listingId}/image.jpg`);
await uploadBytes(storageRef, file);

// Get download URL
const url = await getDownloadURL(storageRef);

// Delete
await deleteObject(storageRef);
```

### Google Genkit AI API

```typescript
// AI Flow definition
export const analyzeListingImages = ai.defineFlow(
  {
    name: 'analyzeListingImages',
    inputSchema: z.object({
      images: z.array(z.string()),
      propertyType: z.string(),
    }),
    outputSchema: z.object({
      suggestions: z.array(z.string()),
      score: z.number(),
    }),
  },
  async (input) => {
    const { text } = await ai.generate({
      model: gemini15Flash,
      prompt: `Analyze property images...`,
    });
    return { suggestions, score };
  }
);
```

### M-Pesa API (Planned)

#### STK Push (Lipa Na M-Pesa)
```typescript
// Payment initiation endpoint
POST /api/mpesa/stk-push
{
  "phoneNumber": "254712345678",
  "amount": 100,
  "accountReference": "Contact Payment",
  "transactionDesc": "Key-2-Rent Contact Access"
}

// Callback URL
POST /api/mpesa/callback
{
  "ResultCode": 0,
  "ResultDesc": "Success",
  "TransactionID": "OEI2AK4Q16"
}
```

### WhatsApp Integration

```typescript
// WhatsApp link generation
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

// Pre-filled message template
const message = `Hi! I'm interested in your ${propertyType} listing at ${location} (KES ${price}/month). Is it still available?`;
```

### Cloudinary API

```typescript
// Image upload via server action
const result = await cloudinary.uploader.upload(file, {
  folder: `key2rent/listings/${listingId}`,
  transformation: [
    { width: 1920, height: 1080, crop: 'limit' },
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
  ],
});

return result.secure_url;
```

---

## SECURITY IMPLEMENTATION

### Firestore Security Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.email == 'titwzmaihya@gmail.com';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId);
    }

    // Listings collection
    match /listings/{listingId} {
      allow read: if true;  // Public read
      allow create: if isSignedIn() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.keys().hasAll([
                         'type', 'location', 'price', 'contact',
                         'status', 'userId', 'createdAt'
                       ]);
      allow update: if isOwner(resource.data.userId) &&
                       request.resource.data.userId == resource.data.userId;  // Prevent ownership transfer
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }

    // Platform settings
    match /platformSettings/config {
      allow read: if true;  // Public read
      allow write: if isAdmin();
    }

    // Conversations (Phase 4)
    match /conversations/{conversationId} {
      allow read: if isSignedIn() &&
                     request.auth.uid in resource.data.participants;
      allow create: if isSignedIn() &&
                       request.auth.uid in request.resource.data.participants;
      allow update: if isSignedIn() &&
                       request.auth.uid in resource.data.participants;
    }

    // Messages (Phase 4)
    match /messages/{messageId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() &&
                       request.resource.data.senderId == request.auth.uid;
      allow update: if isSignedIn() &&
                       request.resource.data.senderId == request.auth.uid;
    }

    // Viewings (Phase 4)
    match /viewings/{viewingId} {
      allow read: if isSignedIn() && (
                     request.auth.uid == resource.data.tenantId ||
                     request.auth.uid == resource.data.landlordId
                  );
      allow create: if isSignedIn() &&
                       request.resource.data.tenantId == request.auth.uid;
      allow update: if isSignedIn() &&
                       request.auth.uid == resource.data.landlordId;
    }

    // Applications (Phase 4)
    match /applications/{applicationId} {
      allow read: if isSignedIn() && (
                     request.auth.uid == resource.data.tenantId ||
                     request.auth.uid == resource.data.landlordId
                  );
      allow create: if isSignedIn() &&
                       request.resource.data.tenantId == request.auth.uid;
      allow update: if isSignedIn() &&
                       request.auth.uid == resource.data.landlordId;
    }

    // Agreements (Phase 5)
    match /agreements/{agreementId} {
      allow read: if true;  // Public read
      allow write: if isSignedIn() &&
                      request.resource.data.landlordId == request.auth.uid;
    }

    // Signed agreements (Phase 5)
    match /signedAgreements/{signedId} {
      allow read: if isSignedIn() && (
                     request.auth.uid == resource.data.tenantId ||
                     request.auth.uid == resource.data.landlordId
                  );
      allow create: if isSignedIn() &&
                       request.resource.data.tenantId == request.auth.uid;
    }
  }
}
```

### Firebase Storage Rules

**File**: `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isImageFile() {
      return request.resource.contentType.matches('image/.*');
    }

    function isPdfFile() {
      return request.resource.contentType == 'application/pdf';
    }

    function isUnder5MB() {
      return request.resource.size < 5 * 1024 * 1024;
    }

    // Listing images
    match /listings/{userId}/{listingId}/{fileName} {
      allow read: if true;
      allow write: if isSignedIn() &&
                      isImageFile() &&
                      isUnder5MB() &&
                      request.auth.uid == userId;
    }

    // Profile pictures
    match /profiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if isSignedIn() &&
                      isImageFile() &&
                      isUnder5MB() &&
                      request.auth.uid == userId;
    }

    // Agreement PDFs (Phase 5)
    match /agreements/{listingId}/{fileName} {
      allow read: if true;
      allow write: if isSignedIn() &&
                      isPdfFile() &&
                      isUnder5MB();
    }

    // Signature images (Phase 5)
    match /signatures/{listingId}/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() &&
                      isImageFile() &&
                      request.resource.size < 1 * 1024 * 1024;  // 1MB max
    }

    // Message images (Phase 4)
    match /messages/{conversationId}/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() &&
                      isImageFile() &&
                      isUnder5MB();
    }
  }
}
```

### Authentication Security

1. **Password Requirements**
   - Minimum 6 characters (Firebase default)
   - Can be strengthened with custom validation

2. **Phone Number Validation**
   ```typescript
   const phoneRegex = /^254[17]\d{8}$/;  // Kenyan format
   ```

3. **Email Validation**
   - Firebase built-in validation
   - Additional Zod schema validation

4. **Session Management**
   - Firebase Auth tokens (1 hour expiry)
   - Automatic token refresh
   - Secure HTTP-only cookies (server-side)

### Input Sanitization

```typescript
// XSS prevention
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);

// SQL injection prevention
// Not applicable (Firestore is NoSQL)

// Path traversal prevention
const safePath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
```

### CORS Configuration

```typescript
// next.config.mjs
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

### Environment Variables Security

```bash
# .env.local (NOT committed to Git)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
GOOGLE_GENAI_API_KEY=xxx  # Server-side only
SENTRY_DSN=xxx  # Server-side only
```

**Security Practices**:
- Server-only secrets (no `NEXT_PUBLIC_` prefix)
- Environment-specific variables
- Never commit `.env.local` to version control
- Use Vercel/Firebase environment variables in production

---

## PERFORMANCE & OPTIMIZATION

### Next.js Optimizations

#### 1. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Property"
  width={1920}
  height={1080}
  placeholder="blur"
  blurDataURL={placeholderDataUrl}
  loading="lazy"
  unoptimized={isFirebaseStorageUrl}  // Firebase Storage URLs
/>
```

#### 2. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,  // Client-side only
});
```

#### 3. Turbopack (Development)
```bash
npm run dev --turbopack  # 10x faster HMR
```

### Firestore Performance

#### 1. Query Optimization
```typescript
// Good: Indexed query
const q = query(
  collection(db, 'listings'),
  where('status', '==', 'Vacant'),
  where('location', '==', 'Mlolongo'),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// Bad: Full collection scan
const allListings = await getDocs(collection(db, 'listings'));
```

#### 2. Pagination
```typescript
// Load more pattern
const q = query(
  collection(db, 'listings'),
  orderBy('createdAt', 'desc'),
  limit(20),
  startAfter(lastDoc)  // Cursor-based pagination
);
```

#### 3. Caching Strategy
```typescript
// Enable offline persistence
enableIndexedDbPersistence(db);

// Cache-first read
const docSnap = await getDocFromCache(docRef)
  .catch(() => getDoc(docRef));  // Fallback to network
```

### Image Optimization

#### 1. Compression
```typescript
// Before upload
const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  mimeType: 'image/jpeg',
});
```

#### 2. Lazy Loading
```typescript
// Intersection Observer for lazy loading
const imgRef = useRef();
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      loadImage(imgRef.current);
    }
  });
  observer.observe(imgRef.current);
  return () => observer.disconnect();
}, []);
```

#### 3. Cloudinary Transformations
```
https://res.cloudinary.com/key2rent/image/upload/
  w_800,h_600,c_fill,q_auto:good,f_auto/
  listings/{listingId}/image.jpg
```

### Bundle Size Optimization

#### Current Bundle Sizes
```
Page                     Size       First Load JS
┌ ○ /                    5.2 kB     120 kB
├ ○ /listings/[id]       8.1 kB     125 kB
├ ○ /my-listings         12.3 kB    135 kB
├ ○ /admin               18.7 kB    145 kB
└ ○ /favorites           6.4 kB     122 kB
```

#### Optimization Techniques
1. **Tree Shaking** - Remove unused code
2. **Module Federation** - Share dependencies
3. **Compression** - Gzip/Brotli
4. **Minification** - Terser for JS, cssnano for CSS

### Lighthouse Scores (Target)

```
Performance:  90+
Accessibility: 95+
Best Practices: 95+
SEO:          100
```

---

## DEVELOPMENT WORKFLOW

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/sieless/Key-2-Rent.git
cd Key-2-Rent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Deploy Firebase rules (first time)
firebase login
firebase deploy --only firestore:rules,storage

# 5. Start dev server
npm run dev  # http://localhost:9002

# 6. Start Genkit (optional)
npm run genkit:dev  # http://localhost:4000
```

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server (port 9002)
npm run genkit:dev       # Start Genkit AI dev server
npm run genkit:watch     # Genkit with auto-reload

# Build & Production
npm run build            # Build for production (sets NODE_ENV=production)
npm run start            # Start production server
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint code linting

# Firebase
firebase deploy --only firestore:rules    # Deploy Firestore rules
firebase deploy --only storage            # Deploy Storage rules
firebase deploy                           # Full deployment
```

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request

# Hotfix
git checkout -b hotfix/critical-bug main
# Fix bug
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug
# Merge to main immediately
```

### Code Quality Standards

#### TypeScript
```typescript
// ✅ Good: Explicit types
interface ListingProps {
  listing: Listing;
  onEdit: (id: string) => void;
}

// ❌ Bad: Any types
function handleClick(data: any) { }
```

#### React Hooks
```typescript
// ✅ Good: Proper dependencies
useEffect(() => {
  fetchListings(userId);
}, [userId]);

// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchListings(userId);
}, []);  // ESLint warning
```

#### Error Handling
```typescript
// ✅ Good: Try-catch with user feedback
try {
  await createListing(data);
  toast.success('Listing created!');
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to create listing');
}

// ❌ Bad: Silent failure
await createListing(data).catch(() => {});
```

---

## DEPLOYMENT ARCHITECTURE

### Production Environment

#### Hosting Platform
- **Primary**: Vercel (https://vercel.com)
  - Automatic deployments from Git
  - Edge network CDN
  - Serverless functions
  - Environment variables management

- **Alternative**: Firebase Hosting
  - Firebase CLI deployment
  - CDN via Google Cloud
  - Integrated with Firebase services

#### Deployment Flow

```
┌─────────────┐
│   Git Push  │
│   to main   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌────────────┐
│   Vercel    │────▶│   Build    │
│  Webhook    │     │  (41 sec)  │
└─────────────┘     └─────┬──────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Deploy to  │
                   │  Production  │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    Live at   │
                   │ key2rent.app │
                   └──────────────┘
```

#### Environment Variables (Production)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Google AI
GOOGLE_GENAI_API_KEY

# Sentry (optional)
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT

# M-Pesa (future)
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_SHORTCODE
MPESA_PASSKEY
```

### CI/CD Pipeline (Future)

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test  # When tests are added

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/deploy@latest
        with:
          production: true
```

### Rollback Strategy

```bash
# Vercel rollback (instant)
vercel rollback [deployment-url]

# Firebase rollback
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION TARGET_SITE_ID

# Manual rollback
git revert [commit-hash]
git push origin main
# Auto-triggers new deployment
```

---

## MONITORING & ERROR TRACKING

### Sentry Configuration

#### Client-Side (`sentry.client.config.ts`)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% on errors
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Filter out noise
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  },
});
```

#### Server-Side (`sentry.server.config.ts`)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Firebase Analytics

```typescript
// Log custom events
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'listing_viewed', {
  listing_id: listingId,
  property_type: listing.type,
  location: listing.location,
});

// Track conversions
logEvent(analytics, 'contact_clicked', {
  listing_id: listingId,
  user_id: userId,
});
```

### Performance Monitoring

```typescript
// Core Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  const url = '/api/analytics';

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Health Check Endpoints

```typescript
// /api/health
export async function GET() {
  try {
    // Check Firestore connection
    await getDoc(doc(db, 'platformSettings', 'config'));

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firestore: 'up',
        storage: 'up',
        auth: 'up',
      },
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 503 });
  }
}
```

---

## TECHNICAL SPECIFICATIONS

### System Requirements

**Development Environment**:
- Node.js: 18.x or higher
- npm: 9.x or higher
- Git: 2.x or higher
- OS: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- RAM: 8GB minimum, 16GB recommended
- Storage: 10GB free space

**Production Environment**:
- Node.js runtime: 18.x (Vercel)
- CDN: Global edge network
- Database: Firestore (auto-scaling)
- Storage: Firebase Storage (auto-scaling)

### Browser Support

```
Chrome:    Last 2 versions ✓
Firefox:   Last 2 versions ✓
Safari:    Last 2 versions ✓
Edge:      Last 2 versions ✓
Mobile:    iOS 12+, Android 8+ ✓
```

### API Rate Limits

**Firestore**:
- Reads: 50,000/day (free tier)
- Writes: 20,000/day (free tier)
- Deletes: 20,000/day (free tier)

**Firebase Storage**:
- Downloads: 1 GB/day (free tier)
- Uploads: 10,000/day (free tier)

**Firebase Auth**:
- No hard limits on free tier
- Rate limiting: 100 requests/second

**Google Genkit**:
- Depends on Gemini API limits
- Free tier: 60 requests/minute

### Build Specifications

```
Build Time:       34-41 seconds
Bundle Size:      ~2.5 MB (gzipped)
Image Assets:     Optimized via Cloudinary
Code Splitting:   Automatic (Next.js)
Minification:     Terser (production)
Source Maps:      Generated for Sentry
```

### Database Limits

**Firestore Document**:
- Max size: 1 MB
- Max depth: 20 levels
- Max array elements: No limit (but affects performance)

**Firestore Collection**:
- No limit on document count
- Indexing: Automatic for simple queries
- Composite indexes: Manual configuration required

---

## APPENDIX

### Useful Commands

```bash
# Development
npm run dev                          # Start dev server
npm run build                        # Production build
npm run typecheck                    # Type checking
npm run lint                         # Linting

# Firebase
firebase login                       # Login to Firebase
firebase projects:list               # List projects
firebase use <project-id>            # Select project
firebase deploy --only firestore:rules  # Deploy rules
firebase deploy --only storage       # Deploy storage rules
firebase firestore:indexes           # View indexes

# Git
git status                           # Check status
git log --oneline --graph --all      # View history
git diff                             # View changes

# Debugging
npm run dev -- --inspect             # Node.js debugging
npm run build -- --profile           # Build profiling
```

### Common Issues & Solutions

**Issue**: Build fails with "Module not found"
**Solution**: `rm -rf node_modules package-lock.json && npm install`

**Issue**: Firestore permission denied
**Solution**: Redeploy rules: `firebase deploy --only firestore:rules`

**Issue**: Images not loading
**Solution**: Check Firebase Storage CORS: `gsutil cors set cors.json gs://[BUCKET]`

**Issue**: TypeScript errors
**Solution**: Clear cache: `rm -rf .next && npm run build`

---

**Document End**

**Last Updated**: October 8, 2025
**Maintained By**: Development Team
**Next Review**: November 8, 2025

For questions or clarifications, contact: titwzmaihya@gmail.com
