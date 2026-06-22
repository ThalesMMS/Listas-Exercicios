/*
 * cg-cohen-sutherland.js — Computação Gráfica / Recorte (clipping).
 * Recorte de segmentos pela janela retangular usando o algoritmo de
 * Cohen-Sutherland (region codes). Visual: canvas com a janela, o triângulo
 * esmaecido e o recorte de cada aresta passo a passo.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var Fr = EX.util.Fr;

  // Janela de recorte e bits dos region codes.
  var WIN = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var L = 1,
    R = 2,
    B = 4,
    T = 8;

  // Triângulo de teste.
  var A = [-1, -3],
    Bp = [-2, 8],
    C = [9, 2];

  // outCode(x, y, win): bitmask L=1, R=2, B=4, T=8 da posição relativa à janela.
  function outCode(x, y, win) {
    var c = 0;
    if (x < win.xmin) c |= L;
    else if (x > win.xmax) c |= R;
    if (y < win.ymin) c |= B;
    else if (y > win.ymax) c |= T;
    return c;
  }

  // Nomes dos bits (para narração).
  function codeName(c) {
    var s = [];
    if (c & T) s.push("CIMA");
    if (c & B) s.push("BAIXO");
    if (c & R) s.push("DIR");
    if (c & L) s.push("ESQ");
    return s.length ? s.join("+") : "DENTRO";
  }

  // Interseção EXATA (frações) do segmento (x0,y0)-(x1,y1) com a fronteira do
  // bit `bit`. Retorna { x: Fr, y: Fr } usando aritmética racional.
  function intersectFr(x0, y0, x1, y1, bit) {
    var fx0 = new Fr(x0),
      fy0 = new Fr(y0),
      fx1 = new Fr(x1),
      fy1 = new Fr(y1);
    var dx = fx1.sub(fx0),
      dy = fy1.sub(fy0);
    if (bit & T) {
      // y = ymax
      var t = new Fr(WIN.ymax).sub(fy0).div(dy);
      return { x: fx0.add(dx.mul(t)), y: new Fr(WIN.ymax) };
    }
    if (bit & B) {
      // y = ymin
      var tb = new Fr(WIN.ymin).sub(fy0).div(dy);
      return { x: fx0.add(dx.mul(tb)), y: new Fr(WIN.ymin) };
    }
    if (bit & R) {
      // x = xmax
      var tr = new Fr(WIN.xmax).sub(fx0).div(dx);
      return { x: new Fr(WIN.xmax), y: fy0.add(dy.mul(tr)) };
    }
    // x = xmin (L)
    var tl = new Fr(WIN.xmin).sub(fx0).div(dx);
    return { x: new Fr(WIN.xmin), y: fy0.add(dy.mul(tl)) };
  }

  // Executa Cohen-Sutherland registrando os passos para a narração.
  // Retorna { accepted, rejected, trace:[{x0,y0,x1,y1,c0,c1, clip?}], result }.
  function clipTrace(p0, p1) {
    var x0 = p0[0],
      y0 = p0[1],
      x1 = p1[0],
      y1 = p1[1];
    var c0 = outCode(x0, y0, WIN),
      c1 = outCode(x1, y1, WIN);
    var trace = [];
    var guard = 0;
    while (guard++ < 20) {
      if (!(c0 | c1)) {
        trace.push({ x0: x0, y0: y0, x1: x1, y1: y1, c0: c0, c1: c1, action: "accept" });
        return { accepted: true, rejected: false, trace: trace, result: [[x0, y0], [x1, y1]] };
      }
      if (c0 & c1) {
        trace.push({ x0: x0, y0: y0, x1: x1, y1: y1, c0: c0, c1: c1, action: "reject" });
        return { accepted: false, rejected: true, trace: trace, result: null };
      }
      var cOut = c0 ? c0 : c1;
      var pt = intersectFr(x0, y0, x1, y1, cOut);
      var nx = pt.x.num(),
        ny = pt.y.num();
      trace.push({
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        c0: c0,
        c1: c1,
        action: "clip",
        outCode: cOut,
        outIsStart: !!c0,
        fr: pt,
        nx: nx,
        ny: ny,
      });
      if (c0) {
        x0 = nx;
        y0 = ny;
        c0 = outCode(x0, y0, WIN);
      } else {
        x1 = nx;
        y1 = ny;
        c1 = outCode(x1, y1, WIN);
      }
    }
    return { accepted: false, rejected: true, trace: trace, result: null };
  }

  // Coords absolutas para os bounds (cabe a janela + o triângulo todo).
  var BOUNDS = [-4, 11, -5, 10];

  // Desenha o cenário fixo: janela + triângulo esmaecido.
  function scene(plane, p0, p1, labelA, labelB) {
    plane.window(WIN.xmin, WIN.xmax, WIN.ymin, WIN.ymax, {
      fill: COL.accentSoft,
      stroke: COL.accent,
    });
    plane.text(WIN.xmin, WIN.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
    // triângulo inteiro esmaecido
    plane.polygon([A, Bp, C], { stroke: COL.muted, dashed: true, fill: false });
    plane.point(A[0], A[1], { color: COL.muted, radius: 3, label: "A(-1,-3)" });
    plane.point(Bp[0], Bp[1], { color: COL.muted, radius: 3, label: "B(-2,8)" });
    plane.point(C[0], C[1], { color: COL.muted, radius: 3, label: "C(9,2)" });
    // aresta em foco
    plane.segment(p0, p1, { color: COL.yellow, lineWidth: 2 });
    plane.point(p0[0], p0[1], { color: COL.yellow, radius: 4, label: labelA });
    plane.point(p1[0], p1[1], { color: COL.yellow, radius: 4, label: labelB });
  }

  function frStr(pt) {
    return "(" + pt.x.str() + ", " + pt.y.str() + ")";
  }

  function buildEdge(p0, p1, n0, n1) {
    return function () {
      var res = clipTrace(p0, p1);
      var steps = [];

      // Passo 0: region codes dos extremos
      var c0 = outCode(p0[0], p0[1], WIN),
        c1 = outCode(p1[0], p1[1], WIN);
      steps.push({
        title: "Region codes dos extremos",
        body:
          "<p>Aresta <span class='hl'>" +
          n0 +
          n1 +
          "</span>. A janela tem 4 bits: <code>ESQ=1, DIR=2, BAIXO=4, CIMA=8</code>.</p>" +
          "<p><span class='accent'>" +
          n0 +
          "</span> → code <code>" +
          c0 +
          "</code> (" +
          codeName(c0) +
          ")<br>" +
          "<span class='accent'>" +
          n1 +
          "</span> → code <code>" +
          c1 +
          "</code> (" +
          codeName(c1) +
          ")</p>" +
          "<p>Se <code>code₀ | code₁ = 0</code> → aceita; se <code>code₀ &amp; code₁ ≠ 0</code> → rejeita; " +
          "senão recorta contra uma fronteira.</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            scene(plane, p0, p1, n0, n1);
          },
        },
      });

      // Passos de recorte
      res.trace.forEach(function (tr, i) {
        if (tr.action === "clip") {
          var seg0 = [tr.x0, tr.y0],
            seg1 = [tr.x1, tr.y1];
          steps.push({
            title: "Recorte contra a fronteira " + codeName(tr.outCode),
            body:
              "<p>O extremo <span class='accent'>" +
              (tr.outIsStart ? "inicial" : "final") +
              "</span> está fora (code <code>" +
              (tr.outIsStart ? tr.c0 : tr.c1) +
              "</code>). Cortamos contra <span class='hl'>" +
              codeName(tr.outCode) +
              "</span>.</p>" +
              "<p>Nova interseção: <span class='ok'>" +
              frStr(tr.fr) +
              "</span> ≈ (" +
              EX.util.round(tr.nx, 3) +
              ", " +
              EX.util.round(tr.ny, 3) +
              ").</p>",
            visual: {
              type: "plane",
              bounds: BOUNDS,
              draw: function (plane) {
                scene(plane, p0, p1, n0, n1);
                // segmento atual (antes do corte) e ponto de interseção
                plane.segment(seg0, seg1, { color: COL.orange, lineWidth: 2.5 });
                plane.point(tr.nx, tr.ny, { color: COL.green, radius: 5, ring: COL.green });
              },
            },
          });
        }
      });

      // Passo final
      if (res.accepted) {
        var rp0 = res.result[0],
          rp1 = res.result[1];
        // recuperar as frações finais recortando de novo só para exibir
        steps.push({
          title: "Segmento visível",
          body:
            "<p>Ambos os extremos passaram a estar <span class='ok'>DENTRO</span> da janela. " +
            "A parte visível de <span class='hl'>" +
            n0 +
            n1 +
            "</span> vai de <span class='ok'>(" +
            fmtPair(rp0) +
            ")</span> a <span class='ok'>(" +
            fmtPair(rp1) +
            ")</span>.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              scene(plane, p0, p1, n0, n1);
              plane.segment(rp0, rp1, { color: COL.green, lineWidth: 3.5 });
              plane.point(rp0[0], rp0[1], { color: COL.green, radius: 5 });
              plane.point(rp1[0], rp1[1], { color: COL.green, radius: 5 });
            },
          },
        });
      } else {
        steps.push({
          title: "Segmento rejeitado",
          body:
            "<p>Em algum momento <code>code₀ &amp; code₁ ≠ 0</code>: os dois extremos ficam do mesmo " +
            "lado de uma fronteira, então a aresta <span class='no'>" +
            n0 +
            n1 +
            "</span> não cruza a janela e é totalmente descartada.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              scene(plane, p0, p1, n0, n1);
              plane.segment(p0, p1, { color: COL.red, lineWidth: 2.5, dashed: true });
            },
          },
        });
      }

      return steps;
    };
  }

  // Formata um par numérico tentando recuperar a fração exata via Fr.
  function fmtPair(p) {
    return frFromNum(p[0]) + ", " + frFromNum(p[1]);
  }
  // Aproxima um número por uma fração de denominador pequeno (até 60) p/ exibir.
  function frFromNum(v) {
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    for (var d = 2; d <= 60; d++) {
      var n = v * d;
      if (Math.abs(n - Math.round(n)) < 1e-7) return new Fr(Math.round(n), d).str();
    }
    return String(EX.util.round(v, 3));
  }

  EX.registry.add({
    id: "cg-cohen-sutherland",
    num: "▭",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Recorte de linhas (Cohen-Sutherland)",
    type: "computacional",
    tags: ["canvas", "recorte", "clipping"],
    hubDesc: "Region codes e recorte de um triângulo contra a janela.",
    statement:
      "Recorte as arestas do triângulo <strong>A(-1,-3), B(-2,8), C(9,2)</strong> contra a janela " +
      "<strong>x ∈ [-2, 5], y ∈ [1, 6]</strong> pelo algoritmo de <strong>Cohen-Sutherland</strong> " +
      "(region codes de 4 bits: ESQ=1, DIR=2, BAIXO=4, CIMA=8).",
    parts: [
      { label: "AB", build: buildEdge(A, Bp, "A", "B") },
      { label: "BC", build: buildEdge(Bp, C, "B", "C") },
      { label: "CA", build: buildEdge(C, A, "C", "A") },
    ],
  });
})();
