/*
 * q12.js — Curvas Paramétricas.
 * "Dados os pontos de controle, defina x(u) e y(u) para a curva Interpolada."
 * Pontos (lidos da figura): p0(1,2), p1(3,4), p2(4,2), p3(7,5).
 * Método: [x(u) y(u)] = U · M_I · G, com nós em u = 0, ⅓, ⅔, 1.
 * Resultado: x(u)=13,5u³−18u²+10,5u+1 ; y(u)=40,5u³−58,5u²+21u+2.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var P = [[1, 2], [3, 4], [4, 2], [7, 5]];        // p0..p3
  var GX = P.map(function (p) { return p[0]; });   // [1,3,4,7]
  var GY = P.map(function (p) { return p[1]; });   // [2,4,2,5]

  // Matriz da curva interpolada (nós 0, 1/3, 2/3, 1).
  var MI = [[-4.5, 13.5, -13.5, 4.5], [9, -22.5, 18, -4.5], [-5.5, 9, -4.5, 1], [1, 0, 0, 0]];
  function mul(M, g) { return M.map(function (r) { return r[0] * g[0] + r[1] * g[1] + r[2] * g[2] + r[3] * g[3]; }); }
  var CX = mul(MI, GX);   // [13.5, -18, 10.5, 1]
  var CY = mul(MI, GY);   // [40.5, -58.5, 21, 2]
  function cubic(c, u) { return ((c[0] * u + c[1]) * u + c[2]) * u + c[3]; }
  function fmt(n) { return (Math.round(n * 100) / 100).toString().replace(".", ","); }

  var BOUNDS = [-1, 8, 0, 6];

  function draw(plane, showCurve) {
    // polígono de controle
    plane.polyline(P, { stroke: COL.muted, lineWidth: 1.5, dashed: true });
    if (showCurve) {
      var pts = [];
      for (var u = 0; u <= 1.0001; u += 0.02) pts.push([cubic(CX, u), cubic(CY, u)]);
      plane.polyline(pts, { stroke: COL.accent, lineWidth: 3 });
      // marcadores nos nós u = 0, 1/3, 2/3, 1
      [0, 1 / 3, 2 / 3, 1].forEach(function (u) {
        plane.point(cubic(CX, u), cubic(CY, u), { color: COL.green, radius: 4 });
      });
    }
    var names = ["p₀", "p₁", "p₂", "p₃"];
    P.forEach(function (p, i) {
      plane.point(p[0], p[1], { color: showCurve ? COL.yellow : COL.accent, radius: 5, label: names[i] + "(" + p[0] + "," + p[1] + ")", labelColor: COL.ink });
    });
  }

  function xLine(c) {
    return "<div class='formula'>" +
      "u³: −4,5(" + GX[0] + ")+13,5(" + GX[1] + ")−13,5(" + GX[2] + ")+4,5(" + GX[3] + ") = " + fmt(c[0]) + "\n" +
      "u²: 9(" + GX[0] + ")−22,5(" + GX[1] + ")+18(" + GX[2] + ")−4,5(" + GX[3] + ") = " + fmt(c[1]) + "\n" +
      "u¹: −5,5(" + GX[0] + ")+9(" + GX[1] + ")−4,5(" + GX[2] + ")+1(" + GX[3] + ") = " + fmt(c[2]) + "\n" +
      "u⁰: 1(" + GX[0] + ") = " + fmt(c[3]) + "</div>";
  }
  function yLine(c) {
    return "<div class='formula'>" +
      "u³: −4,5(" + GY[0] + ")+13,5(" + GY[1] + ")−13,5(" + GY[2] + ")+4,5(" + GY[3] + ") = " + fmt(c[0]) + "\n" +
      "u²: 9(" + GY[0] + ")−22,5(" + GY[1] + ")+18(" + GY[2] + ")−4,5(" + GY[3] + ") = " + fmt(c[1]) + "\n" +
      "u¹: −5,5(" + GY[0] + ")+9(" + GY[1] + ")−4,5(" + GY[2] + ")+1(" + GY[3] + ") = " + fmt(c[2]) + "\n" +
      "u⁰: 1(" + GY[0] + ") = " + fmt(c[3]) + "</div>";
  }
  var XU = "x(u) = " + fmt(CX[0]) + "u³ − " + fmt(-CX[1]) + "u² + " + fmt(CX[2]) + "u + " + fmt(CX[3]);
  var YU = "y(u) = " + fmt(CY[0]) + "u³ − " + fmt(-CY[1]) + "u² + " + fmt(CY[2]) + "u + " + fmt(CY[3]);

  function build() {
    return [
      {
        title: "Pontos de controle e o método",
        body:
          "<p>Pontos lidos da figura: <span class='accent'>p₀(1,2)</span>, <span class='accent'>p₁(3,4)</span>, " +
          "<span class='accent'>p₂(4,2)</span>, <span class='accent'>p₃(7,5)</span>.</p>" +
          "<p>A curva <b>interpolada</b> passa por todos eles em <code>u = 0, ⅓, ⅔, 1</code>. Usamos " +
          "<code>[x(u) y(u)] = U · M<sub>I</sub> · G</code>, com a matriz M<sub>I</sub> da Q11. " +
          "Basta multiplicar M<sub>I</sub> pelas coordenadas.</p>",
        visual: { type: "plane", bounds: BOUNDS, draw: function (p) { draw(p, false); } },
      },
      {
        title: "Coeficientes de x(u)",
        body:
          "<p>Multiplicando M<sub>I</sub> pelas abscissas <code>[1, 3, 4, 7]</code>:</p>" + xLine(CX) +
          "<p>Logo <span class='ok'>" + XU + "</span>.</p>",
        visual: { type: "plane", bounds: BOUNDS, draw: function (p) { draw(p, false); } },
      },
      {
        title: "Coeficientes de y(u)",
        body:
          "<p>Multiplicando M<sub>I</sub> pelas ordenadas <code>[2, 4, 2, 5]</code>:</p>" + yLine(CY) +
          "<p>Logo <span class='ok'>" + YU + "</span>.</p>",
        visual: { type: "plane", bounds: BOUNDS, draw: function (p) { draw(p, false); } },
      },
      {
        title: "A curva",
        body:
          "<p>Amostrando <code>(x(u), y(u))</code> para <code>u ∈ [0,1]</code> obtemos a curva (azul). " +
          "Os marcadores <span style='color:var(--green)'>verdes</span> em <code>u = 0, ⅓, ⅔, 1</code> caem " +
          "exatamente sobre <b>p₀, p₁, p₂, p₃</b> — confirmando que ela <b>interpola</b> os pontos.</p>",
        visual: { type: "plane", bounds: BOUNDS, draw: function (p) { draw(p, true); } },
      },
      {
        title: "Resposta e verificação",
        body:
          "<p><b>" + XU + "</b><br><b>" + YU + "</b></p>" +
          "<p>Verificação em <code>u = ⅓</code>: x = " + fmt(cubic(CX, 1 / 3)) + ", y = " + fmt(cubic(CY, 1 / 3)) +
          " → <span class='ok'>(3, 4) = p₁</span> ✓. Em <code>u = ⅔</code>: (" + fmt(cubic(CX, 2 / 3)) + ", " + fmt(cubic(CY, 2 / 3)) +
          ") = <span class='ok'>p₂</span> ✓.</p>",
        visual: { type: "plane", bounds: BOUNDS, draw: function (p) { draw(p, true); } },
      },
    ];
  }

  EX.registry.add({
    id: "q12",
    num: "12",
    subject: "Curvas Paramétricas",
    title: "x(u) e y(u) da curva interpolada",
    type: "computacional",
    hubDesc: "p0(1,2) p1(3,4) p2(4,2) p3(7,5) → x(u)=13,5u³−18u²+10,5u+1; y(u)=40,5u³−58,5u²+21u+2.",
    statement: "Dados os pontos de controle p0(1,2), p1(3,4), p2(4,2), p3(7,5), defina x(u) e y(u) para a curva Interpolada.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
