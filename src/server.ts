import express from 'express';
import webhookRouter from './routes/webhook';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount the webhook router
app.use('/api', webhookRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});