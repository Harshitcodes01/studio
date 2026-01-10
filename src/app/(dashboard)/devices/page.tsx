"use client";

import React, { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, ShieldX, CheckCircle, HardDrive, PlusCircle } from 'lucide-react';
import { devices as mockDevices } from '@/lib/data';
import type { Device, WipePolicy } from '@/lib/types';
import AiPolicyDialog from './_components/ai-policy-dialog';
import WipeDialog from './_components/wipe-dialog';
import { useToast } from '@/hooks/use-toast';
import RegisterDeviceDialog from './_components/register-device-dialog';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [isAiPolicyDialogOpen, setAiPolicyDialogOpen] = useState(false);
  const [isWipeDialogOpen, setWipeDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setRegisterDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
  
  const handleConfirmWipe = (policy: WipePolicy) => {
    console.log(`Wiping ${selectedDevices.length} devices with policy: ${policy}`);
    setWipeDialogOpen(false);
    
    toast({
        title: "Wipe Job(s) Started",
        description: `Wiping process for ${selectedDevices.length} devices has been initiated with ${policy}.`,
        variant: "default"
    })
    
    setSelectedDevices([]);
    router.push('/jobs');
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
                <Button onClick={handleWipe} variant="destructive" disabled={selectedDevices.length === 0}>
                    Wipe Selected ({selectedDevices.length})
                </Button>
                <Button onClick={() => setRegisterDialogOpen(true)} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Register
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                    />
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
                        <Checkbox
                            checked={selectedDevices.some(d => d.id === device.id)}
                            onCheckedChange={() => toggleSelectDevice(device)}
                            aria-label="Select row"
                            disabled={device.status === 'Protected'}
                        />
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
                    <Button variant="outline" size="sm" onClick={() => handleSuggestPolicy(device)}>
                        <Bot className="mr-2 h-4 w-4" /> AI Policy
                    </Button>
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
