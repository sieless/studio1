'use server';
import { type Timestamp } from 'firebase/firestore';

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

export type UserProfile = {
    id: string;
    email: string;
    name: string;
    listings: string[];
    canViewContacts: boolean;
    createdAt?: Timestamp;
    suspended?: boolean;
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
 * Helper type for payment feature identifiers
 */
export type PaymentFeature = 'contact' | 'featured' | 'boosted';
