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
import { AlertTriangle, Mail } from 'lucide-react';
import type { Device, WipePolicy } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

type WipeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: Device[];
  onConfirmWipe: (policy: WipePolicy, notificationEmails: string[]) => void;
};

const wipePolicies: WipePolicy[] = [
    { name: 'Quick Wipe (1-pass)', passes: 1, description: 'Fastest option. Overwrites data with zeros once.' },
    { name: 'Standard (3-pass)', passes: 3, description: 'A good balance of security and speed (DoD 5220.22-M ECE).' },
    { name: 'DoD 5220.22-M (7-pass)', passes: 7, description: 'Highly secure 7-pass overwrite. Slower.' },
    { name: 'Secure Erase', passes: 1, description: 'Uses the drive\'s built-in, fast, and secure erase command (for SSDs).' },
];

export default function WipeDialog({ open, onOpenChange, devices, onConfirmWipe }: WipeDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedPolicyName, setSelectedPolicyName] = useState<WipePolicy['name']>('Standard (3-pass)');
  const [notificationEmails, setNotificationEmails] = useState('');

  const confirmationText = `WIPE ${devices.length} DEVICES`;
  
  useEffect(() => {
    if (open) {
      setInputValue('');
      setNotificationEmails('');
    }
  }, [open]);

  const handleConfirm = () => {
    const policy = wipePolicies.find(p => p.name === selectedPolicyName);
    if (policy) {
        const emails = notificationEmails.split(',').map(e => e.trim()).filter(e => e);
        onConfirmWipe(policy, emails);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Data Wipe</DialogTitle>
          <DialogDescription>
            You are about to permanently erase all data on {devices.length} selected device(s). This action is irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label>Wipe Policy</Label>
                <RadioGroup value={selectedPolicyName} onValueChange={(value: any) => setSelectedPolicyName(value)}>
                    {wipePolicies.map((policy) => (
                         <Label key={policy.name} className="flex items-start gap-3 rounded-md border p-3 hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
                            <RadioGroupItem value={policy.name} id={policy.name} className="mt-0.5" />
                            <div>
                                <span className="font-semibold">{policy.name}</span>
                                <p className="text-xs text-muted-foreground">{policy.description}</p>
                            </div>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="notify-emails" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Additional Notification Emails
                </Label>
                <Input 
                    id="notify-emails"
                    type="text" 
                    value={notificationEmails}
                    onChange={(e) => setNotificationEmails(e.target.value)}
                    placeholder="e.g. manager@example.com (comma-separated)"
                />
                <p className="text-xs text-muted-foreground">The user who creates the job is always notified.</p>
            </div>
             <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                The following devices will be wiped:
                <ScrollArea className="h-24 mt-2">
                    <ul className="list-disc pl-5 font-code text-xs">
                        {devices.map(d => <li key={d.id}>{d.path} ({d.model})</li>)}
                    </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
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
            onClick={handleConfirm}
            disabled={inputValue !== confirmationText}
          >
            Confirm Wipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
