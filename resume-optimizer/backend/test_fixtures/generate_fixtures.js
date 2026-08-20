import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';

const testDir = './test_fixtures';
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  const resumeText = [
    'John Doe',
    'Senior Software Engineer | john.doe@example.com | (555) 019-2834',
    'Summary: Experienced Full Stack Developer with 7+ years of expertise building scalable web apps with React and Node.js.',
    'Experience:',
    '- Tech Corp: Lead Developer (2021 - Present). Architected microservices and improved system throughput by 40%.',
    '- Web Innovations: Full Stack Developer (2018 - 2021). Built responsive UI components with React and Tailwind CSS.',
    'Skills: JavaScript, React, Node.js, Express, PostgreSQL, Docker, AWS, Git.'
  ];

  let y = height - 50;
  for (const line of resumeText) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: line.startsWith('John') ? 18 : 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(testDir, 'sample_resume.pdf'), pdfBytes);
  console.log('Generated sample_resume.pdf');
}

async function generateDOCX() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'Jane Smith\n', bold: true, size: 32 }),
              new TextRun({ text: 'Product Manager | jane.smith@example.com\n\n', size: 24 }),
              new TextRun({ text: 'Professional Profile:\n', bold: true, size: 28 }),
              new TextRun({ text: 'Results-driven Product Manager with 5+ years of experience leading cross-functional engineering teams.\n\n', size: 24 }),
              new TextRun({ text: 'Work Experience:\n', bold: true, size: 28 }),
              new TextRun({ text: '- Senior PM at CloudScale (2020 - Present): Launched enterprise SaaS product generating $2M ARR.\n', size: 24 }),
              new TextRun({ text: '- Product Analyst at DataDriven (2017 - 2020): Spearheaded user research and analytics dashboard redesign.\n\n', size: 24 }),
              new TextRun({ text: 'Core Competencies:\n', bold: true, size: 28 }),
              new TextRun({ text: 'Product Strategy, Agile/Scrum, User Analytics, Roadmap Planning, SQL.', size: 24 })
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(testDir, 'sample_resume.docx'), buffer);
  console.log('Generated sample_resume.docx');
}

function generateInvalidPNG() {
  // Simple PNG header + dummy data
  const fakePng = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DDB0000000049454E44AE426082', 'hex');
  fs.writeFileSync(path.join(testDir, 'invalid_file.png'), fakePng);
  console.log('Generated invalid_file.png');
}

function generateOversizedPDF() {
  // Create dummy > 5MB file named oversized_file.pdf
  const padding = Buffer.alloc(5.5 * 1024 * 1024, 'A');
  fs.writeFileSync(path.join(testDir, 'oversized_file.pdf'), padding);
  console.log('Generated oversized_file.pdf');
}

async function main() {
  await generatePDF();
  await generateDOCX();
  generateInvalidPNG();
  generateOversizedPDF();
}

main().catch(console.error);
