import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ALG = require("../CG - Lista de exercícios 1/js/lib/algorithms.js");

function read(rel) {
  return readFileSync(rel, "utf8");
}

function filesUnder(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...filesUnder(full));
    else out.push(full);
  }
  return out;
}

function assertNotIncludes(haystack, needle, label) {
  assert.ok(!haystack.includes(needle), `${label} should not include ${needle}`);
}

function assertIncludes(haystack, needle, label) {
  assert.ok(haystack.includes(needle), `${label} should include ${needle}`);
}

function plabel(p) {
  return ALG.plabel(p);
}

function cohenRightFirst(pa, pb, w) {
  const B = ALG.BITS;
  let a = ALG.P(pa.x, pa.y);
  const b = ALG.P(pb.x, pb.y);
  let ca = ALG.outCode(a, w);
  const cb = ALG.outCode(b, w);
  const clips = [];

  while ((ca | cb) !== 0 && (ca & cb) === 0 && clips.length < 8) {
    const edge = ca & B.RIGHT ? B.RIGHT : ca & B.TOP ? B.TOP : ca & B.BOTTOM ? B.BOTTOM : B.LEFT;
    const next = ALG.intersect(a, b, edge, w);
    clips.push(next);
    a = next;
    ca = ALG.outCode(a, w);
  }

  return clips.map(plabel);
}

const lista1Files = filesUnder("CG - Lista de exercícios 1").filter((file) => /\.(js|md)$/.test(file));
const lista1Text = lista1Files.map(read).join("\n");

assertNotIncludes(lista1Text, "Hodgeman", "Lista 1 Sutherland-Hodgman spelling");

const q19 = read("CG - Lista de exercícios 1/js/questions/q19.js");
assertNotIncludes(q19, "THIRD.x - XC", "Lista 1 Q19");
assertIncludes(q19, "ABS_THIRD", "Lista 1 Q19 absolute third point");
const third = ALG.circleBresenham(3, 4, 4).octant[2];
assert.deepEqual({ x: third.x, y: third.y }, { x: 2, y: 3 }, "Q19 third octant point is relative");
assert.equal(3 + third.x, 5, "Q19 third point absolute x");
assert.equal(4 + third.y, 7, "Q19 third point absolute y");

const q24 = read("CG - Lista de exercícios 1/js/questions/q24.js");
assertIncludes(q24, "(8,10)", "Lista 1 Q24 right-first example start");
assertIncludes(q24, "(5,7)", "Lista 1 Q24 first update");
assertIncludes(q24, "(4,6)", "Lista 1 Q24 second update");
assertNotIncludes(q24, "(5,0)", "Lista 1 Q24 old one-update example");
assert.deepEqual(
  cohenRightFirst({ x: 8, y: 10 }, { x: 0, y: 2 }, ALG.DEFAULT_WINDOW),
  ["(5, 7)", "(4, 6)"],
  "Q24 right-first pedagogical trace"
);

// Q24 view bounds must contain every pedagogical point, incl. the start (8,10)
// whose y was clipped by the old ymax=9 (issue #11). BOUNDS = [xmin,xmax,ymin,ymax].
const q24Bounds = q24.match(/var BOUNDS = \[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/);
assert.ok(q24Bounds, "Q24 should declare BOUNDS as [xmin, xmax, ymin, ymax]");
const [bxmin, bxmax, bymin, bymax] = q24Bounds.slice(1).map(Number);
for (const [px, py] of [[8, 10], [5, 7], [4, 6], [0, 2]]) {
  assert.ok(
    px >= bxmin && px <= bxmax && py >= bymin && py <= bymax,
    `Q24 BOUNDS [${bxmin},${bxmax},${bymin},${bymax}] must contain (${px},${py})`,
  );
}
// and keep headroom above (8,10) so its label is not clipped.
assert.ok(bymax >= 11, "Q24 ymax should leave headroom above (8,10) for its label");

const q32 = read("CG - Lista de exercícios 1/js/questions/q32.js");
assertIncludes(q32, "ALG.sutherlandHodgman(POLY, W).result", "Lista 1 Q32 generated clipped polygon");
assertNotIncludes(q32, "[0, 7]", "Lista 1 Q32 impossible manual vertex");
const q32Poly = [
  [-4, 3],
  [1, 8],
  [3, 4],
  [7, 7],
  [6, -1],
  [1, 0.5],
  [-3, -0.5],
].map(([x, y]) => ALG.P(x, y));
const clipped = ALG.sutherlandHodgman(q32Poly, ALG.DEFAULT_WINDOW).result;
assert.ok(clipped.every((p) => !p.y.gtInt(6)), "Q32 clipped result should satisfy y <= 6");

const q37 = read("CG - Lista de exercícios 1/js/questions/q37.js");
const makeScanlinePart = q37.match(/function makeScanlinePart\(\) \{[\s\S]*?window\.GUI\.register/);
assert.ok(makeScanlinePart, "Lista 1 Q37 should define makeScanlinePart");
assert.doesNotMatch(makeScanlinePart[0], /ALG\.flood/, "Lista 1 Q37 scan-line should not source spans from flood fill");
assertIncludes(q37, "scanlineSpans", "Lista 1 Q37 independent scan-line helper");

// Intentional brittle smoke baselines for explanatory copy. These modules are
// static educational pages, and the checks below catch accidental regression to
// the reviewed misleading phrasing. If the prose is intentionally refined while
// preserving meaning, update these sentinel strings with the copy change.
const q03 = read("CG - Lista de exercícios 2/js/questions/lista2/q03.js");
assertNotIncludes(q03, "preserva proporções", "Lista 2 Q3 projection copy");

const q08 = read("CG - Lista de exercícios 2/js/questions/lista2/q08.js");
assertNotIncludes(q08, "o hardware só desenha triângulos", "Lista 2 Q8 GPU copy");

const q11 = read("CG - Lista de exercícios 2/js/questions/lista2/q11.js");
assertNotIncludes(q11, "podemos cancelar <code>U</code>", "Lista 2 Q11 derivation");
assertIncludes(q11, "monômios são linearmente independentes", "Lista 2 Q11 rigorous derivation");

const q15Lista2 = read("CG - Lista de exercícios 2/js/questions/lista2/q15.js");
assertIncludes(q15Lista2, "menor controle preciso", "Lista 2 Q15 Blobby tradeoff");
assertIncludes(q15Lista2, "materiais heterogêneos", "Lista 2 Q15 voxel tradeoff");

const q04Lista3 = read("CG - Lista de exercícios 3/js/questions/q04.js");
assertIncludes(q04Lista3, "R = 2(N·L)N − L", "Lista 3 Q4 reflection convention");

const q07Lista3 = read("CG - Lista de exercícios 3/js/questions/q07.js");
assertNotIncludes(q07Lista3, '"Sombras", "Duras", "Suaves / penumbra"', "Lista 3 Q7 shadow softness simplification");
assertIncludes(q07Lista3, "extensão angular da fonte", "Lista 3 Q7 shadow softness caveat");

const q15Lista3 = read("CG - Lista de exercícios 3/js/questions/q15.js");
assertIncludes(q15Lista3, "normal, rugosidade", "Lista 3 Q15 procedural attributes");
assertIncludes(q15Lista3, "procedurais tridimensionais", "Lista 3 Q15 seam caveat");

const q18Lista3 = read("CG - Lista de exercícios 3/js/questions/q18.js");
assertNotIncludes(q18Lista3, "var P = polyAt(Ap, B, 0.5);", "Lista 3 Q18 edge morphing visual");
assertNotIncludes(q18Lista3, "interseção de arestas consecutivas", "Lista 3 Q18 underdefined edge reconstruction claim");
assertIncludes(q18Lista3, "edgePolyAt", "Lista 3 Q18 defined edge morphing helper");

console.log("CG correction checks passed.");
