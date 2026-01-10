"use client";

import React from 'react';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, ShieldCheck, Loader2, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { Certificate } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export default function CertificatesPage() {
  const firestore = useFirestore();

  const certsQuery = useMemoFirebase(() => {
      return query(collection(firestore, 'certificates'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: certificates, isLoading } = useCollection<Certificate>(certsQuery);

  const formatTimestamp = (ts: Timestamp | undefined) => {
    if (!ts) return "N/A";
    const date = ts.toDate();
    return format(date, 'yyyy-MM-dd HH:mm');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Erasure Certificates</CardTitle>
        <CardDescription>
          Download tamper-proof certificates for completed wipe jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate ID</TableHead>
              <TableHead>Device Serial</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                </TableRow>
            )}
            {!isLoading && certificates?.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-48 text-muted-foreground">
                        <FileQuestion className="mx-auto h-12 w-12 mb-4" />
                        No certificates found.
                    </TableCell>
                </TableRow>
            )}
            {certificates?.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium font-code">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {cert.certificateId}
                  </div>
                </TableCell>
                <TableCell className="font-code">{cert.deviceSerial}</TableCell>
                <TableCell>{cert.wipeMethod} {cert.wipePasses ? `(${cert.wipePasses}p)`: ''}</TableCell>
                <TableCell>
                  <Badge variant={cert.verificationResult === 'PASS' ? 'default' : 'destructive'} className={cert.verificationResult === 'PASS' ? 'bg-green-600' : ''}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {cert.verificationResult}
                  </Badge>
                </TableCell>
                <TableCell>{formatTimestamp(cert.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/verify/${cert.certificateId}`} target='_blank' passHref>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        View/Verify
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
