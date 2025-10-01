'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Listing } from '@/types';
import { Badge } from '@/components/ui/badge';
import { getStatusClass, getPropertyIcon } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type ListingsTableProps = {
  listings: Listing[];
  isLoading: boolean;
};

const TableSkeleton = () => (
    <div className="space-y-4">
        {Array.from({length: 5}).map((_, i) => (
             <div key={i} className="flex items-center space-x-4 p-2">
                <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
)

export function ListingsTable({ listings, isLoading }: ListingsTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Listing</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map(listing => (
          <TableRow key={listing.id}>
            <TableCell className="font-medium">{listing.name || 'N/A'}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {getPropertyIcon(listing.type)}
                    {listing.type}
                </div>
            </TableCell>
            <TableCell>{listing.location}</TableCell>
            <TableCell>Ksh {listing.price.toLocaleString()}</TableCell>
            <TableCell>
              <Badge className={getStatusClass(listing.status)}>{listing.status}</Badge>
            </TableCell>
            <TableCell>
              {listing.createdAt ? format(listing.createdAt.toDate(), 'PP') : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
