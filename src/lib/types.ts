export type Device = {
  id: string;
  path: string;
  type: 'HDD' | 'SATA SSD' | 'NVMe SSD' | 'USB';
  model: string;
  serial: string;
  size: string;
  status: 'Mounted' | 'Unmounted' | 'Protected';
};

export type JobStatus = 'Pending' | 'Wiping' | 'Verifying' | 'Completed' | 'Failed';

export type WipePolicy = 'Quick Wipe (1-pass)' | 'Standard (3-pass)' | 'DoD 5220.22-M (7-pass)' | 'Secure Erase' | 'Sanitize';

export type Job = {
  id: string;
  deviceId: string;
  deviceSerial: string;
  status: JobStatus;
  progress: number;
  wipeMethod: string;
  passes?: number;
  startedAt: string;
  completedAt?: string;
  log: string[];
};

export type Certificate = {
  id: string;
  jobId: string;
  deviceModel: string;
  deviceSerial: string;
  deviceSize: string;
  deviceType: Device['type'];
  wipeMethod: string;
  wipePasses?: number;
  verificationResult: 'PASS' | 'FAIL';
  wipeStartedAt: string;
  wipeCompletedAt: string;
  logHash: string;
  issuedAt: string;
};
