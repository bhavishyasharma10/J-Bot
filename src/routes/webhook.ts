import express from 'express';
import MessageController from '../controllers/messageController';

const router = express.Router();

router.post('/bot', MessageController.handleIncomingMessage);

export default router; 