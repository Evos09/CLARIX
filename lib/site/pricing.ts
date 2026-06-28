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
        <li><a class="nav__link" href="/pricing" style="color: var(--violet-400); background: rgba(0, 242, 254, 0.08);">Pricing</a></li>
        <li><a class="nav__link" href="/integrations">Integrations</a></li>
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
      <span class="eyebrow" style="background: rgba(0, 242, 254, 0.08); color: var(--violet-400); border-color: rgba(0, 242, 254, 0.25);">Value & ROI Pricing</span>
      <h1 style="margin-top: var(--sp-5); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; color: var(--ink);">Pay for audits. <span style="background: linear-gradient(120deg, #00F2FE, #00D2DD); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Not manual time.</span></h1>
      <p style="margin-top: var(--sp-6); font-size: var(--fs-lg); color: var(--gray-600); line-height: 1.55; max-width: 680px;">Start auditing your agreements for free. Upgrade when your volume grows, or when you need custom compliance checks and enterprise workspaces.</p>
    </div>
  </section>

  <!-- PLAN CARDS -->
  <section class="section--tight">
    <div class="container">
      <div class="grid grid-3 reveal" style="align-items: stretch; gap: var(--sp-6);">
        <!-- STARTER -->
        <div class="plan" style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg); padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-5);">
          <div>
            <div class="plan__name" style="font-size: var(--fs-lg); font-weight: 700; color: var(--ink);">Starter</div>
            <div class="plan__price" style="margin-top: var(--sp-2);">
              <span class="plan__amount" style="font-size: var(--fs-4xl); font-weight: 800; color: var(--ink);">$19</span>
              <span class="plan__period" style="font-size: var(--fs-xs); color: var(--gray-500);">/ mo</span>
            </div>
            <p style="font-size: var(--fs-xs); color: var(--gray-500); margin-top: var(--sp-2);">For small operations teams and founders auditing incoming vendor documents.</p>
          </div>
          <ul class="plan__features" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-xs); color: var(--gray-700);">
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Up to 50 documents / mo</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Standard Risk Audit models</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> PDF, DOCX support</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Email integration</li>
          </ul>
          <a class="btn btn--secondary btn--full" href="/sign-up" style="background: rgba(255, 255, 255, 0.05); color: var(--ink); border: 1px solid rgba(255, 255, 255, 0.1); margin-top: auto; text-align: center;">Get Started Free</a>
        </div>

        <!-- PRO -->
        <div class="plan plan--featured" style="background: var(--paper-2); border: 2px solid var(--violet-400); border-radius: var(--r-lg); padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-5); position: relative; box-shadow: 0 0 40px rgba(0, 242, 254, 0.05);">
          <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--violet-400); color: var(--paper); font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 10px; border-radius: var(--r-full); letter-spacing: 0.05em;">Most Popular</span>
          <div>
            <div class="plan__name" style="font-size: var(--fs-lg); font-weight: 700; color: var(--ink);">Pro</div>
            <div class="plan__price" style="margin-top: var(--sp-2);">
              <span class="plan__amount" style="font-size: var(--fs-4xl); font-weight: 800; color: var(--ink);">$49</span>
              <span class="plan__period" style="font-size: var(--fs-xs); color: var(--gray-500);">/ mo</span>
            </div>
            <p style="font-size: var(--fs-xs); color: var(--gray-500); margin-top: var(--sp-2);">For growing companies seeking custom analysis rules and unified workspace intelligence.</p>
          </div>
          <ul class="plan__features" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-xs); color: var(--gray-700);">
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> <strong>Unlimited documents</strong></li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Custom Risk Policy rules</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Cross-document semantic chat</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Notion, Slack, Drive integrations</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> CSV, JSON, DOCX report exports</li>
          </ul>
          <a class="btn btn--accent btn--full" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; margin-top: auto; text-align: center;">Start 14-Day Free Trial</a>
        </div>

        <!-- BUSINESS -->
        <div class="plan" style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg); padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-5);">
          <div>
            <div class="plan__name" style="font-size: var(--fs-lg); font-weight: 700; color: var(--ink);">Business</div>
            <div class="plan__price" style="margin-top: var(--sp-2);">
              <span class="plan__amount" style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Custom</span>
            </div>
            <p style="font-size: var(--fs-xs); color: var(--gray-500); margin-top: var(--sp-2);">For large institutions needing specialized security compliance and dedicated infrastructure.</p>
          </div>
          <ul class="plan__features" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--sp-3); font-size: var(--fs-xs); color: var(--gray-700);">
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Everything in Pro</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Dedicated model fine-tuning</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> SSO / SAML & Audit Logs</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg class="plan__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--violet-400);"><path d="M20 6L9 17l-5-5"/></svg> Dedicated Customer Success Manager</li>
          </ul>
          <a class="btn btn--primary btn--full" href="/sign-up" style="background: rgba(255, 255, 255, 0.05); color: var(--ink); border: 1px solid rgba(255, 255, 255, 0.1); margin-top: auto; text-align: center;">Contact Sales</a>
        </div>
      </div>
    </div>
  </section>

  <!-- COMPARISON TABLE -->
  <section class="section section--soft" style="border-top: 1px solid var(--gray-100); border-bottom: 1px solid var(--gray-100);">
    <div class="container">
      <div class="section-heading reveal" style="text-align: center; margin-bottom: var(--sp-10);">
        <span class="eyebrow eyebrow--neutral">Compare every feature</span>
        <h2>The full breakdown.</h2>
      </div>

      <div class="reveal" style="overflow-x: auto;">
      <table class="compare" style="width: 100%; border-collapse: collapse; text-align: left; font-size: var(--fs-xs);">
        <thead>
          <tr style="border-bottom: 1px solid var(--gray-200); background: var(--gray-50);">
            <th style="padding: 12px var(--sp-4);">Capabilities</th>
            <th style="padding: 12px var(--sp-4);">Starter</th>
            <th style="padding: 12px var(--sp-4); background: rgba(0, 242, 254, 0.05); color: var(--violet-400); font-weight: 700;">Pro</th>
            <th style="padding: 12px var(--sp-4);">Business</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--gray-100);"><td class="col-feature" style="padding: 12px var(--sp-4);"><strong>Document Quota / mo</strong></td><td>50</td><td style="background: rgba(0, 242, 254, 0.05);"><strong>Unlimited</strong></td><td>Unlimited</td></tr>
          <tr style="border-bottom: 1px solid var(--gray-100);"><td class="col-feature" style="padding: 12px var(--sp-4);"><strong>File Types</strong></td><td>PDF, DOCX, CSV</td><td style="background: rgba(0, 242, 254, 0.05);">All Types</td><td>All + Scans & OCR</td></tr>
          <tr style="border-bottom: 1px solid var(--gray-100);"><td class="col-feature" style="padding: 12px var(--sp-4);"><strong>Risk Audit Classification</strong></td><td>Standard</td><td style="background: rgba(0, 242, 254, 0.05);">Custom Rules</td><td>Enterprise Fine-tuning</td></tr>
          <tr style="border-bottom: 1px solid var(--gray-100);"><td class="col-feature" style="padding: 12px var(--sp-4);"><strong>Semantic Chat Query</strong></td><td>❌</td><td style="background: rgba(0, 242, 254, 0.05);">✅ Yes</td><td>✅ Yes</td></tr>
          <tr style="border-bottom: 1px solid var(--gray-100);"><td class="col-feature" style="padding: 12px var(--sp-4);"><strong>Slack / Notion / Drive</strong></td><td>Slack Alerts</td><td style="background: rgba(0, 242, 254, 0.05);">✅ Full Sync</td><td>✅ Full Sync</td></tr>
          <tr style="border-bottom: 1px solid var(--gray-100);"><td class="col-feature" style="padding: 12px var(--sp-4);"><strong>Audit Logs & SSO</strong></td><td>❌</td><td style="background: rgba(0, 242, 254, 0.05);">❌</td><td>✅ Yes</td></tr>
        </tbody>
      </table>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section">
    <div class="container container--narrow">
      <div class="section-heading reveal" style="text-align: center; margin-bottom: var(--sp-10);">
        <span class="eyebrow"><span class="eyebrow__dot" style="background: var(--violet-400);"></span>FAQ</span>
        <h2>Frequently asked questions.</h2>
      </div>

      <div class="faq reveal" style="display: flex; flex-direction: column; gap: var(--sp-4);">
        <div class="faq__item is-open" style="border: 1px solid var(--gray-200); border-radius: var(--r-md); overflow: hidden;">
          <button class="faq__q" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: var(--sp-4) var(--sp-5); font-weight: 600; font-size: var(--fs-sm); color: var(--ink); text-align: left;">
            <span>How does the document limits work?</span>
          </button>
          <div class="faq__a" style="padding: 0 var(--sp-5) var(--sp-4); font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.6;">
            On the Starter plan, you can upload up to 50 documents every month. On Pro and Business, you can upload unlimited documents.
          </div>
        </div>

        <div class="faq__item" style="border: 1px solid var(--gray-200); border-radius: var(--r-md); overflow: hidden;">
          <button class="faq__q" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: var(--sp-4) var(--sp-5); font-weight: 600; font-size: var(--fs-sm); color: var(--ink); text-align: left;">
            <span>Are my legal documents secure?</span>
          </button>
          <div class="faq__a" style="padding: 0 var(--sp-5) var(--sp-4); font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.6;">
            Absolutely. Every file uploaded is isolated in your dedicated tenant instance, encrypted at rest and in transit, and never utilized to train AI models. We prioritize data isolation above all.
          </div>
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
