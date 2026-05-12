// ================================================================
//  MOUSSA BUSINESS — promo.js | PROMO TABASKI 2026
// ================================================================
"use strict";

const Promo = {
  SLIM_PROMO_PRICE: 2500,
  SLIM_ORIGINAL_PRICE: 5000,

  init() {
    this.startCountdown();
    this.updateBadges();
  },

  startCountdown() {
    const el = document.getElementById("promo-countdown");
    if (!el) return;
    const updateTimer = () => {
      const now = new Date();
      // Promo active jusqu'à nouvel ordre — afficher temps écoulé depuis début
      const start = new Date("2026-05-01T00:00:00");
      const diff = now - start;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      el.innerHTML = `<span>${days}j</span> <span>${hours}h</span> <span>${mins}m</span>`;
    };
    updateTimer();
    setInterval(updateTimer, 60000);
  },

  updateBadges() {
    // Les badges sont gérés dans le rendu des cartes produit
  },

  getSlimDiscount() {
    const discount = Math.round((1 - this.SLIM_PROMO_PRICE / this.SLIM_ORIGINAL_PRICE) * 100);
    return discount;
  },

  formatPrice(p) {
    return Number(p).toLocaleString("fr-FR") + " FCFA";
  }
};
