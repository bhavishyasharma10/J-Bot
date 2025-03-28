'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  type: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEntries();
    }
  }, [status]);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Journal Entries</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-sm text-gray-500 mb-2">
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
              <div className="text-lg font-medium mb-2 capitalize">
                {entry.type}
              </div>
              <p className="text-gray-700">{entry.content}</p>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No entries yet. Start journaling through WhatsApp!
          </div>
        )}
      </div>
    </main>
  );
} 