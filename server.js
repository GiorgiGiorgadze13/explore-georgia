import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import chatHandler from './api/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint for local development (matches Vercel serverless path)
app.post('/api/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (err) {
    console.error('Server error handling /api/chat:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`[Explore Georgia AI Server] Local server running at http://localhost:${PORT}`);
  console.log(`[Explore Georgia AI Server] /api/chat endpoint ready`);
});
