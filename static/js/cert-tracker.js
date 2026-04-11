/* ──────────────────────────────────────────
   Cert Exam Change Tracker — JavaScript
   ────────────────────────────────────────── */

(function () {
  "use strict";

  const DATA_URL = "/data/cert-tracker/latest.json";
  const DETAIL_BASE = "/data/cert-tracker/exams/";
  const CACHE_KEY = "cert-tracker-v1";

  let allExams = [];
  let categories = [];

  // ── Init ──
  async function init() {
    try {
      const data = await fetchData();
      allExams = data.exams || [];
      categories = data.categories || [];
      renderCategoryChips();
      renderStats(data);
      renderFreshness(data);
      applyFilters();
      bindEvents();
    } catch (err) {
      document.getElementById("cert-grid").innerHTML =
        '<div class="cert-no-results">⚠️ Failed to load exam data. Please try again later.</div>';
      console.error("Cert Tracker init failed:", err);
    }
  }

  async function fetchData() {
    // Check sessionStorage cache
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Date.now() - parsed._cachedAt < 30 * 60 * 1000) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }

    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    data._cachedAt = Date.now();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* quota */ }
    return data;
  }

  // ── Render ──
  function renderStats(data) {
    const el = document.getElementById("cert-stats");
    el.innerHTML = `
      <div>📊 <span>${data.exam_count}</span> exams tracked</div>
      <div>📂 <span>${data.categories.length}</span> categories</div>
      <div>🔄 <span>${data.total_changes}</span> changes detected</div>
    `;
  }

  function renderFreshness(data) {
    const el = document.getElementById("cert-freshness");
    if (data.generated_at) {
      const d = new Date(data.generated_at);
      el.textContent = `Data generated: ${d.toLocaleDateString("en-NZ", { dateStyle: "medium" })} • Checked weekly on Sundays`;
    }
  }

  function renderCategoryChips() {
    const el = document.getElementById("cert-chips");
    const chips = [{ label: "All", value: "all" }];
    const catEmoji = {
      Azure: "☁️", AI: "🤖", Data: "📊", Security: "🔒",
      "Microsoft 365": "📧", "Power Platform": "⚡", "Dynamics 365": "💼"
    };
    categories.forEach((c) => chips.push({ label: `${catEmoji[c] || "📋"} ${c}`, value: c }));

    el.innerHTML = chips
      .map(
        (c) =>
          `<button class="cert-chip${c.value === "all" ? " active" : ""}" data-cat="${c.value}">${c.label}</button>`
      )
      .join("");

    el.querySelectorAll(".cert-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        el.querySelectorAll(".cert-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        // Sync dropdown
        document.getElementById("cert-category-filter").value = btn.dataset.cat;
        applyFilters();
      });
    });
  }

  function renderGrid(exams) {
    const grid = document.getElementById("cert-grid");
    if (!exams.length) {
      grid.innerHTML = '<div class="cert-no-results">No exams match your filters. Try a different search.</div>';
      return;
    }

    grid.innerHTML = exams.map((e) => renderCard(e)).join("");

    // Bind card clicks
    grid.querySelectorAll(".cert-card").forEach((card) => {
      card.addEventListener("click", () => openExamDetail(card.dataset.code));
    });
  }

  function renderCard(exam) {
    const levelLabel = { beginner: "Fundamentals", intermediate: "Associate", advanced: "Expert" };
    const skillsHtml = (exam.skills_at_a_glance || [])
      .map(
        (s) =>
          `<div class="cert-skill-item"><span>${s.area}</span><span class="cert-skill-weight">${s.weight}</span></div>`
      )
      .join("");

    return `
      <article class="cert-card${exam.has_changes ? " cert-card-changed" : ""}" data-code="${exam.code}" tabindex="0" role="button" aria-label="View ${exam.code} details">
        <div class="cert-card-header">
          <span class="cert-card-code">${exam.code}</span>
          <span class="cert-card-title">${exam.title}</span>
        </div>
        <div class="cert-card-meta">
          <span class="cert-badge cert-badge-${exam.level}">${levelLabel[exam.level] || exam.level}</span>
          <span class="cert-badge cert-badge-category">${exam.category}</span>
        </div>
        <div class="cert-card-skills">${skillsHtml}</div>
        <div class="cert-card-footer">
          <span class="cert-card-objectives">${exam.total_objectives} objectives</span>
          <span>${exam.skills_date || "—"}</span>
        </div>
      </article>
    `;
  }

  // ── Filtering ──
  function applyFilters() {
    const search = document.getElementById("cert-search").value.toLowerCase().trim();
    const category = document.getElementById("cert-category-filter").value;
    const level = document.getElementById("cert-level-filter").value;

    let filtered = allExams;

    if (category !== "all") {
      filtered = filtered.filter((e) => e.category === category);
    }
    if (level !== "all") {
      filtered = filtered.filter((e) => e.level === level);
    }
    if (search) {
      filtered = filtered.filter((e) => {
        const haystack = `${e.code} ${e.title} ${e.category} ${e.level} ${(e.roles || []).join(" ")} ${(e.products || []).join(" ")}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    renderGrid(filtered);
  }

  // ── Exam detail modal ──
  async function openExamDetail(code) {
    const modal = document.getElementById("cert-modal");
    const body = document.getElementById("cert-modal-body");
    body.innerHTML = '<div class="cert-skeleton"><div class="cert-skeleton-row"></div></div>';
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    try {
      const resp = await fetch(`${DETAIL_BASE}${code.toLowerCase()}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const exam = await resp.json();
      body.innerHTML = renderExamDetail(exam);
      bindDetailEvents(body);
    } catch (err) {
      body.innerHTML = `<div class="cert-no-results">⚠️ Could not load details for ${code}</div>`;
    }
  }

  function closeModal() {
    document.getElementById("cert-modal").hidden = true;
    document.body.style.overflow = "";
  }

  function renderExamDetail(exam) {
    const levelLabel = { beginner: "Fundamentals", intermediate: "Associate", advanced: "Expert" };
    const glanceHtml = (exam.skills_at_a_glance || [])
      .map((s) => `<div class="cert-skill-item"><span>${s.area}</span><span class="cert-skill-weight">${s.weight}</span></div>`)
      .join("");

    // Skills detailed
    let skillsHtml = "";
    for (const [area, subAreas] of Object.entries(exam.skills_detailed || {})) {
      let subHtml = "";
      for (const [subArea, bullets] of Object.entries(subAreas)) {
        const bulletItems = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");
        subHtml += `
          <div class="cert-skill-sub-area">
            <h5>${escapeHtml(subArea)}</h5>
            <ul>${bulletItems}</ul>
          </div>`;
      }
      skillsHtml += `
        <div class="cert-skill-area">
          <div class="cert-skill-area-header" role="button" tabindex="0">${escapeHtml(area)}</div>
          <div class="cert-skill-area-body" hidden>${subHtml}</div>
        </div>`;
    }

    // Change history
    let historyHtml = "";
    if (exam.change_history && exam.change_history.length) {
      historyHtml = exam.change_history
        .map((c) => `
          <div class="cert-change-entry">
            <div class="cert-change-date">${formatDate(c.detected_at)}</div>
            <div class="cert-change-summary">
              <span class="cert-change-added">+${c.added_count || 0}</span> added,
              <span class="cert-change-removed">-${c.removed_count || 0}</span> removed
            </div>
          </div>`)
        .join("");
    } else {
      historyHtml = '<div style="color: var(--cert-text-dim); font-size: 0.85rem;">No changes detected yet — tracking started recently.</div>';
    }

    // Official change log
    let officialLogHtml = "";
    if (exam.change_log_official && exam.change_log_official.length) {
      officialLogHtml = `
        <div class="cert-detail-section">
          <h3>📋 Official Change Log (from Microsoft)</h3>
          ${exam.change_log_official.map((c) => `
            <div class="cert-change-entry">
              <div class="cert-change-summary">${escapeHtml(c.skill_area_current || c.skill_area_previous || "")}</div>
              <div class="cert-change-date">${escapeHtml(c.change_type || "")}${c.description ? " — " + escapeHtml(c.description) : ""}</div>
            </div>`).join("")}
        </div>`;
    }

    return `
      <div class="cert-detail-header">
        <div class="cert-detail-code">${exam.code}</div>
        <div class="cert-detail-title">${escapeHtml(exam.title)}</div>
        <div class="cert-card-meta" style="margin-top: 0.5rem;">
          <span class="cert-badge cert-badge-${exam.level}">${levelLabel[exam.level] || exam.level}</span>
          <span class="cert-badge cert-badge-category">${exam.category}</span>
        </div>
        <div class="cert-detail-date">Skills measured as of: ${exam.skills_date || "Unknown"} • Last updated: ${formatDate(exam.updated_at)}</div>
      </div>

      <div class="cert-detail-links">
        <a href="${exam.exam_url}" target="_blank" rel="noopener" class="cert-detail-link">📝 Official Exam Page</a>
        <a href="${exam.study_guide_url}" target="_blank" rel="noopener" class="cert-detail-link">📖 Study Guide</a>
        ${exam.practice_assessment_url ? `<a href="${exam.practice_assessment_url}" target="_blank" rel="noopener" class="cert-detail-link">🎯 Practice Assessment</a>` : ""}
      </div>

      <div class="cert-detail-section">
        <h3>📊 Skills at a Glance</h3>
        <div class="cert-card-skills" style="font-size: 0.9rem;">${glanceHtml}</div>
      </div>

      <div class="cert-detail-section">
        <h3>📋 Skills Measured (click to expand)</h3>
        ${skillsHtml}
      </div>

      <div class="cert-detail-section">
        <h3>🔄 Change History (detected by our tracker)</h3>
        ${historyHtml}
      </div>

      ${officialLogHtml}
    `;
  }

  function bindDetailEvents(container) {
    // Expandable skill areas
    container.querySelectorAll(".cert-skill-area-header").forEach((header) => {
      header.addEventListener("click", () => {
        const body = header.nextElementSibling;
        const isExpanded = !body.hidden;
        body.hidden = isExpanded;
        header.classList.toggle("expanded", !isExpanded);
      });
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  // ── Events ──
  function bindEvents() {
    // Search with debounce
    let searchTimer;
    document.getElementById("cert-search").addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilters, 200);
    });

    // Dropdowns
    document.getElementById("cert-category-filter").addEventListener("change", () => {
      // Sync chips
      const val = document.getElementById("cert-category-filter").value;
      document.querySelectorAll(".cert-chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.cat === val);
      });
      applyFilters();
    });
    document.getElementById("cert-level-filter").addEventListener("change", applyFilters);

    // Populate category dropdown
    const catSelect = document.getElementById("cert-category-filter");
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      catSelect.appendChild(opt);
    });

    // Modal close
    document.getElementById("cert-modal-close").addEventListener("click", closeModal);
    document.getElementById("cert-modal-backdrop").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // Keyboard nav on cards
    document.getElementById("cert-grid").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.classList.contains("cert-card")) {
        openExamDetail(e.target.dataset.code);
      }
    });
  }

  // ── Helpers ──
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-NZ", { dateStyle: "medium" });
    } catch (e) {
      return dateStr;
    }
  }

  // ── Start ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
