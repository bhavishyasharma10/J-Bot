'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Journal Bot Dashboard</h1>
      {!session ? (
        <button
          onClick={() => signIn('google')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </button>
      ) : (
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      )}
    </main>
  );
} 