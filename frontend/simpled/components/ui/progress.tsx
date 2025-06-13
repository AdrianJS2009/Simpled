'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, getValueLabel, ...props }, ref) => {
    const percentage = value && max ? (value / max) * 100 : 0;

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <progress
          value={value}
          max={max}
          className="sr-only"
          aria-label={getValueLabel ? getValueLabel(value, max) : `Progreso: ${percentage}%`}
        />
        <div className="bg-primary/10 relative h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all"
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = 'Progress';

export { Progress };
