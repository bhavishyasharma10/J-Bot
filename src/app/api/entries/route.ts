import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import JournalService from '@/services/journalService';
import logger from '@/config/logger';

export async function GET() {
    try {
        const session = await getServerSession();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entries = await JournalService.getAllEntries(session.user.email);
        return NextResponse.json(entries);
    } catch (error) {
        logger.error('Error fetching entries:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 