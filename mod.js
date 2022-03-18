let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

let cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder("utf-8");

const encodeString = (typeof cachedTextEncoder.encodeInto === "function"
  ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  }
  : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length,
    };
  });

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3);
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error("out of js stack");
  heap[--stack_pointer] = obj;
  return stack_pointer;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
/** */
export class Comment {
  static __wrap(ptr) {
    const obj = Object.create(Comment.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_comment_free(ptr);
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  before(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.comment_before(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  after(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.comment_after(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  replace(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.comment_replace(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /** */
  remove() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.comment_remove(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {boolean}
   */
  get removed() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.comment_removed(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {string}
   */
  get text() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.comment_text(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr0 = r0;
      var len0 = r1;
      if (r3) {
        ptr0 = 0;
        len0 = 0;
        throw takeObject(r2);
      }
      return getStringFromWasm0(ptr0, len0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(ptr0, len0);
    }
  }
}
/** */
export class Doctype {
  static __wrap(ptr) {
    const obj = Object.create(Doctype.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_doctype_free(ptr);
  }
  /**
   * @returns {string | undefined}
   */
  get name() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.doctype_name(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      let v0;
      if (r0 !== 0) {
        v0 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
      }
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {string | undefined}
   */
  get publicId() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.doctype_public_id(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      let v0;
      if (r0 !== 0) {
        v0 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
      }
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {string | undefined}
   */
  get systemId() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.doctype_system_id(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      let v0;
      if (r0 !== 0) {
        v0 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
      }
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/** */
export class DocumentEnd {
  static __wrap(ptr) {
    const obj = Object.create(DocumentEnd.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_documentend_free(ptr);
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  append(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.documentend_append(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/** */
export class Element {
  static __wrap(ptr) {
    const obj = Object.create(Element.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_element_free(ptr);
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  before(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_before(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  after(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_after(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  replace(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_replace(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /** */
  remove() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.element_remove(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {boolean}
   */
  get removed() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.element_removed(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {string}
   */
  get tagName() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.element_tag_name(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr0 = r0;
      var len0 = r1;
      if (r3) {
        ptr0 = 0;
        len0 = 0;
        throw takeObject(r2);
      }
      return getStringFromWasm0(ptr0, len0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(ptr0, len0);
    }
  }
  /**
   * @param {string} name
   */
  set tagName(name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_set_tag_name(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {any}
   */
  get namespaceURI() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.element_namespace_uri(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {any}
   */
  get attributes() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.element_attributes(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} name
   * @returns {string | undefined}
   */
  getAttribute(name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_getAttribute(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} name
   * @returns {boolean}
   */
  hasAttribute(name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_hasAttribute(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} name
   * @param {string} value
   */
  setAttribute(name, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      var ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      wasm.element_setAttribute(retptr, this.ptr, ptr0, len0, ptr1, len1);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} name
   */
  removeAttribute(name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_removeAttribute(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  prepend(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_prepend(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  append(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_append(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  setInnerContent(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.element_setInnerContent(
        retptr,
        this.ptr,
        ptr0,
        len0,
        isLikeNone(content_type) ? 0 : addHeapObject(content_type),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /** */
  removeAndKeepContent() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.element_removeAndKeepContent(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/** */
export class HTMLRewriter {
  static __wrap(ptr) {
    const obj = Object.create(HTMLRewriter.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_htmlrewriter_free(ptr);
  }
  /**
   * @param {string} encoding
   * @param {Function} output_sink
   */
  constructor(encoding, output_sink) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(encoding, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.htmlrewriter_new(retptr, ptr0, len0, addBorrowedObject(output_sink));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return HTMLRewriter.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }
  /**
   * @param {string} selector
   * @param {any} handlers
   */
  on(selector, handlers) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.htmlrewriter_on(retptr, this.ptr, ptr0, len0, addHeapObject(handlers));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {any} handlers
   */
  onDocument(handlers) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.htmlrewriter_onDocument(retptr, this.ptr, addHeapObject(handlers));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {Uint8Array} chunk
   */
  write(chunk) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passArray8ToWasm0(chunk, wasm.__wbindgen_malloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.htmlrewriter_write(retptr, this.ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /** */
  end() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.htmlrewriter_end(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/** */
export class TextChunk {
  static __wrap(ptr) {
    const obj = Object.create(TextChunk.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_textchunk_free(ptr);
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  before(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.textchunk_before(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  after(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.textchunk_after(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} content_type
   */
  replace(content, content_type) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.textchunk_replace(retptr, this.ptr, ptr0, len0, isLikeNone(content_type) ? 0 : addHeapObject(content_type));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /** */
  remove() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.textchunk_remove(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {boolean}
   */
  get removed() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.textchunk_removed(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {string}
   */
  get text() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.textchunk_text(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr0 = r0;
      var len0 = r1;
      if (r3) {
        ptr0 = 0;
        len0 = 0;
        throw takeObject(r2);
      }
      return getStringFromWasm0(ptr0, len0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(ptr0, len0);
    }
  }
  /**
   * @returns {boolean}
   */
  get lastInTextNode() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.textchunk_last_in_text_node(retptr, this.ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

async function load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

async function init(input) {
  if (typeof input === "undefined") {
    input = new URL("deno_lol_html_bg.wasm", import.meta.url);
  }
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_html_5ae28989b63cc88b = function (arg0) {
    var ret = getObject(arg0).html;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
  };
  imports.wbg.__wbg_documentend_new = function (arg0) {
    var ret = DocumentEnd.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_element_d668dcd821275b2e = function (arg0) {
    var ret = getObject(arg0).element;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_comments_867f58c255911b4e = function (arg0) {
    var ret = getObject(arg0).comments;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_text_6fa97b746b640e98 = function (arg0) {
    var ret = getObject(arg0).text;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_doctype_d6897df6f5ba91c4 = function (arg0) {
    var ret = getObject(arg0).doctype;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_comments_05c9691bc5edd7e0 = function (arg0) {
    var ret = getObject(arg0).comments;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_text_75ee98a22b792d23 = function (arg0) {
    var ret = getObject(arg0).text;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_end_86cc7cc81d861c67 = function (arg0) {
    var ret = getObject(arg0).end;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_element_new = function (arg0) {
    var ret = Element.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_comment_new = function (arg0) {
    var ret = Comment.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_textchunk_new = function (arg0) {
    var ret = TextChunk.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_doctype_new = function (arg0) {
    var ret = Doctype.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_String_c4052d6424160ac1 = function (arg0, arg1) {
    var ret = String(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  imports.wbg.__wbg_set_fbb49ad265f9dee8 = function (arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
  };
  imports.wbg.__wbg_new_16f24b0728c5e67b = function () {
    var ret = new Array();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_d3138911a89329b0 = function () {
    var ret = new Object();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_push_a72df856079e6930 = function (arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
  };
  imports.wbg.__wbg_new_55259b13834a484c = function (arg0, arg1) {
    var ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_call_94697a95cb7e239c = function () {
    return handleError(function (arg0, arg1, arg2) {
      var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_buffer_5e74a88a1424a2e0 = function (arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_278ec7532799393a = function (arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_e3b800e570795b3c = function (arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_memory = function () {
    var ret = wasm.memory;
    return addHeapObject(ret);
  };

  if (
    typeof input === "string" || (typeof Request === "function" && input instanceof Request) ||
    (typeof URL === "function" && input instanceof URL)
  ) {
    input = fetch(input);
  }

  const { instance, module } = await load(await input, imports);

  wasm = instance.exports;
  init.__wbindgen_wasm_module = module;

  return wasm;
}

export default init;
