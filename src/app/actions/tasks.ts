import { TaskAttributes } from '@/lib/types/models';

export async function fetchUserTasks(userId: string, date?: string): Promise<TaskAttributes[]> {
  const url = new URL('/api/tasks', window.location.origin);
  url.searchParams.append('userId', userId);
  if (date) {
    url.searchParams.append('date', date);
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  return data;
}

export async function toggleTask(taskId: string): Promise<void> {
  const response = await fetch('/api/tasks', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: taskId,
    }),
  });

  if (!response.ok) throw new Error('Failed to update task');
}
