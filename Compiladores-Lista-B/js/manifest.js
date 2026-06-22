/*
 * manifest.js — Lista ORDENADA de todos os scripts do projeto.
 *
 * O loader (js/loader.js) carrega estes scripts em ordem e, por fim, js/core/boot.js.
 * Para adicionar uma questão nova: crie o arquivo em js/questions/... e
 * acrescente o caminho na seção "questions" abaixo. (Só este arquivo muda.)
 */
window.EX_MANIFEST = {
  scripts: [
    // --- configuracao editavel desta copia ---
    "js/config.js",

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

    // --- helpers e questões de Compiladores ---
    "js/questions/compiladores/kit.js",
    "js/questions/compiladores/lista-b.js",
  ],
};
