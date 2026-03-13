/**
 * ================================================================
 * MOUSSA BUSINESS — cart.js
 * ================================================================
 * Gestion du panier avec IndexedDB (fallback localStorage).
 * Item: { id, slug, name, price, qty, size, color, thumb }
 * ================================================================
 */
"use strict";

const CartDB = (() => {
  const DB_NAME = "moussa_db";
  const DB_VERSION = 1;
  const STORE = "cart";
  let _db = null;

  /* ── IndexedDB wrapper ──────────────────────────────────────── */
  function openDB() {
    return new Promise((resolve, reject) => {
      if (_db) {
        resolve(_db);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("cart"))
          db.createObjectStore("cart", { keyPath: "id" });
        if (!db.objectStoreNames.contains("favorites"))
          db.createObjectStore("favorites", { keyPath: "slug" });
        if (!db.objectStoreNames.contains("orders"))
          db.createObjectStore("orders", {
            keyPath: "id",
            autoIncrement: true,
          });
      };
      req.onsuccess = (e) => {
        _db = e.target.result;
        resolve(_db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  function tx(storeName, mode = "readonly") {
    return openDB().then((db) =>
      db.transaction(storeName, mode).objectStore(storeName),
    );
  }

  function idbGet(store, key) {
    return tx(store).then(
      (s) =>
        new Promise((res, rej) => {
          const r = s.get(key);
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        }),
    );
  }

  function idbPut(store, value) {
    return tx(store, "readwrite").then(
      (s) =>
        new Promise((res, rej) => {
          const r = s.put(value);
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        }),
    );
  }

  function idbDelete(store, key) {
    return tx(store, "readwrite").then(
      (s) =>
        new Promise((res, rej) => {
          const r = s.delete(key);
          r.onsuccess = () => res();
          r.onerror = () => rej(r.error);
        }),
    );
  }

  function idbGetAll(store) {
    return tx(store).then(
      (s) =>
        new Promise((res, rej) => {
          const r = s.getAll();
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        }),
    );
  }

  /* ── localStorage fallback ──────────────────────────────────── */
  const LS = {
    key: "mb_cart_v1",
    getAll() {
      try {
        return JSON.parse(localStorage.getItem(this.key) || "[]");
      } catch {
        return [];
      }
    },
    save(items) {
      try {
        localStorage.setItem(this.key, JSON.stringify(items));
      } catch {}
    },
    get(id) {
      return this.getAll().find((i) => i.id === id) || null;
    },
    put(item) {
      const a = this.getAll().filter((i) => i.id !== item.id);
      a.push(item);
      this.save(a);
    },
    delete(id) {
      this.save(this.getAll().filter((i) => i.id !== id));
    },
    clear() {
      localStorage.removeItem(this.key);
    },
  };

  const idbAvailable = (() => {
    try {
      return typeof indexedDB !== "undefined" && indexedDB !== null;
    } catch {
      return false;
    }
  })();

  /* ── Génération d'un ID unique par slug+taille+couleur ──────── */
  function makeItemId(slug, size, color) {
    return `${slug}::${size || "N/A"}::${color || "N/A"}`;
  }

  /* ── API publique ───────────────────────────────────────────── */
  return {
    /**
     * Ajoute ou incrémente un article dans le panier.
     */
    async add(product, qty = 1, size = "", color = "") {
      const id = makeItemId(product.slug, size, color);
      let item;
      try {
        item = idbAvailable ? await idbGet("cart", id) : LS.get(id);
      } catch {
        item = LS.get(id);
      }

      if (item) {
        item.qty += qty;
      } else {
        item = {
          id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          qty,
          size,
          color,
          thumb: product.thumb || product.images?.[0] || "",
        };
      }

      try {
        if (idbAvailable) await idbPut("cart", item);
        else LS.put(item);
      } catch {
        LS.put(item);
      }
      this._emit();
      return item;
    },

    async updateQty(itemId, qty) {
      if (qty <= 0) return this.remove(itemId);
      let item;
      try {
        item = idbAvailable ? await idbGet("cart", itemId) : LS.get(itemId);
      } catch {
        item = LS.get(itemId);
      }
      if (!item) return;
      item.qty = qty;
      try {
        if (idbAvailable) await idbPut("cart", item);
        else LS.put(item);
      } catch {
        LS.put(item);
      }
      this._emit();
    },

    async remove(itemId) {
      try {
        if (idbAvailable) await idbDelete("cart", itemId);
        else LS.delete(itemId);
      } catch {
        LS.delete(itemId);
      }
      this._emit();
    },

    async clear() {
      try {
        if (idbAvailable) {
          const all = await idbGetAll("cart");
          for (const i of all) await idbDelete("cart", i.id);
        } else {
          LS.clear();
        }
      } catch {
        LS.clear();
      }
      this._emit();
    },

    async getAll() {
      try {
        return idbAvailable ? await idbGetAll("cart") : LS.getAll();
      } catch {
        return LS.getAll();
      }
    },

    async getTotal() {
      const items = await this.getAll();
      return items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },

    async getCount() {
      const items = await this.getAll();
      return items.reduce((sum, i) => sum + i.qty, 0);
    },

    _emit() {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    },
  };
})();

/* ── Favoris ────────────────────────────────────────────────────── */
const FavoritesDB = (() => {
  const LS_KEY = "mb_favs_v1";

  function lsGetAll() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function lsSave(items) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {}
  }

  const idbAvailable = (() => {
    try {
      return typeof indexedDB !== "undefined" && indexedDB !== null;
    } catch {
      return false;
    }
  })();

  async function openFavDB() {
    return new Promise((res, rej) => {
      const req = indexedDB.open("moussa_db", 1);
      req.onsuccess = (e) => res(e.target.result);
      req.onerror = (e) => rej(e.target.error);
    });
  }

  return {
    async getAll() {
      try {
        if (!idbAvailable) return lsGetAll();
        const db = await openFavDB();
        return new Promise((res, rej) => {
          const r = db
            .transaction("favorites", "readonly")
            .objectStore("favorites")
            .getAll();
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
      } catch {
        return lsGetAll();
      }
    },

    async toggle(product) {
      const all = await this.getAll();
      const idx = all.findIndex((f) => f.slug === product.slug);
      const isFav = idx !== -1;

      if (isFav) {
        all.splice(idx, 1);
      } else {
        all.push({
          slug: product.slug,
          name: product.name,
          thumb: product.thumb || product.images?.[0],
          price: product.price,
        });
      }

      try {
        if (idbAvailable) {
          const db = await openFavDB();
          const st = db
            .transaction("favorites", "readwrite")
            .objectStore("favorites");
          if (isFav) st.delete(product.slug);
          else st.put(all[all.length - 1]);
        } else {
          lsSave(all);
        }
      } catch {
        lsSave(all);
      }

      window.dispatchEvent(new CustomEvent("favoritesUpdated"));
      return !isFav;
    },

    async isFavorite(slug) {
      const all = await this.getAll();
      return all.some((f) => f.slug === slug);
    },
  };
})();

window.CartDB = CartDB;
window.FavoritesDB = FavoritesDB;
