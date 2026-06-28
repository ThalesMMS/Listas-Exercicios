/*
 * manifest.js — Lista ORDENADA de todos os scripts do Guia de Compiladores.
 * O loader carrega em ordem e, por fim, js/core/boot.js. A ordem dos guias aqui
 * é a ordem do hub (registry.grouped() preserva a ordem de registro).
 */
window.EX_MANIFEST = {
  scripts: [
    // --- biblioteca + núcleo ---
    "js/lib/util.js",
    "js/core/registry.js",
    "js/surfaces/canvas-plane.js",
    "js/surfaces/svg.js",
    "js/surfaces/dom.js",
    "js/core/stage.js",
    "js/core/stepper.js",
    "js/core/theme.js",
    "js/core/layout.js",

    // --- componentes: plano (canvas) ---
    "js/components/plane/geometry.js",
    "js/components/plane/raster.js",

    // --- componentes: diagramas (svg) ---
    "js/components/diagram/tree.js",
    "js/components/diagram/graph.js",
    "js/components/diagram/automaton.js",
    "js/components/diagram/flowchart.js",
    "js/components/diagram/boxes.js",
    "js/components/diagram/uml.js",

    // --- componentes: conteúdo (dom) ---
    "js/components/content/table.js",
    "js/components/content/code.js",
    "js/components/content/callout.js",
    "js/components/content/chips.js",

    // --- templates de slide ---
    "js/templates/slides.js",
    "js/templates/walkthrough.js",

    // --- helpers (kit das listas + helpers dos guias) ---
    "js/guias/kit.js",
    "js/guias/_helpers.js",

    // --- guias ---
    // Análise Léxica
    "js/guias/c01-lexica.js",
    // Gramáticas
    "js/guias/c02-glc.js",
    "js/guias/c03-fatoracao.js",
    "js/guias/c04-recursao-esquerda.js",
    // Análise Sintática LL(1)
    "js/guias/c05-first-follow.js",
    "js/guias/c06-tabela-ll1.js",
    "js/guias/c07-parsing-ll1.js",
    // Análise Semântica
    "js/guias/c08-escopo.js",
    "js/guias/c09-regras-tipo.js",
    "js/guias/c10-lub.js",
    "js/guias/c11-tipos-dispatch.js",
    "js/guias/c12-self-type.js",
    "js/guias/c21-tabela-simbolos.js",
    // Semântica Operacional
    "js/guias/c22-semantica-linguagens.js",
    "js/guias/c23-semantica-operacional.js",
    "js/guias/c24-semantica-cool.js",
    // Geração de Código
    "js/guias/c13-geracao-codigo.js",
    "js/guias/c14-registros-ativacao.js",
    "js/guias/c25-runtime-organization.js",
    "js/guias/c26-alinhamento-memoria.js",
    "js/guias/c27-codigo-intermediario.js",
    // Otimização
    "js/guias/c32-otimizacao-dataflow.js",
    "js/guias/c15-otimizacao-local.js",
    "js/guias/c16-propagacao-constantes.js",
    "js/guias/c17-vivacidade.js",
    "js/guias/c28-peephole-optimization.js",
    "js/guias/c30-cache-loop-interchange.js",
    // Alocação de Registradores
    "js/guias/c18-rig-coloracao.js",
    "js/guias/c29-spilling-avancado.js",
    // Gerenciamento de Memória
    "js/guias/c33-gerenciamento-automatico-memoria.js",
    "js/guias/c19-coleta-lixo.js",
    "js/guias/c20-contagem-referencias.js",
    "js/guias/c31-coleta-conservadora.js",
  ],
};
