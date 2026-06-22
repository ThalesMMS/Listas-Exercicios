/*
 * c07-parsing-ll1.js — Guia: Parsing preditivo LL(1) (pilha + tabela).
 * Trace ANIMADO da string (();0) com a gramática S→(T; T→CA|); A→;B|); B→CA|);
 * C→0|1|S. Cada passo mostra a configuração (pilha/entrada/ação) no texto e a
 * árvore de derivação CRESCENDO em paralelo (EX.Diagram.tree + shown progressivo).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  var GRAMMAR = ["S → ( T", "T → C A | )", "A → ; B | )", "B → C A | )", "C → 0 | 1 | S"];

  // Árvore de derivação completa de (();0). Os ids permitem revelar nós aos poucos.
  var PARSE_TREE = {
    id: "S0", label: "S", children: [
      { id: "lp0", label: "(" },
      { id: "T1", label: "T", children: [
        { id: "C1", label: "C", children: [
          { id: "S2", label: "S", children: [
            { id: "lp1", label: "(" },
            { id: "T2", label: "T", children: [{ id: "rp0", label: ")" }] },
          ] },
        ] },
        { id: "A1", label: "A", children: [
          { id: "semi", label: ";" },
          { id: "B1", label: "B", children: [
            { id: "C2", label: "C", children: [{ id: "zero", label: "0" }] },
            { id: "A2", label: "A", children: [{ id: "rp1", label: ")" }] },
          ] },
        ] },
      ] },
    ],
  };

  // Trace clássico: pilha (topo à esquerda), entrada e ação. `add` = nós revelados
  // naquele passo; `hi` = nós destacados; `kind` distingue expandir/casar/aceitar.
  var TRACE = [
    { stack: "S $", input: "(();0)$", action: "S → ( T", kind: "exp", add: ["lp0", "T1"], hi: ["lp0", "T1"] },
    { stack: "( T $", input: "(();0)$", action: "casa (", kind: "match", add: [], hi: ["lp0"] },
    { stack: "T $", input: "();0)$", action: "T → C A", kind: "exp", add: ["C1", "A1"], hi: ["C1", "A1"] },
    { stack: "C A $", input: "();0)$", action: "C → S", kind: "exp", add: ["S2"], hi: ["S2"] },
    { stack: "S A $", input: "();0)$", action: "S → ( T", kind: "exp", add: ["lp1", "T2"], hi: ["lp1", "T2"] },
    { stack: "( T A $", input: "();0)$", action: "casa (", kind: "match", add: [], hi: ["lp1"] },
    { stack: "T A $", input: ");0)$", action: "T → )", kind: "exp", add: ["rp0"], hi: ["rp0"] },
    { stack: ") A $", input: ");0)$", action: "casa )", kind: "match", add: [], hi: ["rp0"] },
    { stack: "A $", input: ";0)$", action: "A → ; B", kind: "exp", add: ["semi", "B1"], hi: ["semi", "B1"] },
    { stack: "; B $", input: ";0)$", action: "casa ;", kind: "match", add: [], hi: ["semi"] },
    { stack: "B $", input: "0)$", action: "B → C A", kind: "exp", add: ["C2", "A2"], hi: ["C2", "A2"] },
    { stack: "C A $", input: "0)$", action: "C → 0", kind: "exp", add: ["zero"], hi: ["zero"] },
    { stack: "0 A $", input: "0)$", action: "casa 0", kind: "match", add: [], hi: ["zero"] },
    { stack: "A $", input: ")$", action: "A → )", kind: "exp", add: ["rp1"], hi: ["rp1"] },
    { stack: ") $", input: ")$", action: "casa )", kind: "match", add: [], hi: ["rp1"] },
    { stack: "$", input: "$", action: "aceita!", kind: "accept", add: [], hi: [] },
  ];

  function esc(s) { return C.esc(s); }

  // HTML da configuração: pilha (topo destacado) + entrada (lookahead destacado) + ação.
  function frameHtml(row) {
    var toks = row.stack.split(" ");
    var stackHtml = toks.map(function (t, i) {
      return i === 0
        ? "<b style='color:var(--accent)'>" + esc(t) + "</b>"
        : "<span class='muted'>" + esc(t) + "</span>";
    }).join(" ");
    var inp = row.input;
    var look = inp.charAt(0);
    var rest = inp.slice(1);
    var inputHtml = "<b style='color:var(--yellow)'>" + esc(look) + "</b>" + "<span class='muted'>" + esc(rest) + "</span>";
    var actClass = row.kind === "accept" ? "ok" : row.kind === "match" ? "accent" : "";
    var actLabel = row.kind === "exp" ? "expande" : row.kind === "match" ? "casa terminal" : "aceita";
    return "<div class='ex-callout tip'><div class='ex-callout-title'>Configuração</div>" +
      "<table class='ex-table'><tbody>" +
      "<tr><td style='text-align:left'><b>pilha</b> (topo →)</td><td style='text-align:left;font-family:monospace'>" + stackHtml + "</td></tr>" +
      "<tr><td style='text-align:left'><b>entrada</b></td><td style='text-align:left;font-family:monospace'>" + inputHtml + "</td></tr>" +
      "<tr><td style='text-align:left'><b>ação</b></td><td style='text-align:left'><span class='" + actClass + "' style='font-family:monospace;font-weight:700'>" + esc(row.action) + "</span> <span class='muted'>(" + actLabel + ")</span></td></tr>" +
      "</tbody></table></div>";
  }

  function treeVisual(shown, hi) {
    return {
      type: "svg",
      draw: function (svg) {
        EX.Diagram.tree(svg, PARSE_TREE, {
          shown: shown,
          highlight: hi,
          nodeShape: "circle",
          edgeLabels: false,
        });
      },
    };
  }

  function build() {
    var steps = [
      G.gstep(
        "Como o parser preditivo trabalha",
        "Com a tabela pronta, o parsing LL(1) é mecânico: usa uma <b>pilha</b> e lê a entrada da " +
          "esquerda para a direita, <b>sem backtracking</b>. Vamos analisar <code>( ( ) ; 0 )</code> " +
          "construindo, em paralelo, a <b>árvore de derivação</b>:",
        GRAMMAR
      ),
      C.domStep(
        "O algoritmo",
        "A pilha começa com <code>S $</code> e a entrada termina em <code>$</code>. Repita olhando o " +
          "<b>topo da pilha</b>:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Passos</div>" +
          "<ul>" +
          "<li><b>topo é terminal</b>: tem que <b>casar</b> com o próximo símbolo da entrada (consome " +
          "os dois);</li>" +
          "<li><b>topo é não-terminal A</b>, lookahead <code>a</code>: aplique <code>M[A, a]</code>, " +
          "desempilhe A e empilhe o lado direito <b>ao contrário</b> (para o 1º símbolo ficar no topo);</li>" +
          "<li>pilha e entrada em <code>$</code> → <b>aceita</b>; célula vazia → <b>erro de sintaxe</b>.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "A tabela que vamos consultar",
        body: "Cada expansão abaixo vem de uma célula <code>M[A, a]</code> desta tabela (guia anterior):",
        headers: ["", "(", ")", ";", "0", "1", "$"],
        rows: [
          ["S", "S→(T", "", "", "", "", ""],
          ["T", "T→CA", "T→)", "", "T→CA", "T→CA", ""],
          ["A", "", "A→)", "A→;B", "", "", ""],
          ["B", "B→CA", "B→)", "", "B→CA", "B→CA", ""],
          ["C", "C→S", "", "", "C→0", "C→1", ""],
        ],
      }),
    ];

    // Trace animado: a árvore cresce conforme as expansões.
    var shown = ["S0"];
    TRACE.forEach(function (row, i) {
      shown = shown.concat(row.add);
      var shownSnapshot = shown.slice();
      var n = i + 1;
      var body;
      if (row.kind === "exp") {
        body = "<p>Passo " + n + "/16 — o topo é o não-terminal <code>" + esc(row.stack.split(" ")[0]) +
          "</code>; com o lookahead, a tabela manda aplicar <code>" + esc(row.action) +
          "</code>. Os filhos novos aparecem na árvore.</p>" + frameHtml(row);
      } else if (row.kind === "match") {
        body = "<p>Passo " + n + "/16 — o topo é o terminal <code>" + esc(row.stack.split(" ")[0]) +
          "</code> e bate com o lookahead: <b>casa</b> e consome os dois.</p>" + frameHtml(row);
      } else {
        body = "<p>Passo " + n + "/16 — pilha e entrada chegaram a <code>$</code>: a string é " +
          "<b>aceita</b>. A árvore de derivação está completa.</p>" + frameHtml(row);
      }
      steps.push({
        title: row.kind === "accept" ? "Aceita! 🎉" : (row.kind === "exp" ? "Expande " + row.stack.split(" ")[0] : "Casa " + row.stack.split(" ")[0]),
        body: body,
        visual: treeVisual(shownSnapshot, row.hi),
      });
    });

    steps.push(
      C.domStep(
        "Armadilhas e resumo",
        "O parsing LL(1) é determinístico: cada passo é uma consulta de tabela ou um casamento.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Pontos de atenção</div>" +
          "<ul>" +
          "<li><b>Empilhe ao contrário</b>: para <code>S → ( T</code>, empilha-se T e depois ( (o " +
          "<code>(</code> fica no topo);</li>" +
          "<li>note a <b>recursão</b> em ação: <code>C → S → ( T</code> reabre um parêntese (veja o " +
          "ramo esquerdo da árvore);</li>" +
          "<li><b>célula vazia</b> na tabela = rejeita (erro de sintaxe).</li>" +
          "</ul></div>"
      )
    );
    return steps;
  }

  EX.registry.add({
    id: "c07-parsing-ll1",
    num: "LL1",
    subject: "Compiladores",
    section: "Análise Sintática LL(1)",
    title: "Parsing preditivo LL(1)",
    type: "computacional",
    hubDesc: "Pilha + tabela e a árvore de derivação crescendo passo a passo; trace animado de (();0).",
    statement:
      "Entenda o parsing preditivo LL(1): a pilha iniciada com S$, o casamento de terminais, a " +
      "expansão de não-terminais pela tabela e a árvore de derivação construída até aceitar.",
    parts: [{ label: "Guia", build: build }],
  });
})();
