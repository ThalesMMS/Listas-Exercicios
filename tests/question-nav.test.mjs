import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

function assertIncludes(haystack, needle, label) {
  assert.ok(haystack.includes(needle), `${label} should include ${needle}`);
}

function assertNotIncludes(haystack, needle, label) {
  assert.ok(!haystack.includes(needle), `${label} should not include ${needle}`);
}

function assertBefore(haystack, before, after, label) {
  const beforeIndex = haystack.indexOf(before);
  const afterIndex = haystack.indexOf(after);
  assert.ok(beforeIndex >= 0, `${label} should include ${before}`);
  assert.ok(afterIndex >= 0, `${label} should include ${after}`);
  assert.ok(beforeIndex < afterIndex, `${before} should come before ${after} in ${label}`);
}

const legacyLayout = read("CG - Lista de exercícios 1/js/core/layout.js");
const legacyCss = read("CG - Lista de exercícios 1/css/styles.css");

assertIncludes(legacyLayout, "q-questionbar", "Lista 1 layout");
assertIncludes(legacyLayout, "aria-current", "Lista 1 layout");
assertIncludes(legacyLayout, "Ir para Q", "Lista 1 layout");
assertNotIncludes(legacyLayout, "_addPrevNext(nav, q)", "Lista 1 layout");
assertIncludes(legacyCss, ".q-questionbar", "Lista 1 CSS");
assertIncludes(legacyCss, ".q-jump", "Lista 1 CSS");
assertIncludes(legacyCss, ".q-jump.active", "Lista 1 CSS");
assertBefore(
  legacyLayout,
  "canvasWrap.appendChild(controls);",
  "canvasWrap.appendChild(canvas);",
  "Lista 1 layout",
);
assertBefore(
  legacyLayout,
  "canvasWrap.appendChild(progress);",
  "canvasWrap.appendChild(canvas);",
  "Lista 1 layout",
);
assertIncludes(legacyCss, "margin: 10px 0 12px;", "Lista 1 CSS");

const templateLikeDirs = [
  "CG - Lista de exercícios 2",
  "CG - Lista de exercícios 3",
  "Compiladores-Lista-A",
  "Compiladores-Lista-B",
  "Compiladores-Lista-C",
  "Guia-de-Computacao-Grafica",
];

const exLayoutDirs = ["Explainer-Template", ...templateLikeDirs, "Guia-de-Compiladores"];

for (const dir of exLayoutDirs) {
  const layout = read(`${dir}/js/core/layout.js`);
  const css = read(`${dir}/css/layout.css`);

  assertBefore(
    layout,
    "visCol.appendChild(controls);",
    "visCol.appendChild(visHost);",
    `${dir} layout`,
  );
  assertBefore(
    layout,
    "visCol.appendChild(progress);",
    "visCol.appendChild(visHost);",
    `${dir} layout`,
  );
  assertIncludes(css, "margin: 10px 0 12px;", `${dir} CSS`);
}

for (const dir of templateLikeDirs) {
  const layout = read(`${dir}/js/core/layout.js`);
  const css = read(`${dir}/css/layout.css`);

  assertIncludes(layout, "ex-questionbar", `${dir} layout`);
  assertIncludes(layout, "aria-current", `${dir} layout`);
  assertIncludes(layout, "Ir para Q", `${dir} layout`);
  assertNotIncludes(layout, "_prevNext(nav, q)", `${dir} layout`);
  assertIncludes(css, ".ex-questionbar", `${dir} CSS`);
  assertIncludes(css, ".ex-jump", `${dir} CSS`);
  assertIncludes(css, ".ex-jump.active", `${dir} CSS`);
}

console.log("Question navigation bar checks passed.");
