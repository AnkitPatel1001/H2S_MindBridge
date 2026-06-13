import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  'aria-label'?: string;
}

export function Skeleton({ className, 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel ?? 'Loading…'}
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 motion-reduce:animate-none',
        className,
      )}
    />
  );
}

export function ReflectionSkeleton() {
  return (
    <div role="status" aria-label="Loading your reflection…" className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div role="status" aria-label="Loading chart…" className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}
