# Computação Gráfica — Lista de Exercícios 2 (interativa)

Resolução **didática, passo a passo** das 15 questões da Lista 2, construída sobre o
mesmo framework do `Explainer-Template` (JS puro, sem build, abre via `file://`).

## Como abrir

Dê dois cliques em **`index.html`** (ou abra no navegador). Não precisa de servidor.

- **Hub** (`index.html`): cartões de todas as questões, agrupados pelos 5 temas do PDF.
- **Questão** (`question.html?q=q01` … `q15`): visual + explicação, passo a passo.
- Navegação: **← →** (anterior/próximo), **espaço** (reproduzir/pausar), **Home** (reiniciar).
- Botão de tema (☀/🌙) no canto: alterna claro/escuro (canvas e SVG seguem o tema).

## Temas e questões

| Tema | Questões |
| --- | --- |
| Visualização 3D e Projeções | Q1 projeção · Q2 elementos · Q3 tipos |
| Representação de Sólidos | Q4 definições · Q5 CSG · Q6 Octree · Q7 BSP |
| Malhas Poligonais | Q8 quad×tri · Q9 high poly |
| Curvas Paramétricas | Q10 vantagens · Q11 matriz interp→Bézier · Q12 x(u), y(u) |
| Superfícies Implícitas | Q13 vantagens · Q14 formas · Q15 Blobby×voxels |

> Os enunciados originais estão em `CG - Lista de exercícios 2.pdf`.

## Estrutura

```
index.html · question.html
css/        theme.css · layout.css · components.css
js/
  manifest.js · loader.js
  lib/ core/ surfaces/ components/ templates/   (framework EX, ver AUTHORING.md)
  questions/lista2/q01.js … q15.js              (as 15 respostas)
```

Para autorar/editar questões, veja **`AUTHORING.md`** (contrato de passo, superfícies
`plane`/`svg`/`dom`, componentes `EX.Diagram.*`, `EX.Content.*`, `EX.Slides.*`).
