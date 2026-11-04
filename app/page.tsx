'use client';

import React, { useSyncExternalStore } from 'react';
import { AppProvider } from '@/context/AppContext';
import { MainApp } from '@/components/MainApp';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Page() {
  const mounted = useMounted();

  if (!mounted) {
    return <LoadingSkeleton />;
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
