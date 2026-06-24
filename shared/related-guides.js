(function () {
  "use strict";

  var CG_BASE = "../Guia-de-Computacao-Grafica/question.html?q=";
  var COMP_BASE = "../Guia-de-Compiladores/question.html?q=";

  function norm(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function textOf(q) {
    return norm([q.subject, q.section, q.title, (q.tags || []).join(" ")].join(" "));
  }

  function guide(base, id, title, terms) {
    return { href: base + encodeURIComponent(id), title: title, terms: terms.map(norm) };
  }

  var GUIDES = [
    guide(CG_BASE, "g01-transformacoes", "Transformações geométricas (coordenadas homogêneas)", [
      "transformações geométricas", "transformação", "homogênea", "rotação", "reflexão", "cisalhamento", "escala", "translação",
    ]),
    guide(CG_BASE, "g02-dda", "DDA para retas", [
      "dda", "rasterização de retas", "número de iterações = maior delta", "1º caso × 2º caso",
    ]),
    guide(CG_BASE, "g03-bresenham-reta", "Bresenham para retas", [
      "bresenham", "rasterização de retas", "ponto médio", "delta é sempre positivo",
    ]),
    guide(CG_BASE, "g04-bresenham-circ", "Bresenham para circunferências", [
      "rasterização de circunferências", "circunferência", "circunferências",
    ]),
    guide(CG_BASE, "g05-cohen-sutherland", "Cohen-Sutherland (recorte de retas)", [
      "cohen-sutherland", "códigos", "c1 & c2", "a ordem dos recortes",
    ]),
    guide(CG_BASE, "g06-liang-barsky", "Liang-Barsky (recorte de retas)", [
      "liang-barsky", "u₁", "u₂", "condicionais são aninhadas", "a ordem dos recortes",
    ]),
    guide(CG_BASE, "g07-sutherland-hodgman", "Sutherland-Hodgman (recorte de polígonos)", [
      "sutherland-hodgman", "recorte de polígonos", "lista de vértices", "a ordem dos recortes",
    ]),
    guide(CG_BASE, "g08-boundary-fill", "Boundary Fill", [
      "boundary fill", "conectividade", "preenchimento de áreas",
    ]),
    guide(CG_BASE, "g09-flood-fill", "Flood Fill", [
      "flood fill", "conectividade", "preenchimento de áreas",
    ]),
    guide(CG_BASE, "g10-scanline", "Scan-Line (preenchimento de polígonos)", [
      "scan-line", "scanline", "preenchimento de áreas",
    ]),
    guide(CG_BASE, "g11-octree", "Octree", [
      "octree", "representações de sólidos", "otimizações do ray casting",
    ]),
    guide(CG_BASE, "g12-bsp", "BSP Tree", [
      "bsp", "representações de sólidos",
    ]),
    guide(CG_BASE, "g13-csg", "CSG — Constructive Solid Geometry", [
      "csg", "constructive solid", "operações de conjunto", "representações de sólidos",
    ]),
    guide(CG_BASE, "g14-mandelbrot", "Mandelbrot / fractais", [
      "mandelbrot", "fractal", "fractais", "representações de sólidos",
    ]),
    guide(CG_BASE, "g16-parametrica", "Curvas paramétricas interpoladas", [
      "curvas paramétricas", "curva interpolada", "x(u)", "y(u)", "interpolada",
    ]),
    guide(CG_BASE, "g15-bezier", "Conversão interpolada → Bézier", [
      "bézier", "bezier", "matriz de conversão", "interpolada → bézier", "curvas paramétricas",
    ]),
    guide(CG_BASE, "g17-ray-casting", "Ray Casting", [
      "ray casting", "raycasting", "visibilidade",
    ]),
    guide(CG_BASE, "g18-phong", "Modelo de iluminação de Phong", [
      "iluminação", "phong", "especular", "difuso", "difusa", "fonte de luz", "dispersão",
    ]),
    guide(CG_BASE, "g19-sombreamento", "Sombreamento Flat, Gouraud e Phong", [
      "sombreamento", "gouraud", "flat", "shading",
    ]),
    guide(CG_BASE, "g20-textura", "Correção do mapeamento de textura", [
      "textura", "texture", "mapeamento", "procedural", "bump",
    ]),
    guide(CG_BASE, "g21-keyframing", "Key framing e in-betweening", [
      "key frame", "key frames", "keyframing", "in-betweens",
    ]),
    guide(CG_BASE, "g22-morphing", "Morphing por vértices e arestas", [
      "morphing",
    ]),
    guide(CG_BASE, "g23-cinematica", "Cinemática direta e inversa", [
      "cinemática", "cinematica", "direta × inversa", "inversa",
    ]),
    guide(CG_BASE, "g24-bones", "Bones: esqueleto e skinning", [
      "bones", "bone", "esqueleto", "juntas", "articulado", "rigging", "skinning",
    ]),

    guide(COMP_BASE, "c01-lexica", "Análise léxica (maximal munch)", [
      "lexico", "lexica", "flex", "longest-match", "trace",
    ]),
    guide(COMP_BASE, "c02-glc", "Gramáticas livres de contexto", [
      "glc", "gramatica", "gramaticas livres de contexto",
    ]),
    guide(COMP_BASE, "c03-fatoracao", "Fatoração à esquerda", [
      "fatoracao", "fatoracao a esquerda",
    ]),
    guide(COMP_BASE, "c04-recursao-esquerda", "Remoção de recursão à esquerda", [
      "recursao-a-esquerda", "recursao-indireta", "recursao",
    ]),
    guide(COMP_BASE, "c05-first-follow", "Conjuntos FIRST e FOLLOW", [
      "first", "follow",
    ]),
    guide(COMP_BASE, "c06-tabela-ll1", "Tabela LL(1) e teste de LL(1)", [
      "ll1", "parsing-table", "tabela ll",
    ]),
    guide(COMP_BASE, "c07-parsing-ll1", "Parsing preditivo LL(1)", [
      "parsing", "parse",
    ]),
    guide(COMP_BASE, "c08-escopo", "Escopo e tabela de símbolos", [
      "escopo", "sombra de let",
    ]),
    guide(COMP_BASE, "c09-regras-tipo", "Regras de inferência de tipos", [
      "inferencia", "tipos", "let", "ambiente",
    ]),
    guide(COMP_BASE, "c10-lub", "Hierarquia de classes e LUB", [
      "lub", "heranca",
    ]),
    guide(COMP_BASE, "c11-tipos-dispatch", "Tipos estáticos, dinâmicos e dispatch", [
      "metodo", "subtipo", "tipo-estatico", "tipo-dinamico", "dispatch",
    ]),
    guide(COMP_BASE, "c12-self-type", "SELF_TYPE", [
      "self_type",
    ]),
    guide(COMP_BASE, "c13-geracao-codigo", "Geração de código (máquina de pilha)", [
      "assembly", "pilha", "temporarios", "geracao de codigo",
    ]),
    guide(COMP_BASE, "c14-registros-ativacao", "Registros de ativação e layout de objetos", [
      "activation-record", "stack-frame", "registro de ativacao", "layout",
    ]),
    guide(COMP_BASE, "c15-otimizacao-local", "Otimização local (bloco básico)", [
      "otimizacao", "codigo-morto",
    ]),
    guide(COMP_BASE, "c16-propagacao-constantes", "Propagação de constantes", [
      "constantes", "fluxo", "laco", "ponto-fixo",
    ]),
    guide(COMP_BASE, "c17-vivacidade", "Análise de vivacidade", [
      "vivacidade", "dataflow",
    ]),
    guide(COMP_BASE, "c18-rig-coloracao", "RIG e coloração de grafos", [
      "rig", "coloracao", "spill", "simplify",
    ]),
    guide(COMP_BASE, "c19-coleta-lixo", "Coleta de lixo: Mark-Sweep e Stop-Copy", [
      "gc", "mark-sweep", "copying",
    ]),
    guide(COMP_BASE, "c20-contagem-referencias", "Contagem de referências", [
      "reference-counting", "contagem de referencias",
    ]),
  ];

  function forQuestion(q) {
    var haystack = textOf(q || {});
    var seen = {};
    return GUIDES.filter(function (g) {
      var hit = g.terms.some(function (term) {
        return term && haystack.indexOf(term) !== -1;
      });
      if (!hit || seen[g.href]) return false;
      seen[g.href] = true;
      return true;
    }).map(function (g) {
      return { href: g.href, title: g.title };
    });
  }

  window.RelatedGuides = { forQuestion: forQuestion };
})();
