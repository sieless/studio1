
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, MapPin, CheckCircle, Phone, Building, School } from "lucide-react";
import { type Listing, type UserProfile } from "@/types";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { PaymentModal } from "./payment-modal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


type ListingCardProps = {
  listing: Listing;
  isSubscribed: boolean;
};

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


export function ListingCard({ listing, isSubscribed }: ListingCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(db, 'users', user.uid) : null),
    [user, db]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const canViewContact = userProfile?.canViewContacts || false;

  const initialImgSrc = listing.images && listing.images.length > 0 ? listing.images[0] : `https://placehold.co/600x400/EEE/31343C?text=${listing.type.replace(/\s/g, '+')}`;
  
  const fallbackImg = `https://placehold.co/600x400/EEE/31343C?text=${listing.type.replace(/\s/g, '+')}`;

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

  const handleViewContact = () => {
    if (canViewContact) {
      setShowContact(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, { canViewContacts: true });
      setShowContact(true);
      setIsPaymentModalOpen(false);
      toast({
        title: "Payment Successful",
        description: "You can now view all contact details.",
      });
    } catch (error) {
      console.error("Failed to update user profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update your payment status. Please try again.",
      });
    }
  };


  return (
    <>
    <Card className="overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col">
      <Link href={`/listings/${listing.id}`} className="flex flex-col flex-grow">
        <div className="relative">
          <ImageWithFallback
            src={initialImgSrc}
            fallback={fallbackImg}
            alt={listing.type}
            width={600}
            height={400}
            className="w-full h-56 object-cover"
            data-ai-hint="house exterior"
          />
          <div className={cn(
            "absolute top-0 right-0 py-1 px-3 m-3 rounded-full text-sm font-semibold",
            listing.status === 'Vacant' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            {listing.status}
          </div>
        </div>
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
            <p className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {listing.location}
            </p>
            <p className="font-semibold flex items-center gap-2">
              {getPropertyIcon(listing.type)} {listing.type}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-foreground leading-tight">
            Ksh {listing.price?.toLocaleString() || "0"}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </h3>
          <div className="mt-4 border-t pt-4 flex-grow">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Features
            </p>
            <div className="flex flex-wrap gap-2">
              {listing.features?.length > 0 ? (
                listing.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="font-normal">
                    <CheckCircle className="w-3 h-3 mr-1.5 text-primary" /> {feature}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No features listed.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-5 mt-auto border-t">
        {showContact ? (
          <Button asChild variant="secondary" className="w-full text-lg font-bold text-green-600">
            <a href={`tel:${listing.contact}`}>{listing.contact}</a>
          </Button>
        ) : (
          <Button onClick={handleViewContact} className="w-full">
            <Phone className="mr-2 h-4 w-4" /> View Contact
          </Button>
        )}
      </CardFooter>
    </Card>
    <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={100}
        description="This is a one-time fee to unlock contact details for all listings."
        title="Unlock Contact Details"
      />
    </>
  );
}
