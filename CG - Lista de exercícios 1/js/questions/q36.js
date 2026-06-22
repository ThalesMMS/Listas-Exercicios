/*
 * q36.js — Problemas no uso de conectividade 4 e 8 (conceitual).
 *
 * Slides com diagramas: stencil dos vizinhos (4 e 8) e dois casos-problema
 * (região conectada só diagonalmente; vazamento por canto diagonal).
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;

  // Vizinhanças.
  var N4 = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  var N8 = N4.concat([
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]);

  // Desenha o pixel central (cx,cy) e os vizinhos do stencil.
  function drawStencil(plane, cx, cy, nbrs) {
    plane.pixel(cx, cy, {
      fill: COL.accentSoft,
      stroke: COL.accent,
      lineWidth: 2,
      label: "P",
      labelColor: COL.ink,
    });
    nbrs.forEach(function (d) {
      var diag = d[0] !== 0 && d[1] !== 0;
      plane.pixel(cx + d[0], cy + d[1], {
        fill: diag ? "rgba(255,159,67,0.22)" : COL.greenSoft,
        stroke: diag ? COL.orange : COL.green,
        lineWidth: 2,
      });
    });
  }

  var STENCIL_BOUNDS = [-2, 3, -2, 3];

  window.GUI.register({
    id: 36,
    num: "36",
    section: "V) Preenchimento de Áreas",
    title: "Problemas de conectividade 4 e 8",
    type: "conceitual",
    hubDesc: "Conn-4 não atravessa diagonais; conn-8 vaza por cantos.",
    enunciado:
      "Quais são os possíveis problemas no uso de conectividade 4 e 8?",
    parts: [
      {
        label: "Explicação",
        build: function (plane) {
          return [
            {
              titulo: "O que é conectividade",
              explicacao:
                "<p>A <b>conectividade</b> define quais pixels são considerados " +
                "<span class='hl'>vizinhos</span> durante o preenchimento por semente " +
                "(Boundary/Flood Fill). É ela que decide até onde a tinta se propaga.</p>" +
                "<p>Na <b>conectividade 4</b>, só contam vizinhos <span class='ok'>horizontais e " +
                "verticais</span>. Na <b>conectividade 8</b>, as <span class='no'>diagonais</span> " +
                "também contam. Essa diferença muda o alcance e pode <i>resolver</i> ou <i>causar</i> " +
                "vazamentos em cantos.</p>",
            },
            {
              titulo: "Stencil — conectividade 4",
              explicacao:
                "<p>O pixel central <span class='hl'>P</span> alcança apenas 4 vizinhos:</p>" +
                "<div class='formula'>cima, baixo, esquerda, direita</div>" +
                "<p>No diagrama, P está em azul e os 4 vizinhos válidos em " +
                "<span class='ok'>verde</span>. As diagonais <b>não</b> são vizinhas.</p>",
              bounds: STENCIL_BOUNDS,
              draw: function (plane) {
                drawStencil(plane, 0, 0, N4);
                plane.text(0, -1.7, "4 vizinhos (sem diagonais)", {
                  align: "center",
                  color: COL.green,
                  font: "12px ui-sans-serif, system-ui",
                });
              },
            },
            {
              titulo: "Stencil — conectividade 8",
              explicacao:
                "<p>O pixel central <span class='hl'>P</span> alcança os 8 vizinhos ao redor:</p>" +
                "<div class='formula'>os 4 ortogonais + as 4 diagonais</div>" +
                "<p>Os vizinhos ortogonais aparecem em <span class='ok'>verde</span> e as " +
                "<span class='no'>diagonais</span> em laranja. São justamente essas diagonais que " +
                "ampliam o alcance — e o risco de vazamento.</p>",
              bounds: STENCIL_BOUNDS,
              draw: function (plane) {
                drawStencil(plane, 0, 0, N8);
                plane.text(0, -1.7, "8 vizinhos (com diagonais)", {
                  align: "center",
                  color: COL.orange,
                  font: "12px ui-sans-serif, system-ui",
                });
              },
            },
            {
              titulo: "Problema da conectividade 4",
              explicacao:
                "<p>Quando a região alvo se conecta <span class='hl'>apenas pela diagonal</span>, a " +
                "conectividade 4 <b>não atravessa</b> a passagem e deixa pixels sem preenchimento.</p>" +
                "<div class='proscons'>" +
                "<div class='con'>− Pode não atravessar regiões conectadas apenas diagonalmente.</div>" +
                "<div class='con'>− Pode deixar pixels diagonais sem preenchimento.</div>" +
                "</div>" +
                "<p>No diagrama: a semente <span class='ok'>(0,0)</span> preenche a célula inicial, " +
                "mas a célula <span class='no'>(1,1)</span> só toca essa região pela diagonal — por " +
                "conn-4 ela fica <b>de fora</b>.</p>",
              bounds: [-2, 4, -2, 4],
              draw: function (plane) {
                // Região alcançada por conn-4 a partir de (0,0).
                plane.pixel(0, 0, { fill: COL.greenSoft, stroke: COL.green, lineWidth: 2 });
                plane.point(0, 0, { color: COL.green, radius: 4, label: "semente", labelColor: COL.ink });
                // Célula conectada só pela diagonal — não alcançada.
                plane.pixel(1, 1, { fill: "transparent", stroke: COL.red, lineWidth: 2 });
                plane.text(1, 1.0, "?", { align: "center", color: COL.red, font: "bold 16px ui-monospace, monospace", dy: 5 });
                plane.text(1, 2.3, "só toca na diagonal → fica vazio", {
                  align: "center",
                  color: COL.red,
                  font: "12px ui-sans-serif, system-ui",
                });
              },
            },
            {
              titulo: "Problema da conectividade 8",
              explicacao:
                "<p>Por incluir as diagonais, a conectividade 8 pode <span class='no'>escapar por " +
                "um canto</span>: a tinta passa entre dois pixels de borda que se tocam apenas pela " +
                "diagonal, vazando para fora da figura.</p>" +
                "<div class='proscons'>" +
                "<div class='con'>− Pode vazar por cantos diagonais.</div>" +
                "<div class='con'>− Pode ultrapassar uma borda que esteja fechada apenas em conectividade 4.</div>" +
                "</div>" +
                "<p>No diagrama, a borda <span class='muted'>preta</span> fecha o canto só na " +
                "diagonal; por conn-8 a tinta <span class='no'>vaza</span> pela fresta diagonal " +
                "para o pixel externo.</p>",
              bounds: [-2, 5, -2, 5],
              draw: function (plane) {
                // Borda em "L" que fecha o canto apenas diagonalmente.
                [
                  [2, 1],
                  [3, 1],
                  [3, 2],
                  [1, 2],
                  [1, 3],
                  [2, 3],
                ].forEach(function (b) {
                  plane.pixel(b[0], b[1], { fill: "#10151f", stroke: COL.ink, lineWidth: 2 });
                });
                // Interior + semente.
                plane.pixel(2, 2, { fill: COL.greenSoft, stroke: COL.green, lineWidth: 2 });
                plane.point(2, 2, { color: COL.green, radius: 4, label: "semente", labelColor: COL.ink });
                // Pixel externo invadido pelo vazamento diagonal.
                plane.pixel(3, 3, { fill: COL.redSoft, stroke: COL.red, lineWidth: 2 });
                // Seta diagonal indicando a fresta.
                plane.segment([2.4, 2.4], [2.9, 2.9], { color: COL.red, lineWidth: 2, dashed: true });
                plane.text(3, 4.0, "vazou pelo canto diagonal!", {
                  align: "center",
                  color: COL.red,
                  font: "12px ui-sans-serif, system-ui",
                });
              },
            },
            {
              titulo: "Conclusão",
              explicacao:
                "<p>Em geral, deve-se escolher a conectividade do <b>preenchimento</b> de forma " +
                "<span class='hl'>compatível com a conectividade da borda</span>.</p>" +
                "<table class='q-table'>" +
                "<tr><th>Conectividade</th><th>Risco principal</th></tr>" +
                "<tr><td>4 (ortogonal)</td><td>não atravessa ligações diagonais → deixa buracos</td></tr>" +
                "<tr><td>8 (com diagonais)</td><td>vaza por cantos / fura bordas fechadas só em 4</td></tr>" +
                "</table>" +
                "<p class='muted'>Regra prática: se a borda foi traçada com conectividade 8, " +
                "preencha com conectividade 4 (e vice-versa) para evitar vazamentos.</p>",
            },
          ];
        },
      },
    ],
  });
})();
