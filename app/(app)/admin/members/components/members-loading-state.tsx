import { Skeleton } from "@/components/ui/skeleton";

export function MembersLoadingState() {
  return (
    <>
      <div className="space-y-3 md:hidden">
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
      </div>

      <div className="hidden space-y-3 rounded-md border p-4 md:block">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </>
  );
}
