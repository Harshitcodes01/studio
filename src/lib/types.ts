import { Timestamp } from 'firebase/firestore';

export type Device = {
  id: string;
  path: string;
  type: 'HDD' | 'SATA SSD' | 'NVMe SSD' | 'USB';
  model: string;
  serial: string;
  size: string;
  status: 'Mounted' | 'Unmounted' | 'Protected';
};

export type JobStatus = 'Queued' | 'Running' | 'Verifying' | 'Completed' | 'Failed' | 'Cancelled';

export type WipePolicy = {
  name: 'Quick Wipe (1-pass)' | 'Standard (3-pass)' | 'DoD 5220.22-M (7-pass)' | 'Secure Erase';
  passes: number;
  description: string;
}

export type WipeJob = {
  id: string; // Document ID
  jobId: string; // Human-readable ID
  createdByUid: string;
  createdByEmail: string;
  status: JobStatus;
  
  deviceId: string;
  devicePath: string;
  deviceModel: string;
  deviceSerial: string;
  deviceSize: string;
  deviceType: Device['type'];

  policy: {
    name: string;
    passes?: number;
  };
  
  progress: number;
  speedMBps?: number;
  etaSeconds?: number;
  
  logs: string[];
  notificationEmails: string[];

  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;

  errorMessage?: string;
};


export type Certificate = {
  id: string; // Document ID
  certificateId: string; // Human-readable ID
  jobId: string;
  deviceModel: string;
  deviceSerial: string;
  deviceSize: string;
  deviceType: Device['type'];
  wipeMethod: string;
  wipePasses?: number;
  verificationResult: 'PASS' | 'FAIL';
  startedAt: Timestamp;
  endedAt: Timestamp;
  logHash: string;
  createdAt: Timestamp;
  createdByEmail: string;
  createdByUid: string;
};

export type UserRole = 'admin' | 'operator' | 'auditor';

export type UserProfile = {
  email: string;
  role: UserRole;
  createdAt: any; // Firestore ServerTimestamp
};
