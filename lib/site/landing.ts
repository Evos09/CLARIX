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
        <li><a class="nav__link" href="/integrations">Integrations</a></li>
      </ul>
      <div class="nav__cta">
        <a class="nav__signin" href="/sign-in">Sign In</a>
        <a class="btn btn--accent btn--sm" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none;">Start Free Analysis</a>
      </div>
    </div>
  </nav>

  <!-- ====================== HERO ====================== -->
  <section class="hero" style="padding-top: calc(var(--nav-h) + var(--sp-20)); padding-bottom: var(--sp-16); background: radial-gradient(circle at 50% 0%, rgba(0, 242, 254, 0.08), transparent 50%), var(--paper);">
    <div class="container hero__inner" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--sp-8);">
      <div class="hero__copy" style="max-width: 800px; display: flex; flex-direction: column; align-items: center;">
        <span class="eyebrow" style="background: rgba(0, 242, 254, 0.08); color: var(--violet-400); border-color: rgba(0, 242, 254, 0.25);">
          <span class="eyebrow__dot" style="background: var(--violet-400); box-shadow: 0 0 0 4px rgba(0, 242, 254, 0.25);"></span>
          Enterprise Document Intelligence
        </span>
        <h1 class="hero__title" style="margin-top: var(--sp-4); font-size: clamp(2.5rem, 5vw, 4.25rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; color: var(--ink);">
          Understand Business Documents <span style="background: linear-gradient(120deg, #00F2FE, #00D2DD); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">in Seconds</span>
        </h1>
        <p class="hero__sub" style="margin-top: var(--sp-6); font-size: var(--fs-md); color: var(--gray-600); line-height: 1.6; max-width: 680px;">
          Clarix uses AI to analyze contracts, reports, invoices, and operational documents to uncover risks, insights, and critical business information instantly.
        </p>
        <div class="hero__cta" style="margin-top: var(--sp-8); display: flex; gap: var(--sp-4); flex-wrap: wrap; justify-content: center;">
          <a class="btn btn--primary btn--lg" href="/sign-up" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 14px 28px;">
            Start Free Analysis
            <svg class="btn__icon btn__icon--arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
          <a class="btn btn--secondary btn--lg" href="#demo" style="background: rgba(255, 255, 255, 0.05); color: var(--ink); border: 1px solid rgba(255, 255, 255, 0.1); padding: 14px 28px;">
            View Live Demo
          </a>
        </div>
      </div>

      <!-- ====================== HERO VISUAL: DASHBOARD PREVIEW ====================== -->
      <div class="hero-visual reveal" style="width: 100%; max-width: 1100px; background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-lg); box-shadow: var(--sh-xl), 0 0 80px rgba(0, 242, 254, 0.05); overflow: hidden; display: flex; flex-direction: column; text-align: left;">
        <!-- Window Header -->
        <div style="background: var(--gray-50); border-bottom: 1px solid var(--gray-100); padding: var(--sp-3) var(--sp-5); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #EF4444; display: block;"></span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B; display: block;"></span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; display: block;"></span>
            <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--gray-500); margin-left: 12px;">doc_intelligence_v2.clarix</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="badge badge--complete" style="background: rgba(16, 185, 129, 0.1); color: var(--mint); border: 1px solid rgba(16, 185, 129, 0.2);"><span class="badge__dot" style="background: var(--mint);"></span>Analysis Complete</span>
          </div>
        </div>

        <!-- Dashboard Workspace -->
        <div style="display: grid; grid-template-columns: 240px 1fr 320px; min-height: 520px; background: var(--paper-2);">
          
          <!-- Left Panel: Document List -->
          <div style="border-right: 1px solid var(--gray-100); padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-4);">
            <div style="font-size: var(--fs-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500);">Workspace Files</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="padding: 10px; background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: var(--r-md); display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="font-size: var(--fs-lg);">📄</span>
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <div style="font-size: var(--fs-xs); font-weight: 600; color: var(--ink);">MSA_Draft_v4.pdf</div>
                  <div style="font-size: 10px; color: var(--gray-500);">Contract · 4.2 MB</div>
                </div>
              </div>
              <div style="padding: 10px; border: 1px solid transparent; border-radius: var(--r-md); display: flex; align-items: center; gap: 10px; cursor: pointer; transition: background 0.2s;">
                <span style="font-size: var(--fs-lg);">📊</span>
                <div>
                  <div style="font-size: var(--fs-xs); font-weight: 500; color: var(--gray-600);">Q2_Financials.xlsx</div>
                  <div style="font-size: 10px; color: var(--gray-500);">Spreadsheet · 1.8 MB</div>
                </div>
              </div>
              <div style="padding: 10px; border: 1px solid transparent; border-radius: var(--r-md); display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="font-size: var(--fs-lg);">🧾</span>
                <div>
                  <div style="font-size: var(--fs-xs); font-weight: 500; color: var(--gray-600);">Inv_8204_Unpaid.pdf</div>
                  <div style="font-size: 10px; color: var(--gray-500);">Invoice · 820 KB</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Middle Panel: Document Viewer -->
          <div style="padding: var(--sp-6); overflow-y: auto; display: flex; flex-direction: column; gap: var(--sp-5); max-height: 520px;">
            <div style="font-size: var(--fs-base); font-weight: 700; color: var(--ink); border-bottom: 1px solid var(--gray-100); padding-bottom: var(--sp-3);">Master Services Agreement (Draft)</div>
            
            <div style="font-family: var(--font-sans); font-size: var(--fs-sm); color: var(--gray-700); line-height: 1.7; display: flex; flex-direction: column; gap: var(--sp-4);">
              <p>This Master Services Agreement ("Agreement") is entered into as of the Effective Date by and between the parties.</p>
              
              <!-- Highlighted Clause -->
              <div style="background: rgba(244, 63, 94, 0.08); border-left: 3px solid var(--rose); padding: var(--sp-3) var(--sp-4); border-radius: 0 var(--r-md) var(--r-md) 0;">
                <strong style="color: var(--ink);">Section 8.2: Indemnification.</strong> The Service Provider agrees to indemnify, defend, and hold harmless the Customer, its affiliates, and officers from and against any and all claims, damages, liabilities, losses, and expenses arising out of or resulting from the performance of services under this Agreement.
              </div>

              <p><strong>Section 9.1: Term and Termination.</strong> Either party may terminate this Agreement at any time with or without cause by providing fifteen (15) days written notice to the other party.</p>
              
              <!-- Second Highlighted Clause -->
              <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--amber); padding: var(--sp-3) var(--sp-4); border-radius: 0 var(--r-md) var(--r-md) 0;">
                <strong>Section 10.4: Governing Law.</strong> This Agreement shall be governed by, and construed in accordance with, the laws of the State of Delaware, without giving effect to conflict of laws principles. Any legal action arising hereunder shall be brought in courts located in Wilmington, Delaware.
              </div>
            </div>
          </div>

          <!-- Right Panel: AI Insights -->
          <div style="border-left: 1px solid var(--gray-100); padding: var(--sp-4); background: var(--gray-25); display: flex; flex-direction: column; gap: var(--sp-4); overflow-y: auto; max-height: 520px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: var(--fs-xs); font-weight: 600; text-transform: uppercase; color: var(--gray-500);">Risk Analysis</span>
              <span style="font-size: var(--fs-xs); font-weight: 700; color: var(--rose); background: rgba(244, 63, 94, 0.1); padding: 2px 6px; border-radius: 4px;">74 / 100 Risk Score</span>
            </div>

            <!-- Risk Cards -->
            <div style="display: flex; flex-direction: column; gap: var(--sp-3);">
              <!-- High Risk -->
              <div style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-3); display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--rose); display: block;"></span>
                  <span style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink);">Uncapped Indemnification</span>
                </div>
                <p style="font-size: 11px; color: var(--gray-500); line-height: 1.4;">Section 8.2 has no cap on indemnification liability. This exposes the provider to unlimited financial claims.</p>
              </div>
              
              <!-- Medium Risk -->
              <div style="background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-md); padding: var(--sp-3); display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: block;"></span>
                  <span style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink);">Short Termination Notice</span>
                </div>
                <p style="font-size: 11px; color: var(--gray-500); line-height: 1.4;">15-day termination notice without cause is unusually short for enterprise services. Standard is 30-90 days.</p>
              </div>
            </div>

            <!-- Key Extract Box -->
            <div style="border-top: 1px solid var(--gray-100); padding-top: var(--sp-3); display: flex; flex-direction: column; gap: var(--sp-2);">
              <span style="font-size: var(--fs-xs); font-weight: 600; text-transform: uppercase; color: var(--gray-500);">Extracted Fields</span>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">Governing Law</span><span style="color: var(--ink); font-weight: 500;">Delaware, US</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">Payment Terms</span><span style="color: var(--ink); font-weight: 500;">Net 30</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">Liability Cap</span><span style="color: var(--rose); font-weight: 600;">None</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  <!-- ====================== TRUST & COMPLIANCE SECTION ====================== -->
  <section class="section section--soft" style="border-top: 1px solid var(--gray-100); border-bottom: 1px solid var(--gray-100);">
    <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: var(--sp-8);">
      <div style="text-align: center; max-width: 600px;">
        <span class="eyebrow eyebrow--neutral">Privacy & Security First</span>
        <h2 style="margin-top: var(--sp-4); font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Enterprise-grade Document Security</h2>
        <p style="margin-top: var(--sp-3); font-size: var(--fs-base); color: var(--gray-505);">We process high-stakes financial, legal, and operational documents. Your data security is our foundational architecture.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--sp-6); width: 100%;">
        <div class="card" style="padding: var(--sp-6); background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); display: flex; flex-direction: column; gap: var(--sp-2);">
          <div style="font-size: 24px; color: var(--violet-400);">🔒</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Fully Encrypted</h4>
          <p style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5;">Documents are encrypted at rest using AES-256 and in transit via TLS 1.3. Your files remain under isolation.</p>
        </div>
        <div class="card" style="padding: var(--sp-6); background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); display: flex; flex-direction: column; gap: var(--sp-2);">
          <div style="font-size: 24px; color: var(--violet-400);">🛡️</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Zero AI Model Training</h4>
          <p style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5;">Your documents are never used to train LLMs or public AI engines. Your proprietary business data stays private.</p>
        </div>
        <div class="card" style="padding: var(--sp-6); background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); display: flex; flex-direction: column; gap: var(--sp-2);">
          <div style="font-size: 24px; color: var(--violet-400);">⚡</div>
          <h4 style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">99.99% Guaranteed Uptime</h4>
          <p style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5;">Backed by enterprise-grade SLAs. Reliable, distributed cloud infrastructure engineered for instant audits.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== LIVE INTERACTIVE DEMO ====================== -->
  <section class="section" id="demo">
    <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: var(--sp-8);">
      <div style="text-align: center; max-width: 680px;">
        <span class="eyebrow" style="background: rgba(0, 242, 254, 0.08); color: var(--violet-400); border-color: rgba(0, 242, 254, 0.25);">Interactive Sandbox</span>
        <h2 style="margin-top: var(--sp-4); font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">See Clarix in Action</h2>
        <p style="margin-top: var(--sp-3); font-size: var(--fs-base); color: var(--gray-500);">Simulate the document scan pipeline below to see how Clarix extracts risks and summaries.</p>
      </div>

      <!-- Live Demo Widget -->
      <div style="width: 100%; max-width: 800px; background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-lg); overflow: hidden; display: flex; flex-direction: column; min-height: 400px;" id="demoWidget">
        
        <!-- Tab Bar -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); background: var(--gray-50); border-bottom: 1px solid var(--gray-100); font-family: var(--font-sans); font-size: var(--fs-xs); text-align: center;">
          <div id="tab1" style="padding: var(--sp-3); border-right: 1px solid var(--gray-100); font-weight: 700; color: var(--violet-400); background: var(--paper-2); cursor: pointer;">1. Upload Document</div>
          <div id="tab2" style="padding: var(--sp-3); border-right: 1px solid var(--gray-100); font-weight: 500; color: var(--gray-500); cursor: not-allowed;">2. Scanning Pipeline</div>
          <div id="tab3" style="padding: var(--sp-3); border-right: 1px solid var(--gray-100); font-weight: 500; color: var(--gray-500); cursor: not-allowed;">3. Risk Highlighting</div>
          <div id="tab4" style="padding: var(--sp-3); font-weight: 500; color: var(--gray-500); cursor: not-allowed;">4. Insights Report</div>
        </div>

        <!-- Content Area -->
        <div id="demoContent" style="padding: var(--sp-8); flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 300px; background: var(--paper-2);">
          
          <!-- Step 1: Upload Mockup -->
          <div id="step1Content" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: var(--sp-5);">
            <div style="border: 2px dashed rgba(0, 242, 254, 0.3); border-radius: var(--r-md); padding: var(--sp-8) var(--sp-4); width: 100%; max-width: 500px; text-align: center; background: rgba(0, 242, 254, 0.02); display: flex; flex-direction: column; align-items: center; gap: var(--sp-3);">
              <span style="font-size: 36px;">📄</span>
              <div>
                <div style="font-size: var(--fs-base); font-weight: 600; color: var(--ink);">agreement_draft_final.pdf</div>
                <div style="font-size: var(--fs-xs); color: var(--gray-500); margin-top: 4px;">Master Services Contract · 8 pages</div>
              </div>
            </div>
            <button id="startScanBtn" class="btn btn--primary" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 12px 32px; border-radius: var(--r-md);">
              Analyze Contract Risks
            </button>
          </div>

          <!-- Step 2: Scanning (Hidden initially) -->
          <div id="step2Content" style="display: none; width: 100%; flex-direction: column; align-items: center; gap: var(--sp-5);">
            <div style="width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: var(--sp-2);">
              <div style="display: flex; justify-content: space-between; font-size: var(--fs-xs); font-family: var(--font-mono); color: var(--gray-500);">
                <span id="scanStatus">Initializing risk scan...</span>
                <span id="scanPct">0%</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--gray-100); border-radius: var(--r-full); overflow: hidden; position: relative;">
                <div id="scanBar" style="width: 0%; height: 100%; background: var(--violet-400); border-radius: var(--r-full); transition: width 0.2s linear;"></div>
              </div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--gray-500); width: 100%; max-width: 480px; height: 100px; background: var(--gray-25); border: 1px solid var(--gray-100); padding: var(--sp-3); border-radius: var(--r-sm); overflow-y: auto; display: flex; flex-direction: column; gap: 4px;" id="scanLogs">
            </div>
          </div>

          <!-- Step 3: Highlights (Hidden initially) -->
          <div id="step3Content" style="display: none; width: 100%; grid-template-columns: 1fr 280px; gap: var(--sp-6);">
            <div style="background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); padding: var(--sp-5); max-height: 250px; overflow-y: auto; font-size: var(--fs-sm); color: var(--gray-700); line-height: 1.6;">
              <p style="margin-bottom: 12px;"><strong>Section 14. Limitation of Liability.</strong></p>
              <div style="background: rgba(244, 63, 94, 0.1); border-left: 3px solid var(--rose); padding: 8px 12px; border-radius: 4px; margin-bottom: 12px;">
                IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR SPECIAL, INDIRECT, OR CONSEQUENTIAL DAMAGES. PROVIDER'S TOTAL LIABILITY FOR CLAIMS UNDER THIS AGREEMENT IS UNLIMITED.
              </div>
              <p>Either party may request an audit of records with 48 hours notice.</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--sp-3);">
              <div style="border: 1px solid var(--rose); background: rgba(244, 63, 94, 0.05); border-radius: var(--r-md); padding: 12px; display: flex; flex-direction: column; gap: 4px;">
                <span style="font-size: 10px; font-weight: 700; color: var(--rose); text-transform: uppercase;">⚠️ HIGH RISK EXPOSURE</span>
                <div style="font-size: var(--fs-xs); font-weight: 600; color: var(--ink);">Unlimited Liability Cap</div>
                <p style="font-size: 10px; color: var(--gray-500); line-height: 1.3; margin: 0;">Exposes your company to uncapped claims in the event of default.</p>
              </div>
              <button id="nextDemoBtn" class="btn btn--primary" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 10px; border-radius: var(--r-md); font-size: var(--fs-xs);">
                Generate Summary & Insights
              </button>
            </div>
          </div>

          <!-- Step 4: Insights (Hidden initially) -->
          <div id="step4Content" style="display: none; width: 100%; flex-direction: column; gap: var(--sp-4);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
              <div style="background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); padding: var(--sp-4);">
                <div style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink); text-transform: uppercase; margin-bottom: 6px;">Executive TLDR</div>
                <p style="font-size: var(--fs-xs); color: var(--gray-500); line-height: 1.5; margin: 0;">Standard vendor MSA. Key risks include uncapped provider liability and short termination notice. Net payment terms are standard Net 30.</p>
              </div>
              <div style="background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); padding: var(--sp-4);">
                <div style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink); text-transform: uppercase; margin-bottom: 6px;">Action Items</div>
                <ul style="font-size: var(--fs-xs); color: var(--gray-500); padding-left: 12px; margin: 0; line-height: 1.5;">
                  <li>Negotiate a 1x contract value liability cap.</li>
                  <li>Increase termination notice from 15 to 30 days.</li>
                </ul>
              </div>
            </div>
            <div style="display: flex; gap: var(--sp-3); justify-content: center; margin-top: var(--sp-2);">
              <a href="/sign-up" class="btn btn--primary" style="background: var(--violet-400); color: var(--paper); border: none; font-weight: 600; padding: 10px 24px; border-radius: var(--r-md); font-size: var(--fs-xs);">Start Free Analysis</a>
              <button id="resetDemoBtn" class="btn btn--secondary" style="background: rgba(255, 255, 255, 0.05); color: var(--ink); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 24px; border-radius: var(--r-md); font-size: var(--fs-xs);">Restart Demo</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>

  <!-- ====================== USE CASES ====================== -->
  <section class="section">
    <div class="container" style="display: flex; flex-direction: column; gap: var(--sp-12);">
      <div class="section-heading reveal" style="text-align: center; margin-bottom: 0;">
        <span class="eyebrow"><span class="eyebrow__dot" style="background: var(--violet-400);"></span>Enterprise Scope</span>
        <h2>Built for Precision. Focused on Outcomes.</h2>
        <p>Generic AI tools write summaries. Clarix audits structure, checks compliance, and reports risk.</p>
      </div>

      <div class="grid grid-3 reveal" style="gap: var(--sp-6);">
        <!-- Contract Review -->
        <div class="card card--feature card--hover" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg);">
          <div style="font-size: 24px; margin-bottom: var(--sp-3);">📋</div>
          <h3 class="feature-card__title" style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Contract Review</h3>
          <p class="feature-card__desc" style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5; margin-top: var(--sp-2);">Scan master agreements, NDAs, and SLAs for missing limits, governing law issues, and termination liability.</p>
          <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--gray-100); font-size: var(--fs-xs); color: var(--violet-400); font-weight: 600;">Outcome: 80% reduction in legal turnaround time</div>
        </div>

        <!-- Invoice Auditing -->
        <div class="card card--feature card--hover" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg);">
          <div style="font-size: 24px; margin-bottom: var(--sp-3);">🧾</div>
          <h3 class="feature-card__title" style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Invoice Auditing</h3>
          <p class="feature-card__desc" style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5; margin-top: var(--sp-2);">Cross-check billing statements, purchase orders, and receipts to flag price inflation or duplicate itemizations.</p>
          <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--gray-100); font-size: var(--fs-xs); color: var(--violet-400); font-weight: 600;">Outcome: Detect overbilling errors instantly</div>
        </div>

        <!-- Risk Detection -->
        <div class="card card--feature card--hover" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg);">
          <div style="font-size: 24px; margin-bottom: var(--sp-3);">🔍</div>
          <h3 class="feature-card__title" style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Risk Detection</h3>
          <p class="feature-card__desc" style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5; margin-top: var(--sp-2);">Isolate hidden commitments, governing jurisdiction issues, or regulatory exposures automatically.</p>
          <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--gray-100); font-size: var(--fs-xs); color: var(--violet-400); font-weight: 600;">Outcome: Block financial and operational liability</div>
        </div>

        <!-- Compliance Analysis -->
        <div class="card card--feature card--hover" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg);">
          <div style="font-size: 24px; margin-bottom: var(--sp-3);">🛡️</div>
          <h3 class="feature-card__title" style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Compliance Analysis</h3>
          <p class="feature-card__desc" style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5; margin-top: var(--sp-2);">Check operational policies, SOC 2 reports, and vendor documentation against internal compliance checklists.</p>
          <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--gray-100); font-size: var(--fs-xs); color: var(--violet-400); font-weight: 600;">Outcome: Continuous alignment for audits</div>
        </div>

        <!-- Business Reports -->
        <div class="card card--feature card--hover" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg);">
          <div style="font-size: 24px; margin-bottom: var(--sp-3);">📈</div>
          <h3 class="feature-card__title" style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Business Reports</h3>
          <p class="feature-card__desc" style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5; margin-top: var(--sp-2);">Extract KPIs, financial summaries, and executive metrics from multi-page PDFs in seconds.</p>
          <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--gray-100); font-size: var(--fs-xs); color: var(--violet-400); font-weight: 600;">Outcome: Actionable insights without manual synthesis</div>
        </div>

        <!-- Operational Insights -->
        <div class="card card--feature card--hover" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg);">
          <div style="font-size: 24px; margin-bottom: var(--sp-3);">🧭</div>
          <h3 class="feature-card__title" style="font-size: var(--fs-base); font-weight: 700; color: var(--ink);">Operational Insights</h3>
          <p class="feature-card__desc" style="font-size: var(--fs-sm); color: var(--gray-500); line-height: 1.5; margin-top: var(--sp-2);">Uncover inefficiencies, bottlenecks, and policy gaps in internal guides and runbooks.</p>
          <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--gray-100); font-size: var(--fs-xs); color: var(--violet-400); font-weight: 600;">Outcome: Streamlined business processes</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== DIFFERENTIATION ====================== -->
  <section class="section section--soft" style="border-top: 1px solid var(--gray-100); border-bottom: 1px solid var(--gray-100);">
    <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: var(--sp-8);">
      <div style="text-align: center; max-width: 600px;">
        <span class="eyebrow eyebrow--neutral">Structured Intelligence</span>
        <h2 style="margin-top: var(--sp-4); font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Why Clarix instead of ChatGPT?</h2>
        <p style="margin-top: var(--sp-3); font-size: var(--fs-base); color: var(--gray-500);">Generic chatbots analyze one prompt at a time. Clarix builds structured business workflows with isolated document security.</p>
      </div>

      <div style="width: 100%; max-width: 900px; overflow-x: auto; background: var(--gray-25); border: 1px solid var(--gray-200); border-radius: var(--r-lg); box-shadow: var(--sh-md);">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: var(--fs-sm);">
          <thead>
            <tr style="border-bottom: 1px solid var(--gray-200); background: var(--gray-50);">
              <th style="padding: var(--sp-4) var(--sp-6); font-weight: 700; color: var(--ink);">Capabilities</th>
              <th style="padding: var(--sp-4) var(--sp-6); font-weight: 700; color: var(--violet-400);">Clarix Platform</th>
              <th style="padding: var(--sp-4) var(--sp-6); font-weight: 500; color: var(--gray-500);">Generic AI Chatbots</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--gray-100);">
              <td style="padding: var(--sp-4) var(--sp-6); font-weight: 600; color: var(--ink);">Structured Audit Workflows</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--violet-400); font-weight: 600;">✅ Yes, built-in</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--gray-500);">❌ Chat prompts only</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--gray-100);">
              <td style="padding: var(--sp-4) var(--sp-6); font-weight: 600; color: var(--ink);">Automated Risk Scoring</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--violet-400); font-weight: 600;">✅ Yes, 0-100 score</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--gray-500);">❌ Not available</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--gray-100);">
              <td style="padding: var(--sp-4) var(--sp-6); font-weight: 600; color: var(--ink);">Isolated Workspace Memory</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--violet-400); font-weight: 600;">✅ Yes, persistent</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--gray-500);">❌ Session-only</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--gray-100);">
              <td style="padding: var(--sp-4) var(--sp-6); font-weight: 600; color: var(--ink);">Audit Trail Logging</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--violet-400); font-weight: 600;">✅ Yes, compliance-ready</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--gray-500);">❌ None</td>
            </tr>
            <tr>
              <td style="padding: var(--sp-4) var(--sp-6); font-weight: 600; color: var(--ink);">Corporate Privacy Isolation</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--violet-400); font-weight: 600;">✅ Guaranteed zero-training</td>
              <td style="padding: var(--sp-4) var(--sp-6); color: var(--gray-500);">❌ Opt-out required</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ====================== SOCIAL PROOF ====================== -->
  <section class="section">
    <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: var(--sp-8);">
      <div style="text-align: center; max-width: 600px;">
        <span class="eyebrow"><span class="eyebrow__dot" style="background: var(--violet-400);"></span>Metrics & Validation</span>
        <h2 style="margin-top: var(--sp-4); font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Trusted by High-growth Teams</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-6); width: 100%; text-align: center; margin-bottom: var(--sp-6);">
        <div style="background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); padding: var(--sp-6);">
          <div style="font-size: var(--fs-4xl); font-weight: 800; color: var(--violet-400);">1.2M+</div>
          <div style="font-size: var(--fs-sm); color: var(--gray-500); font-weight: 500; margin-top: 4px;">Clauses Analyzed</div>
        </div>
        <div style="background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); padding: var(--sp-6);">
          <div style="font-size: var(--fs-4xl); font-weight: 800; color: var(--violet-400);">98.7%</div>
          <div style="font-size: var(--fs-sm); color: var(--gray-500); font-weight: 500; margin-top: 4px;">Risk Identification Accuracy</div>
        </div>
        <div style="background: var(--gray-25); border: 1px solid var(--gray-100); border-radius: var(--r-md); padding: var(--sp-6);">
          <div style="font-size: var(--fs-4xl); font-weight: 800; color: var(--violet-400);">15,000+</div>
          <div style="font-size: var(--fs-sm); color: var(--gray-500); font-weight: 500; margin-top: 4px;">Hours Saved in Audit Prep</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-6); width: 100%;">
        <div class="card" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg); display: flex; flex-direction: column; gap: var(--sp-4);">
          <p style="font-size: var(--fs-sm); color: var(--ink-2); line-height: 1.6; font-style: italic;">"Before Clarix, legal reviews of our vendor service agreements took weeks of back-and-forth. Now, our operations team performs initial risk assessments in seconds, highlighting liability holes immediately."</p>
          <div>
            <div style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink);">Sarah Jenkins</div>
            <div style="font-size: 10px; color: var(--gray-500);">VP Operations, ScaleFlow AI</div>
          </div>
        </div>
        <div class="card" style="padding: var(--sp-6); background: var(--paper-2); border: 1px solid var(--gray-200); border-radius: var(--r-lg); display: flex; flex-direction: column; gap: var(--sp-4);">
          <p style="font-size: var(--fs-sm); color: var(--ink-2); line-height: 1.6; font-style: italic;">"We handle dozens of subcontractor agreements. Clarix has saved us hundreds of billing audit hours by flagging governing law and insurance coverage inconsistencies automatically."</p>
          <div>
            <div style="font-size: var(--fs-xs); font-weight: 700; color: var(--ink);">Marcus Chen</div>
            <div style="font-size: 10px; color: var(--gray-500);">Founder, Apex Build Group</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== PRICING ====================== -->
  <section class="section section--soft" style="border-top: 1px solid var(--gray-100); border-bottom: 1px solid var(--gray-100);">
    <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: var(--sp-8);">
      <div style="text-align: center; max-width: 600px;">
        <span class="eyebrow eyebrow--neutral">ROI-focused Plans</span>
        <h2 style="margin-top: var(--sp-4); font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Transparent, Value-driven Pricing</h2>
        <p style="margin-top: var(--sp-3); font-size: var(--fs-base); color: var(--gray-500);">Start free. Upgrade when you need advanced risk templates, team memory, or custom integration workflows.</p>
      </div>

      <div class="grid grid-3 reveal" style="width: 100%; gap: var(--sp-6); align-items: stretch;">
        <!-- Starter Plan -->
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

        <!-- Pro Plan -->
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

        <!-- Business Plan -->
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

  <!-- ====================== FINAL CTA ====================== -->
  <section class="section">
    <div class="container" style="display: flex; flex-direction: column; align-items: center;">
      <div class="cta reveal" style="text-align: center; max-width: 800px; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); background: radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.05), transparent 70%), var(--gray-25); border: 1px solid var(--gray-200); padding: var(--sp-12) var(--sp-6); border-radius: var(--r-xl); width: 100%;">
        <span class="eyebrow"><span class="eyebrow__dot" style="background: var(--violet-400);"></span>Immediate Value</span>
        <h2 style="font-size: var(--fs-3xl); font-weight: 800; color: var(--ink);">Zero risk audit preparation.</h2>
        <p style="font-size: var(--fs-base); color: var(--gray-500); line-height: 1.5; max-width: 580px;">Stop copy-pasting contract clauses. Upload your first document for a free automated risk and compliance analysis today.</p>
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
