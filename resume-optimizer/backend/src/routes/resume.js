import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import path from 'path';
import { createRequire } from 'module';
import { analyzeResumeMatch, rewriteBulletPoint } from '../services/geminiService.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');


const router = express.Router();

// Configure Multer with memory storage and 5MB file size limit
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

const allowedExtensions = ['.pdf', '.docx'];

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = allowedExtensions.includes(ext);
    const isAllowedMime = allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream';

    if (isAllowedExt && (isAllowedMime || file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file type. Only PDF (.pdf) and Word (.docx) files are supported.');
      err.code = 'INVALID_FILE_TYPE';
      cb(err, false);
    }
  }
});

// Middleware wrapper to handle Multer upload & validation errors clean 400 responses
const uploadSingleResume = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds the maximum limit of 5MB.'
        });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error.'
      });
    }
    next();
  });
};

router.post('/parse', uploadSingleResume, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please select a .pdf or .docx resume file.'
    });
  }

  const file = req.file;
  const ext = path.extname(file.originalname).toLowerCase();

  // Secondary check on file extension
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Only PDF (.pdf) and Word (.docx) files are supported.'
    });
  }

  try {
    let rawText = '';

    if (ext === '.pdf') {
      try {
        const uint8Array = new Uint8Array(file.buffer);
        if (pdfParse && pdfParse.PDFParse) {
          const parser = new pdfParse.PDFParse(uint8Array);
          const data = await parser.getText();
          rawText = data.text || '';
        } else if (typeof pdfParse === 'function') {
          const pdfData = await pdfParse(file.buffer);
          rawText = pdfData.text || '';
        } else if (typeof pdfParse.default === 'function') {
          const pdfData = await pdfParse.default(file.buffer);
          rawText = pdfData.text || '';
        }
      } catch (pdfErr) {
        console.error('PDF Parse Error:', pdfErr);
        return res.status(422).json({
          success: false,
          error: 'Failed to process PDF file. It may be corrupted or password-protected.'
        });
      }
    } else if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        rawText = result.value || '';
      } catch (docxErr) {
        return res.status(422).json({
          success: false,
          error: 'Failed to process DOCX file. It may be corrupted or invalid.'
        });
      }
    }

    // Minimal cleanup: trim excess whitespace and blank lines
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      return res.status(422).json({
        success: false,
        error: 'No extractable text found in file. Scanned or image-only PDFs with no text are not supported.'
      });
    }

    return res.status(200).json({
      success: true,
      filename: file.originalname,
      textLength: cleanedText.length,
      extractedText: cleanedText
    });

  } catch (error) {
    return res.status(422).json({
      success: false,
      error: error.message || 'An error occurred while parsing the resume.'
    });
  }
});

router.post('/analyze', async (req, res) => {
  const { resumeText, jobDescription } = req.body || {};

  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: 'Resume text must be provided and be at least 50 characters long.'
    });
  }

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: 'Job description must be provided and be at least 50 characters long.'
    });
  }

  try {
    const analysis = await analyzeResumeMatch(resumeText.trim(), jobDescription.trim());
    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error in /api/resume/analyze:', error.message);

    if (error.isRateLimit || error.status === 503) {
      return res.status(503).json({
        success: false,
        error: 'AI service is at capacity, please try again in a moment'
      });
    }

    if (error.status === 500 && error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI analysis. Please try again.'
    });
  }
});

router.post('/rewrite-bullet', async (req, res) => {
  const { bulletText, jobDescription, resumeContext } = req.body || {};

  if (!bulletText || typeof bulletText !== 'string' || bulletText.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Bullet text must be provided and be at least 10 characters long.'
    });
  }

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Job description must be provided and be at least 10 characters long.'
    });
  }

  try {
    const result = await rewriteBulletPoint(bulletText.trim(), jobDescription.trim(), resumeContext);
    return res.status(200).json({
      success: true,
      rewrites: result.rewrites || []
    });
  } catch (error) {
    console.error('Error in /api/resume/rewrite-bullet:', error.message);

    if (error.isRateLimit || error.status === 503) {
      return res.status(503).json({
        success: false,
        error: 'AI service is at capacity, please try again in a moment'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate bullet rewrites. Please try again.'
    });
  }
});

export default router;


