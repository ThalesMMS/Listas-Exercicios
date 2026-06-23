/*
 * g23-cinematica.js — Guia: cinemática direta e inversa.
 * Braço articulado de 2 elos. Direta: ângulos → posição da ponta (encadeamento
 * de transformações). Inversa: posição alvo → ângulos (lei dos cossenos,
 * múltiplas soluções). Comparação entre as duas.
 *
 * Visual: SVG. Exemplo/diagrama inspirados na Lista 3 (q20).
 */
(function () {
  "use strict";
  var EX = window.EX;

  function base(svg, p, color) {
    svg.rect(p[0] - 18, p[1], 36, 14, { fill: "var(--ink-mute)", rx: 2 });
    svg.circle(p[0], p[1], 6, { fill: "var(--ink)", stroke: color, strokeWidth: 2 });
  }
  function arm(svg, b, j1, ee, color, dashed) {
    svg.line(b[0], b[1], j1[0], j1[1], { stroke: color, strokeWidth: 7, dashed: dashed });
    svg.line(j1[0], j1[1], ee[0], ee[1], { stroke: color, strokeWidth: 6, dashed: dashed });
    svg.circle(j1[0], j1[1], 6, { fill: "var(--ink)", stroke: color, strokeWidth: 2 });
  }

  // Configuração direta (ângulos conhecidos).
  var BF = [120, 250], J1 = [173, 165], EE = [156, 85];
  // Configuração inversa (dois cotovelos para o mesmo alvo).
  var BI = [150, 250], TGT = [280, 150], JUP = [246.8, 225], JDN = [198.9, 162.8];

  function build() {
    return [
      {
        title: "Um braço, duas perguntas",
        body:
          "<p>Pense num braço articulado de <b>2 elos</b> (segmentos rígidos de comprimentos <code>L₁</code> " +
          "e <code>L₂</code>) preso a uma base, com juntas que <b>giram</b> pelos ângulos <code>θ₁</code> " +
          "(ombro) e <code>θ₂</code> (cotovelo). Os ângulos são os <b>graus de liberdade</b>: são eles que " +
          "controlamos. A ponta livre é o <b>efetuador</b> (a “mão”).</p>" +
          "<p>Sobre esse mesmo braço cabem duas perguntas <b>opostas</b>:</p>" +
          "<ul>" +
          "<li><b>Cinemática direta (FK)</b>: <em>sei os ângulos</em> → onde fica a <b>ponta</b>? " +
          "(do espaço das juntas para o espaço cartesiano)</li>" +
          "<li><b>Cinemática inversa (IK)</b>: <em>quero a ponta num <b>alvo</b></em> → quais ângulos uso? " +
          "(do espaço cartesiano de volta para o das juntas)</li>" +
          "</ul>" +
          "<p>A FK é uma <b>função</b> bem-comportada (cada entrada dá uma saída); a IK é " +
          "<b>inverter essa função</b> — e inverter, como veremos, costuma ser bem mais espinhoso. É a " +
          "espinha dorsal do <em>rigging</em> de personagens e do controle de robôs.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            arm(svg, BF, J1, EE, "var(--accent)");
            base(svg, BF, "var(--accent)");
            svg.circle(EE[0], EE[1], 8, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(EE[0] - 10, EE[1] - 12, "ponta", { size: 12, weight: 700, color: "var(--green)", anchor: "end" });
          },
        },
      },
      {
        title: "Cinemática direta: ângulos → posição",
        body:
          "<p>Encadeamos os elos, um de cada vez. A ponta do <b>1º elo</b> (comprimento <code>L₁</code>, " +
          "girado <code>θ₁</code> a partir da base) é simplesmente um vetor polar:</p>" +
          "<div class='formula'>J = (L₁·cos θ₁,  L₁·sin θ₁)</div>" +
          "<p>O ponto-chave é que o <b>2º elo</b> está montado <em>na ponta do primeiro</em>: seu ângulo é " +
          "medido em relação ao primeiro elo, então o ângulo dele <span class='hl'>no mundo</span> é a " +
          "<b>soma</b> <code>θ₁ + θ₂</code> (os ângulos se <em>acumulam</em> ao longo da cadeia). Somando o " +
          "vetor do 2º elo à junta:</p>" +
          "<div class='formula'>x = L₁·cos θ₁ + L₂·cos(θ₁+θ₂)\n" +
          "y = L₁·sin θ₁ + L₂·sin(θ₁+θ₂)</div>" +
          "<p><b>Conta concreta:</b> com <code>L₁ = L₂ = 100</code>, <code>θ₁ = 30°</code> e " +
          "<code>θ₂ = 60°</code>, a junta fica em <code>(86,6; 50)</code> e a ponta em " +
          "<code>(86,6 + 0; 50 + 100) = (86,6; 150)</code> (pois <code>θ₁+θ₂ = 90°</code>).</p>" +
          "<p>É <b>direto e único</b>: dados os ângulos, há <b>exatamente uma</b> posição da ponta — basta " +
          "avaliar a fórmula. Note que isto é literalmente <span class='accent'>compor transformações</span> " +
          "junta após junta: cada elo é uma rotação seguida de uma translação ao longo do braço — a mesma " +
          "ideia das matrizes encadeadas das transformações geométricas. O próximo passo deixa essa cadeia " +
          "explícita.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            arm(svg, BF, J1, EE, "var(--accent)");
            base(svg, BF, "var(--accent)");
            // ângulos conhecidos (amarelo)
            svg.text(BF[0] + 30, BF[1] - 14, "θ₁", { size: 14, weight: 800, color: "var(--yellow)" });
            svg.text(J1[0] + 12, J1[1] - 4, "θ₂", { size: 14, weight: 800, color: "var(--yellow)" });
            svg.circle(EE[0], EE[1], 8, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(EE[0] - 10, EE[1] - 12, "P (calculada)", { size: 12, weight: 700, color: "var(--green)", anchor: "end" });
          },
        },
      },
      {
        title: "A cadeia de transformações (FK como matrizes)",
        body:
          "<p>A fórmula da FK não cai do céu: ela é o resultado de <b>compor transformações homogêneas</b>, " +
          "exatamente como no guia de Transformações. Cada junta contribui com <b>uma rotação</b> " +
          "<code>R(θ)</code> (gira o que vem depois) seguida de <b>uma translação</b> <code>T(L, 0)</code> " +
          "(anda o comprimento do elo, no referencial já girado):</p>" +
          "<div class='formula'>Pₘ = R(θ₁)·T(L₁,0)·R(θ₂)·T(L₂,0) · O</div>" +
          "<p>onde <code>O = (0,0,1)ᵀ</code> é a origem na ponta. <b>Por que essa ordem?</b> Lendo da " +
          "<span class='hl'>direita para a esquerda</span> (como em <code>v′ = M·v</code>): partimos da " +
          "ponta, andamos <code>L₂</code>, voltamos pela rotação <code>θ₂</code> do cotovelo, andamos " +
          "<code>L₁</code>, e por fim aplicamos a rotação <code>θ₁</code> do ombro. Cada matriz move o " +
          "<b>referencial local</b> da junta seguinte.</p>" +
          "<p>É daí que vem o <code>θ₁+θ₂</code> do passo anterior: a rotação do ombro multiplica também o " +
          "bloco do cotovelo, então os ângulos <b>se somam</b> ao chegar no 2º elo. Multiplicando as " +
          "matrizes e extraindo a posição, reaparecem <code>x = L₁cos θ₁ + L₂cos(θ₁+θ₂)</code> e o " +
          "<code>y</code> análogo — a fórmula da FK <em>é</em> o produto da cadeia.</p>" +
          "<p>Vantagem prática: para braços com <b>N juntas</b>, basta encadear N pares " +
          "<code>R·T</code> — o mesmo padrão de pré-multiplicar matrizes que a GPU usa para a hierarquia " +
          "de um esqueleto (cada osso herda a transformação do pai).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 200);
            var blocks = ["R(θ₁)", "T(L₁,0)", "R(θ₂)", "T(L₂,0)"];
            var cols = ["var(--accent)", "var(--ink-dim)", "var(--yellow)", "var(--ink-dim)"];
            var x = 30, y = 70, w = 120, h = 56, gap = 16;
            for (var i = 0; i < blocks.length; i++) {
              svg.rect(x, y, w, h, { fill: "var(--bg-soft)", stroke: cols[i], strokeWidth: 2, rx: 6 });
              svg.text(x + w / 2, y + h / 2, blocks[i], { size: 16, weight: 800, color: cols[i], mono: true });
              if (i < blocks.length - 1)
                svg.text(x + w + gap / 2, y + h / 2, "·", { size: 22, weight: 800, color: "var(--ink-mute)" });
              x += w + gap;
            }
            svg.text(x + 6, y + h / 2, "· O", { size: 16, weight: 800, color: "var(--green)", anchor: "start", mono: true });
            svg.arrow(620, 150, 70, 150, { color: "var(--ink-mute)", head: 11 });
            svg.text(345, 172, "aplica-se da direita p/ a esquerda (ponta → base)", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Cinemática inversa: posição → ângulos",
        body:
          "<p>Agora invertemos: a ponta deve <em>atingir</em> o <span class='no'>alvo P*</span>, e " +
          "queremos os ângulos. A sacada é olhar o <b>triângulo</b> formado pela base, pela junta e pela " +
          "ponta: seus três lados são <code>L₁</code>, <code>L₂</code> e a distância <code>d</code> da base " +
          "ao alvo (<code>d = √(x² + y²)</code>). A <b>lei dos cossenos</b> nesse triângulo relaciona o " +
          "lado <code>d</code> ao ângulo interno do cotovelo:</p>" +
          "<div class='formula'>d² = L₁² + L₂² − 2·L₁·L₂·cos(π − θ₂)\n" +
          "⇒  cos θ₂ = (d² − L₁² − L₂²) / (2·L₁·L₂)</div>" +
          "<p>Achado <code>θ₂</code>, o <code>θ₁</code> sai somando dois ângulos: a direção da base ao alvo " +
          "(<code>atan2(y, x)</code>) <b>menos</b> o quanto o 1º elo se inclina <em>dentro</em> do triângulo " +
          "para a junta cair no lugar certo:</p>" +
          "<div class='formula'>θ₁ = atan2(y, x) − atan2(L₂ sin θ₂, L₁ + L₂ cos θ₂)</div>" +
          "<p>Repare no <b>±</b> do arco-cosseno: <code>cos θ₂</code> não distingue <code>+θ₂</code> de " +
          "<code>−θ₂</code>, então em geral há <b>duas</b> soluções — “cotovelo para cima” e “para baixo” " +
          "(ambas desenhadas; a tracejada é a 2ª). E há <b>limites de alcance</b>: se " +
          "<code>d &gt; L₁+L₂</code> (longe demais, braço não estica tanto) o argumento do arco-cosseno " +
          "passa de <code>1</code>; se <code>d &lt; |L₁−L₂|</code> (perto demais) fica abaixo de " +
          "<code>−1</code> — em ambos, <span class='no'>não há solução</span> e a fórmula falha (acos de " +
          "um número fora de [−1, 1]).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            arm(svg, BI, JDN, TGT, "var(--ink-mute)", "6 5"); // cotovelo baixo (alternativa)
            arm(svg, BI, JUP, TGT, "var(--accent)"); // cotovelo cima
            base(svg, BI, "var(--accent)");
            svg.text(BI[0] + 30, BI[1] - 14, "θ₁ ?", { size: 13, weight: 800, color: "var(--red)" });
            svg.circle(TGT[0], TGT[1], 9, { fill: "none", stroke: "var(--red)", strokeWidth: 2.5 });
            svg.circle(TGT[0], TGT[1], 3, { fill: "var(--red)" });
            svg.text(TGT[0] + 12, TGT[1] - 6, "alvo P*", { size: 12, weight: 700, color: "var(--red)", anchor: "start" });
            svg.text(JDN[0] - 16, JDN[1] + 18, "2ª solução", { size: 11, color: "var(--ink-mute)", anchor: "end" });
          },
        },
      },
      {
        title: "IK na prática: uma conta e o anel de alcance",
        body:
          "<p>Vamos resolver a IK do braço desenhado: <code>L₁ = 100</code>, <code>L₂ = 82</code> e um " +
          "alvo a distância <code>d = 164</code> da base. Pela lei dos cossenos:</p>" +
          "<div class='formula'>cos θ₂ = (164² − 100² − 82²) / (2·100·82) ≈ 0,62\n" +
          "θ₂ = ± arccos(0,62) ≈ ± 51,7°</div>" +
          "<p>Os dois sinais são os dois <b>cotovelos</b>: <code>+51,7°</code> dobra para um lado, " +
          "<code>−51,7°</code> para o outro — e ambos levam a ponta ao <em>mesmo</em> alvo, como mostra o " +
          "passo anterior. Substituindo cada <code>θ₂</code> na fórmula do <code>θ₁</code> fecham-se as " +
          "duas configurações.</p>" +
          "<p>O conjunto de <b>todos</b> os alvos alcançáveis é um <span class='hl'>anel</span> " +
          "(coroa circular) centrado na base: o raio externo é <code>L₁ + L₂ = 182</code> (braço " +
          "esticado) e o interno é <code>|L₁ − L₂| = 18</code> (braço dobrado em cima de si). Nosso " +
          "<code>d = 164</code> cai <b>dentro</b> do anel — por isso há solução. Um alvo fora dele " +
          "(buraco central ou além do alcance) <span class='no'>não tem solução</span>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 320);
            var C = [180, 175], s = 0.7; // escala p/ caber: 182*0.7≈127
            var Rout = 182 * s, Rin = 18 * s, d = 164 * s;
            // anel de alcance
            svg.circle(C[0], C[1], Rout, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5 });
            svg.circle(C[0], C[1], Rin, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "4 4" });
            // alvo a distância d (para cima-direita)
            var a = -0.5; // ângulo do alvo
            var T = [C[0] + d * Math.cos(a), C[1] + d * Math.sin(a)];
            svg.line(C[0], C[1], T[0], T[1], { stroke: "var(--accent)", strokeWidth: 1.5, dashed: "5 4" });
            svg.text((C[0] + T[0]) / 2 + 6, (C[1] + T[1]) / 2 - 8, "d=164", { size: 11, color: "var(--accent)" });
            svg.circle(T[0], T[1], 6, { fill: "var(--red)", stroke: "var(--ink)", strokeWidth: 1.5 });
            // base
            svg.rect(C[0] - 16, C[1], 32, 12, { fill: "var(--ink-mute)", rx: 2 });
            svg.circle(C[0], C[1], 5, { fill: "var(--ink)", stroke: "var(--accent)", strokeWidth: 2 });
            svg.text(C[0], C[1] - Rout - 6, "alcançável: 18 ≤ d ≤ 182", { size: 12, weight: 700, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Direta × inversa",
        body:
          "<p>As duas são faces da mesma cadeia, mas pesam muito diferente. A <b>direta</b> é avaliar uma " +
          "função (substituir os ângulos e ler a posição); a <b>inversa</b> é <em>resolver uma equação</em> " +
          "— e equações trigonométricas podem ter zero, uma, várias ou infinitas soluções. Por isso a IK é " +
          "o lado difícil:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Direta (FK)", "Inversa (IK)"],
              rows: [
                ["Dado", "ângulos θ", "posição alvo"],
                ["Quer", "posição da ponta", "ângulos θ"],
                ["Solução", "fórmula direta", "trigonometria/numérica"],
                ["Nº de soluções", "1 (única)", "0, 1 ou 2 (ou ∞)"],
                ["Dificuldade", "fácil", "não-linear"],
              ],
            });
          },
        },
      },
      {
        title: "Muitas juntas: subdeterminada, Jacobiano e CCD",
        body:
          "<p>Com 2 elos a IK fecha por trigonometria. Mas um braço de robô ou o esqueleto de um personagem " +
          "tem <b>muitas juntas</b> — e aí a fórmula fechada some. O problema vira <b>subdeterminado</b>: há " +
          "mais graus de liberdade (ângulos) do que restrições (a posição da ponta, 2 ou 3 números), então " +
          "<span class='hl'>infinitas combinações de ângulos</span> atingem o mesmo alvo (mexa o cotovelo " +
          "sem tirar a mão do lugar — é o seu próprio braço).</p>" +
          "<p>Sem solução fechada, resolve-se <b>numericamente</b>, “perseguindo” o alvo. Duas famílias " +
          "clássicas:</p>" +
          "<ul>" +
          "<li><b>Jacobiano</b>: a matriz <code>J</code> diz como um pequeno giro em cada junta " +
          "<em>move</em> a ponta (são as derivadas <code>∂posição/∂θ</code>). Invertendo " +
          "aproximadamente <code>J</code> (transposta ou pseudo-inversa), descobre-se que ajuste de ângulos " +
          "empurra a ponta na direção do alvo; repete-se em pequenos passos. É <b>gradiente</b> aplicado à " +
          "cadeia.</li>" +
          "<li><b>CCD</b> (Cyclic Coordinate Descent): mais simples e barato. Da ponta para a base, gira-se " +
          "<b>uma junta de cada vez</b> para apontar o efetuador ao alvo o máximo possível; varre a cadeia " +
          "repetidamente até chegar perto. É o algoritmo dos rigs de jogos.</li>" +
          "</ul>" +
          "<p>Como sobram soluções, adicionam-se <b>critérios</b>: limites de junta, conforto, evitar " +
          "colisões, menor movimento. A IK deixa de ser “a resposta” e passa a ser uma <b>otimização</b> — " +
          "escolher, entre infinitas poses válidas, a melhor.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            // braço de 4 elos perseguindo um alvo (ilustra redundância)
            var pts = [[60, 250], [120, 170], [200, 150], [270, 110], [330, 70]];
            for (var i = 0; i < pts.length - 1; i++) {
              svg.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { stroke: "var(--accent)", strokeWidth: 6 });
              svg.circle(pts[i][0], pts[i][1], 5, { fill: "var(--ink)", stroke: "var(--accent)", strokeWidth: 2 });
            }
            // base
            svg.rect(pts[0][0] - 16, pts[0][1], 32, 12, { fill: "var(--ink-mute)", rx: 2 });
            // efetuador
            var ee = pts[pts.length - 1];
            svg.circle(ee[0], ee[1], 7, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
            // alvo + seta de perseguição
            var T = [370, 120];
            svg.circle(T[0], T[1], 9, { fill: "none", stroke: "var(--red)", strokeWidth: 2.5 });
            svg.circle(T[0], T[1], 3, { fill: "var(--red)" });
            svg.arrow(ee[0] + 6, ee[1] + 4, T[0] - 10, T[1] - 6, { color: "var(--ink-mute)", head: 10, dashed: "4 3" });
            svg.text(T[0] + 12, T[1] - 8, "alvo", { size: 12, weight: 700, color: "var(--red)", anchor: "start" });
            svg.text(210, 285, "4 juntas, 1 alvo → infinitas poses", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Direta (FK)</b>: encadeie os elos girados (<code>R·T·R·T…</code>) — é compor " +
          "transformações; sempre dá <b>uma</b> resposta.</li>" +
          "<li><b>Acúmulo de ângulos</b>: o 2º elo gira <code>θ₁+θ₂</code> porque a rotação do ombro " +
          "carrega o cotovelo junto.</li>" +
          "<li><b>Inversa (IK)</b>: lei dos cossenos para 2 elos; escolha o cotovelo (cima/baixo) por " +
          "conveniência (ex.: evitar colisão).</li>" +
          "<li><b>Alcance</b>: confira <code>|L₁−L₂| ≤ d ≤ L₁+L₂</code> antes de resolver — fora do anel, " +
          "não há solução.</li>" +
          "<li><b>Muitas juntas</b> (redundantes): subdeterminada → resolva por <b>Jacobiano</b> ou " +
          "<b>CCD</b> e vire <b>otimização</b> (infinitas soluções).</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Direta = compor os elos girados (única). Inversa = resolver os ângulos para o alvo " +
                "(lei dos cossenos: 0, 1 ou 2 soluções; muitas juntas → numérica/otimização).",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g23-cinematica",
    num: "⊿",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Cinemática direta e inversa",
    type: "conceitual",
    tags: ["animação", "cinemática", "articulações", "jacobiano", "ccd"],
    hubDesc: "Direta (cadeia de transformações): ângulos→posição. Inversa: posição→ângulos (lei dos cossenos, 0/1/2 sol.); muitas juntas → Jacobiano/CCD.",
    statement:
      "Entenda a cinemática direta e inversa: calcular a posição da ponta compondo as transformações da " +
      "cadeia de elos (direta) ou, inversamente, achar os ângulos para um alvo (lei dos cossenos, " +
      "alcance, cotovelo cima/baixo). Veja por que muitas juntas tornam a IK subdeterminada e como " +
      "Jacobiano/CCD a resolvem por otimização.",
    parts: [{ label: "Guia", build: build }],
  });
})();
