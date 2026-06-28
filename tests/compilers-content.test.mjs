/*
 * compilers-content.test.mjs — Correctness checks for the Compiladores listas
 * and guides, beyond "it renders". Each block maps to a GitHub issue and asserts
 * the *content* is right (grammars productive, sets complete, terminology sound),
 * plus that list and guide stay in sync.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
// Normalize grammar notation so ASCII (lista) and Unicode (guia) compare equal.
const norm = (s) =>
  s.replace(/→/g, "->").replace(/∗/g, "*").replace(/′/g, "'").replace(/λ/g, "lambda").replace(/\s+/g, "");

/* ───────────────────────── issue #4: Lista A Q4 / Guia c03 ─────────────────────────
 * Grammar must be productive (has base cases) and the left-factoring must preserve
 * the language. We prove the latter exactly: inlining the fresh non-terminals S'/P'
 * back into the factored grammar must reproduce the original production set.
 */
{
  // Corrected ORIGINAL grammar (productions as arrays of symbols; [] = λ).
  const ORIG = {
    S: [["S", "+", "S"], ["S", "+", "P"], ["P"]],
    P: [["P", "*", "P"], ["P", "*", "I"], ["I"]],
    I: [["-", "I"], ["(", "S", ")"], ["D"]],
    D: [["0"], ["1", "N"]],
    N: [["0"], ["1"], ["N", "N"], []],
  };
  // Corrected FACTORED grammar (Sp = S', Pp = P').
  const FACT = {
    S: [["S", "+", "Sp"], ["P"]],
    Sp: [["S"], ["P"]],
    P: [["P", "*", "Pp"], ["I"]],
    Pp: [["P"], ["I"]],
    I: [["-", "I"], ["(", "S", ")"], ["D"]],
    D: [["0"], ["1", "N"]],
    N: [["0"], ["1"], ["N", "N"], []],
  };

  const isNT = (g, sym) => Object.prototype.hasOwnProperty.call(g, sym);

  // Productive non-terminals (standard fixpoint).
  function productive(g) {
    const prod = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const nt of Object.keys(g)) {
        if (prod.has(nt)) continue;
        if (g[nt].some((rhs) => rhs.every((sym) => !isNT(g, sym) || prod.has(sym)))) {
          prod.add(nt);
          changed = true;
        }
      }
    }
    return prod;
  }

  const prodOrig = productive(ORIG);
  for (const nt of Object.keys(ORIG)) {
    assert.ok(prodOrig.has(nt), `#4: original grammar non-terminal ${nt} must be productive (have a base case)`);
  }

  // One explicit leftmost terminal derivation, choosing the shortest expansion.
  function minLen(g) {
    const m = {};
    for (const nt of Object.keys(g)) m[nt] = Infinity;
    let changed = true;
    while (changed) {
      changed = false;
      for (const nt of Object.keys(g)) {
        for (const rhs of g[nt]) {
          const len = rhs.reduce((a, sym) => a + (isNT(g, sym) ? m[sym] : 1), 0);
          if (len < m[nt]) { m[nt] = len; changed = true; }
        }
      }
    }
    return m;
  }
  function deriveOne(g, start) {
    const m = minLen(g);
    let form = [start];
    const steps = [start];
    let guard = 0;
    while (form.some((sym) => isNT(g, sym))) {
      if (++guard > 100) throw new Error("derivation did not terminate");
      const i = form.findIndex((sym) => isNT(g, sym));
      const nt = form[i];
      // pick the production minimizing resulting minimum length
      const best = g[nt].reduce((a, b) => {
        const la = a.reduce((s, x) => s + (isNT(g, x) ? m[x] : 1), 0);
        const lb = b.reduce((s, x) => s + (isNT(g, x) ? m[x] : 1), 0);
        return lb < la ? b : a;
      });
      form = form.slice(0, i).concat(best, form.slice(i + 1));
      steps.push(form.join(" ") || "λ");
    }
    return { string: form.join(""), steps };
  }
  const der = deriveOne(ORIG, "S");
  assert.ok(der.string.length > 0, "#4: original grammar derives a non-empty terminal string");
  assert.equal(der.string, "0", `#4: shortest S derivation is the terminal "0" (got ${der.string})`);

  // Exact language preservation: inline the fresh non-terminals (Sp, Pp) and the
  // factored grammar must equal the original, set-for-set.
  function inline(g, fresh) {
    const out = {};
    for (const nt of Object.keys(g)) {
      if (fresh.includes(nt)) continue;
      out[nt] = [];
      for (const rhs of g[nt]) {
        let forms = [[]];
        for (const sym of rhs) {
          if (fresh.includes(sym)) {
            forms = forms.flatMap((f) => g[sym].map((alt) => f.concat(alt)));
          } else {
            forms = forms.map((f) => f.concat(sym));
          }
        }
        out[nt].push(...forms);
      }
    }
    return out;
  }
  const key = (g) =>
    Object.keys(g).sort().map((nt) => nt + ":" + g[nt].map((r) => r.join(" ")).sort().join("|")).join(";");
  assert.equal(
    key(inline(FACT, ["Sp", "Pp"])),
    key(ORIG),
    "#4: un-factoring S'/P' must reproduce the original grammar exactly (language preserved)",
  );

  // List and guide must show the same corrected grammar, and drop the false claim
  // that factoring alone yields LL(1)/disjoint FIRST.
  const listA = read("Compiladores-Lista-A/js/questions/compiladores/lista-a.js");
  const c03 = read("Guia-de-Compiladores/js/guias/c03-fatoracao.js");
  for (const [label, txt] of [["lista A Q4", listA], ["guia c03", c03]]) {
    const n = norm(txt);
    assert.ok(n.includes("S->S+S|S+P|P"), `#4: ${label} shows original S with base case |P`);
    assert.ok(n.includes("P->P*P|P*I|I"), `#4: ${label} shows original P with base case |I`);
    assert.ok(n.includes("S->S+S'|P"), `#4: ${label} shows factored S keeping |P`);
    assert.ok(n.includes("P->P*P'|I"), `#4: ${label} shows factored P keeping |I`);
  }
  assert.ok(
    !/primeiros símbolos distintos/.test(c03) && !/condição necessária para LL\(1\)/.test(c03),
    "#4: guia c03 no longer claims factoring guarantees disjoint FIRST / LL(1)",
  );
  assert.ok(/não garante/.test(c03) && /distintas/.test(c03), "#4: guia c03 states the correct caveat");
  assert.ok(/nao garante/.test(listA) && /FIRST disjuntos nem LL\(1\)/.test(listA), "#4: lista A Q4 states the correct caveat");
}

/* ───────────────────────── issue #5: Lista A Q6 / Guia c05 ─────────────────────────
 * FOLLOW of the start symbol must contain $. We recompute FIRST/FOLLOW for the
 * example grammar by fixpoint and assert the sets, then check both files show $.
 */
{
  const L = "λ"; // λ-sentinel (terminals here are x, y, z)
  const G = { A: [["x", "C", "B", "y"]], B: [["z"], []], C: [["y"], ["B", "x"]] };
  const START = "A";
  const isNT = (s) => Object.prototype.hasOwnProperty.call(G, s);

  const FIRST = {};
  for (const nt of Object.keys(G)) FIRST[nt] = new Set();
  const firstSym = (s) => (isNT(s) ? FIRST[s] : new Set([s]));
  const firstSeq = (seq) => {
    const out = new Set();
    let nullable = true;
    for (const s of seq) {
      const fs = firstSym(s);
      for (const t of fs) if (t !== L) out.add(t);
      if (!fs.has(L)) { nullable = false; break; }
    }
    if (nullable) out.add(L);
    return out;
  };
  for (let changed = true; changed; ) {
    changed = false;
    for (const nt of Object.keys(G)) {
      for (const rhs of G[nt]) {
        const fs = firstSeq(rhs);
        for (const t of fs) if (!FIRST[nt].has(t)) { FIRST[nt].add(t); changed = true; }
      }
    }
  }

  const FOLLOW = {};
  for (const nt of Object.keys(G)) FOLLOW[nt] = new Set();
  FOLLOW[START].add("$");
  for (let changed = true; changed; ) {
    changed = false;
    for (const nt of Object.keys(G)) {
      for (const rhs of G[nt]) {
        for (let i = 0; i < rhs.length; i++) {
          const sym = rhs[i];
          if (!isNT(sym)) continue;
          const fb = firstSeq(rhs.slice(i + 1));
          for (const t of fb) if (t !== L && !FOLLOW[sym].has(t)) { FOLLOW[sym].add(t); changed = true; }
          if (fb.has(L)) for (const t of FOLLOW[nt]) if (!FOLLOW[sym].has(t)) { FOLLOW[sym].add(t); changed = true; }
        }
      }
    }
  }

  const eq = (set, arr) => set.size === arr.length && arr.every((x) => set.has(x));
  assert.ok(FOLLOW.A.has("$"), "#5: FOLLOW(start symbol A) must contain $");
  assert.ok(eq(FOLLOW.A, ["$"]), "#5: FOLLOW(A) = { $ }");
  assert.ok(eq(FOLLOW.B, ["x", "y"]), "#5: FOLLOW(B) = { x, y }");
  assert.ok(eq(FOLLOW.C, ["y", "z"]), "#5: FOLLOW(C) = { y, z }");
  assert.ok(eq(FIRST.C, ["x", "y", "z"]), "#5: FIRST(C) = { x, y, z }");

  const q6 = read("Compiladores-Lista-A/js/questions/compiladores/lista-a.js");
  const c05 = read("Guia-de-Compiladores/js/guias/c05-first-follow.js");
  assert.ok(q6.includes('["A", "{ $ }"]'), "#5: lista A Q6 FOLLOW(A) shows { $ }");
  assert.ok(!q6.includes('["A", "{ }"]'), "#5: lista A Q6 no longer shows empty FOLLOW(A)");
  assert.ok(c05.includes('["A", "{ x }", "{ $ }"]'), "#5: guia c05 FOLLOW(A) shows { $ }");
  assert.ok(!c05.includes('["A", "{ x }", "{ }"]'), "#5: guia c05 no longer shows empty FOLLOW(A)");
}

/* ───────────────────────── issue #6: Lista B Q4 / Guia c10 ─────────────────────────
 * The LUB table must judge a distinct, fully-stated equality per row, with correct
 * verdicts for the hierarchy; the guide must call LUB the join (not the meet).
 */
{
  const parent = {
    Object: null, Bool: "Object", Point: "Object", Line: "Object", Shape: "Object",
    Quad: "Shape", Circle: "Shape", Rect: "Quad", Square: "Rect",
  };
  const ancestors = (x) => { const out = []; for (let c = x; c; c = parent[c]) out.push(c); return out; };
  const lub = (a, b) => { const ab = new Set(ancestors(b)); return ancestors(a).find((c) => ab.has(c)); };

  assert.equal(lub("Point", "Quad"), "Object", "#6: lub(Point, Quad) = Object");
  assert.equal(lub("Square", "Rect"), "Rect", "#6: lub(Square, Rect) = Rect (Square ≤ Rect), not Quad");
  assert.equal(lub("Square", "Circle"), "Shape", "#6: lub(Square, Circle) = Shape, not Object");

  // The four judged claims map to these verdicts:
  const claims = [
    ["Point", "Quad", "Object", true],
    ["Square", "Rect", "Quad", false],
    ["Square", "Rect", "Rect", true],
    ["Square", "Circle", "Object", false],
  ];
  for (const [a, b, claimed, verdict] of claims) {
    assert.equal(lub(a, b) === claimed, verdict, `#6: verdict of lub(${a}, ${b}) = ${claimed}`);
  }

  const listB = read("Compiladores-Lista-B/js/questions/compiladores/lista-b.js");
  for (const [a, b, claimed] of claims) {
    assert.ok(listB.includes(`lub(${a}, ${b}) = ${claimed}`), `#6: lista B Q4 states the full equality lub(${a}, ${b}) = ${claimed}`);
  }
  // Old ambiguous form (bare result, no asserted RHS) is gone.
  assert.ok(!listB.includes('["lub(Square, Rect)", "Rect"'), "#6: lista B Q4 dropped the ambiguous duplicate row");

  const c10 = read("Guia-de-Compiladores/js/guias/c10-lub.js");
  assert.ok(/<b>join<\/b>/.test(c10), "#6: guia c10 names LUB the join");
  assert.ok(!/\(meet\) dos/.test(c10), "#6: guia c10 no longer defines LUB as the meet");
  assert.ok(/limite superior mínimo/.test(c10), "#6: guia c10 defines LUB as the least upper bound");
}

/* ───────────────────────── issue #7: Lista B Q7/Q8 / Guia c12 ──────────────────────
 * SELF_TYPE_C is a special *static* type; the run implementation is dynamic dispatch.
 * Q7 conformance verdicts must stay correct; the prose must distinguish the two and
 * not claim c.baz().foo() necessarily runs C.foo().
 */
{
  const parent = {
    Object: null, Shape: "Object", Quad: "Shape", Circle: "Shape", Rect: "Quad", Square: "Rect",
  };
  const anc = (x) => { const o = []; for (let c = x; c; c = parent[c]) o.push(c); return o; };
  const isSub = (a, b) => anc(a).includes(b);
  // SELF_TYPE_C ≤ P  ⇔  C ≤ P ; a concrete type never conforms to SELF_TYPE_P.
  const selfLeNormal = (c, p) => isSub(c, p);
  const normalLeSelf = () => false;

  assert.equal(normalLeSelf("Square", "Shape"), false, "#7: Square ≤ SELF_TYPE_Shape is false");
  assert.equal(selfLeNormal("Circle", "Quad"), false, "#7: SELF_TYPE_Circle ≤ Quad is false (siblings)");
  assert.equal(selfLeNormal("Shape", "Shape"), true, "#7: SELF_TYPE_Shape ≤ Shape is true");
  assert.equal(selfLeNormal("Rect", "Shape"), true, "#7: SELF_TYPE_Rect ≤ Shape is true");

  const listB = read("Compiladores-Lista-B/js/questions/compiladores/lista-b.js");
  const c12 = read("Guia-de-Compiladores/js/guias/c12-self-type.js");
  const c11 = read("Guia-de-Compiladores/js/guias/c11-tipos-dispatch.js");

  // Q7 verdict rows still present and correct.
  assert.ok(listB.includes('["Square <= SELF_TYPE_Shape", { html: "<span class=\'no\'>falsa</span>" }'), "#7: Q7 keeps Square ≤ SELF_TYPE_Shape = falsa");
  assert.ok(listB.includes('["SELF_TYPE_Rect <= Shape", { html: "<span class=\'ok\'>verdadeira</span>" }'), "#7: Q7 keeps SELF_TYPE_Rect ≤ Shape = verdadeira");

  // Prose distinguishes static type / SELF_TYPE / dynamic, in both list and guide.
  assert.ok(!/representa a classe dinamica de self/.test(listB), "#7: Q7 no longer frames SELF_TYPE as the dynamic class");
  assert.ok(/tipo estatico/.test(listB) && /despacho dinamico/.test(listB), "#7: Q7 names static type and dynamic dispatch");
  assert.ok(!/chama o <code>foo<\/code> de C/.test(c12), "#7: c12 no longer claims c.baz().foo() runs C.foo()");
  assert.ok(/tipo estático/.test(c12) && /despacho dinâmico/.test(c12), "#7: c12 names static type and dynamic dispatch");
  assert.ok(/aparece do lado esquerdo/.test(c12) && /Para saber se ele cabe/.test(c12) && /qualquer subclasse/.test(c12), "#7: c12 explains SELF_TYPE conformance before the formal rule");
  assert.ok(/D ≤ C/.test(c12) && /D\.foo\(\)/.test(c12), "#7: c12 has a subclass-D example (static preserved, dynamic dispatch)");
  // c11 is the correct model the others are aligned to.
  assert.ok(/classe real retornada/.test(c11), "#7: c11 keeps the correct dynamic-dispatch wording");
}

/* ───────────────────────── issue #8: Lista C Q6 / Guia c16 ─────────────────────────
 * Constant propagation: the answer Y=⊤ only holds if Y *enters* as ⊤. With the usual
 * lattice (⊥ < c < ⊤) and join ⊔, a branch that doesn't write Y does NOT turn ⊥ into ⊤.
 * We reproduce the join and show the result depends on the entry state.
 */
{
  const BOT = "⊥", TOP = "⊤";
  const join = (a, b) => (a === BOT ? b : b === BOT ? a : a === TOP || b === TOP ? TOP : a === b ? a : TOP);
  // sanity: the lattice table from the issue
  assert.equal(join(BOT, 1), 1, "#8: ⊥ ⊔ 1 = 1");
  assert.equal(join(1, 1), 1, "#8: 1 ⊔ 1 = 1");
  assert.equal(join(1, 2), TOP, "#8: 1 ⊔ 2 = ⊤");
  assert.equal(join(TOP, 1), TOP, "#8: ⊤ ⊔ 1 = ⊤");

  // CFG: entry {Z:=5} → left {Y:=1; X:=4; Z:=X+Y} and right {X:=4} → join.
  function atJoin(entryY) {
    const left = { X: 4, Y: 1, Z: 5 };               // Z := X+Y = 4+1 = 5
    const right = { X: 4, Y: entryY, Z: 5 };          // right doesn't touch Y or Z
    return { X: join(left.X, right.X), Y: join(left.Y, right.Y), Z: join(left.Z, right.Z) };
  }
  assert.deepEqual(atJoin(TOP), { X: 4, Y: TOP, Z: 5 }, "#8: with Y entering as ⊤, join is (4, ⊤, 5)");
  assert.deepEqual(atJoin(BOT), { X: 4, Y: 1, Z: 5 }, "#8: with Y entering as ⊥, join would be (4, 1, 5)");

  const q6 = read("Compiladores-Lista-C/js/questions/compiladores/lista-c.js");
  const c16 = read("Guia-de-Compiladores/js/guias/c16-propagacao-constantes.js");
  // entry state declared, ⊥/⊤ distinguished, the join shown, ⊤-notation (not "top").
  assert.ok(/entram como <code>⊤<\/code>/.test(q6), "#8: Q6 declares X/Y enter as ⊤");
  assert.ok(/não são sinônimos/.test(q6), "#8: Q6 states ⊥ and ⊤ are not synonyms");
  assert.ok(q6.includes("1 ⊔ ⊤ = ⊤"), "#8: Q6 shows the join 1 ⊔ ⊤ = ⊤");
  assert.ok(q6.includes("4, ⊤, 5"), "#8: Q6 answer uses ⊤ notation");
  assert.ok(!/, top,|top<\/code>/.test(q6), "#8: lista C uses ⊤ (not ASCII 'top') for the lattice top");
  assert.ok(c16.includes("1 ⊔ ⊤ = ⊤"), "#8: c16 shows the join 1 ⊔ ⊤ = ⊤");
  assert.ok(/não são sinônimos/.test(c16), "#8: c16 states ⊥ and ⊤ are not synonyms");
  assert.ok(/entram como <code>⊤<\/code>|chegam <b>desconhecidos de fora<\/b>/.test(c16), "#8: c16 states parameters enter as ⊤");
}

/* ───────────────────────── issue #9: Lista C Q11 / Guia c18 ────────────────────────
 * A degree-0 node must never be the spill pick (it gets simplified). The corrected
 * RIG is a K4 with k=3 (every node degree 3 ≥ k, chromatic number 4 > 3): spill is
 * truly forced, and the exercise's cost formula picks D (cheapest, outside the loop).
 */
{
  const k = 3;
  const edges = [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["B", "D"]]; // K4
  const deg = {};
  for (const [u, v] of edges) { deg[u] = (deg[u] || 0) + 1; deg[v] = (deg[v] || 0) + 1; }
  for (const n of ["A", "B", "C", "D"]) assert.ok(deg[n] >= k, `#9: ${n} has degree ${deg[n]} ≥ k=${k} (stuck — no simplify)`);

  const cost = (usos, conflitos, loop) => usos - conflitos + (loop ? 5 : 0);
  const costs = { A: cost(6, 3, true), B: cost(5, 3, true), C: cost(4, 3, true), D: cost(4, 3, false) };
  assert.deepEqual(costs, { A: 8, B: 7, C: 6, D: 1 }, "#9: costs per the exercise's formula");
  const spill = Object.keys(costs).reduce((a, b) => (costs[b] < costs[a] ? b : a));
  assert.equal(spill, "D", "#9: lowest-cost spill among the stuck nodes is D");
  // D beats C purely by loop membership (identical uses and degree) — cost vs degree vs frequency.
  assert.equal(cost(4, 3, true), 6, "#9: C in loop costs 6");
  assert.equal(cost(4, 3, false), 1, "#9: D outside loop costs 1 (same uses/degree as C)");

  const q11 = read("Compiladores-Lista-C/js/questions/compiladores/lista-c.js");
  const c18 = read("Guia-de-Compiladores/js/guias/c18-rig-coloracao.js");
  for (const [u, v] of edges) assert.ok(q11.includes(`["${u}", "${v}"]`), `#9: Q11 RIG has K4 edge ${u}-${v}`);
  assert.ok(/regra deste exercício/i.test(q11), "#9: Q11 labels the cost formula as the exercise's rule");
  assert.ok(/grau &lt; k/.test(q11) && /simplificad/.test(q11), "#9: Q11 notes a degree<k node would be simplified, not spilled");
  assert.ok(!/\["D", "1", "0",/.test(q11), "#9: Q11 spill node no longer has degree 0");
  assert.ok(/deste exercício/.test(c18), "#9: c18 labels the cost formula as the exercise's rule");
  assert.ok(!/\["D", "1", "0", "0"/.test(c18), "#9: c18 spill node no longer has degree 0");
  assert.ok(/K4/.test(c18) && /grau ≥ k/.test(c18), "#9: c18 frames spill as a stuck core (all degree ≥ k)");
}

console.log("Compilers content checks passed.");
