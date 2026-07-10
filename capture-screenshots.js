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
  console.log('Waiting 5s for Next.js to fully initialize API routes...');
  await delay(5000);

  // 2. Trigger sample meeting creation with retry
  console.log('Creating public demo meeting...');
  let meetingId = 'sample';
  
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      console.log(`POST attempt ${attempt}/6...`);
      const res = await fetch('http://localhost:3000/api/public/demo/meetings/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        meetingId = data.id;
        console.log('✓ Successfully created sample meeting with ID:', meetingId);
        break;
      } else {
        console.warn(`Failed attempt ${attempt}, status:`, res.status);
        if (attempt < 6) await delay(5000);
      }
    } catch (err) {
      console.error(`Error on attempt ${attempt}:`, err.message);
      if (attempt < 6) await delay(5000);
    }
  }

  // 3. Launch browser
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 4. Capture static pages
  const staticTargets = [
    { name: 'home', url: 'http://localhost:3000/' },
    { name: 'features', url: 'http://localhost:3000/features' },
    { name: 'pricing', url: 'http://localhost:3000/pricing' }
  ];

  for (const target of staticTargets) {
    console.log(`Capturing screenshot of ${target.name} from: ${target.url}`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await delay(2000);
      const filePath = path.join(outputDir, `${target.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✓ Saved screenshot: ${filePath}`);
    } catch (e) {
      console.error(`Failed to capture ${target.name}:`, e.message);
    }
  }

  // 5. Capture active meeting detail page & tabs
  const meetingUrl = `http://localhost:3000/demo/${meetingId}`;
  console.log('Navigating to unlocked demo details page:', meetingUrl);
  try {
    await page.goto(meetingUrl, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);
    
    // Screenshot 1: Summary / Dashboard tab
    let filePath = path.join(outputDir, 'meeting_summary.png');
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`✓ Saved meeting summary tab screenshot: ${filePath}`);

    // Click the Analytics tab
    console.log('Switching to Analytics tab...');
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.toUpperCase().includes('ANALYTICS')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    
    if (clicked) {
      console.log('Waiting for charts animation to complete...');
      await delay(3000);
      filePath = path.join(outputDir, 'meeting_analytics.png');
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✓ Saved meeting analytics tab screenshot: ${filePath}`);
    } else {
      console.warn('Analytics tab button was not found.');
    }

  } catch (e) {
    console.error('Failed to capture meeting details tabs:', e.message);
  }

  await browser.close();
  console.log('✓ All screens captured successfully.');
}

main().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
