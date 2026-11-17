'use strict';
/* ---------- unidades ---------- */
const U = {
  wl: () => S.kv.settings.unitW, ll: () => S.kv.settings.unitL,
  w: kg => kg == null ? null : (U.wl() === 'lb' ? kg * 2.20462 : kg),
  wIn: v => v == null ? null : (U.wl() === 'lb' ? v / 2.20462 : v),
  l: cm => cm == null ? null : (U.ll() === 'in' ? cm / 2.54 : cm),
  lIn: v => v == null ? null : (U.ll() === 'in' ? v * 2.54 : v)
};
const fw = kg => kg == null ? '—' : `${fmt(U.w(kg))} ${U.wl()}`;
const fl = cm => cm == null ? '—' : `${fmt(U.l(cm))} ${U.ll()}`;
const r2 = n => n == null ? '' : Math.round(n * 100) / 100;
