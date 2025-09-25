"use client";

import { useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, MapPin, CheckCircle, Phone, Building, School } from "lucide-react";
import { type Listing } from "@/types";

type ListingCardProps = {
  listing: Listing;
  isSubscribed: boolean;
};

export function ListingCard({ listing, isSubscribed }: ListingCardProps) {
  const [showContact, setShowContact] = useState(false);
  // Use the first image in the array, or a placeholder if the array is empty.
  const initialImgSrc = listing.images && listing.images.length > 0 ? listing.images[0] : `https://placehold.co/600x400/EEE/31343C?text=${listing.type}`;
  const [imgSrc, setImgSrc] = useState(initialImgSrc);

  const fallbackImg = `https://placehold.co/600x400/EEE/31343C?text=${listing.type}`;

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
    <Card className="overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col">
      <Link href={`/listings/${listing.id}`} className="flex flex-col flex-grow">
        <div className="relative">
          <Image
            src={imgSrc}
            alt={listing.type}
            width={600}
            height={400}
            className="w-full h-56 object-cover"
            onError={() => setImgSrc(fallbackImg)}
            data-ai-hint="house exterior"
          />
          {isSubscribed && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-3 m-3 rounded-full text-sm font-semibold">
              Available
            </div>
          )}
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
          <Button onClick={() => setShowContact(true)} className="w-full">
            <Phone className="mr-2 h-4 w-4" /> View Contact
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
