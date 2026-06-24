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
