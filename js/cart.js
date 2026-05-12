// ================================================================
//  MOUSSA BUSINESS — cart.js Premium 2026
// ================================================================
"use strict";

const CART_KEY = "mb_cart_v2026";
const PROMO_SLIM_PRICE = 2500; // PROMO TABASKI

const Cart = {
  _items: [],

  init() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      this._items = raw ? JSON.parse(raw) : [];
    } catch { this._items = []; }
    this._dispatch();
  },

  _persist() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(this._items)); } catch {}
  },

  _dispatch() {
    document.dispatchEvent(new CustomEvent("cartUpdated", { detail: this.summary() }));
  },

  add(product, size, qty = 1) {
    const key = `${product.id}_${size}`;
    const existing = this._items.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      this._items.push({
        key,
        id: product.id,
        name: product.name,
        cat: product.cat,
        color: product.color?.n || "",
        size,
        qty,
        price: this._getPrice(product),
        image: product.image || null,
      });
    }
    this._persist();
    this._dispatch();
    UI.showToast(`✅ ${product.name} ajouté au panier`, "success");
    UI.animateCart();
  },

  _getPrice(product) {
    // PROMO TABASKI : tous les slim fits à 2500 FCFA
    if (product.cat === "slim") return PROMO_SLIM_PRICE;
    if (product.promoPrice) return product.promoPrice;
    return product.basePrice;
  },

  remove(key) {
    this._items = this._items.filter(i => i.key !== key);
    this._persist();
    this._dispatch();
  },

  updateQty(key, delta) {
    const item = this._items.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this._persist();
    this._dispatch();
  },

  clear() {
    this._items = [];
    this._persist();
    this._dispatch();
  },

  summary() {
    const count = this._items.reduce((s, i) => s + i.qty, 0);
    const total = this._items.reduce((s, i) => s + i.price * i.qty, 0);
    return { count, total, items: this._items };
  },

  getItems() { return this._items; },

  buildWhatsAppMessage() {
    const { items, total } = this.summary();
    if (!items.length) return "";
    let msg = "🛍️ *Commande Moussa Business*\n\n";
    items.forEach(item => {
      msg += `• *${item.name}*\n`;
      msg += `  Couleur: ${item.color} | Taille: ${item.size}\n`;
      msg += `  Qté: ${item.qty} × ${item.price.toLocaleString("fr-FR")} FCFA\n\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *Total: ${total.toLocaleString("fr-FR")} FCFA*\n\n`;
    msg += `📍 Livraison Dakar disponible\n`;
    msg += `💳 Paiement: Wave, Orange Money, Yas, Espèces`;
    return msg;
  },

  checkout() {
    const msg = this.buildWhatsAppMessage();
    if (!msg) { UI.showToast("Votre panier est vide", "error"); return; }
    const url = `https://wa.me/221777101383?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }
};
