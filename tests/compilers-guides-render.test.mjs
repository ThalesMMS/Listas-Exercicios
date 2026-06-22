/*
 * compilers-guides-render.test.mjs — Smoke test: every Guia-de-Compiladores guide
 * builds and every step renders without throwing. Catches runtime errors in the
 * guides' draw() code (bad component calls, undefined helpers), not just syntax.
 */
import assert from "node:assert/strict";
import { loadCompilersGuides, makeEl } from "./_compilers-harness.mjs";

const { specs, SvgSurface } = loadCompilersGuides();

assert.ok(specs.length >= 20, `expected >= 20 guides, got ${specs.length}`);

let stepCount = 0;
const failures = [];

for (const spec of specs) {
  assert.ok(spec.id, "every guide spec must have an id");
  assert.ok(Array.isArray(spec.parts) && spec.parts.length, `${spec.id} must have parts`);
  spec.parts.forEach((part, pi) => {
    let steps;
    try {
      steps = part.build();
    } catch (e) {
      failures.push(`BUILD ${spec.id} part ${pi}: ${e.message}`);
      return;
    }
    assert.ok(Array.isArray(steps) && steps.length, `${spec.id} part ${pi} build() must return steps`);
    steps.forEach((st, i) => {
      stepCount++;
      assert.equal(typeof st.title, "string", `${spec.id} part ${pi} step ${i} needs a string title`);
      if (st.body != null) assert.equal(typeof st.body, "string", `${spec.id} part ${pi} step ${i} body must be HTML string`);
      const v = st.visual;
      if (!v || typeof v.draw !== "function") return;
      try {
        if (v.type === "svg") {
          const s = new SvgSurface(makeEl("svg"));
          if (v.view) s.view(v.view[0], v.view[1]); // mirror stage.js: visual.view applied before draw
          v.draw(s);
        } else if (v.type === "dom") {
          v.draw(makeEl("div"));
        } else {
          // "plane" (canvas) isn't used by the compilers guides; any other type is unexpected.
          throw new Error(`unsupported visual type "${v.type}"`);
        }
      } catch (e) {
        failures.push(`DRAW ${spec.id} part ${pi} step ${i} "${st.title}": ${e.message}`);
      }
    });
  });
}

assert.equal(failures.length, 0, "render failures:\n" + failures.join("\n"));
console.log(`Compilers guides render checks passed (${specs.length} guides, ${stepCount} step-renders).`);
