/*
 * code.js — Bloco de código com realce de linha e tokenização básica.
 *
 * EX.Content.code(host, {code, active?, dim?, lang?, startLine?}).
 * Cada linha vira .ex-code-line (com .active ou .dim), numerada em .ex-ln.
 * A tokenização é por regex simples para js/c/py: palavras-chave (tok-key),
 * strings (tok-str), números (tok-num) e comentários (tok-com).
 *
 * SEGURANÇA: todo texto é escapado com EX.util.escapeHtml ANTES de receber
 * spans — nunca interpolamos código bruto no innerHTML.
 *
 * IIFE + namespace global; função PURA de desenho (recebe host, anexa DOM).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  EX.Content = EX.Content || {};

  // Palavras-chave por linguagem (conjunto razoável, didático).
  var KEYWORDS = {
    js: [
      "var", "let", "const", "function", "return", "if", "else", "for", "while",
      "do", "switch", "case", "break", "continue", "new", "this", "typeof",
      "instanceof", "in", "of", "null", "undefined", "true", "false", "void",
      "delete", "try", "catch", "finally", "throw", "class", "extends", "super",
      "default",
    ],
    c: [
      "int", "char", "float", "double", "long", "short", "unsigned", "signed",
      "void", "struct", "union", "enum", "typedef", "const", "static", "return",
      "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
      "default", "sizeof", "goto", "extern", "register", "volatile",
    ],
    py: [
      "def", "return", "if", "elif", "else", "for", "while", "break", "continue",
      "in", "not", "and", "or", "is", "None", "True", "False", "class", "import",
      "from", "as", "with", "try", "except", "finally", "raise", "lambda",
      "pass", "global", "nonlocal", "yield", "del",
    ],
  };

  // Escapa uma RegExp de um literal (para montar a alternância de keywords).
  function reEscape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Constrói um regex que captura comentário | string | número | palavra-chave.
  function buildTokenizer(lang) {
    var kws = KEYWORDS[lang];
    if (!kws) return null;
    var kw = "\\b(?:" + kws.map(reEscape).join("|") + ")\\b";
    // comentário de linha: // (js/c) ou # (py); bloco /* */ (js/c)
    var lineCom = lang === "py" ? "#[^\\n]*" : "//[^\\n]*";
    var blockCom = lang === "py" ? null : "/\\*[\\s\\S]*?\\*/";
    var comment = blockCom ? "(?:" + blockCom + "|" + lineCom + ")" : lineCom;
    // strings: "..." ou '...' (com escapes)
    var str = "\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'";
    var num = "\\b\\d+(?:\\.\\d+)?\\b";
    return new RegExp(
      "(" + comment + ")|(" + str + ")|(" + num + ")|(" + kw + ")",
      "g"
    );
  }

  // Tokeniza UMA linha já escapada-livre (texto cru) e devolve HTML com spans.
  // Como escapamos cada PEDAÇO separadamente, nenhum trecho cru vaza p/ o HTML.
  function highlightLine(line, tokenizer) {
    if (!tokenizer) return U.escapeHtml(line);
    var out = "";
    var last = 0;
    var m;
    tokenizer.lastIndex = 0;
    while ((m = tokenizer.exec(line)) !== null) {
      if (m.index > last) out += U.escapeHtml(line.slice(last, m.index));
      var cls = m[1] ? "tok-com" : m[2] ? "tok-str" : m[3] ? "tok-num" : "tok-key";
      out += "<span class='" + cls + "'>" + U.escapeHtml(m[0]) + "</span>";
      last = m.index + m[0].length;
      if (m[0].length === 0) tokenizer.lastIndex++; // proteção contra loop
    }
    if (last < line.length) out += U.escapeHtml(line.slice(last));
    return out;
  }

  /*
   * EX.Content.code(host, spec)
   *   host: elemento <div> destino.
   *   spec:
   *     code      : string             código (pode conter \n)
   *     active    : number[]           linhas a destacar (.active) — base startLine
   *     dim       : number[]           linhas a esmaecer (.dim)
   *     lang      : "js"|"c"|"py"|"text"  linguagem p/ tokenização (default "text")
   *     startLine : number             número da 1ª linha (default 1)
   * Retorna o elemento <div class="ex-code">.
   */
  EX.Content.code = function (host, spec) {
    spec = spec || {};
    var code = spec.code == null ? "" : String(spec.code);
    var active = setOf(spec.active);
    var dim = setOf(spec.dim);
    var lang = spec.lang || "text";
    var start = spec.startLine == null ? 1 : spec.startLine;
    var tokenizer = lang === "text" ? null : buildTokenizer(lang);

    // Remove um único \n final para não gerar linha vazia extra.
    if (code.charAt(code.length - 1) === "\n") code = code.slice(0, -1);
    var lines = code.split("\n");

    var box = U.el("div", "ex-code");
    for (var i = 0; i < lines.length; i++) {
      var ln = start + i;
      var cls = "ex-code-line";
      if (active[ln]) cls += " active";
      else if (dim[ln]) cls += " dim";
      var row = U.el("div", cls);
      var num = U.el("span", "ex-ln", String(ln));
      var src = U.el("span", "ex-src");
      src.innerHTML = highlightLine(lines[i], tokenizer);
      row.appendChild(num);
      row.appendChild(src);
      box.appendChild(row);
    }
    host.appendChild(box);
    return box;
  };

  // Converte array de números em mapa {n:true} (tolera null/indefinido).
  function setOf(arr) {
    var s = {};
    if (arr) for (var i = 0; i < arr.length; i++) s[arr[i]] = true;
    return s;
  }
})();
