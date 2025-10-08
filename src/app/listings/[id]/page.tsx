'use client';

import { useState, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { ImageGallery } from '@/components/image-gallery';
import Link from 'next/link';

import { type Listing } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  FileText,
  Lock,
  MessageCircle,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AddListingModal } from '@/components/add-listing-modal';
import { useToast } from '@/hooks/use-toast';
import { getPropertyIcon, getStatusClass } from '@/lib/utils';
import { DefaultPlaceholder } from '@/components/default-placeholder';
import { useFeatureEnabled } from '@/hooks/use-platform-settings';


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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const db = useFirestore();
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const contactPaymentEnabled = useFeatureEnabled('contact');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.name || `${listing?.type} in ${listing?.location}`,
          text: `Check out this property: KES ${listing?.price.toLocaleString()}/month`,
          url: url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Share this listing with others',
      });
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in your ${listing?.type} in ${listing?.location} listed at KES ${listing?.price.toLocaleString()}/month on Key-2-Rent.`;
    const whatsappUrl = `https://wa.me/${listing?.contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
            <div className="relative p-6">
              {hasImages ? (
                <ImageGallery
                  images={listing.images}
                  alt={listing.name || listing.type}
                  showThumbnails={true}
                />
              ) : (
                <div className="aspect-[16/10] w-full bg-muted flex items-center justify-center rounded-lg">
                  <DefaultPlaceholder type={listing.type} />
                </div>
              )}
              <Badge
                className={cn(
                  "absolute top-10 right-10 text-base z-20",
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
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-primary" /> Contact Landlord
                    </h3>
                    {/* FEATURE FLAG: Show payment gate if admin enabled contact payments */}
                    {!user ? (
                      // Not logged in - prompt to sign in
                      <Button
                        onClick={() => router.push('/signup')}
                        className="w-full text-lg"
                        variant="default"
                      >
                        <Phone className="mr-2 h-5 w-5" />
                        Sign in to view contact
                      </Button>
                    ) : contactPaymentEnabled ? (
                      // Logged in but contact payment is enabled
                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full text-lg"
                        variant="default"
                      >
                        <Lock className="mr-2 h-5 w-5" />
                        Unlock Contact - KES 100
                      </Button>
                    ) : (
                      // Logged in and FREE MODE: Show contact directly with WhatsApp option
                      <div className="space-y-2">
                        <Button
                          asChild
                          variant="secondary"
                          className="w-full text-lg font-semibold text-green-600 hover:text-green-700"
                        >
                          <a href={`tel:${listing.contact}`}>
                            <Phone className="mr-2 h-5 w-5" />
                            {listing.contact}
                          </a>
                        </Button>
                        <Button
                          onClick={handleWhatsApp}
                          variant="outline"
                          className="w-full"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message on WhatsApp
                        </Button>
                      </div>
                    )}

                    {/* Share Button */}
                    <Button
                      onClick={handleShare}
                      variant="ghost"
                      className="w-full"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Listing
                    </Button>
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

      {/* Payment Modal - Future: Replace with actual M-Pesa integration */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-background p-8 rounded-lg max-w-md w-full mx-4 border shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-3">Contact Payment</h3>
            <p className="text-muted-foreground mb-4">
              Pay KES 100 to unlock this landlord's contact information and connect directly.
            </p>
            <p className="text-sm text-muted-foreground mb-6 p-3 bg-muted rounded">
              🚧 <strong>Coming Soon:</strong> M-Pesa STK Push integration will be activated here. You'll receive a prompt on your phone to complete the payment.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1" disabled>
                Pay with M-Pesa (Soon)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
