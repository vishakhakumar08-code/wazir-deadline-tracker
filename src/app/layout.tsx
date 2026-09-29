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
    <html lang="en">
      <body className="bg-white text-black antialiased selection:bg-blue-200 selection:text-blue-900 min-h-screen">
        <TaskProvider>
          {children}
        </TaskProvider>
      </body>
    </html>
  );
}
