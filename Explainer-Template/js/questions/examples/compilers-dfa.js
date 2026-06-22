/*
 * compilers-dfa.js — DFA que aceita cadeias binárias com número PAR de 1s.
 *
 * Estados: q0 (paridade par, ACEITADOR) e q1 (paridade ímpar).
 *   - símbolo 0: mantém o estado (não muda a paridade dos 1s)
 *   - símbolo 1: alterna q0<->q1 (muda a paridade)
 * Exemplo lido: "10110" tem três 1s -> ímpar -> REJEITA (termina em q1).
 *
 * Usa EX.Diagram.automaton + uma "fita" (texto) destacando o símbolo atual.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Definição do autômato (posições em unidades de view 600x300).
  var AUT = {
    states: [
      { id: "q0", label: "q0", x: 180, y: 150, accepting: true },
      { id: "q1", label: "q1", x: 420, y: 150 },
    ],
    start: "q0",
    transitions: [
      { from: "q0", to: "q0", label: "0" },
      { from: "q1", to: "q1", label: "0" },
      { from: "q0", to: "q1", label: "1" },
      { from: "q1", to: "q0", label: "1" },
    ],
  };

  // Função de transição.
  function delta(state, sym) {
    if (sym === "0") return state;        // 0 mantém a paridade
    return state === "q0" ? "q1" : "q0";  // 1 alterna
  }

  // Simula a leitura, devolvendo a sequência de configurações.
  function simulate(input) {
    var trace = [];
    var state = AUT.start;
    trace.push({ state: state, idx: -1, sym: null, prev: null }); // estado inicial
    for (var i = 0; i < input.length; i++) {
      var sym = input[i];
      var prev = state;
      state = delta(state, sym);
      trace.push({ state: state, idx: i, sym: sym, prev: prev });
    }
    return trace;
  }

  var INPUT = "10110";
  var TRACE = simulate(INPUT);
  var ACCEPT = TRACE[TRACE.length - 1].state === "q0";

  // Desenha a "fita" de entrada como texto, destacando o símbolo consumido.
  function tape(svg, input, idx, w, y) {
    var cellW = 40, total = input.length * cellW;
    var x0 = (w - total) / 2;
    for (var i = 0; i < input.length; i++) {
      var consumed = i < idx;
      var current = i === idx;
      svg.rect(x0 + i * cellW, y, cellW - 6, 38, {
        fill: current ? "var(--yellow-soft)" : consumed ? "var(--bg-soft)" : "var(--bg-card)",
        stroke: current ? "var(--yellow)" : "var(--border)",
        strokeWidth: current ? 3 : 1.5,
        rx: 6,
      });
      svg.text(x0 + i * cellW + (cellW - 6) / 2, y + 19, input[i], {
        size: 18, weight: 700, mono: true,
        color: current ? "var(--ink)" : consumed ? "var(--ink-dim)" : "var(--ink)",
      });
    }
  }

  function visualFor(step) {
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(600, 300);
        EX.Diagram.automaton(svg, AUT, {
          view: [600, 300],
          activeState: step.state,
          activeTransition: step.prev ? [step.prev, step.state] : null,
        });
        tape(svg, INPUT, step.idx, 600, 240);
      },
    };
  }

  function build() {
    var steps = [];

    steps.push({
      title: "O autômato",
      body:
        "<p>Este <b>AFD</b> reconhece cadeias do alfabeto {0, 1} com um número " +
        "<span class='accent'>par</span> de <code>1</code>s.</p>" +
        "<ul>" +
        "<li><code>q0</code> = paridade <b>par</b> (estado de <span class='ok'>aceitação</span>, círculo duplo);</li>" +
        "<li><code>q1</code> = paridade <b>ímpar</b>.</li>" +
        "</ul>" +
        "<p>Ler <code>0</code> mantém o estado; ler <code>1</code> alterna a paridade.</p>",
      visual: {
        type: "svg",
        draw: function (svg) {
          svg.view(600, 300);
          EX.Diagram.automaton(svg, AUT, { view: [600, 300], activeState: "q0" });
        },
      },
    });

    // Passo a passo da leitura de "10110".
    TRACE.forEach(function (cfg, i) {
      if (i === 0) {
        steps.push({
          title: "Estado inicial",
          body:
            "<p>Começamos em <code>q0</code> (0 uns lidos: paridade par). " +
            "Vamos consumir <code>" + INPUT + "</code> da esquerda p/ a direita.</p>",
          visual: visualFor(cfg),
        });
        return;
      }
      var par = cfg.state === "q0" ? "par" : "ímpar";
      var muda = cfg.sym === "1";
      steps.push({
        title: "Lê '" + cfg.sym + "' (posição " + (cfg.idx + 1) + ")",
        body:
          "<p>No estado <code>" + cfg.prev + "</code> lemos <code>" + cfg.sym + "</code>: " +
          (muda
            ? "o <code>1</code> <span class='hl'>alterna</span> a paridade, "
            : "o <code>0</code> <span class='muted'>mantém</span> o estado, ") +
          "vamos para <code>" + cfg.state + "</code> (paridade " + par + ").</p>",
        visual: visualFor(cfg),
      });
    });

    // Veredito.
    var last = TRACE[TRACE.length - 1];
    steps.push({
      title: ACCEPT ? "Aceita" : "Rejeita",
      body:
        "<p>Fim da entrada no estado <code>" + last.state + "</code>.</p>" +
        "<p><code>" + INPUT + "</code> tem <b>três</b> <code>1</code>s -> número " +
        "<span class='no'>ímpar</span> -> terminamos em <code>q1</code>, que " +
        "<b>não</b> é de aceitação: a cadeia é <span class='no'>REJEITADA</span>.</p>",
      visual: {
        type: "svg",
        draw: function (svg) {
          svg.view(600, 300);
          EX.Diagram.automaton(svg, AUT, { view: [600, 300], activeState: last.state });
          tape(svg, INPUT, INPUT.length, 600, 240);
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "compilers-dfa",
    num: "λ",
    subject: "Compiladores",
    section: "Análise Léxica",
    title: "AFD: número par de 1s",
    type: "computacional",
    tags: ["autômato", "afd", "léxica"],
    hubDesc: "Reconhecimento de tokens com autômato finito determinístico.",
    statement:
      "Um <strong>AFD</strong> reconhece cadeias binárias com número <strong>par</strong> de <code>1</code>s. " +
      "Simule a leitura de <code>10110</code> e diga se é aceita.",
    parts: [{ label: "Simulação", build: build }],
  });
})();
