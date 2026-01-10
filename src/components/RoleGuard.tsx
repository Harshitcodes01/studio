
'use client';

import { useUserRole } from '@/firebase';
import type { UserRole } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface RoleGuardProps {
  allowed: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that renders its children only if the current user's role
 * is included in the `allowed` prop.
 *
 * It shows a loading skeleton while the role is being determined.
 */
export function RoleGuard({ allowed, children, fallback = null }: RoleGuardProps) {
  const { role, isRoleLoading } = useUserRole();

  if (isRoleLoading) {
    // You might want a more subtle loader depending on the context
    return <Skeleton className="h-8 w-24" />;
  }

  if (role && allowed.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
