import { NextResponse } from 'next/server';
import MessageController from '@/controllers/messageController';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const formDataObj: Record<string, string> = {};
    for (const [key, value] of body.entries()) {
      formDataObj[key] = value.toString();
    }
    
    // Create Express-like request and response objects
    const expressReq = {
      body: formDataObj,
      // Add other Express request properties as needed
    } as unknown as ExpressRequest;

    const expressRes = {
      sendStatus: (status: number) => {
        return NextResponse.json({}, { status });
      },
      // Add minimal required Express Response properties
      status: 200,
      send: () => {},
      json: () => {},
      // Add other required properties as needed
    } as unknown as ExpressResponse;
    
    // Call your existing controller method with Express-like objects
    await MessageController.handleIncomingMessage(expressReq, expressRes);
    
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
