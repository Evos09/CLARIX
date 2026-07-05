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

  const trySampleBtn = document.getElementById('trySampleBtn');
  if (trySampleBtn) {
    trySampleBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent triggering dropZone file chooser popup
      dropZone.style.display = 'none';
      progressContainer.style.display = 'block';
      updateProgress(30, 'Generating sample meeting...');

      try {
        const res = await fetch('/api/public/demo/meetings/sample', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to generate sample meeting');
        const meeting = await res.json();
        updateProgress(100, 'Redirecting to results...');

        // Store demo meeting ID in a cookie for claiming later
        document.cookie = `clarix_demo_meeting_id=${meeting.id}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = `/demo/${meeting.id}`;
      } catch (err) {
        showError(err.message || 'Failed to create sample meeting. Please try again.');
      }
    });
  }
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

