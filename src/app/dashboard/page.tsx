'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Task } from '@/lib/types/Task';
import { JournalEntry } from '@/lib/types/JournalEntry';
import { ReminderAttributes } from '@/lib/types/models';
import { fetchUserReminders, addReminder, deleteReminder, toggleReminder } from '@/app/actions/reminders';

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
  const [reminders, setReminders] = useState<ReminderAttributes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: '', time: '' });

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

      // Fetch reminders
      const remindersData = await fetchUserReminders(id);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddReminder = async (userId: string) => {
    try {
      await addReminder(userId, newReminder.text, newReminder.time);
      const updatedReminders = await fetchUserReminders(userId);
      setReminders(updatedReminders);
      setShowAddReminder(false);
      setNewReminder({ text: '', time: '' });
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id);
      setReminders(reminders.filter(reminder => reminder.id !== Number(id)));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleToggleReminder = async (reminder: ReminderAttributes) => {
    try {
      await toggleReminder(reminder);
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, status: 'triggered' } : r
      ));
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

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

          {/* Reminders Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Reminders</h2>
              <button
                onClick={() => setShowAddReminder(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm"
              >
                Add Reminder
              </button>
            </div>

            {/* Add Reminder Form */}
            {showAddReminder && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Reminder text"
                    value={newReminder.text}
                    onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                  <input
                    type="datetime-local"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const userDataStr = searchParams.get('userData');
                        if (userDataStr) {
                          const userData = JSON.parse(decodeURIComponent(userDataStr)) as UserData;
                          handleAddReminder(userData.id);
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddReminder(false);
                        setNewReminder({ text: '', time: '' });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {reminders.length === 0 ? (
              <p className="text-gray-500">No reminders set</p>
            ) : (
              <ul className="space-y-3">
                {reminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className={reminder.status === 'triggered' ? 'line-through text-gray-500' : ''}>
                        {reminder.reminder_text}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          Due: {new Date(reminder.reminder_time).toLocaleDateString()} {new Date(reminder.reminder_time).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          reminder.status === 'triggered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reminder.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleReminder(reminder)}
                        className={`p-2 rounded-full ${
                          reminder.status === 'triggered'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        } hover:bg-opacity-80`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id?.toString() || '')}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-opacity-80"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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