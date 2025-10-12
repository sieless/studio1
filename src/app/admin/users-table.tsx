'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { type UserProfile } from '@/types';
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
import { Trash2, Ban, CheckCircle, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function UsersManagementTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const db = useFirestore();
  const { user: adminUser } = useUser();
  const refreshAdminQueues = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('admin-queue-refresh'));
    }
  };
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  async function fetchUsers() {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          email: data.email || '',
          name: data.name || data.displayName || '',
          listings: data.listings || [],
          canViewContacts: data.canViewContacts ?? false,
          createdAt: data.createdAt,
          suspended: data.suspended ?? false,
          accountType: data.accountType ?? 'tenant',
          landlordApprovalStatus: data.landlordApprovalStatus ?? 'none',
          phoneNumber: data.phoneNumber,
          preferredCounty: data.preferredCounty,
          landlordApplicationId: data.landlordApplicationId,
        } as UserProfile;
      });
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(user: UserProfile) {
    setActionLoading(true);
    try {
      // Delete all user's listings first
      if (user.listings && user.listings.length > 0) {
        const batch = writeBatch(db);
        user.listings.forEach((listingId) => {
          batch.delete(doc(db, 'listings', listingId));
        });
        await batch.commit();
      }

      // Delete user document
      await deleteDoc(doc(db, 'users', user.id));

      toast({
        title: 'Success',
        description: `User ${user.email} and their listings have been deleted`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  }

  async function handleToggleSuspend(user: UserProfile) {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        suspended: !user.suspended,
      });

      toast({
        title: 'Success',
        description: `User ${user.suspended ? 'unsuspended' : 'suspended'} successfully`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function completeNotification(referenceId: string | undefined, extra: Record<string, any> = {}) {
    if (!referenceId) return;

    const notificationsRef = collection(db, 'admin_notifications');
    const snapshot = await getDocs(query(notificationsRef, where('referenceId', '==', referenceId)));

    await Promise.all(
      snapshot.docs.map(n => updateDoc(doc(db, 'admin_notifications', n.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        ...extra,
      }))
    );
  }

  async function handleApproveLandlord(user: UserProfile) {
    setActionLoading(true);
    setProcessingUserId(user.id);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        accountType: 'landlord',
        landlordApprovalStatus: 'approved',
      });

      if (user.landlordApplicationId) {
        await updateDoc(doc(db, 'landlord_applications', user.landlordApplicationId), {
          status: 'approved',
          reviewedAt: serverTimestamp(),
          reviewerId: adminUser?.uid || 'system',
          reviewerEmail: adminUser?.email || 'admin@key2rent.com',
          adminFeedback: null,
        });

        await completeNotification(user.landlordApplicationId);
      }

      toast({
        title: 'Landlord approved',
        description: `${user.email} can now post listings immediately.`,
      });

      fetchUsers();
      refreshAdminQueues();
    } catch (error) {
      console.error('Error approving landlord:', error);
      toast({
        title: 'Approval failed',
        description: 'Could not approve this landlord.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setProcessingUserId(null);
    }
  }

  async function handleRejectLandlord(user: UserProfile) {
    const feedback = window.prompt('Provide feedback for the landlord (shared with the user):', 'Please provide additional property details.');
    if (feedback === null) {
      return;
    }

    setActionLoading(true);
    setProcessingUserId(user.id);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        accountType: 'tenant',
        landlordApprovalStatus: 'rejected',
      });

      if (user.landlordApplicationId) {
        await updateDoc(doc(db, 'landlord_applications', user.landlordApplicationId), {
          status: 'rejected',
          adminFeedback: feedback,
          reviewedAt: serverTimestamp(),
          reviewerId: adminUser?.uid || 'system',
          reviewerEmail: adminUser?.email || 'admin@key2rent.com',
        });

        await completeNotification(user.landlordApplicationId, {
          metadata: {
            feedback,
          },
        });
      }

      toast({
        title: 'Landlord rejected',
        description: 'The user has been notified to review their submission.',
      });

      fetchUsers();
      refreshAdminQueues();
    } catch (error) {
      console.error('Error rejecting landlord:', error);
      toast({
        title: 'Action failed',
        description: 'Could not reject this landlord. Try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setProcessingUserId(null);
    }
  }

  function formatDate(timestamp: any) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
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
          <CardTitle>Users Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Landlord Status</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Badge variant={user.accountType === 'landlord' ? 'default' : 'outline'}>
                          {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.landlordApprovalStatus === 'approved' && (
                          <Badge variant="default" className="bg-green-600">
                            Approved
                          </Badge>
                        )}
                        {user.landlordApprovalStatus === 'pending' && (
                          <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">
                            Pending
                          </Badge>
                        )}
                        {user.landlordApprovalStatus === 'rejected' && (
                          <Badge variant="destructive">
                            Rejected
                          </Badge>
                        )}
                        {user.landlordApprovalStatus === 'none' && (
                          <Badge variant="outline">Not applied</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.listings?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        {user.suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.landlordApprovalStatus === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveLandlord(user)}
                                disabled={actionLoading}
                              >
                                {processingUserId === user.id ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectLandlord(user)}
                                disabled={actionLoading}
                              >
                                <Ban className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant={user.suspended ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleToggleSuspend(user)}
                            disabled={actionLoading}
                          >
                            {user.suspended ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Unsuspend
                              </>
                            ) : (
                              <>
                                <Ban className="mr-1 h-3 w-3" />
                                Suspend
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
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
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{selectedUser?.email}</strong> and all
              their listings ({selectedUser?.listings?.length || 0} listings). This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
