import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export function PropertySkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full" />

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Zone/Location */}
          <Skeleton className="h-4 w-1/3 mb-4" />

          {/* Title */}
          <Skeleton className="h-6 w-3/4 mb-3" />

          {/* Short description lines */}
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-5/6 mb-5" />
        </div>

        <div>
          {/* Features Row */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)] mb-4">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>

          {/* Price & Details link */}
          <div className="flex items-center justify-between mt-2 pt-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <PropertySkeleton key={i} />
      ))}
    </div>
  );
}
