import { certificates } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Logo } from "@/components/icons";

export default function VerificationPage({ params }: { params: { id: string } }) {
    const certificate = certificates.find(c => c.id === params.id);
    const isValid = !!certificate;

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Logo className="w-8 h-8 text-primary" />
                        <CardTitle className="text-3xl">Wipe Verify</CardTitle>
                    </div>
                    <CardDescription>Certificate of Data Erasure Verification</CardDescription>
                </CardHeader>
                <CardContent>
                    {isValid && certificate ? (
                        <>
                            <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-dashed border-green-500">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Verified</h2>
                                <p className="text-muted-foreground">This certificate is valid and authentic.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6 text-sm">
                                <InfoItem label="Certificate ID" value={certificate.id} isCode />
                                <InfoItem label="Device Serial" value={certificate.deviceSerial} isCode />
                                <InfoItem label="Device Model" value={certificate.deviceModel} />
                                <InfoItem label="Device Type" value={certificate.deviceType} />
                                <InfoItem label="Device Size" value={certificate.deviceSize} />
                                <InfoItem label="Wipe Method" value={`${certificate.wipeMethod} ${certificate.wipePasses ? `(${certificate.wipePasses} passes)` : ''}`} />
                                <InfoItem label="Verification Result">
                                    <Badge className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />{certificate.verificationResult}</Badge>
                                </InfoItem>
                                <InfoItem label="Issued At" value={format(new Date(certificate.issuedAt), 'PPpp')} />
                                <InfoItem label="Wipe Started" value={format(new Date(certificate.wipeStartedAt), 'PPpp')} />
                                <InfoItem label="Wipe Completed" value={format(new Date(certificate.wipeCompletedAt), 'PPpp')} />
                                <InfoItem label="Log Hash" value={certificate.logHash} isCode fullWidth />
                            </div>
                        </>

                    ) : (
                         <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-dashed border-red-500">
                            <XCircle className="w-16 h-16 text-red-500 mb-2" />
                            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">Invalid Certificate</h2>
                            <p className="text-muted-foreground">Certificate ID <span className="font-code">{params.id}</span> not found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function InfoItem({ label, value, children, isCode = false, fullWidth = false }: { label: string, value?: string, children?: React.ReactNode, isCode?: boolean, fullWidth?: boolean }) {
    return (
        <div className={fullWidth ? "md:col-span-2" : ""}>
            <p className="text-muted-foreground font-medium">{label}</p>
            {value && <p className={isCode ? 'font-code' : 'font-semibold'}>{value}</p>}
            {children}
        </div>
    )
}
