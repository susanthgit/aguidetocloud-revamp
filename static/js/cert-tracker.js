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
      <div>📊 <span>${data.exam_count}</span> study guides</div>
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

    const catEmoji = {
      Azure: "☁️", AI: "🤖", Data: "📊", Security: "🔒",
      "Microsoft 365": "📧", "Power Platform": "⚡", "Dynamics 365": "💼"
    };

    // Group by category
    const groups = {};
    exams.forEach((e) => {
      const cat = e.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(e);
    });

    // Render each category group
    const catOrder = ["Azure", "AI", "Security", "Microsoft 365", "Data", "Power Platform", "Dynamics 365"];
    const sortedCats = Object.keys(groups).sort((a, b) => {
      const ia = catOrder.indexOf(a), ib = catOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    grid.innerHTML = sortedCats.map((cat) => {
      const cards = groups[cat].map((e) => renderCard(e)).join("");
      return `
        <div class="cert-category-group">
          <h3 class="cert-category-heading">${catEmoji[cat] || "📋"} ${cat} <span class="cert-category-count">(${groups[cat].length})</span></h3>
          <div class="cert-category-cards">${cards}</div>
        </div>`;
    }).join("");
  }

  function renderCard(exam) {
    const levelLabel = { beginner: "Fundamentals", intermediate: "Associate", advanced: "Expert" };
    const statusLabels = { active: "", retiring: "⚠️ Retiring", retired: "🚫 Retired", beta: "🧪 Beta", upcoming: "🔜 Upcoming" };
    const status = exam.status || "active";
    const statusBadge = status !== "active" ? `<span class="cert-badge cert-badge-${status}">${statusLabels[status]}</span>` : "";
    const statusClass = status !== "active" ? ` cert-card-${status}` : "";

    const skillsHtml = (exam.skills_at_a_glance || [])
      .map(
        (s) =>
          `<div class="cert-skill-item"><span>${s.area}</span><span class="cert-skill-weight">${s.weight}</span></div>`
      )
      .join("");

    const retireNote = (status === "retiring" && exam.retirement_date) ? `<div class="cert-card-status-note cert-card-status-retiring">⚠️ Retiring ${exam.retirement_date}${exam.replacement ? " → " + exam.replacement : ""}</div>` : "";
    const retiredNote = (status === "retired") ? `<div class="cert-card-status-note cert-card-status-retired">🚫 Retired${exam.replacement ? " → " + exam.replacement : ""}</div>` : "";
    const betaNote = (status === "beta") ? `<div class="cert-card-status-note cert-card-status-beta">🧪 Beta${exam.replaces ? " — replaces " + exam.replaces : ""}</div>` : "";

    const examUrl = `/cert-tracker/${exam.code.toLowerCase()}/`;
    const objCount = exam.total_objectives || 0;
    const ctaText = objCount > 0 ? "📖 View Study Guide →" : "📋 View Details →";

    return `
      <a href="${examUrl}" class="cert-card${exam.has_changes ? " cert-card-changed" : ""}${statusClass}" data-code="${exam.code}" aria-label="${exam.code} study guide">
        <div class="cert-card-header">
          <span class="cert-card-code">${exam.code}</span>
          <span class="cert-card-title">${exam.title}</span>
        </div>
        <div class="cert-card-meta">
          <span class="cert-badge cert-badge-${exam.level}">${levelLabel[exam.level] || exam.level}</span>
          <span class="cert-badge cert-badge-category">${exam.category}</span>
          ${statusBadge}
        </div>
        <div class="cert-card-skills">${skillsHtml}</div>
        ${retireNote}${retiredNote}${betaNote}
        <div class="cert-card-footer">
          <span class="cert-card-objectives">${objCount} objectives</span>
          <span>${exam.skills_date || "—"}</span>
        </div>
        <div class="cert-card-cta">${ctaText}</div>
      </a>
    `;
  }

  // ── Filtering ──
  function applyFilters() {
    const search = document.getElementById("cert-search").value.toLowerCase().trim();
    const category = document.getElementById("cert-category-filter").value;
    const level = document.getElementById("cert-level-filter").value;
    const statusEl = document.getElementById("cert-status-filter");
    const status = statusEl ? statusEl.value : "all";

    let filtered = allExams;

    if (category !== "all") {
      filtered = filtered.filter((e) => e.category === category);
    }
    if (level !== "all") {
      filtered = filtered.filter((e) => e.level === level);
    }
    if (status !== "all") {
      filtered = filtered.filter((e) => (e.status || "active") === status);
    }
    if (search) {
      filtered = filtered.filter((e) => {
        const haystack = `${e.code} ${e.title} ${e.category} ${e.level} ${e.status || ""} ${(e.roles || []).join(" ")} ${(e.products || []).join(" ")}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    renderGrid(filtered);
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
      const val = document.getElementById("cert-category-filter").value;
      document.querySelectorAll(".cert-chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.cat === val);
      });
      applyFilters();
    });
    document.getElementById("cert-level-filter").addEventListener("change", applyFilters);
    const statusFilter = document.getElementById("cert-status-filter");
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);

    // Populate category dropdown
    const catSelect = document.getElementById("cert-category-filter");
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      catSelect.appendChild(opt);
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
