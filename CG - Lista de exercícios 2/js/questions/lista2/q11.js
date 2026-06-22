/*
 * q11.js — Curvas Paramétricas.
 * "Demonstre como obter a matriz de conversão da curva interpolada para Bézier."
 * Derivação: Q(u)=U·M_B·G_B = U·M_I·G_I  ⇒  G_B = M_B⁻¹·M_I·G_I.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Renderiza uma matriz (linhas de strings) como tabela "com colchetes".
  function mat(rows) {
    var s = "<table style='border-collapse:collapse;display:inline-table;margin:0 4px;vertical-align:middle;" +
      "border-left:2px solid var(--ink-dim);border-right:2px solid var(--ink-dim)'>";
    rows.forEach(function (r) {
      s += "<tr>";
      r.forEach(function (c) {
        s += "<td style='padding:2px 7px;text-align:center;font-family:var(--mono);font-size:13px;color:var(--ink)'>" + c + "</td>";
      });
      s += "</tr>";
    });
    return s + "</table>";
  }
  function row(html) {
    return "<div style='display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;" +
      "margin:12px 4px;font-family:var(--mono);font-size:15px;color:var(--ink-dim)'>" + html + "</div>";
  }
  function dom(html) { return { type: "dom", draw: function (host) { host.innerHTML = html; } }; }

  var U = mat([["u³", "u²", "u", "1"]]);
  var MB = mat([["−1", "3", "−3", "1"], ["3", "−6", "3", "0"], ["−3", "3", "0", "0"], ["1", "0", "0", "0"]]);
  var MI = mat([["−9/2", "27/2", "−27/2", "9/2"], ["9", "−45/2", "18", "−9/2"], ["−11/2", "9", "−9/2", "1"], ["1", "0", "0", "0"]]);
  var MBinv = mat([["0", "0", "0", "1"], ["0", "0", "1/3", "1"], ["0", "1/3", "2/3", "1"], ["1", "1", "1", "1"]]);
  var CONV = mat([["6", "0", "0", "0"], ["−5", "18", "−9", "2"], ["2", "−9", "18", "−5"], ["0", "0", "0", "6"]]);
  var GB = mat([["B₀"], ["B₁"], ["B₂"], ["B₃"]]);
  var GI = mat([["P₀"], ["P₁"], ["P₂"], ["P₃"]]);

  function build() {
    return [
      {
        title: "Mesma curva, duas bases",
        body:
          "<p>Uma curva cúbica pode ser escrita em <b>qualquer base</b> como " +
          "<code>Q(u) = U · M · G</code>, onde <code>U = [u³ u² u 1]</code>, <b>M</b> é a matriz de base e " +
          "<b>G</b> é a geometria (pontos de controle).</p>" +
          "<p>A <b>mesma</b> curva nas bases de Bézier e interpolada:</p>" +
          "<p style='text-align:center'><code>U·M<sub>B</sub>·G<sub>B</sub> = U·M<sub>I</sub>·G<sub>I</sub></code></p>",
        visual: dom(row("Q(u) =" + U + "· M ·" + mat([["g₀"], ["g₁"], ["g₂"], ["g₃"]]))),
      },
      {
        title: "As duas matrizes de base",
        body:
          "<p><b>M<sub>B</sub></b> é a matriz de Bézier. <b>M<sub>I</sub></b> é a matriz da interpolada para nós " +
          "igualmente espaçados <code>u = 0, ⅓, ⅔, 1</code> (obtida invertendo a matriz dos <code>uⁱ</code> nesses nós).</p>",
        visual: dom(row("M<sub>B</sub> =" + MB) + row("M<sub>I</sub> =" + MI)),
      },
      {
        title: "Igualando as bases",
        body:
	          "<p>Como <code>U·M<sub>B</sub>·G<sub>B</sub> = U·M<sub>I</sub>·G<sub>I</sub></code> vale para <b>todo u</b> " +
	          "e os monômios são linearmente independentes, os vetores de coeficientes devem ser iguais:</p>" +
          "<p style='text-align:center'><code>M<sub>B</sub>·G<sub>B</sub> = M<sub>I</sub>·G<sub>I</sub></code></p>" +
          "<p>Multiplicando à esquerda por <code>M<sub>B</sub>⁻¹</code>:</p>" +
          "<p style='text-align:center'><code>G<sub>B</sub> = (M<sub>B</sub>⁻¹·M<sub>I</sub>)·G<sub>I</sub></code></p>" +
          "<p>A <span class='hl'>matriz de conversão</span> é <code>M = M<sub>B</sub>⁻¹·M<sub>I</sub></code>.</p>",
        visual: dom(row("M<sub>B</sub>⁻¹ =" + MBinv)),
      },
      {
        title: "A matriz de conversão",
        body:
          "<p>Efetuando o produto <code>M<sub>B</sub>⁻¹·M<sub>I</sub></code>:</p>" +
          "<p style='text-align:center;font-family:var(--mono)'>B₀ = P₀<br>" +
          "B₁ = (−5P₀ + 18P₁ − 9P₂ + 2P₃)/6<br>" +
          "B₂ = (2P₀ − 9P₁ + 18P₂ − 5P₃)/6<br>" +
          "B₃ = P₃</p>",
        visual: dom(row(GB + "=" + "<span style='font-family:var(--mono)'>1/6</span>" + CONV + "·" + GI)),
      },
      {
        title: "Verificação",
        body:
          "<p>Conferindo a matriz:</p>" +
          "<ul><li><b>B₀ = P₀</b> e <b>B₃ = P₃</b>: a Bézier resultante <b>interpola os extremos</b> (como esperado);</li>" +
          "<li>cada linha <b>soma 1</b> (ex.: (−5+18−9+2)/6 = 1) → preserva pontos e é <b>invariante a translações</b>.</li></ul>" +
          "<p>Assim, dados os pontos interpolados P₀…P₃, obtemos os pontos de controle de Bézier B₀…B₃ que geram a " +
          "<b>mesma</b> curva.</p>",
        visual: dom(row(GB + "=" + "<span style='font-family:var(--mono)'>1/6</span>" + CONV + "·" + GI)),
      },
    ];
  }

  EX.registry.add({
    id: "q11",
    num: "11",
    subject: "Curvas Paramétricas",
    title: "Matriz de conversão interpolada → Bézier",
    type: "computacional",
    hubDesc: "G_B = M_B⁻¹·M_I·G_I; resulta B₁=(−5P₀+18P₁−9P₂+2P₃)/6, etc.",
    statement: "Demonstre como obter a matriz de conversão da curva interpolada para curva de Bézier.",
    parts: [{ label: "Derivação", build: build }],
  });
})();
