# Moussa Business - Mini App E-commerce

![Version](https://img.shields.io/badge/version-2.1.0-red.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-blue.svg)
![Mobile First](https://img.shields.io/badge/Mobile-First-brightgreen.svg)
![WhatsApp](https://img.shields.io/badge/Commande-WhatsApp-25D366.svg)

## 📱 Aperçu

**Moussa Business** est une PWA e-commerce mobile-first spécialisée dans la vente de t-shirts Slim Fit, vêtements de compression et **sneakers** (Nike, Adidas, Asics, New Balance, Crocs). Commandes finalisées via WhatsApp.

## ✨ Nouvelles fonctionnalités (v2.1 — feat/claude-updates)

### 👟 Boutique Sneakers
- **`shop.html`** — Boutique dédiée sneakers avec recherche, filtres (catégorie/marque/budget), tri, pagination (12/page), lazy loading, skeletons
- **`product.html?slug=...`** — Fiche produit dynamique : slider images, sélection taille/quantité, ajout panier, favoris, produits similaires
- **Génération automatique** des produits depuis `images/sneakers/` via `js/generateProductsFromImages.js`
- **Tarification par préfixe** : règles dans `js/priceUtils.js` (nike-mind007 → 45 000 FCFA, etc.)

### 🛒 Panier & Favoris améliorés
- **`cart.html`** — Édition quantité +/-, suppression, total FCFA, bouton « Commander via WhatsApp »
- **`favorites.html`** — Page dédiée aux favoris persistés
- **IndexedDB** (+ fallback localStorage) pour la persistance du panier et des favoris

### ⚙️ Service Worker amélioré
- Navigation HTML → Network-First + fallback `offline.html`
- Background Sync pour commandes hors-ligne (`orders-sync`)
- Nouvelles pages dans l'App Shell

## 🚀 Tester localement

```bash
# Option 1 : serveur Python (recommandé)
cd "moussa business"
python3 -m http.server 8080
# Ouvrir : http://localhost:8080

# Option 2 : extension VSCode Live Server
# Clic droit sur index.html → "Open with Live Server"
```

## 🔄 Regénérer data/products.json

Si vous ajoutez des images dans `images/sneakers/`, regénérez le catalogue :

```bash
node js/generateProductsFromImages.js
# → Affiche les produits générés + 9/9 tests priceRules
# → Écrit data/products.json
```

**Convention de nommage des images :**
```
<slug>-view1.webp   # vue principale (obligatoire)
<slug>-view2.webp   # vue secondaire (optionnel)
<slug>-thumb.webp   # miniature (fallback: view1)
```
Exemple : `nike-nocta-noir-view1.webp`, `nike-nocta-noir-view2.webp`

## 💰 Règles de prix (priceRules)

| Préfixe slug     | Prix FCFA  |
|-----------------|-----------|
| `nike-mind007`  | 45 000    |
| `nike-nocta`    | 20 000    |
| `adidas-yeezy`  |  8 000    |
| `air-force-1`   | 12 000    |
| `asics-gel-nyc` | 25 000    |
| `new-balance`   | 25 000    |
| `nike`          | 25 000    |
| `crampon`       | 20 000    |
| `crocs`         | 15 000    |

> ⚠️ L'ordre est important : les règles spécifiques (`nike-nocta`) doivent précéder les règles générales (`nike`).

## 📁 Structure des fichiers

```
moussa business/
├── index.html              # App principale (Slim/Compression/Maillots)
├── shop.html               # Boutique sneakers
├── product.html            # Fiche produit dynamique
├── cart.html               # Panier
├── favorites.html          # Favoris
├── offline.html            # Page hors-ligne
├── manifest.json           # Config PWA
├── sw.js                   # Service Worker v2026-2
├── products.js             # Source de vérité Slim/Compression/Maillots
├── data/
│   └── products.json       # Catalogue sneakers généré
├── js/
│   ├── priceUtils.js       # Règles de prix
│   ├── generateProductsFromImages.js  # Générateur produits
│   └── cart.js             # CartDB + FavoritesDB (IndexedDB)
└── images/
    └── sneakers/           # Images sneakers (33 fichiers .webp)
```

## ✅ Checklist QA manuelle

- [ ] `index.html` : hero affiché, sections Sneakers Populaires & Nouveautés visibles, CTA → shop.html fonctionne
- [ ] `shop.html` : 33 produits chargés, recherche filtre en temps réel, filtres catégorie/marque/budget OK, tri prix asc/desc OK, pagination OK
- [ ] `product.html?slug=nike-nocta-noir` : slider visible, prix = 20 000 FCFA, slider miniatures cliquable, produits similaires affichés
- [ ] `product.html?slug=adidas-yeezy` : prix = 8 000 FCFA (vérifier règle spécifique)
- [ ] `product.html?slug=nike-mind007-black` : prix = 45 000 FCFA
- [ ] Panier : ajouter produit → `cart.html` → qty +1/−1 → total recalculé → supprimer → vide
- [ ] WhatsApp : clic « Commander via WhatsApp » → message pré-rempli avec items FCFA
- [ ] Favoris : cœur rouge sur product → `favorites.html` → produit listé → retirer
- [ ] Offline : DevTools → Network → Offline → naviguer shop.html → `offline.html` s'affiche
- [ ] Sécurité : URL `?slug=<script>alert(1)</script>` → pas d'XSS (slug échappé)
- [ ] Thème sombre : toggle → tout en dark mode → rechargement → dark maintenu

## 🛠️ Stack Technique

- HTML5, CSS3 (variables, Grid, Flexbox), JavaScript ES6+ (Vanilla, pas de framework)
- Font Awesome 6, Google Fonts (Bebas Neue, Outfit)
- IndexedDB (CartDB/FavoritesDB) + fallback localStorage
- Service Worker (Stale-While-Revalidate, Cache-First, Network-First, Background Sync)
- Compatible GitHub Pages, Netlify, Vercel (site statique)

