# Explainer-Template

Base reutilizável para explicar, **passo a passo** e de forma interativa, a
resolução de questões de **qualquer matéria**. Cada questão vira uma sequência de
passos: à esquerda um **visual** (plano cartesiano, diagrama SVG ou HTML) e ao
lado a **explicação**. O aluno avança com `←` / `→` / `espaço` e acompanha o
raciocínio na ordem certa.

É **JavaScript puro, sem build e sem dependências**: abre direto do disco
(`file://`), sem `npm install`, sem bundler, sem framework. Tudo é carregado por
`<script>` globais em ordem (ver `js/manifest.js`).

Cada lista/projeto criado a partir deste template deve virar uma **copia independente**.
Depois de copiar a pasta, a lista não deve importar arquivos de
`../Explainer-Template`; o template original não é uma **dependencia de producao**.
Isso permite atualizar, mover ou apagar o template sem afetar a
integridade das pastas já geradas.

---

## O que é e para que serve

O template foi pensado como **base de listas de exercícios resolvidas**. Em vez de
um PDF estático, cada questão é uma animação didática: você mostra os dados,
destaca o que muda a cada passo e explica o porquê. Serve para:

- **Computação Gráfica** — rasterização (Bresenham), recorte (Cohen–Sutherland),
  transformações geométricas, curvas.
- **Compiladores** — autômatos (DFA/NFA), árvores de derivação, pilha de análise.
- **Inteligência Artificial** — árvores de busca, fronteira (fila/pilha),
  gradiente descendente, campos.
- **Engenharia de Software** — diagramas UML de classes, fluxogramas.

…e qualquer outra matéria: basta escolher a superfície de desenho adequada.

---

## Como abrir

Não precisa de servidor para o caso comum:

1. **Duplo clique** em `index.html` — abre o **hub** (lista de questões) no
   navegador via `file://`.
2. Clique numa questão para ir à página de explicação (`question.html?q=<id>`).

Se o seu navegador bloquear algo via `file://`, suba um servidor estático local:

```bash
cd Explainer-Template
python3 -m http.server 8000
# depois abra http://localhost:8000/
```

Navegação na página de questão: `←` / `→` ou `espaço` trocam de passo; há também
botões e uma barra de progresso.

---

## Como personalizar o hub

Edite `js/config.js` para trocar os metadados da cópia:

- `pageTitle`: título da aba do navegador no hub.
- `hubTitle`: título principal da página inicial.
- `hubDescriptionHtml`: texto introdutório do hub, com HTML controlado pelo autor.
- `hubChipsHtml`: lista de chips exibidos abaixo da descrição.

Essa configuração é carregada pela própria cópia do Explainer e continua
funcionando via `file://`.

---

## Estrutura de pastas

```
Explainer-Template/
├── index.html              # hub: lista de questões agrupadas por matéria
├── question.html           # página de uma questão (?q=<id>)
├── css/
│   ├── theme.css           # variáveis de cor (claro/escuro) + base
│   ├── layout.css          # hub e página de questão
│   └── components.css       # classes de conteúdo (tabelas, código, callouts…)
├── examples/
│   └── collection-portal/  # portal opcional para várias cópias independentes
└── js/
    ├── config.js           # metadados editáveis do hub desta cópia
    ├── manifest.js         # LISTA ORDENADA de todos os scripts (edite p/ add questão)
    ├── loader.js           # carrega os scripts do manifesto, depois o boot
    ├── lib/
    │   └── util.js         # EX.util: el, svgEl, clear, escapeHtml, frações, range
    ├── core/
    │   ├── registry.js     # EX.registry.add/get/all/grouped (registro de questões)
    │   ├── stage.js        # escolhe a superfície (canvas/svg/dom) de cada passo
    │   ├── stepper.js      # navegação entre passos
    │   ├── theme.js        # alternância claro/escuro
    │   └── layout.js       # monta o hub e a página de questão
    ├── surfaces/
    │   ├── canvas-plane.js # CartesianPlane (canvas)
    │   ├── svg.js          # SvgSurface (diagramas)
    │   └── dom.js          # DomSurface (HTML)
    ├── components/
    │   ├── plane/          # geometry, raster (sobre o canvas)
    │   ├── diagram/        # tree, graph, automaton, flowchart, boxes, uml (svg)
    │   └── content/        # table, code, callout, chips, … (dom)
    ├── templates/
    │   ├── slides.js       # EX.Slides.* (passos conceituais prontos)
    │   └── walkthrough.js  # EX.Walkthrough.* (trace / code walkthrough)
    └── questions/
        └── examples/       # questões de exemplo, uma por arquivo
```

---

## As três superfícies (e quando usar cada uma)

Cada **passo** declara um `visual` com um `type`. O `Stage` (`js/core/stage.js`)
mostra a superfície certa e esconde as outras. Na **mesma lista** você pode
misturar as três.

| Superfície | `type` | API | Use para… |
|---|---|---|---|
| **Canvas** (`CartesianPlane`) | `"plane"` | `bounds:[xmin,xmax,ymin,ymax]`, `draw(plane)` | Plano cartesiano com grade/eixos: geometria, rasterização, gráficos de função, vetores. |
| **SVG** (`SvgSurface`) | `"svg"` | `view?:[w,h]`, `draw(svg)` | Diagramas de nós/arestas: árvores, grafos, autômatos, fluxogramas, **UML**, pilhas/filas. |
| **DOM** (`DomSurface`) | `"dom"` | `draw(host)` (`host` é um `<div>`) | Conteúdo HTML: tabelas de trace, código com realce, memória/registradores, callouts. |
| **(sem visual)** | `"none"` ou ausente | — | Passo só de texto: a explicação ocupa a **largura toda** (ótimo p/ conceitual). |

Detalhes da API de cada superfície e dos componentes de alto nível estão em
[`AUTHORING.md`](AUTHORING.md).

- **Cores:** no canvas use `EX.CartesianPlane.COLORS` (ex.: `COL.accent`); no SVG
  e no DOM use variáveis CSS (ex.: `var(--accent)`, `var(--green)`). Assim tudo
  segue o **tema claro/escuro** sozinho.

---

## Tema claro/escuro

As cores vêm de variáveis CSS em `css/theme.css` (com um conjunto para o tema
escuro e outro para `[data-theme="light"]`). O canvas lê essas variáveis em
`refreshTheme()` e o SVG/DOM as usam diretamente, então **trocar de tema repinta
tudo** sem redesenhar manualmente. A preferência é guardada em `localStorage`
(`ex-theme`).

---

## Como adicionar uma questão

Três passos — só **um** arquivo do núcleo muda (`manifest.js`).

**1) Crie o arquivo** em `js/questions/` (por matéria, ex.:
`js/questions/examples/minha-questao.js`). O arquivo é uma IIFE que registra a
questão:

```js
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS; // se for usar canvas

  function build() {
    return [
      {
        title: "Primeiro passo",
        body: "<p>Explicação em <b>HTML</b>.</p>",
        visual: {
          type: "plane",
          bounds: [-5, 5, -5, 5],
          draw: function (plane) {
            plane.point(2, 3, { color: COL.accent, label: "P" });
          },
        },
      },
      // … mais passos
    ];
  }

  EX.registry.add({
    id: "minha-questao",            // slug único, vira ?q=minha-questao
    num: "1",                        // rótulo curto no badge (opcional)
    subject: "Minha Matéria",        // agrupa no hub (1º nível)
    section: "Tópico",               // agrupa no hub (2º nível, opcional)
    title: "Título da questão",
    type: "computacional",           // ou "conceitual" (só rótulo visual)
    hubDesc: "resumo curto p/ o card",
    statement: "HTML do enunciado",
    parts: [{ label: "Resolução", build: build }],
  });
})();
```

**2) Registre via `EX.registry.add({...})`** — já feito no exemplo acima. O
contrato completo de `Step`/`visual` está em [`AUTHORING.md`](AUTHORING.md).

**3) Adicione o caminho em `js/manifest.js`**, na seção de questões:

```js
window.EX_MANIFEST = {
  scripts: [
    // … núcleo, superfícies, componentes …
    "js/questions/examples/minha-questao.js", // <-- acrescente aqui
  ],
};
```

Recarregue `index.html`: a questão aparece no hub, agrupada por `subject` →
`section`. Uma questão pode ter **várias partes** (`parts`), exibidas como abas,
cada uma com a sua própria sequência de passos (e podendo usar superfícies
diferentes).

---

## Matérias de exemplo incluídas

O diretório `js/questions/examples/` traz questões de referência em quatro
matérias, além das **demonstrações das superfícies** (`demo-plane`, `demo-svg`,
`demo-dom`, `demo-mixed`, `demo-progressive-svg`,
`demo-parametric-transition`):

- **Computação Gráfica** — Bresenham para circunferências, recorte de
  Cohen–Sutherland.
- **Compiladores** — autômato finito (DFA), árvore de derivação.
- **Inteligência Artificial** — árvore de busca, gradiente descendente.
- **Engenharia de Software** — diagrama de classes UML (herança vs. agregação).

Use-as como modelo para as suas próprias listas.

O diretório `examples/collection-portal/` traz um exemplo opcional de página raiz
para apontar para várias cópias independentes do Explainer. Ele não é carregado
por `index.html`, `question.html` nem pelo `manifest.js`.
