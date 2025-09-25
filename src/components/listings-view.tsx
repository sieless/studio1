"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Listing } from "@/types";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FilterPanel } from "@/components/filter-panel";
import { ListingGrid } from "@/components/listing-grid";
import { AddListingModal } from "@/components/add-listing-modal";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeletons() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Finding Properties...</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden flex flex-col p-5 space-y-4">
            <Skeleton className="h-56 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-2 pt-4 border-t">
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="pt-4 border-t">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: "All",
    type: "All",
    maxPrice: 30000,
  });

  useEffect(() => {
    setLoading(true);
    const listingsCollection = collection(db, "listings");
    const q = query(listingsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listingsData = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setListings(listingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (name: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const locationMatch =
        filters.location === "All" || listing.location === filters.location;
      const typeMatch = filters.type === "All" || listing.type === filters.type;
      const priceMatch = listing.price <= filters.maxPrice;
      return locationMatch && typeMatch && priceMatch;
    });
  }, [listings, filters]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => setIsModalOpen(true)} />
      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        {loading ? (
          <LoadingSkeletons />
        ) : (
          <ListingGrid listings={filteredListings} />
        )}
      </main>
      <Footer />
      {isModalOpen && <AddListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
