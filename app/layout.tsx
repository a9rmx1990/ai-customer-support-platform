import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'AI Customer Support Automation Platform',
  description: 'Enterprise AI Customer Support platform built with n8n, Next.js, RAG knowledge retrieval, Supabase pgvector, and automated human escalation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <ChatWidget />
        <footer className="border-t border-gray-800/80 bg-gray-950 py-8 text-center text-xs text-gray-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-200">AI Customer Support Automation Platform</span>
              <span>•</span>
              <span>n8n Workflows + PostgreSQL pgvector</span>
            </div>
            <p>© 2026 AI Support Systems. Production Portfolio Architecture.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
