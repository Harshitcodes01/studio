# **App Name**: Wipe Verify

## Core Features:

- Automatic Device Detection: Automatically detects connected storage devices (HDD, SSD, NVMe, USB) and retrieves their metadata like device path, type, model, serial number, size, and mount status.
- Intelligent Wipe Policy Selection: An AI-powered tool to automatically chooses the appropriate data wiping method based on device type and predefined security policies.
- Secure Data Wiping: Executes the selected wipe method (Overwrite, Secure Erase, Sanitize) with root permissions, ensuring secure data removal from the storage device. Wipe supports configurable passes for overwriting.
- Verification Module: Performs post-wipe verification to ensure successful data erasure using methods like random sector read tests and checks for previous file markers.
- Logs & Audit Trail: Stores comprehensive wipe logs and job history, including timestamps, job IDs, actions, status updates, and error messages, in a downloadable format.
- Certificate Generation: Generates tamper-proof PDF certificates upon successful wipe, including device details, wipe method, verification result, timestamps, and a QR code for online verification.
- Certificate Verification Page: Provides a public verification page to validate certificate authenticity using the Certificate ID and hash validation against the stored database hash.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey security and trust.
- Background color: Light blue (#E3F2FD), a very desaturated version of the primary hue.
- Accent color: Violet (#9575CD) for a subtle yet contrasting highlight.
- Body and headline font: 'Inter' sans-serif font for a modern, machined look.
- Code font: 'Source Code Pro' for displaying command-line operations and code snippets.
- Use clear and concise icons to represent devices, processes, and status indicators.
- Dashboard-style layout for monitoring jobs, devices, and certificates, ensuring usability for non-technical staff.