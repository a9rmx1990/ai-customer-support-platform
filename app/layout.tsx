import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import ChatWidget from '@/components/ChatWidget';
import { AuthProvider } from '@/lib/auth-context';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  title: 'AutoSupport AI | Multi-Domain Medical, Retail & Enterprise Platform',
  description: 'Autonomous AI support engine with domain-isolated RAG vector search, live database tool execution, doctor scheduling, order tracking, and n8n workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
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


