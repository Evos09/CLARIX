export const HTML = `

  <nav class="nav nav--solid">
    <div class="container nav__inner">
      <a href="/" class="nav__brand">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" style="border-radius:8px;display:block"><rect width="32" height="32" rx="8" fill="#6D28D9"/><path d="M22.89 10.21 A9 9 0 1 0 22.89 21.79" fill="none" stroke="#FAFAF7" stroke-width="5" stroke-linecap="round"/></svg>
        <span>CLARIX</span>
      </a>
      <ul class="nav__links">
        <li><a class="nav__link" href="/features">Features</a></li>
        <li><a class="nav__link" href="/meeting-types">Meeting Types</a></li>
        <li><a class="nav__link" href="/pricing">Pricing</a></li>
        <li><a class="nav__link" href="/integrations">Integrations</a></li>
      </ul>
      <div class="nav__cta">
        <a class="nav__signin" href="/sign-in">Sign In</a>
        <a class="btn btn--accent btn--sm" href="/sign-up">Get Started Free</a>
      </div>
    </div>
  </nav>

  <main class="legal container">
    <aside class="legal__side">
      <a href="#overview" class="is-active">1. Overview</a>
      <a href="#eligibility">2. Eligible Plans</a>
      <a href="#baa">3. Business Associate Agreement</a>
      <a href="#safeguards">4. Technical Safeguards</a>
      <a href="#administrative">5. Administrative Safeguards</a>
      <a href="#data-handling">6. PHI Data Handling</a>
      <a href="#ai-processing">7. AI Processing of PHI</a>
      <a href="#breach">8. Breach Notification</a>
      <a href="#subcontractors">9. Subcontractors</a>
      <a href="#audit">10. Audit Rights</a>
      <a href="#contact">11. Contact</a>
    </aside>

    <div class="legal__main">
      <a href="/" class="legal__back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to home
      </a>

      <div class="legal__header">
        <h1>HIPAA Compliance Statement</h1>
        <p class="legal__updated">Last updated: June 22, 2026</p>
      </div>

      <section class="legal__section" id="overview">
        <h2>1. Overview</h2>
        <p>The Health Insurance Portability and Accountability Act of 1996 ("HIPAA") and its implementing regulations establish national standards to protect individuals' electronic personal health information. CLARIX, Inc. is committed to supporting HIPAA compliance for customers who use our Healthcare Pro Vertical to process Protected Health Information ("PHI").</p>
        <p>This statement describes the safeguards CLARIX has implemented and the contractual commitments we make to covered entities and business associates under HIPAA.</p>
      </section>

      <section class="legal__section" id="eligibility">
        <h2>2. Eligible Plans</h2>
        <p>HIPAA-compliant processing is available on the <strong>Enterprise plan only</strong>. Free, Starter, and Pro plans are not approved for processing PHI and must not be used for that purpose. Enterprise customers who enable the Healthcare Pro Vertical receive:</p>
        <ul>
          <li>A signed Business Associate Agreement (BAA) before any PHI is processed</li>
          <li>Access to HIPAA-eligible infrastructure and subprocessors</li>
          <li>PHI-specific access controls and audit logging</li>
          <li>Regional data residency in the United States</li>
        </ul>
      </section>

      <section class="legal__section" id="baa">
        <h2>3. Business Associate Agreement</h2>
        <p>CLARIX will execute a Business Associate Agreement ("BAA") with covered entities and business associates prior to processing any PHI. The BAA defines our obligations as a business associate, including:</p>
        <ul>
          <li>Use and disclosure limitations</li>
          <li>Safeguards for PHI</li>
          <li>Subcontractor obligations</li>
          <li>Breach notification procedures</li>
          <li>Access, amendment, and accounting rights</li>
          <li>Termination procedures</li>
        </ul>
        <p>Contact <strong>hipaa@clarix.com</strong> to initiate the BAA process.</p>
      </section>

      <section class="legal__section" id="safeguards">
        <h2>4. Technical Safeguards</h2>
        <p>CLARIX implements technical safeguards consistent with the HIPAA Security Rule (§ 164.312):</p>
        <ul>
          <li><strong>Access control:</strong> Unique user IDs, automatic logoff, role-based access, and multi-factor authentication for all workforce members with PHI access</li>
          <li><strong>Audit controls:</strong> Hardware, software, and procedural mechanisms that record and examine activity in information systems containing PHI</li>
          <li><strong>Integrity controls:</strong> AES-256 encryption at rest, TLS 1.3 in transit, and integrity verification mechanisms</li>
          <li><strong>Transmission security:</strong> End-to-end encryption for all PHI in transit, with certificate pinning for mobile and desktop apps</li>
        </ul>
      </section>

      <section class="legal__section" id="administrative">
        <h2>5. Administrative Safeguards</h2>
        <p>Our administrative safeguards (§ 164.308) include:</p>
        <ul>
          <li>Designated Security Officer and Privacy Officer</li>
          <li>Workforce training on HIPAA policies and procedures</li>
          <li>Background checks for all workforce members with PHI access</li>
          <li>Formal incident response and breach notification procedures</li>
          <li>Risk analyses and risk management programs, conducted annually</li>
          <li>Vendor management and subcontractor due diligence</li>
        </ul>
      </section>

      <section class="legal__section" id="data-handling">
        <h2>6. PHI Data Handling</h2>
        <p>For PHI processed through the Healthcare Pro Vertical:</p>
        <ul>
          <li>Audio recordings are encrypted at rest with customer-managed keys (Enterprise option)</li>
          <li>Transcripts and structured outputs are stored in HIPAA-eligible databases</li>
          <li>Default retention is configurable per workspace (minimum 30 days, maximum 7 years for medical records)</li>
          <li>Deletion is permanent and verifiable — soft deletes are not used for PHI</li>
          <li>PHI is never used to train AI models under any circumstance, with or without opt-in</li>
        </ul>
      </section>

      <section class="legal__section" id="ai-processing">
        <h2>7. AI Processing of PHI</h2>
        <p>CLARIX uses AI to transcribe audio, identify medical entities, suggest ICD-10 codes, and generate structured SOAP notes. The following guarantees apply to PHI:</p>
        <ul>
          <li>All AI processing occurs in HIPAA-eligible environments, isolated from non-PHI workloads</li>
          <li>No PHI is used for model training, fine-tuning, or evaluation — ever</li>
          <li>Model inferences do not retain input data after the request completes</li>
          <li>Specialized healthcare models are used in preference to general-purpose models</li>
        </ul>
      </section>

      <section class="legal__section" id="breach">
        <h2>8. Breach Notification</h2>
        <p>In the event of a breach of unsecured PHI, CLARIX will:</p>
        <ul>
          <li>Notify the covered entity without unreasonable delay and in no case later than 60 calendar days after discovery</li>
          <li>Provide all information required by 45 CFR § 164.410</li>
          <li>Cooperate with the covered entity's breach risk assessment</li>
          <li>Mitigate harmful effects and document the incident</li>
        </ul>
      </section>

      <section class="legal__section" id="subcontractors">
        <h2>9. Subcontractors</h2>
        <p>CLARIX uses a small number of vetted subcontractors to deliver the Healthcare Pro Vertical, including:</p>
        <ul>
          <li>Cloud infrastructure providers (US-only, with signed BAAs)</li>
          <li>Specialized speech recognition and entity extraction services (PHI-eligible environments only)</li>
        </ul>
        <p>A complete list of HIPAA-eligible subprocessors is available to Enterprise customers under NDA.</p>
      </section>

      <section class="legal__section" id="audit">
        <h2>10. Audit Rights</h2>
        <p>Enterprise customers with a BAA may request:</p>
        <ul>
          <li>SOC 2 Type II report (available annually)</li>
          <li>HIPAA Security Rule attestation</li>
          <li>Penetration test summary reports</li>
          <li>Business Associate Agreement audits with reasonable notice</li>
        </ul>
        <p>To request any of the above, contact your account manager or <strong>hipaa@clarix.com</strong>.</p>
      </section>

      <section class="legal__section" id="contact">
        <h2>11. Contact</h2>
        <p>For HIPAA-related questions, BAA initiation, or to report a security concern:</p>
        <p>
          <strong>CLARIX, Inc.</strong><br/>
          Attn: HIPAA Compliance Officer<br/>
          548 Market Street, Suite 72000<br/>
          San Francisco, CA 94104<br/>
          United States<br/><br/>
          <strong>hipaa@clarix.com</strong><br/>
          <strong>Security:</strong> security@clarix.com
        </p>
      </section>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__bottom" style="border-top: 0; padding-top: 0;">
        <span>© 2026 CLARIX, Inc. All rights reserved.</span>
        <div class="footer__social">
          <a href="/sign-up" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="/sign-up" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="/sign-up" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
        </div>
      </div>
    </div>
  </footer>
`;
