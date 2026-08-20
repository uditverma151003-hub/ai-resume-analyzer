import express from 'express';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function generatePDFBuffer(text) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 54, // ~0.75 in
        size: 'LETTER',
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      doc.font('Helvetica').fontSize(10.5);

      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
          doc.moveDown(0.4);
        } else {
          doc.text(line, {
            align: 'left',
            lineGap: 3,
          });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function generateDocxBuffer(text) {
  const lines = text.split('\n');
  const paragraphs = lines.map((line) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          font: 'Calibri',
          size: 22, // 11pt
        }),
      ],
      spacing: {
        after: line.trim() === '' ? 120 : 60,
      },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080, // 0.75 in (1080 dxa)
              bottom: 1080,
              left: 1080,
              right: 1080,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

router.post('/export', requireAuth, async (req, res) => {
  const { resumeText, format, filename } = req.body || {};

  if (!format || (format !== 'pdf' && format !== 'docx')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid format. Must be "pdf" or "docx".',
    });
  }

  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Resume text must be provided and non-empty.',
    });
  }

  // Sanitize filename: remove special characters, default to "optimized-resume"
  const rawFilename = (filename && typeof filename === 'string' && filename.trim().length > 0)
    ? filename.trim()
    : 'optimized-resume';
  const sanitizedFilename = rawFilename
    .replace(/\.[^/.]+$/, '') // remove extension if passed
    .replace(/[^a-zA-Z0-9_-]/g, '_') || 'optimized-resume';

  try {
    if (format === 'pdf') {
      const pdfBuffer = await generatePDFBuffer(resumeText);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } else if (format === 'docx') {
      const docxBuffer = await generateDocxBuffer(resumeText);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}.docx"`);
      return res.status(200).send(docxBuffer);
    }
  } catch (error) {
    console.error(`[Export Error - ${format.toUpperCase()}]:`, error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate document, please try again',
    });
  }
});

export default router;
