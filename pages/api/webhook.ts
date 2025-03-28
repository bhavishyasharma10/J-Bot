import { NextApiRequest, NextApiResponse } from 'next';
import MessageController from '../../src/controllers/messageController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await MessageController.handleIncomingMessage(req as any, res as any);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}