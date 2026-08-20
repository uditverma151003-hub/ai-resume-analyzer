import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resumeRouter from './routes/resume.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/resume', resumeRouter);

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

