import React from 'react';

/**
 * Loading Skeleton Component
 * Animated placeholder for loading states, fully supports theme tokens.
 */

export const CardSkeleton = () => (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6 animate-pulse">
        <div className="h-4 bg-[var(--surface-hover)] rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-[var(--surface-hover)] rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-[var(--surface-hover)] rounded w-3/4"></div>
    </div>
);

export const StatCardSkeleton = () => (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <div className="h-3 bg-[var(--surface-hover)] rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-[var(--surface-hover)] rounded w-3/4"></div>
            </div>
            <div className="w-12 h-12 bg-[var(--surface-hover)] rounded-lg"></div>
        </div>
        <div className="h-3 bg-[var(--surface-hover)] rounded w-1/3"></div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--surface-hover)] rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--surface-hover)] rounded w-1/4"></div>
                <div className="h-3 bg-[var(--surface-hover)] rounded w-1/3"></div>
            </div>
            <div className="h-8 w-24 bg-[var(--surface-hover)] rounded"></div>
        </div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6 animate-pulse">
        <div className="h-5 bg-[var(--surface-hover)] rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-[var(--surface-hover)] rounded"></div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-[var(--surface-hover)] rounded-full"></div>
            <div className="flex-1 space-y-3">
                <div className="h-6 bg-[var(--surface-hover)] rounded w-1/3"></div>
                <div className="h-4 bg-[var(--surface-hover)] rounded w-1/2"></div>
            </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-[var(--surface-hover)] rounded"></div>
            ))}
        </div>
    </div>
);

export const ListSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <TableRowSkeleton key={i} />
        ))}
    </div>
);

export const GridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

export default {
    CardSkeleton,
    StatCardSkeleton,
    TableRowSkeleton,
    ChartSkeleton,
    ProfileSkeleton,
    ListSkeleton,
    GridSkeleton
};
