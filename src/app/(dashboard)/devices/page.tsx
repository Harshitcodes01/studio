"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, ShieldX, CheckCircle, HardDrive, PlusCircle, Loader2 } from 'lucide-react';
import { devices as mockDevices } from '@/lib/data';
import type { Device, WipePolicy } from '@/lib/types';
import AiPolicyDialog from './_components/ai-policy-dialog';
import WipeDialog from './_components/wipe-dialog';
import { useToast } from '@/hooks/use-toast';
import RegisterDeviceDialog from './_components/register-device-dialog';
import { RoleGuard } from '@/components/RoleGuard';
import { useFirestore, useUser } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [isAiPolicyDialogOpen, setAiPolicyDialogOpen] = useState(false);
  const [isWipeDialogOpen, setWipeDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setRegisterDialogOpen] = useState(false);
  const [isCreatingJobs, setIsCreatingJobs] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleSuggestPolicy = (device: Device) => {
    setSelectedDevices([device]);
    setAiPolicyDialogOpen(true);
  };

  const handleWipe = () => {
    if (selectedDevices.length === 0) {
        toast({
            title: "No Devices Selected",
            description: "Please select at least one device to wipe.",
            variant: "destructive"
        })
        return;
    };
    setWipeDialogOpen(true);
  };
  
  const handleConfirmWipe = async (policy: WipePolicy) => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to create wipe jobs." });
        return;
    }
    setIsCreatingJobs(true);
    setWipeDialogOpen(false);
    
    const jobsCollection = collection(firestore, 'wipeJobs');
    
    const jobPromises = selectedDevices.map((device, index) => {
      const jobId = `WJ-${Date.now()}-${index}`;
      const newJob = {
        jobId: jobId,
        createdByUid: user.uid,
        createdByEmail: user.email || 'N/A',
        status: 'Queued',
        deviceId: device.id,
        devicePath: device.path,
        deviceModel: device.model,
        deviceSerial: device.serial,
        deviceSize: device.size,
        policy: { name: policy.name, passes: policy.passes },
        progress: 0,
        logs: [`[${new Date().toISOString()}] Job created for device ${device.path}`],
        createdAt: serverTimestamp(),
      };

      return addDoc(jobsCollection, newJob).catch(error => {
        const contextualError = new FirestorePermissionError({
            path: `wipeJobs/${jobId}`,
            operation: 'create',
            requestResourceData: newJob,
        });
        errorEmitter.emit('permission-error', contextualError);
        throw contextualError; // re-throw to be caught by Promise.all
      });
    });

    try {
      await Promise.all(jobPromises);
      toast({
          title: "Wipe Jobs Created",
          description: `${selectedDevices.length} jobs have been added to the queue.`,
      });
      setSelectedDevices([]);
      router.push('/jobs');
    } catch(e: any) {
        console.error("Failed to create wipe jobs:", e);
        toast({
            variant: "destructive",
            title: "Failed to Create Jobs",
            description: e.message || "Could not create one or more wipe jobs. Please check permissions and try again.",
        });
    } finally {
        setIsCreatingJobs(false);
    }
  };

  const handleRegisterDevice = (newDevice: Omit<Device, 'id' | 'status'>) => {
    const newDeviceWithId: Device = {
      ...newDevice,
      id: (devices.length + 1).toString(),
      status: 'Unmounted',
    };
    setDevices(prev => [newDeviceWithId, ...prev]);
    setRegisterDialogOpen(false);
    toast({
      title: "Device Registered",
      description: `${newDevice.model} has been added to the list.`,
    })
  };

  const toggleSelectDevice = (device: Device) => {
    setSelectedDevices(prev => 
        prev.some(d => d.id === device.id) 
        ? prev.filter(d => d.id !== device.id)
        : [...prev, device]
    )
  }

  const toggleSelectAll = () => {
    if (selectedDevices.length === devices.filter(d => d.status !== 'Protected').length) {
        setSelectedDevices([]);
    } else {
        setSelectedDevices(devices.filter(d => d.status !== 'Protected'));
    }
  }

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

  const isAllSelected = useMemo(() => {
    const unProtectedDevices = devices.filter(d => d.status !== 'Protected');
    return unProtectedDevices.length > 0 && selectedDevices.length === unProtectedDevices.length;
  }, [selectedDevices, devices]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>
                Select devices to wipe. System disks are protected.
                </CardDescription>
            </div>
              <div className="flex gap-2">
                <RoleGuard allowed={['admin', 'operator']}
                    fallback={
                        <Button variant="destructive" disabled>
                            Wipe Selected (0)
                        </Button>
                    }
                >
                    <Button onClick={handleWipe} variant="destructive" disabled={selectedDevices.length === 0 || isCreatingJobs}>
                        {isCreatingJobs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Wipe Selected ({selectedDevices.length})
                    </Button>
                </RoleGuard>
                  <RoleGuard allowed={['admin', 'operator']}>
                    <Button onClick={() => setRegisterDialogOpen(true)} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Register
                    </Button>
                  </RoleGuard>
              </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox">
                   <RoleGuard allowed={['admin', 'operator']}>
                      <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                      />
                    </RoleGuard>
                </TableHead>
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
                <TableRow 
                    key={device.id} 
                    data-state={selectedDevices.some(d => d.id === device.id) && "selected"}
                >
                    <TableCell padding="checkbox">
                      <RoleGuard allowed={['admin', 'operator']}>
                        <Checkbox
                            checked={selectedDevices.some(d => d.id === device.id)}
                            onCheckedChange={() => toggleSelectDevice(device)}
                            aria-label="Select row"
                            disabled={device.status === 'Protected'}
                        />
                      </RoleGuard>
                    </TableCell>
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
                    <RoleGuard allowed={['admin', 'operator']}>
                      <Button variant="outline" size="sm" onClick={() => handleSuggestPolicy(device)}>
                          <Bot className="mr-2 h-4 w-4" /> AI Policy
                      </Button>
                    </RoleGuard>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RegisterDeviceDialog 
        open={isRegisterDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onRegister={handleRegisterDevice}
      />
      
      {selectedDevices.length > 0 && (
          <>
            <AiPolicyDialog
                open={isAiPolicyDialogOpen}
                onOpenChange={setAiPolicyDialogOpen}
                device={selectedDevices[0]}
            />
            <WipeDialog
                open={isWipeDialogOpen}
                onOpenChange={setWipeDialogOpen}
                devices={selectedDevices}
                onConfirmWipe={handleConfirmWipe}
            />
          </>
      )}

    </>
  );
}
