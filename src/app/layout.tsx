import type { Metadata } from 'next';
import './globals.css';
import { TaskProvider } from '@/context/TaskContext';

export const metadata: Metadata = {
  title: 'Wazir | Real-Time Deadline Tracker & Consulting Operations',
  description:
    'Executive-grade real-time deliverable and deadline tracker for Wazir - The Strategy & Consulting Club. Built with Next.js, Tailwind CSS, and Supabase.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-wazir-midnight text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <TaskProvider>
          {children}
        </TaskProvider>
      </body>
    </html>
  );
}
