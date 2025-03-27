import dotenv from 'dotenv';

dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import webhookRoutes from './routes/webhook';
import logger from './config/logger';

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', webhookRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
}); 