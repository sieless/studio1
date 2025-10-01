'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { type UserProfile } from '@/types';
import AdminDashboard from './admin-dashboard';
import { Loader2 } from 'lucide-react';

const AdminPage = () => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    const isLoading = isUserLoading || isProfileLoading;
    if (!isLoading) {
      if (!user || userProfile?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (userProfile?.role === 'admin') {
    return <AdminDashboard />;
  }

  return null;
};

export default AdminPage;
