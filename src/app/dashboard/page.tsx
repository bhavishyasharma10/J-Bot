'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Task } from '@/lib/types/Task';
import { JournalEntry } from '@/lib/types/JournalEntry';

interface UserData {
  id: string;
  whatsapp_number: string;
  name: string;
  email: string;
  profile_photo?: string;
  created_at: string;
}

function DashboardContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (id: string) => {
    try {
      // Fetch tasks
      const tasksResponse = await fetch(`/api/tasks?userId=${id}`);
      const tasksData = await tasksResponse.json();
      setTasks(tasksData as Task[]);

      // Fetch journal entries
      const journalResponse = await fetch(`/api/journal?userId=${id}`);
      const journalData = await journalResponse.json();
      setJournalEntries(journalData as JournalEntry[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse user data from URL
  useEffect(() => {
    const userDataStr = searchParams.get('userData');
    if (!userDataStr) {
      router.push('/');
      return;
    }

    try {
      const data = JSON.parse(decodeURIComponent(userDataStr)) as UserData;
      fetchData(data.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [searchParams, fetchData, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tasks Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks found</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className={`${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.content}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {task.category}
                        </span>
                        {task.createdAt && (
                          <span className="text-xs text-gray-500">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Journal Entries Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Journal Entries</h2>
            {journalEntries.length === 0 ? (
              <p className="text-gray-500">No journal entries found</p>
            ) : (
              <div className="space-y-4">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {entry.type}
                      </span>
                      {entry.createdAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{entry.content}</p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 