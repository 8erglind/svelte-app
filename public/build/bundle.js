
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
    			attr_dev(div, "class", "footer svelte-1taieid");
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
    	let div0;
    	let t1;
    	let sub;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div2;
    	let div1;
    	let t5;
    	let div4;
    	let div3;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*pagetitleText*/ ctx[0]);
    			sub = element("sub");
    			sub.textContent = "2";
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "← ← ← Swipe to left to open and press left side of screen click through. ";
    			attr_dev(a, "class", "buttonNext");
    			attr_dev(a, "href", /*prev*/ ctx[2]);
    			add_location(a, file$5, 15, 0, 273);
    			add_location(sub, file$5, 20, 75, 393);
    			attr_dev(div0, "class", "pagetitle svelte-eekkh2");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$5, 20, 0, 318);
    			set_style(img, "position", "absolute");
    			set_style(img, "bottom", "5%");
    			set_style(img, "width", "80%");
    			set_style(img, "left", "10%");
    			if (img.src !== (img_src_value = "imgs/fanHalf.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$5, 25, 0, 416);
    			attr_dev(div1, "class", "progressline");
    			set_style(div1, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div1, file$5, 32, 1, 601);
    			attr_dev(div2, "class", "activedotnew activedotFan");
    			add_location(div2, file$5, 31, 0, 560);
    			attr_dev(div3, "class", "bottomLineText");
    			add_location(div3, file$5, 38, 1, 736);
    			attr_dev(div4, "class", "text bottomLine svelte-eekkh2");
    			add_location(div4, file$5, 37, 0, 705);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t1);
    			append_dev(div0, sub);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*prev*/ 4) {
    				attr_dev(a, "href", /*prev*/ ctx[2]);
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t1, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div1, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
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

    // (44:0) {#if firstSetup}
    function create_if_block_7(ctx) {
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
    			add_location(div, file$6, 44, 1, 731);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$6, 45, 1, 792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[12], false, false, false);
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(44:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if secondSetup}
    function create_if_block_6(ctx) {
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
    			add_location(a, file$6, 48, 1, 858);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$6, 49, 1, 900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglefirstSetup*/ ctx[11], false, false, false);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(48:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (65:0) {#if firstSetup}
    function create_if_block_5(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("It’s June, after the warmest May on record. Its getting warmer, and Extreme heat is becoming more and more common.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$6, 65, 1, 1096);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(65:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (70:0) {#if secondText}
    function create_if_block_4(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("The dangers of heat depend on temperature and humidity. High humidity makes it harder for sweat to evaporate from the body, which can cause it to overheat.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$6, 70, 1, 1305);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(70:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#if firstSetup}
    function create_if_block_3(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "sweatdrop falling svelte-1fzwvbo");
    			add_location(div0, file$6, 84, 1, 1586);
    			attr_dev(div1, "class", "sweatdrop falling2 svelte-1fzwvbo");
    			add_location(div1, file$6, 85, 1, 1625);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(84:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (97:0) {#if secondSetup}
    function create_if_block(ctx) {
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
    	let div6_style_value;
    	let if_block0 = /*temp*/ ctx[7] && create_if_block_2(ctx);
    	let if_block1 = /*temp*/ ctx[7] && create_if_block_1(ctx);

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
    			attr_dev(polygon0, "class", "caution svelte-1fzwvbo");
    			set_style(polygon0, "background-color", "yellow");
    			attr_dev(polygon0, "points", "0 0 250 0 250 100 200 100 200 200 150 200 150 400 100 400 100 500 50 500 50 700 0 700 0 0");
    			add_location(polygon0, file$6, 99, 3, 2797);
    			attr_dev(polygon1, "class", "extremeCaution svelte-1fzwvbo");
    			attr_dev(polygon1, "points", "450 0 450 100 400 100 400 200 300 200 300 300 250 300 250 400 200 400 200 500 150 500 150 700 50 700 50 500 100 500 100 400 150 400 150 200 200 200 200 100 250 100 250 0 450 0");
    			add_location(polygon1, file$6, 100, 3, 2960);
    			attr_dev(polygon2, "class", "danger svelte-1fzwvbo");
    			attr_dev(polygon2, "points", "450 0 700 0 700 100 600 100 600 200 500 200 500 300 400 300 400 400 350 400 350 500 300 500 300 600 250 600 250 700 150 700 150 500 200 500 200 400 250 400 250 300 300 300 300 200 400 200 400 100 450 100 450 0");
    			add_location(polygon2, file$6, 101, 3, 3182);
    			attr_dev(polyline, "class", "extremeDanger svelte-1fzwvbo");
    			attr_dev(polyline, "points", "800 700 250 700 250 600 300 600 300 500 350 500 350 400 400 400 400 300 500 300 500 200 600 200 600 100 700 100 700 0 800 0 800 700");
    			add_location(polyline, file$6, 102, 3, 3430);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 800 700");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$6, 98, 2, 2690);
    			attr_dev(div0, "class", "backgroundBox svelte-1fzwvbo");
    			add_location(div0, file$6, 97, 1, 2660);
    			attr_dev(div1, "class", "text humidity humidityTop svelte-1fzwvbo");
    			set_style(div1, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 1)");
    			set_style(div1, "right", "calc(100vw - " + /*marginSides*/ ctx[9] + ")");
    			set_style(div1, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			add_location(div1, file$6, 109, 1, 3738);
    			attr_dev(div2, "class", "text humidity svelte-1fzwvbo");
    			set_style(div2, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 1)");
    			set_style(div2, "left", "5px");
    			add_location(div2, file$6, 110, 1, 3906);
    			attr_dev(div3, "class", "text humidity svelte-1fzwvbo");
    			set_style(div3, "bottom", "0%");
    			set_style(div3, "left", "5px");
    			add_location(div3, file$6, 111, 1, 3995);
    			attr_dev(div4, "class", "text celcius svelte-1fzwvbo");
    			set_style(div4, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div4, "left", /*celciusWidth*/ ctx[10]);
    			add_location(div4, file$6, 113, 1, 4066);
    			attr_dev(div5, "class", "text celcius svelte-1fzwvbo");
    			set_style(div5, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			set_style(div5, "right", "calc(" + /*celciusWidth*/ ctx[10] + " * 1)");
    			add_location(div5, file$6, 114, 1, 4173);
    			attr_dev(div6, "class", "text celcius inGraph svelte-1fzwvbo");
    			attr_dev(div6, "style", div6_style_value = "bottom: 15px; right: calc(" + /*celciusWidth*/ ctx[10] + " + 15px); /*transform: rotate(" + /*rotate*/ ctx[1] + ");*/");
    			add_location(div6, file$6, 119, 1, 4473);
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
    					if_block0 = create_if_block_2(ctx);
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
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t12.parentNode, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*rotate*/ 2 && div6_style_value !== (div6_style_value = "bottom: 15px; right: calc(" + /*celciusWidth*/ ctx[10] + " + 15px); /*transform: rotate(" + /*rotate*/ ctx[1] + ");*/")) {
    				attr_dev(div6, "style", div6_style_value);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(97:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (107:1) {#if temp}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Temp.");
    			attr_dev(div, "class", "text celcius celciusTop svelte-1fzwvbo");
    			set_style(div, "bottom", "calc(" + /*distanceBLines*/ ctx[8] + " * 8)");
    			add_location(div, file$6, 107, 2, 3637);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(107:1) {#if temp}",
    		ctx
    	});

    	return block;
    }

    // (117:1) {#if temp}
    function create_if_block_1(ctx) {
    	let div;
    	let t;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Caution");
    			attr_dev(div, "class", "text celcius inGraph svelte-1fzwvbo");
    			attr_dev(div, "style", div_style_value = "top: calc(" + /*distanceBLines*/ ctx[8] + " + 15px); left: calc(" + /*celciusWidth*/ ctx[10] + " + 15px); /*transform: rotate(" + /*rotate*/ ctx[1] + ");*/");
    			add_location(div, file$6, 117, 2, 4305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2 && div_style_value !== (div_style_value = "top: calc(" + /*distanceBLines*/ ctx[8] + " + 15px); left: calc(" + /*celciusWidth*/ ctx[10] + " + 15px); /*transform: rotate(" + /*rotate*/ ctx[1] + ");*/")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(117:1) {#if temp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div2;
    	let div1;
    	let t8;
    	let a;
    	let t10;
    	let t11;
    	let div4;
    	let div3;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_7(ctx);
    	let if_block1 = /*secondSetup*/ ctx[5] && create_if_block_6(ctx);
    	let if_block2 = /*firstSetup*/ ctx[4] && create_if_block_5(ctx);
    	let if_block3 = /*secondText*/ ctx[6] && create_if_block_4(ctx);
    	let if_block4 = /*firstSetup*/ ctx[4] && create_if_block_3(ctx);
    	let if_block5 = /*secondSetup*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			t2 = text(/*pagetitleText*/ ctx[0]);
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t8 = text("Source ");
    			a = element("a");
    			a.textContent = "[1]";
    			t10 = text(".");
    			t11 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$6, 61, 0, 994);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "");
    			attr_dev(a, "class", "svelte-1fzwvbo");
    			add_location(a, file$6, 132, 10, 4758);
    			attr_dev(div1, "class", "bottomLineText text svelte-1fzwvbo");
    			set_style(div1, "text-align", "right");
    			add_location(div1, file$6, 131, 2, 4687);
    			attr_dev(div2, "class", "text bottomLine svelte-1fzwvbo");
    			add_location(div2, file$6, 130, 0, 4655);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$6, 137, 1, 4852);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$6, 136, 0, 4811);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t8);
    			append_dev(div1, a);
    			append_dev(div1, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
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
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t2, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*secondText*/ ctx[6]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_4(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_3(ctx);
    					if_block4.c();
    					if_block4.m(t6.parentNode, t6);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block(ctx);
    					if_block5.c();
    					if_block5.m(t7.parentNode, t7);
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t11);
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

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondText = false);
    		$$invalidate(7, temp = false);
    		thirdSetup = false;
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
    		$$invalidate(6, secondText = true);
    		$$invalidate(7, temp = true);
    		thirdSetup = false;
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
    		togglefirstSetup,
    		togglesecondSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(8, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) $$invalidate(9, marginSides = $$props.marginSides);
    		if ("celciusWidth" in $$props) $$invalidate(10, celciusWidth = $$props.celciusWidth);
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(5, secondSetup = $$props.secondSetup);
    		if ("secondText" in $$props) $$invalidate(6, secondText = $$props.secondText);
    		if ("temp" in $$props) $$invalidate(7, temp = $$props.temp);
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
    		distanceBLines,
    		marginSides,
    		celciusWidth,
    		togglefirstSetup,
    		togglesecondSetup
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

    // (34:0) {#if firstSetup}
    function create_if_block_4$1(ctx) {
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
    			add_location(div, file$7, 34, 1, 567);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$7, 35, 1, 628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[9], false, false, false);
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
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(34:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (38:0) {#if secondSetup}
    function create_if_block_3$1(ctx) {
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
    			add_location(a, file$7, 38, 1, 694);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$7, 39, 1, 736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglefirstSetup*/ ctx[8], false, false, false);
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
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(38:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (54:0) {#if firstSetup}
    function create_if_block_2$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("When the temperature start to approach that of the human body, they become extremely dangerous. Heat of 35°C, especially when humid, can only be endured for several hours at a time before it becomes fatal.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			set_style(div, "font-weight", "normal");
    			set_style(div, "font-style", "normal");
    			add_location(div, file$7, 54, 1, 931);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(54:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (60:0) {#if secondSetup}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("With each eccess extremely hot day of 35°C, mortality rates increase by ~ 0,0004%.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			set_style(div, "font-weight", "normal");
    			set_style(div, "font-style", "normal");
    			add_location(div, file$7, 60, 1, 1280);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(60:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (97:44) {#if secondSetup}
    function create_if_block$1(ctx) {
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			t0 = text(", ");
    			a = element("a");
    			a.textContent = "[2]";
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "");
    			attr_dev(a, "class", "svelte-1pnj3bi");
    			add_location(a, file$7, 96, 63, 2587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(97:44) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let div2;
    	let t7;
    	let t8;
    	let div3;
    	let t9;
    	let t10;
    	let div4;
    	let t11;
    	let t12;
    	let div5;
    	let t13;
    	let div6;
    	let t14;
    	let div7;
    	let t15;
    	let br;
    	let t16;
    	let t17;
    	let div9;
    	let div8;
    	let t18;
    	let a;
    	let t20;
    	let t21;
    	let div11;
    	let div10;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_4$1(ctx);
    	let if_block1 = /*secondSetup*/ ctx[5] && create_if_block_3$1(ctx);
    	let if_block2 = /*firstSetup*/ ctx[4] && create_if_block_2$1(ctx);
    	let if_block3 = /*secondSetup*/ ctx[5] && create_if_block_1$1(ctx);
    	let if_block4 = /*secondSetup*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			t2 = text(/*pagetitleText*/ ctx[0]);
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			div1 = element("div");
    			t6 = space();
    			div2 = element("div");
    			t7 = text("26,6 °C");
    			t8 = space();
    			div3 = element("div");
    			t9 = text("41.1 °C");
    			t10 = space();
    			div4 = element("div");
    			t11 = text("35°C");
    			t12 = space();
    			div5 = element("div");
    			t13 = space();
    			div6 = element("div");
    			t14 = space();
    			div7 = element("div");
    			t15 = text("body");
    			br = element("br");
    			t16 = text("temp.");
    			t17 = space();
    			div9 = element("div");
    			div8 = element("div");
    			t18 = text("Source ");
    			a = element("a");
    			a.textContent = "[1]";
    			if (if_block4) if_block4.c();
    			t20 = text(".");
    			t21 = space();
    			div11 = element("div");
    			div10 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$7, 50, 0, 829);
    			attr_dev(div1, "class", "backgroundBox svelte-1pnj3bi");
    			add_location(div1, file$7, 73, 0, 1522);
    			attr_dev(div2, "class", "text celcius svelte-1pnj3bi");
    			set_style(div2, "bottom", "calc(" + /*distanceBLines*/ ctx[6] + " * 8)");
    			set_style(div2, "left", /*celciusWidth*/ ctx[7]);
    			add_location(div2, file$7, 75, 0, 1557);
    			attr_dev(div3, "class", "text celcius svelte-1pnj3bi");
    			set_style(div3, "bottom", "calc(" + /*distanceBLines*/ ctx[6] + " * 8)");
    			set_style(div3, "right", "calc(" + /*celciusWidth*/ ctx[7] + " * 1)");
    			add_location(div3, file$7, 76, 0, 1663);
    			attr_dev(div4, "class", "text celcius svelte-1pnj3bi");
    			set_style(div4, "bottom", "calc(" + /*distanceBLines*/ ctx[6] + " * 8)");
    			set_style(div4, "left", "calc(" + /*celciusWidth*/ ctx[7] + " * 9.5)");
    			add_location(div4, file$7, 78, 0, 1781);
    			set_style(div5, "position", "absolute");
    			set_style(div5, "left", "calc(" + /*celciusWidth*/ ctx[7] + " * 10)");
    			set_style(div5, "width", "0px");
    			set_style(div5, "border-right", "1px dotted darkred");
    			set_style(div5, "height", "calc(" + /*distanceBLines*/ ctx[6] + " * 8)");
    			set_style(div5, "top", "calc(" + /*distanceBLines*/ ctx[6] + " * 1)");
    			add_location(div5, file$7, 80, 0, 1897);
    			attr_dev(div6, "class", "bodyTemp svelte-1pnj3bi");
    			set_style(div6, "top", /*distanceBLines*/ ctx[6]);
    			set_style(div6, "left", "calc(" + /*celciusWidth*/ ctx[7] + " * 11)");
    			set_style(div6, "right", "calc(" + /*celciusWidth*/ ctx[7] + " * 5)");
    			set_style(div6, "height", "calc(" + /*distanceBLines*/ ctx[6] + " * 8)");
    			add_location(div6, file$7, 82, 0, 2086);
    			add_location(br, file$7, 84, 136, 2385);
    			attr_dev(div7, "class", "text celcius svelte-1pnj3bi");
    			set_style(div7, "bottom", "0%");
    			set_style(div7, "left", "calc(" + /*celciusWidth*/ ctx[7] + " * 11)");
    			set_style(div7, "right", "calc(" + /*celciusWidth*/ ctx[7] + " * 5)");
    			set_style(div7, "text-align", "center");
    			add_location(div7, file$7, 84, 0, 2249);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "");
    			attr_dev(a, "class", "svelte-1pnj3bi");
    			add_location(a, file$7, 96, 10, 2534);
    			attr_dev(div8, "class", "bottomLineText text svelte-1pnj3bi");
    			set_style(div8, "text-align", "right");
    			add_location(div8, file$7, 95, 2, 2463);
    			attr_dev(div9, "class", "text bottomLine svelte-1pnj3bi");
    			add_location(div9, file$7, 94, 0, 2431);
    			attr_dev(div10, "class", "progressline");
    			set_style(div10, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div10, file$7, 101, 1, 2686);
    			attr_dev(div11, "class", "activedotnew activedotFan");
    			add_location(div11, file$7, 100, 0, 2645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, t15);
    			append_dev(div7, br);
    			append_dev(div7, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, t18);
    			append_dev(div8, a);
    			if (if_block4) if_block4.m(div8, null);
    			append_dev(div8, t20);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
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
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t2, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					if_block4.m(div8, t20);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div10, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div9);
    			if (if_block4) if_block4.d();
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div11);
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
    	let secondSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
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
    		secondSetup,
    		togglefirstSetup,
    		togglesecondSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(6, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("celciusWidth" in $$props) $$invalidate(7, celciusWidth = $$props.celciusWidth);
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(5, secondSetup = $$props.secondSetup);
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
    		distanceBLines,
    		celciusWidth,
    		togglefirstSetup,
    		togglesecondSetup
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
    			add_location(div, file$8, 53, 1, 933);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$8, 54, 1, 994);
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
    function create_if_block_9(ctx) {
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
    			add_location(div0, file$8, 57, 1, 1059);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$8, 58, 1, 1119);
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(57:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#if thirdText}
    function create_if_block_8(ctx) {
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
    			add_location(a, file$8, 61, 1, 1201);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$8, 62, 1, 1243);
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
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(61:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (79:0) {#if firstText}
    function create_if_block_7$1(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Since 1880 Earth’s average global temperature has increased by 1,1 - 1,3°C. \n\t\t");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Two-thirds of that warming happened in the last 45 years. The Paris Agreement aims to limit warming to + 1,5°C.";
    			add_location(br, file$8, 81, 2, 1591);
    			attr_dev(span, "class", "transp");
    			add_location(span, file$8, 82, 2, 1598);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$8, 79, 1, 1440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, span);
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
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(79:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if secondText}
    function create_if_block_6$1(ctx) {
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
    			t0 = text("Since 1880 Earth’s average global temperature has increased by 1,1 - 1,3°C. \n\t\t\t");
    			br = element("br");
    			t1 = text("\n\t\tTwo-thirds of that warming happened in the last 45 years. \n\t\t");
    			span1 = element("span");
    			span1.textContent = "The Paris Agreement aims to limit warming to + 1,5°C.";
    			add_location(br, file$8, 91, 3, 1969);
    			attr_dev(span0, "class", "transp");
    			add_location(span0, file$8, 89, 2, 1854);
    			attr_dev(span1, "class", "transp");
    			add_location(span1, file$8, 94, 2, 2052);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$8, 88, 1, 1792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, br);
    			append_dev(div, t1);
    			append_dev(div, span1);
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
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(88:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (100:0) {#if thirdText}
    function create_if_block_5$1(ctx) {
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
    			add_location(br, file$8, 100, 166, 2347);
    			attr_dev(span, "class", "transp");
    			add_location(span, file$8, 100, 60, 2241);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$8, 100, 1, 2182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, br);
    			append_dev(span, t1);
    			append_dev(div, t2);
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
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(100:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (122:1) {#if thirdText}
    function create_if_block_4$2(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "1,5°C";
    			attr_dev(span, "class", "tempnumber text svelte-1emori2");
    			add_location(span, file$8, 123, 3, 2958);
    			attr_dev(div, "class", "temperature svelte-1emori2");
    			set_style(div, "width", "100%");
    			set_style(div, "background-color", "rgba(0,0,0,0)", 1);
    			set_style(div, "border", "none");
    			add_location(div, file$8, 122, 2, 2850);
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
    		source: "(122:1) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (132:0) {#if firstText}
    function create_if_block_3$2(ctx) {
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
    			div8.textContent = "2010";
    			t9 = space();
    			div9 = element("div");
    			div9.textContent = "2000";
    			t11 = space();
    			div10 = element("div");
    			div10.textContent = "1990";
    			t13 = space();
    			div11 = element("div");
    			div11.textContent = "1980";
    			t15 = space();
    			div12 = element("div");
    			div12.textContent = "1970";
    			t17 = space();
    			div13 = element("div");
    			div13.textContent = "1960";
    			t19 = space();
    			div14 = element("div");
    			div14.textContent = "1950";
    			t21 = space();
    			div15 = element("div");
    			div15.textContent = "1940";
    			t23 = space();
    			div16 = element("div");
    			attr_dev(div0, "class", "line left line10 svelte-1emori2");
    			add_location(div0, file$8, 132, 1, 3111);
    			attr_dev(div1, "class", "line left line20 svelte-1emori2");
    			add_location(div1, file$8, 133, 1, 3149);
    			attr_dev(div2, "class", "line left line30 svelte-1emori2");
    			add_location(div2, file$8, 134, 1, 3187);
    			attr_dev(div3, "class", "line left line40 svelte-1emori2");
    			add_location(div3, file$8, 135, 1, 3225);
    			attr_dev(div4, "class", "line left line50 svelte-1emori2");
    			add_location(div4, file$8, 136, 1, 3263);
    			attr_dev(div5, "class", "line left line60 svelte-1emori2");
    			add_location(div5, file$8, 137, 1, 3301);
    			attr_dev(div6, "class", "line left line70 svelte-1emori2");
    			add_location(div6, file$8, 138, 1, 3339);
    			attr_dev(div7, "class", "line left line80 svelte-1emori2");
    			add_location(div7, file$8, 139, 1, 3377);
    			attr_dev(div8, "class", "text years left line10 svelte-1emori2");
    			add_location(div8, file$8, 141, 1, 3416);
    			attr_dev(div9, "class", "text years left line20 svelte-1emori2");
    			add_location(div9, file$8, 142, 1, 3464);
    			attr_dev(div10, "class", "text years left line30 svelte-1emori2");
    			add_location(div10, file$8, 143, 1, 3512);
    			attr_dev(div11, "class", "text years left line40 svelte-1emori2");
    			add_location(div11, file$8, 144, 1, 3560);
    			attr_dev(div12, "class", "text years left line50 svelte-1emori2");
    			add_location(div12, file$8, 145, 1, 3608);
    			attr_dev(div13, "class", "text years left line60 svelte-1emori2");
    			add_location(div13, file$8, 146, 1, 3656);
    			attr_dev(div14, "class", "text years left line70 svelte-1emori2");
    			add_location(div14, file$8, 147, 1, 3704);
    			attr_dev(div15, "class", "text years left line80 svelte-1emori2");
    			add_location(div15, file$8, 148, 1, 3752);
    			attr_dev(div16, "class", "verticalLine fromTop svelte-1emori2");
    			set_style(div16, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthA*/ ctx[10] + ")");
    			set_style(div16, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 9)");
    			add_location(div16, file$8, 150, 1, 3801);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(132:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (159:0) {#if secondLines}
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
    			add_location(div0, file$8, 159, 1, 4039);
    			attr_dev(div1, "class", "horizontalLine svelte-1emori2");
    			set_style(div1, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthB*/ ctx[11] + ")");
    			set_style(div1, "width", "calc(" + /*tempWidthA*/ ctx[10] + " - " + /*tempWidthB*/ ctx[11] + ")");
    			set_style(div1, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			add_location(div1, file$8, 160, 1, 4169);
    			attr_dev(div2, "class", "verticalLine svelte-1emori2");
    			set_style(div2, "left", "calc(" + /*marginSides*/ ctx[9] + " + " + /*tempWidthA*/ ctx[10] + ")");
    			set_style(div2, "top", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			set_style(div2, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 4.5)");
    			add_location(div2, file$8, 161, 1, 4332);
    			attr_dev(div3, "class", "line left line45 svelte-1emori2");
    			add_location(div3, file$8, 165, 1, 4563);
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
    		source: "(159:0) {#if secondLines}",
    		ctx
    	});

    	return block;
    }

    // (163:1) {#if secondText}
    function create_if_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "1975";
    			attr_dev(div, "class", "text years left line45 svelte-1emori2");
    			add_location(div, file$8, 163, 2, 4508);
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
    		source: "(163:1) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (170:0) {#if thirdText}
    function create_if_block$2(ctx) {
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
    	let t11;
    	let div11;
    	let t13;
    	let div12;
    	let t15;
    	let div13;
    	let t17;
    	let div14;
    	let t19;
    	let div15;
    	let t21;
    	let div16;
    	let t23;
    	let div17;
    	let t25;
    	let div18;

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
    			div10.textContent = "2020";
    			t11 = space();
    			div11 = element("div");
    			div11.textContent = "2030";
    			t13 = space();
    			div12 = element("div");
    			div12.textContent = "2040";
    			t15 = space();
    			div13 = element("div");
    			div13.textContent = "2050";
    			t17 = space();
    			div14 = element("div");
    			div14.textContent = "2060";
    			t19 = space();
    			div15 = element("div");
    			div15.textContent = "2070";
    			t21 = space();
    			div16 = element("div");
    			div16.textContent = "2080";
    			t23 = space();
    			div17 = element("div");
    			div17.textContent = "2090";
    			t25 = space();
    			div18 = element("div");
    			div18.textContent = "2100";
    			attr_dev(div0, "class", "verticalLine fromTop svelte-1emori2");
    			set_style(div0, "right", /*marginSides*/ ctx[9]);
    			set_style(div0, "height", "calc(" + /*distanceBLines*/ ctx[8] + " * 9)");
    			add_location(div0, file$8, 170, 1, 4625);
    			attr_dev(div1, "class", "line right line0 svelte-1emori2");
    			add_location(div1, file$8, 172, 1, 4734);
    			attr_dev(div2, "class", "line right line10 svelte-1emori2");
    			add_location(div2, file$8, 173, 1, 4772);
    			attr_dev(div3, "class", "line right line20 svelte-1emori2");
    			add_location(div3, file$8, 174, 1, 4811);
    			attr_dev(div4, "class", "line right line30 svelte-1emori2");
    			add_location(div4, file$8, 175, 1, 4850);
    			attr_dev(div5, "class", "line right line40 svelte-1emori2");
    			add_location(div5, file$8, 176, 1, 4889);
    			attr_dev(div6, "class", "line right line50 svelte-1emori2");
    			add_location(div6, file$8, 177, 1, 4928);
    			attr_dev(div7, "class", "line right line60 svelte-1emori2");
    			add_location(div7, file$8, 178, 1, 4967);
    			attr_dev(div8, "class", "line right line70 svelte-1emori2");
    			add_location(div8, file$8, 179, 1, 5006);
    			attr_dev(div9, "class", "line right line80 svelte-1emori2");
    			add_location(div9, file$8, 180, 1, 5045);
    			attr_dev(div10, "class", "text years right line0 svelte-1emori2");
    			add_location(div10, file$8, 182, 1, 5085);
    			attr_dev(div11, "class", "text years right line10 svelte-1emori2");
    			add_location(div11, file$8, 183, 1, 5133);
    			attr_dev(div12, "class", "text years right line20 svelte-1emori2");
    			add_location(div12, file$8, 184, 1, 5182);
    			attr_dev(div13, "class", "text years right line30 svelte-1emori2");
    			add_location(div13, file$8, 185, 1, 5231);
    			attr_dev(div14, "class", "text years right line40 svelte-1emori2");
    			add_location(div14, file$8, 186, 1, 5280);
    			attr_dev(div15, "class", "text years right line50 svelte-1emori2");
    			add_location(div15, file$8, 187, 1, 5329);
    			attr_dev(div16, "class", "text years right line60 svelte-1emori2");
    			add_location(div16, file$8, 188, 1, 5378);
    			attr_dev(div17, "class", "text years right line70 svelte-1emori2");
    			add_location(div17, file$8, 189, 1, 5427);
    			attr_dev(div18, "class", "text years right line80 svelte-1emori2");
    			add_location(div18, file$8, 190, 1, 5476);
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
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div14, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div15, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div16, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div17, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div18, anchor);
    		},
    		p: noop,
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
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div15);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div16);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div17);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div18);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(170:0) {#if thirdText}",
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
    	let div4;
    	let div2;
    	let span0;
    	let t10;
    	let div3;
    	let span1;
    	let t12;
    	let t13;
    	let div5;
    	let t14;
    	let t15;
    	let t16;
    	let div6;
    	let t17;
    	let div7;
    	let t19;
    	let t20;
    	let t21;
    	let div8;
    	let t22;
    	let div9;
    	let t23;
    	let div11;
    	let div10;
    	let if_block0 = /*firstText*/ ctx[4] && create_if_block_10(ctx);
    	let if_block1 = /*secondText*/ ctx[5] && create_if_block_9(ctx);
    	let if_block2 = /*thirdText*/ ctx[6] && create_if_block_8(ctx);
    	let if_block3 = /*firstText*/ ctx[4] && create_if_block_7$1(ctx);
    	let if_block4 = /*secondText*/ ctx[5] && create_if_block_6$1(ctx);
    	let if_block5 = /*thirdText*/ ctx[6] && create_if_block_5$1(ctx);
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
    			div4 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "0°C";
    			t10 = space();
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "1,2°C";
    			t12 = space();
    			if (if_block6) if_block6.c();
    			t13 = space();
    			div5 = element("div");
    			t14 = text("↑");
    			t15 = space();
    			if (if_block7) if_block7.c();
    			t16 = space();
    			div6 = element("div");
    			t17 = space();
    			div7 = element("div");
    			div7.textContent = "2020";
    			t19 = space();
    			if (if_block8) if_block8.c();
    			t20 = space();
    			if (if_block9) if_block9.c();
    			t21 = space();
    			div8 = element("div");
    			t22 = space();
    			div9 = element("div");
    			t23 = space();
    			div11 = element("div");
    			div10 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$8, 76, 0, 1340);
    			attr_dev(div1, "class", "backgroundBox svelte-1emori2");
    			add_location(div1, file$8, 110, 0, 2528);
    			attr_dev(span0, "class", "tempnumber text svelte-1emori2");
    			add_location(span0, file$8, 116, 2, 2661);
    			attr_dev(div2, "class", "temperature svelte-1emori2");
    			set_style(div2, "left", /*marginSides*/ ctx[9]);
    			set_style(div2, "border", "none");
    			add_location(div2, file$8, 115, 1, 2590);
    			attr_dev(span1, "class", "tempnumber text svelte-1emori2");
    			add_location(span1, file$8, 119, 2, 2780);
    			attr_dev(div3, "class", "temperature svelte-1emori2");
    			set_style(div3, "width", "calc(" + /*tempWidthA*/ ctx[10] + " - 1px)");
    			add_location(div3, file$8, 118, 1, 2711);
    			attr_dev(div4, "class", "tempMeter");
    			add_location(div4, file$8, 114, 0, 2565);
    			attr_dev(div5, "class", "arrow text svelte-1emori2");
    			set_style(div5, "width", /*marginSides*/ ctx[9]);
    			add_location(div5, file$8, 127, 0, 3024);
    			attr_dev(div6, "class", "line left line0 svelte-1emori2");
    			add_location(div6, file$8, 154, 0, 3936);
    			attr_dev(div7, "class", "text years left line0 svelte-1emori2");
    			add_location(div7, file$8, 155, 0, 3972);
    			attr_dev(div8, "class", "text bottomLine svelte-1emori2");
    			add_location(div8, file$8, 199, 0, 5560);
    			attr_dev(div9, "class", "activedot activedot5");
    			add_location(div9, file$8, 225, 0, 6061);
    			attr_dev(div10, "class", "progressline");
    			set_style(div10, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div10, file$8, 227, 1, 6143);
    			attr_dev(div11, "class", "activedotnew activedotFan");
    			add_location(div11, file$8, 226, 0, 6102);
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
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, span0);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, span1);
    			append_dev(div4, t12);
    			if (if_block6) if_block6.m(div4, null);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, t14);
    			insert_dev(target, t15, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t20, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div8, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, div9, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
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
    					if_block1 = create_if_block_9(ctx);
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
    					if_block2 = create_if_block_8(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstText*/ ctx[4]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_7$1(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_6$1(ctx);
    					if_block4.c();
    					if_block4.m(t6.parentNode, t6);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_5$1(ctx);
    					if_block5.c();
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block_4$2(ctx);
    					if_block6.c();
    					if_block6.m(div4, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*firstText*/ ctx[4]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_3$2(ctx);
    					if_block7.c();
    					if_block7.m(t16.parentNode, t16);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*secondLines*/ ctx[7]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_1$2(ctx);
    					if_block8.c();
    					if_block8.m(t20.parentNode, t20);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block$2(ctx);
    					if_block9.c();
    					if_block9.m(t21.parentNode, t21);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div10, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div4);
    			if (if_block6) if_block6.d();
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t15);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t19);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div11);
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

    // (132:0) {#if firstText}
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
    			add_location(div, file$9, 132, 1, 2345);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$9, 133, 1, 2406);
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
    		source: "(132:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (136:0) {#if secondText}
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
    			add_location(div0, file$9, 136, 1, 2471);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 137, 1, 2531);
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
    		source: "(136:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (140:0) {#if thirdText}
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
    			add_location(div0, file$9, 140, 1, 2613);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 141, 1, 2674);
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
    		source: "(140:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (144:0) {#if fourthText}
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
    			add_location(div0, file$9, 144, 1, 2758);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 145, 1, 2818);
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
    		source: "(144:0) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (148:0) {#if fifthText}
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
    			add_location(div0, file$9, 148, 1, 2900);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$9, 149, 1, 2960);
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
    		source: "(148:0) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if sixthText}
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
    			add_location(a, file$9, 152, 1, 3043);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$9, 153, 1, 3085);
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
    		source: "(152:0) {#if sixthText}",
    		ctx
    	});

    	return block;
    }

    // (171:0) {#if firstText}
    function create_if_block_17(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Emissions have risen steadily since the industrial revolution.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$9, 171, 1, 3282);
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
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(171:0) {#if firstText}",
    		ctx
    	});

    	return block;
    }

    // (174:0) {#if secondText}
    function create_if_block_16(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("With our current level of emissions we have reached our limit.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$9, 174, 1, 3434);
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
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(174:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (177:0) {#if thirdText}
    function create_if_block_15(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("From now on we must reduce.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$9, 177, 1, 3585);
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
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(177:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (180:0) {#if fourthText}
    function create_if_block_14(ctx) {
    	let div;
    	let t0;
    	let sub;
    	let t2;
    	let br;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("To limit warming to 1,5°C, global CO");
    			sub = element("sub");
    			sub.textContent = "2";
    			t2 = text(" emissions must have reached");
    			br = element("br");
    			t3 = text("net-zero by 2050.");
    			add_location(sub, file$9, 180, 96, 3797);
    			add_location(br, file$9, 180, 136, 3837);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$9, 180, 1, 3702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, sub);
    			append_dev(div, t2);
    			append_dev(div, br);
    			append_dev(div, t3);
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
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(180:0) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (183:0) {#if fifthText}
    function create_if_block_13(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("To reach net-zero by 2050, emissions must be halved by 2030.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$9, 183, 1, 3898);
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
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(183:0) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (194:1) {#if emissionGraph}
    function create_if_block_12(ctx) {
    	let svg;
    	let polyline;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polyline = svg_element("polyline");
    			attr_dev(polyline, "class", "cls-1 svelte-1q3kq9g");
    			attr_dev(polyline, "points", "365 748.07 0 748.07 0 0 68.47 0 78.61 94.09 111.59 187 148.35 280 194.96 374.03 224.21 467.1 252.83 561.07 331.85 654.03");
    			add_location(polyline, file$9, 195, 3, 4225);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 748.07");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$9, 194, 2, 4115);
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
    		source: "(194:1) {#if emissionGraph}",
    		ctx
    	});

    	return block;
    }

    // (199:1) {#if fourthText}
    function create_if_block_11(ctx) {
    	let svg;
    	let polygon;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "class", "cls-2");
    			attr_dev(polygon, "points", "365 748.07 0 748.07 0 467.1 365 748.07");
    			add_location(polygon, file$9, 200, 3, 4527);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 748.07");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$9, 199, 2, 4417);
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
    		source: "(199:1) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (204:1) {#if fifthText}
    function create_if_block_10$1(ctx) {
    	let svg;
    	let polygon;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "class", "cls-2");
    			attr_dev(polygon, "points", "365 748.07 0 748.07 0 467.1 182.5 654.03 365 748.07");
    			add_location(polygon, file$9, 205, 3, 4745);
    			attr_dev(svg, "class", "graph");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 748.07");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$9, 204, 2, 4635);
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
    		source: "(204:1) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (216:1) {#if fullMeter}
    function create_if_block_9$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "temperature fullMeter svelte-1q3kq9g");
    			add_location(div, file$9, 216, 2, 4902);
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
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(216:1) {#if fullMeter}",
    		ctx
    	});

    	return block;
    }

    // (219:1) {#if halfMeter}
    function create_if_block_8$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "temperature halfMeter svelte-1q3kq9g");
    			add_location(div, file$9, 219, 2, 4970);
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
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(219:1) {#if halfMeter}",
    		ctx
    	});

    	return block;
    }

    // (229:0) {#if secondText}
    function create_if_block_7$2(ctx) {
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
    	let t10;
    	let div10;
    	let t12;
    	let div11;
    	let t14;
    	let div12;
    	let t16;
    	let div13;
    	let t18;
    	let div14;
    	let t20;
    	let div15;
    	let t22;
    	let div16;
    	let t24;
    	let div17;
    	let t26;
    	let div18;
    	let t27;

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
    			div9.textContent = "2020";
    			t10 = space();
    			div10 = element("div");
    			div10.textContent = "2010";
    			t12 = space();
    			div11 = element("div");
    			div11.textContent = "2000";
    			t14 = space();
    			div12 = element("div");
    			div12.textContent = "1990";
    			t16 = space();
    			div13 = element("div");
    			div13.textContent = "1980";
    			t18 = space();
    			div14 = element("div");
    			div14.textContent = "1970";
    			t20 = space();
    			div15 = element("div");
    			div15.textContent = "1960";
    			t22 = space();
    			div16 = element("div");
    			div16.textContent = "1950";
    			t24 = space();
    			div17 = element("div");
    			div17.textContent = "1940";
    			t26 = space();
    			div18 = element("div");
    			t27 = text("↑");
    			attr_dev(div0, "class", "line left line0 svelte-1q3kq9g");
    			add_location(div0, file$9, 229, 1, 5206);
    			attr_dev(div1, "class", "line left line10 svelte-1q3kq9g");
    			add_location(div1, file$9, 230, 1, 5243);
    			attr_dev(div2, "class", "line left line20 svelte-1q3kq9g");
    			add_location(div2, file$9, 231, 1, 5281);
    			attr_dev(div3, "class", "line left line30 svelte-1q3kq9g");
    			add_location(div3, file$9, 232, 1, 5319);
    			attr_dev(div4, "class", "line left line40 svelte-1q3kq9g");
    			add_location(div4, file$9, 233, 1, 5357);
    			attr_dev(div5, "class", "line left line50 svelte-1q3kq9g");
    			add_location(div5, file$9, 234, 1, 5395);
    			attr_dev(div6, "class", "line left line60 svelte-1q3kq9g");
    			add_location(div6, file$9, 235, 1, 5433);
    			attr_dev(div7, "class", "line left line70 svelte-1q3kq9g");
    			add_location(div7, file$9, 236, 1, 5471);
    			attr_dev(div8, "class", "line left line80 svelte-1q3kq9g");
    			add_location(div8, file$9, 237, 1, 5509);
    			attr_dev(div9, "class", "text years left line0 svelte-1q3kq9g");
    			add_location(div9, file$9, 239, 1, 5548);
    			attr_dev(div10, "class", "text years left line10 svelte-1q3kq9g");
    			add_location(div10, file$9, 240, 1, 5595);
    			attr_dev(div11, "class", "text years left line20 svelte-1q3kq9g");
    			add_location(div11, file$9, 241, 1, 5643);
    			attr_dev(div12, "class", "text years left line30 svelte-1q3kq9g");
    			add_location(div12, file$9, 242, 1, 5691);
    			attr_dev(div13, "class", "text years left line40 svelte-1q3kq9g");
    			add_location(div13, file$9, 243, 1, 5739);
    			attr_dev(div14, "class", "text years left line50 svelte-1q3kq9g");
    			add_location(div14, file$9, 244, 1, 5787);
    			attr_dev(div15, "class", "text years left line60 svelte-1q3kq9g");
    			add_location(div15, file$9, 245, 1, 5835);
    			attr_dev(div16, "class", "text years left line70 svelte-1q3kq9g");
    			add_location(div16, file$9, 246, 1, 5883);
    			attr_dev(div17, "class", "text years left line80 svelte-1q3kq9g");
    			add_location(div17, file$9, 247, 1, 5931);
    			attr_dev(div18, "class", "arrow text svelte-1q3kq9g");
    			set_style(div18, "width", /*marginSides*/ ctx[17]);
    			add_location(div18, file$9, 249, 1, 5980);
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
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div10, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div11, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div12, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div13, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div14, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, div15, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, div16, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, div17, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, div18, anchor);
    			append_dev(div18, t27);
    		},
    		p: noop,
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
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(div15);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(div16);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(div17);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(div18);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(229:0) {#if secondText}",
    		ctx
    	});

    	return block;
    }

    // (253:0) {#if thirdText}
    function create_if_block_6$2(ctx) {
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
    			div8.textContent = "2030";
    			t9 = space();
    			div9 = element("div");
    			div9.textContent = "2040";
    			t11 = space();
    			div10 = element("div");
    			div10.textContent = "2050";
    			t13 = space();
    			div11 = element("div");
    			div11.textContent = "2060";
    			t15 = space();
    			div12 = element("div");
    			div12.textContent = "2070";
    			t17 = space();
    			div13 = element("div");
    			div13.textContent = "2080";
    			t19 = space();
    			div14 = element("div");
    			div14.textContent = "2090";
    			t21 = space();
    			div15 = element("div");
    			div15.textContent = "2100";
    			attr_dev(div0, "class", "line right line10 svelte-1q3kq9g");
    			add_location(div0, file$9, 253, 1, 6071);
    			attr_dev(div1, "class", "line right line20 svelte-1q3kq9g");
    			add_location(div1, file$9, 254, 1, 6110);
    			attr_dev(div2, "class", "line right line30 svelte-1q3kq9g");
    			add_location(div2, file$9, 255, 1, 6149);
    			attr_dev(div3, "class", "line right line40 svelte-1q3kq9g");
    			add_location(div3, file$9, 256, 1, 6188);
    			attr_dev(div4, "class", "line right line50 svelte-1q3kq9g");
    			add_location(div4, file$9, 257, 1, 6227);
    			attr_dev(div5, "class", "line right line60 svelte-1q3kq9g");
    			add_location(div5, file$9, 258, 1, 6266);
    			attr_dev(div6, "class", "line right line70 svelte-1q3kq9g");
    			add_location(div6, file$9, 259, 1, 6305);
    			attr_dev(div7, "class", "line right line80 svelte-1q3kq9g");
    			add_location(div7, file$9, 260, 1, 6344);
    			attr_dev(div8, "class", "text years right line10 svelte-1q3kq9g");
    			add_location(div8, file$9, 262, 1, 6384);
    			attr_dev(div9, "class", "text years right line20 svelte-1q3kq9g");
    			add_location(div9, file$9, 263, 1, 6433);
    			attr_dev(div10, "class", "text years right line30 svelte-1q3kq9g");
    			add_location(div10, file$9, 264, 1, 6482);
    			attr_dev(div11, "class", "text years right line40 svelte-1q3kq9g");
    			add_location(div11, file$9, 265, 1, 6531);
    			attr_dev(div12, "class", "text years right line50 svelte-1q3kq9g");
    			add_location(div12, file$9, 266, 1, 6580);
    			attr_dev(div13, "class", "text years right line60 svelte-1q3kq9g");
    			add_location(div13, file$9, 267, 1, 6629);
    			attr_dev(div14, "class", "text years right line70 svelte-1q3kq9g");
    			add_location(div14, file$9, 268, 1, 6678);
    			attr_dev(div15, "class", "text years right line80 svelte-1q3kq9g");
    			add_location(div15, file$9, 269, 1, 6727);
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
    		},
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(253:0) {#if thirdText}",
    		ctx
    	});

    	return block;
    }

    // (273:0) {#if year20}
    function create_if_block_5$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "2020";
    			attr_dev(div, "class", "text years right line0 svelte-1q3kq9g");
    			add_location(div, file$9, 273, 1, 6796);
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
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(273:0) {#if year20}",
    		ctx
    	});

    	return block;
    }

    // (278:0) {#if fourthText}
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
    			attr_dev(div0, "class", "horizontalLine left svelte-1q3kq9g");
    			set_style(div0, "width", "100%");
    			set_style(div0, "top", "calc(" + /*distanceBLines*/ ctx[16] + " * 6)");
    			add_location(div0, file$9, 278, 1, 6869);
    			attr_dev(div1, "class", "text years right line30 svelte-1q3kq9g");
    			add_location(div1, file$9, 279, 1, 6964);
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
    		source: "(278:0) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (283:0) {#if line50}
    function create_if_block_3$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line right line30 svelte-1q3kq9g");
    			add_location(div, file$9, 283, 1, 7033);
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
    		source: "(283:0) {#if line50}",
    		ctx
    	});

    	return block;
    }

    // (286:0) {#if line30}
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
    			attr_dev(div0, "class", "text years right line10 svelte-1q3kq9g");
    			add_location(div0, file$9, 286, 1, 7091);
    			attr_dev(div1, "class", "line right line10 svelte-1q3kq9g");
    			add_location(div1, file$9, 287, 1, 7140);
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
    		source: "(286:0) {#if line30}",
    		ctx
    	});

    	return block;
    }

    // (294:0) {#if fifthText}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "horizontalLine left svelte-1q3kq9g");
    			set_style(div, "width", "100%");
    			set_style(div, "top", "calc(" + /*distanceBLines*/ ctx[16] + " * 8)");
    			add_location(div, file$9, 294, 1, 7205);
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
    		source: "(294:0) {#if fifthText}",
    		ctx
    	});

    	return block;
    }

    // (297:0) {#if sixthText}
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
    			attr_dev(div0, "class", "horizontalLine left svelte-1q3kq9g");
    			set_style(div0, "width", "100%");
    			set_style(div0, "top", "calc(" + /*distanceBLines*/ ctx[16] + " * 8)");
    			set_style(div0, "border-top", "1px solid blue");
    			add_location(div0, file$9, 297, 1, 7322);
    			attr_dev(div1, "class", "text criticalText svelte-1q3kq9g");
    			set_style(div1, "left", /*marginSides*/ ctx[17]);
    			set_style(div1, "right", /*marginSides*/ ctx[17]);
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[16] + " * 8)");
    			add_location(div1, file$9, 298, 1, 7445);
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
    		source: "(297:0) {#if sixthText}",
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
    	let if_block14 = /*fullMeter*/ ctx[10] && create_if_block_9$1(ctx);
    	let if_block15 = /*halfMeter*/ ctx[11] && create_if_block_8$1(ctx);
    	let if_block16 = /*secondText*/ ctx[5] && create_if_block_7$2(ctx);
    	let if_block17 = /*thirdText*/ ctx[6] && create_if_block_6$2(ctx);
    	let if_block18 = /*year20*/ ctx[12] && create_if_block_5$2(ctx);
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
    			add_location(div0, file$9, 168, 0, 3182);
    			attr_dev(div1, "class", "backgroundBox svelte-1q3kq9g");
    			add_location(div1, file$9, 192, 0, 4064);
    			attr_dev(span0, "class", "tempnumber text svelte-1q3kq9g");
    			add_location(span0, file$9, 222, 2, 5057);
    			attr_dev(span1, "class", "tempnumber left text svelte-1q3kq9g");
    			add_location(span1, file$9, 223, 2, 5120);
    			attr_dev(div2, "class", "temperature infotext svelte-1q3kq9g");
    			add_location(div2, file$9, 221, 1, 5020);
    			attr_dev(div3, "class", "tempMeter svelte-1q3kq9g");
    			add_location(div3, file$9, 214, 0, 4859);
    			attr_dev(div4, "class", "activedot activedot6");
    			add_location(div4, file$9, 310, 0, 7629);
    			attr_dev(div5, "class", "progressline");
    			set_style(div5, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div5, file$9, 312, 1, 7711);
    			attr_dev(div6, "class", "activedotnew activedotFan");
    			add_location(div6, file$9, 311, 0, 7670);
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
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block10) if_block10.m(target, anchor);
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

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t6, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstText*/ ctx[4]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_17(ctx);
    					if_block6.c();
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*secondText*/ ctx[5]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_16(ctx);
    					if_block7.c();
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_15(ctx);
    					if_block8.c();
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*fourthText*/ ctx[7]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_14(ctx);
    					if_block9.c();
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*fifthText*/ ctx[8]) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_13(ctx);
    					if_block10.c();
    					if_block10.m(t12.parentNode, t12);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
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
    					if_block14 = create_if_block_9$1(ctx);
    					if_block14.c();
    					if_block14.m(div3, t16);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (/*halfMeter*/ ctx[11]) {
    				if (if_block15) ; else {
    					if_block15 = create_if_block_8$1(ctx);
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
    				} else {
    					if_block16 = create_if_block_7$2(ctx);
    					if_block16.c();
    					if_block16.m(t22.parentNode, t22);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (/*thirdText*/ ctx[6]) {
    				if (if_block17) ; else {
    					if_block17 = create_if_block_6$2(ctx);
    					if_block17.c();
    					if_block17.m(t23.parentNode, t23);
    				}
    			} else if (if_block17) {
    				if_block17.d(1);
    				if_block17 = null;
    			}

    			if (/*year20*/ ctx[12]) {
    				if (if_block18) ; else {
    					if_block18 = create_if_block_5$2(ctx);
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

    			if (dirty & /*rotate*/ 2) {
    				set_style(div5, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block10) if_block10.d(detaching);
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

    // (37:0) {#if firstSetup}
    function create_if_block_6$3(ctx) {
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
    			add_location(div, file$a, 37, 1, 636);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$a, 38, 1, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
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
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(37:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (41:0) {#if secondSetup}
    function create_if_block_5$3(ctx) {
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
    			add_location(div0, file$a, 41, 1, 763);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$a, 42, 1, 823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[7], false, false, false)
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
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(41:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if thirdSetup}
    function create_if_block_4$4(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$a, 46, 1, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(45:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if firstSetup}
    function create_if_block_3$4(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Text about Ghana.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$a, 68, 1, 1566);
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
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(68:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (89:0) {#if firstSetup}
    function create_if_block_2$4(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "12 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2020";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$a, 90, 2, 1980);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$a, 89, 1, 1871);
    			attr_dev(div0, "class", "temperature firstMeter svelte-jnkohv");
    			add_location(div0, file$a, 94, 2, 2100);
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-jnkohv");
    			add_location(span, file$a, 96, 3, 2183);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$a, 95, 2, 2145);
    			attr_dev(div2, "class", "tempMeterCountry svelte-jnkohv");
    			add_location(div2, file$a, 93, 1, 2067);
    			attr_dev(div3, "class", "text years right line0 svelte-jnkohv");
    			add_location(div3, file$a, 100, 1, 2258);
    			attr_dev(div4, "class", "horizontalLine full right line0 svelte-jnkohv");
    			add_location(div4, file$a, 101, 1, 2306);
    			attr_dev(div5, "class", "text years right line20 svelte-jnkohv");
    			add_location(div5, file$a, 102, 1, 2359);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-jnkohv");
    			add_location(div6, file$a, 103, 1, 2408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(89:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (107:0) {#if secondSetup}
    function create_if_block_1$4(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "25 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2060";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 340 600 340 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$a, 108, 2, 2596);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$a, 107, 1, 2487);
    			attr_dev(div0, "class", "temperature midMeter svelte-jnkohv");
    			add_location(div0, file$a, 112, 2, 2740);
    			attr_dev(span, "class", "tempnumber rightMid text svelte-jnkohv");
    			add_location(span, file$a, 114, 3, 2821);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$a, 113, 2, 2783);
    			attr_dev(div2, "class", "tempMeterCountry svelte-jnkohv");
    			add_location(div2, file$a, 111, 1, 2707);
    			attr_dev(div3, "class", "text years right line40 svelte-jnkohv");
    			add_location(div3, file$a, 118, 1, 2894);
    			attr_dev(div4, "class", "horizontalLine full right line40 svelte-jnkohv");
    			add_location(div4, file$a, 119, 1, 2943);
    			attr_dev(div5, "class", "text years right line20 svelte-jnkohv");
    			add_location(div5, file$a, 120, 1, 2997);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-jnkohv");
    			add_location(div6, file$a, 121, 1, 3046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(107:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (125:0) {#if thirdSetup}
    function create_if_block$4(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "60 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2080";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			div6.textContent = "2100";
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$a, 126, 2, 3233);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$a, 125, 1, 3124);
    			attr_dev(div0, "class", "temperature endMeter svelte-jnkohv");
    			add_location(div0, file$a, 130, 2, 3405);
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-jnkohv");
    			add_location(span, file$a, 132, 3, 3486);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$a, 131, 2, 3448);
    			attr_dev(div2, "class", "tempMeterCountry svelte-jnkohv");
    			add_location(div2, file$a, 129, 1, 3372);
    			attr_dev(div3, "class", "text years right line60 svelte-jnkohv");
    			add_location(div3, file$a, 136, 1, 3559);
    			attr_dev(div4, "class", "horizontalLine full right line60 svelte-jnkohv");
    			add_location(div4, file$a, 137, 1, 3608);
    			attr_dev(div5, "class", "line right line60 svelte-jnkohv");
    			add_location(div5, file$a, 138, 1, 3662);
    			attr_dev(div6, "class", "text years right line80 svelte-jnkohv");
    			add_location(div6, file$a, 139, 1, 3701);
    			attr_dev(div7, "class", "horizontalLine full right line80 svelte-jnkohv");
    			add_location(div7, file$a, 140, 1, 3750);
    			attr_dev(div8, "class", "line right line80 svelte-jnkohv");
    			add_location(div8, file$a, 141, 1, 3804);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(125:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let div1;
    	let span;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div3;
    	let t11;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[3] && create_if_block_6$3(ctx);
    	let if_block1 = /*secondSetup*/ ctx[4] && create_if_block_5$3(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[5] && create_if_block_4$4(ctx);
    	let if_block3 = /*firstSetup*/ ctx[3] && create_if_block_3$4(ctx);
    	let if_block4 = /*firstSetup*/ ctx[3] && create_if_block_2$4(ctx);
    	let if_block5 = /*secondSetup*/ ctx[4] && create_if_block_1$4(ctx);
    	let if_block6 = /*thirdSetup*/ ctx[5] && create_if_block$4(ctx);

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
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			if (if_block6) if_block6.c();
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$a, 64, 0, 1464);
    			attr_dev(span, "class", "tempnumber left text svelte-jnkohv");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$a, 84, 3, 1757);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$a, 83, 2, 1719);
    			attr_dev(div2, "class", "tempMeterCountry svelte-jnkohv");
    			add_location(div2, file$a, 82, 1, 1686);
    			attr_dev(div3, "class", "horizontalLine left svelte-jnkohv");
    			set_style(div3, "width", "100%");
    			set_style(div3, "top", "calc((" + /*distanceBLines*/ ctx[6] + " * 8) - 1px)");
    			set_style(div3, "border-top", "1px solid blue");
    			add_location(div3, file$a, 151, 0, 3880);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$a, 156, 1, 4054);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$a, 155, 0, 4013);
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
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$3(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$3(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$4(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$4(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2$4(ctx);
    					if_block4.c();
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$4(ctx);
    					if_block5.c();
    					if_block5.m(t9.parentNode, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$4(ctx);
    					if_block6.c();
    					if_block6.m(t10.parentNode, t10);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div5);
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
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(3, firstSetup = true);
    		$$invalidate(4, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(3, firstSetup = false);
    		$$invalidate(4, secondSetup = true);
    		$$invalidate(5, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, secondSetup = false);
    		$$invalidate(5, thirdSetup = true);
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
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(6, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(3, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(4, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(5, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) fourthSetup = $$props.fourthSetup;
    		if ("fifthSetup" in $$props) fifthSetup = $$props.fifthSetup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		prev
    	];
    }

    class USA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 10
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

    		if (/*prev*/ ctx[10] === undefined && !("prev" in props)) {
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

    /* src/specifics/Brazil.svelte generated by Svelte v3.23.0 */

    const file$b = "src/specifics/Brazil.svelte";

    // (37:0) {#if firstSetup}
    function create_if_block_6$4(ctx) {
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
    			add_location(div, file$b, 37, 1, 636);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$b, 38, 1, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
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
    		id: create_if_block_6$4.name,
    		type: "if",
    		source: "(37:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (41:0) {#if secondSetup}
    function create_if_block_5$4(ctx) {
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
    			add_location(div0, file$b, 41, 1, 763);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$b, 42, 1, 823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[7], false, false, false)
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
    		id: create_if_block_5$4.name,
    		type: "if",
    		source: "(41:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if thirdSetup}
    function create_if_block_4$5(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$b, 46, 1, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$5.name,
    		type: "if",
    		source: "(45:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if firstSetup}
    function create_if_block_3$5(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Text about Ghana.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$b, 68, 1, 1566);
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
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(68:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (89:0) {#if firstSetup}
    function create_if_block_2$5(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "12 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2020";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$b, 90, 2, 1980);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$b, 89, 1, 1871);
    			attr_dev(div0, "class", "temperature firstMeter svelte-bed3pq");
    			add_location(div0, file$b, 94, 2, 2100);
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-bed3pq");
    			add_location(span, file$b, 96, 3, 2183);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$b, 95, 2, 2145);
    			attr_dev(div2, "class", "tempMeterCountry svelte-bed3pq");
    			add_location(div2, file$b, 93, 1, 2067);
    			attr_dev(div3, "class", "text years right line0 svelte-bed3pq");
    			add_location(div3, file$b, 100, 1, 2258);
    			attr_dev(div4, "class", "horizontalLine full right line0 svelte-bed3pq");
    			add_location(div4, file$b, 101, 1, 2306);
    			attr_dev(div5, "class", "text years right line20 svelte-bed3pq");
    			add_location(div5, file$b, 102, 1, 2359);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-bed3pq");
    			add_location(div6, file$b, 103, 1, 2408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(89:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (107:0) {#if secondSetup}
    function create_if_block_1$5(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "29 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2060";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 336 600 336 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$b, 108, 2, 2596);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$b, 107, 1, 2487);
    			attr_dev(div0, "class", "temperature midMeter svelte-bed3pq");
    			add_location(div0, file$b, 112, 2, 2740);
    			attr_dev(span, "class", "tempnumber rightMid text svelte-bed3pq");
    			add_location(span, file$b, 114, 3, 2821);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$b, 113, 2, 2783);
    			attr_dev(div2, "class", "tempMeterCountry svelte-bed3pq");
    			add_location(div2, file$b, 111, 1, 2707);
    			attr_dev(div3, "class", "text years right line40 svelte-bed3pq");
    			add_location(div3, file$b, 118, 1, 2894);
    			attr_dev(div4, "class", "horizontalLine full right line40 svelte-bed3pq");
    			add_location(div4, file$b, 119, 1, 2943);
    			attr_dev(div5, "class", "text years right line20 svelte-bed3pq");
    			add_location(div5, file$b, 120, 1, 2997);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-bed3pq");
    			add_location(div6, file$b, 121, 1, 3046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(107:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (125:0) {#if thirdSetup}
    function create_if_block$5(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "86 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2080";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			div6.textContent = "2100";
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 279 0 279 300 336 600 336 900 353 900 353 1200 365 1200");
    			add_location(polygon, file$b, 126, 2, 3233);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$b, 125, 1, 3124);
    			attr_dev(div0, "class", "temperature endMeter svelte-bed3pq");
    			add_location(div0, file$b, 130, 2, 3405);
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-bed3pq");
    			add_location(span, file$b, 132, 3, 3486);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$b, 131, 2, 3448);
    			attr_dev(div2, "class", "tempMeterCountry svelte-bed3pq");
    			add_location(div2, file$b, 129, 1, 3372);
    			attr_dev(div3, "class", "text years right line60 svelte-bed3pq");
    			add_location(div3, file$b, 136, 1, 3559);
    			attr_dev(div4, "class", "horizontalLine full right line60 svelte-bed3pq");
    			add_location(div4, file$b, 137, 1, 3608);
    			attr_dev(div5, "class", "line right line60 svelte-bed3pq");
    			add_location(div5, file$b, 138, 1, 3662);
    			attr_dev(div6, "class", "text years right line80 svelte-bed3pq");
    			add_location(div6, file$b, 139, 1, 3701);
    			attr_dev(div7, "class", "horizontalLine full right line80 svelte-bed3pq");
    			add_location(div7, file$b, 140, 1, 3750);
    			attr_dev(div8, "class", "line right line80 svelte-bed3pq");
    			add_location(div8, file$b, 141, 1, 3804);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(125:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let div1;
    	let span;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div3;
    	let t11;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[3] && create_if_block_6$4(ctx);
    	let if_block1 = /*secondSetup*/ ctx[4] && create_if_block_5$4(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[5] && create_if_block_4$5(ctx);
    	let if_block3 = /*firstSetup*/ ctx[3] && create_if_block_3$5(ctx);
    	let if_block4 = /*firstSetup*/ ctx[3] && create_if_block_2$5(ctx);
    	let if_block5 = /*secondSetup*/ ctx[4] && create_if_block_1$5(ctx);
    	let if_block6 = /*thirdSetup*/ ctx[5] && create_if_block$5(ctx);

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
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			if (if_block6) if_block6.c();
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$b, 64, 0, 1464);
    			attr_dev(span, "class", "tempnumber left text svelte-bed3pq");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$b, 84, 3, 1757);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$b, 83, 2, 1719);
    			attr_dev(div2, "class", "tempMeterCountry svelte-bed3pq");
    			add_location(div2, file$b, 82, 1, 1686);
    			attr_dev(div3, "class", "horizontalLine left svelte-bed3pq");
    			set_style(div3, "width", "100%");
    			set_style(div3, "top", "calc((" + /*distanceBLines*/ ctx[6] + " * 8) - 1px)");
    			set_style(div3, "border-top", "1px solid blue");
    			add_location(div3, file$b, 151, 0, 3880);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$b, 155, 1, 4053);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$b, 154, 0, 4012);
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
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$4(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$4(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$5(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$5(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2$5(ctx);
    					if_block4.c();
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$5(ctx);
    					if_block5.c();
    					if_block5.m(t9.parentNode, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$5(ctx);
    					if_block6.c();
    					if_block6.m(t10.parentNode, t10);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(3, firstSetup = true);
    		$$invalidate(4, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(3, firstSetup = false);
    		$$invalidate(4, secondSetup = true);
    		$$invalidate(5, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, secondSetup = false);
    		$$invalidate(5, thirdSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Brazil> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Brazil", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(6, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(3, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(4, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(5, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) fourthSetup = $$props.fourthSetup;
    		if ("fifthSetup" in $$props) fifthSetup = $$props.fifthSetup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		prev
    	];
    }

    class Brazil extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Brazil",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Brazil> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Brazil> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<Brazil> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[10] === undefined && !("prev" in props)) {
    			console.warn("<Brazil> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<Brazil>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<Brazil>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<Brazil>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Brazil>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Iceland.svelte generated by Svelte v3.23.0 */

    const file$c = "src/specifics/Iceland.svelte";

    // (37:0) {#if firstSetup}
    function create_if_block_6$5(ctx) {
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
    			add_location(div, file$c, 37, 1, 636);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$c, 38, 1, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
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
    		id: create_if_block_6$5.name,
    		type: "if",
    		source: "(37:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (41:0) {#if secondSetup}
    function create_if_block_5$5(ctx) {
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
    			add_location(div0, file$c, 41, 1, 763);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$c, 42, 1, 823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[7], false, false, false)
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
    		id: create_if_block_5$5.name,
    		type: "if",
    		source: "(41:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if thirdSetup}
    function create_if_block_4$6(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$c, 46, 1, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$6.name,
    		type: "if",
    		source: "(45:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if firstSetup}
    function create_if_block_3$6(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Text about Iceland. Really lucky geographically.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$c, 68, 1, 1566);
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
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(68:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if firstSetup}
    function create_if_block_2$6(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let div2;
    	let t3;
    	let div3;
    	let t4;
    	let div4;
    	let t6;
    	let div5;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "0 days";
    			t1 = space();
    			div2 = element("div");
    			div2.textContent = "2020";
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			div4 = element("div");
    			div4.textContent = "2040";
    			t6 = space();
    			div5 = element("div");
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-uq8ylw");
    			add_location(span, file$c, 90, 3, 1972);
    			attr_dev(div0, "class", "temperature infotext");
    			add_location(div0, file$c, 89, 2, 1934);
    			attr_dev(div1, "class", "tempMeterCountry svelte-uq8ylw");
    			add_location(div1, file$c, 88, 1, 1901);
    			attr_dev(div2, "class", "text years right line0 svelte-uq8ylw");
    			add_location(div2, file$c, 94, 1, 2046);
    			attr_dev(div3, "class", "horizontalLine full right line0 svelte-uq8ylw");
    			add_location(div3, file$c, 95, 1, 2094);
    			attr_dev(div4, "class", "text years right line20 svelte-uq8ylw");
    			add_location(div4, file$c, 96, 1, 2147);
    			attr_dev(div5, "class", "horizontalLine full right line20 svelte-uq8ylw");
    			add_location(div5, file$c, 97, 1, 2196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(88:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (101:0) {#if secondSetup}
    function create_if_block_1$6(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let div2;
    	let t3;
    	let div3;
    	let t4;
    	let div4;
    	let t6;
    	let div5;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "0 days";
    			t1 = space();
    			div2 = element("div");
    			div2.textContent = "2060";
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			div4 = element("div");
    			div4.textContent = "2040";
    			t6 = space();
    			div5 = element("div");
    			attr_dev(span, "class", "tempnumber rightMid text svelte-uq8ylw");
    			add_location(span, file$c, 103, 3, 2346);
    			attr_dev(div0, "class", "temperature infotext");
    			add_location(div0, file$c, 102, 2, 2308);
    			attr_dev(div1, "class", "tempMeterCountry svelte-uq8ylw");
    			add_location(div1, file$c, 101, 1, 2275);
    			attr_dev(div2, "class", "text years right line40 svelte-uq8ylw");
    			add_location(div2, file$c, 107, 1, 2418);
    			attr_dev(div3, "class", "horizontalLine full right line40 svelte-uq8ylw");
    			add_location(div3, file$c, 108, 1, 2467);
    			attr_dev(div4, "class", "text years right line20 svelte-uq8ylw");
    			add_location(div4, file$c, 109, 1, 2521);
    			attr_dev(div5, "class", "horizontalLine full right line20 svelte-uq8ylw");
    			add_location(div5, file$c, 110, 1, 2570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(101:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (114:0) {#if thirdSetup}
    function create_if_block$6(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let div2;
    	let t3;
    	let div3;
    	let t4;
    	let div4;
    	let t5;
    	let div5;
    	let t7;
    	let div6;
    	let t8;
    	let div7;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "0 days";
    			t1 = space();
    			div2 = element("div");
    			div2.textContent = "2080";
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			div4 = element("div");
    			t5 = space();
    			div5 = element("div");
    			div5.textContent = "2100";
    			t7 = space();
    			div6 = element("div");
    			t8 = space();
    			div7 = element("div");
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-uq8ylw");
    			add_location(span, file$c, 116, 3, 2719);
    			attr_dev(div0, "class", "temperature infotext");
    			add_location(div0, file$c, 115, 2, 2681);
    			attr_dev(div1, "class", "tempMeterCountry svelte-uq8ylw");
    			add_location(div1, file$c, 114, 1, 2648);
    			attr_dev(div2, "class", "text years right line60 svelte-uq8ylw");
    			add_location(div2, file$c, 120, 1, 2791);
    			attr_dev(div3, "class", "horizontalLine full right line60 svelte-uq8ylw");
    			add_location(div3, file$c, 121, 1, 2840);
    			attr_dev(div4, "class", "line right line60 svelte-uq8ylw");
    			add_location(div4, file$c, 122, 1, 2894);
    			attr_dev(div5, "class", "text years right line80 svelte-uq8ylw");
    			add_location(div5, file$c, 123, 1, 2933);
    			attr_dev(div6, "class", "horizontalLine full right line80 svelte-uq8ylw");
    			add_location(div6, file$c, 124, 1, 2982);
    			attr_dev(div7, "class", "line right line80 svelte-uq8ylw");
    			add_location(div7, file$c, 125, 1, 3036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div7, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(114:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let div1;
    	let span;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div3;
    	let t11;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[3] && create_if_block_6$5(ctx);
    	let if_block1 = /*secondSetup*/ ctx[4] && create_if_block_5$5(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[5] && create_if_block_4$6(ctx);
    	let if_block3 = /*firstSetup*/ ctx[3] && create_if_block_3$6(ctx);
    	let if_block4 = /*firstSetup*/ ctx[3] && create_if_block_2$6(ctx);
    	let if_block5 = /*secondSetup*/ ctx[4] && create_if_block_1$6(ctx);
    	let if_block6 = /*thirdSetup*/ ctx[5] && create_if_block$6(ctx);

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
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			if (if_block6) if_block6.c();
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$c, 64, 0, 1464);
    			attr_dev(span, "class", "tempnumber left text svelte-uq8ylw");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$c, 82, 3, 1786);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$c, 81, 2, 1748);
    			attr_dev(div2, "class", "tempMeterCountry svelte-uq8ylw");
    			add_location(div2, file$c, 80, 1, 1715);
    			attr_dev(div3, "class", "horizontalLine left svelte-uq8ylw");
    			set_style(div3, "width", "100%");
    			set_style(div3, "top", "calc((" + /*distanceBLines*/ ctx[6] + " * 8) - 1px)");
    			set_style(div3, "border-top", "1px solid blue");
    			add_location(div3, file$c, 136, 0, 3113);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$c, 140, 1, 3286);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$c, 139, 0, 3245);
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
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$5(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$5(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$6(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$6(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2$6(ctx);
    					if_block4.c();
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$6(ctx);
    					if_block5.c();
    					if_block5.m(t9.parentNode, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$6(ctx);
    					if_block6.c();
    					if_block6.m(t10.parentNode, t10);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(3, firstSetup = true);
    		$$invalidate(4, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(3, firstSetup = false);
    		$$invalidate(4, secondSetup = true);
    		$$invalidate(5, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, secondSetup = false);
    		$$invalidate(5, thirdSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Iceland> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Iceland", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(6, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(3, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(4, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(5, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) fourthSetup = $$props.fourthSetup;
    		if ("fifthSetup" in $$props) fifthSetup = $$props.fifthSetup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		prev
    	];
    }

    class Iceland extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Iceland",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Iceland> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Iceland> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<Iceland> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[10] === undefined && !("prev" in props)) {
    			console.warn("<Iceland> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<Iceland>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<Iceland>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<Iceland>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Iceland>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Ghana.svelte generated by Svelte v3.23.0 */

    const file$d = "src/specifics/Ghana.svelte";

    // (38:0) {#if firstSetup}
    function create_if_block_6$6(ctx) {
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
    			add_location(div, file$d, 38, 1, 637);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$d, 39, 1, 698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
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
    		id: create_if_block_6$6.name,
    		type: "if",
    		source: "(38:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {#if secondSetup}
    function create_if_block_5$6(ctx) {
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
    			add_location(div0, file$d, 42, 1, 764);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$d, 43, 1, 824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[7], false, false, false)
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
    		id: create_if_block_5$6.name,
    		type: "if",
    		source: "(42:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (46:0) {#if thirdSetup}
    function create_if_block_4$7(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$d, 47, 1, 975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$7.name,
    		type: "if",
    		source: "(46:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (69:0) {#if firstSetup}
    function create_if_block_3$7(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Text about Ghana.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$d, 69, 1, 1567);
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
    		id: create_if_block_3$7.name,
    		type: "if",
    		source: "(69:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (90:0) {#if firstSetup}
    function create_if_block_2$7(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "23 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2020";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 342 900 342 1200 365 1200");
    			add_location(polygon, file$d, 91, 2, 1981);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$d, 90, 1, 1872);
    			attr_dev(div0, "class", "temperature firstMeter svelte-1e1aeb0");
    			add_location(div0, file$d, 95, 2, 2101);
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-1e1aeb0");
    			add_location(span, file$d, 97, 3, 2184);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$d, 96, 2, 2146);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1e1aeb0");
    			add_location(div2, file$d, 94, 1, 2068);
    			attr_dev(div3, "class", "text years right line0 svelte-1e1aeb0");
    			add_location(div3, file$d, 101, 1, 2259);
    			attr_dev(div4, "class", "horizontalLine full right line0 svelte-1e1aeb0");
    			add_location(div4, file$d, 102, 1, 2307);
    			attr_dev(div5, "class", "text years right line20 svelte-1e1aeb0");
    			add_location(div5, file$d, 103, 1, 2360);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-1e1aeb0");
    			add_location(div6, file$d, 104, 1, 2409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(90:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if secondSetup}
    function create_if_block_1$7(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "45 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2060";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 320 600 320 900 342 900 342 1200 365 1200");
    			add_location(polygon, file$d, 109, 2, 2597);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$d, 108, 1, 2488);
    			attr_dev(div0, "class", "temperature midMeter svelte-1e1aeb0");
    			add_location(div0, file$d, 113, 2, 2741);
    			attr_dev(span, "class", "tempnumber rightMid text svelte-1e1aeb0");
    			add_location(span, file$d, 115, 3, 2822);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$d, 114, 2, 2784);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1e1aeb0");
    			add_location(div2, file$d, 112, 1, 2708);
    			attr_dev(div3, "class", "text years right line40 svelte-1e1aeb0");
    			add_location(div3, file$d, 119, 1, 2895);
    			attr_dev(div4, "class", "horizontalLine full right line40 svelte-1e1aeb0");
    			add_location(div4, file$d, 120, 1, 2944);
    			attr_dev(div5, "class", "text years right line20 svelte-1e1aeb0");
    			add_location(div5, file$d, 121, 1, 2998);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-1e1aeb0");
    			add_location(div6, file$d, 122, 1, 3047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(108:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (126:0) {#if thirdSetup}
    function create_if_block$7(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "127 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2080";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			div6.textContent = "2100";
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 238 0 238 300 320 600 320 900 342 900 342 1200 365 1200");
    			add_location(polygon, file$d, 127, 2, 3234);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$d, 126, 1, 3125);
    			attr_dev(div0, "class", "temperature endMeter svelte-1e1aeb0");
    			add_location(div0, file$d, 131, 2, 3406);
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-1e1aeb0");
    			add_location(span, file$d, 133, 3, 3487);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$d, 132, 2, 3449);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1e1aeb0");
    			add_location(div2, file$d, 130, 1, 3373);
    			attr_dev(div3, "class", "text years right line60 svelte-1e1aeb0");
    			add_location(div3, file$d, 137, 1, 3561);
    			attr_dev(div4, "class", "horizontalLine full right line60 svelte-1e1aeb0");
    			add_location(div4, file$d, 138, 1, 3610);
    			attr_dev(div5, "class", "line right line60 svelte-1e1aeb0");
    			add_location(div5, file$d, 139, 1, 3664);
    			attr_dev(div6, "class", "text years right line80 svelte-1e1aeb0");
    			add_location(div6, file$d, 140, 1, 3703);
    			attr_dev(div7, "class", "horizontalLine full right line80 svelte-1e1aeb0");
    			add_location(div7, file$d, 141, 1, 3752);
    			attr_dev(div8, "class", "line right line80 svelte-1e1aeb0");
    			add_location(div8, file$d, 142, 1, 3806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(126:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let div1;
    	let span;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div3;
    	let t11;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[3] && create_if_block_6$6(ctx);
    	let if_block1 = /*secondSetup*/ ctx[4] && create_if_block_5$6(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[5] && create_if_block_4$7(ctx);
    	let if_block3 = /*firstSetup*/ ctx[3] && create_if_block_3$7(ctx);
    	let if_block4 = /*firstSetup*/ ctx[3] && create_if_block_2$7(ctx);
    	let if_block5 = /*secondSetup*/ ctx[4] && create_if_block_1$7(ctx);
    	let if_block6 = /*thirdSetup*/ ctx[5] && create_if_block$7(ctx);

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
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			if (if_block6) if_block6.c();
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$d, 65, 0, 1465);
    			attr_dev(span, "class", "tempnumber left text svelte-1e1aeb0");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$d, 85, 3, 1758);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$d, 84, 2, 1720);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1e1aeb0");
    			add_location(div2, file$d, 83, 1, 1687);
    			attr_dev(div3, "class", "horizontalLine left svelte-1e1aeb0");
    			set_style(div3, "width", "100%");
    			set_style(div3, "top", "calc((" + /*distanceBLines*/ ctx[6] + " * 8) - 1px)");
    			set_style(div3, "border-top", "1px solid blue");
    			add_location(div3, file$d, 153, 0, 3883);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$d, 158, 1, 4057);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$d, 157, 0, 4016);
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
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$6(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$6(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$7(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$7(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2$7(ctx);
    					if_block4.c();
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$7(ctx);
    					if_block5.c();
    					if_block5.m(t9.parentNode, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$7(ctx);
    					if_block6.c();
    					if_block6.m(t10.parentNode, t10);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(3, firstSetup = true);
    		$$invalidate(4, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(3, firstSetup = false);
    		$$invalidate(4, secondSetup = true);
    		$$invalidate(5, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, secondSetup = false);
    		$$invalidate(5, thirdSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ghana> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Ghana", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(6, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(3, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(4, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(5, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) fourthSetup = $$props.fourthSetup;
    		if ("fifthSetup" in $$props) fifthSetup = $$props.fifthSetup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		prev
    	];
    }

    class Ghana extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ghana",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Ghana> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Ghana> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<Ghana> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[10] === undefined && !("prev" in props)) {
    			console.warn("<Ghana> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<Ghana>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<Ghana>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<Ghana>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Ghana>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/SaudiArabia.svelte generated by Svelte v3.23.0 */

    const file$e = "src/specifics/SaudiArabia.svelte";

    // (38:0) {#if firstSetup}
    function create_if_block_6$7(ctx) {
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
    			add_location(div, file$e, 38, 1, 637);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$e, 39, 1, 698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
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
    		id: create_if_block_6$7.name,
    		type: "if",
    		source: "(38:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {#if secondSetup}
    function create_if_block_5$7(ctx) {
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
    			add_location(div0, file$e, 42, 1, 764);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$e, 43, 1, 824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[7], false, false, false)
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
    		id: create_if_block_5$7.name,
    		type: "if",
    		source: "(42:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (46:0) {#if thirdSetup}
    function create_if_block_4$8(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$e, 47, 1, 975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$8.name,
    		type: "if",
    		source: "(46:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (76:0) {#if firstSetup}
    function create_if_block_3$8(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Saudi Arabia is one of the countries on the Highest ranking list.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$e, 76, 1, 1589);
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
    		id: create_if_block_3$8.name,
    		type: "if",
    		source: "(76:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (97:0) {#if firstSetup}
    function create_if_block_2$8(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "21 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2020";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 344 900 344 1200 365 1200");
    			add_location(polygon, file$e, 98, 2, 2147);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$e, 97, 1, 2038);
    			attr_dev(div0, "class", "temperature firstMeter svelte-eobtbg");
    			add_location(div0, file$e, 102, 2, 2267);
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-eobtbg");
    			add_location(span, file$e, 104, 3, 2350);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$e, 103, 2, 2312);
    			attr_dev(div2, "class", "tempMeterCountry svelte-eobtbg");
    			add_location(div2, file$e, 101, 1, 2234);
    			attr_dev(div3, "class", "text years right line0 svelte-eobtbg");
    			add_location(div3, file$e, 108, 1, 2425);
    			attr_dev(div4, "class", "horizontalLine full right line0 svelte-eobtbg");
    			add_location(div4, file$e, 109, 1, 2473);
    			attr_dev(div5, "class", "text years right line20 svelte-eobtbg");
    			add_location(div5, file$e, 110, 1, 2526);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-eobtbg");
    			add_location(div6, file$e, 111, 1, 2575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$8.name,
    		type: "if",
    		source: "(97:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (115:0) {#if secondSetup}
    function create_if_block_1$8(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "37 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2060";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 328 600 328 900 344 900 344 1200 365 1200");
    			add_location(polygon, file$e, 116, 2, 2763);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$e, 115, 1, 2654);
    			attr_dev(div0, "class", "temperature midMeter svelte-eobtbg");
    			add_location(div0, file$e, 120, 2, 2907);
    			attr_dev(span, "class", "tempnumber rightMid text svelte-eobtbg");
    			add_location(span, file$e, 122, 3, 2988);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$e, 121, 2, 2950);
    			attr_dev(div2, "class", "tempMeterCountry svelte-eobtbg");
    			add_location(div2, file$e, 119, 1, 2874);
    			attr_dev(div3, "class", "text years right line40 svelte-eobtbg");
    			add_location(div3, file$e, 126, 1, 3061);
    			attr_dev(div4, "class", "horizontalLine full right line40 svelte-eobtbg");
    			add_location(div4, file$e, 127, 1, 3110);
    			attr_dev(div5, "class", "text years right line20 svelte-eobtbg");
    			add_location(div5, file$e, 128, 1, 3164);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-eobtbg");
    			add_location(div6, file$e, 129, 1, 3213);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(115:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (133:0) {#if thirdSetup}
    function create_if_block$8(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "73 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2080";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			div6.textContent = "2100";
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 292 0 292 300 328 600 328 900 344 900 344 1200 365 1200");
    			add_location(polygon, file$e, 134, 2, 3400);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$e, 133, 1, 3291);
    			attr_dev(div0, "class", "temperature endMeter svelte-eobtbg");
    			add_location(div0, file$e, 138, 2, 3572);
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-eobtbg");
    			add_location(span, file$e, 140, 3, 3653);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$e, 139, 2, 3615);
    			attr_dev(div2, "class", "tempMeterCountry svelte-eobtbg");
    			add_location(div2, file$e, 137, 1, 3539);
    			attr_dev(div3, "class", "text years right line60 svelte-eobtbg");
    			add_location(div3, file$e, 144, 1, 3726);
    			attr_dev(div4, "class", "horizontalLine full right line60 svelte-eobtbg");
    			add_location(div4, file$e, 145, 1, 3775);
    			attr_dev(div5, "class", "line right line60 svelte-eobtbg");
    			add_location(div5, file$e, 146, 1, 3829);
    			attr_dev(div6, "class", "text years right line80 svelte-eobtbg");
    			add_location(div6, file$e, 147, 1, 3868);
    			attr_dev(div7, "class", "horizontalLine full right line80 svelte-eobtbg");
    			add_location(div7, file$e, 148, 1, 3917);
    			attr_dev(div8, "class", "line right line80 svelte-eobtbg");
    			add_location(div8, file$e, 149, 1, 3971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(133:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let div1;
    	let span;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div3;
    	let t11;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[3] && create_if_block_6$7(ctx);
    	let if_block1 = /*secondSetup*/ ctx[4] && create_if_block_5$7(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[5] && create_if_block_4$8(ctx);
    	let if_block3 = /*firstSetup*/ ctx[3] && create_if_block_3$8(ctx);
    	let if_block4 = /*firstSetup*/ ctx[3] && create_if_block_2$8(ctx);
    	let if_block5 = /*secondSetup*/ ctx[4] && create_if_block_1$8(ctx);
    	let if_block6 = /*thirdSetup*/ ctx[5] && create_if_block$8(ctx);

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
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			if (if_block6) if_block6.c();
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$e, 69, 0, 1484);
    			attr_dev(span, "class", "tempnumber left text svelte-eobtbg");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$e, 92, 3, 1923);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$e, 91, 2, 1885);
    			attr_dev(div2, "class", "tempMeterCountry svelte-eobtbg");
    			add_location(div2, file$e, 90, 1, 1852);
    			attr_dev(div3, "class", "horizontalLine left svelte-eobtbg");
    			set_style(div3, "width", "100%");
    			set_style(div3, "top", "calc((" + /*distanceBLines*/ ctx[6] + " * 8) - 1px)");
    			set_style(div3, "border-top", "1px solid blue");
    			add_location(div3, file$e, 160, 0, 4048);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$e, 164, 1, 4221);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$e, 163, 0, 4180);
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
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$7(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$7(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$8(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t3, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$8(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*firstSetup*/ ctx[3]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2$8(ctx);
    					if_block4.c();
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*secondSetup*/ ctx[4]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$8(ctx);
    					if_block5.c();
    					if_block5.m(t9.parentNode, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*thirdSetup*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$8(ctx);
    					if_block6.c();
    					if_block6.m(t10.parentNode, t10);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(3, firstSetup = true);
    		$$invalidate(4, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(3, firstSetup = false);
    		$$invalidate(4, secondSetup = true);
    		$$invalidate(5, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, secondSetup = false);
    		$$invalidate(5, thirdSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SaudiArabia> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SaudiArabia", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(10, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(6, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(3, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(4, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(5, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) fourthSetup = $$props.fourthSetup;
    		if ("fifthSetup" in $$props) fifthSetup = $$props.fifthSetup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pagetitleText,
    		rotate,
    		next,
    		firstSetup,
    		secondSetup,
    		thirdSetup,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		prev
    	];
    }

    class SaudiArabia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SaudiArabia",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<SaudiArabia> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<SaudiArabia> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<SaudiArabia> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[10] === undefined && !("prev" in props)) {
    			console.warn("<SaudiArabia> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<SaudiArabia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<SaudiArabia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<SaudiArabia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<SaudiArabia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/India.svelte generated by Svelte v3.23.0 */

    const file$f = "src/specifics/India.svelte";

    // (92:0) {#if firstSetup}
    function create_if_block_27(ctx) {
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
    			add_location(div, file$f, 92, 1, 1532);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$f, 93, 1, 1593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[16], false, false, false);
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
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(92:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (96:0) {#if secondSetup}
    function create_if_block_26(ctx) {
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
    			add_location(div0, file$f, 96, 1, 1659);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$f, 97, 1, 1719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[17], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[15], false, false, false)
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
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(96:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (100:0) {#if thirdSetup}
    function create_if_block_25(ctx) {
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
    			add_location(div0, file$f, 100, 1, 1802);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$f, 101, 1, 1863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefourthSetup*/ ctx[18], false, false, false),
    					listen_dev(div1, "click", /*togglesecondSetup*/ ctx[16], false, false, false)
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
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(100:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (104:0) {#if fourthSetup}
    function create_if_block_24(ctx) {
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
    			add_location(div0, file$f, 104, 1, 1948);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$f, 105, 1, 2008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefifthSetup*/ ctx[19], false, false, false),
    					listen_dev(div1, "click", /*togglethirdSetup*/ ctx[17], false, false, false)
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
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(104:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if fifthSetup}
    function create_if_block_23$1(ctx) {
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
    			add_location(div0, file$f, 108, 1, 2091);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$f, 109, 1, 2151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglesixthSetup*/ ctx[20], false, false, false),
    					listen_dev(div1, "click", /*togglefourthSetup*/ ctx[18], false, false, false)
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
    		id: create_if_block_23$1.name,
    		type: "if",
    		source: "(108:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (112:0) {#if sixthSetup}
    function create_if_block_22$1(ctx) {
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
    			add_location(div0, file$f, 112, 1, 2235);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$f, 113, 1, 2297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*toggleseventhSetup*/ ctx[21], false, false, false),
    					listen_dev(div1, "click", /*togglefifthSetup*/ ctx[19], false, false, false)
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
    		id: create_if_block_22$1.name,
    		type: "if",
    		source: "(112:0) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (116:0) {#if seventhSetup}
    function create_if_block_21$1(ctx) {
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
    			add_location(div0, file$f, 116, 1, 2382);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$f, 117, 1, 2443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*toggleeighthSetup*/ ctx[22], false, false, false),
    					listen_dev(div1, "click", /*togglesixthSetup*/ ctx[20], false, false, false)
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
    		id: create_if_block_21$1.name,
    		type: "if",
    		source: "(116:0) {#if seventhSetup}",
    		ctx
    	});

    	return block;
    }

    // (120:0) {#if eighthSetup}
    function create_if_block_20$1(ctx) {
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
    			add_location(a, file$f, 120, 1, 2527);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$f, 121, 1, 2569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleseventhSetup*/ ctx[21], false, false, false);
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
    		id: create_if_block_20$1.name,
    		type: "if",
    		source: "(120:0) {#if eighthSetup}",
    		ctx
    	});

    	return block;
    }

    // (133:0) {#if firstSetup}
    function create_if_block_19$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Some argue that climate action in the west is useless if large countries such as China and India don't take action [as if the west is suddenly powerless without eastern leadership].");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$f, 133, 1, 2763);
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
    		id: create_if_block_19$1.name,
    		type: "if",
    		source: "(133:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (140:0) {#if secondSetup}
    function create_if_block_18$1(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div4;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("India is a former British colony, and has been independant since 1947. Following it's independance and up till the mid 60's, was an era of \"golden age\" Hindi cinema.");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "1947";
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "1965";
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$f, 140, 1, 3179);
    			attr_dev(div1, "class", "horizontalLine left line73 svelte-3u49s8");
    			set_style(div1, "width", "100%");
    			add_location(div1, file$f, 144, 1, 3467);
    			attr_dev(div2, "class", "text years left line73 svelte-3u49s8");
    			add_location(div2, file$f, 145, 1, 3536);
    			attr_dev(div3, "class", "horizontalLine left line55 svelte-3u49s8");
    			set_style(div3, "width", "100%");
    			add_location(div3, file$f, 148, 1, 3587);
    			attr_dev(div4, "class", "text years left line55 svelte-3u49s8");
    			add_location(div4, file$f, 149, 1, 3656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$1.name,
    		type: "if",
    		source: "(140:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (155:0) {:else}
    function create_else_block_3(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line left line73 svelte-3u49s8");
    			add_location(div0, file$f, 155, 1, 3738);
    			attr_dev(div1, "class", "line left line55 svelte-3u49s8");
    			add_location(div1, file$f, 156, 1, 3776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(155:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (154:0) {#if firstSetup}
    function create_if_block_17$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$1.name,
    		type: "if",
    		source: "(154:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (161:0) {#if secondPics}
    function create_if_block_16$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "position", "absolute");
    			set_style(img, "width", "50%");
    			set_style(img, "right", "5%");
    			set_style(img, "top", "23%");
    			if (img.src !== (img_src_value = "https://i0.wp.com/notsocommon.in/wp-content/uploads/2020/03/EDx-TkVUwAANds0.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$f, 161, 1, 3839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(161:0) {#if secondPics}",
    		ctx
    	});

    	return block;
    }

    // (166:0) {#if thirdSetup}
    function create_if_block_15$1(ctx) {
    	let div0;
    	let t0;
    	let span;
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Within the film-industry was born a strong film-music industry with composers such as R. D. Burman, who wrote the song XXX for the 1981 movie ");
    			span = element("span");
    			span.textContent = "एक दूजे के लिए";
    			t2 = text(" (Ek Duuje Ke Liye or We Are Made For Each Other).");
    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "1981";
    			set_style(span, "font-family", "arita");
    			add_location(span, file$f, 167, 144, 4222);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$f, 166, 1, 4018);
    			attr_dev(div1, "class", "horizontalLine left line39 svelte-3u49s8");
    			set_style(div1, "width", "100%");
    			add_location(div1, file$f, 170, 1, 4417);
    			attr_dev(div2, "class", "text years left line39 svelte-3u49s8");
    			add_location(div2, file$f, 171, 1, 4486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(166:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (178:1) {:else}
    function create_else_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line left line39 svelte-3u49s8");
    			add_location(div, file$f, 178, 2, 4595);
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(178:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (177:1) {#if secondSetup}
    function create_if_block_14$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(177:1) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (175:0) {#if firstSetup}
    function create_if_block_13$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(175:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (184:0) {#if fourthSetup}
    function create_if_block_12$1(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("A few years later, in 1990, Asha Puthli published the album Hari Om, named after one of the songs of the album, an indian rendition of Madonna's Like a Prayer. Another song on the album is an indian version of Smooth Criminal, Chipko Chipko.");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "1990";
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$f, 184, 1, 4666);
    			attr_dev(div1, "class", "horizontalLine left line30 svelte-3u49s8");
    			set_style(div1, "width", "100%");
    			add_location(div1, file$f, 188, 1, 4980);
    			attr_dev(div2, "class", "text years left line30 svelte-3u49s8");
    			add_location(div2, file$f, 189, 1, 5049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(184:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (200:2) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line left line30 svelte-3u49s8");
    			add_location(div, file$f, 200, 3, 5191);
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(200:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (199:2) {#if thirdSetup}
    function create_if_block_11$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(199:2) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (197:1) {#if secondSetup}
    function create_if_block_10$2(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$2.name,
    		type: "if",
    		source: "(197:1) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (195:0) {#if firstSetup}
    function create_if_block_9$2(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(195:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (207:0) {#if fifthSetup}
    function create_if_block_8$2(ctx) {
    	let div0;
    	let t0;
    	let span;
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let div2;
    	let t6;
    	let div3;
    	let t7;
    	let div4;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("The meaning of Chipko is to hug, embrace or stick to. ");
    			span = element("span");
    			span.textContent = "चिपको आंदोलन";
    			t2 = text(" (The Chipko Andalon) is a eco-feminist movement formed in 1974 by a group of women, lead by Gaura Devi. Following a tradition of the Bishnois in 1700's, they saved 2.500 trees in Uttarakhand from lodgers by embracing them and influenced a treecutting ban in 1980.");
    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "1974";
    			t6 = space();
    			div3 = element("div");
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "1980";
    			set_style(span, "font-family", "arita");
    			add_location(span, file$f, 208, 56, 5385);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$f, 207, 1, 5269);
    			attr_dev(div1, "class", "horizontalLine left line46 svelte-3u49s8");
    			set_style(div1, "width", "100%");
    			add_location(div1, file$f, 211, 1, 6137);
    			attr_dev(div2, "class", "text years left line46 svelte-3u49s8");
    			add_location(div2, file$f, 212, 1, 6206);
    			attr_dev(div3, "class", "horizontalLine left line40 svelte-3u49s8");
    			set_style(div3, "width", "100%");
    			add_location(div3, file$f, 213, 1, 6254);
    			attr_dev(div4, "class", "text years left line40 svelte-3u49s8");
    			add_location(div4, file$f, 214, 1, 6323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(207:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (226:3) {:else}
    function create_else_block(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line left line46 svelte-3u49s8");
    			add_location(div0, file$f, 226, 3, 6495);
    			attr_dev(div1, "class", "line left line40 svelte-3u49s8");
    			add_location(div1, file$f, 227, 3, 6535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(226:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (225:3) {#if fourthSetup}
    function create_if_block_7$3(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(225:3) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (223:2) {#if thirdSetup}
    function create_if_block_6$8(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$8.name,
    		type: "if",
    		source: "(223:2) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (221:1) {#if secondSetup}
    function create_if_block_5$8(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$8.name,
    		type: "if",
    		source: "(221:1) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (219:0) {#if firstSetup}
    function create_if_block_4$9(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$9.name,
    		type: "if",
    		source: "(219:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (235:0) {#if sixthText}
    function create_if_block_3$9(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let span;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("India — which will see an increase of X hot days in the next two decades, Y the two decades after that and Z in the two decades leading up to 2100 if business is left \"as usual\" — is not devoid of environmentalism, and although India will need to take radical some climate action, the impact of India is not ranked high (better words!).");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$f, 235, 1, 6621);
    			attr_dev(span, "class", "tempnumber left text svelte-3u49s8");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$f, 241, 3, 7113);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$f, 240, 2, 7075);
    			attr_dev(div2, "class", "tempMeterCountry svelte-3u49s8");
    			add_location(div2, file$f, 239, 1, 7042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$9.name,
    		type: "if",
    		source: "(235:0) {#if sixthText}",
    		ctx
    	});

    	return block;
    }

    // (257:0) {#if sixthSetup}
    function create_if_block_2$9(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "18 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2020";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200.5 365 900.5 347 900.5 347 1200.5 365 1200.5");
    			add_location(polygon, file$f, 258, 2, 7366);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$f, 257, 1, 7257);
    			attr_dev(div0, "class", "temperature firstMeter svelte-3u49s8");
    			add_location(div0, file$f, 262, 2, 7496);
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-3u49s8");
    			add_location(span, file$f, 264, 3, 7579);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$f, 263, 2, 7541);
    			attr_dev(div2, "class", "tempMeterCountry svelte-3u49s8");
    			add_location(div2, file$f, 261, 1, 7463);
    			attr_dev(div3, "class", "text years right line0 svelte-3u49s8");
    			add_location(div3, file$f, 268, 1, 7654);
    			attr_dev(div4, "class", "horizontalLine full right line0 svelte-3u49s8");
    			add_location(div4, file$f, 269, 1, 7702);
    			attr_dev(div5, "class", "text years right line20 svelte-3u49s8");
    			add_location(div5, file$f, 270, 1, 7755);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-3u49s8");
    			add_location(div6, file$f, 271, 1, 7804);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$9.name,
    		type: "if",
    		source: "(257:0) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (274:0) {#if seventhSetup}
    function create_if_block_1$9(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "39 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2060";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200.5 365 900.5 365 600.5 326 600.5 326 900.5 347 900.5 347 1200.5 365 1200.5");
    			add_location(polygon, file$f, 275, 2, 7992);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$f, 274, 1, 7883);
    			attr_dev(div0, "class", "temperature midMeter svelte-3u49s8");
    			add_location(div0, file$f, 279, 2, 8152);
    			attr_dev(span, "class", "tempnumber rightMid text svelte-3u49s8");
    			add_location(span, file$f, 281, 3, 8233);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$f, 280, 2, 8195);
    			attr_dev(div2, "class", "tempMeterCountry svelte-3u49s8");
    			add_location(div2, file$f, 278, 1, 8119);
    			attr_dev(div3, "class", "text years right line40 svelte-3u49s8");
    			add_location(div3, file$f, 285, 1, 8306);
    			attr_dev(div4, "class", "horizontalLine full right line40 svelte-3u49s8");
    			add_location(div4, file$f, 286, 1, 8355);
    			attr_dev(div5, "class", "text years right line20 svelte-3u49s8");
    			add_location(div5, file$f, 287, 1, 8409);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-3u49s8");
    			add_location(div6, file$f, 288, 1, 8458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(274:0) {#if seventhSetup}",
    		ctx
    	});

    	return block;
    }

    // (291:0) {#if eighthSetup}
    function create_if_block$9(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "102 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2080";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			div6.textContent = "2100";
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			attr_dev(polygon, "class", "cls-1");
    			attr_dev(polygon, "points", "365 1200.5 365 900.5 365 600.5 365 300.5 365 0.5 263 0.5 263 300.5 326 600.5 326 900.5 347 900.5 347 1200.5 365 1200.5");
    			add_location(polygon, file$f, 292, 2, 8645);
    			attr_dev(svg, "class", "hotDays");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$f, 291, 1, 8536);
    			attr_dev(div0, "class", "temperature endMeter svelte-3u49s8");
    			add_location(div0, file$f, 296, 2, 8841);
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-3u49s8");
    			add_location(span, file$f, 298, 3, 8922);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$f, 297, 2, 8884);
    			attr_dev(div2, "class", "tempMeterCountry svelte-3u49s8");
    			add_location(div2, file$f, 295, 1, 8808);
    			attr_dev(div3, "class", "text years right line60 svelte-3u49s8");
    			add_location(div3, file$f, 302, 1, 8996);
    			attr_dev(div4, "class", "horizontalLine full right line60 svelte-3u49s8");
    			add_location(div4, file$f, 303, 1, 9045);
    			attr_dev(div5, "class", "line right line60 svelte-3u49s8");
    			add_location(div5, file$f, 304, 1, 9099);
    			attr_dev(div6, "class", "text years right line80 svelte-3u49s8");
    			add_location(div6, file$f, 305, 1, 9138);
    			attr_dev(div7, "class", "horizontalLine full right line80 svelte-3u49s8");
    			add_location(div7, file$f, 306, 1, 9187);
    			attr_dev(div8, "class", "line right line80 svelte-3u49s8");
    			add_location(div8, file$f, 307, 1, 9241);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(291:0) {#if eighthSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div0;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let div1;
    	let t24;
    	let div3;
    	let div2;
    	let a;
    	let t26;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_27(ctx);
    	let if_block1 = /*secondSetup*/ ctx[5] && create_if_block_26(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[6] && create_if_block_25(ctx);
    	let if_block3 = /*fourthSetup*/ ctx[7] && create_if_block_24(ctx);
    	let if_block4 = /*fifthSetup*/ ctx[8] && create_if_block_23$1(ctx);
    	let if_block5 = /*sixthSetup*/ ctx[9] && create_if_block_22$1(ctx);
    	let if_block6 = /*seventhSetup*/ ctx[11] && create_if_block_21$1(ctx);
    	let if_block7 = /*eighthSetup*/ ctx[12] && create_if_block_20$1(ctx);
    	let if_block8 = /*firstSetup*/ ctx[4] && create_if_block_19$1(ctx);
    	let if_block9 = /*secondSetup*/ ctx[5] && create_if_block_18$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*firstSetup*/ ctx[4]) return create_if_block_17$1;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block10 = current_block_type(ctx);
    	let if_block11 = /*secondPics*/ ctx[13] && create_if_block_16$1(ctx);
    	let if_block12 = /*thirdSetup*/ ctx[6] && create_if_block_15$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*firstSetup*/ ctx[4]) return create_if_block_13$1;
    		if (/*secondSetup*/ ctx[5]) return create_if_block_14$1;
    		return create_else_block_2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block13 = current_block_type_1(ctx);
    	let if_block14 = /*fourthSetup*/ ctx[7] && create_if_block_12$1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*firstSetup*/ ctx[4]) return create_if_block_9$2;
    		if (/*secondSetup*/ ctx[5]) return create_if_block_10$2;
    		if (/*thirdSetup*/ ctx[6]) return create_if_block_11$1;
    		return create_else_block_1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block15 = current_block_type_2(ctx);
    	let if_block16 = /*fifthSetup*/ ctx[8] && create_if_block_8$2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*firstSetup*/ ctx[4]) return create_if_block_4$9;
    		if (/*secondSetup*/ ctx[5]) return create_if_block_5$8;
    		if (/*thirdSetup*/ ctx[6]) return create_if_block_6$8;
    		if (/*fourthSetup*/ ctx[7]) return create_if_block_7$3;
    		return create_else_block;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block17 = current_block_type_3(ctx);
    	let if_block18 = /*sixthText*/ ctx[10] && create_if_block_3$9(ctx);
    	let if_block19 = /*sixthSetup*/ ctx[9] && create_if_block_2$9(ctx);
    	let if_block20 = /*seventhSetup*/ ctx[11] && create_if_block_1$9(ctx);
    	let if_block21 = /*eighthSetup*/ ctx[12] && create_if_block$9(ctx);

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
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			t7 = space();
    			div0 = element("div");
    			t8 = text(/*pagetitleText*/ ctx[0]);
    			t9 = space();
    			if (if_block8) if_block8.c();
    			t10 = space();
    			if (if_block9) if_block9.c();
    			t11 = space();
    			if_block10.c();
    			t12 = space();
    			if (if_block11) if_block11.c();
    			t13 = space();
    			if (if_block12) if_block12.c();
    			t14 = space();
    			if_block13.c();
    			t15 = space();
    			if (if_block14) if_block14.c();
    			t16 = space();
    			if_block15.c();
    			t17 = space();
    			if (if_block16) if_block16.c();
    			t18 = space();
    			if_block17.c();
    			t19 = space();
    			if (if_block18) if_block18.c();
    			t20 = space();
    			if (if_block19) if_block19.c();
    			t21 = space();
    			if (if_block20) if_block20.c();
    			t22 = space();
    			if (if_block21) if_block21.c();
    			t23 = space();
    			div1 = element("div");
    			t24 = space();
    			div3 = element("div");
    			div2 = element("div");
    			a = element("a");
    			a.textContent = "Sources [1], [2], [3].";
    			t26 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$f, 131, 0, 2663);
    			attr_dev(div1, "class", "horizontalLine left svelte-3u49s8");
    			set_style(div1, "width", "100%");
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[14] + " * 8) - 1px)");
    			set_style(div1, "border-top", "1px solid blue");
    			add_location(div1, file$f, 316, 0, 9292);
    			attr_dev(a, "class", "svelte-3u49s8");
    			add_location(a, file$f, 322, 3, 9536);
    			attr_dev(div2, "class", "bottomLineText text svelte-3u49s8");
    			set_style(div2, "text-align", "right");
    			add_location(div2, file$f, 321, 2, 9472);
    			attr_dev(div3, "class", "text bottomLine svelte-3u49s8");
    			add_location(div3, file$f, 320, 0, 9440);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$f, 329, 1, 9626);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$f, 328, 0, 9585);
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
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t8);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if_block10.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block12) if_block12.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			if_block13.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block14) if_block14.m(target, anchor);
    			insert_dev(target, t16, anchor);
    			if_block15.m(target, anchor);
    			insert_dev(target, t17, anchor);
    			if (if_block16) if_block16.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			if_block17.m(target, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block18) if_block18.m(target, anchor);
    			insert_dev(target, t20, anchor);
    			if (if_block19) if_block19.m(target, anchor);
    			insert_dev(target, t21, anchor);
    			if (if_block20) if_block20.m(target, anchor);
    			insert_dev(target, t22, anchor);
    			if (if_block21) if_block21.m(target, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_27(ctx);
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
    					if_block1 = create_if_block_26(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_25(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fourthSetup*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_24(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*fifthSetup*/ ctx[8]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_23$1(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*sixthSetup*/ ctx[9]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_22$1(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*seventhSetup*/ ctx[11]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_21$1(ctx);
    					if_block6.c();
    					if_block6.m(t6.parentNode, t6);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*eighthSetup*/ ctx[12]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_20$1(ctx);
    					if_block7.c();
    					if_block7.m(t7.parentNode, t7);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t8, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_19$1(ctx);
    					if_block8.c();
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_18$1(ctx);
    					if_block9.c();
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block10.d(1);
    				if_block10 = current_block_type(ctx);

    				if (if_block10) {
    					if_block10.c();
    					if_block10.m(t12.parentNode, t12);
    				}
    			}

    			if (/*secondPics*/ ctx[13]) {
    				if (if_block11) ; else {
    					if_block11 = create_if_block_16$1(ctx);
    					if_block11.c();
    					if_block11.m(t13.parentNode, t13);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*thirdSetup*/ ctx[6]) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_15$1(ctx);
    					if_block12.c();
    					if_block12.m(t14.parentNode, t14);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block13.d(1);
    				if_block13 = current_block_type_1(ctx);

    				if (if_block13) {
    					if_block13.c();
    					if_block13.m(t15.parentNode, t15);
    				}
    			}

    			if (/*fourthSetup*/ ctx[7]) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);
    				} else {
    					if_block14 = create_if_block_12$1(ctx);
    					if_block14.c();
    					if_block14.m(t16.parentNode, t16);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block15.d(1);
    				if_block15 = current_block_type_2(ctx);

    				if (if_block15) {
    					if_block15.c();
    					if_block15.m(t17.parentNode, t17);
    				}
    			}

    			if (/*fifthSetup*/ ctx[8]) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);
    				} else {
    					if_block16 = create_if_block_8$2(ctx);
    					if_block16.c();
    					if_block16.m(t18.parentNode, t18);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (current_block_type_3 !== (current_block_type_3 = select_block_type_3(ctx))) {
    				if_block17.d(1);
    				if_block17 = current_block_type_3(ctx);

    				if (if_block17) {
    					if_block17.c();
    					if_block17.m(t19.parentNode, t19);
    				}
    			}

    			if (/*sixthText*/ ctx[10]) {
    				if (if_block18) {
    					if_block18.p(ctx, dirty);
    				} else {
    					if_block18 = create_if_block_3$9(ctx);
    					if_block18.c();
    					if_block18.m(t20.parentNode, t20);
    				}
    			} else if (if_block18) {
    				if_block18.d(1);
    				if_block18 = null;
    			}

    			if (/*sixthSetup*/ ctx[9]) {
    				if (if_block19) ; else {
    					if_block19 = create_if_block_2$9(ctx);
    					if_block19.c();
    					if_block19.m(t21.parentNode, t21);
    				}
    			} else if (if_block19) {
    				if_block19.d(1);
    				if_block19 = null;
    			}

    			if (/*seventhSetup*/ ctx[11]) {
    				if (if_block20) ; else {
    					if_block20 = create_if_block_1$9(ctx);
    					if_block20.c();
    					if_block20.m(t22.parentNode, t22);
    				}
    			} else if (if_block20) {
    				if_block20.d(1);
    				if_block20 = null;
    			}

    			if (/*eighthSetup*/ ctx[12]) {
    				if (if_block21) ; else {
    					if_block21 = create_if_block$9(ctx);
    					if_block21.c();
    					if_block21.m(t23.parentNode, t23);
    				}
    			} else if (if_block21) {
    				if_block21.d(1);
    				if_block21 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if_block10.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(t13);
    			if (if_block12) if_block12.d(detaching);
    			if (detaching) detach_dev(t14);
    			if_block13.d(detaching);
    			if (detaching) detach_dev(t15);
    			if (if_block14) if_block14.d(detaching);
    			if (detaching) detach_dev(t16);
    			if_block15.d(detaching);
    			if (detaching) detach_dev(t17);
    			if (if_block16) if_block16.d(detaching);
    			if (detaching) detach_dev(t18);
    			if_block17.d(detaching);
    			if (detaching) detach_dev(t19);
    			if (if_block18) if_block18.d(detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block19) if_block19.d(detaching);
    			if (detaching) detach_dev(t21);
    			if (if_block20) if_block20.d(detaching);
    			if (detaching) detach_dev(t22);
    			if (if_block21) if_block21.d(detaching);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;
    	let sixthSetup = false;
    	let sixthText = false;
    	let seventhSetup = false;
    	let eighthSetup = false;
    	let secondPics = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(13, secondPics = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
    		$$invalidate(6, thirdSetup = false);
    		$$invalidate(13, secondPics = true);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, thirdSetup = true);
    		$$invalidate(7, fourthSetup = false);
    		$$invalidate(13, secondPics = false);
    	};

    	const togglefourthSetup = () => {
    		$$invalidate(6, thirdSetup = false);
    		$$invalidate(7, fourthSetup = true);
    		$$invalidate(8, fifthSetup = false);
    	};

    	const togglefifthSetup = () => {
    		$$invalidate(7, fourthSetup = false);
    		$$invalidate(8, fifthSetup = true);
    		$$invalidate(9, sixthSetup = false);
    		$$invalidate(10, sixthText = false);
    		$$invalidate(13, secondPics = false);
    	};

    	const togglesixthSetup = () => {
    		$$invalidate(8, fifthSetup = false);
    		$$invalidate(9, sixthSetup = true);
    		$$invalidate(11, seventhSetup = false);
    		$$invalidate(10, sixthText = true);
    		$$invalidate(13, secondPics = true);
    	};

    	const toggleseventhSetup = () => {
    		$$invalidate(9, sixthSetup = false);
    		$$invalidate(11, seventhSetup = true);
    		$$invalidate(12, eighthSetup = false);
    		$$invalidate(10, sixthText = true);
    		$$invalidate(13, secondPics = true);
    	};

    	const toggleeighthSetup = () => {
    		$$invalidate(11, seventhSetup = false);
    		$$invalidate(12, eighthSetup = true);
    		$$invalidate(10, sixthText = true);
    		$$invalidate(13, secondPics = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<India> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("India", $$slots, []);

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
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		sixthSetup,
    		sixthText,
    		seventhSetup,
    		eighthSetup,
    		secondPics,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup,
    		togglesixthSetup,
    		toggleseventhSetup,
    		toggleeighthSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(14, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(5, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(6, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) $$invalidate(7, fourthSetup = $$props.fourthSetup);
    		if ("fifthSetup" in $$props) $$invalidate(8, fifthSetup = $$props.fifthSetup);
    		if ("sixthSetup" in $$props) $$invalidate(9, sixthSetup = $$props.sixthSetup);
    		if ("sixthText" in $$props) $$invalidate(10, sixthText = $$props.sixthText);
    		if ("seventhSetup" in $$props) $$invalidate(11, seventhSetup = $$props.seventhSetup);
    		if ("eighthSetup" in $$props) $$invalidate(12, eighthSetup = $$props.eighthSetup);
    		if ("secondPics" in $$props) $$invalidate(13, secondPics = $$props.secondPics);
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
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		sixthSetup,
    		sixthText,
    		seventhSetup,
    		eighthSetup,
    		secondPics,
    		distanceBLines,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup,
    		togglesixthSetup,
    		toggleseventhSetup,
    		toggleeighthSetup
    	];
    }

    class India extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "India",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<India> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<India> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<India> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<India> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<India>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<India>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<India>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<India>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/Cambodia.svelte generated by Svelte v3.23.0 */

    const file$g = "src/specifics/Cambodia.svelte";

    // (119:0) {#if firstSetup}
    function create_if_block_23$2(ctx) {
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
    			add_location(div, file$g, 119, 1, 2302);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$g, 120, 1, 2363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[22], false, false, false);
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
    		id: create_if_block_23$2.name,
    		type: "if",
    		source: "(119:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (123:0) {#if secondSetup}
    function create_if_block_22$2(ctx) {
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
    			add_location(div0, file$g, 123, 1, 2429);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$g, 124, 1, 2489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[23], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[21], false, false, false)
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
    		id: create_if_block_22$2.name,
    		type: "if",
    		source: "(123:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (127:0) {#if thirdSetup}
    function create_if_block_21$2(ctx) {
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
    			add_location(div0, file$g, 127, 1, 2572);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$g, 128, 1, 2633);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefourthSetup*/ ctx[24], false, false, false),
    					listen_dev(div1, "click", /*togglesecondSetup*/ ctx[22], false, false, false)
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
    		id: create_if_block_21$2.name,
    		type: "if",
    		source: "(127:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (131:0) {#if fourthSetup}
    function create_if_block_20$2(ctx) {
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
    			add_location(div0, file$g, 131, 1, 2718);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$g, 132, 1, 2778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefifthSetup*/ ctx[25], false, false, false),
    					listen_dev(div1, "click", /*togglethirdSetup*/ ctx[23], false, false, false)
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
    		id: create_if_block_20$2.name,
    		type: "if",
    		source: "(131:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (135:0) {#if fifthSetup}
    function create_if_block_19$2(ctx) {
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
    			add_location(div0, file$g, 135, 1, 2861);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$g, 136, 1, 2921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglesixthSetup*/ ctx[26], false, false, false),
    					listen_dev(div1, "click", /*togglefourthSetup*/ ctx[24], false, false, false)
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
    		id: create_if_block_19$2.name,
    		type: "if",
    		source: "(135:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (139:0) {#if sixthSetup}
    function create_if_block_18$2(ctx) {
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
    			add_location(a, file$g, 139, 1, 3005);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$g, 140, 1, 3047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglefifthSetup*/ ctx[25], false, false, false);
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
    		id: create_if_block_18$2.name,
    		type: "if",
    		source: "(139:0) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (151:0) {#if firstSetup}
    function create_if_block_17$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Travelling on west (and south) from S-Korea, we reach Cambodia, a former french colony which gained independance in 1953.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$g, 151, 1, 3238);
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
    		id: create_if_block_17$2.name,
    		type: "if",
    		source: "(151:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (157:0) {#if firstPics}
    function create_if_block_16$2(ctx) {
    	let img0;
    	let img0_src_value;
    	let t;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			img0 = element("img");
    			t = space();
    			img1 = element("img");
    			set_style(img0, "position", "absolute");
    			set_style(img0, "height", "20vw");
    			set_style(img0, "right", "5%");
    			set_style(img0, "bottom", "10%");
    			if (img0.src !== (img0_src_value = "https://cdn1.i-scmp.com/sites/default/files/styles/1200x800/public/images/methode/2017/08/17/4b764522-818f-11e7-a767-bc310e55dd10_1280x720_145203.JPG?itok=-KNK72jk")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$g, 157, 1, 3455);
    			set_style(img1, "position", "absolute");
    			set_style(img1, "width", "25%");
    			set_style(img1, "left", "13%");
    			set_style(img1, "top", "0%");
    			if (img1.src !== (img1_src_value = "https://i.pinimg.com/564x/e2/95/98/e29598f213c862f21bf9e9b02d1a2587.jpg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$g, 159, 1, 3699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$2.name,
    		type: "if",
    		source: "(157:0) {#if firstPics}",
    		ctx
    	});

    	return block;
    }

    // (169:0) {#if secondSetup}
    function create_if_block_15$2(ctx) {
    	let div0;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("In the following years, Cambodia's music and film industry took off with stars such as ");
    			span0 = element("span");
    			span0.textContent = "រស់ សេរីសុទ្ធា";
    			t2 = text(" (Ros Sereysothea) and ");
    			span1 = element("span");
    			span1.textContent = "ស៊ីន ស៊ីសាមុត";
    			t4 = text(" (Sinn Sisamouth).");
    			t5 = space();
    			div1 = element("div");
    			t6 = space();
    			div2 = element("div");
    			div2.textContent = "1960";
    			set_style(span0, "font-family", "arita");
    			add_location(span0, file$g, 170, 89, 4636);
    			set_style(span1, "font-family", "arita");
    			add_location(span1, file$g, 170, 177, 4724);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$g, 169, 1, 4487);
    			attr_dev(div1, "class", "horizontalLine left line60 svelte-1vsgcvx");
    			set_style(div1, "width", "100%");
    			add_location(div1, file$g, 173, 1, 4817);
    			attr_dev(div2, "class", "text years left line60 svelte-1vsgcvx");
    			add_location(div2, file$g, 174, 1, 4886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(div0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$2.name,
    		type: "if",
    		source: "(169:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (178:0) {#if secondPics}
    function create_if_block_14$2(ctx) {
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			img2 = element("img");
    			t2 = space();
    			img3 = element("img");
    			t3 = space();
    			img4 = element("img");
    			set_style(img0, "position", "absolute");
    			set_style(img0, "width", "25%");
    			set_style(img0, "left", "22%");
    			set_style(img0, "top", "30%");
    			if (img0.src !== (img0_src_value = "https://scontent-amt2-1.xx.fbcdn.net/v/t1.0-9/57407288_2227425770672919_6336639571349995520_o.jpg?_nc_cat=107&_nc_sid=8bfeb9&_nc_ohc=FD7UY8v07GYAX9lFo_d&_nc_ht=scontent-amt2-1.xx&oh=09b60e207ed1900b280264d73ed4ce73&oe=5F0CD97E")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$g, 182, 1, 5516);
    			set_style(img1, "position", "absolute");
    			set_style(img1, "width", "25%");
    			set_style(img1, "right", "2%");
    			set_style(img1, "bottom", "3%");
    			if (img1.src !== (img1_src_value = "https://i.pinimg.com/564x/e5/ea/52/e5ea5295c095e1f907de4df7c8c95c5d.jpg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$g, 184, 1, 5818);
    			set_style(img2, "position", "absolute");
    			set_style(img2, "width", "25%");
    			set_style(img2, "right", "23%");
    			set_style(img2, "bottom", "1%");
    			if (img2.src !== (img2_src_value = "https://i.pinimg.com/originals/21/4e/2f/214e2fb4fb9a47147dac718f17ef4eef.jpg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$g, 186, 1, 5967);
    			set_style(img3, "position", "absolute");
    			set_style(img3, "width", "25%");
    			set_style(img3, "left", "2%");
    			set_style(img3, "bottom", "35%");
    			if (img3.src !== (img3_src_value = "https://scontent-ams4-1.xx.fbcdn.net/v/t1.0-9/87072599_2806093836139440_6201700379038580736_o.jpg?_nc_cat=103&_nc_sid=8bfeb9&_nc_ohc=BKrGBjxdU_kAX9qajCI&_nc_ht=scontent-ams4-1.xx&oh=685a5f80c9b372c0250c745daf98254f&oe=5F0B1374")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$g, 188, 1, 6122);
    			set_style(img4, "position", "absolute");
    			set_style(img4, "width", "25%");
    			set_style(img4, "left", "15%");
    			set_style(img4, "top", "5%");
    			if (img4.src !== (img4_src_value = "http://img-196.uamulet.com/uauctions/AU383/2020/1/23/U18089286371538349680210271.jpg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$g, 190, 1, 6426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, img3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, img4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(img3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(img4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$2.name,
    		type: "if",
    		source: "(178:0) {#if secondPics}",
    		ctx
    	});

    	return block;
    }

    // (194:0) {#if seventyFive}
    function create_if_block_13$2(ctx) {
    	let div0;
    	let t0;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "1975";
    			attr_dev(div0, "class", "horizontalLine left line45 svelte-1vsgcvx");
    			set_style(div0, "width", "100%");
    			add_location(div0, file$g, 194, 1, 6609);
    			attr_dev(div1, "class", "text years left line45 svelte-1vsgcvx");
    			add_location(div1, file$g, 195, 1, 6678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$2.name,
    		type: "if",
    		source: "(194:0) {#if seventyFive}",
    		ctx
    	});

    	return block;
    }

    // (200:0) {#if thirdSetup}
    function create_if_block_12$2(ctx) {
    	let div0;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let div2;
    	let t8;
    	let div3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Following the Vietnam War (and subsequent bombings of Cambodia by the U.S. army), the Khmer Rouge, a nationalist communist party, took over and in the years 1975 to 1979 committed a mass genocide killing nearly two million Cambodian people. During that period most artists disappeared, two of them ");
    			span0 = element("span");
    			span0.textContent = "រស់ សេរីសុទ្ធា";
    			t2 = text(" and ");
    			span1 = element("span");
    			span1.textContent = "ស៊ីន ស៊ីសាមុត";
    			t4 = text(".");
    			t5 = space();
    			div1 = element("div");
    			t6 = space();
    			div2 = element("div");
    			div2.textContent = "1979";
    			t8 = space();
    			div3 = element("div");
    			set_style(span0, "font-family", "arita");
    			add_location(span0, file$g, 201, 300, 7111);
    			set_style(span1, "font-family", "arita");
    			add_location(span1, file$g, 201, 370, 7181);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$g, 200, 1, 6751);
    			attr_dev(div1, "class", "horizontalLine left line41 svelte-1vsgcvx");
    			set_style(div1, "width", "100%");
    			add_location(div1, file$g, 204, 1, 7346);
    			attr_dev(div2, "class", "text years left line41 svelte-1vsgcvx");
    			add_location(div2, file$g, 205, 1, 7415);
    			attr_dev(div3, "class", "line left line41 svelte-1vsgcvx");
    			add_location(div3, file$g, 206, 1, 7463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(div0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$2.name,
    		type: "if",
    		source: "(200:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (210:0) {#if thirdPics}
    function create_if_block_11$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "position", "absolute");
    			set_style(img, "height", "40vw");
    			set_style(img, "right", "5%");
    			set_style(img, "top", "12%");
    			if (img.src !== (img_src_value = "https://i1.trekearth.com/photos/86613/victims_of_khmer_rouge.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$g, 210, 1, 7524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$2.name,
    		type: "if",
    		source: "(210:0) {#if thirdPics}",
    		ctx
    	});

    	return block;
    }

    // (214:0) {#if fourthLines}
    function create_if_block_10$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line left line41 svelte-1vsgcvx");
    			add_location(div, file$g, 214, 1, 7691);
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
    		id: create_if_block_10$3.name,
    		type: "if",
    		source: "(214:0) {#if fourthLines}",
    		ctx
    	});

    	return block;
    }

    // (221:0) {#if hotDays}
    function create_if_block_9$3(ctx) {
    	let div1;
    	let div0;
    	let span;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "365 days";
    			attr_dev(span, "class", "tempnumber left text svelte-1vsgcvx");
    			set_style(span, "z-index", "99999999");
    			add_location(span, file$g, 223, 3, 7844);
    			attr_dev(div0, "class", "temperature infotext");
    			add_location(div0, file$g, 222, 2, 7806);
    			attr_dev(div1, "class", "tempMeterCountry svelte-1vsgcvx");
    			add_location(div1, file$g, 221, 1, 7773);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$3.name,
    		type: "if",
    		source: "(221:0) {#if hotDays}",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if fourthText}
    function create_if_block_8$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Cambodia has not seen the end of suffering, as it is one of the countries of the world that will feel the most extreme heat increase in the next decades due to man-made climate change.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$g, 232, 1, 7967);
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
    		id: create_if_block_8$3.name,
    		type: "if",
    		source: "(232:0) {#if fourthText}",
    		ctx
    	});

    	return block;
    }

    // (239:0) {#if fourthSetup}
    function create_if_block_7$4(ctx) {
    	let svg;
    	let polyline;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polyline = svg_element("polyline");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "34 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2020";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polyline, "class", "cls-1 svelte-1vsgcvx");
    			attr_dev(polyline, "points", "331 900 331 1200 365 1200 365 900");
    			add_location(polyline, file$g, 240, 2, 8363);
    			attr_dev(svg, "class", "hotDays svelte-1vsgcvx");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$g, 239, 1, 8254);
    			attr_dev(div0, "class", "temperature firstMeter svelte-1vsgcvx");
    			add_location(div0, file$g, 243, 2, 8474);
    			attr_dev(span, "class", "tempnumber rightFirst text svelte-1vsgcvx");
    			add_location(span, file$g, 245, 3, 8557);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$g, 244, 2, 8519);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1vsgcvx");
    			add_location(div2, file$g, 242, 1, 8441);
    			attr_dev(div3, "class", "text years right line0 svelte-1vsgcvx");
    			add_location(div3, file$g, 249, 1, 8632);
    			attr_dev(div4, "class", "horizontalLine full right line0 svelte-1vsgcvx");
    			add_location(div4, file$g, 250, 1, 8680);
    			attr_dev(div5, "class", "text years right line20 svelte-1vsgcvx");
    			add_location(div5, file$g, 251, 1, 8733);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-1vsgcvx");
    			add_location(div6, file$g, 252, 1, 8782);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polyline);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$4.name,
    		type: "if",
    		source: "(239:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (256:0) {#if fourthSticky}
    function create_if_block_6$9(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line right line0 svelte-1vsgcvx");
    			add_location(div0, file$g, 256, 1, 8862);
    			attr_dev(div1, "class", "line right line20 svelte-1vsgcvx");
    			add_location(div1, file$g, 257, 1, 8900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$9.name,
    		type: "if",
    		source: "(256:0) {#if fourthSticky}",
    		ctx
    	});

    	return block;
    }

    // (261:0) {#if fifthSetup}
    function create_if_block_5$9(ctx) {
    	let svg;
    	let polyline;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polyline = svg_element("polyline");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "65 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2060";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "2040";
    			t8 = space();
    			div6 = element("div");
    			attr_dev(polyline, "class", "cls-1 svelte-1vsgcvx");
    			attr_dev(polyline, "points", "300 600 300 900 331 900 331 1200 365 1200 365 900 365 600");
    			add_location(polyline, file$g, 262, 2, 9072);
    			attr_dev(svg, "class", "hotDays svelte-1vsgcvx");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$g, 261, 1, 8963);
    			attr_dev(div0, "class", "temperature midMeter svelte-1vsgcvx");
    			add_location(div0, file$g, 265, 2, 9207);
    			attr_dev(span, "class", "tempnumber rightMid text svelte-1vsgcvx");
    			add_location(span, file$g, 267, 3, 9288);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$g, 266, 2, 9250);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1vsgcvx");
    			add_location(div2, file$g, 264, 1, 9174);
    			attr_dev(div3, "class", "text years right line40 svelte-1vsgcvx");
    			add_location(div3, file$g, 271, 1, 9361);
    			attr_dev(div4, "class", "horizontalLine full right line40 svelte-1vsgcvx");
    			add_location(div4, file$g, 272, 1, 9410);
    			attr_dev(div5, "class", "text years right line20 svelte-1vsgcvx");
    			add_location(div5, file$g, 273, 1, 9464);
    			attr_dev(div6, "class", "horizontalLine full right line20 svelte-1vsgcvx");
    			add_location(div6, file$g, 274, 1, 9513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polyline);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$9.name,
    		type: "if",
    		source: "(261:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (278:0) {#if fifthSticky}
    function create_if_block_4$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line right line40 svelte-1vsgcvx");
    			add_location(div, file$g, 278, 1, 9592);
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
    		id: create_if_block_4$a.name,
    		type: "if",
    		source: "(278:0) {#if fifthSticky}",
    		ctx
    	});

    	return block;
    }

    // (282:0) {#if sixthSetup}
    function create_if_block_3$a(ctx) {
    	let svg;
    	let polygon;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "181 days";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "2080";
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			div6.textContent = "2100";
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			attr_dev(polygon, "class", "cls-1 svelte-1vsgcvx");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 184 0 184 300 300 600 300 900 331 900 331 1200 365 1200");
    			add_location(polygon, file$g, 283, 2, 9764);
    			attr_dev(svg, "class", "hotDays svelte-1vsgcvx");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$g, 282, 1, 9655);
    			attr_dev(div0, "class", "temperature endMeter svelte-1vsgcvx");
    			add_location(div0, file$g, 286, 2, 9935);
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-1vsgcvx");
    			add_location(span, file$g, 288, 3, 10016);
    			attr_dev(div1, "class", "temperature infotext");
    			add_location(div1, file$g, 287, 2, 9978);
    			attr_dev(div2, "class", "tempMeterCountry svelte-1vsgcvx");
    			add_location(div2, file$g, 285, 1, 9902);
    			attr_dev(div3, "class", "text years right line60 svelte-1vsgcvx");
    			add_location(div3, file$g, 292, 1, 10090);
    			attr_dev(div4, "class", "horizontalLine full right line60 svelte-1vsgcvx");
    			add_location(div4, file$g, 293, 1, 10139);
    			attr_dev(div5, "class", "line right line60 svelte-1vsgcvx");
    			add_location(div5, file$g, 294, 1, 10193);
    			attr_dev(div6, "class", "text years right line80 svelte-1vsgcvx");
    			add_location(div6, file$g, 295, 1, 10232);
    			attr_dev(div7, "class", "horizontalLine full right line80 svelte-1vsgcvx");
    			add_location(div7, file$g, 296, 1, 10281);
    			attr_dev(div8, "class", "line right line80 svelte-1vsgcvx");
    			add_location(div8, file$g, 297, 1, 10335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$a.name,
    		type: "if",
    		source: "(282:0) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (337:0) {#if firstSetup}
    function create_if_block_2$a(ctx) {
    	let div0;
    	let t0;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "1953";
    			attr_dev(div0, "class", "horizontalLine left line67 svelte-1vsgcvx");
    			set_style(div0, "width", "100%");
    			add_location(div0, file$g, 337, 1, 11109);
    			attr_dev(div1, "class", "text years left line67 svelte-1vsgcvx");
    			add_location(div1, file$g, 338, 1, 11178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$a.name,
    		type: "if",
    		source: "(337:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (342:0) {#if CambRock}
    function create_if_block_1$a(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(342:0) {#if CambRock}",
    		ctx
    	});

    	return block;
    }

    // (345:0) {#if secondLines}
    function create_if_block$a(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line left line60 svelte-1vsgcvx");
    			add_location(div0, file$g, 345, 1, 11356);
    			attr_dev(div1, "class", "line left line45 svelte-1vsgcvx");
    			add_location(div1, file$g, 346, 1, 11394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(345:0) {#if secondLines}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
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
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let div2;
    	let div1;
    	let t23;
    	let a;
    	let t25;
    	let t26;
    	let t27;
    	let div3;
    	let t28;
    	let t29;
    	let t30;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_23$2(ctx);
    	let if_block1 = /*secondSetup*/ ctx[6] && create_if_block_22$2(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[9] && create_if_block_21$2(ctx);
    	let if_block3 = /*fourthSetup*/ ctx[13] && create_if_block_20$2(ctx);
    	let if_block4 = /*fifthSetup*/ ctx[16] && create_if_block_19$2(ctx);
    	let if_block5 = /*sixthSetup*/ ctx[17] && create_if_block_18$2(ctx);
    	let if_block6 = /*firstSetup*/ ctx[4] && create_if_block_17$2(ctx);
    	let if_block7 = /*firstPics*/ ctx[5] && create_if_block_16$2(ctx);
    	let if_block8 = /*secondSetup*/ ctx[6] && create_if_block_15$2(ctx);
    	let if_block9 = /*secondPics*/ ctx[7] && create_if_block_14$2(ctx);
    	let if_block10 = /*seventyFive*/ ctx[11] && create_if_block_13$2(ctx);
    	let if_block11 = /*thirdSetup*/ ctx[9] && create_if_block_12$2(ctx);
    	let if_block12 = /*thirdPics*/ ctx[10] && create_if_block_11$2(ctx);
    	let if_block13 = /*fourthLines*/ ctx[15] && create_if_block_10$3(ctx);
    	let if_block14 = /*hotDays*/ ctx[20] && create_if_block_9$3(ctx);
    	let if_block15 = /*fourthText*/ ctx[14] && create_if_block_8$3(ctx);
    	let if_block16 = /*fourthSetup*/ ctx[13] && create_if_block_7$4(ctx);
    	let if_block17 = /*fourthSticky*/ ctx[18] && create_if_block_6$9(ctx);
    	let if_block18 = /*fifthSetup*/ ctx[16] && create_if_block_5$9(ctx);
    	let if_block19 = /*fifthSticky*/ ctx[19] && create_if_block_4$a(ctx);
    	let if_block20 = /*sixthSetup*/ ctx[17] && create_if_block_3$a(ctx);
    	let if_block21 = /*firstSetup*/ ctx[4] && create_if_block_2$a(ctx);
    	let if_block22 = /*CambRock*/ ctx[12] && create_if_block_1$a(ctx);
    	let if_block23 = /*secondLines*/ ctx[8] && create_if_block$a(ctx);

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
    			if (if_block11) if_block11.c();
    			t13 = space();
    			if (if_block12) if_block12.c();
    			t14 = space();
    			if (if_block13) if_block13.c();
    			t15 = space();
    			if (if_block14) if_block14.c();
    			t16 = space();
    			if (if_block15) if_block15.c();
    			t17 = space();
    			if (if_block16) if_block16.c();
    			t18 = space();
    			if (if_block17) if_block17.c();
    			t19 = space();
    			if (if_block18) if_block18.c();
    			t20 = space();
    			if (if_block19) if_block19.c();
    			t21 = space();
    			if (if_block20) if_block20.c();
    			t22 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t23 = text("Sources ");
    			a = element("a");
    			a.textContent = "[1]";
    			t25 = text(", [2], [3].");
    			t26 = space();
    			if (if_block21) if_block21.c();
    			t27 = space();
    			div3 = element("div");
    			t28 = space();
    			if (if_block22) if_block22.c();
    			t29 = space();
    			if (if_block23) if_block23.c();
    			t30 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$g, 149, 0, 3138);
    			attr_dev(a, "class", "svelte-1vsgcvx");
    			add_location(a, file$g, 307, 11, 10484);
    			attr_dev(div1, "class", "bottomLineText");
    			set_style(div1, "text-align", "right");
    			add_location(div1, file$g, 306, 2, 10417);
    			attr_dev(div2, "class", "text bottomLine svelte-1vsgcvx");
    			add_location(div2, file$g, 305, 0, 10385);
    			attr_dev(div3, "class", "line left line67 svelte-1vsgcvx");
    			add_location(div3, file$g, 340, 0, 11232);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$g, 365, 1, 11825);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$g, 364, 0, 11784);
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
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block10) if_block10.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block12) if_block12.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block13) if_block13.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block14) if_block14.m(target, anchor);
    			insert_dev(target, t16, anchor);
    			if (if_block15) if_block15.m(target, anchor);
    			insert_dev(target, t17, anchor);
    			if (if_block16) if_block16.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			if (if_block17) if_block17.m(target, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block18) if_block18.m(target, anchor);
    			insert_dev(target, t20, anchor);
    			if (if_block19) if_block19.m(target, anchor);
    			insert_dev(target, t21, anchor);
    			if (if_block20) if_block20.m(target, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t23);
    			append_dev(div1, a);
    			append_dev(div1, t25);
    			insert_dev(target, t26, anchor);
    			if (if_block21) if_block21.m(target, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t28, anchor);
    			if (if_block22) if_block22.m(target, anchor);
    			insert_dev(target, t29, anchor);
    			if (if_block23) if_block23.m(target, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_23$2(ctx);
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
    					if_block1 = create_if_block_22$2(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_21$2(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fourthSetup*/ ctx[13]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_20$2(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*fifthSetup*/ ctx[16]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_19$2(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*sixthSetup*/ ctx[17]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_18$2(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t6, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_17$2(ctx);
    					if_block6.c();
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*firstPics*/ ctx[5]) {
    				if (if_block7) ; else {
    					if_block7 = create_if_block_16$2(ctx);
    					if_block7.c();
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*secondSetup*/ ctx[6]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_15$2(ctx);
    					if_block8.c();
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*secondPics*/ ctx[7]) {
    				if (if_block9) ; else {
    					if_block9 = create_if_block_14$2(ctx);
    					if_block9.c();
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*seventyFive*/ ctx[11]) {
    				if (if_block10) ; else {
    					if_block10 = create_if_block_13$2(ctx);
    					if_block10.c();
    					if_block10.m(t12.parentNode, t12);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*thirdSetup*/ ctx[9]) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_12$2(ctx);
    					if_block11.c();
    					if_block11.m(t13.parentNode, t13);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*thirdPics*/ ctx[10]) {
    				if (if_block12) ; else {
    					if_block12 = create_if_block_11$2(ctx);
    					if_block12.c();
    					if_block12.m(t14.parentNode, t14);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*fourthLines*/ ctx[15]) {
    				if (if_block13) ; else {
    					if_block13 = create_if_block_10$3(ctx);
    					if_block13.c();
    					if_block13.m(t15.parentNode, t15);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*hotDays*/ ctx[20]) {
    				if (if_block14) ; else {
    					if_block14 = create_if_block_9$3(ctx);
    					if_block14.c();
    					if_block14.m(t16.parentNode, t16);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (/*fourthText*/ ctx[14]) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);
    				} else {
    					if_block15 = create_if_block_8$3(ctx);
    					if_block15.c();
    					if_block15.m(t17.parentNode, t17);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*fourthSetup*/ ctx[13]) {
    				if (if_block16) ; else {
    					if_block16 = create_if_block_7$4(ctx);
    					if_block16.c();
    					if_block16.m(t18.parentNode, t18);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (/*fourthSticky*/ ctx[18]) {
    				if (if_block17) ; else {
    					if_block17 = create_if_block_6$9(ctx);
    					if_block17.c();
    					if_block17.m(t19.parentNode, t19);
    				}
    			} else if (if_block17) {
    				if_block17.d(1);
    				if_block17 = null;
    			}

    			if (/*fifthSetup*/ ctx[16]) {
    				if (if_block18) ; else {
    					if_block18 = create_if_block_5$9(ctx);
    					if_block18.c();
    					if_block18.m(t20.parentNode, t20);
    				}
    			} else if (if_block18) {
    				if_block18.d(1);
    				if_block18 = null;
    			}

    			if (/*fifthSticky*/ ctx[19]) {
    				if (if_block19) ; else {
    					if_block19 = create_if_block_4$a(ctx);
    					if_block19.c();
    					if_block19.m(t21.parentNode, t21);
    				}
    			} else if (if_block19) {
    				if_block19.d(1);
    				if_block19 = null;
    			}

    			if (/*sixthSetup*/ ctx[17]) {
    				if (if_block20) ; else {
    					if_block20 = create_if_block_3$a(ctx);
    					if_block20.c();
    					if_block20.m(t22.parentNode, t22);
    				}
    			} else if (if_block20) {
    				if_block20.d(1);
    				if_block20 = null;
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block21) ; else {
    					if_block21 = create_if_block_2$a(ctx);
    					if_block21.c();
    					if_block21.m(t27.parentNode, t27);
    				}
    			} else if (if_block21) {
    				if_block21.d(1);
    				if_block21 = null;
    			}

    			if (/*CambRock*/ ctx[12]) {
    				if (if_block22) ; else {
    					if_block22 = create_if_block_1$a(ctx);
    					if_block22.c();
    					if_block22.m(t29.parentNode, t29);
    				}
    			} else if (if_block22) {
    				if_block22.d(1);
    				if_block22 = null;
    			}

    			if (/*secondLines*/ ctx[8]) {
    				if (if_block23) ; else {
    					if_block23 = create_if_block$a(ctx);
    					if_block23.c();
    					if_block23.m(t30.parentNode, t30);
    				}
    			} else if (if_block23) {
    				if_block23.d(1);
    				if_block23 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block10) if_block10.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(t13);
    			if (if_block12) if_block12.d(detaching);
    			if (detaching) detach_dev(t14);
    			if (if_block13) if_block13.d(detaching);
    			if (detaching) detach_dev(t15);
    			if (if_block14) if_block14.d(detaching);
    			if (detaching) detach_dev(t16);
    			if (if_block15) if_block15.d(detaching);
    			if (detaching) detach_dev(t17);
    			if (if_block16) if_block16.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (if_block17) if_block17.d(detaching);
    			if (detaching) detach_dev(t19);
    			if (if_block18) if_block18.d(detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block19) if_block19.d(detaching);
    			if (detaching) detach_dev(t21);
    			if (if_block20) if_block20.d(detaching);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t26);
    			if (if_block21) if_block21.d(detaching);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t28);
    			if (if_block22) if_block22.d(detaching);
    			if (detaching) detach_dev(t29);
    			if (if_block23) if_block23.d(detaching);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let firstPics = true;
    	let secondSetup = false;
    	let secondPics = false;
    	let secondLines = false;
    	let thirdSetup = false;
    	let thirdPics = false;
    	let seventyFive = false;
    	let CambRock = false;
    	let fourthSetup = false;
    	let fourthText = false;
    	let fourthLines = false;
    	let fifthSetup = false;
    	let sixthSetup = false;
    	let fourthSticky = false;
    	let fifthSticky = false;
    	let hotDays = false;

    	const togglehotDays = () => {
    		$$invalidate(20, hotDays = !hotDays);
    	};

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, firstPics = true);
    		$$invalidate(6, secondSetup = false);
    		$$invalidate(7, secondPics = false);
    		$$invalidate(11, seventyFive = false);
    		$$invalidate(12, CambRock = false);
    		$$invalidate(8, secondLines = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, firstPics = false);
    		$$invalidate(6, secondSetup = true);
    		$$invalidate(7, secondPics = true);
    		$$invalidate(8, secondLines = true);
    		$$invalidate(9, thirdSetup = false);
    		$$invalidate(10, thirdPics = false);
    		$$invalidate(11, seventyFive = true);
    		$$invalidate(12, CambRock = true);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(6, secondSetup = false);
    		$$invalidate(7, secondPics = false);
    		$$invalidate(8, secondLines = true);
    		$$invalidate(9, thirdSetup = true);
    		$$invalidate(10, thirdPics = true);
    		$$invalidate(11, seventyFive = true);
    		$$invalidate(12, CambRock = false);
    		$$invalidate(13, fourthSetup = false);
    		$$invalidate(14, fourthText = false);
    		$$invalidate(15, fourthLines = false);
    		$$invalidate(20, hotDays = false);
    	};

    	const togglefourthSetup = () => {
    		$$invalidate(5, firstPics = false);
    		$$invalidate(7, secondPics = false);
    		$$invalidate(9, thirdSetup = false);
    		$$invalidate(10, thirdPics = false);
    		$$invalidate(11, seventyFive = false);
    		$$invalidate(8, secondLines = true);
    		$$invalidate(13, fourthSetup = true);
    		$$invalidate(14, fourthText = true);
    		$$invalidate(15, fourthLines = true);
    		$$invalidate(20, hotDays = true);
    		$$invalidate(16, fifthSetup = false);
    		$$invalidate(18, fourthSticky = true);
    		$$invalidate(19, fifthSticky = false);
    	};

    	const togglefifthSetup = () => {
    		$$invalidate(5, firstPics = true);
    		$$invalidate(7, secondPics = true);
    		$$invalidate(10, thirdPics = true);
    		$$invalidate(8, secondLines = true);
    		$$invalidate(13, fourthSetup = false);
    		$$invalidate(14, fourthText = true);
    		$$invalidate(15, fourthLines = true);
    		$$invalidate(20, hotDays = true);
    		$$invalidate(16, fifthSetup = true);
    		$$invalidate(17, sixthSetup = false);
    		$$invalidate(18, fourthSticky = true);
    		$$invalidate(19, fifthSticky = true);
    	};

    	const togglesixthSetup = () => {
    		$$invalidate(5, firstPics = true);
    		$$invalidate(7, secondPics = true);
    		$$invalidate(10, thirdPics = true);
    		$$invalidate(8, secondLines = true);
    		$$invalidate(14, fourthText = true);
    		$$invalidate(15, fourthLines = true);
    		$$invalidate(20, hotDays = true);
    		$$invalidate(16, fifthSetup = false);
    		$$invalidate(17, sixthSetup = true);
    		$$invalidate(18, fourthSticky = true);
    		$$invalidate(19, fifthSticky = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cambodia> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cambodia", $$slots, []);

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
    		firstPics,
    		secondSetup,
    		secondPics,
    		secondLines,
    		thirdSetup,
    		thirdPics,
    		seventyFive,
    		CambRock,
    		fourthSetup,
    		fourthText,
    		fourthLines,
    		fifthSetup,
    		sixthSetup,
    		fourthSticky,
    		fifthSticky,
    		hotDays,
    		togglehotDays,
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
    		if ("distanceBLines" in $$props) distanceBLines = $$props.distanceBLines;
    		if ("marginSides" in $$props) marginSides = $$props.marginSides;
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("firstPics" in $$props) $$invalidate(5, firstPics = $$props.firstPics);
    		if ("secondSetup" in $$props) $$invalidate(6, secondSetup = $$props.secondSetup);
    		if ("secondPics" in $$props) $$invalidate(7, secondPics = $$props.secondPics);
    		if ("secondLines" in $$props) $$invalidate(8, secondLines = $$props.secondLines);
    		if ("thirdSetup" in $$props) $$invalidate(9, thirdSetup = $$props.thirdSetup);
    		if ("thirdPics" in $$props) $$invalidate(10, thirdPics = $$props.thirdPics);
    		if ("seventyFive" in $$props) $$invalidate(11, seventyFive = $$props.seventyFive);
    		if ("CambRock" in $$props) $$invalidate(12, CambRock = $$props.CambRock);
    		if ("fourthSetup" in $$props) $$invalidate(13, fourthSetup = $$props.fourthSetup);
    		if ("fourthText" in $$props) $$invalidate(14, fourthText = $$props.fourthText);
    		if ("fourthLines" in $$props) $$invalidate(15, fourthLines = $$props.fourthLines);
    		if ("fifthSetup" in $$props) $$invalidate(16, fifthSetup = $$props.fifthSetup);
    		if ("sixthSetup" in $$props) $$invalidate(17, sixthSetup = $$props.sixthSetup);
    		if ("fourthSticky" in $$props) $$invalidate(18, fourthSticky = $$props.fourthSticky);
    		if ("fifthSticky" in $$props) $$invalidate(19, fifthSticky = $$props.fifthSticky);
    		if ("hotDays" in $$props) $$invalidate(20, hotDays = $$props.hotDays);
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
    		firstPics,
    		secondSetup,
    		secondPics,
    		secondLines,
    		thirdSetup,
    		thirdPics,
    		seventyFive,
    		CambRock,
    		fourthSetup,
    		fourthText,
    		fourthLines,
    		fifthSetup,
    		sixthSetup,
    		fourthSticky,
    		fifthSticky,
    		hotDays,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup,
    		togglesixthSetup
    	];
    }

    class Cambodia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cambodia",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<Cambodia> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<Cambodia> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<Cambodia> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<Cambodia> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<Cambodia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<Cambodia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<Cambodia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Cambodia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/SouthKorea.svelte generated by Svelte v3.23.0 */

    const file$h = "src/specifics/SouthKorea.svelte";

    // (118:0) {#if firstSetup}
    function create_if_block_23$3(ctx) {
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
    			add_location(div, file$h, 118, 1, 2243);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$h, 119, 1, 2304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[17], false, false, false);
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
    		id: create_if_block_23$3.name,
    		type: "if",
    		source: "(118:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (122:0) {#if secondSetup}
    function create_if_block_22$3(ctx) {
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
    			add_location(div0, file$h, 122, 1, 2370);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$h, 123, 1, 2430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[18], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[16], false, false, false)
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
    		id: create_if_block_22$3.name,
    		type: "if",
    		source: "(122:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (126:0) {#if thirdSetup}
    function create_if_block_21$3(ctx) {
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
    			add_location(div0, file$h, 126, 1, 2513);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$h, 127, 1, 2574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefourthSetup*/ ctx[19], false, false, false),
    					listen_dev(div1, "click", /*togglesecondSetup*/ ctx[17], false, false, false)
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
    		id: create_if_block_21$3.name,
    		type: "if",
    		source: "(126:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (130:0) {#if fourthSetup}
    function create_if_block_20$3(ctx) {
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
    			add_location(div0, file$h, 130, 1, 2659);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$h, 131, 1, 2719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefifthSetup*/ ctx[20], false, false, false),
    					listen_dev(div1, "click", /*togglethirdSetup*/ ctx[18], false, false, false)
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
    		id: create_if_block_20$3.name,
    		type: "if",
    		source: "(130:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (134:0) {#if fifthSetup}
    function create_if_block_19$3(ctx) {
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
    			add_location(div0, file$h, 134, 1, 2802);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$h, 135, 1, 2862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglesixthSetup*/ ctx[21], false, false, false),
    					listen_dev(div1, "click", /*togglefourthSetup*/ ctx[19], false, false, false)
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
    		id: create_if_block_19$3.name,
    		type: "if",
    		source: "(134:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (138:0) {#if sixthSetup}
    function create_if_block_18$3(ctx) {
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
    			add_location(a, file$h, 138, 1, 2946);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$h, 139, 1, 2988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglefifthSetup*/ ctx[20], false, false, false);
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
    		id: create_if_block_18$3.name,
    		type: "if",
    		source: "(138:0) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (151:0) {#if firstSetup}
    function create_if_block_17$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("Heat is nothing new, and people have created multiple remedies to endure it.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$h, 151, 1, 3161);
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
    		id: create_if_block_17$3.name,
    		type: "if",
    		source: "(151:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (156:0) {#if secondSetup}
    function create_if_block_16$3(ctx) {
    	let div;
    	let t0;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("A Bamboo Wife is a cylinder woven out of bamboo that can be cuddled in warm weather in order to better allow air to access the surface of your body. This object is known through-outh South-East Asia and in South-Korea is named ");
    			span = element("span");
    			span.textContent = "죽부인";
    			t2 = text(" (Jukbuin).");
    			set_style(span, "font-family", "arita_semibold");
    			add_location(span, file$h, 157, 230, 3629);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$h, 156, 1, 3339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(div, t2);
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
    		id: create_if_block_16$3.name,
    		type: "if",
    		source: "(156:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (161:0) {#if secondPhoto}
    function create_if_block_15$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "eraPhoto svelte-enfgs6");
    			add_location(div, file$h, 160, 17, 3725);
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
    		id: create_if_block_15$3.name,
    		type: "if",
    		source: "(161:0) {#if secondPhoto}",
    		ctx
    	});

    	return block;
    }

    // (162:0) {#if thirdSetup}
    function create_if_block_14$3(ctx) {
    	let div;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Another heat related tradition is connected to the phrase ");
    			span0 = element("span");
    			span0.textContent = "이열치열";
    			t2 = text(" (Iyeolchiyeol), which translates to \"fight fire with fire\" meaning to control body heat with heat. This is done by eating a warm chicken soup called ");
    			span1 = element("span");
    			span1.textContent = "호수 삼계탕";
    			t4 = text(" (Samgyetang) or visiting a hot sauna.");
    			set_style(span0, "font-family", "arita_semibold");
    			add_location(span0, file$h, 163, 61, 3898);
    			set_style(span1, "font-family", "arita_semibold");
    			add_location(span1, file$h, 163, 265, 4102);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$h, 162, 1, 3777);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span0);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(div, t4);
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
    		id: create_if_block_14$3.name,
    		type: "if",
    		source: "(162:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (167:0) {#if thirdPhoto}
    function create_if_block_13$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "eraPhoto eraPhoto2 svelte-enfgs6");
    			add_location(div, file$h, 166, 16, 4232);
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
    		id: create_if_block_13$3.name,
    		type: "if",
    		source: "(167:0) {#if thirdPhoto}",
    		ctx
    	});

    	return block;
    }

    // (168:0) {#if fourthSetup}
    function create_if_block_12$3(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("South Korea is conveniently located when it comes to future extreme heat increase. Following \"business as usual\", extremely hot days will not increase at all in South Korea for the next 20 years...");
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "2020";
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$h, 168, 1, 4295);
    			attr_dev(div1, "class", "text years right line0 svelte-enfgs6");
    			add_location(div1, file$h, 171, 1, 4570);
    			attr_dev(div2, "class", "line right line0 svelte-enfgs6");
    			add_location(div2, file$h, 172, 1, 4618);
    			attr_dev(div3, "class", "horizontalLine full right line0 svelte-enfgs6");
    			add_location(div3, file$h, 173, 1, 4656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$3.name,
    		type: "if",
    		source: "(168:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (176:0) {#if twentyfourty}
    function create_if_block_11$3(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "2040";
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "text years right line20 svelte-enfgs6");
    			add_location(div0, file$h, 176, 1, 4734);
    			attr_dev(div1, "class", "line right line20 svelte-enfgs6");
    			add_location(div1, file$h, 177, 1, 4783);
    			attr_dev(div2, "class", "horizontalLine full right line20 svelte-enfgs6");
    			add_location(div2, file$h, 178, 1, 4822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$3.name,
    		type: "if",
    		source: "(176:0) {#if twentyfourty}",
    		ctx
    	});

    	return block;
    }

    // (181:0) {#if fifthSetup}
    function create_if_block_10$4(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("... hot days will increase by only two per year in the 20 years after that...");
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "2060";
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$h, 181, 1, 4899);
    			attr_dev(div1, "class", "text years right line40 svelte-enfgs6");
    			add_location(div1, file$h, 184, 1, 5054);
    			attr_dev(div2, "class", "line right line40 svelte-enfgs6");
    			add_location(div2, file$h, 185, 1, 5103);
    			attr_dev(div3, "class", "horizontalLine full right line40 svelte-enfgs6");
    			add_location(div3, file$h, 186, 1, 5142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$4.name,
    		type: "if",
    		source: "(181:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (189:0) {#if sixthSetup}
    function create_if_block_9$4(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div5;
    	let t8;
    	let div6;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("... and 19 days per year in the end of the century.");
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "2080";
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "2100";
    			t7 = space();
    			div5 = element("div");
    			t8 = space();
    			div6 = element("div");
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$h, 189, 1, 5219);
    			attr_dev(div1, "class", "text years right line60 svelte-enfgs6");
    			add_location(div1, file$h, 192, 1, 5348);
    			attr_dev(div2, "class", "line right line60 svelte-enfgs6");
    			add_location(div2, file$h, 193, 1, 5397);
    			attr_dev(div3, "class", "horizontalLine full right line60 svelte-enfgs6");
    			add_location(div3, file$h, 194, 1, 5436);
    			attr_dev(div4, "class", "text years right line80 svelte-enfgs6");
    			add_location(div4, file$h, 195, 1, 5490);
    			attr_dev(div5, "class", "line right line80 svelte-enfgs6");
    			add_location(div5, file$h, 196, 1, 5539);
    			attr_dev(div6, "class", "horizontalLine full right line80 svelte-enfgs6");
    			add_location(div6, file$h, 197, 1, 5578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$4.name,
    		type: "if",
    		source: "(189:0) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (203:0) {#if tempMeter}
    function create_if_block_3$b(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let t4;
    	let span;
    	let t5;
    	let span_style_value;
    	let if_block0 = /*fifthSetup*/ ctx[11] && create_if_block_8$4(ctx);
    	let if_block1 = /*sixthSetup*/ ctx[13] && create_if_block_7$5(ctx);
    	let if_block2 = /*fourthSetup*/ ctx[9] && create_if_block_6$a(ctx);
    	let if_block3 = /*fifthSetup*/ ctx[11] && create_if_block_5$a(ctx);
    	let if_block4 = /*sixthSetup*/ ctx[13] && create_if_block_4$b(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			span = element("span");
    			t5 = text("365 days");
    			attr_dev(span, "class", "tempnumber left text svelte-enfgs6");
    			attr_dev(span, "style", span_style_value = "/*left: " + /*marginSides*/ ctx[15] + ";*/");
    			add_location(span, file$h, 220, 3, 6222);
    			attr_dev(div0, "class", "temperature infotext svelte-enfgs6");
    			add_location(div0, file$h, 210, 2, 5825);
    			attr_dev(div1, "class", "tempMeter svelte-enfgs6");
    			add_location(div1, file$h, 203, 1, 5657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t2);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div0, t4);
    			append_dev(div0, span);
    			append_dev(span, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (/*fifthSetup*/ ctx[11]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_8$4(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*sixthSetup*/ ctx[13]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_7$5(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*fourthSetup*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6$a(ctx);
    					if_block2.c();
    					if_block2.m(div0, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fifthSetup*/ ctx[11]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_5$a(ctx);
    					if_block3.c();
    					if_block3.m(div0, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*sixthSetup*/ ctx[13]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_4$b(ctx);
    					if_block4.c();
    					if_block4.m(div0, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$b.name,
    		type: "if",
    		source: "(203:0) {#if tempMeter}",
    		ctx
    	});

    	return block;
    }

    // (205:2) {#if fifthSetup}
    function create_if_block_8$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "temperature midMeter svelte-enfgs6");
    			add_location(div, file$h, 205, 3, 5703);
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
    		id: create_if_block_8$4.name,
    		type: "if",
    		source: "(205:2) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (208:2) {#if sixthSetup}
    function create_if_block_7$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "temperature endMeter svelte-enfgs6");
    			add_location(div, file$h, 208, 3, 5774);
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
    		id: create_if_block_7$5.name,
    		type: "if",
    		source: "(208:2) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (212:3) {#if fourthSetup}
    function create_if_block_6$a(ctx) {
    	let span;
    	let t;
    	let span_style_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("0 days");
    			attr_dev(span, "class", "tempnumber right text svelte-enfgs6");
    			attr_dev(span, "style", span_style_value = "/*right: " + /*marginSides*/ ctx[15] + ";*/");
    			add_location(span, file$h, 212, 4, 5885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$a.name,
    		type: "if",
    		source: "(212:3) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (215:3) {#if fifthSetup}
    function create_if_block_5$a(ctx) {
    	let span;
    	let t;
    	let span_style_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("2 days");
    			attr_dev(span, "class", "tempnumber rightMid text svelte-enfgs6");
    			attr_dev(span, "style", span_style_value = "/*right: " + /*marginSides*/ ctx[15] + ";*/");
    			add_location(span, file$h, 215, 4, 6002);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$a.name,
    		type: "if",
    		source: "(215:3) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (218:3) {#if sixthSetup}
    function create_if_block_4$b(ctx) {
    	let span;
    	let t;
    	let span_style_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("19 days");
    			attr_dev(span, "class", "tempnumber rightEnd text svelte-enfgs6");
    			attr_dev(span, "style", span_style_value = "/*right: " + /*marginSides*/ ctx[15] + ";*/");
    			add_location(span, file$h, 218, 4, 6122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$b.name,
    		type: "if",
    		source: "(218:3) {#if sixthSetup}",
    		ctx
    	});

    	return block;
    }

    // (229:0) {#if hotDays}
    function create_if_block_1$b(ctx) {
    	let svg;

    	function select_block_type(ctx, dirty) {
    		if (/*fifthSetup*/ ctx[11]) return create_if_block_2$b;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if_block.c();
    			attr_dev(svg, "class", "hotDays svelte-enfgs6");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 365 1200");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$h, 229, 1, 6348);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if_block.m(svg, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(svg, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(229:0) {#if hotDays}",
    		ctx
    	});

    	return block;
    }

    // (233:2) {:else}
    function create_else_block_1$1(ctx) {
    	let polygon;

    	const block = {
    		c: function create() {
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "class", "cls-1 svelte-enfgs6");
    			attr_dev(polygon, "points", "365 1200 365 900 365 600 365 300 365 0 346 0 346 300 363 600 363 900 365 900 365 1200 365 1200");
    			add_location(polygon, file$h, 233, 3, 6583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, polygon, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(polygon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(233:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (231:2) {#if fifthSetup}
    function create_if_block_2$b(ctx) {
    	let polyline;

    	const block = {
    		c: function create() {
    			polyline = svg_element("polyline");
    			attr_dev(polyline, "class", "cls-1 svelte-enfgs6");
    			attr_dev(polyline, "points", "363 600 363 900 365 900 365 1200 365 1200 365 900 365 600");
    			add_location(polyline, file$h, 231, 3, 6477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, polyline, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(polyline);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$b.name,
    		type: "if",
    		source: "(231:2) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (252:19) {:else}
    function create_else_block$1(ctx) {
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("Source ");
    			a = element("a");
    			a.textContent = "[1]";
    			t2 = text(".");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "");
    			attr_dev(a, "class", "svelte-enfgs6");
    			add_location(a, file$h, 251, 33, 6988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(252:19) {:else}",
    		ctx
    	});

    	return block;
    }

    // (252:3) {#if firstSetup}
    function create_if_block$b(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(252:3) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
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
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let div2;
    	let div1;
    	let t19;
    	let div4;
    	let div3;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_23$3(ctx);
    	let if_block1 = /*secondSetup*/ ctx[5] && create_if_block_22$3(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[7] && create_if_block_21$3(ctx);
    	let if_block3 = /*fourthSetup*/ ctx[9] && create_if_block_20$3(ctx);
    	let if_block4 = /*fifthSetup*/ ctx[11] && create_if_block_19$3(ctx);
    	let if_block5 = /*sixthSetup*/ ctx[13] && create_if_block_18$3(ctx);
    	let if_block6 = /*firstSetup*/ ctx[4] && create_if_block_17$3(ctx);
    	let if_block7 = /*secondSetup*/ ctx[5] && create_if_block_16$3(ctx);
    	let if_block8 = /*secondPhoto*/ ctx[6] && create_if_block_15$3(ctx);
    	let if_block9 = /*thirdSetup*/ ctx[7] && create_if_block_14$3(ctx);
    	let if_block10 = /*thirdPhoto*/ ctx[8] && create_if_block_13$3(ctx);
    	let if_block11 = /*fourthSetup*/ ctx[9] && create_if_block_12$3(ctx);
    	let if_block12 = /*twentyfourty*/ ctx[14] && create_if_block_11$3(ctx);
    	let if_block13 = /*fifthSetup*/ ctx[11] && create_if_block_10$4(ctx);
    	let if_block14 = /*sixthSetup*/ ctx[13] && create_if_block_9$4(ctx);
    	let if_block15 = /*tempMeter*/ ctx[10] && create_if_block_3$b(ctx);
    	let if_block16 = /*hotDays*/ ctx[12] && create_if_block_1$b(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*firstSetup*/ ctx[4]) return create_if_block$b;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block17 = current_block_type(ctx);

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
    			if (if_block11) if_block11.c();
    			t13 = space();
    			if (if_block12) if_block12.c();
    			t14 = space();
    			if (if_block13) if_block13.c();
    			t15 = space();
    			if (if_block14) if_block14.c();
    			t16 = space();
    			if (if_block15) if_block15.c();
    			t17 = space();
    			if (if_block16) if_block16.c();
    			t18 = space();
    			div2 = element("div");
    			div1 = element("div");
    			if_block17.c();
    			t19 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$h, 148, 0, 3060);
    			attr_dev(div1, "class", "bottomLineText text svelte-enfgs6");
    			set_style(div1, "text-align", "right");
    			add_location(div1, file$h, 250, 2, 6894);
    			attr_dev(div2, "class", "text bottomLine svelte-enfgs6");
    			add_location(div2, file$h, 249, 0, 6862);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$h, 257, 1, 7088);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$h, 256, 0, 7047);
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
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block10) if_block10.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block12) if_block12.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block13) if_block13.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block14) if_block14.m(target, anchor);
    			insert_dev(target, t16, anchor);
    			if (if_block15) if_block15.m(target, anchor);
    			insert_dev(target, t17, anchor);
    			if (if_block16) if_block16.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			if_block17.m(div1, null);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_23$3(ctx);
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
    					if_block1 = create_if_block_22$3(ctx);
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
    					if_block2 = create_if_block_21$3(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fourthSetup*/ ctx[9]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_20$3(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*fifthSetup*/ ctx[11]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_19$3(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*sixthSetup*/ ctx[13]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_18$3(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t6, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_17$3(ctx);
    					if_block6.c();
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_16$3(ctx);
    					if_block7.c();
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*secondPhoto*/ ctx[6]) {
    				if (if_block8) ; else {
    					if_block8 = create_if_block_15$3(ctx);
    					if_block8.c();
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*thirdSetup*/ ctx[7]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_14$3(ctx);
    					if_block9.c();
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*thirdPhoto*/ ctx[8]) {
    				if (if_block10) ; else {
    					if_block10 = create_if_block_13$3(ctx);
    					if_block10.c();
    					if_block10.m(t12.parentNode, t12);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*fourthSetup*/ ctx[9]) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_12$3(ctx);
    					if_block11.c();
    					if_block11.m(t13.parentNode, t13);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*twentyfourty*/ ctx[14]) {
    				if (if_block12) ; else {
    					if_block12 = create_if_block_11$3(ctx);
    					if_block12.c();
    					if_block12.m(t14.parentNode, t14);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*fifthSetup*/ ctx[11]) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);
    				} else {
    					if_block13 = create_if_block_10$4(ctx);
    					if_block13.c();
    					if_block13.m(t15.parentNode, t15);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*sixthSetup*/ ctx[13]) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);
    				} else {
    					if_block14 = create_if_block_9$4(ctx);
    					if_block14.c();
    					if_block14.m(t16.parentNode, t16);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (/*tempMeter*/ ctx[10]) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);
    				} else {
    					if_block15 = create_if_block_3$b(ctx);
    					if_block15.c();
    					if_block15.m(t17.parentNode, t17);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*hotDays*/ ctx[12]) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);
    				} else {
    					if_block16 = create_if_block_1$b(ctx);
    					if_block16.c();
    					if_block16.m(t18.parentNode, t18);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block17.d(1);
    				if_block17 = current_block_type(ctx);

    				if (if_block17) {
    					if_block17.c();
    					if_block17.m(div1, null);
    				}
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
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block10) if_block10.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(t13);
    			if (if_block12) if_block12.d(detaching);
    			if (detaching) detach_dev(t14);
    			if (if_block13) if_block13.d(detaching);
    			if (detaching) detach_dev(t15);
    			if (if_block14) if_block14.d(detaching);
    			if (detaching) detach_dev(t16);
    			if (if_block15) if_block15.d(detaching);
    			if (detaching) detach_dev(t17);
    			if (if_block16) if_block16.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div2);
    			if_block17.d();
    			if (detaching) detach_dev(t19);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";

    	//import TimelinesEmpty from './TimelineEmpty.svelte';
    	let firstSetup = true;

    	let secondSetup = false;
    	let secondPhoto = false;
    	let thirdSetup = false;
    	let thirdPhoto = false;
    	let fourthSetup = false;
    	let tempMeter = false;
    	let fifthSetup = false;
    	let hotDays = false;
    	let sixthSetup = false;
    	let twentyfourty = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondPhoto = false);
    		$$invalidate(7, thirdSetup = false);
    		$$invalidate(8, thirdPhoto = false);
    		$$invalidate(9, fourthSetup = false);
    		$$invalidate(10, tempMeter = false);
    		$$invalidate(11, fifthSetup = false);
    		$$invalidate(12, hotDays = false);
    		$$invalidate(13, sixthSetup = false);
    		$$invalidate(14, twentyfourty = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
    		$$invalidate(6, secondPhoto = true);
    		$$invalidate(7, thirdSetup = false);
    		$$invalidate(8, thirdPhoto = false);
    		$$invalidate(9, fourthSetup = false);
    		$$invalidate(10, tempMeter = false);
    		$$invalidate(11, fifthSetup = false);
    		$$invalidate(12, hotDays = false);
    		$$invalidate(13, sixthSetup = false);
    		$$invalidate(14, twentyfourty = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondPhoto = true);
    		$$invalidate(7, thirdSetup = true);
    		$$invalidate(8, thirdPhoto = true);
    		$$invalidate(9, fourthSetup = false);
    		$$invalidate(10, tempMeter = false);
    		$$invalidate(11, fifthSetup = false);
    		$$invalidate(12, hotDays = false);
    		$$invalidate(13, sixthSetup = false);
    		$$invalidate(14, twentyfourty = false);
    	};

    	const togglefourthSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondPhoto = true);
    		$$invalidate(7, thirdSetup = false);
    		$$invalidate(8, thirdPhoto = true);
    		$$invalidate(9, fourthSetup = true);
    		$$invalidate(10, tempMeter = true);
    		$$invalidate(11, fifthSetup = false);
    		$$invalidate(12, hotDays = false);
    		$$invalidate(13, sixthSetup = false);
    		$$invalidate(14, twentyfourty = true);
    	};

    	const togglefifthSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondPhoto = true);
    		$$invalidate(7, thirdSetup = false);
    		$$invalidate(8, thirdPhoto = true);
    		$$invalidate(9, fourthSetup = false);
    		$$invalidate(10, tempMeter = true);
    		$$invalidate(11, fifthSetup = true);
    		$$invalidate(12, hotDays = true);
    		$$invalidate(13, sixthSetup = false);
    		$$invalidate(14, twentyfourty = true);
    	};

    	const togglesixthSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, secondPhoto = true);
    		$$invalidate(7, thirdSetup = false);
    		$$invalidate(8, thirdPhoto = true);
    		$$invalidate(9, fourthSetup = false);
    		$$invalidate(10, tempMeter = true);
    		$$invalidate(11, fifthSetup = false);
    		$$invalidate(12, hotDays = true);
    		$$invalidate(13, sixthSetup = true);
    		$$invalidate(14, twentyfourty = false);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SouthKorea> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SouthKorea", $$slots, []);

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
    		secondSetup,
    		secondPhoto,
    		thirdSetup,
    		thirdPhoto,
    		fourthSetup,
    		tempMeter,
    		fifthSetup,
    		hotDays,
    		sixthSetup,
    		twentyfourty,
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
    		if ("distanceBLines" in $$props) distanceBLines = $$props.distanceBLines;
    		if ("marginSides" in $$props) $$invalidate(15, marginSides = $$props.marginSides);
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(5, secondSetup = $$props.secondSetup);
    		if ("secondPhoto" in $$props) $$invalidate(6, secondPhoto = $$props.secondPhoto);
    		if ("thirdSetup" in $$props) $$invalidate(7, thirdSetup = $$props.thirdSetup);
    		if ("thirdPhoto" in $$props) $$invalidate(8, thirdPhoto = $$props.thirdPhoto);
    		if ("fourthSetup" in $$props) $$invalidate(9, fourthSetup = $$props.fourthSetup);
    		if ("tempMeter" in $$props) $$invalidate(10, tempMeter = $$props.tempMeter);
    		if ("fifthSetup" in $$props) $$invalidate(11, fifthSetup = $$props.fifthSetup);
    		if ("hotDays" in $$props) $$invalidate(12, hotDays = $$props.hotDays);
    		if ("sixthSetup" in $$props) $$invalidate(13, sixthSetup = $$props.sixthSetup);
    		if ("twentyfourty" in $$props) $$invalidate(14, twentyfourty = $$props.twentyfourty);
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
    		secondPhoto,
    		thirdSetup,
    		thirdPhoto,
    		fourthSetup,
    		tempMeter,
    		fifthSetup,
    		hotDays,
    		sixthSetup,
    		twentyfourty,
    		marginSides,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup,
    		togglesixthSetup
    	];
    }

    class SouthKorea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SouthKorea",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<SouthKorea> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<SouthKorea> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<SouthKorea> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<SouthKorea> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<SouthKorea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<SouthKorea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<SouthKorea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<SouthKorea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/EnvironmentalJustice.svelte generated by Svelte v3.23.0 */

    const file$i = "src/specifics/EnvironmentalJustice.svelte";

    function create_fragment$j(ctx) {
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
    			add_location(div0, file$i, 11, 2, 152);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$i, 9, 0, 71);
    			attr_dev(div2, "class", "activedot activedot13");
    			add_location(div2, file$i, 14, 0, 185);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div3, file$i, 16, 1, 268);
    			attr_dev(div4, "class", "activedotnew activedotFan");
    			add_location(div4, file$i, 15, 0, 227);
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { pagetitleText: 0, rotate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EnvironmentalJustice",
    			options,
    			id: create_fragment$j.name
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

    const file$j = "src/specifics/ImpactofIndividualAction.svelte";

    // (49:0) {#if firstSetup}
    function create_if_block_9$5(ctx) {
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
    			add_location(div, file$j, 49, 1, 846);
    			attr_dev(a, "class", "buttonPrev");
    			attr_dev(a, "href", /*next*/ ctx[2]);
    			add_location(a, file$j, 50, 1, 907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglesecondSetup*/ ctx[12], false, false, false);
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
    		id: create_if_block_9$5.name,
    		type: "if",
    		source: "(49:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (53:0) {#if secondSetup}
    function create_if_block_8$5(ctx) {
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
    			add_location(div0, file$j, 53, 1, 973);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$j, 54, 1, 1033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglethirdSetup*/ ctx[13], false, false, false),
    					listen_dev(div1, "click", /*togglefirstSetup*/ ctx[11], false, false, false)
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
    		id: create_if_block_8$5.name,
    		type: "if",
    		source: "(53:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (57:0) {#if thirdSetup}
    function create_if_block_7$6(ctx) {
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
    			add_location(div0, file$j, 57, 1, 1116);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$j, 58, 1, 1177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefourthSetup*/ ctx[14], false, false, false),
    					listen_dev(div1, "click", /*togglesecondSetup*/ ctx[12], false, false, false)
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
    		id: create_if_block_7$6.name,
    		type: "if",
    		source: "(57:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#if fourthSetup}
    function create_if_block_6$b(ctx) {
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
    			add_location(div0, file$j, 61, 1, 1262);
    			attr_dev(div1, "class", "buttonPrev");
    			add_location(div1, file$j, 62, 1, 1322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*togglefifthSetup*/ ctx[15], false, false, false),
    					listen_dev(div1, "click", /*togglethirdSetup*/ ctx[13], false, false, false)
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
    		id: create_if_block_6$b.name,
    		type: "if",
    		source: "(61:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (65:0) {#if fifthSetup}
    function create_if_block_5$b(ctx) {
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
    			add_location(a, file$j, 65, 1, 1405);
    			attr_dev(div, "class", "buttonPrev");
    			add_location(div, file$j, 66, 1, 1447);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*togglefourthSetup*/ ctx[14], false, false, false);
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
    		id: create_if_block_5$b.name,
    		type: "if",
    		source: "(65:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    // (78:0) {#if firstSetup}
    function create_if_block_4$c(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("The argument that climate action in the West is not impactfull on it's own is simply wrong. Speaking of individual action specifically, the impact of climate action in India is ranked as Medium, while the impact of individual action in most north-western countries are ranked as High or Highest.");
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$j, 78, 1, 1640);
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
    		id: create_if_block_4$c.name,
    		type: "if",
    		source: "(78:0) {#if firstSetup}",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#if secondSetup}
    function create_if_block_3$c(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;
    	let span;
    	let t2;
    	let i0;
    	let t4;
    	let i1;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Countries that are ranked as having Medium impact on an individual level are:");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			t2 = text("Albania, Angola, Argentina, Armenia, Azerbaijan, Bhutan, Bolivia, Botswana, ");
    			i0 = element("i");
    			i0.textContent = "Brazil";
    			t4 = text(", Chile, Columbia, Costa Rica, Croatia, Cuba, Dominican Republic, Ecuador, Egypt, El Salvador, Fiji, Gabon, Georgia, Guatemala, Guyana, Honduras, ");
    			i1 = element("i");
    			i1.textContent = "India";
    			t6 = text(", Indonesia, Jamaica, Jordan, Kyrgyz Republic, Lebanon, Lesotho, Mexico, Montenegro, North Korea, Namibia, North Macedonia, Pakistan, Panama, Peru, Philippines, Suriname, Sweden, Switzerland, Syria, Tailand, Tunisia, Uruguay, Uzbekistan, Venezuela, Vietnam.");
    			add_location(br, file$j, 85, 79, 2177);
    			add_location(i0, file$j, 86, 97, 2279);
    			add_location(i1, file$j, 86, 266, 2448);
    			attr_dev(span, "class", "text svelte-wjk3lr");
    			add_location(span, file$j, 86, 2, 2184);
    			attr_dev(div, "class", "pagetext");
    			set_style(div, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div, file$j, 84, 1, 2038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    			append_dev(span, i0);
    			append_dev(span, t4);
    			append_dev(span, i1);
    			append_dev(span, t6);
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
    		id: create_if_block_3$c.name,
    		type: "if",
    		source: "(84:0) {#if secondSetup}",
    		ctx
    	});

    	return block;
    }

    // (91:0) {#if thirdSetup}
    function create_if_block_2$c(ctx) {
    	let div0;
    	let t0;
    	let br;
    	let t1;
    	let span;
    	let t2;
    	let i0;
    	let t4;
    	let i1;
    	let t6;
    	let t7;
    	let div1;
    	let t8;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Countries that are ranked as having Low impact on an individual level are:");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			t2 = text("Afghanistan, Bangladesh, Benin, Burkina Faso, Burundi, ");
    			i0 = element("i");
    			i0.textContent = "Cambodia";
    			t4 = text(", Cameroon, Central African Republic, Chad, Congo, Cote d-Ivoire, Democratic Republic of Congo, Eritrea, Ethiopia, ");
    			i1 = element("i");
    			i1.textContent = "Ghana";
    			t6 = text(", Guinea, Haiti, Kenya, Lao, Liberia, Madagascar, Malawi, Mali, Mauritania, Mozambique, Myanmar, Nepal, Nicaragua, Niger, Nigeria, Papua New Guinea, Paraguay, Rwanda, Senegal, Sierra Leone, Solomon Islands, Somalia, South Sudan, Tajiksistan, Tanzania, Timor-Leste, Togo, Uganda, Vanuata, Yemen, Zambia, Zimbabwe.");
    			t7 = space();
    			div1 = element("div");
    			t8 = text("All climate action counts, but not equally.");
    			add_location(br, file$j, 92, 76, 2910);
    			add_location(i0, file$j, 93, 76, 2991);
    			add_location(i1, file$j, 93, 211, 3126);
    			attr_dev(span, "class", "text svelte-wjk3lr");
    			add_location(span, file$j, 93, 2, 2917);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$j, 91, 1, 2774);
    			attr_dev(div1, "class", "text criticalText svelte-wjk3lr");
    			set_style(div1, "left", /*marginSides*/ ctx[10]);
    			set_style(div1, "right", /*marginSides*/ ctx[10]);
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[9] + " * 0)");
    			add_location(div1, file$j, 96, 1, 3484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, br);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(span, i0);
    			append_dev(span, t4);
    			append_dev(span, i1);
    			append_dev(span, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$c.name,
    		type: "if",
    		source: "(91:0) {#if thirdSetup}",
    		ctx
    	});

    	return block;
    }

    // (100:0) {#if fourthSetup}
    function create_if_block_1$c(ctx) {
    	let div0;
    	let t0;
    	let br0;
    	let t1;
    	let span;
    	let t3;
    	let div1;
    	let t4;
    	let br1;
    	let t5;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Countries that are ranked as having High impact on an individual level are:");
    			br0 = element("br");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Algeria, Austria, Belarus, Belgium, Bosnia and Herzegovina, Bulgaria, China, Denmark, Equatorial Guinea, Finland, France, Greece, Hungary, Iran, Iraq, Ireland, Israel, Italy, Lybia, Malaysia, Morocco, New Zealand, Norway, Poland, Portugal, Serbia, Slovakia, Slovenia, South Africa, Spain, Turkey, the U.K.";
    			t3 = space();
    			div1 = element("div");
    			t4 = text("If you live in one of these countries your personal climate action (or lack there of) counts,");
    			br1 = element("br");
    			t5 = text("greatly.");
    			add_location(br0, file$j, 101, 77, 3813);
    			attr_dev(span, "class", "text svelte-wjk3lr");
    			add_location(span, file$j, 102, 2, 3820);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$j, 100, 1, 3676);
    			add_location(br1, file$j, 105, 210, 4387);
    			attr_dev(div1, "class", "text criticalText svelte-wjk3lr");
    			set_style(div1, "left", /*marginSides*/ ctx[10]);
    			set_style(div1, "right", /*marginSides*/ ctx[10]);
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[9] + " * 0)");
    			add_location(div1, file$j, 105, 1, 4178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t4);
    			append_dev(div1, br1);
    			append_dev(div1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(100:0) {#if fourthSetup}",
    		ctx
    	});

    	return block;
    }

    // (109:0) {#if fifthSetup}
    function create_if_block$c(ctx) {
    	let div0;
    	let t0;
    	let br0;
    	let t1;
    	let span;
    	let t2;
    	let i0;
    	let t4;
    	let i1;
    	let t6;
    	let i2;
    	let t8;
    	let i3;
    	let t10;
    	let i4;
    	let t12;
    	let t13;
    	let div1;
    	let t14;
    	let br1;
    	let t15;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Countries that are ranked as having Highest impact on an individual level are:");
    			br0 = element("br");
    			t1 = space();
    			span = element("span");
    			t2 = text("Australia, Canada, Czech, Estonia, Germany, ");
    			i0 = element("i");
    			i0.textContent = "Iceland";
    			t4 = text(", Japan, Kazakhstan, Mongolia, Oman, Qatar, Russia, ");
    			i1 = element("i");
    			i1.textContent = "Saudi Arabia";
    			t6 = text(", ");
    			i2 = element("i");
    			i2.textContent = "South Korea";
    			t8 = text(", ");
    			i3 = element("i");
    			i3.textContent = "The Netherlands";
    			t10 = text(", Trinidad and Tobago, Turkmenistan, ");
    			i4 = element("i");
    			i4.textContent = "The U.S.";
    			t12 = text(", United Arab Emirates.");
    			t13 = space();
    			div1 = element("div");
    			t14 = text("If you live in one of these countries your personal climate action (or lack there of) counts,");
    			br1 = element("br");
    			t15 = text("very greatly!");
    			add_location(br0, file$j, 110, 80, 4571);
    			add_location(i0, file$j, 111, 65, 4641);
    			add_location(i1, file$j, 111, 131, 4707);
    			add_location(i2, file$j, 111, 152, 4728);
    			add_location(i3, file$j, 111, 177, 4753);
    			add_location(i4, file$j, 111, 241, 4817);
    			attr_dev(span, "class", "text svelte-wjk3lr");
    			add_location(span, file$j, 111, 2, 4578);
    			attr_dev(div0, "class", "pagetext");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$j, 109, 1, 4431);
    			add_location(br1, file$j, 114, 210, 5093);
    			attr_dev(div1, "class", "text criticalText svelte-wjk3lr");
    			set_style(div1, "left", /*marginSides*/ ctx[10]);
    			set_style(div1, "right", /*marginSides*/ ctx[10]);
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[9] + " * 0)");
    			add_location(div1, file$j, 114, 1, 4884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(span, i0);
    			append_dev(span, t4);
    			append_dev(span, i1);
    			append_dev(span, t6);
    			append_dev(span, i2);
    			append_dev(span, t8);
    			append_dev(span, i3);
    			append_dev(span, t10);
    			append_dev(span, i4);
    			append_dev(span, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t14);
    			append_dev(div1, br1);
    			append_dev(div1, t15);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(109:0) {#if fifthSetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div0;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let div1;
    	let t12;
    	let div3;
    	let div2;
    	let t13;
    	let a;
    	let t15;
    	let t16;
    	let div5;
    	let div4;
    	let if_block0 = /*firstSetup*/ ctx[4] && create_if_block_9$5(ctx);
    	let if_block1 = /*secondSetup*/ ctx[5] && create_if_block_8$5(ctx);
    	let if_block2 = /*thirdSetup*/ ctx[6] && create_if_block_7$6(ctx);
    	let if_block3 = /*fourthSetup*/ ctx[7] && create_if_block_6$b(ctx);
    	let if_block4 = /*fifthSetup*/ ctx[8] && create_if_block_5$b(ctx);
    	let if_block5 = /*firstSetup*/ ctx[4] && create_if_block_4$c(ctx);
    	let if_block6 = /*secondSetup*/ ctx[5] && create_if_block_3$c(ctx);
    	let if_block7 = /*thirdSetup*/ ctx[6] && create_if_block_2$c(ctx);
    	let if_block8 = /*fourthSetup*/ ctx[7] && create_if_block_1$c(ctx);
    	let if_block9 = /*fifthSetup*/ ctx[8] && create_if_block$c(ctx);

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
    			div0 = element("div");
    			t5 = text(/*pagetitleText*/ ctx[0]);
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			t9 = space();
    			if (if_block8) if_block8.c();
    			t10 = space();
    			if (if_block9) if_block9.c();
    			t11 = space();
    			div1 = element("div");
    			t12 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t13 = text("Source ");
    			a = element("a");
    			a.textContent = "[1]";
    			t15 = text(".");
    			t16 = space();
    			div5 = element("div");
    			div4 = element("div");
    			attr_dev(div0, "class", "pagetitle");
    			set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div0, file$j, 75, 0, 1539);
    			attr_dev(div1, "class", "horizontalLine left");
    			set_style(div1, "width", "100%");
    			set_style(div1, "top", "calc((" + /*distanceBLines*/ ctx[9] + " * 8) - 1px)");
    			set_style(div1, "border-top", "1px solid blue");
    			add_location(div1, file$j, 124, 0, 5136);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://feu-us.org/impact-of-individual-action/");
    			attr_dev(a, "class", "svelte-wjk3lr");
    			add_location(a, file$j, 130, 10, 5387);
    			attr_dev(div2, "class", "bottomLineText text svelte-wjk3lr");
    			set_style(div2, "text-align", "right");
    			add_location(div2, file$j, 129, 2, 5316);
    			attr_dev(div3, "class", "text bottomLine svelte-wjk3lr");
    			add_location(div3, file$j, 128, 0, 5284);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$j, 136, 1, 5529);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$j, 135, 0, 5488);
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
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t5);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, t13);
    			append_dev(div2, a);
    			append_dev(div2, t15);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9$5(ctx);
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
    					if_block1 = create_if_block_8$5(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thirdSetup*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7$6(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fourthSetup*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_6$b(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*fifthSetup*/ ctx[8]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_5$b(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*pagetitleText*/ 1) set_data_dev(t5, /*pagetitleText*/ ctx[0]);

    			if (dirty & /*rotate*/ 2) {
    				set_style(div0, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			}

    			if (/*firstSetup*/ ctx[4]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_4$c(ctx);
    					if_block5.c();
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*secondSetup*/ ctx[5]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_3$c(ctx);
    					if_block6.c();
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*thirdSetup*/ ctx[6]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_2$c(ctx);
    					if_block7.c();
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*fourthSetup*/ ctx[7]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_1$c(ctx);
    					if_block8.c();
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*fifthSetup*/ ctx[8]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block$c(ctx);
    					if_block9.c();
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (dirty & /*rotate*/ 2) {
    				set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
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
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div5);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	let firstSetup = true;
    	let secondSetup = false;
    	let thirdSetup = false;
    	let fourthSetup = false;
    	let fifthSetup = false;

    	const togglefirstSetup = () => {
    		$$invalidate(4, firstSetup = true);
    		$$invalidate(5, secondSetup = false);
    	};

    	const togglesecondSetup = () => {
    		$$invalidate(4, firstSetup = false);
    		$$invalidate(5, secondSetup = true);
    		$$invalidate(6, thirdSetup = false);
    	};

    	const togglethirdSetup = () => {
    		$$invalidate(5, secondSetup = false);
    		$$invalidate(6, thirdSetup = true);
    		$$invalidate(7, fourthSetup = false);
    	};

    	const togglefourthSetup = () => {
    		$$invalidate(6, thirdSetup = false);
    		$$invalidate(7, fourthSetup = true);
    		$$invalidate(8, fifthSetup = false);
    	};

    	const togglefifthSetup = () => {
    		$$invalidate(7, fourthSetup = false);
    		$$invalidate(8, fifthSetup = true);
    	};

    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImpactofIndividualAction> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ImpactofIndividualAction", $$slots, []);

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
    		secondSetup,
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(2, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(3, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(9, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) $$invalidate(10, marginSides = $$props.marginSides);
    		if ("firstSetup" in $$props) $$invalidate(4, firstSetup = $$props.firstSetup);
    		if ("secondSetup" in $$props) $$invalidate(5, secondSetup = $$props.secondSetup);
    		if ("thirdSetup" in $$props) $$invalidate(6, thirdSetup = $$props.thirdSetup);
    		if ("fourthSetup" in $$props) $$invalidate(7, fourthSetup = $$props.fourthSetup);
    		if ("fifthSetup" in $$props) $$invalidate(8, fifthSetup = $$props.fifthSetup);
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
    		thirdSetup,
    		fourthSetup,
    		fifthSetup,
    		distanceBLines,
    		marginSides,
    		togglefirstSetup,
    		togglesecondSetup,
    		togglethirdSetup,
    		togglefourthSetup,
    		togglefifthSetup
    	];
    }

    class ImpactofIndividualAction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 2,
    			prev: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImpactofIndividualAction",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<ImpactofIndividualAction> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<ImpactofIndividualAction> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[2] === undefined && !("next" in props)) {
    			console.warn("<ImpactofIndividualAction> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[3] === undefined && !("prev" in props)) {
    			console.warn("<ImpactofIndividualAction> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<ImpactofIndividualAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/specifics/CriticalDecadeIII.svelte generated by Svelte v3.23.0 */

    const file$k = "src/specifics/CriticalDecadeIII.svelte";

    function create_fragment$l(ctx) {
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
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;

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
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = text("Sign pledge");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$k, 17, 2, 281);
    			attr_dev(div1, "class", "pagetitle");
    			set_style(div1, "transform", "rotate(" + /*rotate*/ ctx[1] + ")");
    			add_location(div1, file$k, 15, 0, 200);
    			attr_dev(div2, "class", "activedot activedot16");
    			add_location(div2, file$k, 20, 0, 314);
    			attr_dev(div3, "class", "progressline");
    			set_style(div3, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + "))");
    			add_location(div3, file$k, 22, 1, 397);
    			attr_dev(div4, "class", "progressline");
    			set_style(div4, "transform", "rotate(calc(0deg - " + /*rotate*/ ctx[1] + " + 11.25deg))");
    			add_location(div4, file$k, 23, 1, 481);
    			attr_dev(div5, "class", "activedotnew activedotFan");
    			add_location(div5, file$k, 21, 0, 356);
    			attr_dev(div6, "class", "horizontalLine left");
    			set_style(div6, "width", "100%");
    			set_style(div6, "top", "calc((" + /*distanceBLines*/ ctx[2] + " * 8) - 1px)");
    			set_style(div6, "border-top", "1px solid blue");
    			add_location(div6, file$k, 28, 0, 585);
    			attr_dev(div7, "class", "text criticalText");
    			set_style(div7, "left", /*marginSides*/ ctx[3]);
    			set_style(div7, "right", /*marginSides*/ ctx[3]);
    			set_style(div7, "top", "calc((" + /*distanceBLines*/ ctx[2] + " * 8)");
    			add_location(div7, file$k, 29, 0, 715);
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
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, t7);
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
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div7);
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
    	let { next } = $$props;
    	let { prev } = $$props;
    	let distanceBLines = "calc((100% - 1px) / 9 * 1)";
    	let marginSides = "calc(100vw / 16)";
    	const writable_props = ["pagetitleText", "rotate", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalDecadeIII> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CriticalDecadeIII", $$slots, []);

    	$$self.$set = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(4, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		pagetitleText,
    		rotate,
    		next,
    		prev,
    		distanceBLines,
    		marginSides
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagetitleText" in $$props) $$invalidate(0, pagetitleText = $$props.pagetitleText);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("next" in $$props) $$invalidate(4, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("distanceBLines" in $$props) $$invalidate(2, distanceBLines = $$props.distanceBLines);
    		if ("marginSides" in $$props) $$invalidate(3, marginSides = $$props.marginSides);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagetitleText, rotate, distanceBLines, marginSides, next, prev];
    }

    class CriticalDecadeIII extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			pagetitleText: 0,
    			rotate: 1,
    			next: 4,
    			prev: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalDecadeIII",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagetitleText*/ ctx[0] === undefined && !("pagetitleText" in props)) {
    			console.warn("<CriticalDecadeIII> was created without expected prop 'pagetitleText'");
    		}

    		if (/*rotate*/ ctx[1] === undefined && !("rotate" in props)) {
    			console.warn("<CriticalDecadeIII> was created without expected prop 'rotate'");
    		}

    		if (/*next*/ ctx[4] === undefined && !("next" in props)) {
    			console.warn("<CriticalDecadeIII> was created without expected prop 'next'");
    		}

    		if (/*prev*/ ctx[5] === undefined && !("prev" in props)) {
    			console.warn("<CriticalDecadeIII> was created without expected prop 'prev'");
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

    	get next() {
    		throw new Error("<CriticalDecadeIII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<CriticalDecadeIII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<CriticalDecadeIII>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<CriticalDecadeIII>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.0 */
    const file$l = "src/App.svelte";

    function create_fragment$m(ctx) {
    	let t0;
    	let div16;
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

    	const criticaldecadeii = new CriticalDecadeII({
    			props: {
    				pagetitleText: "The Critical Decade: II",
    				rotate: "-11.25deg",
    				next: "#page11",
    				prev: "#page9"
    			},
    			$$inline: true
    		});

    	const criticaldecadei = new CriticalDecadeI({
    			props: {
    				pagetitleText: "The Critical Decade: I",
    				rotate: "-22.5deg",
    				next: "#page12",
    				prev: "#page10"
    			},
    			$$inline: true
    		});

    	const cambodia = new Cambodia({
    			props: {
    				pagetitleText: "Cambodia",
    				rotate: "-33.75deg",
    				next: "#page13",
    				prev: "#page11"
    			},
    			$$inline: true
    		});

    	const southkorea = new SouthKorea({
    			props: {
    				pagetitleText: "South Korea",
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
    				pagetitleText: "now & then",
    				rotate: "-78.75deg",
    				prev: "#page15"
    			},
    			$$inline: true
    		});

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div16 = element("div");
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
    			create_component(criticaldecadeii.$$.fragment);
    			t10 = space();
    			div10 = element("div");
    			create_component(criticaldecadei.$$.fragment);
    			t11 = space();
    			div11 = element("div");
    			create_component(cambodia.$$.fragment);
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
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$l, 71, 1, 3406);
    			attr_dev(div1, "class", "content country");
    			add_location(div1, file$l, 72, 1, 3553);
    			attr_dev(div2, "class", "content country");
    			add_location(div2, file$l, 73, 1, 3672);
    			attr_dev(div3, "class", "content");
    			add_location(div3, file$l, 74, 1, 3794);
    			attr_dev(div4, "class", "content country");
    			add_location(div4, file$l, 75, 1, 3952);
    			attr_dev(div5, "class", "content country");
    			add_location(div5, file$l, 76, 1, 4075);
    			attr_dev(div6, "class", "content country");
    			add_location(div6, file$l, 77, 1, 4195);
    			attr_dev(div7, "class", "content");
    			add_location(div7, file$l, 78, 1, 4332);
    			attr_dev(div8, "class", "content country");
    			add_location(div8, file$l, 79, 1, 4504);
    			attr_dev(div9, "class", "content");
    			add_location(div9, file$l, 80, 1, 4621);
    			attr_dev(div10, "class", "content");
    			add_location(div10, file$l, 81, 1, 4780);
    			attr_dev(div11, "class", "content country");
    			add_location(div11, file$l, 82, 1, 4936);
    			attr_dev(div12, "class", "content country");
    			add_location(div12, file$l, 83, 1, 5068);
    			attr_dev(div13, "class", "content");
    			add_location(div13, file$l, 84, 1, 5204);
    			attr_dev(div14, "class", "content");
    			add_location(div14, file$l, 85, 1, 5351);
    			attr_dev(div15, "class", "content");
    			add_location(div15, file$l, 86, 1, 5494);
    			attr_dev(div16, "class", "newmain");
    			add_location(div16, file$l, 63, 0, 3204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div0);
    			mount_component(criticaldecadeiii, div0, null);
    			append_dev(div16, t1);
    			append_dev(div16, div1);
    			mount_component(usa, div1, null);
    			append_dev(div16, t2);
    			append_dev(div16, div2);
    			mount_component(brazil, div2, null);
    			append_dev(div16, t3);
    			append_dev(div16, div3);
    			mount_component(environmentaljustice, div3, null);
    			append_dev(div16, t4);
    			append_dev(div16, div4);
    			mount_component(iceland, div4, null);
    			append_dev(div16, t5);
    			append_dev(div16, div5);
    			mount_component(ghana, div5, null);
    			append_dev(div16, t6);
    			append_dev(div16, div6);
    			mount_component(saudiarabia, div6, null);
    			append_dev(div16, t7);
    			append_dev(div16, div7);
    			mount_component(impactofindividualaction, div7, null);
    			append_dev(div16, t8);
    			append_dev(div16, div8);
    			mount_component(india, div8, null);
    			append_dev(div16, t9);
    			append_dev(div16, div9);
    			mount_component(criticaldecadeii, div9, null);
    			append_dev(div16, t10);
    			append_dev(div16, div10);
    			mount_component(criticaldecadei, div10, null);
    			append_dev(div16, t11);
    			append_dev(div16, div11);
    			mount_component(cambodia, div11, null);
    			append_dev(div16, t12);
    			append_dev(div16, div12);
    			mount_component(southkorea, div12, null);
    			append_dev(div16, t13);
    			append_dev(div16, div13);
    			mount_component(extremeheatii, div13, null);
    			append_dev(div16, t14);
    			append_dev(div16, div14);
    			mount_component(extremeheati, div14, null);
    			append_dev(div16, t15);
    			append_dev(div16, div15);
    			mount_component(cover, div15, null);
    			insert_dev(target, t16, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
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
    			transition_in(criticaldecadeii.$$.fragment, local);
    			transition_in(criticaldecadei.$$.fragment, local);
    			transition_in(cambodia.$$.fragment, local);
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
    			transition_out(criticaldecadeii.$$.fragment, local);
    			transition_out(criticaldecadei.$$.fragment, local);
    			transition_out(cambodia.$$.fragment, local);
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
    			if (detaching) detach_dev(div16);
    			destroy_component(criticaldecadeiii);
    			destroy_component(usa);
    			destroy_component(brazil);
    			destroy_component(environmentaljustice);
    			destroy_component(iceland);
    			destroy_component(ghana);
    			destroy_component(saudiarabia);
    			destroy_component(impactofindividualaction);
    			destroy_component(india);
    			destroy_component(criticaldecadeii);
    			destroy_component(criticaldecadei);
    			destroy_component(cambodia);
    			destroy_component(southkorea);
    			destroy_component(extremeheatii);
    			destroy_component(extremeheati);
    			destroy_component(cover);
    			if (detaching) detach_dev(t16);
    			destroy_component(footer, detaching);
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
    		if ("pages" in $$props) pages = $$props.pages;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
