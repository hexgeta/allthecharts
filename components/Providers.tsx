'use client'

import React from 'react'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 30000,
        revalidateOnFocus: false,
        dedupingInterval: 10000,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </ThemeProvider>
    </SWRConfig>
  )
} 