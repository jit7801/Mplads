import React from 'react';

export function CardSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="gov-card p-4 animate-pulse space-y-2">
          <div className="h-3 bg-[#E4E7EC] rounded w-2/3" />
          <div className="h-7 bg-[#E4E7EC] rounded w-1/2" />
          <div className="h-2.5 bg-[#E4E7EC] rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="gov-card p-4 animate-pulse space-y-3">
      <div className="h-4 bg-[#E4E7EC] rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#F2F4F7]">
          <div className="h-3 bg-[#E4E7EC] rounded w-16" />
          <div className="h-3 bg-[#E4E7EC] rounded w-48" />
          <div className="h-3 bg-[#E4E7EC] rounded w-24" />
          <div className="h-3 bg-[#E4E7EC] rounded w-16" />
          <div className="h-3 bg-[#E4E7EC] rounded w-20" />
        </div>
      ))}
    </div>
  );
}
