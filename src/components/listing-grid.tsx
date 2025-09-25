import { type Listing } from "@/types";
import { ListingCard } from "./listing-card";

type ListingGridProps = {
  listings: Listing[];
  isSubscribed: boolean;
};

export function ListingGrid({ listings, isSubscribed }: ListingGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {listings.length} {listings.length === 1 ? 'Property' : 'Properties'} Found
      </h2>
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isSubscribed={isSubscribed} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl shadow-md">
          <p className="text-lg text-muted-foreground">
            No properties match your current filters.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-2">
            Try adjusting your search criteria, or check back later for new listings!
          </p>
        </div>
      )}
    </div>
  );
}
