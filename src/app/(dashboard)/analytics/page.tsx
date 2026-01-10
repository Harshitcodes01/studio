'use client';

import React, { useState, useMemo } from 'react';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WipeJob, Certificate } from '@/lib/types';
import { subDays, format, differenceInMinutes } from 'date-fns';
import { LineChart, HardDrive, Percent, BadgeCheck, Clock, FilePieChart, GanttChartSquare, Loader2 } from 'lucide-react';
import { withRole } from '@/hoc/withRole';

type TimeRange = '7d' | '30d' | '90d';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const firestore = useFirestore();

  const days = useMemo(() => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
    }
  }, [timeRange]);

  const startDate = useMemo(() => subDays(new Date(), days), [days]);
  const startTimestamp = useMemo(() => Timestamp.fromDate(startDate), [startDate]);

  const jobsQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, 'wipeJobs'),
      where('createdAt', '>=', startTimestamp)
    );
  }, [firestore, startTimestamp]);

  const certsQuery = useMemoFirebase(() => {
    return query(
        collection(firestore, 'certificates'),
        where('createdAt', '>=', startTimestamp)
    )
  }, [firestore, startTimestamp]);

  const { data: jobs, isLoading: isLoadingJobs } = useCollection<WipeJob>(jobsQuery);
  const { data: certificates, isLoading: isLoadingCerts } = useCollection<Certificate>(certsQuery);

  const stats = useMemo(() => {
    if (!jobs || !certificates) return null;

    const completedJobs = jobs.filter(j => j.status === 'Completed');
    const totalWipes = completedJobs.length;
    const totalFailed = jobs.filter(j => j.status === 'Failed').length;
    const successRate = totalWipes + totalFailed > 0 ? (totalWipes / (totalWipes + totalFailed)) * 100 : 100;
    
    const totalDataWipedGB = completedJobs.reduce((acc, job) => {
        const size = parseFloat(job.deviceSize);
        if (isNaN(size)) return acc;
        if (job.deviceSize.toLowerCase().includes('tb')) return acc + (size * 1000);
        if (job.deviceSize.toLowerCase().includes('mb')) return acc + (size / 1000);
        return acc + size;
    }, 0);

    const avgWipeTime = totalWipes > 0 ? completedJobs.reduce((acc, job) => {
        if (!job.startedAt || !job.endedAt) return acc;
        return acc + differenceInMinutes(job.endedAt.toDate(), job.startedAt.toDate());
    }, 0) / totalWipes : 0;

    return {
        totalWipes,
        totalDataWiped: totalDataWipedGB < 1000 ? `${totalDataWipedGB.toFixed(1)} GB` : `${(totalDataWipedGB/1000).toFixed(2)} TB`,
        successRate: `${successRate.toFixed(1)}%`,
        avgWipeTime: `${avgWipeTime.toFixed(1)} min`,
        certsGenerated: certificates.length,
    }
  }, [jobs, certificates]);

  const chartsData = useMemo(() => {
    if (!jobs) return null;

    const wipesByDay = Array.from({length: days}, (_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), 'MMM d'),
        count: 0
    }));

    jobs.filter(j => j.status === 'Completed' && j.endedAt).forEach(job => {
        const dateStr = format(job.endedAt!.toDate(), 'MMM d');
        const day = wipesByDay.find(d => d.date === dateStr);
        if (day) day.count++;
    });

    const methodDistribution = jobs.reduce((acc, job) => {
        const name = job.policy.name;
        const existing = acc.find(item => item.name === name);
        if (existing) existing.value++;
        else acc.push({ name, value: 1 });
        return acc;
    }, [] as {name: string, value: number}[]);

    const statusDistribution = jobs.reduce((acc, job) => {
        const name = job.status;
        const existing = acc.find(item => item.name === name);
        if (existing) existing.value++;
        else acc.push({ name, value: 1 });
        return acc;
    }, [] as {name: string, value: number}[]);


    return { wipesByDay, methodDistribution, statusDistribution };
  }, [jobs, days]);

  const isLoading = isLoadingJobs || isLoadingCerts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-auto">
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
      </div>

       {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-16 h-16 text-muted-foreground animate-spin" />
        </div>
      )}

      {!isLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard icon={HardDrive} title="Total Wipes" value={stats?.totalWipes}/>
                <StatCard icon={FilePieChart} title="Data Wiped" value={stats?.totalDataWiped}/>
                <StatCard icon={Percent} title="Success Rate" value={stats?.successRate}/>
                <StatCard icon={Clock} title="Avg. Wipe Time" value={stats?.avgWipeTime}/>
                <StatCard icon={BadgeCheck} title="Certificates Issued" value={stats?.certsGenerated}/>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <ChartCard title="Wipes per Day" className="lg:col-span-4" icon={LineChart}>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartsData?.wipesByDay}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <ChartCard title="Wipe Methods" className="lg:col-span-3" icon={FilePieChart}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={chartsData?.methodDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                {chartsData?.methodDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <ChartCard title="Job Status" className="lg:col-span-7" icon={GanttChartSquare}>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartsData?.statusDistribution} layout="vertical">
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
          </>
      )}
    </div>
  );
};

export default withRole(AnalyticsPage, ['admin', 'auditor']);


const StatCard = ({ icon: Icon, title, value }: {icon: React.ElementType, title: string, value: string | number | undefined }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? <Loader2 className="h-6 w-6 animate-spin"/>}</div>
      </CardContent>
    </Card>
);

const ChartCard = ({ title, icon: Icon, children, className }: { title: string, icon: React.ElementType, children: React.ReactNode, className?: string }) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
)
