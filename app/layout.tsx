import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Providers from './providers';
import ErrorStack from '@/components/error/ErrorStack';
import en from '@/messages/en.json';
import RoleGuard from '../components/RoleGuard';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'JOSH Nomination App',
  description: 'JOSH Nomination App For Woman Welfare',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <Providers messages={en}>
            <ErrorStack />
            <RoleGuard>{children}</RoleGuard>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
