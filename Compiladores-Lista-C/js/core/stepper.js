/*
 * stepper.js — Stepper (window.EX.Stepper): navega por steps[] e desenha cada
 * passo na Stage, notificando a UI (explicação/contador/botões) via onRender.
 *
 * Passo: { title, body (HTML), visual? }.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});

  function Stepper(stage) {
    this.stage = stage;
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
    if (this.stage) this.stage.render(step ? step.visual : null);
    if (typeof this.onRender === "function") this.onRender(step, this.index, this.steps.length);
    return this;
  };
  Stepper.prototype.goto = function (i) {
    if (!this.steps.length) return this;
    this.index = Math.max(0, Math.min(this.steps.length - 1, i));
    this.render();
    return this;
  };
  Stepper.prototype.next = function () {
    if (this.index >= this.steps.length - 1) {
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
      if (self.atEnd()) self.pause();
      else self.next();
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

  EX.Stepper = Stepper;
})();
