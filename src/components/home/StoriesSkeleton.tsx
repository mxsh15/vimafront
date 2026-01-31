"use client";

type Props = {
    count?: number;
};

export function StoriesSkeleton({ count = 12 }: Props) {
    return (
        <div className="container mx-auto px-4 py-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-6 min-w-max">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                        <div className="skeleton h-20 w-20 rounded-full" />
                        <div className="skeleton h-3 w-16 rounded-full" />
                        <div className="skeleton h-3 w-10 rounded-full opacity-80" />
                    </div>
                ))}
            </div>
        </div>
    );
}
