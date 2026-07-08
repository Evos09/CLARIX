const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];

const outputDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\9e838ad2-a715-415f-b44b-a7730cad584a\\screenshots';

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Google Chrome executable was not found on your system.');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.status === 200 || res.status === 404 || res.status === 503) {
        console.log('✓ Next.js server is up and responsive.');
        return;
      }
    } catch (e) {}
    await delay(1000);
  }
  throw new Error('Timeout waiting for Next.js dev server on ' + url);
}

async function main() {
  const chromePath = findChrome();
  console.log('Using Chrome executable at:', chromePath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Wait for server
  await waitForServer('http://localhost:3000/');

  // 2. Trigger sample meeting creation
  console.log('Creating public demo meeting...');
  let meetingId = 'sample';
  try {
    const res = await fetch('http://localhost:3000/api/public/demo/meetings/sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      meetingId = data.id;
      console.log('✓ Successfully created sample meeting with ID:', meetingId);
    } else {
      console.warn('Failed to create sample meeting via API, status:', res.status);
    }
  } catch (err) {
    console.error('Error creating sample meeting:', err.message);
  }

  // 3. Launch browser
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const targets = [
    { name: 'home', url: 'http://localhost:3000/' },
    { name: 'features', url: 'http://localhost:3000/features' },
    { name: 'pricing', url: 'http://localhost:3000/pricing' },
    { name: 'demo_dashboard', url: `http://localhost:3000/demo/${meetingId}` }
  ];

  for (const target of targets) {
    console.log(`Capturing screenshot of ${target.name} from: ${target.url}`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      // Extra delay to let animations complete
      await delay(2000);
      const filePath = path.join(outputDir, `${target.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✓ Saved screenshot: ${filePath}`);
    } catch (e) {
      console.error(`Failed to capture ${target.name}:`, e.message);
    }
  }

  await browser.close();
  console.log('✓ All screens captured successfully.');
}

main().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
