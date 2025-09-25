import { type Timestamp } from 'firebase/firestore';

export type Listing = {
  id: string;
  userId: string;
  type: string;
  location: string;
  price: number;
  features: string[];
  image: string;
  contact: string;
  createdAt: Timestamp;
};

export type ListingFormData = {
  type: string;
  location: string;
  price: number;
  contact: string;
  image: File;
  features: string[];
}
