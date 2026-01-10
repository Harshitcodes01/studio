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
import { HardDrive, ListChecks, ShieldCheck, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/devices", icon: HardDrive, label: "Devices" },
    { href: "/jobs", icon: ListChecks, label: "Jobs" },
    { href: "/certificates", icon: ShieldCheck, label: "Certificates" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const pageTitle = navItems.find(item => pathname.startsWith(item.href))?.label || "Dashboard";

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
                {navItems.map((item) => (
                     <SidebarMenuItem key={item.href}>
                        <Link href={item.href} legacyBehavior passHref>
                            <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                                <item.icon />
                                <span>{item.label}</span>
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
            <h1 className="flex-1 text-xl font-semibold">{pageTitle}</h1>
            <Button variant="ghost" size="icon">
                <UserCircle className="size-6" />
                <span className="sr-only">User Profile</span>
            </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-background/80">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
