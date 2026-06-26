/* t02-object-layout.js — Layout de objetos, protótipos e constantes. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  function objectDiagram(extraRows, hot) {
    return {
      type: "svg",
      view: [760, 330],
      draw: function (svg) {
        var rows = [
          { off: "-1", value: "-1  (eye catcher / GC sanity)" },
          { off: "+0", value: "class tag", hot: hot === "tag" },
          { off: "+1", value: "size in words", hot: hot === "size" },
          { off: "+2", value: "dispTab pointer", hot: hot === "disp" },
        ].concat(extraRows || [
          { off: "+3", value: "attr0" },
          { off: "+4", value: "attr1" },
          { off: "+5", value: "..." },
        ]);
        T.memoryObject(svg, 205, 38, rows);
        svg.text(380, 300, "Todo objeto COOL tem o mesmo cabeçalho. O restante depende da classe.", { size: 14, weight: 800, color: "var(--ink-dim)" });
      },
    };
  }

  EX.registry.add({
    id: "02-object-layout",
    num: "02",
    subject: "TP5 Compiladores",
    section: "Objetos e constantes",
    title: "Layout de objetos, protótipos e constantes",
    type: "conceitual",
    tags: ["object layout", "prototype", "constants"],
    hubDesc: "Cabeçalho universal, slots de atributos, Class_protObj, defaults e constantes boxeadas.",
    statement: "Entender como os objetos COOL são representados no heap e por que os protótipos tornam <code>new</code> simples.",
    parts: [
      {
        label: "Memória de objetos",
        build: function () {
          return [
            {
              title: "Layout universal de objeto",
              body:
                `<p>Todo objeto COOL começa por um cabeçalho de três palavras. Antes do label do objeto, o runtime espera um <b>eye catcher</b> <code>-1</code>, usado como marcador de sanidade pelo coletor.</p>` +
                T.formula(`word -1   eye catcher
word +0   class tag
word +1   size in words
word +2   dispatch table pointer
word +3   attribute 0
word +4   attribute 1
...`) +
                `<p>Como o cabeçalho tem 3 palavras, o primeiro atributo fica no offset de palavra <code>3</code>.</p>`,
              visual: objectDiagram(null, "disp"),
            },
            {
              title: "Offset de atributos é decisão de layout",
              body:
                `<p>O layout de uma classe é calculado uma vez, antes da emissão de métodos. O resultado principal é o mapa <code>attr_offset[name]</code>.</p>` +
                T.formula(`offset(attribute k) = DEFAULT_OBJFIELDS + k
                         = 3 + k`) +
                `<p>Assim, o código de acesso a atributo não precisa procurar campos em runtime: basta emitir <code>lw/sw</code> no offset conhecido em relação a <code>$s0</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 330],
                draw: function (svg) {
                  T.memoryObject(svg, 180, 40, [
                    { off: "-1", value: "-1" },
                    { off: "+0", value: "tag: Point" },
                    { off: "+1", value: "size = 5" },
                    { off: "+2", value: "Point_dispTab" },
                    { off: "+3", value: "x : Int", hot: true },
                    { off: "+4", value: "y : Int", hot: true },
                  ]);
                  svg.text(565, 210, "attr_offset[x] = 3", { anchor: "start", mono: true, size: 13, color: "var(--yellow)", weight: 800 });
                  svg.text(565, 248, "attr_offset[y] = 4", { anchor: "start", mono: true, size: 13, color: "var(--yellow)", weight: 800 });
                },
              },
            },
            T.domStep(
              "Valores default nos protótipos",
              `<p>Para cada classe, o gerador emite um objeto modelo <code>Class_protObj</code>. O <code>new</code> copia esse modelo e depois chama o inicializador.</p>` +
                `<p>Cada slot de atributo recebe um valor padrão de acordo com o tipo declarado:</p>`,
              T.table(
                ["Tipo declarado", "Valor default no slot"],
                [
                  ["<code>Int</code>", "<code>int_const0</code> (0 boxeado)"],
                  ["<code>Bool</code>", "<code>bool_const0</code> (false)"],
                  ["<code>String</code>", "<code>str_const0</code> (string vazia)"],
                  ["outros tipos", "<code>0</code> = void / null pointer"],
                ],
                -1
              ) +
                T.note("tip", "Por que isso importa", `<p>O protótipo dá forma correta ao objeto antes de qualquer inicializador de atributo rodar.</p>`)
            ),
            {
              title: "new T = copiar protótipo + inicializar",
              body:
                `<p>Com protótipos, a construção de objeto fica uniforme. A emissão de <code>new T</code> carrega o protótipo, chama <code>Object.copy</code> e executa o inicializador da classe.</p>` +
                T.code(`la  $a0 T_protObj
jal Object.copy
jal T_init`, "new T") +
                `<p>Depois de <code>Object.copy</code>, <code>$a0</code> aponta para um objeto novo; <code>T_init</code> preenche os atributos com inicializações explícitas.</p>`,
              visual: {
                type: "svg",
                view: [800, 300],
                draw: function (svg) {
                  T.box(svg, 55, 88, 170, 82, "T_protObj", ["shape + defaults"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  svg.arrow(235, 129, 320, 129, { color: "var(--ink-mute)" });
                  T.box(svg, 330, 88, 155, 82, "Object.copy", ["clone heap object"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(495, 129, 580, 129, { color: "var(--ink-mute)" });
                  T.box(svg, 590, 88, 155, 82, "T_init", ["run attr inits", "return SELF"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(400, 232, "$a0 carrega o objeto novo ao longo da sequência.", { mono: true, size: 14, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "Constantes também são objetos completos",
              body:
                `<p><code>String</code>, <code>Int</code> e <code>Bool</code> constantes são objetos boxeados com cabeçalho, dispatch table e valor interno. Isso permite despachar métodos sobre literais.</p>` +
                T.panels([
                  { title: "String", html: `<p><code>[tag][size][String_dispTab][length][chars...]</code></p>` },
                  { title: "Int", html: `<p><code>[tag][size][Int_dispTab][value]</code></p>` },
                  { title: "Bool", html: `<p><code>[tag][size][Bool_dispTab][0/1]</code></p>` },
                ], 3),
              visual: {
                type: "svg",
                view: [820, 330],
                draw: function (svg) {
                  T.memoryObject(svg, 55, 55, [
                    { off: "-1", value: "-1" },
                    { off: "+0", value: "string tag" },
                    { off: "+1", value: "size incl. chars" },
                    { off: "+2", value: "String_dispTab" },
                    { off: "+3", value: "int_const<len>" },
                    { off: "+4", value: "chars + \\0" },
                  ], { valW: 210 });
                  T.memoryObject(svg, 470, 92, [
                    { off: "-1", value: "-1" },
                    { off: "+0", value: "Int tag" },
                    { off: "+1", value: "size = 4" },
                    { off: "+2", value: "Int_dispTab" },
                    { off: "+3", value: "value", hot: true },
                  ], { valW: 180 });
                  svg.text(165, 28, "str_constN", { mono: true, weight: 800, color: "var(--purple)", size: 13 });
                  svg.text(565, 65, "int_constN", { mono: true, weight: 800, color: "var(--accent)", size: 13 });
                },
              },
            },
            {
              title: "Por que constantes têm dispTab",
              body:
                `<p>COOL permite chamadas como <code>"oi".length()</code>, <code>5.copy()</code> e <code>true.type_name()</code>. Portanto, o literal precisa carregar um ponteiro para a dispatch table correta.</p>` +
                T.formula(`literal → objeto completo → dispTab → método`) +
                `<p>Sem o campo <code>dispTab</code>, despacho dinâmico sobre constantes quebraria a interface esperada pelo runtime.</p>`,
              visual: {
                type: "svg",
                view: [800, 260],
                draw: function (svg) {
                  T.box(svg, 70, 82, 150, 78, "\"hi\"", ["str_const"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  svg.arrow(230, 121, 325, 121, { color: "var(--ink-mute)" });
                  T.box(svg, 335, 82, 160, 78, "String_dispTab", ["slot length", "slot concat"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(505, 121, 600, 121, { color: "var(--ink-mute)" });
                  T.box(svg, 610, 82, 120, 78, "String.length", ["runtime"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(400, 212, "Literal também participa do mesmo mecanismo de despacho dos demais objetos.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "Globais especiais para o runtime",
              body:
                `<p>No cabeçalho de dados, o gerador declara símbolos que o runtime conhece pelo nome.</p>` +
                T.code(`.globl Main_protObj
.globl Int_protObj
.globl String_protObj
.globl bool_const0
.globl bool_const1
_int_tag:    .word <tag de Int>
_bool_tag:   .word <tag de Bool>
_string_tag: .word <tag de String>`, "globais relevantes") +
                `<p>Esses labels são uma interface: o runtime não pergunta ao compilador onde está <code>Int</code>; ele procura os nomes padronizados.</p>`,
              visual: objectDiagram([
                { off: "+3", value: "default attr values" },
                { off: "+4", value: "..." },
              ], "tag"),
            },
          ];
        },
      },
    ],
  });
})();
