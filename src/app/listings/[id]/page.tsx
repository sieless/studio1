'use client';

import { useState, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { type Listing } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Bed,
  MapPin,
  CheckCircle,
  Phone,
  Building,
  ArrowLeft,
  School,
  Wallet,
  Store,
  CalendarClock,
  Briefcase,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AddListingModal } from '@/components/add-listing-modal';
import { useToast } from '@/hooks/use-toast';
import { getPropertyIcon, getStatusClass } from '@/lib/utils';
import { DefaultPlaceholder } from '@/components/default-placeholder';


function ListingDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <Card className="overflow-hidden">
        <Skeleton className="w-full h-[400px] md:h-[500px]" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <Skeleton className="h-9 w-3/4 md:w-1/2 mb-2 md:mb-0" />
            <Skeleton className="h-7 w-1/4 md:w-1/5" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ListingDetailPage() {
  const [showContact, setShowContact] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const db = useFirestore();
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const listingRef = useMemoFirebase(() => {
    if (typeof id !== 'string') return null;
    return doc(db, 'listings', id);
  }, [id, db]);

  const { data: listing, isLoading: loading, error: listingError } = useDoc<Listing>(listingRef);

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

  const handleViewContact = () => {
    setShowContact(true);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onPostClick={handlePostClick} />
        <main className="flex-grow">
          <ListingDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing || listingError) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header onPostClick={handlePostClick} />
        <main className="flex-grow text-center py-20">
          <p className="text-lg text-muted-foreground">Listing not found.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/">Go back home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const hasImages = listing.images && listing.images.length > 0;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location + ", Machakos")}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={handlePostClick} />
      <main className="flex-grow bg-background">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>

          <Card className="overflow-hidden shadow-lg">
            <div className="relative">
              {hasImages ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {listing.images.map((imgUrl, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-[16/10] w-full">
                          <Image
                            src={imgUrl}
                            alt={`${listing.type} - image ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            data-ai-hint="house interior"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {listing.images.length > 1 && (
                      <>
                          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                      </>
                  )}
                </Carousel>
              ) : (
                <div className="aspect-[16/10] w-full bg-muted flex items-center justify-center">
                  <DefaultPlaceholder type={listing.type} />
                </div>
              )}
              <Badge
                className={cn(
                  "absolute top-4 right-4 text-base z-10",
                  getStatusClass(listing.status)
                )}
              >
                {listing.status === 'Available Soon' ? <CalendarClock className="mr-1.5 h-4 w-4" /> : null}
                {listing.status}
              </Badge>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 gap-4">
                <div>
                   {listing.name && (
                    <h1 className="text-3xl font-bold text-foreground leading-tight mb-2">
                      {listing.name}
                    </h1>
                  )}
                  <h2 className="text-4xl font-extrabold text-foreground mb-1">
                      Ksh {listing.price?.toLocaleString() || '0'}
                      <span className="text-xl font-medium text-muted-foreground">
                        /month
                      </span>
                    </h2>
                    {listing.deposit && (
                      <div className="flex items-center text-muted-foreground">
                          <Wallet className="w-4 h-4 mr-2" />
                          <span>Deposit: Ksh {listing.deposit.toLocaleString()}
                          {listing.depositMonths && ` (${listing.depositMonths} months)`}
                          </span>
                      </div>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6 border-b pb-6">
                <p className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {listing.location}
                </p>
                <p className="font-semibold flex items-center gap-2">
                  {getPropertyIcon(listing.type)}
                  {listing.type}
                </p>
                <Button variant="link" size="sm" asChild className="p-0 h-auto">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-1 h-4 w-4" /> View on Map
                  </a>
                </Button>
              </div>

              <div className="space-y-8">
                {listing.type === 'Business' && listing.businessTerms && (
                   <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" /> Business Terms
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-4 rounded-md">
                      {listing.businessTerms}
                    </p>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                       <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Features
                    </h3>
                    {listing.features?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {listing.features.map(feature => (
                          <Badge key={feature} variant="outline" className="font-normal text-sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No extra features listed.
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-primary" /> Contact Landlord
                    </h3>
                    {showContact ? (
                      <Button
                        asChild
                        variant="secondary"
                        className="w-full text-lg font-bold"
                      >
                        <a href={`tel:${listing.contact}`}>{listing.contact}</a>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleViewContact}
                        className="w-full"
                      >
                        <Phone className="mr-2 h-4 w-4" /> View Contact Number
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
