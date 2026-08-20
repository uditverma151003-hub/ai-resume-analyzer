async function testRewriteBullet(bulletText, jobDescription, label, expectedStatus) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing Bullet Rewrite: ${label}...`);

  try {
    const res = await fetch('http://localhost:3001/api/resume/rewrite-bullet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bulletText, jobDescription }),
    });

    const status = res.status;
    const json = await res.json();

    console.log(`Status Code: ${status} (Expected: ${expectedStatus})`);
    console.log(`Response Body:`, JSON.stringify(json, null, 2));

    if (status === expectedStatus) {
      if (status === 200 && json.success) {
        console.log(`Rewrites returned: ${json.rewrites?.length || 0}`);
        json.rewrites?.forEach((item, idx) => {
          console.log(`\nRewrite Option [${idx + 1}]:`);
          console.log(`Text: "${item.text}"`);
          console.log(`Rationale: "${item.rationale}"`);
        });
      }
      console.log(`✅ TEST PASSED for ${label}`);
      return { success: true, json };
    } else {
      console.error(`❌ TEST FAILED for ${label}`);
      return { success: false, status, json };
    }
  } catch (err) {
    console.error(`❌ NETWORK ERROR for ${label}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function runPhase4Tests() {
  console.log('Starting Phase 4 Bullet-Point Rewriter Verification Tests...');

  const sampleBullet = 'Architected and implemented microservices handling over 500k daily active users with Node.js and PostgreSQL.';
  const sampleJD = 'Seeking a Senior Software Engineer proficient in Node.js, microservices, PostgreSQL, and high-concurrency systems.';

  const validTest = await testRewriteBullet(sampleBullet, sampleJD, 'Valid Bullet Rewrite Request', 200);
  const shortTest = await testRewriteBullet('Short', sampleJD, 'Short Line Validation Rejection', 400);


  console.log('\n==================================================');
  console.log('PHASE 4 VERIFICATION SUMMARY:');
  console.log(`Valid Bullet Rewrites: ${validTest.success ? 'PASSED' : 'FAILED'}`);
  console.log(`Validation Rejection (< 10 chars): ${shortTest.success ? 'PASSED' : 'FAILED'}`);
  console.log('==================================================');
}

runPhase4Tests();
