import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resumeRouter from './routes/resume.js';
import scansRouter from './routes/scans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-resume-analyzer-uv.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/resume', resumeRouter);
app.use('/api/scans', scansRouter);

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

