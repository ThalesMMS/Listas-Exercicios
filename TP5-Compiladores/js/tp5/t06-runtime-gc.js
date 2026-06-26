/* t06-runtime-gc.js — Verificações de runtime e GC. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  EX.registry.add({
    id: "06-runtime-gc",
    num: "06",
    subject: "TP5 Compiladores",
    section: "Runtime e GC",
    title: "Runtime checks e garbage collection",
    type: "conceitual",
    tags: ["runtime", "GC", "abort"],
    hubDesc: "Quais erros o gerador detecta, quais ficam para SPIM/runtime e quando emitir barreiras de escrita.",
    statement: "Distinguir responsabilidades do código gerado, do SPIM e do runtime COOL.",
    parts: [
      {
        label: "Checks e GC",
        build: function () {
          return [
            T.domStep(
              "Seis erros de runtime: três são do gerador",
              `<p>O TP5 exige que o gerador emita checks para erros estruturais que ele consegue detectar antes de acessar memória perigosa. Outros erros ficam para SPIM ou runtime.</p>`,
              T.table(
                ["Erro", "Quem trata", "Rotina/mecanismo"],
                [
                  ["dispatch sobre void", "gerador", "<code>_dispatch_abort</code>"],
                  ["case sobre void", "gerador", "<code>_case_abort2</code>"],
                  ["case sem branch compatível", "gerador", "<code>_case_abort</code>"],
                  ["divisão por zero", "SPIM/runtime", "não precisa emitir check"],
                  ["substring fora do intervalo", "runtime", "<code>trap.handler</code>"],
                  ["out of memory", "runtime", "<code>trap.handler</code>"],
                ],
                -1
              ) +
                T.note("tip", "Mnemônico", `<p>O gerador trata os erros de <b>void/no-match</b>; o runtime trata erros dependentes de valores internos.</p>`)
            ),
            {
              title: "Dispatch on void → _dispatch_abort",
              body:
                `<p>Antes de ler a dispatch table do receiver, é obrigatório verificar se <code>$a0</code> não é zero. Caso contrário, o código tentaria acessar <code>8($a0)</code>.</p>` +
                T.code(`receiver->code()          # $a0 = objeto ou 0
bne $a0 $zero ok
  la $a0 str_const<filename>
  li $t1 <line number>
  jal _dispatch_abort
ok:
  lw $t1 8($a0)
  lw $t1 slot*4($t1)
  jalr $t1`, "check de dispatch") +
                `<p>A rotina recebe nome de arquivo em <code>$a0</code> e linha em <code>$t1</code>.</p>`,
              visual: {
                type: "svg",
                view: [780, 300],
                draw: function (svg) {
                  T.box(svg, 65, 92, 150, 78, "$a0", ["receiver"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(230, 131, 315, 90, { color: "var(--green)", head: 9 });
                  svg.arrow(230, 131, 315, 175, { color: "var(--red)", head: 9 });
                  T.box(svg, 325, 52, 170, 72, "não void", ["carrega dispTab"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  T.box(svg, 325, 150, 170, 72, "void", ["_dispatch_abort"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
                  svg.arrow(505, 88, 625, 88, { color: "var(--green)", head: 9 });
                  T.box(svg, 635, 52, 92, 72, "jalr", ["method"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                },
              },
            },
            {
              title: "case on void e no matching branch",
              body:
                `<p><code>case</code> tem dois aborts diferentes. Se a expressão escrutinada é void, o gerador chama <code>_case_abort2</code> com arquivo e linha. Se não houver branch compatível, chama <code>_case_abort</code> com o objeto em <code>$a0</code>.</p>` +
                T.code(`expr->code()
bne $a0 $zero ok
  la $a0 str_const<filename>
  li $t1 <line>
  jal _case_abort2
ok:
  # testar branches por tag
  ...
  # se nenhum casou:
  move $a0 <scrutinee>
  jal _case_abort`, "case") +
                `<p>A diferença é a informação disponível: no primeiro caso não há objeto; no segundo, há objeto, mas nenhuma alternativa aceita sua tag.</p>`,
              visual: {
                type: "svg",
                view: [780, 300],
                draw: function (svg) {
                  T.box(svg, 60, 92, 145, 78, "expr", ["$a0"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(218, 131, 312, 86, { color: "var(--red)", head: 9 });
                  svg.arrow(218, 131, 312, 176, { color: "var(--green)", head: 9 });
                  T.box(svg, 325, 50, 190, 72, "$a0 == 0", ["_case_abort2"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
                  T.box(svg, 325, 150, 190, 72, "tag tests", ["branches"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.arrow(528, 186, 638, 186, { color: "var(--yellow)", head: 9 });
                  T.box(svg, 650, 150, 90, 72, "no match", ["abort"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                },
              },
            },
            {
              title: "GC selection: sempre emitir os globais",
              body:
                `<p>Mesmo com GC desabilitado por padrão, o assembly precisa declarar os pontos de seleção de coletor. O runtime lê esses labels para instalar o gerenciador correto.</p>` +
                T.code(`_MemMgr_INITIALIZER: .word _NoGC_Init
_MemMgr_COLLECTOR:   .word _NoGC_Collect
_MemMgr_TEST:        .word 0`, "default sem GC") +
                `<p>Flags como <code>-g</code>, <code>-t</code> e <code>-T</code> podem alterar a seleção/testes. O projeto pode começar com NoGC e depois adicionar suporte cuidadoso ao GC geracional.</p>`,
              visual: {
                type: "svg",
                view: [780, 270],
                draw: function (svg) {
                  T.box(svg, 70, 78, 190, 92, "flags", ["-g", "-t", "-T"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(272, 124, 370, 124, { color: "var(--ink-mute)" });
                  T.box(svg, 380, 58, 190, 132, "_MemMgr_*", ["INITIALIZER", "COLLECTOR", "TEST"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  svg.arrow(582, 124, 665, 124, { color: "var(--ink-mute)" });
                  T.box(svg, 675, 78, 70, 92, "runtime", ["GC"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                },
              },
            },
            {
              title: "Write barrier: só para atributos no heap",
              body:
                `<p>Com GC geracional, quando um objeto velho passa a apontar para um objeto jovem, o coletor precisa ser avisado. Por isso, atribuições a <b>atributos</b> emitem barreira de escrita quando <code>-g</code> está ativo.</p>` +
                T.code(`addiu $a1 $s0 offset*4     # endereço do slot modificado
jal   _GenGC_Assign        # registra a escrita`, "emit_gc_attr_assign(offset)") +
                `<p>Locais e parâmetros ficam na pilha, que o coletor já percorre como root set; eles não precisam de barreira explícita.</p>`,
              visual: {
                type: "svg",
                view: [800, 300],
                draw: function (svg) {
                  T.box(svg, 55, 82, 170, 92, "heap object", ["$s0", "attr slot"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(235, 128, 350, 128, { color: "var(--yellow)", head: 9 });
                  T.box(svg, 360, 82, 170, 92, "_GenGC_Assign", ["write barrier"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.arrow(540, 128, 655, 128, { color: "var(--green)", head: 9 });
                  T.box(svg, 665, 82, 90, 92, "GC", ["remember set"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(405, 230, "ATTR escreve heap → barreira. LOCAL/PARAM escreve stack → sem barreira.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            T.domStep(
              "Onde a barreira aparece no código do gerador",
              `<p>O projeto emite a barreira somente nos dois lugares em que um slot de atributo pode receber novo valor:</p>`,
              T.table(
                ["Local no gerador", "Quando", "Por quê"],
                [
                  ["<code>assign_class::code</code>", "atribuição a atributo", "<code>self.attr</code> muda ponteiro no heap"],
                  ["<code>emit_attr_inits_for</code>", "inicializador de atributo", "slot de objeto recém-copiado é preenchido"],
                  ["<code>let</code>/<code>case</code>", "nunca", "slots ficam na pilha"],
                  ["parâmetros", "nunca", "já estão no frame"],
                ],
                -1
              )
            ),
            {
              title: "Eye catcher -1",
              body:
                `<p>Cada objeto/constante é precedido por <code>.word -1</code>. Esse marcador não faz parte dos offsets normais do objeto; ele fica antes do label. O coletor usa esse valor para validar caminhadas no heap.</p>` +
                T.formula(`.word -1
Class_protObj:
  .word <tag>
  .word <size>
  .word Class_dispTab
  ...`) +
                `<p>O header <code>tag/size/dispTab</code> também ajuda o coletor a saber o tamanho do objeto e quais slots visitar.</p>`,
              visual: {
                type: "svg",
                view: [760, 300],
                draw: function (svg) {
                  T.memoryObject(svg, 215, 45, [
                    { off: "-1", value: "-1  ← marcador de sanidade", hot: true },
                    { off: "+0", value: "tag" },
                    { off: "+1", value: "size" },
                    { off: "+2", value: "dispTab" },
                    { off: "+3...", value: "atributos / valor interno" },
                  ]);
                  svg.text(380, 252, "Se o heap for corrompido, o marcador ajuda a detectar o problema.", { size: 14, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            T.domStep(
              "Resumo operacional",
              `<p>Para revisar antes de mexer no cgen:</p>`,
              T.table(
                ["Preocupação", "Mecanismo", "Quando"],
                [
                  ["void dispatch", "<code>_dispatch_abort(file,line)</code>", "antes de ler dispTab"],
                  ["void case", "<code>_case_abort2(file,line)</code>", "antes de ler tag"],
                  ["case sem branch", "<code>_case_abort(object)</code>", "após todos os testes falharem"],
                  ["GC seleção", "<code>_MemMgr_*</code>", "sempre em <code>.data</code>"],
                  ["GC barreira", "<code>_GenGC_Assign</code>", "somente <code>-g</code> e escrita em atributo"],
                  ["sanidade heap", "<code>-1</code> eye catcher", "antes de objetos/constantes"],
                ],
                -1
              )
            ),
          ];
        },
      },
    ],
  });
})();
