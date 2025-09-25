'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  DocumentData,
  where,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { type Listing } from '@/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FilterPanel } from '@/components/filter-panel';
import { ListingGrid } from '@/components/listing-grid';
import { AddListingModal } from '@/components/add-listing-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { RentalTypes } from './rental-types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


function LoadingSkeletons() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Finding Properties...
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl shadow-lg overflow-hidden flex flex-col p-5 space-y-4"
          >
            <Skeleton className="h-56 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-2 pt-4 border-t">
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="pt-4 border-t">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: 'All',
    type: 'All',
    maxPrice: 50000,
  });

  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // This is a placeholder for a real subscription check
  const isSubscribed = useMemo(() => !!user, [user]);

  useEffect(() => {
    setLoading(true);
    const listingsCollection = collection(db, 'listings');
    const q = query(listingsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const listingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setListings(listingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleFilterChange = (name: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeSelect = (type: string) => {
    handleFilterChange('type', type);
  };

  const handlePostClick = () => {
    if (isUserLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a new listing.",
        variant: "destructive"
      })
      router.push('/login');
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const locationMatch =
        filters.location === 'All' || listing.location === filters.location;
      const typeMatch = filters.type === 'All' || listing.type === filters.type;
      const priceMatch = listing.price <= filters.maxPrice;
      return locationMatch && typeMatch && priceMatch;
    });
  }, [listings, filters]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={handlePostClick} />
      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <RentalTypes onTypeSelect={handleTypeSelect} selectedType={filters.type} />
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        {loading ? (
          <LoadingSkeletons />
        ) : (
          <ListingGrid listings={filteredListings} isSubscribed={isSubscribed} />
        )}
      </main>
      <Footer />
      {isModalOpen && (
        <AddListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
