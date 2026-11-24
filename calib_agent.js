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

function calibrateAndDump() {
  console.log('[cal] get_corlib -> ' + F.get_corlib + ' corlib=' + corlib);

  F.image_get_class_count = searchFn(211, function (i) { var n = nf(i, 'int', ['pointer'])(corlib); return n > 100 && n < 2000000; });
  var imgCount = have('image_get_class_count') ? nf(F.image_get_class_count, 'int', ['pointer']) : null;
  var nCorlib = imgCount ? imgCount(corlib) : -1;
  console.log('[cal] image_get_class_count -> ' + F.image_get_class_count + ' corlib classes=' + nCorlib);

  // image_get_class + class_get_name jointly, FULL RANGE (export order is NOT canonical)
  var bestGi = -1, bestNj = -1, bestD = 0;
  for (var gi = 3; gi < SORTED.length; gi++) {
    if (isDanger(gi)) continue;
    var gc = nf(gi, 'pointer', ['pointer', 'uint32']), ks = [], ok = true;
    for (var z = 0; z < 16; z++) { var k; try { k = gc(corlib, z); } catch (e) { ok = false; break; } if (!looksPtr(k)) { ok = false; break; } ks.push(k); }
    if (!ok) continue;
    var dp = {}; for (var y = 0; y < ks.length; y++) dp[ks[y].toString()] = 1;
    if (Object.keys(dp).length < 12) continue;
    for (var nj = 3; nj < SORTED.length; nj++) {
      if (isDanger(nj)) continue;
      try {
        var f = nf(nj, 'pointer', ['pointer']), names = {}, bad = 0;
        for (var y2 = 0; y2 < ks.length; y2++) { var s = readStr(f(ks[y2])); if (!isIdent(s)) { bad++; continue; } names[s] = 1; }
        var d = Object.keys(names).length;
        if (d >= 10 && bad <= 2 && d > bestD) { bestD = d; bestGi = gi; bestNj = nj; console.log('[cal] pair gi=' + gi + ' nj=' + nj + ' distinct=' + d + ' eg=' + JSON.stringify(Object.keys(names).slice(0, 4))); }
      } catch (e) {}
    }
  }
  if (bestGi < 0) { send({ error: 'no image_get_class/class_get_name pair', F: F }); return; }
  F.image_get_class = bestGi; F.class_get_name = bestNj;
  var getClass = nf(F.image_get_class, 'pointer', ['pointer', 'uint32']);
  var className = nf(F.class_get_name, 'pointer', ['pointer']);
  console.log('[cal] image_get_class -> ' + bestGi + ' class_get_name -> ' + bestNj + ' distinct=' + bestD);

  var sample = [];
  var lim = (nCorlib > 0 ? Math.min(nCorlib, 3000) : 2000);
  for (var ci = 0; ci < lim && sample.length < 150; ci++) { var kk = getClass(corlib, ci); if (looksPtr(kk)) sample.push(kk); }

  // class_get_image: for corlib classes it returns the corlib image pointer
  F.class_get_image = searchFn(68, function (i) { var im = nf(i, 'pointer', ['pointer']); var hit = 0; for (var x = 0; x < 20; x++) { try { if (im(sample[x]).equals(corlib)) hit++; } catch (e) {} } return hit >= 18; });
  F.image_get_name = searchFn(208, function (i) { var s = readStr(nf(i, 'pointer', ['pointer'])(corlib)); return s && s.toLowerCase() === 'mscorlib.dll'; });
  console.log('[cal] class_get_image -> ' + F.class_get_image + ' image_get_name -> ' + F.image_get_name);

  F.class_get_namespace = searchFn(50, function (i) {
    var f = nf(i, 'pointer', ['pointer']), ns = {}, ok2 = 0;
    for (var x = 0; x < sample.length; x++) { var s = readStr(f(sample[x])); if (s === null) return false; if (s === '' || isIdent(s)) ok2++; ns[s] = 1; }
    return ok2 === sample.length && ns['System'] === 1 && Object.keys(ns).length >= 3;
  });
  console.log('[cal] class_get_namespace -> ' + F.class_get_namespace);

  F.class_get_fields = searchFn(40, function (i) {
    var gf = nf(i, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var fld = gf(sample[x], it); if (!looksPtr(fld)) continue;
      var ni = searchFn(87, function (nj) { return isIdent(readStr(nf(nj, 'pointer', ['pointer'])(fld))); });
      if (ni >= 0) { F.field_get_name = ni; return true; }
    }
    return false;
  });
  var someField = null;
  if (have('class_get_fields')) { var gfF = nf(F.class_get_fields, 'pointer', ['pointer', 'pointer']); for (var x = 0; x < sample.length && !someField; x++) { var it = Memory.alloc(PS); it.writePointer(NULL); var fl = gfF(sample[x], it); if (looksPtr(fl)) someField = fl; } }
  if (someField) {
    F.field_get_type = searchFn(91, function (i) {
      var ty = nf(i, 'pointer', ['pointer'])(someField); if (!looksPtr(ty)) return false;
      var ni = searchFn(199, function (nj) { var s = readStr(nf(nj, 'pointer', ['pointer'])(ty)); return isIdent(s) && s.indexOf(' ') < 0; });
      if (ni >= 0) { F.type_get_name = ni; return true; } return false;
    });
  }
  console.log('[cal] class_get_fields -> ' + F.class_get_fields + ' field_get_name -> ' + F.field_get_name + ' field_get_type -> ' + F.field_get_type + ' type_get_name -> ' + F.type_get_name);

  F.class_get_methods = searchFn(46, function (i) {
    var gm = nf(i, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var m = gm(sample[x], it); if (!looksPtr(m)) continue;
      var ni = searchFn(138, function (nj) { var s = readStr(nf(nj, 'pointer', ['pointer'])(m)); return isIdent(s) || s === '.ctor' || s === '.cctor'; });
      if (ni >= 0) { F.method_get_name = ni; return true; }
    }
    return false;
  });
  var someMethod = null;
  if (have('class_get_methods')) { var gmF = nf(F.class_get_methods, 'pointer', ['pointer', 'pointer']); for (var x = 0; x < sample.length && !someMethod; x++) { var it = Memory.alloc(PS); it.writePointer(NULL); var mm = gmF(sample[x], it); if (looksPtr(mm)) someMethod = mm; } }
  if (someMethod && have('type_get_name')) {
    var tn = nf(F.type_get_name, 'pointer', ['pointer']);
    F.method_get_return_type = searchFn(136, function (i) { var ty = nf(i, 'pointer', ['pointer'])(someMethod); return looksPtr(ty) && isIdent(readStr(tn(ty)) || ''); });
    F.method_get_param_count = searchFn(144, function (i) { var n = nf(i, 'int', ['pointer'])(someMethod); return n >= 0 && n < 100; });
    F.method_get_param = searchFn(145, function (i) { var pc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer'])(someMethod) : 0; if (pc <= 0) return false; var ty = nf(i, 'pointer', ['pointer', 'uint32'])(someMethod, 0); return looksPtr(ty) && isIdent(readStr(tn(ty)) || ''); });
    F.method_get_param_name = searchFn(150, function (i) { var pc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer'])(someMethod) : 0; if (pc <= 0) return false; return isIdent(readStr(nf(i, 'pointer', ['pointer', 'uint32'])(someMethod, 0))); });
  }
  console.log('[cal] class_get_methods -> ' + F.class_get_methods + ' method_get_name -> ' + F.method_get_name + ' ret/pc/param/pname -> ' + F.method_get_return_type + '/' + F.method_get_param_count + '/' + F.method_get_param + '/' + F.method_get_param_name);

  // enumerate ALL classes via il2cpp_class_for_each
  var all = [], cbCount = 0;
  var cb = new NativeCallback(function (klass, user) { cbCount++; if (looksPtr(klass) && all.length < 400000) all.push(klass); }, 'void', ['pointer', 'pointer']);
  F.class_for_each = searchFn(27, function (i) {
    all.length = 0; cbCount = 0;
    try { nf(i, 'void', ['pointer', 'pointer'])(cb, NULL); } catch (e) { return false; }
    if (cbCount < 50) return false;
    var good = 0, t = Math.min(all.length, 20);
    for (var x = 0; x < t; x++) if (isIdent(readStr(className(all[x])))) good++;
    return good >= t * 0.7;
  });
  console.log('[cal] class_for_each -> ' + F.class_for_each + ' total classes=' + all.length);

  var need = ['class_get_name', 'class_get_methods', 'method_get_name'];
  for (var q = 0; q < need.length; q++) if (!have(need[q])) { send({ error: 'incomplete: ' + need[q], F: F }); return; }
  if (!have('class_for_each') || all.length === 0) { console.log('[cal] class_for_each unavailable; corlib only'); all.length = 0; for (var ci2 = 0; ci2 < nCorlib; ci2++) { var k2 = getClass(corlib, ci2); if (looksPtr(k2)) all.push(k2); } }

  // ---- dump ----
  var clsNs = have('class_get_namespace') ? nf(F.class_get_namespace, 'pointer', ['pointer']) : null;
  var clsImg = have('class_get_image') ? nf(F.class_get_image, 'pointer', ['pointer']) : null;
  var imgName = have('image_get_name') ? nf(F.image_get_name, 'pointer', ['pointer']) : null;
  var clsFields = have('class_get_fields') ? nf(F.class_get_fields, 'pointer', ['pointer', 'pointer']) : null;
  var fldName = have('field_get_name') ? nf(F.field_get_name, 'pointer', ['pointer']) : null;
  var fldType = have('field_get_type') ? nf(F.field_get_type, 'pointer', ['pointer']) : null;
  var tyName = have('type_get_name') ? nf(F.type_get_name, 'pointer', ['pointer']) : null;
  var clsMethods = nf(F.class_get_methods, 'pointer', ['pointer', 'pointer']);
  var mName = nf(F.method_get_name, 'pointer', ['pointer']);
  var mRet = have('method_get_return_type') ? nf(F.method_get_return_type, 'pointer', ['pointer']) : null;
  var mPc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer']) : null;
  var mParam = have('method_get_param') ? nf(F.method_get_param, 'pointer', ['pointer', 'uint32']) : null;
  var mPName = have('method_get_param_name') ? nf(F.method_get_param_name, 'pointer', ['pointer', 'uint32']) : null;

  var outPath = '/data/data/com.playgilla.gilla/gilla_dump.cs';
  var file = new File(outPath, 'w');
  file.write('// IL2CPP dump (self-calibrated) base=' + mod.base + '\n// calibrated: ' + JSON.stringify(F) + '\n// classes=' + all.length + '\n');

  var nC = 0, nM = 0, lastImg = null;
  for (var a = 0; a < all.length; a++) {
    var klass = all[a]; if (!looksPtr(klass)) continue; nC++;
    if (clsImg && imgName) { var inm = readStr(imgName(clsImg(klass))); if (inm && inm !== lastImg) { file.write('\n// Image: ' + inm + '\n'); lastImg = inm; } }
    var kn = readStr(className(klass)) || '?';
    var ns = clsNs ? (readStr(clsNs(klass)) || '') : '';
    file.write((ns ? 'namespace ' + ns + ' { ' : '') + 'class ' + kn + ' {\n');
    if (clsFields && fldName) {
      var fit = Memory.alloc(PS); fit.writePointer(NULL); var fld;
      while (looksPtr(fld = clsFields(klass, fit))) {
        var ftn = (fldType && tyName) ? (readStr(tyName(fldType(fld))) || 'var') : 'var';
        file.write('    ' + ftn + ' ' + (readStr(fldName(fld)) || '?') + ';\n');
      }
    }
    var mit = Memory.alloc(PS); mit.writePointer(NULL); var m;
    while (looksPtr(m = clsMethods(klass, mit))) {
      nM++;
      var rt = (mRet && tyName) ? (readStr(tyName(mRet(m))) || 'void') : 'void';
      var pss = '';
      if (mPc) { var pc = mPc(m), parts = []; for (var p = 0; p < pc; p++) { var ptn = (mParam && tyName) ? (readStr(tyName(mParam(m, p))) || 'var') : 'arg'; var pn = mPName ? (readStr(mPName(m, p)) || ('a' + p)) : ('a' + p); parts.push(ptn + ' ' + pn); } pss = parts.join(', '); }
      var rva = '';
      try { var mp = m.readPointer(); if (!mp.isNull()) rva = ' // RVA 0x' + mp.sub(mod.base).toString(16); } catch (e) {}
      file.write('    ' + rt + ' ' + (readStr(mName(m)) || '?') + '(' + pss + ');' + rva + '\n');
    }
    file.write('}' + (ns ? ' }' : '') + '\n');
  }
  file.flush(); file.close();
  console.log('[+] dumped ' + nC + ' classes, ' + nM + ' methods -> ' + outPath);
  send({ dumped: true, path: outPath, classes: nC, methods: nM, F: F });
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
