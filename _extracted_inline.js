
    "use strict";
    // MB PERF: marque de début du script pour diagnostic de lenteur
    try { performance.mark && performance.mark('mb:script-start'); } catch (e) {}
    /* ═══════════════════════════════════════════════════
       MOUSSA BUSINESS 2026 — App Engine
    ═══════════════════════════════════════════════════ */

    /* ── CONSTANTS ── */
    const WA = "221777101383";
    const SLIM_PRICE_NORMAL = 3000;
    const SLIM_PRICE_BULK = 2500;
    const SLIM_BULK_QTY = 4;
    const CART_KEY = "mb_cart_v27";
    const FAV_KEY = "mb_fav_v27";
    const THEME_KEY = "mb_theme_v27";

    /* ── STATE ── */
    const S = { fil: "all", sort: "default", q: "", _prods: null };
    let checkoutState = {
      step: 1, // 1=cart 2=info 3=delivery 4=payment 5=confirm
      clientInfo: {},
      delivery: null,
      deliveryCost: 0,
      payment: null,
    };

    /* ── DELIVERY OPTIONS ── */
    const DELIVERY_OPTS = [
      { id: "boutique", name: "Retrait boutique", sub: "Disponible dès aujourd'hui", price: 0, icon: "fa-store" },
      { id: "centre", name: "Dakar Centre / Plateau / Maristes / Hann Bel-Air", sub: "Livraison 24-48h", price: 3500, icon: "fa-location-dot" },
      { id: "foire", name: "Foire / Parcelles / Pikine / Guédiawaye", sub: "Livraison 24-48h", price: 3000, icon: "fa-location-dot" },
      { id: "yoff", name: "Yoff / Almadies / Mamelles", sub: "Livraison 24-48h", price: 5000, icon: "fa-location-dot" },
      { id: "malika", name: "Malika / Yeumbeul", sub: "Livraison 24-72h", price: 2000, icon: "fa-location-dot" },
      { id: "keur", name: "Keur Massar", sub: "Livraison 24-72h", price: 1000, icon: "fa-location-dot" },
    ];

    const PAYMENT_OPTS = [
      { id: "wave", name: "Wave", icon: "wave_money", emoji: "🌊" },
      { id: "orange", name: "Orange Money", icon: "orange_money", emoji: "🟠" },
      { id: "yas", name: "Yas", icon: "yas_money", emoji: "💳" },
      { id: "especes", name: "Espèces à la livraison", icon: "especes_money", emoji: "💵" },
    ];

    /* ── HERO SLIDES ── */
    const HERO_SLIDES = [
      { img: "images/slim fits/slim blanc.webp", tag: "Slim Fit Premium", title: "STYLE &<br/><span class='hl'>PERFORMANCE</span>", sub: "T-shirts Slim Fit premium pour tous les styles" },
      { img: "images/sneakers/nike-nocta-blanc.webp", tag: "Sneakers 2026 🔥", title: "STEP<br/><span class='hl'>FRESH</span>", sub: "Les meilleures paires de sneakers au Sénégal" },
      { img: "images/maillots/maillot paris.webp", tag: "Maillots ⚽", title: "PLAY<br/><span class='hl'>LIKE A PRO</span>", sub: "Répliques premium de vos clubs préférés" },
      { img: "images/slim fits/slim rouge.webp", tag: "Meilleur prix 💯", title: "SLIM FIT<br/><span class='hl'>3000 FCFA</span>", sub: "Économisez 500 FCFA à partir de 4 pièces !" },
    ];

    const REVIEWS = [
      { n: "Aminata D.", ini: "AD", s: 5, t: "Les slim fits sont incroyables ! Qualité premium, livraison rapide. Je recommande à 100%.", v: true },
      { n: "Moussa K.", ini: "MK", s: 5, t: "Sneakers authentiques au meilleur prix de Dakar. Service client top sur WhatsApp !", v: true },
      { n: "Fatou B.", ini: "FB", s: 5, t: "J'ai pris 5 slim fits à 2500F chacun. Toute la famille est ravie. Merci Moussa Business !", v: true },
      { n: "Omar S.", ini: "OS", s: 4, t: "Maillot PSG parfait. Broderies nickel, tissu respirant. Livré en 24h à Dakar.", v: true },
      { n: "Mariama L.", ini: "ML", s: 5, t: "Les compressions sont parfaites pour mes entraînements. Taille conforme.", v: true },
    ];

    const FAQS = [
      { q: "Quels sont les tarifs de livraison ?", a: "Dakar Centre/Plateau: 3500 FCFA · Foire/Parcelles/Pikine: 3000 FCFA · Yoff/Almadies: 5000 FCFA · Malika/Yeumbeul: 2000 FCFA · Keur Massar: 1000 FCFA · Retrait boutique: Gratuit." },
      { q: "Comment fonctionnent les remises Slim Fit ?", a: "Les Slim Fits sont à 3000 FCFA l'unité. À partir de 4 pièces, le prix passe automatiquement à 2500 FCFA l'unité. La remise s'applique sur toute la commande." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Wave, Orange Money, Yas (paiement mobile) et espèces à la livraison ou en boutique. Aucun frais supplémentaire." },
      { q: "Quels sont les délais de livraison ?", a: "Livraison à Dakar sous 24 à 48 heures. Retrait en boutique également disponible." },
      { q: "Les tailles correspondent-elles bien ?", a: "Oui, nos tailles suivent les standards européens. En cas de doute, contactez-nous sur WhatsApp avec vos mensurations." },
      { q: "Puis-je retourner un article ?", a: "Oui, retours acceptés sous 7 jours après réception si l'article est intact avec étiquettes. Contactez-nous via WhatsApp." },
    ];

    /* ── HELPERS ── */
    const ge = id => document.getElementById(id);
    function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }
    function catIcon(c) { return { slim: "fa-shirt", compression: "fa-dumbbell", maillot: "fa-futbol", sneakers: "fa-shoe-prints", crampons: "fa-futbol", sandales: "fa-flip-flops" }[c] || "fa-box"; }
    function catLabel(c) { return { slim: "Slim Fit", compression: "Compression", maillot: "Maillot", sneakers: "Sneakers", crampons: "Crampons", sandales: "Sandales" }[c] || c; }

    function getAllProds() {
      if (S._prods) return S._prods;
      const a = [];
      if (typeof PRODUCTS !== "undefined") a.push(...PRODUCTS);
      if (typeof SLIM_LACOSTE !== "undefined") { if (!a.find(p => p.id === SLIM_LACOSTE.id)) a.push(SLIM_LACOSTE); }
      if (typeof SNEAKER_PRODUCTS !== "undefined") a.push(...SNEAKER_PRODUCTS);
      S._prods = a;
      return a;
    }

    /* ── PRICING ── */
    function getSlimPrice(qty) {
      return qty >= SLIM_BULK_QTY ? SLIM_PRICE_BULK : SLIM_PRICE_NORMAL;
    }
    function productPrice(p) {
      if (p.cat === "slim") return SLIM_PRICE_NORMAL;
      if (p.promoPrice) return p.promoPrice;
      return p.basePrice || p.price || 0;
    }
    function productOrigPrice(p) {
      return null;
    }

    /* ── CART ── */
    const Cart = {
      _d: [],
      load() { try { this._d = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { this._d = []; } this._fire(); },
      save() { try { localStorage.setItem(CART_KEY, JSON.stringify(this._d)); } catch { } },
      _fire() { document.dispatchEvent(new Event("cartChange")); },
      add(prod, size, qty = 1) {
        const k = `${prod.id}__${size}`;
        const ex = this._d.find(i => i.k === k);
        if (ex) ex.qty += qty;
        else this._d.push({ k, id: prod.id, name: prod.name, cat: prod.cat, color: prod.color?.n || "", size, qty, basePrice: productPrice(prod), img: prod.image || null });
        this.save(); this._fire();
        toast("✅ " + prod.name + " ajouté", "ok");
        ge("cart-ibtn")?.classList.add("cart-pop");
        setTimeout(() => ge("cart-ibtn")?.classList.remove("cart-pop"), 520);
      },
      remove(k) { this._d = this._d.filter(i => i.k !== k); this.save(); this._fire(); },
      updateQty(k, d) { const i = this._d.find(x => x.k === k); if (i) { i.qty = Math.max(1, i.qty + d); this.save(); this._fire(); } },
      clear() { this._d = []; this.save(); this._fire(); },
      sum() {
        // Count slim fits for bulk discount
        const slimQty = this._d.filter(i => i.cat === "slim").reduce((s, i) => s + i.qty, 0);
        const slimUnitPrice = getSlimPrice(slimQty);
        const items = this._d;
        let subtotal = 0;
        items.forEach(i => {
          const up = i.cat === "slim" ? slimUnitPrice : i.basePrice;
          subtotal += up * i.qty;
        });
        // Compute original subtotal (3000/unit slim)
        const origSubtotal = items.reduce((s, i) => s + i.basePrice * i.qty, 0);
        const discount = origSubtotal - subtotal;
        const c = items.reduce((s, i) => s + i.qty, 0);
        return { c, subtotal, discount, slimQty, slimUnitPrice, origSubtotal, items };
      },
      getItemPrice(item) {
        if (item.cat !== "slim") return item.basePrice;
        const slimQty = this._d.filter(i => i.cat === "slim").reduce((s, i) => s + i.qty, 0);
        return getSlimPrice(slimQty);
      },
      waMsg(delivery, payment) {
        const { items, subtotal } = this.sum();
        if (!items.length) return "";
        let m = "🛍️ *Commande Moussa Business*\n\n";
        items.forEach(i => {
          const up = this.getItemPrice(i);
          m += `• *${i.name}*\n`;
          if (i.color) m += `  Couleur: ${i.color}  `;
          m += `Taille: ${i.size}\n  Qté: ${i.qty} × ${fmt(up)}\n\n`;
        });
        m += `━━━━━━━━━━━━━━\n💰 *Sous-total: ${fmt(subtotal)}*\n`;
        if (delivery) m += `🚚 Livraison: ${delivery.price === 0 ? "Gratuite" : fmt(delivery.price)}\n`;
        const total = subtotal + (delivery?.price || 0);
        m += `💳 *Total: ${fmt(total)}*\n\n`;
        if (payment) m += `💳 Paiement: ${payment.name}\n`;
        return m;
      }
    };

    /* ── FAVORITES ── */
    const Fav = {
      _d: new Set(),
      load() { try { this._d = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { this._d = new Set(); } this._fire(); },
      save() { try { localStorage.setItem(FAV_KEY, JSON.stringify([...this._d])); } catch { } },
      _fire() { document.dispatchEvent(new Event("favChange")); },
      has(id) { return this._d.has(id); },
      toggle(id) { this._d.has(id) ? this._d.delete(id) : this._d.add(id); this.save(); this._fire(); return this._d.has(id); },
      count() { return this._d.size; },
      prods() { return getAllProds().filter(p => this._d.has(p.id)); }
    };

    /* ── TOAST ── */
    function toast(msg, type = "inf") {
      const box = ge("toast-box"); if (!box) return;
      const t = document.createElement("div");
      t.className = `toast toast-${type}`;
      t.textContent = msg;
      box.appendChild(t);
      requestAnimationFrame(() => {
        t.classList.add("on");
        setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 320); }, 2600);
      });
    }

    /* ── NAVIGATION ── */
    function goPage(id) {
      document.querySelectorAll(".pg").forEach(p => p.classList.remove("on"));
      const pg = ge("pg-" + id); if (pg) pg.classList.add("on");
      document.querySelectorAll(".bnav-item").forEach(b => {
        b.classList.toggle("on", b.dataset.pg === id);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      updateBreadcrumb(id);
      if (id === "wishlist") renderWishlist();
    }

    function focusSearch() {
      setTimeout(() => { const inp = ge("srch-inp"); if (inp) { inp.focus(); } }, 200);
    }

    /* ── BREADCRUMB ── */
    const PAGE_CRUMBS = {
      home: [{ label: "Accueil" }],
      wishlist: [{ label: "Accueil", page: "home" }, { label: "Favoris" }],
      account: [{ label: "Accueil", page: "home" }, { label: "Compte" }],
    };
    function updateBreadcrumb(page, extra = []) {
      const bc = ge("breadcrumb"); if (!bc) return;
      const crumbs = PAGE_CRUMBS[page] || [{ label: "Accueil", page: "home" }, { label: page }];
      const all = [...crumbs, ...extra];
      bc.innerHTML = all.map((c, i) => {
        const isCurrent = i === all.length - 1;
        return `<span class="bc-item ${isCurrent ? "current" : ""}" ${c.page ? `onclick="goPage('${c.page}')"` : ""}>${c.label}</span>${!isCurrent ? '<span class="bc-sep">›</span>' : ""}`;
      }).join("");
    }

    /* ── THEME ── */
    function toggleTheme() {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const nxt = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nxt);
      localStorage.setItem(THEME_KEY, nxt);
      const ic = ge("th-icon");
      if (ic) ic.className = nxt === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    function initTheme() {
      const t = localStorage.getItem(THEME_KEY) || "dark";
      document.documentElement.setAttribute("data-theme", t);
      const ic = ge("th-icon");
      if (ic) ic.className = t === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }

    /* ── HERO SLIDER ── */
    let heroIdx = 0, heroTimer = null;
    function initHero() {
      const dotsEl = ge("hero-dots"); if (!dotsEl) return;
      dotsEl.innerHTML = HERO_SLIDES.map((_, i) => `<div class="hero-dot${i === 0 ? " on" : ""}" onclick="heroGo(${i})"></div>`).join("");
      heroTimer = setInterval(() => heroGo((heroIdx + 1) % HERO_SLIDES.length), 5500);
    }
    function heroGo(idx) {
      heroIdx = idx;
      const s = HERO_SLIDES[idx];
      const bgImg = ge("hero-bg-img");
      if (bgImg) { bgImg.style.opacity = "0"; setTimeout(() => { bgImg.src = s.img; bgImg.style.opacity = ""; }, 400); }
      const ttl = ge("hero-title"); if (ttl) { ttl.style.opacity = "0"; setTimeout(() => { ttl.innerHTML = s.title; ttl.style.opacity = ""; }, 280); }
      const sub = ge("hero-sub"); if (sub) { sub.style.opacity = "0"; setTimeout(() => { sub.textContent = s.sub; sub.style.opacity = ""; }, 320); }
      const ot = ge("hero-overtitle"); if (ot) ot.textContent = s.tag;
      document.querySelectorAll(".hero-dot").forEach((d, i) => d.classList.toggle("on", i === idx));
    }

    /* ── SEARCH ── */
    let srchTimer = null;
    function initSearch() {
      const inp = ge("srch-inp"); if (!inp) return;
      inp.addEventListener("input", e => {
        S.q = e.target.value.trim();
        const clr = ge("srch-clr"); if (clr) clr.style.display = S.q ? "flex" : "none";
        clearTimeout(srchTimer);
        srchTimer = setTimeout(() => { filterProds(); showSugg(); }, 260);
      });
      inp.addEventListener("focus", showSugg);
      document.addEventListener("click", e => { if (!e.target.closest(".srch-wrap")) ge("srch-sugg") && (ge("srch-sugg").style.display = "none"); });
    }
    function clearSearch() {
      S.q = ""; const inp = ge("srch-inp"); if (inp) inp.value = "";
      const clr = ge("srch-clr"); if (clr) clr.style.display = "none";
      ge("srch-sugg") && (ge("srch-sugg").style.display = "none");
      filterProds();
    }
    function showSugg() {
      const q = S.q.toLowerCase(), box = ge("srch-sugg");
      if (!box || q.length < 2) { if (box) box.style.display = "none"; return; }
      const terms = new Set();
      getAllProds().forEach(p => {
        if (p.name.toLowerCase().includes(q)) terms.add(p.name);
        if ((p.color?.n || "").toLowerCase().includes(q)) terms.add(p.color.n);
        if (p.cat.toLowerCase().includes(q)) terms.add(catLabel(p.cat));
      });
      const list = [...terms].slice(0, 6);
      if (!list.length) { box.style.display = "none"; return; }
      box.innerHTML = list.map(s => `<div class="sugg-item" onclick="pickSugg('${s.replace(/'/g, "\\'")}')"><i class="fa-solid fa-magnifying-glass" style="color:var(--t3)"></i>${s}</div>`).join("");
      box.style.display = "block";
    }
    function pickSugg(t) { S.q = t; const inp = ge("srch-inp"); if (inp) inp.value = t; ge("srch-sugg").style.display = "none"; filterProds(); }

    /* ── FILTER ── */
    function setFil(cat, el) {
      S.fil = cat;
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("on"));
      document.querySelectorAll(`[onclick*="setFil('${cat}')"]`).forEach(b => b.classList.add("on"));
      filterProds();
    }
    function doSort() { S.sort = ge("sort-sel")?.value || "default"; filterProds(); }

    /* ── RENDER PRODUCTS ── */
    function filterProds() {
      let prods = getAllProds();
      const q = S.q.toLowerCase();
      if (S.fil !== "all") prods = prods.filter(p => p.cat === S.fil);
      if (q) prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || (p.color?.n || "").toLowerCase().includes(q) || (p.desc || "").toLowerCase().includes(q));
      if (S.sort === "price-asc") prods.sort((a, b) => productPrice(a) - productPrice(b));
      else if (S.sort === "price-desc") prods.sort((a, b) => productPrice(b) - productPrice(a));
      else if (S.sort === "name-asc") prods.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      const grid = ge("pgrid"), noRes = ge("no-res"), lbl = ge("prod-count-lbl");
      if (!prods.length) { grid.innerHTML = ""; noRes.style.display = "block"; if (lbl) lbl.textContent = "Aucun résultat"; }
      else { noRes.style.display = "none"; grid.innerHTML = prods.map(renderCard).join(""); if (lbl) lbl.textContent = `${prods.length} produit${prods.length > 1 ? "s" : ""}`; }
    }

    function renderCard(p) {
      const pr = productPrice(p);
      const isFav = Fav.has(p.id);
      const stock = (typeof p.stock === "function") ? p.stock : (p.stock ?? 10);
      const isSO = stock === 0, isLow = stock > 0 && stock <= 3;
      const isSlim = p.cat === "slim";
      const isSneaker = p.cat === "sneakers" || p.type === "sneaker";
      const imgSrc = p.image || p.thumb || null;
      const colorH = p.color?.h || "#222";
      const brand = p.brand || catLabel(p.cat);

      let badges = "";
      if (isSlim) badges += `<span class="badge badge-best">Best Seller</span>`;
      else if (isSneaker && p.isNew) badges += `<span class="badge badge-new">Nouveau</span>`;
      if (isSO) badges += `<span class="badge badge-out">Épuisé</span>`;
      else if (isLow) badges += `<span class="badge badge-low">Dernier stock</span>`;

      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${p.name}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<div class=\\'pcard-fallback\\' style=\\'background:${colorH}\\'><i class=\\'fa-solid ${catIcon(p.cat)}\\'></i></div>'">`
        : `<div class="pcard-fallback" style="background:${colorH}"><i class="fa-solid ${catIcon(p.cat)}"></i></div>`;
      const safeId = String(p.id).replace(/['\"]/g, "");
      const rev = Math.floor(Math.random() * 30) + 5;

      return `<div class="pcard" role="listitem" onclick="openProd('${safeId}')" tabindex="0">
    <div class="pcard-img">
      ${imgHtml}
      <div class="pcard-badges">${badges}</div>
      <div class="pcard-qa">
        <button class="qa-btn${isFav ? " fav-on" : ""}" onclick="event.stopPropagation();toggleFav('${safeId}',this)"><i class="fa-${isFav ? "solid" : "regular"} fa-heart"></i></button>
        <button class="qa-btn" onclick="event.stopPropagation();quickWA('${safeId}')"><i class="fa-brands fa-whatsapp"></i></button>
      </div>
    </div>
    <div class="pcard-info">
      <div class="pcard-brand">${brand}</div>
      <div class="pcard-name">${p.name}</div>
      <div class="pcard-stars">★★★★${rev > 15 ? "★" : "☆"} <span>(${rev})</span></div>
      <div class="pcard-bot">
        <div>
          <div class="pcard-price">${fmt(pr)}</div>
          ${isSlim ? `<div class="pcard-old" style="font-size:9px;color:var(--acc3)">4+ pièces: ${fmt(SLIM_PRICE_BULK)}</div>` : ""}
        </div>
        ${!isSO ? `<button class="pcard-add" onclick="event.stopPropagation();openProd('${safeId}')"><i class="fa-solid fa-plus"></i></button>` : ""}
      </div>
    </div>
  </div>`;
    }

    /* ── PRODUCT DETAIL SHEET ── */
    function openProd(id) {
      const p = getAllProds().find(x => String(x.id) === String(id)); if (!p) return;
      const pr = productPrice(p);
      const isFav = Fav.has(p.id);
      const isSlim = p.cat === "slim";
      const imgSrc = p.image || p.thumb || null;
      const colorH = p.color?.h || "#222";
      const sizes = p.sizes || ["S", "M", "L", "XL", "XXL"];
      const brand = p.brand || catLabel(p.cat);

      const imgHtml = imgSrc
        ? `<img class="bs-gallery-main" src="${imgSrc}" alt="${p.name}" loading="eager">`
        : `<div class="bs-gallery-main" style="background:${colorH};display:flex;align-items:center;justify-content:center;"><i class="fa-solid ${catIcon(p.cat)}" style="font-size:56px;color:rgba(255,255,255,.2)"></i></div>`;

      const szHtml = sizes.map((s, i) => `<button class="sz-btn${i === 0 ? " on" : ""}" onclick="pickSz(this,'${s}')">${s}</button>`).join("");
      const safeId = String(p.id).replace(/['\"]/g, "");

      const stockStatus = p.stock === 0 ? "out" : p.stock <= 3 ? "low" : "ok";
      const stockHtml = `<div class="stock-indicator">
    <div class="stock-dot stock-${stockStatus}"></div>
    <span style="font-size:11px;color:var(--t2)">${stockStatus === "out" ? "Épuisé" : stockStatus === "low" ? `Plus que ${p.stock} en stock` : "En stock — Livraison 24-48h"}</span>
  </div>`;

      const slimVol = isSlim ? `<div class="slim-volume-info">
    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--t3);margin-bottom:7px">Remise volume Slim Fit</div>
    <div class="svi-row"><span>1–3 pièces</span><span>${fmt(SLIM_PRICE_NORMAL)} / pièce</span></div>
    <div class="svi-row active"><span>4+ pièces 🎉</span><span>${fmt(SLIM_PRICE_BULK)} / pièce</span></div>
  </div>`: "";

      ge("bs-content").innerHTML = `
    <div class="bs-gallery">${imgHtml}<div class="bs-gallery-dots"><div class="gd on"></div></div></div>
    <div class="bs-body">
      <div class="bs-overtitle">${brand}</div>
      <div class="bs-name">${p.name}</div>
      <div class="bs-stars"><span class="bs-stars-row">★★★★★</span><span class="bs-stars-count">4.9 · 24 avis</span></div>
      <div class="bs-delivery"><i class="fa-solid fa-truck-fast"></i> Livraison Dakar · 24–48h · Qualité garantie</div>
      <div class="bs-price-row">
        <div class="bs-price">${fmt(pr)}</div>
      </div>
      ${slimVol}
      ${stockHtml}
      <div class="bs-section-lbl">Taille</div>
      <div class="size-grid" id="sz-grid">${szHtml}</div>
      ${p.desc ? `<p style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:20px">${p.desc}</p>` : ""}
      <div class="bs-cta">
        <button class="btn-pri" style="flex:1" onclick="addToCart('${safeId}')"><i class="fa-solid fa-bag-shopping"></i> Ajouter au panier</button>
        <button class="fav-toggle-btn${isFav ? " on" : ""}" id="bs-fav-btn" onclick="toggleFav('${safeId}',this)"><i class="fa-${isFav ? "solid" : "regular"} fa-heart"></i></button>
      </div>
    </div>`;

      ge("bs-overlay").classList.add("on");
      ge("bs-product").classList.add("on");
      document.body.style.overflow = "hidden";
    }

    function closeBS() {
      ge("bs-overlay").classList.remove("on");
      ge("bs-product").classList.remove("on");
      document.body.style.overflow = "";
    }
    function pickSz(btn) {
      document.querySelectorAll("#sz-grid .sz-btn").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
    }
    function getSz() {
      const a = document.querySelector("#sz-grid .sz-btn.on"); return a ? a.textContent.trim() : null;
    }
    function addToCart(id) {
      const sz = getSz(); if (!sz) { toast("Sélectionnez une taille", "err"); return; }
      const p = getAllProds().find(x => String(x.id) === String(id)); if (!p) return;
      Cart.add(p, sz);
      closeBS();
    }
    function quickWA(id) {
      const p = getAllProds().find(x => String(x.id) === String(id)); if (!p) return;
      let m = `Bonjour Moussa Business ! Je suis intéressé(e) par :\n• ${p.name} — ${fmt(productPrice(p))}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`, "_blank");
    }
    function openWA(msg) { window.open(`https://wa.me/${WA}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`, "_blank"); }

    /* ── FAVORITES ── */
    function toggleFav(id, btn) {
      const isNow = Fav.toggle(id);
      document.querySelectorAll(`[onclick*="toggleFav('${id}')"]`).forEach(b => {
        b.classList.toggle("fav-on", isNow); b.classList.toggle("on", isNow);
        const ic = b.querySelector("i"); if (ic) ic.className = `fa-${isNow ? "solid" : "regular"} fa-heart`;
      });
    }

    /* ════════════════════════════════════════
       CHECKOUT TUNNEL (5 ÉTAPES)
    ════════════════════════════════════════ */

    function startCheckout() {
      checkoutState.step = 1;
      goPage("cart");
      renderCheckout();
      updateBreadcrumb("cart", [{ label: "Panier" }]);
    }

    function renderCheckout() {
      const el = ge("checkout-container"); if (!el) return;
      const s = checkoutState.step;
      const steps = ["Panier", "Info", "Livraison", "Paiement", "Confirmation"];
      const progressHTML = `<div class="ck-progress">
    <div class="ck-steps">
      ${steps.map((lbl, i) => `<div class="ck-step ${i + 1 < s ? "done" : i + 1 === s ? "active" : ""}">
        <div class="ck-step-dot">${i + 1 < s ? `<i class="fa-solid fa-check" style="font-size:10px"></i>` : i + 1}</div>
        <div class="ck-step-lbl">${lbl}</div>
      </div>`).join("")}
    </div>
  </div>`;

      const crumbs = [{ label: "Accueil", page: "home" }, { label: "Panier" }, { label: steps[s - 1] }];
      ge("breadcrumb").innerHTML = crumbs.map((c, i) => {
        const cur = i === crumbs.length - 1;
        return `<span class="bc-item ${cur ? "current" : ""}" ${c.page ? `onclick="goPage('${c.page}')"` : ""}>${c.label}</span>${!cur ? '<span class="bc-sep">›</span>' : ""}`;
      }).join("");

      switch (s) {
        case 1: el.innerHTML = progressHTML + renderStep1(); break;
        case 2: el.innerHTML = progressHTML + renderStep2(); break;
        case 3: el.innerHTML = progressHTML + renderStep3(); break;
        case 4: el.innerHTML = progressHTML + renderStep4(); break;
        case 5: el.innerHTML = progressHTML + renderStep5(); break;
      }
    }

    /* ÉTAPE 1 : PANIER */
    function renderStep1() {
      const { items, subtotal, discount, slimQty, slimUnitPrice, origSubtotal, c } = Cart.sum();
      if (!items.length) return `<div class="cart-empty-state"><i class="fa-solid fa-bag-shopping"></i><p>Votre panier est vide</p><button class="btn-pri" onclick="goPage('home')"><i class="fa-solid fa-arrow-left"></i> Découvrir</button></div>`;

      const volBadge = slimQty > 0 ? `<div class="volume-badge">
    <i class="fa-solid fa-tags"></i>
    <div>${slimQty >= SLIM_BULK_QTY
          ? `<strong>${fmt(SLIM_PRICE_BULK)}/pièce</strong> appliqué — ${slimQty} Slim Fits`
          : `<strong>Ajoutez ${SLIM_BULK_QTY - slimQty} Slim Fit(s) de plus</strong> pour passer à <strong>${fmt(SLIM_PRICE_BULK)}/pièce</strong>`}</div>
  </div>`: "";

      const itemsHtml = items.map(item => {
        const up = Cart.getItemPrice(item);
        return `<div class="cart-item">
      ${item.img ? `<img class="ci-img" src="${item.img}" alt="${item.name}" loading="lazy">` : `<div class="ci-img-fb"><i class="fa-solid ${catIcon(item.cat)}"></i></div>`}
      <div class="ci-info">
        <div class="ci-brand">${catLabel(item.cat)}</div>
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">${item.color ? item.color + " · " : ""}Taille: ${item.size}</div>
        <div class="ci-bot">
          <div class="ci-price">${fmt(up * item.qty)}</div>
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="Cart.updateQty('${item.k}',-1);renderCheckout()"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-n">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${item.k}',1);renderCheckout()"><i class="fa-solid fa-plus"></i></button>
            <button class="ci-del" onclick="Cart.remove('${item.k}');renderCheckout()"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>`;
      }).join("");

      const tc = items.reduce((s, i) => s + i.qty, 0);
      return `
    <div class="cart-pg-hdr"><h1 class="cart-pg-ttl">Mon Panier</h1><span style="background:var(--acc);color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${tc}</span></div>
    ${volBadge}
    <div class="cart-list">${itemsHtml}</div>
    <div class="cart-summary" style="margin:0 16px 12px">
      <div class="sum-row"><span>Sous-total (${tc} article${tc > 1 ? "s" : ""})</span><span>${fmt(subtotal)}</span></div>
      ${discount > 0 ? `<div class="sum-row sum-discount"><span>Remise volume (-${Math.round(discount / origSubtotal * 100)}%)</span><span>-${fmt(discount)}</span></div>` : ""}
      <div class="sum-row total"><span>Total articles</span><span>${fmt(subtotal)}</span></div>
    </div>
    <div class="cart-cta">
      <button class="checkout-btn" onclick="goStep(2)"><span>Passer la commande</span> <i class="fa-solid fa-arrow-right"></i></button>
      <button class="btn-ghost" style="width:100%;justify-content:center;margin-top:10px" onclick="goPage('home')"><i class="fa-solid fa-arrow-left"></i> Continuer les achats</button>
    </div>`;
    }

    /* ÉTAPE 2 : INFO CLIENT */
    function renderStep2() {
      const ci = checkoutState.clientInfo;
      return `<div class="ck-pg">
    <div class="ck-hdr">
      <button class="ck-back" onclick="goStep(1)"><i class="fa-solid fa-arrow-left"></i></button>
      <h2 class="ck-title">Informations</h2>
    </div>
    <div class="ck-form" id="ck-form-info">
      <div class="ck-input-row">
        <div class="ck-input-group">
          <label class="ck-label">Prénom *</label>
          <input class="ck-input" id="ci-prenom" type="text" placeholder="Prénom" value="${ci.prenom || ""}" autocomplete="given-name"/>
        </div>
        <div class="ck-input-group">
          <label class="ck-label">Nom *</label>
          <input class="ck-input" id="ci-nom" type="text" placeholder="Nom" value="${ci.nom || ""}" autocomplete="family-name"/>
        </div>
      </div>
      <div class="ck-input-group">
        <label class="ck-label">Téléphone *</label>
        <input class="ck-input" id="ci-tel" type="tel" placeholder="+221 XX XXX XX XX" value="${ci.tel || ""}" autocomplete="tel"/>
      </div>
      <div class="ck-input-group">
        <label class="ck-label">Adresse *</label>
        <input class="ck-input" id="ci-adresse" type="text" placeholder="Rue, numéro…" value="${ci.adresse || ""}" autocomplete="street-address"/>
      </div>
      <div class="ck-input-row">
        <div class="ck-input-group">
          <label class="ck-label">Quartier *</label>
          <input class="ck-input" id="ci-quartier" type="text" placeholder="Quartier" value="${ci.quartier || ""}"/>
        </div>
        <div class="ck-input-group">
          <label class="ck-label">Ville *</label>
          <input class="ck-input" id="ci-ville" type="text" placeholder="Dakar" value="${ci.ville || "Dakar"}" autocomplete="address-level2"/>
        </div>
      </div>
      <div class="ck-input-group">
        <label class="ck-label">Note de livraison</label>
        <textarea class="ck-textarea" id="ci-note" placeholder="Instructions pour le livreur (optionnel)…">${ci.note || ""}</textarea>
      </div>
    </div>
    <div style="padding:20px 0 0">
      <button class="checkout-btn" onclick="saveStep2()">Continuer <i class="fa-solid fa-arrow-right"></i></button>
    </div>
  </div>`;
    }

    function saveStep2() {
      const prenom = (ge("ci-prenom")?.value || "").trim();
      const nom = (ge("ci-nom")?.value || "").trim();
      const tel = (ge("ci-tel")?.value || "").trim();
      const adresse = (ge("ci-adresse")?.value || "").trim();
      const quartier = (ge("ci-quartier")?.value || "").trim();
      const ville = (ge("ci-ville")?.value || "").trim();
      if (!prenom || !nom || !tel || !adresse || !quartier || !ville) { toast("Veuillez remplir tous les champs obligatoires", "err"); return; }
      checkoutState.clientInfo = { prenom, nom, tel, adresse, quartier, ville, note: ge("ci-note")?.value || "" };
      goStep(3);
    }

    /* ÉTAPE 3 : LIVRAISON */
    function renderStep3() {
      const sel = checkoutState.delivery?.id;
      const optsHtml = DELIVERY_OPTS.map(o => `
    <div class="dlv-opt${sel === o.id ? " on" : ""}" onclick="selectDelivery('${o.id}')">
      <div class="dlv-opt-icon"><i class="fa-solid ${o.icon}"></i></div>
      <div class="dlv-opt-info">
        <div class="dlv-opt-name">${o.name}</div>
        <div class="dlv-opt-sub">${o.sub}</div>
      </div>
      <div class="dlv-opt-price ${o.price === 0 ? "free" : ""}">${o.price === 0 ? "Gratuit" : fmt(o.price)}</div>
      <div class="dlv-radio"></div>
    </div>`).join("");
      return `<div class="ck-pg">
    <div class="ck-hdr">
      <button class="ck-back" onclick="goStep(2)"><i class="fa-solid fa-arrow-left"></i></button>
      <h2 class="ck-title">Livraison</h2>
    </div>
    <div class="delivery-opts">${optsHtml}</div>
    <div style="padding:20px 0 0">
      <button class="checkout-btn" onclick="saveStep3()">Continuer <i class="fa-solid fa-arrow-right"></i></button>
    </div>
  </div>`;
    }

    function selectDelivery(id) {
      const opt = DELIVERY_OPTS.find(o => o.id === id); if (!opt) return;
      checkoutState.delivery = opt;
      checkoutState.deliveryCost = opt.price;
      document.querySelectorAll(".dlv-opt").forEach(el => el.classList.toggle("on", el.getAttribute("onclick").includes(`'${id}'`)));
    }
    function saveStep3() {
      if (!checkoutState.delivery) { toast("Choisissez un mode de livraison", "err"); return; }
      goStep(4);
    }

    /* ÉTAPE 4 : PAIEMENT */
    function renderStep4() {
      const sel = checkoutState.payment?.id;
      const cardsHtml = PAYMENT_OPTS.map(o => `
    <div class="pay-card${sel === o.id ? " on" : ""}" onclick="selectPayment('${o.id}')">
      <img class="pay-card-logo" src="images/paiements/${o.icon}.webp" alt="${o.name}" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/>
      <div class="pay-card-logo-fallback" style="display:none">${o.emoji}</div>
      <div class="pay-card-name">${o.name}</div>
      <div class="pay-card-radio"></div>
    </div>`).join("");
      return `<div class="ck-pg">
    <div class="ck-hdr">
      <button class="ck-back" onclick="goStep(3)"><i class="fa-solid fa-arrow-left"></i></button>
      <h2 class="ck-title">Paiement</h2>
    </div>
    <p style="font-size:13px;color:var(--t2);margin-bottom:14px">Choisissez votre mode de paiement</p>
    <div class="pay-cards">${cardsHtml}</div>
    <div style="padding:20px 0 0">
      <button class="checkout-btn" onclick="saveStep4()">Continuer <i class="fa-solid fa-arrow-right"></i></button>
    </div>
  </div>`;
    }

    function selectPayment(id) {
      const opt = PAYMENT_OPTS.find(o => o.id === id); if (!opt) return;
      checkoutState.payment = opt;
      document.querySelectorAll(".pay-card").forEach(el => el.classList.toggle("on", el.getAttribute("onclick").includes(`'${id}'`)));
    }
    function saveStep4() {
      if (!checkoutState.payment) { toast("Choisissez un mode de paiement", "err"); return; }
      goStep(5);
    }

    /* ÉTAPE 5 : CONFIRMATION */
    function renderStep5() {
      const { items, subtotal, discount, c } = Cart.sum();
      const delivery = checkoutState.delivery;
      const payment = checkoutState.payment;
      const ci = checkoutState.clientInfo;
      const total = subtotal + (delivery?.price || 0);

      const itemsHtml = items.map(i => {
        const up = Cart.getItemPrice(i);
        return `<div class="confirm-row"><span>${i.name} (×${i.qty})</span><span>${fmt(up * i.qty)}</span></div>`;
      }).join("");

      return `<div class="ck-pg">
    <div class="ck-hdr">
      <button class="ck-back" onclick="goStep(4)"><i class="fa-solid fa-arrow-left"></i></button>
      <h2 class="ck-title">Confirmation</h2>
    </div>
    <div class="confirm-card">
      <div class="confirm-ttl">Récapitulatif produits</div>
      ${itemsHtml}
      <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px">
        <div class="confirm-row"><span>Sous-total</span><span>${fmt(subtotal)}</span></div>
        ${discount > 0 ? `<div class="confirm-row" style="color:var(--acc3)"><span>Remise volume</span><span>-${fmt(discount)}</span></div>` : ""}
        <div class="confirm-row"><span>Livraison</span><span style="color:var(--acc3)">${delivery?.price === 0 ? "Gratuite" : fmt(delivery?.price || 0)}</span></div>
        <div class="confirm-row total"><span>Total</span><span>${fmt(total)}</span></div>
      </div>
    </div>
    <div class="confirm-card">
      <div class="confirm-ttl">Livraison</div>
      <div class="confirm-row bold"><span>${delivery?.name || ""}</span></div>
      <div class="confirm-row"><span>Adresse</span><span style="text-align:right;max-width:180px">${ci.adresse}, ${ci.quartier}, ${ci.ville}</span></div>
      ${ci.note ? `<div class="confirm-row"><span>Note</span><span style="text-align:right;max-width:180px;color:var(--t2)">${ci.note}</span></div>` : ""}
    </div>
    <div class="confirm-card">
      <div class="confirm-ttl">Paiement</div>
      <div class="confirm-row bold"><span>${payment?.name || ""}</span></div>
    </div>
    <div style="padding:4px 0 24px">
      <button class="checkout-btn" onclick="confirmOrder()" style="background:var(--acc3);box-shadow:0 4px 20px rgba(0,212,170,.3)">
        <i class="fa-solid fa-check-circle"></i> Confirmer la commande
      </button>
    </div>
  </div>`;
    }

    function confirmOrder() {
      const msg = Cart.waMsg(checkoutState.delivery, checkoutState.payment);
      const ci = checkoutState.clientInfo;
      let m = msg;
      m += `\n\n👤 *Client:* ${ci.prenom} ${ci.nom}\n📞 *Téléphone:* ${ci.tel}\n📍 *Adresse:* ${ci.adresse}, ${ci.quartier}, ${ci.ville}`;
      if (ci.note) m += `\n📝 *Note:* ${ci.note}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`, "_blank");
      ge("checkout-container").innerHTML = renderSuccessScreen();
      window.scrollTo({ top: 0, behavior: "smooth" });
      Cart.clear();
    }

    function renderSuccessScreen() {
      return `<div class="confirm-success" style="padding-top:60px">
    <div class="confirm-check"><i class="fa-solid fa-check"></i></div>
    <div class="confirm-success-ttl">Commande envoyée !</div>
    <p class="confirm-success-sub">Votre commande a été transmise via WhatsApp. Moussa Business vous contactera pour confirmer et organiser la livraison.</p>
    <div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:10px;margin-top:8px">
      <button class="btn-pri" style="width:100%;justify-content:center" onclick="goPage('home')"><i class="fa-solid fa-house"></i> Retour à l'accueil</button>
      <button class="btn-wa" style="width:100%;justify-content:center" onclick="openWA('')"><i class="fa-brands fa-whatsapp"></i> Nous contacter</button>
    </div>
  </div>`;
    }

    function goStep(n) {
      checkoutState.step = n;
      renderCheckout();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ── RENDER WISHLIST ── */
    function renderWishlist() {
      const prods = Fav.prods();
      const el = ge("wl-content"); if (!el) return;
      if (!prods.length) {
        el.innerHTML = `<div class="wl-empty-state"><i class="fa-regular fa-heart"></i><p>Aucun favori pour l'instant</p><button class="btn-pri" onclick="goPage('home')"><i class="fa-solid fa-arrow-left"></i> Découvrir</button></div>`;
        return;
      }
      el.innerHTML = `<div class="pgrid" style="padding:16px">${prods.map(renderCard).join("")}</div>`;
    }

    /* ── RENDER REVIEWS ── */
    function renderReviews() {
      const el = ge("reviews-list"); if (!el) return;
      el.innerHTML = REVIEWS.map(r => `<div class="rev-card">
    <div class="rev-hdr"><div class="rev-av">${r.ini}</div><div><div class="rev-name">${r.n}</div><div class="rev-stars">${"★".repeat(r.s)}${"☆".repeat(5 - r.s)}</div></div>${r.v ? `<div class="rev-veri"><i class="fa-solid fa-circle-check"></i> Vérifié</div>` : ""}</div>
    <p class="rev-txt">${r.t}</p>
  </div>`).join("");
    }

    /* ── RENDER FAQ ── */
    function renderFAQ() {
      const el = ge("faq-list"); if (!el) return;
      el.innerHTML = FAQS.map((f, i) => `<div class="faq-item" id="faq${i}">
    <div class="faq-q" onclick="ge('faq${i}').classList.toggle('op')"><span>${f.q}</span><i class="fa-solid fa-chevron-down"></i></div>
    <div class="faq-ans"><div class="faq-ans-inner">${f.a}</div></div>
  </div>`).join("");
    }

    /* ── BADGES ── */
    function updBadges() {
      const { c } = Cart.sum(), fc = Fav.count();
      const cb = ge("cart-bdg"), fb = ge("fav-bdg"), nb = ge("bnav-bdg");
      if (cb) { cb.textContent = c; cb.classList.toggle("on", c > 0); }
      if (fb) { fb.textContent = fc; fb.classList.toggle("on", fc > 0); }
      if (nb) { nb.textContent = c; nb.classList.toggle("on", c > 0); }
    }

    /* ── SCROLL ── */
    function initScroll() {
      let last = 0;
      window.addEventListener("scroll", () => {
        const cur = window.scrollY, hdr = ge("hdr");
        if (hdr) { hdr.classList.toggle("scrolled", cur > 50); hdr.classList.toggle("hid", cur > last && cur > 220); }
        ge("fab-wa")?.classList.toggle("on", cur > 300);
        ge("scr-top")?.classList.toggle("on", cur > 450);
        last = cur;
      }, { passive: true });
    }

    /* ── SKELETON ── */
    function skeleton(n = 8) {
      return Array(n).fill(0).map(() => `<div class="pcard sk">
    <div class="pcard-img sk-box" style="aspect-ratio:1/1"></div>
    <div class="pcard-info"><div class="sk-line"></div><div class="sk-line sh"></div><div class="sk-line sp"></div></div>
  </div>`).join("");
    }

    /* ── PWA INSTALL ── */
    let dip = null;
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault(); dip = e;
      setTimeout(() => ge("inst-bar")?.classList.add("on"), 6000);
    });
    ge("inst-ok-btn")?.addEventListener("click", () => {
      if (!dip) return; dip.prompt();
      dip.userChoice.then(() => { ge("inst-bar")?.classList.remove("on"); dip = null; });
    });
    window.addEventListener("appinstalled", () => ge("inst-bar")?.classList.remove("on"));

    /* ── SERVICE WORKER ── */
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
          .then(r => console.log("[MB] SW:", r.scope))
          .catch(e => console.warn("[MB] SW error:", e));
      });
    }

    /* ── INIT ── */
    document.addEventListener("DOMContentLoaded", () => {
      try { performance.mark && performance.mark('mb:domcontentloaded'); } catch (e) {}
      initTheme();
      if (typeof StockManager !== "undefined") StockManager.init();
      Cart.load(); Fav.load();
      renderReviews(); renderFAQ();
      initSearch(); initScroll(); initHero();

      const grid = ge("pgrid"); if (grid) grid.innerHTML = skeleton(8);
      setTimeout(() => filterProds(), 600);

      document.addEventListener("cartChange", () => { updBadges(); });
      document.addEventListener("favChange", () => { updBadges(); });
      updBadges();
      updateBreadcrumb("home");

      setTimeout(() => ge("splash")?.classList.add("out"), 1400);

      const params = new URLSearchParams(location.search);
      const pg = params.get("page"); if (pg) goPage(pg);

      document.addEventListener("keydown", e => { if (e.key === "Escape") closeBS(); });

      let touchY = 0;
      ge("bs-product")?.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; }, { passive: true });
      ge("bs-product")?.addEventListener("touchmove", e => {
        if (e.touches[0].clientY - touchY > 80 && ge("bs-product").scrollTop === 0) closeBS();
      }, { passive: true });

      // MB PERF: mesure réelle — marque la fin de l'init et affiche la durée
      try {
        performance.mark && performance.mark('mb:init-done');
        if (performance.measure) {
          performance.measure('mb:script-to-init', 'mb:script-start', 'mb:init-done');
          const m = performance.getEntriesByName('mb:script-to-init')[0];
          console.info('[MB PERF] script→init:', m ? `${m.duration.toFixed(1)}ms` : 'n/a');
        }
      } catch (e) { console.warn('[MB PERF] measure failed', e); }
    });
  