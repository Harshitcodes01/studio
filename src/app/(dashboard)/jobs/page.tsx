"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, Timestamp, doc, updateDoc, serverTimestamp, arrayUnion, addDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { WipeJob, JobStatus, Certificate } from '@/lib/types';
import { CheckCircle2, Loader2, AlertCircle, CircleDashed, Ban, Play, History, GanttChartSquare, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/RoleGuard';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import JobDetailsDrawer from './_components/job-details-drawer';

// --- Certificate Creation ---
async function createCertificate(firestore: any, job: WipeJob) {
    if (!job.endedAt || !job.startedAt) return; // Should not happen
    
    // A real implementation would use a proper hash function
    const logHash = "d41d8cd98f00b204e9800998ecf8427e".repeat(2); // Dummy SHA256

    const certificateId = `CERT-${Date.now()}`;
    const newCertificate: Omit<Certificate, 'id'> = {
        certificateId,
        jobId: job.jobId,
        deviceModel: job.deviceModel,
        deviceSerial: job.deviceSerial,
        deviceSize: job.deviceSize,
        deviceType: job.deviceType,
        wipeMethod: job.policy.name,
        wipePasses: job.policy.passes,
        verificationResult: 'PASS',
        startedAt: job.startedAt,
        endedAt: job.endedAt,
        logHash: logHash,
        createdAt: serverTimestamp() as Timestamp,
        createdByEmail: job.createdByEmail,
        createdByUid: job.createdByUid,
    };
    
    const certsCollection = collection(firestore, 'certificates');
    await addDoc(certsCollection, newCertificate);
}


// --- Job Simulation Logic ---
const useJobSimulator = (jobs: WipeJob[] | null) => {
    const firestore = useFirestore();

    useEffect(() => {
        if (!jobs) return;

        const interval = setInterval(() => {
            jobs.forEach(job => {
                const jobRef = doc(firestore, 'wipeJobs', job.id);
                const now = new Date().toISOString();
                
                if (job.status === 'Running' && job.progress < 100) {
                    const newProgress = Math.min(job.progress + Math.random() * 20, 100);
                    const updates = { 
                        progress: newProgress,
                        logs: arrayUnion(`[${now}] Progress: ${Math.round(newProgress)}%`),
                        speedMBps: 50 + Math.random() * 50, // 50-100 MB/s
                        etaSeconds: (100-newProgress) * 2,
                    };
                    updateDocumentNonBlocking(jobRef, updates);
                }
                else if (job.status === 'Running' && job.progress >= 100) {
                     const updates = { 
                        status: 'Verifying' as JobStatus,
                        logs: arrayUnion(`[${now}] Wipe complete. Starting verification.`),
                     };
                     updateDocumentNonBlocking(jobRef, updates);
                }
                else if (job.status === 'Verifying') {
                    // Simulate verification failure sometimes
                    const isSuccess = Math.random() > 0.1; 
                    const updates = {
                        status: isSuccess ? 'Completed' : 'Failed' as JobStatus,
                        endedAt: serverTimestamp(),
                        errorMessage: isSuccess ? "" : "Verification failed: Data mismatch on sector 0x1A3F.",
                        logs: arrayUnion(`[${now}] Verification ${isSuccess ? 'successful' : 'failed'}. Job finished.`),
                    };
                    updateDocumentNonBlocking(jobRef, updates);

                    if (isSuccess) {
                        const completedJob = { ...job, ...updates, endedAt: Timestamp.now() };
                        createCertificate(firestore, completedJob as any);
                    }
                }
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [jobs, firestore]);
};


export default function JobsPage() {
    const firestore = useFirestore();
    const [selectedJob, setSelectedJob] = useState<WipeJob | null>(null);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const jobsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'wipeJobs'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: jobs, isLoading } = useCollection<WipeJob>(jobsQuery);

    useJobSimulator(jobs); // Start the simulator

    const handleJobAction = (jobId: string, updates: Partial<WipeJob>) => {
        const jobRef = doc(firestore, 'wipeJobs', jobId);
        const now = `[${new Date().toISOString()}]`;
        let logMessage = '';

        if(updates.status === 'Running') logMessage = `${now} Job manually started.`;
        if(updates.status === 'Cancelled') logMessage = `${now} Job cancelled by user.`;
        if(updates.status === 'Queued') logMessage = `${now} Job retried by user.`;


        updateDocumentNonBlocking(jobRef, { ...updates, logs: arrayUnion(logMessage) });
    };

    const handleViewDetails = (job: WipeJob) => {
        setSelectedJob(job);
        setDrawerOpen(true);
    }

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
    
    const formatTimestamp = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'N/A';
        return formatDistanceToNow(timestamp.toDate()) + ' ago';
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Wipe Jobs</CardTitle>
                    <CardDescription>
                        Live progress and history of all data erasure jobs. New jobs will appear here automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[200px]">Progress</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && jobs?.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                                        <GanttChartSquare className="mx-auto h-12 w-12 mb-4" />
                                        No wipe jobs found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {jobs?.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium font-code">{job.jobId}</TableCell>
                                    <TableCell className="font-code">{job.deviceSerial}</TableCell>
                                    <TableCell>{job.policy.name}</TableCell>
                                    <TableCell>{getStatusComponent(job.status)}</TableCell>
                                    <TableCell>
                                        <Progress value={job.progress} className="w-full" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {formatTimestamp(job.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}><Info className="mr-2" /> View</Button>
                                        <RoleGuard allowed={['admin', 'operator']}>
                                            {job.status === 'Queued' && (
                                                <Button size="sm" onClick={() => handleJobAction(job.id, { status: 'Running', startedAt: serverTimestamp() })}>
                                                    <Play className="mr-2" /> Start
                                                </Button>
                                            )}
                                            {job.status === 'Running' && (
                                                <Button variant="destructive" size="sm" onClick={() => handleJobAction(job.id, { status: 'Cancelled', endedAt: serverTimestamp() })}>
                                                    <Ban className="mr-2" /> Cancel
                                                </Button>
                                            )}
                                            {job.status === 'Failed' && (
                                                <Button size="sm" onClick={() => handleJobAction(job.id, { status: 'Queued', progress: 0, errorMessage: '', logs: [] })}>
                                                    <History className="mr-2" /> Retry
                                                </Button>
                                            )}
                                        </RoleGuard>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {selectedJob && (
                <JobDetailsDrawer 
                    job={selectedJob}
                    open={isDrawerOpen}
                    onOpenChange={setDrawerOpen}
                    onJobAction={handleJobAction}
                />
            )}
        </>
    );
}
