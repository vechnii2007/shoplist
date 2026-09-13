// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setUint16),
      AD: x0 => x0.width,
      AE: x0 => new ResizeObserver(x0),
      AF: x0 => x0.key,
      AG: x0 => x0.current(),
      AH: (x0,x1) => { x0.scrollTop = x1 },
      AI: x0 => x0.disabled,
      AJ: x0 => x0.close(),
      AK: x0 => x0.readyState,
      AL: x0 => x0.error,
      AM: x0 => x0.sqlite3_initialize(),
      AN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AO: (x0,x1) => x0.createObjectStore(x1),
      AP: (x0,x1) => { x0.src = x1 },
      AQ: x0 => ({ideal: x0}),
      AR: (x0,x1) => { x0.lang = x1 },
      AS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint8),
      BD: x0 => x0.screen,
      BE: (x0,x1) => x0.getPropertyValue(x1),
      BF: x0 => x0.identifier,
      BG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      BH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      BI: (x0,x1) => { x0.min = x1 },
      BJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      BK: (x0,x1) => { x0.binaryType = x1 },
      BL: (x0,x1) => { x0.onabort = x1 },
      BM: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      BN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BO: x0 => x0.oldVersion,
      BP: (x0,x1) => { x0.async = x1 },
      BQ: (x0,x1,x2) => ({width: x0,height: x1,deviceId: x2}),
      BR: (x0,x1) => { x0.defer = x1 },
      BS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setInt8),
      CD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      CE: x0 => globalThis.parseFloat(x0),
      CF: x0 => x0.touches,
      CG: x0 => x0.v8BreakIterator,
      CH: (x0,x1) => { x0.value = x1 },
      CI: (x0,x1) => { x0.max = x1 },
      CJ: (x0,x1) => x0.decode(x1),
      CK: (a, l) => a.length = l,
      CL: (x0,x1) => { x0.oncomplete = x1 },
      CM: (x0,x1) => globalThis.Atomics.load(x0,x1),
      CN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CO: () => globalThis.indexedDB,
      CP: (x0,x1) => { x0.charset = x1 },
      CQ: x0 => ({video: x0}),
      CR: x0 => x0.videoHeight,
      CS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.getInt8),
      DD: x0 => x0.tabIndex,
      DE: (x0,x1) => x0.getComputedStyle(x1),
      DF: x0 => x0.pressure,
      DG: () => globalThis.Intl,
      DH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      DI: (x0,x1) => { x0.disabled = x1 },
      DJ: x0 => x0.displayHeight,
      DK: (x0,x1) => x0.getRandomValues(x1),
      DL: (x0,x1) => x0.objectStore(x1),
      DM: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      DN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      DO: (x0,x1) => ({name: x0,length: x1}),
      DP: (x0,x1) => { x0.type = x1 },
      DQ: (x0,x1) => ({width: x0,height: x1}),
      DR: x0 => x0.videoWidth,
      DS: (x0,x1) => { x0.oncancel = x1 },
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      ED: (x0,x1) => x0.contains(x1),
      EE: x0 => x0.documentElement,
      EF: x0 => x0.tiltY,
      EG: (x0,x1) => x0.segment(x1),
      EH: (x0,x1) => { x0.value = x1 },
      EI: (x0,x1) => { x0.scrollLeft = x1 },
      EJ: x0 => x0.displayWidth,
      EK: () => globalThis.crypto,
      EL: (x0,x1) => x0.sqlite3_finalize(x1),
      EM: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      EN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      EO: (x0,x1) => x0.update(x1),
      EP: (x0,x1) => x0.querySelector(x1),
      EQ: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      ER: x0 => x0.stream,
      ES: (x0,x1) => { x0.onchange = x1 },
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      FD: x0 => x0.activeElement,
      FE: x0 => x0.computedStyleMap(),
      FF: x0 => x0.tiltX,
      FG: x0 => x0.index,
      FH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      FI: (x0,x1) => { x0.spellcheck = x1 },
      FJ: x0 => x0.duration,
      FK: l => new DataView(new ArrayBuffer(l)),
      FL: (x0,x1) => x0.sqlite3_reset(x1),
      FM: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      FN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      FO: x0 => x0.name,
      FP: x0 => x0.head,
      FQ: (x0,x1) => x0.getUserMedia(x1),
      FR: x0 => x0.play(),
      FS: x0 => x0.type,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.parentNode,
      GE: (x0,x1) => x0.get(x1),
      GF: x0 => x0.pointerType,
      GG: x0 => x0.next(),
      GH: x0 => x0.value,
      GI: (x0,x1) => { x0.disabled = x1 },
      GJ: x0 => x0.image,
      GK: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      GL: x0 => x0.buffer,
      GM: x0 => new Worker(x0),
      GN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      GO: x0 => globalThis.IDBKeyRange.only(x0),
      GP: () => globalThis.document,
      GQ: x0 => x0.deviceId,
      GR: x0 => x0.paused,
      GS: x0 => x0.lastModified,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.tagName,
      HE: (o, p) => p in o,
      HF: x0 => x0.pointerId,
      HG: x0 => x0.value,
      HH: x0 => x0.selectionDirection,
      HI: (a, i) => a.splice(i, 1),
      HJ: () => globalThis.window.ImageDecoder,
      HK: x0 => x0.history,
      HL: (x0,x1) => x0.sqlite3_errstr(x1),
      HM: () => globalThis.Uint8Array,
      HN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      HO: (x0,x1,x2) => x0.put(x1,x2),
      HP: x0 => x0.stop(),
      HQ: x0 => x0.getCapabilities(),
      HR: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      HS: x0 => x0.name,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.target,
      IE: (x0,x1) => { x0.textContent = x1 },
      IF: x0 => x0.getCoalescedEvents(),
      IG: x0 => x0.done,
      IH: x0 => x0.selectionStart,
      II: (a, l) => a.length = l,
      IJ: x0 => x0.decode(),
      IK: () => globalThis.window,
      IL: (x0,x1) => x0.sqlite3_errmsg(x1),
      IM: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof DataView) return 1;
        return 2;
      },
      IN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      IO: (x0,x1) => x0.getKey(x1),
      IP: () => new webkitSpeechRecognition(),
      IQ: () => ({}),
      IR: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      IS: (x0,x1) => x0.item(x1),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.clientY,
      JE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JF: (x0,x1) => x0.getModifierState(x1),
      JG: (o, m, a) => o[m].apply(o, a),
      JH: x0 => x0.selectionEnd,
      JI: a => a.pop(),
      JJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      JK: x0 => x0.userAgent,
      JL: (x0,x1) => x0.sqlite3_error_offset(x1),
      JM: () => globalThis.DataView,
      JN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      JO: (x0,x1) => x0.delete(x1),
      JP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JQ: (x0,x1) => x0.applyConstraints(x1),
      JR: (x0,x1,x2) => x0.readBarcodes(x1,x2),
      JS: x0 => x0.length,
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientX,
      KE: x0 => x0.matches,
      KF: s => s.trimLeft(),
      KG: x0 => x0.iterator,
      KH: x0 => x0.value,
      KI: (map, o, v) => map.set(o, v),
      KJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KK: x0 => x0.navigator,
      KL: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      KM: x0 => x0.communicationBuffer,
      KN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      KO: (x0,x1) => x0.put(x1),
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KQ: (x0,x1) => { x0.whiteBalanceMode = x1 },
      KR: x0 => x0.text,
      KS: x0 => x0.files,
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      LD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      LE: (x0,x1) => x0.matchMedia(x1),
      LF: s => s.toUpperCase(),
      LG: () => globalThis.Symbol,
      LH: x0 => x0.selectionDirection,
      LI: (map, o) => map.get(o),
      LJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      LK: () => new MessageChannel(),
      LL: (x0,x1) => x0.sqlite3_step(x1),
      LM: () => globalThis.Int32Array,
      LN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LO: (x0,x1,x2) => x0.postMessage(x1,x2),
      LP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LQ: x0 => x0.whiteBalanceMode,
      LR: x0 => x0.format,
      LS: x0 => x0.target,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      MD: x0 => x0.getBoundingClientRect(),
      ME: x0 => x0.matches,
      MF: x0 => x0.pop(),
      MG: (x0,x1) => new Intl.Segmenter(x0,x1),
      MH: x0 => x0.selectionStart,
      MI: () => new WeakMap(),
      MJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MK: x0 => new BroadcastChannel(x0),
      ML: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      MM: x0 => x0.byteLength,
      MN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      MO: x0 => x0.port2,
      MP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MQ: (x0,x1) => { x0.exposureMode = x1 },
      MR: x0 => x0.bytes,
      MS: (x0,x1) => x0.replaceChildren(x1),
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      ND: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      NE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      NF: x0 => x0.flags,
      NG: x0 => x0.Segmenter,
      NH: x0 => x0.selectionEnd,
      NI: x0 => new WeakRef(x0),
      NJ: x0 => x0.send(),
      NK: x0 => globalThis.Array.isArray(x0),
      NL: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      NM: x0 => x0.synchronizationBuffer,
      NN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NO: x0 => x0.terminate(),
      NP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NQ: x0 => x0.exposureMode,
      NR: x0 => x0.y,
      NS: x0 => x0.click(),
      O: o => o === undefined,
      OB: x0 => new Int32Array(x0),
      OC: (x0,x1) => x0.querySelector(x1),
      OD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      OE: f => f.dartFunction,
      OF: (a, s) => a.join(s),
      OG: x0 => x0.buffer,
      OH: x0 => x0.keyCode,
      OI: x0 => x0.deref(),
      OJ: x0 => x0.status,
      OK: x0 => x0.table,
      OL: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      OM: (x0,x1,x2) => x0.postMessage(x1,x2),
      ON: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OO: (x0,x1) => new SharedWorker(x0,x1),
      OP: (x0,x1) => { x0.onnomatch = x1 },
      OQ: (x0,x1) => { x0.focusMode = x1 },
      OR: x0 => x0.x,
      OS: (x0,x1,x2) => x0.setAttribute(x1,x2),
      P: (x0,x1) => x0.exec(x1),
      PB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      PC: (x0,x1) => x0.item(x1),
      PD: Date.now,
      PE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PF: (x0,x1) => x0.error(x1),
      PG: x0 => x0.wasmMemory,
      PH: (x0,x1) => x0.scrollIntoView(x1),
      PI: () => globalThis.WeakRef,
      PJ: x0 => x0.response,
      PK: x0 => x0.kind,
      PL: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      PM: x0 => new SharedArrayBuffer(x0),
      PN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PO: x0 => x0.start(),
      PP: (x0,x1) => { x0.onend = x1 },
      PQ: x0 => x0.focusMode,
      PR: x0 => x0.bottomLeft,
      PS: (x0,x1) => { x0.accept = x1 },
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => new Uint32Array(x0),
      QC: x0 => x0.length,
      QD: (handle) => clearTimeout(handle),
      QE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      QF: () => globalThis.console,
      QG: () => globalThis.window._flutter_skwasmInstance,
      QH: x0 => x0.multiViewEnabled,
      QI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      QJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      QK: x0 => x0.close(),
      QL: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      QM: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      QN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      QO: x0 => x0.port,
      QP: (x0,x1) => { x0.onspeechstart = x1 },
      QQ: x0 => x0.enumerateDevices(),
      QR: x0 => x0.bottomRight,
      QS: (x0,x1) => { x0.multiple = x1 },
      R: o => o,
      RB: x0 => new Float32Array(x0),
      RC: (x0,x1) => x0.querySelectorAll(x1),
      RD: (x0,x1) => x0.closest(x1),
      RE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      RF: s => s.trimRight(),
      RG: () => new TextDecoder(),
      RH: (x0,x1) => x0.replaceWith(x1),
      RI: (a, s, e) => a.slice(s, e),
      RJ: (x0,x1) => { x0.responseType = x1 },
      RK: (x0,x1) => x0.postMessage(x1),
      RL: x0 => globalThis.BigInt(x0),
      RM: x0 => x0.close(),
      RN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      RO: (x0,x1) => x0.getItem(x1),
      RP: (x0,x1) => { x0.onstart = x1 },
      RQ: x0 => x0.deviceId,
      RR: x0 => x0.topRight,
      RS: (x0,x1) => { x0.type = x1 },
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      SC: (x0,x1) => x0.getAttribute(x1),
      SD: x0 => x0.bottom,
      SE: (o, i) => o[i],
      SF: x0 => x0.blur(),
      SG: (d, digits) => d.toFixed(digits),
      SH: (x0,x1) => { x0.type = x1 },
      SI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      SJ: () => new XMLHttpRequest(),
      SK: (x0,x1) => ({kind: x0,table: x1}),
      SL: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      SM: x0 => x0.getSize(),
      SN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      SO: x0 => x0.localStorage,
      SP: (x0,x1) => { x0.onerror = x1 },
      SQ: x0 => x0.kind,
      SR: x0 => x0.topLeft,
      SS: () => globalThis.removeSplashFromWeb(),
      T: o => o instanceof RegExp,
      TB: x0 => new Float64Array(x0),
      TC: x0 => x0.remove(),
      TD: x0 => x0.top,
      TE: o => o.length,
      TF: x0 => x0.button,
      TG: x0 => x0.maxHeight,
      TH: (x0,x1) => { x0.className = x1 },
      TI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      TJ: () => new AbortController(),
      TK: x0 => ({signal: x0}),
      TL: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      TM: (x0,x1) => x0.truncate(x1),
      TN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      TO: x0 => x0.href,
      TP: x0 => x0.error,
      TQ: x0 => x0.mediaDevices,
      TR: x0 => x0.position,
      TS: x0 => x0.length,
      U: (string, times) => string.repeat(times),
      UB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      UC: (x0,x1) => x0.appendChild(x1),
      UD: x0 => x0.right,
      UE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      UF: x0 => x0.innerHeight,
      UG: x0 => x0.maxWidth,
      UH: (x0,x1) => { x0.tabIndex = x1 },
      UI: (o, p) => p in o,
      UJ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      UK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      UL: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      UM: x0 => ({at: x0}),
      UN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      UO: x0 => x0.location,
      UP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UQ: x0 => x0.facingMode,
      UR: x0 => x0.isValid,
      US: x0 => x0.getReader(),
      V: o => o,
      VB: x0 => new ArrayBuffer(x0),
      VC: (x0,x1) => x0.append(x1),
      VD: x0 => x0.left,
      VE: x0 => x0.language,
      VF: x0 => x0.innerWidth,
      VG: x0 => x0.minHeight,
      VH: (x0,x1) => { x0.name = x1 },
      VI: x0 => x0.groups,
      VJ: (x0,x1) => globalThis.fetch(x0,x1),
      VK: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      VL: (x0,x1) => x0.dart_sqlite3_free(x1),
      VM: (x0,x1) => x0.write(x1),
      VN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      VO: (x0,x1) => x0.removeItem(x1),
      VP: x0 => x0.start(),
      VQ: x0 => x0.mediaDevices,
      VR: (x0,x1,x2,x3) => ({formats: x0,tryHarder: x1,tryRotate: x2,tryInvert: x3}),
      VS: x0 => x0.value,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      WC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      WD: x0 => x0.clientY,
      WE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      WF: x0 => x0.height,
      WG: x0 => x0.minWidth,
      WH: (x0,x1) => { x0.placeholder = x1 },
      WI: x0 => x0.naturalHeight,
      WJ: (x0,x1) => x0.get(x1),
      WK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      WL: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      WM: (x0,x1,x2) => x0.write(x1,x2),
      WN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      WO: (x0,x1,x2) => x0.setItem(x1,x2),
      WP: (x0,x1) => { x0.lang = x1 },
      WQ: () => globalThis.BarcodeDetector.getSupportedFormats(),
      WR: (x0,x1,x2) => ({tryHarder: x0,tryRotate: x1,tryInvert: x2}),
      WS: x0 => x0.done,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new DataView(x0,x1,x2),
      XC: x0 => x0.style,
      XD: x0 => x0.clientX,
      XE: () => globalThis.window.FinalizationRegistry,
      XF: x0 => x0.width,
      XG: x0 => x0.debugSkipFontRetryDelay,
      XH: (x0,x1) => { x0.autocomplete = x1 },
      XI: x0 => x0.naturalWidth,
      XJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      XK: (o, p, v) => o[p] = v,
      XL: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      XM: x0 => x0.createSyncAccessHandle(),
      XN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      XO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XP: (x0,x1) => { x0.continuous = x1 },
      XQ: x0 => x0.reset,
      XR: () => globalThis.ZXingWASM,
      XS: x0 => x0.read(),
      Y: x0 => x0.unicode,
      YB: (o, p) => o[p],
      YC: x0 => x0.debugShowSemanticsNodes,
      YD: x0 => x0.changedTouches,
      YE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YF: x0 => x0.clientHeight,
      YG: x0 => x0.status,
      YH: (x0,x1) => { x0.name = x1 },
      YI: (x0,x1) => x0.createElement(x1),
      YJ: (x0,x1) => x0.forEach(x1),
      YK: (o,s,v) => o[s] = v,
      YL: (x0,x1) => x0.sqlite3_close_v2(x1),
      YM: x0 => ({create: x0}),
      YN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      YO: (x0,x1) => { x0.onmessage = x1 },
      YP: (x0,x1) => { x0.interimResults = x1 },
      YQ: x0 => x0.stopContinuousDecode,
      YR: (x0,x1) => { x0.height = x1 },
      YS: x0 => x0.body,
      Z: x0 => x0.ignoreCase,
      ZB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      ZC: (x0,x1) => x0.warn(x1),
      ZD: x0 => x0.offsetY,
      ZE: x0 => new window.FinalizationRegistry(x0),
      ZF: x0 => x0.clientWidth,
      ZG: (x0,x1,x2) => x0.set(x1,x2),
      ZH: (x0,x1) => { x0.placeholder = x1 },
      ZI: (x0,x1) => { x0.pointerEvents = x1 },
      ZJ: x0 => x0.name,
      ZK: () => Symbol("jsBoxedDartObjectProperty"),
      ZL: (x0,x1) => x0.sqlite3_changes(x1),
      ZM: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      ZN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      ZO: (x0,x1) => x0.transferFromImageBitmap(x1),
      ZP: (x0,x1) => { x0.onresult = x1 },
      ZQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      ZR: (x0,x1) => { x0.width = x1 },
      ZS: (x0,x1) => new OffscreenCanvas(x0,x1),
      a: x0 => x0.multiline,
      aB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      aC: x0 => x0.console,
      aD: x0 => x0.offsetX,
      aE: (x0,x1) => x0.unregister(x1),
      aF: (x0,x1) => { x0.content = x1 },
      aG: x0 => x0.arrayBuffer(),
      aH: (x0,x1) => { x0.action = x1 },
      aI: (x0,x1) => { x0.height = x1 },
      aJ: x0 => x0.statusText,
      aK: (x0,x1) => x0.call(x1),
      aL: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      aM: x0 => ({create: x0}),
      aN: (x0,x1) => x0.read(x1),
      aO: (x0,x1) => x0.getContext(x1),
      aP: (x0,x1) => x0.item(x1),
      aQ: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      aR: x0 => x0.height,
      aS: x0 => x0.assetBase,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: o => o.byteOffset,
      bC: () => globalThis.window,
      bD: x0 => x0.type,
      bE: (x0,x1) => x0.contains(x1),
      bF: (x0,x1) => { x0.name = x1 },
      bG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      bH: (x0,x1) => { x0.method = x1 },
      bI: (x0,x1) => { x0.width = x1 },
      bJ: x0 => x0.url,
      bK: x0 => x0.locks,
      bL: x0 => globalThis.Number(x0),
      bM: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      bN: (x0,x1,x2) => x0.read(x1,x2),
      bO: (x0,x1) => { x0.height = x1 },
      bP: (x0,x1) => x0.item(x1),
      bQ: x0 => x0.text,
      bR: x0 => x0.width,
      bS: x0 => x0.loader,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.buffer,
      cC: (o, c) => o instanceof c,
      cD: x0 => x0.maxTouchPoints,
      cE: (s) => +s,
      cF: x0 => x0.head,
      cG: (x0,x1) => x0.fetch(x1),
      cH: (x0,x1) => { x0.noValidate = x1 },
      cI: x0 => x0.style,
      cJ: x0 => x0.status,
      cK: () => globalThis.navigator,
      cL: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      cM: (x0,x1) => new URL(x0,x1),
      cN: x0 => x0.flush(),
      cO: (x0,x1) => { x0.width = x1 },
      cP: x0 => x0.confidence,
      cQ: x0 => x0.barcodeFormat,
      cR: (x0,x1) => { x0.srcObject = x1 },
      cS: () => globalThis._flutter,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: Function.prototype.call.bind(DataView.prototype.getUint8),
      dC: (x0,x1) => x0[x1],
      dD: x0 => x0.platform,
      dE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      dF: (x0,x1) => x0.removeChild(x1),
      dG: x0 => x0.fontFallbackBaseUrl,
      dH: (x0,x1) => x0.removeAttribute(x1),
      dI: (x0,x1) => { x0.src = x1 },
      dJ: x0 => x0.getReader(),
      dK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dL: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      dM: x0 => x0.pathname,
      dN: () => globalThis.WebAssembly,
      dO: x0 => x0.height,
      dP: x0 => x0.transcript,
      dQ: x0 => x0.rawBytes,
      dR: x0 => ({willReadFrequently: x0}),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: (b, o) => new DataView(b, o),
      eC: x0 => x0.length,
      eD: x0 => x0.body,
      eE: s => s.trim(),
      eF: x0 => x0.firstChild,
      eG: (handle) => clearInterval(handle),
      eH: x0 => x0.isConnected,
      eI: () => globalThis.document,
      eJ: x0 => x0.read(),
      eK: (x0,x1) => x0.postMessage(x1),
      eL: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      eM: x0 => x0.getDirectory(),
      eN: x0 => x0.href,
      eO: x0 => x0.width,
      eP: x0 => x0.length,
      eQ: x0 => x0.y,
      eR: (x0,x1,x2) => x0.getContext(x1,x2),
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o, l) => new DataView(b, o, l),
      fC: (string, token) => string.split(token),
      fD: () => globalThis.document,
      fE: x0 => x0.classList,
      fF: x0 => x0.viewConstraints,
      fG: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      fH: x0 => x0.click(),
      fI: x0 => x0.src,
      fJ: x0 => x0.value,
      fK: x0 => x0.close(),
      fL: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      fM: x0 => x0.storage,
      fN: (x0,x1) => x0.openCursor(x1),
      fO: x0 => x0.rasterEndMilliseconds,
      fP: x0 => x0.length,
      fQ: x0 => x0.x,
      fR: () => new BarcodeDetector(),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      gC: o => o instanceof Array,
      gD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      gE: x0 => x0.preventDefault(),
      gF: x0 => x0.hostElement,
      gG: () => Date.now(),
      gH: (x0,x1) => x0.getElementsByClassName(x1),
      gI: (x0,x1) => x0.revokeObjectURL(x1),
      gJ: x0 => x0.done,
      gK: (x0,x1) => ({i: x0,p: x1}),
      gL: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      gM: () => globalThis.navigator,
      gN: x0 => x0.arrayBuffer(),
      gO: x0 => x0.rasterStartMilliseconds,
      gP: x0 => x0.results,
      gQ: x0 => x0.resultPoints,
      gR: x0 => ({formats: x0}),
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      hC: (a, i) => a[i],
      hD: x0 => x0.hasFocus(),
      hE: x0 => x0.parent,
      hF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      hH: (x0,x1) => x0.dispatchEvent(x1),
      hI: (x0,x1) => { x0.src = x1 },
      hJ: x0 => x0.cancel(),
      hK: (x0,x1) => ({c: x0,r: x1}),
      hL: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      hM: (x0,x1) => globalThis.fetch(x0,x1),
      hN: () => globalThis.Blob,
      hO: x0 => x0.imageBitmaps,
      hP: (x0,x1) => x0.key(x1),
      hQ: x0 => x0.message,
      hR: x0 => new BarcodeDetector(x0),
      i: x0 => new Promise(x0),
      iB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      iC: a => a.length,
      iD: x0 => x0.relatedTarget,
      iE: x0 => x0.timeStamp,
      iF: x0 => ({runApp: x0}),
      iG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      iH: (x0,x1) => x0.createEvent(x1),
      iI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      iJ: x0 => x0.body,
      iK: (x0,x1) => { x0.onmessage = x1 },
      iL: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      iM: (x0,x1) => x0.sqlite3session_delete(x1),
      iN: x0 => x0.value,
      iO: x0 => x0.canvasKitMaximumSurfaces,
      iP: x0 => x0.length,
      iQ: x0 => x0.videoElement,
      iR: (x0,x1) => x0.detect(x1),
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: (t, s) => t.set(s),
      jC: (x0,x1) => x0.test(x1),
      jD: x0 => x0.shiftKey,
      jE: (x0,x1) => x0.hasAttribute(x1),
      jF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      jG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      jH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      jI: x0 => x0.naturalHeight,
      jJ: x0 => x0.headers,
      jK: (o, a) => o == a,
      jL: (x0,x1) => x0.sqlite3_column_count(x1),
      jM: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      jN: x0 => x0.key,
      jO: x0 => x0.nextSibling,
      jP: (x0,x1) => { x0.transform = x1 },
      jQ: x0 => x0.decodeContinuously,
      jR: x0 => x0.rawValue,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      kC: x0 => x0.userAgent,
      kD: (decoder, codeUnits) => decoder.decode(codeUnits),
      kE: x0 => x0.buttons,
      kF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      kG: x0 => x0.history,
      kH: x0 => x0.readText(),
      kI: x0 => x0.naturalWidth,
      kJ: x0 => x0.signal,
      kK: x0 => x0.r,
      kL: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      kM: (x0,x1) => x0.unregister(x1),
      kN: x0 => x0.continue(),
      kO: (x0,x1) => x0.debug(x1),
      kP: x0 => x0.style,
      kQ: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      kR: x0 => x0.format,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      lC: x0 => x0.navigator,
      lD: () => new TextDecoder("utf-8", {fatal: true}),
      lE: x0 => x0.ctrlKey,
      lF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      lG: x0 => x0.search,
      lH: x0 => x0.clipboard,
      lI: x0 => x0.decode(),
      lJ: x0 => x0.abort(),
      lK: x0 => x0.c,
      lL: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      lM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lN: x0 => x0.error,
      lO: x0 => x0.hostElement,
      lP: x0 => x0.getVideoTracks(),
      lQ: (x0,x1) => ({width: x0,height: x1}),
      lR: x0 => x0.y,
      m: o => [o],
      mB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      mC: Function.prototype.call.bind(String.prototype.toLowerCase),
      mD: () => new TextDecoder("utf-8", {fatal: false}),
      mE: x0 => x0.y,
      mF: o => o.byteLength,
      mG: x0 => x0.location,
      mH: (x0,x1) => x0.writeText(x1),
      mI: (x0,x1) => { x0.decoding = x1 },
      mJ: () => new Array(),
      mK: x0 => x0.p,
      mL: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      mM: x0 => new FinalizationRegistry(x0),
      mN: x0 => x0.result,
      mO: x0 => x0.location,
      mP: x0 => x0.getSettings(),
      mQ: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      mR: x0 => x0.x,
      n: (o0, o1) => [o0, o1],
      nB: Function.prototype.call.bind(DataView.prototype.getUint32),
      nC: Object.is,
      nD: (a, i, v) => a[i] = v,
      nE: x0 => x0.x,
      nF: () => typeof dartUseDateNowForTicks !== "undefined",
      nG: x0 => x0.pathname,
      nH: x0 => x0.unlock(),
      nI: (x0,x1) => { x0.crossOrigin = x1 },
      nJ: (x0,x1) => new WebSocket(x0,x1),
      nK: x0 => x0.i,
      nL: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      nM: () => globalThis.FinalizationRegistry,
      nN: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      nO: (x0,x1) => x0.getModifierState(x1),
      nP: x0 => x0.facingMode,
      nQ: x0 => x0.facingMode,
      nR: x0 => x0.cornerPoints,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      oC: x0 => x0.vendor,
      oD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      oE: x0 => x0.scrollTop,
      oF: () => Date.now(),
      oG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      oH: (x0,x1) => x0.lock(x1),
      oI: (x0,x1) => x0.createObjectURL(x1),
      oJ: x0 => x0.reason,
      oK: x0 => x0.port1,
      oL: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      oM: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      oN: x0 => x0.length,
      oO: x0 => x0.metaKey,
      oP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oQ: x0 => x0.height,
      oR: x0 => x0.body,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: Function.prototype.call.bind(DataView.prototype.getInt32),
      pC: (x0,x1) => x0.createTextNode(x1),
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.offsetTop,
      pF: () => 1000 * performance.now(),
      pG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      pH: x0 => x0.orientation,
      pI: x0 => x0.URL,
      pJ: x0 => x0.code,
      pK: (x0,x1,x2) => x0.transaction(x1,x2),
      pL: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      pM: x0 => x0.exports,
      pN: (x0,x1) => x0.get(x1),
      pO: x0 => x0.altKey,
      pP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pQ: x0 => x0.width,
      pR: x0 => globalThis.URL.revokeObjectURL(x0),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      qC: (x0,x1) => { x0.id = x1 },
      qD: x0 => x0.visibilityState,
      qE: x0 => x0.scrollLeft,
      qF: (x0,x1) => x0.requestAnimationFrame(x1),
      qG: o => Object.keys(o),
      qH: (x0,x1) => x0.querySelector(x1),
      qI: x0 => new Blob(x0),
      qJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      qK: x0 => x0.close(),
      qL: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      qM: x0 => x0.call(),
      qN: (x0,x1) => x0.index(x1),
      qO: x0 => x0.ctrlKey,
      qP: (x0,x1) => x0.append(x1),
      qQ: x0 => x0.attachStreamToVideo,
      qR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      r: (o, p) => o[p],
      rB: o => o instanceof Uint16Array,
      rC: (x0,x1) => { x0.nonce = x1 },
      rD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      rE: x0 => x0.offsetLeft,
      rF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rG: x0 => x0.state,
      rH: (x0,x1) => { x0.title = x1 },
      rI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      rJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      rK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      rL: (x0,x1) => x0.sqlite3_result_null(x1),
      rM: x0 => x0.instance,
      rN: x0 => x0.openKeyCursor(),
      rO: x0 => x0.isComposing,
      rP: (x0,x1) => { x0.onpause = x1 },
      rQ: () => new Map(),
      rR: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      s: () => globalThis,
      sB: Function.prototype.call.bind(DataView.prototype.getUint16),
      sC: x0 => x0.nonce,
      sD: x0 => x0.disconnect(),
      sE: x0 => x0.offsetParent,
      sF: x0 => x0.now(),
      sG: x0 => x0.hash,
      sH: (x0,x1) => x0.vibrate(x1),
      sI: x0 => new window.ImageDecoder(x0),
      sJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sK: () => globalThis.Promise.resolve(),
      sL: (x0,x1) => x0.sqlite3_value_blob(x1),
      sM: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      sN: x0 => x0.primaryKey,
      sO: x0 => x0.code,
      sP: (x0,x1) => { x0.onplay = x1 },
      sQ: (x0,x1,x2) => x0.set(x1,x2),
      sR: x0 => globalThis.URL.createObjectURL(x0),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: o => o instanceof Int16Array,
      tC: () => globalThis.window.flutterConfiguration,
      tD: x0 => new Intl.Locale(x0),
      tE: (o, p, r) => o.replace(p, () => r),
      tF: x0 => x0.performance,
      tG: x0 => x0.state,
      tH: x0 => x0.content,
      tI: x0 => x0.name,
      tJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tK: (x0,x1) => x0.then(x1),
      tL: (x0,x1) => x0.sqlite3_value_bytes(x1),
      tM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tN: (x0,x1,x2) => x0.open(x1,x2),
      tO: x0 => x0.repeat,
      tP: (x0,x1) => { x0.controls = x1 },
      tQ: (x0,x1) => x0.querySelector(x1),
      tR: x0 => x0.size,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: Function.prototype.call.bind(DataView.prototype.getInt16),
      uC: (x0,x1) => x0.attachShadow(x1),
      uD: x0 => x0.region,
      uE: (o, p, r) => o.replaceAll(p, () => r),
      uF: x0 => new Uint8Array(x0),
      uG: (x0,x1) => x0.go(x1),
      uH: x0 => x0.document,
      uI: x0 => x0.repetitionCount,
      uJ: (o, t) => typeof o === t,
      uK: x0 => x0.abort(),
      uL: (x0,x1) => x0.sqlite3_value_text(x1),
      uM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      uN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uP: (x0,x1) => { x0.pointerEvents = x1 },
      uQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uR: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: o => o instanceof Uint8ClampedArray,
      vC: (x0,x1) => x0.createElement(x1),
      vD: x0 => x0.script,
      vE: x0 => x0.deltaMode,
      vF: (x0,x1,x2) => x0.slice(x1,x2),
      vG: x0 => x0.parentElement,
      vH: (x0,x1,x2) => x0.insertBefore(x1,x2),
      vI: x0 => x0.frameCount,
      vJ: x0 => x0.data,
      vK: x0 => x0.commit(),
      vL: (x0,x1) => x0.sqlite3_value_double(x1),
      vM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      vN: (x0,x1) => { x0.onupgradeneeded = x1 },
      vO: x0 => globalThis.Wakelock.toggle(x0),
      vP: (x0,x1) => { x0.transformOrigin = x1 },
      vQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vR: (x0,x1) => x0.getContext(x1),
      w: (l, r) => l === r,
      wB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      wC: x0 => x0.scale,
      wD: x0 => x0.language,
      wE: x0 => x0.deltaY,
      wF: (x0,x1) => x0.decode(x1),
      wG: (x0,x1) => x0.querySelectorAll(x1),
      wH: x0 => x0.id,
      wI: x0 => x0.selectedTrack,
      wJ: (x0,x1,x2) => x0.close(x1,x2),
      wK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      wL: (x0,x1) => x0.sqlite3_value_int64(x1),
      wM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      wN: x0 => ({autoIncrement: x0}),
      wO: (x0,x1) => x0.appendChild(x1),
      wP: (x0,x1) => { x0.objectFit = x1 },
      wQ: (x0,x1) => { x0.onerror = x1 },
      wR: x0 => x0.height,
      x: x0 => x0.random(),
      xB: Function.prototype.call.bind(DataView.prototype.setInt32),
      xC: x0 => x0.visualViewport,
      xD: x0 => x0.languages,
      xE: x0 => x0.deltaX,
      xF: (x0,x1) => x0.adoptText(x1),
      xG: (x0,x1) => x0.removeProperty(x1),
      xH: x0 => x0.offsetHeight,
      xI: x0 => x0.completed,
      xJ: (x0,x1) => x0.close(x1),
      xK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      xL: (x0,x1) => x0.sqlite3_value_type(x1),
      xM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      xN: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      xO: x0 => x0.id,
      xP: (x0,x1) => { x0.width = x1 },
      xQ: (x0,x1) => x0.removeChild(x1),
      xR: x0 => x0.width,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setUint32),
      yC: x0 => x0.devicePixelRatio,
      yD: (x0,x1) => x0.observe(x1),
      yE: x0 => x0.wheelDeltaY,
      yF: x0 => x0.first(),
      yG: (x0,x1) => x0.add(x1),
      yH: x0 => x0.offsetWidth,
      yI: x0 => x0.ready,
      yJ: x0 => x0.close(),
      yK: (x0,x1) => { x0.onerror = x1 },
      yL: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      yM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      yN: x0 => ({unique: x0}),
      yO: (x0,x1) => x0.createElement(x1),
      yP: (x0,x1) => { x0.height = x1 },
      yQ: (x0,x1) => { x0.onload = x1 },
      yR: x0 => x0.remove(),
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setInt16),
      zC: x0 => x0.height,
      zD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      zE: x0 => x0.wheelDeltaX,
      zF: x0 => x0.next(),
      zG: x0 => x0.data,
      zH: x0 => x0.stopPropagation(),
      zI: x0 => x0.tracks,
      zJ: (x0,x1) => x0.send(x1),
      zK: x0 => new DOMException(x0),
      zL: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      zM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      zN: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      zO: (x0,x1) => { x0.id = x1 },
      zP: x0 => x0.getSupportedConstraints(),
      zQ: (x0,x1) => { x0.crossOrigin = x1 },
      zR: (x0,x1) => { x0.src = x1 },

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
