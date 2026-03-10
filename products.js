/**
 * ================================================================
 * MOUSSA BUSINESS — products.js
 * ================================================================
 * Ce fichier est la SOURCE DE VÉRITÉ pour tous les produits.
 * Il contient :
 *   - La définition des couleurs (Slim Fit & Compression)
 *   - La définition des modèles de base
 *   - Les stocks initiaux (STOCK_DEFAULTS)
 *   - La génération du catalogue plat (PRODUCTS)
 *   - Le module StockManager (lecture/écriture localStorage)
 *
 * Règle d'architecture :
 *   ┌──────────────────┐     charge au démarrage     ┌──────────────────────┐
 *   │   products.js    │ ──────────────────────────► │  localStorage        │
 *   │  (source vérité) │   si clé absente seulement  │  mb_stock_v1         │
 *   └──────────────────┘                             └──────────────────────┘
 *         ▲                                                   │
 *         │ référence catalogue                               │ stock live
 *         └───────────────── index.html ◄────────────────────┘
 * ================================================================
 */

'use strict';

// ================================================================
//  IMAGES — Mapping couleur → fichier image (chemin relatif)
//  Les images sont dans images/slim fits/ et images/compressions/
//  Si aucune image n'est trouvée pour une couleur, on affiche
//  le fond coloré (h) comme avant (comportement de fallback).
// ================================================================

/**
 * getProductImage(cat, colorName)
 * Retourne le chemin relatif de l'image pour un produit donné.
 * @param  {string} cat       — 'slim' ou 'compression'
 * @param  {string} colorName — nom de la couleur (ex: 'Noir', 'Bleu Ciel')
 * @returns {string|null}     — chemin relatif ou null si aucune image
 */
function getProductImage(cat, colorName) {
  // Mapping : clé = "cat:couleur normalisée", valeur = chemin relatif
  const IMG_MAP = {
    // ── Slim Fit ──
    'slim:blanc':       'images/slim fits/slim blanc.webp',
    'slim:noir':        'images/slim fits/slim noir.webp',
    'slim:bleu ciel':   'images/slim fits/slim bleu ciel.webp',
    'slim:bleu marine': 'images/slim fits/slim bleu nuit.webp',
    'slim:bleu royal':  'images/slim fits/slim bleu.webp',
    'slim:vert foncé':  'images/slim fits/slim vert mili.webp',
    'slim:vert olive':  'images/slim fits/slim vert.webp',
    'slim:vert fluo':   'images/slim fits/slim vert fluo.webp', // fallback approché
    'slim:vert menthe': 'images/slim fits/slim vert menthe.webp',
    'slim:jaune':       'images/slim fits/slim jaune.webp',
    'slim:orange':      'images/slim fits/slim orange.webp',
    'slim:rouge':       'images/slim fits/slim rouge.webp',
    'slim:bordeaux':    'images/slim fits/slim bordeau.webp',
    'slim:rose vif':    'images/slim fits/slim rose.webp',
    'slim:rose clair':  'images/slim fits/slim rose clair.webp',
    'slim:gris':        'images/slim fits/slim gris.webp',
    'slim:marron':      'images/slim fits/slim maron.webp',
    'slim:beige':       'images/slim fits/slim beige.webp',
    'slim:pêche':       'images/slim fits/slim saumon.webp',
    'slim:violet':      'images/slim fits/slim violet.webp',
    'slim:turquoise':   'images/slim fits/slim turquoise.webp',

    // ── Compression ──
    'compression:noir':       'images/compressions/compression noir.webp',
    'compression:bleu ciel':  'images/compressions/compression bleu claire.webp',
    'compression:rose vif':   'images/compressions/compression rose.webp',
    'compression:rouge':      'images/compressions/compression rouge.webp',
    'compression:violet':     'images/compressions/compression violet.webp',
    'compression:vert menthe':'images/compressions/compression vert menthe.webp',
    'compression:blanche':    'images/compressions/compression blanc.webp',
    'compression:anthracite': 'images/compressions/compression gris.webp',
    'compression:grey':       'images/compressions/compression grey.webp',
    'compression:vert mili':  'images/compressions/compression vert mili.webp'

    ,
    // ── Maillots ──
    'maillot:psg domicile':       'images/maillots/maillot paris.webp',
    'maillot:psg extérieur':      'images/maillots/maillot paris ext.webp',
    'maillot:barça domicile':     'images/maillots/maillot barca.webp',
    'maillot:barça extérieur':    'images/maillots/maillot barca ext.webp',
    'maillot:real madrid dom.':   'images/maillots/maillot real.webp',
    'maillot:real madrid ext.':   'images/maillots/maillot real ext.webp',
    'maillot:liverpool dom.':     'images/maillots/maillot liv.webp',
    'maillot:liverpool ext.':     'images/maillots/maillot liv ext.webp',
    'maillot:manchester utd':     'images/maillots/maillot united.webp',
    'maillot:man utd third':      'images/maillots/maillot united third.webp',
    'maillot:man city':           'images/maillots/maillot city.webp',
    'maillot:chelsea dom.':       'images/maillots/maillot chelsea .webp',
    'maillot:chelsea ext.':       'images/maillots/maillot chelsea ext.webp',
    'maillot:bayern dom.':        'images/maillots/maillot bayer.webp',
    'maillot:bayern ext.':        'images/maillots/maillot bayern ext.webp',
    'maillot:marseille dom.':     'images/maillots/maillot marseille.webp',
    'maillot:marseille ext.':     'images/maillots/maillot marseille ext.webp',
    'maillot:aston villa':        'images/maillots/maillot aston.webp',
    'maillot:astou villa sp.':    'images/maillots/maillot astou villa.webp',
    'maillot:stoke city':         'images/maillots/maillot stok city.webp',
  };

  const key = `${cat}:${colorName.toLowerCase()}`;
  return IMG_MAP[key] || null;
}

// ================================================================
//  1. COULEURS SLIM FIT
//     20 couleurs disponibles, tailles variables selon la couleur
// ================================================================
const SLIM_COLORS = [
  { n: 'Blanc',      h: '#F5F5F5' },
  { n: 'Noir',       h: '#111111' },
  { n: 'Bleu Ciel',  h: '#87CEEB' },
  { n: 'Bleu Marine',h: '#1A237E' },
  { n: 'Bleu Royal', h: '#2962FF' },
  { n: 'Vert Foncé', h: '#1B5E20' },
  { n: 'Vert Olive', h: '#556B2F' },
  { n: 'Vert Fluo',  h: '#CCFF00' },
  { n: 'Vert Menthe',h: '#ADEBB3' },
  { n: 'Jaune',      h: '#FFD600' },
  { n: 'Orange',     h: '#FFA726' },
  { n: 'Rouge',      h: '#C62828' },
  { n: 'Bordeaux',   h: '#8E2430' },
  { n: 'Rose Clair', h: '#F8BBD0' },
  { n: 'Rose Vif',   h: '#FF4081' },
  { n: 'Gris',       h: '#9E9E9E' },
  { n: 'Marron',     h: '#713600' },
  { n: 'Beige',      h: '#FFF3E0' },
  { n: 'Pêche',      h: '#FFCCBC' },
  { n: 'Violet',     h: '#7B1FA2' }
].map(c => ({
  ...c,
  // Blanc & Noir ont toutes les tailles, les autres ont S→XXL
  sizes: (c.n === 'Blanc' || c.n === 'Noir')
    ? ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    : ['M', 'L', 'XL', 'XXL', 'XXXL']
}));

// ================================================================
//  2. COULEURS COMPRESSION
//     10 couleurs disponibles
// ================================================================
const COMP_COLORS = [
  { n: 'Noir',       h: '#111111', sizes: ['S','M','L'] },
  { n: 'Bleu Ciel',  h: '#87CEEB', sizes: ['S','M','L'] },
  { n: 'Rose Vif',   h: '#FF4081', sizes: ['S','M','L'] },
  { n: 'Rouge',      h: '#E53935', sizes: ['S','M','L'] },
  { n: 'Violet',     h: '#7B1FA2', sizes: ['S','M','L'] },
  { n: 'Vert Menthe',h: '#ADEBB3', sizes: ['S','M','L'] },
  { n: 'Blanche',    h: '#F5F5F5', sizes: ['S','M','L'] },
  { n: 'Anthracite', h: '#37474F', sizes: ['S','M','L'] },
  { n: 'Grey',       h: '#9E9E9E', sizes: ['S','M','L'] },
  { n: 'Vert Mili',  h: '#1B5E20', sizes: ['S','M','L'] }
];

// ================================================================
//  3. COULEURS MAILLOTS DE FOOTBALL
//     21 maillots disponibles — chaque "couleur" = un club/version
// ================================================================
const MAILLOT_COLORS = [
  { n: 'PSG Domicile',      h: '#1a1a5e' },
  { n: 'PSG Extérieur',     h: '#d4af37' },
  { n: 'Barça Domicile',    h: '#a50044' },
  { n: 'Barça Extérieur',   h: '#edbb00' },
  { n: 'Real Madrid Dom.',  h: '#f5f5f5' },
  { n: 'Real Madrid Ext.',  h: '#2e4057' },
  { n: 'Liverpool Dom.',    h: '#c8102e' },
  { n: 'Liverpool Ext.',    h: '#006040' },
  { n: 'Manchester Utd',    h: '#da291c' },
  { n: 'Man Utd Third',     h: '#1c2b4a' },
  { n: 'Man City',          h: '#6cabdd' },
  { n: 'Chelsea Dom.',      h: '#034694' },
  { n: 'Chelsea Ext.',      h: '#fff200' },
  { n: 'Bayern Dom.',       h: '#dc052d' },
  { n: 'Bayern Ext.',       h: '#0066b2' },
  { n: 'Marseille Dom.',    h: '#009ac7' },
  { n: 'Marseille Ext.',    h: '#1a1a1a' },
  { n: 'Aston Villa',       h: '#670e36' },
  { n: 'Astou Villa Sp.',   h: '#95bfe5' },
  { n: 'Stoke City',        h: '#e03a3e' },
].map(c => ({ ...c, sizes: ['M', 'L', 'XL', 'XXL'] }));

// ================================================================
//  4. MODÈLES DE BASE
//     Chaque modèle sera décliné en autant de produits que de couleurs
// ================================================================
const BASE_MODELS = [
  {
    idBase:     1,
    name:       'T-shirt Slim Fit',
    cat:        'slim',
    desc:       'T-shirt Slim Fit en tissu stretch respirant 4 directions. Coupe ajustée qui met en valeur la silhouette. Idéal sport & musculation.',
    basePrice:  3000,
    promoPrice: 2500,   // prix promo si commande groupée
    promoQty:   4,      // quantité minimale pour la promo
    colors:     SLIM_COLORS
  },
  {
    idBase:     2,
    name:       'T-shirt Compression',
    cat:        'compression',
    desc:       'Compression optimale pour améliorer vos performances. Tissu technique séchage ultra-rapide, maintien musculaire parfait.',
    basePrice:  4000,
    promoPrice: null,
    promoQty:   null,
    colors:     COMP_COLORS
  },
  {
    idBase:     3,
    name:       'Maillot Football',
    cat:        'maillot',
    desc:       'Réplica premium des plus grands clubs européens. Tissu polyester respirant, broderies officielles, coupe authentique.',
    basePrice:  8000,
    promoPrice: null,
    promoQty:   null,
    colors:     MAILLOT_COLORS
  }
];

// ================================================================
//  4. STOCKS INITIAUX (STOCK_DEFAULTS)
//     ► Ces valeurs sont utilisées UNE SEULE FOIS au 1er chargement
//       pour initialiser localStorage.
//     ► Pour modifier un stock, changez-le ici ET réinitialisez
//       le localStorage (ou incrémentez MB_STOCK_VERSION).
//
//     Structure : { [productId]: quantité }
//     Produit id = "{idBase}-{colorIndex}"
//       ex : "1-0" = Slim Fit Blanc, "2-3" = Compression Rouge
// ================================================================
const STOCK_DEFAULTS = {
  // ── Slim Fit (idBase 1, couleurs 0→19) ──
  '1-0':  25,  // Blanc
  '1-1':  12,  // Noir
  '1-2':  1,  // Bleu Ciel
  '1-3':  25,  // Bleu Marine
  '1-4':  25,  // Bleu Royal
  '1-5':  25,  // Vert Foncé
  '1-6':  25,  // Vert Olive  ← stock faible
  '1-7':  5,  // Vert Fluo
  '1-8':  25,  // Vert Menthe
  '1-9':  25,  // Jaune
  '1-10': 25,  // Orange      ← rupture
  '1-11': 25,  // Rouge
  '1-12': 25,  // Bordeaux
  '1-13': 10,  // Rose Clair
  '1-14': 25,  // Rose Vif
  '1-15': 12,  // Gris        ← rupture
  '1-16': 7,  // Marron
  '1-17': 25,  // Beige
  '1-18': 5,  // Pêche       ← stock faible
  '1-19': 10,  // Violet

  // ── Compression (idBase 2, couleurs 0→7) ──
  '2-0':  10,  // Noir
  '2-1':  10,  // Marine
  '2-2':  10,  // Gris        ← rupture
  '2-3':  10,  // Rouge
  '2-4':  10,  // Bleu Roi
  '2-5':  10,  // Vert Nuit   ← stock faible
  '2-6':  10,  // Bordeaux    ← rupture
  '2-7':  10,  // Anthracite
  '2-8':  10,  // Grey
  '2-9':  10,  // Vert Mili

  // ── Maillots (idBase 3, couleurs 0→20) ──
  '3-0':  5,   // PSG Domicile
  '3-1':  5,   // PSG Extérieur
  '3-2':  5,   // Barça Domicile
  '3-3':  5,   // Barça Extérieur
  '3-4':  5,   // Real Madrid Dom.
  '3-5':  5,   // Real Madrid Ext.
  '3-6':  5,   // Liverpool Dom.
  '3-7':  5,   // Liverpool Ext.
  '3-8':  5,   // Manchester Utd
  '3-9':  5,   // Man Utd Third
  '3-10': 5,   // Man City
  '3-11': 5,   // Chelsea Dom.
  '3-12': 5,   // Chelsea Ext.
  '3-13': 5,   // Bayern Dom.
  '3-14': 5,   // Bayern Ext.
  '3-15': 5,   // Marseille Dom.
  '3-16': 5,   // Marseille Ext.
  '3-17': 5,   // Aston Villa
  '3-18': 5,   // Astou Villa Sp.
  '3-19': 5,   // Stoke City
  '3-20': 3    // Blouson SN
};

// ================================================================
//  5. GÉNÉRATION DU CATALOGUE PLAT (PRODUCTS)
//     Chaque combinaison modèle × couleur devient un produit unique.
//     Le stock n'est PAS inclus ici — il est géré par StockManager.
//     La propriété `stock` du produit est une lecture en temps réel.
// ================================================================
const PRODUCTS = [];
BASE_MODELS.forEach(model => {
  model.colors.forEach((color, idx) => {
    const id = `${model.idBase}-${idx}`;
    PRODUCTS.push({
      id,
      baseId:     model.idBase,
      name:       `${model.name} - ${color.n}`,
      cat:        model.cat,
      desc:       model.desc,
      basePrice:  model.basePrice,
      promoPrice: model.promoPrice,
      promoQty:   model.promoQty,
      color,
      sizes:      color.sizes,
      reviews:    [],
      // [IMAGES] Chemin relatif de l'image produit (null = fallback couleur)
      image:      getProductImage(model.cat, color.n),

      /**
       * stock — propriété calculée dynamiquement.
       * Lecture depuis StockManager (localStorage) si disponible,
       * sinon fallback sur STOCK_DEFAULTS.
       * Défini comme getter après init de StockManager (voir bas du fichier).
       */
      get stock() {
        return StockManager.get(this.id);
      }
    });
  });
});

// ================================================================
//  6. STOCKMANAGER — Module de gestion du stock via localStorage
// ================================================================

/**
 * Clé localStorage utilisée pour stocker les stocks.
 * Incrémenter MB_STOCK_VERSION force une réinitialisation complète.
 */
const MB_STOCK_KEY     = 'mb_stock_v2';
const MB_STOCK_VERSION = 2; // ← incrémenté pour forcer la réinitialisation avec les maillots

const StockManager = {

  /**
   * _cache — copie en mémoire des stocks pour éviter des appels
   * localStorage répétés à chaque lecture de carte produit.
   * @type {Object.<string, number>}
   */
  _cache: null,

  // ──────────────────────────────────────────────────────────────
  //  INIT — Appelé au démarrage depuis index.html
  // ──────────────────────────────────────────────────────────────

  /**
   * init()
   * Charge les stocks depuis localStorage.
   * Si la clé n'existe pas (premier lancement) ou si la version a changé,
   * initialise avec STOCK_DEFAULTS et sauvegarde dans localStorage.
   */
  init() {
    let stored = null;
    try {
      const raw = localStorage.getItem(MB_STOCK_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {
      console.warn('[StockManager] Erreur lecture localStorage:', e);
    }

    if (stored && stored.__version === MB_STOCK_VERSION) {
      // Stocks déjà initialisés et version correspondante → on les charge
      this._cache = stored.data;
      console.info('[StockManager] Stocks chargés depuis localStorage ✓');
    } else {
      // Premier lancement ou version obsolète → on initialise depuis STOCK_DEFAULTS
      this._cache = { ...STOCK_DEFAULTS };
      this._persist();
      console.info('[StockManager] Stocks initialisés depuis STOCK_DEFAULTS ✓');
    }
  },

  // ──────────────────────────────────────────────────────────────
  //  LECTURE
  // ──────────────────────────────────────────────────────────────

  /**
   * get(productId)
   * Retourne la quantité disponible pour un produit.
   * Fallback sur STOCK_DEFAULTS si le cache n'est pas encore prêt.
   * @param  {string} productId
   * @returns {number}
   */
  get(productId) {
    if (!this._cache) {
      // Cache pas encore initialisé → on utilise les defaults
      return STOCK_DEFAULTS[productId] !== undefined
        ? STOCK_DEFAULTS[productId]
        : 0;
    }
    return this._cache[productId] !== undefined
      ? this._cache[productId]
      : 0;
  },

  /**
   * getStatus(productId)
   * Retourne le statut du stock sous forme d'objet lisible.
   * @param  {string} productId
   * @returns {{ qty: number, status: 'ok'|'low'|'soldout' }}
   */
  getStatus(productId) {
    const qty = this.get(productId);
    let status;
    if (qty === 0)    status = 'soldout';
    else if (qty <= 3) status = 'low';
    else               status = 'ok';
    return { qty, status };
  },

  // ──────────────────────────────────────────────────────────────
  //  ÉCRITURE
  // ──────────────────────────────────────────────────────────────

  /**
   * decrease(productId, qty)
   * Réduit le stock d'un produit de `qty` unités.
   * Ne passe jamais en dessous de 0.
   * Persiste immédiatement dans localStorage.
   * @param  {string} productId
   * @param  {number} qty       — nombre d'unités à retirer (défaut : 1)
   * @returns {number}          — nouveau stock
   */
  decrease(productId, qty = 1) {
    if (!this._cache) return 0;
    const current = this.get(productId);
    const newQty  = Math.max(0, current - qty);
    this._cache[productId] = newQty;
    this._persist();
    console.info(`[StockManager] ${productId}: ${current} → ${newQty}`);
    return newQty;
  },

  /**
   * set(productId, qty)
   * Force une quantité (utile pour admin / réapprovisionnement).
   * @param  {string} productId
   * @param  {number} qty
   */
  set(productId, qty) {
    if (!this._cache) return;
    this._cache[productId] = Math.max(0, qty);
    this._persist();
  },

  /**
   * reset()
   * Remet tous les stocks à leurs valeurs initiales (STOCK_DEFAULTS).
   * Utile pour les tests ou un administrateur.
   */
  reset() {
    this._cache = { ...STOCK_DEFAULTS };
    this._persist();
    console.info('[StockManager] Stocks réinitialisés ✓');
  },

  // ──────────────────────────────────────────────────────────────
  //  PERSISTANCE (privé)
  // ──────────────────────────────────────────────────────────────

  /**
   * _persist()
   * Sauvegarde le cache courant dans localStorage.
   * Inclut un numéro de version pour détecter les migrations futures.
   */
  _persist() {
    try {
      localStorage.setItem(MB_STOCK_KEY, JSON.stringify({
        __version: MB_STOCK_VERSION,
        data: this._cache
      }));
    } catch (e) {
      console.warn('[StockManager] Impossible de sauvegarder le stock:', e);
    }
  }
};

// ================================================================
//  EXPORTS (accès global depuis index.html)
//  Les variables suivantes sont disponibles dans window :
//    - PRODUCTS       → tableau complet des produits (stock via getter)
//    - StockManager   → module de gestion du stock
//    - STOCK_DEFAULTS → valeurs initiales (lecture seule)
// ================================================================
// (Pas de module ES — compatibilité maximale avec le projet HTML pur)
