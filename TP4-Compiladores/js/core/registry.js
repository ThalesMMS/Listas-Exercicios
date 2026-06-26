(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});

  var registry = {
    _items: {},
    _order: [],
    add: function (item) {
      if (!item || !item.id) throw new Error("TP4.registry.add: item sem id");
      if (this._items[item.id]) {
        var idx = this._order.indexOf(item.id);
        if (idx >= 0) this._order.splice(idx, 1);
      }
      this._items[item.id] = item;
      this._order.push(item.id);
    },
    get: function (id) { return this._items[id] || null; },
    all: function () {
      var self = this;
      return this._order.map(function (id) { return self._items[id]; });
    },
    grouped: function () {
      var groups = [];
      var seen = {};
      this.all().forEach(function (it) {
        var key = it.subject || "TP4 Compiladores";
        if (!(key in seen)) { seen[key] = groups.length; groups.push({ subject: key, items: [] }); }
        groups[seen[key]].items.push(it);
      });
      return groups;
    }
  };

  TP4.registry = registry;
})();
