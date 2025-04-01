import { ReminderAttributes } from '@/lib/types/models';

export async function fetchUserReminders(userId: string): Promise<ReminderAttributes[]> {
  const response = await fetch(`/api/reminders?userId=${userId}`);
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
