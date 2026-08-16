import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import ChatWidget from '@/components/ChatWidget';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Medical Care Coordination',
  description: 'Secure medical appointments, communication, lab results, and clinic support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </head>
      <body className="bg-ink text-gray-100 min-h-screen flex flex-col antialiased selection:bg-clinical-mint selection:text-ink">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

