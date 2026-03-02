import { Skeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="aspect-[3/4] w-full rounded-none" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
