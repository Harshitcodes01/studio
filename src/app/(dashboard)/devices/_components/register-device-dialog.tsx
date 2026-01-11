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
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            let data: any;
            
            // Parse based on file type
            if (fileExtension === 'json') {
              data = JSON.parse(content);
            } else if (['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(fileExtension || '')) {
              // For non-JSON files, extract metadata if available or prompt user
              // For now, extract from filename
              const filename = file.name.replace(/\.[^/.]+$/, "");
              
              // Try to parse if it looks like JSON (for PDFs with embedded JSON, etc.)
              try {
                data = JSON.parse(content);
              } catch {
                // If not JSON, create data structure from file metadata
                toast({ 
                  variant: "default", 
                  title: "File Uploaded", 
                  description: `${file.name} (${(file.size / 1024).toFixed(2)} KB) - Please fill in device details manually.` 
                });
                return;
              }
            } else {
              throw new Error(`Unsupported file format: ${fileExtension}`);
            }
            
            // Validate extracted data
            if (data.path && data.type && data.model && data.serial && data.size) {
              setValue('path', data.path);
              setValue('type', data.type);
              setValue('model', data.model);
              setValue('serial', data.serial);
              setValue('size', data.size);
              toast({ title: "Success", description: "Device data loaded from file." });
            } else {
              throw new Error("Invalid file format - missing required fields (path, type, model, serial, size)");
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Could not parse the file";
          toast({ variant: "destructive", title: "Error", description: errorMessage });
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
            Manually add a device for wiping. You can also upload a file (JSON, PDF, Docs, PNG, etc.).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right col-span-4">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                           <Upload className="mr-2 h-4 w-4" />
                           Upload File
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp" />
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