/*
 * c04-recursao-esquerda.js — Guia: Remoção de recursão à esquerda (direta e indireta).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      C.domStep(
        "Por que recursão à esquerda quebra o LL",
        "Um parser top-down expande o não-terminal pela esquerda. Com <code>A → A α</code>, para " +
          "expandir <code>A</code> ele precisa primeiro expandir <code>A</code>… que precisa de " +
          "<code>A</code>… — <b>laço infinito</b>, sem consumir nenhum símbolo.",
        C.codeHtml("A → A α | β        (recursiva à esquerda)\nA ⇒ A α ⇒ A α α ⇒ A α α α ⇒ …   (nunca para)")
      ),
      {
        title: "Recursão direta: a transformação",
        body:
          "<p>Trocamos “repetir <code>α</code> à esquerda” por “começar com <code>β</code> e repetir " +
          "<code>α</code> à <b>direita</b>”, com um não-terminal auxiliar <code>A′</code>:</p>" +
          "<p class='formula'>A → A α | β   ⟹   A → β A′ ,   A′ → α A′ | λ</p>" +
          "<p>Gera a mesma linguagem (<code>β α α … α</code>), mas agora é <b>recursiva à direita</b> — " +
          "e o LL consegue.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 200);
            C.box(svg, 40, 70, 230, 58, ["A → A α | β"], { fill: "var(--red-soft)", stroke: "var(--red)" });
            svg.arrow(278, 99, 364, 99, { color: "var(--accent)", strokeWidth: 3, head: 11 });
            C.box(svg, 372, 38, 290, 50, ["A → β A′"], { fill: "var(--green-soft)", stroke: "var(--green)" });
            C.box(svg, 372, 110, 290, 50, ["A′ → α A′ | λ"], { fill: "var(--green-soft)", stroke: "var(--green)" });
          },
        },
      },
      G.gstep(
        "Exemplo — recursão direta",
        "Cada não-terminal abaixo é recursivo à esquerda (<code>S→S a S</code>, <code>U→U u U</code>, " +
          "<code>T→T n</code>). Aplicando a transformação a cada um:",
        [
          "ANTES:                       DEPOIS:",
          "S → S a S | U                S  → U S′      S′ → a S S′ | λ",
          "U → U u U | T                U  → T U′      U′ → u U U′ | λ",
          "T → t | f | T n | (S)        T  → t T′ | f T′ | (S) T′   T′ → n T′ | λ",
        ]
      ),
      G.gstep(
        "Recursão indireta",
        "Às vezes a recursão é um <b>ciclo</b>: <code>A ⇒ B ⇒ C ⇒ A</code>. Não há <code>A → A…</code> " +
          "explícito, mas existe um caminho que volta a <code>A</code> pela esquerda. A estratégia: " +
          "<b>substituir</b> não-terminais até a recursão virar <b>direta</b>, e então eliminá-la.",
        [
          "A → B ! | x",
          "B → C",
          "C → A ? | y",
          "   ( A ⇒ B! ⇒ C! ⇒ A?!  — recursão indireta à esquerda )",
        ]
      ),
      {
        title: "A recursão indireta é um ciclo",
        body:
          "<p>Seguindo o <b>primeiro símbolo</b> de cada produção, há um caminho que sai de " +
          "<code>A</code> e <b>volta</b> a <code>A</code> pela esquerda: <code>A → B → C → A</code>. " +
          "Esse <b>ciclo</b> no grafo de dependências é a recursão indireta.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            EX.Diagram.graph(svg, {
              nodes: [
                { id: "A", x: 300, y: 80 },
                { id: "B", x: 470, y: 300 },
                { id: "C", x: 130, y: 300 },
              ],
              edges: [
                { from: "A", to: "B", directed: true, label: "B !" },
                { from: "B", to: "C", directed: true, label: "C" },
                { from: "C", to: "A", directed: true, label: "A ?" },
              ],
            }, { view: [600, 380] });
          },
        },
      },
      G.gstep(
        "Indireta — passo a passo",
        "Substituindo <code>B</code> e depois <code>C</code> dentro de <code>A</code>, a recursão fica " +
          "direta; aí aplicamos a regra do passo 2:",
        [
          "1) B → C em A:        A → C ! | x",
          "2) C → A? | y em A:   A → A ? ! | y ! | x        (já é direta)",
          "3) eliminar direta:   A → y ! A′ | x A′",
          "                      A′ → ? ! A′ | λ",
        ]
      ),
      C.domStep(
        "Armadilhas e resumo",
        "Recursão à esquerda e prefixos comuns são os dois obstáculos a uma gramática LL(1).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Roteiro</div>" +
          "<ul><li><b>Direta</b>: <code>A → Aα | β ⟹ A → βA′, A′ → αA′ | λ</code>;</li>" +
          "<li><b>Indireta</b>: ordene os não-terminais e <b>substitua</b> até virar direta, então " +
          "elimine;</li>" +
          "<li>depois costuma ser preciso <b>fatorar à esquerda</b> também.</li></ul></div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c04-recursao-esquerda",
    num: "Rec",
    subject: "Compiladores",
    section: "Gramáticas",
    title: "Remoção de recursão à esquerda",
    type: "computacional",
    hubDesc: "Direta (A→Aα|β ⇒ A→βA′, A′→αA′|λ) e indireta (substituir até virar direta).",
    statement:
      "Entenda a remoção de recursão à esquerda, direta e indireta: por que ela trava o parser " +
      "top-down e como transformá-la em recursão à direita equivalente.",
    parts: [{ label: "Guia", build: build }],
  });
})();
