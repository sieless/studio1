'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersManagementTable } from './users-table';
import { ListingsManagementTable } from './listings-table';
import { PaymentSettingsPanel } from './payment-settings';
import { Users, Home, TrendingUp, MapPin, Building2, Activity, DollarSign, StickyNote, RefreshCw } from 'lucide-react';
import { type AdminStats, type LandlordApplication, type Listing, type Transaction, type AdminNotification } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingLandlords, setPendingLandlords] = useState<LandlordApplication[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Transaction[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<AdminNotification[]>([]);
  const db = useFirestore();

  async function fetchStats() {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const listingsSnap = await getDocs(collection(db, 'listings'));
      const listings = listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const listingsByType: Record<string, number> = {};
      const listingsByLocation: Record<string, number> = {};
      const listingsByStatus: Record<string, number> = {};

      listings.forEach((listing: any) => {
        listingsByType[listing.type] = (listingsByType[listing.type] || 0) + 1;
        listingsByLocation[listing.location] = (listingsByLocation[listing.location] || 0) + 1;
        listingsByStatus[listing.status] = (listingsByStatus[listing.status] || 0) + 1;
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUsers = users.filter((user: any) => {
        if (!user.createdAt) return false;
        const createdAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return createdAt >= sevenDaysAgo;
      }).length;

      const recentListings = listings.filter((listing: any) => {
        if (!listing.createdAt) return false;
        const createdAt = listing.createdAt.toDate ? listing.createdAt.toDate() : new Date(listing.createdAt);
        return createdAt >= sevenDaysAgo;
      }).length;

      setStats({
        totalUsers: users.length,
        totalListings: listings.length,
        listingsByType,
        listingsByLocation,
        listingsByStatus,
        recentUsers,
        recentListings,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchQueues();
    const refreshHandler = () => {
      fetchQueues();
    };

    window.addEventListener('admin-queue-refresh', refreshHandler);

    return () => {
      window.removeEventListener('admin-queue-refresh', refreshHandler);
    };
  }, [db]);

  async function fetchQueues() {
    try {
      const landlordQuery = query(
        collection(db, 'landlord_applications'),
        where('status', '==', 'pending'),
        limit(8)
      );

      const listingsQuery = query(
        collection(db, 'listings'),
        where('approvalStatus', '==', 'pending'),
        limit(8)
      );

      const paymentsQuery = query(
        collection(db, 'transactions'),
        where('status', '==', 'PENDING'),
        limit(8)
      );

      const notificationsQuery = query(
        collection(db, 'admin_notifications'),
        where('status', '==', 'pending'),
        limit(12)
      );

      const [landlordsSnap, listingsSnap, paymentsSnap, notificationsSnap] = await Promise.all([
        getDocs(landlordQuery),
        getDocs(listingsQuery),
        getDocs(paymentsQuery),
        getDocs(notificationsQuery),
      ]);

      const pendingLandlordData = landlordsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as LandlordApplication[];
      pendingLandlordData.sort((a, b) => (b.submittedAt?.toMillis?.() || 0) - (a.submittedAt?.toMillis?.() || 0));
      setPendingLandlords(pendingLandlordData);

      const pendingListingData = listingsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as Listing[];
      pendingListingData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPendingListings(pendingListingData);

      const pendingPaymentData = paymentsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      pendingPaymentData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPendingPayments(pendingPaymentData);

      const pendingNotificationData = notificationsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as AdminNotification[];
      pendingNotificationData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPendingNotifications(pendingNotificationData);
    } catch (error) {
      console.error('Error fetching admin queues:', error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, listings, and monitor platform activity
          </p>
        </div>
        <Button variant="outline" onClick={() => { fetchStats(); fetchQueues(); }} className="self-start md:self-auto">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentUsers || 0} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalListings || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentListings || 0} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.listingsByStatus['Vacant'] || 0}</div>
            <p className="text-xs text-muted-foreground">Available for rent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.listingsByLocation
                ? Object.entries(stats.listingsByLocation).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.listingsByLocation
                ? Object.entries(stats.listingsByLocation).sort((a, b) => b[1] - a[1])[0]?.[1] || 0
                : 0}{' '}
              properties
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              Landlord approvals
              <Badge variant={pendingLandlords.length > 0 ? 'default' : 'outline'}>
                {pendingLandlords.length} pending
              </Badge>
            </CardTitle>
            <CardDescription>Review new landlord verification requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLandlords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending landlord applications.</p>
            ) : (
              <ul className="space-y-2">
                {pendingLandlords.slice(0, 5).map((app) => (
                  <li key={app.id} className="text-sm flex flex-col">
                    <span className="font-medium text-foreground">
                      {app.userName || app.userEmail || 'Unknown user'}
                    </span>
                    <span className="text-muted-foreground">
                      {app.propertyName ? `${app.propertyName} • ` : ''}{app.propertyLocation || 'Location N/A'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              Listing reviews
              <Badge variant={pendingListings.length > 0 ? 'default' : 'outline'}>
                {pendingListings.length} pending
              </Badge>
            </CardTitle>
            <CardDescription>Approve or reject new property listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingListings.length === 0 ? (
              <p className="text-sm text-muted-foreground">All listings are up to date.</p>
            ) : (
              <ul className="space-y-2">
                {pendingListings.slice(0, 5).map((listing) => (
                  <li key={listing.id} className="text-sm flex flex-col">
                    <span className="font-medium text-foreground">
                      {listing.name || `${listing.type} in ${listing.location}`}
                    </span>
                    <span className="text-muted-foreground">
                      Submitted {listing.createdAt?.toDate?.().toLocaleDateString?.() || 'recently'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              Payment confirmations
              <Badge variant={pendingPayments.length > 0 ? 'default' : 'outline'}>
                {pendingPayments.length} pending
              </Badge>
            </CardTitle>
            <CardDescription>Verify M-Pesa payment declarations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending payments to verify.</p>
            ) : (
              <ul className="space-y-2">
                {pendingPayments.slice(0, 5).map((payment) => (
                  <li key={payment.id} className="text-sm flex flex-col">
                    <span className="font-medium text-foreground">
                      {payment.userName || payment.userEmail || payment.userId}
                    </span>
                    <span className="text-muted-foreground">
                      KES {(payment.amount || 0).toLocaleString()} • {payment.type || 'Payment'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <StickyNote className="h-4 w-4" /> Admin notifications
          </CardTitle>
          <CardDescription>System-generated alerts needing your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open notifications.</p>
          ) : (
            <ul className="space-y-3">
              {pendingNotifications.slice(0, 8).map((notification) => (
                <li key={notification.id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="text-muted-foreground">{notification.message}</p>
                  </div>
                  <Badge variant="outline">{notification.type.replace(/_/g, ' ')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Listings by Type</CardTitle>
            <CardDescription>Distribution of property types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.listingsByType &&
                Object.entries(stats.listingsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings by Status</CardTitle>
            <CardDescription>Current availability status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.listingsByStatus &&
                Object.entries(stats.listingsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tables */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users Management
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Home className="mr-2 h-4 w-4" />
            Listings Management
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="mr-2 h-4 w-4" />
            Payment Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersManagementTable />
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <ListingsManagementTable />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
