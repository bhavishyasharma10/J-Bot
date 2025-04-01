import { ReminderAttributes } from '@/lib/types/models';

export async function fetchUserReminders(userId: string, date?: string): Promise<ReminderAttributes[]> {
  const url = new URL('/api/reminders', window.location.origin);
  url.searchParams.append('userId', userId);
  if (date) {
    url.searchParams.append('date', date);
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch reminders');
  const data = await response.json();
  return data as ReminderAttributes[];
}

export async function addReminder(userId: string, text: string, time: string): Promise<void> {
  const response = await fetch('/api/reminders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      text,
      time,
    }),
  });

  if (!response.ok) throw new Error('Failed to add reminder');
}

export async function deleteReminder(id: string): Promise<void> {
  const response = await fetch(`/api/reminders?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete reminder');
}

export async function toggleReminder(reminder: ReminderAttributes): Promise<void> {
  const response = await fetch('/api/reminders', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: reminder.id,
    }),
  });

  if (!response.ok) throw new Error('Failed to update reminder');
}
