(() => {
  const { DATA, fmt, fmtR, sh, getTier, cColor, escapeHtml, renderNav, renderFooter } = window.CG;
  const { INFO, META, CUT_IDX, ALL_CATS, ALL_BRANCHES, TIER } = DATA;

  // Elements
  const nav = document.getElementById("nav");
  const footer = document.getElementById("footer");
  const qEl = document.getElementById("q");
  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  const modeU = document.getElementById("mode-ugeac");
  const modeJ = document.getElementById("mode-jee");

  nav.innerHTML = renderNav("colleges");
  footer.innerHTML = renderFooter();

  const state = {
    q: "",
    cat: "UR", // fixed (Category filter removed from UI)
    mode: "ugeac",
  };

  function setMode(m) {
    state.mode = m;
    modeU.classList.toggle("active", m === "ugeac");
    modeJ.classList.toggle("active", m === "jee");
    render();
  }

  function buildFilters() {
    // No dropdown filters on this page now (only search + mode toggle).
  }

  function colleges() {
    let list = META.map((m) => ({
      ...m,
      tier: getTier(m.rank),
      cuts: CUT_IDX[m.name] || [],
      info: INFO[m.name] || {},
    }));

    if (state.q.trim()) {
      const query = state.q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          String(c.info.fullName || "").toLowerCase().includes(query)
      );
    }
    return list;
  }

  function renderGrid(list) {
    count.textContent = `${list.length} colleges`;
    grid.innerHTML = list
      .map((col) => {
        const inf = col.info || {};
        const tc = TIER[col.tier] || { color: "#2563EB", label: "Tier" };
        const slug = slugify(col.name);

        const cseBr = col.branches.find(
          (b) => b.includes("COMPUTER SC.") || b.includes("COMPUTER SCIENCE AND") || b.includes("I.T.")
        );
        const bestRow = (cseBr && col.cuts.find((r) => r.b === cseBr && r.c === state.cat)) || col.cuts.find((r) => r.c === state.cat);
        const closeVal = state.mode === "ugeac" ? bestRow?.uc : bestRow?.jc;
        const cutoffLabel = closeVal != null ? (state.mode === "ugeac" ? fmtR(closeVal) : fmt(closeVal)) : null;

        const bg = col.tier === 1 ? "c4" : col.tier === 2 ? "c1" : col.tier === 3 ? "c3" : "c2";

        const photo = inf.image ? `style="background-image:url('${escapeHtml(inf.image)}')"` : "";
        const imgCls = inf.image ? "college-img has-photo" : `college-img ${bg}`;

        return `
          <div class="college-card" data-col="${escapeHtml(col.name)}">
            <div class="${imgCls}" ${photo}>
              <div class="img-emoji">🏫</div>
            </div>
            <div class="college-info">
              <h4>${escapeHtml(inf.fullName || col.name)}</h4>
              <div class="college-location">📍 ${escapeHtml(inf.city || "")}${inf.city ? ", " : ""}Bihar</div>
              <div class="college-stats">
                <div class="stat">
                  <div class="stat-val">#${escapeHtml(col.rank)}</div>
                  <div class="stat-label">Rank</div>
                </div>
                <div class="stat">
                  <div class="stat-val">${escapeHtml(fmt(col.avg_air))}</div>
                  <div class="stat-label">Avg CS AIR</div>
                </div>
                <div class="stat">
                  <div class="stat-val">${escapeHtml(col.branches.length)}</div>
                  <div class="stat-label">Branches</div>
                </div>
              </div>
              <div class="college-badges">
                ${
                  cutoffLabel
                    ? `<div class="cutoff-pill">📌 Cutoff: <b>${escapeHtml(cutoffLabel)}</b> <span class="cutoff-pill__meta">(${escapeHtml(
                        state.cat
                      )} · ${escapeHtml(state.mode === "ugeac" ? "UGEAC" : "JEE")})</span></div>`
                    : ""
                }
                <div class="hostel-badge">⭐ ${escapeHtml(tc.label)} · Tier</div>
              </div>
              <a class="btn-view" href="colleges/${escapeHtml(slug)}.html?mode=${escapeHtml(state.mode)}">
                View Details → ${closeVal != null ? `<span style="opacity:.75">(${state.mode === "ugeac" ? fmtR(closeVal) : fmt(closeVal)})</span>` : ""}
              </a>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\./g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }

  // kept for backward compatibility (e.g. if you later add programmatic navigation)
  function openDetails(collegeName) {
    const slug = slugify(collegeName);
    const url = `colleges/${encodeURIComponent(slug)}.html?mode=${encodeURIComponent(state.mode)}`;
    window.open(url, "_blank");
  }

  function render() {
    const list = colleges();
    renderGrid(list);
  }

  // Listeners
  qEl.addEventListener("input", () => {
    state.q = qEl.value;
    render();
  });
  modeU.addEventListener("click", () => setMode("ugeac"));
  modeJ.addEventListener("click", () => setMode("jee"));

  // NOTE: Only the "View Details" button/link opens the details page.

  // Init
  buildFilters();
  render();

  // If navigated from predictor/homepage with #collegeName, open details page directly
  if (location.hash && location.hash.length > 1) {
    const name = decodeURIComponent(location.hash.slice(1));
    if (META.some((x) => x.name === name)) {
      const url = `colleges/${encodeURIComponent(slugify(name))}.html?mode=${encodeURIComponent(state.mode)}`;
      location.replace(url);
    }
  }
})();
