'use client';

import { Card, CardContent } from '@/components/ui/card';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface StatCardProps {
  readonly number: string;
  readonly label: string;
}

export default function StatCard({ number, label }: StatCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const parsed = parseInt(number.replace(/[^\d]/g, ''));

  const suffix = number.includes('M')
    ? 'M+'
    : number.includes('K')
      ? 'K+'
      : number.includes('+')
        ? '+'
        : '';

  return (
    <Card ref={ref} className="border-none text-center shadow-md">
      <CardContent className="p-6">
        <p className="mb-2 text-4xl font-bold text-indigo-500">
          {inView ? <CountUp end={parsed} duration={2} /> : '0'}
          {suffix}
        </p>
        <p className="text-muted-foreground text-lg">{label}</p>
      </CardContent>
    </Card>
  );
}
