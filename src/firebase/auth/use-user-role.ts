
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import type { UserProfile, UserRole } from '@/lib/types';

interface UserRoleResult {
  role: UserRole | null;
  isRoleLoading: boolean;
}

export function useUserRole(): UserRoleResult {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isUserLoading) {
      setIsRoleLoading(true);
      return;
    }
    
    if (!user) {
      setRole(null);
      setIsRoleLoading(false);
      return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userProfile = docSnap.data() as UserProfile;
        setRole(userProfile.role);
      } else {
        // This case can happen briefly when a user is created but their doc isn't ready.
        setRole(null);
      }
      setIsRoleLoading(false);
    }, (error) => {
        console.error("Error fetching user role:", error);
        setRole(null);
        setIsRoleLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, isUserLoading]);

  return { role, isRoleLoading };
}
