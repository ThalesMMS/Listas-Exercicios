/*
 * se-uml-class.js — Exemplo de Engenharia de Software (Modelagem).
 *
 * Pequeno diagrama de classes UML construído com EX.Diagram.uml:
 *   Animal  (atributo: nome; método: emitirSom())
 *     ├── Cachorro  (herança)
 *     └── Gato      (herança)
 *   Pessoa  -- dono --> agrega Animal
 *
 * A animação revela primeiro as classes e depois as relações, contrastando
 * HERANÇA ("é um") com ASSOCIAÇÃO/AGREGAÇÃO ("tem um").
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Modelo único; cada passo escolhe o que mostrar via opts.shown / highlight.
  var MODEL = {
    classes: [
      {
        name: "Animal",
        attributes: ["- nome: String"],
        methods: ["+ emitirSom()"],
        x: 215, y: 30, w: 170,
      },
      {
        name: "Cachorro",
        attributes: [],
        methods: ["+ emitirSom()", "+ buscar()"],
        x: 70, y: 215, w: 165,
      },
      {
        name: "Gato",
        attributes: [],
        methods: ["+ emitirSom()"],
        x: 285, y: 215, w: 150,
      },
      {
        name: "Pessoa",
        attributes: ["- nome: String"],
        methods: ["+ passear()"],
        x: 480, y: 30, w: 160,
      },
    ],
    relations: [
      { from: "Cachorro", to: "Animal", kind: "inherit" },
      { from: "Gato", to: "Animal", kind: "inherit" },
      { from: "Pessoa", to: "Animal", kind: "aggregate", label: "dono" },
    ],
  };

  var VIEW = [700, 360];

  function visual(opts) {
    return {
      type: "svg",
      view: VIEW,
      draw: function (svg) {
        EX.Diagram.uml(svg, MODEL, Object.assign({ view: VIEW }, opts));
      },
    };
  }

  function build() {
    return [
      {
        title: "A classe base: Animal",
        body:
          "<p>Uma <b>classe</b> UML tem três compartimentos: <span class='accent'>nome</span>, " +
          "<b>atributos</b> e <b>métodos</b>.</p>" +
          "<p><code>Animal</code> tem o atributo <code>nome</code> e o método " +
          "<code>emitirSom()</code>. Os sinais <code>-</code> e <code>+</code> indicam " +
          "visibilidade <i>privada</i> e <i>pública</i>.</p>",
        visual: visual({ shown: ["Animal"] }),
      },
      {
        title: "Subclasses: Cachorro e Gato",
        body:
          "<p>Adicionamos <code>Cachorro</code> e <code>Gato</code>. Ambos são <b>tipos de</b> " +
          "<code>Animal</code> e podem ter métodos próprios (ex.: <code>buscar()</code>) " +
          "além de <i>redefinir</i> <code>emitirSom()</code>.</p>",
        visual: visual({ shown: ["Animal", "Cachorro", "Gato"], highlight: ["Cachorro", "Gato"] }),
      },
      {
        title: "Herança (é um)",
        body:
          "<p>A <b>herança</b> é desenhada com uma <b>seta de triângulo vazado</b> apontando " +
          "para a superclasse. Lê-se: <span class='ok'>Cachorro é um Animal</span> e " +
          "<span class='ok'>Gato é um Animal</span>.</p>" +
          "<div class='ex-callout tip'><div class='ex-callout-title'>Por que herdar?</div>" +
          "As subclasses reaproveitam atributos e métodos de <code>Animal</code> e " +
          "especializam o comportamento.</div>",
        visual: visual({
          shown: ["Animal", "Cachorro", "Gato"],
          highlightRelations: [["Cachorro", "Animal"], ["Gato", "Animal"]],
        }),
      },
      {
        title: "Outra classe: Pessoa",
        body:
          "<p>Nem toda relação é herança. <code>Pessoa</code> <b>não é</b> um Animal — " +
          "mas pode <b>ter</b> um (o seu bicho de estimação).</p>",
        visual: visual({ shown: ["Animal", "Cachorro", "Gato", "Pessoa"], highlight: ["Pessoa"] }),
      },
      {
        title: "Agregação (tem um)",
        body:
          "<p>A relação <code>Pessoa</code>–<code>Animal</code> é uma <b>agregação</b>: " +
          "desenhada com um <b>losango vazado</b> no lado do <i>todo</i> (a Pessoa, o dono). " +
          "Lê-se <span class='hl'>Pessoa tem um Animal</span>.</p>" +
          "<p>Numa agregação as partes têm vida própria: o Animal continua existindo mesmo " +
          "sem aquela Pessoa. (Se a parte morresse junto com o todo, seria <b>composição</b>, " +
          "com losango <i>cheio</i>.)</p>",
        visual: visual({
          shown: ["Animal", "Cachorro", "Gato", "Pessoa"],
          highlightRelations: [["Pessoa", "Animal"]],
        }),
      },
      {
        title: "Herança vs. associação/agregação",
        body:
          "<p>Resumo do diagrama completo:</p>" +
          "<ul>" +
          "<li><b>Herança</b> (triângulo vazado) = <span class='ok'>\"é um\"</span>: " +
          "Cachorro/Gato <i>são</i> Animais.</li>" +
          "<li><b>Agregação</b> (losango vazado) = <span class='hl'>\"tem um\"</span>: " +
          "Pessoa <i>tem</i> um Animal.</li>" +
          "</ul>" +
          "<div class='ex-callout warn'><div class='ex-callout-title'>Dica de modelagem</div>" +
          "Na dúvida entre herança e associação, pergunte: \"X <b>é um</b> Y?\" Se a resposta " +
          "for \"X <b>tem um</b> Y\", use associação/agregação, não herança.</div>",
        visual: visual({}),
      },
    ];
  }

  EX.registry.add({
    id: "se-uml-class",
    num: "UML",
    subject: "Engenharia de Software",
    section: "Modelagem",
    title: "Diagrama de classes: herança vs. agregação",
    type: "conceitual",
    tags: ["uml", "svg", "modelagem"],
    hubDesc: "Classes, herança (é um) e agregação (tem um) num diagrama UML.",
    statement:
      "Modele em <strong>UML</strong> um <code>Animal</code> com subclasses " +
      "<code>Cachorro</code> e <code>Gato</code>, e uma <code>Pessoa</code> que possui um " +
      "Animal. Distinga <strong>herança</strong> de <strong>associação/agregação</strong>.",
    parts: [{ label: "Diagrama", build: build }],
  });
})();
