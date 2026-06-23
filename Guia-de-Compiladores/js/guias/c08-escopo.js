/*
 * c08-escopo.js — Guia: Escopo e tabela de símbolos (declaração aninhada mais próxima).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  var CODE =
    "class Foo {\n" +
    "  f(x : Int) : Int {\n" +
    "    {\n" +
    "      let x : Int <- 4 in {\n" +
    "        x;\n" +
    "        let x : Int <- 7 in\n" +
    "          x;\n" +
    "        x;\n" +
    "      };\n" +
    "      x;\n" +
    "    };\n" +
    "  };\n" +
    "  x : Int <- 14;\n" +
    "}";

  // Pilha de escopos (topo = declaração mais interna em vigor); resolve no topo.
  function scopeVisual(cells) {
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(560, 280);
        svg.text(120, 34, "pilha de escopos (topo = mais interno)", { anchor: "start", size: 13, weight: 700, color: "var(--ink-dim)" });
        EX.Diagram.boxes(svg, {
          cells: cells, x: 120, y: 54, cellW: 250, cellH: 40, orientation: "v",
        }, { highlight: [0], pointers: [{ index: 0, label: "resolve aqui", color: "var(--accent)" }] });
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "Resolver nomes à sua declaração",
        "A análise semântica liga cada <b>uso</b> de um nome à <b>declaração</b> que vale ali. Quando o " +
          "mesmo nome é declarado em vários escopos aninhados, qual vence?",
        "<p>A resposta é a regra da <b>declaração aninhada mais próxima</b>: vale a declaração do " +
          "escopo <b>mais interno</b> que envolve o uso.</p>"
      ),
      C.codeStep({
        title: "O exemplo",
        body: "Quatro declarações de <code>x</code>: parâmetro (linha 2), dois <code>let</code> " +
          "(linhas 4 e 6) e um atributo (linha 13). As linhas destacadas são as declarações.",
        code: CODE,
        active: [2, 4, 6, 13],
        lang: "text",
      }),
      C.domStep(
        "A regra: de dentro para fora",
        "Ao encontrar um uso de <code>x</code>, procure a declaração subindo os escopos: corpo do " +
          "<code>let</code> atual → blocos → parâmetros do método → atributos da classe. Pare na " +
          "<b>primeira</b> que casa.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Sombreamento</div>" +
          "Uma declaração interna <b>esconde</b> (shadow) as externas <em>enquanto</em> está no escopo. " +
          "Quando o <code>let</code> fecha, a externa volta a valer.</div>"
      ),
      {
        title: "Pilha de escopos — uso na linha 5",
        body: "<p>No uso de <code>x</code> na <b>linha 5</b>, a pilha de escopos (de fora para dentro) " +
          "tem o atributo, o parâmetro e o <code>let x ← 4</code>. Resolve-se no <b>topo</b> (mais " +
          "interno): o <code>let</code> da linha 4.</p>",
        visual: scopeVisual(["let x ← 4   (l.4)", "parâmetro x   (l.2)", "atributo x   (l.13)"]),
      },
      {
        title: "Linha 7 — entra o let interno",
        body: "<p>Na <b>linha 7</b>, o <code>let x ← 7</code> (linha 6) está em vigor: é empilhado por " +
          "cima e vira o topo. O uso resolve <b>nele</b>.</p>",
        visual: scopeVisual(["let x ← 7   (l.6)", "let x ← 4   (l.4)", "parâmetro x   (l.2)", "atributo x   (l.13)"]),
      },
      {
        title: "Linha 8 — o let interno fechou",
        body: "<p>Passado o <code>let</code> da linha 6, ele é <b>desempilhado</b>. Na <b>linha 8</b> o " +
          "topo volta a ser <code>let x ← 4</code> — o sombreamento acabou.</p>",
        visual: scopeVisual(["let x ← 4   (l.4)", "parâmetro x   (l.2)", "atributo x   (l.13)"]),
      },
      {
        title: "Linha 10 — fora dos dois let",
        body: "<p>Na <b>linha 10</b>, ambos os <code>let</code> já fecharam. O topo é o <b>parâmetro</b> " +
          "<code>x</code> (linha 2), que <b>esconde</b> o atributo da linha 13.</p>",
        visual: scopeVisual(["parâmetro x   (l.2)", "atributo x   (l.13)"]),
      },
      C.tableStep({
        title: "As ligações",
        body: "Cada uso e a declaração que o captura:",
        headers: ["uso", "liga em", "por quê"],
        rows: [
          ["linha 5  (x;)", "linha 4", "let mais interno em vigor"],
          ["linha 7  (x;)", "linha 6", "dentro do let interno"],
          ["linha 8  (x;)", "linha 4", "o let da linha 6 já fechou"],
          ["linha 10 (x;)", "linha 2", "fora dos dois let → parâmetro (esconde o atributo da l.13)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "A tabela de símbolos implementa essa busca com escopos empilhados (push ao entrar, pop ao " +
          "sair).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Use sempre a declaração do <b>escopo mais interno</b> que envolve o uso; ao sair do escopo, " +
          "a declaração some e a de fora reaparece.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c08-escopo",
    num: "Esc",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "Escopo e tabela de símbolos",
    type: "conceitual",
    hubDesc: "Regra da declaração aninhada mais próxima e sombreamento de nomes.",
    statement:
      "Entenda a resolução de escopo: como a tabela de símbolos liga cada uso de um nome à declaração " +
      "do escopo mais interno (declaração aninhada mais próxima) e o efeito de sombreamento.",
    parts: [{ label: "Guia", build: build }],
  });
})();
