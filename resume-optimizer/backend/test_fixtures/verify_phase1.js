import fs from 'fs';
import path from 'path';

async function testUpload(filePath, expectedStatus) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  
  const formData = new FormData();
  const blob = new Blob([fileBuffer]);
  formData.append('resume', blob, fileName);

  console.log(`\n--------------------------------------------------`);
  console.log(`Testing upload: ${fileName} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)...`);

  try {
    const res = await fetch('http://localhost:3001/api/resume/parse', {
      method: 'POST',
      body: formData,
    });

    const status = res.status;
    const json = await res.json();

    console.log(`Status Code: ${status} (Expected: ${expectedStatus})`);
    console.log(`Response Body:`, JSON.stringify(json, null, 2));

    if (status === expectedStatus) {
      console.log(`✅ TEST PASSED for ${fileName}`);
      return { success: true, status, json };
    } else {
      console.error(`❌ TEST FAILED for ${fileName}`);
      return { success: false, status, json };
    }
  } catch (err) {
    console.error(`❌ NETWORK ERROR for ${fileName}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function runAllTests() {
  console.log('Starting Phase 1 Verification Tests...');

  const pdfResult = await testUpload('./test_fixtures/sample_resume.pdf', 200);
  const docxResult = await testUpload('./test_fixtures/sample_resume.docx', 200);
  const pngResult = await testUpload('./test_fixtures/invalid_file.png', 400);
  const oversizedResult = await testUpload('./test_fixtures/oversized_file.pdf', 400);

  console.log('\n==================================================');
  console.log('FINAL VERIFICATION SUMMARY:');
  console.log(`PDF Extraction: ${pdfResult.success ? 'PASSED' : 'FAILED'} (Length: ${pdfResult.json?.textLength || 0})`);
  console.log(`DOCX Extraction: ${docxResult.success ? 'PASSED' : 'FAILED'} (Length: ${docxResult.json?.textLength || 0})`);
  console.log(`Invalid Type Rejection: ${pngResult.success ? 'PASSED' : 'FAILED'}`);
  console.log(`Oversized File Rejection: ${oversizedResult.success ? 'PASSED' : 'FAILED'}`);
  console.log('==================================================');
}

runAllTests();
