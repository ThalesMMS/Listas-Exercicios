import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function read(path) {
  return readFileSync(path, "utf8");
}

function loadRelatedGuides() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("shared/related-guides.js"), context, { filename: "shared/related-guides.js" });
  return context.window.RelatedGuides;
}

function titlesFor(api, q) {
  return api.forQuestion(q).map((g) => g.title);
}

function assertHas(api, q, title) {
  assert.ok(titlesFor(api, q).includes(title), `${q.title} should link to ${title}`);
}

const api = loadRelatedGuides();

assertHas(
  api,
  { subject: "Computação Gráfica", section: "III) Rasterização de Circunferências", title: "Bresenham para circunferências" },
  "Bresenham para circunferências",
);
assertHas(
  api,
  { subject: "Representação de Sólidos", title: "Operações de conjunto (CSG)" },
  "CSG — Constructive Solid Geometry",
);
assertHas(
  api,
  { subject: "Computação Gráfica — Lista 3", section: "III) Sombreamento", title: "Sombreamento Phong × Gouraud", tags: ["sombreamento", "phong", "gouraud"] },
  "Sombreamento Flat, Gouraud e Phong",
);
assertHas(
  api,
  { subject: "Computação Gráfica — Lista 3", section: "V) Animação e Cinemática", title: "Cadeias articuladas", tags: ["animação", "juntas", "articulado"] },
  "Bones: esqueleto e skinning",
);
assert.equal(
  api.forQuestion({ subject: "Visualização 3D e Projeções", title: "O que é projeção?" }).length,
  0,
  "projection questions should not invent a guide link",
);

assertHas(
  api,
  { subject: "Compiladores - Lista A", section: "Analise Lexica", title: "Trace de um analisador lexico Flex-like", tags: ["lexico", "trace"] },
  "Análise léxica (maximal munch)",
);
assertHas(
  api,
  { subject: "Compiladores - Lista B", section: "SELF_TYPE", title: "Relacoes de subtipos com SELF_TYPE", tags: ["self_type", "subtipo"] },
  "SELF_TYPE",
);
assertHas(
  api,
  { subject: "Compiladores - Lista C", section: "Gerenciamento de Memoria", title: "Contagem de referencias apos atribuicoes", tags: ["gc", "reference-counting"] },
  "Contagem de referências",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Semantica operacional", title: "Environment store julgamento so E S", tags: ["semantica operacional"] },
  "Semântica operacional formal",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Codigo intermediario", title: "Three-address code com temporarios ilimitados", tags: ["ir", "retargeting"] },
  "Código intermediário / three-address code",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Otimizacao", title: "Peephole com regras LHS RHS em assembly", tags: ["peephole"] },
  "Peephole optimization",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Otimizacao", title: "Cache miss e loop interchange", tags: ["cache", "loop interchange"] },
  "Cache e loop interchange",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Dataflow", title: "CFG meet join lattice ponto fixo", tags: ["dataflow", "optimization overview"] },
  "Otimização e dataflow: visão geral",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Gerenciamento de Memoria", title: "Coleta conservadora em C/C++", tags: ["conservative collection"] },
  "Coleta de lixo conservadora",
);
assertHas(
  api,
  { subject: "Compiladores", section: "Gerenciamento de Memoria", title: "Raizes alcancabilidade layout de frames para GC", tags: ["automatic memory management"] },
  "Gerenciamento automático de memória: visão geral",
);

for (const rel of [
  "CG - Lista de exercícios 2/js/manifest.js",
  "CG - Lista de exercícios 3/js/manifest.js",
  "Compiladores-Lista-A/js/manifest.js",
  "Compiladores-Lista-B/js/manifest.js",
  "Compiladores-Lista-C/js/manifest.js",
]) {
  const manifest = read(rel);
  assert.ok(manifest.indexOf("../shared/related-guides.js") >= 0, `${rel} should load related guides`);
  assert.ok(
    manifest.indexOf("../shared/related-guides.js") < manifest.indexOf("js/core/layout.js"),
    `${rel} should load related guides before layout`,
  );
}

assert.ok(
  read("CG - Lista de exercícios 1/question.html").includes("../shared/related-guides.js"),
  "Lista 1 question page should load related guides",
);

for (const rel of [
  "CG - Lista de exercícios 1/js/core/layout.js",
  "CG - Lista de exercícios 2/js/core/layout.js",
  "CG - Lista de exercícios 3/js/core/layout.js",
  "Compiladores-Lista-A/js/core/layout.js",
  "Compiladores-Lista-B/js/core/layout.js",
  "Compiladores-Lista-C/js/core/layout.js",
]) {
  const layout = read(rel);
  assert.ok(layout.includes("forQuestion(q)"), `${rel} should render guide links`);
  assert.ok(layout.includes("Ver mais: "), `${rel} should label guide links`);
}

console.log("Related guide link checks passed.");
