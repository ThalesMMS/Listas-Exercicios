import assert from "node:assert/strict";
import { loadCompilersGuides, makeEl } from "./_compilers-harness.mjs";

const { specs, window, SvgSurface } = loadCompilersGuides("Guia-de-Computacao-Grafica");

assert.ok(
  window.EX_MANIFEST.scripts.includes("js/guias/g24-bones.js"),
  "CG guide manifest should include the bones topic after cinematics"
);

const bones = specs.find((spec) => spec.id === "g24-bones");
assert.ok(bones, "g24-bones should be registered as a guide topic");
assert.equal(bones.section, "Animação");
assert.equal(bones.title, "Bones: esqueleto e skinning");
assert.ok(bones.tags.includes("bones"), "bones guide should be discoverable by tag");
assert.ok(bones.tags.includes("skinning"), "bones guide should cover skinning");
assert.match(bones.hubDesc, /hierarquia/i);
assert.match(bones.statement, /matrizes/i);

const steps = bones.parts[0].build();
assert.ok(steps.length >= 7, "bones guide should have enough walkthrough steps");
assert.ok(
  steps.some((step) => /mapa de pesos/i.test(step.title)),
  "bones guide should include a visually rich weight-paint map step"
);

for (const [index, step] of steps.entries()) {
  assert.equal(typeof step.title, "string", `step ${index} should have a title`);
  assert.equal(typeof step.body, "string", `step ${index} should have explanatory text`);
  if (!step.visual) continue;
  if (step.visual.type === "svg") {
    const svgEl = makeEl("svg");
    const surface = new SvgSurface(svgEl);
    step.visual.draw(surface);
    const elementCount = countElements(svgEl) - 1;
    assert.ok(elementCount >= 20, `step ${index} SVG should be visually rich, got ${elementCount} elements`);
  } else if (step.visual.type === "dom") {
    step.visual.draw(makeEl("div"));
  } else {
    throw new Error(`unsupported visual type "${step.visual.type}" in bones guide`);
  }
}

function countElements(el) {
  return 1 + (el.childNodes || []).reduce((sum, child) => sum + countElements(child), 0);
}
