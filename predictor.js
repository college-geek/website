(() => {
  const { DATA, fmt, fmtR, sh, getTier, escapeHtml, parseRank, renderNav, renderFooter } = window.CG;
  const { INFO, META, CUTS, TIER } = DATA;

  const nav = document.getElementById("nav");
  const footer = document.getElementById("footer");
  nav.innerHTML = renderNav("predictor");
  footer.innerHTML = renderFooter();

  const pmU = document.getElementById("pm-ugeac");
  const pmJ = document.getElementById("pm-jee");
  const rankEl = document.getElementById("rank");
  const branchEl = document.getElementById("pbranch");
  const go = document.getElementById("go");
  const resultsEl = document.getElementById("results");
  const summaryEl = document.getElementById("summary");

  // Category filter removed per request; keep predictions based on UR cutoffs.
  const PRED_CAT = "UR";
  const state = { mode: "ugeac", branch: "", rank: "", pred: null };

  const normalizeBranch = (b) => {
    const s = String(b || "").toUpperCase();
    // Group all CSE + specializations + IT under one filter option (as requested)
    if (s.includes("COMPUTER") || s.includes("I.T.") || s === "IT") return "__CSE__";
    return b;
  };

  function setMode(m) {
    state.mode = m;
    pmU.classList.toggle("active", m === "ugeac");
    pmJ.classList.toggle("active", m === "jee");
  }

  function buildBranches() {
    const all = (DATA.ALL_BRANCHES || []).slice();
    const groups = new Map();
    for (const b of all) {
      const key = normalizeBranch(b);
      if (key === "__CSE__") continue; // handled as a special group
      groups.set(b, sh(b));
    }
    const opts = [
      { value: "", label: "All branches" },
      { value: "__CSE__", label: "Computer Science (all/specializations)" },
      ...[...groups.entries()]
        .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
        .map(([value, label]) => ({ value, label })),
    ];
    branchEl.innerHTML = opts
      .map((o) => `<option value="${escapeHtml(o.value)}" ${o.value === state.branch ? "selected" : ""}>${escapeHtml(o.label)}</option>`)
      .join("");
  }

  function predict() {
    const r = parseRank(state.rank);
    if (!r) return null;

    const results = [];
    const seen = new Set();
    for (const x of CUTS) {
      if (x.c !== PRED_CAT) continue;
      if (state.branch) {
        const nb = normalizeBranch(x.b);
        if (state.branch === "__CSE__") {
          if (nb !== "__CSE__") continue;
        } else {
          if (x.b !== state.branch) continue;
        }
      }
      const closing = state.mode === "ugeac" ? x.uc : x.jc;
      if (!closing || closing < r) continue;
      const key = x.i + "|" + x.b;
      if (seen.has(key)) continue;
      seen.add(key);
      const opening = state.mode === "ugeac" ? x.uo : x.jo;
      results.push({
        institute: x.i,
        branch: x.b,
        opening,
        closing,
        margin: closing - r,
        rank: (META.find((m) => m.name === x.i) || {}).rank || 99,
      });
    }
    // List all possible options (no hard limit)
    return results.sort((a, b) => a.rank - b.rank || a.margin - b.margin);
  }

  function render() {
    resultsEl.innerHTML = "";
    summaryEl.innerHTML = "";

    if (!state.pred) return;

    summaryEl.innerHTML = `
      <div class="section-header" style="margin-bottom:14px">
        <div>
          <h2 class="section-title" style="font-size:1.2rem">Results</h2>
          <p style="color:var(--text-secondary);font-size:.85rem;margin-top:4px;line-height:1.6">
            ${state.pred.length} option${state.pred.length !== 1 ? "s" : ""} · ${
      state.mode === "ugeac" ? "UGEAC" : "JEE AIR"
    } rank <b>${escapeHtml(state.rank)}</b> <span style="opacity:.8">(UR cutoff)</span>
          </p>
        </div>
        <a class="view-all" href="colleges.html">Open Colleges →</a>
      </div>
    `;

    if (state.pred.length === 0) {
      resultsEl.innerHTML = `<div style="color:var(--text-secondary);padding:16px">No colleges found for this rank & category. Try a higher rank number.</div>`;
      return;
    }

    resultsEl.innerHTML = state.pred
      .map((r) => {
        const inf = INFO[r.institute] || {};
        const tier = getTier(r.rank);
        const tc = TIER[tier] || { bg: "#EFF6FF", text: "#1d4ed8", color: "#2563EB" };
        return `
          <div class="result-card" data-col="${escapeHtml(r.institute)}">
            <div class="result-top">
              <div style="width:10px;height:10px;border-radius:999px;background:${escapeHtml(tc.color)};margin-top:6px"></div>
              <div style="min-width:0">
                <div class="result-title">${escapeHtml(inf.fullName || r.institute)}</div>
                <div class="result-sub">${escapeHtml(sh(r.branch))}</div>
              </div>
              <div class="rank-pill" style="background:${escapeHtml(tc.bg)};color:${escapeHtml(tc.text)}">#${escapeHtml(
          r.rank
        )}</div>
            </div>
            <div class="result-bottom">
              <div class="kvpill">Open: <b>${escapeHtml(state.mode === "ugeac" ? fmtR(r.opening) : fmt(r.opening))}</b></div>
              <div class="kvpill" style="background:var(--blue-light)">Close: <b style="color:var(--blue-dark)">${escapeHtml(
                state.mode === "ugeac" ? fmtR(r.closing) : fmt(r.closing)
              )}</b></div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Events
  pmU.addEventListener("click", () => {
    setMode("ugeac");
  });
  pmJ.addEventListener("click", () => {
    setMode("jee");
  });
  branchEl.addEventListener("change", () => {
    state.branch = branchEl.value;
  });
  rankEl.addEventListener("input", () => {
    state.rank = rankEl.value;
  });
  rankEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      state.pred = predict() || [];
      render();
    }
  });
  go.addEventListener("click", () => {
    state.pred = predict() || [];
    render();
  });

  resultsEl.addEventListener("click", (e) => {
    const card = e.target.closest(".result-card");
    if (!card) return;
    const col = card.getAttribute("data-col");
    // jump to colleges page (user can open details there)
    location.href = `colleges.html#${encodeURIComponent(col)}`;
  });

  // Init
  buildBranches();
})();
