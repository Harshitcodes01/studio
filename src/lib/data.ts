import type { Device, Job, Certificate } from './types';

export const devices: Device[] = [
  {
    id: '1',
    path: '/dev/sda',
    type: 'NVMe SSD',
    model: 'Samsung 970 EVO Plus',
    serial: 'S4PNNF0M500001',
    size: '1TB',
    status: 'Protected',
  },
  {
    id: '2',
    path: '/dev/sdb',
    type: 'SATA SSD',
    model: 'Crucial MX500',
    serial: '2039E2C8A002',
    size: '500GB',
    status: 'Unmounted',
  },
  {
    id: '3',
    path: '/dev/sdc',
    type: 'HDD',
    model: 'Seagate Barracuda',
    serial: 'WDE123456789',
    size: '2TB',
    status: 'Unmounted',
  },
  {
    id: '4',
    path: '/dev/sdd',
    type: 'USB',
    model: 'SanDisk Ultra',
    serial: '4C53000123456789',
    size: '64GB',
    status: 'Mounted',
  },
];

export const jobs: Job[] = [
  {
    id: 'JOB-001',
    deviceId: '3',
    deviceSerial: 'WDE123456789',
    status: 'Completed',
    progress: 100,
    wipeMethod: 'Overwrite',
    passes: 3,
    startedAt: '2023-10-26T10:00:00Z',
    completedAt: '2023-10-26T11:30:00Z',
    log: [
      '[10:00:00] Job started.',
      '[10:00:01] Wiping /dev/sdc with Overwrite (3 passes).',
      '[10:45:00] Pass 1/3 complete.',
      '[11:15:00] Pass 2/3 complete.',
      '[11:25:00] Pass 3/3 complete.',
      '[11:25:05] Starting verification.',
      '[11:29:55] Verification successful.',
      '[11:30:00] Job completed.',
    ],
  },
   {
    id: 'JOB-002',
    deviceId: '4',
    deviceSerial: '4C53000123456789',
    status: 'Failed',
    progress: 45,
    wipeMethod: 'Overwrite',
    passes: 1,
    startedAt: '2023-10-26T12:00:00Z',
    completedAt: '2023-10-26T12:15:00Z',
    log: [
        '[12:00:00] Job started.',
        '[12:00:01] Wiping /dev/sdd with Overwrite (1 pass).',
        '[12:15:00] Error: Device disconnected during wipe.',
        '[12:15:01] Job failed.',
    ]
   }
];

export const certificates: Certificate[] = [
  {
    id: 'CERT-20231026-001',
    jobId: 'JOB-001',
    deviceModel: 'Seagate Barracuda',
    deviceSerial: 'WDE123456789',
    deviceSize: '2TB',
    deviceType: 'HDD',
    wipeMethod: 'Overwrite',
    wipePasses: 3,
    verificationResult: 'PASS',
    wipeStartedAt: '2023-10-26T10:00:00Z',
    wipeCompletedAt: '2023-10-26T11:30:00Z',
    logHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    issuedAt: '2023-10-26T11:30:05Z',
  },
];
