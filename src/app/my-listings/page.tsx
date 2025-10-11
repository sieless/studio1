'use client';

// Force dynamic rendering (disable static generation)
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  arrayRemove,
  orderBy,
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
import Image from 'next/image';
import { MapPin, PlusCircle, Repeat, Loader2, CalendarClock, BarChart3, LayoutGrid, Minus, Plus, Building2 } from 'lucide-react';
import { DeleteListingDialog } from '@/components/delete-listing-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AddListingModal } from '@/components/add-listing-modal';
import { VacancyPaymentModal } from '@/components/vacancy-payment-modal';
import { getPropertyIcon, getStatusClass } from '@/lib/utils';
import { DefaultPlaceholder } from '@/components/default-placeholder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandlordAnalytics } from './analytics';

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


export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingUnitsId, setUpdatingUnitsId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    listingId: string;
    newStatus: Listing['status'];
    propertyType: string;
  } | null>(null);
  const [pendingUnitAdjustment, setPendingUnitAdjustment] = useState<{
    listingId: string;
    adjustment: number;
    currentAvailable: number;
    totalUnits: number;
    propertyType: string;
  } | null>(null);

  
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

    setLoading(true);
    const q = query(
        collection(db, 'listings'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, querySnapshot => {
        const userListings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Listing[];
        setListings(userListings);
        setLoading(false);
    }, (error) => {
        console.error('Error fetching user listings:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching listings',
          description: 'Could not load your properties. Please try again.',
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isUserLoading, db, router, toast]);

  const handleDelete = async (listingId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        listings: arrayRemove(listingId),
      });

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

  const handleToggleStatus = async (listingId: string, currentStatus: Listing['status']) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    let newStatus: Listing['status'];
    switch (currentStatus) {
        case 'Vacant':
            newStatus = 'Occupied';
            break;
        case 'Occupied':
            newStatus = 'Available Soon';
            break;
        case 'Available Soon':
            newStatus = 'Vacant';
            break;
        default:
            newStatus = 'Vacant';
    }

    // Check if changing TO Vacant - require payment
    if (newStatus === 'Vacant') {
      setPendingStatusChange({
        listingId,
        newStatus,
        propertyType: listing.type,
      });
      setShowPaymentModal(true);
      return;
    }

    // For non-vacancy changes, proceed directly
    setUpdatingStatusId(listingId);
    
    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, { status: newStatus });
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

  const getNextStatus = (currentStatus: Listing['status']): Listing['status'] => {
     switch (currentStatus) {
        case 'Vacant': return 'Occupied';
        case 'Occupied': return 'Available Soon';
        case 'Available Soon': return 'Vacant';
        default: return 'Vacant';
    }
  }

  const handleAdjustUnits = async (listingId: string, adjustment: number, currentAvailable: number, totalUnits: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    const newAvailable = Math.max(0, Math.min(totalUnits, currentAvailable + adjustment));

    // Auto-determine status based on availability
    const newStatus: Listing['status'] = newAvailable > 0 ? 'Vacant' : 'Occupied';

    // Check if increasing units from 0 → vacant - require payment
    if (currentAvailable === 0 && newAvailable > 0) {
      setPendingUnitAdjustment({
        listingId,
        adjustment,
        currentAvailable,
        totalUnits,
        propertyType: listing.type,
      });
      setShowPaymentModal(true);
      return;
    }

    // For decreasing units or other changes, proceed directly
    setUpdatingUnitsId(listingId);

    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, {
        availableUnits: newAvailable,
        status: newStatus
      });

      toast({
        title: 'Units Updated',
        description: `${newAvailable} of ${totalUnits} units now available. Status: ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating units:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update available units. Please try again.',
      });
    } finally {
      setUpdatingUnitsId(null);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (pendingStatusChange) {
      // Handle status change after payment
      const { listingId, newStatus } = pendingStatusChange;
      setUpdatingStatusId(listingId);
      
      try {
        const listingRef = doc(db, 'listings', listingId);
        // Set as Occupied with pending payment flag instead of Vacant
        await updateDoc(listingRef, { 
          status: 'Occupied',
          pendingVacancyPayment: true 
        });
        
        toast({
          title: 'Payment Confirmed',
          description: 'Your listing is pending admin verification. It will show as vacant once payment is confirmed.',
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
        setPendingStatusChange(null);
      }
    } else if (pendingUnitAdjustment) {
      // Handle unit adjustment after payment
      const { listingId, adjustment, currentAvailable, totalUnits } = pendingUnitAdjustment;
      setUpdatingUnitsId(listingId);
      
      try {
        const newAvailable = Math.max(0, Math.min(totalUnits, currentAvailable + adjustment));
        const listingRef = doc(db, 'listings', listingId);
        
        // Set available units but keep as Occupied with pending payment flag
        await updateDoc(listingRef, {
          availableUnits: newAvailable,
          status: 'Occupied', // Keep as occupied until admin approves
          pendingVacancyPayment: true
        });
        
        toast({
          title: 'Payment Confirmed',
          description: 'Your units update is pending admin verification. Units will show as vacant once payment is confirmed.',
        });
      } catch (error) {
        console.error('Error updating units:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update available units. Please try again.',
        });
      } finally {
        setUpdatingUnitsId(null);
        setPendingUnitAdjustment(null);
      }
    }
  };

  const getPropertyTypeForPayment = () => {
    if (pendingStatusChange) {
      return pendingStatusChange.propertyType;
    }
    if (pendingUnitAdjustment) {
      return pendingUnitAdjustment.propertyType;
    }
    return '';
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

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ListingSkeleton key={i} />
                ))}
              </div>
            ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <Card key={listing.id} className="overflow-hidden flex flex-col h-full">
                <Link href={`/listings/${listing.id}`} className="block">
                  <div className="relative w-full h-56 flex-shrink-0 overflow-hidden bg-muted">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.name || listing.type}
                        fill
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DefaultPlaceholder type={listing.type} />
                      </div>
                    )}
                      <Badge
                      className={cn(
                        "absolute top-3 right-3 text-sm z-10",
                        getStatusClass(listing.status)
                      )}
                    >
                      {listing.status === 'Available Soon' && <CalendarClock className="mr-1.5 h-4 w-4" />}
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
                  {/* Multi-unit indicator */}
                  {listing.totalUnits && listing.totalUnits > 1 && (
                    <div className="mt-3 pt-3 border-t">
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {listing.availableUnits || 0} of {listing.totalUnits} units available
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardFooter className="border-t p-4 mt-auto flex flex-col gap-3">
                  {/* Multi-unit controls */}
                  {listing.totalUnits && listing.totalUnits > 1 ? (
                    <div className="flex items-center justify-between w-full gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustUnits(
                          listing.id,
                          -1,
                          listing.availableUnits || 0,
                          listing.totalUnits || 1
                        )}
                        disabled={
                          updatingUnitsId === listing.id ||
                          (listing.availableUnits || 0) <= 0
                        }
                      >
                        {updatingUnitsId === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold">
                          {listing.availableUnits || 0} / {listing.totalUnits} available
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.status}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustUnits(
                          listing.id,
                          1,
                          listing.availableUnits || 0,
                          listing.totalUnits || 1
                        )}
                        disabled={
                          updatingUnitsId === listing.id ||
                          (listing.availableUnits || 0) >= listing.totalUnits
                        }
                      >
                        {updatingUnitsId === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                      <DeleteListingDialog onConfirm={() => handleDelete(listing.id)} />
                    </div>
                  ) : (
                    /* Single-unit controls */
                    <div className="flex items-center gap-2 w-full">
                      <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleToggleStatus(listing.id, listing.status)}
                          disabled={updatingStatusId === listing.id}
                      >
                        {updatingStatusId === listing.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Repeat className="mr-2 h-4 w-4" />
                        )}
                         Mark as {getNextStatus(listing.status)}
                      </Button>
                      <DeleteListingDialog onConfirm={() => handleDelete(listing.id)} />
                    </div>
                  )}
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
          </TabsContent>

          <TabsContent value="analytics">
            <LandlordAnalytics listings={listings} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
       {isModalOpen && (
        <AddListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      <VacancyPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        propertyType={getPropertyTypeForPayment()}
        onPaymentConfirmed={handlePaymentConfirmed}
        isLoading={updatingStatusId !== null || updatingUnitsId !== null}
      />
    </div>
    </>
  );
}
