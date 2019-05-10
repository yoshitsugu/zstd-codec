// REF: https://stackoverflow.com/a/47880734
const wasmSupported = (() => {
    try {
        if (typeof WebAssembly === "object"
            && typeof WebAssembly.instantiate === "function") {
            var module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
    } catch (e) {
    }
    return false;
})();

// Not use WASM for iOS 11.2 to avoid bug.
// See https://github.com/emscripten-core/emscripten/issues/6042
const buggy = (() => {
    try {
        const ua = navigator.userAgent.toLowerCase();
        if (!/(iphone|ipad)/.test(ua) || /crios/.test(ua)) {
            return false;
        }
        const iosVersion = ua.match(/os (\d+)_(\d+)/);
        if (iosVersion && iosVersion[1] && iosVersion[2]) {
            return Number(iosVersion[1]) === 11 && Number(iosVersion[2]) === 2;
        } else {
            return false;
        }
    } catch (e) {
    }
    return false;
})();

exports.run = (f) => {
    const Module = {};
    Module.onRuntimeInitialized = () => {
        f(Module);
    };

    if (wasmSupported && !buggy) {
        require('./zstd-codec-binding-wasm.js')(Module);
    }
    else {
        require('./zstd-codec-binding.js')(Module);
    }
};
