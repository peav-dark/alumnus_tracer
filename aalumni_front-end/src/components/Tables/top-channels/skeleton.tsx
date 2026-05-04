import { Skeleton } from "@/components/ui/skeleton";

export function TopChannelsSkeleton() {
  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      <div className="mt-6 grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
