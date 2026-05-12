// ================================================================
//  MOUSSA BUSINESS — favorites.js Premium 2026
// ================================================================
"use strict";

const FAV_KEY = "mb_favorites_v2026";

const Favorites = {
  _ids: new Set(),

  init() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      this._ids = new Set(raw ? JSON.parse(raw) : []);
    } catch { this._ids = new Set(); }
    this._dispatch();
  },

  _persist() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...this._ids])); } catch {}
  },

  _dispatch() {
    document.dispatchEvent(new CustomEvent("favoritesUpdated", {
      detail: { count: this._ids.size, ids: [...this._ids] }
    }));
  },

  has(id) { return this._ids.has(id); },

  toggle(id, productName) {
    if (this._ids.has(id)) {
      this._ids.delete(id);
      UI.showToast(`💔 Retiré des favoris`, "info");
    } else {
      this._ids.add(id);
      UI.showToast(`❤️ Ajouté aux favoris`, "success");
    }
    this._persist();
    this._dispatch();
    return this._ids.has(id);
  },

  getIds() { return [...this._ids]; },

  getCount() { return this._ids.size; },

  getProducts() {
    if (typeof PRODUCTS === "undefined") return [];
    const allProducts = [...PRODUCTS];
    if (typeof SNEAKER_PRODUCTS !== "undefined") allProducts.push(...SNEAKER_PRODUCTS);
    return allProducts.filter(p => this._ids.has(p.id));
  }
};
