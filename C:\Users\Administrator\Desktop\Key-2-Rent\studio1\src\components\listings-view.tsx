
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { type Listing } from '@/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AddListingModal } from '@/components/add-listing-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Hero } from './hero';
import { houseTypes } from '@/lib/constants';
import { ListingCategorySection } from './listing-category-section';

function LoadingSkeletons() {
  return (
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
  );
}

export function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

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

  const handlePostClick = () => {
    if (isUserLoading) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to post a new listing.',
        variant: 'destructive',
      });
      router.push('/login');
    } else {
      setIsModalOpen(true);
    }
  };

  const listingsByType = useMemo(() => {
    const grouped: { [key: string]: Listing[] } = {};
    for (const listing of listings) {
      if (!grouped[listing.type]) {
        grouped[listing.type] = [];
      }
      grouped[listing.type].push(listing);
    }
    return grouped;
  }, [listings]);

  const orderedHouseTypes = useMemo(() => {
    return houseTypes.filter(type => type !== 'All' && listingsByType[type]?.length > 0);
  }, [listingsByType]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={handlePostClick} />
      <Hero />
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSkeletons />
          ) : (
            <div className="space-y-16">
              {orderedHouseTypes.map(type => (
                <ListingCategorySection
                  key={type}
                  category={type}
                  listings={listingsByType[type]}
                  isSubscribed={isSubscribed}
                />
              ))}
              {orderedHouseTypes.length === 0 && !loading && (
                 <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                    <h2 className="text-xl font-semibold text-foreground">
                        No properties have been listed yet.
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Check back later for new listings!
                    </p>
                </div>
              )}
            </div>
          )}
        </div>
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
