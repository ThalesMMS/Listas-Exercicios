/*
 * c18-rig-coloracao.js — Guia: Alocação de registradores (RIG + coloração).
 * Agora ANIMADO: a heurística de simplificação empilha nós de grau < k e depois
 * os recolore na ordem inversa. Renderizador de RIG próprio (nós removidos
 * esmaecem) + pilha lateral via EX.Diagram.boxes.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  var NODES = {
    a: { x: 250, y: 70 }, b: { x: 390, y: 140 }, c: { x: 390, y: 285 },
    d: { x: 250, y: 355 }, e: { x: 110, y: 285 }, f: { x: 110, y: 140 },
  };
  var EDGES = [["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "a"], ["a", "d"]];
  var COL1 = "var(--accent)", COL2 = "var(--green)";
  var FINAL = { a: COL2, b: COL1, c: COL2, d: COL1, e: COL2, f: COL1 };

  // o: { removed:[ids], colors:{id:cssvar}, hi:[ids], stack:[ids], stackLabel }
  function rigVisual(o) {
    o = o || {};
    var removed = {}; (o.removed || []).forEach(function (id) { removed[id] = true; });
    var colors = o.colors || {};
    var hi = {}; (o.hi || []).forEach(function (id) { hi[id] = true; });
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(820, 450);
        EDGES.forEach(function (e) {
          var a = NODES[e[0]], b = NODES[e[1]];
          var faded = removed[e[0]] || removed[e[1]];
          svg.line(a.x, a.y, b.x, b.y, {
            stroke: faded ? "var(--border)" : "var(--ink)",
            strokeWidth: faded ? 1.5 : 3,
            dashed: faded,
          });
        });
        Object.keys(NODES).forEach(function (id) {
          var n = NODES[id];
          var rm = removed[id];
          var fill = colors[id] || "var(--bg-soft)";
          var stroke = "var(--ink)", sw = 2;
          if (rm) { fill = "var(--bg)"; stroke = "var(--border)"; }
          if (hi[id]) { stroke = "var(--yellow)"; sw = 4; }
          svg.circle(n.x, n.y, 19, { fill: fill, stroke: stroke, strokeWidth: sw, dashed: rm });
          svg.text(n.x, n.y - 32, id, { color: rm ? "var(--ink-mute)" : "var(--red)", weight: 700, size: 18 });
        });
        if (o.stack) {
          svg.text(700, 46, o.stackLabel || "pilha", { size: 13, weight: 700, color: "var(--ink-dim)" });
          if (o.stack.length) {
            EX.Diagram.boxes(svg, {
              cells: o.stack.slice().reverse(), x: 660, y: 64, cellW: 70, cellH: 42, orientation: "v",
            }, { pointers: [{ index: 0, label: "topo", color: "var(--yellow)" }] });
          } else {
            svg.text(700, 90, "(vazia)", { size: 12, color: "var(--ink-mute)" });
          }
        }
      },
    };
  }

  function build() {
    return [
      {
        title: "Registradores são poucos; temporários são muitos",
        body:
          "<p>O programa usa muitos temporários, mas a CPU tem poucos registradores. Dois temporários " +
          "<b>vivos ao mesmo tempo</b> não podem usar o mesmo registrador — isso é uma " +
          "<b>interferência</b>, uma <b>aresta</b> no <b>grafo de interferência (RIG)</b>.</p>" +
          "<p>Alocar registradores = <b>colorir</b> o RIG com k cores (k = nº de registradores), sem " +
          "duas pontas de uma aresta com a mesma cor.</p>",
        visual: rigVisual({}),
      },
      {
        title: "Coloração mínima",
        body:
          "<p>Quantas cores (registradores) bastam? Este RIG é <b>bipartido</b> (um anel par + a " +
          "diagonal a–d), então <b>2 cores</b> resolvem: <span class='accent'>{a, c, e}</span> e " +
          "<span class='ok'>{b, d, f}</span> são conjuntos independentes; toda aresta cruza entre os " +
          "dois grupos.</p>",
        visual: rigVisual({ colors: FINAL }),
      },
      C.domStep(
        "Heurística de simplificação (Kempe/Chaitin)",
        "Para k registradores, há um truque guloso: um nó com <b>grau &lt; k</b> sempre poderá ser " +
          "colorido <em>depois</em> (sobra cor para ele). Então:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Simplify</div>" +
          "<ol>" +
          "<li>remova repetidamente um nó de <b>grau &lt; k</b> e empilhe-o;</li>" +
          "<li>se todos saírem → o grafo é <b>k-colorível</b>;</li>" +
          "<li>recoloque na ordem <b>inversa</b>, dando a cada um uma cor livre.</li>" +
          "</ol>" +
          "<p>Vamos rodar com <b>k = 3</b>. Uma ordem válida de remoção é " +
          "<code>b, c, e, f, a, d</code>.</p></div>"
      ),
      {
        title: "Simplify — remove os de grau < 3",
        body:
          "<p>Com k = 3, removo nós de grau &lt; 3 e os empilho. <code>b</code> e <code>c</code> " +
          "(grau 2) saem; ao sair, baixam o grau dos vizinhos. Em seguida <code>e</code> e " +
          "<code>f</code> também ficam com grau &lt; 3 e saem.</p>",
        visual: rigVisual({ removed: ["b", "c", "e", "f"], stack: ["b", "c", "e", "f"], stackLabel: "pilha (simplify)", hi: ["f"] }),
      },
      {
        title: "Simplify — esvazia o grafo",
        body:
          "<p>Sem <code>b, c, e, f</code>, os nós <code>a</code> e <code>d</code> ficam com grau &lt; 3 " +
          "e também saem. O grafo esvaziou: logo ele é <b>3-colorível</b>. A pilha guarda a ordem de " +
          "remoção.</p>",
        visual: rigVisual({ removed: ["a", "b", "c", "d", "e", "f"], stack: ["b", "c", "e", "f", "a", "d"], stackLabel: "pilha (simplify)" }),
      },
      {
        title: "Select — desempilha e colore (d, a)",
        body:
          "<p>Agora a volta: desempilho na ordem <b>inversa</b> e dou a cada nó uma cor que nenhum " +
          "vizinho já colorido usa. <code>d</code> (topo) → cor 1; <code>a</code> (vizinho de d) → cor 2.</p>",
        visual: rigVisual({ colors: { d: COL1, a: COL2 }, hi: ["d", "a"], removed: ["b", "c", "e", "f"], stack: ["b", "c", "e", "f"], stackLabel: "pilha (resta)" }),
      },
      {
        title: "Select — termina a coloração",
        body:
          "<p>Continuo desempilhando: <code>f→1, e→2, c→2, b→1</code>, sempre evitando a cor dos " +
          "vizinhos. A pilha esvazia e todo nó tem cor — <b>alocação concluída</b> (e couberam até em " +
          "2 das 3 cores).</p>",
        visual: rigVisual({ colors: FINAL, stack: [], stackLabel: "pilha (vazia)" }),
      },
      C.tableStep({
        title: "Quando trava: derramamento (spill)",
        body: "Se todos os nós restantes têm grau ≥ k, escolhe-se um para <b>derramar</b> (guardar na " +
          "memória). Pega-se o de <b>menor custo</b> = nº de usos − nº de conflitos + (5 se está em loop):",
        headers: ["nó", "usos", "conflitos", "loop", "custo"],
        rows: [
          ["A", "4", "1", "+5", "8"],
          ["B", "3", "1", "+5", "7"],
          ["C", "3", "2", "+5", "6"],
          ["D", "1", "0", "0", "1  ← derrama (menor)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "RIG + coloração transformam alocação de registradores num problema de grafos.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Interferência vira aresta; <b>colorir com k cores</b> = alocar k registradores. " +
          "<b>Simplify</b>: empilhe nós de grau &lt; k; <b>select</b>: desempilhe colorindo. Se travar " +
          "(todos com grau ≥ k), <b>derrame</b> o de menor custo.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c18-rig-coloracao",
    num: "RIG",
    subject: "Compiladores",
    section: "Alocação de Registradores",
    title: "RIG e coloração de grafos",
    type: "computacional",
    hubDesc: "Interferência → aresta; simplify (empilha grau<k) + select (desempilha colorindo) animados; spill.",
    statement:
      "Entenda a alocação de registradores por coloração: o grafo de interferência (RIG), a coloração " +
      "com k cores, a heurística de simplificação/seleção (animada) e o derramamento (spill) de menor custo.",
    parts: [{ label: "Guia", build: build }],
  });
})();
