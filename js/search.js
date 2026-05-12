// ================================================================
//  MOUSSA BUSINESS — search.js Premium 2026
// ================================================================
"use strict";

const Search = {
  _query: "",
  _debounceTimer: null,

  init() {
    const input = document.getElementById("search-input");
    if (!input) return;
    input.addEventListener("input", (e) => {
      this._query = e.target.value.trim();
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this.execute(), 280);
      const clearBtn = document.getElementById("search-clear");
      if (clearBtn) clearBtn.style.display = this._query ? "flex" : "none";
    });
    input.addEventListener("focus", () => this.showSuggestions());
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) this.hideSuggestions();
    });
  },

  clear() {
    this._query = "";
    const input = document.getElementById("search-input");
    if (input) input.value = "";
    const clearBtn = document.getElementById("search-clear");
    if (clearBtn) clearBtn.style.display = "none";
    this.hideSuggestions();
    App.filterProducts();
  },

  execute() {
    App.filterProducts();
    this.showSuggestions();
  },

  getQuery() { return this._query.toLowerCase(); },

  showSuggestions() {
    const q = this._query.toLowerCase();
    const box = document.getElementById("search-suggestions");
    if (!box || q.length < 2) { this.hideSuggestions(); return; }

    const suggestions = this._getSuggestions(q);
    if (!suggestions.length) { this.hideSuggestions(); return; }

    box.innerHTML = suggestions.map(s =>
      `<div class="suggestion-item" onclick="Search.selectSuggestion('${s.replace(/'/g, "\\'")}')">
        <i class="fa-solid fa-magnifying-glass"></i> ${s}
      </div>`
    ).join("");
    box.style.display = "block";
  },

  hideSuggestions() {
    const box = document.getElementById("search-suggestions");
    if (box) box.style.display = "none";
  },

  selectSuggestion(text) {
    this._query = text;
    const input = document.getElementById("search-input");
    if (input) input.value = text;
    this.hideSuggestions();
    this.execute();
  },

  _getSuggestions(q) {
    const all = [];
    if (typeof PRODUCTS !== "undefined") {
      PRODUCTS.forEach(p => {
        if (p.name.toLowerCase().includes(q)) all.push(p.name);
        if (p.cat.toLowerCase().includes(q)) all.push(p.cat);
        if (p.color?.n?.toLowerCase().includes(q)) all.push(p.color.n);
      });
    }
    if (typeof SNEAKER_PRODUCTS !== "undefined") {
      SNEAKER_PRODUCTS.forEach(p => {
        if (p.name.toLowerCase().includes(q)) all.push(p.name);
      });
    }
    const unique = [...new Set(all)].slice(0, 6);
    return unique;
  }
};
