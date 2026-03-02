import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
}
