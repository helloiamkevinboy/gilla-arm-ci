'use strict';
// Self-calibrating IL2CPP dumper for gilla (Unity 6, renamed + 189/234 subset).
// Identifies the metadata functions it needs at runtime by probing candidate
// exports and validating observable output (readable names, "mscorlib.dll",
// sane counts). SAFETY: every probe is bounded to a small window AND skips any
// candidate whose estimated position in the canonical 234-order maps to a
// side-effecting / blocking function (gc, monitor, runtime_invoke, raise,
// snapshot, alloc, set_*, field writes, ...). Enumeration uses il2cpp_class_for_each
// so the dangerous domain/gc region is never touched. Native faults during a
// NativeFunction call become catchable JS exceptions. No thread attach, no bridge.

var MOD = 'libil2cpp.so';
var PS = Process.pointerSize;
var SORTED = ["nZPmoHfSeUC", "jKHwdEjRlIS", "pXWOFocknQI", "EmKikmszGZt", "ZSOVcNklQQD", "JPeLlhJaNZA", "ByepmUWUSto", "aNqSsIuEhew", "psfmutERnus", "WBBflLfHdmZ", "HLEWYKRRfbS", "IbyENeKbWQN", "lRMRDruerGC", "wZhVQVuzoiY", "vlQTKXAFaQJ", "LqdxVMrRsvd", "aWxnmvXetXj", "NfnQBYUNEJi", "RMhisQRIILV", "mfmJGXewzZS", "gulzMrfxlys", "obAxLRKfyfD", "iHLHlUnBKuR", "exeuUXoZjJu", "rCrYzwDqJKN", "zTThiCwRlmj", "vUcuwxmpJEv", "YcuYZrzZSxO", "TIdkvUOhShS", "utoLoCOmSSU", "ikScaiguXJd", "pKawZYGwQEK", "gbvvhJoIMPb", "XAmXtkbEikC", "awgBrgJzlux", "ftdSQMvLQya", "JtzCEgHkptg", "vWPELjbhCfE", "QfMvCFTbqJX", "YpTXfAlWNAJ", "ksjOpRaWvnv", "AVLygaMZnvQ", "xUdRSsSpoFw", "zgcJRJSulNR", "zWbeZcsjuQw", "jfSbTYQJwhj", "bdBlGDLGZWo", "mGoNIziJImN", "IyJVWUNlQaO", "YIczuqnjVYe", "IApOKkPNmMK", "kcMgoYXBtAM", "ICxnqSJEPJy", "cgyCnAKqPer", "RQaRciRhLzs", "rOQAIKRFiKA", "iEAQFEsejVr", "oRvjfhzrgOG", "gSNzBaLJtnb", "LFLZbhQzqZq", "SsUMkcRjApL", "CWXvDvRuipN", "RZyUiuxnLxD", "yhaVXPsjnWw", "LsjhuuTmlNs", "nikUIvbhJmn", "mcQTdIRErjo", "JpAVKVimvRw", "ToAYLSYnbKV", "khJIgruOVek", "jRnlxbUxzCh", "tjwzSrDQKyt", "MOBCdBLDzbB", "wjYGpChVYhN", "kjDMzolrGqb", "LDYmrBnarzK", "SGUNRXkkaGe", "OKFwibUhsrX", "iuaqVvDiQCf", "fPOOQTntgvo", "PWTnhWbKEex", "IkZqIwPpimX", "DopVKuSUSoc", "TutTPlMSsyT", "QrHlcoivaYI", "zndOJYDgbUW", "deBNECSQzQu", "zNrEGmauebQ", "HfbXjHiifTM", "UPQlJKQJjTH", "DHYyyvQAPrz", "LTfECMcPhjW", "YVHFsAnadDQ", "OHKpzumNmYO", "MkSDLeOIYlo", "yeyTdVhbEzy", "zkOjFmPNobg", "hVJVXfeDgvg", "OWNntvWJwYL", "ARppTxpsFne", "OSsbmVyeQSP", "zZSpLpREIKe", "HfakVHQUtkM", "ihnnhpKCGgP", "VGRvDrBfDYN", "GDXPliLPgHY", "wfZPjXGTJWZ", "xzSspjSEuez", "sBpJLoiaTAM", "OvxKeNhiQtj", "HgUvdbJeFiF", "HfmOtNaULlo", "EsnwKqeAmVj", "OSaSQDqpTbu", "cfXgEytHHdf", "XoCdFtHbGgZ", "wccFPrBCBzH", "rlDgSYpgYBR", "WWmLyTCKWlm", "JjRnFafCaGA", "QNTaOnyTaAs", "qMgYfeBgNsv", "DRnjHCaTPen", "MsQovUBtOjg", "XwVeXTZFSLn", "HEVPaITMTBI", "YDRUtHRygsI", "YGyFVEMjVBS", "CLpmcPPiNHa", "UGnrwHMekDl", "UBcjtTHJGaP", "RGRmWiHjFnz", "IXprbrsAODn", "FSPhraPyoEz", "IigtGSQQNeT", "gAAiYyaLUpD", "oMdUqlaABud", "mqQfIbxkNgX", "LKQIqKWHokE", "nSzokgExdge", "WXpGsdRUTWM", "tgPhkOmYadN", "bvyfQiWoWgF", "GdKtEkRVrDR", "eRLNUFyXdIm", "LXSEEFdLaFx", "tnIQRPszINu", "DRfeZLjLRdm", "zRbscpESgEA", "WtifPfMFdIx", "iLUwCPEPcxt", "OrZTchmvOqx", "OtCVyBsFpaQ", "jdIAqppFgqx", "AdoWvDKyNrK", "gUUxnMUdCgn", "bWJyTEVxAaV", "XnpebzcELlg", "AvASEaGCfcJ", "vwqgMFBLOsL", "CoubrdKitQG", "xBmgCyoSVCC", "GiNLJDsydnC", "OcTUkHAhxeo", "lMFIkYqQvEd", "ZSGsGuBfgia", "VUiRgtHgxGX", "OtVeZwoOCfK", "nIKovBLLHyf", "IQoReemTKPd", "hLYuOSxpOeJ", "rvqWrBKkddR", "AnpjLFVMytd", "gSwUdTMAJGc", "pGydQxnsdpN", "PegWRYvzvzE", "VPqVBAbuPrp", "LuHUtMnxEIQ", "yacCbqghfYZ", "KKVJrChoPUk", "RtuBiFTKbyM", "nYiQtJGCtae", "wTwsoBlCVQK", "eKVEhdyzomZ", "tnaGSaLaONI", "ygzzGnXUwcd", "lgLoYFgOJON", "yMYVXKIJdVo", "ihGpEhxoEDH"];   // 189 renamed il2cpp exports, ascending address order
var DANGER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 21, 22, 23, 24, 35, 36, 37, 62, 73, 74, 78, 79, 81, 82, 83, 84, 92, 93, 95, 96, 97, 98, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 139, 140, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 184, 185, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 203, 213, 214, 215, 216, 217, 218, 219, 221, 222, 223, 224, 225, 226, 227, 228, 229, 232];   // ref-order (234) indices that must never be blindly called

var mod = null, ADDR = null, corlib = null;
var F = {};

function nf(i, ret, args) { return new NativeFunction(ADDR[i], ret, args); }
function readStr(p) { if (p == null || p.isNull()) return null; try { return p.readCString(); } catch (e) { return null; } }
function isIdent(s) { return typeof s === 'string' && s.length > 0 && s.length < 256 && /^[A-Za-z_<][\w.`<>\[\],|+ ]*$/.test(s); }
function have(n) { return F[n] !== undefined && F[n] >= 0; }

var G2R = 234.0 / SORTED.length;        // gilla index -> approx ref index
var R2G = SORTED.length / 234.0;        // ref index  -> approx gilla index
function estIdx(refIdx) { return Math.round(refIdx * R2G); }
var DSET = {}; for (var _d = 0; _d < DANGER.length; _d++) DSET[DANGER[_d]] = 1;
function isDanger(gi) {
  var r = Math.round(gi * G2R);
  for (var k = -2; k <= 2; k++) if (DSET[r + k]) return true;
  return false;
}
function findFn(refIdx, test, margin) {
  margin = margin == null ? 20 : margin;
  var est = estIdx(refIdx);
  var lo = Math.max(3, est - margin), hi = Math.min(SORTED.length - 1, est + margin);
  var order = [];
  for (var d = 0; d <= margin; d++) {
    if (est + d <= hi) order.push(est + d);
    if (d > 0 && est - d >= lo) order.push(est - d);
  }
  for (var k = 0; k < order.length; k++) {
    var i = order[k];
    if (isDanger(i)) continue;          // never call side-effecting / blocking exports
    try { if (test(i)) return i; } catch (e) {}
  }
  return -1;
}

// init gate: gilla index 11 is get_corlib (verified via old map). Probe 11/12/13 only.
function findCorlib() {
  var cands = [11, 12, 13];
  for (var c = 0; c < cands.length; c++) {
    var i = cands[c];
    try {
      var p = nf(i, 'pointer', [])();
      if (p.isNull()) continue;
      for (var off = 0; off <= 8; off += 8) {
        var s = readStr(p.add(off).readPointer());
        if (s && s.toLowerCase().indexOf('mscorlib') === 0) { corlib = p; F.get_corlib = i; return true; }
      }
    } catch (e) {}
  }
  return false;
}


function searchFn(hintRef, test) {
  var est = (hintRef != null) ? estIdx(hintRef) : (SORTED.length >> 1);
  var order = [];
  for (var d = 0; d < SORTED.length; d++) { if (est + d < SORTED.length) order.push(est + d); if (d > 0 && est - d >= 0) order.push(est - d); }
  for (var k = 0; k < order.length; k++) { var i = order[k]; if (i < 3 || isDanger(i)) continue; try { if (test(i)) return i; } catch (e) {} }
  return -1;
}
function looksPtr(p) { try { return p != null && !p.isNull() && p.compare(ptr('0x100000')) > 0; } catch (e) { return false; } }

function looksPtr(p) { try { return p != null && !p.isNull() && p.compare(ptr('0x100000')) > 0; } catch (e) { return false; } }
function readStrAt(p) { if (!looksPtr(p)) return null; try { return p.readCString(); } catch (e) { return null; } }
function calibrateAndDump() {
  console.log('[cal] get_corlib -> ' + F.get_corlib + ' corlib=' + corlib);

  // detect image_get_class accessor: most distinct valid class ptrs over (corlib,0..23)
  var accGi = -1, accBest = 0, accKs = null;
  for (var i = 3; i < SORTED.length; i++) {
    if (isDanger(i)) continue;
    try {
      var gc = nf(i, 'pointer', ['pointer', 'uint32']), v = [], seen = {};
      for (var z = 0; z < 24; z++) { var k = gc(corlib, z); if (looksPtr(k)) { v.push(k); seen[k.toString()] = 1; } }
      var dd = Object.keys(seen).length;
      if (v.length >= 14 && dd > accBest) { accBest = dd; accGi = i; accKs = v; }
    } catch (e) {}
  }
  console.log('[cal] image_get_class=' + accGi + ' distinct=' + accBest);
  if (accGi < 0) { send({ error: 'no accessor' }); return; }
  F.image_get_class = accGi;
  var getClass = nf(accGi, 'pointer', ['pointer', 'uint32']);

  // gather ~12 corlib classes
  var ks = [];
  for (var c = 0; c < 400 && ks.length < 12; c++) { var k = getClass(corlib, c); if (looksPtr(k)) ks.push(k); }
  console.log('[cal] got ' + ks.length + ' class ptrs; k0=' + ks[0]);

  // STRUCT SCAN: for each 8-byte offset, classify across the 12 classes.
  // string offset = ptr to readable C-ident at same offset for all; int offset = small int.
  var MAXOFF = 0x200;
  var strOffs = [], intOffs = [];
  for (var off = 0; off < MAXOFF; off += PS) {
    var allStr = true, names = {}, strBad = 0;
    var allInt = true, ints = {};
    for (var x = 0; x < ks.length; x++) {
      var raw;
      try { raw = ks[x].add(off).readPointer(); } catch (e) { allStr = false; allInt = false; break; }
      var s = readStrAt(raw);
      if (s !== null && /^[A-Za-z_<][\w.`<>]*$/.test(s) && s.length < 80) { names[s] = 1; } else { strBad++; }
      // int view
      var iv;
      try { iv = ks[x].add(off).readU32(); } catch (e) { iv = -1; }
      if (iv >= 0 && iv < 65536) ints[iv] = 1; else allInt = false;
    }
    if (strBad <= 2 && Object.keys(names).length >= 6) strOffs.push('0x' + off.toString(16) + '(' + Object.keys(names).length + ')=' + JSON.stringify(Object.keys(names).slice(0, 3)));
    if (allInt && Object.keys(ints).length >= 4) intOffs.push('0x' + off.toString(16) + '=' + JSON.stringify(Object.keys(ints).slice(0, 6)));
  }
  console.log('[cal] STRING offsets (name/namespace candidates):');
  for (var a = 0; a < strOffs.length; a++) console.log('[diag]   str ' + strOffs[a]);
  console.log('[cal] INT offsets (count candidates):');
  for (var b = 0; b < intOffs.length; b++) console.log('[diag]   int ' + intOffs[b]);

  // also: for k0 dump pointer-valued offsets that point into mapped mem (fields/methods arrays)
  var ptrOffs = [];
  for (var off2 = 0; off2 < MAXOFF; off2 += PS) {
    try { var p = ks[0].add(off2).readPointer(); if (looksPtr(p)) { var inner = null; try { inner = p.readPointer(); } catch (e) {} ptrOffs.push('0x' + off2.toString(16) + '->' + p + (looksPtr(inner) ? '(->ptr)' : '')); } } catch (e) {}
  }
  console.log('[diag] k0 ptr offsets: ' + ptrOffs.join(' '));

  send({ error: 'struct-scan diagnostic complete', image_get_class: accGi });
}

// ---- bootstrap: wait for module + il2cpp init, then calibrate once ----
var tries = 0;
var timer = setInterval(function () {
  tries++;
  if (mod == null) {
    mod = Process.findModuleByName(MOD);
    if (mod == null) { if (tries > 240) { clearInterval(timer); send({ error: 'module never loaded' }); } return; }
    ADDR = SORTED.map(function (n) { return mod.findExportByName(n); });
    console.log('[cal] module loaded base=' + mod.base);
  }
  try {
    if (findCorlib()) {
      clearInterval(timer);
      console.log('[cal] il2cpp ready after ' + tries + ' ticks; calibrating');
      try { calibrateAndDump(); } catch (e) { send({ error: 'dump threw: ' + e + '\n' + (e.stack || '') }); }
    } else if (tries > 240) { clearInterval(timer); send({ error: 'corlib not found (init?)', F: F }); }
    else if (tries % 10 === 0) console.log('[cal] waiting for il2cpp init... (' + tries + ')');
  } catch (e) {}
}, 500);
