import fs from 'fs';

const content = fs.readFileSync('app/planes/page.tsx', 'utf-8');
const lines = content.split('\n');

let balance = 0;
let inViewer = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('const CurriculumViewer =')) inViewer = true;
  if (!inViewer) continue;
  
  // Count only non-self-closing opening divs
  // This is a rough approximation but better than before
  const openDivs = (line.match(/<div(?![^>]*\/>)/g) || []).length;
  const closeDivs = (line.match(/<\/div>/g) || []).length;
  
  balance += openDivs;
  balance -= closeDivs;
  
  console.log(`${i + 1}: Balance: ${balance} | ${line.trim()}`);
}
