/*
 * compilers-listas-render.test.mjs — Smoke + content test for the Compiladores
 * listas (A, B, C). Every question builds and every step (dom and svg) renders
 * without throwing, and the questions made self-contained in issue #10 actually
 * carry the grammars / hierarchies / programs / CFGs / sequences they reference.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCompilersGuides, makeEl } from "./_compilers-harness.mjs";

const ROOTS = ["Compiladores-Lista-A", "Compiladores-Lista-B", "Compiladores-Lista-C"];
const read = (p) => readFileSync(p, "utf8");

let totalSteps = 0;
const failures = [];

for (const root of ROOTS) {
  const { specs, SvgSurface } = loadCompilersGuides(root);
  assert.ok(specs.length >= 8, `${root}: expected >= 8 questions, got ${specs.length}`);
  for (const spec of specs) {
    for (const part of spec.parts) {
      let steps;
      try {
        steps = part.build();
      } catch (e) {
        failures.push(`BUILD ${root}/${spec.id}: ${e.message}`);
        continue;
      }
      assert.ok(Array.isArray(steps) && steps.length, `${root}/${spec.id} build() must return steps`);
      for (const st of steps) {
        totalSteps++;
        const v = st.visual;
        if (!v || typeof v.draw !== "function") continue;
        try {
          if (v.type === "svg") {
            const s = new SvgSurface(makeEl("svg"));
            if (v.view) s.view(v.view[0], v.view[1]);
            v.draw(s);
          } else if (v.type === "dom") {
            v.draw(makeEl("div"));
          }
        } catch (e) {
          failures.push(`DRAW ${root}/${spec.id} "${st.title}": ${e.message}`);
        }
      }
    }
  }
}
assert.equal(failures.length, 0, "lista render failures:\n" + failures.join("\n"));

/* ── issue #10: the self-contained content is actually present in each question ── */
const A = read("Compiladores-Lista-A/js/questions/compiladores/lista-a.js");
const B = read("Compiladores-Lista-B/js/questions/compiladores/lista-b.js");
const C = read("Compiladores-Lista-C/js/questions/compiladores/lista-c.js");

// Lista A Q7 — the four grammars are shown (not only in the guide).
for (const g of ["X -> aY | Z", "R -> o | S", "S -> g | og", "K -> c | lambda", "L -> c", "L -> b"])
  assert.ok(A.includes(g), `#10 A-Q7: grammar fragment "${g}" present`);

// Lista B Q2 — full inference rules with premises and proposed conclusion.
for (const r of ["e1 &lt; e2 : Int", "e1 / e2 : Bool", "{ e1; ...; en; } : Tn", "isvoid(e) : Bool"])
  assert.ok(B.includes(r), `#10 B-Q2: inference rule "${r}" present`);

// Lista B Q6 — the Animal hierarchy is drawn.
for (const e of ['["Animal", "Pet"]', '["Animal", "Lion"]', '["Pet", "Cat"]', '["Pet", "Dog"]'])
  assert.ok(B.includes(e), `#10 B-Q6: hierarchy edge ${e} present`);

// Lista B Q8 — classes B, C, the main, and the second program.
for (const s of ["class B inherits A", "class C inherits A", "A melhor disciplina",
  "c.baz().foo()", "x : Int <- 20", "SEU CODIGO"])
  assert.ok(B.includes(s), `#10 B-Q8: program fragment "${s}" present`);

// Lista C Q3 — the function and a definition of "temporário".
assert.ok(C.includes("def potenciaDeDois(x)"), "#10 C-Q3: full function shown");
assert.ok(/nome\/slot intermediario/.test(C) && /sem reutilizacao de slots/.test(C), "#10 C-Q3: 'temporário' defined as a naive slot/name count");
// Q3 must state that the count is strategy-dependent and show the three-address IR
// that grounds it (resolving the x%2==0 vs x==1 inconsistency).
assert.ok(/depende da estrategia de geracao de codigo/.test(C), "C-Q3: count framed as strategy-dependent");
assert.ok(/codigo de tres enderecos/.test(C) && /registrador-resultado/.test(C), "C-Q3: shows the three-address IR / code-gen strategy");
assert.ok(C.includes("t2 = (t1 == 0)") && C.includes("r  = (x == 1)"), "C-Q3: IR makes the 2-vs-0 counts explicit");
assert.ok(C.includes("t1</code> nao precisa estar vivo no branch"), "C-Q3: branch test no longer claims t1 and t2 are live together");
assert.ok(C.includes("1, 1, 0, 1"), "C-Q3: standard liveness/reuse alternative is acknowledged");
assert.ok(!C.includes("vivos juntos no teste do branch"), "C-Q3: stale liveness claim removed");

// Lista C Q4 — unambiguous inheritance instead of "B < C < A".
assert.ok(C.includes("A herda de C; C herda de B"), "#10 C-Q4: explicit inheritance chain");
assert.ok(C.includes("A &le; C &le; B"), "#10 C-Q4: subtype relation defined");
assert.ok(!/B &lt; C &lt; A/.test(C), "#10 C-Q4: ambiguous 'B < C < A' removed");

// Lista C Q8 — the CFG grounding the liveness sets.
for (const s of ["Z := W + 4", "Y := Y + 1", "U := Z", "if X > 0"])
  assert.ok(C.includes(s), `#10 C-Q8: CFG fragment "${s}" present`);

// Lista C Q10 — all four elimination sequences, not just the valid one.
for (const seq of ["d, e, c, b, a, f", "e, f, d, c, b, a", "d, c, e, b, a, f", "d, e, b, c, a, f"])
  assert.ok(C.includes(seq), `#10 C-Q10: sequence "${seq}" shown`);

console.log(`Compilers listas render + content checks passed (${totalSteps} steps across ${ROOTS.length} listas).`);
