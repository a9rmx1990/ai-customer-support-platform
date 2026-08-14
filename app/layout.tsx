import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ChatWidget from '@/components/ChatWidget';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoSupport AI | Multi-Domain Medical & E-Commerce Platform',
  description: 'AI Customer & Healthcare Support Automation Platform with pgvector RAG, Doctor Scheduling, Order Tracking, and n8n Workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
