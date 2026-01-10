'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, GanttChartSquare } from 'lucide-react';
import { withRole } from '@/hoc/withRole';
import React from 'react';

// This is a placeholder page.
// In a real application, you would fetch and display audit logs from a Firestore collection.

function AuditLogsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          Review system and user activity logs. (Feature in development)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 text-center h-64 border-2 border-dashed rounded-lg">
            <GanttChartSquare className="w-16 h-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Audit Logs Found</h3>
            <p className="text-muted-foreground">
                Audit logging has not been fully implemented yet.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default withRole(AuditLogsPage, ['admin', 'auditor']);
