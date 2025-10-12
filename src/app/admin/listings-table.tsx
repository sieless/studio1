'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { type Listing } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ExternalLink, Search, Loader2, Eye, CheckCircle, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export function ListingsManagementTable() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  const refreshAdminQueues = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('admin-queue-refresh'));
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    let filtered = listings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((listing) => listing.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((listing) => listing.status === statusFilter);
    }

    if (approvalFilter !== 'all') {
      filtered = filtered.filter((listing) => (listing.approvalStatus || 'approved') === approvalFilter);
    }

    setFilteredListings(filtered);
  }, [searchTerm, typeFilter, statusFilter, approvalFilter, listings]);

  async function fetchListings() {
    try {
      const listingsSnap = await getDocs(collection(db, 'listings'));
      const listingsData = listingsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setListings(listingsData);
      setFilteredListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch listings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteListing(listing: Listing) {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'listings', listing.id));

      toast({
        title: 'Success',
        description: `Listing deleted successfully`,
      });

      // Refresh listings list
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    }
  }

  async function handleUpdateStatus(listingId: string, newStatus: 'Vacant' | 'Occupied' | 'Available Soon') {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status: newStatus,
      });

      toast({
        title: 'Success',
        description: `Listing status updated to ${newStatus}`,
      });

      // Refresh listings list
      fetchListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update listing status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(timestamp: any) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const uniqueTypes = Array.from(new Set(listings.map((l) => l.type)));

  async function completeListingNotification(referenceId: string, extra: Record<string, any> = {}) {
    const notificationsRef = collection(db, 'admin_notifications');
    const snapshot = await getDocs(query(notificationsRef, where('referenceId', '==', referenceId)));

    await Promise.all(
      snapshot.docs.map((docSnap) => updateDoc(doc(db, 'admin_notifications', docSnap.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        ...extra,
      }))
    );
  }

  async function handleApproveListing(listing: Listing) {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'listings', listing.id), {
        approvalStatus: 'approved',
        adminFeedback: null,
        pendingVacancyPayment: false,
      });

      await completeListingNotification(listing.id);

      toast({
        title: 'Listing approved',
        description: `${listing.name || listing.type} is now visible to renters.`,
      });

      fetchListings();
      refreshAdminQueues();
    } catch (error) {
      console.error('Error approving listing:', error);
      toast({
        title: 'Approval failed',
        description: 'Could not approve this listing.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectListing(listing: Listing) {
    const feedback = window.prompt('Provide feedback for the landlord (shared with user):', 'Please update the listing details.');
    if (feedback === null) {
      return;
    }

    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'listings', listing.id), {
        approvalStatus: 'rejected',
        adminFeedback: feedback,
      });

      await completeListingNotification(listing.id, {
        metadata: {
          feedback,
        },
      });

      toast({
        title: 'Listing rejected',
        description: 'Landlord has been notified with your feedback.',
      });

      fetchListings();
      refreshAdminQueues();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast({
        title: 'Action failed',
        description: 'Could not reject this listing.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Listings Management</CardTitle>
          <CardDescription>Loading listings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Listings Management</CardTitle>
          <CardDescription>Manage property listings across the platform</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Vacant">Vacant</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Available Soon">Available Soon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No listings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">
                        {listing.name || `${listing.type} in ${listing.location}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{listing.type}</Badge>
                      </TableCell>
                      <TableCell>{listing.location}</TableCell>
                      <TableCell>Ksh {listing.price.toLocaleString()}</TableCell>
                          <TableCell>
                            {listing.approvalStatus === 'pending' && (
                              <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">
                                Pending
                              </Badge>
                            )}
                            {listing.approvalStatus === 'approved' && (
                              <Badge variant="default" className="bg-green-600">
                                Approved
                              </Badge>
                            )}
                            {listing.approvalStatus === 'auto' && (
                              <Badge variant="outline">Auto</Badge>
                            )}
                            {listing.approvalStatus === 'rejected' && (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                          </TableCell>
                      <TableCell>
                        <Select
                          value={listing.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(listing.id, value as any)
                          }
                              disabled={
                                actionLoading || !['approved', 'auto'].includes((listing.approvalStatus || 'approved') as string)
                              }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vacant">Vacant</SelectItem>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                            <SelectItem value="Available Soon">Available Soon</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(listing.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                              {listing.approvalStatus === 'pending' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApproveListing(listing)}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" /> Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectListing(listing)}
                                    disabled={actionLoading}
                                  >
                                    <Ban className="mr-1 h-3 w-3" /> Reject
                                  </Button>
                                </>
                              )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/listings/${listing.id}`} target="_blank">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(listing);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredListings.length} of {listings.length} listings
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the listing{' '}
              <strong>{selectedListing?.name || selectedListing?.type}</strong> in{' '}
              {selectedListing?.location}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedListing && handleDeleteListing(selectedListing)}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Listing'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
