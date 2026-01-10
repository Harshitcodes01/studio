import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
           <div className="flex justify-center items-center gap-2 mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <CardTitle className="text-3xl">Access Denied</CardTitle>
            </div>
          <CardDescription>
            You do not have the necessary permissions to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Please contact your administrator if you believe this is an error.
          </p>
          <Button asChild>
            <Link href="/devices">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
