/*
 * _compilers-harness.mjs — Shared headless harness for the Guia-de-Compiladores
 * guides. Loads every module from the guide manifest against a minimal DOM shim
 * (no jsdom/build; the guides are plain IIFEs over window/document), so tests can
 * run each guide's build() and exercise every step's visual.draw().
 *
 * Not a *.test.mjs file (leading underscore) so test runners skip it.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

export const GUIDE_ROOT = "Guia-de-Compiladores";

export function makeEl(tag) {
  const el = { tagName: String(tag).toLowerCase(), childNodes: [], attrs: {}, style: {}, className: "", textContent: "", _innerHTML: "" };
  Object.defineProperty(el, "innerHTML", { get() { return el._innerHTML; }, set(v) { el._innerHTML = String(v); el.childNodes = []; } });
  Object.defineProperty(el, "firstChild", { get() { return el.childNodes[0] || null; } });
  Object.defineProperty(el, "children", { get() { return el.childNodes; } });
  el.setAttribute = (k, v) => { el.attrs[k] = String(v); };
  el.getAttribute = (k) => (k in el.attrs ? el.attrs[k] : null);
  el.removeAttribute = (k) => { delete el.attrs[k]; };
  el.appendChild = (c) => { el.childNodes.push(c); return c; };
  el.removeChild = (c) => { el.childNodes = el.childNodes.filter((x) => x !== c); return c; };
  el.querySelector = () => null; el.querySelectorAll = () => [];
  el.addEventListener = () => {}; el.cloneNode = () => makeEl(tag);
  return el;
}

// Loads the guide modules once and returns the registered specs plus helpers.
export function loadCompilersGuides(root = GUIDE_ROOT) {
  const document = {
    createElement: (t) => makeEl(t), createElementNS: (_n, t) => makeEl(t),
    head: makeEl("head"), body: makeEl("body"), documentElement: makeEl("html"),
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {},
  };
  const window = {
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    matchMedia() { return { matches: false, addEventListener() {}, addListener() {} }; },
    location: { href: "" },
  };
  globalThis.window = window;
  globalThis.document = document;
  globalThis.CustomEvent = class { constructor(t, i) { this.type = t; Object.assign(this, i); } };
  globalThis.Event = globalThis.CustomEvent;
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

  vm.runInThisContext(fs.readFileSync(path.join(root, "js/manifest.js"), "utf8"), { filename: "manifest.js" });
  const specs = [];
  for (const rel of window.EX_MANIFEST.scripts) {
    vm.runInThisContext(fs.readFileSync(path.join(root, rel), "utf8"), { filename: rel });
    if (rel.endsWith("core/registry.js")) {
      const orig = window.EX.registry.add.bind(window.EX.registry);
      window.EX.registry.add = (s) => { specs.push(s); return orig(s); };
    }
  }
  return { specs, window, SvgSurface: window.EX.SvgSurface, makeEl };
}

// Parses every number out of a string (for path "d", polygon "points", etc.).
export function nums(s) {
  return (String(s).match(/-?\d+(\.\d+)?/g) || []).map(Number);
}
