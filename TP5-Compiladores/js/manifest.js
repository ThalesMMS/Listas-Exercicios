/*
 * manifest.js — scripts da sessão TP5 Compiladores.
 * A pasta é autônoma: HTML/CSS/JS puro, sem build, sem fetch e compatível com file://.
 */
window.EX_MANIFEST = {
  scripts: [
    "js/lib/util.js",
    "js/core/registry.js",
    "js/surfaces/canvas-plane.js",
    "js/surfaces/svg.js",
    "js/surfaces/dom.js",
    "js/core/stage.js",
    "js/core/stepper.js",
    "js/core/theme.js",
    "js/core/layout.js",

    "js/components/plane/geometry.js",
    "js/components/plane/raster.js",
    "js/components/diagram/tree.js",
    "js/components/diagram/graph.js",
    "js/components/diagram/automaton.js",
    "js/components/diagram/flowchart.js",
    "js/components/diagram/boxes.js",
    "js/components/diagram/uml.js",
    "js/components/content/table.js",
    "js/components/content/code.js",
    "js/components/content/callout.js",
    "js/components/content/chips.js",
    "js/templates/slides.js",
    "js/templates/walkthrough.js",

    "js/tp5/kit.js",
    "js/tp5/t00-overview.js",
    "js/tp5/t01-mips-registers.js",
    "js/tp5/t02-object-layout.js",
    "js/tp5/t03-tables-tags.js",
    "js/tp5/t04-calling-convention.js",
    "js/tp5/t05-expression-codegen.js",
    "js/tp5/t06-runtime-gc.js",
    "js/tp5/t07-exam-qa.js",
  ],
};
