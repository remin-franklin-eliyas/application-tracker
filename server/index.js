import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import applicationsRouter from './routes/applications.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/applications', applicationsRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`🏎️  Application Tracker API running on http://localhost:${PORT}`);
  if (!process.env.GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set — AI features will be unavailable. See .env.example');
  }
});
