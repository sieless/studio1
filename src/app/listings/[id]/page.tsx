'use client';

import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { type Listing, type UserProfile } from '@/types';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';


function ListingDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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


export default function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  const db = useFirestore();
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchListing = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setListing({ id: docSnap.id, ...docSnap.data() } as Listing);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, db]);

  const handleViewContact = () => {
    setShowContact(true);
  };

  const getPropertyIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('bedroom') || lowerType === 'house') {
      return <Bed className="w-4 h-4 text-primary" />;
    }
    if (lowerType === 'hostel') {
      return <School className="w-4 h-4 text-primary" />;
    }
    return <Building className="w-4 h-4 text-primary" />;
  };
  
  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">Listing not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to listings</Link>
        </Button>
      </div>
    );
  }

  const fallbackImg = `https://placehold.co/800x600/E0F8F8/008080?text=${listing.type.replace(/\s/g, '+')}`;
  const images = (listing.images && listing.images.length > 0) ? listing.images : [fallbackImg];

  return (
    <div className="bg-background min-h-screen">
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
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((imgUrl, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[16/10] w-full">
                    <ImageWithFallback
                      src={imgUrl}
                      fallback={fallbackImg}
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
            {images.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                </>
            )}
          </Carousel>

          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 gap-4">
              <div>
                 <h1 className="text-4xl font-extrabold text-foreground mb-1">
                    Ksh {listing.price?.toLocaleString() || '0'}
                    <span className="text-xl font-medium text-muted-foreground">
                      /month
                    </span>
                  </h1>
                  {listing.deposit && (
                    <div className="flex items-center text-muted-foreground">
                        <Wallet className="w-4 h-4 mr-2" />
                        <span>Deposit: Ksh {listing.deposit.toLocaleString()}</span>
                    </div>
                  )}
              </div>
             
               <Badge className={cn(
                  "text-base py-1 px-3 self-start md:self-center",
                  listing.status === 'Vacant' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}>
                {listing.status}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6 border-b pb-6">
              <p className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> {listing.location}
              </p>
              <p className="font-semibold flex items-center gap-2">
                {getPropertyIcon(listing.type)}
                {listing.type}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Features
                </h3>
                {listing.features?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map(feature => (
                      <Badge key={feature} variant="outline" className="font-normal text-sm">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" />{' '}
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
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Contact Landlord
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
