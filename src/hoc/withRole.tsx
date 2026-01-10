'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/firebase/auth/use-user-role';
import type { UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function withRole(
  WrappedComponent: React.ComponentType,
  allowedRoles: UserRole[]
) {
  const WithRoleWrapper = (props: any) => {
    const { role, isRoleLoading } = useUserRole();
    const router = useRouter();

    useEffect(() => {
      if (!isRoleLoading && role && !allowedRoles.includes(role)) {
        router.replace('/unauthorized');
      }
    }, [role, isRoleLoading, router]);

    if (isRoleLoading || !role || !allowedRoles.includes(role)) {
      // This will be shown while loading or if the user is about to be redirected.
      return <Skeleton className="h-screen w-screen" />;
    }

    return <WrappedComponent {...props} />;
  };
  
  WithRoleWrapper.displayName = `WithRole(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithRoleWrapper;
}
