/*
 * q28.js — Por que atualizar as coordenadas só no final? (conceitual)
 *
 * Slides progressivos com um diagrama do segmento parametrizado: Liang-Barsky
 * restringe o intervalo [u1,u2] (não move os pontos); só ao final, se u1<=u2,
 * calcula P(u1) e P(u2). Texto conferido contra o gabarito (questão 28).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}

  // Segmento de exemplo (lado AB da Q31): A(-1,-3) -> B(-2,8), aceito em
  // u1=4/11, u2=9/11. Usamos as MESMAS frações exatas do ALG.
  var lb = ALG.liangBarsky({ x: -1, y: -3 }, { x: -2, y: 8 }, W);
  var P0 = lb.p0,
    P1 = lb.p1;
  var U1 = lb.u1,
    U2 = lb.u2;

  var BOUNDS = [-4, 10, -5, 10];

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

  // Segmento inteiro cinza com P0 (u=0) e P1 (u=1) rotulados.
  function drawSegment(plane) {
    plane.segment([P0.x.num(), P0.y.num()], [P1.x.num(), P1.y.num()], {
      color: "rgba(120,140,170,0.6)",
      lineWidth: 2,
    });
    plane.point(P0.x.num(), P0.y.num(), {
      color: COL.muted,
      radius: 5,
      label: "P₀  u=0",
      labelColor: COL.axisText,
      labelDy: 16,
    });
    plane.point(P1.x.num(), P1.y.num(), {
      color: COL.muted,
      radius: 5,
      label: "P₁  u=1",
      labelColor: COL.axisText,
      labelDy: -10,
    });
  }

  // Trecho visível [u1,u2] em verde, com marcas opcionais.
  function drawVisible(plane, mark) {
    var a = ptAt(U1),
      b = ptAt(U2);
    plane.segment([a.x, a.y], [b.x, b.y], { color: COL.green, lineWidth: 4 });
    if (mark) {
      plane.point(a.x, a.y, {
        color: COL.green,
        radius: 5,
        ring: "#0f1623",
        label: "P(u₁)=" + ALG.plabel({ x: a.fx, y: a.fy }),
        labelColor: COL.ink,
        labelDy: -10,
      });
      plane.point(b.x, b.y, {
        color: COL.green,
        radius: 5,
        ring: "#0f1623",
        label: "P(u₂)=" + ALG.plabel({ x: b.fx, y: b.fy }),
        labelColor: COL.ink,
        labelDy: 18,
      });
    }
  }

  window.GUI.register({
    id: 28,
    num: "28",
    section: "IV) Recorte — Liang-Barsky",
    title: "Por que atualizar as coordenadas só no final?",
    type: "conceitual",
    hubDesc: "O algoritmo restringe o intervalo [u₁,u₂]; os pontos só no fim.",
    enunciado:
      "No Liang-Barsky, a atualização dos valores das coordenadas inicial e final é feita apenas no final. Justifique.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "O segmento é descrito por um parâmetro u",
              explicacao:
                "<p>Liang-Barsky não trabalha diretamente com os pontos: representa todo o segmento pela forma <b>paramétrica</b>.</p>" +
                "<div class='formula'>P(u) = P₀ + u·(P₁ − P₀),   0 ≤ u ≤ 1</div>" +
                "<p>O parâmetro <span class='hl'>u</span> funciona como uma porcentagem do caminho: <span class='ok'>u = 0</span> é P₀ e <span class='ok'>u = 1</span> é P₁. Recortar passa a ser apenas <b>restringir esse intervalo</b>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                drawSegment(plane);
              },
            },
            {
              titulo: "Cada fronteira mexe em u₁ e u₂, não nos pontos",
              explicacao:
                "<p>Em vez de mover os extremos a cada fronteira (como faz Cohen-Sutherland), o algoritmo mantém apenas dois números: o intervalo visível <span class='hl'>[u₁, u₂]</span>.</p>" +
                "<p>Cada fronteira da janela gera uma desigualdade sobre <code>u</code> e <b>aperta</b> esse intervalo:</p>" +
                "<div class='formula'>entrada (p&lt;0):  u₁ = max(u₁, q/p)\nsaída   (p&gt;0):  u₂ = min(u₂, q/p)</div>" +
                "<p>As coordenadas originais <span class='muted'>(−1,−3)</span> e <span class='muted'>(−2,8)</span> permanecem intactas o tempo todo.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                drawSegment(plane);
                drawVisible(plane, false);
              },
            },
            {
              titulo: "Só no fim os pontos visíveis são calculados",
              explicacao:
                "<p>Terminadas as 4 fronteiras, testa-se uma única vez:</p>" +
                "<div class='formula'>se u₁ ≤ u₂  →  há trecho visível\nse u₁ &gt; u₂  →  segmento rejeitado</div>" +
                "<p>Aceito, os extremos recortados saem de uma substituição direta — <b>uma só vez</b>, no final:</p>" +
                "<div class='formula'>P(u₁) = P(" +
                U1.str() +
                ") = " +
                ALG.plabel({ x: ptAt(U1).fx, y: ptAt(U1).fy }) +
                "\nP(u₂) = P(" +
                U2.str() +
                ") = " +
                ALG.plabel({ x: ptAt(U2).fx, y: ptAt(U2).fy }) +
                "</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                drawSegment(plane);
                drawVisible(plane, true);
              },
            },
            {
              titulo: "Por que isso é vantajoso",
              explicacao:
                "<p>Atualizar só <code>u₁</code> e <code>u₂</code> evita recalcular interseções intermediárias que poderiam ser descartadas depois.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ Não move pontos a cada fronteira: só dois números mudam.</div>" +
                "<div class='pro'>+ Detecta a rejeição (u₁ &gt; u₂) sem nunca calcular um ponto.</div>" +
                "<div class='pro'>+ As coordenadas originais da cena ficam preservadas.</div>" +
                "<div class='con'>− Exige a forma paramétrica e o cálculo de p e q por fronteira.</div>" +
                "</div>" +
                "<p class='muted'>Resumo: o trabalho com pontos acontece uma única vez, no final, e apenas se o segmento for aceito.</p>",
            },
          ];
        },
      },
    ],
  });
})();
