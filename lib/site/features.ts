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
        <li><a class="nav__link" href="/features" style="color: var(--violet-400); background: rgba(0, 242, 254, 0.08);">Features</a></li>
        <li><a class="nav__link" href="/meeting-types">Document Types</a></li>
        <li><a class="nav__link" href="/pricing">Pricing</a></li>
        <li><a class="nav__link" href="/integrations">Integrations</a></li>
      </ul>
      <div class="nav__cta">
        <a class="nav__signin" href="/sign-in">Sign In</a>
        <a class="btn btn--accent btn--sm" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none;">Start Free Analysis</a>
      </div>
    </div>
  </nav>

  <!-- ====================== HERO ====================== -->
  <section class="section" style="padding-top: calc(var(--nav-h) + var(--sp-20)); padding-bottom: var(--sp-12); background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 242, 254, 0.08), transparent 70%), var(--paper);">
    <div class="container container--narrow text-center" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      <span class="eyebrow" style="background: rgba(0, 242, 254, 0.08); color: var(--violet-400); border-color: rgba(0, 242, 254, 0.25);">Features Overview</span>
      <h1 style="margin-top: var(--sp-5); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; color: var(--ink);">Precision engines for <span style="background: linear-gradient(120deg, #00F2FE, #00D2DD); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">document analysis.</span></h1>
      <p style="margin-top: var(--sp-6); font-size: var(--fs-lg); color: var(--gray-600); line-height: 1.55; max-width: 680px;">Clarix is engineered for risk isolation. From optical character recognition (OCR) and clause classification to compliance checks, we provide structural clarity across your document inventory.</p>
      <div style="display:inline-flex; gap: var(--sp-3); margin-top: var(--sp-8); flex-wrap: wrap; justify-content: center;">
        <a class="btn btn--primary btn--lg" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 14px 28px;">Start Free Analysis</a>
        <a class="btn btn--secondary btn--lg" href="/pricing" style="background: rgba(255, 255, 255, 0.05); color: var(--ink); border: 1px solid rgba(255, 255, 255, 0.1); padding: 14px 28px;">See Pricing</a>
      </div>
    </div>
  </section>

  <!-- ====================== FEATURE GRID NAV ====================== -->
  <section class="section--tight">
    <div class="container">
      <div class="grid grid-4 reveal" style="gap: var(--sp-4);">
        <a href="#parsing" class="card card--feature card--hover" style="text-align:left; padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md);">
          <div class="feature-card__icon" style="font-size: 24px; margin-bottom: 8px;">📑</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Document Ingestion & OCR</h4>
        </a>
        <a href="#rules" class="card card--feature card--hover" style="text-align:left; padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md);">
          <div class="feature-card__icon" style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Custom Risk Rules</h4>
        </a>
        <a href="#query" class="card card--feature card--hover" style="text-align:left; padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md);">
          <div class="feature-card__icon" style="font-size: 24px; margin-bottom: 8px;">💬</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Semantic Chat & Audit</h4>
        </a>
        <a href="#integrations" class="card card--feature card--hover" style="text-align:left; padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md);">
          <div class="feature-card__icon" style="font-size: 24px; margin-bottom: 8px;">⚙️</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Workflow Integrations</h4>
        </a>
      </div>
    </div>
  </section>

  <!-- ====================== SECTION: INGESTION ====================== -->
  <section class="section" id="parsing">
    <div class="container">
      <div class="deep-dive reveal" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8); align-items: center; border-top: 1px solid var(--gray-100); padding-top: var(--sp-12);">
        <div>
          <div class="deep-dive__label" style="color: var(--violet-400); font-weight: 600; text-transform: uppercase; font-size: var(--fs-xs); display: flex; align-items: center; gap: 8px;">
            <span>📄</span> Document Ingestion
          </div>
          <h2 class="deep-dive__title" style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink); margin-top: var(--sp-3);">Ingest and parse any business document.</h2>
          <p class="deep-dive__desc" style="color: var(--gray-505); margin-top: var(--sp-3); font-size: var(--fs-sm); line-height: 1.6;">Our advanced ingestion layer parses clean PDFs, scanned contract images, spreadsheets, and invoices. Optical Character Recognition (OCR) recovers structural columns, metadata, and signatures with absolute precision.</p>
          <ul class="deep-dive__bullets" style="list-style: none; padding: 0; margin-top: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-sm); color: var(--gray-700);">
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Multi-page processing</strong>Audits 100+ page contracts in under 30 seconds.</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Tabular data extraction</strong>Parses line items from financial invoices and spreadsheets.</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Diarized signature detection</strong>Flags missing signer names, witness blocks, or execution dates.</div></li>
          </ul>
        </div>
        <div style="background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-lg); padding: var(--sp-5); font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--gray-500); display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
          <div>[system] initializing secure parser...</div>
          <div>[system] file detected: MSA_Contract_Draft.pdf (6.4 MB)</div>
          <div>[system] running page extraction (12 pages)</div>
          <div style="color: var(--violet-400);">[OCR] table extracted: Net Payment Terms (Page 3) -> net_30</div>
          <div style="color: var(--rose);">[risk] warning: Section 14 (Liability) is uncapped.</div>
          <div>[system] risk scoring calculated: 78/100</div>
          <div>[system] ingestion complete.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== SECTION: RISK RULES ====================== -->
  <section class="section section--soft" id="rules">
    <div class="container">
      <div class="deep-dive deep-dive--reverse reveal" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8); align-items: center; border-top: 1px solid var(--gray-100); padding-top: var(--sp-12);">
        <div>
          <div class="deep-dive__label" style="color: var(--violet-400); font-weight: 600; text-transform: uppercase; font-size: var(--fs-xs); display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span> Custom Risk Rules
          </div>
          <h2 class="deep-dive__title" style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink); margin-top: var(--sp-3);">Define your compliance criteria.</h2>
          <p class="deep-dive__desc" style="color: var(--gray-505); margin-top: var(--sp-3); font-size: var(--fs-sm); line-height: 1.6;">Don't rely on generic LLM definitions of risk. Define custom rules based on your team's legal templates, procurement guidelines, or risk tolerances. Clarix will automatically scan incoming docs against those policies.</p>
          <ul class="deep-dive__bullets" style="list-style: none; padding: 0; margin-top: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-sm); color: var(--gray-700);">
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Custom policies</strong>Scan for specific terms (e.g. governing law must be Delaware).</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Risk weighting</strong>Assign risk priorities (High, Medium, Low) to specific clauses.</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Pre-approved clauses</strong>Maintain a clause bank to instantly suggest redline replacements.</div></li>
          </ul>
        </div>
        <div style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg); padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4);">
          <div style="font-size: var(--fs-sm); font-weight: 700; color: var(--ink);">Workspace Policy Editor</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-xs);">
            <div style="padding: 10px; background: rgba(0, 242, 254, 0.05); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: var(--r-md); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; color: var(--ink);">Liability Cap Rule</div>
                <div style="color: var(--gray-500); font-size: 10px;">Flag if no cap exists or if cap exceeds 2x value</div>
              </div>
              <span style="background: var(--rose); color: var(--paper); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">HIGH RISK</span>
            </div>
            <div style="padding: 10px; border: 1px solid var(--gray-200); border-radius: var(--r-md); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; color: var(--ink);">Governing Law Check</div>
                <div style="color: var(--gray-500); font-size: 10px;">Flag if state is outside DE, NY, or CA</div>
              </div>
              <span style="background: var(--amber); color: var(--paper); padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">MEDIUM RISK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== SECTION: CHAT ====================== -->
  <section class="section" id="query">
    <div class="container">
      <div class="deep-dive reveal" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8); align-items: center; border-top: 1px solid var(--gray-100); padding-top: var(--sp-12);">
        <div>
          <div class="deep-dive__label" style="color: var(--violet-400); font-weight: 600; text-transform: uppercase; font-size: var(--fs-xs); display: flex; align-items: center; gap: 8px;">
            <span>💬</span> Semantic Audit
          </div>
          <h2 class="deep-dive__title" style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink); margin-top: var(--sp-3);">Ask your documents anything.</h2>
          <p class="deep-dive__desc" style="color: var(--gray-505); margin-top: var(--sp-3); font-size: var(--fs-sm); line-height: 1.6;">Interact directly with single documents or search across your entire workspace. Find answers with direct citations to the source file and page numbers, enabling transparent verification.</p>
          <ul class="deep-dive__bullets" style="list-style: none; padding: 0; margin-top: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-sm); color: var(--gray-700);">
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Citations</strong>Every response highlights the exact clause and page number.</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Cross-document queries</strong>"Which agreements auto-renew in Q3?"</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Action summaries</strong>Draft follow-ups or redlines based on chat output.</div></li>
          </ul>
        </div>
        <div style="background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-lg); padding: var(--sp-5);">
          <div class="chat" style="display: flex; flex-direction: column; gap: var(--sp-4);">
            <div class="chat__msg chat__msg--user" style="display: flex; justify-content: flex-end; gap: var(--sp-3);">
              <div style="background: rgba(0, 242, 254, 0.08); padding: 10px; border-radius: var(--r-md); font-size: var(--fs-xs); color: var(--ink); border: 1px solid rgba(0, 242, 254, 0.15);">Are there any auto-renewal clauses in the active contracts?</div>
            </div>
            <div class="chat__msg chat__msg--clarix" style="display: flex; gap: var(--sp-3);">
              <div style="background: var(--paper-2); padding: 10px; border-radius: var(--r-md); font-size: var(--fs-xs); color: var(--ink); border: 1px solid var(--gray-200); line-height: 1.5;">
                Yes, <strong>2 agreements</strong> contain auto-renewal clauses:
                <ul style="margin: 6px 0 0 16px; padding: 0;">
                  <li><strong>MSA_Draft_v4.pdf (Page 6)</strong>: Auto-renews unless notified 15 days prior.</li>
                  <li><strong>Vendor_Agreement_Acme.pdf (Page 12)</strong>: Auto-renews annually.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== SECTION: INTEGRATIONS ====================== -->
  <section class="section section--soft" id="integrations">
    <div class="container">
      <div class="deep-dive deep-dive--reverse reveal" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8); align-items: center; border-top: 1px solid var(--gray-100); padding-top: var(--sp-12);">
        <div>
          <div class="deep-dive__label" style="color: var(--violet-400); font-weight: 600; text-transform: uppercase; font-size: var(--fs-xs); display: flex; align-items: center; gap: 8px;">
            <span>⚙️</span> Integrations
          </div>
          <h2 class="deep-dive__title" style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink); margin-top: var(--sp-3);">Integrate with where your documents live.</h2>
          <p class="deep-dive__desc" style="color: var(--gray-505); margin-top: var(--sp-3); font-size: var(--fs-sm); line-height: 1.6;">Clarix connects seamlessly with your file servers and operations hubs, automatically importing new incoming contracts, auditing invoices, and outputting key risk score cards to your team channels.</p>
          <ul class="deep-dive__bullets" style="list-style: none; padding: 0; margin-top: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-sm); color: var(--gray-700);">
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Cloud storage</strong>Sync with Google Drive, Box, OneDrive, and SharePoint.</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>CRMs & Workflows</strong>Push contract metrics directly to Salesforce or HubSpot deals.</div></li>
            <li style="display: flex; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400); flex-shrink: 0;"><path d="M20 6L9 17l-5-5"/></svg><div><strong>Slack alerts</strong>Get instant notifications when a high-risk contract is detected.</div></li>
          </ul>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3);">
          <div class="integration-card" style="background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-4); text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">📂</div>
            <div style="font-weight: 600; color: var(--ink); font-size: var(--fs-xs);">Google Drive</div>
          </div>
          <div class="integration-card" style="background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-4); text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">📦</div>
            <div style="font-weight: 600; color: var(--ink); font-size: var(--fs-xs);">Box</div>
          </div>
          <div class="integration-card" style="background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-4); text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">💼</div>
            <div style="font-weight: 600; color: var(--ink); font-size: var(--fs-xs);">Salesforce</div>
          </div>
          <div class="integration-card" style="background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-4); text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">💬</div>
            <div style="font-weight: 600; color: var(--ink); font-size: var(--fs-xs);">Slack</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== FINAL CTA ====================== -->
  <section class="section">
    <div class="container" style="display: flex; flex-direction: column; align-items: center;">
      <div class="cta reveal" style="text-align: center; max-width: 800px; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); background: radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.05), transparent 70%), var(--gray-25); border: 1px solid var(--gray-200); padding: var(--sp-12) var(--sp-6); border-radius: var(--r-xl); width: 100%;">
        <h2 style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Start auditing your agreements.</h2>
        <p style="font-size: var(--fs-base); color: var(--gray-505); line-height: 1.5; max-width: 580px;">Ingest contracts, parse operational documentation, and calculate risk parameters in under 60 seconds.</p>
        <div class="cta__actions" style="margin-top: var(--sp-4);">
          <a class="btn btn--primary btn--xl" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 16px 36px;">
            Start Free Analysis
            <svg class="btn__icon btn__icon--arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== FOOTER ====================== -->
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
