
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/specifics/TimelinePast.svelte generated by Svelte v3.23.0 */

    const file = "src/specifics/TimelinePast.svelte";

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;
    	let div8;
    	let t9;
    	let div9;
    	let t11;
    	let div10;
    	let t13;
    	let div11;
    	let t15;
    	let div12;
    	let t17;
    	let div13;
    	let t19;
    	let div14;
    	let t21;
    	let div15;
    	let t23;
    	let div16;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = space();
    			div8 = element("div");
    			div8.textContent = "2020";
    			t9 = space();
    			div9 = element("div");
    			div9.textContent = "2010";
    			t11 = space();
    			div10 = element("div");
    			div10.textContent = "2000";
    			t13 = space();
    			div11 = element("div");
    			div11.textContent = "1990";
    			t15 = space();
    			div12 = element("div");
    			div12.textContent = "1980";
    			t17 = space();
    			div13 = element("div");
    			div13.textContent = "1970";
    			t19 = space();
    			div14 = element("div");
    			div14.textContent = "1960";
    			t21 = space();
    			div15 = element("div");
    			div15.textContent = "1950";
    			t23 = space();
    			div16 = element("div");
    			div16.textContent = "1940";
    			attr_dev(div0, "class", "line left line10 svelte-1lkff93");
    			add_location(div0, file, 4, 0, 21);
    			attr_dev(div1, "class", "line left line20 svelte-1lkff93");
    			add_location(div1, file, 5, 0, 58);
    			attr_dev(div2, "class", "line left line30 svelte-1lkff93");
    			add_location(div2, file, 6, 0, 95);
    			attr_dev(div3, "class", "line left line40 svelte-1lkff93");
    			add_location(div3, file, 7, 0, 132);
    			attr_dev(div4, "class", "line left line50 svelte-1lkff93");
    			add_location(div4, file, 8, 0, 169);
    			attr_dev(div5, "class", "line left line60 svelte-1lkff93");
    			add_location(div5, file, 9, 0, 206);
    			attr_dev(div6, "class", "line left line70 svelte-1lkff93");
    			add_location(div6, file, 10, 0, 243);
    			attr_dev(div7, "class", "line left line80 svelte-1lkff93");
    			add_location(div7, file, 11, 0, 280);
    			attr_dev(div8, "class", "text years left line0 svelte-1lkff93");
    			add_location(div8, file, 13, 0, 318);
    			attr_dev(div9, "class", "text years left line10 svelte-1lkff93");
    			add_location(div9, file, 14, 0, 364);
    			attr_dev(div10, "class", "text years left line20 svelte-1lkff93");
    			add_location(div10, file, 15, 0, 411);
    			attr_dev(div11, "class", "text years left line30 svelte-1lkff93");
    			add_location(div11, file, 16, 0, 458);
    			attr_dev(div12, "class", "text years left line40 svelte-1lkff93");
    			add_location(div12, file, 17, 0, 505);
    			attr_dev(div13, "class", "text years left line50 svelte-1lkff93");
    			add_location(div13, file, 18, 0, 552);
    			attr_dev(div14, "class", "text years left line60 svelte-1lkff93");
    			add_location(div14, file, 19, 0, 599);
    			attr_dev(div15, "class", "text years left line70 svelte-1lkff93");
    			add_location(div15, file, 20, 0, 646);
    			attr_dev(div16, "class", "text years left line80 svelte-1lkff93");
    			add_location(div16, file, 21, 0, 693);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div8, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div9, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div10, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div14, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div15, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div16, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div15);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div16);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimelinePast> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TimelinePast", $$slots, []);
    	return [];
    }

    class TimelinePast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimelinePast",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/specifics/TimelineFuture.svelte generated by Svelte v3.23.0 */

    const file$1 = "src/specifics/TimelineFuture.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;
    	let div8;
    	let t9;
    	let div9;
    	let t11;
    	let div10;
    	let t13;
    	let div11;
    	let t15;
    	let div12;
    	let t17;
    	let div13;
    	let t19;
    	let div14;
    	let t21;
    	let div15;
    	let t23;
    	let div16;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = space();
    			div8 = element("div");
    			div8.textContent = "2020";
    			t9 = space();
    			div9 = element("div");
    			div9.textContent = "2030";
    			t11 = space();
    			div10 = element("div");
    			div10.textContent = "2040";
    			t13 = space();
    			div11 = element("div");
    			div11.textContent = "2050";
    			t15 = space();
    			div12 = element("div");
    			div12.textContent = "2060";
    			t17 = space();
    			div13 = element("div");
    			div13.textContent = "2070";
    			t19 = space();
    			div14 = element("div");
    			div14.textContent = "2080";
    			t21 = space();
    			div15 = element("div");
    			div15.textContent = "2090";
    			t23 = space();
    			div16 = element("div");
    			div16.textContent = "2100";
    			attr_dev(div0, "class", "line right line10 svelte-87krwh");
    			add_location(div0, file$1, 7, 0, 24);
    			attr_dev(div1, "class", "line right line20 svelte-87krwh");
    			add_location(div1, file$1, 8, 0, 62);
    			attr_dev(div2, "class", "line right line30 svelte-87krwh");
    			add_location(div2, file$1, 9, 0, 100);
    			attr_dev(div3, "class", "line right line40 svelte-87krwh");
    			add_location(div3, file$1, 10, 0, 138);
    			attr_dev(div4, "class", "line right line50 svelte-87krwh");
    			add_location(div4, file$1, 11, 0, 176);
    			attr_dev(div5, "class", "line right line60 svelte-87krwh");
    			add_location(div5, file$1, 12, 0, 214);
    			attr_dev(div6, "class", "line right line70 svelte-87krwh");
    			add_location(div6, file$1, 13, 0, 252);
    			attr_dev(div7, "class", "line right line80 svelte-87krwh");
    			add_location(div7, file$1, 14, 0, 290);
    			attr_dev(div8, "class", "text years right line0 svelte-87krwh");
    			add_location(div8, file$1, 17, 0, 330);
    			attr_dev(div9, "class", "text years right line10 svelte-87krwh");
    			add_location(div9, file$1, 18, 0, 377);
    			attr_dev(div10, "class", "text years right line20 svelte-87krwh");
    			add_location(div10, file$1, 19, 0, 425);
    			attr_dev(div11, "class", "text years right line30 svelte-87krwh");
    			add_location(div11, file$1, 20, 0, 473);
    			attr_dev(div12, "class", "text years right line40 svelte-87krwh");
    			add_location(div12, file$1, 21, 0, 521);
    			attr_dev(div13, "class", "text years right line50 svelte-87krwh");
    			add_location(div13, file$1, 22, 0, 569);
    			attr_dev(div14, "class", "text years right line60 svelte-87krwh");
    			add_location(div14, file$1, 23, 0, 617);
    			attr_dev(div15, "class", "text years right line70 svelte-87krwh");
    			add_location(div15, file$1, 24, 0, 665);
    			attr_dev(div16, "class", "text years right line80 svelte-87krwh");
    			add_location(div16, file$1, 25, 0, 713);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div8, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div9, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div10, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div14, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div15, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div16, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div15);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div16);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimelineFuture> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TimelineFuture", $$slots, []);
    	return [];
    }

    class TimelineFuture extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimelineFuture",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/specifics/Timelines.svelte generated by Svelte v3.23.0 */

    function create_fragment$2(ctx) {
    	let t;
    	let current;
    	const timelinefuture = new TimelineFuture({ $$inline: true });
    	const timelinepast = new TimelinePast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinefuture.$$.fragment);
    			t = space();
    			create_component(timelinepast.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinefuture, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(timelinepast, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinefuture.$$.fragment, local);
    			transition_in(timelinepast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinefuture.$$.fragment, local);
    			transition_out(timelinepast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinefuture, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(timelinepast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timelines> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timelines", $$slots, []);
    	$$self.$capture_state = () => ({ TimelinePast, TimelineFuture });
    	return [];
    }

    class Timelines extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timelines",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/specifics/topMeter.svelte generated by Svelte v3.23.0 */

    const file$2 = "src/specifics/topMeter.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "tempMeter svelte-1ypqdbn");
    			add_location(div, file$2, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopMeter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TopMeter", $$slots, []);
    	return [];
    }

    class TopMeter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopMeter",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/footer.svelte generated by Svelte v3.23.0 */

    const file$3 = "src/footer.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "footer svelte-92q8ng");
    			add_location(div, file$3, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/specifics/pagetitle.svelte generated by Svelte v3.23.0 */

    const file$4 = "src/specifics/pagetitle.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*pagetitleText*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(/*message*/ ctx[2]);
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$4, 11, 2, 189);
    			attr_dev(div1, "class", "pagetitle svelte-1dc8amj");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$4, 9, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t0, /*pagetitleText*/ ctx[0]);
    			if (dirty & /*message*/ 4) set_data_dev(t2, /*message*/ ctx[2]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	let { message = "default text" } = $$props;
    	const writable_props = ["pagetitleText", "rotate", "message"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pagetitle> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pagetitle", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, message });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate, message];
    }

    class Pagetitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { pagetitleText: 0, rotate: 1, message: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagetitle",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Pagetitle> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Pagetitle> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<Pagetitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<Pagetitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Pagetitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Pagetitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Pagetitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Pagetitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Cover.svelte generated by Svelte v3.23.0 */
    const file$5 = "src/specifics/Cover.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let br;
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*pagetitleText*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Swipe");
    			br = element("br");
    			t3 = text("↑");
    			add_location(br, file$5, 16, 25, 359);
    			attr_dev(div0, "class", "text svelte-eekkh2");
    			add_location(div0, file$5, 16, 2, 336);
    			attr_dev(div1, "class", "pagetitle svelte-eekkh2");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$5, 14, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div0, br);
    			append_dev(div0, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t0, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let distanceBLines = "calc((95vh - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cover> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cover", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		Meter: TopMeter,
    		distanceBLines,
    		marginSides,
    		pagetitleText,
    		rotate
    	});

    	$$self.$inject_state = $$props => {
    		if ("distanceBLines" in $$props) distanceBLines = $$props.distanceBLines;
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class Cover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cover",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Cover> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Cover> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<Cover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<Cover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Cover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Cover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/CriticalDecadeI.svelte generated by Svelte v3.23.0 */
    const file$6 = "src/specifics/CriticalDecadeI.svelte";

    function create_fragment$7(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t4;
    	let div3;
    	let div2;
    	let span;
    	let t6;
    	let div4;
    	let t7;
    	let div5;
    	let current;
    	const timelinepast = new TimelinePast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinepast.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Since 1880 Earth’s average global temperature has increased by 1,1 - 1,3°C.";
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "1,2°C";
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			div5 = element("div");
    			div5.textContent = "↑";
    			attr_dev(div0, "class", "text svelte-1rxmm7");
    			add_location(div0, file$6, 16, 2, 326);
    			attr_dev(div1, "class", "pagetitle svelte-1rxmm7");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$6, 14, 0, 245);
    			attr_dev(span, "class", "tempnumber text svelte-1rxmm7");
    			add_location(span, file$6, 23, 2, 527);
    			attr_dev(div2, "class", "temperature svelte-1rxmm7");
    			add_location(div2, file$6, 22, 1, 499);
    			attr_dev(div3, "class", "tempMeter svelte-1rxmm7");
    			add_location(div3, file$6, 21, 0, 474);
    			attr_dev(div4, "class", "verticalLine1 svelte-1rxmm7");
    			add_location(div4, file$6, 27, 0, 586);
    			attr_dev(div5, "class", "arrow text svelte-1rxmm7");
    			add_location(div5, file$6, 29, 0, 621);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinepast, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div5, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinepast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinepast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinepast, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let distanceBLines = "calc((95vh - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalDecadeI> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CriticalDecadeI", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		distanceBLines,
    		marginSides,
    		pagetitleText,
    		rotate
    	});

    	$$self.$inject_state = $$props => {
    		if ("distanceBLines" in $$props) distanceBLines = $$props.distanceBLines;
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class CriticalDecadeI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalDecadeI",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<CriticalDecadeI> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<CriticalDecadeI> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<CriticalDecadeI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<CriticalDecadeI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<CriticalDecadeI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<CriticalDecadeI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/swipable.svelte generated by Svelte v3.23.0 */
    const file$7 = "src/swipable.svelte";

    const get_default_slot_changes = dirty => ({
    	current: dirty[0] & /*current*/ 1,
    	progress: dirty[0] & /*$progress*/ 64
    });

    const get_default_slot_context = ctx => ({
    	current: /*current*/ ctx[0],
    	jump: /*jump*/ ctx[2],
    	progress: /*$progress*/ ctx[6]
    });

    function create_fragment$8(ctx) {
    	let div;
    	let div_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[32].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[31], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "swipeable svelte-71csj2");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[33].call(div));
    			add_location(div, file$7, 122, 0, 2751);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[33].bind(div));
    			/*div_binding*/ ctx[34](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "touchstart", /*touchstart*/ ctx[10], false, false, false),
    					listen_dev(div, "touchmove", /*touchmove*/ ctx[12], false, false, false),
    					listen_dev(div, "touchend", /*touchend*/ ctx[11], false, false, false),
    					listen_dev(div, "mousedown", /*mousedown*/ ctx[7], false, false, false),
    					listen_dev(div, "mousemove", /*mousemove*/ ctx[9], false, false, false),
    					listen_dev(div, "mouseup", /*mouseup*/ ctx[8], false, false, false),
    					listen_dev(div, "wheel", /*wheel*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*current, $progress*/ 65 | dirty[1] & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[31], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			div_resize_listener();
    			/*div_binding*/ ctx[34](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $progress,
    		$$unsubscribe_progress = noop,
    		$$subscribe_progress = () => ($$unsubscribe_progress(), $$unsubscribe_progress = subscribe(progress, $$value => $$invalidate(6, $progress = $$value)), progress);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progress());
    	let { current } = $$props;
    	let { direction = "horizontal" } = $$props;
    	let { numStates = 2 } = $$props;
    	let { speed = 1 } = $$props;
    	let el;
    	let dragging = false;
    	let lastPosition;
    	let draggedPixels = 0;
    	let draggedBack;
    	let jumpEnabled = true;
    	let clientHeight;
    	let clientWidth;
    	const progress = tweened(0, { duration: 400, easing: cubicOut });
    	validate_store(progress, "progress");
    	$$subscribe_progress();

    	function startMove(startPosition) {
    		dragging = true;
    		lastPosition = startPosition;
    	}

    	function jump(index) {
    		if (!jumpEnabled) return;
    		$$invalidate(19, draggedPixels = index * size);
    	}

    	function nextSlide() {
    		if (dragging) return;
    		$$invalidate(19, draggedPixels += size);
    		if (draggedPixels < maxSlideIndex * size) $$invalidate(19, draggedPixels = 0);
    		nextSlideTimeout = setTimeout(nextSlide, 10000);
    	}

    	let nextSlideTimeout;

    	onMount(function () {
    		
    	}); // draggedPixels = initial * size
    	// nextSlideTimeout = setTimeout(nextSlide, 10000)

    	function move(position) {
    		if (!dragging) return;
    		let delta = position - lastPosition;
    		lastPosition = position;
    		$$invalidate(19, draggedPixels -= delta * speed);
    		if (draggedPixels < 0) $$invalidate(19, draggedPixels = 0);
    		if (draggedPixels > maxSlideIndex * size) $$invalidate(19, draggedPixels = maxSlideIndex * size);
    		draggedBack = delta < 0;
    		jumpEnabled = false;
    	}

    	function stopMove() {
    		if (draggedBack) $$invalidate(19, draggedPixels = Math.ceil(draggedPixels / size) * size); else $$invalidate(19, draggedPixels = Math.floor(draggedPixels / size) * size);
    		dragging = false;
    		stopTimeout = null;
    		clearTimeout(stopTimeout);

    		// when release the mouse, the click event gets fired, calling the jump function, undoing the drag.
    		// disable jump for one tick.
    		setTimeout(() => jumpEnabled = true, 10);
    	} // clearTimeout(nextSlideTimeout)
    	// nextSlideTimeout = setTimeout(nextSlide, 10000)

    	function mousedown(e) {
    		// e.preventDefault()
    		startMove(e[positionField]);
    	}

    	function mouseup(e) {
    		stopMove();
    	}

    	function mousemove(e) {
    		if (stopTimeout) return; // we just used the wheel
    		move(e[positionField]);
    	}

    	function touchstart(e) {
    		// e.preventDefault()
    		startMove(e.changedTouches[0][positionField]);
    	}

    	function touchend(e) {
    		stopMove();
    	}

    	function touchmove(e) {
    		e.preventDefault();
    		move(e.changedTouches[0][positionField]);
    	}

    	let stopTimeout;

    	function wheel(e) {
    		e.preventDefault();
    		startMove(0);
    		move(direction == "vertical" ? -e.deltaY : -e.deltaX);
    		clearTimeout(stopTimeout);
    		stopTimeout = setTimeout(stopMove, 100);
    	}

    	const writable_props = ["current", "direction", "numStates", "speed"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Swipable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Swipable", $$slots, ['default']);

    	function div_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		clientHeight = this.clientHeight;
    		$$invalidate(5, clientWidth);
    		$$invalidate(4, clientHeight);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, el = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("direction" in $$props) $$invalidate(14, direction = $$props.direction);
    		if ("numStates" in $$props) $$invalidate(15, numStates = $$props.numStates);
    		if ("speed" in $$props) $$invalidate(16, speed = $$props.speed);
    		if ("$$scope" in $$props) $$invalidate(31, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tweened,
    		cubicOut,
    		onMount,
    		tick,
    		current,
    		direction,
    		numStates,
    		speed,
    		el,
    		dragging,
    		lastPosition,
    		draggedPixels,
    		draggedBack,
    		jumpEnabled,
    		clientHeight,
    		clientWidth,
    		progress,
    		startMove,
    		jump,
    		nextSlide,
    		nextSlideTimeout,
    		move,
    		stopMove,
    		mousedown,
    		mouseup,
    		mousemove,
    		touchstart,
    		touchend,
    		touchmove,
    		stopTimeout,
    		wheel,
    		$progress,
    		size,
    		positionField,
    		maxSlideIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("direction" in $$props) $$invalidate(14, direction = $$props.direction);
    		if ("numStates" in $$props) $$invalidate(15, numStates = $$props.numStates);
    		if ("speed" in $$props) $$invalidate(16, speed = $$props.speed);
    		if ("el" in $$props) $$invalidate(3, el = $$props.el);
    		if ("dragging" in $$props) dragging = $$props.dragging;
    		if ("lastPosition" in $$props) lastPosition = $$props.lastPosition;
    		if ("draggedPixels" in $$props) $$invalidate(19, draggedPixels = $$props.draggedPixels);
    		if ("draggedBack" in $$props) draggedBack = $$props.draggedBack;
    		if ("jumpEnabled" in $$props) jumpEnabled = $$props.jumpEnabled;
    		if ("clientHeight" in $$props) $$invalidate(4, clientHeight = $$props.clientHeight);
    		if ("clientWidth" in $$props) $$invalidate(5, clientWidth = $$props.clientWidth);
    		if ("nextSlideTimeout" in $$props) nextSlideTimeout = $$props.nextSlideTimeout;
    		if ("stopTimeout" in $$props) stopTimeout = $$props.stopTimeout;
    		if ("size" in $$props) $$invalidate(24, size = $$props.size);
    		if ("positionField" in $$props) positionField = $$props.positionField;
    		if ("maxSlideIndex" in $$props) maxSlideIndex = $$props.maxSlideIndex;
    	};

    	let positionField;
    	let maxSlideIndex;
    	let size;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*direction, clientHeight, clientWidth*/ 16432) {
    			 $$invalidate(24, size = direction == "vertical" ? clientHeight : clientWidth);
    		}

    		if ($$self.$$.dirty[0] & /*draggedPixels, size*/ 17301504) {
    			 set_store_value(progress, $progress = draggedPixels / size || 0);
    		}

    		if ($$self.$$.dirty[0] & /*$progress*/ 64) {
    			 $$invalidate(0, current = Math.floor($progress + 0.5));
    		}

    		if ($$self.$$.dirty[0] & /*direction*/ 16384) {
    			 positionField = direction == "vertical" ? "pageY" : "pageX";
    		}

    		if ($$self.$$.dirty[0] & /*numStates*/ 32768) {
    			 maxSlideIndex = numStates - 1;
    		}
    	};

    	return [
    		current,
    		progress,
    		jump,
    		el,
    		clientHeight,
    		clientWidth,
    		$progress,
    		mousedown,
    		mouseup,
    		mousemove,
    		touchstart,
    		touchend,
    		touchmove,
    		wheel,
    		direction,
    		numStates,
    		speed,
    		dragging,
    		lastPosition,
    		draggedPixels,
    		draggedBack,
    		jumpEnabled,
    		nextSlideTimeout,
    		stopTimeout,
    		size,
    		positionField,
    		maxSlideIndex,
    		startMove,
    		nextSlide,
    		move,
    		stopMove,
    		$$scope,
    		$$slots,
    		div_elementresize_handler,
    		div_binding
    	];
    }

    class Swipable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				current: 0,
    				direction: 14,
    				numStates: 15,
    				speed: 16,
    				progress: 1,
    				jump: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Swipable",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*current*/ ctx[0] === undefined && !("current" in props)) {
    			console.warn("<Swipable> was created without expected prop 'current'");
    		}
    	}

    	get current() {
    		throw new Error("<Swipable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Swipable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<Swipable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Swipable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numStates() {
    		throw new Error("<Swipable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numStates(value) {
    		throw new Error("<Swipable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get speed() {
    		throw new Error("<Swipable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set speed(value) {
    		throw new Error("<Swipable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		return this.$$.ctx[1];
    	}

    	set progress(value) {
    		throw new Error("<Swipable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jump() {
    		return this.$$.ctx[2];
    	}

    	set jump(value) {
    		throw new Error("<Swipable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.0 */
    const file$8 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (158:4) {#each pages as page (page.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			set_style(img, "width", "95%");
    			set_style(img, "margin-left", "2.5%");
    			set_style(img, "margin-top", "4%");
    			if (img.src !== (img_src_value = "imgs/" + /*page*/ ctx[7].name + ".png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$8, 159, 6, 6593);
    			attr_dev(div, "class", "dot svelte-h4g86y");
    			add_location(div, file$8, 158, 5, 6569);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(158:4) {#each pages as page (page.id)}",
    		ctx
    	});

    	return block;
    }

    // (59:1) <Swipeable numStates="16" let:current let:progress={introProgress}>
    function create_default_slot(ctx) {
    	let div18;
    	let main0;
    	let div0;
    	let t0;
    	let main1;
    	let div1;
    	let t1;
    	let main2;
    	let div2;
    	let t2;
    	let main3;
    	let div3;
    	let t3;
    	let main4;
    	let div4;
    	let t4;
    	let t5;
    	let main5;
    	let div5;
    	let t6;
    	let t7;
    	let main6;
    	let div6;
    	let t8;
    	let t9;
    	let main7;
    	let div7;
    	let t10;
    	let t11;
    	let main8;
    	let div8;
    	let t12;
    	let t13;
    	let main9;
    	let div9;
    	let t14;
    	let t15;
    	let main10;
    	let div10;
    	let t16;
    	let t17;
    	let main11;
    	let div11;
    	let t18;
    	let t19;
    	let main12;
    	let div12;
    	let t20;
    	let t21;
    	let main13;
    	let div13;
    	let t22;
    	let main14;
    	let div14;
    	let t23;
    	let main15;
    	let div15;
    	let t24;
    	let div17;
    	let div16;
    	let t25;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	const cover = new Cover({
    			props: { pagetitleText: "Cover", rotate: "90deg" },
    			$$inline: true
    		});

    	const pagetitle0 = new Pagetitle({
    			props: {
    				pagetitleText: "Extreme heat: I",
    				rotate: "78.75deg"
    			},
    			$$inline: true
    		});

    	const pagetitle1 = new Pagetitle({
    			props: {
    				pagetitleText: "Extreme heat: II",
    				rotate: "67.5deg"
    			},
    			$$inline: true
    		});

    	const criticaldecadei = new CriticalDecadeI({
    			props: {
    				pagetitleText: "The Critical Decade: I",
    				rotate: "56.25deg"
    			},
    			$$inline: true
    		});

    	const pagetitle2 = new Pagetitle({
    			props: {
    				pagetitleText: "The Critical Decade: II",
    				rotate: "45deg"
    			},
    			$$inline: true
    		});

    	const meter = new TopMeter({ $$inline: true });

    	const pagetitle3 = new Pagetitle({
    			props: {
    				pagetitleText: "U.S.A.",
    				rotate: "33.75deg"
    			},
    			$$inline: true
    		});

    	const timelines0 = new Timelines({ $$inline: true });

    	const pagetitle4 = new Pagetitle({
    			props: {
    				pagetitleText: "Brazil",
    				rotate: "22.5deg"
    			},
    			$$inline: true
    		});

    	const timelines1 = new Timelines({ $$inline: true });

    	const pagetitle5 = new Pagetitle({
    			props: {
    				pagetitleText: "Iceland",
    				rotate: "11.25deg"
    			},
    			$$inline: true
    		});

    	const timelines2 = new Timelines({ $$inline: true });

    	const pagetitle6 = new Pagetitle({
    			props: { pagetitleText: "Ghana", rotate: "0deg" },
    			$$inline: true
    		});

    	const timelines3 = new Timelines({ $$inline: true });

    	const pagetitle7 = new Pagetitle({
    			props: {
    				pagetitleText: "Saudi Arabia",
    				rotate: "-11.25deg"
    			},
    			$$inline: true
    		});

    	const timelines4 = new Timelines({ $$inline: true });

    	const pagetitle8 = new Pagetitle({
    			props: {
    				pagetitleText: "India",
    				rotate: "-22.5deg"
    			},
    			$$inline: true
    		});

    	const timelines5 = new Timelines({ $$inline: true });

    	const pagetitle9 = new Pagetitle({
    			props: {
    				pagetitleText: "Cambodia",
    				rotate: "-33.75deg"
    			},
    			$$inline: true
    		});

    	const timelines6 = new Timelines({ $$inline: true });

    	const pagetitle10 = new Pagetitle({
    			props: {
    				pagetitleText: "South Korea",
    				rotate: "-45deg"
    			},
    			$$inline: true
    		});

    	const timelines7 = new Timelines({ $$inline: true });

    	const pagetitle11 = new Pagetitle({
    			props: {
    				pagetitleText: "Environmental Justice",
    				rotate: "-56.25deg"
    			},
    			$$inline: true
    		});

    	const pagetitle12 = new Pagetitle({
    			props: {
    				pagetitleText: "Impact of Individual Action",
    				rotate: "-67.5deg"
    			},
    			$$inline: true
    		});

    	const pagetitle13 = new Pagetitle({
    			props: {
    				pagetitleText: "Critical Decade: III, Pledge",
    				rotate: "-78.75deg"
    			},
    			$$inline: true
    		});

    	let each_value = /*pages*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*page*/ ctx[7].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div18 = element("div");
    			main0 = element("main");
    			div0 = element("div");
    			create_component(cover.$$.fragment);
    			t0 = space();
    			main1 = element("main");
    			div1 = element("div");
    			create_component(pagetitle0.$$.fragment);
    			t1 = space();
    			main2 = element("main");
    			div2 = element("div");
    			create_component(pagetitle1.$$.fragment);
    			t2 = space();
    			main3 = element("main");
    			div3 = element("div");
    			create_component(criticaldecadei.$$.fragment);
    			t3 = space();
    			main4 = element("main");
    			div4 = element("div");
    			create_component(pagetitle2.$$.fragment);
    			t4 = space();
    			create_component(meter.$$.fragment);
    			t5 = space();
    			main5 = element("main");
    			div5 = element("div");
    			create_component(pagetitle3.$$.fragment);
    			t6 = space();
    			create_component(timelines0.$$.fragment);
    			t7 = space();
    			main6 = element("main");
    			div6 = element("div");
    			create_component(pagetitle4.$$.fragment);
    			t8 = space();
    			create_component(timelines1.$$.fragment);
    			t9 = space();
    			main7 = element("main");
    			div7 = element("div");
    			create_component(pagetitle5.$$.fragment);
    			t10 = space();
    			create_component(timelines2.$$.fragment);
    			t11 = space();
    			main8 = element("main");
    			div8 = element("div");
    			create_component(pagetitle6.$$.fragment);
    			t12 = space();
    			create_component(timelines3.$$.fragment);
    			t13 = space();
    			main9 = element("main");
    			div9 = element("div");
    			create_component(pagetitle7.$$.fragment);
    			t14 = space();
    			create_component(timelines4.$$.fragment);
    			t15 = space();
    			main10 = element("main");
    			div10 = element("div");
    			create_component(pagetitle8.$$.fragment);
    			t16 = space();
    			create_component(timelines5.$$.fragment);
    			t17 = space();
    			main11 = element("main");
    			div11 = element("div");
    			create_component(pagetitle9.$$.fragment);
    			t18 = space();
    			create_component(timelines6.$$.fragment);
    			t19 = space();
    			main12 = element("main");
    			div12 = element("div");
    			create_component(pagetitle10.$$.fragment);
    			t20 = space();
    			create_component(timelines7.$$.fragment);
    			t21 = space();
    			main13 = element("main");
    			div13 = element("div");
    			create_component(pagetitle11.$$.fragment);
    			t22 = space();
    			main14 = element("main");
    			div14 = element("div");
    			create_component(pagetitle12.$$.fragment);
    			t23 = space();
    			main15 = element("main");
    			div15 = element("div");
    			create_component(pagetitle13.$$.fragment);
    			t24 = space();
    			div17 = element("div");
    			div16 = element("div");
    			t25 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "content page1 svelte-h4g86y");
    			set_style(div0, "right", 100 * (/*introProgress*/ ctx[6] - 0) + "%");
    			add_location(div0, file$8, 62, 4, 2710);
    			toggle_class(main0, "current", /*current*/ ctx[5] == 0);
    			add_location(main0, file$8, 61, 3, 2670);
    			attr_dev(div1, "class", "content page2 svelte-h4g86y");
    			set_style(div1, "right", 100 * (/*introProgress*/ ctx[6] - 1) + "%");
    			add_location(div1, file$8, 67, 4, 2906);
    			toggle_class(main1, "current", /*current*/ ctx[5] == 1);
    			add_location(main1, file$8, 66, 3, 2866);
    			attr_dev(div2, "class", "content page3 svelte-h4g86y");
    			set_style(div2, "right", 100 * (/*introProgress*/ ctx[6] - 2) + "%");
    			add_location(div2, file$8, 72, 4, 3128);
    			toggle_class(main2, "current", /*current*/ ctx[5] == 2);
    			add_location(main2, file$8, 71, 3, 3088);
    			attr_dev(div3, "class", "content page4 svelte-h4g86y");
    			set_style(div3, "right", 100 * (/*introProgress*/ ctx[6] - 3) + "%");
    			add_location(div3, file$8, 77, 4, 3350);
    			toggle_class(main3, "current", /*current*/ ctx[5] == 3);
    			add_location(main3, file$8, 76, 3, 3310);
    			attr_dev(div4, "class", "content page4 svelte-h4g86y");
    			set_style(div4, "right", 100 * (/*introProgress*/ ctx[6] - 4) + "%");
    			add_location(div4, file$8, 83, 4, 3601);
    			toggle_class(main4, "current", /*current*/ ctx[5] == 4);
    			add_location(main4, file$8, 82, 3, 3561);
    			attr_dev(div5, "class", "content page5 svelte-h4g86y");
    			set_style(div5, "right", 100 * (/*introProgress*/ ctx[6] - 5) + "%");
    			add_location(div5, file$8, 89, 4, 3849);
    			toggle_class(main5, "current", /*current*/ ctx[5] == 5);
    			add_location(main5, file$8, 88, 3, 3809);
    			attr_dev(div6, "class", "content page6 svelte-h4g86y");
    			set_style(div6, "right", 100 * (/*introProgress*/ ctx[6] - 6) + "%");
    			add_location(div6, file$8, 95, 4, 4086);
    			toggle_class(main6, "current", /*current*/ ctx[5] == 6);
    			add_location(main6, file$8, 94, 3, 4046);
    			attr_dev(div7, "class", "content page7 svelte-h4g86y");
    			set_style(div7, "right", 100 * (/*introProgress*/ ctx[6] - 7) + "%");
    			add_location(div7, file$8, 101, 4, 4322);
    			toggle_class(main7, "current", /*current*/ ctx[5] == 7);
    			add_location(main7, file$8, 100, 3, 4282);
    			attr_dev(div8, "class", "content page8 svelte-h4g86y");
    			set_style(div8, "right", 100 * (/*introProgress*/ ctx[6] - 8) + "%");
    			add_location(div8, file$8, 107, 4, 4560);
    			toggle_class(main8, "current", /*current*/ ctx[5] == 8);
    			add_location(main8, file$8, 106, 3, 4520);
    			attr_dev(div9, "class", "content page9 svelte-h4g86y");
    			set_style(div9, "right", 100 * (/*introProgress*/ ctx[6] - 9) + "%");
    			add_location(div9, file$8, 113, 4, 4792);
    			toggle_class(main9, "current", /*current*/ ctx[5] == 9);
    			add_location(main9, file$8, 112, 3, 4752);
    			attr_dev(div10, "class", "content page10 svelte-h4g86y");
    			set_style(div10, "right", 100 * (/*introProgress*/ ctx[6] - 10) + "%");
    			add_location(div10, file$8, 119, 4, 5037);
    			toggle_class(main10, "current", /*current*/ ctx[5] == 10);
    			add_location(main10, file$8, 118, 3, 4996);
    			attr_dev(div11, "class", "content page11 svelte-h4g86y");
    			set_style(div11, "right", 100 * (/*introProgress*/ ctx[6] - 11) + "%");
    			add_location(div11, file$8, 125, 4, 5276);
    			toggle_class(main11, "current", /*current*/ ctx[5] == 11);
    			add_location(main11, file$8, 124, 3, 5235);
    			attr_dev(div12, "class", "content page12 svelte-h4g86y");
    			set_style(div12, "right", 100 * (/*introProgress*/ ctx[6] - 12) + "%");
    			add_location(div12, file$8, 131, 4, 5519);
    			toggle_class(main12, "current", /*current*/ ctx[5] == 12);
    			add_location(main12, file$8, 130, 3, 5478);
    			attr_dev(div13, "class", "content page13 svelte-h4g86y");
    			set_style(div13, "right", 100 * (/*introProgress*/ ctx[6] - 13) + "%");
    			add_location(div13, file$8, 137, 4, 5762);
    			toggle_class(main13, "current", /*current*/ ctx[5] == 13);
    			add_location(main13, file$8, 136, 3, 5721);
    			attr_dev(div14, "class", "content page14 svelte-h4g86y");
    			set_style(div14, "right", 100 * (/*introProgress*/ ctx[6] - 14) + "%");
    			add_location(div14, file$8, 142, 4, 5989);
    			toggle_class(main14, "current", /*current*/ ctx[5] == 14);
    			add_location(main14, file$8, 141, 3, 5948);
    			attr_dev(div15, "class", "content page15 svelte-h4g86y");
    			set_style(div15, "right", 100 * (/*introProgress*/ ctx[6] - 15) + "%");
    			add_location(div15, file$8, 147, 4, 6221);
    			toggle_class(main15, "current", /*current*/ ctx[5] == 15);
    			add_location(main15, file$8, 146, 3, 6180);
    			attr_dev(div16, "class", "dot active svelte-h4g86y");
    			set_style(div16, "left", "calc(" + /*introProgress*/ ctx[6] * 6.25 + "vw)");
    			add_location(div16, file$8, 156, 4, 6452);
    			attr_dev(div17, "class", "dots svelte-h4g86y");
    			add_location(div17, file$8, 155, 3, 6429);
    			attr_dev(div18, "class", "slides fullpage");
    			set_style(div18, "transform", "scale(" + (0.7 + 0.3 * (1 - /*$loginProgress*/ ctx[0])) + ")");
    			add_location(div18, file$8, 59, 3, 2575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div18, anchor);
    			append_dev(div18, main0);
    			append_dev(main0, div0);
    			mount_component(cover, div0, null);
    			append_dev(div18, t0);
    			append_dev(div18, main1);
    			append_dev(main1, div1);
    			mount_component(pagetitle0, div1, null);
    			append_dev(div18, t1);
    			append_dev(div18, main2);
    			append_dev(main2, div2);
    			mount_component(pagetitle1, div2, null);
    			append_dev(div18, t2);
    			append_dev(div18, main3);
    			append_dev(main3, div3);
    			mount_component(criticaldecadei, div3, null);
    			append_dev(div18, t3);
    			append_dev(div18, main4);
    			append_dev(main4, div4);
    			mount_component(pagetitle2, div4, null);
    			append_dev(div4, t4);
    			mount_component(meter, div4, null);
    			append_dev(div18, t5);
    			append_dev(div18, main5);
    			append_dev(main5, div5);
    			mount_component(pagetitle3, div5, null);
    			append_dev(div5, t6);
    			mount_component(timelines0, div5, null);
    			append_dev(div18, t7);
    			append_dev(div18, main6);
    			append_dev(main6, div6);
    			mount_component(pagetitle4, div6, null);
    			append_dev(div6, t8);
    			mount_component(timelines1, div6, null);
    			append_dev(div18, t9);
    			append_dev(div18, main7);
    			append_dev(main7, div7);
    			mount_component(pagetitle5, div7, null);
    			append_dev(div7, t10);
    			mount_component(timelines2, div7, null);
    			append_dev(div18, t11);
    			append_dev(div18, main8);
    			append_dev(main8, div8);
    			mount_component(pagetitle6, div8, null);
    			append_dev(div8, t12);
    			mount_component(timelines3, div8, null);
    			append_dev(div18, t13);
    			append_dev(div18, main9);
    			append_dev(main9, div9);
    			mount_component(pagetitle7, div9, null);
    			append_dev(div9, t14);
    			mount_component(timelines4, div9, null);
    			append_dev(div18, t15);
    			append_dev(div18, main10);
    			append_dev(main10, div10);
    			mount_component(pagetitle8, div10, null);
    			append_dev(div10, t16);
    			mount_component(timelines5, div10, null);
    			append_dev(div18, t17);
    			append_dev(div18, main11);
    			append_dev(main11, div11);
    			mount_component(pagetitle9, div11, null);
    			append_dev(div11, t18);
    			mount_component(timelines6, div11, null);
    			append_dev(div18, t19);
    			append_dev(div18, main12);
    			append_dev(main12, div12);
    			mount_component(pagetitle10, div12, null);
    			append_dev(div12, t20);
    			mount_component(timelines7, div12, null);
    			append_dev(div18, t21);
    			append_dev(div18, main13);
    			append_dev(main13, div13);
    			mount_component(pagetitle11, div13, null);
    			append_dev(div18, t22);
    			append_dev(div18, main14);
    			append_dev(main14, div14);
    			mount_component(pagetitle12, div14, null);
    			append_dev(div18, t23);
    			append_dev(div18, main15);
    			append_dev(main15, div15);
    			mount_component(pagetitle13, div15, null);
    			append_dev(div18, t24);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div17, t25);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div17, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div0, "right", 100 * (/*introProgress*/ ctx[6] - 0) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main0, "current", /*current*/ ctx[5] == 0);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div1, "right", 100 * (/*introProgress*/ ctx[6] - 1) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main1, "current", /*current*/ ctx[5] == 1);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div2, "right", 100 * (/*introProgress*/ ctx[6] - 2) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main2, "current", /*current*/ ctx[5] == 2);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div3, "right", 100 * (/*introProgress*/ ctx[6] - 3) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main3, "current", /*current*/ ctx[5] == 3);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div4, "right", 100 * (/*introProgress*/ ctx[6] - 4) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main4, "current", /*current*/ ctx[5] == 4);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div5, "right", 100 * (/*introProgress*/ ctx[6] - 5) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main5, "current", /*current*/ ctx[5] == 5);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div6, "right", 100 * (/*introProgress*/ ctx[6] - 6) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main6, "current", /*current*/ ctx[5] == 6);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div7, "right", 100 * (/*introProgress*/ ctx[6] - 7) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main7, "current", /*current*/ ctx[5] == 7);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div8, "right", 100 * (/*introProgress*/ ctx[6] - 8) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main8, "current", /*current*/ ctx[5] == 8);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div9, "right", 100 * (/*introProgress*/ ctx[6] - 9) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main9, "current", /*current*/ ctx[5] == 9);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div10, "right", 100 * (/*introProgress*/ ctx[6] - 10) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main10, "current", /*current*/ ctx[5] == 10);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div11, "right", 100 * (/*introProgress*/ ctx[6] - 11) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main11, "current", /*current*/ ctx[5] == 11);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div12, "right", 100 * (/*introProgress*/ ctx[6] - 12) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main12, "current", /*current*/ ctx[5] == 12);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div13, "right", 100 * (/*introProgress*/ ctx[6] - 13) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main13, "current", /*current*/ ctx[5] == 13);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div14, "right", 100 * (/*introProgress*/ ctx[6] - 14) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main14, "current", /*current*/ ctx[5] == 14);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div15, "right", 100 * (/*introProgress*/ ctx[6] - 15) + "%");
    			}

    			if (dirty & /*current*/ 32) {
    				toggle_class(main15, "current", /*current*/ ctx[5] == 15);
    			}

    			if (!current || dirty & /*introProgress*/ 64) {
    				set_style(div16, "left", "calc(" + /*introProgress*/ ctx[6] * 6.25 + "vw)");
    			}

    			if (dirty & /*pages*/ 4) {
    				const each_value = /*pages*/ ctx[2];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div17, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (!current || dirty & /*$loginProgress*/ 1) {
    				set_style(div18, "transform", "scale(" + (0.7 + 0.3 * (1 - /*$loginProgress*/ ctx[0])) + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cover.$$.fragment, local);
    			transition_in(pagetitle0.$$.fragment, local);
    			transition_in(pagetitle1.$$.fragment, local);
    			transition_in(criticaldecadei.$$.fragment, local);
    			transition_in(pagetitle2.$$.fragment, local);
    			transition_in(meter.$$.fragment, local);
    			transition_in(pagetitle3.$$.fragment, local);
    			transition_in(timelines0.$$.fragment, local);
    			transition_in(pagetitle4.$$.fragment, local);
    			transition_in(timelines1.$$.fragment, local);
    			transition_in(pagetitle5.$$.fragment, local);
    			transition_in(timelines2.$$.fragment, local);
    			transition_in(pagetitle6.$$.fragment, local);
    			transition_in(timelines3.$$.fragment, local);
    			transition_in(pagetitle7.$$.fragment, local);
    			transition_in(timelines4.$$.fragment, local);
    			transition_in(pagetitle8.$$.fragment, local);
    			transition_in(timelines5.$$.fragment, local);
    			transition_in(pagetitle9.$$.fragment, local);
    			transition_in(timelines6.$$.fragment, local);
    			transition_in(pagetitle10.$$.fragment, local);
    			transition_in(timelines7.$$.fragment, local);
    			transition_in(pagetitle11.$$.fragment, local);
    			transition_in(pagetitle12.$$.fragment, local);
    			transition_in(pagetitle13.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cover.$$.fragment, local);
    			transition_out(pagetitle0.$$.fragment, local);
    			transition_out(pagetitle1.$$.fragment, local);
    			transition_out(criticaldecadei.$$.fragment, local);
    			transition_out(pagetitle2.$$.fragment, local);
    			transition_out(meter.$$.fragment, local);
    			transition_out(pagetitle3.$$.fragment, local);
    			transition_out(timelines0.$$.fragment, local);
    			transition_out(pagetitle4.$$.fragment, local);
    			transition_out(timelines1.$$.fragment, local);
    			transition_out(pagetitle5.$$.fragment, local);
    			transition_out(timelines2.$$.fragment, local);
    			transition_out(pagetitle6.$$.fragment, local);
    			transition_out(timelines3.$$.fragment, local);
    			transition_out(pagetitle7.$$.fragment, local);
    			transition_out(timelines4.$$.fragment, local);
    			transition_out(pagetitle8.$$.fragment, local);
    			transition_out(timelines5.$$.fragment, local);
    			transition_out(pagetitle9.$$.fragment, local);
    			transition_out(timelines6.$$.fragment, local);
    			transition_out(pagetitle10.$$.fragment, local);
    			transition_out(timelines7.$$.fragment, local);
    			transition_out(pagetitle11.$$.fragment, local);
    			transition_out(pagetitle12.$$.fragment, local);
    			transition_out(pagetitle13.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div18);
    			destroy_component(cover);
    			destroy_component(pagetitle0);
    			destroy_component(pagetitle1);
    			destroy_component(criticaldecadei);
    			destroy_component(pagetitle2);
    			destroy_component(meter);
    			destroy_component(pagetitle3);
    			destroy_component(timelines0);
    			destroy_component(pagetitle4);
    			destroy_component(timelines1);
    			destroy_component(pagetitle5);
    			destroy_component(timelines2);
    			destroy_component(pagetitle6);
    			destroy_component(timelines3);
    			destroy_component(pagetitle7);
    			destroy_component(timelines4);
    			destroy_component(pagetitle8);
    			destroy_component(timelines5);
    			destroy_component(pagetitle9);
    			destroy_component(timelines6);
    			destroy_component(pagetitle10);
    			destroy_component(timelines7);
    			destroy_component(pagetitle11);
    			destroy_component(pagetitle12);
    			destroy_component(pagetitle13);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(59:1) <Swipeable numStates=\\\"16\\\" let:current let:progress={introProgress}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t;
    	let current$1;

    	const swipeable = new Swipable({
    			props: {
    				numStates: "16",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ current, progress: introProgress }) => ({ 5: current, 6: introProgress }),
    						({ current, progress: introProgress }) => (current ? 32 : 0) | (introProgress ? 64 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(swipeable.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "id", "wrapper");
    			add_location(div, file$8, 57, 0, 2484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(swipeable, div, null);
    			insert_dev(target, t, anchor);
    			mount_component(footer, target, anchor);
    			current$1 = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const swipeable_changes = {};

    			if (dirty & /*$$scope, $loginProgress, introProgress, current*/ 1121) {
    				swipeable_changes.$$scope = { dirty, ctx };
    			}

    			swipeable.$set(swipeable_changes);
    		},
    		i: function intro(local) {
    			if (current$1) return;
    			transition_in(swipeable.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current$1 = true;
    		},
    		o: function outro(local) {
    			transition_out(swipeable.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current$1 = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(swipeable);
    			if (detaching) detach_dev(t);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $loginProgress;
    	let initializing = true;
    	let loginProgress, loginSwipeable;
    	validate_store(loginProgress, "loginProgress");
    	component_subscribe($$self, loginProgress, value => $$invalidate(0, $loginProgress = value));

    	onMount(function () {
    		setTimeout(() => initializing = false, 100);
    	});

    	let pages = [
    		{
    			name: "page1",
    			id: 1,
    			swipes: 0,
    			type: "notcountry",
    			rotate: "90",
    			pagetitle: "cover"
    		},
    		{
    			name: "page2",
    			id: 2,
    			swipes: 1,
    			type: "notcountry",
    			rotate: "78.75",
    			pagetitle: "Extreme heat:&emsp;I"
    		},
    		{
    			name: "page3",
    			id: 3,
    			swipes: 2,
    			type: "notcountry",
    			rotate: "67.5",
    			pagetitle: "Extreme heat:&emsp;II"
    		},
    		{
    			name: "page4",
    			id: 4,
    			swipes: 3,
    			type: "notcountry",
    			rotate: "56.25",
    			pagetitle: "The Critical Decade:&emsp;I"
    		},
    		{
    			name: "page5",
    			id: 5,
    			swipes: 4,
    			type: "notcountry",
    			rotate: "45",
    			pagetitle: "The Critical Decade:&emsp;II"
    		},
    		{
    			name: "page6",
    			id: 6,
    			swipes: 5,
    			type: "country",
    			rotate: "33.75",
    			pagetitle: "U.S.A."
    		},
    		{
    			name: "page7",
    			id: 7,
    			swipes: 6,
    			type: "country",
    			rotate: "22.5",
    			pagetitle: "Brazil"
    		},
    		{
    			name: "page8",
    			id: 8,
    			swipes: 7,
    			type: "country",
    			rotate: "11.25",
    			pagetitle: "Iceland"
    		},
    		{
    			name: "page9",
    			id: 9,
    			swipes: 8,
    			type: "country",
    			rotate: "0",
    			pagetitle: "Ghana"
    		},
    		{
    			name: "page10",
    			id: 10,
    			swipes: 9,
    			type: "country",
    			rotate: "-11.25",
    			pagetitle: "Saudi Arabia"
    		},
    		{
    			name: "page11",
    			id: 11,
    			swipes: 10,
    			type: "country",
    			rotate: "-22.5",
    			pagetitle: "India"
    		},
    		{
    			name: "page12",
    			id: 12,
    			swipes: 11,
    			type: "country",
    			rotate: "-33.75",
    			pagetitle: "Cambodia"
    		},
    		{
    			name: "page13",
    			id: 13,
    			swipes: 12,
    			type: "country",
    			rotate: "-45",
    			pagetitle: "South Korea"
    		},
    		{
    			name: "page14",
    			id: 14,
    			swipes: 13,
    			type: "notcountry",
    			rotate: "-56.25",
    			pagetitle: "Environmental Justice"
    		},
    		{
    			name: "page15",
    			id: 15,
    			swipes: 14,
    			type: "notcountry",
    			rotate: "-67.5",
    			pagetitle: "Impact of Individual Action"
    		},
    		{
    			name: "page16",
    			id: 16,
    			swipes: 15,
    			type: "notcountry",
    			rotate: "-78.75",
    			pagetitle: "The Critical Decade:&emsp;III, Pledge"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Timelines,
    		TimelineFuture,
    		TimelinePast,
    		Meter: TopMeter,
    		Footer,
    		Pagetitle,
    		Cover,
    		CriticalDecadeI,
    		Swipeable: Swipable,
    		onMount,
    		initializing,
    		loginProgress,
    		loginSwipeable,
    		pages,
    		$loginProgress
    	});

    	$$self.$inject_state = $$props => {
    		if ("initializing" in $$props) initializing = $$props.initializing;
    		if ("loginProgress" in $$props) $$invalidate(1, loginProgress = $$props.loginProgress);
    		if ("loginSwipeable" in $$props) loginSwipeable = $$props.loginSwipeable;
    		if ("pages" in $$props) $$invalidate(2, pages = $$props.pages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$loginProgress, loginProgress, pages];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
