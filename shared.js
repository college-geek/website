(() => {
  const DATA = window.UGEAC_DATA || {};
  const { INFO = {}, META = [], CUTS = [], BS = {}, TIER = {}, CAT_COLORS = {} } = DATA;

  const fmt = (n) => (n != null ? Math.round(n).toLocaleString("en-IN") : "—");
  const fmtR = (n) => (n != null ? "UR-" + Math.round(n).toLocaleString("en-IN") : "—");
  const sh = (b) => BS[b] || b;
  const getTier = (r) => (r <= 5 ? 1 : r <= 15 ? 2 : r <= 28 ? 3 : 4);
  const cColor = (c) => CAT_COLORS[c] || "#6b7280";

  const ALL_CATS = [...new Set(CUTS.map((r) => r.c))].sort();
  const ALL_BRANCHES = [...new Set(CUTS.map((r) => r.b))].sort();

  const CUT_IDX = {};
  for (const r of CUTS) (CUT_IDX[r.i] ||= []).push(r);

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  // Parse rank typed as: "45000", "UR-45000", "ur 45000", etc.
  const parseRank = (rankStr) => {
    const digits = String(rankStr ?? "").match(/\d+/g);
    if (!digits) return null;
    const r = parseInt(digits.join(""), 10);
    return Number.isFinite(r) && r > 0 ? r : null;
  };

  // Reusable navbar/footer (kept consistent with the uploaded homepage)
  function renderNav(active) {
    const base = window.CG_BASE || "";
    const a = (id) => (active === id ? 'style="color: var(--blue)"' : "");
    return `
      <nav>
        <a href="${base}index.html" class="nav-logo">
          <div class="nav-logo-icon">🎓</div>
          College Geek
        </a>
        <ul class="nav-links">
          <li><a href="${base}colleges.html" ${a("colleges")}>Colleges</a></li>
          <li><a href="${base}predictor.html" ${a("predictor")}>Predictor</a></li>
          <li><a href="${base}career-roadmap.html" ${a("roadmap")}>Career Roadmap</a></li>
          <li><a href="#" title="Placeholder">Community</a></li>
          <li><a href="#" title="Placeholder">Resources ▾</a></li>
        </ul>
        <button class="nav-btn" type="button">Login</button>
      </nav>
    `;
  }

  function renderFooter() {
    const base = window.CG_BASE || "";
    return `
      <footer>
        <div class="footer-top">
          <div class="footer-brand">
            <h3>🎓 College Geek</h3>
            <p>Bihar's most trusted platform for college admissions, UGEAC counseling guidance, and student community support.</p>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="${base}predictor.html">College Predictor</a></li>
              <li><a href="${base}colleges.html">College Explorer</a></li>
              <li><a href="#" title="Placeholder">Branch Comparison</a></li>
              <li><a href="#" title="Placeholder">Cutoff Trends</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#" title="Placeholder">UGEAC Guide</a></li>
              <li><a href="#" title="Placeholder">Counseling Schedule</a></li>
              <li><a href="#" title="Placeholder">Study Materials</a></li>
              <li><a href="${base}career-roadmap.html">Career Roadmap</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="#" title="Placeholder">Discussions</a></li>
              <li><a href="#" title="Placeholder">Ask a Question</a></li>
              <li><a href="#" title="Placeholder">Success Stories</a></li>
              <li><a href="#" title="Placeholder">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <hr class="footer-divider" />
        <div class="footer-bottom">
          <span>© 2027 College Geek. All rights reserved.</span>
          <span>Made with ❤️ for Bihar students</span>
        </div>
      </footer>
    `;
  }

  window.CG = {
    DATA: { INFO, META, CUTS, BS, TIER, CAT_COLORS, ALL_CATS, ALL_BRANCHES, CUT_IDX },
    fmt,
    fmtR,
    sh,
    getTier,
    cColor,
    escapeHtml,
    parseRank,
    renderNav,
    renderFooter,
  };
})();
