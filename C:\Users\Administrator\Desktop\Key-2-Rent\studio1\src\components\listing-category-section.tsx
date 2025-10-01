'use client';

import { type Listing } from '@/types';
import { ListingGrid } from './listing-grid';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const MAX_ITEMS_PREVIEW = 4;

type ListingCategorySectionProps = {
  category: string;
  listings: Listing[];
  isSubscribed: boolean;
};

export function ListingCategorySection({
  category,
  listings,
  isSubscribed,
}: ListingCategorySectionProps) {

  if (!listings || listings.length === 0) {
    return null;
  }

  const visibleListings = listings.slice(0, MAX_ITEMS_PREVIEW);
  const hasMore = listings.length > MAX_ITEMS_PREVIEW;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">{category}s</h2>
        {hasMore && (
           <Button asChild variant="ghost">
             <Link href={`/all-properties?category=${encodeURIComponent(category)}`}>
              View all <ArrowRight className="ml-2 h-4 w-4" />
             </Link>
           </Button>
        )}
      </div>
      <ListingGrid listings={visibleListings} isSubscribed={isSubscribed} columns={4} />
      {!hasMore && (
        <div className="text-center mt-8">
            <Button asChild variant="outline">
                <Link href={`/all-properties?category=${encodeURIComponent(category)}`}>
                    View all {listings.length} {category.toLowerCase()}s
                </Link>
            </Button>
        </div>
      )}
    </section>
  );
}
