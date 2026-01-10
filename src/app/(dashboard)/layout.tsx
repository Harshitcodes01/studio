"use client"
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { HardDrive, ListChecks, LogOut, ShieldCheck, UserCircle, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, useUserRole } from "@/firebase";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const navItems = [
    { href: "/devices", icon: HardDrive, label: "Devices", allowedRoles: ['admin', 'operator'] },
    { href: "/jobs", icon: ListChecks, label: "Jobs", allowedRoles: ['admin', 'operator'] },
    { href: "/certificates", icon: ShieldCheck, label: "Certificates", allowedRoles: ['admin', 'operator', 'auditor'] },
    { href: "/audit-logs", icon: FileText, label: "Audit Logs", allowedRoles: ['admin', 'auditor'] },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const { role, isRoleLoading } = useUserRole();
    const auth = useAuth();

    const pageTitle = navItems.find(item => pathname.startsWith(item.href))?.label || "Dashboard";

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    if (isUserLoading || isRoleLoading || !user) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Skeleton className="h-full w-full" />
            </div>
        );
    }
    
    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name[0];
    }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">Wipe Verify</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {navItems
                  .filter(item => item.allowedRoles.includes(role || ''))
                  .map((item) => (
                     <SidebarMenuItem key={item.href}>
                        <Link href={item.href} passHref>
                            <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                                <span className="flex items-center gap-2">
                                    <item.icon />
                                    <span>{item.label}</span>
                                </span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1 flex items-center justify-between">
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {role && <Badge variant="outline" className="mt-2 w-fit">{role}</Badge>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-background/80">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
