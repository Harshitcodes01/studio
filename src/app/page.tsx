'use client';

import { useUser } from "@/firebase";
import { redirect } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";


export default function HomePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  if (user) {
    redirect('/devices');
  } else {
    redirect('/login');
  }
}
