import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function debug() {
  try {
    const buffer = fs.readFileSync('./test_fixtures/sample_resume.pdf');
    const { PDFParse } = pdfParse;
    const parser = new PDFParse(new Uint8Array(buffer));
    const data = await parser.getText();
    console.log('PDF text result:', JSON.stringify(data));
  } catch (err) {
    console.error('PDF error stack:', err);
  }
}




debug();
