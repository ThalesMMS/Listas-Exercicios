/*
 * c06-tabela-ll1.js — Guia: Tabela de parsing LL(1) e teste de LL(1).
 * Agora com o PREENCHIMENTO ANIMADO de M[A,a] a partir de FIRST (uma rodada por
 * não-terminal), num grid próprio; novas células em destaque.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  var COLS = ["(", ")", ";", "0", "1", "$"];
  var ROWS = ["S", "T", "A", "B", "C"];
  var FULL = {
    "S,(": "S→(T",
    "T,(": "T→CA", "T,)": "T→)", "T,0": "T→CA", "T,1": "T→CA",
    "A,;": "A→;B", "A,)": "A→)",
    "B,(": "B→CA", "B,)": "B→)", "B,0": "B→CA", "B,1": "B→CA",
    "C,(": "C→S", "C,0": "C→0", "C,1": "C→1",
  };
  // Ordem de preenchimento: um não-terminal por rodada.
  var ROUNDS = [
    { nt: "S", keys: ["S,("] },
    { nt: "T", keys: ["T,(", "T,)", "T,0", "T,1"] },
    { nt: "A", keys: ["A,;", "A,)"] },
    { nt: "B", keys: ["B,(", "B,)", "B,0", "B,1"] },
    { nt: "C", keys: ["C,(", "C,0", "C,1"] },
  ];

  function gridVisual(filled, fresh) {
    var has = {}; filled.forEach(function (k) { has[k] = true; });
    var isNew = {}; (fresh || []).forEach(function (k) { isNew[k] = true; });
    return {
      type: "svg",
      draw: function (svg) {
        var X0 = 96, Y0 = 78, CW = 80, CH = 42;
        svg.view(X0 + COLS.length * CW + 30, Y0 + ROWS.length * CH + 36);
        COLS.forEach(function (c, j) {
          svg.text(X0 + j * CW + CW / 2, Y0 - 20, c, { size: 14, weight: 700, mono: true, color: "var(--accent)" });
        });
        ROWS.forEach(function (r, i) {
          svg.text(X0 - 14, Y0 + i * CH + CH / 2, r, { anchor: "end", size: 15, weight: 700, color: "var(--red)" });
          COLS.forEach(function (c, j) {
            var key = r + "," + c, txt = has[key] ? FULL[key] : null, nw = isNew[key];
            var x = X0 + j * CW, y = Y0 + i * CH;
            svg.rect(x, y, CW, CH, {
              fill: nw ? "var(--yellow-soft)" : txt ? "var(--accent-soft)" : "var(--bg)",
              stroke: nw ? "var(--yellow)" : "var(--border)", strokeWidth: nw ? 3 : 1.5,
            });
            if (txt) svg.text(x + CW / 2, y + CH / 2, txt, { size: 11.5, mono: true, weight: 700, color: nw ? "var(--yellow)" : "var(--ink)" });
          });
        });
      },
    };
  }

  function build() {
    var steps = [
      C.domStep(
        "A tabela preditiva M[A, a]",
        "A tabela LL(1) diz, para cada <b>não-terminal A</b> no topo da pilha e cada <b>terminal a</b> " +
          "de entrada (lookahead), <b>qual produção</b> usar. Uma consulta, zero backtracking.",
        C.codeHtml("se topo = A (não-terminal) e entrada = a\n   produção = M[A, a]")
      ),
      C.domStep(
        "Como preencher a tabela",
        "Para cada produção <code>A → α</code>:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Construção</div>" +
          "<ul>" +
          "<li>para cada <code>a ∈ FIRST(α)</code>: <code>M[A, a] = (A → α)</code>;</li>" +
          "<li>se <code>λ ∈ FIRST(α)</code>: para cada <code>b ∈ FOLLOW(A)</code>, " +
          "<code>M[A, b] = (A → α)</code>.</li>" +
          "</ul>" +
          "<p>Se alguma célula receber <b>duas</b> produções, há <b>conflito</b> → a gramática " +
          "<b>não</b> é LL(1). Vamos preencher para S → ( T; T → C A | ); A → ; B | ); B → C A | ); " +
          "C → 0 | 1 | S.</p></div>"
      ),
    ];

    var filled = [];
    ROUNDS.forEach(function (rd) {
      filled = filled.concat(rd.keys);
      var snap = filled.slice();
      steps.push({
        title: "Preenche as produções de " + rd.nt,
        body: "<p>Para cada produção de <code>" + rd.nt + "</code>, coloco-a nas colunas de " +
          "<code>FIRST</code> do lado direito. Ex.: <code>" + FULL[rd.keys[0]] + "</code> entra nas " +
          "colunas " + rd.keys.map(function (k) { return "<code>" + k.split(",")[1] + "</code>"; }).join(", ") +
          ". (novas em <span style='color:var(--yellow)'>amarelo</span>)</p>",
        visual: gridVisual(snap, rd.keys),
      });
    });

    steps.push(
      C.domStep(
        "Teste: a gramática é LL(1)?",
        "Nenhuma célula recebeu <b>duas</b> produções acima → sem conflitos. Em geral, dois testes " +
          "locais bastam:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Condições LL(1)</div>" +
          "<p>Para alternativas <code>A → α | β</code>:</p>" +
          "<ul>" +
          "<li><b>FIRST/FIRST</b>: <code>FIRST(α) ∩ FIRST(β) = ∅</code>;</li>" +
          "<li><b>FIRST/FOLLOW</b>: se <code>β ⇒ λ</code>, então <code>FIRST(α) ∩ FOLLOW(A) = ∅</code>.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Diagnóstico das quatro gramáticas",
        body: "Aplicando os dois testes a quatro gramáticas:",
        headers: ["gramática", "LL(1)?", "motivo"],
        rows: [
          ["X→aY|Z ; Y→a|c ; Z→bY", "sim", "FIRST(aY)={a}, FIRST(Z)={b} — disjuntos"],
          ["P→dR ; R→o|S ; S→g|og", "não", "FIRST(o) ∩ FIRST(S) ∋ o — conflito FIRST/FIRST"],
          ["J→aKL ; K→c|λ ; L→c", "não", "K⇒λ e FIRST(c) ∩ FOLLOW(K)={c} — FIRST/FOLLOW"],
          ["J→aKL ; K→c|λ ; L→b", "sim", "FIRST(K)={c} ∩ FOLLOW(K)={b} = ∅"],
        ],
      }),
      C.domStep(
        "Resumo",
        "A tabela é a “máquina de decidir” do parser LL(1).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Preencha M[A,a] por FIRST (e por FOLLOW quando há λ). <b>Sem conflitos ⇔ LL(1)</b>. " +
          "Gramáticas com recursão à esquerda ou prefixo comum costumam gerar conflitos — daí " +
          "fatorar e remover recursão antes.</div>"
      )
    );
    return steps;
  }

  EX.registry.add({
    id: "c06-tabela-ll1",
    num: "M",
    subject: "Compiladores",
    section: "Análise Sintática LL(1)",
    title: "Tabela LL(1) e teste de LL(1)",
    type: "computacional",
    hubDesc: "Preenchimento animado de M[A,a] por FIRST; conflito ⇔ não é LL(1); diagnóstico por gramática.",
    statement:
      "Entenda a construção da tabela de parsing LL(1) a partir de FIRST/FOLLOW (preenchida passo a " +
      "passo) e o teste para decidir se uma gramática é LL(1) (ausência de conflitos).",
    parts: [{ label: "Guia", build: build }],
  });
})();
