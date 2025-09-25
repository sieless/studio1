import { type Timestamp } from 'firebase/firestore';

export type Listing = {
  id: string;
  userId: string;
  type: string;
  location: string;
  price: number;
  features: string[];
  images: string[];
  contact: string;
  createdAt: Timestamp;
};

export type ListingFormData = {
  type: string;
  location: string;
  price: number;
  contact: string;
  images: File[];
  features: string[];
}
