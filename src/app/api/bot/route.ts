import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/config/init';
import { handleIncomingMessage } from '@/controllers/messageController';

// Initialize database when the module is loaded
initializeDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});

export async function POST(request: Request) {
    try {
        /** Body is of FormData type */
        const body = await request.formData();
        const response = await handleIncomingMessage(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error processing message:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
