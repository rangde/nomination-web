'use client';

import { NextIntlClientProvider } from 'next-intl';

export default function Providers({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
