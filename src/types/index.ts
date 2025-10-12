'use server';
import { type Timestamp } from 'firebase/firestore';

export type ListingApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto';

export type Listing = {
  id: string;
  userId: string;
  name?: string;
  type: string;
  location: string;
  price: number;
  deposit?: number;
  depositMonths?: number;
  businessTerms?: string;
  features: string[];
  images: string[];
  contact: string;
  createdAt: Timestamp;
  status: 'Vacant' | 'Occupied' | 'Available Soon';

  // Multi-unit support
  totalUnits?: number;               // Total units in property (default: 1)
  availableUnits?: number;           // How many units are currently available

  // Featured listing fields (activated when admin enables feature)
  isFeatured?: boolean;              // Is this a featured listing?
  featuredUntil?: Timestamp;         // Expiration date for featured status
  featuredPaidAt?: Timestamp;        // When landlord paid for featuring
  featuredPaidAmount?: number;       // Amount paid (KES)

  // Boosted vacancy fields (activated when admin enables feature)
  isBoosted?: boolean;               // Is vacancy boosted?
  boostedUntil?: Timestamp;          // Expiration date for boost
  boostedPaidAt?: Timestamp;         // When landlord paid for boost
  boostedPaidAmount?: number;        // Amount paid (KES)

  // Vacancy payment system
  pendingVacancyPayment?: boolean;   // Listing awaiting payment verification for vacancy status
  approvalStatus?: ListingApprovalStatus; // Admin approval workflow state
  adminFeedback?: string;             // Feedback when rejected or requires changes
};

export type ListingFormData = {
  type: string;
  name?: string;
  location: string;
  price: number;
  deposit?: number | '';
  depositMonths?: number | '';
  businessTerms?: string;
  contact: string;
  images: File[];
  features: string[];
  status: 'Vacant' | 'Occupied' | 'Available Soon';
  totalUnits?: number | '';
  availableUnits?: number | '';
}

export type UserAccountType = 'tenant' | 'landlord';
export type LandlordApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type UserProfile = {
    id: string;
    email: string;
    name: string;
    listings: string[];
    canViewContacts: boolean;
    createdAt?: Timestamp;
    suspended?: boolean;
    accountType: UserAccountType;
    landlordApprovalStatus: LandlordApprovalStatus;
    phoneNumber?: string;
    preferredCounty?: string;
    landlordApplicationId?: string;
}

export type AdminStats = {
    totalUsers: number;
    totalListings: number;
    listingsByType: Record<string, number>;
    listingsByLocation: Record<string, number>;
    listingsByStatus: Record<string, number>;
    recentUsers: number;
    recentListings: number;
}

export type LandlordApplicationStatus = 'pending' | 'approved' | 'rejected';

export type LandlordApplication = {
    id: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    accountType: UserAccountType;
    status: LandlordApplicationStatus;
    propertyName?: string;
    propertyLocation?: string;
    propertyType?: string;
    totalUnits?: number;
    availableUnits?: number;
    idDocumentUrl?: string;
    ownershipProofUrl?: string;
    additionalNotes?: string;
    submittedAt: Timestamp;
    reviewedAt?: Timestamp;
    reviewerId?: string;
    reviewerEmail?: string;
    adminFeedback?: string;
}

export type AdminNotificationType = 'LANDLORD_APPLICATION' | 'LISTING_APPROVAL' | 'PAYMENT_DECLARATION';

export type AdminNotification = {
    id: string;
    type: AdminNotificationType;
    referenceId: string;
    title: string;
    message: string;
    status: 'pending' | 'completed';
    createdAt: Timestamp;
    completedAt?: Timestamp;
    metadata?: Record<string, any>;
}

/**
 * Platform-wide settings for payment features
 * Stored in Firestore at: /platformSettings/config
 * Allows admin to toggle payment features on/off without code deployment
 */
export type PlatformSettings = {
  // Contact payment settings
  contactPaymentEnabled: boolean;      // Master switch for contact payment feature
  contactPaymentAmount: number;        // Price in KES per contact/month

  // Featured listings settings
  featuredListingsEnabled: boolean;    // Master switch for featured listings
  featuredListingPrice: number;        // Price in KES per week

  // Boosted vacancy settings
  boostedVacancyEnabled: boolean;      // Master switch for boosted listings
  boostedVacancyPrice: number;         // Price in KES per week

  // Metadata
  lastUpdated: Timestamp;              // When settings were last changed
  updatedBy: string;                   // Admin email who made the change

  // Revenue tracking (future use)
  totalRevenue: number;                // Total KES collected
  paidUsers: number;                   // Count of users who have paid
  featuredListingsCount: number;       // Count of active featured listings
}

/**
 * Transaction types
 */
export type TransactionType = 'CONTACT_ACCESS' | 'VACANCY_LISTING' | 'FEATURED_LISTING' | 'BOOSTED_LISTING';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

/**
 * Payment transaction record
 * Stored in Firestore at: /transactions/{transactionId}
 */
export type Transaction = {
  id: string;                          // Firestore document ID
  transactionId: string;               // Unique transaction ID
  userId: string;                      // User who initiated payment
  userEmail?: string;                  // User email for reference
  userName?: string;                   // User name for reference

  // Transaction details
  type: TransactionType;               // Purpose of payment
  amount: number;                      // Amount in KES
  phoneNumber: string;                 // Phone number used for payment (254...)

  // M-Pesa details
  checkoutRequestID?: string;          // M-Pesa checkout request ID
  merchantRequestID?: string;          // M-Pesa merchant request ID
  mpesaReceiptNumber?: string;         // M-Pesa receipt (e.g., QGR1234ABC)

  // Status
  status: TransactionStatus;           // Current status
  statusMessage?: string;              // Status description

  // Related entity
  listingId?: string;                  // If related to a listing

  // Timestamps
  createdAt: Timestamp;                // When transaction was created
  updatedAt?: Timestamp;               // Last update time
  completedAt?: Timestamp;             // When payment completed/failed
  expiresAt?: Timestamp;               // For subscriptions (e.g., contact access)

  // Metadata
  ipAddress?: string;                  // User's IP for security
  userAgent?: string;                  // Browser info for security
  metadata?: Record<string, any>;      // Additional data
}

/**
 * Extended UserProfile with payment features
 */
export type UserProfileWithPayments = UserProfile & {
  // Contact access subscription
  contactAccessExpiresAt?: Timestamp;  // When contact access expires
  lastContactPaymentDate?: Timestamp;  // Last payment for contacts
  totalContactPayments?: number;       // Total spent on contact access

  // Transaction history
  totalTransactions?: number;          // Count of all transactions
  totalSpent?: number;                 // Total KES spent
  lastTransactionDate?: Timestamp;     // Most recent transaction
}

/**
 * Helper type for payment feature identifiers
 */
export type PaymentFeature = 'contact' | 'featured' | 'boosted';

/**
 * PHASE 4: MESSAGING SYSTEM
 * Conversation between tenant and landlord
 * Stored in Firestore at: /conversations/{conversationId}
 */
export type Conversation = {
  id: string;                          // Firestore document ID
  participants: string[];              // Array of user IDs [tenantId, landlordId]
  listingId: string;                   // Related listing
  listingTitle?: string;               // Listing name/type for display
  lastMessage: string;                 // Preview text
  lastMessageAt: Timestamp;            // For sorting
  unreadCount: Record<string, number>; // { userId: count }
  createdAt: Timestamp;
};

/**
 * Message in a conversation
 * Stored in Firestore at: /messages/{messageId}
 */
export type Message = {
  id: string;                          // Firestore document ID
  conversationId: string;              // Parent conversation
  senderId: string;                    // User who sent message
  senderName: string;                  // For display
  text: string;                        // Message content
  imageUrl?: string;                   // Optional image attachment
  read: boolean;                       // Read status
  createdAt: Timestamp;
};

/**
 * Viewing Schedule Request
 * Stored in Firestore at: /viewings/{viewingId}
 */
export type ViewingSchedule = {
  id: string;
  listingId: string;
  listingTitle?: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId: string;
  landlordName: string;
  requestedDate: Timestamp;            // Tenant's preferred date/time
  alternateDate?: Timestamp;           // Landlord's suggested alternate
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;                      // Additional notes
  declineReason?: string;              // If declined
  createdAt: Timestamp;
  updatedAt?: Timestamp;
};

/**
 * Property Application
 * Stored in Firestore at: /applications/{applicationId}
 */
export type PropertyApplication = {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingPrice: number;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId: string;

  // Application details
  idNumber: string;                    // National ID
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

  // Status
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  declineReason?: string;
  approvedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt?: Timestamp;
};

/**
 * PHASE 5: RENTAL AGREEMENT SYSTEM
 * Rental agreement template (uploaded by landlord)
 * Stored in Firestore at: /agreements/{agreementId}
 */
export type RentalAgreement = {
  id: string;
  listingId: string;
  landlordId: string;
  templateUrl: string;                 // PDF/DOC URL in storage
  templateName: string;
  uploadedAt: Timestamp;
};

/**
 * Signed rental agreement
 * Stored in Firestore at: /signedAgreements/{signedAgreementId}
 */
export type SignedAgreement = {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingPrice: number;

  // Parties
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;

  // Tenant details from signature
  tenantDetails: {
    fullName: string;
    idNumber: string;
    phone: string;
    email: string;
    signatureUrl: string;              // Signature image URL
  };

  // Agreement details
  originalAgreementUrl: string;        // Original template
  signedAgreementUrl: string;          // PDF with signature

  // Timestamps
  signedAt: Timestamp;
  createdAt: Timestamp;
};
