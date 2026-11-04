'use client';

import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans antialiased">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-72 bg-slate-900 flex-col border-r border-slate-800 p-4 space-y-4">
        <div className="h-12 flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
            CA
          </div>
          <div>
            <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-800/60 rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="h-14 bg-slate-800/60 rounded-lg animate-pulse" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-800/40 rounded-md animate-pulse" />
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Header skeleton */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-64 bg-slate-100 rounded-lg hidden sm:block animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-24 bg-blue-600/30 rounded-md animate-pulse" />
          </div>
        </header>

        {/* Content skeleton */}
        <main className="flex-1 p-6 space-y-6">
          <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 p-4 animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-xl border border-slate-200 p-6 animate-pulse" />
        </main>
      </div>
    </div>
  );
};
