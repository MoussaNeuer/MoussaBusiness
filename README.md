# Moussa Business - Mini App E-commerce

![Version](https://img.shields.io/badge/version-2.0.0-red.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-blue.svg)
![Mobile First](https://img.shields.io/badge/Mobile-First-brightgreen.svg)
![WhatsApp](https://img.shields.io/badge/Commande-WhatsApp-25D366.svg)

## 📱 Aperçu

**Moussa Business** est une mini-application e-commerce spécialisée dans la vente de t-shirts Slim Fit et vêtements de compression. Conçue avec une approche **mobile-first**, cette PWA (Progressive Web App) offre une expérience utilisateur fluide et sans friction, avec finalisation des commandes via WhatsApp.

![Aperçu](screenshot.png)

## ✨ Fonctionnalités

### 🛍️ Expérience d'achat
- **Catalogue produits** avec filtres (Slim Fit / Compression)
- **Recherche en temps réel** sur les produits
- **Page détail produit** avec :
  - Sélection de couleur (19+ couleurs pour Slim Fit)
  - Sélection de taille (XS à XXXL)
  - Quantité ajustable
  - Avis et notes (⭐)
- **Wishlist** pour sauvegarder vos favoris
- **Panier dynamique** avec compteur en temps réel

### 📱 Fonctionnalités avancées
- **Vidéos produits** - Aperçu vidéo des vêtements
- **Scan QR code** - Scanner pour accéder directement aux produits
- **Fly to cart** - Animation fluide lors de l'ajout au panier
- **Suggestions personnalisées** - Recommandations de produits similaires
- **Historique des commandes** - Suivi des achats effectués
- **Thème clair/sombre** - Bascule automatique avec animation flash

### 💬 Commande simplifiée
- **Finalisation via WhatsApp** - Message pré-rempli avec :
  - Récapitulatif des articles
  - Couleurs et tailles sélectionnées
  - Quantités et prix
  - Total de la commande
  - Réductions automatiques (Slim Fit : 2 500 F dès 4 pièces)

### 🌐 Progressive Web App (PWA)
- Installation sur l'écran d'accueil
- Mode hors-ligne
- Chargement ultra-rapide
- Notifications push (prêt à l'emploi)

## 🎨 Design & Animations

### Identité visuelle
- **Couleur principale** : Rouge (#E8391A)
- **Typographie** : 
  - Titres : Bebas Neue
  - Corps : Outfit
- **Interface** : Minimaliste, inspirée des apps natives

### Animations fluides
- Transition entre les pages avec effet de fondu
- Animation d'ajout au panier "fly to cart"
- Loader animé avec logo
- Effet de survol sur les cartes produits
- Bottom nav avec effet bounce
- Apparition progressive des éléments au scroll

## 🛠️ Stack Technique

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Variables, Flexbox, Grid, Animations
- **JavaScript** - ES6+, Manipulation DOM
- **Font Awesome 6** - Icônes vectorielles

### PWA
- **Manifest.json** - Configuration d'installation
- **Service Worker** - Cache et mode hors-ligne

### Hébergement
- Compatible **GitHub Pages**
- Compatible **Netlify**
- Compatible **Vercel**

## Structure des fichiers
`text`
moussa-business/
├── index.html          # Application principale
├── manifest.json       # Configuration PWA
├── sw.js              # Service Worker
├── icon-192.png       # Icône PWA 192x192
├── icon-512.png       # Icône PWA 512x512
└── README.md          # Documentation
