'use server';
import { type Timestamp } from 'firebase/firestore';

export type Listing = {
  id: string;
  userId: string;
  type: string;
  location: string;
  price: number;
  deposit?: number;
  features: string[];
  images: string[];
  contact: string;
  createdAt: Timestamp;
  status: 'Vacant' | 'Occupied';
  lastPaymentAt?: Timestamp;
};

export type ListingFormData = {
  type: string;
  location: string;
  price: number;
  deposit?: number;
  contact: string;
  images: File[];
  features: string[];
  status: 'Vacant' | 'Occupied';
}

export type UserProfile = {
    id: string;
    email: string;
    name: string;
    listings: string[];
    canViewContacts: boolean; // Client has paid the one-time fee
}
