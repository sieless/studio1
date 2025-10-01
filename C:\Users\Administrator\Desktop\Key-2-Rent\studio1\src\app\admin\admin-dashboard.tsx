'use client';

import { useState } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import { type UserProfile, type Listing } from '@/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AddListingModal } from '@/components/add-listing-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersTable } from './users-table';
import { ListingsTable } from './listings-table';
import { Users, Home } from 'lucide-react';

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const db = useFirestore();

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(
    query(collection(db, 'users'), orderBy('name'))
  );

  const { data: listings, isLoading: listingsLoading } = useCollection<Listing>(
    query(collection(db, 'listings'), orderBy('createdAt', 'desc'))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => setIsModalOpen(true)} />
      <main className="flex-grow bg-muted/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, listings, and monitor site activity.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersLoading ? '...' : users?.length ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{listingsLoading ? '...' : listings?.length ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="users">
                <Users className="mr-2" /> Users
              </TabsTrigger>
              <TabsTrigger value="listings">
                <Home className="mr-2" /> Listings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View and manage all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UsersTable users={users ?? []} isLoading={usersLoading} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>All Listings</CardTitle>
                  <CardDescription>View and manage all property listings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ListingsTable listings={listings ?? []} isLoading={listingsLoading} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      {isModalOpen && (
        <AddListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
