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
}

export type UserProfile = {
    id: string;
    email: string | null;
    name: string;
    listings: string[];
    canViewContacts: boolean;
    role?: 'admin' | 'user';
    phone: string | null;
}
