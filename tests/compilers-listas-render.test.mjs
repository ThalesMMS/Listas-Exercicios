/*
 * compilers-listas-render.test.mjs — Smoke + content test for the Compiladores
 * listas (A, B, C). Every question builds and every step (dom and svg) renders
 * without throwing, and the questions made self-contained in issue #10 actually
 * carry the grammars / hierarchies / programs / CFGs / sequences they reference.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCompilersGuides, makeEl } from "./_compilers-harness.mjs";

const ROOTS = [
  { root: "Compiladores-Lista-A", min: 8 },
  { root: "Compiladores-Lista-B", min: 8 },
  { root: "Compiladores-Lista-C", min: 8 },
  { root: "Compiladores-Lista-D", min: 5 },
];
const read = (p) => readFileSync(p, "utf8");

let totalSteps = 0;
const failures = [];

for (const { root, min } of ROOTS) {
  const { specs, SvgSurface } = loadCompilersGuides(root);
  assert.ok(specs.length >= min, `${root}: expected >= ${min} questions, got ${specs.length}`);
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

// Lista C — user-facing Portuguese text should not fall back to ASCII-only
// spellings. Keep ids/tags/code identifiers out of this denylist; these are
// fragments from visible titles, statements, bodies, rows, labels and notes.
const cUnaccentedVisibleFragments = [
  "Geracao de Codigo",
  "Reconhecendo a expressao",
  "codigo MIPS-like",
  "arvore da expressao",
  "Escolha a expressao",
  "O padrao de avaliacao",
  "O codigo empilha",
  "Reconstrucao",
  "A expressao correta e",
  "Variaveis no registro de ativacao",
  "Separar parametros",
  "Temporarios necessarios",
  "traducao ingenua, sem reutilizacao",
  "A funcao",
  "A pergunta nao e",
  "mecanica: quantos nomes temporarios",
  "Nesta questao",
  "temporario</b> e",
  "codigo de tres",
  "estrategia de geracao de codigo",
  "entao vamos fixa-la",
  "os ramos sao alternativas",
  "Estrategia adotada",
  "Variaveis ficam",
  "constantes sao",
  "condicao do <code>if</code>",
  "Contagem por subexpressao",
  "Nao e pico",
  "analise de vivacidade",
  "Tambem nao somamos",
  "sao dois nomes temporarios",
  "nao precisa",
  "ramos nao somam",
  "essa e uma contagem",
  "vivacidade padrao",
  "a sequencia seria",
  "ordem de heranca",
  "relacao de heranca",
  "posicoes",
  "vem primeiro",
  "notacao",
  "Otimizacoes validas",
  "bloco basico",
  "expressoes comuns",
  "codigo morto",
  "simplificacao",
  "sao referenciados",
  "otimizacoes propostas sao validas",
  "opcoes",
  "nao</span>",
  "apos simplificacoes",
  "juncao apos",
  "Apos propagacao",
  "inalcancavel",
  "alcancavel, mas nao-constante",
  "ponto importante e a juncao",
  "so e redefinido",
  "arbitrarios",
  "sem informacao",
  "nao sao sinonimos",
  "ate a juncao",
  "Juncao variavel",
  "mantem",
  "entrada, nao redefinida",
  "nao e 1",
  "lacos",
  "Um laco",
  "informacao de volta",
  "ja analisado",
  "analise nao muda",
  "perderem precisao",
  "Ja <code>Y</code>",
  "Analise de vivacidade",
  "para tras",
  "variaveis estao vivas",
  "variaveis entre",
  "variaveis mortas na saida",
  "esta viva",
  "senao",
  "e usada",
  "As variaveis vivas sao",
  "Alocacao de Registradores",
  "Coloracao minima",
  "coloracao e valida",
  "menor numero",
  "vertices",
  "coloracao minima valida",
  "O RIG e bipartido",
  "nao podem",
  "Entao uma coloracao",
  "tres cores",
  "Sequencia de eliminacao",
  "cada no removido",
  "sequencias de eliminacao sao validas",
  "Grafo de interferencia",
  "os nos que ainda sao faceis",
  "A regra e",
  "so remova no",
  "So e valido remover",
  "comentario",
  "removiveis",
  "apos remover",
  "nao pode ser simplificado",
  "todos os nos tem grau",
  "no a derramar",
  "Os quatro nos",
  "outros tres",
  "entao todos tem",
  "Nenhum no tem",
  "nao remove ninguem",
  "heuristica",
  "decisao",
  "frequencia",
  "esta fora do laco",
  "nao derramado",
  "Gerenciamento de Memoria",
  "alcancaveis",
  "celulas",
  "ja livres",
  "comeca pelas raizes",
  "da para alcancar",
  "raiz alcanca",
  "nao e alcancavel",
  "nao marcados",
  "nao foi marcado",
  "nao compacta",
  "tambem parte das raizes",
  "espaco novo",
  "Ordem de copia",
  "varredura de copia",
  "espaco antigo",
  "referencias apos atribuicoes",
  "referencias, liberar",
  "nao sao coletados",
  "Duas atualizacoes",
  "tambem deixa",
  "de saida tambem",
  "zera e e",
  "tambem zera",
  "ultima celula",
];
const C_VISIBLE_FOR_ACCENTS = C.split("\n")
  .filter((line) => !/^\s*(id|tags):/.test(line))
  .join("\n");
for (const fragment of cUnaccentedVisibleFragments)
  assert.ok(!C_VISIBLE_FOR_ACCENTS.includes(fragment), `C accent sweep: stale ASCII fragment "${fragment}"`);

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

// Lista C Q2 — activation records must be taught, not just answered.
assert.ok(/registro de ativação \(ou frame\)/.test(C), "C-Q2: defines activation record/frame");
assert.ok(/um frame por chamada ativa/.test(C), "C-Q2: states frames are created per active call");
assert.ok(C.includes("Quando <code>f</code> chama <code>g(y)</code>") && C.includes("t</code> recebe o valor atual de <code>y</code>"), "C-Q2: explains g(y) argument binding");
assert.ok(C.includes("Se a chamada for <code>g(z)</code>") && C.includes("t</code> recebe o valor atual de <code>z</code>"), "C-Q2: explains g(z) argument binding");
assert.ok(C.includes("nome/rótulo da função") && C.includes("não é variável armazenada no frame de f"), "C-Q2: explains why g is not a frame variable");
assert.ok(C.includes("Eliminando as alternativas"), "C-Q2: walks through the choices");

// Lista C Q3 — the function and a definition of "temporário".
assert.ok(C.includes("def potenciaDeDois(x)"), "#10 C-Q3: full function shown");
assert.ok(/nome\/slot intermediário/.test(C) && /entre regiões, o espaço reservado pode ser reaproveitado/.test(C), "#10 C-Q3: 'temporário' defined and scoped to evaluation regions");
assert.ok(C.includes("Geração de código é a fase que transforma uma expressão em instruções menores"), "C-Q3: introduces code generation for beginners");
assert.ok(C.includes("temporário não é uma variável escrita pelo programador"), "C-Q3: distinguishes compiler temporaries from source variables");
assert.ok(C.includes("Neste exercício, conte nomes novos"), "C-Q3: gives the counting rule before solving");
assert.ok(C.includes("Não conte constantes imediatas") && C.includes("não conte o registrador-resultado"), "C-Q3: lists what not to count");
assert.ok(C.includes("Primeiro resolvemos a condição") && C.includes("Depois resolvemos os ramos"), "C-Q3: presents a step-by-step solving order");
// Q3 must state that the count is strategy-dependent and show the three-address IR
// that grounds it (resolving the x%2==0 vs x==1 inconsistency).
assert.ok(/depende da estratégia de geração de código/.test(C), "C-Q3: count framed as strategy-dependent");
assert.ok(/código de três endereços/.test(C) && /registrador-resultado/.test(C), "C-Q3: shows the three-address IR / code-gen strategy");
assert.ok(C.includes("t2 = (t1 == 0)") && C.includes("r  = (x == 1)"), "C-Q3: IR makes the 2-vs-0 counts explicit");
assert.ok(C.includes("t1</code> não precisa estar vivo no branch"), "C-Q3: branch test no longer claims t1 and t2 are live together");
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

/* ── Lista D: the answer each question references is actually in the file ── */
const D = read("Compiladores-Lista-D/js/questions/compiladores/lista-d.js");
// Q1 — SELF_TYPE fill-ins and the exact target output.
for (const s of ["new SELF_TYPE", "Cool compilers are Cool"])
  assert.ok(D.includes(s), `D-Q1: "${s}" present`);
assert.ok(!/SELF_TYPE[^"]+tipo dinâmico do receptor/.test(D), "D-Q1: SELF_TYPE is not framed as merely the receiver dynamic type");
// Q2 — reference counting: both assignments and the cycle-leak caveat.
for (const s of ["C.ptrParaB = D", "A.ptrParaB = NULL", "ciclos vazam"])
  assert.ok(D.includes(s), `D-Q2: "${s}" present`);
// Q3 — the stack offsets (in order) and the assembly it fills.
for (const s of ["16($sp)", "(1) 16", "case_abort", "String.length"])
  assert.ok(D.includes(s), `D-Q3: "${s}" present`);
// Q4 — liveness boundary, RIG edges and the minimum registers.
for (const s of ["OUT[10] = { f }", '["a", "b"]', '["c", "e"]', "mínimo = 3 registradores"])
  assert.ok(D.includes(s), `D-Q4: "${s}" present`);
// Q5 — a valid simplify elimination sequence for k = 3.
assert.ok(D.includes("d, e, c, a, b, f"), "D-Q5: valid elimination sequence shown");

console.log(`Compilers listas render + content checks passed (${totalSteps} steps across ${ROOTS.length} listas).`);
