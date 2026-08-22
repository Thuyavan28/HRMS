import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card-surface p-5 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-dark-700 rounded w-28"></div>
      <div className="w-8 h-8 bg-dark-700 rounded-lg"></div>
    </div>
    <div className="h-8 bg-dark-700 rounded w-36 mb-2"></div>
    <div className="h-3 bg-dark-700 rounded w-20"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5, className = '' }) => (
  <div className={`card-surface p-5 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="h-5 bg-dark-700 rounded w-36"></div>
      <div className="h-9 bg-dark-700 rounded w-48"></div>
    </div>
    <div className="space-y-3">
      <div className="h-10 bg-dark-750 rounded-lg w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-dark-850 rounded-lg w-full flex items-center px-4 gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-dark-700 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = ({ className = '', height = 'h-64' }) => (
  <div className={`card-surface p-5 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="h-5 bg-dark-700 rounded w-40"></div>
      <div className="h-4 bg-dark-700 rounded w-24"></div>
    </div>
    <div className={`${height} bg-dark-850 rounded-lg flex items-end p-4 gap-4 justify-around`}>
      <div className="w-12 bg-dark-700 rounded-t h-1/3"></div>
      <div className="w-12 bg-dark-700 rounded-t h-2/3"></div>
      <div className="w-12 bg-dark-700 rounded-t h-1/2"></div>
      <div className="w-12 bg-dark-700 rounded-t h-4/5"></div>
      <div className="w-12 bg-dark-700 rounded-t h-3/5"></div>
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="space-y-6 animate-pulse">
    <div className="card-surface p-6 flex items-center gap-6">
      <div className="w-24 h-24 rounded-full bg-dark-700"></div>
      <div className="space-y-3 flex-1">
        <div className="h-6 bg-dark-700 rounded w-48"></div>
        <div className="h-4 bg-dark-700 rounded w-32"></div>
        <div className="h-4 bg-dark-700 rounded w-64"></div>
      </div>
    </div>
    <div className="card-surface p-6 space-y-4">
      <div className="h-5 bg-dark-700 rounded w-36 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-10 bg-dark-750 rounded"></div>
        <div className="h-10 bg-dark-750 rounded"></div>
        <div className="h-10 bg-dark-750 rounded"></div>
        <div className="h-10 bg-dark-750 rounded"></div>
      </div>
    </div>
  </div>
);
