"use client";

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { UserProfile, LandlordApprovalStatus, UserAccountType } from '@/types';

type HookResult = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
};

const DEFAULT_ACCOUNT_TYPE: UserAccountType = 'tenant';
const DEFAULT_APPROVAL_STATUS: LandlordApprovalStatus = 'none';

function withDefaults(profile: UserProfile | null): UserProfile | null {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    accountType: profile.accountType ?? DEFAULT_ACCOUNT_TYPE,
    landlordApprovalStatus: profile.landlordApprovalStatus ?? DEFAULT_APPROVAL_STATUS,
    listings: profile.listings ?? [],
    canViewContacts: profile.canViewContacts ?? false,
  };
}

export function useCurrentUserProfile(): HookResult {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const ref = useMemo(() => {
    if (!db || !user) {
      return null;
    }

    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data, isLoading, error } = useDoc<UserProfile>(ref);

  return {
    profile: withDefaults(data),
    isLoading: isUserLoading || isLoading,
    error: error ?? null,
  };
}
