import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resumeRouter from './routes/resume.js';
import scansRouter from './routes/scans.js';
import exportRouter from './routes/export.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Parse ALLOWED_ORIGINS from environment variable (comma-separated), fallback to local + live Netlify
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://ai-resume-analyzer-uv.netlify.app';
const allowedOrigins = rawAllowedOrigins
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

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
app.use('/api/resume', exportRouter);
app.use('/api/scans', scansRouter);

app.listen(PORT, () => {
  console.log(`[Startup] Backend server listening on http://localhost:${PORT}`);
  console.log(`[Startup] Allowed CORS origins: ${allowedOrigins.join(', ')}`);

  // Log warnings for any missing environment variables on startup (without logging sensitive values)
  const envCheck = [
    { name: 'GEMINI_API_KEY', critical: false },
    { name: 'SUPABASE_URL', critical: false },
    { name: 'SUPABASE_ANON_KEY', critical: false },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', critical: false },
    { name: 'ALLOWED_ORIGINS', critical: false }
  ];

  envCheck.forEach(({ name }) => {
    if (!process.env[name] || process.env[name].trim() === '') {
      console.warn(`[Startup Warning] Environment variable "${name}" is missing or empty.`);
    } else {
      console.log(`[Startup Check] Environment variable "${name}" is set.`);
    }
  });
});


