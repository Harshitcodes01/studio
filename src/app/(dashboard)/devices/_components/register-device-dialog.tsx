"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import type { Device } from '@/lib/types';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RegisterDeviceForm = Omit<Device, 'id' | 'status'>;

type RegisterDeviceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (device: RegisterDeviceForm) => void;
};

export default function RegisterDeviceDialog({ open, onOpenChange, onRegister }: RegisterDeviceDialogProps) {
  const { register, handleSubmit, control, reset, setValue } = useForm<RegisterDeviceForm>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<RegisterDeviceForm> = (data) => {
    onRegister(data);
    reset();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const data = JSON.parse(content);
            // very basic validation
            if (data.path && data.type && data.model && data.serial && data.size) {
              setValue('path', data.path);
              setValue('type', data.type);
              setValue('model', data.model);
              setValue('serial', data.serial);
              setValue('size', data.size);
              toast({ title: "Success", description: "Device data loaded from file." });
            } else {
              throw new Error("Invalid file format");
            }
          }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not parse the device file. Please check the format." });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        reset();
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Manually add a device for wiping. You can also upload a JSON file.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right col-span-4">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                           <Upload className="mr-2 h-4 w-4" />
                           Load from File
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    </Label>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="path" className="text-right">Path</Label>
                    <Input id="path" {...register('path', { required: true })} className="col-span-3 font-code" placeholder="/dev/sde"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                     <Controller
                        name="type"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HDD">HDD</SelectItem>
                                    <SelectItem value="SATA SSD">SATA SSD</SelectItem>
                                    <SelectItem value="NVMe SSD">NVMe SSD</SelectItem>
                                    <SelectItem value="USB">USB</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="model" className="text-right">Model</Label>
                    <Input id="model" {...register('model', { required: true })} className="col-span-3" placeholder="e.g. SanDisk Extreme"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="serial" className="text-right">Serial</Label>
                    <Input id="serial" {...register('serial', { required: true })} className="col-span-3 font-code" placeholder="Device serial number"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">Size</Label>
                    <Input id="size" {...register('size', { required: true })} className="col-span-3" placeholder="e.g. 256GB"/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Register Device</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}