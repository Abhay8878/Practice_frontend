import { Skeleton } from "../components/ui/skeleton";

export default function DefaultSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[1200px]" />
        <Skeleton className="h-4 w-[1100px]" />
      </div>
      <div 
      className="animate-pulse bg-gray-200 h-16 rounded-md"
      data-testid="default-skeleton"  
    />
    </div>
  );
}
