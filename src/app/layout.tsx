import './globals.css';
import { Suspense } from 'react';

export const metadata = {
  title: 'Lazy Journal',
  description: "Journal Bot",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
