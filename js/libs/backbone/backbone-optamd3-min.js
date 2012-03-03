// Backbone.js 0.9.1
// (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org
(function(h, e) {
  typeof exports !== "undefined" ? e(h, exports, require("underscore")) : typeof define === "function" && define.amd ? define(["underscore", "jquery", "exports"], function(g, i, m) {
    h.Backbone = e(h, m, g, i)
  }) : h.Backbone = e(h, {}, h._, h.jQuery || h.Zepto || h.ender)
})(this, function(h, e, g, i) {
  var m = h.Backbone,
      r = Array.prototype.slice,
      s = Array.prototype.splice;
  e.VERSION = "0.9.1";
  e.setDomLibrary = function(a) {
    i = a
  };
  e.noConflict = function() {
    h.Backbone = m;
    return e
  };
  e.emulateHTTP = false;
  e.emulateJSON = false;
  e.Events = {
    on: function(a, b, c) {
      for (var d, a = a.split(/\s+/), f = this._callbacks || (this._callbacks = {}); d = a.shift();) {
        d = f[d] || (f[d] = {});
        var e = d.tail || (d.tail = d.next = {});
        e.callback = b;
        e.context = c;
        d.tail = e.next = {}
      }
      return this
    },
    off: function(a, b, c) {
      var d, f, e;
      if (a) {
        if (f = this._callbacks) for (a = a.split(/\s+/); d = a.shift();) if (e = f[d], delete f[d], b && e) for (;
        (e = e.next) && e.next;) if (!(e.callback === b && (!c || e.context === c))) this.on(d, e.callback, e.context)
      } else delete this._callbacks;
      return this
    },
    trigger: function(a) {
      var b, c, d, f;
      if (!(d = this._callbacks)) return this;
      f = d.all;
      for ((a = a.split(/\s+/)).push(null); b = a.shift();) f && a.push({
        next: f.next,
        tail: f.tail,
        event: b
      }), (c = d[b]) && a.push({
        next: c.next,
        tail: c.tail
      });
      for (f = r.call(arguments, 1); c = a.pop();) {
        b = c.tail;
        for (d = c.event ? [c.event].concat(f) : f;
        (c = c.next) !== b;) c.callback.apply(c.context || this, d)
      }
      return this
    }
  };
  e.Events.bind = e.Events.on;
  e.Events.unbind = e.Events.off;
  e.Model = function(a, b) {
    var c;
    a || (a = {});
    b && b.parse && (a = this.parse(a));
    if (c = j(this, "defaults")) a = g.extend({}, c, a);
    if (b && b.collection) this.collection = b.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = g.uniqueId("c");
    if (!this.set(a, {
      silent: true
    })) throw Error("Can't create an invalid model");
    delete this._changed;
    this._previousAttributes = g.clone(this.attributes);
    this.initialize.apply(this, arguments)
  };
  g.extend(e.Model.prototype, e.Events, {
    idAttribute: "id",
    initialize: function() {},
    toJSON: function() {
      return g.clone(this.attributes)
    },
    get: function(a) {
      return this.attributes[a]
    },
    escape: function(a) {
      var b;
      if (b = this._escapedAttributes[a]) return b;
      b = this.attributes[a];
      return this._escapedAttributes[a] = g.escape(b == null ? "" : "" + b)
    },
    has: function(a) {
      return this.attributes[a] != null
    },
    set: function(a, b, c) {
      var d, f;
      g.isObject(a) || a == null ? (d = a, c = b) : (d = {}, d[a] = b);
      c || (c = {});
      if (!d) return this;
      if (d instanceof e.Model) d = d.attributes;
      if (c.unset) for (f in d) d[f] = void 0;
      if (!this._validate(d, c)) return false;
      if (this.idAttribute in d) this.id = d[this.idAttribute];
      var b = this.attributes,
          k = this._escapedAttributes,
          h = this._previousAttributes || {},
          i = this._setting;
      this._changed || (this._changed = {});
      this._setting = true;
      for (f in d) {
        a = d[f];
        g.isEqual(b[f], a) || delete k[f];
        c.unset ? delete b[f] : b[f] = a;
        if (this._changing && !g.isEqual(this._changed[f], a)) this.trigger("change:" + f, this, a, c), this._moreChanges = true;
        delete this._changed[f];
        if (!g.isEqual(h[f], a) || g.has(b, f) != g.has(h, f)) this._changed[f] = a
      }
      if (!i)!c.silent && this.hasChanged() && this.change(c), this._setting = false;
      return this
    },
    unset: function(a, b) {
      (b || (b = {})).unset = true;
      return this.set(a, null, b)
    },
    clear: function(a) {
      (a || (a = {})).unset = true;
      return this.set(g.clone(this.attributes), a)
    },
    fetch: function(a) {
      var a = a ? g.clone(a) : {},
          b = this,
          c = a.success;
      a.success = function(d, f, e) {
        if (!b.set(b.parse(d, e), a)) return false;
        c && c(b, d)
      };
      a.error = e.wrapError(a.error, b, a);
      return (this.sync || e.sync).call(this, "read", this, a)
    },
    save: function(a, b, c) {
      var d, f;
      g.isObject(a) || a == null ? (d = a, c = b) : (d = {}, d[a] = b);
      c = c ? g.clone(c) : {};
      c.wait && (f = g.clone(this.attributes));
      a = g.extend({}, c, {
        silent: true
      });
      if (d && !this.set(d, c.wait ? a : c)) return false;
      var k = this,
          h = c.success;
      c.success = function(a, b, f) {
        b = k.parse(a, f);
        c.wait && (b = g.extend(d || {}, b));
        if (!k.set(b, c)) return false;
        h ? h(k, a) : k.trigger("sync", k, a, c)
      };
      c.error = e.wrapError(c.error, k, c);
      b = this.isNew() ? "create" : "update";
      b = (this.sync || e.sync).call(this, b, this, c);
      c.wait && this.set(f, a);
      return b
    },
    destroy: function(a) {
      var a = a ? g.clone(a) : {},
          b = this,
          c = a.success,
          d = function() {
          b.trigger("destroy", b, b.collection, a)
          };
      if (this.isNew()) return d();
      a.success = function(f) {
        a.wait && d();
        c ? c(b, f) : b.trigger("sync", b, f, a)
      };
      a.error = e.wrapError(a.error, b, a);
      var f = (this.sync || e.sync).call(this, "delete", this, a);
      a.wait || d();
      return f
    },
    url: function() {
      var a = j(this.collection, "url") || j(this, "urlRoot") || o();
      return this.isNew() ? a : a + (a.charAt(a.length - 1) == "/" ? "" : "/") + encodeURIComponent(this.id)
    },
    parse: function(a) {
      return a
    },
    clone: function() {
      return new this.constructor(this.attributes)
    },
    isNew: function() {
      return this.id == null
    },
    change: function(a) {
      if (this._changing || !this.hasChanged()) return this;
      this._moreChanges = this._changing = true;
      for (var b in this._changed) this.trigger("change:" + b, this, this._changed[b], a);
      for (; this._moreChanges;) this._moreChanges = false, this.trigger("change", this, a);
      this._previousAttributes = g.clone(this.attributes);
      delete this._changed;
      this._changing = false;
      return this
    },
    hasChanged: function(a) {
      return !arguments.length ? !g.isEmpty(this._changed) : this._changed && g.has(this._changed, a)
    },
    changedAttributes: function(a) {
      if (!a) return this.hasChanged() ? g.clone(this._changed) : false;
      var b, c = false,
          d = this._previousAttributes,
          f;
      for (f in a) if (!g.isEqual(d[f], b = a[f]))(c || (c = {}))[f] = b;
      return c
    },
    previous: function(a) {
      return !arguments.length || !this._previousAttributes ? null : this._previousAttributes[a]
    },
    previousAttributes: function() {
      return g.clone(this._previousAttributes)
    },
    isValid: function() {
      return !this.validate(this.attributes)
    },
    _validate: function(a, b) {
      if (b.silent || !this.validate) return true;
      var a = g.extend({}, this.attributes, a),
          c = this.validate(a, b);
      if (!c) return true;
      b && b.error ? b.error(this, c, b) : this.trigger("error", this, c, b);
      return false
    }
  });
  e.Collection = function(a, b) {
    b || (b = {});
    if (b.comparator) this.comparator = b.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    a && this.reset(a, {
      silent: true,
      parse: b.parse
    })
  };
  g.extend(e.Collection.prototype, e.Events, {
    model: e.Model,
    initialize: function() {},
    toJSON: function() {
      return this.map(function(a) {
        return a.toJSON()
      })
    },
    add: function(a, b) {
      var c, d, f, e, h, i = {},
          j = {};
      b || (b = {});
      a = g.isArray(a) ? a.slice() : [a];
      for (c = 0, d = a.length; c < d; c++) {
        if (!(f = a[c] = this._prepareModel(a[c], b))) throw Error("Can't add an invalid model to a collection");
        if (i[e = f.cid] || this._byCid[e] || (h = f.id) != null && (j[h] || this._byId[h])) throw Error("Can't add the same model to a collection twice");
        i[e] = j[h] = f
      }
      for (c = 0; c < d; c++)(f = a[c]).on("all", this._onModelEvent, this), this._byCid[f.cid] = f, f.id != null && (this._byId[f.id] = f);
      this.length += d;
      s.apply(this.models, [b.at != null ? b.at : this.models.length, 0].concat(a));
      this.comparator && this.sort({
        silent: true
      });
      if (b.silent) return this;
      for (c = 0, d = this.models.length; c < d; c++) if (i[(f = this.models[c]).cid]) b.index = c, f.trigger("add", f, this, b);
      return this
    },
    remove: function(a, b) {
      var c, d, f, e;
      b || (b = {});
      a = g.isArray(a) ? a.slice() : [a];
      for (c = 0, d = a.length; c < d; c++) if (e = this.getByCid(a[c]) || this.get(a[c])) {
        delete this._byId[e.id];
        delete this._byCid[e.cid];
        f = this.indexOf(e);
        this.models.splice(f, 1);
        this.length--;
        if (!b.silent) b.index = f, e.trigger("remove", e, this, b);
        this._removeReference(e)
      }
      return this
    },
    get: function(a) {
      return a == null ? null : this._byId[a.id != null ? a.id : a]
    },
    getByCid: function(a) {
      return a && this._byCid[a.cid || a]
    },
    at: function(a) {
      return this.models[a]
    },
    sort: function(a) {
      a || (a = {});
      if (!this.comparator) throw Error("Cannot sort a set without a comparator");
      var b = g.bind(this.comparator, this);
      this.comparator.length == 1 ? this.models = this.sortBy(b) : this.models.sort(b);
      a.silent || this.trigger("reset", this, a);
      return this
    },
    pluck: function(a) {
      return g.map(this.models, function(b) {
        return b.get(a)
      })
    },
    reset: function(a, b) {
      a || (a = []);
      b || (b = {});
      for (var c = 0, d = this.models.length; c < d; c++) this._removeReference(this.models[c]);
      this._reset();
      this.add(a, {
        silent: true,
        parse: b.parse
      });
      b.silent || this.trigger("reset", this, b);
      return this
    },
    fetch: function(a) {
      a = a ? g.clone(a) : {};
      if (a.parse === void 0) a.parse = true;
      var b =
      this,
          c = a.success;
      a.success = function(d, f, e) {
        b[a.add ? "add" : "reset"](b.parse(d, e), a);
        c && c(b, d)
      };
      a.error = e.wrapError(a.error, b, a);
      return (this.sync || e.sync).call(this, "read", this, a)
    },
    create: function(a, b) {
      var c = this,
          b = b ? g.clone(b) : {},
          a = this._prepareModel(a, b);
      if (!a) return false;
      b.wait || c.add(a, b);
      var d = b.success;
      b.success = function(f, e) {
        b.wait && c.add(f, b);
        d ? d(f, e) : f.trigger("sync", a, e, b)
      };
      a.save(null, b);
      return a
    },
    parse: function(a) {
      return a
    },
    chain: function() {
      return g(this.models).chain()
    },
    _reset: function() {
      this.length =
      0;
      this.models = [];
      this._byId = {};
      this._byCid = {}
    },
    _prepareModel: function(a, b) {
      if (a instanceof e.Model) {
        if (!a.collection) a.collection = this
      } else {
        var c;
        b.collection = this;
        a = new this.model(a, b);
        a._validate(a.attributes, b) || (a = false)
      }
      return a
    },
    _removeReference: function(a) {
      this == a.collection && delete a.collection;
      a.off("all", this._onModelEvent, this)
    },
    _onModelEvent: function(a, b, c, d) {
      (a == "add" || a == "remove") && c != this || (a == "destroy" && this.remove(b, d), b && a === "change:" + b.idAttribute && (delete this._byId[b.previous(b.idAttribute)], this._byId[b.id] = b), this.trigger.apply(this, arguments))
    }
  });
  g.each("forEach,each,map,reduce,reduceRight,find,detect,filter,select,reject,every,all,some,any,include,contains,invoke,max,min,sortBy,sortedIndex,toArray,size,first,initial,rest,last,without,indexOf,shuffle,lastIndexOf,isEmpty,groupBy".split(","), function(a) {
    e.Collection.prototype[a] = function() {
      return g[a].apply(g, [this.models].concat(g.toArray(arguments)))
    }
  });
  e.Router = function(a) {
    a || (a = {});
    if (a.routes) this.routes = a.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments)
  };
  var t = /:\w+/g,
      u = /\*\w+/g,
      v = /[-[\]{}()+?.,\\^$|#\s]/g;
  g.extend(e.Router.prototype, e.Events, {
    initialize: function() {},
    route: function(a, b, c) {
      e.history || (e.history = new e.History);
      g.isRegExp(a) || (a = this._routeToRegExp(a));
      c || (c = this[b]);
      e.history.route(a, g.bind(function(d) {
        d = this._extractParameters(a, d);
        c && c.apply(this, d);
        this.trigger.apply(this, ["route:" + b].concat(d));
        e.history.trigger("route", this, b, d)
      }, this));
      return this
    },
    navigate: function(a, b) {
      e.history.navigate(a, b)
    },
    _bindRoutes: function() {
      if (this.routes) {
        var a = [],
            b;
        for (b in this.routes) a.unshift([b, this.routes[b]]);
        b = 0;
        for (var c = a.length; b < c; b++) this.route(a[b][0], a[b][1], this[a[b][1]])
      }
    },
    _routeToRegExp: function(a) {
      a = a.replace(v, "\\$&").replace(t, "([^/]+)").replace(u, "(.*?)");
      return RegExp("^" + a + "$")
    },
    _extractParameters: function(a, b) {
      return a.exec(b).slice(1)
    }
  });
  e.History = function() {
    this.handlers = [];
    g.bindAll(this, "checkUrl")
  };
  var n = /^[#\/]/,
      w = /msie [\w.]+/,
      l = false;
  g.extend(e.History.prototype, e.Events, {
    interval: 50,
    getFragment: function(a, b) {
      if (a == null) if (this._hasPushState || b) {
        var a = window.location.pathname,
            c = window.location.search;
        c && (a += c)
      } else a = window.location.hash;
      a = decodeURIComponent(a);
      a.indexOf(this.options.root) || (a = a.substr(this.options.root.length));
      return a.replace(n, "")
    },
    start: function(a) {
      if (l) throw Error("Backbone.history has already been started");
      this.options = g.extend({}, {
        root: "/"
      }, this.options, a);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState = !! this.options.pushState;
      this._hasPushState = !(!this.options.pushState || !window.history || !window.history.pushState);
      var a = this.getFragment(),
          b = document.documentMode;
      if (b = w.exec(navigator.userAgent.toLowerCase()) && (!b || b <= 7)) this.iframe = i('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow, this.navigate(a);
      if (this._hasPushState) i(window).bind("popstate", this.checkUrl);
      else if (this._wantsHashChange && "onhashchange" in window && !b) i(window).bind("hashchange", this.checkUrl);
      else if (this._wantsHashChange) this._checkUrlInterval =
      setInterval(this.checkUrl, this.interval);
      this.fragment = a;
      l = true;
      a = window.location;
      b = a.pathname == this.options.root;
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !b) return this.fragment = this.getFragment(null, true), window.location.replace(this.options.root + "#" + this.fragment), true;
      else if (this._wantsPushState && this._hasPushState && b && a.hash) this.fragment = a.hash.replace(n, ""), window.history.replaceState({}, document.title, a.protocol + "//" + a.host + this.options.root + this.fragment);
      if (!this.options.silent) return this.loadUrl()
    },
    stop: function() {
      i(window).unbind("popstate", this.checkUrl).unbind("hashchange", this.checkUrl);
      clearInterval(this._checkUrlInterval);
      l = false
    },
    route: function(a, b) {
      this.handlers.unshift({
        route: a,
        callback: b
      })
    },
    checkUrl: function() {
      var a = this.getFragment();
      a == this.fragment && this.iframe && (a = this.getFragment(this.iframe.location.hash));
      if (a == this.fragment || a == decodeURIComponent(this.fragment)) return false;
      this.iframe && this.navigate(a);
      this.loadUrl() || this.loadUrl(window.location.hash)
    },
    loadUrl: function(a) {
      var b =
      this.fragment = this.getFragment(a);
      return g.any(this.handlers, function(a) {
        if (a.route.test(b)) return a.callback(b), true
      })
    },
    navigate: function(a, b) {
      if (!l) return false;
      if (!b || b === true) b = {
        trigger: b
      };
      var c = (a || "").replace(n, "");
      if (!(this.fragment == c || this.fragment == decodeURIComponent(c))) this._hasPushState ? (c.indexOf(this.options.root) != 0 && (c = this.options.root + c), this.fragment = c, window.history[b.replace ? "replaceState" : "pushState"]({}, document.title, c)) : this._wantsHashChange ? (this.fragment = c, this._updateHash(window.location, c, b.replace), this.iframe && c != this.getFragment(this.iframe.location.hash) && (b.replace || this.iframe.document.open().close(), this._updateHash(this.iframe.location, c, b.replace))) : window.location.assign(this.options.root + a), b.trigger && this.loadUrl(a)
    },
    _updateHash: function(a, b, c) {
      c ? a.replace(a.toString().replace(/(javascript:|#).*$/, "") + "#" + b) : a.hash = b
    }
  });
  e.View = function(a) {
    this.cid = g.uniqueId("view");
    this._configure(a || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents()
  };
  var x = /^(\S+)\s*(.*)$/,
      p = "model,collection,el,id,attributes,className,tagName".split(",");
  g.extend(e.View.prototype, e.Events, {
    tagName: "div",
    $: function(a) {
      return this.$el.find(a)
    },
    initialize: function() {},
    render: function() {
      return this
    },
    remove: function() {
      this.$el.remove();
      return this
    },
    make: function(a, b, c) {
      a = document.createElement(a);
      b && i(a).attr(b);
      c && i(a).html(c);
      return a
    },
    setElement: function(a, b) {
      this.$el = i(a);
      this.el = this.$el[0];
      b !== false && this.delegateEvents();
      return this
    },
    delegateEvents: function(a) {
      if (a || (a = j(this, "events"))) {
        this.undelegateEvents();
        for (var b in a) {
          var c = a[b];
          g.isFunction(c) || (c = this[a[b]]);
          if (!c) throw Error('Event "' + a[b] + '" does not exist');
          var d = b.match(x),
              e = d[1],
              d = d[2],
              c = g.bind(c, this);
          e += ".delegateEvents" + this.cid;
          d === "" ? this.$el.bind(e, c) : this.$el.delegate(d, e, c)
        }
      }
    },
    undelegateEvents: function() {
      this.$el.unbind(".delegateEvents" + this.cid)
    },
    _configure: function(a) {
      this.options && (a = g.extend({}, this.options, a));
      for (var b = 0, c = p.length; b < c; b++) {
        var d = p[b];
        a[d] && (this[d] = a[d])
      }
      this.options =
      a
    },
    _ensureElement: function() {
      if (this.el) this.setElement(this.el, false);
      else {
        var a = j(this, "attributes") || {};
        if (this.id) a.id = this.id;
        if (this.className) a["class"] = this.className;
        this.setElement(this.make(this.tagName, a), false)
      }
    }
  });
  e.Model.extend = e.Collection.extend = e.Router.extend = e.View.extend = function(a, b) {
    var c = y(this, a, b);
    c.extend = this.extend;
    return c
  };
  var z = {
    create: "POST",
    update: "PUT",
    "delete": "DELETE",
    read: "GET"
  };
  e.sync = function(a, b, c) {
    var d = z[a],
        f = {
        type: d,
        dataType: "json"
        };
    if (!c.url) f.url = j(b, "url") || o();
    if (!c.data && b && (a == "create" || a == "update")) f.contentType = "application/json", f.data = JSON.stringify(b.toJSON());
    if (e.emulateJSON) f.contentType = "application/x-www-form-urlencoded", f.data = f.data ? {
      model: f.data
    } : {};
    if (e.emulateHTTP && (d === "PUT" || d === "DELETE")) {
      if (e.emulateJSON) f.data._method = d;
      f.type = "POST";
      f.beforeSend = function(a) {
        a.setRequestHeader("X-HTTP-Method-Override", d)
      }
    }
    if (f.type !== "GET" && !e.emulateJSON) f.processData = false;
    return i.ajax(g.extend(f, c))
  };
  e.wrapError = function(a, b, c) {
    return function(d, e) {
      e = d === b ? e : d;
      a ? a(b, e, c) : b.trigger("error", b, e, c)
    }
  };
  var q = function() {},
      y = function(a, b, c) {
      var d;
      d = b && b.hasOwnProperty("constructor") ? b.constructor : function() {
        a.apply(this, arguments)
      };
      g.extend(d, a);
      q.prototype = a.prototype;
      d.prototype = new q;
      b && g.extend(d.prototype, b);
      c && g.extend(d, c);
      d.prototype.constructor = d;
      d.__super__ = a.prototype;
      return d
      },
      j = function(a, b) {
      return !a || !a[b] ? null : g.isFunction(a[b]) ? a[b]() : a[b]
      },
      o = function() {
      throw Error('A "url" property or function must be specified');
      };
  return e
});