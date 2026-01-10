import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText } from 'lucide-react';

// This is a placeholder page.
// In a real application, you would fetch and display audit logs here.

export default function AuditLogsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          Review system and user activity logs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 text-center h-64 border-2 border-dashed rounded-lg">
            <FileText className="w-16 h-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Audit Logs Found</h3>
            <p className="text-muted-foreground">
                Audit logging is enabled, but no logs have been recorded yet.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
