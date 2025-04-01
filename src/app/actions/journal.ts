import { JournalEntryAttributes } from '@/lib/types/models';

export async function fetchUserJournalEntries(userId: string, date?: string): Promise<JournalEntryAttributes[]> {
  const url = new URL('/api/journal', window.location.origin);
  url.searchParams.append('userId', userId);
  if (date) {
    url.searchParams.append('date', date);
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch journal entries');
  const data = await response.json();
  return data;
}

export async function createJournalEntry(userId: string, content: string, type: string): Promise<void> {
  const response = await fetch('/api/journal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      content,
      type,
    }),
  });

  if (!response.ok) throw new Error('Failed to create journal entry');
}

export async function updateJournalEntry(entryId: string, content: string, type: string): Promise<void> {
  const response = await fetch('/api/journal', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: entryId,
      content,
      type,
    }),
  });

  if (!response.ok) throw new Error('Failed to update journal entry');
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const response = await fetch(`/api/journal?id=${entryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete journal entry');
}
