/*
 * q13.js — Superfícies Implícitas.
 * "Quais são as vantagens no uso de superfícies implícitas para modelagem 3D?"
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  // Isocurva f(x,y)=x²+y²−9=0 (círculo r=3), com o interior (f<0) sombreado.
  function implicit(plane) {
    var ctx = plane.ctx, st = 3;
    for (var sy = 0; sy < plane.cssH; sy += st) for (var sx = 0; sx < plane.cssW; sx += st) {
      var x = plane.xmin + (sx - plane.offsetX) / plane.scale;
      var y = plane.ymax - (sy - plane.offsetY) / plane.scale;
      if (x * x + y * y - 9 < 0) { ctx.fillStyle = COL.accentSoft; ctx.fillRect(sx, sy, st, st); }
    }
    ctx.beginPath();
    ctx.arc(plane.cx(0), plane.cy(0), 3 * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = COL.accent; ctx.lineWidth = 2.5; ctx.stroke();
    plane.text(0, 0, "f < 0 (dentro)", { color: COL.accent, align: "center" });
    plane.text(3.1, 2.4, "f = 0", { color: COL.accent });
    plane.text(3.4, -3.2, "f > 0 (fora)", { color: COL.muted });
  }

  var B = [-5, 5, -4, 4];

  function build() {
    return [
      {
        title: "O que é uma superfície implícita",
        body:
          "<p>É o conjunto de pontos que <b>zeram uma função</b>: <code>S = { p : f(p) = 0 }</code>. " +
          "Ao lado, <code>f(x,y) = x² + y² − 9</code> define um círculo (em 3D, <code>x²+y²+z²−r²</code> é uma esfera).</p>" +
          "<p>O sinal de <b>f</b> já diz tudo: <span class='accent'>f &lt; 0</span> dentro, <span class='muted'>f &gt; 0</span> fora, " +
          "<b>f = 0</b> na superfície.</p>",
        visual: { type: "plane", bounds: B, draw: implicit },
      },
      {
        title: "Vantagens",
        body:
          "<ul>" +
          "<li><b>Teste dentro/fora trivial</b> — basta avaliar o sinal de f (ótimo para colisão);</li>" +
          "<li><b>Booleanas (CSG) fáceis</b> — união/interseção/diferença viram <code>min</code>/<code>max</code> de funções;</li>" +
          "<li><b>Blending suave</b> — somar campos funde formas organicamente (Q15);</li>" +
          "<li><b>Topologia flexível</b> — partes se juntam/separam sem \"remalhar\";</li>" +
          "<li><b>Compactas</b> — guardam-se parâmetros da função, não milhões de vértices;</li>" +
          "<li><b>Ray-marching/SDF</b> — renderização e offset diretos a partir de f.</li>" +
          "</ul>",
        visual: { type: "plane", bounds: B, draw: implicit },
      },
      EX.Slides.comparison({
        title: "Implícita × explícita/malha",
        intro: "<p>Por que escolher a forma implícita:</p>",
        headers: ["", "Implícita f(p)=0", "Malha/paramétrica"],
        rows: [
          ["Dentro/fora", "sinal de f (imediato)", "teste geométrico custoso"],
          ["Booleanas", "min/max de funções", "recortar e costurar malhas"],
          ["Blending", "soma de campos (suave)", "difícil"],
          ["Mudança de topologia", "natural", "exige reconstruir a malha"],
          ["Renderizar na GPU", "precisa extrair superfície", "direto"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q13",
    num: "13",
    subject: "Superfícies Implícitas",
    title: "Vantagens das superfícies implícitas",
    type: "conceitual",
    hubDesc: "Dentro/fora trivial, CSG por min/max, blending suave, topologia flexível.",
    statement: "Quais são as vantagens no uso de superfícies implícitas para modelagem tridimensional?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
