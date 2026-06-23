/*
 * c11-tipos-dispatch.js — Guia: Tipos estáticos × dinâmicos e despacho de métodos.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Hierarquia Animal (Lista B, Q6). `active` realça a classe sendo inspecionada.
  function animalTreeVisual(active) {
    return {
      type: "svg",
      draw: function (svg) {
        C.classTree(svg, {
          w: 620, h: 320,
          nodes: {
            Animal: { x: 300, y: 50 }, Pet: { x: 210, y: 165 }, Lion: { x: 430, y: 165 },
            Cat: { x: 120, y: 280 }, Dog: { x: 300, y: 280 },
          },
          edges: [["Animal", "Pet"], ["Animal", "Lion"], ["Pet", "Cat"], ["Pet", "Dog"]],
          active: active || [],
        });
      },
    };
  }

  function build() {
    return [
      {
        title: "Dois tipos para cada variável",
        body:
          "<p>Toda variável tem:</p>" +
          "<ul>" +
          "<li><b>tipo estático</b> — o tipo <em>declarado</em>; fixo, usado na checagem em tempo de " +
          "compilação;</li>" +
          "<li><b>tipo dinâmico</b> — a <em>classe real</em> do objeto em tempo de execução.</li>" +
          "</ul>" +
          "<p>Regra de ouro: o tipo dinâmico é sempre um <b>subtipo</b> (≤) do estático.</p>",
        visual: animalTreeVisual([]),
      },
      C.tableStep({
        title: "Estático nunca muda (Lista B, Q6)",
        body: "Após w←new Lion, y←new Dog, z←new Cat (a partir das declarações w:Animal, x:Animal←Pet, " +
          "y:Animal←Pet, z:Pet←Pet):",
        headers: ["var", "tipo estático", "tipo dinâmico"],
        rows: [
          ["w", "Animal", "Lion"],
          ["x", "Animal", "Pet"],
          ["y", "Animal", "Dog"],
          ["z", "Pet", "Cat"],
        ],
      }),
      C.domStep(
        "Checar uma chamada de método",
        "Para tipar <code>z &lt;- x.setCenter(y)</code> com assinatura " +
          "<code>setCenter(p : Point) : Bool</code> em Shape, o checador usa os <b>tipos estáticos</b>:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Três checagens</div>" +
          "<ul>" +
          "<li><b>receptor</b>: o tipo de <code>x</code> deve ter (ou herdar) o método → <code>x ≤ Shape</code>;</li>" +
          "<li><b>argumento</b>: <code>tipo(y) ≤ Point</code> (conformância);</li>" +
          "<li><b>resultado</b>: <code>z</code> recebe o tipo de retorno (Bool).</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Combinações válidas e inválidas",
        body: "Aplicando as três checagens à chamada x.setCenter(y):",
        headers: ["x", "y", "z", "ok?"],
        rows: [
          ["Circle", "Point", "Bool", "✓ Circle ≤ Shape, Point ≤ Point"],
          ["Shape", "Point", "Bool", "✓ tudo conforma"],
          ["Rect", "Object", "Bool", "✗ Object não ≤ Point"],
          ["Object", "Object", "Object", "✗ Object não ≤ Shape"],
        ],
      }),
      C.domStep(
        "Despacho dinâmico",
        "Embora a <b>checagem</b> use o tipo estático, a <b>execução</b> escolhe o método pela classe " +
          "<b>dinâmica</b> do receptor — é o polimorfismo.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Estático decide SE pode; dinâmico decide QUAL roda</div>" +
          "Se <code>x</code> tem tipo estático Animal mas guarda um Dog, <code>x.fala()</code> compila " +
          "(Animal tem fala) e, em runtime, chama <code>Dog.fala</code>. Por isso " +
          "<code>c.baz().foo()</code> chama o <code>foo</code> da classe real retornada.</div>"
      ),
      {
        title: "A busca do método — começa na classe real",
        body:
          "<p>Suponha <code>x</code> guardando um <b>Dog</b> (tipo dinâmico) e a chamada " +
          "<code>x.respira()</code>. A busca começa na <b>classe real</b> e sobe pela herança até " +
          "achar o método. <b>Dog</b> não define <code>respira</code> → sobe.</p>",
        visual: animalTreeVisual(["Dog"]),
      },
      {
        title: "Não achou? Sobe um nível",
        body: "<p><b>Pet</b> também não define <code>respira</code>. A busca continua subindo pela " +
          "cadeia de herança.</p>",
        visual: animalTreeVisual(["Pet"]),
      },
      {
        title: "Achou em Animal → executa",
        body:
          "<p><b>Animal</b> define <code>respira()</code> → é o que <b>executa</b>. Se <b>Dog</b> tivesse " +
          "sobrescrito o método, a busca pararia logo nele — é assim que a sobrescrita funciona.</p>",
        visual: animalTreeVisual(["Animal"]),
      },
    ];
  }

  EX.registry.add({
    id: "c11-tipos-dispatch",
    num: "Disp",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "Tipos estáticos, dinâmicos e dispatch",
    type: "conceitual",
    hubDesc: "Estático (declarado) × dinâmico (runtime); checagem de chamada e despacho polimórfico.",
    statement:
      "Entenda a distinção entre tipo estático e dinâmico, a checagem de uma chamada de método " +
      "(receptor, argumento, retorno) e o despacho dinâmico.",
    parts: [{ label: "Guia", build: build }],
  });
})();
