"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WipeJob, JobStatus } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Ban, CheckCircle2, History, Loader2, Play, AlertCircle, CircleDashed, Server, HardDrive, Shield, Hash, Gauge, Clock, Calendar, Fingerprint, Mail } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Timestamp, serverTimestamp } from 'firebase/firestore';
import { RoleGuard } from '@/components/RoleGuard';

interface JobDetailsDrawerProps {
  job: WipeJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobAction: (jobId: string, updates: Partial<WipeJob>) => void;
}

export default function JobDetailsDrawer({ job, open, onOpenChange, onJobAction }: JobDetailsDrawerProps) {
    const getStatusComponent = (status: JobStatus) => {
        switch (status) {
            case 'Completed':
                return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2 h-4 w-4" />Completed</Badge>;
            case 'Running':
                return <Badge variant="secondary"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running</Badge>;
            case 'Verifying':
                return <Badge variant="secondary"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying</Badge>;
            case 'Failed':
                return <Badge variant="destructive"><AlertCircle className="mr-2 h-4 w-4" />Failed</Badge>;
            case 'Queued':
                return <Badge variant="outline"><CircleDashed className="mr-2 h-4 w-4" />Queued</Badge>;
            case 'Cancelled':
                return <Badge variant="destructive" className="bg-gray-500"><Ban className="mr-2 h-4 w-4" />Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatTimestamp = (ts: Timestamp | undefined) => {
        if (!ts) return "N/A";
        const date = ts.toDate();
        return `${format(date, 'yyyy-MM-dd HH:mm:ss')} (${formatDistanceToNow(date)} ago)`;
    };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Job Details: <span className="font-code text-primary">{job.jobId}</span>
          </SheetTitle>
          <SheetDescription>
            Detailed information and logs for this wipe job.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-grow my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm pr-6">
                <InfoItem icon={HardDrive} label="Device Serial" value={job.deviceSerial} isCode />
                <InfoItem icon={Server} label="Device Path" value={job.devicePath} isCode />
                <InfoItem icon={HardDrive} label="Device Model" value={job.deviceModel} />
                <InfoItem icon={Fingerprint} label="Device ID" value={job.deviceId} isCode />
                
                <Separator className="col-span-1 md:col-span-2 my-2"/>

                <InfoItem icon={Shield} label="Wipe Policy" value={job.policy.name} />
                <InfoItem icon={Hash} label="Passes" value={job.policy.passes?.toString() || 'N/A'} />
                <InfoItem icon={Gauge} label="Progress" value={`${job.progress.toFixed(0)}%`} />
                <InfoItem icon={Calendar} label="Status">
                   {getStatusComponent(job.status)}
                </InfoItem>

                <Separator className="col-span-1 md:col-span-2 my-2"/>

                <InfoItem icon={Calendar} label="Created At" value={formatTimestamp(job.createdAt)} />
                <InfoItem icon={Clock} label="Started At" value={formatTimestamp(job.startedAt)} />
                <InfoItem icon={Clock} label="Ended At" value={formatTimestamp(job.endedAt)} />
                <InfoItem icon={Mail} label="Created By" value={job.createdByEmail} />

                {job.errorMessage && (
                    <>
                        <Separator className="col-span-1 md:col-span-2 my-2"/>
                        <InfoItem icon={AlertCircle} label="Error Message" value={job.errorMessage} fullWidth className="text-destructive" />
                    </>
                )}

                <Separator className="col-span-1 md:col-span-2 my-2"/>
                
                <div className="col-span-1 md:col-span-2">
                    <h4 className="font-semibold mb-2">Logs</h4>
                    <pre className="bg-muted text-muted-foreground rounded-md p-4 text-xs h-64 overflow-y-auto font-code">
                        {job.logs.join('\n')}
                    </pre>
                </div>
            </div>
        </ScrollArea>

        <SheetFooter className="mt-auto pt-4 border-t">
          <RoleGuard allowed={['admin', 'operator']}>
            <div className="flex gap-2">
                {job.status === 'Queued' && (
                    <Button size="sm" onClick={() => onJobAction(job.id, { status: 'Running', startedAt: serverTimestamp() })}>
                        <Play className="mr-2" /> Start Job
                    </Button>
                )}
                {job.status === 'Running' || job.status === 'Verifying' ? (
                     <Button variant="destructive" size="sm" onClick={() => onJobAction(job.id, { status: 'Cancelled', endedAt: serverTimestamp() })}>
                        <Ban className="mr-2" /> Cancel Job
                    </Button>
                ): null}
                {job.status === 'Failed' && (
                    <Button size="sm" onClick={() => onJobAction(job.id, { status: 'Queued', progress: 0, errorMessage: '', logs: [] })}>
                        <History className="mr-2" /> Retry Job
                    </Button>
                )}
             </div>
           </RoleGuard>
           <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ icon: Icon, label, value, children, isCode=false, fullWidth=false, className="" }: {
    icon: React.ElementType,
    label: string,
    value?: string,
    children?: React.ReactNode,
    isCode?: boolean,
    fullWidth?: boolean,
    className?: string,
}) {
    return (
        <div className={cn("flex flex-col gap-1", fullWidth && "md:col-span-2", className)}>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
            </div>
            {value && <div className={cn("ml-6", isCode && "font-code")}>{value}</div>}
            {children && <div className="ml-6">{children}</div>}
        </div>
    )
}
