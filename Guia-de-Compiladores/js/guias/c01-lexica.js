/*
 * c01-lexica.js — Guia: Análise léxica (scanner Flex-like).
 * Tokenização por maximal munch (maior casamento) + prioridade de regras.
 * Agora com: o scanner como AUTÔMATO (um DFA por regra) e a ANIMAÇÃO do
 * mecanismo de maior-casamento (avança, guarda o último aceite, recua, emite).
 * Reusa EX.Compilers (kit) + EX.Diagram.automaton + EX.Diagram.boxes.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Janela da entrada usada na animação de varredura (10 primeiros símbolos).
  var WIN = ["c", "b", "a", "c", "c", "a", "c", "a", "c", "c"];

  // --- autômatos (um DFA por regra) ------------------------------------------
  function autoCb(svg) {
    EX.Diagram.automaton(svg, {
      start: "q0",
      states: [
        { id: "q0", label: "q0", x: 170, y: 130 },
        { id: "X", label: "X", x: 420, y: 130, accepting: true },
      ],
      transitions: [
        { from: "q0", to: "q0", label: "c" },
        { from: "q0", to: "X", label: "b" },
      ],
    }, { view: [600, 240] });
  }
  function autoAc(svg) {
    EX.Diagram.automaton(svg, {
      start: "q0",
      states: [
        { id: "q0", label: "q0", x: 130, y: 130 },
        { id: "q1", label: "q1", x: 320, y: 130 },
        { id: "Y", label: "Y", x: 500, y: 130, accepting: true },
      ],
      transitions: [
        { from: "q0", to: "q1", label: "a" },
        { from: "q1", to: "Y", label: "c" },
      ],
    }, { view: [620, 240] });
  }
  function autoCac(svg) {
    EX.Diagram.automaton(svg, {
      start: "q0",
      states: [
        { id: "q0", label: "q0", x: 180, y: 130 },
        { id: "Z", label: "Z", x: 440, y: 130, accepting: true },
      ],
      transitions: [
        { from: "q0", to: "q0", label: "c" },
        { from: "q0", to: "Z", label: "a" },
        { from: "Z", to: "Z", label: "c" },
      ],
    }, { view: [620, 240] });
  }

  // --- animação de varredura --------------------------------------------------
  function scanVisual(o) {
    return {
      type: "svg",
      draw: function (svg) {
        var ptrs;
        if (o.inicio === o.cursor) {
          ptrs = [{ index: o.cursor, label: "início / lê", color: "var(--yellow)" }];
        } else {
          ptrs = [
            { index: o.inicio, label: "início", color: "var(--green)" },
            { index: o.cursor, label: "lê", color: "var(--yellow)" },
          ];
        }
        EX.Diagram.boxes(svg, {
          cells: WIN, x: 70, y: 95, cellW: 60, cellH: 50, indices: true,
        }, {
          view: [760, 230],
          highlight: o.matched || [],
          danger: o.stop == null ? [] : [o.stop],
          pointers: ptrs,
        });
        if (o.tag) {
          svg.text(70 + WIN.length * 60 / 2, 200, o.tag, { size: 14, weight: 700, color: o.tagColor || "var(--ink-dim)" });
        }
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "Quebrar a entrada em tokens",
        "O analisador léxico lê os caracteres e os agrupa em <b>tokens</b> (lexemas + categoria). " +
          "O problema central: quando <b>várias regras</b> podem casar a partir da posição atual, " +
          "qual usar e <b>quanto consumir</b>?",
        "<p>Especificação de exemplo (Flex-like):</p>" +
          C.codeHtml("c*b     { print \"X\" }\nac      { print \"Y\" }\nc*ac*   { print \"Z\" }") +
          "<p>Entrada: <code>cbaccacacccbbcccbaccac</code> &nbsp;→&nbsp; saída: <b>XZYZXXXZY</b></p>"
      ),
      C.domStep(
        "Regra 1 — maximal munch (maior casamento)",
        "A cada passo, o scanner consome o <b>maior prefixo</b> que casa <em>alguma</em> regra. " +
          "Por quê? Senão <code>ac</code> seria sempre preferido a <code>acc</code>, e identificadores " +
          "como <code>conta</code> virariam <code>c</code>+<code>onta</code>. O léxico quer a maior " +
          "“mordida” possível.",
        C.codeHtml("posição em ...accac...\n  ac     casa  (regra ac)        → 2 chars\n  acc    casa  (regra c*ac*)     → 3 chars  ✓ vence (maior)")
      ),
      C.domStep(
        "Regra 2 — prioridade (ordem das regras)",
        "Quando duas regras casam o <b>mesmo tamanho</b>, vence a que aparece <b>primeiro</b> na " +
          "especificação. É assim que palavras-chave (listadas antes) ganham de identificadores " +
          "genéricos com o mesmo lexema.",
        C.codeHtml("posição em ...ac (fim) ...\n  ac     (regra 2)  → 2 chars\n  c*ac*  (regra 3)  → 2 chars   empate!\n  → vence a regra de MENOR número: ac (Y)")
      ),
      C.domStep(
        "O scanner é um autômato finito",
        "Cada expressão regular vira um <b>autômato finito</b> (AFD): estados ligados por transições " +
          "rotuladas por caractere; um <b>estado de aceitação</b> (círculo duplo) marca um casamento. " +
          "O lexer roda os autômatos das regras <b>em paralelo</b> e aplica as duas regras acima. " +
          "Vamos ver cada regra como um autômato:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Ideia</div>" +
          "Regex → AFD (via AFN + construção de subconjuntos). Aqui mostramos um autômato por regra; " +
          "na prática eles são fundidos num único AFD que decide tudo numa passada.</div>"
      ),
      {
        title: "Autômato da regra c*b → X",
        body: "<p>Zero ou mais <code>c</code> (auto-laço em <code>q0</code>) e então um <code>b</code> " +
          "leva ao aceite <b>X</b>. É a regra que casa <code>cb</code>, <code>b</code>, <code>cccb</code>…</p>",
        visual: { type: "svg", draw: autoCb },
      },
      {
        title: "Autômato da regra ac → Y",
        body: "<p>Exatamente <code>a</code> seguido de <code>c</code> chega ao aceite <b>Y</b>. " +
          "Sem laços: casa <em>só</em> os dois caracteres <code>ac</code>.</p>",
        visual: { type: "svg", draw: autoAc },
      },
      {
        title: "Autômato da regra c*ac* → Z",
        body: "<p><code>c*</code> antes (auto-laço em <code>q0</code>), um <code>a</code> que já " +
          "aceita <b>Z</b>, e <code>c*</code> depois (auto-laço no aceite). Casa <code>a</code>, " +
          "<code>acc</code>, <code>ccacc</code>…</p>" +
          "<p>Repare: <code>ac</code> é aceito por <b>este</b> autômato (Z) <em>e</em> pelo de cima (Y) — " +
          "o empate de tamanho é resolvido pela <b>prioridade</b> (Y vence).</p>",
        visual: { type: "svg", draw: autoCac },
      },
      {
        title: "Varredura: lendo o 1º caractere",
        body: "<p>O scanner começa em <code>início = 0</code> e avança o <b>cursor</b>. Lê <code>c</code>: " +
          "é só prefixo <code>c*</code> — <b>nenhuma regra aceita ainda</b>, então continua.</p>",
        visual: scanVisual({ inicio: 0, cursor: 0, matched: [], stop: null, tag: "ainda sem aceite", tagColor: "var(--ink-dim)" }),
      },
      {
        title: "Varredura: achou um aceite",
        body: "<p>Lê <code>b</code>: agora <code>cb</code> casa <code>c*b</code> → <b>aceite X</b>. " +
          "O scanner <b>guarda este ponto</b> (último aceite: posição 1, regra X) e tenta estender mais.</p>",
        visual: scanVisual({ inicio: 0, cursor: 1, matched: [0, 1], stop: null, tag: "último aceite: cb → X", tagColor: "var(--green)" }),
      },
      {
        title: "Varredura: travou",
        body: "<p>Lê <code>a</code>: nenhuma regra estende <code>cb</code>+<code>a</code> (não há " +
          "transição). O autômato <b>trava</b> — hora de <b>recuar</b> ao último aceite guardado.</p>",
        visual: scanVisual({ inicio: 0, cursor: 2, matched: [0, 1], stop: 2, tag: "travou em 'a' → recua", tagColor: "var(--red)" }),
      },
      {
        title: "Varredura: emite e recomeça",
        body: "<p>Emite o token do último aceite — <code>cb</code> → <b>X</b> — e reinicia o " +
          "<code>início</code> na posição onde travou. O ciclo recomeça e produzirá <code>acc</code> → Z, " +
          "depois <code>ac</code> → Y…</p>",
        visual: scanVisual({ inicio: 2, cursor: 2, matched: [], stop: null, tag: "emitido: cb (X) — novo token começa aqui", tagColor: "var(--accent)" }),
      },
      C.tableStep({
        title: "Trace completo",
        body: "Aplicando maior-casamento + prioridade, da esquerda para a direita:",
        headers: ["#", "prefixo", "regra", "saída", "por quê"],
        rows: [
          ["1", "cb", "c*b (1)", "X", "maior casamento no início"],
          ["2", "acc", "c*ac* (3)", "Z", "acc (3) > ac (2)"],
          ["3", "ac", "ac (2)", "Y", "empate em 2 → regra 2"],
          ["4", "accc", "c*ac* (3)", "Z", "maior casamento"],
          ["5", "b", "c*b (1)", "X", "c* vazio + b"],
          ["6", "b", "c*b (1)", "X", "—"],
          ["7", "cccb", "c*b (1)", "X", "c* = ccc"],
          ["8", "acc", "c*ac* (3)", "Z", "maior casamento"],
          ["9", "ac", "ac (2)", "Y", "empate → regra 2"],
        ],
      }),
      {
        title: "A fita de tokens",
        body: "Cada mordida vira um token (lexema em cima, categoria embaixo). A saída concatena as ações: <b>XZYZXXXZY</b>.",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.tape(svg, [
              { lexeme: "cb", label: "X" },
              { lexeme: "acc", label: "Z" },
              { lexeme: "ac", label: "Y" },
              { lexeme: "accc", label: "Z" },
              { lexeme: "b", label: "X" },
            ], { active: 1 });
          },
        },
      },
      C.domStep(
        "Armadilhas e resumo",
        "Os dois critérios juntos resolvem toda a ambiguidade do scanner.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em duas regras</div>" +
          "<ul><li><b>Maior casamento</b> primeiro (maximal munch);</li>" +
          "<li><b>empate</b> → a regra listada <b>antes</b> vence.</li></ul>" +
          "<p>O mecanismo: o autômato <b>avança guardando o último aceite</b> e, ao travar, " +
          "<b>recua</b> e emite esse aceite. Cuidado: <code>c*</code> pode casar <b>vazio</b>, então " +
          "<code>c*b</code> casa um simples <code>b</code>. E reordenar as regras muda a saída.</p></div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c01-lexica",
    num: "Léx",
    subject: "Compiladores",
    section: "Análise Léxica",
    title: "Análise léxica (maximal munch)",
    type: "computacional",
    hubDesc: "Scanner como autômato (um DFA por regra) + animação do maior casamento e desempate por prioridade.",
    statement:
      "Entenda como um analisador léxico Flex-like decide a tokenização: o scanner como autômato finito, " +
      "a regra do maior casamento (maximal munch) com recuo ao último aceite, e o desempate por ordem das regras.",
    parts: [{ label: "Guia", build: build }],
  });
})();
