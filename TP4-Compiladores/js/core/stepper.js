(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});

  function Stepper() {
    this.steps = [];
    this.index = 0;
    this.playing = false;
    this._timer = null;
    this.intervalMs = 1350;
    this.onRender = null;
    this.onPlayState = null;
  }
  Stepper.prototype.setSteps = function (steps) {
    this.pause();
    this.steps = steps || [];
    this.index = 0;
    this.render();
  };
  Stepper.prototype.current = function () { return this.steps[this.index] || null; };
  Stepper.prototype.render = function () {
    if (typeof this.onRender === "function") this.onRender(this.current(), this.index, this.steps.length);
  };
  Stepper.prototype.goto = function (i) {
    if (!this.steps.length) return;
    this.index = Math.max(0, Math.min(this.steps.length - 1, i));
    this.render();
  };
  Stepper.prototype.next = function () { if (this.index >= this.steps.length - 1) { this.pause(); return; } this.goto(this.index + 1); };
  Stepper.prototype.prev = function () { this.goto(this.index - 1); };
  Stepper.prototype.reset = function () { this.pause(); this.goto(0); };
  Stepper.prototype.atStart = function () { return this.index === 0; };
  Stepper.prototype.atEnd = function () { return this.index >= this.steps.length - 1; };
  Stepper.prototype.play = function () {
    if (this.playing || this.steps.length <= 1) return;
    if (this.atEnd()) this.goto(0);
    this.playing = true;
    if (this.onPlayState) this.onPlayState(true);
    var self = this;
    this._timer = setInterval(function () { self.next(); }, this.intervalMs);
  };
  Stepper.prototype.pause = function () {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    if (this.playing && this.onPlayState) this.onPlayState(false);
    this.playing = false;
  };
  Stepper.prototype.toggle = function () { this.playing ? this.pause() : this.play(); };

  TP4.Stepper = Stepper;
})();
