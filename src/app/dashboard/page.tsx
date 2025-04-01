'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JournalEntryAttributes, ReminderAttributes, TaskAttributes } from '@/lib/types/models';
import { fetchUserReminders, addReminder, deleteReminder, toggleReminder } from '@/app/actions/reminders';
import { createJournalEntry, deleteJournalEntry, fetchUserJournalEntries, updateJournalEntry } from '@/app/actions/journal';
import { fetchUserTasks, toggleTask, updateTask, deleteTask, createTask } from '@/app/actions/tasks';
import { TaskCategory } from '@/lib/types/Task';

interface UserData {
  id: string;
  whatsapp_number: string;
  name: string;
  email: string;
  profile_photo?: string;
  created_at: string;
}

interface EditingTask {
  id: string;
  content: string;
  category: TaskCategory;
}

interface EditingJournal {
  id: string;
  content: string;
  type: string;
}

function DashboardContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<TaskAttributes[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryAttributes[]>([]);
  const [reminders, setReminders] = useState<ReminderAttributes[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ content: '', category: 'work' });
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: '', time: '' });
  
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [newJournalEntry, setNewJournalEntry] = useState({ content: '', type: 'highlight' });
  const [editingJournal, setEditingJournal] = useState<EditingJournal | null>(null);

  const fetchData = useCallback(async (id: string, date: string) => {
    try {
      // Fetch tasks
      const tasksData = await fetchUserTasks(id, date);
      setTasks(tasksData);

      // Fetch journal entries
      const journalData = await fetchUserJournalEntries(id, date);
      setJournalEntries(journalData);

      // Fetch reminders
      const remindersData = await fetchUserReminders(id, date);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse user data from URL and fetch data
  useEffect(() => {
    const userDataStr = searchParams.get('userData');
    if (!userDataStr) {
      router.push('/');
      return;
    }

    try {
      const data = JSON.parse(decodeURIComponent(userDataStr)) as UserData;
      fetchData(data.id, selectedDate);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [searchParams, fetchData, router, selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const handleAddReminder = async (userId: string) => {
    try {
      await addReminder(userId, newReminder.text, newReminder.time);
      const updatedReminders = await fetchUserReminders(userId, selectedDate);
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

  const handleToggleTask = async (task: TaskAttributes) => {
    try {
      if (!task.id) return;
      await toggleTask(task.id.toString());
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEditTask = async (task: TaskAttributes) => {
    if (!task.id) return;
    
    if (editingTask?.id === task.id.toString()) {
      try {
        await updateTask(task.id.toString(), editingTask.content, editingTask.category);
        setTasks(prevTasks => prevTasks.map(t => 
          t.id === task.id ? { ...t, content: editingTask.content, category: editingTask.category } : t
        ));
        setEditingTask(null);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else {
      setEditingTask({
        id: task.id.toString(),
        content: task.content,
        category: task.category as TaskCategory
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== Number(taskId)));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddTask = async (userId: string) => {
    try {
      await createTask(userId, newTask.content, newTask.category);
      const updatedTasks = await fetchUserTasks(userId, selectedDate);
      setTasks(updatedTasks);
      setShowAddTask(false);
      setNewTask({ content: '', category: 'work' });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleAddJournalEntry = async (userId: string) => {
    try {
      await createJournalEntry(userId, newJournalEntry.content, newJournalEntry.type);
      const updatedEntries = await fetchUserJournalEntries(userId, selectedDate);
      setJournalEntries(updatedEntries);
      setShowAddJournal(false);
      setNewJournalEntry({ content: '', type: 'highlight' });
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const handleEditJournalEntry = async (journalId: string) => {
    if (!editingJournal) return;
    try {
      await updateJournalEntry(journalId, editingJournal.content, editingJournal.type);
      setJournalEntries(prevEntries => prevEntries.map(entry => 
        entry.id === Number(journalId) ? { ...entry, content: editingJournal.content, type: editingJournal.type } : entry
      ));
      setEditingJournal(null);
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  const handleDeleteJournalEntry = async (journalId: string) => {
    try {
      await deleteJournalEntry(journalId);
      setJournalEntries(journalEntries.filter(entry => entry.id !== Number(journalId)));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };
  console.log(editingJournal);
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
          <h1 className="text-3xl font-bold">Daily Journal</h1>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
            <button
              onClick={() => router.push('/')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Journal Entries Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Journal Entries</h2>
              <button
                onClick={() => setShowAddJournal(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm"
              >
                Add Journal Entry
              </button>
            </div>

            {/* Add Journal Entry Form */}
            {showAddJournal && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <textarea
                    placeholder="Journal entry content"
                    value={newJournalEntry.content}
                    onChange={(e) => setNewJournalEntry({ ...newJournalEntry, content: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                  <select
                    value={newJournalEntry.type}
                    onChange={(e) => setNewJournalEntry({ ...newJournalEntry, type: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="highlight">Highlight</option>
                    <option value="reflection">Reflection</option>
                    <option value="gratitude">Gratitude</option>
                    <option value="thought">Thought</option>
                    <option value="affirmation">Affirmation</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const userDataStr = searchParams.get('userData');
                        if (userDataStr) {
                          const userData = JSON.parse(decodeURIComponent(userDataStr)) as UserData;
                          handleAddJournalEntry(userData.id);
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddJournal(false);
                        setNewJournalEntry({ content: '', type: 'highlight' });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {journalEntries.length === 0 ? (
              <p className="text-gray-500">No journal entries for this day</p>
            ) : (
              <ul className="space-y-3">
                {journalEntries.map((entry) => (
                  <li key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                    {editingJournal?.id === Number(entry.id).toString() ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingJournal?.content}
                          onChange={(e) =>
                            setEditingJournal((prev) => prev && { ...prev, content: e.target.value })
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                        <select
                          value={editingJournal?.type}
                          onChange={(e) =>
                            setEditingJournal((prev) => prev && { ...prev, type: e.target.value })
                          }
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="highlight">Highlight</option>
                          <option value="reflection">Reflection</option>
                          <option value="gratitude">Gratitude</option>
                          <option value="thought">Thought</option>
                          <option value="affirmation">Affirmation</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditJournalEntry(Number(entry.id).toString())}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingJournal(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800">{entry.content}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {entry.type}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setEditingJournal({ id: Number(entry.id).toString(), content: entry.content, type: entry.type })}
                            className="text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJournalEntry(Number(entry.id).toString())}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tasks Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm"
              >
                Add Task
              </button>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task content"
                    value={newTask.content}
                    onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as TaskCategory })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="family">Family</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const userDataStr = searchParams.get('userData');
                        if (userDataStr) {
                          const userData = JSON.parse(decodeURIComponent(userDataStr)) as UserData;
                          handleAddTask(userData.id);
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTask(false);
                        setNewTask({ content: '', category: 'work' });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks for this day</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex flex-col flex-grow mr-4">
                      {editingTask?.id === task.id?.toString() ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editingTask?.content || ''}
                            onChange={(e) => setEditingTask(prev => prev ? { ...prev, content: e.target.value } : null)}
                            className="w-full p-1 border rounded"
                          />
                          <select
                            value={editingTask?.category || 'work'}
                            onChange={(e) => setEditingTask(prev => prev ? { ...prev, category: e.target.value as TaskCategory } : null)}
                            className="w-full p-1 border rounded"
                          >
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="family">Family</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>
                            {task.content}
                          </span>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {task.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        {editingTask?.id === task.id?.toString() ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id?.toString() || '')}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`p-2 rounded-full ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        } hover:bg-opacity-80`}
                      >
                        ✓
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
              <p className="text-gray-500">No reminders for this day</p>
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
                          Due: {new Date(reminder.reminder_time || '').toLocaleDateString()} {new Date(reminder.reminder_time || '').toLocaleTimeString()}
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