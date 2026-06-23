/*
 * stepper.js — Motor de passos: navega por steps[], desenha no plano e
 * notifica a UI (explicação, contador, botões) via callback onRender.
 *
 * Cada passo: { titulo, explicacao (HTML), draw?(plane) }.
 * A cada render: plane.base() (limpa+grade+eixos) e então step.draw(plane).
 */
(function () {
  "use strict";

  function Stepper(plane) {
    this.plane = plane;
    this.steps = [];
    this.index = 0;
    this.playing = false;
    this._timer = null;
    this.intervalMs = 1100;
    this.onRender = null; // (step, index, total) => void
    this.onPlayState = null; // (playing) => void
  }

  Stepper.prototype.setSteps = function (steps) {
    this.pause();
    this.steps = steps || [];
    this.index = 0;
    this.render();
    return this;
  };

  Stepper.prototype.current = function () {
    return this.steps[this.index] || null;
  };

  Stepper.prototype.render = function () {
    var step = this.current();
    if (this.plane) {
      // Um passo pode declarar seus próprios limites de visualização; aplicamos
      // ANTES de desenhar grade/eixos para que tudo fique alinhado.
      if (step && step.bounds) {
        this.plane.setBounds(step.bounds[0], step.bounds[1], step.bounds[2], step.bounds[3]);
      }
      this.plane.base();
      if (step && typeof step.draw === "function") {
        try {
          step.draw(this.plane);
        } catch (e) {
          console.error("Erro ao desenhar passo", this.index, e);
        }
      }
    }
    if (typeof this.onRender === "function") {
      this.onRender(step, this.index, this.steps.length);
    }
    return this;
  };

  Stepper.prototype.goto = function (i) {
    if (this.steps.length === 0) return this;
    this.index = Math.max(0, Math.min(this.steps.length - 1, i));
    this.render();
    return this;
  };

  Stepper.prototype.next = function () {
    if (this.index >= this.steps.length - 1) {
      // chegou ao fim: pausa o autoplay
      if (this.playing) this.pause();
      return this;
    }
    return this.goto(this.index + 1);
  };

  Stepper.prototype.prev = function () {
    return this.goto(this.index - 1);
  };

  Stepper.prototype.reset = function () {
    this.pause();
    return this.goto(0);
  };

  Stepper.prototype.atStart = function () {
    return this.index === 0;
  };
  Stepper.prototype.atEnd = function () {
    return this.index >= this.steps.length - 1;
  };

  Stepper.prototype.play = function () {
    if (this.playing || this.steps.length <= 1) return this;
    if (this.atEnd()) this.goto(0);
    this.playing = true;
    if (this.onPlayState) this.onPlayState(true);
    var self = this;
    this._timer = setInterval(function () {
      if (self.atEnd()) {
        self.pause();
        return;
      }
      self.next();
    }, this.intervalMs);
    return this;
  };

  Stepper.prototype.pause = function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    if (this.playing && this.onPlayState) this.onPlayState(false);
    this.playing = false;
    return this;
  };

  Stepper.prototype.toggle = function () {
    return this.playing ? this.pause() : this.play();
  };

  window.Stepper = Stepper;
})();
