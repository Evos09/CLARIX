/* ==========================================================================
   CLARIX — Site JS
   ========================================================================== */

// ---- Sticky nav style swap on scroll ----
const nav = document.querySelector('.nav');
function onScroll() {
  if (!nav) return;
  if (window.scrollY > 8) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- Scroll reveal ----
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

// ---- FAQ accordion ----
document.querySelectorAll('.faq__item').forEach((item) => {
  const q = item.querySelector('.faq__q');
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq__item.is-open').forEach((other) => {
      if (other !== item) other.classList.remove('is-open');
    });
    item.classList.toggle('is-open', !isOpen);
  });
});

// ---- Billing toggle (Pricing) ----
const billingBtns = document.querySelectorAll('.billing-toggle .tabs__btn');
billingBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    billingBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const period = btn.dataset.period;
    document.querySelectorAll('[data-monthly][data-annual]').forEach((el) => {
      const v = el.dataset[period];
      if (v) el.textContent = v;
    });
  });
});

// ---- Tabs (Blog filter) ----
document.querySelectorAll('[data-tabs]').forEach((group) => {
  const btns = group.querySelectorAll('.tabs__btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll(`[data-filter-target]`);
      cards.forEach((card) => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

// ---- Dropdowns ----
document.querySelectorAll('.dropdown').forEach((dd) => {
  const trigger = dd.querySelector('.dropdown__trigger');
  if (!trigger) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.dropdown.is-open').forEach((other) => {
      if (other !== dd) other.classList.remove('is-open');
    });
    dd.classList.toggle('is-open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown.is-open').forEach((dd) => dd.classList.remove('is-open'));
});

// ---- Demo: animated waveform bars stagger ----
document.querySelectorAll('.hv__waveform span').forEach((bar, i) => {
  bar.style.animationDelay = `${(i % 14) * 0.07}s`;
  bar.style.height = `${6 + Math.abs(Math.sin(i * 0.7)) * 24}px`;
});

// ---- Voice mode orb bars stagger ----
const orbBars = document.querySelectorAll('.orb__bars span');
orbBars.forEach((bar, i) => {
  bar.style.animationDelay = `${i * 0.08}s`;
  const baseH = 20 + Math.sin(i * 0.5) * 18;
  bar.style.height = `${baseH}px`;
});

// ---- Smooth scroll for in-page links ----
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    const t = document.querySelector(href);
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Demo record button toggle (visual only) ----
document.querySelectorAll('[data-record-demo]').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('is-recording');
  });
});

// ---- Insta-Demo drag-and-drop file upload ----
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('demoFileInput');
const card = document.getElementById('instaDemoCard');
const progressContainer = document.getElementById('uploadProgressContainer');
const progressBar = document.getElementById('uploadProgressFill');
const percentageText = document.getElementById('uploadPercentageText');
const statusText = document.getElementById('uploadStatusText');
const errorDiv = document.getElementById('uploadError');

if (dropZone && fileInput) {
  // Prevent defaults for drag events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('is-dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('is-dragover'), false);
  });

  dropZone.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) handleFile(files[0]);
  });

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });
}

function handleFile(file) {
  if (!file) return;
  
  // Hide error
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';
  
  // Validate size (15MB limit)
  const MAX_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showError('That file is too large. The demo maximum is 15 MB. Please sign up to upload larger files.');
    return;
  }

  // Show progress and hide dropzone
  dropZone.style.display = 'none';
  progressContainer.style.display = 'block';
  updateProgress(0, 'Preparing upload...');

  // Start upload pipeline
  uploadPipeline(file);
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
  dropZone.style.display = 'flex';
  progressContainer.style.display = 'none';
}

function updateProgress(pct, status) {
  progressBar.style.width = `${pct}%`;
  percentageText.textContent = `${pct}%`;
  if (status) statusText.textContent = status;
}

async function uploadPipeline(file) {
  try {
    // 1. Get signed upload URL
    updateProgress(5, 'Signing upload...');
    const signRes = await fetch('/api/public/demo/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size })
    });
    
    if (!signRes.ok) {
      const errData = await signRes.json().catch(() => ({}));
      throw new Error(errData.error || 'Could not start upload signature');
    }
    
    const { path, signedUrl } = await signRes.json();
    
    // 2. Upload file with progress
    updateProgress(10, 'Uploading to storage...');
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      if (file.type) xhr.setRequestHeader('Content-Type', file.type);
      xhr.setRequestHeader('x-upsert', 'true');
      
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 75) + 10; // scale progress from 10% to 85%
          updateProgress(pct, 'Uploading recording...');
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Storage upload failed (${xhr.status})`));
      };
      
      xhr.onerror = () => reject(new Error('Network error during storage upload'));
      xhr.send(file);
    });

    // 3. Create meeting row and trigger transcription
    updateProgress(90, 'Starting analysis...');
    const createRes = await fetch('/api/public/demo/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        meetingType: 'GENERAL',
        autoDetect: true,
        storagePath: path,
        audioSize: file.size,
        audioFilename: file.name
      })
    });
    
    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to initialize meeting transcript');
    }
    
    const meeting = await createRes.json();
    updateProgress(100, 'Redirecting to results...');
    
    // Store demo meeting ID in a cookie for claiming later
    document.cookie = `clarix_demo_meeting_id=${meeting.id}; path=/; max-age=604800; SameSite=Lax`;

    // Redirect to demo details page
    window.location.href = `/demo/${meeting.id}`;
  } catch (err) {
    showError(err.message || 'An error occurred during upload. Please try again.');
  }
}

// ---- Interactive Document Sandbox Demo ----
const tab1 = document.getElementById('tab1');
const tab2 = document.getElementById('tab2');
const tab3 = document.getElementById('tab3');
const tab4 = document.getElementById('tab4');

const step1 = document.getElementById('step1Content');
const step2 = document.getElementById('step2Content');
const step3 = document.getElementById('step3Content');
const step4 = document.getElementById('step4Content');

const startScanBtn = document.getElementById('startScanBtn');
const nextDemoBtn = document.getElementById('nextDemoBtn');
const resetDemoBtn = document.getElementById('resetDemoBtn');

const scanStatus = document.getElementById('scanStatus');
const scanPct = document.getElementById('scanPct');
const scanBar = document.getElementById('scanBar');
const scanLogs = document.getElementById('scanLogs');

if (startScanBtn && step1 && step2 && step3 && step4) {
  const tabs = [tab1, tab2, tab3, tab4];
  const steps = [step1, step2, step3, step4];

  function showStep(idx) {
    steps.forEach((step, i) => {
      step.style.display = i === idx ? (idx === 2 ? 'grid' : 'flex') : 'none';
    });
    tabs.forEach((tab, i) => {
      if (!tab) return;
      if (i === idx) {
        tab.style.fontWeight = '700';
        tab.style.color = 'var(--violet-400)';
        tab.style.background = 'var(--paper-2)';
      } else {
        tab.style.fontWeight = '500';
        tab.style.color = 'var(--gray-500)';
        tab.style.background = 'transparent';
      }
    });
  }

  const logs = [
    'Initializing OCR engines...',
    'Extracting semantic PDF layers...',
    'Running clause classification model...',
    'Parsing Section 8: Indemnification Clause...',
    'Flagging: Section 8.2 Unlimited Indemnification liability...',
    'Parsing Section 9.1: Termination notice periods...',
    'Flagging: Short termination notice clause (15 days)...',
    'Synthesizing risk assessment report...',
    'Done. Report ready.'
  ];

  startScanBtn.addEventListener('click', () => {
    showStep(1); // Go to step 2 (scanning)
    
    let pct = 0;
    scanBar.style.width = '0%';
    scanPct.textContent = '0%';
    scanLogs.innerHTML = '';
    
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logs.length) {
        const logLine = document.createElement('div');
        logLine.textContent = `> ${logs[logIndex]}`;
        scanLogs.appendChild(logLine);
        scanLogs.scrollTop = scanLogs.scrollHeight;
        logIndex++;
      }
    }, 300);

    const interval = setInterval(() => {
      pct += 4;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        clearInterval(logInterval);
        setTimeout(() => {
          showStep(2); // Go to step 3 (highlights)
        }, 400);
      }
      scanBar.style.width = `${pct}%`;
      scanPct.textContent = `${pct}%`;
      if (pct < 30) scanStatus.textContent = 'Parsing document structure...';
      else if (pct < 70) scanStatus.textContent = 'Classifying clauses & checking liability...';
      else scanStatus.textContent = 'Structuring risk scorecard...';
    }, 120);
  });

  nextDemoBtn.addEventListener('click', () => {
    showStep(3); // Go to step 4 (insights)
  });

  resetDemoBtn.addEventListener('click', () => {
    showStep(0); // Go back to step 1
  });
}

