/*
 * c05-first-follow.js — Guia: conjuntos FIRST e FOLLOW.
 * Agora com a DERIVAÇÃO ITERATIVA (ponto fixo) numa matriz não-terminal × terminal:
 * as células se preenchem rodada a rodada, com os ganhos da rodada em destaque.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  var GRAMMAR = ["S → ( T", "T → C A | )", "A → ; B | )", "B → C A | )", "C → 0 | 1 | S"];

  // Matriz de conjuntos: linhas = não-terminais, colunas = terminais. Marca ✓ onde
  // o terminal pertence ao conjunto; novidades da rodada saem em amarelo.
  function matrix(o) {
    return {
      type: "svg",
      draw: function (svg) {
        var rows = o.rows, cols = o.cols, cur = o.cur, prev = o.prev || {};
        var X0 = 140, Y0 = 86, CW = 64, CH = 44;
        svg.view(X0 + cols.length * CW + 48, Y0 + rows.length * CH + 46);
        // cabeçalho de colunas
        svg.text(X0 - 16, Y0 - 22, o.label || "conjunto", { anchor: "end", size: 12, weight: 700, color: "var(--ink-dim)" });
        cols.forEach(function (c, j) {
          svg.text(X0 + j * CW + CW / 2, Y0 - 22, c, { size: 15, weight: 700, mono: true, color: "var(--accent)" });
        });
        rows.forEach(function (r, i) {
          svg.text(X0 - 16, Y0 + i * CH + CH / 2, r, { anchor: "end", size: 15, weight: 700, color: "var(--red)" });
          cols.forEach(function (c, j) {
            var has = (cur[r] || []).indexOf(c) !== -1;
            var isNew = has && (prev[r] || []).indexOf(c) === -1;
            var x = X0 + j * CW, y = Y0 + i * CH;
            svg.rect(x, y, CW, CH, {
              fill: isNew ? "var(--yellow-soft)" : has ? "var(--accent-soft)" : "var(--bg)",
              stroke: isNew ? "var(--yellow)" : "var(--border)",
              strokeWidth: isNew ? 3 : 1.5,
            });
            if (has) svg.text(x + CW / 2, y + CH / 2, "✓", { size: 18, weight: 700, color: isNew ? "var(--yellow)" : "var(--accent)" });
          });
        });
      },
    };
  }

  // Rodadas de FIRST (cumulativas) para a gramática de trabalho.
  var FCOLS = ["(", ")", ";", "0", "1"];
  var FROWS = ["S", "T", "A", "B", "C"];
  var F1 = { S: ["("], C: ["0", "1"], A: [";", ")"], T: [")"], B: [")"] };
  var F2 = { S: ["("], C: ["0", "1", "("], A: [";", ")"], T: ["0", "1", ")"], B: ["0", "1", ")"] };
  var F3 = { S: ["("], C: ["0", "1", "("], A: [";", ")"], T: ["0", "1", "(", ")"], B: ["0", "1", "(", ")"] };

  // FOLLOW: base e ponto fixo.
  var FOCOLS = ["$", ";", ")"];
  var FOBASE = { S: ["$"], C: [";", ")"], T: [], A: [], B: [] };
  var FOFIX = { S: ["$", ";", ")"], T: ["$", ";", ")"], A: ["$", ";", ")"], B: ["$", ";", ")"], C: [";", ")"] };

  function build() {
    return [
      G.gstep(
        "Para que servem FIRST e FOLLOW",
        "Para montar a tabela preditiva precisamos saber, para cada produção, <b>com quais terminais " +
          "ela pode começar</b> (FIRST) e — quando uma produção pode sumir (λ) — <b>o que pode vir " +
          "logo depois</b> de um não-terminal (FOLLOW). Trabalharemos com esta gramática:",
        GRAMMAR
      ),
      C.domStep(
        "Regras de FIRST",
        "FIRST(α) = os terminais que podem iniciar uma string derivada de α.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Como calcular FIRST(X)</div>" +
          "<ul>" +
          "<li>terminal <code>a</code>: FIRST = <code>{a}</code>;</li>" +
          "<li>produção <code>A → X₁ X₂ …</code>: junte FIRST(X₁); se <code>X₁ ⇒ λ</code>, junte também " +
          "FIRST(X₂), e assim por diante;</li>" +
          "<li><code>λ ∈ FIRST(A)</code> se <b>toda</b> a produção pode derivar λ.</li>" +
          "</ul>" +
          "<p>Calcula-se por <b>iteração</b>: repete-se até nenhum conjunto mudar (<b>ponto fixo</b>).</p></div>"
      ),
      {
        title: "FIRST — rodada 1",
        body: "<p>Aplicamos as regras uma vez, partindo de tudo vazio. Os <b>terminais diretos</b> " +
          "aparecem: <code>S→(T</code> dá <code>(</code>; <code>C→0|1</code> dá <code>0,1</code>; " +
          "<code>A</code>,<code>T</code>,<code>B</code> ganham o <code>)</code> direto. (novidades em " +
          "<span style='color:var(--yellow)'>amarelo</span>)</p>",
        visual: matrix({ rows: FROWS, cols: FCOLS, cur: F1, prev: {}, label: "FIRST" }),
      },
      {
        title: "FIRST — rodada 2 (propaga)",
        body: "<p>Agora os conjuntos se <b>propagam</b>: como <code>C→S</code>, FIRST(C) herda FIRST(S)=" +
          "<code>{(}</code>; e <code>T→CA</code>, <code>B→CA</code> herdam FIRST(C)=<code>{0,1}</code>. " +
          "As células novas estão destacadas.</p>",
        visual: matrix({ rows: FROWS, cols: FCOLS, cur: F2, prev: F1, label: "FIRST" }),
      },
      {
        title: "FIRST — rodada 3 = ponto fixo",
        body: "<p>Mais uma propagação: o <code>(</code> que entrou em FIRST(C) agora chega a " +
          "<code>T</code> e <code>B</code> (via <code>CA</code>). A rodada seguinte não mudaria nada → " +
          "<b>ponto fixo</b>, FIRST está completo.</p>",
        visual: matrix({ rows: FROWS, cols: FCOLS, cur: F3, prev: F2, label: "FIRST" }),
      },
      C.domStep(
        "Regras de FOLLOW",
        "FOLLOW(A) = os terminais que podem aparecer <b>imediatamente depois</b> de A em alguma " +
          "derivação. Só importa de verdade quando A pode derivar λ.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Como calcular FOLLOW(A)</div>" +
          "<ul>" +
          "<li><code>$</code> (fim) ∈ FOLLOW(símbolo inicial);</li>" +
          "<li>em <code>B → α A β</code>: junte <code>FIRST(β) − {λ}</code> a FOLLOW(A);</li>" +
          "<li>se <code>β ⇒ λ</code> (ou A está no fim), junte <b>FOLLOW(B)</b> a FOLLOW(A).</li>" +
          "</ul></div>"
      ),
      {
        title: "FOLLOW — fatos base",
        body: "<p>Dois fatos diretos: <code>$ ∈ FOLLOW(S)</code> (S é o símbolo inicial); e como " +
          "<code>C</code> precede <code>A</code> em <code>T→CA</code>/<code>B→CA</code>, " +
          "FOLLOW(C) ⊇ FIRST(A) = <code>{;, )}</code>.</p>",
        visual: matrix({ rows: FROWS, cols: FOCOLS, cur: FOBASE, prev: {}, label: "FOLLOW" }),
      },
      {
        title: "FOLLOW — propaga até o ponto fixo",
        body: "<p>Agora a propagação “para cima”: <code>S→(T</code> faz FOLLOW(T) ⊇ FOLLOW(S); " +
          "<code>C→S</code> faz FOLLOW(S) ⊇ FOLLOW(C); <code>A→;B</code> faz FOLLOW(B) ⊇ FOLLOW(A); " +
          "<code>T,B→CA</code> faz FOLLOW(A) ⊇ FOLLOW(T),FOLLOW(B). Iterando, tudo converge:</p>",
        visual: matrix({ rows: FROWS, cols: FOCOLS, cur: FOFIX, prev: FOBASE, label: "FOLLOW" }),
      },
      C.tableStep({
        title: "Quando há λ: o caso interessante",
        body: "Em <code>A → x C B y</code>, <code>B → z | λ</code>, <code>C → y | B x</code>: como " +
          "<code>B</code> pode ser λ, FIRST(C) ganha o <code>x</code> de <code>B x</code> (além de y, z). " +
          "É a λ que faz FIRST/FOLLOW “vazarem”.",
        headers: ["não-terminal", "FIRST", "FOLLOW"],
        rows: [
          ["A", "{ x }", "{ }"],
          ["B", "{ z, λ }", "{ x, y }"],
          ["C", "{ x, y, z }", "{ y, z }"],
        ],
      }),
      C.domStep(
        "Resumo",
        "FIRST e FOLLOW alimentam a construção da tabela LL(1) (próximo guia).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "FIRST = “por onde a produção <b>começa</b>”; FOLLOW = “o que pode vir <b>depois</b>”. Ambos " +
          "se calculam por <b>iteração até o ponto fixo</b> — propagando conjuntos pelas produções até " +
          "nada mais mudar.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c05-first-follow",
    num: "F/F",
    subject: "Compiladores",
    section: "Análise Sintática LL(1)",
    title: "Conjuntos FIRST e FOLLOW",
    type: "computacional",
    hubDesc: "Derivação iterativa (ponto fixo) de FIRST/FOLLOW numa matriz animada; propagação por λ.",
    statement:
      "Entenda os conjuntos FIRST e FOLLOW: suas regras, a derivação iterativa até o ponto fixo " +
      "(propagação dos conjuntos pelas produções) e o caso especial das produções λ.",
    parts: [{ label: "Guia", build: build }],
  });
})();
