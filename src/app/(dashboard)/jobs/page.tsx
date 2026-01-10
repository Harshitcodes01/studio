"use client";

import React, { useState, useEffect } from 'react';
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
import { jobs as mockJobs } from '@/lib/data';
import type { Job, JobStatus } from '@/lib/types';
import { CheckCircle2, Loader2, Play, AlertCircle, CircleDashed } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>(mockJobs);

    // Simulate new job being added and progress
    useEffect(() => {
        // Add a new pending job to simulate a new wipe starting
        const hasPendingJob = jobs.some(job => job.status === 'Pending');
        if (!hasPendingJob && jobs.length === 2) { // only run once
            const newJob: Job = {
                id: 'JOB-003',
                deviceId: '2',
                deviceSerial: '2039E2C8A002',
                status: 'Pending',
                progress: 0,
                wipeMethod: 'Secure Erase',
                startedAt: new Date().toISOString(),
                log: ['[timestamp] Job created and is pending...']
            };
            setTimeout(() => setJobs(prev => [newJob, ...prev]), 1000);
        }

        const interval = setInterval(() => {
            setJobs(currentJobs => 
                currentJobs.map(job => {
                    if (job.status === 'Pending') {
                        return { ...job, status: 'Wiping' as JobStatus, progress: 1 };
                    }
                    if (job.status === 'Wiping' && job.progress < 100) {
                        return { ...job, progress: Math.min(job.progress + Math.random() * 10, 100) };
                    }
                    if (job.status === 'Wiping' && job.progress >= 100) {
                        return { ...job, status: 'Verifying' as JobStatus };
                    }
                    if (job.status === 'Verifying') {
                         return { ...job, status: 'Completed' as JobStatus, completedAt: new Date().toISOString() };
                    }
                    return job;
                })
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [jobs.length]);

    const getStatusComponent = (status: JobStatus, progress: number) => {
        switch (status) {
            case 'Completed':
                return <Badge className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="mr-2 h-4 w-4" />Completed</Badge>;
            case 'Wiping':
                return <Badge variant="secondary"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wiping ({Math.round(progress)}%)</Badge>;
            case 'Verifying':
                return <Badge variant="secondary"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying</Badge>;
            case 'Failed':
                return <Badge variant="destructive"><AlertCircle className="mr-2 h-4 w-4" />Failed</Badge>;
            case 'Pending':
                return <Badge variant="outline"><CircleDashed className="mr-2 h-4 w-4 animate-spin" />Pending</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wipe Jobs</CardTitle>
                <CardDescription>
                    Live progress and history of all data erasure jobs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Device Serial</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium font-code">{job.id}</TableCell>
                                <TableCell className="font-code">{job.deviceSerial}</TableCell>
                                <TableCell>{job.wipeMethod} {job.passes ? `(${job.passes} passes)` : ''}</TableCell>
                                <TableCell>{getStatusComponent(job.status, job.progress)}</TableCell>
                                <TableCell>
                                    <Progress value={job.progress} className="w-[100px] sm:w-[200px]" />
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">
                                    {job.completedAt ? 
                                     `Completed ${formatDistanceToNow(new Date(job.completedAt))} ago` : 
                                     `Started ${formatDistanceToNow(new Date(job.startedAt))} ago`
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
