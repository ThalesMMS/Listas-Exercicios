/*
 * manifest.js — Lista ORDENADA de todos os scripts do Guia passo a passo.
 *
 * O loader (js/loader.js) carrega estes scripts em ordem e, por fim,
 * js/core/boot.js. A ordem dos guias aqui é a ordem em que aparecem no hub
 * (registry.grouped() preserva a ordem de registro).
 *
 * Para adicionar um guia novo: crie o arquivo em js/guias/ e acrescente o
 * caminho na seção "guias" abaixo. (Só este arquivo muda.)
 */
window.EX_MANIFEST = {
  scripts: [
    // --- biblioteca + núcleo ---
    "js/lib/util.js",
    "js/lib/algorithms.js", // window.ALG: traços exatos (DDA, Bresenham, clipping, …)
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

    // --- helpers dos guias ---
    "js/guias/_helpers.js",

    // --- guias passo a passo ---
    // Transformações
    "js/guias/g01-transformacoes.js",
    // Rasterização
    "js/guias/g02-dda.js",
    "js/guias/g03-bresenham-reta.js",
    "js/guias/g04-bresenham-circ.js",
    // Recorte
    "js/guias/g05-cohen-sutherland.js",
    "js/guias/g06-liang-barsky.js",
    "js/guias/g07-sutherland-hodgman.js",
    // Preenchimento
    "js/guias/g08-boundary-fill.js",
    "js/guias/g09-flood-fill.js",
    "js/guias/g10-scanline.js",
    // Sólidos
    "js/guias/g11-octree.js",
    "js/guias/g12-bsp.js",
    "js/guias/g13-csg.js",
    // Curvas & Fractais
    "js/guias/g16-parametrica.js",
    "js/guias/g15-bezier.js",
    "js/guias/g14-mandelbrot.js",
    // Iluminação & Renderização
    "js/guias/g17-ray-casting.js",
    "js/guias/g18-phong.js",
    "js/guias/g19-sombreamento.js",
    "js/guias/g20-textura.js",
    // Animação
    "js/guias/g21-keyframing.js",
    "js/guias/g22-morphing.js",
    "js/guias/g22-morphing-exercicios.js",
    "js/guias/g23-cinematica.js",
    "js/guias/g24-bones.js",
  ],
};
