'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  arrayRemove,
} from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { type Listing } from '@/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { MapPin, Bed, Building, PlusCircle, School, Repeat, Loader2, Store } from 'lucide-react';
import { DeleteListingDialog } from '@/components/delete-listing-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AddListingModal } from '@/components/add-listing-modal';

function ListingSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <Skeleton className="h-56 w-full" />
      <CardHeader className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-8 w-1/2 mt-3" />
      </CardHeader>
      <CardFooter className="p-5 mt-auto border-t">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function ImageWithFallback({ src, fallback, alt, ...props }: any) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <Image
      alt={alt}
      src={error ? fallback : src}
      onError={handleError}
      {...props}
    />
  );
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userListingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'listings'), where('userId', '==', user.uid));
  }, [user, db]);


  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (!userListingsQuery) return;

    const fetchUserListings = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(userListingsQuery);
        const userListings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Listing[];
        setListings(userListings);
      } catch (error) {
        console.error('Error fetching user listings:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching listings',
          description: 'Could not load your properties. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserListings();
  }, [user, isUserLoading, userListingsQuery, router, toast]);

  const handleDelete = async (listingId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        listings: arrayRemove(listingId),
      });

      setListings(prev => prev.filter(listing => listing.id !== listingId));

      toast({
        title: 'Listing Deleted',
        description: 'Your property listing has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting listing: ', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the listing. Please try again.',
      });
    }
  };

  const handleToggleStatus = async (listingId: string, currentStatus: 'Vacant' | 'Occupied') => {
    setUpdatingStatusId(listingId);
    const newStatus = currentStatus === 'Vacant' ? 'Occupied' : 'Vacant';
    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, { status: newStatus });
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
      toast({
        title: 'Status Updated',
        description: `Your property is now marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the listing status. Please try again.',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getPropertyIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('bedroom') || lowerType.includes('bedsitter') || lowerType === 'single room') {
      return <Bed className="w-4 h-4" />;
    }
     if (lowerType === 'house') {
      return <Building className="w-4 h-4" />;
    }
    if (lowerType === 'hostel') {
      return <School className="w-4 h-4" />;
    }
     if (lowerType === 'business') {
        return <Store className="w-4 h-4" />;
    }
    return <Building className="w-4 h-4" />;
  };

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => setIsModalOpen(true)} />
      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Listing
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListingSkeleton key={i} />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <Card key={listing.id} className="overflow-hidden flex flex-col">
                <Link href={`/listings/${listing.id}`} className="block">
                  <div className="relative h-56 w-full">
                    <ImageWithFallback
                      src={(listing.images && listing.images.length > 0) ? listing.images[0] : `https://placehold.co/600x400.png/E0F8F8/008080?text=${listing.type.replace(/\s/g, '+')}`}
                      fallback={`https://placehold.co/600x400.png/E0F8F8/008080?text=${listing.type.replace(/\s/g, '+')}`}
                      alt={listing.type}
                      fill
                      className="object-cover"
                    />
                      <Badge
                      className={cn(
                        "absolute top-3 right-3 text-sm z-10",
                        listing.status === 'Vacant' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                      )}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                </Link>
                <CardHeader className="flex-grow p-4">
                   {listing.name && (
                    <CardTitle className="text-lg font-semibold truncate">
                      {listing.name}
                    </CardTitle>
                  )}
                  <p className="text-xl font-bold text-foreground">
                    Ksh {listing.price.toLocaleString()}/month
                  </p>
                   <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {listing.location}
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      {getPropertyIcon(listing.type)} {listing.type}
                    </p>
                  </div>
                </CardHeader>
                <CardFooter className="border-t p-4 mt-auto flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleToggleStatus(listing.id, listing.status)}
                        disabled={updatingStatusId === listing.id}
                    >
                      {updatingStatusId === listing.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Repeat className="mr-2 h-4 w-4" />
                      )}
                       Mark as {listing.status === 'Vacant' ? 'Occupied' : 'Vacant'}
                    </Button>
                    <DeleteListingDialog onConfirm={() => handleDelete(listing.id)} />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed">
            <h2 className="text-xl font-semibold text-foreground">
              You haven&apos;t posted any listings yet.
            </h2>
            <p className="text-muted-foreground mt-2">
              Click the button below to add your first property!
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-6">
                <PlusCircle className="mr-2 h-4 w-4" /> Post a Listing
            </Button>
          </div>
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
    </>
  );
}
