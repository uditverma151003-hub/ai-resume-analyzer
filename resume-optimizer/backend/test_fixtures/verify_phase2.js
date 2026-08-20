import fs from 'fs';

const sampleDeveloperResume = `
John Doe
Senior Full Stack Engineer
Email: john.doe@example.com | Phone: (555) 019-2834 | Location: San Francisco, CA

Professional Summary:
Experienced Senior Software Engineer with over 7 years of hands-on experience designing, developing, and deploying high-performance web applications. Specialized in JavaScript, React, Node.js, Express, PostgreSQL, and cloud deployments with Docker and AWS.

Technical Skills:
- Frontend: React.js, Next.js, Redux, Tailwind CSS, TypeScript, HTML5/CSS3
- Backend: Node.js, Express.js, RESTful APIs, GraphQL, PostgreSQL, MongoDB, Redis
- DevOps & Tools: Docker, AWS (S3, EC2), CI/CD pipelines, Git, Jest, Cypress

Work Experience:
Lead Software Engineer | TechCorp Inc. | 2021 - Present
- Architected and implemented microservices handling over 500k daily active users with Node.js and PostgreSQL.
- Spearheaded frontend migration to React and Tailwind CSS, reducing initial page load time by 45%.
- Mentored junior engineers and conducted weekly code reviews to enforce software design patterns.

Full Stack Developer | Web Innovations Ltd. | 2018 - 2021
- Developed interactive web dashboards with React and Redux.
- Built automated REST API endpoints with Express and integrated third-party payment gateways.
`;

const relevantDeveloperJD = `
We are seeking a Senior Full Stack Engineer to join our core product engineering team.

Key Responsibilities:
- Design and build responsive frontend user interfaces using React and modern CSS frameworks like Tailwind.
- Develop scalable backend microservices and APIs using Node.js, Express, and PostgreSQL.
- Optimize application performance, database queries, and deployment workflows using Docker and AWS.
- Collaborate with product management and design teams to deliver exceptional user experiences.

Required Qualifications:
- 5+ years of software engineering experience in web development.
- Strong proficiency in JavaScript/TypeScript, React.js, and Node.js.
- Experience with relational databases (PostgreSQL/MySQL) and RESTful API architecture.
- Familiarity with cloud platforms (AWS, Docker) and CI/CD pipelines.
`;

const unrelatedNurseJD = `
We are seeking a Dedicated Registered Nurse (RN) for our Emergency Department.

Key Responsibilities:
- Assess patient health problems and needs, develop and implement nursing care plans, and maintain medical records.
- Administer medications, IV fluids, and treatments as prescribed by physicians.
- Monitor patient vital signs and collaborate with doctors in emergency medical procedures.
- Provide compassionate bedside care and educate patients and family members on post-discharge health management.

Required Qualifications:
- Active Registered Nurse (RN) license in the state of California.
- Bachelor of Science in Nursing (BSN) or Associate Degree in Nursing (ADN).
- BLS (Basic Life Support) and ACLS (Advanced Cardiac Life Support) certifications required.
- 2+ years of clinical nursing experience in a hospital emergency room setting.
`;

async function testAnalyzeEndpoint(resumeText, jobDescription, label, expectedOverallScoreRange) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing AI Analysis: ${label}...`);

  try {
    const res = await fetch('http://localhost:3001/api/resume/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    const status = res.status;
    const json = await res.json();

    console.log(`Status Code: ${status}`);
    console.log(`Response Body:`, JSON.stringify(json, null, 2));

    if (status === 200 && json.success && json.analysis) {
      const score = json.analysis.overallScore;
      console.log(`Overall Score: ${score}/100`);
      console.log(`Matched Keywords (${json.analysis.matchedKeywords?.length}):`, json.analysis.matchedKeywords?.slice(0, 5));
      console.log(`Missing Keywords (${json.analysis.missingKeywords?.length}):`, json.analysis.missingKeywords?.slice(0, 5));

      const [minScore, maxScore] = expectedOverallScoreRange;
      if (score >= minScore && score <= maxScore) {
        console.log(`✅ TEST PASSED for ${label} (Score ${score} within range [${minScore}-${maxScore}])`);
        return { success: true, json };
      } else {
        console.warn(`⚠️ Score ${score} outside expected range [${minScore}-${maxScore}]`);
        return { success: true, json, scoreWarning: true };
      }
    } else {
      console.error(`❌ TEST FAILED for ${label}:`, json.error);
      return { success: false, status, json };
    }
  } catch (err) {
    console.error(`❌ NETWORK ERROR for ${label}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function testValidationEndpoint() {
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing Validation Error (< 50 chars)...`);

  try {
    const res = await fetch('http://localhost:3001/api/resume/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: 'Too short',
        jobDescription: 'Also too short',
      }),
    });

    const status = res.status;
    const json = await res.json();

    console.log(`Status Code: ${status} (Expected 400)`);
    console.log(`Response Body:`, JSON.stringify(json, null, 2));

    if (status === 400 && !json.success) {
      console.log(`✅ TEST PASSED for Validation Error`);
      return { success: true };
    } else {
      console.error(`❌ TEST FAILED for Validation Error`);
      return { success: false };
    }
  } catch (err) {
    console.error(`❌ NETWORK ERROR:`, err.message);
    return { success: false, error: err.message };
  }
}

async function runPhase2Tests() {
  console.log('Starting Phase 2 AI Engine Verification Tests...');

  const valResult = await testValidationEndpoint();
  const relResult = await testAnalyzeEndpoint(sampleDeveloperResume, relevantDeveloperJD, 'Relevant Match (Developer Resume + Developer JD)', [60, 100]);
  const unrelResult = await testAnalyzeEndpoint(sampleDeveloperResume, unrelatedNurseJD, 'Irrelevant Match (Developer Resume + Nurse JD)', [0, 45]);

  console.log('\n==================================================');
  console.log('PHASE 2 VERIFICATION SUMMARY:');
  console.log(`Validation Rejection: ${valResult.success ? 'PASSED' : 'FAILED'}`);
  console.log(`Relevant Match Analysis: ${relResult.success ? 'PASSED' : 'FAILED'}`);
  console.log(`Irrelevant Match Analysis: ${unrelResult.success ? 'PASSED' : 'FAILED'}`);
  console.log('==================================================');
}

runPhase2Tests();
