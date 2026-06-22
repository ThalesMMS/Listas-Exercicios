/*
 * compilers-guides-bounds.test.mjs — Layout test: no SVG element is drawn outside
 * its declared viewBox (catches overflow/clipping that the render smoke test misses).
 */
import assert from "node:assert/strict";
import { loadCompilersGuides, makeEl, nums } from "./_compilers-harness.mjs";

const MARGIN = 6; // user-unit tolerance
const { specs, SvgSurface } = loadCompilersGuides();

function accumulate(el, bb) {
  const a = el.attrs || {};
  const push = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < bb.minX) bb.minX = x; if (x > bb.maxX) bb.maxX = x;
    if (y < bb.minY) bb.minY = y; if (y > bb.maxY) bb.maxY = y;
  };
  switch (el.tagName) {
    case "rect": push(+a.x, +a.y); push(+a.x + +a.width, +a.y + +a.height); break;
    case "circle": push(+a.cx - +a.r, +a.cy - +a.r); push(+a.cx + +a.r, +a.cy + +a.r); break;
    case "ellipse": push(+a.cx - +a.rx, +a.cy - +a.ry); push(+a.cx + +a.rx, +a.cy + +a.ry); break;
    case "line": push(+a.x1, +a.y1); push(+a.x2, +a.y2); break;
    case "text": push(+a.x, +a.y); break;
    case "polygon": case "polyline": { const ns = nums(a.points); for (let i = 0; i + 1 < ns.length; i += 2) push(ns[i], ns[i + 1]); break; }
    case "path": { const ns = nums(a.d); for (let i = 0; i + 1 < ns.length; i += 2) push(ns[i], ns[i + 1]); break; }
  }
  (el.childNodes || []).forEach((c) => accumulate(c, bb));
}

const problems = [];
let checked = 0;

for (const spec of specs) {
  spec.parts.forEach((part) => {
    const steps = part.build();
    steps.forEach((st, i) => {
      const v = st.visual;
      if (!v || v.type !== "svg" || typeof v.draw !== "function") return;
      const svgEl = makeEl("svg");
      const s = new SvgSurface(svgEl);
      if (v.view) s.view(v.view[0], v.view[1]); // mirror stage.js: visual.view applied before draw
      v.draw(s);
      checked++;
      const vb = nums(svgEl.attrs.viewBox || "0 0 1000 700");
      const W = vb[2], H = vb[3];
      const bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      accumulate(svgEl, bb);
      if (bb.minX === Infinity) { problems.push(`${spec.id}#${i} "${st.title}" — EMPTY svg`); return; }
      const over = [];
      if (bb.minX < -MARGIN) over.push(`left ${bb.minX.toFixed(0)}`);
      if (bb.minY < -MARGIN) over.push(`top ${bb.minY.toFixed(0)}`);
      if (bb.maxX > W + MARGIN) over.push(`right ${bb.maxX.toFixed(0)}>${W}`);
      if (bb.maxY > H + MARGIN) over.push(`bottom ${bb.maxY.toFixed(0)}>${H}`);
      if (over.length) problems.push(`${spec.id}#${i} "${st.title}" [${W}x${H}]: ${over.join(", ")}`);
    });
  });
}

assert.equal(problems.length, 0, "SVG overflow/empty:\n" + problems.join("\n"));
console.log(`Compilers guides bounds checks passed (${checked} svg renders within viewBox).`);
