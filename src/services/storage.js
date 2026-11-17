'use strict';
/* Armazenamento do aparelho: pedido de persistência e espaço usado */
const Store = {
  persisted: null,
  async init() {
    try { if (navigator.storage && navigator.storage.persisted) { Store.persisted = await navigator.storage.persisted(); if (!Store.persisted && navigator.storage.persist) Store.persisted = await navigator.storage.persist(); } } catch (e) { }
    return Store.persisted;
  },
  async estimate() { try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); return { usage: e.usage || 0, quota: e.quota || 0 }; } } catch (e) { } return null; }
};
const fbytes = n => n == null ? '—' : n < 1024 * 1024 ? `${fmt(n / 1024, 0)} KB` : n < 1024 ** 3 ? `${fmt(n / 1024 ** 2, 1)} MB` : `${fmt(n / 1024 ** 3, 2)} GB`;
