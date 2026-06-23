/*
 * manifest.js — Lista ORDENADA de todos os scripts do projeto.
 *
 * O loader (js/loader.js) carrega estes scripts em ordem e, por fim, js/core/boot.js.
 * Para adicionar uma questão nova: crie o arquivo em js/questions/... e
 * acrescente o caminho na seção "questions" abaixo. (Só este arquivo muda.)
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

    // --- questões: Lista 3 (Computação Gráfica) ---
    // I) Cor e Percepção
    "js/questions/q01.js",
    "js/questions/q02.js",
    "js/questions/q03.js",
    // II) Iluminação e Ray Casting
    "js/questions/q04.js",
    "js/questions/q05.js",
    "js/questions/q06.js",
    "js/questions/q07.js",
    "js/questions/q08.js",
    "js/questions/q09.js",
    "js/questions/q10.js",
    // III) Sombreamento
    "js/questions/q11.js",
    "js/questions/q12.js",
    // IV) Texturas
    "js/questions/q13.js",
    "js/questions/q14.js",
    "js/questions/q15.js",
    // V) Animação e Cinemática
    "js/questions/q16.js",
    "js/questions/q17.js",
    "js/questions/q18.js",
    "js/questions/q19.js",
    "js/questions/q20.js",
  ],
};
