
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
    			attr_dev(div8, "class", "text years left line0");
    			add_location(div8, file, 13, 0, 318);
    			attr_dev(div9, "class", "text years left line10");
    			add_location(div9, file, 14, 0, 364);
    			attr_dev(div10, "class", "text years left line20");
    			add_location(div10, file, 15, 0, 411);
    			attr_dev(div11, "class", "text years left line30");
    			add_location(div11, file, 16, 0, 458);
    			attr_dev(div12, "class", "text years left line40");
    			add_location(div12, file, 17, 0, 505);
    			attr_dev(div13, "class", "text years left line50");
    			add_location(div13, file, 18, 0, 552);
    			attr_dev(div14, "class", "text years left line60");
    			add_location(div14, file, 19, 0, 599);
    			attr_dev(div15, "class", "text years left line70");
    			add_location(div15, file, 20, 0, 646);
    			attr_dev(div16, "class", "text years left line80");
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
    			attr_dev(div8, "class", "text years right line0");
    			add_location(div8, file$1, 17, 0, 330);
    			attr_dev(div9, "class", "text years right line10");
    			add_location(div9, file$1, 18, 0, 377);
    			attr_dev(div10, "class", "text years right line20");
    			add_location(div10, file$1, 19, 0, 425);
    			attr_dev(div11, "class", "text years right line30");
    			add_location(div11, file$1, 20, 0, 473);
    			attr_dev(div12, "class", "text years right line40");
    			add_location(div12, file$1, 21, 0, 521);
    			attr_dev(div13, "class", "text years right line50");
    			add_location(div13, file$1, 22, 0, 569);
    			attr_dev(div14, "class", "text years right line60");
    			add_location(div14, file$1, 23, 0, 617);
    			attr_dev(div15, "class", "text years right line70");
    			add_location(div15, file$1, 24, 0, 665);
    			attr_dev(div16, "class", "text years right line80");
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
    			attr_dev(div, "class", "footer svelte-236w9f");
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
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let div5;
    	let div3;
    	let t6;
    	let div4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*pagetitleText*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Swipe");
    			br = element("br");
    			t3 = text("↑");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t6 = space();
    			div4 = element("div");
    			add_location(br, file$5, 16, 25, 359);
    			attr_dev(div0, "class", "text svelte-eekkh2");
    			add_location(div0, file$5, 16, 2, 336);
    			attr_dev(div1, "class", "pagetitle svelte-eekkh2");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$5, 14, 0, 255);
    			attr_dev(div2, "class", "activedot activedot1");
    			add_location(div2, file$5, 19, 0, 384);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + "))");
    			add_location(div3, file$5, 21, 1, 466);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$5, 22, 1, 550);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$5, 20, 0, 425);
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
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div5, t6);
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
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div5);
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

    /* src/specifics/ExtremeHeatI.svelte generated by Svelte v3.23.0 */
    const file$6 = "src/specifics/ExtremeHeatI.svelte";

    function create_fragment$7(ctx) {
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
    			attr_dev(div0, "class", "text svelte-l4fgir");
    			add_location(div0, file$6, 16, 2, 297);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$6, 14, 0, 216);
    			attr_dev(div2, "class", "activedot activedot2");
    			add_location(div2, file$6, 19, 0, 330);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$6, 21, 1, 412);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$6, 20, 0, 371);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExtremeHeatI> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ExtremeHeatI", $$slots, []);

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

    class ExtremeHeatI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { pagetitleText: 0, rotate: 1 });

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
    }

    /* src/specifics/ExtremeHeatII.svelte generated by Svelte v3.23.0 */
    const file$7 = "src/specifics/ExtremeHeatII.svelte";

    function create_fragment$8(ctx) {
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
    			attr_dev(div0, "class", "text svelte-l4fgir");
    			add_location(div0, file$7, 16, 2, 297);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$7, 14, 0, 216);
    			attr_dev(div2, "class", "activedot activedot3");
    			add_location(div2, file$7, 19, 0, 330);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$7, 21, 1, 412);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$7, 20, 0, 371);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let distanceBLines = "calc((95vh - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExtremeHeatII> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ExtremeHeatII", $$slots, []);

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

    class ExtremeHeatII extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { pagetitleText: 0, rotate: 1 });

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
    }

    /* src/specifics/CriticalDecadeI.svelte generated by Svelte v3.23.0 */
    const file$8 = "src/specifics/CriticalDecadeI.svelte";

    function create_fragment$9(ctx) {
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
    	let t9;
    	let div6;
    	let t10;
    	let div8;
    	let div7;
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
    			t9 = space();
    			div6 = element("div");
    			t10 = space();
    			div8 = element("div");
    			div7 = element("div");
    			attr_dev(div0, "class", "text svelte-l4fgir");
    			add_location(div0, file$8, 16, 2, 326);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$8, 14, 0, 245);
    			attr_dev(span, "class", "tempnumber text svelte-l4fgir");
    			add_location(span, file$8, 23, 2, 527);
    			attr_dev(div2, "class", "temperature svelte-l4fgir");
    			add_location(div2, file$8, 22, 1, 499);
    			attr_dev(div3, "class", "tempMeter");
    			add_location(div3, file$8, 21, 0, 474);
    			attr_dev(div4, "class", "verticalLine1 svelte-l4fgir");
    			add_location(div4, file$8, 27, 0, 586);
    			attr_dev(div5, "class", "arrow text svelte-l4fgir");
    			add_location(div5, file$8, 29, 0, 621);
    			attr_dev(div6, "class", "activedot activedot4");
    			add_location(div6, file$8, 38, 0, 666);
    			attr_dev(div7, "class", "progressline");
    			set_style(div7, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div7, file$8, 40, 1, 748);
    			attr_dev(div8, "class", "activedotnew activedotFan");
    			add_location(div8, file$8, 39, 0, 707);
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
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (!current || dirty & /*rotate*/ 2) {
    				set_style(div7, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t10);
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { pagetitleText: 0, rotate: 1 });

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

    /* src/specifics/CriticalDecadeII.svelte generated by Svelte v3.23.0 */
    const file$9 = "src/specifics/CriticalDecadeII.svelte";

    function create_fragment$a(ctx) {
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
    	const timelinepast = new TimelinePast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timelinepast.$$.fragment);
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
    			attr_dev(div0, "class", "text svelte-l4fgir");
    			add_location(div0, file$9, 16, 2, 326);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$9, 14, 0, 245);
    			attr_dev(div2, "class", "activedot activedot5");
    			add_location(div2, file$9, 32, 0, 554);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$9, 34, 1, 636);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$9, 33, 0, 595);
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
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
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
    	let distanceBLines = "calc((95vh - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalDecadeII> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CriticalDecadeII", $$slots, []);

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

    class CriticalDecadeII extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { pagetitleText: 0, rotate: 1 });

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
    }

    /* src/specifics/TimelineEmpty.svelte generated by Svelte v3.23.0 */

    const file$a = "src/specifics/TimelineEmpty.svelte";

    function create_fragment$b(ctx) {
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
    			add_location(div0, file$a, 4, 0, 21);
    			attr_dev(div1, "class", "line left line20");
    			add_location(div1, file$a, 5, 0, 58);
    			attr_dev(div2, "class", "line left line30");
    			add_location(div2, file$a, 6, 0, 95);
    			attr_dev(div3, "class", "line left line40");
    			add_location(div3, file$a, 7, 0, 132);
    			attr_dev(div4, "class", "line left line50");
    			add_location(div4, file$a, 8, 0, 169);
    			attr_dev(div5, "class", "line left line60");
    			add_location(div5, file$a, 9, 0, 206);
    			attr_dev(div6, "class", "line left line70");
    			add_location(div6, file$a, 10, 0, 243);
    			attr_dev(div7, "class", "line left line80");
    			add_location(div7, file$a, 11, 0, 280);
    			attr_dev(div8, "class", "line right line10");
    			add_location(div8, file$a, 13, 0, 318);
    			attr_dev(div9, "class", "line right line20");
    			add_location(div9, file$a, 14, 0, 356);
    			attr_dev(div10, "class", "line right line30");
    			add_location(div10, file$a, 15, 0, 394);
    			attr_dev(div11, "class", "line right line40");
    			add_location(div11, file$a, 16, 0, 432);
    			attr_dev(div12, "class", "line right line50");
    			add_location(div12, file$a, 17, 0, 470);
    			attr_dev(div13, "class", "line right line60");
    			add_location(div13, file$a, 18, 0, 508);
    			attr_dev(div14, "class", "line right line70");
    			add_location(div14, file$a, 19, 0, 546);
    			attr_dev(div15, "class", "line right line80");
    			add_location(div15, file$a, 20, 0, 584);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimelineEmpty",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/specifics/USA.svelte generated by Svelte v3.23.0 */
    const file$b = "src/specifics/USA.svelte";

    function create_fragment$c(ctx) {
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
    			add_location(div0, file$b, 13, 2, 240);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$b, 11, 0, 159);
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$b, 20, 1, 384);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$b, 19, 0, 276);
    			attr_dev(div2, "class", "activedot activedot6");
    			add_location(div2, file$b, 32, 0, 530);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$b, 34, 1, 612);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$b, 33, 0, 571);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { pagetitleText } = $$props;
    	let { rotate } = $$props;
    	const writable_props = ["pagetitleText", "rotate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<USA> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("USA", $$slots, []);

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

    class USA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "USA",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<USA> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<USA> was created without expected prop 'rotate'");
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
    			attr_dev(div2, "class", "activedot activedot7");
    			add_location(div2, file$c, 33, 0, 531);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$c, 35, 1, 613);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$c, 34, 0, 572);
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
    			attr_dev(div2, "class", "activedot activedot8");
    			add_location(div2, file$d, 25, 0, 282);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$d, 27, 1, 364);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$d, 26, 0, 323);
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
    			attr_dev(div2, "class", "activedot activedot9");
    			add_location(div2, file$e, 28, 0, 526);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$e, 30, 1, 608);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$e, 29, 0, 567);
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
    			attr_dev(div2, "class", "activedot activedot11");
    			add_location(div2, file$g, 29, 0, 551);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$g, 31, 1, 634);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$g, 30, 0, 593);
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
    			attr_dev(div2, "class", "activedot activedot12");
    			add_location(div2, file$h, 31, 0, 529);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$h, 33, 1, 612);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$h, 32, 0, 571);
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
    			attr_dev(div2, "class", "activedot activedot13");
    			add_location(div2, file$i, 34, 0, 532);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$i, 36, 1, 615);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$i, 35, 0, 574);
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
    			attr_dev(div2, "class", "activedot activedot14");
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
    			attr_dev(div2, "class", "activedot activedot15");
    			add_location(div2, file$k, 14, 0, 185);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$k, 16, 1, 268);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$k, 15, 0, 227);
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
    			add_location(div0, file$l, 11, 2, 152);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$l, 9, 0, 71);
    			attr_dev(div2, "class", "activedot activedot16");
    			add_location(div2, file$l, 14, 0, 185);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$l, 16, 1, 268);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$l, 15, 0, 227);
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

    // (117:2) {#each pages as page (page.id)}
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
    			attr_dev(a, "class", a_class_value = "dot dot" + /*page*/ ctx[1].id + " svelte-il7zr7");
    			add_location(a, file$m, 117, 3, 5381);
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
    		source: "(117:2) {#each pages as page (page.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let meta0;
    	let t0;
    	let meta1;
    	let t1;
    	let t2;
    	let div16;
    	let a;
    	let t3;
    	let div0;
    	let t4;
    	let div1;
    	let t5;
    	let div2;
    	let t6;
    	let div3;
    	let t7;
    	let div4;
    	let t8;
    	let div5;
    	let t9;
    	let div6;
    	let t10;
    	let div7;
    	let t11;
    	let div8;
    	let t12;
    	let div9;
    	let t13;
    	let div10;
    	let t14;
    	let div11;
    	let t15;
    	let div12;
    	let t16;
    	let div13;
    	let t17;
    	let div14;
    	let t18;
    	let div15;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t19;
    	let current;
    	const header = new Header({ $$inline: true });

    	const cover = new Cover({
    			props: { pagetitleText: "Cover", rotate: "90deg" },
    			$$inline: true
    		});

    	const extremeheati = new ExtremeHeatI({
    			props: {
    				pagetitleText: "Extreme heat: I",
    				rotate: "78.75deg"
    			},
    			$$inline: true
    		});

    	const extremeheatii = new ExtremeHeatII({
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

    	const criticaldecadeii = new CriticalDecadeII({
    			props: {
    				pagetitleText: "The Critical Decade: II",
    				rotate: "45deg"
    			},
    			$$inline: true
    		});

    	const usa = new USA({
    			props: {
    				pagetitleText: "U.S.A.",
    				rotate: "33.75deg"
    			},
    			$$inline: true
    		});

    	const brazil = new Brazil({
    			props: {
    				pagetitleText: "Brazil",
    				rotate: "22.5deg"
    			},
    			$$inline: true
    		});

    	const iceland = new Iceland({
    			props: {
    				pagetitleText: "Iceland",
    				rotate: "11.25deg"
    			},
    			$$inline: true
    		});

    	const ghana = new Ghana({
    			props: { pagetitleText: "Ghana", rotate: "0deg" },
    			$$inline: true
    		});

    	const saudiarabia = new SaudiArabia({
    			props: {
    				pagetitleText: "SaudiArabia",
    				rotate: "-11.25deg"
    			},
    			$$inline: true
    		});

    	const india = new India({
    			props: {
    				pagetitleText: "India",
    				rotate: "-22.5deg"
    			},
    			$$inline: true
    		});

    	const cambodia = new Cambodia({
    			props: {
    				pagetitleText: "Cambodia",
    				rotate: "-33.75deg"
    			},
    			$$inline: true
    		});

    	const southkorea = new SouthKorea({
    			props: {
    				pagetitleText: "SouthKorea",
    				rotate: "-45deg"
    			},
    			$$inline: true
    		});

    	const environmentaljustice = new EnvironmentalJustice({
    			props: {
    				pagetitleText: "Environmental Justice",
    				rotate: "-56.25deg"
    			},
    			$$inline: true
    		});

    	const impactofindividualaction = new ImpactofIndividualAction({
    			props: {
    				pagetitleText: "Impact of Individual Action",
    				rotate: "-67.5deg"
    			},
    			$$inline: true
    		});

    	const criticaldecadeiii = new CriticalDecadeIII({
    			props: {
    				pagetitleText: "Critical Decade: III, Pledge",
    				rotate: "-78.75deg"
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
    			meta0 = element("meta");
    			t0 = space();
    			meta1 = element("meta");
    			t1 = space();
    			create_component(header.$$.fragment);
    			t2 = space();
    			div16 = element("div");
    			a = element("a");
    			create_component(cover.$$.fragment);
    			t3 = space();
    			div0 = element("div");
    			create_component(extremeheati.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			create_component(extremeheatii.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			create_component(criticaldecadei.$$.fragment);
    			t6 = space();
    			div3 = element("div");
    			create_component(criticaldecadeii.$$.fragment);
    			t7 = space();
    			div4 = element("div");
    			create_component(usa.$$.fragment);
    			t8 = space();
    			div5 = element("div");
    			create_component(brazil.$$.fragment);
    			t9 = space();
    			div6 = element("div");
    			create_component(iceland.$$.fragment);
    			t10 = space();
    			div7 = element("div");
    			create_component(ghana.$$.fragment);
    			t11 = space();
    			div8 = element("div");
    			create_component(saudiarabia.$$.fragment);
    			t12 = space();
    			div9 = element("div");
    			create_component(india.$$.fragment);
    			t13 = space();
    			div10 = element("div");
    			create_component(cambodia.$$.fragment);
    			t14 = space();
    			div11 = element("div");
    			create_component(southkorea.$$.fragment);
    			t15 = space();
    			div12 = element("div");
    			create_component(environmentaljustice.$$.fragment);
    			t16 = space();
    			div13 = element("div");
    			create_component(impactofindividualaction.$$.fragment);
    			t17 = space();
    			div14 = element("div");
    			create_component(criticaldecadeiii.$$.fragment);
    			t18 = space();
    			div15 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t19 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(meta0, "name", "viewport");
    			attr_dev(meta0, "content", "width=device-width, initial-scale=1");
    			add_location(meta0, file$m, 56, 0, 3027);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, height=device-height, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0");
    			add_location(meta1, file$m, 57, 0, 3096);
    			attr_dev(a, "href", "#page1");
    			attr_dev(a, "class", "content page1 notcountry");
    			add_location(a, file$m, 65, 1, 3290);
    			attr_dev(div0, "class", "content page2 notcountry");
    			add_location(div0, file$m, 68, 1, 3403);
    			attr_dev(div1, "class", "content page3 notcountry");
    			add_location(div1, file$m, 71, 1, 3538);
    			attr_dev(div2, "class", "content page4 notcountry");
    			add_location(div2, file$m, 74, 1, 3675);
    			attr_dev(div3, "class", "content page5 notcountry");
    			add_location(div3, file$m, 77, 1, 3823);
    			attr_dev(div4, "class", "content page6 country");
    			add_location(div4, file$m, 80, 1, 3971);
    			attr_dev(div5, "class", "content page6 country");
    			add_location(div5, file$m, 83, 1, 4071);
    			attr_dev(div6, "class", "content page7 country");
    			add_location(div6, file$m, 86, 1, 4176);
    			attr_dev(div7, "class", "content page8 country");
    			add_location(div7, file$m, 89, 1, 4285);
    			attr_dev(div8, "class", "content page10 country");
    			add_location(div8, file$m, 92, 1, 4384);
    			attr_dev(div9, "class", "content page11 country");
    			add_location(div9, file$m, 95, 1, 4507);
    			attr_dev(div10, "class", "content page12 country");
    			add_location(div10, file$m, 98, 1, 4611);
    			attr_dev(div11, "class", "content page13 country");
    			add_location(div11, file$m, 101, 1, 4725);
    			attr_dev(div12, "class", "content page14 notcountry");
    			add_location(div12, file$m, 104, 1, 4842);
    			attr_dev(div13, "class", "content page15 notcountry");
    			add_location(div13, file$m, 107, 1, 4996);
    			attr_dev(div14, "class", "content page16 notcountry");
    			add_location(div14, file$m, 110, 1, 5163);
    			attr_dev(div15, "class", "dots svelte-il7zr7");
    			add_location(div15, file$m, 115, 1, 5325);
    			attr_dev(div16, "class", "newmain");
    			add_location(div16, file$m, 64, 0, 3267);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, meta1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div16, anchor);
    			append_dev(div16, a);
    			mount_component(cover, a, null);
    			append_dev(div16, t3);
    			append_dev(div16, div0);
    			mount_component(extremeheati, div0, null);
    			append_dev(div16, t4);
    			append_dev(div16, div1);
    			mount_component(extremeheatii, div1, null);
    			append_dev(div16, t5);
    			append_dev(div16, div2);
    			mount_component(criticaldecadei, div2, null);
    			append_dev(div16, t6);
    			append_dev(div16, div3);
    			mount_component(criticaldecadeii, div3, null);
    			append_dev(div16, t7);
    			append_dev(div16, div4);
    			mount_component(usa, div4, null);
    			append_dev(div16, t8);
    			append_dev(div16, div5);
    			mount_component(brazil, div5, null);
    			append_dev(div16, t9);
    			append_dev(div16, div6);
    			mount_component(iceland, div6, null);
    			append_dev(div16, t10);
    			append_dev(div16, div7);
    			mount_component(ghana, div7, null);
    			append_dev(div16, t11);
    			append_dev(div16, div8);
    			mount_component(saudiarabia, div8, null);
    			append_dev(div16, t12);
    			append_dev(div16, div9);
    			mount_component(india, div9, null);
    			append_dev(div16, t13);
    			append_dev(div16, div10);
    			mount_component(cambodia, div10, null);
    			append_dev(div16, t14);
    			append_dev(div16, div11);
    			mount_component(southkorea, div11, null);
    			append_dev(div16, t15);
    			append_dev(div16, div12);
    			mount_component(environmentaljustice, div12, null);
    			append_dev(div16, t16);
    			append_dev(div16, div13);
    			mount_component(impactofindividualaction, div13, null);
    			append_dev(div16, t17);
    			append_dev(div16, div14);
    			mount_component(criticaldecadeiii, div14, null);
    			append_dev(div16, t18);
    			append_dev(div16, div15);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div15, null);
    			}

    			insert_dev(target, t19, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pages*/ 1) {
    				const each_value = /*pages*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div15, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(cover.$$.fragment, local);
    			transition_in(extremeheati.$$.fragment, local);
    			transition_in(extremeheatii.$$.fragment, local);
    			transition_in(criticaldecadei.$$.fragment, local);
    			transition_in(criticaldecadeii.$$.fragment, local);
    			transition_in(usa.$$.fragment, local);
    			transition_in(brazil.$$.fragment, local);
    			transition_in(iceland.$$.fragment, local);
    			transition_in(ghana.$$.fragment, local);
    			transition_in(saudiarabia.$$.fragment, local);
    			transition_in(india.$$.fragment, local);
    			transition_in(cambodia.$$.fragment, local);
    			transition_in(southkorea.$$.fragment, local);
    			transition_in(environmentaljustice.$$.fragment, local);
    			transition_in(impactofindividualaction.$$.fragment, local);
    			transition_in(criticaldecadeiii.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(cover.$$.fragment, local);
    			transition_out(extremeheati.$$.fragment, local);
    			transition_out(extremeheatii.$$.fragment, local);
    			transition_out(criticaldecadei.$$.fragment, local);
    			transition_out(criticaldecadeii.$$.fragment, local);
    			transition_out(usa.$$.fragment, local);
    			transition_out(brazil.$$.fragment, local);
    			transition_out(iceland.$$.fragment, local);
    			transition_out(ghana.$$.fragment, local);
    			transition_out(saudiarabia.$$.fragment, local);
    			transition_out(india.$$.fragment, local);
    			transition_out(cambodia.$$.fragment, local);
    			transition_out(southkorea.$$.fragment, local);
    			transition_out(environmentaljustice.$$.fragment, local);
    			transition_out(impactofindividualaction.$$.fragment, local);
    			transition_out(criticaldecadeiii.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(meta1);
    			if (detaching) detach_dev(t1);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div16);
    			destroy_component(cover);
    			destroy_component(extremeheati);
    			destroy_component(extremeheatii);
    			destroy_component(criticaldecadei);
    			destroy_component(criticaldecadeii);
    			destroy_component(usa);
    			destroy_component(brazil);
    			destroy_component(iceland);
    			destroy_component(ghana);
    			destroy_component(saudiarabia);
    			destroy_component(india);
    			destroy_component(cambodia);
    			destroy_component(southkorea);
    			destroy_component(environmentaljustice);
    			destroy_component(impactofindividualaction);
    			destroy_component(criticaldecadeiii);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t19);
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
