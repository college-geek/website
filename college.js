(() => {
  const { DATA, fmt, fmtR, sh, getTier, cColor, escapeHtml, renderNav, renderFooter } = window.CG;
  const { INFO, META, CUT_IDX, TIER } = DATA;

  const nav = document.getElementById("nav");
  const footer = document.getElementById("footer");

  // Details elements
  const dPhoto = document.getElementById("d-photo");
  const dName = document.getElementById("d-name");
  const dMeta = document.getElementById("d-meta");
  const dPills = document.getElementById("d-pills");
  const dTabs = document.getElementById("d-tabs");
  const dBody = document.getElementById("d-body");

  nav.innerHTML = renderNav("colleges");
  footer.innerHTML = renderFooter();

  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\./g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }

  const params = new URLSearchParams(location.search);
  let collegeName = params.get("name") || window.CG_COLLEGE_NAME;
  if (!collegeName) {
    // If opened as /colleges/<slug>.html, try to resolve the college name from the filename.
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    const slug = file.replace(/\.html$/, "");
    const match = META.find((m) => slugify(m.name) === slug);
    collegeName = match?.name || null;
  }

  const state = {
    cat: "UR", // fixed (Category filter removed from UI)
    mode: params.get("mode") === "jee" ? "jee" : "ugeac",
    sel: collegeName,
    detTab: "about",
    expBranch: null,
  };

  function setMode(m) {
    state.mode = m === "jee" ? "jee" : "ugeac";
  }

  function setTab(tabId) {
    state.detTab = tabId;
    state.expBranch = null;
    [...dTabs.querySelectorAll(".detail-tab")].forEach((x) => x.classList.remove("active"));
    const btn = [...dTabs.querySelectorAll(".detail-tab")].find((x) => x.getAttribute("data-tab") === tabId);
    if (btn) btn.classList.add("active");
    renderBody();
  }

  function renderHeader() {
    const sel = state.sel;
    const m = META.find((x) => x.name === sel) || {};
    const inf = INFO[sel] || {};
    const tier = getTier(m.rank || 99);
    const tc = TIER[tier] || {};

    dName.textContent = inf.fullName || sel || "College Details";
    dMeta.innerHTML = `
      <span class="meta-pill tier" style="background:${escapeHtml(tc.bg || "var(--blue-light)")};color:${escapeHtml(
      tc.text || "var(--blue-dark)"
    )}">#${escapeHtml(m.rank ?? "—")} · ${escapeHtml(tc.label || "Tier")}</span>
      <span class="meta-pill">📍 ${escapeHtml(inf.city || "—")}, Bihar</span>
      <span class="meta-pill">🏛️ ${escapeHtml(inf.type || "Govt.")}</span>
      <span class="meta-pill">📅 Est. ${escapeHtml(inf.estd || "—")}</span>
    `;

    dPills.innerHTML = `
      <span class="meta-pill">📊 Avg CS AIR: <b>${escapeHtml(fmt(m.avg_air))}</b></span>
      <span class="meta-pill">🎓 Branches: <b>${escapeHtml((m.branches || []).length)}</b></span>
    `;

    if (inf.image) {
      dPhoto.classList.add("has-photo");
      dPhoto.style.backgroundImage = `url('${inf.image}')`;
      dPhoto.innerHTML = "<span>🏫</span>";
    } else {
      dPhoto.classList.remove("has-photo");
      dPhoto.style.backgroundImage = "";
      dPhoto.innerHTML = "<span>🏫</span>";
    }
  }

  function renderTabs() {
    const tabs = [
      ["about", "About"],
      ["cutoff", "Cutoff"],
      ["seats", "Seat Matrix"],
      ["fees", "Fees"],
      ["hostel", "Hostel"],
      ["transport", "Transport"],
      ["gallery", "Gallery"],
    ];

    dTabs.innerHTML = tabs
      .map(
        ([id, label]) =>
          `<button class="detail-tab ${state.detTab === id ? "active" : ""}" data-tab="${escapeHtml(id)}" type="button">${escapeHtml(
            label
          )}</button>`
      )
      .join("");
  }

  function renderBody() {
    const sel = state.sel;
    if (!sel || !META.some((x) => x.name === sel)) {
      dBody.innerHTML = `<div style="color:var(--text-secondary)">College not found.</div>`;
      return;
    }

    const m = META.find((x) => x.name === sel) || {};
    const inf = INFO[sel] || {};
    const cuts = CUT_IDX[sel] || [];
    const branches = [...new Set(cuts.map((r) => r.b))].sort();

    if (state.detTab === "about") {
      dBody.innerHTML = `
        <p style="color:var(--text-secondary);line-height:1.75">${escapeHtml(inf.about || "No description available.")}</p>
        <div class="info-grid">
          ${[
            ["Type", escapeHtml(inf.type || "Government")],
            ["Affiliation", escapeHtml("Bihar Engineering University, Patna")],
            ["NAAC", escapeHtml(inf.naac || "Pending")],
            [
              "Website",
              inf.website
                ? `<a href="${escapeHtml(inf.website)}" target="_blank" rel="noreferrer">${escapeHtml(inf.website)}</a>`
                : "—",
            ],
          ]
            .map(
              ([k, v]) => `
              <div class="info-card">
                <div class="k">${escapeHtml(k)}</div>
                <div class="v">${v}</div>
              </div>
            `
            )
            .join("")}
        </div>
        <div class="info-grid" style="margin-top:12px">
          <div class="info-card">
            <div class="k">Contact</div>
            <div style="color:var(--text-secondary);line-height:1.7">
              ${inf.phone ? `📞 ${escapeHtml(inf.phone)}<br/>` : ""}
              ${inf.email ? `✉️ ${escapeHtml(inf.email)}<br/>` : ""}
              ${inf.address ? `📍 ${escapeHtml(inf.address)}` : ""}
            </div>
          </div>
          <div class="info-card">
            <div class="k">Quick facts</div>
            <div style="color:var(--text-secondary);line-height:1.7">
              🏆 Rank: <b style="color:var(--text)">#${escapeHtml(m.rank ?? "—")}</b><br/>
              📊 Avg CS AIR: <b style="color:var(--text)">${escapeHtml(fmt(m.avg_air))}</b><br/>
              🎓 Branches: <b style="color:var(--text)">${escapeHtml((m.branches || []).length)}</b>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (state.detTab === "fees") {
      if (!inf.fees) {
        dBody.innerHTML = `<div style="color:var(--text-secondary)">No fee details available.</div>`;
        return;
      }
      dBody.innerHTML = `
        <div class="info-card" style="border-radius:16px">
          <div class="k">Annual Fee Structure</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
            ${[
              ["Tuition Fee", inf.fees.tuition],
              ["Hostel Fee", inf.fees.hostel],
              ["Mess Charges", inf.fees.mess],
              ["Other Charges", inf.fees.other],
            ]
              .map(
                ([k, v]) => `
                <div style="border:1px solid var(--border);border-radius:14px;padding:12px;background:var(--bg-gray)">
                  <div style="font-size:.75rem;color:var(--text-secondary);font-weight:700;margin-bottom:6px">${escapeHtml(k)}</div>
                  <div style="font-weight:900">₹${escapeHtml((v ?? 0).toLocaleString("en-IN"))}/yr</div>
                </div>
              `
              )
              .join("")}
          </div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:900">Total Annual Cost</span>
            <span style="font-weight:900;color:var(--blue)">₹${escapeHtml((inf.fees.total ?? 0).toLocaleString("en-IN"))}</span>
          </div>
        </div>
      `;
      return;
    }

    if (state.detTab === "hostel") {
      if (!inf.hostel) {
        dBody.innerHTML = `<div style="color:var(--text-secondary)">No hostel details available.</div>`;
        return;
      }
      dBody.innerHTML = `
        <div class="info-grid">
          <div class="info-card">
            <div class="k">Availability</div>
            <div class="v">${inf.hostel.boys ? "✅ Boys Hostel" : "❌ Boys Hostel"}</div>
            <div class="v" style="margin-top:8px">${inf.hostel.girls ? "✅ Girls Hostel" : "❌ Girls Hostel"}</div>
          </div>
          <div class="info-card">
            <div class="k">Capacity</div>
            <div style="color:var(--text-secondary);line-height:1.7">
              🛏️ Rooms: <b style="color:var(--text)">${escapeHtml(inf.hostel.rooms ?? "—")}</b><br/>
              👥 Capacity: <b style="color:var(--text)">${escapeHtml(inf.hostel.capacity ?? "—")}</b><br/>
              💰 Fee: <b style="color:var(--text)">₹${escapeHtml((inf.hostel.fees ?? 0).toLocaleString("en-IN"))}/yr</b>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (state.detTab === "transport") {
      if (!inf.transport) {
        dBody.innerHTML = `<div style="color:var(--text-secondary)">No transport details available.</div>`;
        return;
      }
      dBody.innerHTML = `
        <div class="info-grid">
          ${[
            ["🚂 Railway", escapeHtml(`${inf.transport.railway || "—"} (${inf.transport.railDist ?? "—"} km)`)],
            ["✈️ Airport", escapeHtml(`${inf.transport.airport || "—"} (${inf.transport.airDist ?? "—"} km)`)],
            ["🚌 Bus", escapeHtml(`${inf.transport.bus || "—"} (${inf.transport.busDist ?? "—"} km)`)],
            [
              "🗺️ Map",
              inf.lat && inf.lng
                ? `<a href="https://www.google.com/maps?q=${encodeURIComponent(inf.lat + "," + inf.lng)}" target="_blank" rel="noreferrer">Open in Google Maps</a>`
                : "—",
            ],
          ]
            .map(
              ([k, v]) => `
              <div class="info-card">
                <div class="k">${escapeHtml(k)}</div>
                <div style="color:var(--text-secondary);line-height:1.7">${v}</div>
              </div>
            `
            )
            .join("")}
        </div>
      `;
      return;
    }

    if (state.detTab === "gallery") {
      const gallery = Array.isArray(inf.gallery) ? inf.gallery : [];
      if (gallery.length === 0) {
        dBody.innerHTML = `<div style="color:var(--text-secondary)">No gallery images available.</div>`;
        return;
      }
      dBody.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          ${gallery
            .map(
              (url) => `
              <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="display:block;border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--bg-gray);height:110px">
                <img src="${escapeHtml(url)}" alt="gallery" style="width:100%;height:110px;object-fit:cover;display:block" />
              </a>
            `
            )
            .join("")}
        </div>
      `;
      return;
    }

    if (state.detTab === "seats") {
      const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");
      const seatNormMap = window.CG_SEAT_MATRIX_NORM || {};
      const seatRow = seatNormMap[norm(sel)];

      const reservationHtml = `
        <div class="seat-matrix__res">
          RESERVATION:
          <b>UR=40%</b>, <b>SC=16%</b>, <b>ST=1%</b>, <b>EBC=18%</b>, <b>BC=12%</b>, <b>RCG=3%</b>, <b>EWS=10%</b>
          &nbsp;•&nbsp; For <b>DQ=5%</b>
        </div>
      `;

      if (!seatRow || !seatRow.branches) {
        dBody.innerHTML = `
          <div class="seat-matrix">
            <div class="seat-matrix__head">
              <div class="seat-matrix__title">Seat Matrix</div>
              <div class="seat-matrix__total">Total: —</div>
            </div>
            <div class="seat-matrix__more">Seat matrix not available for this college yet.</div>
            ${reservationHtml}
          </div>
        `;
        return;
      }

      const entries = Object.entries(seatRow.branches);
      const items = entries
        .map(([b, n]) => {
          const label = sh(b);
          return `<div class="seat-item"><span class="seat-item__b">${escapeHtml(label)}</span><span class="seat-item__n">${escapeHtml(n)}</span></div>`;
        })
        .join("");

      dBody.innerHTML = `
        <div class="seat-matrix">
          <div class="seat-matrix__head">
            <div class="seat-matrix__title">Seat Matrix</div>
            <div class="seat-matrix__total">Total: ${escapeHtml(seatRow.total || 0)}</div>
          </div>
          <div class="seat-matrix__grid">${items}</div>
          ${reservationHtml}
        </div>
      `;
      return;
    }

    // cutoff
    const head = `
      <div class="subbar" style="margin-top:0;margin-bottom:8px">
        <div class="seg" role="tablist" aria-label="Cutoff mode">
          <button class="${state.mode === "ugeac" ? "active" : ""}" type="button" data-mode="ugeac">UGEAC</button>
          <button class="${state.mode === "jee" ? "active" : ""}" type="button" data-mode="jee">JEE AIR</button>
        </div>
        <div class="count-pill">Category: <b style="color:var(--text)">${escapeHtml(state.cat)}</b></div>
      </div>
      <div style="background:var(--bg-gray);border:1px solid var(--border);border-radius:14px;padding:12px;color:var(--text-secondary);font-size:.85rem;line-height:1.6">
        📌 Opening = R1 min rank · Closing = R2 max rank · ${state.mode === "ugeac" ? "UGEAC UR Rank shown as UR-XXXXX" : "JEE AIR shown"}
      </div>
    `;

    const accordions = branches
      .map((b) => {
        const data = cuts.filter((r) => r.b === b);
        const row = data.find((r) => r.c === state.cat);
        const isOpen = state.expBranch === b;
        const op = state.mode === "ugeac" ? row?.uo : row?.jo;
        const cl = state.mode === "ugeac" ? row?.uc : row?.jc;
        return `
          <div class="cutoff-accordion">
            <button class="cutoff-head" type="button" data-branch="${escapeHtml(b)}">
              <div style="text-align:left">
                <div class="cutoff-title">${escapeHtml(sh(b))}</div>
                ${
                  row && op != null
                    ? `<div class="cutoff-sub">${escapeHtml(state.cat)}: ${
                        state.mode === "ugeac" ? escapeHtml(fmtR(op)) : escapeHtml(fmt(op))
                      } → <b style="color:var(--blue)">${
                        state.mode === "ugeac" ? escapeHtml(fmtR(cl)) : escapeHtml(fmt(cl))
                      }</b> · ${escapeHtml(row.s)} seats</div>`
                    : `<div class="cutoff-sub">No ${escapeHtml(state.cat)} data</div>`
                }
              </div>
              <div style="color:var(--text-secondary);font-weight:900">${isOpen ? "▲" : "▼"}</div>
            </button>
            <div class="cutoff-table ${isOpen ? "show" : ""}">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style="text-align:right">Opening</th>
                    <th style="text-align:right">Closing</th>
                    <th style="text-align:right">Seats</th>
                  </tr>
                </thead>
                <tbody>
                  ${data
                    .slice()
                    .sort((a, b2) =>
                      state.mode === "ugeac" ? (a.uo || 9e9) - (b2.uo || 9e9) : (a.jo || 9e9) - (b2.jo || 9e9)
                    )
                    .map((r) => {
                      const op2 = state.mode === "ugeac" ? r.uo : r.jo;
                      const cl2 = state.mode === "ugeac" ? r.uc : r.jc;
                      const hilite = r.c === state.cat;
                      return `
                        <tr style="background:${hilite ? "var(--blue-light)" : "white"}">
                          <td>
                            <span class="cat-dot" style="background:${escapeHtml(cColor(r.c))}"></span>${escapeHtml(r.c)}
                          </td>
                          <td class="num">${state.mode === "ugeac" ? escapeHtml(fmtR(op2)) : escapeHtml(fmt(op2))}</td>
                          <td class="num" style="font-weight:900;color:var(--blue-dark)">${state.mode === "ugeac" ? escapeHtml(fmtR(cl2)) : escapeHtml(fmt(cl2))}</td>
                          <td class="num">${escapeHtml(r.s)}</td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `;
      })
      .join("");

    dBody.innerHTML = head + accordions;
  }

  // Events
  dTabs.addEventListener("click", (e) => {
    const b = e.target.closest(".detail-tab");
    if (!b) return;
    setTab(b.getAttribute("data-tab"));
  });

  dBody.addEventListener("click", (e) => {
    // cutoff mode segment inside page
    const segBtn = e.target.closest(".seg button[data-mode]");
    if (segBtn) {
      setMode(segBtn.getAttribute("data-mode"));
      renderBody();
      return;
    }

    const head = e.target.closest(".cutoff-head");
    if (!head) return;
    const br = head.getAttribute("data-branch");
    state.expBranch = state.expBranch === br ? null : br;
    renderBody();
  });

  // Init
  renderHeader();
  renderTabs();
  renderBody();
})();
