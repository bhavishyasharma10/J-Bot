import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Journal Bot Dashboard',
  description: 'Manage your journal entries and WhatsApp interactions',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 