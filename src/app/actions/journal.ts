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
