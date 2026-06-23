/*
 * c16-propagacao-constantes.js — Guia: Propagação de constantes (fluxo de dados).
 * Agora com o LATTICE desenhado (⊤ / constantes / ⊥) e a ITERAÇÃO ATÉ O PONTO
 * FIXO num loop, rodada a rodada. Reusa EX.Diagram.graph + EX.Compilers.flow.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function latticeVisual() {
    return {
      type: "svg",
      draw: function (svg) {
        var nodes = [
          { id: "top", label: "⊤", x: 305, y: 60 },
          { id: "c0", label: "0", x: 120, y: 180 },
          { id: "c1", label: "1", x: 230, y: 180 },
          { id: "c2", label: "2", x: 380, y: 180 },
          { id: "c3", label: "3", x: 490, y: 180 },
          { id: "bot", label: "⊥", x: 305, y: 300 },
        ];
        var edges = [
          { from: "top", to: "c0" }, { from: "top", to: "c1" }, { from: "top", to: "c2" }, { from: "top", to: "c3" },
          { from: "c0", to: "bot" }, { from: "c1", to: "bot" }, { from: "c2", to: "bot" }, { from: "c3", to: "bot" },
        ];
        EX.Diagram.graph(svg, { nodes: nodes, edges: edges }, { view: [620, 360] });
        svg.text(305, 26, "⊤  não-constante (caminhos discordam)", { size: 12, weight: 700, color: "var(--ink-dim)" });
        svg.text(305, 230, "constantes conhecidas:  …, 0, 1, 2, 3, …", { size: 12, color: "var(--ink-dim)" });
        svg.text(305, 336, "⊥  ainda sem valor / inalcançável", { size: 12, weight: 700, color: "var(--ink-dim)" });
      },
    };
  }

  function loopVisual(spec) {
    return {
      type: "svg",
      draw: function (svg) {
        C.flow(svg, {
          w: 620, h: 400,
          nodes: [
            { id: "h", x: 200, y: 34, w: 230, h: 56, lines: spec.h, active: spec.act === "h" },
            { id: "b", x: 195, y: 150, w: 240, h: 78, lines: spec.b, active: spec.act === "b" },
            { id: "o", x: 200, y: 300, w: 230, h: 48, lines: spec.o },
          ],
          edges: [
            { from: "h", to: "b" },
            { from: "b", to: "o" },
            { from: "b", to: "h", curve: 150, color: "var(--red)", label: "back-edge" },
          ],
        });
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "Propagar constantes pelo programa todo",
        "A otimização local vê um bloco; a <b>análise de fluxo de dados</b> propaga fatos pelo " +
          "<b>grafo de fluxo de controle</b> (CFG) inteiro. Para constantes, o fato é: “que valor cada " +
          "variável tem aqui?”.",
        C.codeHtml("cada variável, em cada ponto, recebe um valor abstrato:\n   uma constante (ex.: 4)\n   ou  ⊤  (\"top\": não se sabe / não-constante)\n   ou  ⊥  (\"bottom\": ainda sem informação)")
      ),
      {
        title: "O lattice dos valores",
        body:
          "<p>Os valores abstratos formam um <b>lattice</b>: no topo <code>⊤</code> (“alcançável, mas " +
          "não-constante”), no fundo <code>⊥</code> (“ainda sem valor / inalcançável”), e entre eles " +
          "<b>todas as constantes</b>. <code>⊥</code> e <code>⊤</code> <b>não são sinônimos</b>. Os " +
          "pontos internos começam otimistas em <code>⊥</code> e só <b>sobem</b>; já os valores que " +
          "chegam <b>desconhecidos de fora</b> (parâmetros) entram como <code>⊤</code>.</p>",
        visual: latticeVisual(),
      },
      C.domStep(
        "O lattice e a junção",
        "O passo crucial é o <b>encontro</b> (junção) onde caminhos do CFG se reúnem: combinam-se os " +
          "valores vindos de cada caminho, <b>subindo</b> no lattice.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Regra da junção</div>" +
          "<ul>" +
          "<li>mesmo valor em todos os caminhos → mantém a <b>constante</b>;</li>" +
          "<li>valores <b>diferentes</b> (ou algum ⊤) → vira <b>⊤</b> (não-constante).</li>" +
          "</ul></div>"
      ),
      {
        title: "Exemplo: um if e a junção",
        body:
          "<p><b>Entrada:</b> <code>X</code> e <code>Y</code> chegam desconhecidos (<code>⊤</code>); " +
          "<code>Z</code> é fixado antes do if. No ponto <code>?</code> (junção) aplicamos a regra:</p>" +
          "<ul><li><b>X = 4</b>: ambos os ramos atribuem 4 → constante;</li>" +
          "<li><b>Y = ⊤</b>: <code>Y</code> entra como <code>⊤</code> e o ramo direito não o redefine → " +
          "<code>1 ⊔ ⊤ = ⊤</code> (se entrasse como <code>⊥</code>, seria 1);</li>" +
          "<li><b>Z = 5</b>: vem de antes do if, igual nos dois → constante.</li></ul>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.flow(svg, {
              w: 660, h: 360,
              nodes: [
                { id: "e", x: 250, y: 24, w: 170, h: 50, lines: ["Z := 5", "C > 0"] },
                { id: "l", x: 90, y: 140, w: 170, h: 56, lines: ["Y := 1", "X := 4"] },
                { id: "r", x: 420, y: 140, w: 150, h: 50, lines: ["X := 4"] },
                { id: "j", x: 210, y: 270, w: 240, h: 70, lines: ["?  X = 4", "Y = ⊤", "Z = 5"], active: true },
              ],
              edges: [
                { from: "e", to: "l" }, { from: "e", to: "r" },
                { from: "l", to: "j" }, { from: "r", to: "j" },
              ],
            });
          },
        },
      },
      {
        title: "Loop — 1ª passada",
        body:
          "<p>Com loops, uma <b>back-edge</b> faz a análise <b>recircular</b>. Na primeira passada, " +
          "<code>X := 4</code> entra no corpo; lá <code>X := Z + 3</code> usa <code>Z</code>, que ainda " +
          "é <b>⊤</b> (vindo do laço) → <code>X</code> vira <b>⊤</b> no corpo.</p>",
        visual: loopVisual({
          act: "b",
          h: ["X := 4 ; B > 0", "entra X = 4"],
          b: ["X := Z + 3", "Z := X + 6", "Z = ⊤ ⇒ X = ⊤"],
          o: ["saída"],
        }),
      },
      {
        title: "Loop — junção da back-edge → ponto fixo",
        body:
          "<p>A back-edge leva o valor do corpo (<code>X = ⊤</code>) de volta ao topo, onde há uma " +
          "<b>junção</b>: <code>X = 4 ⊔ ⊤ = ⊤</code>. Agora <code>X</code> é <b>⊤</b> também no topo; " +
          "repetir não muda mais nada → <b>ponto fixo</b>.</p>",
        visual: loopVisual({
          act: "h",
          h: ["junção: 4 ⊔ ⊤", "X = ⊤"],
          b: ["X := Z + 3", "Z := X + 6"],
          o: ["saída: X = ⊤"],
        }),
      },
      C.domStep(
        "Resumo",
        "Propagação de constantes é o exemplo canônico de análise de fluxo de dados.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Valores num <b>lattice</b> (⊥ &lt; constantes &lt; ⊤); propague pelo CFG; na <b>junção</b>, " +
          "valores divergentes <b>sobem</b> para <b>⊤</b>; com loops, <b>itere até o ponto fixo</b>.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c16-propagacao-constantes",
    num: "⊤",
    subject: "Compiladores",
    section: "Otimização",
    title: "Propagação de constantes",
    type: "conceitual",
    hubDesc: "Lattice ⊥<const<⊤ desenhado; junção de caminhos; iteração até o ponto fixo em loops (animada).",
    statement:
      "Entenda a propagação de constantes como análise de fluxo de dados: o lattice (⊥, constantes, ⊤), " +
      "a regra de junção nos pontos de encontro e a iteração até o ponto fixo em loops.",
    parts: [{ label: "Guia", build: build }],
  });
})();
