/*
 * compilers-new-topics.test.mjs — Coverage checks for the extended
 * Guia-de-Compiladores topic set. These tests assert the public guide ids,
 * card metadata, manifest order, and core concepts from the compiler lectures.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCompilersGuides } from "./_compilers-harness.mjs";

const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ");
const norm = (s) =>
  strip(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const expected = [
  {
    id: "c21-tabela-simbolos",
    title: "Tabelas de símbolos como estrutura de compilador",
    section: "Análise Semântica",
    needles: ["pilha simples", "pilha de escopos", "enter_scope", "exit_scope", "check_scope", "travessia recursiva", "multiplas passagens"],
  },
  {
    id: "c22-semantica-linguagens",
    title: "Semântica formal de linguagens",
    section: "Semântica Operacional",
    needles: ["semantica formal", "assembly", "operacional", "denotacional", "axiomatica"],
  },
  {
    id: "c23-semantica-operacional",
    title: "Semântica operacional formal",
    section: "Semântica Operacional",
    needles: ["so, e, s", "ambiente", "store", "local", "valor resultante", "s'", "efeitos colaterais", "invariantes"],
  },
  {
    id: "c24-semantica-cool",
    title: "Semântica operacional de COOL",
    section: "Semântica Operacional",
    needles: ["constantes", "identificadores", "atribuicao", "blocos", "while", "let", "new t", "inicializacao hierarquica", "dispatch dinamico", "erros dinamicos"],
  },
  {
    id: "c25-runtime-organization",
    title: "Organização geral do runtime",
    section: "Geração de Código",
    needles: ["front-end", "back-end", "codigo", "dados estaticos", "stack", "heap", "globais", "colisao"],
  },
  {
    id: "c26-alinhamento-memoria",
    title: "Alinhamento de memória e padding",
    section: "Geração de Código",
    needles: ["word boundary", "desalinhado", "penalidade", "falha", "padding", "string"],
  },
  {
    id: "c27-codigo-intermediario",
    title: "Código intermediário / three-address code",
    section: "Geração de Código",
    needles: ["ir", "three-address code", "registradores ilimitados", "temporarios", "retargeting", "subexpressao"],
  },
  {
    id: "c32-otimizacao-dataflow",
    title: "Otimização e dataflow: visão geral",
    section: "Otimização",
    needles: ["otimizacao segura", "cfg", "direcao da analise", "meet", "join", "lattice", "ordens", "ponto fixo"],
  },
  {
    id: "c28-peephole-optimization",
    title: "Peephole optimization",
    section: "Otimização",
    needles: ["janela deslizante", "lhs", "rhs", "aplicacao repetida", "melhoria"],
  },
  {
    id: "c30-cache-loop-interchange",
    title: "Cache e loop interchange",
    section: "Otimização",
    needles: ["registradores", "cache", "dram", "disco", "cache miss", "localidade", "loop interchange"],
  },
  {
    id: "c29-spilling-avancado",
    title: "Spilling avançado",
    section: "Alocação de Registradores",
    needles: ["coloracao otimista", "load", "store", "live range", "reconstruir o rig", "repetir"],
  },
  {
    id: "c33-gerenciamento-automatico-memoria",
    title: "Gerenciamento automático de memória: visão geral",
    section: "Gerenciamento de Memória",
    needles: ["bugs de memoria manual", "raizes", "alcancabilidade", "aproximacao", "layout de frames", "coletor"],
  },
  {
    id: "c31-coleta-conservadora",
    title: "Coleta de lixo conservadora",
    section: "Gerenciamento de Memória",
    needles: ["c/c++", "ponteiro", "parece ponteiro", "nao pode mover", "mark-and-sweep"],
  },
];

const { specs } = loadCompilersGuides();
const byId = new Map(specs.map((s) => [s.id, s]));

const manifest = readFileSync("Guia-de-Compiladores/js/manifest.js", "utf8");
const manifestPositions = expected.map((topic) => {
  const needle = `js/guias/${topic.id}.js`;
  const pos = manifest.indexOf(needle);
  assert.ok(pos >= 0, `${topic.id} should be listed in the compilers guide manifest`);
  return pos;
});
assert.deepEqual(
  manifestPositions,
  [...manifestPositions].sort((a, b) => a - b),
  "new compiler topics should appear in pedagogical order in manifest.js",
);

for (const topic of expected) {
  const spec = byId.get(topic.id);
  assert.ok(spec, `${topic.id} should be registered`);
  assert.equal(spec.title, topic.title, `${topic.id} title`);
  assert.equal(spec.section, topic.section, `${topic.id} section`);
  assert.ok(spec.statement && spec.hubDesc, `${topic.id} should have statement and hub description`);

  const steps = spec.parts.flatMap((part) => part.build());
  assert.ok(steps.length >= 5, `${topic.id} should be a real multi-step guide`);
  const text = norm([
    spec.title,
    spec.section,
    spec.hubDesc,
    spec.statement,
    ...steps.map((step) => `${step.title} ${step.body || ""}`),
  ].join(" "));
  for (const needle of topic.needles) {
    assert.ok(text.includes(norm(needle)), `${topic.id} should cover "${needle}"`);
  }
}

console.log(`Compilers new-topic checks passed (${expected.length} new guides).`);
