/*
 * q35.js — Conceitos, vantagens e desvantagens dos algoritmos de
 * preenchimento de áreas: Boundary Fill, Flood Fill e ScanLine (conceitual).
 *
 * Slides textuais (sem draw) com blocos de prós/contras, espelhando o texto
 * do gabarito.
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;

  window.GUI.register({
    id: 35,
    num: "35",
    section: "V) Preenchimento de Áreas",
    title: "Boundary Fill, Flood Fill e ScanLine — prós e contras",
    type: "conceitual",
    hubDesc: "Conceito, vantagens e desvantagens dos três algoritmos de preenchimento.",
    enunciado:
      "Conceitue e defina vantagens e desvantagens de: a) Boundary Fill, b) Flood Fill, c) ScanLine.",
    parts: [
      {
        label: "Conceitos",
        build: function (plane) {
          return [
            {
              titulo: "Visão geral",
              explicacao:
                "<p>O <b>preenchimento de áreas</b> trata de colorir regiões em uma imagem raster. " +
                "Os métodos variam conforme usam um <span class='hl'>ponto inicial</span>, uma " +
                "<span class='hl'>cor de borda</span>, uma <span class='hl'>cor-alvo</span> ou a " +
                "<span class='hl'>geometria do polígono</span>.</p>" +
                "<p>Comparar vantagens e desvantagens ajuda a escolher o algoritmo conforme o tipo " +
                "de região, o custo esperado e o risco de vazamento.</p>" +
                "<table class='q-table'>" +
                "<tr><th>Algoritmo</th><th>Critério de parada</th><th>Estratégia</th></tr>" +
                "<tr><td>Boundary Fill</td><td>cor de <b>borda</b></td><td>semente + vizinhança</td></tr>" +
                "<tr><td>Flood Fill</td><td>cor <b>inicial</b> (alvo)</td><td>semente + vizinhança</td></tr>" +
                "<tr><td>ScanLine</td><td>arestas do polígono</td><td>linha a linha (geometria)</td></tr>" +
                "</table>",
            },
            {
              titulo: "a) Boundary Fill",
              explicacao:
                "<p><b>Conceito.</b> Preenche a partir de um <span class='hl'>ponto inicial</span> " +
                "(semente), propagando-se pelos vizinhos, <b>até encontrar uma cor de borda</b>. " +
                "Para quando atinge a cor que delimita a região.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ Simples de implementar.</div>" +
                "<div class='pro'>+ Útil quando a borda tem cor bem definida.</div>" +
                "<div class='con'>− Pode vazar se a borda tiver falhas.</div>" +
                "<div class='con'>− Depende fortemente da cor da borda.</div>" +
                "<div class='con'>− Pode ser custoso com recursão em áreas grandes.</div>" +
                "</div>",
            },
            {
              titulo: "b) Flood Fill",
              explicacao:
                "<p><b>Conceito.</b> Preenche todos os pixels conectados que possuem a " +
                "<span class='hl'>mesma cor do pixel inicial</span> (cor-alvo), substituindo-os " +
                "por uma nova cor. Não olha a cor da borda — olha a cor que já está lá.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ Não precisa conhecer a cor da borda.</div>" +
                "<div class='pro'>+ Muito usado em ferramentas do tipo “balde de tinta”.</div>" +
                "<div class='con'>− Pode preencher regiões indesejadas se a cor inicial aparecer em áreas conectadas fora do alvo.</div>" +
                "<div class='con'>− Também pode ser custoso em áreas grandes.</div>" +
                "</div>",
            },
            {
              titulo: "c) ScanLine",
              explicacao:
                "<p><b>Conceito.</b> Preenche o polígono <span class='hl'>linha por linha</span>, " +
                "calculando as <b>interseções</b> entre cada linha horizontal e as arestas do " +
                "polígono e pintando os <span class='ok'>intervalos internos</span> entre pares de " +
                "interseções.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ Mais eficiente para polígonos grandes.</div>" +
                "<div class='pro'>+ Evita recursão.</div>" +
                "<div class='pro'>+ Produz preenchimento organizado por intervalos horizontais.</div>" +
                "<div class='con'>− Implementação mais complexa.</div>" +
                "<div class='con'>− Exige tratamento cuidadoso de vértices, arestas horizontais e interseções duplicadas.</div>" +
                "</div>",
            },
            {
              titulo: "Resumo comparativo",
              explicacao:
                "<p>Em uma frase cada um:</p>" +
                "<div class='formula'>Boundary Fill → para na COR DE BORDA\n" +
                "Flood Fill    → troca a COR INICIAL (alvo)\n" +
                "ScanLine      → usa a GEOMETRIA do polígono</div>" +
                "<p>Os dois primeiros são <b>baseados em semente</b> (propagam por vizinhança a " +
                "partir de um ponto) e podem vazar; o último é <b>baseado na geometria</b> das " +
                "arestas, sendo o mais indicado para polígonos grandes.</p>",
            },
          ];
        },
      },
    ],
  });
})();
