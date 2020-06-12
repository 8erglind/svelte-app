
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    			attr_dev(div0, "class", "line left line10");
    			add_location(div0, file, 4, 0, 21);
    			attr_dev(div1, "class", "line left line20");
    			add_location(div1, file, 5, 0, 58);
    			attr_dev(div2, "class", "line left line30");
    			add_location(div2, file, 6, 0, 95);
    			attr_dev(div3, "class", "line left line40");
    			add_location(div3, file, 7, 0, 132);
    			attr_dev(div4, "class", "line left line50");
    			add_location(div4, file, 8, 0, 169);
    			attr_dev(div5, "class", "line left line60");
    			add_location(div5, file, 9, 0, 206);
    			attr_dev(div6, "class", "line left line70");
    			add_location(div6, file, 10, 0, 243);
    			attr_dev(div7, "class", "line left line80");
    			add_location(div7, file, 11, 0, 280);
    			attr_dev(div8, "class", "text years left line0 svelte-u2tnsw");
    			add_location(div8, file, 13, 0, 318);
    			attr_dev(div9, "class", "text years left line10 svelte-u2tnsw");
    			add_location(div9, file, 14, 0, 364);
    			attr_dev(div10, "class", "text years left line20 svelte-u2tnsw");
    			add_location(div10, file, 15, 0, 411);
    			attr_dev(div11, "class", "text years left line30 svelte-u2tnsw");
    			add_location(div11, file, 16, 0, 458);
    			attr_dev(div12, "class", "text years left line40 svelte-u2tnsw");
    			add_location(div12, file, 17, 0, 505);
    			attr_dev(div13, "class", "text years left line50 svelte-u2tnsw");
    			add_location(div13, file, 18, 0, 552);
    			attr_dev(div14, "class", "text years left line60 svelte-u2tnsw");
    			add_location(div14, file, 19, 0, 599);
    			attr_dev(div15, "class", "text years left line70 svelte-u2tnsw");
    			add_location(div15, file, 20, 0, 646);
    			attr_dev(div16, "class", "text years left line80 svelte-u2tnsw");
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
    			attr_dev(div0, "class", "line right line10");
    			add_location(div0, file$1, 7, 0, 24);
    			attr_dev(div1, "class", "line right line20");
    			add_location(div1, file$1, 8, 0, 62);
    			attr_dev(div2, "class", "line right line30");
    			add_location(div2, file$1, 9, 0, 100);
    			attr_dev(div3, "class", "line right line40");
    			add_location(div3, file$1, 10, 0, 138);
    			attr_dev(div4, "class", "line right line50");
    			add_location(div4, file$1, 11, 0, 176);
    			attr_dev(div5, "class", "line right line60");
    			add_location(div5, file$1, 12, 0, 214);
    			attr_dev(div6, "class", "line right line70");
    			add_location(div6, file$1, 13, 0, 252);
    			attr_dev(div7, "class", "line right line80");
    			add_location(div7, file$1, 14, 0, 290);
    			attr_dev(div8, "class", "text years right line0 svelte-1tezbys");
    			add_location(div8, file$1, 17, 0, 330);
    			attr_dev(div9, "class", "text years right line10 svelte-1tezbys");
    			add_location(div9, file$1, 18, 0, 377);
    			attr_dev(div10, "class", "text years right line20 svelte-1tezbys");
    			add_location(div10, file$1, 19, 0, 425);
    			attr_dev(div11, "class", "text years right line30 svelte-1tezbys");
    			add_location(div11, file$1, 20, 0, 473);
    			attr_dev(div12, "class", "text years right line40 svelte-1tezbys");
    			add_location(div12, file$1, 21, 0, 521);
    			attr_dev(div13, "class", "text years right line50 svelte-1tezbys");
    			add_location(div13, file$1, 22, 0, 569);
    			attr_dev(div14, "class", "text years right line60 svelte-1tezbys");
    			add_location(div14, file$1, 23, 0, 617);
    			attr_dev(div15, "class", "text years right line70 svelte-1tezbys");
    			add_location(div15, file$1, 24, 0, 665);
    			attr_dev(div16, "class", "text years right line80 svelte-1tezbys");
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
    			attr_dev(div, "class", "tempMeter svelte-11nz4tt");
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
    			attr_dev(div, "class", "footer svelte-erii4r");
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

    /* src/header.svelte generated by Svelte v3.23.0 */

    const file$4 = "src/header.svelte";

    function create_fragment$5(ctx) {
    	let meta0;
    	let t0;
    	let meta1;
    	let t1;
    	let a0;
    	let t2;
    	let a1;
    	let t3;
    	let a2;
    	let t4;
    	let a3;
    	let t5;
    	let a4;
    	let t6;
    	let a5;
    	let t7;
    	let a6;
    	let t8;
    	let a7;
    	let t9;
    	let a8;
    	let t10;
    	let a9;
    	let t11;
    	let a10;
    	let t12;
    	let a11;
    	let t13;
    	let a12;
    	let t14;
    	let a13;
    	let t15;
    	let a14;
    	let t16;
    	let a15;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			t0 = space();
    			meta1 = element("meta");
    			t1 = space();
    			a0 = element("a");
    			t2 = space();
    			a1 = element("a");
    			t3 = space();
    			a2 = element("a");
    			t4 = space();
    			a3 = element("a");
    			t5 = space();
    			a4 = element("a");
    			t6 = space();
    			a5 = element("a");
    			t7 = space();
    			a6 = element("a");
    			t8 = space();
    			a7 = element("a");
    			t9 = space();
    			a8 = element("a");
    			t10 = space();
    			a9 = element("a");
    			t11 = space();
    			a10 = element("a");
    			t12 = space();
    			a11 = element("a");
    			t13 = space();
    			a12 = element("a");
    			t14 = space();
    			a13 = element("a");
    			t15 = space();
    			a14 = element("a");
    			t16 = space();
    			a15 = element("a");
    			attr_dev(meta0, "name", "viewport");
    			attr_dev(meta0, "content", "width=device-width, initial-scale=1");
    			add_location(meta0, file$4, 3, 0, 20);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, height=device-height, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0");
    			add_location(meta1, file$4, 4, 0, 89);
    			attr_dev(a0, "name", "page1");
    			set_style(a0, "position", "absolute");
    			set_style(a0, "top", "0vw");
    			set_style(a0, "left", "0vw");
    			set_style(a0, "width", "100vw");
    			add_location(a0, file$4, 7, 0, 239);
    			attr_dev(a1, "name", "page2");
    			set_style(a1, "position", "absolute");
    			set_style(a1, "top", "0vw");
    			set_style(a1, "left", "100vw");
    			set_style(a1, "width", "100vw");
    			add_location(a1, file$4, 8, 0, 321);
    			attr_dev(a2, "name", "page3");
    			set_style(a2, "position", "absolute");
    			set_style(a2, "top", "0vw");
    			set_style(a2, "left", "200vw");
    			set_style(a2, "width", "100vw");
    			add_location(a2, file$4, 9, 0, 405);
    			attr_dev(a3, "name", "page4");
    			set_style(a3, "position", "absolute");
    			set_style(a3, "top", "0vw");
    			set_style(a3, "left", "300vw");
    			set_style(a3, "width", "100vw");
    			add_location(a3, file$4, 10, 0, 489);
    			attr_dev(a4, "name", "page5");
    			set_style(a4, "position", "absolute");
    			set_style(a4, "top", "0vw");
    			set_style(a4, "left", "400vw");
    			set_style(a4, "width", "100vw");
    			add_location(a4, file$4, 11, 0, 573);
    			attr_dev(a5, "name", "page6");
    			set_style(a5, "position", "absolute");
    			set_style(a5, "top", "0vw");
    			set_style(a5, "left", "500vw");
    			set_style(a5, "width", "100vw");
    			add_location(a5, file$4, 12, 0, 657);
    			attr_dev(a6, "name", "page7");
    			set_style(a6, "position", "absolute");
    			set_style(a6, "top", "0vw");
    			set_style(a6, "left", "600vw");
    			set_style(a6, "width", "100vw");
    			add_location(a6, file$4, 13, 0, 741);
    			attr_dev(a7, "name", "page8");
    			set_style(a7, "position", "absolute");
    			set_style(a7, "top", "0vw");
    			set_style(a7, "left", "700vw");
    			set_style(a7, "width", "100vw");
    			add_location(a7, file$4, 14, 0, 825);
    			attr_dev(a8, "name", "page9");
    			set_style(a8, "position", "absolute");
    			set_style(a8, "top", "0vw");
    			set_style(a8, "left", "800vw");
    			set_style(a8, "width", "100vw");
    			add_location(a8, file$4, 15, 0, 909);
    			attr_dev(a9, "name", "page10");
    			set_style(a9, "position", "absolute");
    			set_style(a9, "top", "0vw");
    			set_style(a9, "left", "900vw");
    			set_style(a9, "width", "100vw");
    			add_location(a9, file$4, 16, 0, 993);
    			attr_dev(a10, "name", "page11");
    			set_style(a10, "position", "absolute");
    			set_style(a10, "top", "0vw");
    			set_style(a10, "left", "1000vw");
    			set_style(a10, "width", "100vw");
    			add_location(a10, file$4, 17, 0, 1078);
    			attr_dev(a11, "name", "page12");
    			set_style(a11, "position", "absolute");
    			set_style(a11, "top", "0vw");
    			set_style(a11, "left", "1100vw");
    			set_style(a11, "width", "100vw");
    			add_location(a11, file$4, 18, 0, 1164);
    			attr_dev(a12, "name", "page13");
    			set_style(a12, "position", "absolute");
    			set_style(a12, "top", "0vw");
    			set_style(a12, "left", "1200vw");
    			set_style(a12, "width", "100vw");
    			add_location(a12, file$4, 19, 0, 1250);
    			attr_dev(a13, "name", "page14");
    			set_style(a13, "position", "absolute");
    			set_style(a13, "top", "0vw");
    			set_style(a13, "left", "1300vw");
    			set_style(a13, "width", "100vw");
    			add_location(a13, file$4, 20, 0, 1336);
    			attr_dev(a14, "name", "page15");
    			set_style(a14, "position", "absolute");
    			set_style(a14, "top", "0vw");
    			set_style(a14, "left", "1400vw");
    			set_style(a14, "width", "100vw");
    			add_location(a14, file$4, 21, 0, 1422);
    			attr_dev(a15, "name", "page16");
    			set_style(a15, "position", "absolute");
    			set_style(a15, "top", "0vw");
    			set_style(a15, "left", "1500vw");
    			set_style(a15, "width", "100vw");
    			add_location(a15, file$4, 22, 0, 1508);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, meta1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, a3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, a4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, a5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, a6, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, a7, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, a8, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, a9, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, a10, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, a11, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, a12, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, a13, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, a14, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, a15, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(meta1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(a3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(a4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(a5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(a6);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(a7);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(a8);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(a9);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(a10);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(a11);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(a12);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(a13);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(a14);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(a15);
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

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/specifics/Cover.svelte generated by Svelte v3.23.0 */
    const file$5 = "src/specifics/Cover.svelte";

    function create_fragment$6(ctx) {
    	let a;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let br;
    	let t4;
    	let t5;
    	let img;
    	let img_src_value;
    	let t6;
    	let div2;
    	let t7;
    	let div4;
    	let div3;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = text("Swipe");
    			br = element("br");
    			t4 = text("↑");
    			t5 = space();
    			img = element("img");
    			t6 = space();
    			div2 = element("div");
    			t7 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[2]);
    			add_location(a, file$5, 15, 0, 273);
    			add_location(br, file$5, 22, 25, 422);
    			attr_dev(div0, "class", "text svelte-eekkh2");
    			add_location(div0, file$5, 22, 2, 399);
    			attr_dev(div1, "class", "pagetitle svelte-eekkh2");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$5, 20, 0, 318);
    			set_style(img, "position", "absolute");
    			set_style(img, "bottom", "10%");
    			set_style(img, "width", "80%");
    			set_style(img, "left", "10%");
    			if (img.src !== (img_src_value = "imgs/fanRaw.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$5, 28, 0, 450);
    			attr_dev(div2, "class", "activedot activedot1");
    			add_location(div2, file$5, 34, 0, 547);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$5, 36, 1, 629);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$5, 35, 0, 588);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(div0, br);
    			append_dev(div0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*prev*/ 4) {
    				attr_dev(a, "href", /*prev*/ ctx[2]);
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div4);
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
    	let { prev } = $$props;
    	const writable_props = ["pagetitleText", "rotate", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cover> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cover", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("prev" in $$props) $$invalidate(2, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		Meter: TopMeter,
    		distanceBLines,
    		marginSides,
    		pagetitleText,
    		rotate,
    		prev
    	});

    	$$self.$inject_state = $$props => {
    		if ("distanceBLines" in $$props) distanceBLines = $$props.distanceBLines;
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("prev" in $$props) $$invalidate(2, prev = $$props.prev);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate, prev];
    }

    class Cover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { pagetitleText: 0, rotate: 1, prev: 2 });

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

    		if (/*prev*/ ctx[2] === undefined && !("prev" in props)) {
    			console.warn("<Cover> was created without expected prop 'prev'");
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

    	get prev() {
    		throw new Error("<Cover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Cover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/ExtremeHeatI.svelte generated by Svelte v3.23.0 */
    const file$6 = "src/specifics/ExtremeHeatI.svelte";

    // (52:0) {#if firstSetup}
    function create_if_block_9(ctx) {
    	let div;
    	let t;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			a = element("a");
    			attr_dev(div, "class", "buttonNext");
    			add_location(div, file$6, 52, 1, 896);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$6, 53, 1, 957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*next*/ 4) {
    				attr_dev(a, "href", /*next*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(52:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (56:0) {#if secondSetup}
    function create_if_block_8(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$6, 56, 1, 1023);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$6, 57, 1, 1083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[14], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(56:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (60:0) {#if thirdSetup}
    function create_if_block_7(ctx) {
    	let a;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = space();
    			div = element("div");
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[3]);
    			add_location(a, file$6, 60, 1, 1166);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$6, 61, 1, 1208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prev*/ 8) {
    				attr_dev(a, "href", /*prev*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(60:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (76:2) {#if firstSetup}
    function create_if_block_6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "It’s June, after the warmest May on record. Its getting warmer, and Extreme heat is becoming more and more common.";
    			attr_dev(div, "class", "text svelte-1lu7rcd");
    			add_location(div, file$6, 76, 3, 1404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(76:2) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (79:2) {#if secondText}
    function create_if_block_5(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "It’s June, after the warmest May on record. Its getting warmer, and Extreme heat is becoming more and more common.";
    			attr_dev(span, "class", "transp");
    			add_location(span, file$6, 79, 21, 1591);
    			attr_dev(div, "class", "text svelte-1lu7rcd");
    			add_location(div, file$6, 79, 3, 1573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(79:2) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (82:2) {#if thirdSetup}
    function create_if_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "With each eccess extremely hot day of 35°C, mortality rates increase by ~ 0,0004%.";
    			attr_dev(div, "class", "text svelte-1lu7rcd");
    			add_location(div, file$6, 82, 3, 1770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(82:2) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (92:0) {#if secondSetup}
    function create_if_block_1(ctx) {
    	let div0;
    	let svg;
    	let polygon0;
    	let polygon1;
    	let polygon2;
    	let polyline;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t8;
    	let t9;
    	let div5;
    	let t10;
    	let t11;
    	let t12;
    	let div6;
    	let t13;
    	let if_block0 = /*temp*/ ctx[7] && create_if_block_3(ctx);
    	let if_block1 = /*temp*/ ctx[7] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			svg = svg_element("svg");
    			polygon0 = svg_element("polygon");
    			polygon1 = svg_element("polygon");
    			polygon2 = svg_element("polygon");
    			polyline = svg_element("polyline");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Humidity");
    			t3 = space();
    			div2 = element("div");
    			t4 = text("0%");
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "100%";
    			t7 = space();
    			div4 = element("div");
    			t8 = text("26,6 °C");
    			t9 = space();
    			div5 = element("div");
    			t10 = text("41.1 °C");
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			div6 = element("div");
    			t13 = text("Extreme Danger");
    			attr_dev(polygon0, "class", "caution svelte-1lu7rcd");
    			set_style(polygon0, "background-color", "yellow");
    			attr_dev(polygon0, "points", "0 0 250 0 250 100 200 100 200 200 150 200 150 400 100 400 100 500 50 500 50 700 0 700 0 0");
    			add_location(polygon0, file$6, 94, 3, 2081);
    			attr_dev(polygon1, "class", "extremeCaution svelte-1lu7rcd");
    			attr_dev(polygon1, "points", "450 0 450 100 400 100 400 200 300 200 300 300 250 300 250 400 200 400 200 500 150 500 150 700 50 700 50 500 100 500 100 400 150 400 150 200 200 200 200 100 250 100 250 0 450 0");
    			add_location(polygon1, file$6, 95, 3, 2244);
    			attr_dev(polygon2, "class", "danger svelte-1lu7rcd");
    			attr_dev(polygon2, "points", "450 0 700 0 700 100 600 100 600 200 500 200 500 300 400 300 400 400 350 400 350 500 300 500 300 600 250 600 250 700 150 700 150 500 200 500 200 400 250 400 250 300 300 300 300 200 400 200 400 100 450 100 450 0");
    			add_location(polygon2, file$6, 96, 3, 2466);
    			attr_dev(polyline, "class", "extremeDanger svelte-1lu7rcd");
    			attr_dev(polyline, "points", "800 700 250 700 250 600 300 600 300 500 350 500 350 400 400 400 400 300 500 300 500 200 600 200 600 100 700 100 700 0 800 0 800 700");
    			add_location(polyline, file$6, 97, 3, 2714);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 800 700");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$6, 93, 2, 1974);
    			attr_dev(div0, "class", "backgroundBox svelte-1lu7rcd");
    			add_location(div0, file$6, 92, 1, 1944);
    			attr_dev(div1, "class", "text humidity humidityTop svelte-1lu7rcd");
    			set_style(div1, "top", "calc(" + /*distanceBLines*/ ctx[9] + " * 1)");
    			set_style(div1, "right", "calc(100vw - " + /*marginSides*/ ctx[10] + ")");
    			set_style(div1, "height", "calc(" + /*distanceBLines*/ ctx[9] + " * 8)");
    			add_location(div1, file$6, 104, 1, 3022);
    			attr_dev(div2, "class", "text humidity svelte-1lu7rcd");
    			set_style(div2, "top", "calc(" + /*distanceBLines*/ ctx[9] + " * 1)");
    			set_style(div2, "left", "5px");
    			add_location(div2, file$6, 105, 1, 3190);
    			attr_dev(div3, "class", "text humidity svelte-1lu7rcd");
    			set_style(div3, "bottom", "0%");
    			set_style(div3, "left", "5px");
    			add_location(div3, file$6, 106, 1, 3279);
    			attr_dev(div4, "class", "text celcius svelte-1lu7rcd");
    			set_style(div4, "bottom", "calc(" + /*distanceBLines*/ ctx[9] + " * 8)");
    			set_style(div4, "left", /*celciusWidth*/ ctx[11]);
    			add_location(div4, file$6, 108, 1, 3350);
    			attr_dev(div5, "class", "text celcius svelte-1lu7rcd");
    			set_style(div5, "bottom", "calc(" + /*distanceBLines*/ ctx[9] + " * 8)");
    			set_style(div5, "right", "calc(" + /*celciusWidth*/ ctx[11] + " * 1)");
    			add_location(div5, file$6, 109, 1, 3457);
    			attr_dev(div6, "class", "text celcius inGraph svelte-1lu7rcd");
    			set_style(div6, "bottom", "calc(" + /*distanceBLines*/ ctx[9] + " * 1)");
    			set_style(div6, "right", /*celciusWidth*/ ctx[11]);
    			set_style(div6, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div6, file$6, 114, 1, 3739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, svg);
    			append_dev(svg, polygon0);
    			append_dev(svg, polygon1);
    			append_dev(svg, polygon2);
    			append_dev(svg, polyline);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, t10);
    			insert_dev(target, t11, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (/*temp*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*temp*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(t12.parentNode, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div6, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t11);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(92:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (102:1) {#if temp}
    function create_if_block_3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Temp.");
    			attr_dev(div, "class", "text celcius celciusTop svelte-1lu7rcd");
    			set_style(div, "bottom", "calc(" + /*distanceBLines*/ ctx[9] + " * 8)");
    			add_location(div, file$6, 102, 2, 2921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(102:1) {#if temp}",
    		ctx
    	});

    	return block;
    }

    // (112:1) {#if temp}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Caution");
    			attr_dev(div, "class", "text celcius inGraph svelte-1lu7rcd");
    			set_style(div, "top", "calc(" + /*distanceBLines*/ ctx[9] + " * 1.5)");
    			set_style(div, "left", /*celciusWidth*/ ctx[11]);
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$6, 112, 2, 3589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(112:1) {#if temp}",
    		ctx
    	});

    	return block;
    }

    // (119:0) {#if thirdSetup}
    function create_if_block(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("35°C");
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "text celcius svelte-1lu7rcd");
    			set_style(div0, "bottom", "calc(" + /*distanceBLines*/ ctx[9] + " * 8)");
    			set_style(div0, "left", "calc(" + /*celciusWidth*/ ctx[11] + " * 9.5)");
    			add_location(div0, file$6, 119, 1, 3916);
    			set_style(div1, "position", "absolute");
    			set_style(div1, "left", "calc(" + /*celciusWidth*/ ctx[11] + " * 10)");
    			set_style(div1, "width", "0px");
    			set_style(div1, "border-right", "1px dotted darkred");
    			set_style(div1, "height", "calc(" + /*distanceBLines*/ ctx[9] + " * 8)");
    			set_style(div1, "top", "calc(" + /*distanceBLines*/ ctx[9] + " * 1)");
    			add_location(div1, file$6, 120, 1, 4032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(119:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let div1;
    	let t10;
    	let div3;
    	let div2;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_9(ctx);
    	let if_block1 = /*secondSetup*/ ctx[5] && create_if_block_8(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[8] && create_if_block_7(ctx);
    	let if_block3 = /*firstSetup*/ ctx[4] && create_if_block_6(ctx);
    	let if_block4 = /*secondText*/ ctx[6] && create_if_block_5(ctx);
    	let if_block5 = /*thirdSetup*/ ctx[8] && create_if_block_4(ctx);
    	let if_block6 = /*secondSetup*/ ctx[5] && create_if_block_1(ctx);
    	let if_block7 = /*thirdSetup*/ ctx[8] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div0 = element("div");
    			t3 = text(/*pagetitleText*/ ctx[0]);
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			t9 = space();
    			div1 = element("div");
    			t10 = space();
    			div3 = element("div");
    			div2 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$6, 73, 0, 1303);
    			attr_dev(div1, "class", "activedot activedot2");
    			add_location(div1, file$6, 130, 0, 4253);
    			attr_dev(div2, "class", "progressline");
    			set_style(div2, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div2, file$6, 132, 1, 4335);
    			attr_dev(div3, "class", "activedotnew activedotFan");
    			add_location(div3, file$6, 131, 0, 4294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div0, t6);
    			if (if_block5) if_block5.m(div0, null);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_6(ctx);
    					if_block3.c();
    					if_block3.m(div0, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*secondText*/ ctx[6]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_5(ctx);
    					if_block4.c();
    					if_block4.m(div0, t6);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*thirdSetup*/ ctx[8]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_4(ctx);
    					if_block5.c();
    					if_block5.m(div0, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_1(ctx);
    					if_block6.c();
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*thirdSetup*/ ctx[8]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block(ctx);
    					if_block7.c();
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div2, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
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
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let celciusWidth = "calc((100vw - (100vw / 8)) / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let secondText = false;
    	let temp = false;
    	let thirdSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondText = false);
    		$$invalidate(7, temp = false);
    		$$invalidate(8, thirdSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
    		$$invalidate(6, secondText = true);
    		$$invalidate(7, temp = true);
    		$$invalidate(8, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
    		$$invalidate(6, secondText = false);
    		$$invalidate(7, temp = false);
    		$$invalidate(8, thirdSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExtremeHeatI> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ExtremeHeatI", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		celciusWidth,
    		firstSetup,
    		secondSetup,
    		secondText,
    		temp,
    		thirdSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(9, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) $$invalidate(10, marginSides = $$props.marginSides);
    		if ("celciusWidth" in $$props) $$invalidate(11, celciusWidth = $$props.celciusWidth);
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(5, secondSetup = $$props.secondSetup);
    		if ("secondText" in $$props) $$invalidate(6, secondText = $$props.secondText);
    		if ("temp" in $$props) $$invalidate(7, temp = $$props.temp);
    		if ("thirdSetup" in $$props) $$invalidate(8, thirdSetup = $$props.thirdSetup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		firstSetup,
    		secondSetup,
    		secondText,
    		temp,
    		thirdSetup,
    		distanceBLines,
    		marginSides,
    		celciusWidth,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	];
    }

    class ExtremeHeatI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExtremeHeatI",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<ExtremeHeatI> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<ExtremeHeatI> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<ExtremeHeatI> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<ExtremeHeatI> was created without expected prop 'prev'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<ExtremeHeatI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<ExtremeHeatI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<ExtremeHeatI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<ExtremeHeatI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<ExtremeHeatI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<ExtremeHeatI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<ExtremeHeatI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<ExtremeHeatI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/ExtremeHeatII.svelte generated by Svelte v3.23.0 */
    const file$7 = "src/specifics/ExtremeHeatII.svelte";

    // (46:0) {#if firstSetup}
    function create_if_block_7$1(ctx) {
    	let div;
    	let t;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			a = element("a");
    			attr_dev(div, "class", "buttonNext");
    			add_location(div, file$7, 46, 1, 821);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$7, 47, 1, 882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*next*/ 4) {
    				attr_dev(a, "href", /*next*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(46:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (50:0) {#if secondSetup}
    function create_if_block_6$1(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$7, 50, 1, 948);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$7, 51, 1, 1008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[12], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(50:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (54:0) {#if thirdSetup}
    function create_if_block_5$1(ctx) {
    	let a;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = space();
    			div = element("div");
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[3]);
    			add_location(a, file$7, 54, 1, 1091);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$7, 55, 1, 1133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prev*/ 8) {
    				attr_dev(a, "href", /*prev*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(54:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (70:2) {#if firstText}
    function create_if_block_4$1(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "When the temperature becomes close to, or highter than that of the human body, the body can no longer easily cool itself down and runs the risk of overheating.";
    			attr_dev(span, "class", "transp");
    			add_location(span, file$7, 70, 21, 1346);
    			attr_dev(div, "class", "text svelte-1yjb17u");
    			add_location(div, file$7, 70, 3, 1328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(70:2) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if secondSetup}
    function create_if_block_3$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "When the temperature becomes close to, or highter than that of the human body, the body can no longer easily cool itself down and runs the risk of overheating.";
    			attr_dev(div, "class", "text svelte-1yjb17u");
    			add_location(div, file$7, 73, 3, 1571);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(73:2) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#if firstSetup}
    function create_if_block_1$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let t5;
    	let div3;
    	let t6;
    	let div4;
    	let t7;
    	let br;
    	let t8;

    	function select_block_type(ctx, dirty) {
    		if (/*thirdSetup*/ ctx[7]) return create_if_block_2$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text("26,6 °C");
    			t2 = space();
    			div2 = element("div");
    			t3 = text("41.1 °C");
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			div3 = element("div");
    			t6 = space();
    			div4 = element("div");
    			t7 = text("body");
    			br = element("br");
    			t8 = text("temp.");
    			attr_dev(div0, "class", "backgroundBox svelte-1yjb17u");
    			add_location(div0, file$7, 84, 1, 1973);
    			attr_dev(div1, "class", "text celcius svelte-1yjb17u");
    			set_style(div1, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div1, "left", /*celciusWidth*/ ctx[9]);
    			add_location(div1, file$7, 87, 1, 2011);
    			attr_dev(div2, "class", "text celcius svelte-1yjb17u");
    			set_style(div2, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div2, "right", "calc(" + /*celciusWidth*/ ctx[9] + " * 1)");
    			add_location(div2, file$7, 88, 1, 2118);
    			set_style(div3, "position", "absolute");
    			set_style(div3, "bottom", "0%");
    			set_style(div3, "top", /*distanceBLines*/ ctx[8]);
    			set_style(div3, "left", "calc(" + /*celciusWidth*/ ctx[9] + " * 11)");
    			set_style(div3, "right", "calc(" + /*celciusWidth*/ ctx[9] + " * 5)");
    			set_style(div3, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div3, "background-color", "rgba(230,230,230)");
    			add_location(div3, file$7, 97, 1, 2578);
    			add_location(br, file$7, 98, 137, 2929);
    			attr_dev(div4, "class", "text celcius svelte-1yjb17u");
    			set_style(div4, "bottom", "0%");
    			set_style(div4, "left", "calc(" + /*celciusWidth*/ ctx[9] + " * 11)");
    			set_style(div4, "right", "calc(" + /*celciusWidth*/ ctx[9] + " * 5)");
    			set_style(div4, "text-align", "center");
    			add_location(div4, file$7, 98, 1, 2793);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t3);
    			insert_dev(target, t4, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t7);
    			append_dev(div4, br);
    			append_dev(div4, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t5.parentNode, t5);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(84:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (92:1) {:else}
    function create_else_block(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("35°C");
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "text celcius svelte-1yjb17u");
    			set_style(div0, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div0, "left", "calc(" + /*celciusWidth*/ ctx[9] + " * 9.5)");
    			add_location(div0, file$7, 92, 1, 2264);
    			set_style(div1, "position", "absolute");
    			set_style(div1, "left", "calc(" + /*celciusWidth*/ ctx[9] + " * 10)");
    			set_style(div1, "width", "0px");
    			set_style(div1, "border-right", "1px dotted darkred");
    			set_style(div1, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div1, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 1)");
    			add_location(div1, file$7, 93, 1, 2380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(92:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (91:1) {#if thirdSetup}
    function create_if_block_2$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(91:1) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (102:0) {#if thirdSetup}
    function create_if_block$1(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Caution");
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Extreme Danger");
    			attr_dev(div0, "class", "text celcius inGraph svelte-1yjb17u");
    			set_style(div0, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 1.5)");
    			set_style(div0, "left", /*celciusWidth*/ ctx[9]);
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$7, 102, 1, 2970);
    			attr_dev(div1, "class", "text celcius inGraph svelte-1yjb17u");
    			set_style(div1, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 1.5)");
    			set_style(div1, "right", /*celciusWidth*/ ctx[9]);
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$7, 103, 1, 3113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(102:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div1;
    	let t9;
    	let div3;
    	let div2;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_7$1(ctx);
    	let if_block1 = /*secondSetup*/ ctx[6] && create_if_block_6$1(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[7] && create_if_block_5$1(ctx);
    	let if_block3 = /*firstText*/ ctx[5] && create_if_block_4$1(ctx);
    	let if_block4 = /*secondSetup*/ ctx[6] && create_if_block_3$1(ctx);
    	let if_block5 = /*firstSetup*/ ctx[4] && create_if_block_1$1(ctx);
    	let if_block6 = /*thirdSetup*/ ctx[7] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div0 = element("div");
    			t3 = text(/*pagetitleText*/ ctx[0]);
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			div1 = element("div");
    			t9 = space();
    			div3 = element("div");
    			div2 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$7, 67, 0, 1228);
    			attr_dev(div1, "class", "activedot activedot3");
    			add_location(div1, file$7, 113, 0, 3299);
    			attr_dev(div2, "class", "progressline");
    			set_style(div2, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div2, file$7, 115, 1, 3381);
    			attr_dev(div3, "class", "activedotnew activedotFan");
    			add_location(div3, file$7, 114, 0, 3340);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block4) if_block4.m(div0, null);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6$1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5$1(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (/*firstText*/ ctx[5]) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_4$1(ctx);
    					if_block3.c();
    					if_block3.m(div0, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*secondSetup*/ ctx[6]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_3$1(ctx);
    					if_block4.c();
    					if_block4.m(div0, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_1$1(ctx);
    					if_block5.c();
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdSetup*/ ctx[7]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block$1(ctx);
    					if_block6.c();
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div2, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
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
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let celciusWidth = "calc((100vw - (100vw / 8)) / 16)";
    	let firstSetup = true;
    	let firstText = true;
    	let secondSetup = false;
    	let thirdSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, firstText = true);
    		$$invalidate(6, secondSetup = false);
    		$$invalidate(7, thirdSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, firstText = false);
    		$$invalidate(6, secondSetup = true);
    		$$invalidate(7, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, firstText = false);
    		$$invalidate(6, secondSetup = true);
    		$$invalidate(7, thirdSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExtremeHeatII> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ExtremeHeatII", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		celciusWidth,
    		firstSetup,
    		firstText,
    		secondSetup,
    		thirdSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(8, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("celciusWidth" in $$props) $$invalidate(9, celciusWidth = $$props.celciusWidth);
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("firstText" in $$props) $$invalidate(5, firstText = $$props.firstText);
    		if ("secondSetup" in $$props) $$invalidate(6, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(7, thirdSetup = $$props.thirdSetup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		firstSetup,
    		firstText,
    		secondSetup,
    		thirdSetup,
    		distanceBLines,
    		celciusWidth,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	];
    }

    class ExtremeHeatII extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExtremeHeatII",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<ExtremeHeatII> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<ExtremeHeatII> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<ExtremeHeatII> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<ExtremeHeatII> was created without expected prop 'prev'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<ExtremeHeatII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<ExtremeHeatII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<ExtremeHeatII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<ExtremeHeatII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<ExtremeHeatII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<ExtremeHeatII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<ExtremeHeatII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<ExtremeHeatII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/CriticalDecadeI.svelte generated by Svelte v3.23.0 */
    const file$8 = "src/specifics/CriticalDecadeI.svelte";

    // (53:0) {#if firstText}
    function create_if_block_10(ctx) {
    	let div;
    	let t;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			a = element("a");
    			attr_dev(div, "class", "buttonNext");
    			add_location(div, file$8, 53, 1, 929);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$8, 54, 1, 990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*next*/ 4) {
    				attr_dev(a, "href", /*next*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(53:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (57:0) {#if secondText}
    function create_if_block_9$1(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$8, 57, 1, 1055);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$8, 58, 1, 1115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[14], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(57:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#if thirdText}
    function create_if_block_8$1(ctx) {
    	let a;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = space();
    			div = element("div");
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[3]);
    			add_location(a, file$8, 61, 1, 1197);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$8, 62, 1, 1239);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prev*/ 8) {
    				attr_dev(a, "href", /*prev*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(61:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (79:2) {#if firstText}
    function create_if_block_7$2(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Since 1880 Earth’s average global temperature has increased by 1,1 - 1,3°C. \n \t\t\t");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Two-thirds of that warming happened in the last 45 years. The Paris Agreement aims to limit warming to + 1,5°C.";
    			add_location(br, file$8, 81, 4, 1550);
    			attr_dev(span, "class", "transp");
    			add_location(span, file$8, 82, 4, 1559);
    			attr_dev(div, "class", "text svelte-1emori2");
    			add_location(div, file$8, 79, 3, 1436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(79:2) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (88:2) {#if secondText}
    function create_if_block_6$2(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let br;
    	let t1;
    	let span1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text("Since 1880 Earth’s average global temperature has increased by 1,1 - 1,3°C. \n \t\t\t\t");
    			br = element("br");
    			t1 = text("\n \t\t\tTwo-thirds of that warming happened in the last 45 years. \n \t\t\t");
    			span1 = element("span");
    			span1.textContent = "The Paris Agreement aims to limit warming to + 1,5°C.";
    			add_location(br, file$8, 91, 5, 1907);
    			attr_dev(span0, "class", "transp");
    			add_location(span0, file$8, 89, 4, 1788);
    			attr_dev(span1, "class", "transp");
    			add_location(span1, file$8, 94, 4, 1996);
    			attr_dev(div, "class", "text svelte-1emori2");
    			add_location(div, file$8, 88, 3, 1765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, br);
    			append_dev(div, t1);
    			append_dev(div, span1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(88:2) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (100:2) {#if thirdText}
    function create_if_block_5$2(ctx) {
    	let div;
    	let span;
    	let t0;
    	let br;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text("Since 1880 Earth’s average global temperature has increased by 1,1 - 1,3°C.");
    			br = element("br");
    			t1 = text(" Two-thirds of that warming happened in the last 45 years. ");
    			t2 = text("The Paris Agreement aims to limit warming to + 1,5°C.");
    			add_location(br, file$8, 100, 127, 2262);
    			attr_dev(span, "class", "transp");
    			add_location(span, file$8, 100, 21, 2156);
    			attr_dev(div, "class", "text svelte-1emori2");
    			add_location(div, file$8, 100, 3, 2138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, br);
    			append_dev(span, t1);
    			append_dev(div, t2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(100:2) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (120:1) {#if thirdText}
    function create_if_block_4$2(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "1,5°C";
    			attr_dev(span, "class", "tempnumber text svelte-1emori2");
    			add_location(span, file$8, 121, 3, 2761);
    			attr_dev(div, "class", "temperature svelte-1emori2");
    			set_style(div, "width", "100%");
    			set_style(div, "background-color", "rgba(0,0,0,0)", 1);
    			set_style(div, "border", "none");
    			add_location(div, file$8, 120, 2, 2653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(120:1) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (130:0) {#if firstText}
    function create_if_block_3$2(ctx) {
    	let t;
    	let div;
    	let current;
    	const timelinepast = new TimelinePast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinepast.$$.fragment);
    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "verticalLine fromTop svelte-1emori2");
    			set_style(div, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthA*/ ctx[10] + ")");
    			set_style(div, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 9)");
    			add_location(div, file$8, 132, 1, 2946);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinepast, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: noop,
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
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(130:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (140:0) {#if secondLines}
    function create_if_block_1$2(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let t3;
    	let div3;
    	let if_block = /*secondText*/ ctx[5] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "verticalLine fromTop svelte-1emori2");
    			set_style(div0, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthB*/ ctx[11] + ")");
    			set_style(div0, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			add_location(div0, file$8, 140, 1, 3148);
    			attr_dev(div1, "class", "horizontalLine svelte-1emori2");
    			set_style(div1, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthB*/ ctx[11] + ")");
    			set_style(div1, "width", "calc(" + /*tempWidthA*/ ctx[10] + " - " + /*tempWidthB*/ ctx[11] + ")");
    			set_style(div1, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			add_location(div1, file$8, 141, 1, 3278);
    			attr_dev(div2, "class", "verticalLine svelte-1emori2");
    			set_style(div2, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthA*/ ctx[10] + ")");
    			set_style(div2, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			set_style(div2, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			add_location(div2, file$8, 142, 1, 3441);
    			attr_dev(div3, "class", "line left line45 svelte-1emori2");
    			add_location(div3, file$8, 146, 1, 3672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*secondText*/ ctx[5]) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(t3.parentNode, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(140:0) {#if secondLines}",
    		ctx
    	});

    	return block;
    }

    // (144:1) {#if secondText}
    function create_if_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "1975";
    			attr_dev(div, "class", "text years left line45 svelte-1emori2");
    			add_location(div, file$8, 144, 2, 3617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(144:1) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (151:0) {#if thirdText}
    function create_if_block$2(ctx) {
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let current;
    	const timelinefuture = new TimelineFuture({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinefuture.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "2020";
    			attr_dev(div0, "class", "verticalLine fromTop svelte-1emori2");
    			set_style(div0, "right", /*marginSides*/ ctx[9]);
    			set_style(div0, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 9)");
    			add_location(div0, file$8, 152, 1, 3769);
    			attr_dev(div1, "class", "text years right line0 svelte-1emori2");
    			add_location(div1, file$8, 153, 1, 3877);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinefuture, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinefuture.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinefuture.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinefuture, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(151:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div1;
    	let t8;
    	let div3;
    	let div2;
    	let span;
    	let t10;
    	let t11;
    	let div4;
    	let t12;
    	let t13;
    	let t14;
    	let div5;
    	let t16;
    	let t17;
    	let t18;
    	let div6;
    	let t19;
    	let div8;
    	let div7;
    	let current;
    	let if_block0 = /*firstText*/ ctx[4] && create_if_block_10(ctx);
    	let if_block1 = /*secondText*/ ctx[5] && create_if_block_9$1(ctx);
    	let if_block2 = /*thirdText*/ ctx[6] && create_if_block_8$1(ctx);
    	let if_block3 = /*firstText*/ ctx[4] && create_if_block_7$2(ctx);
    	let if_block4 = /*secondText*/ ctx[5] && create_if_block_6$2(ctx);
    	let if_block5 = /*thirdText*/ ctx[6] && create_if_block_5$2(ctx);
    	let if_block6 = /*thirdText*/ ctx[6] && create_if_block_4$2(ctx);
    	let if_block7 = /*firstText*/ ctx[4] && create_if_block_3$2(ctx);
    	let if_block8 = /*secondLines*/ ctx[7] && create_if_block_1$2(ctx);
    	let if_block9 = /*thirdText*/ ctx[6] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div0 = element("div");
    			t3 = text(/*pagetitleText*/ ctx[0]);
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			div1 = element("div");
    			t8 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "1,2°C";
    			t10 = space();
    			if (if_block6) if_block6.c();
    			t11 = space();
    			div4 = element("div");
    			t12 = text("↑");
    			t13 = space();
    			if (if_block7) if_block7.c();
    			t14 = space();
    			div5 = element("div");
    			div5.textContent = "2020";
    			t16 = space();
    			if (if_block8) if_block8.c();
    			t17 = space();
    			if (if_block9) if_block9.c();
    			t18 = space();
    			div6 = element("div");
    			t19 = space();
    			div8 = element("div");
    			div7 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$8, 76, 0, 1336);
    			attr_dev(div1, "class", "backgroundBox svelte-1emori2");
    			add_location(div1, file$8, 111, 0, 2452);
    			attr_dev(span, "class", "tempnumber text svelte-1emori2");
    			add_location(span, file$8, 117, 2, 2583);
    			attr_dev(div2, "class", "temperature svelte-1emori2");
    			set_style(div2, "width", "calc(" + /*tempWidthA*/ ctx[10] + " - 1px)");
    			add_location(div2, file$8, 116, 1, 2514);
    			attr_dev(div3, "class", "tempMeter");
    			add_location(div3, file$8, 115, 0, 2489);
    			attr_dev(div4, "class", "arrow text svelte-1emori2");
    			set_style(div4, "width", /*marginSides*/ ctx[9]);
    			add_location(div4, file$8, 125, 0, 2827);
    			attr_dev(div5, "class", "text years left line0 svelte-1emori2");
    			add_location(div5, file$8, 136, 0, 3081);
    			attr_dev(div6, "class", "activedot activedot5");
    			add_location(div6, file$8, 165, 0, 3959);
    			attr_dev(div7, "class", "progressline");
    			set_style(div7, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div7, file$8, 167, 1, 4041);
    			attr_dev(div8, "class", "activedotnew activedotFan");
    			add_location(div8, file$8, 166, 0, 4000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div0, t6);
    			if (if_block5) if_block5.m(div0, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			append_dev(div3, t10);
    			if (if_block6) if_block6.m(div3, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t12);
    			insert_dev(target, t13, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t16, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t17, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstText*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9$1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8$1(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (/*firstText*/ ctx[4]) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_7$2(ctx);
    					if_block3.c();
    					if_block3.m(div0, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_6$2(ctx);
    					if_block4.c();
    					if_block4.m(div0, t6);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_5$2(ctx);
    					if_block5.c();
    					if_block5.m(div0, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block_4$2(ctx);
    					if_block6.c();
    					if_block6.m(div3, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*firstText*/ ctx[4]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty & /*firstText*/ 16) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_3$2(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(t14.parentNode, t14);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*secondLines*/ ctx[7]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_1$2(ctx);
    					if_block8.c();
    					if_block8.m(t17.parentNode, t17);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);

    					if (dirty & /*thirdText*/ 64) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block$2(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(t18.parentNode, t18);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div7, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block7);
    			transition_in(if_block9);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block7);
    			transition_out(if_block9);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div3);
    			if (if_block6) if_block6.d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t13);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t16);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t17);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div8);
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
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let tempWidthA = "calc((100vw - (100vw / 8)) / 15 * 12)";
    	let tempWidthB = "calc(((100vw - (100vw / 8)) / 15 * 10) / 3 * 1)";
    	let firstText = true;
    	let secondText = false;
    	let thirdText = false;
    	let secondLines = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstText = true);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, secondLines = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = true);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, secondLines = true);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalDecadeI> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CriticalDecadeI", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		TimelineFuture,
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		tempWidthA,
    		tempWidthB,
    		firstText,
    		secondText,
    		thirdText,
    		secondLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(8, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) $$invalidate(9, marginSides = $$props.marginSides);
    		if ("tempWidthA" in $$props) $$invalidate(10, tempWidthA = $$props.tempWidthA);
    		if ("tempWidthB" in $$props) $$invalidate(11, tempWidthB = $$props.tempWidthB);
    		if ("firstText" in $$props) $$invalidate(4, firstText = $$props.firstText);
    		if ("secondText" in $$props) $$invalidate(5, secondText = $$props.secondText);
    		if ("thirdText" in $$props) $$invalidate(6, thirdText = $$props.thirdText);
    		if ("secondLines" in $$props) $$invalidate(7, secondLines = $$props.secondLines);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		firstText,
    		secondText,
    		thirdText,
    		secondLines,
    		distanceBLines,
    		marginSides,
    		tempWidthA,
    		tempWidthB,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	];
    }

    class CriticalDecadeI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalDecadeI",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<CriticalDecadeI> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<CriticalDecadeI> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<CriticalDecadeI> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<CriticalDecadeI> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<CriticalDecadeI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<CriticalDecadeI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<CriticalDecadeI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<CriticalDecadeI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/CriticalDecadeII.svelte generated by Svelte v3.23.0 */
    const file$9 = "src/specifics/CriticalDecadeII.svelte";

    // (135:0) {#if firstText}
    function create_if_block_23(ctx) {
    	let div;
    	let t;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			a = element("a");
    			attr_dev(div, "class", "buttonNext");
    			add_location(div, file$9, 135, 1, 2474);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$9, 136, 1, 2535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*next*/ 4) {
    				attr_dev(a, "href", /*next*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(135:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (139:0) {#if secondText}
    function create_if_block_22(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$9, 139, 1, 2600);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 140, 1, 2660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[20], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(139:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (143:0) {#if thirdText}
    function create_if_block_21(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$9, 143, 1, 2742);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 144, 1, 2803);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefourthSetup*/ ctx[21], false, false, false),
    					listen_dev(div1, "click", /*togglesecondSetup*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(143:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (147:0) {#if fourthText}
    function create_if_block_20(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$9, 147, 1, 2887);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 148, 1, 2947);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefifthSetup*/ ctx[22], false, false, false),
    					listen_dev(div1, "click", /*togglethirdSetup*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(147:0) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (151:0) {#if fifthText}
    function create_if_block_19(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$9, 151, 1, 3029);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 152, 1, 3089);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglesixthSetup*/ ctx[23], false, false, false),
    					listen_dev(div1, "click", /*togglefourthSetup*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(151:0) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (155:0) {#if sixthText}
    function create_if_block_18(ctx) {
    	let a;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = space();
    			div = element("div");
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[3]);
    			add_location(a, file$9, 155, 1, 3172);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$9, 156, 1, 3214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglefifthSetup*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prev*/ 8) {
    				attr_dev(a, "href", /*prev*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(155:0) {#if sixthText}",
    		ctx
    	});

    	return block;
    }

    // (174:2) {#if firstText}
    function create_if_block_17(ctx) {
    	let div;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Emissions have risen steadily since the industrial revolution. ");
    			span = element("span");
    			span.textContent = "With our current level of emissions we have reached our limit. From now on we must reduce.";
    			attr_dev(span, "class", "transp");
    			add_location(span, file$9, 174, 84, 3492);
    			attr_dev(div, "class", "text svelte-1hxy7sn");
    			add_location(div, file$9, 174, 3, 3411);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(174:2) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (177:2) {#if secondText}
    function create_if_block_16(ctx) {
    	let div;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Emissions have risen steadily since the industrial revolution. With our current level of emissions we have reached our limit. ");
    			span = element("span");
    			span.textContent = "From now on we must reduce.";
    			attr_dev(span, "class", "transp");
    			add_location(span, file$9, 177, 147, 3791);
    			attr_dev(div, "class", "text svelte-1hxy7sn");
    			add_location(div, file$9, 177, 3, 3647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(177:2) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (180:2) {#if thirdText}
    function create_if_block_15(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Emissions have risen steadily since the industrial revolution. With our current level of emissions we have reached our limit. From now on we must reduce.";
    			attr_dev(div, "class", "text svelte-1hxy7sn");
    			add_location(div, file$9, 180, 3, 3882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(180:2) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (183:2) {#if fourthText}
    function create_if_block_14(ctx) {
    	let div;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("To limit warming to 1,5°C, global CO2 emissions must have reached net-zero by 2050. ");
    			span = element("span");
    			span.textContent = "To reach net-zero by 2050, emissions must be halved by 2030.";
    			attr_dev(span, "class", "transp");
    			add_location(span, file$9, 183, 110, 4197);
    			attr_dev(div, "class", "text svelte-1hxy7sn");
    			add_location(div, file$9, 183, 3, 4090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(183:2) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (186:2) {#if fifthText}
    function create_if_block_13(ctx) {
    	let div;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "To limit warming to 1,5°C, global CO2 emissions must have reached net-zero by 2050. ";
    			t1 = text("To reach net-zero by 2050, emissions must be halved by 2030.");
    			attr_dev(span, "class", "transp");
    			add_location(span, file$9, 186, 21, 4339);
    			attr_dev(div, "class", "text svelte-1hxy7sn");
    			add_location(div, file$9, 186, 3, 4321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(186:2) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (198:1) {#if emissionGraph}
    function create_if_block_12(ctx) {
    	let svg;
    	let polyline;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polyline = svg_element("polyline");
    			attr_dev(polyline, "class", "cls-1");
    			attr_dev(polyline, "points", "365 748.07 0 748.07 0 0 68.47 0 78.61 94.09 111.59 187 148.35 280 194.96 374.03 224.21 467.1 252.83 561.07 331.85 654.03");
    			add_location(polyline, file$9, 199, 3, 4728);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 748.07");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$9, 198, 2, 4618);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polyline);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(198:1) {#if emissionGraph}",
    		ctx
    	});

    	return block;
    }

    // (203:1) {#if fourthText}
    function create_if_block_11(ctx) {
    	let svg;
    	let polygon;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "class", "cls-2");
    			attr_dev(polygon, "points", "365 748.07 0 748.07 0 467.1 365 748.07");
    			add_location(polygon, file$9, 204, 3, 5030);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 748.07");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$9, 203, 2, 4920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(203:1) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (208:1) {#if fifthText}
    function create_if_block_10$1(ctx) {
    	let svg;
    	let polygon;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "class", "cls-2");
    			attr_dev(polygon, "points", "365 748.07 0 748.07 0 467.1 182.5 654.03 365 748.07");
    			add_location(polygon, file$9, 209, 3, 5248);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 748.07");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$9, 208, 2, 5138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(208:1) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (220:1) {#if fullMeter}
    function create_if_block_9$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "temperature fullMeter svelte-1hxy7sn");
    			add_location(div, file$9, 220, 2, 5405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(220:1) {#if fullMeter}",
    		ctx
    	});

    	return block;
    }

    // (223:1) {#if halfMeter}
    function create_if_block_8$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "temperature halfMeter svelte-1hxy7sn");
    			add_location(div, file$9, 223, 2, 5473);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(223:1) {#if halfMeter}",
    		ctx
    	});

    	return block;
    }

    // (233:0) {#if secondText}
    function create_if_block_7$3(ctx) {
    	let t0;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let current;
    	const timelinepast = new TimelinePast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinepast.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "2020";
    			t2 = space();
    			div1 = element("div");
    			t3 = text("↑");
    			attr_dev(div0, "class", "text years left line0 svelte-1hxy7sn");
    			add_location(div0, file$9, 234, 1, 5740);
    			attr_dev(div1, "class", "arrow text svelte-1hxy7sn");
    			set_style(div1, "width", /*marginSides*/ ctx[17]);
    			add_location(div1, file$9, 235, 1, 5787);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinepast, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t3);
    			current = true;
    		},
    		p: noop,
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(233:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (239:0) {#if thirdText}
    function create_if_block_6$3(ctx) {
    	let current;
    	const timelinefuture = new TimelineFuture({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinefuture.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinefuture, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinefuture.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinefuture.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinefuture, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(239:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (243:0) {#if year20}
    function create_if_block_5$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "2020";
    			attr_dev(div, "class", "text years right line0 svelte-1hxy7sn");
    			add_location(div, file$9, 243, 1, 5933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(243:0) {#if year20}",
    		ctx
    	});

    	return block;
    }

    // (248:0) {#if fourthText}
    function create_if_block_4$3(ctx) {
    	let div0;
    	let t0;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "2050";
    			attr_dev(div0, "class", "horizontalLine left svelte-1hxy7sn");
    			set_style(div0, "width", "100%");
    			set_style(div0, "top", "calc((" + /*distanceBLines*/ ctx[16] + " * 6) - 1px)");
    			add_location(div0, file$9, 248, 1, 6006);
    			attr_dev(div1, "class", "text years right line30 svelte-1hxy7sn");
    			add_location(div1, file$9, 249, 1, 6109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(248:0) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (253:0) {#if line50}
    function create_if_block_3$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line right line30 svelte-1hxy7sn");
    			add_location(div, file$9, 253, 1, 6178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(253:0) {#if line50}",
    		ctx
    	});

    	return block;
    }

    // (256:0) {#if line30}
    function create_if_block_2$3(ctx) {
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "2030";
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "text years right line10 svelte-1hxy7sn");
    			add_location(div0, file$9, 256, 1, 6236);
    			attr_dev(div1, "class", "line right line10 svelte-1hxy7sn");
    			add_location(div1, file$9, 257, 1, 6285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(256:0) {#if line30}",
    		ctx
    	});

    	return block;
    }

    // (264:0) {#if fifthText}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "horizontalLine left svelte-1hxy7sn");
    			set_style(div, "width", "100%");
    			set_style(div, "top", "calc((" + /*distanceBLines*/ ctx[16] + " * 8) - 1px)");
    			add_location(div, file$9, 264, 1, 6350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(264:0) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (267:0) {#if sixthText}
    function create_if_block$3(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text("This is a Critical Decade.");
    			attr_dev(div0, "class", "horizontalLine left svelte-1hxy7sn");
    			set_style(div0, "width", "100%");
    			set_style(div0, "top", "calc((" + /*distanceBLines*/ ctx[16] + " * 8) - 1px)");
    			set_style(div0, "border-top", "1px solid blue");
    			add_location(div0, file$9, 267, 1, 6475);
    			attr_dev(div1, "class", "text criticalText svelte-1hxy7sn");
    			set_style(div1, "left", /*marginSides*/ ctx[17]);
    			set_style(div1, "right", /*marginSides*/ ctx[17]);
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[16] + " * 8)");
    			add_location(div1, file$9, 268, 1, 6606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(267:0) {#if sixthText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div0;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let div1;
    	let t13;
    	let t14;
    	let t15;
    	let div3;
    	let t16;
    	let t17;
    	let div2;
    	let span0;
    	let t19;
    	let span1;
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let t26;
    	let t27;
    	let t28;
    	let t29;
    	let div4;
    	let t30;
    	let div6;
    	let div5;
    	let current;
    	let if_block0 = /*firstText*/ ctx[4] && create_if_block_23(ctx);
    	let if_block1 = /*secondText*/ ctx[5] && create_if_block_22(ctx);
    	let if_block2 = /*thirdText*/ ctx[6] && create_if_block_21(ctx);
    	let if_block3 = /*fourthText*/ ctx[7] && create_if_block_20(ctx);
    	let if_block4 = /*fifthText*/ ctx[8] && create_if_block_19(ctx);
    	let if_block5 = /*sixthText*/ ctx[15] && create_if_block_18(ctx);
    	let if_block6 = /*firstText*/ ctx[4] && create_if_block_17(ctx);
    	let if_block7 = /*secondText*/ ctx[5] && create_if_block_16(ctx);
    	let if_block8 = /*thirdText*/ ctx[6] && create_if_block_15(ctx);
    	let if_block9 = /*fourthText*/ ctx[7] && create_if_block_14(ctx);
    	let if_block10 = /*fifthText*/ ctx[8] && create_if_block_13(ctx);
    	let if_block11 = /*emissionGraph*/ ctx[9] && create_if_block_12(ctx);
    	let if_block12 = /*fourthText*/ ctx[7] && create_if_block_11(ctx);
    	let if_block13 = /*fifthText*/ ctx[8] && create_if_block_10$1(ctx);
    	let if_block14 = /*fullMeter*/ ctx[10] && create_if_block_9$2(ctx);
    	let if_block15 = /*halfMeter*/ ctx[11] && create_if_block_8$2(ctx);
    	let if_block16 = /*secondText*/ ctx[5] && create_if_block_7$3(ctx);
    	let if_block17 = /*thirdText*/ ctx[6] && create_if_block_6$3(ctx);
    	let if_block18 = /*year20*/ ctx[12] && create_if_block_5$3(ctx);
    	let if_block19 = /*fourthText*/ ctx[7] && create_if_block_4$3(ctx);
    	let if_block20 = /*line50*/ ctx[13] && create_if_block_3$3(ctx);
    	let if_block21 = /*line30*/ ctx[14] && create_if_block_2$3(ctx);
    	let if_block22 = /*fifthText*/ ctx[8] && create_if_block_1$3(ctx);
    	let if_block23 = /*sixthText*/ ctx[15] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			div0 = element("div");
    			t6 = text(/*pagetitleText*/ ctx[0]);
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			t9 = space();
    			if (if_block8) if_block8.c();
    			t10 = space();
    			if (if_block9) if_block9.c();
    			t11 = space();
    			if (if_block10) if_block10.c();
    			t12 = space();
    			div1 = element("div");
    			if (if_block11) if_block11.c();
    			t13 = space();
    			if (if_block12) if_block12.c();
    			t14 = space();
    			if (if_block13) if_block13.c();
    			t15 = space();
    			div3 = element("div");
    			if (if_block14) if_block14.c();
    			t16 = space();
    			if (if_block15) if_block15.c();
    			t17 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "current level emissions";
    			t19 = space();
    			span1 = element("span");
    			span1.textContent = "net-zero";
    			t21 = space();
    			if (if_block16) if_block16.c();
    			t22 = space();
    			if (if_block17) if_block17.c();
    			t23 = space();
    			if (if_block18) if_block18.c();
    			t24 = space();
    			if (if_block19) if_block19.c();
    			t25 = space();
    			if (if_block20) if_block20.c();
    			t26 = space();
    			if (if_block21) if_block21.c();
    			t27 = space();
    			if (if_block22) if_block22.c();
    			t28 = space();
    			if (if_block23) if_block23.c();
    			t29 = space();
    			div4 = element("div");
    			t30 = space();
    			div6 = element("div");
    			div5 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$9, 171, 0, 3311);
    			attr_dev(div1, "class", "backgroundBox svelte-1hxy7sn");
    			add_location(div1, file$9, 196, 0, 4567);
    			attr_dev(span0, "class", "tempnumber text svelte-1hxy7sn");
    			add_location(span0, file$9, 226, 2, 5560);
    			attr_dev(span1, "class", "tempnumber left text svelte-1hxy7sn");
    			add_location(span1, file$9, 227, 2, 5623);
    			attr_dev(div2, "class", "temperature infotext svelte-1hxy7sn");
    			add_location(div2, file$9, 225, 1, 5523);
    			attr_dev(div3, "class", "tempMeter svelte-1hxy7sn");
    			add_location(div3, file$9, 218, 0, 5362);
    			attr_dev(div4, "class", "activedot activedot6");
    			add_location(div4, file$9, 280, 0, 6790);
    			attr_dev(div5, "class", "progressline");
    			set_style(div5, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div5, file$9, 282, 1, 6872);
    			attr_dev(div6, "class", "activedotnew activedotFan");
    			add_location(div6, file$9, 281, 0, 6831);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t6);
    			append_dev(div0, t7);
    			if (if_block6) if_block6.m(div0, null);
    			append_dev(div0, t8);
    			if (if_block7) if_block7.m(div0, null);
    			append_dev(div0, t9);
    			if (if_block8) if_block8.m(div0, null);
    			append_dev(div0, t10);
    			if (if_block9) if_block9.m(div0, null);
    			append_dev(div0, t11);
    			if (if_block10) if_block10.m(div0, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block11) if_block11.m(div1, null);
    			append_dev(div1, t13);
    			if (if_block12) if_block12.m(div1, null);
    			append_dev(div1, t14);
    			if (if_block13) if_block13.m(div1, null);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block14) if_block14.m(div3, null);
    			append_dev(div3, t16);
    			if (if_block15) if_block15.m(div3, null);
    			append_dev(div3, t17);
    			append_dev(div3, div2);
    			append_dev(div2, span0);
    			append_dev(div2, t19);
    			append_dev(div2, span1);
    			insert_dev(target, t21, anchor);
    			if (if_block16) if_block16.m(target, anchor);
    			insert_dev(target, t22, anchor);
    			if (if_block17) if_block17.m(target, anchor);
    			insert_dev(target, t23, anchor);
    			if (if_block18) if_block18.m(target, anchor);
    			insert_dev(target, t24, anchor);
    			if (if_block19) if_block19.m(target, anchor);
    			insert_dev(target, t25, anchor);
    			if (if_block20) if_block20.m(target, anchor);
    			insert_dev(target, t26, anchor);
    			if (if_block21) if_block21.m(target, anchor);
    			insert_dev(target, t27, anchor);
    			if (if_block22) if_block22.m(target, anchor);
    			insert_dev(target, t28, anchor);
    			if (if_block23) if_block23.m(target, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstText*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_23(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_22(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_21(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fourthText*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_20(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*fifthText*/ ctx[8]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_19(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*sixthText*/ ctx[15]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_18(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t6, /*pagetitleText*/ ctx[0]);

    			if (/*firstText*/ ctx[4]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block_17(ctx);
    					if_block6.c();
    					if_block6.m(div0, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block7) ; else {
    					if_block7 = create_if_block_16(ctx);
    					if_block7.c();
    					if_block7.m(div0, t9);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block8) ; else {
    					if_block8 = create_if_block_15(ctx);
    					if_block8.c();
    					if_block8.m(div0, t10);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*fourthText*/ ctx[7]) {
    				if (if_block9) ; else {
    					if_block9 = create_if_block_14(ctx);
    					if_block9.c();
    					if_block9.m(div0, t11);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*fifthText*/ ctx[8]) {
    				if (if_block10) ; else {
    					if_block10 = create_if_block_13(ctx);
    					if_block10.c();
    					if_block10.m(div0, null);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*emissionGraph*/ ctx[9]) {
    				if (if_block11) ; else {
    					if_block11 = create_if_block_12(ctx);
    					if_block11.c();
    					if_block11.m(div1, t13);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*fourthText*/ ctx[7]) {
    				if (if_block12) ; else {
    					if_block12 = create_if_block_11(ctx);
    					if_block12.c();
    					if_block12.m(div1, t14);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*fifthText*/ ctx[8]) {
    				if (if_block13) ; else {
    					if_block13 = create_if_block_10$1(ctx);
    					if_block13.c();
    					if_block13.m(div1, null);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*fullMeter*/ ctx[10]) {
    				if (if_block14) ; else {
    					if_block14 = create_if_block_9$2(ctx);
    					if_block14.c();
    					if_block14.m(div3, t16);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (/*halfMeter*/ ctx[11]) {
    				if (if_block15) ; else {
    					if_block15 = create_if_block_8$2(ctx);
    					if_block15.c();
    					if_block15.m(div3, t17);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);

    					if (dirty & /*secondText*/ 32) {
    						transition_in(if_block16, 1);
    					}
    				} else {
    					if_block16 = create_if_block_7$3(ctx);
    					if_block16.c();
    					transition_in(if_block16, 1);
    					if_block16.m(t22.parentNode, t22);
    				}
    			} else if (if_block16) {
    				group_outros();

    				transition_out(if_block16, 1, 1, () => {
    					if_block16 = null;
    				});

    				check_outros();
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block17) {
    					if (dirty & /*thirdText*/ 64) {
    						transition_in(if_block17, 1);
    					}
    				} else {
    					if_block17 = create_if_block_6$3(ctx);
    					if_block17.c();
    					transition_in(if_block17, 1);
    					if_block17.m(t23.parentNode, t23);
    				}
    			} else if (if_block17) {
    				group_outros();

    				transition_out(if_block17, 1, 1, () => {
    					if_block17 = null;
    				});

    				check_outros();
    			}

    			if (/*year20*/ ctx[12]) {
    				if (if_block18) ; else {
    					if_block18 = create_if_block_5$3(ctx);
    					if_block18.c();
    					if_block18.m(t24.parentNode, t24);
    				}
    			} else if (if_block18) {
    				if_block18.d(1);
    				if_block18 = null;
    			}

    			if (/*fourthText*/ ctx[7]) {
    				if (if_block19) {
    					if_block19.p(ctx, dirty);
    				} else {
    					if_block19 = create_if_block_4$3(ctx);
    					if_block19.c();
    					if_block19.m(t25.parentNode, t25);
    				}
    			} else if (if_block19) {
    				if_block19.d(1);
    				if_block19 = null;
    			}

    			if (/*line50*/ ctx[13]) {
    				if (if_block20) ; else {
    					if_block20 = create_if_block_3$3(ctx);
    					if_block20.c();
    					if_block20.m(t26.parentNode, t26);
    				}
    			} else if (if_block20) {
    				if_block20.d(1);
    				if_block20 = null;
    			}

    			if (/*line30*/ ctx[14]) {
    				if (if_block21) ; else {
    					if_block21 = create_if_block_2$3(ctx);
    					if_block21.c();
    					if_block21.m(t27.parentNode, t27);
    				}
    			} else if (if_block21) {
    				if_block21.d(1);
    				if_block21 = null;
    			}

    			if (/*fifthText*/ ctx[8]) {
    				if (if_block22) {
    					if_block22.p(ctx, dirty);
    				} else {
    					if_block22 = create_if_block_1$3(ctx);
    					if_block22.c();
    					if_block22.m(t28.parentNode, t28);
    				}
    			} else if (if_block22) {
    				if_block22.d(1);
    				if_block22 = null;
    			}

    			if (/*sixthText*/ ctx[15]) {
    				if (if_block23) {
    					if_block23.p(ctx, dirty);
    				} else {
    					if_block23 = create_if_block$3(ctx);
    					if_block23.c();
    					if_block23.m(t29.parentNode, t29);
    				}
    			} else if (if_block23) {
    				if_block23.d(1);
    				if_block23 = null;
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div5, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block16);
    			transition_in(if_block17);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block16);
    			transition_out(if_block17);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div0);
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div1);
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div3);
    			if (if_block14) if_block14.d();
    			if (if_block15) if_block15.d();
    			if (detaching) detach_dev(t21);
    			if (if_block16) if_block16.d(detaching);
    			if (detaching) detach_dev(t22);
    			if (if_block17) if_block17.d(detaching);
    			if (detaching) detach_dev(t23);
    			if (if_block18) if_block18.d(detaching);
    			if (detaching) detach_dev(t24);
    			if (if_block19) if_block19.d(detaching);
    			if (detaching) detach_dev(t25);
    			if (if_block20) if_block20.d(detaching);
    			if (detaching) detach_dev(t26);
    			if (if_block21) if_block21.d(detaching);
    			if (detaching) detach_dev(t27);
    			if (if_block22) if_block22.d(detaching);
    			if (detaching) detach_dev(t28);
    			if (if_block23) if_block23.d(detaching);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";

    	//let tempWidthA = 'calc((100vw - (100vw / 8)) / 15 * 12)';
    	//let tempWidthB = 'calc(((100vw - (100vw / 8)) / 15 * 10) / 3 * 2)';
    	let firstText = true;

    	let secondText = false;
    	let thirdText = false;
    	let fourthText = false;
    	let fifthText = false;
    	let emissionGraph = false;
    	let fullMeter = false;
    	let halfMeter = false;
    	let year20 = false;
    	let line50 = false;
    	let line30 = false;
    	let sixthText = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstText = true);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, fourthText = false);
    		$$invalidate(8, fifthText = false);
    		$$invalidate(9, emissionGraph = false);
    		$$invalidate(10, fullMeter = false);
    		$$invalidate(11, halfMeter = false);
    		$$invalidate(13, line50 = false);
    		$$invalidate(14, line30 = false);
    		$$invalidate(12, year20 = false);
    		$$invalidate(15, sixthText = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = true);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, fourthText = false);
    		$$invalidate(8, fifthText = false);
    		$$invalidate(9, emissionGraph = true);
    		$$invalidate(10, fullMeter = true);
    		$$invalidate(11, halfMeter = false);
    		$$invalidate(13, line50 = false);
    		$$invalidate(14, line30 = false);
    		$$invalidate(12, year20 = false);
    		$$invalidate(15, sixthText = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = true);
    		$$invalidate(7, fourthText = false);
    		$$invalidate(8, fifthText = false);
    		$$invalidate(9, emissionGraph = true);
    		$$invalidate(10, fullMeter = true);
    		$$invalidate(11, halfMeter = false);
    		$$invalidate(13, line50 = false);
    		$$invalidate(14, line30 = false);
    		$$invalidate(12, year20 = true);
    		$$invalidate(15, sixthText = false);
    	};

    	const togglefourthSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, fourthText = true);
    		$$invalidate(8, fifthText = false);
    		$$invalidate(9, emissionGraph = true);
    		$$invalidate(10, fullMeter = false);
    		$$invalidate(11, halfMeter = false);
    		$$invalidate(13, line50 = true);
    		$$invalidate(14, line30 = false);
    		$$invalidate(12, year20 = true);
    		$$invalidate(15, sixthText = false);
    	};

    	const togglefifthSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, fourthText = false);
    		$$invalidate(8, fifthText = true);
    		$$invalidate(9, emissionGraph = true);
    		$$invalidate(10, fullMeter = false);
    		$$invalidate(11, halfMeter = true);
    		$$invalidate(13, line50 = true);
    		$$invalidate(14, line30 = true);
    		$$invalidate(12, year20 = true);
    		$$invalidate(15, sixthText = false);
    	};

    	const togglesixthSetup = () => {
    		$$invalidate(4, firstText = false);
    		$$invalidate(5, secondText = false);
    		$$invalidate(6, thirdText = false);
    		$$invalidate(7, fourthText = false);
    		$$invalidate(8, fifthText = true);
    		$$invalidate(9, emissionGraph = true);
    		$$invalidate(10, fullMeter = false);
    		$$invalidate(11, halfMeter = true);
    		$$invalidate(13, line50 = false);
    		$$invalidate(14, line30 = true);
    		$$invalidate(12, year20 = true);
    		$$invalidate(15, sixthText = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalDecadeII> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CriticalDecadeII", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		TimelinePast,
    		TimelineFuture,
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstText,
    		secondText,
    		thirdText,
    		fourthText,
    		fifthText,
    		emissionGraph,
    		fullMeter,
    		halfMeter,
    		year20,
    		line50,
    		line30,
    		sixthText,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup,
    		togglesixthSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(16, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) $$invalidate(17, marginSides = $$props.marginSides);
    		if ("firstText" in $$props) $$invalidate(4, firstText = $$props.firstText);
    		if ("secondText" in $$props) $$invalidate(5, secondText = $$props.secondText);
    		if ("thirdText" in $$props) $$invalidate(6, thirdText = $$props.thirdText);
    		if ("fourthText" in $$props) $$invalidate(7, fourthText = $$props.fourthText);
    		if ("fifthText" in $$props) $$invalidate(8, fifthText = $$props.fifthText);
    		if ("emissionGraph" in $$props) $$invalidate(9, emissionGraph = $$props.emissionGraph);
    		if ("fullMeter" in $$props) $$invalidate(10, fullMeter = $$props.fullMeter);
    		if ("halfMeter" in $$props) $$invalidate(11, halfMeter = $$props.halfMeter);
    		if ("year20" in $$props) $$invalidate(12, year20 = $$props.year20);
    		if ("line50" in $$props) $$invalidate(13, line50 = $$props.line50);
    		if ("line30" in $$props) $$invalidate(14, line30 = $$props.line30);
    		if ("sixthText" in $$props) $$invalidate(15, sixthText = $$props.sixthText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		firstText,
    		secondText,
    		thirdText,
    		fourthText,
    		fifthText,
    		emissionGraph,
    		fullMeter,
    		halfMeter,
    		year20,
    		line50,
    		line30,
    		sixthText,
    		distanceBLines,
    		marginSides,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup,
    		togglesixthSetup
    	];
    }

    class CriticalDecadeII extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalDecadeII",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<CriticalDecadeII> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<CriticalDecadeII> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<CriticalDecadeII> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<CriticalDecadeII> was created without expected prop 'prev'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<CriticalDecadeII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<CriticalDecadeII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<CriticalDecadeII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<CriticalDecadeII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<CriticalDecadeII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<CriticalDecadeII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<CriticalDecadeII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<CriticalDecadeII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/USA.svelte generated by Svelte v3.23.0 */

    const file$a = "src/specifics/USA.svelte";

    // (52:0) {#if firstSetup}
    function create_if_block_5$4(ctx) {
    	let div;
    	let t;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			a = element("a");
    			attr_dev(div, "class", "buttonNext");
    			add_location(div, file$a, 52, 1, 743);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$a, 53, 1, 805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondASetup*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*next*/ 4) {
    				attr_dev(a, "href", /*next*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$4.name,
    		type: "if",
    		source: "(52:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (56:0) {#if secondSetupA}
    function create_if_block_4$4(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttonNext");
    			add_location(div0, file$a, 56, 1, 872);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$a, 57, 1, 934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglesecondBSetup*/ ctx[10], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(56:0) {#if secondSetupA}",
    		ctx
    	});

    	return block;
    }

    // (60:0) {#if secondSetupB}
    function create_if_block_3$4(ctx) {
    	let a;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = space();
    			div = element("div");
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[3]);
    			add_location(a, file$a, 60, 1, 1019);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$a, 61, 1, 1061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondASetup*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prev*/ 8) {
    				attr_dev(a, "href", /*prev*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(60:0) {#if secondSetupB}",
    		ctx
    	});

    	return block;
    }

    // (87:0) {#if firstSetup}
    function create_if_block_2$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "horizontalLine left");
    			set_style(div, "width", "100%");
    			set_style(div, "top", "calc((" + /*distanceBLines*/ ctx[7] + " * 8) - 1px)");
    			set_style(div, "border-top", "1px solid blue");
    			add_location(div, file$a, 87, 1, 1479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(87:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (91:0) {#if secondSetupA}
    function create_if_block_1$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "fullpage svelte-18rc1ap");
    			set_style(div, "top", /*distanceBLines*/ ctx[7]);
    			add_location(div, file$a, 91, 1, 1792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(91:0) {#if secondSetupA}",
    		ctx
    	});

    	return block;
    }

    // (94:0) {#if secondSetupB}
    function create_if_block$4(ctx) {
    	let svg;
    	let polygon;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$a, 95, 2, 1987);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$a, 94, 1, 1878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(94:0) {#if secondSetupB}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let div0;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let div2;
    	let t10;
    	let div4;
    	let div3;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_5$4(ctx);
    	let if_block1 = /*secondSetupA*/ ctx[5] && create_if_block_4$4(ctx);
    	let if_block2 = /*secondSetupB*/ ctx[6] && create_if_block_3$4(ctx);
    	let if_block3 = /*firstSetup*/ ctx[4] && create_if_block_2$4(ctx);
    	let if_block4 = /*secondSetupA*/ ctx[5] && create_if_block_1$4(ctx);
    	let if_block5 = /*secondSetupB*/ ctx[6] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div1 = element("div");
    			t3 = text(/*pagetitleText*/ ctx[0]);
    			t4 = space();
    			div0 = element("div");
    			div0.textContent = "At the this is written, protests are happening all over the U.S. (and the world), calling for an end to racial injustice and defunding/abolishion of the police.";
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			div2 = element("div");
    			t10 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$a, 75, 2, 1238);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$a, 73, 0, 1157);
    			attr_dev(div2, "class", "activedot activedot15");
    			add_location(div2, file$a, 118, 0, 2511);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$a, 120, 1, 2594);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$a, 119, 0, 2553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			insert_dev(target, t6, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$4(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetupA*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$4(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*secondSetupB*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$4(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$4(ctx);
    					if_block3.c();
    					if_block3.m(t7.parentNode, t7);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*secondSetupA*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$4(ctx);
    					if_block4.c();
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetupB*/ ctx[6]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block$4(ctx);
    					if_block5.c();
    					if_block5.m(t9.parentNode, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetupA = false;
    	let secondSetupB = false;
    	let thirdSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetupA = false);
    		$$invalidate(6, secondSetupB = false);
    		thirdSetup = false;
    	};

    	const togglesecondASetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetupA = true);
    		$$invalidate(6, secondSetupB = false);
    		thirdSetup = false;
    	};

    	const togglesecondBSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetupA = true);
    		$$invalidate(6, secondSetupB = true);
    		thirdSetup = true;
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<USA> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("USA", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstSetup,
    		secondSetupA,
    		secondSetupB,
    		thirdSetup,
    		togglefirstSetup,
    		togglesecondASetup,
    		togglesecondBSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(7, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetupA" in $$props) $$invalidate(5, secondSetupA = $$props.secondSetupA);
    		if ("secondSetupB" in $$props) $$invalidate(6, secondSetupB = $$props.secondSetupB);
    		if ("thirdSetup" in $$props) thirdSetup = $$props.thirdSetup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		firstSetup,
    		secondSetupA,
    		secondSetupB,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondASetup,
    		togglesecondBSetup
    	];
    }

    class USA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "USA",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<USA> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<USA> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<USA> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<USA> was created without expected prop 'prev'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<USA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<USA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<USA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<USA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<USA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<USA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<USA>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<USA>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/TimelineEmpty.svelte generated by Svelte v3.23.0 */

    const file$b = "src/specifics/TimelineEmpty.svelte";

    function create_fragment$c(ctx) {
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
    	let t8;
    	let div9;
    	let t9;
    	let div10;
    	let t10;
    	let div11;
    	let t11;
    	let div12;
    	let t12;
    	let div13;
    	let t13;
    	let div14;
    	let t14;
    	let div15;

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
    			t8 = space();
    			div9 = element("div");
    			t9 = space();
    			div10 = element("div");
    			t10 = space();
    			div11 = element("div");
    			t11 = space();
    			div12 = element("div");
    			t12 = space();
    			div13 = element("div");
    			t13 = space();
    			div14 = element("div");
    			t14 = space();
    			div15 = element("div");
    			attr_dev(div0, "class", "line left line10");
    			add_location(div0, file$b, 4, 0, 21);
    			attr_dev(div1, "class", "line left line20");
    			add_location(div1, file$b, 5, 0, 58);
    			attr_dev(div2, "class", "line left line30");
    			add_location(div2, file$b, 6, 0, 95);
    			attr_dev(div3, "class", "line left line40");
    			add_location(div3, file$b, 7, 0, 132);
    			attr_dev(div4, "class", "line left line50");
    			add_location(div4, file$b, 8, 0, 169);
    			attr_dev(div5, "class", "line left line60");
    			add_location(div5, file$b, 9, 0, 206);
    			attr_dev(div6, "class", "line left line70");
    			add_location(div6, file$b, 10, 0, 243);
    			attr_dev(div7, "class", "line left line80");
    			add_location(div7, file$b, 11, 0, 280);
    			attr_dev(div8, "class", "line right line10");
    			add_location(div8, file$b, 13, 0, 318);
    			attr_dev(div9, "class", "line right line20");
    			add_location(div9, file$b, 14, 0, 356);
    			attr_dev(div10, "class", "line right line30");
    			add_location(div10, file$b, 15, 0, 394);
    			attr_dev(div11, "class", "line right line40");
    			add_location(div11, file$b, 16, 0, 432);
    			attr_dev(div12, "class", "line right line50");
    			add_location(div12, file$b, 17, 0, 470);
    			attr_dev(div13, "class", "line right line60");
    			add_location(div13, file$b, 18, 0, 508);
    			attr_dev(div14, "class", "line right line70");
    			add_location(div14, file$b, 19, 0, 546);
    			attr_dev(div15, "class", "line right line80");
    			add_location(div15, file$b, 20, 0, 584);
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
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div9, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div10, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div14, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div15, anchor);
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
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div15);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimelineEmpty> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TimelineEmpty", $$slots, []);
    	return [];
    }

    class TimelineEmpty extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimelineEmpty",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/specifics/Brazil.svelte generated by Svelte v3.23.0 */
    const file$c = "src/specifics/Brazil.svelte";

    function create_fragment$d(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let svg;
    	let polygon;
    	let t4;
    	let div2;
    	let t5;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$c, 13, 2, 240);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$c, 11, 0, 159);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 279 0 279 300 336 600 336 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$c, 23, 1, 387);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$c, 22, 0, 279);
    			attr_dev(div2, "class", "activedot activedot14");
    			add_location(div2, file$c, 33, 0, 531);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$c, 35, 1, 614);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$c, 34, 0, 573);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Brazil> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Brazil", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class Brazil extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Brazil",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Brazil> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Brazil> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<Brazil>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<Brazil>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Brazil>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Brazil>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Iceland.svelte generated by Svelte v3.23.0 */
    const file$d = "src/specifics/Iceland.svelte";

    function create_fragment$e(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let div2;
    	let t4;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$d, 13, 2, 240);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$d, 11, 0, 159);
    			attr_dev(div2, "class", "activedot activedot12");
    			add_location(div2, file$d, 25, 0, 282);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$d, 27, 1, 365);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$d, 26, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Iceland> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Iceland", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class Iceland extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Iceland",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Iceland> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Iceland> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<Iceland>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<Iceland>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Iceland>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Iceland>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Ghana.svelte generated by Svelte v3.23.0 */
    const file$e = "src/specifics/Ghana.svelte";

    function create_fragment$f(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let svg;
    	let polygon;
    	let t4;
    	let div2;
    	let t5;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$e, 13, 2, 240);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$e, 11, 0, 159);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 269 0 269 300 320 600 320 900 342 900 342 1200 365 1200");
    			add_location(polygon, file$e, 23, 1, 387);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$e, 22, 0, 279);
    			attr_dev(div2, "class", "activedot activedot11");
    			add_location(div2, file$e, 28, 0, 526);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$e, 30, 1, 609);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$e, 29, 0, 568);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ghana> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Ghana", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class Ghana extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ghana",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Ghana> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Ghana> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<Ghana>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<Ghana>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Ghana>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Ghana>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/SaudiArabia.svelte generated by Svelte v3.23.0 */
    const file$f = "src/specifics/SaudiArabia.svelte";

    function create_fragment$g(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let svg;
    	let polygon;
    	let t4;
    	let div2;
    	let t5;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$f, 14, 2, 241);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$f, 12, 0, 160);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 292 0 292 300 328 600 328 900 344 900 344 1200 365 1200");
    			add_location(polygon, file$f, 20, 1, 384);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$f, 19, 0, 276);
    			attr_dev(div2, "class", "activedot activedot10");
    			add_location(div2, file$f, 26, 0, 524);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$f, 28, 1, 607);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$f, 27, 0, 566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SaudiArabia> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SaudiArabia", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class SaudiArabia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SaudiArabia",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<SaudiArabia> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<SaudiArabia> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<SaudiArabia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<SaudiArabia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<SaudiArabia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<SaudiArabia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/India.svelte generated by Svelte v3.23.0 */
    const file$g = "src/specifics/India.svelte";

    function create_fragment$h(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let svg;
    	let polygon;
    	let t4;
    	let div2;
    	let t5;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$g, 15, 2, 242);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$g, 13, 0, 161);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200.5 365 900.5 365 600.5 365 300.5 365 0.5 263 0.5 263 300.5 326 600.5 326 900.5 347 900.5 347 1200.5 365 1200.5");
    			add_location(polygon, file$g, 22, 1, 386);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$g, 21, 0, 278);
    			attr_dev(div2, "class", "activedot activedot8");
    			add_location(div2, file$g, 29, 0, 551);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$g, 31, 1, 633);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$g, 30, 0, 592);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<India> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("India", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class India extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "India",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<India> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<India> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<India>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<India>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<India>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<India>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Cambodia.svelte generated by Svelte v3.23.0 */
    const file$h = "src/specifics/Cambodia.svelte";

    function create_fragment$i(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let svg;
    	let polygon;
    	let t4;
    	let div2;
    	let t5;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$h, 15, 2, 242);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$h, 13, 0, 161);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 184 0 184 300 300 600 300 900 331 900 331 1200 365 1200");
    			add_location(polygon, file$h, 23, 1, 387);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$h, 22, 0, 279);
    			attr_dev(div2, "class", "activedot activedot7");
    			add_location(div2, file$h, 31, 0, 529);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$h, 33, 1, 611);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$h, 32, 0, 570);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cambodia> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cambodia", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class Cambodia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cambodia",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Cambodia> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Cambodia> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<Cambodia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<Cambodia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Cambodia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Cambodia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/SouthKorea.svelte generated by Svelte v3.23.0 */
    const file$i = "src/specifics/SouthKorea.svelte";

    function create_fragment$j(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let svg;
    	let polygon;
    	let t4;
    	let img;
    	let img_src_value;
    	let t5;
    	let div2;
    	let t6;
    	let div4;
    	let div3;
    	let current;
    	const timelinesempty = new TimelineEmpty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinesempty.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t4 = space();
    			img = element("img");
    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$i, 14, 2, 241);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$i, 12, 0, 160);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 346 0 346 300 363 600 363 900 365 900 365 1200 365 1200");
    			add_location(polygon, file$i, 23, 1, 387);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$i, 22, 0, 279);
    			if (img.src !== (img_src_value = "https://dimg.donga.com/egc/CDB/CHINESE/Article/20/07/06/07/2007060738918.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$i, 29, 0, 527);
    			attr_dev(div2, "class", "activedot activedot4");
    			add_location(div2, file$i, 36, 0, 622);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$i, 38, 1, 704);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$i, 37, 0, 663);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(timelinesempty, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timelinesempty.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timelinesempty.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timelinesempty, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SouthKorea> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SouthKorea", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate, TimelinesEmpty: TimelineEmpty });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class SouthKorea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SouthKorea",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<SouthKorea> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<SouthKorea> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<SouthKorea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<SouthKorea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<SouthKorea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<SouthKorea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/EnvironmentalJustice.svelte generated by Svelte v3.23.0 */

    const file$j = "src/specifics/EnvironmentalJustice.svelte";

    function create_fragment$k(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div2;
    	let t3;
    	let div4;
    	let div3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*pagetitleText*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$j, 11, 2, 152);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$j, 9, 0, 71);
    			attr_dev(div2, "class", "activedot activedot13");
    			add_location(div2, file$j, 14, 0, 185);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$j, 16, 1, 268);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$j, 15, 0, 227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t0, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EnvironmentalJustice> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EnvironmentalJustice", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class EnvironmentalJustice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EnvironmentalJustice",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<EnvironmentalJustice> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<EnvironmentalJustice> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<EnvironmentalJustice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<EnvironmentalJustice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<EnvironmentalJustice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<EnvironmentalJustice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/ImpactofIndividualAction.svelte generated by Svelte v3.23.0 */

    const file$k = "src/specifics/ImpactofIndividualAction.svelte";

    function create_fragment$l(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div2;
    	let t3;
    	let div4;
    	let div3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*pagetitleText*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$k, 11, 2, 152);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$k, 9, 0, 71);
    			attr_dev(div2, "class", "activedot activedot9");
    			add_location(div2, file$k, 14, 0, 185);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$k, 16, 1, 267);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$k, 15, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t0, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImpactofIndividualAction> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ImpactofIndividualAction", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class ImpactofIndividualAction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImpactofIndividualAction",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<ImpactofIndividualAction> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<ImpactofIndividualAction> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/CriticalDecadeIII.svelte generated by Svelte v3.23.0 */

    const file$l = "src/specifics/CriticalDecadeIII.svelte";

    function create_fragment$m(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div2;
    	let t3;
    	let div5;
    	let div3;
    	let t4;
    	let div4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*pagetitleText*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t4 = space();
    			div4 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$l, 11, 2, 152);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$l, 9, 0, 71);
    			attr_dev(div2, "class", "activedot activedot16");
    			add_location(div2, file$l, 14, 0, 185);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + "))");
    			add_location(div3, file$l, 16, 1, 268);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$l, 17, 1, 352);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$l, 15, 0, 227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t0, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + "))");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalDecadeIII> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CriticalDecadeIII", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	$$self.$capture_state = () => ({ pagetitleText, rotate });

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate];
    }

    class CriticalDecadeIII extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalDecadeIII",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<CriticalDecadeIII> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<CriticalDecadeIII> was created without expected prop 'rotate'");
    		}
    	}

    	get pagetitleText() {
    		throw new Error("<CriticalDecadeIII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagetitleText(value) {
    		throw new Error("<CriticalDecadeIII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<CriticalDecadeIII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<CriticalDecadeIII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.0 */
    const file$m = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (92:2) {#each pages as page (page.id)}
    function create_each_block(key_1, ctx) {
    	let a;
    	let a_href_value;
    	let a_class_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "href", a_href_value = "#" + /*page*/ ctx[1].name);
    			attr_dev(a, "class", a_class_value = "dot dot" + /*page*/ ctx[1].id + " svelte-79f9jq");
    			add_location(a, file$m, 92, 3, 5588);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(92:2) {#each pages as page (page.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let t0;
    	let div17;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let t4;
    	let div4;
    	let t5;
    	let div5;
    	let t6;
    	let div6;
    	let t7;
    	let div7;
    	let t8;
    	let div8;
    	let t9;
    	let div9;
    	let t10;
    	let div10;
    	let t11;
    	let div11;
    	let t12;
    	let div12;
    	let t13;
    	let div13;
    	let t14;
    	let div14;
    	let t15;
    	let div15;
    	let t16;
    	let div16;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t17;
    	let current;
    	const header = new Header({ $$inline: true });

    	const criticaldecadeiii = new CriticalDecadeIII({
    			props: {
    				pagetitleText: "Critical Decade: III, Pledge",
    				rotate: "90deg",
    				next: "#page2"
    			},
    			$$inline: true
    		});

    	const usa = new USA({
    			props: {
    				pagetitleText: "The U.S.",
    				rotate: "78.75deg",
    				next: "#page3",
    				prev: "#page1"
    			},
    			$$inline: true
    		});

    	const brazil = new Brazil({
    			props: {
    				pagetitleText: "Brazil",
    				rotate: "67.5deg",
    				next: "#page4",
    				prev: "#page2"
    			},
    			$$inline: true
    		});

    	const environmentaljustice = new EnvironmentalJustice({
    			props: {
    				pagetitleText: "Environmental Justice",
    				rotate: "56.25deg",
    				next: "#page5",
    				prev: "#page3"
    			},
    			$$inline: true
    		});

    	const iceland = new Iceland({
    			props: {
    				pagetitleText: "Iceland",
    				rotate: "45deg",
    				next: "#page6",
    				prev: "#page4"
    			},
    			$$inline: true
    		});

    	const ghana = new Ghana({
    			props: {
    				pagetitleText: "Ghana",
    				rotate: "33.75deg",
    				next: "#page7",
    				prev: "#page5"
    			},
    			$$inline: true
    		});

    	const saudiarabia = new SaudiArabia({
    			props: {
    				pagetitleText: "SaudiArabia",
    				rotate: "22.5deg",
    				next: "#page8",
    				prev: "#page6"
    			},
    			$$inline: true
    		});

    	const impactofindividualaction = new ImpactofIndividualAction({
    			props: {
    				pagetitleText: "Impact of Individual Action",
    				rotate: "11.25deg",
    				next: "#page9",
    				prev: "#page7"
    			},
    			$$inline: true
    		});

    	const india = new India({
    			props: {
    				pagetitleText: "India",
    				rotate: "0deg",
    				next: "#page10",
    				prev: "#page8"
    			},
    			$$inline: true
    		});

    	const cambodia = new Cambodia({
    			props: {
    				pagetitleText: "Cambodia",
    				rotate: "-11.25deg",
    				next: "#page11",
    				prev: "#page9"
    			},
    			$$inline: true
    		});

    	const criticaldecadeii = new CriticalDecadeII({
    			props: {
    				pagetitleText: "The Critical Decade: II",
    				rotate: "-22.5deg",
    				next: "#page12",
    				prev: "#page10"
    			},
    			$$inline: true
    		});

    	const criticaldecadei = new CriticalDecadeI({
    			props: {
    				pagetitleText: "The Critical Decade: I",
    				rotate: "-33.75deg",
    				next: "#page13",
    				prev: "#page11"
    			},
    			$$inline: true
    		});

    	const southkorea = new SouthKorea({
    			props: {
    				pagetitleText: "SouthKorea",
    				rotate: "-45deg",
    				next: "#page14",
    				prev: "#page12"
    			},
    			$$inline: true
    		});

    	const extremeheatii = new ExtremeHeatII({
    			props: {
    				pagetitleText: "Extreme heat: II",
    				rotate: "-56.25deg",
    				next: "#page15",
    				prev: "#page13"
    			},
    			$$inline: true
    		});

    	const extremeheati = new ExtremeHeatI({
    			props: {
    				pagetitleText: "Extreme heat: I",
    				rotate: "-67.5deg",
    				next: "#page16",
    				prev: "#page14"
    			},
    			$$inline: true
    		});

    	const cover = new Cover({
    			props: {
    				pagetitleText: "Cover",
    				rotate: "-78.75deg",
    				prev: "#page15"
    			},
    			$$inline: true
    		});

    	let each_value = /*pages*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*page*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div17 = element("div");
    			div0 = element("div");
    			create_component(criticaldecadeiii.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(usa.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(brazil.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			create_component(environmentaljustice.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			create_component(iceland.$$.fragment);
    			t5 = space();
    			div5 = element("div");
    			create_component(ghana.$$.fragment);
    			t6 = space();
    			div6 = element("div");
    			create_component(saudiarabia.$$.fragment);
    			t7 = space();
    			div7 = element("div");
    			create_component(impactofindividualaction.$$.fragment);
    			t8 = space();
    			div8 = element("div");
    			create_component(india.$$.fragment);
    			t9 = space();
    			div9 = element("div");
    			create_component(cambodia.$$.fragment);
    			t10 = space();
    			div10 = element("div");
    			create_component(criticaldecadeii.$$.fragment);
    			t11 = space();
    			div11 = element("div");
    			create_component(criticaldecadei.$$.fragment);
    			t12 = space();
    			div12 = element("div");
    			create_component(southkorea.$$.fragment);
    			t13 = space();
    			div13 = element("div");
    			create_component(extremeheatii.$$.fragment);
    			t14 = space();
    			div14 = element("div");
    			create_component(extremeheati.$$.fragment);
    			t15 = space();
    			div15 = element("div");
    			create_component(cover.$$.fragment);
    			t16 = space();
    			div16 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t17 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$m, 71, 1, 3406);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file$m, 72, 1, 3553);
    			attr_dev(div2, "class", "content");
    			add_location(div2, file$m, 73, 1, 3664);
    			attr_dev(div3, "class", "content");
    			add_location(div3, file$m, 74, 1, 3778);
    			attr_dev(div4, "class", "content");
    			add_location(div4, file$m, 75, 1, 3936);
    			attr_dev(div5, "class", "content");
    			add_location(div5, file$m, 76, 1, 4051);
    			attr_dev(div6, "class", "content");
    			add_location(div6, file$m, 77, 1, 4163);
    			attr_dev(div7, "class", "content");
    			add_location(div7, file$m, 78, 1, 4292);
    			attr_dev(div8, "class", "content");
    			add_location(div8, file$m, 79, 1, 4464);
    			attr_dev(div9, "class", "content");
    			add_location(div9, file$m, 80, 1, 4573);
    			attr_dev(div10, "class", "content");
    			add_location(div10, file$m, 81, 1, 4696);
    			attr_dev(div11, "class", "content");
    			add_location(div11, file$m, 82, 1, 4855);
    			attr_dev(div12, "class", "content");
    			add_location(div12, file$m, 83, 1, 5012);
    			attr_dev(div13, "class", "content");
    			add_location(div13, file$m, 84, 1, 5139);
    			attr_dev(div14, "class", "content");
    			add_location(div14, file$m, 85, 1, 5286);
    			attr_dev(div15, "class", "content");
    			add_location(div15, file$m, 86, 1, 5429);
    			attr_dev(div16, "class", "dots svelte-79f9jq");
    			add_location(div16, file$m, 90, 1, 5532);
    			attr_dev(div17, "class", "newmain");
    			add_location(div17, file$m, 63, 0, 3204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div0);
    			mount_component(criticaldecadeiii, div0, null);
    			append_dev(div17, t1);
    			append_dev(div17, div1);
    			mount_component(usa, div1, null);
    			append_dev(div17, t2);
    			append_dev(div17, div2);
    			mount_component(brazil, div2, null);
    			append_dev(div17, t3);
    			append_dev(div17, div3);
    			mount_component(environmentaljustice, div3, null);
    			append_dev(div17, t4);
    			append_dev(div17, div4);
    			mount_component(iceland, div4, null);
    			append_dev(div17, t5);
    			append_dev(div17, div5);
    			mount_component(ghana, div5, null);
    			append_dev(div17, t6);
    			append_dev(div17, div6);
    			mount_component(saudiarabia, div6, null);
    			append_dev(div17, t7);
    			append_dev(div17, div7);
    			mount_component(impactofindividualaction, div7, null);
    			append_dev(div17, t8);
    			append_dev(div17, div8);
    			mount_component(india, div8, null);
    			append_dev(div17, t9);
    			append_dev(div17, div9);
    			mount_component(cambodia, div9, null);
    			append_dev(div17, t10);
    			append_dev(div17, div10);
    			mount_component(criticaldecadeii, div10, null);
    			append_dev(div17, t11);
    			append_dev(div17, div11);
    			mount_component(criticaldecadei, div11, null);
    			append_dev(div17, t12);
    			append_dev(div17, div12);
    			mount_component(southkorea, div12, null);
    			append_dev(div17, t13);
    			append_dev(div17, div13);
    			mount_component(extremeheatii, div13, null);
    			append_dev(div17, t14);
    			append_dev(div17, div14);
    			mount_component(extremeheati, div14, null);
    			append_dev(div17, t15);
    			append_dev(div17, div15);
    			mount_component(cover, div15, null);
    			append_dev(div17, t16);
    			append_dev(div17, div16);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div16, null);
    			}

    			insert_dev(target, t17, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pages*/ 1) {
    				const each_value = /*pages*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div16, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(criticaldecadeiii.$$.fragment, local);
    			transition_in(usa.$$.fragment, local);
    			transition_in(brazil.$$.fragment, local);
    			transition_in(environmentaljustice.$$.fragment, local);
    			transition_in(iceland.$$.fragment, local);
    			transition_in(ghana.$$.fragment, local);
    			transition_in(saudiarabia.$$.fragment, local);
    			transition_in(impactofindividualaction.$$.fragment, local);
    			transition_in(india.$$.fragment, local);
    			transition_in(cambodia.$$.fragment, local);
    			transition_in(criticaldecadeii.$$.fragment, local);
    			transition_in(criticaldecadei.$$.fragment, local);
    			transition_in(southkorea.$$.fragment, local);
    			transition_in(extremeheatii.$$.fragment, local);
    			transition_in(extremeheati.$$.fragment, local);
    			transition_in(cover.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(criticaldecadeiii.$$.fragment, local);
    			transition_out(usa.$$.fragment, local);
    			transition_out(brazil.$$.fragment, local);
    			transition_out(environmentaljustice.$$.fragment, local);
    			transition_out(iceland.$$.fragment, local);
    			transition_out(ghana.$$.fragment, local);
    			transition_out(saudiarabia.$$.fragment, local);
    			transition_out(impactofindividualaction.$$.fragment, local);
    			transition_out(india.$$.fragment, local);
    			transition_out(cambodia.$$.fragment, local);
    			transition_out(criticaldecadeii.$$.fragment, local);
    			transition_out(criticaldecadei.$$.fragment, local);
    			transition_out(southkorea.$$.fragment, local);
    			transition_out(extremeheatii.$$.fragment, local);
    			transition_out(extremeheati.$$.fragment, local);
    			transition_out(cover.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div17);
    			destroy_component(criticaldecadeiii);
    			destroy_component(usa);
    			destroy_component(brazil);
    			destroy_component(environmentaljustice);
    			destroy_component(iceland);
    			destroy_component(ghana);
    			destroy_component(saudiarabia);
    			destroy_component(impactofindividualaction);
    			destroy_component(india);
    			destroy_component(cambodia);
    			destroy_component(criticaldecadeii);
    			destroy_component(criticaldecadei);
    			destroy_component(southkorea);
    			destroy_component(extremeheatii);
    			destroy_component(extremeheati);
    			destroy_component(cover);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t17);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let pages = [
    		{
    			name: "page1",
    			id: 1,
    			swipes: 0,
    			pageName: "Cover",
    			rotate: "90deg",
    			pagetitle: "cover"
    		},
    		{
    			name: "page2",
    			id: 2,
    			swipes: 1,
    			pageName: "ExtremeHeatI",
    			rotate: "78.75deg",
    			pagetitle: "Extreme heat:&emsp;I"
    		},
    		{
    			name: "page3",
    			id: 3,
    			swipes: 2,
    			pageName: "ExtremeHeatII",
    			rotate: "67.5deg",
    			pagetitle: "Extreme heat:&emsp;II"
    		},
    		{
    			name: "page4",
    			id: 4,
    			swipes: 3,
    			pageName: "CriticalDecadeI",
    			rotate: "56.25deg",
    			pagetitle: "The Critical Decade:&emsp;I"
    		},
    		{
    			name: "page5",
    			id: 5,
    			swipes: 4,
    			pageName: "CriticalDecadeII",
    			rotate: "45deg",
    			pagetitle: "The Critical Decade:&emsp;II"
    		},
    		{
    			name: "page6",
    			id: 6,
    			swipes: 5,
    			pageName: "USA",
    			rotate: "33.75deg",
    			pagetitle: "U.S.A."
    		},
    		{
    			name: "page7",
    			id: 7,
    			swipes: 6,
    			pageName: "Brazil",
    			rotate: "22.5deg",
    			pagetitle: "Brazil"
    		},
    		{
    			name: "page8",
    			id: 8,
    			swipes: 7,
    			pageName: "Iceland",
    			rotate: "11.25deg",
    			pagetitle: "Iceland"
    		},
    		{
    			name: "page9",
    			id: 9,
    			swipes: 8,
    			pageName: "Ghana",
    			rotate: "0deg",
    			pagetitle: "Ghana"
    		},
    		{
    			name: "page10",
    			id: 10,
    			swipes: 9,
    			pageName: "SaudiArabia",
    			rotate: "-11.25deg",
    			pagetitle: "Saudi Arabia"
    		},
    		{
    			name: "page11",
    			id: 11,
    			swipes: 10,
    			pageName: "India",
    			rotate: "-22.5deg",
    			pagetitle: "India"
    		},
    		{
    			name: "page12",
    			id: 12,
    			swipes: 11,
    			pageName: "Cambodia",
    			rotate: "-33.75deg",
    			pagetitle: "Cambodia"
    		},
    		{
    			name: "page13",
    			id: 13,
    			swipes: 12,
    			pageName: "SouthKorea",
    			rotate: "-45deg",
    			pagetitle: "South Korea"
    		},
    		{
    			name: "page14",
    			id: 14,
    			swipes: 13,
    			pageName: "EnvironmentalJustice",
    			rotate: "-56.25deg",
    			pagetitle: "Environmental Justice"
    		},
    		{
    			name: "page15",
    			id: 15,
    			swipes: 14,
    			pageName: "ImpactofIndividualAction",
    			rotate: "-67.5deg",
    			pagetitle: "Impact of Individual Action"
    		},
    		{
    			name: "page16",
    			id: 16,
    			swipes: 15,
    			pageName: "CriticalDecadeIII",
    			rotate: "-78.75deg",
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
    		Header,
    		Cover,
    		ExtremeHeatI,
    		ExtremeHeatII,
    		CriticalDecadeI,
    		CriticalDecadeII,
    		USA,
    		Brazil,
    		Iceland,
    		Ghana,
    		SaudiArabia,
    		India,
    		Cambodia,
    		SouthKorea,
    		EnvironmentalJustice,
    		ImpactofIndividualAction,
    		CriticalDecadeIII,
    		pages
    	});

    	$$self.$inject_state = $$props => {
    		if ("pages" in $$props) $$invalidate(0, pages = $$props.pages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pages];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
