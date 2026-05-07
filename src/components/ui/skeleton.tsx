import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

function Skeleton({ className, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton",
        rounded ? "rounded-full" : "rounded-[10px]",
        className
      )}
    />
  );
}

function PostSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[16px] border border-[var(--color-border)] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

function RouteCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[16px] border border-[var(--color-border)] overflow-hidden">
      <Skeleton className="h-40 w-full rounded-b-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" rounded />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-[16px]" />
      <div className="px-5 -mt-8 space-y-3">
        <Skeleton className="h-16 w-16" rounded />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, PostSkeleton, RouteCardSkeleton, ProfileSkeleton };
