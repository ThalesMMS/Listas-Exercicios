/*
 * q07.js — Representação de Sólidos / BSP.
 * "Represente a árvore BSP da figura" (visão de topo): planos a–f e objetos 1–7.
 * As normais são ESCOLHIDAS (o enunciado pede isso) e a árvore NÃO é única; aqui
 * adotamos: normais apontando para o interior da cena; raiz = a, depois b, c (arestas
 * externas que separam 1, 2, 3) e então e, f, d (partições internas: 5, 6, 7, 4).
 */
(function () {
  "use strict";
  var EX = window.EX;

  // ----- Cena (visão de topo) com normais marcadas -----
  var L = [72, 150], TA = [372, 72], TB = [372, 228];
  function planeLine(svg, p, q, name, mid, nrm) {
    svg.line(p[0], p[1], q[0], q[1], { stroke: "var(--accent)", strokeWidth: 2.5 });
    svg.text(mid[0], mid[1] - 8, name, { size: 14, color: "var(--accent)", weight: 700 });
    svg.arrow(mid[0], mid[1], mid[0] + nrm[0], mid[1] + nrm[1], { color: "var(--orange)", head: 8, strokeWidth: 2 });
  }
  function obj(svg, p, n) {
    svg.circle(p[0], p[1], 12, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.text(p[0], p[1], n, { size: 13, color: "var(--bg)", weight: 700 });
  }
  function scene(svg) {
    svg.view(470, 300);
    // arestas externas do "triângulo" (a topo, b base, c direita)
    planeLine(svg, L, TA, "a", [218, 105], [0, 22]);    // normal p/ baixo (interior)
    planeLine(svg, L, TB, "b", [218, 196], [0, -22]);   // normal p/ cima (interior)
    planeLine(svg, TA, TB, "c", [372, 150], [-22, 0]);  // normal p/ esquerda (interior)
    // partições internas
    planeLine(svg, [165, 119], [165, 181], "e", [165, 150], [22, 0]);   // normal p/ direita
    planeLine(svg, [168, 132], [360, 110], "f", [262, 118], [4, 22]);   // normal p/ baixo
    planeLine(svg, [232, 150], [360, 172], "d", [300, 158], [6, 20]);   // normal p/ baixo-direita
    // objetos
    obj(svg, [192, 52], "1"); obj(svg, [192, 250], "2"); obj(svg, [414, 150], "3");
    obj(svg, [114, 150], "5"); obj(svg, [268, 92], "6"); obj(svg, [330, 138], "7"); obj(svg, [256, 196], "4");
    svg.text(235, 286, "normais (laranja) escolhidas para o interior da cena", { size: 11, color: "var(--ink-mute)" });
  }

  // ----- Árvore BSP (cadeia: a→b→c→e→f→d) -----
  var ROOT = {
    id: "a", label: "a", children: [
      { id: "obj1", label: "1", edgeLabel: "−" },
      {
        id: "b", label: "b", edgeLabel: "+", children: [
          { id: "obj2", label: "2", edgeLabel: "−" },
          {
            id: "c", label: "c", edgeLabel: "+", children: [
              { id: "obj3", label: "3", edgeLabel: "−" },
              {
                id: "e", label: "e", edgeLabel: "+", children: [
                  { id: "obj5", label: "5", edgeLabel: "−" },
                  {
                    id: "f", label: "f", edgeLabel: "+", children: [
                      { id: "obj6", label: "6", edgeLabel: "−" },
                      {
                        id: "d", label: "d", edgeLabel: "+", children: [
                          { id: "obj7", label: "7", edgeLabel: "−" },
                          { id: "obj4", label: "4", edgeLabel: "+" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  var OUTER = ["a", "obj1", "b", "obj2", "c", "obj3", "e"];

  function tree(shown, hi) {
    return {
      type: "svg",
      draw: function (svg) {
        EX.Diagram.tree(svg, ROOT, { shown: shown, highlight: hi || [], nodeShape: "box" });
      },
    };
  }

  var LEG = "<p class='muted'>Aresta <b>−</b> = trás (lado oposto à normal) · <b>+</b> = frente (lado da normal).</p>";

  function build() {
    return [
      {
        title: "Escolher as normais",
        body:
          "<p>Cada reta a–f é um <b>plano</b>. Primeiro escolhemos o sentido da <span style='color:var(--orange)'>normal</span> " +
          "de cada um — aqui, todas apontando para o <b>interior</b> da cena (o lado \"frente\").</p>" +
          "<p>Com isso, cada plano separa os objetos em <span class='hl'>frente (+)</span> e <span class='hl'>trás (−)</span>.</p>",
        visual: { type: "svg", draw: scene },
      },
      {
        title: "Raiz e arestas externas (a, b, c)",
        body:
          "<p>Escolhemos a <span class='accent'>raiz = a</span>. Atrás de <b>a</b> fica o objeto <b>1</b>; " +
          "na frente, todo o resto.</p>" +
          "<p>Seguimos com <b>b</b> (atrás → <b>2</b>) e <b>c</b> (atrás → <b>3</b>). As três arestas externas " +
          "vão \"descascando\" os objetos de fora.</p>" + LEG,
        visual: tree(OUTER, ["a", "b", "c"]),
      },
      {
        title: "Partições internas (e, f, d)",
        body:
          "<p>Dentro da cena: <b>e</b> separa o objeto <b>5</b> (atrás); <b>f</b> separa <b>6</b> (atrás); " +
          "e <b>d</b> separa <b>7</b> (atrás) de <b>4</b> (frente).</p>" +
          "<p>Os 6 planos viram <b>nós internos</b> e os 7 objetos viram <b>folhas</b>.</p>" + LEG,
        visual: tree(null, ["e", "f", "d"]),
      },
      {
        title: "Árvore BSP final",
        body:
          "<p>Árvore BSP completa: <code>a → b → c → e → f → d</code>, com as folhas " +
          "<b>1, 2, 3, 5, 6, 7, 4</b>.</p>" +
          "<p class='muted'>⚠ A BSP <b>não é única</b>: outra escolha de raiz, de ordem dos planos ou do sentido das " +
          "normais geraria uma árvore válida diferente.</p>" + LEG,
        visual: tree(null, []),
      },
    ];
  }

  EX.registry.add({
    id: "q07",
    num: "7",
    subject: "Representação de Sólidos",
    title: "Árvore BSP da cena",
    type: "computacional",
    hubDesc: "Planos a–f e objetos 1–7: normais escolhidas + árvore binária.",
    statement: "Represente a árvore BSP da figura (visão de topo), com os planos a–f e os objetos 1–7. As direções das normais devem ser escolhidas e identificadas.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
