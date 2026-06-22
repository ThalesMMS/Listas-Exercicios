/*
 * q29.js — Por que as condicionais do Liang-Barsky são aninhadas? (conceitual)
 *
 * Slides: a ação depende PRIMEIRO do sinal de p (p=0 paralelo; p<0 entrada;
 * p>0 saída); só então faz sentido calcular/usar q/p. O aninhamento evita
 * divisões indevidas e atualiza u1/u2 corretamente. Texto conferido contra o
 * gabarito (questão 29). Inclui uma árvore de decisão em bloco de fórmula.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}

  var BOUNDS = [-4, 10, -5, 10];

  // Árvore de decisão reutilizada nos passos (texto mono, quebras preservadas).
  var TREE =
    "para cada fronteira (p, q):\n" +
    "├─ se p == 0  (paralelo à fronteira)\n" +
    "│   ├─ se q < 0  → segmento totalmente FORA → rejeita\n" +
    "│   └─ se q ≥ 0  → paralelo dentro → ignora (não divide!)\n" +
    "└─ senão (p ≠ 0)  → calcula r = q/p\n" +
    "    ├─ se p < 0  (ENTRADA)  → u₁ = max(u₁, r)\n" +
    "    └─ se p > 0  (SAÍDA)    → u₂ = min(u₂, r)";

  // Diagrama: segmento entrando/saindo da janela, com setas de entrada/saída.
  // Usa o lado BC da Q31 (B(-2,8)->C(9,2)), que atravessa a janela.
  var lb = ALG.liangBarsky({ x: -2, y: 8 }, { x: 9, y: 2 }, W);
  var P0 = lb.p0,
    P1 = lb.p1;

  function ptAt(u) {
    var x = P0.x.add(u.mul(P1.x.sub(P0.x)));
    var y = P0.y.add(u.mul(P1.y.sub(P0.y)));
    return { fx: x, fy: y, x: x.num(), y: y.num() };
  }

  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  // Desenha o segmento e destaca o ponto de ENTRADA (verde) e SAÍDA (laranja).
  function drawCrossing(plane) {
    drawWindow(plane);
    plane.segment([P0.x.num(), P0.y.num()], [P1.x.num(), P1.y.num()], {
      color: "rgba(120,140,170,0.55)",
      lineWidth: 2,
    });
    plane.point(P0.x.num(), P0.y.num(), { color: COL.muted, radius: 4, label: "P₀", labelColor: COL.axisText });
    plane.point(P1.x.num(), P1.y.num(), { color: COL.muted, radius: 4, label: "P₁", labelColor: COL.axisText });
    var inP = ptAt(lb.u1),
      outP = ptAt(lb.u2);
    // trecho visível
    plane.segment([inP.x, inP.y], [outP.x, outP.y], { color: COL.green, lineWidth: 4 });
    plane.point(inP.x, inP.y, {
      color: COL.green,
      radius: 5,
      ring: "#0f1623",
      label: "ENTRADA  p<0 → u₁",
      labelColor: COL.green,
      labelDy: -10,
    });
    plane.point(outP.x, outP.y, {
      color: COL.orange,
      radius: 5,
      ring: "#0f1623",
      label: "SAÍDA  p>0 → u₂",
      labelColor: COL.orange,
      labelDy: 18,
    });
  }

  window.GUI.register({
    id: 29,
    num: "29",
    section: "IV) Recorte — Liang-Barsky",
    title: "Por que as condicionais são aninhadas?",
    type: "conceitual",
    hubDesc: "O sinal de p decide o caso antes de calcular q/p (evita dividir por 0).",
    enunciado:
      "Explique o porquê de as estruturas condicionais do algoritmo de Liang-Barsky serem aninhadas.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Cada fronteira vira uma desigualdade em u",
              explicacao:
                "<p>Para cada fronteira da janela, o algoritmo monta dois valores:</p>" +
                "<div class='formula'>p · u ≤ q</div>" +
                "<p>O <b>sinal de p</b> diz a natureza geométrica da fronteira para aquele segmento, e o quociente <code>q/p</code> dá o valor de <code>u</code> onde a reta a cruza. Mas a interpretação de <code>q/p</code> só existe depois de conhecer o sinal de <code>p</code>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawCrossing(plane);
              },
            },
            {
              titulo: "Primeiro o sinal de p, depois q/p",
              explicacao:
                "<p>A ação depende <b>primeiro</b> do valor de <code>p</code>:</p>" +
                "<div class='formula'>p = 0  →  a reta é PARALELA à fronteira\np &lt; 0  →  a fronteira é de ENTRADA (atualiza u₁)\np &gt; 0  →  a fronteira é de SAÍDA   (atualiza u₂)</div>" +
                "<p>Só <b>depois</b> disso faz sentido calcular ou usar <span class='hl'>q/p</span>. Por isso as condicionais são <b>aninhadas</b>: o teste interno (entrada/saída, com q/p) fica dentro do teste externo (sinal de p).</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawCrossing(plane);
              },
            },
            {
              titulo: "A árvore de decisão",
              explicacao:
                "<p>O aninhamento, em forma de árvore:</p>" +
                "<div class='formula'>" +
                TREE +
                "</div>" +
                "<p>O ramo <span class='hl'>p == 0</span> é tratado antes de qualquer divisão: se a reta é paralela à fronteira, não há interseção e <b>q/p nunca é calculado</b>.</p>",
            },
            {
              titulo: "Por que aninhar (e não usar ifs soltos)",
              explicacao:
                "<p>Se as condições fossem independentes, o algoritmo poderia tentar <code>q/p</code> com <code>p = 0</code> — uma <span class='no'>divisão por zero</span>.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ Evita divisões indevidas: q/p só é avaliado quando p ≠ 0.</div>" +
                "<div class='pro'>+ Separa o caso paralelo (aceita/rejeita sem cortar) dos demais.</div>" +
                "<div class='pro'>+ Garante u₁ (entrada, p&lt;0) e u₂ (saída, p&gt;0) atualizados no ramo certo.</div>" +
                "<div class='con'>− Exige seguir a ordem lógica: caso geométrico primeiro, cálculo depois.</div>" +
                "</div>" +
                "<p class='muted'>Resumo: primeiro decide-se o caso geométrico (sinal de p); só então, se válido, calcula-se e aplica-se q/p.</p>",
            },
          ];
        },
      },
    ],
  });
})();
