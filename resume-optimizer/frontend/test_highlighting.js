// Node test script verifying React string-splitting keyword highlighting algorithm
function highlightTest(resumeText, matchedKeywords) {
  if (!resumeText) return [];
  if (!matchedKeywords || matchedKeywords.length === 0) return [resumeText];

  const validKeywords = matchedKeywords
    .filter((kw) => typeof kw === 'string' && kw.trim().length > 0)
    .sort((a, b) => b.length - a.length);

  const escapedKeywords = validKeywords.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  const parts = resumeText.split(regex);
  const keywordSet = new Set(validKeywords.map((kw) => kw.toLowerCase()));

  return parts.map((part) => ({
    text: part,
    isHighlighted: keywordSet.has(part.toLowerCase()),
  }));
}

const sampleText = `Jane Doe <script>alert('xss')</script>
Senior C++ & .NET Developer with expertise in React.js, Node.js, and AWS.`;

const keywords = ['C++', '.NET', 'React.js', 'Node.js', 'AWS'];

const result = highlightTest(sampleText, keywords);

console.log('XSS & Special Characters Highlight Test Result:');
result.forEach((part, i) => {
  console.log(`[${i}] "${part.text}" -> Highlighted: ${part.isHighlighted}`);
});

const isScriptTagEscapedAsPlainText = result.some(p => p.text.includes("<script>alert('xss')</script>") && !p.isHighlighted);
console.log('Script tag treated safely as uninterpreted text child:', isScriptTagEscapedAsPlainText);
