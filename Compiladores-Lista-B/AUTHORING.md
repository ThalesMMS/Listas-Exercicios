# Guia do Autor — Explainer-Template

Este guia é a referência para **escrever questões**: o contrato de cada passo, a
API das três superfícies de desenho e o **catálogo de componentes** de alto nível
(`EX.Plane`, `EX.Raster`, `EX.Diagram.*`, `EX.Content.*`, `EX.Slides.*`,
`EX.Walkthrough.*`). Para a visão geral do projeto e "como abrir", veja
[`README.md`](README.md).

Tudo é **PT-BR**, **JS puro** (IIFE + namespace global, sem ES modules, sem
`fetch`, sem build) e roda em `file://`.

Antes de escrever questões, copie a pasta inteira do template para o novo
projeto/lista. A pasta resultante é uma **copia independente**: ela deve carregar
somente seus próprios arquivos e não deve depender de `../Explainer-Template`.
O template original não é uma **dependencia de producao** das listas geradas.

Para personalizar o hub sem editar o HTML estrutural, ajuste `js/config.js`:
`pageTitle`, `hubTitle`, `hubDescriptionHtml` e `hubChipsHtml`.

---

## Índice

1. [Contrato: questão, parte e passo](#1-contrato-questão-parte-e-passo)
2. [O objeto `visual` (as quatro variantes)](#2-o-objeto-visual)
3. [API da superfície `plane` (canvas)](#3-api-da-superfície-plane-canvas)
4. [API da superfície `svg`](#4-api-da-superfície-svg)
5. [API da superfície `dom`](#5-api-da-superfície-dom)
6. [Catálogo de componentes](#6-catálogo-de-componentes)
   - [EX.Plane](#explane-canvas) · [EX.Raster](#exraster-canvas)
   - [EX.Diagram](#exdiagram-svg) · [EX.Content](#excontent-dom)
   - [EX.Slides](#exslides-passos-prontos) · [EX.Walkthrough](#exwalkthrough-passos-prontos)
7. [Classes CSS de conteúdo](#7-classes-css-de-conteúdo)
8. [Padrões recomendados](#8-padrões-recomendados)
9. [Dicas finais](#9-dicas-finais)

---

## 1. Contrato: questão, parte e passo

Cada arquivo em `js/questions/` registra **uma** questão:

```js
EX.registry.add({
  id: "slug-unico",          // string única -> vira ?q=slug-unico
  num: "20",                  // rótulo curto opcional (badge)
  subject: "Computação Gráfica",  // agrupa no hub (1º nível)
  section: "Rasterização",         // agrupa no hub (2º nível, opcional)
  title: "Bresenham para circunferências",
  type: "computacional",      // "computacional" | "conceitual" (só rótulo visual)
  tags: ["canvas", "raster"], // opcional
  hubDesc: "texto curto p/ o card",   // opcional
  statement: "HTML do enunciado",     // opcional
  parts: [                            // 1+ partes (abas)
    { label: "Resolução", build: function (ctx) { return steps; } },
  ],
});
```

Cada **parte** tem um `build(ctx)` que retorna um array de **passos** (`Step[]`):

```js
// Step
{
  title: "Título do passo",
  body: "<p>HTML explicativo (painel lateral).</p>",
  visual: { /* ver §2 */ }   // opcional
}
```

- `body` é **HTML** (string) — você é o autor, então pode usar `<b>`, `<code>`,
  `<ul>`, e as classes de §7. Para texto vindo de dados, escape com
  `EX.util.escapeHtml`.
- Sem `visual` (ou `type:"none"`), o passo ocupa a **largura toda**.

---

## 2. O objeto `visual`

Quatro variantes. O `Stage` escolhe a superfície e chama o seu `draw`.

```js
// CANVAS — plano cartesiano com grade/eixos automáticos
{ type: "plane", bounds: [xmin, xmax, ymin, ymax], draw: function (plane) { /* … */ } }

// SVG — diagramas de nós/arestas (UML, árvores, autômatos…)
{ type: "svg", view: [w, h], draw: function (svg) { /* … */ } }   // view é opcional

// DOM — HTML (host é um <div>)
{ type: "dom", draw: function (host) { /* … */ } }

// SEM VISUAL — só texto
{ type: "none" }   // ou omita o campo visual
```

> **Importante:** declare `bounds` **por passo** no canvas (e use `view` por passo
> no SVG quando o tamanho mudar). Assim cada passo controla o enquadramento.

---

## 3. API da superfície `plane` (canvas)

`plane` é uma instância de `EX.CartesianPlane`. Escala igual em X e Y (células
quadradas), grade e eixos desenhados automaticamente antes do seu `draw`.

**Cores:** `var COL = EX.CartesianPlane.COLORS;` →
`accent, accentSoft, green, greenSoft, yellow, orange, red, redSoft, purple,
cyan, pink, ink, muted, axis, axisText, bg`.

**Enquadramento e conversão**

```js
plane.setBounds(xmin, xmax, ymin, ymax);  // (normalmente via visual.bounds)
plane.fit(points, pad);                    // ajusta bounds p/ caber points
plane.cx(x); plane.cy(y);                  // mundo -> pixel (p/ desenho custom no ctx)
plane.base();                              // limpa + grade + eixos (o Stage já chama)
```

**Primitivos** (pontos podem ser `[x, y]` ou `{x, y}`):

```js
plane.point(x, y, { color, radius, label, labelColor, ring, labelDx, labelDy });
plane.pixel(x, y, { fill, stroke, lineWidth, label, labelColor });   // célula 1×1 (raster)
plane.segment(p0, p1, { color, lineWidth, dashed });
plane.polyline(pts, { stroke, fill, lineWidth, dashed, closed });
plane.polygon(pts, opts);                                            // polyline fechada
plane.arrow(p0, p1, { color, lineWidth, head });                     // vetor com ponta
plane.window(xmin, xmax, ymin, ymax, { fill, stroke, dashed });      // retângulo do mundo
plane.regionFill(x0, x1, y0, y1, color);                             // preenche faixa de células
plane.text(x, y, str, { align, color, font, dx, dy });
```

**Círculos/arcos:** desenhe direto no contexto com a conversão da superfície:

```js
var ctx = plane.ctx;
ctx.beginPath();
ctx.arc(plane.cx(0), plane.cy(0), 3 * plane.scale, 0, Math.PI * 2);
ctx.strokeStyle = COL.accent; ctx.stroke();
```

Exemplo mínimo:

```js
visual: {
  type: "plane",
  bounds: [-6, 6, -2, 8],
  draw: function (plane) {
    plane.segment([-4, 1], [3, 5], { color: COL.muted, dashed: true });
    plane.point(3, 5, { color: COL.accent, label: "P" });
  },
}
```

---

## 4. API da superfície `svg`

`svg` é uma instância de `EX.SvgSurface`. `view(w, h)` define o sistema de
coordenadas (unidades de usuário; o SVG escala para caber). **Cores via variáveis
CSS** — ex.: `fill: "var(--bg-soft)"`, `stroke: "var(--accent)"` — então o
diagrama segue o tema sozinho.

Variáveis disponíveis: `--ink, --ink-dim, --ink-mute, --bg, --bg-soft, --bg-card,
--border, --accent, --accent-soft, --green, --green-soft, --yellow,
--yellow-soft, --orange, --red, --red-soft, --purple, --purple-soft, --cyan,
--pink`.

**Primitivos** (cada um retorna o elemento criado):

```js
svg.view(w, h);
svg.rect(x, y, w, h, { fill, stroke, strokeWidth, rx, dashed, opacity });
svg.line(x1, y1, x2, y2, { stroke, strokeWidth, dashed });
svg.circle(cx, cy, r, { fill, stroke, strokeWidth });
svg.ellipse(cx, cy, rx, ry, opts);
svg.path(d, { fill, stroke, strokeWidth });
svg.polygon(points, opts);     // points: [[x,y], …] ou [{x,y}, …]
svg.polyline(points, opts);
svg.text(x, y, str, { anchor, baseline, size, color, weight, mono });
svg.group({ transform, cls });
svg.arrow(x1, y1, x2, y2, { color, head, strokeWidth, dashed });   // seta c/ ponta
svg.curve(x1, y1, x2, y2, bend, opts);                             // quadrática (auto-loops)
```

`opts` comuns: `{ fill, stroke, strokeWidth, opacity, dashed, rx, cls, parent }`.
Use `parent` para anexar dentro de um `group`.

Exemplo mínimo:

```js
visual: {
  type: "svg",
  draw: function (svg) {
    svg.view(400, 240);
    svg.rect(60, 90, 110, 60, { fill: "var(--bg-soft)", stroke: "var(--accent)", strokeWidth: 2, rx: 8 });
    svg.text(115, 120, "início");
    svg.arrow(170, 120, 240, 120, { color: "var(--ink-mute)" });
  },
}
```

---

## 5. API da superfície `dom`

O `draw(host)` recebe o `host` (`<div>`). Anexe HTML diretamente ou use os
helpers de `EX.util` e os componentes `EX.Content.*` (§6).

```js
visual: {
  type: "dom",
  draw: function (host) {
    host.innerHTML =
      "<div class='ex-callout tip'><div class='ex-callout-title'>Dica</div>" +
      "Cada aba escolhe a sua superfície.</div>";
    // ou: host.appendChild(EX.util.el("p", null, "texto"));
  },
}
```

Helpers de `EX.util`: `el(tag, cls, html)`, `svgEl(tag, attrs)`, `clear(node)`,
`escapeHtml(s)`, `range(a, b)`, frações exatas `Fr`/`fr`. As cores também vêm das
variáveis CSS (`var(--accent)` etc.).

---

## 6. Catálogo de componentes

Componentes são **funções puras de desenho/builder**: recebem a superfície
(`plane`/`svg`) ou o `host` (dom), desenham e **não guardam estado global**. As
assinaturas abaixo são as oficiais do projeto.

### EX.Plane (canvas)

```js
// Amostra fn(x) em [from..to] passo step e liga com polyline (cor color).
EX.Plane.functionPlot(plane, fn, { from, to, step, color });
EX.Plane.functionPlot(plane, function (x) { return Math.sin(x); }, { from: -6, to: 6, step: 0.1, color: COL.yellow });

// Campo vetorial: fn(x,y)->[dx,dy]; setas numa grade.
EX.Plane.vectorField(plane, fn, { step, scale, color });
EX.Plane.vectorField(plane, function (x, y) { return [-y, x]; }, { step: 1, scale: 0.4, color: COL.cyan });

// Polyline + marcadores nos pontos.
EX.Plane.pathLine(plane, points, { color, markers });
EX.Plane.pathLine(plane, [[0,0],[1,2],[3,1]], { color: COL.green, markers: true });

// Arco (ângulos em radianos) — útil p/ marcar ângulos.
EX.Plane.angleArc(plane, cx, cy, r, a0, a1, { color });
EX.Plane.angleArc(plane, 0, 0, 2, 0, Math.PI / 3, { color: COL.accent });
```

### EX.Raster (canvas)

```js
// Desenha um conjunto de pixels (células 1×1).  cells: [{x,y}].
EX.Raster.cells(plane, cells, { fill, stroke });
EX.Raster.cells(plane, [{x:0,y:0},{x:1,y:0},{x:1,y:1}], { fill: COL.greenSoft, stroke: COL.green });

// Flood fill (BFS 4/8-conn). blocked: mapa "x,y"->true. Retorna [{x,y}] na ordem de visita.
var visited = EX.Raster.flood({ x: 0, y: 0 }, blocked, [xmin, xmax, ymin, ymax], 4);

// Agrupamentos úteis p/ explicar varredura:
EX.Raster.groupByRow(cells);   // -> { y: [cells…] }
EX.Raster.runsByRow(cells);    // -> trechos contíguos por linha
```

### EX.Diagram (svg)

```js
// Árvore com layout automático. root: {id,label,children:[]}.
// Retorna mapa id->{x,y}.
EX.Diagram.tree(svg, root, { shown, highlight, highlightEdges, nodeShape, view });
EX.Diagram.tree(svg, { id:"a", label:"A", children:[{id:"b",label:"B"}] }, { highlight:["b"], view:[600,360] });

// Grafo com posições dadas. arestas viram setas se directed.
EX.Diagram.graph(svg, { nodes:[{id,label,x,y}], edges:[{from,to,label,directed}] }, { highlight, activeEdges });

// Autômato: estado=círculo (duplo se accepting); seta de start; transições rotuladas; auto-loop via curve.
EX.Diagram.automaton(svg, { states:[{id,label,x,y,accepting}], start, transitions:[{from,to,label}] }, { activeState, activeTransition });

// Fluxograma. kind: "start"|"process"|"decision"|"io"|"end".
EX.Diagram.flowchart(svg, { nodes:[{id,kind,label,x,y,w,h}], edges:[{from,to,label}] }, opts);

// Estruturas sequenciais (array/pilha/fila) — ver detalhe abaixo.
EX.Diagram.boxes(svg, spec, opts);

// Diagrama de classes UML — ver detalhe abaixo.
EX.Diagram.uml(svg, { classes, relations }, opts);
```

#### EX.Diagram.boxes — array / pilha / fila

```js
EX.Diagram.boxes(svg, {
  cells: ["+", "3", "*"],     // strings ou {label, sub?}
  x: 30, y: 60,                // canto superior-esquerdo (default 30,60)
  cellW: 64, cellH: 44,        // tamanho da célula (defaults)
  orientation: "h",           // "h" (default) ou "v"
  kind: "stack",              // "array" | "stack" | "queue" (rótulos de ponteiro)
  indices: true,              // mostra 0..n-1 em cada célula
  title: "Pilha",
}, {
  highlight: [2],             // índice | [índices] | Set -> realça (accent)
  danger: [0],                // realça em vermelho
  top: 2,                     // ponteiro "topo" (pilha)
  front: 0, rear: 2,          // ponteiros "frente"/"fim" (fila)
  index: 1,                   // ponteiro "i" (array)
  pointers: [{ index: 1, label: "p", color: "var(--purple)" }],
  view: [600, 200],
});
// Retorna { cells: [{x,y,w,h,cx,cy}] } com a geometria de cada célula.
```

Para uma pilha, se nenhum ponteiro for passado, o **topo** aparece automaticamente
na última célula. Use `cells:[{label, sub}]` para valores com anotação (ex.:
`g(n)` num nó de busca).

#### EX.Diagram.uml — diagrama de classes

```js
EX.Diagram.uml(svg, {
  classes: [
    { name: "Animal", attributes: ["- nome: String"], methods: ["+ emitirSom()"], x: 215, y: 30, w: 170 },
    { name: "Cachorro", attributes: [], methods: ["+ emitirSom()"], x: 70, y: 215 },
    { name: "Pessoa", attributes: ["- nome: String"], methods: ["+ passear()"], x: 480, y: 30 },
  ],
  relations: [
    { from: "Cachorro", to: "Animal", kind: "inherit" },             // seta triângulo vazado (é um)
    { from: "Pessoa",   to: "Animal", kind: "aggregate", label: "dono" }, // losango vazado (tem um)
    // kind também aceita: "assoc" (linha simples) e "compose" (losango cheio)
  ],
}, {
  shown: ["Animal", "Cachorro"],        // se definido, só desenha estas classes/relações
  highlight: ["Pessoa"],                 // realça o contorno destas classes
  highlightRelations: [["Pessoa","Animal"]],
  view: [700, 360],
});
// Retorna mapa nome -> { x,y,w,h,cx,cy }.
```

A **altura** de cada caixa é calculada pelo número de atributos/métodos. Cada
classe tem 3 compartimentos (nome / atributos / métodos). Para **herança** a seta
aponta de `from` (subclasse) para `to` (superclasse); para **composição/agregação**
o losango fica no lado `to` (o "todo").

### EX.Content (dom)

```js
// Tabela. cellClass(r,c) é opcional e devolve a classe da célula (ex.: "hl").
EX.Content.table(host, { headers:["i","soma"], rows:[[1,1],[2,3]], activeRow: 1, cellClass });

// Bloco de código com numeração e realce de linhas (tokenização básica por regex).
EX.Content.code(host, { code:"for(i…){…}", active:[2,3], dim:[1], lang:"js", startLine: 1 });

// Callout colorido. kind: "note"|"tip"|"warn"|"danger".
EX.Content.callout(host, { kind:"tip", title:"Dica", html:"texto em <b>HTML</b>" });

// Definição (termo + explicação).
EX.Content.definition(host, { term:"Heurística", html:"estimativa do custo restante." });

// Prós e contras.
EX.Content.prosCons(host, { pros:["simples"], cons:["lento"] });

// Chips (lista de valores/coordenadas). items: strings ou {text, cls}.
EX.Content.chips(host, ["(1,2)", { text:"(3,4)", cls:"green" }], {});

// Legenda de cores. items: [{color, label}].
EX.Content.legend(host, [{ color:"var(--accent)", label:"visitado" }]);
```

### EX.Slides (passos prontos)

Cada função **retorna um `Step`** já montado — bom para partes conceituais.

```js
EX.Slides.concept({ title:"Ideia central", body:"<p>…</p>", visual });          // -> Step
EX.Slides.definition({ title:"Definição", term:"DFA", body:"<p>…</p>" });         // -> Step (visual dom)
EX.Slides.comparison({ title:"BFS × DFS", intro:"…", headers:["", "BFS","DFS"], rows:[…] }); // -> Step
EX.Slides.prosCons({ title:"Trade-offs", items:[{ name:"BFS", pros:[…], cons:[…] }] });      // -> Step
```

### EX.Walkthrough (passos prontos)

Geram **`Step[]`** a partir de um trace ou de código.

```js
// A partir de um trace: render(entry,i,all)->visual; title/body podem ser função.
EX.Walkthrough.fromTrace(trace, {
  title: function (e, i) { return "Passo " + i; },
  body:  function (e, i) { return "<p>" + e.msg + "</p>"; },
  render: function (e, i, all) { return { type:"dom", draw:function(h){ /* … */ } }; },
});

// Code walkthrough: cada passo realça linhas do mesmo código (visual dom via EX.Content.code).
EX.Walkthrough.code({
  code: "function f(){…}",
  lang: "js",
  steps: [{ lines:[1,2], title:"Cabeçalho", body:"<p>…</p>" }],
});
```

---

## 7. Classes CSS de conteúdo

Disponíveis em `css/components.css` para usar no `body` dos passos e em visuais
`dom`:

- **Tabela:** `<table class="ex-table">`, `<tr class="active">`, `<td class="hl">`.
- **Código:** `ex-code`, `ex-code-line` (`.active` / `.dim`), `ex-ln`, e tokens
  `tok-key` / `tok-str` / `tok-num` / `tok-com` / `tok-fn`.
- **Callout:** `ex-callout` (`.tip` / `.warn` / `.danger`) com `.ex-callout-title`.
- **Prós/contras:** `ex-proscons` com `.pro` / `.con`.
- **Chips:** `ex-coordlist` + `ex-coord` (`.accent` / `.green` / `.yellow`).
- **Legenda:** `ex-legend` com `<i>` colorido.
- **Bloco de fórmula:** `.formula`.
- **Spans inline:** `.hl` `.ok` `.no` `.muted` `.accent`.

Exemplo no `body`:

```html
<p>Resultado: <span class="ok">aceito</span>.</p>
<div class="ex-callout tip"><div class="ex-callout-title">Dica</div>…</div>
```

---

## 8. Padrões recomendados

**Trace de algoritmo** (uma linha por iteração). Construa o trace **uma vez** e
gere os passos com `EX.Content.table` ou `EX.Walkthrough.fromTrace`, destacando a
linha atual a cada passo.

```js
var trace = [];
var soma = 0;
for (var i = 1; i <= 5; i++) { soma += i; trace.push({ i: i, soma: soma }); }

var steps = EX.Walkthrough.fromTrace(trace, {
  title: function (e) { return "i = " + e.i; },
  body:  function (e) { return "<p>soma = <span class='ok'>" + e.soma + "</span></p>"; },
  render: function (e, i, all) {
    return { type: "dom", draw: function (host) {
      EX.Content.table(host, {
        headers: ["i", "soma"],
        rows: all.slice(0, i + 1).map(function (r) { return [r.i, r.soma]; }),
        activeRow: i,
      });
    }};
  },
});
```

**Code walkthrough** — realce linhas do mesmo código passo a passo:

```js
var steps = EX.Walkthrough.code({
  code: "for (var i = 0; i < n; i++) {\n  soma += i;\n}",
  lang: "js",
  steps: [
    { lines: [1], title: "Laço", body: "<p>Itera de 0 a n−1.</p>" },
    { lines: [2], title: "Acumula", body: "<p>Soma o índice atual.</p>" },
  ],
});
```

**Slides conceituais** — para teoria, sem desenho:

```js
function build() {
  return [
    EX.Slides.concept({ title: "Motivação", body: "<p>…</p>" }),
    EX.Slides.definition({ title: "Definição", term: "Heurística", body: "<p>…</p>" }),
    EX.Slides.comparison({ title: "BFS × DFS", headers: ["", "BFS", "DFS"], rows: [
      ["Estrutura", "fila", "pilha"],
      ["Ótimo?", "sim*", "não"],
    ]}),
  ];
}
```

**Animação por revelação** (UML, árvores, grafos): mantenha **um modelo** e mude só
`opts.shown` / `highlight` a cada passo — assim o layout fica estável e o aluno vê
o diagrama crescer. Veja `js/questions/examples/se-uml-class.js`.

---

## 9. Dicas finais

- **Enquadramento por passo:** declare `bounds` (canvas) e `view` (svg) **em cada
  passo**; assim cada momento controla o que aparece. Use `plane.fit(points)` para
  enquadrar automaticamente.
- **Cores seguem o tema:** no **canvas** use `EX.CartesianPlane.COLORS`
  (`COL.accent`, `COL.green`, …); no **svg/dom** use `var(--accent)`,
  `var(--green)`, etc. Nunca fixe hex — quebraria o tema claro/escuro.
- **Robustez:** componentes não devem quebrar com entradas razoáveis (lista vazia,
  índice fora do intervalo, campos opcionais ausentes). Trate `opts` como
  opcional (`opts = opts || {}`).
- **Reaproveite os componentes** em vez de redesenhar à mão: `EX.Diagram.*` para
  diagramas, `EX.Content.*` para HTML, `EX.Slides`/`EX.Walkthrough` para montar
  passos.
- **Personalize metadados em `js/config.js`:** título, descrição e chips do hub
  ficam nesse arquivo para que `index.html` continue servindo como estrutura
  genérica.
- **PT-BR e didático:** títulos curtos, um passo = uma ideia, e diga sempre o
  *porquê*, não só o *o quê*.
- **Sem build, sem módulos, sem `fetch`:** cada arquivo é uma IIFE que estende o
  namespace global `window.EX`. Lembre de registrar o arquivo em `js/manifest.js`.
```
