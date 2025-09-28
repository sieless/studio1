'use client';

import { useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, CalendarClock, MapPin } from "lucide-react";
import { type Listing } from "@/types";
import { cn, getPropertyIcon, getStatusClass } from "@/lib/utils";
import { DefaultPlaceholder } from "./default-placeholder";


type ListingCardProps = {
  listing: Listing;
  isSubscribed: boolean;
};


export function ListingCard({ listing }: ListingCardProps) {
  const [showContact, setShowContact] = useState(false);

  const hasImages = listing.images && listing.images.length > 0;

  const handleViewContact = () => {
    setShowContact(true);
  };

  return (
    <Card className="overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col">
      <Link href={`/listings/${listing.id}`} className="flex flex-col flex-grow">
        <div className="relative h-56 w-full">
            {hasImages ? (
              <Image
                src={listing.images[0]}
                alt={listing.type}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                data-ai-hint="house exterior"
              />
            ) : (
               <div className="w-full h-full bg-muted flex items-center justify-center">
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
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
            <p className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {listing.location}
            </p>
            <p className="font-semibold flex items-center gap-2">
              {getPropertyIcon(listing.type)} {listing.type}
            </p>
          </div>
           {listing.name && (
            <h3 className="text-xl font-bold text-foreground leading-tight truncate mb-1">
              {listing.name}
            </h3>
          )}
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
                listing.features.slice(0, 3).map((feature) => ( // Show max 3 features
                  <Badge key={feature} variant="secondary" className="font-normal">
                    {feature}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No extra features listed.</p>
              )}
              {listing.features?.length > 3 && (
                <Badge variant="outline">+{listing.features.length - 3} more</Badge>
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
  );
}
