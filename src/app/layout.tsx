import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PokeTrader - Autonomous Pokemon Card Trading Agent',
  description: 'AI-powered Pokemon card trading on Courtyard.io',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
