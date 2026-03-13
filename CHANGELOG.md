# CHANGELOG — Moussa Business

## [2026-feat/claude-updates] — 2026-03-11

### Ajouté
- **`js/priceUtils.js`** — Logique de tarification automatique par préfixe de slug (`priceRules` + `getPriceFromName` + `formatPrice`). 9/9 tests unitaires OK.
- **`js/generateProductsFromImages.js`** — Générateur automatique de produits depuis `images/sneakers/`. Fonctionne en mode Node.js (écrit `data/products.json`) et navigateur (`window.sneakerProducts`).
- **`data/products.json`** — 33 produits sneakers générés automatiquement avec prix, catégorie, marque, tailles et couleurs.
- **`shop.html`** — Page boutique complète : recherche temps réel, filtres (catégorie, marque, budget), tri (prix↑↓, A→Z, nouveautés), tags de filtres actifs, pagination 12 produits/page, lazy loading, skeletons, ARIA.
- **`product.html`** — Fiche produit dynamique (`?slug=...`) : slider images avec miniatures, sélection taille, quantité, bouton panier, favoris, produits similaires.
- **`cart.html`** — Panier avec édition quantité (+/-), suppression, total FCFA, bouton « Commander via WhatsApp » avec message pré-rempli.
- **`favorites.html`** — Page des favoris persistés.
- **`js/cart.js`** — `CartDB` et `FavoritesDB` : IndexedDB avec fallback localStorage, API add/updateQty/remove/clear/getTotal.
- **`offline.html`** — Page de fallback hors-ligne.
- **Sections sneakers dans `index.html`** — « Sneakers Populaires » (6 cards), « Nouveautés » (4 cards), bannière CTA vers shop.html.

### Modifié
- **`sw.js`** — Version bumped (`moussa-v2026-2`). Nouvelles pages dans APP_SHELL. Navigation HTML → Network-First + fallback `offline.html`. Background Sync pour commandes hors-ligne (`orders-sync`).
- **`index.html`** — Injection des sections sneakers + chargement des scripts JS utilitaires.

### Technique
- Aucune dépendance lourde ajoutée (Vanilla JS ES6+ uniquement).
- Paramètres URL échappés (`escHtml`) pour prévenir XSS.
- Commits atomiques par fonctionnalité sur branche `feat/claude-updates`.

---

## [2.0.0] — 2025 (historique)
- Version initiale PWA avec Slim Fit, Compression, Maillots.
- Service Worker v2026-1, WhatsApp ordering, thème clair/sombre, PWA install banner.
