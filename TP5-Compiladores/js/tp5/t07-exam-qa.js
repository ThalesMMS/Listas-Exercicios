/* t07-exam-qa.js — Revisão de prova/perguntas prováveis. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  function qa(cards) {
    return (
      "<div class='tp5-qa'>" +
      cards
        .map(function (c) {
          return "<section class='tp5-qa-card'><strong>" + T.esc(c.q) + "</strong><p>" + c.a + "</p></section>";
        })
        .join("") +
      "</div>"
    );
  }

  EX.registry.add({
    id: "07-exam-qa",
    num: "07",
    subject: "TP5 Compiladores",
    section: "Revisão",
    title: "Perguntas prováveis e respostas curtas",
    type: "revisão",
    tags: ["exame", "checklist", "drills"],
    hubDesc: "Checklist de respostas: passes, layout, dispatch, SELF_TYPE, frame, arithmetic, runtime errors e GC.",
    statement: "Transformar o README técnico em respostas curtas, úteis para prova e defesa do projeto.",
    parts: [
      {
        label: "Perguntas conceituais",
        build: function () {
          return [
            T.domStep(
              "Passes do gerador",
              `<p>Use esta resposta quando perguntarem “como seu gerador é organizado?”.</p>`,
              qa([
                { q: "Quais são os passes do code generator?", a: "Pré-análise: tags DFS + layouts. Emissão de <code>.data</code>: constantes, tabelas e protótipos. Emissão de <code>.text</code>: inicializadores e métodos." },
                { q: "Por que separar layout antes de expressão?", a: "Porque expressão precisa consultar offset de atributos, slots de métodos, tags e tabelas. Sem essa fase, o código emitido dependeria de decisões ainda não calculadas." },
                { q: "Qual é o ponto de entrada?", a: "<code>program_class::cgen(ostream&)</code> cria <code>CgenClassTable</code> e chama <code>code()</code>." },
                { q: "Qual é a regra de avaliação?", a: "Toda <code>Expression::code</code> deixa seu resultado em <code>$a0</code>. Se precisar preservar valor, empilha antes de avaliar outra expressão." },
              ])
            ),
            T.domStep(
              "Layout, protótipos e dispatch",
              `<p>Estas são as respostas de alto rendimento para objetos e despacho.</p>`,
              qa([
                { q: "Descreva o layout de um objeto COOL.", a: "<code>[tag][size][dispTab][attr0][attr1]...</code>, com cabeçalho de 3 palavras. Antes do label há um <code>-1</code> eye catcher." },
                { q: "Por que existem protótipos?", a: "<code>new</code> copia <code>Class_protObj</code> para obter um objeto com shape/defaults corretos e depois chama <code>Class_init</code>." },
                { q: "Como overrides funcionam?", a: "O método sobrescrito substitui o slot herdado, mas preserva o índice. O caller usa o mesmo slot; a tabela dinâmica aponta para a implementação correta." },
                { q: "Por que constantes têm dispTab?", a: "Porque literais também recebem chamadas: <code>\"hi\".length()</code>, <code>5.copy()</code>, <code>true.type_name()</code>." },
              ])
            ),
            T.domStep(
              "SELF_TYPE, case e tags",
              `<p>Quando o assunto envolve tipos dinâmicos, responda com tags e tabelas.</p>`,
              qa([
                { q: "Como new SELF_TYPE difere de new T?", a: "<code>new T</code> usa labels fixos. <code>new SELF_TYPE</code> lê a tag dinâmica de <code>self</code> e indexa <code>class_objTab</code> para obter protótipo e init corretos." },
                { q: "Por que tags por DFS preorder?", a: "Descendentes ficam em faixa contígua e com tags maiores que a classe ancestral; isso facilita teste de subtipo e ordenação de branches de <code>case</code>." },
                { q: "Como case escolhe a branch mais específica?", a: "Ordena branches por tag descendente e testa tags descendentes aceitáveis. Subclasses têm tags maiores, logo aparecem antes de ancestrais." },
                { q: "O que class_objTab contém?", a: "Duas palavras por tag: <code>Class_protObj</code> e <code>Class_init</code>." },
              ])
            ),
            T.domStep(
              "Runtime e GC",
              `<p>Separe com clareza o que o gerador detecta e o que fica para runtime/SPIM.</p>`,
              qa([
                { q: "Quais erros o gerador deve emitir?", a: "Dispatch sobre void (<code>_dispatch_abort</code>), case sobre void (<code>_case_abort2</code>) e case sem branch (<code>_case_abort</code>)." },
                { q: "Quais erros não precisam de check no gerador?", a: "Divisão por zero, substring fora de faixa e out-of-memory ficam para SPIM/runtime." },
                { q: "Quando emitir write barrier?", a: "Somente com GC geracional (<code>-g</code>) e somente em escrita de atributo, via <code>_GenGC_Assign</code>." },
                { q: "Por que locals/params não têm barreira?", a: "Porque vivem na pilha, e a pilha já é percorrida pelo coletor como root set." },
              ])
            ),
          ];
        },
      },
      {
        label: "Drills de frame e assembly",
        build: function () {
          return [
            T.domStep(
              "Frame drill: método com dois formais",
              `<p>Para um método <code>f(a,b)</code>, use a fórmula <code>arg_k = (N-k-1)+3</code>.</p>`,
              T.table(
                ["Variável", "k", "Offset"],
                [
                  ["<code>a</code>", "0", "<code>(2-0-1)+3 = 4</code> → <code>4($fp)</code>"],
                  ["<code>b</code>", "1", "<code>(2-1-1)+3 = 3</code> → <code>3($fp)</code>"],
                  ["primeiro local", "—", "região local reservada por <code>count_max_locals</code>"],
                ],
                -1
              ) +
                T.note("tip", "Resposta curta", `<p>O primeiro formal fica mais fundo na pilha porque foi empilhado primeiro; por isso tem offset maior.</p>`)
            ),
            {
              title: "Visual: frame de f(a,b)",
              body:
                `<p>Visualmente, os argumentos estão acima do frame salvo; locals ficam abaixo. A parte que mais importa nos exercícios é localizar formais e distinguir ATTR/PARAM/LOCAL.</p>`,
              visual: {
                type: "svg",
                view: [760, 350],
                draw: function (svg) {
                  T.stackFrame(svg, 235, 50, [
                    { off: "+4", label: "a : formal 0", hot: true },
                    { off: "+3", label: "b : formal 1", hot: true },
                    { off: "save", label: "saved old $fp / SELF / $ra", warn: true },
                    { off: "$fp", label: "base do frame", fp: true, color: "var(--orange)" },
                    { off: "local", label: "let/case locals", hot: true },
                  ], { title: "f(a,b)" });
                },
              },
            },
            T.domStep(
              "Assembly drill: if",
              `<p>Padrão mínimo de <code>if cond then A else B fi</code>:</p>`,
              T.code(`<cond code>
lw   $t1 12($a0)
beqz $t1 else_lbl
<A code>
b    end_lbl
else_lbl:
<B code>
end_lbl:`, "if")
            ),
            T.domStep(
              "Assembly drill: x + y",
              `<p>Use o padrão de aritmética e lembre: resultado é um novo <code>Int</code>, não a modificação de um literal compartilhado.</p>`,
              T.code(`<x code>
sw   $a0 0($sp)
addiu $sp $sp -4
<y code>
jal  Object.copy
addiu $sp $sp 4
lw   $t1 0($sp)
lw   $t1 12($t1)
lw   $t2 12($a0)
add  $t1 $t1 $t2
sw   $t1 12($a0)`, "x + y")
            ),
            T.domStep(
              "Assembly drill: obj.m(arg)",
              `<p>Não esqueça a ordem: actuals primeiro, receiver depois, check de void antes de ler a dispatch table.</p>`,
              T.code(`<arg code>
push $a0
<obj code>
bne $a0 $zero ok
  la $a0 str_const<filename>
  li $t1 <line>
  jal _dispatch_abort
ok:
lw   $t1 8($a0)
lw   $t1 slot*4($t1)
jalr $t1`, "dispatch dinâmico")
            ),
          ];
        },
      },
      {
        label: "Checklist de implementação",
        build: function () {
          return [
            T.domStep(
              "Checklist antes da entrega",
              `<p>Use como lista de revisão rápida do TP5.</p>`,
              T.table(
                ["Item", "Sinal de que está correto"],
                [
                  ["README", "explica decisões de design e invariantes do gerador"],
                  ["<code>example.cl</code>", "testa dispatch, static dispatch, new, SELF_TYPE, case, let, loops, strings e erros esperados"],
                  ["tags/layouts", "tabelas dependem de ordem de herança e overrides preservam slot"],
                  ["<code>.data</code>", "inclui constants, class_nameTab, class_objTab, dispTabs, protObjs, bools e tags básicos"],
                  ["<code>.text</code>", "inclui inits e métodos de usuário; básicos ficam no runtime"],
                  ["checks", "dispatch void, case void e no-branch emitidos"],
                  ["GC", "<code>_MemMgr_*</code> emitidos; barreira só em attr writes quando aplicável"],
                ],
                -1
              )
            ),
            T.domStep(
              "Prompts de modificação comuns",
              `<p>Se a prova pedir “implemente/modifique”, responda em termos do padrão já conhecido.</p>`,
              qa([
                { q: "Adicionar novo operador aritmético", a: "Reusar <code>emit_arith</code>: eval/push/eval, <code>Object.copy</code>, unbox, opera, rebox no objeto fresco." },
                { q: "Otimizar case por faixa", a: "Trocar lista de <code>beq</code> por teste <code>low <= tag <= high</code>, aproveitando tags DFS contíguas." },
                { q: "Explicar estabilidade de method offset", a: "Override substitui <code>method_defining_class</code> no mesmo slot; chamadas antigas continuam apontando para o índice correto." },
                { q: "Por que SELF é callee-saved?", a: "Chamadas aninhadas sobrescrevem <code>$a0</code>; <code>$s0</code> mantém o receiver atual durante todo o método." },
              ])
            ),
            {
              title: "Mapa de arquivos do TP5",
              body:
                `<p>Resposta objetiva para “onde está cada coisa no projeto?”.</p>` +
                T.table(
                  ["Arquivo", "Responsabilidade"],
                  [
                    ["<code>cgen.cc</code>", "CgenClassTable, emissão de tabelas, inits, métodos e <code>code()</code> das expressões"],
                    ["<code>cgen.h</code>", "CgenClassTable/CgenNode/ClassLayout/VarLoc e globais auxiliares"],
                    ["<code>emit.h</code>", "registradores, opcodes, constantes de layout e macros de labels"],
                    ["<code>example.cl</code>", "teste ponta a ponta"],
                    ["<code>README</code>", "decisões de design e justificativa de correção"],
                  ],
                  -1
                ),
              visual: {
                type: "svg",
                view: [800, 300],
                draw: function (svg) {
                  T.box(svg, 65, 70, 150, 86, "cgen.cc", ["emissão", "expressões"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  T.box(svg, 245, 70, 150, 86, "cgen.h", ["layout", "VarLoc"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  T.box(svg, 425, 70, 150, 86, "emit.h", ["MIPS API", "macros"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  T.box(svg, 605, 70, 130, 86, "README", ["design", "provas"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.text(400, 230, "A defesa do TP5 combina código emitido + justificativa escrita.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
          ];
        },
      },
    ],
  });
})();
