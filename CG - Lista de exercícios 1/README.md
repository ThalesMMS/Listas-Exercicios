# GUI didática — Computação Gráfica (Questões 1–37)

Interface gráfica **interativa** que mostra, passo a passo, a resolução das questões 1 a 37
do estudo dirigido de Computação Gráfica (Prova 01): rasterização de circunferências, recorte
(Cohen-Sutherland, Liang-Barsky, Sutherland-Hodgman) e preenchimento de áreas.

Sem build, sem instalação, sem dependências: **HTML/CSS/JS puro + Canvas**.

## Como abrir

- **Duplo clique** em `index.html` (funciona via `file://`), ou
- Servidor local (recomendado): dentro desta pasta, rode
  ```bash
  python3 -m http.server 8123
  ```
  e abra <http://localhost:8123>.

## Navegação

- Cada questão tem **passos**. Use os botões `⏮ ◀ ▶ ▶▶` ou o teclado: `←` / `→` para
  passo anterior/próximo, `espaço` para reproduzir/pausar, `Home` para reiniciar.
- Questões com **partes** (ex.: 20a/b/c, segmentos AB/BC/CA) têm abas no topo.
- **Tema claro/escuro:** botão flutuante no canto inferior direito. A escolha é
  salva (localStorage) e vale para o DOM e para o canvas.

## Estrutura

```
index.html         Hub com os cards das questões (agrupados por seção)
question.html      Página genérica de uma questão (?q=NN)
css/styles.css     Tema e componentes
js/core/
  registry.js      window.GUI — registro das questões
  plane.js         CartesianPlane — grade cartesiana em canvas (lê cores do CSS)
  theme.js         Alternância de tema claro/escuro (window.Theme)
  stepper.js       Stepper — navegação/reprodução dos passos
  layout.js        Monta a página da questão e conecta tudo
js/lib/
  algorithms.js    Algoritmos instrumentados (frações exatas) — fonte da verdade
js/questions/
  q20.js … q37.js  Um módulo por questão (auto-registra em window.GUI)
```

`index.html` e `question.html` incluem o mesmo conjunto de `<script>`. Para adicionar uma
questão, crie `js/questions/qNN.js` e inclua-o nas duas páginas.

## Contrato de um módulo de questão

```js
window.GUI.register({
  id: 20,
  num: "20",
  section: "III) Rasterização de Circunferências",
  title: "Bresenham para circunferências",
  type: "computacional",          // ou "conceitual"
  hubDesc: "texto curto opcional para o card",
  enunciado: "HTML do enunciado",
  parts: [
    { label: "a) ...", build: (plane) => Step[] },  // 1+ partes (abas)
  ],
});
```

Cada **Step**:

```js
{
  titulo: "Título do passo",
  explicacao: "HTML mostrado no painel lateral",
  bounds: [xmin, xmax, ymin, ymax],   // opcional: limites do plano deste passo
  draw: (plane) => { /* desenha o estado cumulativo */ },  // opcional
}
```

O Stepper, a cada passo: aplica `bounds` (se houver) → limpa e desenha grade+eixos →
chama `draw(plane)`. **Ajuste os limites em `bounds`, não dentro de `draw`.** Passos sem
`draw` (conceituais textuais) ocupam a largura toda automaticamente.

### API principal do `CartesianPlane` (em `draw`)

`setBounds`, `fit(points)`, `pixel(x,y,opts)` (célula raster), `point(x,y,opts)`,
`segment(p0,p1,opts)`, `polygon(pts,opts)`, `window(xmin,xmax,ymin,ymax,opts)`,
`regionFill(x0,x1,y0,y1,color)`, `text(x,y,str,opts)`. Cores em `CartesianPlane.COLORS`
(objeto preenchido a partir das variáveis CSS por `CartesianPlane.refreshTheme()`, então
seguem o tema claro/escuro). Para acrescentar uma cor ao canvas: defina a variável CSS nos
dois temas e mapeie-a em `VAR_MAP` (em `plane.js`).

### Biblioteca `window.ALG`

Frações exatas (`Fr`, `fr`, `P`, `plabel`, `nx`, `ny`) e algoritmos que devolvem traços de
passos: `circleBresenham`, `symmetricPoints`, `cohenSutherland`, `liangBarsky`,
`sutherlandHodgman`, `flood`, `groupByRow`, `runsByRow`, `outCode`, `codeBits`, `codeNames`.
Reproduzem exatamente os valores do gabarito (`-15/11`, `46/11`, `5/3`, etc.).

## Conteúdo

Respostas baseadas em `../2024_2_exercicios_revisao_prova_01_resolvidos.md`.
Janela de recorte padrão: `-2 ≤ x ≤ 5`, `1 ≤ y ≤ 6`. Triângulo: `A(-1,-3)`, `B(-2,8)`, `C(9,2)`.
