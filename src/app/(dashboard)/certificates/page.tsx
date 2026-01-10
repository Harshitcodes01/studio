import Link from 'next/link';
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
import { Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { certificates as mockCertificates } from '@/lib/data';
import { format } from 'date-fns';

export default function CertificatesPage() {
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
            {mockCertificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium font-code">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {cert.id}
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
                <TableCell>{format(new Date(cert.issuedAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/verify/${cert.id}`} target='_blank' passHref>
                    <Button asChild variant="outline" size="sm">
                      <a>
                        <Download className="mr-2 h-4 w-4" />
                        View/Verify
                      </a>
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
