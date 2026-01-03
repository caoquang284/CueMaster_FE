'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 0, // Disable auto-refresh by default
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
        onError: (error) => {
          console.error('SWR Error:', error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
