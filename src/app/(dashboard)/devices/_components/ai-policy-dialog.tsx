"use client";

import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { suggestWipePolicy, SuggestWipePolicyOutput } from '@/ai/flows/suggest-wipe-policy';
import type { Device } from '@/lib/types';
import { Bot, Cpu, FileCheck, Loader2, ServerCrash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AiPolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
};

export default function AiPolicyDialog({ open, onOpenChange, device }: AiPolicyDialogProps) {
  const [securityReq, setSecurityReq] = useState('Standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestWipePolicyOutput | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const suggestion = await suggestWipePolicy({
        deviceType: device.type,
        securityRequirements: securityReq,
      });
      setResult(suggestion);
    } catch (e) {
      console.error(e);
      setError('Failed to get suggestion from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
        // Reset state on close
        setTimeout(() => {
            setIsLoading(false);
            setError(null);
            setResult(null);
        }, 300);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Wipe Policy Suggestion</DialogTitle>
          <DialogDescription>
            Get an AI-powered recommendation for the best wipe method for{' '}
            <span className="font-semibold font-code">{device.path}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="device-type" className="text-right">
              Device Type
            </Label>
            <Input id="device-type" value={device.type} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="security-req" className="text-right">
              Security
            </Label>
            <Select value={securityReq} onValueChange={setSecurityReq}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select security level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="High-Security">High-Security (e.g., GDPR)</SelectItem>
                <SelectItem value="DoD 5220.22-M">DoD 5220.22-M</SelectItem>
                <SelectItem value="NIST 800-88">NIST 800-88 Clear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {result && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Suggestion</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{result.wipeMethod}</p>
                    {result.passes && <p className="text-xs text-muted-foreground">{result.passes} passes</p>}
                    <p className="text-sm text-muted-foreground mt-2">{result.notes}</p>
                </CardContent>
            </Card>
        )}

        {error && (
            <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting suggestion...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Suggest
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dummy Input component since it's used here but not imported from ui
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
);
