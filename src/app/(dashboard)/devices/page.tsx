"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Bot, ShieldX, CheckCircle, HardDrive } from 'lucide-react';
import { devices as mockDevices } from '@/lib/data';
import type { Device } from '@/lib/types';
import AiPolicyDialog from './_components/ai-policy-dialog';
import WipeDialog from './_components/wipe-dialog';
import { useToast } from '@/hooks/use-toast';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isAiPolicyDialogOpen, setAiPolicyDialogOpen] = useState(false);
  const [isWipeDialogOpen, setWipeDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSuggestPolicy = (device: Device) => {
    setSelectedDevice(device);
    setAiPolicyDialogOpen(true);
  };

  const handleWipe = (device: Device) => {
    if (device.status === 'Protected') return;
    setSelectedDevice(device);
    setWipeDialogOpen(true);
  };
  
  const handleConfirmWipe = (device: Device) => {
    console.log(`Wiping device: ${device.path}`);
    setWipeDialogOpen(false);
    
    // Here you would typically call an API to start the wipe job.
    // For this simulation, we'll just show a toast and redirect.
    toast({
        title: "Wipe Job Started",
        description: `Wiping process for ${device.path} has been initiated.`,
        variant: "default"
    })
    
    router.push('/jobs');
  };

  const getStatusBadge = (status: Device['status']) => {
    switch (status) {
      case 'Protected':
        return <Badge variant="destructive"><ShieldX className="mr-2 h-4 w-4" />{status}</Badge>;
      case 'Mounted':
        return <Badge variant="secondary"><CheckCircle className="mr-2 h-4 w-4" />{status}</Badge>;
      case 'Unmounted':
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>
            List of all detected storage devices. System disks are protected from wiping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="hidden md:table-cell">Model</TableHead>
                <TableHead className="hidden sm:table-cell">Serial</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{device.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-code">{device.path}</TableCell>
                  <TableCell className="hidden md:table-cell">{device.model}</TableCell>
                  <TableCell className="font-code hidden sm:table-cell">{device.serial}</TableCell>
                  <TableCell>{device.size}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSuggestPolicy(device)}>
                        <Bot className="mr-2 h-4 w-4" /> Suggest Policy
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleWipe(device)}
                        disabled={device.status === 'Protected'}
                      >
                        Wipe
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedDevice && (
        <>
          <AiPolicyDialog
            open={isAiPolicyDialogOpen}
            onOpenChange={setAiPolicyDialogOpen}
            device={selectedDevice}
          />
          <WipeDialog
            open={isWipeDialogOpen}
            onOpenChange={setWipeDialogOpen}
            device={selectedDevice}
            onConfirmWipe={handleConfirmWipe}
          />
        </>
      )}
    </>
  );
}
