
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);

    var noop$1 = {value: function() {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function empty$1() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty$1 : function() {
        return this.querySelectorAll(selector);
      };
    }

    function selection_selectAll(select) {
      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant(x) {
      return function() {
        return x;
      };
    }

    var keyPrefix = "$"; // Protect against keys like “__proto__”.

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = {},
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
          if (keyValue in nodeByKeyValue) {
            exit[i] = node;
          } else {
            nodeByKeyValue[keyValue] = node;
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = keyPrefix + key.call(parent, data[i], i, data);
        if (node = nodeByKeyValue[keyValue]) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue[keyValue] = null;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
          exit[i] = node;
        }
      }
    }

    function selection_data(value, key) {
      if (!value) {
        data = new Array(this.size()), j = -1;
        this.each(function(d) { data[++j] = d; });
        return data;
      }

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = value.call(parent, parent && parent.__data__, j, parents),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
      if (onupdate != null) update = onupdate(update);
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(selection) {

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending$1;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection(sortgroups, this._parents).order();
    }

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      var nodes = new Array(this.size()), i = -1;
      this.each(function() { nodes[++i] = this; });
      return nodes;
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      var size = 0;
      this.each(function() { ++size; });
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    var filterEvents = {};

    var event = null;

    if (typeof document !== "undefined") {
      var element$1 = document.documentElement;
      if (!("onmouseenter" in element$1)) {
        filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
      }
    }

    function filterContextListener(listener, index, group) {
      listener = contextListener(listener, index, group);
      return function(event) {
        var related = event.relatedTarget;
        if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
          listener.call(this, event);
        }
      };
    }

    function contextListener(listener, index, group) {
      return function(event1) {
        var event0 = event; // Events can be reentrant (e.g., focus).
        event = event1;
        try {
          listener.call(this, this.__data__, index, group);
        } finally {
          event = event0;
        }
      };
    }

    function parseTypenames$1(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, capture) {
      var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
      return function(d, i, group) {
        var on = this.__on, o, listener = wrap(value, i, group);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
            this.addEventListener(o.type, o.listener = listener, o.capture = capture);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, capture);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, capture) {
      var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      if (capture == null) capture = false;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
      return this;
    }

    function customEvent(event1, listener, that, args) {
      var event0 = event;
      event1.sourceEvent = event;
      event = event1;
      try {
        return listener.apply(that, args);
      } finally {
        event = event0;
      }
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    var root = [null];

    function Selection(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection([[document.documentElement]], root);
    }

    Selection.prototype = selection.prototype = {
      constructor: Selection,
      select: selection_select,
      selectAll: selection_selectAll,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection([[document.querySelector(selector)]], [document.documentElement])
          : new Selection([[selector]], root);
    }

    function sourceEvent() {
      var current = event, source;
      while (source = current.sourceEvent) current = source;
      return current;
    }

    function point(node, event) {
      var svg = node.ownerSVGElement || node;

      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }

      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }

    function mouse(node) {
      var event = sourceEvent();
      if (event.changedTouches) event = event.changedTouches[0];
      return point(node, event);
    }

    function touch(node, touches, identifier) {
      if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

      for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
        if ((touch = touches[i]).identifier === identifier) {
          return point(node, touch);
        }
      }

      return null;
    }

    function noevent() {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function dragDisable(view) {
      var root = view.document.documentElement,
          selection = select(view).on("dragstart.drag", noevent, true);
      if ("onselectstart" in root) {
        selection.on("selectstart.drag", noevent, true);
      } else {
        root.__noselect = root.style.MozUserSelect;
        root.style.MozUserSelect = "none";
      }
    }

    function yesdrag(view, noclick) {
      var root = view.document.documentElement,
          selection = select(view).on("dragstart.drag", null);
      if (noclick) {
        selection.on("click.drag", noevent, true);
        setTimeout(function() { selection.on("click.drag", null); }, 0);
      }
      if ("onselectstart" in root) {
        selection.on("selectstart.drag", null);
      } else {
        root.style.MozUserSelect = root.__noselect;
        delete root.__noselect;
      }
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolateValue(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolateValue(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$1(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
          : b instanceof color ? interpolateRgb
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    var degrees = 180 / Math.PI;

    var identity = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees,
        skewX: Math.atan(skewX) * degrees,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var cssNode,
        cssRoot,
        cssView,
        svgNode;

    function parseCss(value) {
      if (value === "none") return identity;
      if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
      cssNode.style.transform = value;
      value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
      cssRoot.removeChild(cssNode);
      value = value.slice(7, -1).split(",");
      return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
    }

    function parseSvg(value) {
      if (value == null) return identity;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    var rho = Math.SQRT2,
        rho2 = 2,
        rho4 = 4,
        epsilon2 = 1e-12;

    function cosh(x) {
      return ((x = Math.exp(x)) + 1 / x) / 2;
    }

    function sinh(x) {
      return ((x = Math.exp(x)) - 1 / x) / 2;
    }

    function tanh(x) {
      return ((x = Math.exp(2 * x)) - 1) / (x + 1);
    }

    // p0 = [ux0, uy0, w0]
    // p1 = [ux1, uy1, w1]
    function interpolateZoom(p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
          ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
          dx = ux1 - ux0,
          dy = uy1 - uy0,
          d2 = dx * dx + dy * dy,
          i,
          S;

      // Special case for u0 ≅ u1.
      if (d2 < epsilon2) {
        S = Math.log(w1 / w0) / rho;
        i = function(t) {
          return [
            ux0 + t * dx,
            uy0 + t * dy,
            w0 * Math.exp(rho * t * S)
          ];
        };
      }

      // General case.
      else {
        var d1 = Math.sqrt(d2),
            b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
            b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
            r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
            r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r1 - r0) / rho;
        i = function(t) {
          var s = t * S,
              coshr0 = cosh(r0),
              u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / cosh(rho * s + r0)
          ];
        };
      }

      i.duration = S * 1000;

      return i;
    }

    var frame = 0, // is an animation frame pending?
        timeout = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout) timeout = clearTimeout(timeout);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout$1(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(function(elapsed) {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > STARTED) throw new Error("too late; already running");
      return schedule;
    }

    function get$1(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout$1(start);

          // Interrupt the active transition, if any.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions.
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout$1(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(node, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule.state > STARTING && schedule.state < ENDING;
        schedule.state = ENDED;
        schedule.timer.stop();
        schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule = set$1(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule = set$1(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get$1(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule = set$1(this, id);
        (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get$1(node, id).value[name];
      };
    }

    function interpolate(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttribute(name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrConstantNS$1(fullname, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttributeNS(fullname.space, fullname.local);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrFunction$1(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttribute(name);
        string0 = this.getAttribute(name);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function attrFunctionNS$1(fullname, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        string0 = this.getAttributeNS(fullname.space, fullname.local);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
    }

    function attrInterpolate(name, i) {
      return function(t) {
        this.setAttribute(name, i.call(this, t));
      };
    }

    function attrInterpolateNS(fullname, i) {
      return function(t) {
        this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
      };
    }

    function attrTweenNS(fullname, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init$1(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init$1(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get$1(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set$1(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set$1(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get$1(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set$1(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get$1(this.node(), id).ease;
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition) {
      if (transition._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init$1 : set$1;
      return function() {
        var schedule = sit(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get$1(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection$1 = selection.prototype.constructor;

    function transition_selection() {
      return new Selection$1(this._groups, this._parents);
    }

    function styleNull(name, interpolate) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            string1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, string10 = string1);
      };
    }

    function styleRemove$1(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = styleValue(this, name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function styleFunction$1(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            value1 = value(this),
            string1 = value1 + "";
        if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function styleMaybeRemove(id, name) {
      var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
      return function() {
        var schedule = set$1(this, id),
            on = schedule.on,
            listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

        schedule.on = on1;
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
      return value == null ? this
          .styleTween(name, styleNull(name, i))
          .on("end.style." + name, styleRemove$1(name))
        : typeof value === "function" ? this
          .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value)))
          .each(styleMaybeRemove(this._id, name))
        : this
          .styleTween(name, styleConstant$1(name, i, value), priority)
          .on("end.style." + name, null);
    }

    function styleInterpolate(name, i, priority) {
      return function(t) {
        this.style.setProperty(name, i.call(this, t), priority);
      };
    }

    function styleTween(name, value, priority) {
      var t, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
        return t;
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction$1(tweenValue(this, "text", value))
          : textConstant$1(value == null ? "" : value + ""));
    }

    function textInterpolate(i) {
      return function(t) {
        this.textContent = i.call(this, t);
      };
    }

    function textTween(value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_textTween(value) {
      var key = "text";
      if (arguments.length < 1) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, textTween(value));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get$1(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    function transition_end() {
      var on0, on1, that = this, id = that._id, size = that.size();
      return new Promise(function(resolve, reject) {
        var cancel = {value: reject},
            end = {value: function() { if (--size === 0) resolve(); }};

        that.each(function() {
          var schedule = set$1(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) {
            on1 = (on0 = on).copy();
            on1._.cancel.push(cancel);
            on1._.interrupt.push(cancel);
            on1._.end.push(end);
          }

          schedule.on = on1;
        });
      });
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function transition(name) {
      return selection().transition(name);
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      textTween: transition_textTween,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease,
      end: transition_end
    };

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          return defaultTiming.time = now(), defaultTiming;
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    function ascending$2(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector$1(compare) {
      if (compare.length === 1) compare = ascendingComparator$1(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator$1(f) {
      return function(d, x) {
        return ascending$2(f(d), x);
      };
    }

    var ascendingBisect$1 = bisector$1(ascending$2);

    var prefix = "$";

    function Map$1() {}

    Map$1.prototype = map.prototype = {
      constructor: Map$1,
      has: function(key) {
        return (prefix + key) in this;
      },
      get: function(key) {
        return this[prefix + key];
      },
      set: function(key, value) {
        this[prefix + key] = value;
        return this;
      },
      remove: function(key) {
        var property = prefix + key;
        return property in this && delete this[property];
      },
      clear: function() {
        for (var property in this) if (property[0] === prefix) delete this[property];
      },
      keys: function() {
        var keys = [];
        for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
        return keys;
      },
      values: function() {
        var values = [];
        for (var property in this) if (property[0] === prefix) values.push(this[property]);
        return values;
      },
      entries: function() {
        var entries = [];
        for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
        return entries;
      },
      size: function() {
        var size = 0;
        for (var property in this) if (property[0] === prefix) ++size;
        return size;
      },
      empty: function() {
        for (var property in this) if (property[0] === prefix) return false;
        return true;
      },
      each: function(f) {
        for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
      }
    };

    function map(object, f) {
      var map = new Map$1;

      // Copy constructor.
      if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

      // Index array by numeric index or specified key function.
      else if (Array.isArray(object)) {
        var i = -1,
            n = object.length,
            o;

        if (f == null) while (++i < n) map.set(i, object[i]);
        else while (++i < n) map.set(f(o = object[i], i, object), o);
      }

      // Convert object to map.
      else if (object) for (var key in object) map.set(key, object[key]);

      return map;
    }

    function Set$1() {}

    var proto = map.prototype;

    Set$1.prototype = set$2.prototype = {
      constructor: Set$1,
      has: proto.has,
      add: function(value) {
        value += "";
        this[prefix + value] = value;
        return this;
      },
      remove: proto.remove,
      clear: proto.clear,
      values: proto.keys,
      size: proto.size,
      empty: proto.empty,
      each: proto.each
    };

    function set$2(object, f) {
      var set = new Set$1;

      // Copy constructor.
      if (object instanceof Set$1) object.each(function(value) { set.add(value); });

      // Otherwise, assume it’s an array.
      else if (object) {
        var i = -1, n = object.length;
        if (f == null) while (++i < n) set.add(object[i]);
        else while (++i < n) set.add(f(object[i], i, object));
      }

      return set;
    }

    function ascending$3(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector$2(compare) {
      if (compare.length === 1) compare = ascendingComparator$2(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator$2(f) {
      return function(d, x) {
        return ascending$3(f(d), x);
      };
    }

    var ascendingBisect$2 = bisector$2(ascending$3);

    function ascending$4(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector$3(compare) {
      if (compare.length === 1) compare = ascendingComparator$3(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator$3(f) {
      return function(d, x) {
        return ascending$4(f(d), x);
      };
    }

    var ascendingBisect$3 = bisector$3(ascending$4);

    function constant$2(x) {
      return function() {
        return x;
      };
    }

    function ZoomEvent(target, type, transform) {
      this.target = target;
      this.type = type;
      this.transform = transform;
    }

    function Transform(k, x, y) {
      this.k = k;
      this.x = x;
      this.y = y;
    }

    Transform.prototype = {
      constructor: Transform,
      scale: function(k) {
        return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
      },
      translate: function(x, y) {
        return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
      },
      apply: function(point) {
        return [point[0] * this.k + this.x, point[1] * this.k + this.y];
      },
      applyX: function(x) {
        return x * this.k + this.x;
      },
      applyY: function(y) {
        return y * this.k + this.y;
      },
      invert: function(location) {
        return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
      },
      invertX: function(x) {
        return (x - this.x) / this.k;
      },
      invertY: function(y) {
        return (y - this.y) / this.k;
      },
      rescaleX: function(x) {
        return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
      },
      rescaleY: function(y) {
        return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
      },
      toString: function() {
        return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
      }
    };

    var identity$1 = new Transform(1, 0, 0);

    function nopropagation() {
      event.stopImmediatePropagation();
    }

    function noevent$1() {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // Ignore right-click, since that should open the context menu.
    function defaultFilter() {
      return !event.ctrlKey && !event.button;
    }

    function defaultExtent() {
      var e = this;
      if (e instanceof SVGElement) {
        e = e.ownerSVGElement || e;
        if (e.hasAttribute("viewBox")) {
          e = e.viewBox.baseVal;
          return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
        }
        return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
      }
      return [[0, 0], [e.clientWidth, e.clientHeight]];
    }

    function defaultTransform() {
      return this.__zoom || identity$1;
    }

    function defaultWheelDelta() {
      return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002);
    }

    function defaultTouchable() {
      return navigator.maxTouchPoints || ("ontouchstart" in this);
    }

    function defaultConstrain(transform, extent, translateExtent) {
      var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
          dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
          dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
          dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
      return transform.translate(
        dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
        dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
      );
    }

    function zoom() {
      var filter = defaultFilter,
          extent = defaultExtent,
          constrain = defaultConstrain,
          wheelDelta = defaultWheelDelta,
          touchable = defaultTouchable,
          scaleExtent = [0, Infinity],
          translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
          duration = 250,
          interpolate = interpolateZoom,
          listeners = dispatch("start", "zoom", "end"),
          touchstarting,
          touchending,
          touchDelay = 500,
          wheelDelay = 150,
          clickDistance2 = 0;

      function zoom(selection) {
        selection
            .property("__zoom", defaultTransform)
            .on("wheel.zoom", wheeled)
            .on("mousedown.zoom", mousedowned)
            .on("dblclick.zoom", dblclicked)
          .filter(touchable)
            .on("touchstart.zoom", touchstarted)
            .on("touchmove.zoom", touchmoved)
            .on("touchend.zoom touchcancel.zoom", touchended)
            .style("touch-action", "none")
            .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
      }

      zoom.transform = function(collection, transform, point) {
        var selection = collection.selection ? collection.selection() : collection;
        selection.property("__zoom", defaultTransform);
        if (collection !== selection) {
          schedule(collection, transform, point);
        } else {
          selection.interrupt().each(function() {
            gesture(this, arguments)
                .start()
                .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
                .end();
          });
        }
      };

      zoom.scaleBy = function(selection, k, p) {
        zoom.scaleTo(selection, function() {
          var k0 = this.__zoom.k,
              k1 = typeof k === "function" ? k.apply(this, arguments) : k;
          return k0 * k1;
        }, p);
      };

      zoom.scaleTo = function(selection, k, p) {
        zoom.transform(selection, function() {
          var e = extent.apply(this, arguments),
              t0 = this.__zoom,
              p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p,
              p1 = t0.invert(p0),
              k1 = typeof k === "function" ? k.apply(this, arguments) : k;
          return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
        }, p);
      };

      zoom.translateBy = function(selection, x, y) {
        zoom.transform(selection, function() {
          return constrain(this.__zoom.translate(
            typeof x === "function" ? x.apply(this, arguments) : x,
            typeof y === "function" ? y.apply(this, arguments) : y
          ), extent.apply(this, arguments), translateExtent);
        });
      };

      zoom.translateTo = function(selection, x, y, p) {
        zoom.transform(selection, function() {
          var e = extent.apply(this, arguments),
              t = this.__zoom,
              p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
          return constrain(identity$1.translate(p0[0], p0[1]).scale(t.k).translate(
            typeof x === "function" ? -x.apply(this, arguments) : -x,
            typeof y === "function" ? -y.apply(this, arguments) : -y
          ), e, translateExtent);
        }, p);
      };

      function scale(transform, k) {
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
        return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
      }

      function translate(transform, p0, p1) {
        var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
        return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
      }

      function centroid(extent) {
        return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
      }

      function schedule(transition, transform, point) {
        transition
            .on("start.zoom", function() { gesture(this, arguments).start(); })
            .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).end(); })
            .tween("zoom", function() {
              var that = this,
                  args = arguments,
                  g = gesture(that, args),
                  e = extent.apply(that, args),
                  p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point,
                  w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
                  a = that.__zoom,
                  b = typeof transform === "function" ? transform.apply(that, args) : transform,
                  i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
              return function(t) {
                if (t === 1) t = b; // Avoid rounding error on end.
                else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
                g.zoom(null, t);
              };
            });
      }

      function gesture(that, args, clean) {
        return (!clean && that.__zooming) || new Gesture(that, args);
      }

      function Gesture(that, args) {
        this.that = that;
        this.args = args;
        this.active = 0;
        this.extent = extent.apply(that, args);
        this.taps = 0;
      }

      Gesture.prototype = {
        start: function() {
          if (++this.active === 1) {
            this.that.__zooming = this;
            this.emit("start");
          }
          return this;
        },
        zoom: function(key, transform) {
          if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
          if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
          if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
          this.that.__zoom = transform;
          this.emit("zoom");
          return this;
        },
        end: function() {
          if (--this.active === 0) {
            delete this.that.__zooming;
            this.emit("end");
          }
          return this;
        },
        emit: function(type) {
          customEvent(new ZoomEvent(zoom, type, this.that.__zoom), listeners.apply, listeners, [type, this.that, this.args]);
        }
      };

      function wheeled() {
        if (!filter.apply(this, arguments)) return;
        var g = gesture(this, arguments),
            t = this.__zoom,
            k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
            p = mouse(this);

        // If the mouse is in the same location as before, reuse it.
        // If there were recent wheel events, reset the wheel idle timeout.
        if (g.wheel) {
          if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
            g.mouse[1] = t.invert(g.mouse[0] = p);
          }
          clearTimeout(g.wheel);
        }

        // If this wheel event won’t trigger a transform change, ignore it.
        else if (t.k === k) return;

        // Otherwise, capture the mouse point and location at the start.
        else {
          g.mouse = [p, t.invert(p)];
          interrupt(this);
          g.start();
        }

        noevent$1();
        g.wheel = setTimeout(wheelidled, wheelDelay);
        g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

        function wheelidled() {
          g.wheel = null;
          g.end();
        }
      }

      function mousedowned() {
        if (touchending || !filter.apply(this, arguments)) return;
        var g = gesture(this, arguments, true),
            v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
            p = mouse(this),
            x0 = event.clientX,
            y0 = event.clientY;

        dragDisable(event.view);
        nopropagation();
        g.mouse = [p, this.__zoom.invert(p)];
        interrupt(this);
        g.start();

        function mousemoved() {
          noevent$1();
          if (!g.moved) {
            var dx = event.clientX - x0, dy = event.clientY - y0;
            g.moved = dx * dx + dy * dy > clickDistance2;
          }
          g.zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = mouse(g.that), g.mouse[1]), g.extent, translateExtent));
        }

        function mouseupped() {
          v.on("mousemove.zoom mouseup.zoom", null);
          yesdrag(event.view, g.moved);
          noevent$1();
          g.end();
        }
      }

      function dblclicked() {
        if (!filter.apply(this, arguments)) return;
        var t0 = this.__zoom,
            p0 = mouse(this),
            p1 = t0.invert(p0),
            k1 = t0.k * (event.shiftKey ? 0.5 : 2),
            t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, arguments), translateExtent);

        noevent$1();
        if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0);
        else select(this).call(zoom.transform, t1);
      }

      function touchstarted() {
        if (!filter.apply(this, arguments)) return;
        var touches = event.touches,
            n = touches.length,
            g = gesture(this, arguments, event.changedTouches.length === n),
            started, i, t, p;

        nopropagation();
        for (i = 0; i < n; ++i) {
          t = touches[i], p = touch(this, touches, t.identifier);
          p = [p, this.__zoom.invert(p), t.identifier];
          if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
          else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
        }

        if (touchstarting) touchstarting = clearTimeout(touchstarting);

        if (started) {
          if (g.taps < 2) touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
          interrupt(this);
          g.start();
        }
      }

      function touchmoved() {
        if (!this.__zooming) return;
        var g = gesture(this, arguments),
            touches = event.changedTouches,
            n = touches.length, i, t, p, l;

        noevent$1();
        if (touchstarting) touchstarting = clearTimeout(touchstarting);
        g.taps = 0;
        for (i = 0; i < n; ++i) {
          t = touches[i], p = touch(this, touches, t.identifier);
          if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
          else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
        }
        t = g.that.__zoom;
        if (g.touch1) {
          var p0 = g.touch0[0], l0 = g.touch0[1],
              p1 = g.touch1[0], l1 = g.touch1[1],
              dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
              dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
          t = scale(t, Math.sqrt(dp / dl));
          p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
          l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
        }
        else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
        else return;
        g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
      }

      function touchended() {
        if (!this.__zooming) return;
        var g = gesture(this, arguments),
            touches = event.changedTouches,
            n = touches.length, i, t;

        nopropagation();
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, touchDelay);
        for (i = 0; i < n; ++i) {
          t = touches[i];
          if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
          else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
        }
        if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
        if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
        else {
          g.end();
          // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
          if (g.taps === 2) {
            var p = select(this).on("dblclick.zoom");
            if (p) p.apply(this, arguments);
          }
        }
      }

      zoom.wheelDelta = function(_) {
        return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant$2(+_), zoom) : wheelDelta;
      };

      zoom.filter = function(_) {
        return arguments.length ? (filter = typeof _ === "function" ? _ : constant$2(!!_), zoom) : filter;
      };

      zoom.touchable = function(_) {
        return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$2(!!_), zoom) : touchable;
      };

      zoom.extent = function(_) {
        return arguments.length ? (extent = typeof _ === "function" ? _ : constant$2([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
      };

      zoom.scaleExtent = function(_) {
        return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
      };

      zoom.translateExtent = function(_) {
        return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
      };

      zoom.constrain = function(_) {
        return arguments.length ? (constrain = _, zoom) : constrain;
      };

      zoom.duration = function(_) {
        return arguments.length ? (duration = +_, zoom) : duration;
      };

      zoom.interpolate = function(_) {
        return arguments.length ? (interpolate = _, zoom) : interpolate;
      };

      zoom.on = function() {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? zoom : value;
      };

      zoom.clickDistance = function(_) {
        return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
      };

      return zoom;
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const layers = writable(null);
    const current_layer = writable(null);
    const selection$1 = writable(null);
    const results = writable([]);

    const viewBoxRect = writable({width: 1000, height: 1000, x: 0, y: 0});

    const screen_size = writable(new DOMRect(0, 0, 0, 0));
    const screen_transform = writable(identity$1);

    const user_transform = writable(identity$1);

    const zoom$1 = writable(1.0);
    const viewport = writable(new DOMRect(0, 0, 0, 0));

    const settled_zoom = writable(1.0);
    const settled_viewport = writable(new DOMRect(0, 0, 0, 0));


    const get_id_from_hash = () => window.location.hash.slice(1);

    const selected_id = readable(get_id_from_hash(), function start(set) {
        window.addEventListener('hashchange', () => set(get_id_from_hash()), false);
    });
    const hovered_id = writable(null);

    // null the selection whenever selected_id is invalidated
    selected_id.subscribe(id => {
        if(!id || id == '')
            selection$1.set(null);
    });


    selection$1.subscribe(d => {
        // change layer if the new selection is not in the current one
        if(d && d.position && d.position.layers && !(d.position.layers.has(get_store_value(current_layer).name)))
            selectLayer(d.position.layers.values().next().value);

        if(d) {
            // clear search results
            results.set([]);
        }
    });

    // check if we need to null the selection whenever the current layer is changed
    current_layer.subscribe(layer => {
        if(get_store_value(selection$1) && get_store_value(selection$1).position && get_store_value(selection$1).position.layers && !(get_store_value(selection$1).position.layers.has(layer.name)))
            clearSelection();
    });

    function clearSelection() {
        window.location.hash = '';
    }

    function select$1(id) {
        window.location.hash = '#'+id;
    }

    function hover_enter(id) {
        hovered_id.set(id);
    }
    function hover_leave(id) {
        hovered_id.set(null);
    }

    function selectLayer(name) {
        let all_layers = get_store_value(layers);
        let layer = all_layers.get(name);
        current_layer.set(layer);

        // floor layers logic
        let visibility = true;
        all_layers.forEach(d => {
            if(d.type == 'floor')
                d.visible = visibility;
            if(d == layer)
                visibility = false;
        });

        // base layers logic
        all_layers.forEach(d => {
            if(d.type == 'base')
                d.visible = false;
        });
        layer.visible = true;
        
        layers.set(get_store_value(layers)); // refresh layers after modification
    }

    function is_position_in_layer(position, layer) {
        return position.layers.has(layer.name)
    }

    function is_position_in_lod(position, z) {
        let lod_range = 'lodrange' in position ? position.lodrange.map(d => d == 'Infinity' ? Infinity : d) : [0, Infinity];
        return z >= lod_range[0] && z <= lod_range[1]
    }

    /* node_modules/anymapper/src/FloorLayersCtrl.svelte generated by Svelte v3.47.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (51:0) {#if $layers}
    function create_if_block(ctx) {
    	let div;
    	let each_value = Array.from(/*$layers*/ ctx[0].values()).filter(func).reverse();
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "floor_layers_ctrl svelte-p5yidi");
    			toggle_class(div, "isIdSelected", /*$selected_id*/ ctx[1] != '');
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*Array, $layers, $current_layer, handleClick*/ 13) {
    				each_value = Array.from(/*$layers*/ ctx[0].values()).filter(func).reverse();
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$selected_id*/ 2) {
    				toggle_class(div, "isIdSelected", /*$selected_id*/ ctx[1] != '');
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (53:1) {#each Array.from($layers.values()).filter(d => d.type == 'floor').reverse() as layer}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let t_value = /*layer*/ ctx[5].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*layer*/ ctx[5]);
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(t_value);
    			attr(div0, "class", "svelte-p5yidi");
    			attr(div1, "class", "layer_btn svelte-p5yidi");
    			toggle_class(div1, "visible", /*layer*/ ctx[5].visible);
    			toggle_class(div1, "current", /*layer*/ ctx[5] == /*$current_layer*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t);

    			if (!mounted) {
    				dispose = listen(div1, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$layers*/ 1 && t_value !== (t_value = /*layer*/ ctx[5].name + "")) set_data(t, t_value);

    			if (dirty & /*Array, $layers*/ 1) {
    				toggle_class(div1, "visible", /*layer*/ ctx[5].visible);
    			}

    			if (dirty & /*Array, $layers, $current_layer*/ 5) {
    				toggle_class(div1, "current", /*layer*/ ctx[5] == /*$current_layer*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let if_block = /*$layers*/ ctx[0] && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*$layers*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    const func = d => d.type == 'floor';

    function instance($$self, $$props, $$invalidate) {
    	let $layers;
    	let $selected_id;
    	let $current_layer;
    	component_subscribe($$self, layers, $$value => $$invalidate(0, $layers = $$value));
    	component_subscribe($$self, selected_id, $$value => $$invalidate(1, $selected_id = $$value));
    	component_subscribe($$self, current_layer, $$value => $$invalidate(2, $current_layer = $$value));

    	function handleClick(layer) {
    		selectLayer(layer.name);
    	}

    	const click_handler = layer => handleClick(layer);
    	return [$layers, $selected_id, $current_layer, handleClick, click_handler];
    }

    class FloorLayersCtrl extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (cashIndex !== -1 && keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if ((actions && actions.length || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        }
      }
    }

    /* node_modules/@smui/card/Card.svelte generated by Svelte v3.47.0 */

    function create_fragment$1(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	let div_levels = [
    		{
    			class: div_class_value = "mdc-card " + /*className*/ ctx[1] + " " + (/*variant*/ ctx[2] === 'outlined'
    			? 'mdc-card--outlined'
    			: '') + " " + (/*padded*/ ctx[3] ? 'smui-card--padded' : '') + ""
    		},
    		exclude(/*$$props*/ ctx[5], ['use', 'class', 'variant', 'padded'])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[4].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, variant, padded*/ 14 && div_class_value !== (div_class_value = "mdc-card " + /*className*/ ctx[1] + " " + (/*variant*/ ctx[2] === 'outlined'
    				? 'mdc-card--outlined'
    				: '') + " " + (/*padded*/ ctx[3] ? 'smui-card--padded' : '') + "")) && { class: div_class_value },
    				dirty & /*$$props*/ 32 && exclude(/*$$props*/ ctx[5], ['use', 'class', 'variant', 'padded'])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { variant = 'raised' } = $$props;
    	let { padded = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('variant' in $$new_props) $$invalidate(2, variant = $$new_props.variant);
    		if ('padded' in $$new_props) $$invalidate(3, padded = $$new_props.padded);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, className, variant, padded, forwardEvents, $$props, $$scope, slots];
    }

    class Card extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { use: 0, class: 1, variant: 2, padded: 3 });
    	}
    }

    /* node_modules/@smui/common/ClassAdder.svelte generated by Svelte v3.47.0 */

    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    		},
    		{
    			class: "" + (/*smuiClass*/ ctx[3] + " " + /*className*/ ctx[1])
    		},
    		exclude(/*$$props*/ ctx[5], ['use', 'class', 'component', 'forwardEvents'])
    	];

    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*forwardEvents, use, smuiClass, className, exclude, $$props*/ 59)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*forwardEvents, use*/ 17 && {
    						use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    					},
    					dirty & /*smuiClass, className*/ 10 && {
    						class: "" + (/*smuiClass*/ ctx[3] + " " + /*className*/ ctx[1])
    					},
    					dirty & /*exclude, $$props*/ 32 && get_spread_object(exclude(/*$$props*/ ctx[5], ['use', 'class', 'component', 'forwardEvents']))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 256) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    const internals = {
    	component: null,
    	smuiClass: null,
    	contexts: {}
    };

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { component = internals.component } = $$props;
    	let { forwardEvents: smuiForwardEvents = [] } = $$props;
    	const smuiClass = internals.class;
    	const contexts = internals.contexts;
    	const forwardEvents = forwardEventsBuilder(get_current_component(), smuiForwardEvents);

    	for (let context in contexts) {
    		if (contexts.hasOwnProperty(context)) {
    			setContext(context, contexts[context]);
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('component' in $$new_props) $$invalidate(2, component = $$new_props.component);
    		if ('forwardEvents' in $$new_props) $$invalidate(6, smuiForwardEvents = $$new_props.forwardEvents);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		component,
    		smuiClass,
    		forwardEvents,
    		$$props,
    		smuiForwardEvents,
    		slots,
    		$$scope
    	];
    }

    class ClassAdder extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			use: 0,
    			class: 1,
    			component: 2,
    			forwardEvents: 6
    		});
    	}
    }

    function classAdderBuilder(props) {
      function Component(...args) {
        Object.assign(internals, props);
        return new ClassAdder(...args);
      }

      Component.prototype = ClassAdder;

      // SSR support
      if (ClassAdder.$$render) {
        Component.$$render = (...args) => Object.assign(internals, props) && ClassAdder.$$render(...args);
      }
      if (ClassAdder.render) {
        Component.render = (...args) => Object.assign(internals, props) && ClassAdder.render(...args);
      }

      return Component;
    }

    /* node_modules/@smui/common/Div.svelte generated by Svelte v3.47.0 */

    function create_fragment$3(ctx) {
    	let div;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let div_levels = [exclude(/*$$props*/ ctx[2], ['use'])];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ['use'])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class Div extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { use: 0 });
    	}
    }

    var Content = classAdderBuilder({
      class: 'smui-card__content',
      component: Div,
      contexts: {}
    });

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function detectEdgePseudoVarBug(windowObj) {
        // Detect versions of Edge with buggy var() support
        // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
        var document = windowObj.document;
        var node = document.createElement('div');
        node.className = 'mdc-ripple-surface--test-edge-var-bug';
        // Append to head instead of body because this script might be invoked in the
        // head, in which case the body doesn't exist yet. The probe works either way.
        document.head.appendChild(node);
        // The bug exists if ::before style ends up propagating to the parent element.
        // Additionally, getComputedStyle returns null in iframes with display: "none" in Firefox,
        // but Firefox is known to support CSS custom properties correctly.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        var computedStyle = windowObj.getComputedStyle(node);
        var hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return hasPseudoVarBug;
    }
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {
            supportsCssVars = !detectEdgePseudoVarBug(windowObj);
        }
        else {
            supportsCssVars = false;
        }
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter_ = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCComponent = /** @class */ (function () {
        function MDCComponent(root, foundation) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this.root_ = root;
            this.initialize.apply(this, __spread(args));
            // Note that we initialize foundation here and not within the constructor's default param so that
            // this.root_ is defined and can be used within the foundation class.
            this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;
            this.foundation_.init();
            this.initialSyncWithDOM();
        }
        MDCComponent.attachTo = function (root) {
            // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
            // returns an instantiated component with its root set to that element. Also note that in the cases of
            // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
            // from getDefaultFoundation().
            return new MDCComponent(root, new MDCFoundation({}));
        };
        /* istanbul ignore next: method param only exists for typing purposes; it does not need to be unit tested */
        MDCComponent.prototype.initialize = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            // Subclasses can override this to do any additional setup work that would be considered part of a
            // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
            // initialized. Any additional arguments besides root and foundation will be passed in here.
        };
        MDCComponent.prototype.getDefaultFoundation = function () {
            // Subclasses must override this method to return a properly configured foundation class for the
            // component.
            throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +
                'foundation class');
        };
        MDCComponent.prototype.initialSyncWithDOM = function () {
            // Subclasses should override this method if they need to perform work to synchronize with a host DOM
            // object. An example of this would be a form control wrapper that needs to synchronize its internal state
            // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
            // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
        };
        MDCComponent.prototype.destroy = function () {
            // Subclasses may implement this method to release any resources / deregister any listeners they have
            // attached. An example of this might be deregistering a resize event from the window object.
            this.foundation_.destroy();
        };
        MDCComponent.prototype.listen = function (evtType, handler, options) {
            this.root_.addEventListener(evtType, handler, options);
        };
        MDCComponent.prototype.unlisten = function (evtType, handler, options) {
            this.root_.removeEventListener(evtType, handler, options);
        };
        /**
         * Fires a cross-browser-compatible custom event from the component root of the given type, with the given data.
         */
        MDCComponent.prototype.emit = function (evtType, evtData, shouldBubble) {
            if (shouldBubble === void 0) { shouldBubble = false; }
            var evt;
            if (typeof CustomEvent === 'function') {
                evt = new CustomEvent(evtType, {
                    bubbles: shouldBubble,
                    detail: evtData,
                });
            }
            else {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(evtType, shouldBubble, false, evtData);
            }
            this.root_.dispatchEvent(evt);
        };
        return MDCComponent;
    }());

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from applyPassive to avoid redundant processing to detect
     * passive event listener support.
     */
    var supportsPassive_;
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive(globalObj, forceRefresh) {
        if (globalObj === void 0) { globalObj = window; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (supportsPassive_ === undefined || forceRefresh) {
            var isSupported_1 = false;
            try {
                globalObj.document.addEventListener('test', function () { return undefined; }, {
                    get passive() {
                        isSupported_1 = true;
                        return isSupported_1;
                    },
                });
            }
            catch (e) {
            } // tslint:disable-line:no-empty cannot throw error due to tests. tslint also disables console.log.
            supportsPassive_ = isSupported_1;
        }
        return supportsPassive_ ? { passive: true } : false;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        var el = element;
        while (el) {
            if (matches(el, selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }
    function matches(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300,
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCRippleFoundation.defaultAdapter, adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.addClass(ROOT_1);
                    if (_this.adapter_.isUnbounded()) {
                        _this.adapter_.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.removeClass(ROOT_2);
                    _this.adapter_.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter_.addClass(UNBOUNDED);
            }
            else {
                this.adapter_.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter_.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter_.isUnbounded()) {
                    this.adapter_.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter_.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter_.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter_.isUnbounded()) {
                this.adapter_.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter_.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter_.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined && activatedTargets.length > 0 && activatedTargets.some(function (target) { return _this.adapter_.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter_.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter_.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter_.computeBoundingRect();
            this.adapter_.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter_.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter_.removeClass(FG_DEACTIVATION);
                }, numbers.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter_.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter_.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter_.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            this.initialSize_ = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter_.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter_.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter_.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter_.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCRipple = /** @class */ (function (_super) {
        __extends(MDCRipple, _super);
        function MDCRipple() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.disabled = false;
            return _this;
        }
        MDCRipple.attachTo = function (root, opts) {
            if (opts === void 0) { opts = { isUnbounded: undefined }; }
            var ripple = new MDCRipple(root);
            // Only override unbounded behavior if option is explicitly specified
            if (opts.isUnbounded !== undefined) {
                ripple.unbounded = opts.isUnbounded;
            }
            return ripple;
        };
        MDCRipple.createAdapter = function (instance) {
            return {
                addClass: function (className) { return instance.root_.classList.add(className); },
                browserSupportsCssVars: function () { return supportsCssVariables(window); },
                computeBoundingRect: function () { return instance.root_.getBoundingClientRect(); },
                containsEventTarget: function (target) { return instance.root_.contains(target); },
                deregisterDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterInteractionHandler: function (evtType, handler) {
                    return instance.root_.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterResizeHandler: function (handler) { return window.removeEventListener('resize', handler); },
                getWindowPageOffset: function () { return ({ x: window.pageXOffset, y: window.pageYOffset }); },
                isSurfaceActive: function () { return matches(instance.root_, ':active'); },
                isSurfaceDisabled: function () { return Boolean(instance.disabled); },
                isUnbounded: function () { return Boolean(instance.unbounded); },
                registerDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.addEventListener(evtType, handler, applyPassive());
                },
                registerInteractionHandler: function (evtType, handler) {
                    return instance.root_.addEventListener(evtType, handler, applyPassive());
                },
                registerResizeHandler: function (handler) { return window.addEventListener('resize', handler); },
                removeClass: function (className) { return instance.root_.classList.remove(className); },
                updateCssVariable: function (varName, value) { return instance.root_.style.setProperty(varName, value); },
            };
        };
        Object.defineProperty(MDCRipple.prototype, "unbounded", {
            get: function () {
                return Boolean(this.unbounded_);
            },
            set: function (unbounded) {
                this.unbounded_ = Boolean(unbounded);
                this.setUnbounded_();
            },
            enumerable: true,
            configurable: true
        });
        MDCRipple.prototype.activate = function () {
            this.foundation_.activate();
        };
        MDCRipple.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        MDCRipple.prototype.layout = function () {
            this.foundation_.layout();
        };
        MDCRipple.prototype.getDefaultFoundation = function () {
            return new MDCRippleFoundation(MDCRipple.createAdapter(this));
        };
        MDCRipple.prototype.initialSyncWithDOM = function () {
            var root = this.root_;
            this.unbounded = 'mdcRippleIsUnbounded' in root.dataset;
        };
        /**
         * Closure Compiler throws an access control error when directly accessing a
         * protected or private property inside a getter/setter, like unbounded above.
         * By accessing the protected property inside a method, we solve that problem.
         * That's why this function exists.
         */
        MDCRipple.prototype.setUnbounded_ = function () {
            this.foundation_.setUnbounded(Boolean(this.unbounded_));
        };
        return MDCRipple;
    }(MDCComponent));

    function Ripple(node, props = {ripple: false, unbounded: false, color: null, classForward: () => {}}) {
      let instance = null;
      let addLayoutListener = getContext('SMUI:addLayoutListener');
      let removeLayoutListener;
      let classList = [];

      function addClass(className) {
        const idx = classList.indexOf(className);
        if (idx === -1) {
          node.classList.add(className);
          classList.push(className);
          if (props.classForward) {
            props.classForward(classList);
          }
        }
      }

      function removeClass(className) {
        const idx = classList.indexOf(className);
        if (idx !== -1) {
          node.classList.remove(className);
          classList.splice(idx, 1);
          if (props.classForward) {
            props.classForward(classList);
          }
        }
      }

      function handleProps() {
        if (props.ripple && !instance) {
          // Override the Ripple component's adapter, so that we can forward classes
          // to Svelte components that overwrite Ripple's classes.
          const _createAdapter = MDCRipple.createAdapter;
          MDCRipple.createAdapter = function(...args) {
            const adapter = _createAdapter.apply(this, args);
            adapter.addClass = function(className) {
              return addClass(className);
            };
            adapter.removeClass = function(className) {
              return removeClass(className);
            };
            return adapter;
          };
          instance = new MDCRipple(node);
          MDCRipple.createAdapter = _createAdapter;
        } else if (instance && !props.ripple) {
          instance.destroy();
          instance = null;
        }
        if (props.ripple) {
          instance.unbounded = !!props.unbounded;
          switch (props.color) {
            case 'surface':
              addClass('mdc-ripple-surface');
              removeClass('mdc-ripple-surface--primary');
              removeClass('mdc-ripple-surface--accent');
              return;
            case 'primary':
              addClass('mdc-ripple-surface');
              addClass('mdc-ripple-surface--primary');
              removeClass('mdc-ripple-surface--accent');
              return;
            case 'secondary':
              addClass('mdc-ripple-surface');
              removeClass('mdc-ripple-surface--primary');
              addClass('mdc-ripple-surface--accent');
              return;
          }
        }
        removeClass('mdc-ripple-surface');
        removeClass('mdc-ripple-surface--primary');
        removeClass('mdc-ripple-surface--accent');
      }

      handleProps();

      if (addLayoutListener) {
        removeLayoutListener = addLayoutListener(layout);
      }

      function layout() {
        if (instance) {
          instance.layout();
        }
      }

      return {
        update(newProps = {ripple: false, unbounded: false, color: null, classForward: []}) {
          props = newProps;
          handleProps();
        },

        destroy() {
          if (instance) {
            instance.destroy();
            instance = null;
            removeClass('mdc-ripple-surface');
            removeClass('mdc-ripple-surface--primary');
            removeClass('mdc-ripple-surface--accent');
          }

          if (removeLayoutListener) {
            removeLayoutListener();
          }
        }
      }
    }

    /* node_modules/@smui/card/Media.svelte generated by Svelte v3.47.0 */

    function create_fragment$4(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	let div_levels = [
    		{
    			class: div_class_value = "mdc-card__media " + /*className*/ ctx[1] + " " + (/*aspectRatio*/ ctx[2] === 'square'
    			? 'mdc-card__media--square'
    			: '') + " " + (/*aspectRatio*/ ctx[2] === '16x9'
    			? 'mdc-card__media--16-9'
    			: '') + ""
    		},
    		exclude(/*$$props*/ ctx[4], ['use', 'class', 'aspectRatio'])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[3].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, aspectRatio*/ 6 && div_class_value !== (div_class_value = "mdc-card__media " + /*className*/ ctx[1] + " " + (/*aspectRatio*/ ctx[2] === 'square'
    				? 'mdc-card__media--square'
    				: '') + " " + (/*aspectRatio*/ ctx[2] === '16x9'
    				? 'mdc-card__media--16-9'
    				: '') + "")) && { class: div_class_value },
    				dirty & /*$$props*/ 16 && exclude(/*$$props*/ ctx[4], ['use', 'class', 'aspectRatio'])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { aspectRatio = null } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('aspectRatio' in $$new_props) $$invalidate(2, aspectRatio = $$new_props.aspectRatio);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, className, aspectRatio, forwardEvents, $$props, $$scope, slots];
    }

    class Media extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { use: 0, class: 1, aspectRatio: 2 });
    	}
    }

    classAdderBuilder({
      class: 'mdc-card__media-content',
      component: Div,
      contexts: {}
    });

    /* node_modules/@smui/card/Actions.svelte generated by Svelte v3.47.0 */

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	let div_levels = [
    		{
    			class: div_class_value = "mdc-card__actions " + /*className*/ ctx[1] + " " + (/*fullBleed*/ ctx[2]
    			? 'mdc-card__actions--full-bleed'
    			: '') + ""
    		},
    		exclude(/*$$props*/ ctx[4], ['use', 'class', 'fullBleed'])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[3].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, fullBleed*/ 6 && div_class_value !== (div_class_value = "mdc-card__actions " + /*className*/ ctx[1] + " " + (/*fullBleed*/ ctx[2]
    				? 'mdc-card__actions--full-bleed'
    				: '') + "")) && { class: div_class_value },
    				dirty & /*$$props*/ 16 && exclude(/*$$props*/ ctx[4], ['use', 'class', 'fullBleed'])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { fullBleed = false } = $$props;
    	setContext('SMUI:button:context', 'card:action');
    	setContext('SMUI:icon-button:context', 'card:action');

    	$$self.$$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('fullBleed' in $$new_props) $$invalidate(2, fullBleed = $$new_props.fullBleed);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, className, fullBleed, forwardEvents, $$props, $$scope, slots];
    }

    class Actions extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { use: 0, class: 1, fullBleed: 2 });
    	}
    }

    classAdderBuilder({
      class: 'mdc-card__action-buttons',
      component: Div,
      contexts: {}
    });

    var ActionIcons = classAdderBuilder({
      class: 'mdc-card__action-icons',
      component: Div,
      contexts: {}
    });

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssPropertyNameMap = {
        animation: {
            prefixed: '-webkit-animation',
            standard: 'animation',
        },
        transform: {
            prefixed: '-webkit-transform',
            standard: 'transform',
        },
        transition: {
            prefixed: '-webkit-transition',
            standard: 'transition',
        },
    };
    function isWindow(windowObj) {
        return Boolean(windowObj.document) && typeof windowObj.document.createElement === 'function';
    }
    function getCorrectPropertyName(windowObj, cssProperty) {
        if (isWindow(windowObj) && cssProperty in cssPropertyNameMap) {
            var el = windowObj.document.createElement('div');
            var _a = cssPropertyNameMap[cssProperty], standard = _a.standard, prefixed = _a.prefixed;
            var isStandard = standard in el.style;
            return isStandard ? standard : prefixed;
        }
        return cssProperty;
    }

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        CLOSED_CLASS: 'mdc-linear-progress--closed',
        INDETERMINATE_CLASS: 'mdc-linear-progress--indeterminate',
        REVERSED_CLASS: 'mdc-linear-progress--reversed',
    };
    var strings$1 = {
        BUFFER_SELECTOR: '.mdc-linear-progress__buffer',
        PRIMARY_BAR_SELECTOR: '.mdc-linear-progress__primary-bar',
    };

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCLinearProgressFoundation = /** @class */ (function (_super) {
        __extends(MDCLinearProgressFoundation, _super);
        function MDCLinearProgressFoundation(adapter) {
            return _super.call(this, __assign({}, MDCLinearProgressFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCLinearProgressFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCLinearProgressFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCLinearProgressFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    getBuffer: function () { return null; },
                    getPrimaryBar: function () { return null; },
                    hasClass: function () { return false; },
                    removeClass: function () { return undefined; },
                    setStyle: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCLinearProgressFoundation.prototype.init = function () {
            this.isDeterminate_ = !this.adapter_.hasClass(cssClasses$1.INDETERMINATE_CLASS);
            this.isReversed_ = this.adapter_.hasClass(cssClasses$1.REVERSED_CLASS);
            this.progress_ = 0;
        };
        MDCLinearProgressFoundation.prototype.setDeterminate = function (isDeterminate) {
            this.isDeterminate_ = isDeterminate;
            if (this.isDeterminate_) {
                this.adapter_.removeClass(cssClasses$1.INDETERMINATE_CLASS);
                this.setScale_(this.adapter_.getPrimaryBar(), this.progress_);
            }
            else {
                this.adapter_.addClass(cssClasses$1.INDETERMINATE_CLASS);
                this.setScale_(this.adapter_.getPrimaryBar(), 1);
                this.setScale_(this.adapter_.getBuffer(), 1);
            }
        };
        MDCLinearProgressFoundation.prototype.setProgress = function (value) {
            this.progress_ = value;
            if (this.isDeterminate_) {
                this.setScale_(this.adapter_.getPrimaryBar(), value);
            }
        };
        MDCLinearProgressFoundation.prototype.setBuffer = function (value) {
            if (this.isDeterminate_) {
                this.setScale_(this.adapter_.getBuffer(), value);
            }
        };
        MDCLinearProgressFoundation.prototype.setReverse = function (isReversed) {
            this.isReversed_ = isReversed;
            if (this.isReversed_) {
                this.adapter_.addClass(cssClasses$1.REVERSED_CLASS);
            }
            else {
                this.adapter_.removeClass(cssClasses$1.REVERSED_CLASS);
            }
        };
        MDCLinearProgressFoundation.prototype.open = function () {
            this.adapter_.removeClass(cssClasses$1.CLOSED_CLASS);
        };
        MDCLinearProgressFoundation.prototype.close = function () {
            this.adapter_.addClass(cssClasses$1.CLOSED_CLASS);
        };
        MDCLinearProgressFoundation.prototype.setScale_ = function (el, scaleValue) {
            if (!el) {
                return;
            }
            var value = "scaleX(" + scaleValue + ")";
            this.adapter_.setStyle(el, getCorrectPropertyName(window, 'transform'), value);
        };
        return MDCLinearProgressFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCLinearProgress = /** @class */ (function (_super) {
        __extends(MDCLinearProgress, _super);
        function MDCLinearProgress() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCLinearProgress.attachTo = function (root) {
            return new MDCLinearProgress(root);
        };
        Object.defineProperty(MDCLinearProgress.prototype, "determinate", {
            set: function (value) {
                this.foundation_.setDeterminate(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCLinearProgress.prototype, "progress", {
            set: function (value) {
                this.foundation_.setProgress(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCLinearProgress.prototype, "buffer", {
            set: function (value) {
                this.foundation_.setBuffer(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCLinearProgress.prototype, "reverse", {
            set: function (value) {
                this.foundation_.setReverse(value);
            },
            enumerable: true,
            configurable: true
        });
        MDCLinearProgress.prototype.open = function () {
            this.foundation_.open();
        };
        MDCLinearProgress.prototype.close = function () {
            this.foundation_.close();
        };
        MDCLinearProgress.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                getBuffer: function () { return _this.root_.querySelector(MDCLinearProgressFoundation.strings.BUFFER_SELECTOR); },
                getPrimaryBar: function () { return _this.root_.querySelector(MDCLinearProgressFoundation.strings.PRIMARY_BAR_SELECTOR); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                setStyle: function (el, styleProperty, value) { return el.style.setProperty(styleProperty, value); },
            };
            return new MDCLinearProgressFoundation(adapter);
        };
        return MDCLinearProgress;
    }(MDCComponent));

    /* node_modules/@smui/linear-progress/LinearProgress.svelte generated by Svelte v3.47.0 */

    function create_fragment$6(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let div4_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let mounted;
    	let dispose;

    	let div4_levels = [
    		{
    			class: div4_class_value = "mdc-linear-progress " + /*className*/ ctx[1] + " " + (/*indeterminate*/ ctx[2]
    			? 'mdc-linear-progress--indeterminate'
    			: '') + " " + (/*reversed*/ ctx[3]
    			? 'mdc-linear-progress--reversed'
    			: '') + " " + (/*closed*/ ctx[4] ? 'mdc-linear-progress--closed' : '') + ""
    		},
    		{ role: "progressbar" },
    		exclude(/*$$props*/ ctx[7], ['use', 'class', 'indeterminate', 'reversed', 'closed', 'progress'])
    	];

    	let div4_data = {};

    	for (let i = 0; i < div4_levels.length; i += 1) {
    		div4_data = assign(div4_data, div4_levels[i]);
    	}

    	return {
    		c() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			div2.innerHTML = `<span class="mdc-linear-progress__bar-inner"></span>`;
    			t2 = space();
    			div3 = element("div");
    			div3.innerHTML = `<span class="mdc-linear-progress__bar-inner"></span>`;
    			attr(div0, "class", "mdc-linear-progress__buffering-dots");
    			attr(div1, "class", "mdc-linear-progress__buffer");
    			attr(div2, "class", "mdc-linear-progress__bar mdc-linear-progress__primary-bar");
    			attr(div3, "class", "mdc-linear-progress__bar mdc-linear-progress__secondary-bar");
    			set_attributes(div4, div4_data);
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			append(div4, t0);
    			append(div4, div1);
    			append(div4, t1);
    			append(div4, div2);
    			append(div4, t2);
    			append(div4, div3);
    			/*div4_binding*/ ctx[11](div4);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div4, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[6].call(null, div4))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			set_attributes(div4, div4_data = get_spread_update(div4_levels, [
    				dirty & /*className, indeterminate, reversed, closed*/ 30 && div4_class_value !== (div4_class_value = "mdc-linear-progress " + /*className*/ ctx[1] + " " + (/*indeterminate*/ ctx[2]
    				? 'mdc-linear-progress--indeterminate'
    				: '') + " " + (/*reversed*/ ctx[3]
    				? 'mdc-linear-progress--reversed'
    				: '') + " " + (/*closed*/ ctx[4] ? 'mdc-linear-progress--closed' : '') + "") && { class: div4_class_value },
    				{ role: "progressbar" },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], ['use', 'class', 'indeterminate', 'reversed', 'closed', 'progress'])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div4);
    			/*div4_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { indeterminate = false } = $$props;
    	let { reversed = false } = $$props;
    	let { closed = false } = $$props;
    	let { progress = 0 } = $$props;
    	let { buffer = null } = $$props;
    	let element;
    	let linearProgress;

    	onMount(() => {
    		$$invalidate(10, linearProgress = new MDCLinearProgress(element));
    	});

    	onDestroy(() => {
    		linearProgress && linearProgress.destroy();
    	});

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('indeterminate' in $$new_props) $$invalidate(2, indeterminate = $$new_props.indeterminate);
    		if ('reversed' in $$new_props) $$invalidate(3, reversed = $$new_props.reversed);
    		if ('closed' in $$new_props) $$invalidate(4, closed = $$new_props.closed);
    		if ('progress' in $$new_props) $$invalidate(8, progress = $$new_props.progress);
    		if ('buffer' in $$new_props) $$invalidate(9, buffer = $$new_props.buffer);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*linearProgress, indeterminate*/ 1028) {
    			 if (linearProgress) {
    				$$invalidate(10, linearProgress.determinate = !indeterminate, linearProgress);
    			}
    		}

    		if ($$self.$$.dirty & /*linearProgress, progress*/ 1280) {
    			 if (linearProgress) {
    				$$invalidate(10, linearProgress.progress = progress, linearProgress);
    			}
    		}

    		if ($$self.$$.dirty & /*linearProgress, buffer*/ 1536) {
    			 if (linearProgress) {
    				$$invalidate(10, linearProgress.buffer = buffer, linearProgress);
    			}
    		}

    		if ($$self.$$.dirty & /*linearProgress, reversed*/ 1032) {
    			 if (linearProgress) {
    				$$invalidate(10, linearProgress.reverse = reversed, linearProgress);
    			}
    		}

    		if ($$self.$$.dirty & /*linearProgress, closed*/ 1040) {
    			 if (linearProgress) {
    				if (closed) {
    					linearProgress.close();
    				} else {
    					linearProgress.open();
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		indeterminate,
    		reversed,
    		closed,
    		element,
    		forwardEvents,
    		$$props,
    		progress,
    		buffer,
    		linearProgress,
    		div4_binding
    	];
    }

    class LinearProgress extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			use: 0,
    			class: 1,
    			indeterminate: 2,
    			reversed: 3,
    			closed: 4,
    			progress: 8,
    			buffer: 9
    		});
    	}
    }

    /* node_modules/anymapper/src/InfoBox.svelte generated by Svelte v3.47.0 */

    function create_if_block$1(ctx) {
    	let div;
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				class: "mdc-elevation--z4",
    				style: "overflow: hidden;",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(card.$$.fragment);
    			attr(div, "class", "infobox svelte-1n9fa01");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(card, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope, $selection*/ 10) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(card);
    		}
    	};
    }

    // (45:3) {:else}
    function create_else_block(ctx) {
    	let linearprogress;
    	let current;
    	linearprogress = new LinearProgress({ props: { indeterminate: true } });

    	return {
    		c() {
    			create_component(linearprogress.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(linearprogress, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(linearprogress.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(linearprogress.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(linearprogress, detaching);
    		}
    	};
    }

    // (43:3) {#if $selection}
    function create_if_block_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (42:2) <Card class="mdc-elevation--z4" style="overflow: hidden;">
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$selection*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selected_id*/ ctx[0] && create_if_block$1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$selected_id*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selected_id*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $selected_id;
    	let $selection;
    	component_subscribe($$self, selected_id, $$value => $$invalidate(0, $selected_id = $$value));
    	component_subscribe($$self, selection$1, $$value => $$invalidate(1, $selection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	return [$selected_id, $selection, slots, $$scope];
    }

    class InfoBox extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
    	}
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        ICON_BUTTON_ON: 'mdc-icon-button--on',
        ROOT: 'mdc-icon-button',
    };
    var strings$2 = {
        ARIA_PRESSED: 'aria-pressed',
        CHANGE_EVENT: 'MDCIconButtonToggle:change',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCIconButtonToggleFoundation = /** @class */ (function (_super) {
        __extends(MDCIconButtonToggleFoundation, _super);
        function MDCIconButtonToggleFoundation(adapter) {
            return _super.call(this, __assign({}, MDCIconButtonToggleFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCIconButtonToggleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggleFoundation, "strings", {
            get: function () {
                return strings$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    notifyChange: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    setAttr: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCIconButtonToggleFoundation.prototype.init = function () {
            this.adapter_.setAttr(strings$2.ARIA_PRESSED, "" + this.isOn());
        };
        MDCIconButtonToggleFoundation.prototype.handleClick = function () {
            this.toggle();
            this.adapter_.notifyChange({ isOn: this.isOn() });
        };
        MDCIconButtonToggleFoundation.prototype.isOn = function () {
            return this.adapter_.hasClass(cssClasses$2.ICON_BUTTON_ON);
        };
        MDCIconButtonToggleFoundation.prototype.toggle = function (isOn) {
            if (isOn === void 0) { isOn = !this.isOn(); }
            if (isOn) {
                this.adapter_.addClass(cssClasses$2.ICON_BUTTON_ON);
            }
            else {
                this.adapter_.removeClass(cssClasses$2.ICON_BUTTON_ON);
            }
            this.adapter_.setAttr(strings$2.ARIA_PRESSED, "" + isOn);
        };
        return MDCIconButtonToggleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$3 = MDCIconButtonToggleFoundation.strings;
    var MDCIconButtonToggle = /** @class */ (function (_super) {
        __extends(MDCIconButtonToggle, _super);
        function MDCIconButtonToggle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.ripple_ = _this.createRipple_();
            return _this;
        }
        MDCIconButtonToggle.attachTo = function (root) {
            return new MDCIconButtonToggle(root);
        };
        MDCIconButtonToggle.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.handleClick_ = function () { return _this.foundation_.handleClick(); };
            this.listen('click', this.handleClick_);
        };
        MDCIconButtonToggle.prototype.destroy = function () {
            this.unlisten('click', this.handleClick_);
            this.ripple_.destroy();
            _super.prototype.destroy.call(this);
        };
        MDCIconButtonToggle.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                notifyChange: function (evtData) { return _this.emit(strings$3.CHANGE_EVENT, evtData); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                setAttr: function (attrName, attrValue) { return _this.root_.setAttribute(attrName, attrValue); },
            };
            return new MDCIconButtonToggleFoundation(adapter);
        };
        Object.defineProperty(MDCIconButtonToggle.prototype, "ripple", {
            get: function () {
                return this.ripple_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggle.prototype, "on", {
            get: function () {
                return this.foundation_.isOn();
            },
            set: function (isOn) {
                this.foundation_.toggle(isOn);
            },
            enumerable: true,
            configurable: true
        });
        MDCIconButtonToggle.prototype.createRipple_ = function () {
            var ripple = new MDCRipple(this.root_);
            ripple.unbounded = true;
            return ripple;
        };
        return MDCIconButtonToggle;
    }(MDCComponent));

    /* node_modules/@smui/icon-button/IconButton.svelte generated by Svelte v3.47.0 */

    function create_else_block$1(ctx) {
    	let button;
    	let button_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let button_levels = [
    		{
    			class: button_class_value = "mdc-icon-button " + /*className*/ ctx[2] + " " + (/*pressed*/ ctx[0] ? 'mdc-icon-button--on' : '') + " " + (/*context*/ ctx[10] === 'card:action'
    			? 'mdc-card__action'
    			: '') + " " + (/*context*/ ctx[10] === 'card:action'
    			? 'mdc-card__action--icon'
    			: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:navigation'
    			? 'mdc-top-app-bar__navigation-icon'
    			: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:action'
    			? 'mdc-top-app-bar__action-item'
    			: '') + " " + (/*context*/ ctx[10] === 'snackbar'
    			? 'mdc-snackbar__dismiss'
    			: '') + ""
    		},
    		{ "aria-hidden": "true" },
    		{ "aria-pressed": /*pressed*/ ctx[0] },
    		/*props*/ ctx[8]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	return {
    		c() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[17](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, button, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[9].call(null, button)),
    					action_destroyer(Ripple_action = Ripple.call(null, button, {
    						ripple: /*ripple*/ ctx[3] && !/*toggle*/ ctx[5],
    						unbounded: true,
    						color: /*color*/ ctx[4]
    					})),
    					listen(button, "MDCIconButtonToggle:change", /*handleChange*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*className, pressed*/ 5 && button_class_value !== (button_class_value = "mdc-icon-button " + /*className*/ ctx[2] + " " + (/*pressed*/ ctx[0] ? 'mdc-icon-button--on' : '') + " " + (/*context*/ ctx[10] === 'card:action'
    				? 'mdc-card__action'
    				: '') + " " + (/*context*/ ctx[10] === 'card:action'
    				? 'mdc-card__action--icon'
    				: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:navigation'
    				? 'mdc-top-app-bar__navigation-icon'
    				: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:action'
    				? 'mdc-top-app-bar__action-item'
    				: '') + " " + (/*context*/ ctx[10] === 'snackbar'
    				? 'mdc-snackbar__dismiss'
    				: '') + "")) && { class: button_class_value },
    				{ "aria-hidden": "true" },
    				(!current || dirty & /*pressed*/ 1) && { "aria-pressed": /*pressed*/ ctx[0] },
    				dirty & /*props*/ 256 && /*props*/ ctx[8]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, toggle, color*/ 56) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3] && !/*toggle*/ ctx[5],
    				unbounded: true,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (1:0) {#if href}
    function create_if_block$2(ctx) {
    	let a;
    	let a_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let a_levels = [
    		{
    			class: a_class_value = "mdc-icon-button " + /*className*/ ctx[2] + " " + (/*pressed*/ ctx[0] ? 'mdc-icon-button--on' : '') + " " + (/*context*/ ctx[10] === 'card:action'
    			? 'mdc-card__action'
    			: '') + " " + (/*context*/ ctx[10] === 'card:action'
    			? 'mdc-card__action--icon'
    			: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:navigation'
    			? 'mdc-top-app-bar__navigation-icon'
    			: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:action'
    			? 'mdc-top-app-bar__action-item'
    			: '') + " " + (/*context*/ ctx[10] === 'snackbar'
    			? 'mdc-snackbar__dismiss'
    			: '') + ""
    		},
    		{ "aria-hidden": "true" },
    		{ "aria-pressed": /*pressed*/ ctx[0] },
    		{ href: /*href*/ ctx[6] },
    		/*props*/ ctx[8]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[16](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[9].call(null, a)),
    					action_destroyer(Ripple_action = Ripple.call(null, a, {
    						ripple: /*ripple*/ ctx[3] && !/*toggle*/ ctx[5],
    						unbounded: true,
    						color: /*color*/ ctx[4]
    					})),
    					listen(a, "MDCIconButtonToggle:change", /*handleChange*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*className, pressed*/ 5 && a_class_value !== (a_class_value = "mdc-icon-button " + /*className*/ ctx[2] + " " + (/*pressed*/ ctx[0] ? 'mdc-icon-button--on' : '') + " " + (/*context*/ ctx[10] === 'card:action'
    				? 'mdc-card__action'
    				: '') + " " + (/*context*/ ctx[10] === 'card:action'
    				? 'mdc-card__action--icon'
    				: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:navigation'
    				? 'mdc-top-app-bar__navigation-icon'
    				: '') + " " + (/*context*/ ctx[10] === 'top-app-bar:action'
    				? 'mdc-top-app-bar__action-item'
    				: '') + " " + (/*context*/ ctx[10] === 'snackbar'
    				? 'mdc-snackbar__dismiss'
    				: '') + "")) && { class: a_class_value },
    				{ "aria-hidden": "true" },
    				(!current || dirty & /*pressed*/ 1) && { "aria-pressed": /*pressed*/ ctx[0] },
    				(!current || dirty & /*href*/ 64) && { href: /*href*/ ctx[6] },
    				dirty & /*props*/ 256 && /*props*/ ctx[8]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, toggle, color*/ 56) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3] && !/*toggle*/ ctx[5],
    				unbounded: true,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ['MDCIconButtonToggle:change']);
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { ripple = true } = $$props;
    	let { color = null } = $$props;
    	let { toggle = false } = $$props;
    	let { pressed = false } = $$props;
    	let { href = null } = $$props;
    	let element;
    	let toggleButton;
    	let context = getContext('SMUI:icon-button:context');
    	setContext('SMUI:icon:context', 'icon-button');
    	let oldToggle = null;

    	onDestroy(() => {
    		toggleButton && toggleButton.destroy();
    	});

    	function handleChange(e) {
    		$$invalidate(0, pressed = e.detail.isOn);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('ripple' in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('toggle' in $$new_props) $$invalidate(5, toggle = $$new_props.toggle);
    		if ('pressed' in $$new_props) $$invalidate(0, pressed = $$new_props.pressed);
    		if ('href' in $$new_props) $$invalidate(6, href = $$new_props.href);
    		if ('$$scope' in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		 $$invalidate(8, props = exclude($$props, ['use', 'class', 'ripple', 'color', 'toggle', 'pressed', 'href']));

    		if ($$self.$$.dirty & /*element, toggle, oldToggle, ripple, toggleButton, pressed*/ 12457) {
    			 if (element && toggle !== oldToggle) {
    				if (toggle) {
    					$$invalidate(12, toggleButton = new MDCIconButtonToggle(element));

    					if (!ripple) {
    						toggleButton.ripple.destroy();
    					}

    					$$invalidate(12, toggleButton.on = pressed, toggleButton);
    				} else if (oldToggle) {
    					toggleButton && toggleButton.destroy();
    					$$invalidate(12, toggleButton = null);
    				}

    				$$invalidate(13, oldToggle = toggle);
    			}
    		}

    		if ($$self.$$.dirty & /*toggleButton, pressed*/ 4097) {
    			 if (toggleButton && toggleButton.on !== pressed) {
    				$$invalidate(12, toggleButton.on = pressed, toggleButton);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		pressed,
    		use,
    		className,
    		ripple,
    		color,
    		toggle,
    		href,
    		element,
    		props,
    		forwardEvents,
    		context,
    		handleChange,
    		toggleButton,
    		oldToggle,
    		$$scope,
    		slots,
    		a_binding,
    		button_binding
    	];
    }

    class IconButton extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			use: 1,
    			class: 2,
    			ripple: 3,
    			color: 4,
    			toggle: 5,
    			pressed: 0,
    			href: 6
    		});
    	}
    }

    /* node_modules/anymapper/src/InfoBoxHeader.svelte generated by Svelte v3.47.0 */

    function create_default_slot_3(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("close");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (20:8) <ActionIcons>
    function create_default_slot_2(ctx) {
    	let iconbutton;
    	let current;

    	iconbutton = new IconButton({
    			props: {
    				class: "material-icons",
    				style: "color: var(--primary-fg-color);",
    				title: "Close",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			}
    		});

    	iconbutton.$on("click", clearSelection);

    	return {
    		c() {
    			create_component(iconbutton.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(iconbutton, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const iconbutton_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				iconbutton_changes.$$scope = { dirty, ctx };
    			}

    			iconbutton.$set(iconbutton_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(iconbutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(iconbutton, detaching);
    		}
    	};
    }

    // (19:4) <Actions>
    function create_default_slot_1(ctx) {
    	let actionicons;
    	let current;

    	actionicons = new ActionIcons({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(actionicons.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(actionicons, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const actionicons_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				actionicons_changes.$$scope = { dirty, ctx };
    			}

    			actionicons.$set(actionicons_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(actionicons.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(actionicons.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(actionicons, detaching);
    		}
    	};
    }

    // (25:0) <Content style="background: var(--primary-bg-color); color: var(--primary-fg-color);">
    function create_default_slot$2(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let h3;
    	let t2;

    	return {
    		c() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(/*subtitle*/ ctx[1]);
    			attr(h2, "class", "mdc-typography--headline6 svelte-7ly6e3");
    			attr(h3, "class", "mdc-typography--subtitle2 svelte-7ly6e3");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    			append(h2, t0);
    			insert(target, t1, anchor);
    			insert(target, h3, anchor);
    			append(h3, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data(t0, /*title*/ ctx[0]);
    			if (dirty & /*subtitle*/ 2) set_data(t2, /*subtitle*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    			if (detaching) detach(t1);
    			if (detaching) detach(h3);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let div;
    	let actions;
    	let t;
    	let content;
    	let current;

    	actions = new Actions({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	content = new Content({
    			props: {
    				style: "background: var(--primary-bg-color); color: var(--primary-fg-color);",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(actions.$$.fragment);
    			t = space();
    			create_component(content.$$.fragment);
    			set_style(div, "position", "absolute");
    			set_style(div, "top", "2px");
    			set_style(div, "right", "-4px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(actions, div, null);
    			insert(target, t, anchor);
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const actions_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				actions_changes.$$scope = { dirty, ctx };
    			}

    			actions.$set(actions_changes);
    			const content_changes = {};

    			if (dirty & /*$$scope, subtitle, title*/ 7) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(actions.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(actions.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(actions);
    			if (detaching) detach(t);
    			destroy_component(content, detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { title = 'Title' } = $$props;
    	let { subtitle = '' } = $$props;

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    	};

    	return [title, subtitle];
    }

    class InfoBoxHeader extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { title: 0, subtitle: 1 });
    	}
    }

    /* node_modules/anymapper/src/InlineSVG.svelte generated by Svelte v3.47.0 */

    function create_fragment$a(ctx) {
    	let g;

    	return {
    		c() {
    			g = svg_element("g");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			/*g_binding*/ ctx[3](g);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(g);
    			/*g_binding*/ ctx[3](null);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { node = null } = $$props;
    	let { path = null } = $$props;
    	let root_group;
    	const dispatch = createEventDispatcher();

    	onMount(async function () {
    		if (path && !node) {
    			$$invalidate(1, node = new DOMParser().parseFromString(await (await fetch(path)).text(), 'image/svg+xml').querySelector('svg'));
    		}

    		let inserted_node = root_group.appendChild(await node);

    		dispatch('ready', {
    			node: inserted_node, // pass the loaded node after insertion
    			
    		});
    	});

    	function g_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			root_group = $$value;
    			$$invalidate(0, root_group);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('node' in $$props) $$invalidate(1, node = $$props.node);
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    	};

    	return [root_group, node, path, g_binding];
    }

    class InlineSVG extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { node: 1, path: 2 });
    	}
    }

    /* node_modules/anymapper/src/TracingPaper.svelte generated by Svelte v3.47.0 */

    function create_fragment$b(ctx) {
    	let rect;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_width_value;
    	let rect_height_value;

    	return {
    		c() {
    			rect = svg_element("rect");
    			attr(rect, "class", "tracing_paper svelte-1uddirp");
    			attr(rect, "x", rect_x_value = /*$viewport*/ ctx[0].x);
    			attr(rect, "y", rect_y_value = /*$viewport*/ ctx[0].y);
    			attr(rect, "width", rect_width_value = /*$viewport*/ ctx[0].width);
    			attr(rect, "height", rect_height_value = /*$viewport*/ ctx[0].height);
    		},
    		m(target, anchor) {
    			insert(target, rect, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$viewport*/ 1 && rect_x_value !== (rect_x_value = /*$viewport*/ ctx[0].x)) {
    				attr(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$viewport*/ 1 && rect_y_value !== (rect_y_value = /*$viewport*/ ctx[0].y)) {
    				attr(rect, "y", rect_y_value);
    			}

    			if (dirty & /*$viewport*/ 1 && rect_width_value !== (rect_width_value = /*$viewport*/ ctx[0].width)) {
    				attr(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$viewport*/ 1 && rect_height_value !== (rect_height_value = /*$viewport*/ ctx[0].height)) {
    				attr(rect, "height", rect_height_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(rect);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $viewport;
    	component_subscribe($$self, viewport, $$value => $$invalidate(0, $viewport = $$value));
    	return [$viewport];
    }

    class TracingPaper extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});
    	}
    }

    /* node_modules/anymapper/src/Layer.svelte generated by Svelte v3.47.0 */

    function create_if_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*type*/ ctx[1] == 'floor' && /*current*/ ctx[3] && !/*first*/ ctx[2] && create_if_block_1$1();
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*type*/ ctx[1] == 'floor' && /*current*/ ctx[3] && !/*first*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*type, current, first*/ 14) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (17:2) {#if type == 'floor' && current && !first}
    function create_if_block_1$1(ctx) {
    	let tracingpaper;
    	let current;
    	tracingpaper = new TracingPaper({});

    	return {
    		c() {
    			create_component(tracingpaper.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tracingpaper, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tracingpaper.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tracingpaper.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tracingpaper, detaching);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let g;
    	let current;
    	let if_block = /*visible*/ ctx[4] && create_if_block$3(ctx);

    	return {
    		c() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr(g, "class", "layer");
    			attr(g, "data:name", /*name*/ ctx[0]);
    			attr(g, "data:type", /*type*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*visible*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*name*/ 1) {
    				attr(g, "data:name", /*name*/ ctx[0]);
    			}

    			if (!current || dirty & /*type*/ 2) {
    				attr(g, "data:type", /*type*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let visible;
    	let current;
    	let first;
    	let $layers;
    	let $current_layer;
    	component_subscribe($$self, layers, $$value => $$invalidate(5, $layers = $$value));
    	component_subscribe($$self, current_layer, $$value => $$invalidate(6, $current_layer = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { name } = $$props;
    	let { type = 'overlay' } = $$props;

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$layers, name*/ 33) {
    			 $$invalidate(4, visible = $layers && $layers.has(name) && $layers.get(name).visible);
    		}

    		if ($$self.$$.dirty & /*$current_layer, name*/ 65) {
    			 $$invalidate(3, current = $current_layer && $current_layer.name == name);
    		}

    		if ($$self.$$.dirty & /*$layers, name*/ 33) {
    			 $$invalidate(2, first = $layers && $layers.keys().next().value == name);
    		}
    	};

    	return [name, type, first, current, visible, $layers, $current_layer, $$scope, slots];
    }

    class Layer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { name: 0, type: 1 });
    	}
    }

    /* node_modules/@smui/paper/Paper.svelte generated by Svelte v3.47.0 */

    function create_fragment$d(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	let div_levels = [
    		{
    			class: div_class_value = "smui-paper " + /*className*/ ctx[1] + " " + (/*elevation*/ ctx[4] !== 0
    			? 'mdc-elevation--z' + /*elevation*/ ctx[4]
    			: '') + " " + (!/*square*/ ctx[2] ? 'smui-paper--rounded' : '') + " " + (/*color*/ ctx[3] === 'primary'
    			? 'smui-paper--color-primary'
    			: '') + " " + (/*color*/ ctx[3] === 'secondary'
    			? 'smui-paper--color-secondary'
    			: '') + " " + (/*transition*/ ctx[5] ? 'mdc-elevation-transition' : '') + ""
    		},
    		exclude(/*$$props*/ ctx[7], ['use', 'class', 'square', 'color', 'transition'])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[6].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, elevation, square, color, transition*/ 62 && div_class_value !== (div_class_value = "smui-paper " + /*className*/ ctx[1] + " " + (/*elevation*/ ctx[4] !== 0
    				? 'mdc-elevation--z' + /*elevation*/ ctx[4]
    				: '') + " " + (!/*square*/ ctx[2] ? 'smui-paper--rounded' : '') + " " + (/*color*/ ctx[3] === 'primary'
    				? 'smui-paper--color-primary'
    				: '') + " " + (/*color*/ ctx[3] === 'secondary'
    				? 'smui-paper--color-secondary'
    				: '') + " " + (/*transition*/ ctx[5] ? 'mdc-elevation-transition' : '') + "")) && { class: div_class_value },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], ['use', 'class', 'square', 'color', 'transition'])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { square = false } = $$props;
    	let { color = 'default' } = $$props;
    	let { elevation = 1 } = $$props;
    	let { transition = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('square' in $$new_props) $$invalidate(2, square = $$new_props.square);
    		if ('color' in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ('elevation' in $$new_props) $$invalidate(4, elevation = $$new_props.elevation);
    		if ('transition' in $$new_props) $$invalidate(5, transition = $$new_props.transition);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		square,
    		color,
    		elevation,
    		transition,
    		forwardEvents,
    		$$props,
    		$$scope,
    		slots
    	];
    }

    class Paper extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			use: 0,
    			class: 1,
    			square: 2,
    			color: 3,
    			elevation: 4,
    			transition: 5
    		});
    	}
    }

    classAdderBuilder({
      class: 'smui-paper__content',
      component: Div,
      contexts: {}
    });

    /* node_modules/@smui/common/H5.svelte generated by Svelte v3.47.0 */

    function create_fragment$e(ctx) {
    	let h5;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h5_levels = [exclude(/*$$props*/ ctx[2], ['use'])];
    	let h5_data = {};

    	for (let i = 0; i < h5_levels.length; i += 1) {
    		h5_data = assign(h5_data, h5_levels[i]);
    	}

    	return {
    		c() {
    			h5 = element("h5");
    			if (default_slot) default_slot.c();
    			set_attributes(h5, h5_data);
    		},
    		m(target, anchor) {
    			insert(target, h5, anchor);

    			if (default_slot) {
    				default_slot.m(h5, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h5, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, h5))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h5, h5_data = get_spread_update(h5_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ['use'])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h5);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class H5 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { use: 0 });
    	}
    }

    classAdderBuilder({
      class: 'smui-paper__title',
      component: H5,
      contexts: {}
    });

    /* node_modules/@smui/common/H6.svelte generated by Svelte v3.47.0 */

    function create_fragment$f(ctx) {
    	let h6;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h6_levels = [exclude(/*$$props*/ ctx[2], ['use'])];
    	let h6_data = {};

    	for (let i = 0; i < h6_levels.length; i += 1) {
    		h6_data = assign(h6_data, h6_levels[i]);
    	}

    	return {
    		c() {
    			h6 = element("h6");
    			if (default_slot) default_slot.c();
    			set_attributes(h6, h6_data);
    		},
    		m(target, anchor) {
    			insert(target, h6, anchor);

    			if (default_slot) {
    				default_slot.m(h6, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h6, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, h6))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h6, h6_data = get_spread_update(h6_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ['use'])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h6);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class H6 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { use: 0 });
    	}
    }

    classAdderBuilder({
      class: 'smui-paper__subtitle',
      component: H6,
      contexts: {}
    });

    /* node_modules/anymapper/src/OmniBox.svelte generated by Svelte v3.47.0 */

    function create_default_slot_1$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("search");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (77:2) {#if $results.length > 0}
    function create_if_block$4(ctx) {
    	let hr;
    	let t;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	return {
    		c() {
    			hr = element("hr");
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "class", "results svelte-184nuez");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t, anchor);
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t);
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (72:1) <Paper elevation="4" style="padding: 0; display: flex; flex-direction: column; height: 100%;">
    function create_default_slot$3(ctx) {
    	let div;
    	let input;
    	let t0;
    	let iconbutton;
    	let t1;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	iconbutton = new IconButton({
    			props: {
    				style: "margin: 0;",
    				class: "material-icons",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	iconbutton.$on("click", /*handleClick*/ ctx[2]);
    	let if_block = /*$results*/ ctx[1].length > 0 && create_if_block$4(ctx);

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			create_component(iconbutton.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(input, "type", "text");
    			attr(input, "placeholder", "Search");
    			attr(input, "class", "svelte-184nuez");
    			attr(div, "class", "wrapper svelte-184nuez");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*query*/ ctx[0]);
    			append(div, t0);
    			mount_component(iconbutton, div, null);
    			insert(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[5]),
    					listen(input, "input", /*handleInput*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*query*/ 1 && input.value !== /*query*/ ctx[0]) {
    				set_input_value(input, /*query*/ ctx[0]);
    			}

    			const iconbutton_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				iconbutton_changes.$$scope = { dirty, ctx };
    			}

    			iconbutton.$set(iconbutton_changes);

    			if (/*$results*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$results*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(iconbutton.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(iconbutton);
    			if (detaching) detach(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	let div;
    	let paper;
    	let current;

    	paper = new Paper({
    			props: {
    				elevation: "4",
    				style: "padding: 0; display: flex; flex-direction: column; height: 100%;",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(paper.$$.fragment);
    			attr(div, "class", "omnibox svelte-184nuez");
    			toggle_class(div, "fullscreen", /*$results*/ ctx[1].length > 0);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(paper, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const paper_changes = {};

    			if (dirty & /*$$scope, $results, query*/ 67) {
    				paper_changes.$$scope = { dirty, ctx };
    			}

    			paper.$set(paper_changes);

    			if (dirty & /*$results*/ 2) {
    				toggle_class(div, "fullscreen", /*$results*/ ctx[1].length > 0);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(paper.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(paper.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(paper);
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $results;
    	component_subscribe($$self, results, $$value => $$invalidate(1, $results = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let query;
    	const dispatch = createEventDispatcher();

    	function search() {
    		clearSelection();
    		dispatch('search', { query });
    	}

    	function handleClick() {
    		search();
    	}

    	function handleInput() {
    		search();
    	}

    	function input_input_handler() {
    		query = this.value;
    		$$invalidate(0, query);
    	}

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	return [query, $results, handleClick, handleInput, slots, input_input_handler, $$scope];
    }

    class OmniBox extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});
    	}
    }

    /* node_modules/anymapper/src/ResultsBox.svelte generated by Svelte v3.47.0 */

    function create_if_block$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "class", "box svelte-1sqge9h");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$results*/ ctx[0] && create_if_block$5(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$results*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$results*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $results;
    	component_subscribe($$self, results, $$value => $$invalidate(0, $results = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [$results, $$scope, slots];
    }

    class ResultsBox extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
    	}
    }

    /* node_modules/anymapper/src/SVGLayers.svelte generated by Svelte v3.47.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (1:0) <script>     import Layer from './Layer.svelte'     import InlineSVG from './InlineSVG.svelte'   export let path  export let names  export let modes  export let preprocess = null  export let postprocess = null   $: modes_array = modes.split(' ')      async function retrieveLayers() {   let parser = new DOMParser()   let svg = parser.parseFromString(await (await fetch(path)).text(), 'image/svg+xml').querySelector('svg')      if(preprocess)    preprocess(svg)    let data = new Map(Array.from(svg.querySelectorAll('.layer')).map(d => [d.getAttribute('id'), d]))    if(postprocess)    postprocess(data)    return data  }
    function create_catch_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (33:35)     <InlineSVG node={ready_layers.get(name)}
    function create_then_block(ctx) {
    	let inlinesvg;
    	let current;

    	inlinesvg = new InlineSVG({
    			props: {
    				node: /*ready_layers*/ ctx[11].get(/*name*/ ctx[8])
    			}
    		});

    	return {
    		c() {
    			create_component(inlinesvg.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(inlinesvg, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const inlinesvg_changes = {};
    			if (dirty & /*names*/ 1) inlinesvg_changes.node = /*ready_layers*/ ctx[11].get(/*name*/ ctx[8]);
    			inlinesvg.$set(inlinesvg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(inlinesvg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(inlinesvg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(inlinesvg, detaching);
    		}
    	};
    }

    // (1:0) <script>     import Layer from './Layer.svelte'     import InlineSVG from './InlineSVG.svelte'   export let path  export let names  export let modes  export let preprocess = null  export let postprocess = null   $: modes_array = modes.split(' ')      async function retrieveLayers() {   let parser = new DOMParser()   let svg = parser.parseFromString(await (await fetch(path)).text(), 'image/svg+xml').querySelector('svg')      if(preprocess)    preprocess(svg)    let data = new Map(Array.from(svg.querySelectorAll('.layer')).map(d => [d.getAttribute('id'), d]))    if(postprocess)    postprocess(data)    return data  }
    function create_pending_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (32:1) <Layer name={name} type={modes_array[i]}>
    function create_default_slot$4(ctx) {
    	let promise;
    	let t;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 11,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*layers*/ ctx[2], info);

    	return {
    		c() {
    			info.block.c();
    			t = space();
    		},
    		m(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t.parentNode;
    			info.anchor = t;
    			insert(target, t, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach(t);
    		}
    	};
    }

    // (31:0) {#each names.split(' ') as name, i}
    function create_each_block$1(ctx) {
    	let layer;
    	let current;

    	layer = new Layer({
    			props: {
    				name: /*name*/ ctx[8],
    				type: /*modes_array*/ ctx[1][/*i*/ ctx[10]],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(layer.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const layer_changes = {};
    			if (dirty & /*names*/ 1) layer_changes.name = /*name*/ ctx[8];
    			if (dirty & /*modes_array*/ 2) layer_changes.type = /*modes_array*/ ctx[1][/*i*/ ctx[10]];

    			if (dirty & /*$$scope, names*/ 4097) {
    				layer_changes.$$scope = { dirty, ctx };
    			}

    			layer.$set(layer_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(layer, detaching);
    		}
    	};
    }

    function create_fragment$i(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*names*/ ctx[0].split(' ');
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*names, modes_array, layers*/ 7) {
    				each_value = /*names*/ ctx[0].split(' ');
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let modes_array;
    	let { path } = $$props;
    	let { names } = $$props;
    	let { modes } = $$props;
    	let { preprocess = null } = $$props;
    	let { postprocess = null } = $$props;

    	async function retrieveLayers() {
    		let parser = new DOMParser();
    		let svg = parser.parseFromString(await (await fetch(path)).text(), 'image/svg+xml').querySelector('svg');
    		if (preprocess) preprocess(svg);
    		let data = new Map(Array.from(svg.querySelectorAll('.layer')).map(d => [d.getAttribute('id'), d]));
    		if (postprocess) postprocess(data);
    		return data;
    	}

    	let layers = retrieveLayers();

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    		if ('names' in $$props) $$invalidate(0, names = $$props.names);
    		if ('modes' in $$props) $$invalidate(4, modes = $$props.modes);
    		if ('preprocess' in $$props) $$invalidate(5, preprocess = $$props.preprocess);
    		if ('postprocess' in $$props) $$invalidate(6, postprocess = $$props.postprocess);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*modes*/ 16) {
    			 $$invalidate(1, modes_array = modes.split(' '));
    		}
    	};

    	return [names, modes_array, layers, path, modes, preprocess, postprocess];
    }

    class SVGLayers extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			path: 3,
    			names: 0,
    			modes: 4,
    			preprocess: 5,
    			postprocess: 6
    		});
    	}
    }

    /* node_modules/anymapper/src/View.svelte generated by Svelte v3.47.0 */

    function create_fragment$j(ctx) {
    	let svg_1;
    	let g;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	return {
    		c() {
    			svg_1 = svg_element("svg");
    			g = svg_element("g");
    			if (default_slot) default_slot.c();
    			attr(g, "transform", /*$user_transform*/ ctx[2]);
    			attr(svg_1, "class", "view svelte-8t1hrz");
    			attr(svg_1, "viewBox", /*viewBox*/ ctx[0]);
    			attr(svg_1, "tabindex", "0");
    		},
    		m(target, anchor) {
    			insert(target, svg_1, anchor);
    			append(svg_1, g);

    			if (default_slot) {
    				default_slot.m(g, null);
    			}

    			/*svg_1_binding*/ ctx[7](svg_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen(svg_1, "keyup", /*handleKeyUp*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$user_transform*/ 4) {
    				attr(g, "transform", /*$user_transform*/ ctx[2]);
    			}

    			if (!current || dirty & /*viewBox*/ 1) {
    				attr(svg_1, "viewBox", /*viewBox*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(svg_1);
    			if (default_slot) default_slot.d(detaching);
    			/*svg_1_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $zoom;
    	let $viewport;
    	let $settled_viewport;
    	let $settled_zoom;
    	let $user_transform;
    	let $screen_transform;
    	let $screen_size;
    	let $current_layer;
    	let $layers;
    	let $viewBoxRect;
    	component_subscribe($$self, zoom$1, $$value => $$invalidate(11, $zoom = $$value));
    	component_subscribe($$self, viewport, $$value => $$invalidate(12, $viewport = $$value));
    	component_subscribe($$self, settled_viewport, $$value => $$invalidate(13, $settled_viewport = $$value));
    	component_subscribe($$self, settled_zoom, $$value => $$invalidate(14, $settled_zoom = $$value));
    	component_subscribe($$self, user_transform, $$value => $$invalidate(2, $user_transform = $$value));
    	component_subscribe($$self, screen_transform, $$value => $$invalidate(15, $screen_transform = $$value));
    	component_subscribe($$self, screen_size, $$value => $$invalidate(16, $screen_size = $$value));
    	component_subscribe($$self, current_layer, $$value => $$invalidate(17, $current_layer = $$value));
    	component_subscribe($$self, layers, $$value => $$invalidate(18, $layers = $$value));
    	component_subscribe($$self, viewBoxRect, $$value => $$invalidate(19, $viewBoxRect = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { viewBox } = $$props;
    	let { interpolateZoom = interpolateValue } = $$props;
    	let svg;
    	let zoom_behavior;
    	let current = false;
    	let debounce_timeout;

    	onMount(() => {
    		// store viewBox rect in a global store
    		set_store_value(viewBoxRect, $viewBoxRect = svg.viewBox.baseVal, $viewBoxRect);

    		// auto populate layers store from defined Layer components
    		set_store_value(layers, $layers = new Map(), $layers);

    		let first_done = false;

    		svg.querySelectorAll('.layer').forEach(layer => {
    			let key = layer.getAttribute('data:name');
    			let type = layer.getAttribute('data:type');
    			let visible = false;

    			// first base or floor layer visible and current by default
    			if (!first_done && (type == 'base' || type == 'floor')) {
    				visible = true;
    				first_done = true;
    				current = true;
    			}

    			// overlays are visible by default
    			if (type == 'overlay') {
    				visible = true;
    			}

    			let d = { name: key, type, visible };
    			$layers.set(key, d);

    			if (current) {
    				set_store_value(current_layer, $current_layer = d, $current_layer);
    				current = false;
    			}
    		});

    		// enable d3 zoom
    		zoom_behavior = zoom().scaleExtent([0, Infinity]).interpolate(interpolateZoom).on('zoom', handleZoom);

    		select(svg).call(zoom_behavior);

    		function handleZoom() {
    			set_store_value(user_transform, $user_transform = event.transform, $user_transform);
    			updateGlobals();
    			updateLODElementsInSVG();
    		}

    		// focus to enable keyboard interaction
    		svg.focus();

    		// update LOD-sensitive elements that are defined inside the SVG
    		function updateLODElementsInSVG() {
    			svg.querySelectorAll('[data-lodrange]').forEach(elem => {
    				let lod_range = JSON.parse(elem.getAttribute('data-lodrange')).map(d => d == 'Infinity' ? Infinity : d);
    				let lod_visible = $user_transform.k >= lod_range[0] && $user_transform.k <= lod_range[1];
    				elem.setAttribute('visibility', lod_visible ? 'visible' : 'hidden');
    			});
    		}

    		updateGlobals();
    		updateLODElementsInSVG();

    		window.addEventListener(
    			'resize',
    			function (event) {
    				updateGlobals();
    			},
    			true
    		);

    		// listen to layer changes
    		current_layer.subscribe(handleNewLayer);
    	});

    	function updateGlobals() {
    		set_store_value(screen_size, $screen_size = svg.getBoundingClientRect(), $screen_size);
    		let ctm = svg.getCTM();
    		set_store_value(screen_transform, $screen_transform = identity$1.translate(ctm.e, ctm.f).scale(ctm.a), $screen_transform);
    		set_store_value(zoom$1, $zoom = $screen_transform.k * $user_transform.k, $zoom);
    		set_store_value(viewport, $viewport = new DOMRect((-$screen_transform.x / $screen_transform.k - $user_transform.x) / $user_transform.k, (-$screen_transform.y / $screen_transform.k - $user_transform.y) / $user_transform.k, $screen_size.width / $screen_transform.k / $user_transform.k, $screen_size.height / $screen_transform.k / $user_transform.k), $viewport);

    		// debounced update of settled globals
    		clearTimeout(debounce_timeout);

    		debounce_timeout = setTimeout(
    			function (event) {
    				set_store_value(settled_zoom, $settled_zoom = $zoom, $settled_zoom);
    				set_store_value(settled_viewport, $settled_viewport = $viewport, $settled_viewport);
    			},
    			300
    		);
    	}

    	function scaleBy(k, duration) {
    		duration = duration === undefined ? 300 : duration;
    		zoom_behavior.scaleBy(select(svg).transition().duration(duration), k);
    	}

    	function translateBy(x, y, duration) {
    		duration = duration === undefined ? 300 : duration;
    		zoom_behavior.translateBy(select(svg).transition().duration(duration), x, y);
    	}

    	function translateTo(p, duration) {
    		duration = duration === undefined ? 1200 : duration;
    		zoom_behavior.translateTo(select(svg).transition().duration(duration), p.x, p.y);
    	}

    	// listen to selection changes
    	selection$1.subscribe(handleNewSelection);

    	function handleNewSelection(d) {
    		if (d && d.position) {
    			translateTo(d.position);
    		}
    	}

    	// listen to hovered changes
    	hovered_id.subscribe(handleHover);

    	function handleHover(id) {
    		if (!svg) return;

    		svg.querySelectorAll('.selectable').forEach(elem => {
    			if (elem.getAttribute('id') == id) {
    				elem.classList.add('hovered');
    			} else {
    				elem.classList.remove('hovered');
    			}
    		});
    	}

    	async function handleNewLayer(new_layer) {
    		// wait for DOM to be synced
    		await (() => new Promise(requestAnimationFrame))();

    		// hide or show layer-sensitive elements in SVG
    		svg.querySelectorAll('[data-inlayers]').forEach(elem => {
    			let in_layers = JSON.parse(elem.getAttribute('data-inlayers'));
    			let visible = in_layers.includes(new_layer.name);
    			elem.setAttribute('visibility', visible ? 'visible' : 'hidden');
    		});
    	}

    	function handleKeyUp(e) {
    		const delta = 100 / $zoom;

    		// pan and zoom keyboard control
    		switch (e.key) {
    			case 'ArrowRight':
    				translateBy(-delta, 0);
    				break;
    			case 'ArrowLeft':
    				translateBy(delta, 0);
    				break;
    			case 'ArrowUp':
    				translateBy(0, delta);
    				break;
    			case 'ArrowDown':
    				translateBy(0, -delta);
    				break;
    			case '+':
    				scaleBy(1.5);
    				break;
    			case '-':
    				scaleBy(0.66);
    				break;
    		}
    	}

    	function svg_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			svg = $$value;
    			$$invalidate(1, svg);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('viewBox' in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ('interpolateZoom' in $$props) $$invalidate(4, interpolateZoom = $$props.interpolateZoom);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	return [
    		viewBox,
    		svg,
    		$user_transform,
    		handleKeyUp,
    		interpolateZoom,
    		$$scope,
    		slots,
    		svg_1_binding
    	];
    }

    class View extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { viewBox: 0, interpolateZoom: 4 });
    	}
    }

    const {getPrototypeOf, getOwnPropertyDescriptors} = Object;
    const objectPrototype = getPrototypeOf({});

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv(",");

    var csvParse = csv.parse;
    var csvParseRows = csv.parseRows;

    var tsv = dsv("\t");

    var tsvParse = tsv.parse;
    var tsvParseRows = tsv.parseRows;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    const metas = new Map;
    const queue = [];
    const map$1 = queue.map;
    const some = queue.some;
    const hasOwnProperty = queue.hasOwnProperty;
    const origin = "https://cdn.jsdelivr.net/npm/";
    const identifierRe = /^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(?:\/(.*))?$/;
    const versionRe = /^\d+\.\d+\.\d+(-[\w-.+]+)?$/;
    const extensionRe = /\.[^/]*$/;
    const mains = ["unpkg", "jsdelivr", "browser", "main"];

    class RequireError extends Error {
      constructor(message) {
        super(message);
      }
    }

    RequireError.prototype.name = RequireError.name;

    function main(meta) {
      for (const key of mains) {
        const value = meta[key];
        if (typeof value === "string") {
          return extensionRe.test(value) ? value : `${value}.js`;
        }
      }
    }

    function parseIdentifier(identifier) {
      const match = identifierRe.exec(identifier);
      return match && {
        name: match[1],
        version: match[2],
        path: match[3]
      };
    }

    function resolveMeta(target) {
      const url = `${origin}${target.name}${target.version ? `@${target.version}` : ""}/package.json`;
      let meta = metas.get(url);
      if (!meta) metas.set(url, meta = fetch(url).then(response => {
        if (!response.ok) throw new RequireError("unable to load package.json");
        if (response.redirected && !metas.has(response.url)) metas.set(response.url, meta);
        return response.json();
      }));
      return meta;
    }

    async function resolve(name, base) {
      if (name.startsWith(origin)) name = name.substring(origin.length);
      if (/^(\w+:)|\/\//i.test(name)) return name;
      if (/^[.]{0,2}\//i.test(name)) return new URL(name, base == null ? location : base).href;
      if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name)) throw new RequireError("illegal name");
      const target = parseIdentifier(name);
      if (!target) return `${origin}${name}`;
      if (!target.version && base != null && base.startsWith(origin)) {
        const meta = await resolveMeta(parseIdentifier(base.substring(origin.length)));
        target.version = meta.dependencies && meta.dependencies[target.name] || meta.peerDependencies && meta.peerDependencies[target.name];
      }
      if (target.path && !extensionRe.test(target.path)) target.path += ".js";
      if (target.path && target.version && versionRe.test(target.version)) return `${origin}${target.name}@${target.version}/${target.path}`;
      const meta = await resolveMeta(target);
      return `${origin}${meta.name}@${meta.version}/${target.path || main(meta) || "index.js"}`;
    }

    var require = requireFrom(resolve);

    function requireFrom(resolver) {
      const cache = new Map;
      const requireBase = requireRelative(null);

      function requireAbsolute(url) {
        if (typeof url !== "string") return url;
        let module = cache.get(url);
        if (!module) cache.set(url, module = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.onload = () => {
            try { resolve(queue.pop()(requireRelative(url))); }
            catch (error) { reject(new RequireError("invalid module")); }
            script.remove();
          };
          script.onerror = () => {
            reject(new RequireError("unable to load module"));
            script.remove();
          };
          script.async = true;
          script.src = url;
          window.define = define$1;
          document.head.appendChild(script);
        }));
        return module;
      }

      function requireRelative(base) {
        return name => Promise.resolve(resolver(name, base)).then(requireAbsolute);
      }

      function requireAlias(aliases) {
        return requireFrom((name, base) => {
          if (name in aliases) {
            name = aliases[name], base = null;
            if (typeof name !== "string") return name;
          }
          return resolver(name, base);
        });
      }

      function require(name) {
        return arguments.length > 1
            ? Promise.all(map$1.call(arguments, requireBase)).then(merge)
            : requireBase(name);
      }

      require.alias = requireAlias;
      require.resolve = resolver;

      return require;
    }

    function merge(modules) {
      const o = {};
      for (const m of modules) {
        for (const k in m) {
          if (hasOwnProperty.call(m, k)) {
            if (m[k] == null) Object.defineProperty(o, k, {get: getter(m, k)});
            else o[k] = m[k];
          }
        }
      }
      return o;
    }

    function getter(object, name) {
      return () => object[name];
    }

    function isbuiltin(name) {
      name = name + "";
      return name === "exports" || name === "module";
    }

    function define$1(name, dependencies, factory) {
      const n = arguments.length;
      if (n < 2) factory = name, dependencies = [];
      else if (n < 3) factory = dependencies, dependencies = typeof name === "string" ? [] : name;
      queue.push(some.call(dependencies, isbuiltin) ? require => {
        const exports = {};
        const module = {exports};
        return Promise.all(map$1.call(dependencies, name => {
          name = name + "";
          return name === "exports" ? exports : name === "module" ? module : require(name);
        })).then(dependencies => {
          factory.apply(null, dependencies);
          return module.exports;
        });
      } : require => {
        return Promise.all(map$1.call(dependencies, require)).then(dependencies => {
          return typeof factory === "function" ? factory.apply(null, dependencies) : factory;
        });
      });
    }

    define$1.amd = {};

    function dependency(name, version, main) {
      return {
        resolve(path = main) {
          return `https://cdn.jsdelivr.net/npm/${name}@${version}/${path}`;
        }
      };
    }

    const d3 = dependency("d3", "7.3.0", "dist/d3.min.js");
    const inputs = dependency("@observablehq/inputs", "0.10.4", "dist/inputs.min.js");
    const plot = dependency("@observablehq/plot", "0.4.2", "dist/plot.umd.min.js");
    const graphviz = dependency("@observablehq/graphviz", "0.2.1", "dist/graphviz.min.js");
    const highlight = dependency("@observablehq/highlight.js", "2.0.0", "highlight.min.js");
    const katex = dependency("@observablehq/katex", "0.11.1", "dist/katex.min.js");
    const lodash = dependency("lodash", "4.17.21", "lodash.min.js");
    const htl = dependency("htl", "0.3.1", "dist/htl.min.js");
    const jszip = dependency("jszip", "3.7.1", "dist/jszip.min.js");
    const marked = dependency("marked", "0.3.12", "marked.min.js");
    const sql = dependency("sql.js", "1.6.2", "dist/sql-wasm.js");
    const vega = dependency("vega", "5.21.0", "build/vega.min.js");
    const vegalite = dependency("vega-lite", "5.2.0", "build/vega-lite.min.js");
    const vegaliteApi = dependency("vega-lite-api", "5.0.0", "build/vega-lite-api.min.js");
    const arrow = dependency("apache-arrow", "4.0.1", "Arrow.es2015.min.js");
    const arquero = dependency("arquero", "4.8.8", "dist/arquero.min.js");
    const topojson = dependency("topojson-client", "3.1.0", "dist/topojson-client.min.js");
    const exceljs = dependency("exceljs", "4.3.0", "dist/exceljs.min.js");

    async function sqlite(require) {
      const init = await require(sql.resolve());
      return init({locateFile: file => sql.resolve(`dist/${file}`)});
    }

    class SQLiteDatabaseClient {
      constructor(db) {
        Object.defineProperties(this, {
          _db: {value: db}
        });
      }
      static async open(source) {
        const [SQL, buffer] = await Promise.all([sqlite(require), Promise.resolve(source).then(load)]);
        return new SQLiteDatabaseClient(new SQL.Database(buffer));
      }
      async query(query, params) {
        return await exec(this._db, query, params);
      }
      async queryRow(query, params) {
        return (await this.query(query, params))[0] || null;
      }
      async explain(query, params) {
        const rows = await this.query(`EXPLAIN QUERY PLAN ${query}`, params);
        return element$2("pre", {className: "observablehq--inspect"}, [
          text$1(rows.map(row => row.detail).join("\n"))
        ]);
      }
      async describe(object) {
        const rows = await (object === undefined
          ? this.query(`SELECT name FROM sqlite_master WHERE type = 'table'`)
          : this.query(`SELECT * FROM pragma_table_info(?)`, [object]));
        if (!rows.length) throw new Error("Not found");
        const {columns} = rows;
        return element$2("table", {value: rows}, [
          element$2("thead", [element$2("tr", columns.map(c => element$2("th", [text$1(c)])))]),
          element$2("tbody", rows.map(r => element$2("tr", columns.map(c => element$2("td", [text$1(r[c])])))))
        ]);
      }
      async sql(strings, ...args) {
        return this.query(strings.join("?"), args);
      }
    }
    Object.defineProperty(SQLiteDatabaseClient.prototype, "dialect", {
      value: "sqlite"
    });

    function load(source) {
      return typeof source === "string" ? fetch(source).then(load)
        : source instanceof Response || source instanceof Blob ? source.arrayBuffer().then(load)
        : source instanceof ArrayBuffer ? new Uint8Array(source)
        : source;
    }

    async function exec(db, query, params) {
      const [result] = await db.exec(query, params);
      if (!result) return [];
      const {columns, values} = result;
      const rows = values.map(row => Object.fromEntries(row.map((value, i) => [columns[i], value])));
      rows.columns = columns;
      return rows;
    }

    function element$2(name, props, children) {
      if (arguments.length === 2) children = props, props = undefined;
      const element = document.createElement(name);
      if (props !== undefined) for (const p in props) element[p] = props[p];
      if (children !== undefined) for (const c of children) element.appendChild(c);
      return element;
    }

    function text$1(value) {
      return document.createTextNode(value);
    }

    class Workbook {
      constructor(workbook) {
        Object.defineProperties(this, {
          _: {value: workbook},
          sheetNames: {
            value: workbook.worksheets.map((s) => s.name),
            enumerable: true,
          },
        });
      }
      sheet(name, options) {
        const sname =
          typeof name === "number"
            ? this.sheetNames[name]
            : this.sheetNames.includes((name += ""))
            ? name
            : null;
        if (sname == null) throw new Error(`Sheet not found: ${name}`);
        const sheet = this._.getWorksheet(sname);
        return extract(sheet, options);
      }
    }

    function extract(sheet, {range, headers} = {}) {
      let [[c0, r0], [c1, r1]] = parseRange(range, sheet);
      const headerRow = headers ? sheet._rows[r0++] : null;
      let names = new Set(["#"]);
      for (let n = c0; n <= c1; n++) {
        const value = headerRow ? valueOf(headerRow.findCell(n + 1)) : null;
        let name = (value && value + "") || toColumn(n);
        while (names.has(name)) name += "_";
        names.add(name);
      }
      names = new Array(c0).concat(Array.from(names));

      const output = new Array(r1 - r0 + 1);
      for (let r = r0; r <= r1; r++) {
        const row = (output[r - r0] = Object.create(null, {"#": {value: r + 1}}));
        const _row = sheet.getRow(r + 1);
        if (_row.hasValues)
          for (let c = c0; c <= c1; c++) {
            const value = valueOf(_row.findCell(c + 1));
            if (value != null) row[names[c + 1]] = value;
          }
      }

      output.columns = names.filter(() => true); // Filter sparse columns
      return output;
    }

    function valueOf(cell) {
      if (!cell) return;
      const {value} = cell;
      if (value && typeof value === "object" && !(value instanceof Date)) {
        if (value.formula || value.sharedFormula) {
          return value.result && value.result.error ? NaN : value.result;
        }
        if (value.richText) {
          return richText(value);
        }
        if (value.text) {
          let {text} = value;
          if (text.richText) text = richText(text);
          return value.hyperlink && value.hyperlink !== text
            ? `${value.hyperlink} ${text}`
            : text;
        }
        return value;
      }
      return value;
    }

    function richText(value) {
      return value.richText.map((d) => d.text).join("");
    }

    function parseRange(specifier = ":", {columnCount, rowCount}) {
      specifier += "";
      if (!specifier.match(/^[A-Z]*\d*:[A-Z]*\d*$/))
        throw new Error("Malformed range specifier");
      const [[c0 = 0, r0 = 0], [c1 = columnCount - 1, r1 = rowCount - 1]] =
        specifier.split(":").map(fromCellReference);
      return [
        [c0, r0],
        [c1, r1],
      ];
    }

    // Returns the default column name for a zero-based column index.
    // For example: 0 -> "A", 1 -> "B", 25 -> "Z", 26 -> "AA", 27 -> "AB".
    function toColumn(c) {
      let sc = "";
      c++;
      do {
        sc = String.fromCharCode(64 + (c % 26 || 26)) + sc;
      } while ((c = Math.floor((c - 1) / 26)));
      return sc;
    }

    // Returns the zero-based indexes from a cell reference.
    // For example: "A1" -> [0, 0], "B2" -> [1, 1], "AA10" -> [26, 9].
    function fromCellReference(s) {
      const [, sc, sr] = s.match(/^([A-Z]*)(\d*)$/);
      let c = 0;
      if (sc)
        for (let i = 0; i < sc.length; i++)
          c += Math.pow(26, sc.length - i - 1) * (sc.charCodeAt(i) - 64);
      return [c ? c - 1 : undefined, sr ? +sr - 1 : undefined];
    }

    async function remote_fetch(file) {
      const response = await fetch(await file.url());
      if (!response.ok) throw new Error(`Unable to load file: ${file.name}`);
      return response;
    }

    async function dsv$1(file, delimiter, {array = false, typed = false} = {}) {
      const text = await file.text();
      return (delimiter === "\t"
          ? (array ? tsvParseRows : tsvParse)
          : (array ? csvParseRows : csvParse))(text, typed && autoType);
    }

    class AbstractFile {
      constructor(name) {
        Object.defineProperty(this, "name", {value: name, enumerable: true});
      }
      async blob() {
        return (await remote_fetch(this)).blob();
      }
      async arrayBuffer() {
        return (await remote_fetch(this)).arrayBuffer();
      }
      async text() {
        return (await remote_fetch(this)).text();
      }
      async json() {
        return (await remote_fetch(this)).json();
      }
      async stream() {
        return (await remote_fetch(this)).body;
      }
      async csv(options) {
        return dsv$1(this, ",", options);
      }
      async tsv(options) {
        return dsv$1(this, "\t", options);
      }
      async image(props) {
        const url = await this.url();
        return new Promise((resolve, reject) => {
          const i = new Image();
          if (new URL(url, document.baseURI).origin !== new URL(location).origin) {
            i.crossOrigin = "anonymous";
          }
          Object.assign(i, props);
          i.onload = () => resolve(i);
          i.onerror = () => reject(new Error(`Unable to load file: ${this.name}`));
          i.src = url;
        });
      }
      async arrow() {
        const [Arrow, response] = await Promise.all([require(arrow.resolve()), remote_fetch(this)]);
        return Arrow.Table.from(response);
      }
      async sqlite() {
        return SQLiteDatabaseClient.open(remote_fetch(this));
      }
      async zip() {
        const [JSZip, buffer] = await Promise.all([require(jszip.resolve()), this.arrayBuffer()]);
        return new ZipArchive(await JSZip.loadAsync(buffer));
      }
      async xml(mimeType = "application/xml") {
        return (new DOMParser).parseFromString(await this.text(), mimeType);
      }
      async html() {
        return this.xml("text/html");
      }
      async xlsx() {
        const [ExcelJS, buffer] = await Promise.all([require(exceljs.resolve()), this.arrayBuffer()]);
        return new Workbook(await new ExcelJS.Workbook().xlsx.load(buffer));
      }
    }

    class FileAttachment extends AbstractFile {
      constructor(url, name) {
        super(name);
        Object.defineProperty(this, "_url", {value: url});
      }
      async url() {
        return (await this._url) + "";
      }
    }

    function NoFileAttachments(name) {
      throw new Error(`File not found: ${name}`);
    }

    function FileAttachments(resolve) {
      return Object.assign(
        name => {
          const url = resolve(name += ""); // Returns a Promise, string, or null.
          if (url == null) throw new Error(`File not found: ${name}`);
          return new FileAttachment(url, name);
        },
        {prototype: FileAttachment.prototype} // instanceof
      );
    }

    class ZipArchive {
      constructor(archive) {
        Object.defineProperty(this, "_", {value: archive});
        this.filenames = Object.keys(archive.files).filter(name => !archive.files[name].dir);
      }
      file(path) {
        const object = this._.file(path += "");
        if (!object || object.dir) throw new Error(`file not found: ${path}`);
        return new ZipArchiveEntry(object);
      }
    }

    class ZipArchiveEntry extends AbstractFile {
      constructor(object) {
        super(object.name);
        Object.defineProperty(this, "_", {value: object});
        Object.defineProperty(this, "_url", {writable: true});
      }
      async url() {
        return this._url || (this._url = this.blob().then(URL.createObjectURL));
      }
      async blob() {
        return this._.async("blob");
      }
      async arrayBuffer() {
        return this._.async("arraybuffer");
      }
      async text() {
        return this._.async("text");
      }
      async json() {
        return JSON.parse(await this.text());
      }
    }

    function canvas(width, height) {
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    function context2d(width, height, dpi) {
      if (dpi == null) dpi = devicePixelRatio;
      var canvas = document.createElement("canvas");
      canvas.width = width * dpi;
      canvas.height = height * dpi;
      canvas.style.width = width + "px";
      var context = canvas.getContext("2d");
      context.scale(dpi, dpi);
      return context;
    }

    function download(value, name = "untitled", label = "Save") {
      const a = document.createElement("a");
      const b = a.appendChild(document.createElement("button"));
      b.textContent = label;
      a.download = name;

      async function reset() {
        await new Promise(requestAnimationFrame);
        URL.revokeObjectURL(a.href);
        a.removeAttribute("href");
        b.textContent = label;
        b.disabled = false;
      }

      a.onclick = async event => {
        b.disabled = true;
        if (a.href) return reset(); // Already saved.
        b.textContent = "Saving…";
        try {
          const object = await (typeof value === "function" ? value() : value);
          b.textContent = "Download";
          a.href = URL.createObjectURL(object); // eslint-disable-line require-atomic-updates
        } catch (ignore) {
          b.textContent = label;
        }
        if (event.eventPhase) return reset(); // Already downloaded.
        b.disabled = false;
      };

      return a;
    }

    var namespaces$1 = {
      math: "http://www.w3.org/1998/Math/MathML",
      svg: "http://www.w3.org/2000/svg",
      xhtml: "http://www.w3.org/1999/xhtml",
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function element$3(name, attributes) {
      var prefix = name += "", i = prefix.indexOf(":"), value;
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      var element = namespaces$1.hasOwnProperty(prefix) // eslint-disable-line no-prototype-builtins
          ? document.createElementNS(namespaces$1[prefix], name)
          : document.createElement(name);
      if (attributes) for (var key in attributes) {
        prefix = key, i = prefix.indexOf(":"), value = attributes[key];
        if (i >= 0 && (prefix = key.slice(0, i)) !== "xmlns") key = key.slice(i + 1);
        if (namespaces$1.hasOwnProperty(prefix)) element.setAttributeNS(namespaces$1[prefix], key, value); // eslint-disable-line no-prototype-builtins
        else element.setAttribute(key, value);
      }
      return element;
    }

    function input(type) {
      var input = document.createElement("input");
      if (type != null) input.type = type;
      return input;
    }

    function range(min, max, step) {
      if (arguments.length === 1) max = min, min = null;
      var input = document.createElement("input");
      input.min = min = min == null ? 0 : +min;
      input.max = max = max == null ? 1 : +max;
      input.step = step == null ? "any" : step = +step;
      input.type = "range";
      return input;
    }

    function select$2(values) {
      var select = document.createElement("select");
      Array.prototype.forEach.call(values, function(value) {
        var option = document.createElement("option");
        option.value = option.textContent = value;
        select.appendChild(option);
      });
      return select;
    }

    function svg(width, height) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", [0, 0, width, height]);
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      return svg;
    }

    function text$2(value) {
      return document.createTextNode(value);
    }

    var count = 0;

    function uid(name) {
      return new Id("O-" + (name == null ? "" : name + "-") + ++count);
    }

    function Id(id) {
      this.id = id;
      this.href = new URL(`#${id}`, location) + "";
    }

    Id.prototype.toString = function() {
      return "url(" + this.href + ")";
    };

    var DOM = {
      canvas: canvas,
      context2d: context2d,
      download: download,
      element: element$3,
      input: input,
      range: range,
      select: select$2,
      svg: svg,
      text: text$2,
      uid: uid
    };

    function buffer(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader;
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }

    function text$3(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader;
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    function url(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader;
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    var Files = {
      buffer: buffer,
      text: text$3,
      url: url
    };

    function that() {
      return this;
    }

    function disposable(value, dispose) {
      let done = false;
      if (typeof dispose !== "function") {
        throw new Error("dispose is not a function");
      }
      return {
        [Symbol.iterator]: that,
        next: () => done ? {done: true} : (done = true, {done: false, value}),
        return: () => (done = true, dispose(value), {done: true}),
        throw: () => ({done: done = true})
      };
    }

    function* filter(iterator, test) {
      var result, index = -1;
      while (!(result = iterator.next()).done) {
        if (test(result.value, ++index)) {
          yield result.value;
        }
      }
    }

    function observe(initialize) {
      let stale = false;
      let value;
      let resolve;
      const dispose = initialize(change);

      if (dispose != null && typeof dispose !== "function") {
        throw new Error(typeof dispose.then === "function"
            ? "async initializers are not supported"
            : "initializer returned something, but not a dispose function");
      }

      function change(x) {
        if (resolve) resolve(x), resolve = null;
        else stale = true;
        return value = x;
      }

      function next() {
        return {done: false, value: stale
            ? (stale = false, Promise.resolve(value))
            : new Promise(_ => (resolve = _))};
      }

      return {
        [Symbol.iterator]: that,
        throw: () => ({done: true}),
        return: () => (dispose != null && dispose(), {done: true}),
        next
      };
    }

    function input$1(input) {
      return observe(function(change) {
        var event = eventof(input), value = valueof(input);
        function inputted() { change(valueof(input)); }
        input.addEventListener(event, inputted);
        if (value !== undefined) change(value);
        return function() { input.removeEventListener(event, inputted); };
      });
    }

    function valueof(input) {
      switch (input.type) {
        case "range":
        case "number": return input.valueAsNumber;
        case "date": return input.valueAsDate;
        case "checkbox": return input.checked;
        case "file": return input.multiple ? input.files : input.files[0];
        case "select-multiple": return Array.from(input.selectedOptions, o => o.value);
        default: return input.value;
      }
    }

    function eventof(input) {
      switch (input.type) {
        case "button":
        case "submit":
        case "checkbox": return "click";
        case "file": return "change";
        default: return "input";
      }
    }

    function* map$2(iterator, transform) {
      var result, index = -1;
      while (!(result = iterator.next()).done) {
        yield transform(result.value, ++index);
      }
    }

    function queue$1(initialize) {
      let resolve;
      const queue = [];
      const dispose = initialize(push);

      if (dispose != null && typeof dispose !== "function") {
        throw new Error(typeof dispose.then === "function"
            ? "async initializers are not supported"
            : "initializer returned something, but not a dispose function");
      }

      function push(x) {
        queue.push(x);
        if (resolve) resolve(queue.shift()), resolve = null;
        return x;
      }

      function next() {
        return {done: false, value: queue.length
            ? Promise.resolve(queue.shift())
            : new Promise(_ => (resolve = _))};
      }

      return {
        [Symbol.iterator]: that,
        throw: () => ({done: true}),
        return: () => (dispose != null && dispose(), {done: true}),
        next
      };
    }

    function* range$1(start, stop, step) {
      start = +start;
      stop = +stop;
      step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
      var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
      while (++i < n) {
        yield start + i * step;
      }
    }

    function valueAt(iterator, i) {
      if (!isFinite(i = +i) || i < 0 || i !== i | 0) return;
      var result, index = -1;
      while (!(result = iterator.next()).done) {
        if (++index === i) {
          return result.value;
        }
      }
    }

    function worker(source) {
      const url = URL.createObjectURL(new Blob([source], {type: "text/javascript"}));
      const worker = new Worker(url);
      return disposable(worker, () => {
        worker.terminate();
        URL.revokeObjectURL(url);
      });
    }

    var Generators = {
      disposable: disposable,
      filter: filter,
      input: input$1,
      map: map$2,
      observe: observe,
      queue: queue$1,
      range: range$1,
      valueAt: valueAt,
      worker: worker
    };

    function template(render, wrapper) {
      return function(strings) {
        var string = strings[0],
            parts = [], part,
            root = null,
            node, nodes,
            walker,
            i, n, j, m, k = -1;

        // Concatenate the text using comments as placeholders.
        for (i = 1, n = arguments.length; i < n; ++i) {
          part = arguments[i];
          if (part instanceof Node) {
            parts[++k] = part;
            string += "<!--o:" + k + "-->";
          } else if (Array.isArray(part)) {
            for (j = 0, m = part.length; j < m; ++j) {
              node = part[j];
              if (node instanceof Node) {
                if (root === null) {
                  parts[++k] = root = document.createDocumentFragment();
                  string += "<!--o:" + k + "-->";
                }
                root.appendChild(node);
              } else {
                root = null;
                string += node;
              }
            }
            root = null;
          } else {
            string += part;
          }
          string += strings[i];
        }

        // Render the text.
        root = render(string);

        // Walk the rendered content to replace comment placeholders.
        if (++k > 0) {
          nodes = new Array(k);
          walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null, false);
          while (walker.nextNode()) {
            node = walker.currentNode;
            if (/^o:/.test(node.nodeValue)) {
              nodes[+node.nodeValue.slice(2)] = node;
            }
          }
          for (i = 0; i < k; ++i) {
            if (node = nodes[i]) {
              node.parentNode.replaceChild(parts[i], node);
            }
          }
        }

        // Is the rendered content
        // … a parent of a single child? Detach and return the child.
        // … a document fragment? Replace the fragment with an element.
        // … some other node? Return it.
        return root.childNodes.length === 1 ? root.removeChild(root.firstChild)
            : root.nodeType === 11 ? ((node = wrapper()).appendChild(root), node)
            : root;
      };
    }

    var html = template(function(string) {
      var template = document.createElement("template");
      template.innerHTML = string.trim();
      return document.importNode(template.content, true);
    }, function() {
      return document.createElement("span");
    });

    function md(require) {
      return require(marked.resolve()).then(function(marked) {
        return template(
          function(string) {
            var root = document.createElement("div");
            root.innerHTML = marked(string, {langPrefix: ""}).trim();
            var code = root.querySelectorAll("pre code[class]");
            if (code.length > 0) {
              require(highlight.resolve()).then(function(hl) {
                code.forEach(function(block) {
                  function done() {
                    hl.highlightBlock(block);
                    block.parentNode.classList.add("observablehq--md-pre");
                  }
                  if (hl.getLanguage(block.className)) {
                    done();
                  } else {
                    require(highlight.resolve("async-languages/index.js"))
                      .then(index => {
                        if (index.has(block.className)) {
                          return require(highlight.resolve("async-languages/" + index.get(block.className))).then(language => {
                            hl.registerLanguage(block.className, language);
                          });
                        }
                      })
                      .then(done, done);
                  }
                });
              });
            }
            return root;
          },
          function() {
            return document.createElement("div");
          }
        );
      });
    }

    function Mutable(value) {
      let change;
      Object.defineProperties(this, {
        generator: {value: observe(_ => void (change = _))},
        value: {get: () => value, set: x => change(value = x)} // eslint-disable-line no-setter-return
      });
      if (value !== undefined) change(value);
    }

    function* now$1() {
      while (true) {
        yield Date.now();
      }
    }

    function delay(duration, value) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve(value);
        }, duration);
      });
    }

    var timeouts = new Map;

    function timeout$2(now, time) {
      var t = new Promise(function(resolve) {
        timeouts.delete(time);
        var delay = time - now;
        if (!(delay > 0)) throw new Error("invalid time");
        if (delay > 0x7fffffff) throw new Error("too long to wait");
        setTimeout(resolve, delay);
      });
      timeouts.set(time, t);
      return t;
    }

    function when(time, value) {
      var now;
      return (now = timeouts.get(time = +time)) ? now.then(() => value)
          : (now = Date.now()) >= time ? Promise.resolve(value)
          : timeout$2(now, time).then(() => value);
    }

    function tick(duration, value) {
      return when(Math.ceil((Date.now() + 1) / duration) * duration, value);
    }

    var Promises = {
      delay: delay,
      tick: tick,
      when: when
    };

    function resolve$1(name, base) {
      if (/^(\w+:)|\/\//i.test(name)) return name;
      if (/^[.]{0,2}\//i.test(name)) return new URL(name, base == null ? location : base).href;
      if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name)) throw new Error("illegal name");
      return "https://unpkg.com/" + name;
    }

    function requirer(resolve) {
      return resolve == null ? require : requireFrom(resolve);
    }

    var svg$1 = template(function(string) {
      var root = document.createElementNS("http://www.w3.org/2000/svg", "g");
      root.innerHTML = string.trim();
      return root;
    }, function() {
      return document.createElementNS("http://www.w3.org/2000/svg", "g");
    });

    var raw = String.raw;

    function style(href) {
      return new Promise(function(resolve, reject) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onerror = reject;
        link.onload = resolve;
        document.head.appendChild(link);
      });
    }

    function tex(require) {
      return Promise.all([
        require(katex.resolve()),
        style(katex.resolve("dist/katex.min.css"))
      ]).then(function(values) {
        var katex = values[0], tex = renderer();

        function renderer(options) {
          return function() {
            var root = document.createElement("div");
            katex.render(raw.apply(String, arguments), root, options);
            return root.removeChild(root.firstChild);
          };
        }

        tex.options = renderer;
        tex.block = renderer({displayMode: true});
        return tex;
      });
    }

    async function vl(require) {
      const [v, vl, api] = await Promise.all([vega, vegalite, vegaliteApi].map(d => require(d.resolve())));
      return api.register(v, vl);
    }

    function width() {
      return observe(function(change) {
        var width = change(document.body.clientWidth);
        function resized() {
          var w = document.body.clientWidth;
          if (w !== width) change(width = w);
        }
        window.addEventListener("resize", resized);
        return function() {
          window.removeEventListener("resize", resized);
        };
      });
    }

    var Library = Object.assign(function Library(resolver) {
      const require = requirer(resolver);
      Object.defineProperties(this, properties({
        FileAttachment: () => NoFileAttachments,
        Arrow: () => require(arrow.resolve()),
        Inputs: () => require(inputs.resolve()).then(Inputs => ({...Inputs, file: Inputs.fileOf(AbstractFile)})),
        Mutable: () => Mutable,
        Plot: () => require(plot.resolve()),
        SQLite: () => sqlite(require),
        SQLiteDatabaseClient: () => SQLiteDatabaseClient,
        _: () => require(lodash.resolve()),
        aq: () => require.alias({"apache-arrow": arrow.resolve()})(arquero.resolve()),
        d3: () => require(d3.resolve()),
        dot: () => require(graphviz.resolve()),
        htl: () => require(htl.resolve()),
        html: () => html,
        md: () => md(require),
        now: now$1,
        require: () => require,
        resolve: () => resolve$1,
        svg: () => svg$1,
        tex: () => tex(require),
        topojson: () => require(topojson.resolve()),
        vl: () => vl(require),
        width,

        // Note: these are namespace objects, and thus exposed directly rather than
        // being wrapped in a function. This allows library.Generators to resolve,
        // rather than needing module.value.
        DOM,
        Files,
        Generators,
        Promises
      }));
    }, {resolve: require.resolve});

    function properties(values) {
      return Object.fromEntries(Object.entries(values).map(property));
    }

    function property([key, value]) {
      return [key, ({value, writable: true, enumerable: true})];
    }

    function RuntimeError(message, input) {
      this.message = message + "";
      this.input = input;
    }

    RuntimeError.prototype = Object.create(Error.prototype);
    RuntimeError.prototype.name = "RuntimeError";
    RuntimeError.prototype.constructor = RuntimeError;

    function generatorish(value) {
      return value
          && typeof value.next === "function"
          && typeof value.return === "function";
    }

    function load$1(notebook, library, observer) {
      if (typeof library == "function") observer = library, library = null;
      if (typeof observer !== "function") throw new Error("invalid observer");
      if (library == null) library = new Library();

      const {modules, id} = notebook;
      const map = new Map;
      const runtime = new Runtime(library);
      const main = runtime_module(id);

      function runtime_module(id) {
        let module = map.get(id);
        if (!module) map.set(id, module = runtime.module());
        return module;
      }

      for (const m of modules) {
        const module = runtime_module(m.id);
        let i = 0;
        for (const v of m.variables) {
          if (v.from) module.import(v.remote, v.name, runtime_module(v.from));
          else if (module === main) module.variable(observer(v, i, m.variables)).define(v.name, v.inputs, v.value);
          else module.define(v.name, v.inputs, v.value);
          ++i;
        }
      }

      return runtime;
    }

    var prototype = Array.prototype;
    var map$3 = prototype.map;
    var forEach = prototype.forEach;

    function constant$3(x) {
      return function() {
        return x;
      };
    }

    function identity$2(x) {
      return x;
    }

    function rethrow(e) {
      return function() {
        throw e;
      };
    }

    function noop$2() {}

    var TYPE_NORMAL = 1; // a normal variable
    var TYPE_IMPLICIT = 2; // created on reference
    var TYPE_DUPLICATE = 3; // created on duplicate definition

    var no_observer = {};

    function Variable(type, module, observer) {
      if (!observer) observer = no_observer;
      Object.defineProperties(this, {
        _observer: {value: observer, writable: true},
        _definition: {value: variable_undefined, writable: true},
        _duplicate: {value: undefined, writable: true},
        _duplicates: {value: undefined, writable: true},
        _indegree: {value: NaN, writable: true}, // The number of computing inputs.
        _inputs: {value: [], writable: true},
        _invalidate: {value: noop$2, writable: true},
        _module: {value: module},
        _name: {value: null, writable: true},
        _outputs: {value: new Set, writable: true},
        _promise: {value: Promise.resolve(undefined), writable: true},
        _reachable: {value: observer !== no_observer, writable: true}, // Is this variable transitively visible?
        _rejector: {value: variable_rejector(this)},
        _type: {value: type},
        _value: {value: undefined, writable: true},
        _version: {value: 0, writable: true}
      });
    }

    Object.defineProperties(Variable.prototype, {
      _pending: {value: variable_pending, writable: true, configurable: true},
      _fulfilled: {value: variable_fulfilled, writable: true, configurable: true},
      _rejected: {value: variable_rejected, writable: true, configurable: true},
      define: {value: variable_define, writable: true, configurable: true},
      delete: {value: variable_delete, writable: true, configurable: true},
      import: {value: variable_import, writable: true, configurable: true}
    });

    function variable_attach(variable) {
      variable._module._runtime._dirty.add(variable);
      variable._outputs.add(this);
    }

    function variable_detach(variable) {
      variable._module._runtime._dirty.add(variable);
      variable._outputs.delete(this);
    }

    function variable_undefined() {
      throw variable_undefined;
    }

    function variable_rejector(variable) {
      return function(error) {
        if (error === variable_undefined) throw new RuntimeError(variable._name + " is not defined", variable._name);
        if (error instanceof Error && error.message) throw new RuntimeError(error.message, variable._name);
        throw new RuntimeError(variable._name + " could not be resolved", variable._name);
      };
    }

    function variable_duplicate(name) {
      return function() {
        throw new RuntimeError(name + " is defined more than once");
      };
    }

    function variable_define(name, inputs, definition) {
      switch (arguments.length) {
        case 1: {
          definition = name, name = inputs = null;
          break;
        }
        case 2: {
          definition = inputs;
          if (typeof name === "string") inputs = null;
          else inputs = name, name = null;
          break;
        }
      }
      return variable_defineImpl.call(this,
        name == null ? null : name + "",
        inputs == null ? [] : map$3.call(inputs, this._module._resolve, this._module),
        typeof definition === "function" ? definition : constant$3(definition)
      );
    }

    function variable_defineImpl(name, inputs, definition) {
      var scope = this._module._scope, runtime = this._module._runtime;

      this._inputs.forEach(variable_detach, this);
      inputs.forEach(variable_attach, this);
      this._inputs = inputs;
      this._definition = definition;
      this._value = undefined;

      // Is this an active variable (that may require disposal)?
      if (definition === noop$2) runtime._variables.delete(this);
      else runtime._variables.add(this);

      // Did the variable’s name change? Time to patch references!
      if (name !== this._name || scope.get(name) !== this) {
        var error, found;

        if (this._name) { // Did this variable previously have a name?
          if (this._outputs.size) { // And did other variables reference this variable?
            scope.delete(this._name);
            found = this._module._resolve(this._name);
            found._outputs = this._outputs, this._outputs = new Set;
            found._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(this)] = found; }, this);
            found._outputs.forEach(runtime._updates.add, runtime._updates);
            runtime._dirty.add(found).add(this);
            scope.set(this._name, found);
          } else if ((found = scope.get(this._name)) === this) { // Do no other variables reference this variable?
            scope.delete(this._name); // It’s safe to delete!
          } else if (found._type === TYPE_DUPLICATE) { // Do other variables assign this name?
            found._duplicates.delete(this); // This variable no longer assigns this name.
            this._duplicate = undefined;
            if (found._duplicates.size === 1) { // Is there now only one variable assigning this name?
              found = found._duplicates.keys().next().value; // Any references are now fixed!
              error = scope.get(this._name);
              found._outputs = error._outputs, error._outputs = new Set;
              found._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(error)] = found; });
              found._definition = found._duplicate, found._duplicate = undefined;
              runtime._dirty.add(error).add(found);
              runtime._updates.add(found);
              scope.set(this._name, found);
            }
          } else {
            throw new Error;
          }
        }

        if (this._outputs.size) throw new Error;

        if (name) { // Does this variable have a new name?
          if (found = scope.get(name)) { // Do other variables reference or assign this name?
            if (found._type === TYPE_DUPLICATE) { // Do multiple other variables already define this name?
              this._definition = variable_duplicate(name), this._duplicate = definition;
              found._duplicates.add(this);
            } else if (found._type === TYPE_IMPLICIT) { // Are the variable references broken?
              this._outputs = found._outputs, found._outputs = new Set; // Now they’re fixed!
              this._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(found)] = this; }, this);
              runtime._dirty.add(found).add(this);
              scope.set(name, this);
            } else { // Does another variable define this name?
              found._duplicate = found._definition, this._duplicate = definition; // Now they’re duplicates.
              error = new Variable(TYPE_DUPLICATE, this._module);
              error._name = name;
              error._definition = this._definition = found._definition = variable_duplicate(name);
              error._outputs = found._outputs, found._outputs = new Set;
              error._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(found)] = error; });
              error._duplicates = new Set([this, found]);
              runtime._dirty.add(found).add(error);
              runtime._updates.add(found).add(error);
              scope.set(name, error);
            }
          } else {
            scope.set(name, this);
          }
        }

        this._name = name;
      }

      runtime._updates.add(this);
      runtime._compute();
      return this;
    }

    function variable_import(remote, name, module) {
      if (arguments.length < 3) module = name, name = remote;
      return variable_defineImpl.call(this, name + "", [module._resolve(remote + "")], identity$2);
    }

    function variable_delete() {
      return variable_defineImpl.call(this, null, [], noop$2);
    }

    function variable_pending() {
      if (this._observer.pending) this._observer.pending();
    }

    function variable_fulfilled(value) {
      if (this._observer.fulfilled) this._observer.fulfilled(value, this._name);
    }

    function variable_rejected(error) {
      if (this._observer.rejected) this._observer.rejected(error, this._name);
    }

    function Module(runtime, builtins = []) {
      Object.defineProperties(this, {
        _runtime: {value: runtime},
        _scope: {value: new Map},
        _builtins: {value: new Map([
          ["invalidation", variable_invalidation],
          ["visibility", variable_visibility],
          ...builtins
        ])},
        _source: {value: null, writable: true}
      });
    }

    Object.defineProperties(Module.prototype, {
      _copy: {value: module_copy, writable: true, configurable: true},
      _resolve: {value: module_resolve, writable: true, configurable: true},
      redefine: {value: module_redefine, writable: true, configurable: true},
      define: {value: module_define, writable: true, configurable: true},
      derive: {value: module_derive, writable: true, configurable: true},
      import: {value: module_import, writable: true, configurable: true},
      value: {value: module_value, writable: true, configurable: true},
      variable: {value: module_variable, writable: true, configurable: true},
      builtin: {value: module_builtin, writable: true, configurable: true}
    });

    function module_redefine(name) {
      var v = this._scope.get(name);
      if (!v) throw new RuntimeError(name + " is not defined");
      if (v._type === TYPE_DUPLICATE) throw new RuntimeError(name + " is defined more than once");
      return v.define.apply(v, arguments);
    }

    function module_define() {
      var v = new Variable(TYPE_NORMAL, this);
      return v.define.apply(v, arguments);
    }

    function module_import() {
      var v = new Variable(TYPE_NORMAL, this);
      return v.import.apply(v, arguments);
    }

    function module_variable(observer) {
      return new Variable(TYPE_NORMAL, this, observer);
    }

    async function module_value(name) {
      var v = this._scope.get(name);
      if (!v) throw new RuntimeError(name + " is not defined");
      if (v._observer === no_observer) {
        v._observer = true;
        this._runtime._dirty.add(v);
      }
      await this._runtime._compute();
      return v._promise;
    }

    function module_derive(injects, injectModule) {
      var copy = new Module(this._runtime, this._builtins);
      copy._source = this;
      forEach.call(injects, function(inject) {
        if (typeof inject !== "object") inject = {name: inject + ""};
        if (inject.alias == null) inject.alias = inject.name;
        copy.import(inject.name, inject.alias, injectModule);
      });
      Promise.resolve().then(() => {
        const modules = new Set([this]);
        for (const module of modules) {
          for (const variable of module._scope.values()) {
            if (variable._definition === identity$2) { // import
              const module = variable._inputs[0]._module;
              const source = module._source || module;
              if (source === this) { // circular import-with!
                console.warn("circular module definition; ignoring"); // eslint-disable-line no-console
                return;
              }
              modules.add(source);
            }
          }
        }
        this._copy(copy, new Map);
      });
      return copy;
    }

    function module_copy(copy, map) {
      copy._source = this;
      map.set(this, copy);
      for (const [name, source] of this._scope) {
        var target = copy._scope.get(name);
        if (target && target._type === TYPE_NORMAL) continue; // injection
        if (source._definition === identity$2) { // import
          var sourceInput = source._inputs[0],
              sourceModule = sourceInput._module;
          copy.import(sourceInput._name, name, map.get(sourceModule)
            || (sourceModule._source
               ? sourceModule._copy(new Module(copy._runtime, copy._builtins), map) // import-with
               : sourceModule));
        } else {
          copy.define(name, source._inputs.map(variable_name), source._definition);
        }
      }
      return copy;
    }

    function module_resolve(name) {
      var variable = this._scope.get(name), value;
      if (!variable) {
        variable = new Variable(TYPE_IMPLICIT, this);
        if (this._builtins.has(name)) {
          variable.define(name, constant$3(this._builtins.get(name)));
        } else if (this._runtime._builtin._scope.has(name)) {
          variable.import(name, this._runtime._builtin);
        } else {
          try {
            value = this._runtime._global(name);
          } catch (error) {
            return variable.define(name, rethrow(error));
          }
          if (value === undefined) {
            this._scope.set(variable._name = name, variable);
          } else {
            variable.define(name, constant$3(value));
          }
        }
      }
      return variable;
    }

    function module_builtin(name, value) {
      this._builtins.set(name, value);
    }

    function variable_name(variable) {
      return variable._name;
    }

    const frame$1 = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setImmediate;

    var variable_invalidation = {};
    var variable_visibility = {};

    function Runtime(builtins = new Library, global = window_global) {
      var builtin = this.module();
      Object.defineProperties(this, {
        _dirty: {value: new Set},
        _updates: {value: new Set},
        _precomputes: {value: [], writable: true},
        _computing: {value: null, writable: true},
        _init: {value: null, writable: true},
        _modules: {value: new Map},
        _variables: {value: new Set},
        _disposed: {value: false, writable: true},
        _builtin: {value: builtin},
        _global: {value: global}
      });
      if (builtins) for (var name in builtins) {
        (new Variable(TYPE_IMPLICIT, builtin)).define(name, [], builtins[name]);
      }
    }

    Object.defineProperties(Runtime, {
      load: {value: load$1, writable: true, configurable: true}
    });

    Object.defineProperties(Runtime.prototype, {
      _precompute: {value: runtime_precompute, writable: true, configurable: true},
      _compute: {value: runtime_compute, writable: true, configurable: true},
      _computeSoon: {value: runtime_computeSoon, writable: true, configurable: true},
      _computeNow: {value: runtime_computeNow, writable: true, configurable: true},
      dispose: {value: runtime_dispose, writable: true, configurable: true},
      module: {value: runtime_module, writable: true, configurable: true},
      fileAttachments: {value: FileAttachments, writable: true, configurable: true}
    });

    function runtime_dispose() {
      this._computing = Promise.resolve();
      this._disposed = true;
      this._variables.forEach(v => {
        v._invalidate();
        v._version = NaN;
      });
    }

    function runtime_module(define, observer = noop$2) {
      let module;
      if (define === undefined) {
        if (module = this._init) {
          this._init = null;
          return module;
        }
        return new Module(this);
      }
      module = this._modules.get(define);
      if (module) return module;
      this._init = module = new Module(this);
      this._modules.set(define, module);
      try {
        define(this, observer);
      } finally {
        this._init = null;
      }
      return module;
    }

    function runtime_precompute(callback) {
      this._precomputes.push(callback);
      this._compute();
    }

    function runtime_compute() {
      return this._computing || (this._computing = this._computeSoon());
    }

    function runtime_computeSoon() {
      return new Promise(frame$1).then(() => this._disposed ? undefined : this._computeNow());
    }

    async function runtime_computeNow() {
      var queue = [],
          variables,
          variable,
          precomputes = this._precomputes;

      // If there are any paused generators, resume them before computing so they
      // can update (if synchronous) before computing downstream variables.
      if (precomputes.length) {
        this._precomputes = [];
        for (const callback of precomputes) callback();
        await runtime_defer(3);
      }

      // Compute the reachability of the transitive closure of dirty variables.
      // Any newly-reachable variable must also be recomputed.
      // Any no-longer-reachable variable must be terminated.
      variables = new Set(this._dirty);
      variables.forEach(function(variable) {
        variable._inputs.forEach(variables.add, variables);
        const reachable = variable_reachable(variable);
        if (reachable > variable._reachable) {
          this._updates.add(variable);
        } else if (reachable < variable._reachable) {
          variable._invalidate();
        }
        variable._reachable = reachable;
      }, this);

      // Compute the transitive closure of updating, reachable variables.
      variables = new Set(this._updates);
      variables.forEach(function(variable) {
        if (variable._reachable) {
          variable._indegree = 0;
          variable._outputs.forEach(variables.add, variables);
        } else {
          variable._indegree = NaN;
          variables.delete(variable);
        }
      });

      this._computing = null;
      this._updates.clear();
      this._dirty.clear();

      // Compute the indegree of updating variables.
      variables.forEach(function(variable) {
        variable._outputs.forEach(variable_increment);
      });

      do {
        // Identify the root variables (those with no updating inputs).
        variables.forEach(function(variable) {
          if (variable._indegree === 0) {
            queue.push(variable);
          }
        });

        // Compute the variables in topological order.
        while (variable = queue.pop()) {
          variable_compute(variable);
          variable._outputs.forEach(postqueue);
          variables.delete(variable);
        }

        // Any remaining variables are circular, or depend on them.
        variables.forEach(function(variable) {
          if (variable_circular(variable)) {
            variable_error(variable, new RuntimeError("circular definition"));
            variable._outputs.forEach(variable_decrement);
            variables.delete(variable);
          }
        });
      } while (variables.size);

      function postqueue(variable) {
        if (--variable._indegree === 0) {
          queue.push(variable);
        }
      }
    }

    // We want to give generators, if they’re defined synchronously, a chance to
    // update before computing downstream variables. This creates a synchronous
    // promise chain of the given depth that we’ll await before recomputing
    // downstream variables.
    function runtime_defer(depth = 0) {
      let p = Promise.resolve();
      for (let i = 0; i < depth; ++i) p = p.then(() => {});
      return p;
    }

    function variable_circular(variable) {
      const inputs = new Set(variable._inputs);
      for (const i of inputs) {
        if (i === variable) return true;
        i._inputs.forEach(inputs.add, inputs);
      }
      return false;
    }

    function variable_increment(variable) {
      ++variable._indegree;
    }

    function variable_decrement(variable) {
      --variable._indegree;
    }

    function variable_value(variable) {
      return variable._promise.catch(variable._rejector);
    }

    function variable_invalidator(variable) {
      return new Promise(function(resolve) {
        variable._invalidate = resolve;
      });
    }

    function variable_intersector(invalidation, variable) {
      let node = typeof IntersectionObserver === "function" && variable._observer && variable._observer._node;
      let visible = !node, resolve = noop$2, reject = noop$2, promise, observer;
      if (node) {
        observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting) && (promise = null, resolve()));
        observer.observe(node);
        invalidation.then(() => (observer.disconnect(), observer = null, reject()));
      }
      return function(value) {
        if (visible) return Promise.resolve(value);
        if (!observer) return Promise.reject();
        if (!promise) promise = new Promise((y, n) => (resolve = y, reject = n));
        return promise.then(() => value);
      };
    }

    function variable_compute(variable) {
      variable._invalidate();
      variable._invalidate = noop$2;
      variable._pending();

      const value0 = variable._value;
      const version = ++variable._version;

      // Lazily-constructed invalidation variable; only constructed if referenced as an input.
      let invalidation = null;

      // If the variable doesn’t have any inputs, we can optimize slightly.
      const promise = variable._promise = (variable._inputs.length
          ? Promise.all(variable._inputs.map(variable_value)).then(define)
          : new Promise(resolve => resolve(variable._definition.call(value0))))
        .then(generate);

      // Compute the initial value of the variable.
      function define(inputs) {
        if (variable._version !== version) return;

        // Replace any reference to invalidation with the promise, lazily.
        for (var i = 0, n = inputs.length; i < n; ++i) {
          switch (inputs[i]) {
            case variable_invalidation: {
              inputs[i] = invalidation = variable_invalidator(variable);
              break;
            }
            case variable_visibility: {
              if (!invalidation) invalidation = variable_invalidator(variable);
              inputs[i] = variable_intersector(invalidation, variable);
              break;
            }
          }
        }

        return variable._definition.apply(value0, inputs);
      }

      // If the value is a generator, then retrieve its first value, and dispose of
      // the generator if the variable is invalidated. Note that the cell may
      // already have been invalidated here, in which case we need to terminate the
      // generator immediately!
      function generate(value) {
        if (generatorish(value)) {
          if (variable._version !== version) return void value.return();
          (invalidation || variable_invalidator(variable)).then(variable_return(value));
          return variable_generate(variable, version, value);
        }
        return value;
      }

      promise.then((value) => {
        if (variable._version !== version) return;
        variable._value = value;
        variable._fulfilled(value);
      }, (error) => {
        if (variable._version !== version) return;
        variable._value = undefined;
        variable._rejected(error);
      });
    }

    function variable_generate(variable, version, generator) {
      const runtime = variable._module._runtime;

      // Retrieve the next value from the generator; if successful, invoke the
      // specified callback. The returned promise resolves to the yielded value, or
      // to undefined if the generator is done.
      function compute(onfulfilled) {
        return new Promise(resolve => resolve(generator.next())).then(({done, value}) => {
          return done ? undefined : Promise.resolve(value).then(onfulfilled);
        });
      }

      // Retrieve the next value from the generator; if successful, fulfill the
      // variable, compute downstream variables, and schedule the next value to be
      // pulled from the generator at the start of the next animation frame. If not
      // successful, reject the variable, compute downstream variables, and return.
      function recompute() {
        const promise = compute((value) => {
          if (variable._version !== version) return;
          postcompute(value, promise).then(() => runtime._precompute(recompute));
          variable._fulfilled(value);
          return value;
        });
        promise.catch((error) => {
          if (variable._version !== version) return;
          postcompute(undefined, promise);
          variable._rejected(error);
        });
      }

      // After the generator fulfills or rejects, set its current value, promise,
      // and schedule any downstream variables for update.
      function postcompute(value, promise) {
        variable._value = value;
        variable._promise = promise;
        variable._outputs.forEach(runtime._updates.add, runtime._updates);
        return runtime._compute();
      }

      // When retrieving the first value from the generator, the promise graph is
      // already established, so we only need to queue the next pull.
      return compute((value) => {
        if (variable._version !== version) return;
        runtime._precompute(recompute);
        return value;
      });
    }

    function variable_error(variable, error) {
      variable._invalidate();
      variable._invalidate = noop$2;
      variable._pending();
      ++variable._version;
      variable._indegree = NaN;
      (variable._promise = Promise.reject(error)).catch(noop$2);
      variable._value = undefined;
      variable._rejected(error);
    }

    function variable_return(generator) {
      return function() {
        generator.return();
      };
    }

    function variable_reachable(variable) {
      if (variable._observer !== no_observer) return true; // Directly reachable.
      var outputs = new Set(variable._outputs);
      for (const output of outputs) {
        if (output._observer !== no_observer) return true;
        output._outputs.forEach(outputs.add, outputs);
      }
      return false;
    }

    function window_global(name) {
      return window[name];
    }

    /* node_modules/anymapper/src/Depiction.svelte generated by Svelte v3.47.0 */

    function create_fragment$k(ctx) {
    	let media;
    	let current;

    	media = new Media({
    			props: {
    				style: "background: url(" + /*src*/ ctx[0] + "), " + (/*fallback*/ ctx[5] !== null
    				? /*fallback*/ ctx[5] + ','
    				: '') + " linear-gradient(180deg, rgba(245,245,245,0) 0%, rgba(245,245,245,1) 100%); background-size: " + /*size*/ ctx[1] + "; background-position-x: " + /*positionX*/ ctx[3] + "; background-position-y: " + /*positionY*/ ctx[4] + "; background-repeat: no-repeat;",
    				aspectRatio: /*aspectRatio*/ ctx[2]
    			}
    		});

    	return {
    		c() {
    			create_component(media.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(media, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const media_changes = {};

    			if (dirty & /*src, fallback, size, positionX, positionY*/ 59) media_changes.style = "background: url(" + /*src*/ ctx[0] + "), " + (/*fallback*/ ctx[5] !== null
    			? /*fallback*/ ctx[5] + ','
    			: '') + " linear-gradient(180deg, rgba(245,245,245,0) 0%, rgba(245,245,245,1) 100%); background-size: " + /*size*/ ctx[1] + "; background-position-x: " + /*positionX*/ ctx[3] + "; background-position-y: " + /*positionY*/ ctx[4] + "; background-repeat: no-repeat;";

    			if (dirty & /*aspectRatio*/ 4) media_changes.aspectRatio = /*aspectRatio*/ ctx[2];
    			media.$set(media_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(media.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(media.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(media, detaching);
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { src = null } = $$props;
    	let { size = 'cover' } = $$props;
    	let { aspectRatio = "16x9" } = $$props;
    	let { positionX = 'center' } = $$props;
    	let { positionY = 'center' } = $$props;
    	let { fallback = null } = $$props;

    	$$self.$$set = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('aspectRatio' in $$props) $$invalidate(2, aspectRatio = $$props.aspectRatio);
    		if ('positionX' in $$props) $$invalidate(3, positionX = $$props.positionX);
    		if ('positionY' in $$props) $$invalidate(4, positionY = $$props.positionY);
    		if ('fallback' in $$props) $$invalidate(5, fallback = $$props.fallback);
    	};

    	return [src, size, aspectRatio, positionX, positionY, fallback];
    }

    class Depiction extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			src: 0,
    			size: 1,
    			aspectRatio: 2,
    			positionX: 3,
    			positionY: 4,
    			fallback: 5
    		});
    	}
    }

    /* node_modules/anymapper/src/graphics/Marker.svelte generated by Svelte v3.47.0 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (36:4) {#if shadow}
    function create_if_block_5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*shape*/ ctx[6] == 'circle') return create_if_block_6;
    		if (/*shape*/ ctx[6] == 'square') return create_if_block_7;
    		if (/*shape*/ ctx[6] == 'pin') return create_if_block_8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (41:33) 
    function create_if_block_8(ctx) {
    	let path;
    	let path_transform_value;

    	return {
    		c() {
    			path = svg_element("path");
    			attr(path, "opacity", "0.35");
    			attr(path, "stroke", "black");
    			attr(path, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			attr(path, "transform", path_transform_value = "translate(0," + /*shadow_offset*/ ctx[12] + ")");
    			attr(path, "d", PIN_D);
    		},
    		m(target, anchor) {
    			insert(target, path, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*actual_outline_width*/ 16384) {
    				attr(path, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			}

    			if (dirty & /*shadow_offset*/ 4096 && path_transform_value !== (path_transform_value = "translate(0," + /*shadow_offset*/ ctx[12] + ")")) {
    				attr(path, "transform", path_transform_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(path);
    		}
    	};
    }

    // (39:36) 
    function create_if_block_7(ctx) {
    	let rect;
    	let rect_x_value;
    	let rect_y_value;

    	return {
    		c() {
    			rect = svg_element("rect");
    			attr(rect, "width", /*width*/ ctx[13]);
    			attr(rect, "height", "28");
    			attr(rect, "x", rect_x_value = -/*width*/ ctx[13] / 2);
    			attr(rect, "y", rect_y_value = -14 + /*shadow_offset*/ ctx[12]);
    			attr(rect, "rx", "4");
    			attr(rect, "ry", "4");
    			attr(rect, "opacity", "0.35");
    			attr(rect, "stroke", "black");
    			attr(rect, "stroke-width", /*actual_outline_width*/ ctx[14]);
    		},
    		m(target, anchor) {
    			insert(target, rect, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*width*/ 8192) {
    				attr(rect, "width", /*width*/ ctx[13]);
    			}

    			if (dirty & /*width*/ 8192 && rect_x_value !== (rect_x_value = -/*width*/ ctx[13] / 2)) {
    				attr(rect, "x", rect_x_value);
    			}

    			if (dirty & /*shadow_offset*/ 4096 && rect_y_value !== (rect_y_value = -14 + /*shadow_offset*/ ctx[12])) {
    				attr(rect, "y", rect_y_value);
    			}

    			if (dirty & /*actual_outline_width*/ 16384) {
    				attr(rect, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(rect);
    		}
    	};
    }

    // (37:8) {#if shape == 'circle'}
    function create_if_block_6(ctx) {
    	let circle;

    	return {
    		c() {
    			circle = svg_element("circle");
    			attr(circle, "r", "14");
    			attr(circle, "cy", /*shadow_offset*/ ctx[12]);
    			attr(circle, "opacity", "0.35");
    			attr(circle, "stroke", "black");
    			attr(circle, "stroke-width", /*actual_outline_width*/ ctx[14]);
    		},
    		m(target, anchor) {
    			insert(target, circle, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*shadow_offset*/ 4096) {
    				attr(circle, "cy", /*shadow_offset*/ ctx[12]);
    			}

    			if (dirty & /*actual_outline_width*/ 16384) {
    				attr(circle, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(circle);
    		}
    	};
    }

    // (52:29) 
    function create_if_block_4(ctx) {
    	let path0;
    	let path1;

    	return {
    		c() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "fill", /*bg_color*/ ctx[1]);
    			attr(path0, "d", PIN_D);
    			attr(path1, "fill", "transparent");
    			attr(path1, "stroke", /*outline_color*/ ctx[2]);
    			attr(path1, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			set_style(path1, "filter", "brightness(" + /*outline_brightness*/ ctx[3] + ")");
    			attr(path1, "d", PIN_D);
    		},
    		m(target, anchor) {
    			insert(target, path0, anchor);
    			insert(target, path1, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*bg_color*/ 2) {
    				attr(path0, "fill", /*bg_color*/ ctx[1]);
    			}

    			if (dirty & /*outline_color*/ 4) {
    				attr(path1, "stroke", /*outline_color*/ ctx[2]);
    			}

    			if (dirty & /*actual_outline_width*/ 16384) {
    				attr(path1, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			}

    			if (dirty & /*outline_brightness*/ 8) {
    				set_style(path1, "filter", "brightness(" + /*outline_brightness*/ ctx[3] + ")");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(path0);
    			if (detaching) detach(path1);
    		}
    	};
    }

    // (49:32) 
    function create_if_block_3(ctx) {
    	let rect0;
    	let rect0_x_value;
    	let rect1;
    	let rect1_x_value;

    	return {
    		c() {
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			attr(rect0, "width", /*width*/ ctx[13]);
    			attr(rect0, "height", "28");
    			attr(rect0, "x", rect0_x_value = -/*width*/ ctx[13] / 2);
    			attr(rect0, "y", "-14");
    			attr(rect0, "rx", "4");
    			attr(rect0, "ry", "4");
    			attr(rect0, "fill", /*bg_color*/ ctx[1]);
    			attr(rect1, "width", /*width*/ ctx[13]);
    			attr(rect1, "height", "28");
    			attr(rect1, "x", rect1_x_value = -/*width*/ ctx[13] / 2);
    			attr(rect1, "y", "-14");
    			attr(rect1, "rx", "4");
    			attr(rect1, "ry", "4");
    			attr(rect1, "fill", "transparent");
    			attr(rect1, "stroke", /*outline_color*/ ctx[2]);
    			attr(rect1, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			set_style(rect1, "filter", "brightness(" + /*outline_brightness*/ ctx[3] + ")");
    		},
    		m(target, anchor) {
    			insert(target, rect0, anchor);
    			insert(target, rect1, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*width*/ 8192) {
    				attr(rect0, "width", /*width*/ ctx[13]);
    			}

    			if (dirty & /*width*/ 8192 && rect0_x_value !== (rect0_x_value = -/*width*/ ctx[13] / 2)) {
    				attr(rect0, "x", rect0_x_value);
    			}

    			if (dirty & /*bg_color*/ 2) {
    				attr(rect0, "fill", /*bg_color*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 8192) {
    				attr(rect1, "width", /*width*/ ctx[13]);
    			}

    			if (dirty & /*width*/ 8192 && rect1_x_value !== (rect1_x_value = -/*width*/ ctx[13] / 2)) {
    				attr(rect1, "x", rect1_x_value);
    			}

    			if (dirty & /*outline_color*/ 4) {
    				attr(rect1, "stroke", /*outline_color*/ ctx[2]);
    			}

    			if (dirty & /*actual_outline_width*/ 16384) {
    				attr(rect1, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			}

    			if (dirty & /*outline_brightness*/ 8) {
    				set_style(rect1, "filter", "brightness(" + /*outline_brightness*/ ctx[3] + ")");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(rect0);
    			if (detaching) detach(rect1);
    		}
    	};
    }

    // (46:4) {#if shape == 'circle'}
    function create_if_block_2(ctx) {
    	let circle0;
    	let circle1;

    	return {
    		c() {
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			attr(circle0, "r", "14");
    			attr(circle0, "fill", /*bg_color*/ ctx[1]);
    			attr(circle1, "r", "14");
    			attr(circle1, "fill", "transparent");
    			attr(circle1, "stroke", /*outline_color*/ ctx[2]);
    			attr(circle1, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			set_style(circle1, "filter", "brightness(" + /*outline_brightness*/ ctx[3] + ")");
    		},
    		m(target, anchor) {
    			insert(target, circle0, anchor);
    			insert(target, circle1, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*bg_color*/ 2) {
    				attr(circle0, "fill", /*bg_color*/ ctx[1]);
    			}

    			if (dirty & /*outline_color*/ 4) {
    				attr(circle1, "stroke", /*outline_color*/ ctx[2]);
    			}

    			if (dirty & /*actual_outline_width*/ 16384) {
    				attr(circle1, "stroke-width", /*actual_outline_width*/ ctx[14]);
    			}

    			if (dirty & /*outline_brightness*/ 8) {
    				set_style(circle1, "filter", "brightness(" + /*outline_brightness*/ ctx[3] + ")");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(circle0);
    			if (detaching) detach(circle1);
    		}
    	};
    }

    // (59:19) 
    function create_if_block_1$2(ctx) {
    	let text_1;
    	let text_1_class_value;
    	let text_1_dx_value;
    	let text_1_y_value;
    	let each_value = /*icons*/ ctx[11];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c() {
    			text_1 = svg_element("text");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(text_1, "class", text_1_class_value = "material-icons" + (/*icon_set*/ ctx[4] ? '-' + /*icon_set*/ ctx[4] : '') + " svelte-tanwa7");
    			attr(text_1, "fill", /*fg_color*/ ctx[0]);
    			attr(text_1, "transform", "scale(0.8)");
    			attr(text_1, "text-anchor", "middle");
    			attr(text_1, "dy", ".5em");
    			attr(text_1, "dx", text_1_dx_value = "" + (/*actual_icon_spacing*/ ctx[10] / 2 + "px"));
    			attr(text_1, "y", text_1_y_value = /*shape*/ ctx[6] == 'pin' ? -47 : 0);
    			set_style(text_1, "letter-spacing", /*actual_icon_spacing*/ ctx[10] + "px");
    		},
    		m(target, anchor) {
    			insert(target, text_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(text_1, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icons*/ 2048) {
    				each_value = /*icons*/ ctx[11];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(text_1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*icon_set*/ 16 && text_1_class_value !== (text_1_class_value = "material-icons" + (/*icon_set*/ ctx[4] ? '-' + /*icon_set*/ ctx[4] : '') + " svelte-tanwa7")) {
    				attr(text_1, "class", text_1_class_value);
    			}

    			if (dirty & /*fg_color*/ 1) {
    				attr(text_1, "fill", /*fg_color*/ ctx[0]);
    			}

    			if (dirty & /*actual_icon_spacing*/ 1024 && text_1_dx_value !== (text_1_dx_value = "" + (/*actual_icon_spacing*/ ctx[10] / 2 + "px"))) {
    				attr(text_1, "dx", text_1_dx_value);
    			}

    			if (dirty & /*shape*/ 64 && text_1_y_value !== (text_1_y_value = /*shape*/ ctx[6] == 'pin' ? -47 : 0)) {
    				attr(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*actual_icon_spacing*/ 1024) {
    				set_style(text_1, "letter-spacing", /*actual_icon_spacing*/ ctx[10] + "px");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(text_1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (57:4) {#if text}
    function create_if_block$6(ctx) {
    	let text_1;
    	let t;
    	let text_1_y_value;

    	return {
    		c() {
    			text_1 = svg_element("text");
    			t = text(/*text*/ ctx[5]);
    			attr(text_1, "class", "label svelte-tanwa7");
    			attr(text_1, "fill", /*fg_color*/ ctx[0]);
    			attr(text_1, "text-anchor", "middle");
    			attr(text_1, "dy", ".35em");
    			attr(text_1, "y", text_1_y_value = /*shape*/ ctx[6] == 'pin' ? -36 : 0);
    		},
    		m(target, anchor) {
    			insert(target, text_1, anchor);
    			append(text_1, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*text*/ 32) set_data(t, /*text*/ ctx[5]);

    			if (dirty & /*fg_color*/ 1) {
    				attr(text_1, "fill", /*fg_color*/ ctx[0]);
    			}

    			if (dirty & /*shape*/ 64 && text_1_y_value !== (text_1_y_value = /*shape*/ ctx[6] == 'pin' ? -36 : 0)) {
    				attr(text_1, "y", text_1_y_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(text_1);
    		}
    	};
    }

    // (61:12) {#each icons as icon}
    function create_each_block$2(ctx) {
    	let tspan;
    	let t_value = /*icon*/ ctx[9] + "";
    	let t;

    	return {
    		c() {
    			tspan = svg_element("tspan");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, tspan, anchor);
    			append(tspan, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icons*/ 2048 && t_value !== (t_value = /*icon*/ ctx[9] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(tspan);
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	let g;
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let g_transform_value;
    	let if_block0 = /*shadow*/ ctx[7] && create_if_block_5(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*shape*/ ctx[6] == 'circle') return create_if_block_2;
    		if (/*shape*/ ctx[6] == 'square') return create_if_block_3;
    		if (/*shape*/ ctx[6] == 'pin') return create_if_block_4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*text*/ ctx[5]) return create_if_block$6;
    		if (/*icon*/ ctx[9]) return create_if_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);

    	return {
    		c() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			attr(g, "class", "mark");
    			attr(g, "transform", g_transform_value = "scale(" + /*scale*/ ctx[8] + ")");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append(g, if_block1_anchor);
    			if (if_block2) if_block2.m(g, null);
    		},
    		p(ctx, [dirty]) {
    			if (/*shadow*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(g, if_block1_anchor);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(g, null);
    				}
    			}

    			if (dirty & /*scale*/ 256 && g_transform_value !== (g_transform_value = "scale(" + /*scale*/ ctx[8] + ")")) {
    				attr(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(g);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) {
    				if_block2.d();
    			}
    		}
    	};
    }

    const PIN_D = 'M -0.64019711,-0.2956675 C -1.2209976,-0.8293218 -5.9552623,-9.1635097 -9.1320615,-15.244729 -14.703276,-25.90949 -17.594023,-33.501024 -17.590039,-37.456633 c 0.0069,-6.462469 3.71629,-12.576105 9.4258042,-15.533539 2.7082627,-1.402842 5.0884766,-1.988303 8.11060396,-1.994976 3.09596704,-0.0072 5.46376434,0.567925 8.21767004,1.99472 5.7102168,2.958489 9.4194808,9.071246 9.4259928,15.533795 0.0034,3.94629 -2.904594,11.591053 -8.4440082,22.193833 C 5.9655518,-9.1751947 1.2246711,-0.8331741 0.64000901,-0.2956675 0.44014188,-0.1119163 0.19786774,0 0,0 -0.19782487,0 -0.44026137,-0.1119722 -0.64019711,-0.2956675 Z';

    function instance$l($$self, $$props, $$invalidate) {
    	let icons;
    	let actual_outline_width;
    	let actual_icon_spacing;
    	let width;
    	let shadow_offset;
    	let { fg_color = 'white' } = $$props;
    	let { bg_color = '#7b5b5b' } = $$props;
    	let { outline_color = 'white' } = $$props;
    	let { outline_width = 2 } = $$props;
    	let { outline_brightness = 1.0 } = $$props;
    	let { icon = null } = $$props;
    	let { icon_set = null } = $$props;
    	let { text = null } = $$props;
    	let { shape = 'circle' } = $$props;
    	let { shadow = false } = $$props;
    	let { icon_spacing } = $$props;
    	let { scale = 1 } = $$props;

    	$$self.$$set = $$props => {
    		if ('fg_color' in $$props) $$invalidate(0, fg_color = $$props.fg_color);
    		if ('bg_color' in $$props) $$invalidate(1, bg_color = $$props.bg_color);
    		if ('outline_color' in $$props) $$invalidate(2, outline_color = $$props.outline_color);
    		if ('outline_width' in $$props) $$invalidate(15, outline_width = $$props.outline_width);
    		if ('outline_brightness' in $$props) $$invalidate(3, outline_brightness = $$props.outline_brightness);
    		if ('icon' in $$props) $$invalidate(9, icon = $$props.icon);
    		if ('icon_set' in $$props) $$invalidate(4, icon_set = $$props.icon_set);
    		if ('text' in $$props) $$invalidate(5, text = $$props.text);
    		if ('shape' in $$props) $$invalidate(6, shape = $$props.shape);
    		if ('shadow' in $$props) $$invalidate(7, shadow = $$props.shadow);
    		if ('icon_spacing' in $$props) $$invalidate(16, icon_spacing = $$props.icon_spacing);
    		if ('scale' in $$props) $$invalidate(8, scale = $$props.scale);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 512) {
    			 $$invalidate(11, icons = icon === null ? [] : icon.split(','));
    		}

    		if ($$self.$$.dirty & /*outline_width, scale*/ 33024) {
    			 $$invalidate(14, actual_outline_width = outline_width / scale);
    		}

    		if ($$self.$$.dirty & /*icon_spacing*/ 65536) {
    			 $$invalidate(10, actual_icon_spacing = icon_spacing ? icon_spacing : 0);
    		}

    		if ($$self.$$.dirty & /*actual_icon_spacing, icons*/ 3072) {
    			 $$invalidate(13, width = 8 - actual_icon_spacing + Math.max(1, icons.length) * (20 + actual_icon_spacing));
    		}

    		if ($$self.$$.dirty & /*scale*/ 256) {
    			 $$invalidate(12, shadow_offset = 2 / scale);
    		}
    	};

    	return [
    		fg_color,
    		bg_color,
    		outline_color,
    		outline_brightness,
    		icon_set,
    		text,
    		shape,
    		shadow,
    		scale,
    		icon,
    		actual_icon_spacing,
    		icons,
    		shadow_offset,
    		width,
    		actual_outline_width,
    		outline_width,
    		icon_spacing
    	];
    }

    class Marker extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			fg_color: 0,
    			bg_color: 1,
    			outline_color: 2,
    			outline_width: 15,
    			outline_brightness: 3,
    			icon: 9,
    			icon_set: 4,
    			text: 5,
    			shape: 6,
    			shadow: 7,
    			icon_spacing: 16,
    			scale: 8
    		});
    	}
    }

    /* node_modules/anymapper/src/graphics/Line.svelte generated by Svelte v3.47.0 */

    function create_fragment$m(ctx) {
    	let g;
    	let path0;
    	let path0_stroke_width_value;
    	let path1;

    	return {
    		c() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", /*d*/ ctx[4]);
    			attr(path0, "stroke", /*stroke*/ ctx[1]);
    			attr(path0, "stroke-width", path0_stroke_width_value = /*width*/ ctx[2] + 2 * /*border*/ ctx[3]);
    			attr(path0, "class", "svelte-5u7l8k");
    			attr(path1, "d", /*d*/ ctx[4]);
    			attr(path1, "stroke", /*fill*/ ctx[0]);
    			attr(path1, "stroke-width", /*width*/ ctx[2]);
    			attr(path1, "class", "svelte-5u7l8k");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			append(g, path0);
    			append(g, path1);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*d*/ 16) {
    				attr(path0, "d", /*d*/ ctx[4]);
    			}

    			if (dirty & /*stroke*/ 2) {
    				attr(path0, "stroke", /*stroke*/ ctx[1]);
    			}

    			if (dirty & /*width, border*/ 12 && path0_stroke_width_value !== (path0_stroke_width_value = /*width*/ ctx[2] + 2 * /*border*/ ctx[3])) {
    				attr(path0, "stroke-width", path0_stroke_width_value);
    			}

    			if (dirty & /*d*/ 16) {
    				attr(path1, "d", /*d*/ ctx[4]);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr(path1, "stroke", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*width*/ 4) {
    				attr(path1, "stroke-width", /*width*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(g);
    		}
    	};
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let d;
    	let { points = [] } = $$props;
    	let { fill = "rgb(0, 178, 251)" } = $$props;
    	let { stroke = "rgb(0, 105, 205)" } = $$props;
    	let { width = 6 } = $$props;
    	let { border = 2 } = $$props;

    	$$self.$$set = $$props => {
    		if ('points' in $$props) $$invalidate(5, points = $$props.points);
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('stroke' in $$props) $$invalidate(1, stroke = $$props.stroke);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('border' in $$props) $$invalidate(3, border = $$props.border);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*points*/ 32) {
    			 $$invalidate(4, d = "M" + points.map(point => `${point.x} ${point.y}`).join('L'));
    		}
    	};

    	return [fill, stroke, width, border, d, points];
    }

    class Line extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			points: 5,
    			fill: 0,
    			stroke: 1,
    			width: 2,
    			border: 3
    		});
    	}
    }

    function identity$3(x) {
      return x;
    }

    function rollup(values, reduce, ...keys) {
      return nest(values, identity$3, reduce, keys);
    }

    function nest(values, map, reduce, keys) {
      return (function regroup(values, i) {
        if (i >= keys.length) return reduce(values);
        const groups = new Map();
        const keyof = keys[i++];
        let index = -1;
        for (const value of values) {
          const key = keyof(value, ++index, values);
          const group = groups.get(key);
          if (group) group.push(value);
          else groups.set(key, [value]);
        }
        for (const [key, values] of groups) {
          groups.set(key, regroup(values, i));
        }
        return map(groups);
      })(values, 0);
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var lunr = createCommonjsModule(function (module, exports) {
    (function(){

    /**
     * A convenience function for configuring and constructing
     * a new lunr Index.
     *
     * A lunr.Builder instance is created and the pipeline setup
     * with a trimmer, stop word filter and stemmer.
     *
     * This builder object is yielded to the configuration function
     * that is passed as a parameter, allowing the list of fields
     * and other builder parameters to be customised.
     *
     * All documents _must_ be added within the passed config function.
     *
     * @example
     * var idx = lunr(function () {
     *   this.field('title')
     *   this.field('body')
     *   this.ref('id')
     *
     *   documents.forEach(function (doc) {
     *     this.add(doc)
     *   }, this)
     * })
     *
     * @see {@link lunr.Builder}
     * @see {@link lunr.Pipeline}
     * @see {@link lunr.trimmer}
     * @see {@link lunr.stopWordFilter}
     * @see {@link lunr.stemmer}
     * @namespace {function} lunr
     */
    var lunr = function (config) {
      var builder = new lunr.Builder;

      builder.pipeline.add(
        lunr.trimmer,
        lunr.stopWordFilter,
        lunr.stemmer
      );

      builder.searchPipeline.add(
        lunr.stemmer
      );

      config.call(builder, builder);
      return builder.build()
    };

    lunr.version = "2.3.9";
    /*!
     * lunr.utils
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * A namespace containing utils for the rest of the lunr library
     * @namespace lunr.utils
     */
    lunr.utils = {};

    /**
     * Print a warning message to the console.
     *
     * @param {String} message The message to be printed.
     * @memberOf lunr.utils
     * @function
     */
    lunr.utils.warn = (function (global) {
      /* eslint-disable no-console */
      return function (message) {
        if (global.console && console.warn) {
          console.warn(message);
        }
      }
      /* eslint-enable no-console */
    })(this);

    /**
     * Convert an object to a string.
     *
     * In the case of `null` and `undefined` the function returns
     * the empty string, in all other cases the result of calling
     * `toString` on the passed object is returned.
     *
     * @param {Any} obj The object to convert to a string.
     * @return {String} string representation of the passed object.
     * @memberOf lunr.utils
     */
    lunr.utils.asString = function (obj) {
      if (obj === void 0 || obj === null) {
        return ""
      } else {
        return obj.toString()
      }
    };

    /**
     * Clones an object.
     *
     * Will create a copy of an existing object such that any mutations
     * on the copy cannot affect the original.
     *
     * Only shallow objects are supported, passing a nested object to this
     * function will cause a TypeError.
     *
     * Objects with primitives, and arrays of primitives are supported.
     *
     * @param {Object} obj The object to clone.
     * @return {Object} a clone of the passed object.
     * @throws {TypeError} when a nested object is passed.
     * @memberOf Utils
     */
    lunr.utils.clone = function (obj) {
      if (obj === null || obj === undefined) {
        return obj
      }

      var clone = Object.create(null),
          keys = Object.keys(obj);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i],
            val = obj[key];

        if (Array.isArray(val)) {
          clone[key] = val.slice();
          continue
        }

        if (typeof val === 'string' ||
            typeof val === 'number' ||
            typeof val === 'boolean') {
          clone[key] = val;
          continue
        }

        throw new TypeError("clone is not deep and does not support nested objects")
      }

      return clone
    };
    lunr.FieldRef = function (docRef, fieldName, stringValue) {
      this.docRef = docRef;
      this.fieldName = fieldName;
      this._stringValue = stringValue;
    };

    lunr.FieldRef.joiner = "/";

    lunr.FieldRef.fromString = function (s) {
      var n = s.indexOf(lunr.FieldRef.joiner);

      if (n === -1) {
        throw "malformed field ref string"
      }

      var fieldRef = s.slice(0, n),
          docRef = s.slice(n + 1);

      return new lunr.FieldRef (docRef, fieldRef, s)
    };

    lunr.FieldRef.prototype.toString = function () {
      if (this._stringValue == undefined) {
        this._stringValue = this.fieldName + lunr.FieldRef.joiner + this.docRef;
      }

      return this._stringValue
    };
    /*!
     * lunr.Set
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * A lunr set.
     *
     * @constructor
     */
    lunr.Set = function (elements) {
      this.elements = Object.create(null);

      if (elements) {
        this.length = elements.length;

        for (var i = 0; i < this.length; i++) {
          this.elements[elements[i]] = true;
        }
      } else {
        this.length = 0;
      }
    };

    /**
     * A complete set that contains all elements.
     *
     * @static
     * @readonly
     * @type {lunr.Set}
     */
    lunr.Set.complete = {
      intersect: function (other) {
        return other
      },

      union: function () {
        return this
      },

      contains: function () {
        return true
      }
    };

    /**
     * An empty set that contains no elements.
     *
     * @static
     * @readonly
     * @type {lunr.Set}
     */
    lunr.Set.empty = {
      intersect: function () {
        return this
      },

      union: function (other) {
        return other
      },

      contains: function () {
        return false
      }
    };

    /**
     * Returns true if this set contains the specified object.
     *
     * @param {object} object - Object whose presence in this set is to be tested.
     * @returns {boolean} - True if this set contains the specified object.
     */
    lunr.Set.prototype.contains = function (object) {
      return !!this.elements[object]
    };

    /**
     * Returns a new set containing only the elements that are present in both
     * this set and the specified set.
     *
     * @param {lunr.Set} other - set to intersect with this set.
     * @returns {lunr.Set} a new set that is the intersection of this and the specified set.
     */

    lunr.Set.prototype.intersect = function (other) {
      var a, b, elements, intersection = [];

      if (other === lunr.Set.complete) {
        return this
      }

      if (other === lunr.Set.empty) {
        return other
      }

      if (this.length < other.length) {
        a = this;
        b = other;
      } else {
        a = other;
        b = this;
      }

      elements = Object.keys(a.elements);

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element in b.elements) {
          intersection.push(element);
        }
      }

      return new lunr.Set (intersection)
    };

    /**
     * Returns a new set combining the elements of this and the specified set.
     *
     * @param {lunr.Set} other - set to union with this set.
     * @return {lunr.Set} a new set that is the union of this and the specified set.
     */

    lunr.Set.prototype.union = function (other) {
      if (other === lunr.Set.complete) {
        return lunr.Set.complete
      }

      if (other === lunr.Set.empty) {
        return this
      }

      return new lunr.Set(Object.keys(this.elements).concat(Object.keys(other.elements)))
    };
    /**
     * A function to calculate the inverse document frequency for
     * a posting. This is shared between the builder and the index
     *
     * @private
     * @param {object} posting - The posting for a given term
     * @param {number} documentCount - The total number of documents.
     */
    lunr.idf = function (posting, documentCount) {
      var documentsWithTerm = 0;

      for (var fieldName in posting) {
        if (fieldName == '_index') continue // Ignore the term index, its not a field
        documentsWithTerm += Object.keys(posting[fieldName]).length;
      }

      var x = (documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5);

      return Math.log(1 + Math.abs(x))
    };

    /**
     * A token wraps a string representation of a token
     * as it is passed through the text processing pipeline.
     *
     * @constructor
     * @param {string} [str=''] - The string token being wrapped.
     * @param {object} [metadata={}] - Metadata associated with this token.
     */
    lunr.Token = function (str, metadata) {
      this.str = str || "";
      this.metadata = metadata || {};
    };

    /**
     * Returns the token string that is being wrapped by this object.
     *
     * @returns {string}
     */
    lunr.Token.prototype.toString = function () {
      return this.str
    };

    /**
     * A token update function is used when updating or optionally
     * when cloning a token.
     *
     * @callback lunr.Token~updateFunction
     * @param {string} str - The string representation of the token.
     * @param {Object} metadata - All metadata associated with this token.
     */

    /**
     * Applies the given function to the wrapped string token.
     *
     * @example
     * token.update(function (str, metadata) {
     *   return str.toUpperCase()
     * })
     *
     * @param {lunr.Token~updateFunction} fn - A function to apply to the token string.
     * @returns {lunr.Token}
     */
    lunr.Token.prototype.update = function (fn) {
      this.str = fn(this.str, this.metadata);
      return this
    };

    /**
     * Creates a clone of this token. Optionally a function can be
     * applied to the cloned token.
     *
     * @param {lunr.Token~updateFunction} [fn] - An optional function to apply to the cloned token.
     * @returns {lunr.Token}
     */
    lunr.Token.prototype.clone = function (fn) {
      fn = fn || function (s) { return s };
      return new lunr.Token (fn(this.str, this.metadata), this.metadata)
    };
    /*!
     * lunr.tokenizer
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * A function for splitting a string into tokens ready to be inserted into
     * the search index. Uses `lunr.tokenizer.separator` to split strings, change
     * the value of this property to change how strings are split into tokens.
     *
     * This tokenizer will convert its parameter to a string by calling `toString` and
     * then will split this string on the character in `lunr.tokenizer.separator`.
     * Arrays will have their elements converted to strings and wrapped in a lunr.Token.
     *
     * Optional metadata can be passed to the tokenizer, this metadata will be cloned and
     * added as metadata to every token that is created from the object to be tokenized.
     *
     * @static
     * @param {?(string|object|object[])} obj - The object to convert into tokens
     * @param {?object} metadata - Optional metadata to associate with every token
     * @returns {lunr.Token[]}
     * @see {@link lunr.Pipeline}
     */
    lunr.tokenizer = function (obj, metadata) {
      if (obj == null || obj == undefined) {
        return []
      }

      if (Array.isArray(obj)) {
        return obj.map(function (t) {
          return new lunr.Token(
            lunr.utils.asString(t).toLowerCase(),
            lunr.utils.clone(metadata)
          )
        })
      }

      var str = obj.toString().toLowerCase(),
          len = str.length,
          tokens = [];

      for (var sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
        var char = str.charAt(sliceEnd),
            sliceLength = sliceEnd - sliceStart;

        if ((char.match(lunr.tokenizer.separator) || sliceEnd == len)) {

          if (sliceLength > 0) {
            var tokenMetadata = lunr.utils.clone(metadata) || {};
            tokenMetadata["position"] = [sliceStart, sliceLength];
            tokenMetadata["index"] = tokens.length;

            tokens.push(
              new lunr.Token (
                str.slice(sliceStart, sliceEnd),
                tokenMetadata
              )
            );
          }

          sliceStart = sliceEnd + 1;
        }

      }

      return tokens
    };

    /**
     * The separator used to split a string into tokens. Override this property to change the behaviour of
     * `lunr.tokenizer` behaviour when tokenizing strings. By default this splits on whitespace and hyphens.
     *
     * @static
     * @see lunr.tokenizer
     */
    lunr.tokenizer.separator = /[\s\-]+/;
    /*!
     * lunr.Pipeline
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * lunr.Pipelines maintain an ordered list of functions to be applied to all
     * tokens in documents entering the search index and queries being ran against
     * the index.
     *
     * An instance of lunr.Index created with the lunr shortcut will contain a
     * pipeline with a stop word filter and an English language stemmer. Extra
     * functions can be added before or after either of these functions or these
     * default functions can be removed.
     *
     * When run the pipeline will call each function in turn, passing a token, the
     * index of that token in the original list of all tokens and finally a list of
     * all the original tokens.
     *
     * The output of functions in the pipeline will be passed to the next function
     * in the pipeline. To exclude a token from entering the index the function
     * should return undefined, the rest of the pipeline will not be called with
     * this token.
     *
     * For serialisation of pipelines to work, all functions used in an instance of
     * a pipeline should be registered with lunr.Pipeline. Registered functions can
     * then be loaded. If trying to load a serialised pipeline that uses functions
     * that are not registered an error will be thrown.
     *
     * If not planning on serialising the pipeline then registering pipeline functions
     * is not necessary.
     *
     * @constructor
     */
    lunr.Pipeline = function () {
      this._stack = [];
    };

    lunr.Pipeline.registeredFunctions = Object.create(null);

    /**
     * A pipeline function maps lunr.Token to lunr.Token. A lunr.Token contains the token
     * string as well as all known metadata. A pipeline function can mutate the token string
     * or mutate (or add) metadata for a given token.
     *
     * A pipeline function can indicate that the passed token should be discarded by returning
     * null, undefined or an empty string. This token will not be passed to any downstream pipeline
     * functions and will not be added to the index.
     *
     * Multiple tokens can be returned by returning an array of tokens. Each token will be passed
     * to any downstream pipeline functions and all will returned tokens will be added to the index.
     *
     * Any number of pipeline functions may be chained together using a lunr.Pipeline.
     *
     * @interface lunr.PipelineFunction
     * @param {lunr.Token} token - A token from the document being processed.
     * @param {number} i - The index of this token in the complete list of tokens for this document/field.
     * @param {lunr.Token[]} tokens - All tokens for this document/field.
     * @returns {(?lunr.Token|lunr.Token[])}
     */

    /**
     * Register a function with the pipeline.
     *
     * Functions that are used in the pipeline should be registered if the pipeline
     * needs to be serialised, or a serialised pipeline needs to be loaded.
     *
     * Registering a function does not add it to a pipeline, functions must still be
     * added to instances of the pipeline for them to be used when running a pipeline.
     *
     * @param {lunr.PipelineFunction} fn - The function to check for.
     * @param {String} label - The label to register this function with
     */
    lunr.Pipeline.registerFunction = function (fn, label) {
      if (label in this.registeredFunctions) {
        lunr.utils.warn('Overwriting existing registered function: ' + label);
      }

      fn.label = label;
      lunr.Pipeline.registeredFunctions[fn.label] = fn;
    };

    /**
     * Warns if the function is not registered as a Pipeline function.
     *
     * @param {lunr.PipelineFunction} fn - The function to check for.
     * @private
     */
    lunr.Pipeline.warnIfFunctionNotRegistered = function (fn) {
      var isRegistered = fn.label && (fn.label in this.registeredFunctions);

      if (!isRegistered) {
        lunr.utils.warn('Function is not registered with pipeline. This may cause problems when serialising the index.\n', fn);
      }
    };

    /**
     * Loads a previously serialised pipeline.
     *
     * All functions to be loaded must already be registered with lunr.Pipeline.
     * If any function from the serialised data has not been registered then an
     * error will be thrown.
     *
     * @param {Object} serialised - The serialised pipeline to load.
     * @returns {lunr.Pipeline}
     */
    lunr.Pipeline.load = function (serialised) {
      var pipeline = new lunr.Pipeline;

      serialised.forEach(function (fnName) {
        var fn = lunr.Pipeline.registeredFunctions[fnName];

        if (fn) {
          pipeline.add(fn);
        } else {
          throw new Error('Cannot load unregistered function: ' + fnName)
        }
      });

      return pipeline
    };

    /**
     * Adds new functions to the end of the pipeline.
     *
     * Logs a warning if the function has not been registered.
     *
     * @param {lunr.PipelineFunction[]} functions - Any number of functions to add to the pipeline.
     */
    lunr.Pipeline.prototype.add = function () {
      var fns = Array.prototype.slice.call(arguments);

      fns.forEach(function (fn) {
        lunr.Pipeline.warnIfFunctionNotRegistered(fn);
        this._stack.push(fn);
      }, this);
    };

    /**
     * Adds a single function after a function that already exists in the
     * pipeline.
     *
     * Logs a warning if the function has not been registered.
     *
     * @param {lunr.PipelineFunction} existingFn - A function that already exists in the pipeline.
     * @param {lunr.PipelineFunction} newFn - The new function to add to the pipeline.
     */
    lunr.Pipeline.prototype.after = function (existingFn, newFn) {
      lunr.Pipeline.warnIfFunctionNotRegistered(newFn);

      var pos = this._stack.indexOf(existingFn);
      if (pos == -1) {
        throw new Error('Cannot find existingFn')
      }

      pos = pos + 1;
      this._stack.splice(pos, 0, newFn);
    };

    /**
     * Adds a single function before a function that already exists in the
     * pipeline.
     *
     * Logs a warning if the function has not been registered.
     *
     * @param {lunr.PipelineFunction} existingFn - A function that already exists in the pipeline.
     * @param {lunr.PipelineFunction} newFn - The new function to add to the pipeline.
     */
    lunr.Pipeline.prototype.before = function (existingFn, newFn) {
      lunr.Pipeline.warnIfFunctionNotRegistered(newFn);

      var pos = this._stack.indexOf(existingFn);
      if (pos == -1) {
        throw new Error('Cannot find existingFn')
      }

      this._stack.splice(pos, 0, newFn);
    };

    /**
     * Removes a function from the pipeline.
     *
     * @param {lunr.PipelineFunction} fn The function to remove from the pipeline.
     */
    lunr.Pipeline.prototype.remove = function (fn) {
      var pos = this._stack.indexOf(fn);
      if (pos == -1) {
        return
      }

      this._stack.splice(pos, 1);
    };

    /**
     * Runs the current list of functions that make up the pipeline against the
     * passed tokens.
     *
     * @param {Array} tokens The tokens to run through the pipeline.
     * @returns {Array}
     */
    lunr.Pipeline.prototype.run = function (tokens) {
      var stackLength = this._stack.length;

      for (var i = 0; i < stackLength; i++) {
        var fn = this._stack[i];
        var memo = [];

        for (var j = 0; j < tokens.length; j++) {
          var result = fn(tokens[j], j, tokens);

          if (result === null || result === void 0 || result === '') continue

          if (Array.isArray(result)) {
            for (var k = 0; k < result.length; k++) {
              memo.push(result[k]);
            }
          } else {
            memo.push(result);
          }
        }

        tokens = memo;
      }

      return tokens
    };

    /**
     * Convenience method for passing a string through a pipeline and getting
     * strings out. This method takes care of wrapping the passed string in a
     * token and mapping the resulting tokens back to strings.
     *
     * @param {string} str - The string to pass through the pipeline.
     * @param {?object} metadata - Optional metadata to associate with the token
     * passed to the pipeline.
     * @returns {string[]}
     */
    lunr.Pipeline.prototype.runString = function (str, metadata) {
      var token = new lunr.Token (str, metadata);

      return this.run([token]).map(function (t) {
        return t.toString()
      })
    };

    /**
     * Resets the pipeline by removing any existing processors.
     *
     */
    lunr.Pipeline.prototype.reset = function () {
      this._stack = [];
    };

    /**
     * Returns a representation of the pipeline ready for serialisation.
     *
     * Logs a warning if the function has not been registered.
     *
     * @returns {Array}
     */
    lunr.Pipeline.prototype.toJSON = function () {
      return this._stack.map(function (fn) {
        lunr.Pipeline.warnIfFunctionNotRegistered(fn);

        return fn.label
      })
    };
    /*!
     * lunr.Vector
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * A vector is used to construct the vector space of documents and queries. These
     * vectors support operations to determine the similarity between two documents or
     * a document and a query.
     *
     * Normally no parameters are required for initializing a vector, but in the case of
     * loading a previously dumped vector the raw elements can be provided to the constructor.
     *
     * For performance reasons vectors are implemented with a flat array, where an elements
     * index is immediately followed by its value. E.g. [index, value, index, value]. This
     * allows the underlying array to be as sparse as possible and still offer decent
     * performance when being used for vector calculations.
     *
     * @constructor
     * @param {Number[]} [elements] - The flat list of element index and element value pairs.
     */
    lunr.Vector = function (elements) {
      this._magnitude = 0;
      this.elements = elements || [];
    };


    /**
     * Calculates the position within the vector to insert a given index.
     *
     * This is used internally by insert and upsert. If there are duplicate indexes then
     * the position is returned as if the value for that index were to be updated, but it
     * is the callers responsibility to check whether there is a duplicate at that index
     *
     * @param {Number} insertIdx - The index at which the element should be inserted.
     * @returns {Number}
     */
    lunr.Vector.prototype.positionForIndex = function (index) {
      // For an empty vector the tuple can be inserted at the beginning
      if (this.elements.length == 0) {
        return 0
      }

      var start = 0,
          end = this.elements.length / 2,
          sliceLength = end - start,
          pivotPoint = Math.floor(sliceLength / 2),
          pivotIndex = this.elements[pivotPoint * 2];

      while (sliceLength > 1) {
        if (pivotIndex < index) {
          start = pivotPoint;
        }

        if (pivotIndex > index) {
          end = pivotPoint;
        }

        if (pivotIndex == index) {
          break
        }

        sliceLength = end - start;
        pivotPoint = start + Math.floor(sliceLength / 2);
        pivotIndex = this.elements[pivotPoint * 2];
      }

      if (pivotIndex == index) {
        return pivotPoint * 2
      }

      if (pivotIndex > index) {
        return pivotPoint * 2
      }

      if (pivotIndex < index) {
        return (pivotPoint + 1) * 2
      }
    };

    /**
     * Inserts an element at an index within the vector.
     *
     * Does not allow duplicates, will throw an error if there is already an entry
     * for this index.
     *
     * @param {Number} insertIdx - The index at which the element should be inserted.
     * @param {Number} val - The value to be inserted into the vector.
     */
    lunr.Vector.prototype.insert = function (insertIdx, val) {
      this.upsert(insertIdx, val, function () {
        throw "duplicate index"
      });
    };

    /**
     * Inserts or updates an existing index within the vector.
     *
     * @param {Number} insertIdx - The index at which the element should be inserted.
     * @param {Number} val - The value to be inserted into the vector.
     * @param {function} fn - A function that is called for updates, the existing value and the
     * requested value are passed as arguments
     */
    lunr.Vector.prototype.upsert = function (insertIdx, val, fn) {
      this._magnitude = 0;
      var position = this.positionForIndex(insertIdx);

      if (this.elements[position] == insertIdx) {
        this.elements[position + 1] = fn(this.elements[position + 1], val);
      } else {
        this.elements.splice(position, 0, insertIdx, val);
      }
    };

    /**
     * Calculates the magnitude of this vector.
     *
     * @returns {Number}
     */
    lunr.Vector.prototype.magnitude = function () {
      if (this._magnitude) return this._magnitude

      var sumOfSquares = 0,
          elementsLength = this.elements.length;

      for (var i = 1; i < elementsLength; i += 2) {
        var val = this.elements[i];
        sumOfSquares += val * val;
      }

      return this._magnitude = Math.sqrt(sumOfSquares)
    };

    /**
     * Calculates the dot product of this vector and another vector.
     *
     * @param {lunr.Vector} otherVector - The vector to compute the dot product with.
     * @returns {Number}
     */
    lunr.Vector.prototype.dot = function (otherVector) {
      var dotProduct = 0,
          a = this.elements, b = otherVector.elements,
          aLen = a.length, bLen = b.length,
          aVal = 0, bVal = 0,
          i = 0, j = 0;

      while (i < aLen && j < bLen) {
        aVal = a[i], bVal = b[j];
        if (aVal < bVal) {
          i += 2;
        } else if (aVal > bVal) {
          j += 2;
        } else if (aVal == bVal) {
          dotProduct += a[i + 1] * b[j + 1];
          i += 2;
          j += 2;
        }
      }

      return dotProduct
    };

    /**
     * Calculates the similarity between this vector and another vector.
     *
     * @param {lunr.Vector} otherVector - The other vector to calculate the
     * similarity with.
     * @returns {Number}
     */
    lunr.Vector.prototype.similarity = function (otherVector) {
      return this.dot(otherVector) / this.magnitude() || 0
    };

    /**
     * Converts the vector to an array of the elements within the vector.
     *
     * @returns {Number[]}
     */
    lunr.Vector.prototype.toArray = function () {
      var output = new Array (this.elements.length / 2);

      for (var i = 1, j = 0; i < this.elements.length; i += 2, j++) {
        output[j] = this.elements[i];
      }

      return output
    };

    /**
     * A JSON serializable representation of the vector.
     *
     * @returns {Number[]}
     */
    lunr.Vector.prototype.toJSON = function () {
      return this.elements
    };
    /* eslint-disable */
    /*!
     * lunr.stemmer
     * Copyright (C) 2020 Oliver Nightingale
     * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
     */

    /**
     * lunr.stemmer is an english language stemmer, this is a JavaScript
     * implementation of the PorterStemmer taken from http://tartarus.org/~martin
     *
     * @static
     * @implements {lunr.PipelineFunction}
     * @param {lunr.Token} token - The string to stem
     * @returns {lunr.Token}
     * @see {@link lunr.Pipeline}
     * @function
     */
    lunr.stemmer = (function(){
      var step2list = {
          "ational" : "ate",
          "tional" : "tion",
          "enci" : "ence",
          "anci" : "ance",
          "izer" : "ize",
          "bli" : "ble",
          "alli" : "al",
          "entli" : "ent",
          "eli" : "e",
          "ousli" : "ous",
          "ization" : "ize",
          "ation" : "ate",
          "ator" : "ate",
          "alism" : "al",
          "iveness" : "ive",
          "fulness" : "ful",
          "ousness" : "ous",
          "aliti" : "al",
          "iviti" : "ive",
          "biliti" : "ble",
          "logi" : "log"
        },

        step3list = {
          "icate" : "ic",
          "ative" : "",
          "alize" : "al",
          "iciti" : "ic",
          "ical" : "ic",
          "ful" : "",
          "ness" : ""
        },

        c = "[^aeiou]",          // consonant
        v = "[aeiouy]",          // vowel
        C = c + "[^aeiouy]*",    // consonant sequence
        V = v + "[aeiou]*",      // vowel sequence

        mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
        meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
        mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
        s_v = "^(" + C + ")?" + v;                   // vowel in stem

      var re_mgr0 = new RegExp(mgr0);
      var re_mgr1 = new RegExp(mgr1);
      var re_meq1 = new RegExp(meq1);
      var re_s_v = new RegExp(s_v);

      var re_1a = /^(.+?)(ss|i)es$/;
      var re2_1a = /^(.+?)([^s])s$/;
      var re_1b = /^(.+?)eed$/;
      var re2_1b = /^(.+?)(ed|ing)$/;
      var re_1b_2 = /.$/;
      var re2_1b_2 = /(at|bl|iz)$/;
      var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
      var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");

      var re_1c = /^(.+?[^aeiou])y$/;
      var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

      var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

      var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
      var re2_4 = /^(.+?)(s|t)(ion)$/;

      var re_5 = /^(.+?)e$/;
      var re_5_1 = /ll$/;
      var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");

      var porterStemmer = function porterStemmer(w) {
        var stem,
          suffix,
          firstch,
          re,
          re2,
          re3,
          re4;

        if (w.length < 3) { return w; }

        firstch = w.substr(0,1);
        if (firstch == "y") {
          w = firstch.toUpperCase() + w.substr(1);
        }

        // Step 1a
        re = re_1a;
        re2 = re2_1a;

        if (re.test(w)) { w = w.replace(re,"$1$2"); }
        else if (re2.test(w)) { w = w.replace(re2,"$1$2"); }

        // Step 1b
        re = re_1b;
        re2 = re2_1b;
        if (re.test(w)) {
          var fp = re.exec(w);
          re = re_mgr0;
          if (re.test(fp[1])) {
            re = re_1b_2;
            w = w.replace(re,"");
          }
        } else if (re2.test(w)) {
          var fp = re2.exec(w);
          stem = fp[1];
          re2 = re_s_v;
          if (re2.test(stem)) {
            w = stem;
            re2 = re2_1b_2;
            re3 = re3_1b_2;
            re4 = re4_1b_2;
            if (re2.test(w)) { w = w + "e"; }
            else if (re3.test(w)) { re = re_1b_2; w = w.replace(re,""); }
            else if (re4.test(w)) { w = w + "e"; }
          }
        }

        // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
        re = re_1c;
        if (re.test(w)) {
          var fp = re.exec(w);
          stem = fp[1];
          w = stem + "i";
        }

        // Step 2
        re = re_2;
        if (re.test(w)) {
          var fp = re.exec(w);
          stem = fp[1];
          suffix = fp[2];
          re = re_mgr0;
          if (re.test(stem)) {
            w = stem + step2list[suffix];
          }
        }

        // Step 3
        re = re_3;
        if (re.test(w)) {
          var fp = re.exec(w);
          stem = fp[1];
          suffix = fp[2];
          re = re_mgr0;
          if (re.test(stem)) {
            w = stem + step3list[suffix];
          }
        }

        // Step 4
        re = re_4;
        re2 = re2_4;
        if (re.test(w)) {
          var fp = re.exec(w);
          stem = fp[1];
          re = re_mgr1;
          if (re.test(stem)) {
            w = stem;
          }
        } else if (re2.test(w)) {
          var fp = re2.exec(w);
          stem = fp[1] + fp[2];
          re2 = re_mgr1;
          if (re2.test(stem)) {
            w = stem;
          }
        }

        // Step 5
        re = re_5;
        if (re.test(w)) {
          var fp = re.exec(w);
          stem = fp[1];
          re = re_mgr1;
          re2 = re_meq1;
          re3 = re3_5;
          if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
            w = stem;
          }
        }

        re = re_5_1;
        re2 = re_mgr1;
        if (re.test(w) && re2.test(w)) {
          re = re_1b_2;
          w = w.replace(re,"");
        }

        // and turn initial Y back to y

        if (firstch == "y") {
          w = firstch.toLowerCase() + w.substr(1);
        }

        return w;
      };

      return function (token) {
        return token.update(porterStemmer);
      }
    })();

    lunr.Pipeline.registerFunction(lunr.stemmer, 'stemmer');
    /*!
     * lunr.stopWordFilter
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * lunr.generateStopWordFilter builds a stopWordFilter function from the provided
     * list of stop words.
     *
     * The built in lunr.stopWordFilter is built using this generator and can be used
     * to generate custom stopWordFilters for applications or non English languages.
     *
     * @function
     * @param {Array} token The token to pass through the filter
     * @returns {lunr.PipelineFunction}
     * @see lunr.Pipeline
     * @see lunr.stopWordFilter
     */
    lunr.generateStopWordFilter = function (stopWords) {
      var words = stopWords.reduce(function (memo, stopWord) {
        memo[stopWord] = stopWord;
        return memo
      }, {});

      return function (token) {
        if (token && words[token.toString()] !== token.toString()) return token
      }
    };

    /**
     * lunr.stopWordFilter is an English language stop word list filter, any words
     * contained in the list will not be passed through the filter.
     *
     * This is intended to be used in the Pipeline. If the token does not pass the
     * filter then undefined will be returned.
     *
     * @function
     * @implements {lunr.PipelineFunction}
     * @params {lunr.Token} token - A token to check for being a stop word.
     * @returns {lunr.Token}
     * @see {@link lunr.Pipeline}
     */
    lunr.stopWordFilter = lunr.generateStopWordFilter([
      'a',
      'able',
      'about',
      'across',
      'after',
      'all',
      'almost',
      'also',
      'am',
      'among',
      'an',
      'and',
      'any',
      'are',
      'as',
      'at',
      'be',
      'because',
      'been',
      'but',
      'by',
      'can',
      'cannot',
      'could',
      'dear',
      'did',
      'do',
      'does',
      'either',
      'else',
      'ever',
      'every',
      'for',
      'from',
      'get',
      'got',
      'had',
      'has',
      'have',
      'he',
      'her',
      'hers',
      'him',
      'his',
      'how',
      'however',
      'i',
      'if',
      'in',
      'into',
      'is',
      'it',
      'its',
      'just',
      'least',
      'let',
      'like',
      'likely',
      'may',
      'me',
      'might',
      'most',
      'must',
      'my',
      'neither',
      'no',
      'nor',
      'not',
      'of',
      'off',
      'often',
      'on',
      'only',
      'or',
      'other',
      'our',
      'own',
      'rather',
      'said',
      'say',
      'says',
      'she',
      'should',
      'since',
      'so',
      'some',
      'than',
      'that',
      'the',
      'their',
      'them',
      'then',
      'there',
      'these',
      'they',
      'this',
      'tis',
      'to',
      'too',
      'twas',
      'us',
      'wants',
      'was',
      'we',
      'were',
      'what',
      'when',
      'where',
      'which',
      'while',
      'who',
      'whom',
      'why',
      'will',
      'with',
      'would',
      'yet',
      'you',
      'your'
    ]);

    lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'stopWordFilter');
    /*!
     * lunr.trimmer
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * lunr.trimmer is a pipeline function for trimming non word
     * characters from the beginning and end of tokens before they
     * enter the index.
     *
     * This implementation may not work correctly for non latin
     * characters and should either be removed or adapted for use
     * with languages with non-latin characters.
     *
     * @static
     * @implements {lunr.PipelineFunction}
     * @param {lunr.Token} token The token to pass through the filter
     * @returns {lunr.Token}
     * @see lunr.Pipeline
     */
    lunr.trimmer = function (token) {
      return token.update(function (s) {
        return s.replace(/^\W+/, '').replace(/\W+$/, '')
      })
    };

    lunr.Pipeline.registerFunction(lunr.trimmer, 'trimmer');
    /*!
     * lunr.TokenSet
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * A token set is used to store the unique list of all tokens
     * within an index. Token sets are also used to represent an
     * incoming query to the index, this query token set and index
     * token set are then intersected to find which tokens to look
     * up in the inverted index.
     *
     * A token set can hold multiple tokens, as in the case of the
     * index token set, or it can hold a single token as in the
     * case of a simple query token set.
     *
     * Additionally token sets are used to perform wildcard matching.
     * Leading, contained and trailing wildcards are supported, and
     * from this edit distance matching can also be provided.
     *
     * Token sets are implemented as a minimal finite state automata,
     * where both common prefixes and suffixes are shared between tokens.
     * This helps to reduce the space used for storing the token set.
     *
     * @constructor
     */
    lunr.TokenSet = function () {
      this.final = false;
      this.edges = {};
      this.id = lunr.TokenSet._nextId;
      lunr.TokenSet._nextId += 1;
    };

    /**
     * Keeps track of the next, auto increment, identifier to assign
     * to a new tokenSet.
     *
     * TokenSets require a unique identifier to be correctly minimised.
     *
     * @private
     */
    lunr.TokenSet._nextId = 1;

    /**
     * Creates a TokenSet instance from the given sorted array of words.
     *
     * @param {String[]} arr - A sorted array of strings to create the set from.
     * @returns {lunr.TokenSet}
     * @throws Will throw an error if the input array is not sorted.
     */
    lunr.TokenSet.fromArray = function (arr) {
      var builder = new lunr.TokenSet.Builder;

      for (var i = 0, len = arr.length; i < len; i++) {
        builder.insert(arr[i]);
      }

      builder.finish();
      return builder.root
    };

    /**
     * Creates a token set from a query clause.
     *
     * @private
     * @param {Object} clause - A single clause from lunr.Query.
     * @param {string} clause.term - The query clause term.
     * @param {number} [clause.editDistance] - The optional edit distance for the term.
     * @returns {lunr.TokenSet}
     */
    lunr.TokenSet.fromClause = function (clause) {
      if ('editDistance' in clause) {
        return lunr.TokenSet.fromFuzzyString(clause.term, clause.editDistance)
      } else {
        return lunr.TokenSet.fromString(clause.term)
      }
    };

    /**
     * Creates a token set representing a single string with a specified
     * edit distance.
     *
     * Insertions, deletions, substitutions and transpositions are each
     * treated as an edit distance of 1.
     *
     * Increasing the allowed edit distance will have a dramatic impact
     * on the performance of both creating and intersecting these TokenSets.
     * It is advised to keep the edit distance less than 3.
     *
     * @param {string} str - The string to create the token set from.
     * @param {number} editDistance - The allowed edit distance to match.
     * @returns {lunr.Vector}
     */
    lunr.TokenSet.fromFuzzyString = function (str, editDistance) {
      var root = new lunr.TokenSet;

      var stack = [{
        node: root,
        editsRemaining: editDistance,
        str: str
      }];

      while (stack.length) {
        var frame = stack.pop();

        // no edit
        if (frame.str.length > 0) {
          var char = frame.str.charAt(0),
              noEditNode;

          if (char in frame.node.edges) {
            noEditNode = frame.node.edges[char];
          } else {
            noEditNode = new lunr.TokenSet;
            frame.node.edges[char] = noEditNode;
          }

          if (frame.str.length == 1) {
            noEditNode.final = true;
          }

          stack.push({
            node: noEditNode,
            editsRemaining: frame.editsRemaining,
            str: frame.str.slice(1)
          });
        }

        if (frame.editsRemaining == 0) {
          continue
        }

        // insertion
        if ("*" in frame.node.edges) {
          var insertionNode = frame.node.edges["*"];
        } else {
          var insertionNode = new lunr.TokenSet;
          frame.node.edges["*"] = insertionNode;
        }

        if (frame.str.length == 0) {
          insertionNode.final = true;
        }

        stack.push({
          node: insertionNode,
          editsRemaining: frame.editsRemaining - 1,
          str: frame.str
        });

        // deletion
        // can only do a deletion if we have enough edits remaining
        // and if there are characters left to delete in the string
        if (frame.str.length > 1) {
          stack.push({
            node: frame.node,
            editsRemaining: frame.editsRemaining - 1,
            str: frame.str.slice(1)
          });
        }

        // deletion
        // just removing the last character from the str
        if (frame.str.length == 1) {
          frame.node.final = true;
        }

        // substitution
        // can only do a substitution if we have enough edits remaining
        // and if there are characters left to substitute
        if (frame.str.length >= 1) {
          if ("*" in frame.node.edges) {
            var substitutionNode = frame.node.edges["*"];
          } else {
            var substitutionNode = new lunr.TokenSet;
            frame.node.edges["*"] = substitutionNode;
          }

          if (frame.str.length == 1) {
            substitutionNode.final = true;
          }

          stack.push({
            node: substitutionNode,
            editsRemaining: frame.editsRemaining - 1,
            str: frame.str.slice(1)
          });
        }

        // transposition
        // can only do a transposition if there are edits remaining
        // and there are enough characters to transpose
        if (frame.str.length > 1) {
          var charA = frame.str.charAt(0),
              charB = frame.str.charAt(1),
              transposeNode;

          if (charB in frame.node.edges) {
            transposeNode = frame.node.edges[charB];
          } else {
            transposeNode = new lunr.TokenSet;
            frame.node.edges[charB] = transposeNode;
          }

          if (frame.str.length == 1) {
            transposeNode.final = true;
          }

          stack.push({
            node: transposeNode,
            editsRemaining: frame.editsRemaining - 1,
            str: charA + frame.str.slice(2)
          });
        }
      }

      return root
    };

    /**
     * Creates a TokenSet from a string.
     *
     * The string may contain one or more wildcard characters (*)
     * that will allow wildcard matching when intersecting with
     * another TokenSet.
     *
     * @param {string} str - The string to create a TokenSet from.
     * @returns {lunr.TokenSet}
     */
    lunr.TokenSet.fromString = function (str) {
      var node = new lunr.TokenSet,
          root = node;

      /*
       * Iterates through all characters within the passed string
       * appending a node for each character.
       *
       * When a wildcard character is found then a self
       * referencing edge is introduced to continually match
       * any number of any characters.
       */
      for (var i = 0, len = str.length; i < len; i++) {
        var char = str[i],
            final = (i == len - 1);

        if (char == "*") {
          node.edges[char] = node;
          node.final = final;

        } else {
          var next = new lunr.TokenSet;
          next.final = final;

          node.edges[char] = next;
          node = next;
        }
      }

      return root
    };

    /**
     * Converts this TokenSet into an array of strings
     * contained within the TokenSet.
     *
     * This is not intended to be used on a TokenSet that
     * contains wildcards, in these cases the results are
     * undefined and are likely to cause an infinite loop.
     *
     * @returns {string[]}
     */
    lunr.TokenSet.prototype.toArray = function () {
      var words = [];

      var stack = [{
        prefix: "",
        node: this
      }];

      while (stack.length) {
        var frame = stack.pop(),
            edges = Object.keys(frame.node.edges),
            len = edges.length;

        if (frame.node.final) {
          /* In Safari, at this point the prefix is sometimes corrupted, see:
           * https://github.com/olivernn/lunr.js/issues/279 Calling any
           * String.prototype method forces Safari to "cast" this string to what
           * it's supposed to be, fixing the bug. */
          frame.prefix.charAt(0);
          words.push(frame.prefix);
        }

        for (var i = 0; i < len; i++) {
          var edge = edges[i];

          stack.push({
            prefix: frame.prefix.concat(edge),
            node: frame.node.edges[edge]
          });
        }
      }

      return words
    };

    /**
     * Generates a string representation of a TokenSet.
     *
     * This is intended to allow TokenSets to be used as keys
     * in objects, largely to aid the construction and minimisation
     * of a TokenSet. As such it is not designed to be a human
     * friendly representation of the TokenSet.
     *
     * @returns {string}
     */
    lunr.TokenSet.prototype.toString = function () {
      // NOTE: Using Object.keys here as this.edges is very likely
      // to enter 'hash-mode' with many keys being added
      //
      // avoiding a for-in loop here as it leads to the function
      // being de-optimised (at least in V8). From some simple
      // benchmarks the performance is comparable, but allowing
      // V8 to optimize may mean easy performance wins in the future.

      if (this._str) {
        return this._str
      }

      var str = this.final ? '1' : '0',
          labels = Object.keys(this.edges).sort(),
          len = labels.length;

      for (var i = 0; i < len; i++) {
        var label = labels[i],
            node = this.edges[label];

        str = str + label + node.id;
      }

      return str
    };

    /**
     * Returns a new TokenSet that is the intersection of
     * this TokenSet and the passed TokenSet.
     *
     * This intersection will take into account any wildcards
     * contained within the TokenSet.
     *
     * @param {lunr.TokenSet} b - An other TokenSet to intersect with.
     * @returns {lunr.TokenSet}
     */
    lunr.TokenSet.prototype.intersect = function (b) {
      var output = new lunr.TokenSet,
          frame = undefined;

      var stack = [{
        qNode: b,
        output: output,
        node: this
      }];

      while (stack.length) {
        frame = stack.pop();

        // NOTE: As with the #toString method, we are using
        // Object.keys and a for loop instead of a for-in loop
        // as both of these objects enter 'hash' mode, causing
        // the function to be de-optimised in V8
        var qEdges = Object.keys(frame.qNode.edges),
            qLen = qEdges.length,
            nEdges = Object.keys(frame.node.edges),
            nLen = nEdges.length;

        for (var q = 0; q < qLen; q++) {
          var qEdge = qEdges[q];

          for (var n = 0; n < nLen; n++) {
            var nEdge = nEdges[n];

            if (nEdge == qEdge || qEdge == '*') {
              var node = frame.node.edges[nEdge],
                  qNode = frame.qNode.edges[qEdge],
                  final = node.final && qNode.final,
                  next = undefined;

              if (nEdge in frame.output.edges) {
                // an edge already exists for this character
                // no need to create a new node, just set the finality
                // bit unless this node is already final
                next = frame.output.edges[nEdge];
                next.final = next.final || final;

              } else {
                // no edge exists yet, must create one
                // set the finality bit and insert it
                // into the output
                next = new lunr.TokenSet;
                next.final = final;
                frame.output.edges[nEdge] = next;
              }

              stack.push({
                qNode: qNode,
                output: next,
                node: node
              });
            }
          }
        }
      }

      return output
    };
    lunr.TokenSet.Builder = function () {
      this.previousWord = "";
      this.root = new lunr.TokenSet;
      this.uncheckedNodes = [];
      this.minimizedNodes = {};
    };

    lunr.TokenSet.Builder.prototype.insert = function (word) {
      var node,
          commonPrefix = 0;

      if (word < this.previousWord) {
        throw new Error ("Out of order word insertion")
      }

      for (var i = 0; i < word.length && i < this.previousWord.length; i++) {
        if (word[i] != this.previousWord[i]) break
        commonPrefix++;
      }

      this.minimize(commonPrefix);

      if (this.uncheckedNodes.length == 0) {
        node = this.root;
      } else {
        node = this.uncheckedNodes[this.uncheckedNodes.length - 1].child;
      }

      for (var i = commonPrefix; i < word.length; i++) {
        var nextNode = new lunr.TokenSet,
            char = word[i];

        node.edges[char] = nextNode;

        this.uncheckedNodes.push({
          parent: node,
          char: char,
          child: nextNode
        });

        node = nextNode;
      }

      node.final = true;
      this.previousWord = word;
    };

    lunr.TokenSet.Builder.prototype.finish = function () {
      this.minimize(0);
    };

    lunr.TokenSet.Builder.prototype.minimize = function (downTo) {
      for (var i = this.uncheckedNodes.length - 1; i >= downTo; i--) {
        var node = this.uncheckedNodes[i],
            childKey = node.child.toString();

        if (childKey in this.minimizedNodes) {
          node.parent.edges[node.char] = this.minimizedNodes[childKey];
        } else {
          // Cache the key for this node since
          // we know it can't change anymore
          node.child._str = childKey;

          this.minimizedNodes[childKey] = node.child;
        }

        this.uncheckedNodes.pop();
      }
    };
    /*!
     * lunr.Index
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * An index contains the built index of all documents and provides a query interface
     * to the index.
     *
     * Usually instances of lunr.Index will not be created using this constructor, instead
     * lunr.Builder should be used to construct new indexes, or lunr.Index.load should be
     * used to load previously built and serialized indexes.
     *
     * @constructor
     * @param {Object} attrs - The attributes of the built search index.
     * @param {Object} attrs.invertedIndex - An index of term/field to document reference.
     * @param {Object<string, lunr.Vector>} attrs.fieldVectors - Field vectors
     * @param {lunr.TokenSet} attrs.tokenSet - An set of all corpus tokens.
     * @param {string[]} attrs.fields - The names of indexed document fields.
     * @param {lunr.Pipeline} attrs.pipeline - The pipeline to use for search terms.
     */
    lunr.Index = function (attrs) {
      this.invertedIndex = attrs.invertedIndex;
      this.fieldVectors = attrs.fieldVectors;
      this.tokenSet = attrs.tokenSet;
      this.fields = attrs.fields;
      this.pipeline = attrs.pipeline;
    };

    /**
     * A result contains details of a document matching a search query.
     * @typedef {Object} lunr.Index~Result
     * @property {string} ref - The reference of the document this result represents.
     * @property {number} score - A number between 0 and 1 representing how similar this document is to the query.
     * @property {lunr.MatchData} matchData - Contains metadata about this match including which term(s) caused the match.
     */

    /**
     * Although lunr provides the ability to create queries using lunr.Query, it also provides a simple
     * query language which itself is parsed into an instance of lunr.Query.
     *
     * For programmatically building queries it is advised to directly use lunr.Query, the query language
     * is best used for human entered text rather than program generated text.
     *
     * At its simplest queries can just be a single term, e.g. `hello`, multiple terms are also supported
     * and will be combined with OR, e.g `hello world` will match documents that contain either 'hello'
     * or 'world', though those that contain both will rank higher in the results.
     *
     * Wildcards can be included in terms to match one or more unspecified characters, these wildcards can
     * be inserted anywhere within the term, and more than one wildcard can exist in a single term. Adding
     * wildcards will increase the number of documents that will be found but can also have a negative
     * impact on query performance, especially with wildcards at the beginning of a term.
     *
     * Terms can be restricted to specific fields, e.g. `title:hello`, only documents with the term
     * hello in the title field will match this query. Using a field not present in the index will lead
     * to an error being thrown.
     *
     * Modifiers can also be added to terms, lunr supports edit distance and boost modifiers on terms. A term
     * boost will make documents matching that term score higher, e.g. `foo^5`. Edit distance is also supported
     * to provide fuzzy matching, e.g. 'hello~2' will match documents with hello with an edit distance of 2.
     * Avoid large values for edit distance to improve query performance.
     *
     * Each term also supports a presence modifier. By default a term's presence in document is optional, however
     * this can be changed to either required or prohibited. For a term's presence to be required in a document the
     * term should be prefixed with a '+', e.g. `+foo bar` is a search for documents that must contain 'foo' and
     * optionally contain 'bar'. Conversely a leading '-' sets the terms presence to prohibited, i.e. it must not
     * appear in a document, e.g. `-foo bar` is a search for documents that do not contain 'foo' but may contain 'bar'.
     *
     * To escape special characters the backslash character '\' can be used, this allows searches to include
     * characters that would normally be considered modifiers, e.g. `foo\~2` will search for a term "foo~2" instead
     * of attempting to apply a boost of 2 to the search term "foo".
     *
     * @typedef {string} lunr.Index~QueryString
     * @example <caption>Simple single term query</caption>
     * hello
     * @example <caption>Multiple term query</caption>
     * hello world
     * @example <caption>term scoped to a field</caption>
     * title:hello
     * @example <caption>term with a boost of 10</caption>
     * hello^10
     * @example <caption>term with an edit distance of 2</caption>
     * hello~2
     * @example <caption>terms with presence modifiers</caption>
     * -foo +bar baz
     */

    /**
     * Performs a search against the index using lunr query syntax.
     *
     * Results will be returned sorted by their score, the most relevant results
     * will be returned first.  For details on how the score is calculated, please see
     * the {@link https://lunrjs.com/guides/searching.html#scoring|guide}.
     *
     * For more programmatic querying use lunr.Index#query.
     *
     * @param {lunr.Index~QueryString} queryString - A string containing a lunr query.
     * @throws {lunr.QueryParseError} If the passed query string cannot be parsed.
     * @returns {lunr.Index~Result[]}
     */
    lunr.Index.prototype.search = function (queryString) {
      return this.query(function (query) {
        var parser = new lunr.QueryParser(queryString, query);
        parser.parse();
      })
    };

    /**
     * A query builder callback provides a query object to be used to express
     * the query to perform on the index.
     *
     * @callback lunr.Index~queryBuilder
     * @param {lunr.Query} query - The query object to build up.
     * @this lunr.Query
     */

    /**
     * Performs a query against the index using the yielded lunr.Query object.
     *
     * If performing programmatic queries against the index, this method is preferred
     * over lunr.Index#search so as to avoid the additional query parsing overhead.
     *
     * A query object is yielded to the supplied function which should be used to
     * express the query to be run against the index.
     *
     * Note that although this function takes a callback parameter it is _not_ an
     * asynchronous operation, the callback is just yielded a query object to be
     * customized.
     *
     * @param {lunr.Index~queryBuilder} fn - A function that is used to build the query.
     * @returns {lunr.Index~Result[]}
     */
    lunr.Index.prototype.query = function (fn) {
      // for each query clause
      // * process terms
      // * expand terms from token set
      // * find matching documents and metadata
      // * get document vectors
      // * score documents

      var query = new lunr.Query(this.fields),
          matchingFields = Object.create(null),
          queryVectors = Object.create(null),
          termFieldCache = Object.create(null),
          requiredMatches = Object.create(null),
          prohibitedMatches = Object.create(null);

      /*
       * To support field level boosts a query vector is created per
       * field. An empty vector is eagerly created to support negated
       * queries.
       */
      for (var i = 0; i < this.fields.length; i++) {
        queryVectors[this.fields[i]] = new lunr.Vector;
      }

      fn.call(query, query);

      for (var i = 0; i < query.clauses.length; i++) {
        /*
         * Unless the pipeline has been disabled for this term, which is
         * the case for terms with wildcards, we need to pass the clause
         * term through the search pipeline. A pipeline returns an array
         * of processed terms. Pipeline functions may expand the passed
         * term, which means we may end up performing multiple index lookups
         * for a single query term.
         */
        var clause = query.clauses[i],
            terms = null,
            clauseMatches = lunr.Set.empty;

        if (clause.usePipeline) {
          terms = this.pipeline.runString(clause.term, {
            fields: clause.fields
          });
        } else {
          terms = [clause.term];
        }

        for (var m = 0; m < terms.length; m++) {
          var term = terms[m];

          /*
           * Each term returned from the pipeline needs to use the same query
           * clause object, e.g. the same boost and or edit distance. The
           * simplest way to do this is to re-use the clause object but mutate
           * its term property.
           */
          clause.term = term;

          /*
           * From the term in the clause we create a token set which will then
           * be used to intersect the indexes token set to get a list of terms
           * to lookup in the inverted index
           */
          var termTokenSet = lunr.TokenSet.fromClause(clause),
              expandedTerms = this.tokenSet.intersect(termTokenSet).toArray();

          /*
           * If a term marked as required does not exist in the tokenSet it is
           * impossible for the search to return any matches. We set all the field
           * scoped required matches set to empty and stop examining any further
           * clauses.
           */
          if (expandedTerms.length === 0 && clause.presence === lunr.Query.presence.REQUIRED) {
            for (var k = 0; k < clause.fields.length; k++) {
              var field = clause.fields[k];
              requiredMatches[field] = lunr.Set.empty;
            }

            break
          }

          for (var j = 0; j < expandedTerms.length; j++) {
            /*
             * For each term get the posting and termIndex, this is required for
             * building the query vector.
             */
            var expandedTerm = expandedTerms[j],
                posting = this.invertedIndex[expandedTerm],
                termIndex = posting._index;

            for (var k = 0; k < clause.fields.length; k++) {
              /*
               * For each field that this query term is scoped by (by default
               * all fields are in scope) we need to get all the document refs
               * that have this term in that field.
               *
               * The posting is the entry in the invertedIndex for the matching
               * term from above.
               */
              var field = clause.fields[k],
                  fieldPosting = posting[field],
                  matchingDocumentRefs = Object.keys(fieldPosting),
                  termField = expandedTerm + "/" + field,
                  matchingDocumentsSet = new lunr.Set(matchingDocumentRefs);

              /*
               * if the presence of this term is required ensure that the matching
               * documents are added to the set of required matches for this clause.
               *
               */
              if (clause.presence == lunr.Query.presence.REQUIRED) {
                clauseMatches = clauseMatches.union(matchingDocumentsSet);

                if (requiredMatches[field] === undefined) {
                  requiredMatches[field] = lunr.Set.complete;
                }
              }

              /*
               * if the presence of this term is prohibited ensure that the matching
               * documents are added to the set of prohibited matches for this field,
               * creating that set if it does not yet exist.
               */
              if (clause.presence == lunr.Query.presence.PROHIBITED) {
                if (prohibitedMatches[field] === undefined) {
                  prohibitedMatches[field] = lunr.Set.empty;
                }

                prohibitedMatches[field] = prohibitedMatches[field].union(matchingDocumentsSet);

                /*
                 * Prohibited matches should not be part of the query vector used for
                 * similarity scoring and no metadata should be extracted so we continue
                 * to the next field
                 */
                continue
              }

              /*
               * The query field vector is populated using the termIndex found for
               * the term and a unit value with the appropriate boost applied.
               * Using upsert because there could already be an entry in the vector
               * for the term we are working with. In that case we just add the scores
               * together.
               */
              queryVectors[field].upsert(termIndex, clause.boost, function (a, b) { return a + b });

              /**
               * If we've already seen this term, field combo then we've already collected
               * the matching documents and metadata, no need to go through all that again
               */
              if (termFieldCache[termField]) {
                continue
              }

              for (var l = 0; l < matchingDocumentRefs.length; l++) {
                /*
                 * All metadata for this term/field/document triple
                 * are then extracted and collected into an instance
                 * of lunr.MatchData ready to be returned in the query
                 * results
                 */
                var matchingDocumentRef = matchingDocumentRefs[l],
                    matchingFieldRef = new lunr.FieldRef (matchingDocumentRef, field),
                    metadata = fieldPosting[matchingDocumentRef],
                    fieldMatch;

                if ((fieldMatch = matchingFields[matchingFieldRef]) === undefined) {
                  matchingFields[matchingFieldRef] = new lunr.MatchData (expandedTerm, field, metadata);
                } else {
                  fieldMatch.add(expandedTerm, field, metadata);
                }

              }

              termFieldCache[termField] = true;
            }
          }
        }

        /**
         * If the presence was required we need to update the requiredMatches field sets.
         * We do this after all fields for the term have collected their matches because
         * the clause terms presence is required in _any_ of the fields not _all_ of the
         * fields.
         */
        if (clause.presence === lunr.Query.presence.REQUIRED) {
          for (var k = 0; k < clause.fields.length; k++) {
            var field = clause.fields[k];
            requiredMatches[field] = requiredMatches[field].intersect(clauseMatches);
          }
        }
      }

      /**
       * Need to combine the field scoped required and prohibited
       * matching documents into a global set of required and prohibited
       * matches
       */
      var allRequiredMatches = lunr.Set.complete,
          allProhibitedMatches = lunr.Set.empty;

      for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];

        if (requiredMatches[field]) {
          allRequiredMatches = allRequiredMatches.intersect(requiredMatches[field]);
        }

        if (prohibitedMatches[field]) {
          allProhibitedMatches = allProhibitedMatches.union(prohibitedMatches[field]);
        }
      }

      var matchingFieldRefs = Object.keys(matchingFields),
          results = [],
          matches = Object.create(null);

      /*
       * If the query is negated (contains only prohibited terms)
       * we need to get _all_ fieldRefs currently existing in the
       * index. This is only done when we know that the query is
       * entirely prohibited terms to avoid any cost of getting all
       * fieldRefs unnecessarily.
       *
       * Additionally, blank MatchData must be created to correctly
       * populate the results.
       */
      if (query.isNegated()) {
        matchingFieldRefs = Object.keys(this.fieldVectors);

        for (var i = 0; i < matchingFieldRefs.length; i++) {
          var matchingFieldRef = matchingFieldRefs[i];
          var fieldRef = lunr.FieldRef.fromString(matchingFieldRef);
          matchingFields[matchingFieldRef] = new lunr.MatchData;
        }
      }

      for (var i = 0; i < matchingFieldRefs.length; i++) {
        /*
         * Currently we have document fields that match the query, but we
         * need to return documents. The matchData and scores are combined
         * from multiple fields belonging to the same document.
         *
         * Scores are calculated by field, using the query vectors created
         * above, and combined into a final document score using addition.
         */
        var fieldRef = lunr.FieldRef.fromString(matchingFieldRefs[i]),
            docRef = fieldRef.docRef;

        if (!allRequiredMatches.contains(docRef)) {
          continue
        }

        if (allProhibitedMatches.contains(docRef)) {
          continue
        }

        var fieldVector = this.fieldVectors[fieldRef],
            score = queryVectors[fieldRef.fieldName].similarity(fieldVector),
            docMatch;

        if ((docMatch = matches[docRef]) !== undefined) {
          docMatch.score += score;
          docMatch.matchData.combine(matchingFields[fieldRef]);
        } else {
          var match = {
            ref: docRef,
            score: score,
            matchData: matchingFields[fieldRef]
          };
          matches[docRef] = match;
          results.push(match);
        }
      }

      /*
       * Sort the results objects by score, highest first.
       */
      return results.sort(function (a, b) {
        return b.score - a.score
      })
    };

    /**
     * Prepares the index for JSON serialization.
     *
     * The schema for this JSON blob will be described in a
     * separate JSON schema file.
     *
     * @returns {Object}
     */
    lunr.Index.prototype.toJSON = function () {
      var invertedIndex = Object.keys(this.invertedIndex)
        .sort()
        .map(function (term) {
          return [term, this.invertedIndex[term]]
        }, this);

      var fieldVectors = Object.keys(this.fieldVectors)
        .map(function (ref) {
          return [ref, this.fieldVectors[ref].toJSON()]
        }, this);

      return {
        version: lunr.version,
        fields: this.fields,
        fieldVectors: fieldVectors,
        invertedIndex: invertedIndex,
        pipeline: this.pipeline.toJSON()
      }
    };

    /**
     * Loads a previously serialized lunr.Index
     *
     * @param {Object} serializedIndex - A previously serialized lunr.Index
     * @returns {lunr.Index}
     */
    lunr.Index.load = function (serializedIndex) {
      var attrs = {},
          fieldVectors = {},
          serializedVectors = serializedIndex.fieldVectors,
          invertedIndex = Object.create(null),
          serializedInvertedIndex = serializedIndex.invertedIndex,
          tokenSetBuilder = new lunr.TokenSet.Builder,
          pipeline = lunr.Pipeline.load(serializedIndex.pipeline);

      if (serializedIndex.version != lunr.version) {
        lunr.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + lunr.version + "' does not match serialized index '" + serializedIndex.version + "'");
      }

      for (var i = 0; i < serializedVectors.length; i++) {
        var tuple = serializedVectors[i],
            ref = tuple[0],
            elements = tuple[1];

        fieldVectors[ref] = new lunr.Vector(elements);
      }

      for (var i = 0; i < serializedInvertedIndex.length; i++) {
        var tuple = serializedInvertedIndex[i],
            term = tuple[0],
            posting = tuple[1];

        tokenSetBuilder.insert(term);
        invertedIndex[term] = posting;
      }

      tokenSetBuilder.finish();

      attrs.fields = serializedIndex.fields;

      attrs.fieldVectors = fieldVectors;
      attrs.invertedIndex = invertedIndex;
      attrs.tokenSet = tokenSetBuilder.root;
      attrs.pipeline = pipeline;

      return new lunr.Index(attrs)
    };
    /*!
     * lunr.Builder
     * Copyright (C) 2020 Oliver Nightingale
     */

    /**
     * lunr.Builder performs indexing on a set of documents and
     * returns instances of lunr.Index ready for querying.
     *
     * All configuration of the index is done via the builder, the
     * fields to index, the document reference, the text processing
     * pipeline and document scoring parameters are all set on the
     * builder before indexing.
     *
     * @constructor
     * @property {string} _ref - Internal reference to the document reference field.
     * @property {string[]} _fields - Internal reference to the document fields to index.
     * @property {object} invertedIndex - The inverted index maps terms to document fields.
     * @property {object} documentTermFrequencies - Keeps track of document term frequencies.
     * @property {object} documentLengths - Keeps track of the length of documents added to the index.
     * @property {lunr.tokenizer} tokenizer - Function for splitting strings into tokens for indexing.
     * @property {lunr.Pipeline} pipeline - The pipeline performs text processing on tokens before indexing.
     * @property {lunr.Pipeline} searchPipeline - A pipeline for processing search terms before querying the index.
     * @property {number} documentCount - Keeps track of the total number of documents indexed.
     * @property {number} _b - A parameter to control field length normalization, setting this to 0 disabled normalization, 1 fully normalizes field lengths, the default value is 0.75.
     * @property {number} _k1 - A parameter to control how quickly an increase in term frequency results in term frequency saturation, the default value is 1.2.
     * @property {number} termIndex - A counter incremented for each unique term, used to identify a terms position in the vector space.
     * @property {array} metadataWhitelist - A list of metadata keys that have been whitelisted for entry in the index.
     */
    lunr.Builder = function () {
      this._ref = "id";
      this._fields = Object.create(null);
      this._documents = Object.create(null);
      this.invertedIndex = Object.create(null);
      this.fieldTermFrequencies = {};
      this.fieldLengths = {};
      this.tokenizer = lunr.tokenizer;
      this.pipeline = new lunr.Pipeline;
      this.searchPipeline = new lunr.Pipeline;
      this.documentCount = 0;
      this._b = 0.75;
      this._k1 = 1.2;
      this.termIndex = 0;
      this.metadataWhitelist = [];
    };

    /**
     * Sets the document field used as the document reference. Every document must have this field.
     * The type of this field in the document should be a string, if it is not a string it will be
     * coerced into a string by calling toString.
     *
     * The default ref is 'id'.
     *
     * The ref should _not_ be changed during indexing, it should be set before any documents are
     * added to the index. Changing it during indexing can lead to inconsistent results.
     *
     * @param {string} ref - The name of the reference field in the document.
     */
    lunr.Builder.prototype.ref = function (ref) {
      this._ref = ref;
    };

    /**
     * A function that is used to extract a field from a document.
     *
     * Lunr expects a field to be at the top level of a document, if however the field
     * is deeply nested within a document an extractor function can be used to extract
     * the right field for indexing.
     *
     * @callback fieldExtractor
     * @param {object} doc - The document being added to the index.
     * @returns {?(string|object|object[])} obj - The object that will be indexed for this field.
     * @example <caption>Extracting a nested field</caption>
     * function (doc) { return doc.nested.field }
     */

    /**
     * Adds a field to the list of document fields that will be indexed. Every document being
     * indexed should have this field. Null values for this field in indexed documents will
     * not cause errors but will limit the chance of that document being retrieved by searches.
     *
     * All fields should be added before adding documents to the index. Adding fields after
     * a document has been indexed will have no effect on already indexed documents.
     *
     * Fields can be boosted at build time. This allows terms within that field to have more
     * importance when ranking search results. Use a field boost to specify that matches within
     * one field are more important than other fields.
     *
     * @param {string} fieldName - The name of a field to index in all documents.
     * @param {object} attributes - Optional attributes associated with this field.
     * @param {number} [attributes.boost=1] - Boost applied to all terms within this field.
     * @param {fieldExtractor} [attributes.extractor] - Function to extract a field from a document.
     * @throws {RangeError} fieldName cannot contain unsupported characters '/'
     */
    lunr.Builder.prototype.field = function (fieldName, attributes) {
      if (/\//.test(fieldName)) {
        throw new RangeError ("Field '" + fieldName + "' contains illegal character '/'")
      }

      this._fields[fieldName] = attributes || {};
    };

    /**
     * A parameter to tune the amount of field length normalisation that is applied when
     * calculating relevance scores. A value of 0 will completely disable any normalisation
     * and a value of 1 will fully normalise field lengths. The default is 0.75. Values of b
     * will be clamped to the range 0 - 1.
     *
     * @param {number} number - The value to set for this tuning parameter.
     */
    lunr.Builder.prototype.b = function (number) {
      if (number < 0) {
        this._b = 0;
      } else if (number > 1) {
        this._b = 1;
      } else {
        this._b = number;
      }
    };

    /**
     * A parameter that controls the speed at which a rise in term frequency results in term
     * frequency saturation. The default value is 1.2. Setting this to a higher value will give
     * slower saturation levels, a lower value will result in quicker saturation.
     *
     * @param {number} number - The value to set for this tuning parameter.
     */
    lunr.Builder.prototype.k1 = function (number) {
      this._k1 = number;
    };

    /**
     * Adds a document to the index.
     *
     * Before adding fields to the index the index should have been fully setup, with the document
     * ref and all fields to index already having been specified.
     *
     * The document must have a field name as specified by the ref (by default this is 'id') and
     * it should have all fields defined for indexing, though null or undefined values will not
     * cause errors.
     *
     * Entire documents can be boosted at build time. Applying a boost to a document indicates that
     * this document should rank higher in search results than other documents.
     *
     * @param {object} doc - The document to add to the index.
     * @param {object} attributes - Optional attributes associated with this document.
     * @param {number} [attributes.boost=1] - Boost applied to all terms within this document.
     */
    lunr.Builder.prototype.add = function (doc, attributes) {
      var docRef = doc[this._ref],
          fields = Object.keys(this._fields);

      this._documents[docRef] = attributes || {};
      this.documentCount += 1;

      for (var i = 0; i < fields.length; i++) {
        var fieldName = fields[i],
            extractor = this._fields[fieldName].extractor,
            field = extractor ? extractor(doc) : doc[fieldName],
            tokens = this.tokenizer(field, {
              fields: [fieldName]
            }),
            terms = this.pipeline.run(tokens),
            fieldRef = new lunr.FieldRef (docRef, fieldName),
            fieldTerms = Object.create(null);

        this.fieldTermFrequencies[fieldRef] = fieldTerms;
        this.fieldLengths[fieldRef] = 0;

        // store the length of this field for this document
        this.fieldLengths[fieldRef] += terms.length;

        // calculate term frequencies for this field
        for (var j = 0; j < terms.length; j++) {
          var term = terms[j];

          if (fieldTerms[term] == undefined) {
            fieldTerms[term] = 0;
          }

          fieldTerms[term] += 1;

          // add to inverted index
          // create an initial posting if one doesn't exist
          if (this.invertedIndex[term] == undefined) {
            var posting = Object.create(null);
            posting["_index"] = this.termIndex;
            this.termIndex += 1;

            for (var k = 0; k < fields.length; k++) {
              posting[fields[k]] = Object.create(null);
            }

            this.invertedIndex[term] = posting;
          }

          // add an entry for this term/fieldName/docRef to the invertedIndex
          if (this.invertedIndex[term][fieldName][docRef] == undefined) {
            this.invertedIndex[term][fieldName][docRef] = Object.create(null);
          }

          // store all whitelisted metadata about this token in the
          // inverted index
          for (var l = 0; l < this.metadataWhitelist.length; l++) {
            var metadataKey = this.metadataWhitelist[l],
                metadata = term.metadata[metadataKey];

            if (this.invertedIndex[term][fieldName][docRef][metadataKey] == undefined) {
              this.invertedIndex[term][fieldName][docRef][metadataKey] = [];
            }

            this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata);
          }
        }

      }
    };

    /**
     * Calculates the average document length for this index
     *
     * @private
     */
    lunr.Builder.prototype.calculateAverageFieldLengths = function () {

      var fieldRefs = Object.keys(this.fieldLengths),
          numberOfFields = fieldRefs.length,
          accumulator = {},
          documentsWithField = {};

      for (var i = 0; i < numberOfFields; i++) {
        var fieldRef = lunr.FieldRef.fromString(fieldRefs[i]),
            field = fieldRef.fieldName;

        documentsWithField[field] || (documentsWithField[field] = 0);
        documentsWithField[field] += 1;

        accumulator[field] || (accumulator[field] = 0);
        accumulator[field] += this.fieldLengths[fieldRef];
      }

      var fields = Object.keys(this._fields);

      for (var i = 0; i < fields.length; i++) {
        var fieldName = fields[i];
        accumulator[fieldName] = accumulator[fieldName] / documentsWithField[fieldName];
      }

      this.averageFieldLength = accumulator;
    };

    /**
     * Builds a vector space model of every document using lunr.Vector
     *
     * @private
     */
    lunr.Builder.prototype.createFieldVectors = function () {
      var fieldVectors = {},
          fieldRefs = Object.keys(this.fieldTermFrequencies),
          fieldRefsLength = fieldRefs.length,
          termIdfCache = Object.create(null);

      for (var i = 0; i < fieldRefsLength; i++) {
        var fieldRef = lunr.FieldRef.fromString(fieldRefs[i]),
            fieldName = fieldRef.fieldName,
            fieldLength = this.fieldLengths[fieldRef],
            fieldVector = new lunr.Vector,
            termFrequencies = this.fieldTermFrequencies[fieldRef],
            terms = Object.keys(termFrequencies),
            termsLength = terms.length;


        var fieldBoost = this._fields[fieldName].boost || 1,
            docBoost = this._documents[fieldRef.docRef].boost || 1;

        for (var j = 0; j < termsLength; j++) {
          var term = terms[j],
              tf = termFrequencies[term],
              termIndex = this.invertedIndex[term]._index,
              idf, score, scoreWithPrecision;

          if (termIdfCache[term] === undefined) {
            idf = lunr.idf(this.invertedIndex[term], this.documentCount);
            termIdfCache[term] = idf;
          } else {
            idf = termIdfCache[term];
          }

          score = idf * ((this._k1 + 1) * tf) / (this._k1 * (1 - this._b + this._b * (fieldLength / this.averageFieldLength[fieldName])) + tf);
          score *= fieldBoost;
          score *= docBoost;
          scoreWithPrecision = Math.round(score * 1000) / 1000;
          // Converts 1.23456789 to 1.234.
          // Reducing the precision so that the vectors take up less
          // space when serialised. Doing it now so that they behave
          // the same before and after serialisation. Also, this is
          // the fastest approach to reducing a number's precision in
          // JavaScript.

          fieldVector.insert(termIndex, scoreWithPrecision);
        }

        fieldVectors[fieldRef] = fieldVector;
      }

      this.fieldVectors = fieldVectors;
    };

    /**
     * Creates a token set of all tokens in the index using lunr.TokenSet
     *
     * @private
     */
    lunr.Builder.prototype.createTokenSet = function () {
      this.tokenSet = lunr.TokenSet.fromArray(
        Object.keys(this.invertedIndex).sort()
      );
    };

    /**
     * Builds the index, creating an instance of lunr.Index.
     *
     * This completes the indexing process and should only be called
     * once all documents have been added to the index.
     *
     * @returns {lunr.Index}
     */
    lunr.Builder.prototype.build = function () {
      this.calculateAverageFieldLengths();
      this.createFieldVectors();
      this.createTokenSet();

      return new lunr.Index({
        invertedIndex: this.invertedIndex,
        fieldVectors: this.fieldVectors,
        tokenSet: this.tokenSet,
        fields: Object.keys(this._fields),
        pipeline: this.searchPipeline
      })
    };

    /**
     * Applies a plugin to the index builder.
     *
     * A plugin is a function that is called with the index builder as its context.
     * Plugins can be used to customise or extend the behaviour of the index
     * in some way. A plugin is just a function, that encapsulated the custom
     * behaviour that should be applied when building the index.
     *
     * The plugin function will be called with the index builder as its argument, additional
     * arguments can also be passed when calling use. The function will be called
     * with the index builder as its context.
     *
     * @param {Function} plugin The plugin to apply.
     */
    lunr.Builder.prototype.use = function (fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      args.unshift(this);
      fn.apply(this, args);
    };
    /**
     * Contains and collects metadata about a matching document.
     * A single instance of lunr.MatchData is returned as part of every
     * lunr.Index~Result.
     *
     * @constructor
     * @param {string} term - The term this match data is associated with
     * @param {string} field - The field in which the term was found
     * @param {object} metadata - The metadata recorded about this term in this field
     * @property {object} metadata - A cloned collection of metadata associated with this document.
     * @see {@link lunr.Index~Result}
     */
    lunr.MatchData = function (term, field, metadata) {
      var clonedMetadata = Object.create(null),
          metadataKeys = Object.keys(metadata || {});

      // Cloning the metadata to prevent the original
      // being mutated during match data combination.
      // Metadata is kept in an array within the inverted
      // index so cloning the data can be done with
      // Array#slice
      for (var i = 0; i < metadataKeys.length; i++) {
        var key = metadataKeys[i];
        clonedMetadata[key] = metadata[key].slice();
      }

      this.metadata = Object.create(null);

      if (term !== undefined) {
        this.metadata[term] = Object.create(null);
        this.metadata[term][field] = clonedMetadata;
      }
    };

    /**
     * An instance of lunr.MatchData will be created for every term that matches a
     * document. However only one instance is required in a lunr.Index~Result. This
     * method combines metadata from another instance of lunr.MatchData with this
     * objects metadata.
     *
     * @param {lunr.MatchData} otherMatchData - Another instance of match data to merge with this one.
     * @see {@link lunr.Index~Result}
     */
    lunr.MatchData.prototype.combine = function (otherMatchData) {
      var terms = Object.keys(otherMatchData.metadata);

      for (var i = 0; i < terms.length; i++) {
        var term = terms[i],
            fields = Object.keys(otherMatchData.metadata[term]);

        if (this.metadata[term] == undefined) {
          this.metadata[term] = Object.create(null);
        }

        for (var j = 0; j < fields.length; j++) {
          var field = fields[j],
              keys = Object.keys(otherMatchData.metadata[term][field]);

          if (this.metadata[term][field] == undefined) {
            this.metadata[term][field] = Object.create(null);
          }

          for (var k = 0; k < keys.length; k++) {
            var key = keys[k];

            if (this.metadata[term][field][key] == undefined) {
              this.metadata[term][field][key] = otherMatchData.metadata[term][field][key];
            } else {
              this.metadata[term][field][key] = this.metadata[term][field][key].concat(otherMatchData.metadata[term][field][key]);
            }

          }
        }
      }
    };

    /**
     * Add metadata for a term/field pair to this instance of match data.
     *
     * @param {string} term - The term this match data is associated with
     * @param {string} field - The field in which the term was found
     * @param {object} metadata - The metadata recorded about this term in this field
     */
    lunr.MatchData.prototype.add = function (term, field, metadata) {
      if (!(term in this.metadata)) {
        this.metadata[term] = Object.create(null);
        this.metadata[term][field] = metadata;
        return
      }

      if (!(field in this.metadata[term])) {
        this.metadata[term][field] = metadata;
        return
      }

      var metadataKeys = Object.keys(metadata);

      for (var i = 0; i < metadataKeys.length; i++) {
        var key = metadataKeys[i];

        if (key in this.metadata[term][field]) {
          this.metadata[term][field][key] = this.metadata[term][field][key].concat(metadata[key]);
        } else {
          this.metadata[term][field][key] = metadata[key];
        }
      }
    };
    /**
     * A lunr.Query provides a programmatic way of defining queries to be performed
     * against a {@link lunr.Index}.
     *
     * Prefer constructing a lunr.Query using the {@link lunr.Index#query} method
     * so the query object is pre-initialized with the right index fields.
     *
     * @constructor
     * @property {lunr.Query~Clause[]} clauses - An array of query clauses.
     * @property {string[]} allFields - An array of all available fields in a lunr.Index.
     */
    lunr.Query = function (allFields) {
      this.clauses = [];
      this.allFields = allFields;
    };

    /**
     * Constants for indicating what kind of automatic wildcard insertion will be used when constructing a query clause.
     *
     * This allows wildcards to be added to the beginning and end of a term without having to manually do any string
     * concatenation.
     *
     * The wildcard constants can be bitwise combined to select both leading and trailing wildcards.
     *
     * @constant
     * @default
     * @property {number} wildcard.NONE - The term will have no wildcards inserted, this is the default behaviour
     * @property {number} wildcard.LEADING - Prepend the term with a wildcard, unless a leading wildcard already exists
     * @property {number} wildcard.TRAILING - Append a wildcard to the term, unless a trailing wildcard already exists
     * @see lunr.Query~Clause
     * @see lunr.Query#clause
     * @see lunr.Query#term
     * @example <caption>query term with trailing wildcard</caption>
     * query.term('foo', { wildcard: lunr.Query.wildcard.TRAILING })
     * @example <caption>query term with leading and trailing wildcard</caption>
     * query.term('foo', {
     *   wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING
     * })
     */

    lunr.Query.wildcard = new String ("*");
    lunr.Query.wildcard.NONE = 0;
    lunr.Query.wildcard.LEADING = 1;
    lunr.Query.wildcard.TRAILING = 2;

    /**
     * Constants for indicating what kind of presence a term must have in matching documents.
     *
     * @constant
     * @enum {number}
     * @see lunr.Query~Clause
     * @see lunr.Query#clause
     * @see lunr.Query#term
     * @example <caption>query term with required presence</caption>
     * query.term('foo', { presence: lunr.Query.presence.REQUIRED })
     */
    lunr.Query.presence = {
      /**
       * Term's presence in a document is optional, this is the default value.
       */
      OPTIONAL: 1,

      /**
       * Term's presence in a document is required, documents that do not contain
       * this term will not be returned.
       */
      REQUIRED: 2,

      /**
       * Term's presence in a document is prohibited, documents that do contain
       * this term will not be returned.
       */
      PROHIBITED: 3
    };

    /**
     * A single clause in a {@link lunr.Query} contains a term and details on how to
     * match that term against a {@link lunr.Index}.
     *
     * @typedef {Object} lunr.Query~Clause
     * @property {string[]} fields - The fields in an index this clause should be matched against.
     * @property {number} [boost=1] - Any boost that should be applied when matching this clause.
     * @property {number} [editDistance] - Whether the term should have fuzzy matching applied, and how fuzzy the match should be.
     * @property {boolean} [usePipeline] - Whether the term should be passed through the search pipeline.
     * @property {number} [wildcard=lunr.Query.wildcard.NONE] - Whether the term should have wildcards appended or prepended.
     * @property {number} [presence=lunr.Query.presence.OPTIONAL] - The terms presence in any matching documents.
     */

    /**
     * Adds a {@link lunr.Query~Clause} to this query.
     *
     * Unless the clause contains the fields to be matched all fields will be matched. In addition
     * a default boost of 1 is applied to the clause.
     *
     * @param {lunr.Query~Clause} clause - The clause to add to this query.
     * @see lunr.Query~Clause
     * @returns {lunr.Query}
     */
    lunr.Query.prototype.clause = function (clause) {
      if (!('fields' in clause)) {
        clause.fields = this.allFields;
      }

      if (!('boost' in clause)) {
        clause.boost = 1;
      }

      if (!('usePipeline' in clause)) {
        clause.usePipeline = true;
      }

      if (!('wildcard' in clause)) {
        clause.wildcard = lunr.Query.wildcard.NONE;
      }

      if ((clause.wildcard & lunr.Query.wildcard.LEADING) && (clause.term.charAt(0) != lunr.Query.wildcard)) {
        clause.term = "*" + clause.term;
      }

      if ((clause.wildcard & lunr.Query.wildcard.TRAILING) && (clause.term.slice(-1) != lunr.Query.wildcard)) {
        clause.term = "" + clause.term + "*";
      }

      if (!('presence' in clause)) {
        clause.presence = lunr.Query.presence.OPTIONAL;
      }

      this.clauses.push(clause);

      return this
    };

    /**
     * A negated query is one in which every clause has a presence of
     * prohibited. These queries require some special processing to return
     * the expected results.
     *
     * @returns boolean
     */
    lunr.Query.prototype.isNegated = function () {
      for (var i = 0; i < this.clauses.length; i++) {
        if (this.clauses[i].presence != lunr.Query.presence.PROHIBITED) {
          return false
        }
      }

      return true
    };

    /**
     * Adds a term to the current query, under the covers this will create a {@link lunr.Query~Clause}
     * to the list of clauses that make up this query.
     *
     * The term is used as is, i.e. no tokenization will be performed by this method. Instead conversion
     * to a token or token-like string should be done before calling this method.
     *
     * The term will be converted to a string by calling `toString`. Multiple terms can be passed as an
     * array, each term in the array will share the same options.
     *
     * @param {object|object[]} term - The term(s) to add to the query.
     * @param {object} [options] - Any additional properties to add to the query clause.
     * @returns {lunr.Query}
     * @see lunr.Query#clause
     * @see lunr.Query~Clause
     * @example <caption>adding a single term to a query</caption>
     * query.term("foo")
     * @example <caption>adding a single term to a query and specifying search fields, term boost and automatic trailing wildcard</caption>
     * query.term("foo", {
     *   fields: ["title"],
     *   boost: 10,
     *   wildcard: lunr.Query.wildcard.TRAILING
     * })
     * @example <caption>using lunr.tokenizer to convert a string to tokens before using them as terms</caption>
     * query.term(lunr.tokenizer("foo bar"))
     */
    lunr.Query.prototype.term = function (term, options) {
      if (Array.isArray(term)) {
        term.forEach(function (t) { this.term(t, lunr.utils.clone(options)); }, this);
        return this
      }

      var clause = options || {};
      clause.term = term.toString();

      this.clause(clause);

      return this
    };
    lunr.QueryParseError = function (message, start, end) {
      this.name = "QueryParseError";
      this.message = message;
      this.start = start;
      this.end = end;
    };

    lunr.QueryParseError.prototype = new Error;
    lunr.QueryLexer = function (str) {
      this.lexemes = [];
      this.str = str;
      this.length = str.length;
      this.pos = 0;
      this.start = 0;
      this.escapeCharPositions = [];
    };

    lunr.QueryLexer.prototype.run = function () {
      var state = lunr.QueryLexer.lexText;

      while (state) {
        state = state(this);
      }
    };

    lunr.QueryLexer.prototype.sliceString = function () {
      var subSlices = [],
          sliceStart = this.start,
          sliceEnd = this.pos;

      for (var i = 0; i < this.escapeCharPositions.length; i++) {
        sliceEnd = this.escapeCharPositions[i];
        subSlices.push(this.str.slice(sliceStart, sliceEnd));
        sliceStart = sliceEnd + 1;
      }

      subSlices.push(this.str.slice(sliceStart, this.pos));
      this.escapeCharPositions.length = 0;

      return subSlices.join('')
    };

    lunr.QueryLexer.prototype.emit = function (type) {
      this.lexemes.push({
        type: type,
        str: this.sliceString(),
        start: this.start,
        end: this.pos
      });

      this.start = this.pos;
    };

    lunr.QueryLexer.prototype.escapeCharacter = function () {
      this.escapeCharPositions.push(this.pos - 1);
      this.pos += 1;
    };

    lunr.QueryLexer.prototype.next = function () {
      if (this.pos >= this.length) {
        return lunr.QueryLexer.EOS
      }

      var char = this.str.charAt(this.pos);
      this.pos += 1;
      return char
    };

    lunr.QueryLexer.prototype.width = function () {
      return this.pos - this.start
    };

    lunr.QueryLexer.prototype.ignore = function () {
      if (this.start == this.pos) {
        this.pos += 1;
      }

      this.start = this.pos;
    };

    lunr.QueryLexer.prototype.backup = function () {
      this.pos -= 1;
    };

    lunr.QueryLexer.prototype.acceptDigitRun = function () {
      var char, charCode;

      do {
        char = this.next();
        charCode = char.charCodeAt(0);
      } while (charCode > 47 && charCode < 58)

      if (char != lunr.QueryLexer.EOS) {
        this.backup();
      }
    };

    lunr.QueryLexer.prototype.more = function () {
      return this.pos < this.length
    };

    lunr.QueryLexer.EOS = 'EOS';
    lunr.QueryLexer.FIELD = 'FIELD';
    lunr.QueryLexer.TERM = 'TERM';
    lunr.QueryLexer.EDIT_DISTANCE = 'EDIT_DISTANCE';
    lunr.QueryLexer.BOOST = 'BOOST';
    lunr.QueryLexer.PRESENCE = 'PRESENCE';

    lunr.QueryLexer.lexField = function (lexer) {
      lexer.backup();
      lexer.emit(lunr.QueryLexer.FIELD);
      lexer.ignore();
      return lunr.QueryLexer.lexText
    };

    lunr.QueryLexer.lexTerm = function (lexer) {
      if (lexer.width() > 1) {
        lexer.backup();
        lexer.emit(lunr.QueryLexer.TERM);
      }

      lexer.ignore();

      if (lexer.more()) {
        return lunr.QueryLexer.lexText
      }
    };

    lunr.QueryLexer.lexEditDistance = function (lexer) {
      lexer.ignore();
      lexer.acceptDigitRun();
      lexer.emit(lunr.QueryLexer.EDIT_DISTANCE);
      return lunr.QueryLexer.lexText
    };

    lunr.QueryLexer.lexBoost = function (lexer) {
      lexer.ignore();
      lexer.acceptDigitRun();
      lexer.emit(lunr.QueryLexer.BOOST);
      return lunr.QueryLexer.lexText
    };

    lunr.QueryLexer.lexEOS = function (lexer) {
      if (lexer.width() > 0) {
        lexer.emit(lunr.QueryLexer.TERM);
      }
    };

    // This matches the separator used when tokenising fields
    // within a document. These should match otherwise it is
    // not possible to search for some tokens within a document.
    //
    // It is possible for the user to change the separator on the
    // tokenizer so it _might_ clash with any other of the special
    // characters already used within the search string, e.g. :.
    //
    // This means that it is possible to change the separator in
    // such a way that makes some words unsearchable using a search
    // string.
    lunr.QueryLexer.termSeparator = lunr.tokenizer.separator;

    lunr.QueryLexer.lexText = function (lexer) {
      while (true) {
        var char = lexer.next();

        if (char == lunr.QueryLexer.EOS) {
          return lunr.QueryLexer.lexEOS
        }

        // Escape character is '\'
        if (char.charCodeAt(0) == 92) {
          lexer.escapeCharacter();
          continue
        }

        if (char == ":") {
          return lunr.QueryLexer.lexField
        }

        if (char == "~") {
          lexer.backup();
          if (lexer.width() > 0) {
            lexer.emit(lunr.QueryLexer.TERM);
          }
          return lunr.QueryLexer.lexEditDistance
        }

        if (char == "^") {
          lexer.backup();
          if (lexer.width() > 0) {
            lexer.emit(lunr.QueryLexer.TERM);
          }
          return lunr.QueryLexer.lexBoost
        }

        // "+" indicates term presence is required
        // checking for length to ensure that only
        // leading "+" are considered
        if (char == "+" && lexer.width() === 1) {
          lexer.emit(lunr.QueryLexer.PRESENCE);
          return lunr.QueryLexer.lexText
        }

        // "-" indicates term presence is prohibited
        // checking for length to ensure that only
        // leading "-" are considered
        if (char == "-" && lexer.width() === 1) {
          lexer.emit(lunr.QueryLexer.PRESENCE);
          return lunr.QueryLexer.lexText
        }

        if (char.match(lunr.QueryLexer.termSeparator)) {
          return lunr.QueryLexer.lexTerm
        }
      }
    };

    lunr.QueryParser = function (str, query) {
      this.lexer = new lunr.QueryLexer (str);
      this.query = query;
      this.currentClause = {};
      this.lexemeIdx = 0;
    };

    lunr.QueryParser.prototype.parse = function () {
      this.lexer.run();
      this.lexemes = this.lexer.lexemes;

      var state = lunr.QueryParser.parseClause;

      while (state) {
        state = state(this);
      }

      return this.query
    };

    lunr.QueryParser.prototype.peekLexeme = function () {
      return this.lexemes[this.lexemeIdx]
    };

    lunr.QueryParser.prototype.consumeLexeme = function () {
      var lexeme = this.peekLexeme();
      this.lexemeIdx += 1;
      return lexeme
    };

    lunr.QueryParser.prototype.nextClause = function () {
      var completedClause = this.currentClause;
      this.query.clause(completedClause);
      this.currentClause = {};
    };

    lunr.QueryParser.parseClause = function (parser) {
      var lexeme = parser.peekLexeme();

      if (lexeme == undefined) {
        return
      }

      switch (lexeme.type) {
        case lunr.QueryLexer.PRESENCE:
          return lunr.QueryParser.parsePresence
        case lunr.QueryLexer.FIELD:
          return lunr.QueryParser.parseField
        case lunr.QueryLexer.TERM:
          return lunr.QueryParser.parseTerm
        default:
          var errorMessage = "expected either a field or a term, found " + lexeme.type;

          if (lexeme.str.length >= 1) {
            errorMessage += " with value '" + lexeme.str + "'";
          }

          throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }
    };

    lunr.QueryParser.parsePresence = function (parser) {
      var lexeme = parser.consumeLexeme();

      if (lexeme == undefined) {
        return
      }

      switch (lexeme.str) {
        case "-":
          parser.currentClause.presence = lunr.Query.presence.PROHIBITED;
          break
        case "+":
          parser.currentClause.presence = lunr.Query.presence.REQUIRED;
          break
        default:
          var errorMessage = "unrecognised presence operator'" + lexeme.str + "'";
          throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }

      var nextLexeme = parser.peekLexeme();

      if (nextLexeme == undefined) {
        var errorMessage = "expecting term or field, found nothing";
        throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }

      switch (nextLexeme.type) {
        case lunr.QueryLexer.FIELD:
          return lunr.QueryParser.parseField
        case lunr.QueryLexer.TERM:
          return lunr.QueryParser.parseTerm
        default:
          var errorMessage = "expecting term or field, found '" + nextLexeme.type + "'";
          throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
      }
    };

    lunr.QueryParser.parseField = function (parser) {
      var lexeme = parser.consumeLexeme();

      if (lexeme == undefined) {
        return
      }

      if (parser.query.allFields.indexOf(lexeme.str) == -1) {
        var possibleFields = parser.query.allFields.map(function (f) { return "'" + f + "'" }).join(', '),
            errorMessage = "unrecognised field '" + lexeme.str + "', possible fields: " + possibleFields;

        throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }

      parser.currentClause.fields = [lexeme.str];

      var nextLexeme = parser.peekLexeme();

      if (nextLexeme == undefined) {
        var errorMessage = "expecting term, found nothing";
        throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }

      switch (nextLexeme.type) {
        case lunr.QueryLexer.TERM:
          return lunr.QueryParser.parseTerm
        default:
          var errorMessage = "expecting term, found '" + nextLexeme.type + "'";
          throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
      }
    };

    lunr.QueryParser.parseTerm = function (parser) {
      var lexeme = parser.consumeLexeme();

      if (lexeme == undefined) {
        return
      }

      parser.currentClause.term = lexeme.str.toLowerCase();

      if (lexeme.str.indexOf("*") != -1) {
        parser.currentClause.usePipeline = false;
      }

      var nextLexeme = parser.peekLexeme();

      if (nextLexeme == undefined) {
        parser.nextClause();
        return
      }

      switch (nextLexeme.type) {
        case lunr.QueryLexer.TERM:
          parser.nextClause();
          return lunr.QueryParser.parseTerm
        case lunr.QueryLexer.FIELD:
          parser.nextClause();
          return lunr.QueryParser.parseField
        case lunr.QueryLexer.EDIT_DISTANCE:
          return lunr.QueryParser.parseEditDistance
        case lunr.QueryLexer.BOOST:
          return lunr.QueryParser.parseBoost
        case lunr.QueryLexer.PRESENCE:
          parser.nextClause();
          return lunr.QueryParser.parsePresence
        default:
          var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
          throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
      }
    };

    lunr.QueryParser.parseEditDistance = function (parser) {
      var lexeme = parser.consumeLexeme();

      if (lexeme == undefined) {
        return
      }

      var editDistance = parseInt(lexeme.str, 10);

      if (isNaN(editDistance)) {
        var errorMessage = "edit distance must be numeric";
        throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }

      parser.currentClause.editDistance = editDistance;

      var nextLexeme = parser.peekLexeme();

      if (nextLexeme == undefined) {
        parser.nextClause();
        return
      }

      switch (nextLexeme.type) {
        case lunr.QueryLexer.TERM:
          parser.nextClause();
          return lunr.QueryParser.parseTerm
        case lunr.QueryLexer.FIELD:
          parser.nextClause();
          return lunr.QueryParser.parseField
        case lunr.QueryLexer.EDIT_DISTANCE:
          return lunr.QueryParser.parseEditDistance
        case lunr.QueryLexer.BOOST:
          return lunr.QueryParser.parseBoost
        case lunr.QueryLexer.PRESENCE:
          parser.nextClause();
          return lunr.QueryParser.parsePresence
        default:
          var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
          throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
      }
    };

    lunr.QueryParser.parseBoost = function (parser) {
      var lexeme = parser.consumeLexeme();

      if (lexeme == undefined) {
        return
      }

      var boost = parseInt(lexeme.str, 10);

      if (isNaN(boost)) {
        var errorMessage = "boost must be numeric";
        throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
      }

      parser.currentClause.boost = boost;

      var nextLexeme = parser.peekLexeme();

      if (nextLexeme == undefined) {
        parser.nextClause();
        return
      }

      switch (nextLexeme.type) {
        case lunr.QueryLexer.TERM:
          parser.nextClause();
          return lunr.QueryParser.parseTerm
        case lunr.QueryLexer.FIELD:
          parser.nextClause();
          return lunr.QueryParser.parseField
        case lunr.QueryLexer.EDIT_DISTANCE:
          return lunr.QueryParser.parseEditDistance
        case lunr.QueryLexer.BOOST:
          return lunr.QueryParser.parseBoost
        case lunr.QueryLexer.PRESENCE:
          parser.nextClause();
          return lunr.QueryParser.parsePresence
        default:
          var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
          throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
      }
    }

      /**
       * export the module via AMD, CommonJS or as a browser global
       * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
       */
      ;(function (root, factory) {
        {
          /**
           * Node. Does not work with strict CommonJS, but
           * only CommonJS-like enviroments that support module.exports,
           * like Node.
           */
          module.exports = factory();
        }
      }(this, function () {
        /**
         * Just return a value to define the module export.
         * This example returns an object, but the module
         * can return a function as the exported value.
         */
        return lunr
      }));
    })();
    });

    const people_raw = readable(new Array(), function start(set) {
        fetch('https://intranet.iit.cnr.it/map.php')
            .then(async function (response) {
                let data = await response.json();
                set( data );
            });
    });

    const pois = readable(new Map(), function start(set) {
        fetch('data/pois.json')
            .then(async function (response) {
                let data = await response.json();
                set( new Map(data.map(d => [d.id, {...d, position: {...d.position, layers: new Set(d.position.layers)}, type: 'poi'}] )) );
            });
    });

    const room_positions = writable(new Map());

    const people = derived(
        [people_raw, room_positions],
        ([$people_raw, $room_positions]) => {
            return new Map($people_raw.map(d => {
                let person = {...d, type: 'person', interno: d.telefono ? d.telefono.substring(d.telefono.length - 4) : null};
                if($room_positions.has(d.stanza)) {
                    person.position = $room_positions.get(d.stanza);
                }
                return [d.email, person]
            }))
    });

    const rooms = derived(
    	[people, room_positions, pois],
    	([$people, $room_positions, $pois]) => {
            // extract room information from the array of people
            let room_data = rollup($people.values(), v => ({id: v[0].stanza, stanza: v[0].stanza, piano: v[0].piano, edificio: v[0].edificio, ingresso: v[0].ingresso, people: v, type: 'office'}), d => d.stanza);
            
            $room_positions.forEach((d, id) => {
                if($pois.has(id)) ;
                else if(room_data.has(id)) {
                    // add a position property to each exisiting room
                    room_data.get(id).position = d;
                }
                else {
                    // add a new room
                    room_data.set(id, {id, position: d, type: 'room'});
                }
            });

            return room_data
        }
    );

    function lunr_index_map(index, m) {
        let docs = Array.from(m).map(d => d[1]);
        docs.forEach(function (doc) {
            index.add(doc);
        });
    }

    const people_index = derived(people,
    	($people) => {
            let index = lunr(function () {
                this.pipeline.remove(lunr.stemmer);
                this.searchPipeline.remove(lunr.stemmer);

                this.ref('email');
                this.field('email');
                this.field('nome');
                this.field('cognome');
                this.field('qualifica');
                this.field('interno');

                lunr_index_map(this, $people);
            });
            return index
        }
    );

    const rooms_index = derived(rooms,
    	($rooms) => {
            let index = lunr(function () {
                this.pipeline.remove(lunr.stemmer);
                this.searchPipeline.remove(lunr.stemmer);

                this.ref('id');
                this.field('id');

                lunr_index_map(this, $rooms);
            });
            return index
        }
    );

    function search(query) {
        if(query == '') {
            return []
        }

        let actual_query = query.trim().split(/\s+/).map(term => '+'+term+'*').join(' ');
        
        let resulting_people = get_store_value(people_index).search(`${actual_query}`).map(d => get_store_value(people).get(d.ref));
        let resulting_rooms = get_store_value(rooms_index).search(`${actual_query}`).map(d => get_store_value(rooms).get(d.ref));
        
        return resulting_people.concat(resulting_rooms)
    }

    function getQualifica(person) {
        return person.qualifica ? person.qualifica : 'Personale Esterno'
    }

    function getImmagine(person) {
        return `https://www.iit.cnr.it/wp-content/themes/cnr/foto_personali_400/${person.immagine.replace("'",'')}`
    }

    /* src/RoomInfo.svelte generated by Svelte v3.47.0 */

    function create_default_slot$5(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let td1;
    	let a;
    	let t1_value = /*$selection*/ ctx[0].stanza + "";
    	let t1;
    	let a_href_value;
    	let t2;
    	let tr1;
    	let td2;
    	let td3;
    	let t4_value = /*$selection*/ ctx[0].edificio + "";
    	let t4;
    	let t5;
    	let tr2;
    	let td4;
    	let td5;
    	let t7_value = /*$selection*/ ctx[0].piano + "";
    	let t7;
    	let t8;
    	let tr3;
    	let td6;
    	let td7;
    	let t10_value = /*$selection*/ ctx[0].ingresso + "";
    	let t10;

    	return {
    		c() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Stanza";
    			td1 = element("td");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Edificio";
    			td3 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "Piano";
    			td5 = element("td");
    			t7 = text(t7_value);
    			t8 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Ingresso";
    			td7 = element("td");
    			t10 = text(t10_value);
    			attr(a, "href", a_href_value = "#" + /*$selection*/ ctx[0].stanza);
    		},
    		m(target, anchor) {
    			insert(target, table, anchor);
    			append(table, tr0);
    			append(tr0, td0);
    			append(tr0, td1);
    			append(td1, a);
    			append(a, t1);
    			append(table, t2);
    			append(table, tr1);
    			append(tr1, td2);
    			append(tr1, td3);
    			append(td3, t4);
    			append(table, t5);
    			append(table, tr2);
    			append(tr2, td4);
    			append(tr2, td5);
    			append(td5, t7);
    			append(table, t8);
    			append(table, tr3);
    			append(tr3, td6);
    			append(tr3, td7);
    			append(td7, t10);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t1_value !== (t1_value = /*$selection*/ ctx[0].stanza + "")) set_data(t1, t1_value);

    			if (dirty & /*$selection*/ 1 && a_href_value !== (a_href_value = "#" + /*$selection*/ ctx[0].stanza)) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*$selection*/ 1 && t4_value !== (t4_value = /*$selection*/ ctx[0].edificio + "")) set_data(t4, t4_value);
    			if (dirty & /*$selection*/ 1 && t7_value !== (t7_value = /*$selection*/ ctx[0].piano + "")) set_data(t7, t7_value);
    			if (dirty & /*$selection*/ 1 && t10_value !== (t10_value = /*$selection*/ ctx[0].ingresso + "")) set_data(t10, t10_value);
    		},
    		d(detaching) {
    			if (detaching) detach(table);
    		}
    	};
    }

    function create_fragment$n(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(content.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const content_changes = {};

    			if (dirty & /*$$scope, $selection*/ 3) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(content, detaching);
    		}
    	};
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $selection;
    	component_subscribe($$self, selection$1, $$value => $$invalidate(0, $selection = $$value));
    	return [$selection];
    }

    class RoomInfo extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});
    	}
    }

    /* src/PersonInfo.svelte generated by Svelte v3.47.0 */

    function create_if_block_2$1(ctx) {
    	let tr;
    	let td0;
    	let td1;
    	let a;
    	let t1_value = /*$selection*/ ctx[0].telefono + "";
    	let t1;
    	let a_href_value;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Telefono";
    			td1 = element("td");
    			a = element("a");
    			t1 = text(t1_value);
    			attr(a, "href", a_href_value = "tel:" + /*$selection*/ ctx[0].telefono);
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(tr, td1);
    			append(td1, a);
    			append(a, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t1_value !== (t1_value = /*$selection*/ ctx[0].telefono + "")) set_data(t1, t1_value);

    			if (dirty & /*$selection*/ 1 && a_href_value !== (a_href_value = "tel:" + /*$selection*/ ctx[0].telefono)) {
    				attr(a, "href", a_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    		}
    	};
    }

    // (14:8) {#if $selection.interno}
    function create_if_block_1$3(ctx) {
    	let tr;
    	let td0;
    	let td1;
    	let a;
    	let t1_value = /*$selection*/ ctx[0].interno + "";
    	let t1;
    	let a_href_value;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Interno";
    			td1 = element("td");
    			a = element("a");
    			t1 = text(t1_value);
    			attr(a, "href", a_href_value = "tel:" + /*$selection*/ ctx[0].telefono);
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(tr, td1);
    			append(td1, a);
    			append(a, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t1_value !== (t1_value = /*$selection*/ ctx[0].interno + "")) set_data(t1, t1_value);

    			if (dirty & /*$selection*/ 1 && a_href_value !== (a_href_value = "tel:" + /*$selection*/ ctx[0].telefono)) {
    				attr(a, "href", a_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    		}
    	};
    }

    // (15:8) {#if $selection.cellulare}
    function create_if_block$7(ctx) {
    	let tr;
    	let td0;
    	let td1;
    	let a;
    	let t1_value = /*$selection*/ ctx[0].cellulare + "";
    	let t1;
    	let a_href_value;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Cellulare";
    			td1 = element("td");
    			a = element("a");
    			t1 = text(t1_value);
    			attr(a, "href", a_href_value = "tel:" + /*$selection*/ ctx[0].cellulare);
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(tr, td1);
    			append(td1, a);
    			append(a, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t1_value !== (t1_value = /*$selection*/ ctx[0].cellulare + "")) set_data(t1, t1_value);

    			if (dirty & /*$selection*/ 1 && a_href_value !== (a_href_value = "tel:" + /*$selection*/ ctx[0].cellulare)) {
    				attr(a, "href", a_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    		}
    	};
    }

    // (9:0) <Content>
    function create_default_slot$6(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let td1;
    	let a0;
    	let t1;
    	let a0_href_value;
    	let t2;
    	let tr1;
    	let td2;
    	let td3;
    	let a1;
    	let t4_value = /*$selection*/ ctx[0].email + "";
    	let t4;
    	let a1_href_value;
    	let t5;
    	let t6;
    	let t7;
    	let if_block0 = /*$selection*/ ctx[0].telefono && create_if_block_2$1(ctx);
    	let if_block1 = /*$selection*/ ctx[0].interno && create_if_block_1$3(ctx);
    	let if_block2 = /*$selection*/ ctx[0].cellulare && create_if_block$7(ctx);

    	return {
    		c() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "web";
    			td1 = element("td");
    			a0 = element("a");
    			t1 = text(/*web*/ ctx[1]);
    			t2 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "e-mail";
    			td3 = element("td");
    			a1 = element("a");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			if (if_block2) if_block2.c();
    			attr(a0, "href", a0_href_value = "//" + /*web*/ ctx[1]);
    			attr(a1, "href", a1_href_value = "mailto:" + /*$selection*/ ctx[0].email);
    		},
    		m(target, anchor) {
    			insert(target, table, anchor);
    			append(table, tr0);
    			append(tr0, td0);
    			append(tr0, td1);
    			append(td1, a0);
    			append(a0, t1);
    			append(table, t2);
    			append(table, tr1);
    			append(tr1, td2);
    			append(tr1, td3);
    			append(td3, a1);
    			append(a1, t4);
    			append(table, t5);
    			if (if_block0) if_block0.m(table, null);
    			append(table, t6);
    			if (if_block1) if_block1.m(table, null);
    			append(table, t7);
    			if (if_block2) if_block2.m(table, null);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t4_value !== (t4_value = /*$selection*/ ctx[0].email + "")) set_data(t4, t4_value);

    			if (dirty & /*$selection*/ 1 && a1_href_value !== (a1_href_value = "mailto:" + /*$selection*/ ctx[0].email)) {
    				attr(a1, "href", a1_href_value);
    			}

    			if (/*$selection*/ ctx[0].telefono) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(table, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$selection*/ ctx[0].interno) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(table, t7);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$selection*/ ctx[0].cellulare) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$7(ctx);
    					if_block2.c();
    					if_block2.m(table, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(table);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    function create_fragment$o(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(content.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const content_changes = {};

    			if (dirty & /*$$scope, $selection*/ 5) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(content, detaching);
    		}
    	};
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $selection;
    	component_subscribe($$self, selection$1, $$value => $$invalidate(0, $selection = $$value));
    	let web = "www.iit.cnr.it/" + $selection.email.split('@', 1);
    	return [$selection, web];
    }

    class PersonInfo extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});
    	}
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$3 = {
        LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
        LIST_ITEM_CLASS: 'mdc-list-item',
        LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
        LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
        ROOT: 'mdc-list',
    };
    var strings$4 = {
        ACTION_EVENT: 'MDCList:action',
        ARIA_CHECKED: 'aria-checked',
        ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
        ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
        ARIA_CURRENT: 'aria-current',
        ARIA_DISABLED: 'aria-disabled',
        ARIA_ORIENTATION: 'aria-orientation',
        ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
        ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
        ARIA_SELECTED: 'aria-selected',
        CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"]:not(:disabled), input[type="radio"]:not(:disabled)',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]:not(:disabled)',
        CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses$3.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$3.LIST_ITEM_CLASS + " a\n  ",
        FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses$3.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$3.LIST_ITEM_CLASS + " a,\n    ." + cssClasses$3.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses$3.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled)\n  ",
        RADIO_SELECTOR: 'input[type="radio"]:not(:disabled)',
    };
    var numbers$1 = {
        UNSET_INDEX: -1,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
    function isNumberArray$1(selectedIndex) {
        return selectedIndex instanceof Array;
    }
    var MDCListFoundation = /** @class */ (function (_super) {
        __extends(MDCListFoundation, _super);
        function MDCListFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCListFoundation.defaultAdapter, adapter)) || this;
            _this.wrapFocus_ = false;
            _this.isVertical_ = true;
            _this.isSingleSelectionList_ = false;
            _this.selectedIndex_ = numbers$1.UNSET_INDEX;
            _this.focusedItemIndex_ = numbers$1.UNSET_INDEX;
            _this.useActivatedClass_ = false;
            _this.ariaCurrentAttrValue_ = null;
            _this.isCheckboxList_ = false;
            _this.isRadioList_ = false;
            return _this;
        }
        Object.defineProperty(MDCListFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClassForElementIndex: function () { return undefined; },
                    focusItemAtIndex: function () { return undefined; },
                    getAttributeForElementIndex: function () { return null; },
                    getFocusedElementIndex: function () { return 0; },
                    getListItemCount: function () { return 0; },
                    hasCheckboxAtIndex: function () { return false; },
                    hasRadioAtIndex: function () { return false; },
                    isCheckboxCheckedAtIndex: function () { return false; },
                    isFocusInsideList: function () { return false; },
                    isRootFocused: function () { return false; },
                    notifyAction: function () { return undefined; },
                    removeClassForElementIndex: function () { return undefined; },
                    setAttributeForElementIndex: function () { return undefined; },
                    setCheckedCheckboxOrRadioAtIndex: function () { return undefined; },
                    setTabIndexForListItemChildren: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCListFoundation.prototype.layout = function () {
            if (this.adapter_.getListItemCount() === 0) {
                return;
            }
            if (this.adapter_.hasCheckboxAtIndex(0)) {
                this.isCheckboxList_ = true;
            }
            else if (this.adapter_.hasRadioAtIndex(0)) {
                this.isRadioList_ = true;
            }
        };
        /**
         * Sets the private wrapFocus_ variable.
         */
        MDCListFoundation.prototype.setWrapFocus = function (value) {
            this.wrapFocus_ = value;
        };
        /**
         * Sets the isVertical_ private variable.
         */
        MDCListFoundation.prototype.setVerticalOrientation = function (value) {
            this.isVertical_ = value;
        };
        /**
         * Sets the isSingleSelectionList_ private variable.
         */
        MDCListFoundation.prototype.setSingleSelection = function (value) {
            this.isSingleSelectionList_ = value;
        };
        /**
         * Sets the useActivatedClass_ private variable.
         */
        MDCListFoundation.prototype.setUseActivatedClass = function (useActivated) {
            this.useActivatedClass_ = useActivated;
        };
        MDCListFoundation.prototype.getSelectedIndex = function () {
            return this.selectedIndex_;
        };
        MDCListFoundation.prototype.setSelectedIndex = function (index) {
            if (!this.isIndexValid_(index)) {
                return;
            }
            if (this.isCheckboxList_) {
                this.setCheckboxAtIndex_(index);
            }
            else if (this.isRadioList_) {
                this.setRadioAtIndex_(index);
            }
            else {
                this.setSingleSelectionAtIndex_(index);
            }
        };
        /**
         * Focus in handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusIn = function (_, listItemIndex) {
            if (listItemIndex >= 0) {
                this.adapter_.setTabIndexForListItemChildren(listItemIndex, '0');
            }
        };
        /**
         * Focus out handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusOut = function (_, listItemIndex) {
            var _this = this;
            if (listItemIndex >= 0) {
                this.adapter_.setTabIndexForListItemChildren(listItemIndex, '-1');
            }
            /**
             * Between Focusout & Focusin some browsers do not have focus on any element. Setting a delay to wait till the focus
             * is moved to next element.
             */
            setTimeout(function () {
                if (!_this.adapter_.isFocusInsideList()) {
                    _this.setTabindexToFirstSelectedItem_();
                }
            }, 0);
        };
        /**
         * Key handler for the list.
         */
        MDCListFoundation.prototype.handleKeydown = function (evt, isRootListItem, listItemIndex) {
            var isArrowLeft = evt.key === 'ArrowLeft' || evt.keyCode === 37;
            var isArrowUp = evt.key === 'ArrowUp' || evt.keyCode === 38;
            var isArrowRight = evt.key === 'ArrowRight' || evt.keyCode === 39;
            var isArrowDown = evt.key === 'ArrowDown' || evt.keyCode === 40;
            var isHome = evt.key === 'Home' || evt.keyCode === 36;
            var isEnd = evt.key === 'End' || evt.keyCode === 35;
            var isEnter = evt.key === 'Enter' || evt.keyCode === 13;
            var isSpace = evt.key === 'Space' || evt.keyCode === 32;
            if (this.adapter_.isRootFocused()) {
                if (isArrowUp || isEnd) {
                    evt.preventDefault();
                    this.focusLastElement();
                }
                else if (isArrowDown || isHome) {
                    evt.preventDefault();
                    this.focusFirstElement();
                }
                return;
            }
            var currentIndex = this.adapter_.getFocusedElementIndex();
            if (currentIndex === -1) {
                currentIndex = listItemIndex;
                if (currentIndex < 0) {
                    // If this event doesn't have a mdc-list-item ancestor from the
                    // current list (not from a sublist), return early.
                    return;
                }
            }
            var nextIndex;
            if ((this.isVertical_ && isArrowDown) || (!this.isVertical_ && isArrowRight)) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusNextElement(currentIndex);
            }
            else if ((this.isVertical_ && isArrowUp) || (!this.isVertical_ && isArrowLeft)) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusPrevElement(currentIndex);
            }
            else if (isHome) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusFirstElement();
            }
            else if (isEnd) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusLastElement();
            }
            else if (isEnter || isSpace) {
                if (isRootListItem) {
                    // Return early if enter key is pressed on anchor element which triggers synthetic MouseEvent event.
                    var target = evt.target;
                    if (target && target.tagName === 'A' && isEnter) {
                        return;
                    }
                    this.preventDefaultEvent_(evt);
                    if (this.isSelectableList_()) {
                        this.setSelectedIndexOnAction_(currentIndex);
                    }
                    this.adapter_.notifyAction(currentIndex);
                }
            }
            this.focusedItemIndex_ = currentIndex;
            if (nextIndex !== undefined) {
                this.setTabindexAtIndex_(nextIndex);
                this.focusedItemIndex_ = nextIndex;
            }
        };
        /**
         * Click handler for the list.
         */
        MDCListFoundation.prototype.handleClick = function (index, toggleCheckbox) {
            if (index === numbers$1.UNSET_INDEX) {
                return;
            }
            if (this.isSelectableList_()) {
                this.setSelectedIndexOnAction_(index, toggleCheckbox);
            }
            this.adapter_.notifyAction(index);
            this.setTabindexAtIndex_(index);
            this.focusedItemIndex_ = index;
        };
        /**
         * Focuses the next element on the list.
         */
        MDCListFoundation.prototype.focusNextElement = function (index) {
            var count = this.adapter_.getListItemCount();
            var nextIndex = index + 1;
            if (nextIndex >= count) {
                if (this.wrapFocus_) {
                    nextIndex = 0;
                }
                else {
                    // Return early because last item is already focused.
                    return index;
                }
            }
            this.adapter_.focusItemAtIndex(nextIndex);
            return nextIndex;
        };
        /**
         * Focuses the previous element on the list.
         */
        MDCListFoundation.prototype.focusPrevElement = function (index) {
            var prevIndex = index - 1;
            if (prevIndex < 0) {
                if (this.wrapFocus_) {
                    prevIndex = this.adapter_.getListItemCount() - 1;
                }
                else {
                    // Return early because first item is already focused.
                    return index;
                }
            }
            this.adapter_.focusItemAtIndex(prevIndex);
            return prevIndex;
        };
        MDCListFoundation.prototype.focusFirstElement = function () {
            this.adapter_.focusItemAtIndex(0);
            return 0;
        };
        MDCListFoundation.prototype.focusLastElement = function () {
            var lastIndex = this.adapter_.getListItemCount() - 1;
            this.adapter_.focusItemAtIndex(lastIndex);
            return lastIndex;
        };
        /**
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        MDCListFoundation.prototype.setEnabled = function (itemIndex, isEnabled) {
            if (!this.isIndexValid_(itemIndex)) {
                return;
            }
            if (isEnabled) {
                this.adapter_.removeClassForElementIndex(itemIndex, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                this.adapter_.setAttributeForElementIndex(itemIndex, strings$4.ARIA_DISABLED, 'false');
            }
            else {
                this.adapter_.addClassForElementIndex(itemIndex, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                this.adapter_.setAttributeForElementIndex(itemIndex, strings$4.ARIA_DISABLED, 'true');
            }
        };
        /**
         * Ensures that preventDefault is only called if the containing element doesn't
         * consume the event, and it will cause an unintended scroll.
         */
        MDCListFoundation.prototype.preventDefaultEvent_ = function (evt) {
            var target = evt.target;
            var tagName = ("" + target.tagName).toLowerCase();
            if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
                evt.preventDefault();
            }
        };
        MDCListFoundation.prototype.setSingleSelectionAtIndex_ = function (index) {
            if (this.selectedIndex_ === index) {
                return;
            }
            var selectedClassName = cssClasses$3.LIST_ITEM_SELECTED_CLASS;
            if (this.useActivatedClass_) {
                selectedClassName = cssClasses$3.LIST_ITEM_ACTIVATED_CLASS;
            }
            if (this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                this.adapter_.removeClassForElementIndex(this.selectedIndex_, selectedClassName);
            }
            this.adapter_.addClassForElementIndex(index, selectedClassName);
            this.setAriaForSingleSelectionAtIndex_(index);
            this.selectedIndex_ = index;
        };
        /**
         * Sets aria attribute for single selection at given index.
         */
        MDCListFoundation.prototype.setAriaForSingleSelectionAtIndex_ = function (index) {
            // Detect the presence of aria-current and get the value only during list initialization when it is in unset state.
            if (this.selectedIndex_ === numbers$1.UNSET_INDEX) {
                this.ariaCurrentAttrValue_ =
                    this.adapter_.getAttributeForElementIndex(index, strings$4.ARIA_CURRENT);
            }
            var isAriaCurrent = this.ariaCurrentAttrValue_ !== null;
            var ariaAttribute = isAriaCurrent ? strings$4.ARIA_CURRENT : strings$4.ARIA_SELECTED;
            if (this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                this.adapter_.setAttributeForElementIndex(this.selectedIndex_, ariaAttribute, 'false');
            }
            var ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue_ : 'true';
            this.adapter_.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
        };
        /**
         * Toggles radio at give index. Radio doesn't change the checked state if it is already checked.
         */
        MDCListFoundation.prototype.setRadioAtIndex_ = function (index) {
            this.adapter_.setCheckedCheckboxOrRadioAtIndex(index, true);
            if (this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                this.adapter_.setAttributeForElementIndex(this.selectedIndex_, strings$4.ARIA_CHECKED, 'false');
            }
            this.adapter_.setAttributeForElementIndex(index, strings$4.ARIA_CHECKED, 'true');
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setCheckboxAtIndex_ = function (index) {
            for (var i = 0; i < this.adapter_.getListItemCount(); i++) {
                var isChecked = false;
                if (index.indexOf(i) >= 0) {
                    isChecked = true;
                }
                this.adapter_.setCheckedCheckboxOrRadioAtIndex(i, isChecked);
                this.adapter_.setAttributeForElementIndex(i, strings$4.ARIA_CHECKED, isChecked ? 'true' : 'false');
            }
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setTabindexAtIndex_ = function (index) {
            if (this.focusedItemIndex_ === numbers$1.UNSET_INDEX && index !== 0) {
                // If no list item was selected set first list item's tabindex to -1.
                // Generally, tabindex is set to 0 on first list item of list that has no preselected items.
                this.adapter_.setAttributeForElementIndex(0, 'tabindex', '-1');
            }
            else if (this.focusedItemIndex_ >= 0 && this.focusedItemIndex_ !== index) {
                this.adapter_.setAttributeForElementIndex(this.focusedItemIndex_, 'tabindex', '-1');
            }
            this.adapter_.setAttributeForElementIndex(index, 'tabindex', '0');
        };
        /**
         * @return Return true if it is single selectin list, checkbox list or radio list.
         */
        MDCListFoundation.prototype.isSelectableList_ = function () {
            return this.isSingleSelectionList_ || this.isCheckboxList_ || this.isRadioList_;
        };
        MDCListFoundation.prototype.setTabindexToFirstSelectedItem_ = function () {
            var targetIndex = 0;
            if (this.isSelectableList_()) {
                if (typeof this.selectedIndex_ === 'number' && this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                    targetIndex = this.selectedIndex_;
                }
                else if (isNumberArray$1(this.selectedIndex_) && this.selectedIndex_.length > 0) {
                    targetIndex = this.selectedIndex_.reduce(function (currentIndex, minIndex) { return Math.min(currentIndex, minIndex); });
                }
            }
            this.setTabindexAtIndex_(targetIndex);
        };
        MDCListFoundation.prototype.isIndexValid_ = function (index) {
            var _this = this;
            if (index instanceof Array) {
                if (!this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
                }
                if (index.length === 0) {
                    return true;
                }
                else {
                    return index.some(function (i) { return _this.isIndexInRange_(i); });
                }
            }
            else if (typeof index === 'number') {
                if (this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Expected array of index for checkbox based list but got number: ' + index);
                }
                return this.isIndexInRange_(index);
            }
            else {
                return false;
            }
        };
        MDCListFoundation.prototype.isIndexInRange_ = function (index) {
            var listSize = this.adapter_.getListItemCount();
            return index >= 0 && index < listSize;
        };
        MDCListFoundation.prototype.setSelectedIndexOnAction_ = function (index, toggleCheckbox) {
            if (toggleCheckbox === void 0) { toggleCheckbox = true; }
            if (this.isCheckboxList_) {
                this.toggleCheckboxAtIndex_(index, toggleCheckbox);
            }
            else {
                this.setSelectedIndex(index);
            }
        };
        MDCListFoundation.prototype.toggleCheckboxAtIndex_ = function (index, toggleCheckbox) {
            var isChecked = this.adapter_.isCheckboxCheckedAtIndex(index);
            if (toggleCheckbox) {
                isChecked = !isChecked;
                this.adapter_.setCheckedCheckboxOrRadioAtIndex(index, isChecked);
            }
            this.adapter_.setAttributeForElementIndex(index, strings$4.ARIA_CHECKED, isChecked ? 'true' : 'false');
            // If none of the checkbox items are selected and selectedIndex is not initialized then provide a default value.
            var selectedIndexes = this.selectedIndex_ === numbers$1.UNSET_INDEX ? [] : this.selectedIndex_.slice();
            if (isChecked) {
                selectedIndexes.push(index);
            }
            else {
                selectedIndexes = selectedIndexes.filter(function (i) { return i !== index; });
            }
            this.selectedIndex_ = selectedIndexes;
        };
        return MDCListFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCList = /** @class */ (function (_super) {
        __extends(MDCList, _super);
        function MDCList() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MDCList.prototype, "vertical", {
            set: function (value) {
                this.foundation_.setVerticalOrientation(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "listElements", {
            get: function () {
                return [].slice.call(this.root_.querySelectorAll("." + cssClasses$3.LIST_ITEM_CLASS));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "wrapFocus", {
            set: function (value) {
                this.foundation_.setWrapFocus(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "singleSelection", {
            set: function (isSingleSelectionList) {
                this.foundation_.setSingleSelection(isSingleSelectionList);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "selectedIndex", {
            get: function () {
                return this.foundation_.getSelectedIndex();
            },
            set: function (index) {
                this.foundation_.setSelectedIndex(index);
            },
            enumerable: true,
            configurable: true
        });
        MDCList.attachTo = function (root) {
            return new MDCList(root);
        };
        MDCList.prototype.initialSyncWithDOM = function () {
            this.handleClick_ = this.handleClickEvent_.bind(this);
            this.handleKeydown_ = this.handleKeydownEvent_.bind(this);
            this.focusInEventListener_ = this.handleFocusInEvent_.bind(this);
            this.focusOutEventListener_ = this.handleFocusOutEvent_.bind(this);
            this.listen('keydown', this.handleKeydown_);
            this.listen('click', this.handleClick_);
            this.listen('focusin', this.focusInEventListener_);
            this.listen('focusout', this.focusOutEventListener_);
            this.layout();
            this.initializeListType();
        };
        MDCList.prototype.destroy = function () {
            this.unlisten('keydown', this.handleKeydown_);
            this.unlisten('click', this.handleClick_);
            this.unlisten('focusin', this.focusInEventListener_);
            this.unlisten('focusout', this.focusOutEventListener_);
        };
        MDCList.prototype.layout = function () {
            var direction = this.root_.getAttribute(strings$4.ARIA_ORIENTATION);
            this.vertical = direction !== strings$4.ARIA_ORIENTATION_HORIZONTAL;
            // List items need to have at least tabindex=-1 to be focusable.
            [].slice.call(this.root_.querySelectorAll('.mdc-list-item:not([tabindex])'))
                .forEach(function (el) {
                el.setAttribute('tabindex', '-1');
            });
            // Child button/a elements are not tabbable until the list item is focused.
            [].slice.call(this.root_.querySelectorAll(strings$4.FOCUSABLE_CHILD_ELEMENTS))
                .forEach(function (el) { return el.setAttribute('tabindex', '-1'); });
            this.foundation_.layout();
        };
        /**
         * Initialize selectedIndex value based on pre-selected checkbox list items, single selection or radio.
         */
        MDCList.prototype.initializeListType = function () {
            var _this = this;
            var checkboxListItems = this.root_.querySelectorAll(strings$4.ARIA_ROLE_CHECKBOX_SELECTOR);
            var singleSelectedListItem = this.root_.querySelector("\n      ." + cssClasses$3.LIST_ITEM_ACTIVATED_CLASS + ",\n      ." + cssClasses$3.LIST_ITEM_SELECTED_CLASS + "\n    ");
            var radioSelectedListItem = this.root_.querySelector(strings$4.ARIA_CHECKED_RADIO_SELECTOR);
            if (checkboxListItems.length) {
                var preselectedItems = this.root_.querySelectorAll(strings$4.ARIA_CHECKED_CHECKBOX_SELECTOR);
                this.selectedIndex =
                    [].map.call(preselectedItems, function (listItem) { return _this.listElements.indexOf(listItem); });
            }
            else if (singleSelectedListItem) {
                if (singleSelectedListItem.classList.contains(cssClasses$3.LIST_ITEM_ACTIVATED_CLASS)) {
                    this.foundation_.setUseActivatedClass(true);
                }
                this.singleSelection = true;
                this.selectedIndex = this.listElements.indexOf(singleSelectedListItem);
            }
            else if (radioSelectedListItem) {
                this.selectedIndex = this.listElements.indexOf(radioSelectedListItem);
            }
        };
        /**
         * Updates the list item at itemIndex to the desired isEnabled state.
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        MDCList.prototype.setEnabled = function (itemIndex, isEnabled) {
            this.foundation_.setEnabled(itemIndex, isEnabled);
        };
        MDCList.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClassForElementIndex: function (index, className) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.classList.add(className);
                    }
                },
                focusItemAtIndex: function (index) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.focus();
                    }
                },
                getAttributeForElementIndex: function (index, attr) { return _this.listElements[index].getAttribute(attr); },
                getFocusedElementIndex: function () { return _this.listElements.indexOf(document.activeElement); },
                getListItemCount: function () { return _this.listElements.length; },
                hasCheckboxAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    return !!listItem.querySelector(strings$4.CHECKBOX_SELECTOR);
                },
                hasRadioAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    return !!listItem.querySelector(strings$4.RADIO_SELECTOR);
                },
                isCheckboxCheckedAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    var toggleEl = listItem.querySelector(strings$4.CHECKBOX_SELECTOR);
                    return toggleEl.checked;
                },
                isFocusInsideList: function () {
                    return _this.root_.contains(document.activeElement);
                },
                isRootFocused: function () { return document.activeElement === _this.root_; },
                notifyAction: function (index) {
                    _this.emit(strings$4.ACTION_EVENT, { index: index }, /** shouldBubble */ true);
                },
                removeClassForElementIndex: function (index, className) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.classList.remove(className);
                    }
                },
                setAttributeForElementIndex: function (index, attr, value) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.setAttribute(attr, value);
                    }
                },
                setCheckedCheckboxOrRadioAtIndex: function (index, isChecked) {
                    var listItem = _this.listElements[index];
                    var toggleEl = listItem.querySelector(strings$4.CHECKBOX_RADIO_SELECTOR);
                    toggleEl.checked = isChecked;
                    var event = document.createEvent('Event');
                    event.initEvent('change', true, true);
                    toggleEl.dispatchEvent(event);
                },
                setTabIndexForListItemChildren: function (listItemIndex, tabIndexValue) {
                    var element = _this.listElements[listItemIndex];
                    var listItemChildren = [].slice.call(element.querySelectorAll(strings$4.CHILD_ELEMENTS_TO_TOGGLE_TABINDEX));
                    listItemChildren.forEach(function (el) { return el.setAttribute('tabindex', tabIndexValue); });
                },
            };
            return new MDCListFoundation(adapter);
        };
        /**
         * Used to figure out which list item this event is targetting. Or returns -1 if
         * there is no list item
         */
        MDCList.prototype.getListItemIndex_ = function (evt) {
            var eventTarget = evt.target;
            var nearestParent = closest(eventTarget, "." + cssClasses$3.LIST_ITEM_CLASS + ", ." + cssClasses$3.ROOT);
            // Get the index of the element if it is a list item.
            if (nearestParent && matches(nearestParent, "." + cssClasses$3.LIST_ITEM_CLASS)) {
                return this.listElements.indexOf(nearestParent);
            }
            return -1;
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleFocusInEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            this.foundation_.handleFocusIn(evt, index);
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleFocusOutEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            this.foundation_.handleFocusOut(evt, index);
        };
        /**
         * Used to figure out which element was focused when keydown event occurred before sending the event to the
         * foundation.
         */
        MDCList.prototype.handleKeydownEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            var target = evt.target;
            this.foundation_.handleKeydown(evt, target.classList.contains(cssClasses$3.LIST_ITEM_CLASS), index);
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleClickEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            var target = evt.target;
            // Toggle the checkbox only if it's not the target of the event, or the checkbox will have 2 change events.
            var toggleCheckbox = !matches(target, strings$4.CHECKBOX_RADIO_SELECTOR);
            this.foundation_.handleClick(index, toggleCheckbox);
        };
        return MDCList;
    }(MDCComponent));

    /* node_modules/@smui/list/List.svelte generated by Svelte v3.47.0 */

    function create_else_block$2(ctx) {
    	let ul;
    	let ul_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[24].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[23], null);

    	let ul_levels = [
    		{
    			class: ul_class_value = "mdc-list " + /*className*/ ctx[1] + " " + (/*nonInteractive*/ ctx[2]
    			? 'mdc-list--non-interactive'
    			: '') + " " + (/*dense*/ ctx[3] ? 'mdc-list--dense' : '') + " " + (/*avatarList*/ ctx[4] ? 'mdc-list--avatar-list' : '') + " " + (/*twoLine*/ ctx[5] ? 'mdc-list--two-line' : '') + " " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    			? 'smui-list--three-line'
    			: '') + ""
    		},
    		{ role: /*role*/ ctx[8] },
    		/*props*/ ctx[9]
    	];

    	let ul_data = {};

    	for (let i = 0; i < ul_levels.length; i += 1) {
    		ul_data = assign(ul_data, ul_levels[i]);
    	}

    	return {
    		c() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			set_attributes(ul, ul_data);
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			/*ul_binding*/ ctx[26](ul);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, ul, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[10].call(null, ul)),
    					listen(ul, "MDCList:action", /*handleAction*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[23],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[23])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[23], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(ul, ul_data = get_spread_update(ul_levels, [
    				(!current || dirty[0] & /*className, nonInteractive, dense, avatarList, twoLine, threeLine*/ 126 && ul_class_value !== (ul_class_value = "mdc-list " + /*className*/ ctx[1] + " " + (/*nonInteractive*/ ctx[2]
    				? 'mdc-list--non-interactive'
    				: '') + " " + (/*dense*/ ctx[3] ? 'mdc-list--dense' : '') + " " + (/*avatarList*/ ctx[4] ? 'mdc-list--avatar-list' : '') + " " + (/*twoLine*/ ctx[5] ? 'mdc-list--two-line' : '') + " " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    				? 'smui-list--three-line'
    				: '') + "")) && { class: ul_class_value },
    				(!current || dirty[0] & /*role*/ 256) && { role: /*role*/ ctx[8] },
    				dirty[0] & /*props*/ 512 && /*props*/ ctx[9]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_binding*/ ctx[26](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (1:0) {#if nav}
    function create_if_block$8(ctx) {
    	let nav_1;
    	let nav_1_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[24].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[23], null);

    	let nav_1_levels = [
    		{
    			class: nav_1_class_value = "mdc-list " + /*className*/ ctx[1] + " " + (/*nonInteractive*/ ctx[2]
    			? 'mdc-list--non-interactive'
    			: '') + " " + (/*dense*/ ctx[3] ? 'mdc-list--dense' : '') + " " + (/*avatarList*/ ctx[4] ? 'mdc-list--avatar-list' : '') + " " + (/*twoLine*/ ctx[5] ? 'mdc-list--two-line' : '') + " " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    			? 'smui-list--three-line'
    			: '') + ""
    		},
    		/*props*/ ctx[9]
    	];

    	let nav_1_data = {};

    	for (let i = 0; i < nav_1_levels.length; i += 1) {
    		nav_1_data = assign(nav_1_data, nav_1_levels[i]);
    	}

    	return {
    		c() {
    			nav_1 = element("nav");
    			if (default_slot) default_slot.c();
    			set_attributes(nav_1, nav_1_data);
    		},
    		m(target, anchor) {
    			insert(target, nav_1, anchor);

    			if (default_slot) {
    				default_slot.m(nav_1, null);
    			}

    			/*nav_1_binding*/ ctx[25](nav_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, nav_1, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[10].call(null, nav_1)),
    					listen(nav_1, "MDCList:action", /*handleAction*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[23],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[23])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[23], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(nav_1, nav_1_data = get_spread_update(nav_1_levels, [
    				(!current || dirty[0] & /*className, nonInteractive, dense, avatarList, twoLine, threeLine*/ 126 && nav_1_class_value !== (nav_1_class_value = "mdc-list " + /*className*/ ctx[1] + " " + (/*nonInteractive*/ ctx[2]
    				? 'mdc-list--non-interactive'
    				: '') + " " + (/*dense*/ ctx[3] ? 'mdc-list--dense' : '') + " " + (/*avatarList*/ ctx[4] ? 'mdc-list--avatar-list' : '') + " " + (/*twoLine*/ ctx[5] ? 'mdc-list--two-line' : '') + " " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    				? 'smui-list--three-line'
    				: '') + "")) && { class: nav_1_class_value },
    				dirty[0] & /*props*/ 512 && /*props*/ ctx[9]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(nav_1);
    			if (default_slot) default_slot.d(detaching);
    			/*nav_1_binding*/ ctx[25](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$p(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nav*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ['MDCList:action']);
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { nonInteractive = false } = $$props;
    	let { dense = false } = $$props;
    	let { avatarList = false } = $$props;
    	let { twoLine = false } = $$props;
    	let { threeLine = false } = $$props;
    	let { vertical = true } = $$props;
    	let { wrapFocus = false } = $$props;
    	let { singleSelection = false } = $$props;
    	let { selectedIndex = null } = $$props;
    	let { radiolist = false } = $$props;
    	let { checklist = false } = $$props;
    	let element;
    	let list;
    	let role = getContext('SMUI:list:role');
    	let nav = getContext('SMUI:list:nav');
    	let instantiate = getContext('SMUI:list:instantiate');
    	let getInstance = getContext('SMUI:list:getInstance');
    	let addLayoutListener = getContext('SMUI:addLayoutListener');
    	let removeLayoutListener;
    	setContext('SMUI:list:nonInteractive', nonInteractive);

    	if (!role) {
    		if (singleSelection) {
    			role = 'listbox';
    			setContext('SMUI:list:item:role', 'option');
    		} else if (radiolist) {
    			role = 'radiogroup';
    			setContext('SMUI:list:item:role', 'radio');
    		} else if (checklist) {
    			role = 'group';
    			setContext('SMUI:list:item:role', 'checkbox');
    		} else {
    			role = 'list';
    			setContext('SMUI:list:item:role', undefined);
    		}
    	}

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(async () => {
    		if (instantiate !== false) {
    			$$invalidate(22, list = new MDCList(element));
    		} else {
    			$$invalidate(22, list = await getInstance());
    		}

    		if (singleSelection) {
    			list.initializeListType();
    			$$invalidate(13, selectedIndex = list.selectedIndex);
    		}
    	});

    	onDestroy(() => {
    		if (instantiate !== false) {
    			list && list.destroy();
    		}

    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function handleAction(e) {
    		if (list && list.listElements[e.detail.index].classList.contains('mdc-list-item--disabled')) {
    			e.preventDefault();
    			$$invalidate(22, list.selectedIndex = selectedIndex, list);
    		} else if (list && list.selectedIndex === e.detail.index) {
    			$$invalidate(13, selectedIndex = e.detail.index);
    		}
    	}

    	function layout(...args) {
    		return list.layout(...args);
    	}

    	function setEnabled(...args) {
    		return list.setEnabled(...args);
    	}

    	function getDefaultFoundation(...args) {
    		return list.getDefaultFoundation(...args);
    	}

    	function nav_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(31, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('nonInteractive' in $$new_props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ('dense' in $$new_props) $$invalidate(3, dense = $$new_props.dense);
    		if ('avatarList' in $$new_props) $$invalidate(4, avatarList = $$new_props.avatarList);
    		if ('twoLine' in $$new_props) $$invalidate(5, twoLine = $$new_props.twoLine);
    		if ('threeLine' in $$new_props) $$invalidate(6, threeLine = $$new_props.threeLine);
    		if ('vertical' in $$new_props) $$invalidate(14, vertical = $$new_props.vertical);
    		if ('wrapFocus' in $$new_props) $$invalidate(15, wrapFocus = $$new_props.wrapFocus);
    		if ('singleSelection' in $$new_props) $$invalidate(16, singleSelection = $$new_props.singleSelection);
    		if ('selectedIndex' in $$new_props) $$invalidate(13, selectedIndex = $$new_props.selectedIndex);
    		if ('radiolist' in $$new_props) $$invalidate(17, radiolist = $$new_props.radiolist);
    		if ('checklist' in $$new_props) $$invalidate(18, checklist = $$new_props.checklist);
    		if ('$$scope' in $$new_props) $$invalidate(23, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		 $$invalidate(9, props = exclude($$props, [
    			'use',
    			'class',
    			'nonInteractive',
    			'dense',
    			'avatarList',
    			'twoLine',
    			'threeLine',
    			'vertical',
    			'wrapFocus',
    			'singleSelection',
    			'selectedIndex',
    			'radiolist',
    			'checklist'
    		]));

    		if ($$self.$$.dirty[0] & /*list, vertical*/ 4210688) {
    			 if (list && list.vertical !== vertical) {
    				$$invalidate(22, list.vertical = vertical, list);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*list, wrapFocus*/ 4227072) {
    			 if (list && list.wrapFocus !== wrapFocus) {
    				$$invalidate(22, list.wrapFocus = wrapFocus, list);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*list, singleSelection*/ 4259840) {
    			 if (list && list.singleSelection !== singleSelection) {
    				$$invalidate(22, list.singleSelection = singleSelection, list);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*list, singleSelection, selectedIndex*/ 4268032) {
    			 if (list && singleSelection && list.selectedIndex !== selectedIndex) {
    				$$invalidate(22, list.selectedIndex = selectedIndex, list);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		nonInteractive,
    		dense,
    		avatarList,
    		twoLine,
    		threeLine,
    		element,
    		role,
    		props,
    		forwardEvents,
    		nav,
    		handleAction,
    		selectedIndex,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		radiolist,
    		checklist,
    		layout,
    		setEnabled,
    		getDefaultFoundation,
    		list,
    		$$scope,
    		slots,
    		nav_1_binding,
    		ul_binding
    	];
    }

    class List extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$p,
    			create_fragment$p,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				nonInteractive: 2,
    				dense: 3,
    				avatarList: 4,
    				twoLine: 5,
    				threeLine: 6,
    				vertical: 14,
    				wrapFocus: 15,
    				singleSelection: 16,
    				selectedIndex: 13,
    				radiolist: 17,
    				checklist: 18,
    				layout: 19,
    				setEnabled: 20,
    				getDefaultFoundation: 21
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get layout() {
    		return this.$$.ctx[19];
    	}

    	get setEnabled() {
    		return this.$$.ctx[20];
    	}

    	get getDefaultFoundation() {
    		return this.$$.ctx[21];
    	}
    }

    /* node_modules/@smui/list/Item.svelte generated by Svelte v3.47.0 */

    function create_else_block$3(ctx) {
    	let li;
    	let li_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	let li_levels = [
    		{
    			class: li_class_value = "mdc-list-item " + /*className*/ ctx[2] + " " + (/*activated*/ ctx[5] ? 'mdc-list-item--activated' : '') + " " + (/*selected*/ ctx[7] ? 'mdc-list-item--selected' : '') + " " + (/*disabled*/ ctx[8] ? 'mdc-list-item--disabled' : '') + " " + (/*role*/ ctx[6] === 'menuitem' && /*selected*/ ctx[7]
    			? 'mdc-menu-item--selected'
    			: '') + ""
    		},
    		{ role: /*role*/ ctx[6] },
    		/*role*/ ctx[6] === 'option'
    		? {
    				'aria-selected': /*selected*/ ctx[7] ? 'true' : 'false'
    			}
    		: {},
    		/*role*/ ctx[6] === 'radio' || /*role*/ ctx[6] === 'checkbox'
    		? {
    				'aria-checked': /*checked*/ ctx[10] ? 'true' : 'false'
    			}
    		: {},
    		{ tabindex: /*tabindex*/ ctx[0] },
    		/*props*/ ctx[12]
    	];

    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	return {
    		c() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			set_attributes(li, li_data);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[23](li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, li, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[13].call(null, li)),
    					action_destroyer(Ripple_action = Ripple.call(null, li, {
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4]
    					})),
    					listen(li, "click", /*action*/ ctx[15]),
    					listen(li, "keydown", /*handleKeydown*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [
    				(!current || dirty & /*className, activated, selected, disabled, role*/ 484 && li_class_value !== (li_class_value = "mdc-list-item " + /*className*/ ctx[2] + " " + (/*activated*/ ctx[5] ? 'mdc-list-item--activated' : '') + " " + (/*selected*/ ctx[7] ? 'mdc-list-item--selected' : '') + " " + (/*disabled*/ ctx[8] ? 'mdc-list-item--disabled' : '') + " " + (/*role*/ ctx[6] === 'menuitem' && /*selected*/ ctx[7]
    				? 'mdc-menu-item--selected'
    				: '') + "")) && { class: li_class_value },
    				(!current || dirty & /*role*/ 64) && { role: /*role*/ ctx[6] },
    				dirty & /*role, selected*/ 192 && (/*role*/ ctx[6] === 'option'
    				? {
    						'aria-selected': /*selected*/ ctx[7] ? 'true' : 'false'
    					}
    				: {}),
    				dirty & /*role, checked*/ 1088 && (/*role*/ ctx[6] === 'radio' || /*role*/ ctx[6] === 'checkbox'
    				? {
    						'aria-checked': /*checked*/ ctx[10] ? 'true' : 'false'
    					}
    				: {}),
    				(!current || dirty & /*tabindex*/ 1) && { tabindex: /*tabindex*/ ctx[0] },
    				dirty & /*props*/ 4096 && /*props*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, color*/ 24) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3],
    				unbounded: false,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (21:23) 
    function create_if_block_1$4(ctx) {
    	let span;
    	let span_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	let span_levels = [
    		{
    			class: span_class_value = "mdc-list-item " + /*className*/ ctx[2] + " " + (/*activated*/ ctx[5] ? 'mdc-list-item--activated' : '') + " " + (/*selected*/ ctx[7] ? 'mdc-list-item--selected' : '') + " " + (/*disabled*/ ctx[8] ? 'mdc-list-item--disabled' : '') + ""
    		},
    		/*activated*/ ctx[5] ? { 'aria-current': 'page' } : {},
    		{ tabindex: /*tabindex*/ ctx[0] },
    		/*props*/ ctx[12]
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	return {
    		c() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[22](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[13].call(null, span)),
    					action_destroyer(Ripple_action = Ripple.call(null, span, {
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4]
    					})),
    					listen(span, "click", /*action*/ ctx[15]),
    					listen(span, "keydown", /*handleKeydown*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*className, activated, selected, disabled*/ 420 && span_class_value !== (span_class_value = "mdc-list-item " + /*className*/ ctx[2] + " " + (/*activated*/ ctx[5] ? 'mdc-list-item--activated' : '') + " " + (/*selected*/ ctx[7] ? 'mdc-list-item--selected' : '') + " " + (/*disabled*/ ctx[8] ? 'mdc-list-item--disabled' : '') + "")) && { class: span_class_value },
    				dirty & /*activated*/ 32 && (/*activated*/ ctx[5] ? { 'aria-current': 'page' } : {}),
    				(!current || dirty & /*tabindex*/ 1) && { tabindex: /*tabindex*/ ctx[0] },
    				dirty & /*props*/ 4096 && /*props*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, color*/ 24) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3],
    				unbounded: false,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (1:0) {#if nav && href}
    function create_if_block$9(ctx) {
    	let a;
    	let a_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	let a_levels = [
    		{
    			class: a_class_value = "mdc-list-item " + /*className*/ ctx[2] + " " + (/*activated*/ ctx[5] ? 'mdc-list-item--activated' : '') + " " + (/*selected*/ ctx[7] ? 'mdc-list-item--selected' : '') + " " + (/*disabled*/ ctx[8] ? 'mdc-list-item--disabled' : '') + ""
    		},
    		{ href: /*href*/ ctx[9] },
    		/*activated*/ ctx[5] ? { 'aria-current': 'page' } : {},
    		{ tabindex: /*tabindex*/ ctx[0] },
    		/*props*/ ctx[12]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[21](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[13].call(null, a)),
    					action_destroyer(Ripple_action = Ripple.call(null, a, {
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4]
    					})),
    					listen(a, "click", /*action*/ ctx[15]),
    					listen(a, "keydown", /*handleKeydown*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*className, activated, selected, disabled*/ 420 && a_class_value !== (a_class_value = "mdc-list-item " + /*className*/ ctx[2] + " " + (/*activated*/ ctx[5] ? 'mdc-list-item--activated' : '') + " " + (/*selected*/ ctx[7] ? 'mdc-list-item--selected' : '') + " " + (/*disabled*/ ctx[8] ? 'mdc-list-item--disabled' : '') + "")) && { class: a_class_value },
    				(!current || dirty & /*href*/ 512) && { href: /*href*/ ctx[9] },
    				dirty & /*activated*/ 32 && (/*activated*/ ctx[5] ? { 'aria-current': 'page' } : {}),
    				(!current || dirty & /*tabindex*/ 1) && { tabindex: /*tabindex*/ ctx[0] },
    				dirty & /*props*/ 4096 && /*props*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, color*/ 24) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3],
    				unbounded: false,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$q(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$9, create_if_block_1$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nav*/ ctx[14] && /*href*/ ctx[9]) return 0;
    		if (/*nav*/ ctx[14] && !/*href*/ ctx[9]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    let counter = 0;

    function instance$q($$self, $$props, $$invalidate) {
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const dispatch = createEventDispatcher();
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let checked = false;
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { ripple = true } = $$props;
    	let { color = null } = $$props;
    	let { nonInteractive = getContext('SMUI:list:nonInteractive') } = $$props;
    	let { activated = false } = $$props;
    	let { role = getContext('SMUI:list:item:role') } = $$props;
    	let { selected = false } = $$props;
    	let { disabled = false } = $$props;
    	let { tabindex = !nonInteractive && !disabled && (selected || checked) && '0' || '-1' } = $$props;
    	let { href = false } = $$props;
    	let { inputId = 'SMUI-form-field-list-' + counter++ } = $$props;
    	let element;
    	let addTabindexIfNoItemsSelectedRaf;
    	let nav = getContext('SMUI:list:item:nav');
    	setContext('SMUI:generic:input:props', { id: inputId });
    	setContext('SMUI:generic:input:setChecked', setChecked);

    	onMount(() => {
    		// Tabindex needs to be '0' if this is the first non-disabled list item, and
    		// no other item is selected.
    		if (!selected && !nonInteractive) {
    			let first = true;
    			let el = element;

    			while (el.previousSibling) {
    				el = el.previousSibling;

    				if (el.nodeType === 1 && el.classList.contains('mdc-list-item') && !el.classList.contains('mdc-list-item--disabled')) {
    					first = false;
    					break;
    				}
    			}

    			if (first) {
    				// This is first, so now set up a check that no other items are
    				// selected.
    				addTabindexIfNoItemsSelectedRaf = window.requestAnimationFrame(addTabindexIfNoItemsSelected);
    			}
    		}
    	});

    	onDestroy(() => {
    		if (addTabindexIfNoItemsSelectedRaf) {
    			window.cancelAnimationFrame(addTabindexIfNoItemsSelectedRaf);
    		}
    	});

    	function addTabindexIfNoItemsSelected() {
    		// Look through next siblings to see if none of them are selected.
    		let noneSelected = true;

    		let el = element;

    		while (el.nextSibling) {
    			el = el.nextSibling;

    			if (el.nodeType === 1 && el.classList.contains('mdc-list-item') && el.attributes['tabindex'] && el.attributes['tabindex'].value === '0') {
    				noneSelected = false;
    				break;
    			}
    		}

    		if (noneSelected) {
    			// This is the first element, and no other element is selected, so the
    			// tabindex should be '0'.
    			$$invalidate(0, tabindex = '0');
    		}
    	}

    	function action(e) {
    		if (disabled) {
    			e.preventDefault();
    		} else {
    			dispatch('SMUI:action', e);
    		}
    	}

    	function handleKeydown(e) {
    		const isEnter = e.key === 'Enter' || e.keyCode === 13;
    		const isSpace = e.key === 'Space' || e.keyCode === 32;

    		if (isEnter || isSpace) {
    			action(e);
    		}
    	}

    	function setChecked(isChecked) {
    		$$invalidate(10, checked = isChecked);
    		$$invalidate(0, tabindex = !nonInteractive && !disabled && (selected || checked) && '0' || '-1');
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(11, element);
    		});
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(11, element);
    		});
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(11, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(28, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('ripple' in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('nonInteractive' in $$new_props) $$invalidate(17, nonInteractive = $$new_props.nonInteractive);
    		if ('activated' in $$new_props) $$invalidate(5, activated = $$new_props.activated);
    		if ('role' in $$new_props) $$invalidate(6, role = $$new_props.role);
    		if ('selected' in $$new_props) $$invalidate(7, selected = $$new_props.selected);
    		if ('disabled' in $$new_props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ('tabindex' in $$new_props) $$invalidate(0, tabindex = $$new_props.tabindex);
    		if ('href' in $$new_props) $$invalidate(9, href = $$new_props.href);
    		if ('inputId' in $$new_props) $$invalidate(18, inputId = $$new_props.inputId);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		 $$invalidate(12, props = exclude($$props, [
    			'use',
    			'class',
    			'ripple',
    			'color',
    			'nonInteractive',
    			'activated',
    			'selected',
    			'disabled',
    			'tabindex',
    			'href',
    			'inputId'
    		]));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		tabindex,
    		use,
    		className,
    		ripple,
    		color,
    		activated,
    		role,
    		selected,
    		disabled,
    		href,
    		checked,
    		element,
    		props,
    		forwardEvents,
    		nav,
    		action,
    		handleKeydown,
    		nonInteractive,
    		inputId,
    		$$scope,
    		slots,
    		a_binding,
    		span_binding,
    		li_binding
    	];
    }

    class Item extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			use: 1,
    			class: 2,
    			ripple: 3,
    			color: 4,
    			nonInteractive: 17,
    			activated: 5,
    			role: 6,
    			selected: 7,
    			disabled: 8,
    			tabindex: 0,
    			href: 9,
    			inputId: 18
    		});
    	}
    }

    /* node_modules/@smui/common/Span.svelte generated by Svelte v3.47.0 */

    function create_fragment$r(ctx) {
    	let span;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let span_levels = [exclude(/*$$props*/ ctx[2], ['use'])];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	return {
    		c() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ['use'])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class Span extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { use: 0 });
    	}
    }

    var Text = classAdderBuilder({
      class: 'mdc-list-item__text',
      component: Span,
      contexts: {}
    });

    var PrimaryText = classAdderBuilder({
      class: 'mdc-list-item__primary-text',
      component: Span,
      contexts: {}
    });

    var SecondaryText = classAdderBuilder({
      class: 'mdc-list-item__secondary-text',
      component: Span,
      contexts: {}
    });

    var Graphic = classAdderBuilder({
      class: 'mdc-list-item__graphic',
      component: Span,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-list-item__meta',
      component: Span,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-list-group',
      component: Div,
      contexts: {}
    });

    /* node_modules/@smui/common/H3.svelte generated by Svelte v3.47.0 */

    function create_fragment$s(ctx) {
    	let h3;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h3_levels = [exclude(/*$$props*/ ctx[2], ['use'])];
    	let h3_data = {};

    	for (let i = 0; i < h3_levels.length; i += 1) {
    		h3_data = assign(h3_data, h3_levels[i]);
    	}

    	return {
    		c() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			set_attributes(h3, h3_data);
    		},
    		m(target, anchor) {
    			insert(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h3, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, h3))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h3, h3_data = get_spread_update(h3_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ['use'])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h3);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class H3 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { use: 0 });
    	}
    }

    classAdderBuilder({
      class: 'mdc-list-group__subheader',
      component: H3,
      contexts: {}
    });

    /* src/RoomPeopleList.svelte generated by Svelte v3.47.0 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (21:20) <PrimaryText>
    function create_default_slot_4(ctx) {
    	let t0_value = /*person*/ ctx[1].nome + "";
    	let t0;
    	let t1;
    	let t2_value = /*person*/ ctx[1].cognome + "";
    	let t2;

    	return {
    		c() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t0_value !== (t0_value = /*person*/ ctx[1].nome + "")) set_data(t0, t0_value);
    			if (dirty & /*$selection*/ 1 && t2_value !== (t2_value = /*person*/ ctx[1].cognome + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    		}
    	};
    }

    // (22:20) <SecondaryText>
    function create_default_slot_3$1(ctx) {
    	let t_value = getQualifica(/*person*/ ctx[1]) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 1 && t_value !== (t_value = getQualifica(/*person*/ ctx[1]) + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (20:16) <Text>
    function create_default_slot_2$1(ctx) {
    	let primarytext;
    	let t;
    	let secondarytext;
    	let current;

    	primarytext = new PrimaryText({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			}
    		});

    	secondarytext = new SecondaryText({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(primarytext.$$.fragment);
    			t = space();
    			create_component(secondarytext.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(primarytext, target, anchor);
    			insert(target, t, anchor);
    			mount_component(secondarytext, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const primarytext_changes = {};

    			if (dirty & /*$$scope, $selection*/ 17) {
    				primarytext_changes.$$scope = { dirty, ctx };
    			}

    			primarytext.$set(primarytext_changes);
    			const secondarytext_changes = {};

    			if (dirty & /*$$scope, $selection*/ 17) {
    				secondarytext_changes.$$scope = { dirty, ctx };
    			}

    			secondarytext.$set(secondarytext_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(primarytext.$$.fragment, local);
    			transition_in(secondarytext.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(primarytext.$$.fragment, local);
    			transition_out(secondarytext.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(primarytext, detaching);
    			if (detaching) detach(t);
    			destroy_component(secondarytext, detaching);
    		}
    	};
    }

    // (18:12) <Item>
    function create_default_slot_1$2(ctx) {
    	let graphic;
    	let t;
    	let text_1;
    	let current;

    	graphic = new Graphic({
    			props: {
    				style: "background: url(" + getImmagine(/*person*/ ctx[1]) + "), url(assets/default_person.png), rgb(245,245,245); background-position-x: center!important; background-size: cover!important; background-repeat: no-repeat!important;"
    			}
    		});

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(graphic.$$.fragment);
    			t = space();
    			create_component(text_1.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(graphic, target, anchor);
    			insert(target, t, anchor);
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const graphic_changes = {};
    			if (dirty & /*$selection*/ 1) graphic_changes.style = "background: url(" + getImmagine(/*person*/ ctx[1]) + "), url(assets/default_person.png), rgb(245,245,245); background-position-x: center!important; background-size: cover!important; background-repeat: no-repeat!important;";
    			graphic.$set(graphic_changes);
    			const text_1_changes = {};

    			if (dirty & /*$$scope, $selection*/ 17) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(graphic.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(graphic.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(graphic, detaching);
    			if (detaching) detach(t);
    			destroy_component(text_1, detaching);
    		}
    	};
    }

    // (16:1) {#each $selection.people as person}
    function create_each_block$3(ctx) {
    	let a;
    	let item;
    	let t;
    	let a_href_value;
    	let current;

    	item = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			a = element("a");
    			create_component(item.$$.fragment);
    			t = space();
    			attr(a, "href", a_href_value = "#" + /*person*/ ctx[1].email);
    			attr(a, "class", "svelte-1pwmqc0");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			mount_component(item, a, null);
    			append(a, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const item_changes = {};

    			if (dirty & /*$$scope, $selection*/ 17) {
    				item_changes.$$scope = { dirty, ctx };
    			}

    			item.$set(item_changes);

    			if (!current || dirty & /*$selection*/ 1 && a_href_value !== (a_href_value = "#" + /*person*/ ctx[1].email)) {
    				attr(a, "href", a_href_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			destroy_component(item);
    		}
    	};
    }

    // (15:0) <List twoLine avatarList singleSelection>
    function create_default_slot$7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$selection*/ ctx[0].people;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection, getQualifica, getImmagine*/ 1) {
    				each_value = /*$selection*/ ctx[0].people;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function create_fragment$t(ctx) {
    	let list;
    	let current;

    	list = new List({
    			props: {
    				twoLine: true,
    				avatarList: true,
    				singleSelection: true,
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(list.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const list_changes = {};

    			if (dirty & /*$$scope, $selection*/ 17) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(list, detaching);
    		}
    	};
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let $selection;
    	component_subscribe($$self, selection$1, $$value => $$invalidate(0, $selection = $$value));
    	return [$selection];
    }

    class RoomPeopleList extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});
    	}
    }

    /* src/CNRResults.svelte generated by Svelte v3.47.0 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (35:35) 
    function create_if_block_2$2(ctx) {
    	let item;
    	let current;

    	function SMUI_action_handler_2() {
    		return /*SMUI_action_handler_2*/ ctx[5](/*r*/ ctx[8]);
    	}

    	function mouseenter_handler_1() {
    		return /*mouseenter_handler_1*/ ctx[6](/*r*/ ctx[8]);
    	}

    	function mouseleave_handler_1() {
    		return /*mouseleave_handler_1*/ ctx[7](/*r*/ ctx[8]);
    	}

    	item = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			}
    		});

    	item.$on("SMUI:action", SMUI_action_handler_2);
    	item.$on("mouseenter", mouseenter_handler_1);
    	item.$on("mouseleave", mouseleave_handler_1);

    	return {
    		c() {
    			create_component(item.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const item_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				item_changes.$$scope = { dirty, ctx };
    			}

    			item.$set(item_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(item, detaching);
    		}
    	};
    }

    // (30:37) 
    function create_if_block_1$5(ctx) {
    	let item;
    	let current;

    	function SMUI_action_handler_1() {
    		return /*SMUI_action_handler_1*/ ctx[2](/*r*/ ctx[8]);
    	}

    	function mouseenter_handler() {
    		return /*mouseenter_handler*/ ctx[3](/*r*/ ctx[8]);
    	}

    	function mouseleave_handler() {
    		return /*mouseleave_handler*/ ctx[4](/*r*/ ctx[8]);
    	}

    	item = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			}
    		});

    	item.$on("SMUI:action", SMUI_action_handler_1);
    	item.$on("mouseenter", mouseenter_handler);
    	item.$on("mouseleave", mouseleave_handler);

    	return {
    		c() {
    			create_component(item.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const item_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				item_changes.$$scope = { dirty, ctx };
    			}

    			item.$set(item_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(item, detaching);
    		}
    	};
    }

    // (25:8) {#if r.type == 'person'}
    function create_if_block$a(ctx) {
    	let item;
    	let current;

    	function SMUI_action_handler() {
    		return /*SMUI_action_handler*/ ctx[1](/*r*/ ctx[8]);
    	}

    	item = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			}
    		});

    	item.$on("SMUI:action", SMUI_action_handler);

    	return {
    		c() {
    			create_component(item.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const item_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				item_changes.$$scope = { dirty, ctx };
    			}

    			item.$set(item_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(item, detaching);
    		}
    	};
    }

    // (37:16) <Graphic class="material-icons">
    function create_default_slot_9(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("meeting_room");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (38:16) <Text>
    function create_default_slot_8(ctx) {
    	let t0_value = /*r*/ ctx[8].id + "";
    	let t0;
    	let t1;
    	let span;

    	return {
    		c() {
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			span.textContent = "Stanza";
    			attr(span, "class", "secondary svelte-1hqg55t");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, span, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$results*/ 1 && t0_value !== (t0_value = /*r*/ ctx[8].id + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (36:12) <Item on:SMUI:action={() => select(r.id)} on:mouseenter={() => hover_enter(r.id)} on:mouseleave={() => hover_leave(r.id)}>
    function create_default_slot_7(ctx) {
    	let graphic;
    	let t0;
    	let text_1;
    	let t1;
    	let current;

    	graphic = new Graphic({
    			props: {
    				class: "material-icons",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			}
    		});

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(graphic.$$.fragment);
    			t0 = space();
    			create_component(text_1.$$.fragment);
    			t1 = space();
    		},
    		m(target, anchor) {
    			mount_component(graphic, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(text_1, target, anchor);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const graphic_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				graphic_changes.$$scope = { dirty, ctx };
    			}

    			graphic.$set(graphic_changes);
    			const text_1_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(graphic.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(graphic.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(graphic, detaching);
    			if (detaching) detach(t0);
    			destroy_component(text_1, detaching);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (32:16) <Graphic class="material-icons">
    function create_default_slot_6(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("meeting_room");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (33:16) <Text>
    function create_default_slot_5(ctx) {
    	let t0_value = /*r*/ ctx[8].id + "";
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = /*r*/ ctx[8].edificio + "";
    	let t3;
    	let t4;
    	let t5_value = /*r*/ ctx[8].piano + "";
    	let t5;

    	return {
    		c() {
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text("Ufficio - Edificio ");
    			t3 = text(t3_value);
    			t4 = text(", Piano ");
    			t5 = text(t5_value);
    			attr(span, "class", "secondary svelte-1hqg55t");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, span, anchor);
    			append(span, t2);
    			append(span, t3);
    			append(span, t4);
    			append(span, t5);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$results*/ 1 && t0_value !== (t0_value = /*r*/ ctx[8].id + "")) set_data(t0, t0_value);
    			if (dirty & /*$results*/ 1 && t3_value !== (t3_value = /*r*/ ctx[8].edificio + "")) set_data(t3, t3_value);
    			if (dirty & /*$results*/ 1 && t5_value !== (t5_value = /*r*/ ctx[8].piano + "")) set_data(t5, t5_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (31:12) <Item on:SMUI:action={() => select(r.id)} on:mouseenter={() => hover_enter(r.id)} on:mouseleave={() => hover_leave(r.id)}>
    function create_default_slot_4$1(ctx) {
    	let graphic;
    	let t0;
    	let text_1;
    	let t1;
    	let current;

    	graphic = new Graphic({
    			props: {
    				class: "material-icons",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			}
    		});

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(graphic.$$.fragment);
    			t0 = space();
    			create_component(text_1.$$.fragment);
    			t1 = space();
    		},
    		m(target, anchor) {
    			mount_component(graphic, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(text_1, target, anchor);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const graphic_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				graphic_changes.$$scope = { dirty, ctx };
    			}

    			graphic.$set(graphic_changes);
    			const text_1_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(graphic.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(graphic.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(graphic, detaching);
    			if (detaching) detach(t0);
    			destroy_component(text_1, detaching);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (27:16) <Graphic class="material-icons">
    function create_default_slot_3$2(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("person");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (28:16) <Text>
    function create_default_slot_2$2(ctx) {
    	let t0_value = /*r*/ ctx[8].nome + "";
    	let t0;
    	let t1;
    	let t2_value = /*r*/ ctx[8].cognome + "";
    	let t2;
    	let t3;
    	let span;
    	let t4_value = getQualifica(/*r*/ ctx[8]) + "";
    	let t4;

    	return {
    		c() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			span = element("span");
    			t4 = text(t4_value);
    			attr(span, "class", "secondary svelte-1hqg55t");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, t3, anchor);
    			insert(target, span, anchor);
    			append(span, t4);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$results*/ 1 && t0_value !== (t0_value = /*r*/ ctx[8].nome + "")) set_data(t0, t0_value);
    			if (dirty & /*$results*/ 1 && t2_value !== (t2_value = /*r*/ ctx[8].cognome + "")) set_data(t2, t2_value);
    			if (dirty & /*$results*/ 1 && t4_value !== (t4_value = getQualifica(/*r*/ ctx[8]) + "")) set_data(t4, t4_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    			if (detaching) detach(t2);
    			if (detaching) detach(t3);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (26:12) <Item on:SMUI:action={() => select(r.email)}>
    function create_default_slot_1$3(ctx) {
    	let graphic;
    	let t0;
    	let text_1;
    	let t1;
    	let current;

    	graphic = new Graphic({
    			props: {
    				class: "material-icons",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			}
    		});

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(graphic.$$.fragment);
    			t0 = space();
    			create_component(text_1.$$.fragment);
    			t1 = space();
    		},
    		m(target, anchor) {
    			mount_component(graphic, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(text_1, target, anchor);
    			insert(target, t1, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const graphic_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				graphic_changes.$$scope = { dirty, ctx };
    			}

    			graphic.$set(graphic_changes);
    			const text_1_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(graphic.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(graphic.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(graphic, detaching);
    			if (detaching) detach(t0);
    			destroy_component(text_1, detaching);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (24:4) {#each $results as r}
    function create_each_block$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$a, create_if_block_1$5, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*r*/ ctx[8].type == 'person') return 0;
    		if (/*r*/ ctx[8].type == 'office') return 1;
    		if (/*r*/ ctx[8].type == 'room') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (23:0) <List singleSelection class="cnr-results">
    function create_default_slot$8(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$results*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*select, $results, getQualifica, hover_enter, hover_leave*/ 1) {
    				each_value = /*$results*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function create_fragment$u(ctx) {
    	let list;
    	let current;

    	list = new List({
    			props: {
    				singleSelection: true,
    				class: "cnr-results",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(list.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const list_changes = {};

    			if (dirty & /*$$scope, $results*/ 2049) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(list, detaching);
    		}
    	};
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let $results;
    	component_subscribe($$self, results, $$value => $$invalidate(0, $results = $$value));
    	const SMUI_action_handler = r => select$1(r.email);
    	const SMUI_action_handler_1 = r => select$1(r.id);
    	const mouseenter_handler = r => hover_enter(r.id);
    	const mouseleave_handler = r => hover_leave(r.id);
    	const SMUI_action_handler_2 = r => select$1(r.id);
    	const mouseenter_handler_1 = r => hover_enter(r.id);
    	const mouseleave_handler_1 = r => hover_leave(r.id);

    	return [
    		$results,
    		SMUI_action_handler,
    		SMUI_action_handler_1,
    		mouseenter_handler,
    		mouseleave_handler,
    		SMUI_action_handler_2,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class CNRResults extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});
    	}
    }

    /* src/POI.svelte generated by Svelte v3.47.0 */

    function create_if_block$b(ctx) {
    	let g;
    	let marker;
    	let g_transform_value;
    	let current;
    	let mounted;
    	let dispose;

    	marker = new Marker({
    			props: {
    				icon: /*data*/ ctx[0].icon,
    				icon_spacing: /*data*/ ctx[0].icon_spacing,
    				text: /*data*/ ctx[0].text,
    				fg_color: /*data*/ ctx[0].category == 'entrance'
    				? '#0d5784'
    				: undefined,
    				outline_color: /*data*/ ctx[0].category == 'entrance'
    				? '#0d5784'
    				: undefined,
    				bg_color: /*data*/ ctx[0].category
    				? /*category_colors*/ ctx[3][/*data*/ ctx[0].category]
    				: undefined,
    				shape: /*data*/ ctx[0].shape,
    				shadow: true
    			}
    		});

    	return {
    		c() {
    			g = svg_element("g");
    			create_component(marker.$$.fragment);
    			attr(g, "class", "selectable");
    			attr(g, "transform", g_transform_value = "translate(" + /*data*/ ctx[0].position.x + "," + /*data*/ ctx[0].position.y + ") scale(" + 1 / /*$zoom*/ ctx[2] + ")");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			mount_component(marker, g, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(g, "click", /*click_handler*/ ctx[6]),
    					listen(g, "mouseenter", /*mouseenter_handler*/ ctx[7]),
    					listen(g, "mouseleave", /*mouseleave_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const marker_changes = {};
    			if (dirty & /*data*/ 1) marker_changes.icon = /*data*/ ctx[0].icon;
    			if (dirty & /*data*/ 1) marker_changes.icon_spacing = /*data*/ ctx[0].icon_spacing;
    			if (dirty & /*data*/ 1) marker_changes.text = /*data*/ ctx[0].text;

    			if (dirty & /*data*/ 1) marker_changes.fg_color = /*data*/ ctx[0].category == 'entrance'
    			? '#0d5784'
    			: undefined;

    			if (dirty & /*data*/ 1) marker_changes.outline_color = /*data*/ ctx[0].category == 'entrance'
    			? '#0d5784'
    			: undefined;

    			if (dirty & /*data*/ 1) marker_changes.bg_color = /*data*/ ctx[0].category
    			? /*category_colors*/ ctx[3][/*data*/ ctx[0].category]
    			: undefined;

    			if (dirty & /*data*/ 1) marker_changes.shape = /*data*/ ctx[0].shape;
    			marker.$set(marker_changes);

    			if (!current || dirty & /*data, $zoom*/ 5 && g_transform_value !== (g_transform_value = "translate(" + /*data*/ ctx[0].position.x + "," + /*data*/ ctx[0].position.y + ") scale(" + 1 / /*$zoom*/ ctx[2] + ")")) {
    				attr(g, "transform", g_transform_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(marker.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(marker.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			destroy_component(marker);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$v(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[1] && create_if_block$b(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*visible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let visible;
    	let $user_transform;
    	let $current_layer;
    	let $zoom;
    	component_subscribe($$self, user_transform, $$value => $$invalidate(4, $user_transform = $$value));
    	component_subscribe($$self, current_layer, $$value => $$invalidate(5, $current_layer = $$value));
    	component_subscribe($$self, zoom$1, $$value => $$invalidate(2, $zoom = $$value));
    	let { data } = $$props;

    	const category_colors = {
    		'food_and_drinks': '#f57f17',
    		'mobility': '#00b0ff',
    		'emergency': '#db4437',
    		'services': '#6b7de3',
    		'commercial': '#5491f5',
    		'entrance': '#f5f5f5',
    		'cultural': '#6c461f'
    	};

    	const click_handler = () => select$1(data.id);
    	const mouseenter_handler = () => hover_enter(data.id);
    	const mouseleave_handler = () => hover_leave(data.id);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $current_layer, $user_transform*/ 49) {
    			 $$invalidate(1, visible = is_position_in_layer(data.position, $current_layer) && is_position_in_lod(data.position, $user_transform.k));
    		}
    	};

    	return [
    		data,
    		visible,
    		$zoom,
    		category_colors,
    		$user_transform,
    		$current_layer,
    		click_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class POI extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { data: 0 });
    	}
    }

    /* src/ResultPin.svelte generated by Svelte v3.47.0 */

    function create_if_block$c(ctx) {
    	let g;
    	let marker;
    	let g_transform_value;
    	let g_opacity_value;
    	let current;
    	let mounted;
    	let dispose;

    	marker = new Marker({
    			props: {
    				fg_color: "white",
    				bg_color: "brown",
    				outline_color: "#6c0808",
    				shape: "circle",
    				scale: "0.5",
    				shadow: true
    			}
    		});

    	return {
    		c() {
    			g = svg_element("g");
    			create_component(marker.$$.fragment);
    			attr(g, "class", "selectable");
    			attr(g, "transform", g_transform_value = "translate(" + /*data*/ ctx[0].position.x + "," + /*data*/ ctx[0].position.y + ") scale(" + 1 / /*$zoom*/ ctx[2] + ")");
    			attr(g, "opacity", g_opacity_value = /*opaque*/ ctx[1] ? 1 : 0.5);
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			mount_component(marker, g, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(g, "click", /*click_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (!current || dirty & /*data, $zoom*/ 5 && g_transform_value !== (g_transform_value = "translate(" + /*data*/ ctx[0].position.x + "," + /*data*/ ctx[0].position.y + ") scale(" + 1 / /*$zoom*/ ctx[2] + ")")) {
    				attr(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*opaque*/ 2 && g_opacity_value !== (g_opacity_value = /*opaque*/ ctx[1] ? 1 : 0.5)) {
    				attr(g, "opacity", g_opacity_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(marker.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(marker.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			destroy_component(marker);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$w(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*data*/ ctx[0].position && create_if_block$c(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*data*/ ctx[0].position) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let opaque;
    	let $current_layer;
    	let $zoom;
    	component_subscribe($$self, current_layer, $$value => $$invalidate(3, $current_layer = $$value));
    	component_subscribe($$self, zoom$1, $$value => $$invalidate(2, $zoom = $$value));
    	let { data } = $$props;
    	const click_handler = () => select$1(data.type == 'person' ? data.email : data.id);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $current_layer*/ 9) {
    			 $$invalidate(1, opaque = data.position && is_position_in_layer(data.position, $current_layer));
    		}
    	};

    	return [data, opaque, $zoom, $current_layer, click_handler];
    }

    class ResultPin extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { data: 0 });
    	}
    }

    /* src/Placemark.svelte generated by Svelte v3.47.0 */

    function create_if_block$d(ctx) {
    	let g;
    	let marker;
    	let g_transform_value;
    	let current;

    	marker = new Marker({
    			props: {
    				icon: /*icon*/ ctx[0],
    				icon_spacing: /*$selection*/ ctx[1].icon_spacing,
    				shape: "pin",
    				scale: "1.25",
    				fg_color: "white",
    				bg_color: /*bg_color*/ ctx[3],
    				outline_color: /*bg_color*/ ctx[3],
    				outline_brightness: "0.5"
    			}
    		});

    	return {
    		c() {
    			g = svg_element("g");
    			create_component(marker.$$.fragment);
    			attr(g, "transform", g_transform_value = "translate(" + /*$selection*/ ctx[1].position.x + " " + /*$selection*/ ctx[1].position.y + ") scale(" + 1 / /*$zoom*/ ctx[2] + ")");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			mount_component(marker, g, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const marker_changes = {};
    			if (dirty & /*icon*/ 1) marker_changes.icon = /*icon*/ ctx[0];
    			if (dirty & /*$selection*/ 2) marker_changes.icon_spacing = /*$selection*/ ctx[1].icon_spacing;
    			marker.$set(marker_changes);

    			if (!current || dirty & /*$selection, $zoom*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*$selection*/ ctx[1].position.x + " " + /*$selection*/ ctx[1].position.y + ") scale(" + 1 / /*$zoom*/ ctx[2] + ")")) {
    				attr(g, "transform", g_transform_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(marker.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(marker.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			destroy_component(marker);
    		}
    	};
    }

    function create_fragment$x(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selection*/ ctx[1] && /*$selection*/ ctx[1].position && create_if_block$d(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$selection*/ ctx[1] && /*$selection*/ ctx[1].position) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selection*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let $selection;
    	let $zoom;
    	component_subscribe($$self, selection$1, $$value => $$invalidate(1, $selection = $$value));
    	component_subscribe($$self, zoom$1, $$value => $$invalidate(2, $zoom = $$value));
    	let bg_color = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color');
    	let { icon } = $$props;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    	};

    	return [icon, $selection, $zoom, bg_color];
    }

    class Placemark extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { icon: 0 });
    	}
    }

    /* src/Tooltip.svelte generated by Svelte v3.47.0 */

    function create_fragment$y(ctx) {
    	let g;
    	let foreignObject;
    	let html;
    	let foreignObject_x_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	return {
    		c() {
    			g = svg_element("g");
    			foreignObject = svg_element("foreignObject");
    			html = element("html");
    			if (default_slot) default_slot.c();
    			set_style(html, "background", "white");
    			attr(foreignObject, "x", foreignObject_x_value = -/*width*/ ctx[0] / 2);
    			attr(foreignObject, "y", "0");
    			attr(foreignObject, "width", /*width*/ ctx[0]);
    			attr(foreignObject, "height", /*height*/ ctx[1]);
    			attr(g, "class", "svelte-1pg8hta");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			append(g, foreignObject);
    			append(foreignObject, html);

    			if (default_slot) {
    				default_slot.m(html, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*width*/ 1 && foreignObject_x_value !== (foreignObject_x_value = -/*width*/ ctx[0] / 2)) {
    				attr(foreignObject, "x", foreignObject_x_value);
    			}

    			if (!current || dirty & /*width*/ 1) {
    				attr(foreignObject, "width", /*width*/ ctx[0]);
    			}

    			if (!current || dirty & /*height*/ 2) {
    				attr(foreignObject, "height", /*height*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { width = 300 } = $$props;
    	let { height = 200 } = $$props;

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [width, height, $$scope, slots];
    }

    class Tooltip extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, { width: 0, height: 1 });
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (191:1) <Layer name="directions">
    function create_default_slot_9$1(ctx) {
    	let line;
    	let current;

    	line = new Line({
    			props: {
    				points: [
    					{ x: 4155.0283203125, y: 3365.9169921875 },
    					{ x: 4025.761474609375, y: 3365.9169921875 },
    					{
    						x: 4025.761474609375,
    						y: 3081.060302734375
    					},
    					{
    						x: 4075.761474609375,
    						y: 3081.060302734375
    					}
    				]
    			}
    		});

    	return {
    		c() {
    			create_component(line.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(line, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(line.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(line.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(line, detaching);
    		}
    	};
    }

    // (195:2) {#each Array.from($pois.values()) as poi}
    function create_each_block_1(ctx) {
    	let poi;
    	let current;
    	poi = new POI({ props: { data: /*poi*/ ctx[17] } });

    	return {
    		c() {
    			create_component(poi.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(poi, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const poi_changes = {};
    			if (dirty & /*$pois*/ 2) poi_changes.data = /*poi*/ ctx[17];
    			poi.$set(poi_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(poi.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(poi.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(poi, detaching);
    		}
    	};
    }

    // (194:1) <Layer name="pois">
    function create_default_slot_8$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = Array.from(/*$pois*/ ctx[1].values());
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*Array, $pois*/ 2) {
    				each_value_1 = Array.from(/*$pois*/ ctx[1].values());
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (200:2) {#each $results as result}
    function create_each_block$5(ctx) {
    	let resultpin;
    	let current;
    	resultpin = new ResultPin({ props: { data: /*result*/ ctx[14] } });

    	return {
    		c() {
    			create_component(resultpin.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(resultpin, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const resultpin_changes = {};
    			if (dirty & /*$results*/ 1) resultpin_changes.data = /*result*/ ctx[14];
    			resultpin.$set(resultpin_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(resultpin.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(resultpin.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(resultpin, detaching);
    		}
    	};
    }

    // (199:1) <Layer name="search_results">
    function create_default_slot_7$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$results*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$results*/ 1) {
    				each_value = /*$results*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (205:2) {#if $selection && $selection.position}
    function create_if_block_8$1(ctx) {
    	let g;
    	let tooltip;
    	let g_transform_value;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			g = svg_element("g");
    			create_component(tooltip.$$.fragment);
    			attr(g, "transform", g_transform_value = "translate(" + /*$selection*/ ctx[2].position.x + " " + /*$selection*/ ctx[2].position.y + ") scale(" + 1 / /*$zoom*/ ctx[3] + ")");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			mount_component(tooltip, g, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);

    			if (!current || dirty & /*$selection, $zoom*/ 12 && g_transform_value !== (g_transform_value = "translate(" + /*$selection*/ ctx[2].position.x + " " + /*$selection*/ ctx[2].position.y + ") scale(" + 1 / /*$zoom*/ ctx[3] + ")")) {
    				attr(g, "transform", g_transform_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    			destroy_component(tooltip);
    		}
    	};
    }

    // (207:4) <Tooltip>
    function create_default_slot_6$1(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;

    	return {
    		c() {
    			div3 = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    			div0 = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    			t0 = text("Wa");
    			div1 = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    			t1 = text("Wa");
    			div2 = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    			t2 = text("Wa");
    			attr(div3, "xmlns", "http://www.w3.org/1999/xhtml");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div0, t0);
    			append(div3, div1);
    			append(div1, t1);
    			append(div3, div2);
    			append(div2, t2);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div3);
    		}
    	};
    }

    // (204:1) <Layer name="tooltips">
    function create_default_slot_5$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selection*/ ctx[2] && /*$selection*/ ctx[2].position && create_if_block_8$1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*$selection*/ ctx[2] && /*$selection*/ ctx[2].position) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selection*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_8$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (184:0) <View viewBox="1950 1400 5480 4770">
    function create_default_slot_4$2(ctx) {
    	let svglayers;
    	let t0;
    	let layer0;
    	let t1;
    	let layer1;
    	let t2;
    	let layer2;
    	let t3;
    	let layer3;
    	let t4;
    	let placemark;
    	let current;

    	svglayers = new SVGLayers({
    			props: {
    				path: "data/cnr_flat.svg",
    				names: "T 1 2 overlay",
    				modes: "floor floor floor overlay",
    				postprocess: /*postprocessLayers*/ ctx[4]
    			}
    		});

    	layer0 = new Layer({
    			props: {
    				name: "directions",
    				$$slots: { default: [create_default_slot_9$1] },
    				$$scope: { ctx }
    			}
    		});

    	layer1 = new Layer({
    			props: {
    				name: "pois",
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			}
    		});

    	layer2 = new Layer({
    			props: {
    				name: "search_results",
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			}
    		});

    	layer3 = new Layer({
    			props: {
    				name: "tooltips",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			}
    		});

    	placemark = new Placemark({
    			props: {
    				icon: /*$selection*/ ctx[2] && /*$selection*/ ctx[2].icon
    				? /*$selection*/ ctx[2].icon
    				: /*$selection*/ ctx[2] && /*$selection*/ ctx[2].type == 'person'
    					? 'person'
    					: 'meeting_room'
    			}
    		});

    	return {
    		c() {
    			create_component(svglayers.$$.fragment);
    			t0 = space();
    			create_component(layer0.$$.fragment);
    			t1 = space();
    			create_component(layer1.$$.fragment);
    			t2 = space();
    			create_component(layer2.$$.fragment);
    			t3 = space();
    			create_component(layer3.$$.fragment);
    			t4 = space();
    			create_component(placemark.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(svglayers, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(layer0, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(layer1, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(layer2, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(layer3, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(placemark, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const layer0_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				layer0_changes.$$scope = { dirty, ctx };
    			}

    			layer0.$set(layer0_changes);
    			const layer1_changes = {};

    			if (dirty & /*$$scope, $pois*/ 1048578) {
    				layer1_changes.$$scope = { dirty, ctx };
    			}

    			layer1.$set(layer1_changes);
    			const layer2_changes = {};

    			if (dirty & /*$$scope, $results*/ 1048577) {
    				layer2_changes.$$scope = { dirty, ctx };
    			}

    			layer2.$set(layer2_changes);
    			const layer3_changes = {};

    			if (dirty & /*$$scope, $selection, $zoom*/ 1048588) {
    				layer3_changes.$$scope = { dirty, ctx };
    			}

    			layer3.$set(layer3_changes);
    			const placemark_changes = {};

    			if (dirty & /*$selection*/ 4) placemark_changes.icon = /*$selection*/ ctx[2] && /*$selection*/ ctx[2].icon
    			? /*$selection*/ ctx[2].icon
    			: /*$selection*/ ctx[2] && /*$selection*/ ctx[2].type == 'person'
    				? 'person'
    				: 'meeting_room';

    			placemark.$set(placemark_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svglayers.$$.fragment, local);
    			transition_in(layer0.$$.fragment, local);
    			transition_in(layer1.$$.fragment, local);
    			transition_in(layer2.$$.fragment, local);
    			transition_in(layer3.$$.fragment, local);
    			transition_in(placemark.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svglayers.$$.fragment, local);
    			transition_out(layer0.$$.fragment, local);
    			transition_out(layer1.$$.fragment, local);
    			transition_out(layer2.$$.fragment, local);
    			transition_out(layer3.$$.fragment, local);
    			transition_out(placemark.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(svglayers, detaching);
    			if (detaching) detach(t0);
    			destroy_component(layer0, detaching);
    			if (detaching) detach(t1);
    			destroy_component(layer1, detaching);
    			if (detaching) detach(t2);
    			destroy_component(layer2, detaching);
    			if (detaching) detach(t3);
    			destroy_component(layer3, detaching);
    			if (detaching) detach(t4);
    			destroy_component(placemark, detaching);
    		}
    	};
    }

    // (227:1) <ResultsBox>
    function create_default_slot_3$3(ctx) {
    	let cnrresults;
    	let current;
    	cnrresults = new CNRResults({});

    	return {
    		c() {
    			create_component(cnrresults.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(cnrresults, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(cnrresults.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(cnrresults.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(cnrresults, detaching);
    		}
    	};
    }

    // (226:0) <OmniBox on:search={handleSearch}>
    function create_default_slot_2$3(ctx) {
    	let resultsbox;
    	let current;

    	resultsbox = new ResultsBox({
    			props: {
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(resultsbox.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(resultsbox, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const resultsbox_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				resultsbox_changes.$$scope = { dirty, ctx };
    			}

    			resultsbox.$set(resultsbox_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(resultsbox.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(resultsbox.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(resultsbox, detaching);
    		}
    	};
    }

    // (260:36) 
    function create_if_block_5$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let depiction;
    	let current;
    	const if_block_creators = [create_if_block_6$1, create_if_block_7$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$selection*/ ctx[2].category == 'entrance') return 0;
    		if (/*$selection*/ ctx[2].title) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	depiction = new Depiction({
    			props: {
    				src: "assets/room_photos/" + /*$selection*/ ctx[2].id + ".jpg",
    				fallback: "url(assets/default_poi.png)"
    			}
    		});

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(depiction.$$.fragment);
    		},
    		m(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert(target, t, anchor);
    			mount_component(depiction, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				} else {
    					if_block = null;
    				}
    			}

    			const depiction_changes = {};
    			if (dirty & /*$selection*/ 4) depiction_changes.src = "assets/room_photos/" + /*$selection*/ ctx[2].id + ".jpg";
    			depiction.$set(depiction_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(depiction.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(depiction.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach(t);
    			destroy_component(depiction, detaching);
    		}
    	};
    }

    // (242:39) 
    function create_if_block_2$3(ctx) {
    	let infoboxheader;
    	let t0;
    	let depiction;
    	let t1;
    	let personinfo;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	infoboxheader = new InfoBoxHeader({
    			props: {
    				title: "" + (/*$selection*/ ctx[2].nome + " " + /*$selection*/ ctx[2].cognome),
    				subtitle: getQualifica(/*$selection*/ ctx[2])
    			}
    		});

    	depiction = new Depiction({
    			props: {
    				src: getImmagine(/*$selection*/ ctx[2]),
    				size: "contain",
    				fallback: "url(assets/default_person.png)"
    			}
    		});

    	personinfo = new PersonInfo({});
    	let if_block0 = /*$selection*/ ctx[2].sede && create_if_block_4$1(ctx);
    	let if_block1 = /*$selection*/ ctx[2].stanza && create_if_block_3$1();

    	return {
    		c() {
    			create_component(infoboxheader.$$.fragment);
    			t0 = space();
    			create_component(depiction.$$.fragment);
    			t1 = space();
    			create_component(personinfo.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(infoboxheader, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(depiction, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(personinfo, target, anchor);
    			insert(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const infoboxheader_changes = {};
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.title = "" + (/*$selection*/ ctx[2].nome + " " + /*$selection*/ ctx[2].cognome);
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.subtitle = getQualifica(/*$selection*/ ctx[2]);
    			infoboxheader.$set(infoboxheader_changes);
    			const depiction_changes = {};
    			if (dirty & /*$selection*/ 4) depiction_changes.src = getImmagine(/*$selection*/ ctx[2]);
    			depiction.$set(depiction_changes);

    			if (/*$selection*/ ctx[2].sede) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$selection*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$selection*/ ctx[2].stanza) {
    				if (if_block1) {
    					if (dirty & /*$selection*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3$1();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(infoboxheader.$$.fragment, local);
    			transition_in(depiction.$$.fragment, local);
    			transition_in(personinfo.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(infoboxheader.$$.fragment, local);
    			transition_out(depiction.$$.fragment, local);
    			transition_out(personinfo.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(infoboxheader, detaching);
    			if (detaching) detach(t0);
    			destroy_component(depiction, detaching);
    			if (detaching) detach(t1);
    			destroy_component(personinfo, detaching);
    			if (detaching) detach(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    		}
    	};
    }

    // (239:37) 
    function create_if_block_1$6(ctx) {
    	let infoboxheader;
    	let t;
    	let depiction;
    	let current;

    	infoboxheader = new InfoBoxHeader({
    			props: {
    				title: /*$selection*/ ctx[2].id,
    				subtitle: "Stanza"
    			}
    		});

    	depiction = new Depiction({
    			props: {
    				src: "assets/room_photos/" + /*$selection*/ ctx[2].id + ".jpg",
    				fallback: "url(assets/room_photos/default_room.png)"
    			}
    		});

    	return {
    		c() {
    			create_component(infoboxheader.$$.fragment);
    			t = space();
    			create_component(depiction.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(infoboxheader, target, anchor);
    			insert(target, t, anchor);
    			mount_component(depiction, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const infoboxheader_changes = {};
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.title = /*$selection*/ ctx[2].id;
    			infoboxheader.$set(infoboxheader_changes);
    			const depiction_changes = {};
    			if (dirty & /*$selection*/ 4) depiction_changes.src = "assets/room_photos/" + /*$selection*/ ctx[2].id + ".jpg";
    			depiction.$set(depiction_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(infoboxheader.$$.fragment, local);
    			transition_in(depiction.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(infoboxheader.$$.fragment, local);
    			transition_out(depiction.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(infoboxheader, detaching);
    			if (detaching) detach(t);
    			destroy_component(depiction, detaching);
    		}
    	};
    }

    // (233:1) {#if $selection.type == 'office'}
    function create_if_block$e(ctx) {
    	let infoboxheader;
    	let t0;
    	let depiction;
    	let t1;
    	let roominfo;
    	let t2;
    	let hr;
    	let t3;
    	let roompeoplelist;
    	let current;

    	infoboxheader = new InfoBoxHeader({
    			props: {
    				title: /*$selection*/ ctx[2].stanza,
    				subtitle: "Ufficio"
    			}
    		});

    	depiction = new Depiction({
    			props: {
    				src: "assets/room_photos/" + /*$selection*/ ctx[2].id + ".jpg",
    				fallback: "url(assets/room_photos/default_office.png)"
    			}
    		});

    	roominfo = new RoomInfo({});
    	roompeoplelist = new RoomPeopleList({});

    	return {
    		c() {
    			create_component(infoboxheader.$$.fragment);
    			t0 = space();
    			create_component(depiction.$$.fragment);
    			t1 = space();
    			create_component(roominfo.$$.fragment);
    			t2 = space();
    			hr = element("hr");
    			t3 = space();
    			create_component(roompeoplelist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(infoboxheader, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(depiction, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(roominfo, target, anchor);
    			insert(target, t2, anchor);
    			insert(target, hr, anchor);
    			insert(target, t3, anchor);
    			mount_component(roompeoplelist, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const infoboxheader_changes = {};
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.title = /*$selection*/ ctx[2].stanza;
    			infoboxheader.$set(infoboxheader_changes);
    			const depiction_changes = {};
    			if (dirty & /*$selection*/ 4) depiction_changes.src = "assets/room_photos/" + /*$selection*/ ctx[2].id + ".jpg";
    			depiction.$set(depiction_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(infoboxheader.$$.fragment, local);
    			transition_in(depiction.$$.fragment, local);
    			transition_in(roominfo.$$.fragment, local);
    			transition_in(roompeoplelist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(infoboxheader.$$.fragment, local);
    			transition_out(depiction.$$.fragment, local);
    			transition_out(roominfo.$$.fragment, local);
    			transition_out(roompeoplelist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(infoboxheader, detaching);
    			if (detaching) detach(t0);
    			destroy_component(depiction, detaching);
    			if (detaching) detach(t1);
    			destroy_component(roominfo, detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(hr);
    			if (detaching) detach(t3);
    			destroy_component(roompeoplelist, detaching);
    		}
    	};
    }

    // (263:29) 
    function create_if_block_7$1(ctx) {
    	let infoboxheader;
    	let current;

    	infoboxheader = new InfoBoxHeader({
    			props: {
    				title: /*$selection*/ ctx[2].title,
    				subtitle: /*$selection*/ ctx[2].subtitle || ''
    			}
    		});

    	return {
    		c() {
    			create_component(infoboxheader.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(infoboxheader, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const infoboxheader_changes = {};
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.title = /*$selection*/ ctx[2].title;
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.subtitle = /*$selection*/ ctx[2].subtitle || '';
    			infoboxheader.$set(infoboxheader_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(infoboxheader.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(infoboxheader.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(infoboxheader, detaching);
    		}
    	};
    }

    // (261:2) {#if $selection.category == 'entrance'}
    function create_if_block_6$1(ctx) {
    	let infoboxheader;
    	let current;

    	infoboxheader = new InfoBoxHeader({
    			props: {
    				title: "Ingresso " + /*$selection*/ ctx[2].text,
    				subtitle: "Ingresso"
    			}
    		});

    	return {
    		c() {
    			create_component(infoboxheader.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(infoboxheader, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const infoboxheader_changes = {};
    			if (dirty & /*$selection*/ 4) infoboxheader_changes.title = "Ingresso " + /*$selection*/ ctx[2].text;
    			infoboxheader.$set(infoboxheader_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(infoboxheader.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(infoboxheader.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(infoboxheader, detaching);
    		}
    	};
    }

    // (247:2) {#if $selection.sede}
    function create_if_block_4$1(ctx) {
    	let hr;
    	let t;
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			hr = element("hr");
    			t = space();
    			create_component(content.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t, anchor);
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const content_changes = {};

    			if (dirty & /*$$scope, $selection*/ 1048580) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t);
    			destroy_component(content, detaching);
    		}
    	};
    }

    // (249:3) <Content>
    function create_default_slot_1$4(ctx) {
    	let table;
    	let tr;
    	let td0;
    	let td1;

    	let t1_value = (/*$selection*/ ctx[2].sede == "pi"
    	? "Area della Ricerca di Pisa"
    	: /*$selection*/ ctx[2].sede == "cs" ? "UOS Cosenza" : "") + "";

    	let t1;

    	return {
    		c() {
    			table = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Sede";
    			td1 = element("td");
    			t1 = text(t1_value);
    		},
    		m(target, anchor) {
    			insert(target, table, anchor);
    			append(table, tr);
    			append(tr, td0);
    			append(tr, td1);
    			append(td1, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selection*/ 4 && t1_value !== (t1_value = (/*$selection*/ ctx[2].sede == "pi"
    			? "Area della Ricerca di Pisa"
    			: /*$selection*/ ctx[2].sede == "cs" ? "UOS Cosenza" : "") + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(table);
    		}
    	};
    }

    // (256:2) {#if $selection.stanza}
    function create_if_block_3$1(ctx) {
    	let hr;
    	let t;
    	let roominfo;
    	let current;
    	roominfo = new RoomInfo({});

    	return {
    		c() {
    			hr = element("hr");
    			t = space();
    			create_component(roominfo.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t, anchor);
    			mount_component(roominfo, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(roominfo.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(roominfo.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t);
    			destroy_component(roominfo, detaching);
    		}
    	};
    }

    // (232:0) <InfoBox>
    function create_default_slot$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$e, create_if_block_1$6, create_if_block_2$3, create_if_block_5$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$selection*/ ctx[2].type == 'office') return 0;
    		if (/*$selection*/ ctx[2].type == 'room') return 1;
    		if (/*$selection*/ ctx[2].type == 'person') return 2;
    		if (/*$selection*/ ctx[2].type == 'poi') return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$z(ctx) {
    	let div;
    	let view;
    	let t0;
    	let floorlayersctrl;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let footer;
    	let t12;
    	let omnibox;
    	let t13;
    	let infobox;
    	let current;

    	view = new View({
    			props: {
    				viewBox: "1950 1400 5480 4770",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			}
    		});

    	floorlayersctrl = new FloorLayersCtrl({});

    	omnibox = new OmniBox({
    			props: {
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			}
    		});

    	omnibox.$on("search", /*handleSearch*/ ctx[5]);

    	infobox = new InfoBox({
    			props: {
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(view.$$.fragment);
    			t0 = space();
    			create_component(floorlayersctrl.$$.fragment);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			footer = element("footer");
    			footer.innerHTML = `<a href="https://www.iit.cnr.it/privacy-policy/">Privacy</a> - <a href="credits">Credits</a> - Powered by <a href="https://github.com/webvis/anymapper">anymapper</a>, by <a href="//hct.iit.cnr.it/">HCT Lab</a> @<a href="//www.iit.cnr.it/">CNR-IIT</a>`;
    			t12 = space();
    			create_component(omnibox.$$.fragment);
    			t13 = space();
    			create_component(infobox.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "assets/IIT+CNR-RGB-logos.svg")) attr(img, "src", img_src_value);
    			attr(img, "alt", "CNR-IIT logo");
    			attr(img, "class", "logo svelte-1agk2ux");
    			attr(footer, "class", "svelte-1agk2ux");
    			attr(div, "class", "wrapper svelte-1agk2ux");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(view, div, null);
    			append(div, t0);
    			mount_component(floorlayersctrl, div, null);
    			append(div, t1);
    			append(div, img);
    			append(div, t2);
    			append(div, footer);
    			append(div, t12);
    			mount_component(omnibox, div, null);
    			append(div, t13);
    			mount_component(infobox, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const view_changes = {};

    			if (dirty & /*$$scope, $selection, $zoom, $results, $pois*/ 1048591) {
    				view_changes.$$scope = { dirty, ctx };
    			}

    			view.$set(view_changes);
    			const omnibox_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				omnibox_changes.$$scope = { dirty, ctx };
    			}

    			omnibox.$set(omnibox_changes);
    			const infobox_changes = {};

    			if (dirty & /*$$scope, $selection*/ 1048580) {
    				infobox_changes.$$scope = { dirty, ctx };
    			}

    			infobox.$set(infobox_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(view.$$.fragment, local);
    			transition_in(floorlayersctrl.$$.fragment, local);
    			transition_in(omnibox.$$.fragment, local);
    			transition_in(infobox.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(view.$$.fragment, local);
    			transition_out(floorlayersctrl.$$.fragment, local);
    			transition_out(omnibox.$$.fragment, local);
    			transition_out(infobox.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(view);
    			destroy_component(floorlayersctrl);
    			destroy_component(omnibox);
    			destroy_component(infobox);
    		}
    	};
    }

    function centroid(path) {
    	// return the centroid of a given SVG path (considering vertexes only and ignoring curves)
    	let points = [];

    	path.getPathData({ normalize: true }).forEach(d => {
    		if (d.type == 'Z') return;

    		// last two values are always a point in M, C and L commands
    		points.push({
    			x: d.values[d.values.length - 2],
    			y: d.values[d.values.length - 1]
    		});
    	});

    	// centroid of vertexes
    	let sum_p = points.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });

    	return {
    		x: sum_p.x / points.length,
    		y: sum_p.y / points.length
    	};
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let $results;
    	let $hovered_id;
    	let $pois;
    	let $people;
    	let $rooms;
    	let $selection;
    	let $selected_id;
    	let $room_positions;
    	let $zoom;
    	component_subscribe($$self, results, $$value => $$invalidate(0, $results = $$value));
    	component_subscribe($$self, hovered_id, $$value => $$invalidate(7, $hovered_id = $$value));
    	component_subscribe($$self, pois, $$value => $$invalidate(1, $pois = $$value));
    	component_subscribe($$self, people, $$value => $$invalidate(8, $people = $$value));
    	component_subscribe($$self, rooms, $$value => $$invalidate(9, $rooms = $$value));
    	component_subscribe($$self, selection$1, $$value => $$invalidate(2, $selection = $$value));
    	component_subscribe($$self, selected_id, $$value => $$invalidate(10, $selected_id = $$value));
    	component_subscribe($$self, room_positions, $$value => $$invalidate(11, $room_positions = $$value));
    	component_subscribe($$self, zoom$1, $$value => $$invalidate(3, $zoom = $$value));

    	function postprocessLayers(layers) {
    		let new_room_positions = new Map();

    		layers.forEach((layer, layer_id) => {
    			select(layer).selectAll('.selectable').each(function () {
    				let id = select(this).attr('id');

    				new_room_positions.set(id, {
    					...centroid(this),
    					layers: new Set([layer_id])
    				});
    			});

    			set_store_value(room_positions, $room_positions = new_room_positions, $room_positions);

    			select(layer).selectAll('.selectable').on('click', function () {
    				let id = select(this).attr('id');
    				select$1(id);
    			}).on('mouseenter', function () {
    				let id = select(this).attr('id');
    				hover_enter(id);
    			}).on('mouseleave', function () {
    				let id = select(this).attr('id');
    				hover_leave();
    			});
    		});
    	}

    	function updateSelection(_) {
    		if ($rooms.has($selected_id)) set_store_value(selection$1, $selection = $rooms.get($selected_id), $selection); else if ($people.has($selected_id)) set_store_value(selection$1, $selection = $people.get($selected_id), $selection); else if ($pois.has($selected_id)) set_store_value(selection$1, $selection = $pois.get($selected_id), $selection); else set_store_value(selection$1, $selection = null, $selection);
    	}

    	let hovered;

    	function updateHovered(_) {
    		if ($rooms.has($hovered_id)) hovered = $rooms.get($hovered_id); else if ($people.has($hovered_id)) hovered = $people.get($hovered_id); else if ($pois.has($hovered_id)) hovered = $pois.get($hovered_id); else hovered = null;
    	}

    	selected_id.subscribe(updateSelection);
    	hovered_id.subscribe(updateHovered);
    	rooms.subscribe(updateSelection);

    	function handleSearch(e) {
    		set_store_value(results, $results = search(e.detail.query), $results);
    	}

    	return [$results, $pois, $selection, $zoom, postprocessLayers, handleSearch];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
