import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function file(rel) {
  return path.join(ROOT, rel);
}

function read(rel) {
  return readFileSync(file(rel), "utf8");
}

function assertIncludes(haystack, needle, label) {
  assert.ok(haystack.includes(needle), `${label} should include ${needle}`);
}

function assertManifestOrder(manifest, before, after) {
  const beforeIndex = manifest.indexOf(before);
  const afterIndex = manifest.indexOf(after);
  assert.ok(beforeIndex >= 0, `manifest should include ${before}`);
  assert.ok(afterIndex >= 0, `manifest should include ${after}`);
  assert.ok(beforeIndex < afterIndex, `${before} should be loaded before ${after}`);
}

const manifest = read("js/manifest.js");
const index = read("index.html");
const boot = read("js/core/boot.js");
const questionLayout = read("js/core/layout.js");
const layoutCss = read("css/layout.css");
const readme = read("README.md").toLowerCase();
const authoring = read("AUTHORING.md").toLowerCase();

assert.ok(existsSync(file("js/config.js")), "template should expose js/config.js");
assertManifestOrder(manifest, '"js/config.js"', '"js/lib/util.js"');
assertIncludes(index, 'data-ex-config="title"', "index.html");
assertIncludes(index, 'data-ex-config="description"', "index.html");
assertIncludes(index, 'data-ex-config="chips"', "index.html");
assertIncludes(index, 'class="ex-home-link"', "index.html");
assertIncludes(index, 'href="../index.html"', "index.html");
assertIncludes(boot, "EX_CONFIG", "boot.js");
assertIncludes(boot, "applyHubConfig", "boot.js");
assert.match(layoutCss, /\.ex-canvas\s*\{[^}]*width:\s*100%;/s, "canvas should keep stable width");
assertIncludes(layoutCss, ".ex-home-link .ex-back", "layout.css");
assertIncludes(layoutCss, ".ex-questionbar", "layout.css");
assertIncludes(layoutCss, ".ex-jump", "layout.css");
assertIncludes(layoutCss, ".ex-jump.active", "layout.css");
assertIncludes(questionLayout, "ex-questionbar", "layout.js");
assertIncludes(questionLayout, "aria-current", "layout.js");
assertIncludes(questionLayout, "Ir para Q", "layout.js");
assert.doesNotMatch(questionLayout, /_prevNext\s*:/, "layout.js should not keep previous/next helper");

assertIncludes(readme, "copia independente", "README independence note");
assertIncludes(readme, "dependencia de producao", "README independence note");
assertIncludes(authoring, "copia independente", "AUTHORING independence note");
assertIncludes(authoring, "dependencia de producao", "AUTHORING independence note");

assert.ok(existsSync(file("js/questions/examples/demo-progressive-svg.js")), "progressive SVG demo should exist");
assert.ok(existsSync(file("js/questions/examples/demo-parametric-transition.js")), "parametric transition demo should exist");
assert.ok(existsSync(file("examples/collection-portal/index.html")), "collection portal example should include index.html");
assert.ok(existsSync(file("examples/collection-portal/portal.css")), "collection portal example should include CSS");
assert.ok(existsSync(file("examples/collection-portal/portal.js")), "collection portal example should include JS");
assert.ok(existsSync(file("examples/collection-portal/README.md")), "collection portal example should include README");

assertIncludes(manifest, '"js/questions/examples/demo-progressive-svg.js"', "manifest");
assertIncludes(manifest, '"js/questions/examples/demo-parametric-transition.js"', "manifest");

const neutralExamples = [
  read("js/questions/examples/demo-progressive-svg.js"),
  read("js/questions/examples/demo-parametric-transition.js"),
].join("\n");
assert.doesNotMatch(
  neutralExamples,
  /Computa|Bresenham|Cohen|DDA|Phong|Ray|morphing|Octree|CSG/i,
  "new template demos should stay domain-neutral",
);

console.log("Explainer-Template smoke checks passed.");
