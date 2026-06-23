/*
 * manifest.js — Lista ORDENADA de todos os scripts do projeto (Lista 2).
 *
 * O loader (js/loader.js) carrega estes scripts em ordem e, por fim, js/core/boot.js.
 * A ORDEM das questões aqui define a ORDEM no hub (registry.grouped() é estável).
 * Para adicionar uma questão: crie o arquivo em js/questions/lista2/ e acrescente
 * o caminho na seção "questões" abaixo.
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
    "../shared/related-guides.js",
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

    // --- questões: Lista de Exercícios 2 ---
    // Visualização 3D e Projeções
    "js/questions/lista2/q01.js",
    "js/questions/lista2/q02.js",
    "js/questions/lista2/q03.js",
    // Representação de Sólidos
    "js/questions/lista2/q04.js",
    "js/questions/lista2/q05.js",
    "js/questions/lista2/q06.js",
    "js/questions/lista2/q07.js",
    // Malhas Poligonais
    "js/questions/lista2/q08.js",
    "js/questions/lista2/q09.js",
    // Curvas Paramétricas
    "js/questions/lista2/q10.js",
    "js/questions/lista2/q11.js",
    "js/questions/lista2/q12.js",
    // Superfícies Implícitas
    "js/questions/lista2/q13.js",
    "js/questions/lista2/q14.js",
    "js/questions/lista2/q15.js",
  ],
};
