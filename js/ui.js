// ================================================================
//  MOUSSA BUSINESS — ui.js Premium 2026
// ================================================================
"use strict";

const UI = {
  _toastQueue: [],
  _toastActive: false,

  init() {
    this._setupScrollBehavior();
    this._setupTheme();
  },

  _setupScrollBehavior() {
    let lastScroll = 0;
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
      const current = window.scrollY;
      if (header) {
        header.classList.toggle("scrolled", current > 50);
        header.classList.toggle("hidden-nav", current > lastScroll && current > 200);
      }
      const fabWa = document.getElementById("fab-wa");
      if (fabWa) fabWa.classList.toggle("visible", current > 300);
      const scrollTop = document.getElementById("scroll-top");
      if (scrollTop) scrollTop.classList.toggle("visible", current > 400);
      lastScroll = current;
    }, { passive: true });
  },

  _setupTheme() {
    const saved = localStorage.getItem("mb_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    this.updateThemeIcon(saved);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mb_theme", next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon(theme) {
    const icon = document.getElementById("theme-icon");
    if (icon) icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  },

  showToast(message, type = "info") {
    this._toastQueue.push({ message, type });
    if (!this._toastActive) this._nextToast();
  },

  _nextToast() {
    if (!this._toastQueue.length) { this._toastActive = false; return; }
    this._toastActive = true;
    const { message, type } = this._toastQueue.shift();
    const container = document.getElementById("toast-container");
    if (!container) { this._toastActive = false; return; }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => { toast.remove(); this._nextToast(); }, 300);
      }, 2800);
    });
  },

  animateCart() {
    const btn = document.querySelector(".cart-btn");
    if (!btn) return;
    btn.classList.add("cart-bounce");
    setTimeout(() => btn.classList.remove("cart-bounce"), 600);
  },

  navigate(page) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.classList.remove("active"));
    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Update bottom nav
    document.querySelectorAll(".bottom-nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.page === page);
    });
  },

  openSheet(id) {
    const sheet = document.getElementById(id);
    if (sheet) {
      sheet.classList.add("open");
      document.body.classList.add("sheet-open");
    }
  },

  closeSheet(id) {
    const sheet = document.getElementById(id);
    if (sheet) {
      sheet.classList.remove("open");
      document.body.classList.remove("sheet-open");
    }
  },

  skeleton(count = 8) {
    return Array(count).fill(0).map(() =>
      `<div class="product-card skeleton">
        <div class="card-image skeleton-box"></div>
        <div class="card-info">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line price"></div>
        </div>
      </div>`
    ).join("");
  }
};

// Global navigate helper
function navigate(page) { UI.navigate(page); }
function toggleTheme() { UI.toggleTheme(); }
