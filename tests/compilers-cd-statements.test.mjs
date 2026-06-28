/*
 * Compiladores C/D: the public question pages must show the exercise statement
 * once near the top, while code-heavy steps keep the referenced code visible in
 * their own visual panel. The step explanation panel must not duplicate the
 * statement card.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCompilersGuides } from "./_compilers-harness.mjs";

const read = (p) => readFileSync(p, "utf8");

function byId(root) {
  const { specs } = loadCompilersGuides(root);
  return new Map(specs.map((spec) => [spec.id, spec]));
}

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

function assertStatementIncludes(spec, needles) {
  const text = plain(spec.statement);
  for (const needle of needles) {
    assert.ok(
      text.includes(needle) || text.toLowerCase().includes(String(needle).toLowerCase()),
      `${spec.id}: statement should include "${needle}", got: ${text}`
    );
  }
}

for (const root of ["Compiladores-Lista-C", "Compiladores-Lista-D"]) {
  const layout = read(`${root}/js/core/layout.js`);
  const css = read(`${root}/css/layout.css`);
  assert.ok(layout.includes("ex-statement"), `${root}: page should render the statement once near the top`);
  assert.ok(!layout.includes("ex-step-statement"), `${root}: step panel should not duplicate the statement`);
  assert.ok(!css.includes(".ex-step-statement"), `${root}: duplicate statement styling should not remain`);
}

const C = byId("Compiladores-Lista-C");
assertStatementIncludes(C.get("c-q01-assembly-expressao"), ["assembly", "empilha 5", "sub", "add"]);
assertStatementIncludes(C.get("c-q02-registro-ativacao"), ["f(x,y,z)", "g(t)", "registro de ativacao"]);
assertStatementIncludes(C.get("c-q04-layout-heranca"), ["ID, size, disp, x, y, z, u, v", "heranca"]);
assertStatementIncludes(C.get("c-q05-otimizacoes-bloco-basico"), ["a := 1", "g := e - f", "Somente g e x"]);
assertStatementIncludes(C.get("c-q07-propagacao-lacos"), ["Z := 5", "X := Z + 3", "ponto indicado"]);
assertStatementIncludes(C.get("c-q09-rig-coloracao"), ["arestas", "(a,f)", "(a,d)", "coloracao minima"]);
assertStatementIncludes(C.get("c-q10-eliminacao-rig"), ["k = 3", "arestas", "(f,d)", "(d,c)"]);
assertStatementIncludes(C.get("c-q12-mark-sweep"), ["root -> A", "B <-> C", "D <-> F"]);
assertStatementIncludes(C.get("c-q13-stop-copy"), ["root -> A", "A -> B", "A -> E", "D <-> F"]);
assertStatementIncludes(C.get("c-q14-reference-counting"), ["A -> B", "C.ptrParaB = D", "A.ptrParaB = NULL"]);

const D = byId("Compiladores-Lista-D");
assertStatementIncludes(D.get("d-q01-self-type-dispatch"), ["linhas 3, 5, 8 e 12", "Cool compilers are Cool"]);
assertStatementIncludes(D.get("d-q02-contagem-referencias"), ["root", "C.ptrParaB = D", "A.ptrParaB = NULL"]);
assertStatementIncludes(D.get("d-q03-maquina-pilha-offsets"), ["frame pointer", "8 lacunas", "$sp"]);
assertStatementIncludes(D.get("d-q04-vivacidade-rig-coloracao"), ["b e d entradas", "f o unico valor vivo"]);
assertStatementIncludes(D.get("d-q05-eliminacao-simplify-k3"), ["RIG", "k = 3", "simplify"]);
