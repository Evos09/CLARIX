export const HTML = `
  <!-- ====================== NAV ====================== -->
  <nav class="nav nav--solid-on-dark nav--on-dark">
    <div class="container nav__inner">
      <a href="/" class="nav__brand">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" style="border-radius:8px;display:block">
          <rect width="32" height="32" rx="8" fill="#00F2FE"/>
          <path d="M22.89 10.21 A9 9 0 1 0 22.89 21.79" fill="none" stroke="#05050A" stroke-width="5" stroke-linecap="round"/>
        </svg>
        <span style="color: var(--ink); font-weight: 700; letter-spacing: -0.03em;">CLARIX</span>
      </a>
      <ul class="nav__links">
        <li><a class="nav__link" href="/features">Features</a></li>
        <li><a class="nav__link" href="/meeting-types">Document Types</a></li>
        <li><a class="nav__link" href="/pricing">Pricing</a></li>
        <li><a class="nav__link" href="/integrations" style="color: var(--violet-400); background: rgba(0, 242, 254, 0.08);">Integrations</a></li>
      </ul>
      <div class="nav__cta">
        <a class="nav__signin" href="/sign-in">Sign In</a>
        <a class="btn btn--accent btn--sm" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none;">Start Free Analysis</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="section" style="padding-top: calc(var(--nav-h) + var(--sp-20)); padding-bottom: var(--sp-12); background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 242, 254, 0.08), transparent 70%), var(--paper);">
    <div class="container container--narrow text-center" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      <span class="eyebrow" style="background: rgba(0, 242, 254, 0.08); color: var(--violet-400); border-color: rgba(0, 242, 254, 0.25);">Workflows Connected</span>
      <h1 style="margin-top: var(--sp-5); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; color: var(--ink);">Clarix lives where <span style="background: linear-gradient(120deg, #00F2FE, #00D2DD); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">your documents</span> already live.</h1>
      <p style="margin-top: var(--sp-6); font-size: var(--fs-lg); color: var(--gray-600); line-height: 1.55; max-width: 680px;">Connect your cloud drives, communication platforms, and CRMs. Clarix automates ingestion, analysis, and risk reporting directly in your current workflows.</p>
    </div>
  </section>

  <!-- INTEGRATION GRID -->
  <section class="section">
    <div class="container">
      <div class="section-heading reveal" style="text-align: center; margin-bottom: var(--sp-10);">
        <span class="eyebrow eyebrow--neutral">Connectors list</span>
        <h2>Integrated systems.</h2>
      </div>

      <div class="grid grid-4 reveal" style="gap: var(--sp-6);">
        <div class="integration-card" style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-5); text-align: center; display: flex; flex-direction: column; gap: var(--sp-2); align-items: center;">
          <div style="font-size: 32px;">📂</div>
          <div style="font-weight: 700; color: var(--ink); font-size: var(--fs-base);">Google Drive</div>
          <div style="font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.5;">Auto-monitor shared folders to ingest and analyze new contracts.</div>
          <span style="background: rgba(0, 242, 254, 0.1); color: var(--violet-400); font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Pro Plan</span>
        </div>
        <div class="integration-card" style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-5); text-align: center; display: flex; flex-direction: column; gap: var(--sp-2); align-items: center;">
          <div style="font-size: 32px;">📦</div>
          <div style="font-weight: 700; color: var(--ink); font-size: var(--fs-base);">Box</div>
          <div style="font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.5;">Secure box integrations for enterprise contract risk analysis.</div>
          <span style="background: rgba(0, 242, 254, 0.1); color: var(--violet-400); font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Pro Plan</span>
        </div>
        <div class="integration-card" style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-5); text-align: center; display: flex; flex-direction: column; gap: var(--sp-2); align-items: center;">
          <div style="font-size: 32px;">💬</div>
          <div style="font-weight: 700; color: var(--ink); font-size: var(--fs-base);">Slack</div>
          <div style="font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.5;">Post risk scorecard summaries and legal action items to slack channels.</div>
          <span style="background: rgba(0, 242, 254, 0.1); color: var(--violet-400); font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Starter Plan</span>
        </div>
        <div class="integration-card" style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-5); text-align: center; display: flex; flex-direction: column; gap: var(--sp-2); align-items: center;">
          <div style="font-size: 32px;">💼</div>
          <div style="font-weight: 700; color: var(--ink); font-size: var(--fs-base);">Salesforce CRM</div>
          <div style="font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.5;">Link parsed contract fields and key metadata to opportunity objects.</div>
          <span style="background: rgba(0, 242, 254, 0.1); color: var(--violet-400); font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Business Plan</span>
        </div>
      </div>
    </div>
  </section>

  <!-- BOTTOM CTA -->
  <section class="section">
    <div class="container" style="display: flex; flex-direction: column; align-items: center;">
      <div class="cta reveal" style="text-align: center; max-width: 800px; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); background: var(--gray-25); border: 1px solid var(--gray-200); padding: var(--sp-12) var(--sp-6); border-radius: var(--r-xl); width: 100%;">
        <h2>Integrate Clarix into your system.</h2>
        <p>OAuth-based integrations setups require no custom software engineering.</p>
        <div class="cta__actions" style="margin-top: var(--sp-4);">
          <a class="btn btn--primary btn--xl" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 16px 36px;">
            Start Free Analysis
            <svg class="btn__icon btn__icon--arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer" style="border-top: 1px solid var(--gray-100); padding-top: var(--sp-16); padding-bottom: var(--sp-12);">
    <div class="container">
      <div class="footer__top" style="display: grid; grid-template-columns: 2fr repeat(4, 1fr); gap: var(--sp-8); margin-bottom: var(--sp-12);">
        <div class="footer__brand-block" style="display: flex; flex-direction: column; gap: var(--sp-4);">
          <a href="/" class="nav__brand" style="color: var(--ink);">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" style="border-radius:8px;display:block">
              <rect width="32" height="32" rx="8" fill="#00F2FE"/>
              <path d="M22.89 10.21 A9 9 0 1 0 22.89 21.79" fill="none" stroke="#05050A" stroke-width="5" stroke-linecap="round"/>
            </svg>
            <span style="font-weight: 700; letter-spacing: -0.03em;">CLARIX</span>
          </a>
          <p class="footer__tagline" style="font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.6;">AI-powered business intelligence and document risk analysis. Instantly scan contracts, reports, and invoices to protect operations.</p>
        </div>
        <div class="footer__col" style="display: flex; flex-direction: column; gap: var(--sp-3);">
          <h6 style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink); text-transform: uppercase;">Product</h6>
          <ul class="footer__list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-xs); color: var(--gray-500);">
            <li><a href="/features">Features</a></li>
            <li><a href="/meeting-types">Document Types</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/integrations">Integrations</a></li>
          </ul>
        </div>
        <div class="footer__col" style="display: flex; flex-direction: column; gap: var(--sp-3);">
          <h6 style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink); text-transform: uppercase;">Company</h6>
          <ul class="footer__list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-xs); color: var(--gray-500);">
            <li><a href="/sign-up">About</a></li>
            <li><a href="/sign-up">Careers</a></li>
          </ul>
        </div>
        <div class="footer__col" style="display: flex; flex-direction: column; gap: var(--sp-3);">
          <h6 style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink); text-transform: uppercase;">Resources</h6>
          <ul class="footer__list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-xs); color: var(--gray-500);">
            <li><a href="/sign-up">Help Center</a></li>
            <li><a href="/sign-up">API Docs</a></li>
            <li><a href="/sign-up">Status</a></li>
          </ul>
        </div>
        <div class="footer__col" style="display: flex; flex-direction: column; gap: var(--sp-3);">
          <h6 style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink); text-transform: uppercase;">Legal</h6>
          <ul class="footer__list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-xs); color: var(--gray-500);">
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/hipaa">HIPAA</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom" style="display: flex; justify-content: space-between; border-top: 1px solid var(--gray-100); padding-top: var(--sp-6); font-size: 11px; color: var(--gray-500);">
        <span>© 2026 CLARIX, Inc. All rights reserved.</span>
      </div>
    </div>
  </footer>
`;
