/*
 * Statement visibility/completeness across the remaining question lists.
 *
 * C/D have their own regression test; this one covers Compiladores A/B and
 * Computacao Grafica lists, including the legacy q-* layout from CG Lista 1.
 * The statement card belongs once near the top of the page; the step panel must
 * not duplicate it.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { loadCompilersGuides } from "./_compilers-harness.mjs";

const require = createRequire(import.meta.url);
const read = (p) => readFileSync(p, "utf8");

function plain(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&rarr;/g, "->")
    .replace(/&amp;/g, "&")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function byId(root) {
  const { specs } = loadCompilersGuides(root);
  return new Map(specs.map((spec) => [spec.id, spec]));
}

function assertStatementIncludes(spec, needles) {
  const text = plain(spec.statement || spec.enunciado);
  for (const needle of needles) {
    const expected = plain(needle);
    assert.ok(
      text.includes(expected) || text.toLowerCase().includes(expected.toLowerCase()),
      `${spec.id}: statement should include "${expected}", got: ${text}`
    );
  }
}

function loadLegacyCg1() {
  const root = "CG - Lista de exercícios 1";
  const alg = require("../CG - Lista de exercícios 1/js/lib/algorithms.js");
  const window = {
    ALG: alg,
    CGAlgorithms: alg,
    CartesianPlane: { COLORS: {} },
    addEventListener() {},
  };
  window.GUI = {
    questions: {},
    order: [],
    register(q) {
      this.questions[q.id] = q;
      this.order.push(q.id);
    },
    all() {
      return this.order.map((id) => this.questions[id]);
    },
  };
  const context = vm.createContext({ window, document: {}, console, require });
  for (let i = 1; i <= 37; i++) {
    const rel = `js/questions/q${String(i).padStart(2, "0")}.js`;
    vm.runInContext(read(path.join(root, rel)), context, { filename: rel });
  }
  return new Map(window.GUI.all().map((spec) => [spec.id, spec]));
}

for (const root of [
  "Compiladores-Lista-A",
  "Compiladores-Lista-B",
  "CG - Lista de exercícios 2",
  "CG - Lista de exercícios 3",
]) {
  const layout = read(`${root}/js/core/layout.js`);
  const css = read(`${root}/css/layout.css`);
  assert.ok(layout.includes("ex-statement"), `${root}: page should render the statement once near the top`);
  assert.ok(!layout.includes("ex-step-statement"), `${root}: step panel should not duplicate the statement`);
  assert.ok(!css.includes(".ex-step-statement"), `${root}: duplicate statement styling should not remain`);
}

{
  const layout = read("CG - Lista de exercícios 1/js/core/layout.js");
  const css = read("CG - Lista de exercícios 1/css/styles.css");
  assert.ok(layout.includes("q-enunciado"), "CG Lista 1: page should render the statement once near the top");
  assert.ok(!layout.includes("q-step-enunciado"), "CG Lista 1: step panel should not duplicate the statement");
  assert.ok(!css.includes(".q-step-enunciado"), "CG Lista 1: duplicate statement styling should not remain");
}

const A = byId("Compiladores-Lista-A");
assertStatementIncludes(A.get("a-q04-transformacoes-gramatica"), ["S -> S + S | S + P | P", "S -> S a S | U", "T -> T n | t | f | (S)"]);
assertStatementIncludes(A.get("a-q07-ll1-ou-nao"), ["X -> aY | Z", "R -> o | S", "K -> c | lambda", "L -> b"]);

const B = byId("Compiladores-Lista-B");
assertStatementIncludes(B.get("b-q01-escopo"), ["class Foo", "let x : Int <- 4", "linha 10"]);
assertStatementIncludes(B.get("b-q04-lub"), ["Object", "Shape", "Quad", "Square"]);
assertStatementIncludes(B.get("b-q06-estatico-dinamico"), ["Animal", "Pet", "w : Animal <- new Animal", "z : Pet"]);
assertStatementIncludes(B.get("b-q08-self-type-programas"), ["class A", "baz() : A", "2021x"]);

const CG1 = loadLegacyCg1();
assertStatementIncludes(CG1.get(7), ["DDA", "|Δx| >= |Δy|", "|Δy| > |Δx|"]);
assertStatementIncludes(CG1.get(9), ["DDA", "passos = max", "xinc", "yinc"]);
assertStatementIncludes(CG1.get(11), ["Bresenham", "DDA", "aritmetica inteira"]);

const CG2 = byId("CG - Lista de exercícios 2");
assertStatementIncludes(CG2.get("q01"), ["projecao geometrica", "3D", "2D"]);
assertStatementIncludes(CG2.get("q02"), ["objeto", "COP", "plano de projecao", "projetores"]);
assertStatementIncludes(CG2.get("q03"), ["paralela", "perspectiva", "ortografica", "obliqua"]);
