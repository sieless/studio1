
'use client'

import { type Listing } from "@/types";
import { ListingCard } from "./listing-card";

type FeaturedListingsProps = {
    listings: Listing[];
    isSubscribed: boolean;
};

export function FeaturedListings({ listings, isSubscribed }: FeaturedListingsProps) {
    if (listings.length === 0) {
        return null;
    }

    return (
        <div className="bg-muted py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                        Featured Properties
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Check out some of the best properties available right now.
                    </p>
                </div>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} isSubscribed={isSubscribed} />
                    ))}
                </div>
            </div>
        </div>
    )
}

