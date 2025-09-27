'use client';

import { useEffect, useState } from 'react';
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
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
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
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { MapPin, Bed, Building, PlusCircle, School, Edit, Loader2 } from 'lucide-react';
import { DeleteListingDialog } from '@/components/delete-listing-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn, getSubscriptionFee } from '@/lib/utils';
import { PaymentModal } from '@/components/payment-modal';

function ListingSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <Skeleton className="h-56 w-full" />
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-8 w-1/2 mt-3" />
      </CardContent>
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserListings = async () => {
      try {
        const q = query(collection(db, 'listings'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
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
  }, [user, isUserLoading, db, router, toast]);

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

  const handleDeclareVacantClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsPaymentModalOpen(true);
  };
  
  const handlePaymentSuccess = async () => {
    if (!selectedListing) return;
    
    setIsUpdating(selectedListing.id);
    setIsPaymentModalOpen(false);

    try {
        const listingRef = doc(db, 'listings', selectedListing.id);
        await updateDoc(listingRef, {
            status: 'Vacant',
            lastPaymentAt: serverTimestamp(),
        });

        // Update local state to reflect change immediately
        setListings(prev => prev.map(l => l.id === selectedListing.id ? {...l, status: 'Vacant'} : l));
        
        toast({
            title: 'Success!',
            description: 'Your property is now listed as vacant.',
        });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update the listing status. Please try again.',
        });
    } finally {
        setIsUpdating(null);
        setSelectedListing(null);
    }
  };

  const getPropertyIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('bedroom') || lowerType === 'house') {
      return <Bed className="w-4 h-4" />;
    }
    if (lowerType === 'hostel') {
      return <School className="w-4 h-4" />;
    }
    return <Building className="w-4 h-4" />;
  };

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => router.push('/')} />
      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <Button asChild>
            <Link href="/">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Listing
            </Link>
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
                <div className="relative">
                  <Link href={`/listings/${listing.id}`} className="block">
                    <div className="relative h-56 w-full">
                      <ImageWithFallback
                        src={(listing.images && listing.images.length > 0) ? listing.images[0] : `https://placehold.co/600x400/EEE/31343C?text=${listing.type.replace(/\s/g, '+')}`}
                        fallback={`https://placehold.co/600x400/EEE/31343C?text=${listing.type.replace(/\s/g, '+')}`}
                        alt={listing.type}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                   <div className={cn(
                    "absolute top-0 left-0 py-1 px-3 m-3 rounded-full text-sm font-semibold",
                    listing.status === 'Vacant' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                   )}>
                    {listing.status}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold truncate">
                    Ksh {listing.price.toLocaleString()}/month
                  </CardTitle>
                   <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {listing.location}
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      {getPropertyIcon(listing.type)} {listing.type}
                    </p>
                  </div>
                </CardHeader>
                <CardFooter className="border-t p-4 mt-auto flex items-center gap-2">
                    {listing.status === 'Occupied' && (
                        <Button 
                            className="flex-1"
                            onClick={() => handleDeclareVacantClick(listing)}
                            disabled={isUpdating === listing.id}
                        >
                            {isUpdating === listing.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Edit className="mr-2 h-4 w-4" />
                            )}
                            Declare Vacant
                        </Button>
                    )}
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
            <Button asChild className="mt-6">
              <Link href="/">
                <PlusCircle className="mr-2 h-4 w-4" /> Post a Listing
              </Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
    {selectedListing && (
         <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
            amount={getSubscriptionFee(selectedListing.type)}
            description={`1-year subscription for declaring a ${selectedListing.type} as vacant.`}
            title="Declare Property Vacant"
        />
    )}
    </>
  );
}
