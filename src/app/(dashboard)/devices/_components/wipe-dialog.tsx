"use client";

import React, { useState, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { Device } from '@/lib/types';

type WipeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
  onConfirmWipe: (device: Device) => void;
};

export default function WipeDialog({ open, onOpenChange, device, onConfirmWipe }: WipeDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const confirmationText = `WIPE ${device.path}`;
  
  useEffect(() => {
    if (open) {
      setInputValue('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Data Wipe</DialogTitle>
          <DialogDescription>
            This action is irreversible and will permanently erase all data on the device.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You are about to wipe <strong className="font-code">{device.path}</strong> ({device.model}). Please be absolutely sure before proceeding.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="confirmation">To confirm, type "<span className="font-semibold font-code text-destructive">{confirmationText}</span>" below:</Label>
            <Input 
                id="confirmation"
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmationText}
                className="font-code"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => onConfirmWipe(device)}
            disabled={inputValue !== confirmationText}
          >
            Confirm Wipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
