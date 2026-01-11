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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { WipePolicy } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type FileWipeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmWipe: (files: File[], policy: WipePolicy, notificationEmails: string[]) => void;
  isLoading?: boolean;
};

const wipePolicies: WipePolicy[] = [
    { name: 'Quick Wipe (1-pass)', passes: 1, description: 'Fastest option. Overwrites data with zeros once.' },
    { name: 'Standard (3-pass)', passes: 3, description: 'A good balance of security and speed (DoD 5220.22-M ECE).' },
    { name: 'DoD 5220.22-M (7-pass)', passes: 7, description: 'Highly secure 7-pass overwrite. Slower.' },
    { name: 'Secure Erase', passes: 1, description: 'Uses the drive\'s built-in, fast, and secure erase command.' },
];

export default function FileWipeDialog({ open, onOpenChange, onConfirmWipe, isLoading }: FileWipeDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPolicyName, setSelectedPolicyName] = useState<WipePolicy['name']>('Standard (3-pass)');
  const [notificationEmails, setNotificationEmails] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles as any).filter((file: File) => 
        !files.some((f: File) => f.name === file.name && f.size === file.size)
      );
      
      if (newFiles.length > 0) {
        setFiles([...files, ...newFiles]);
        toast({
          title: "Files Added",
          description: `${newFiles.length} file(s) added for wiping.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Duplicate Files",
          description: "Some files were already added."
        });
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_: File, i: number) => i !== index));
  };

  const handleConfirm = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please select at least one file to wipe."
      });
      return;
    }

    const policy = wipePolicies.find(p => p.name === selectedPolicyName);
    if (policy) {
      const emails = notificationEmails.split(',').map((e: string) => e.trim()).filter((e: string) => e);
      onConfirmWipe(files, policy, emails);
      
      // Reset state
      setFiles([]);
      setNotificationEmails('');
      setSelectedPolicyName('Standard (3-pass)');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFiles([]);
      setNotificationEmails('');
      setSelectedPolicyName('Standard (3-pass)');
    }
    onOpenChange(isOpen);
  };

  const totalSize = files.reduce((sum: number, file: File) => sum + file.size, 0);
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wipe Files Securely</DialogTitle>
          <DialogDescription>
            Upload files to be securely wiped. Selected files will be permanently erased using your chosen wipe policy.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* File Upload Section */}
          <div className="grid gap-2">
            <Label>Files to Wipe</Label>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              multiple
              accept="*"
            />
            <p className="text-xs text-muted-foreground">
              Supports all file types: PDF, DOC, PNG, Images, Videos, Archives, etc.
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="grid gap-2 border rounded-lg p-3 bg-accent/5">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">Selected Files ({files.length})</p>
                <p className="text-xs text-muted-foreground">Total: {formatFileSize(totalSize)}</p>
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {files.map((file: File, index: number) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center text-xs bg-background rounded p-2 border border-border/30"
                  >
                    <span className="truncate flex-1">
                      {file.name} <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isLoading}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wipe Policy Selection */}
          <div className="grid gap-2">
            <Label>Wipe Policy</Label>
            <RadioGroup 
              value={selectedPolicyName} 
              onValueChange={(value: any) => setSelectedPolicyName(value)}
              disabled={isLoading}
            >
              {wipePolicies.map((policy) => (
                <Label 
                  key={policy.name} 
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-accent has-[:checked]:text-accent-foreground cursor-pointer"
                >
                  <RadioGroupItem value={policy.name} id={`file-${policy.name}`} className="mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold">{policy.name}</span>
                    <p className="text-xs text-muted-foreground">{policy.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Notification Emails */}
          <div className="grid gap-2">
            <Label htmlFor="file-notify-emails">Notification Emails (Optional)</Label>
            <Input 
              id="file-notify-emails"
              type="text" 
              value={notificationEmails}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationEmails(e.target.value)}
              placeholder="e.g. admin@example.com (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">You will always be notified when the wipe completes.</p>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permanent Deletion</AlertTitle>
            <AlertDescription>
              {files.length > 0 
                ? `The selected ${files.length} file(s) will be permanently and securely erased. This action cannot be undone.`
                : 'Selected files will be permanently and securely erased. This action cannot be undone.'}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleConfirm}
            disabled={files.length === 0 || isLoading}
          >
            {isLoading ? 'Creating Wipe Jobs...' : 'Confirm Wipe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
