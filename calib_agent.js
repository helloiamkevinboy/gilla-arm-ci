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

function calibrateAndDump() {
  console.log('[cal] get_corlib -> ' + F.get_corlib + ' (' + SORTED[F.get_corlib] + ') corlib=' + corlib);

  F.image_get_class_count = findFn(211, function (i) { var n = nf(i, 'int', ['pointer'])(corlib); return n > 50 && n < 500000; });
  var nCorlib = have('image_get_class_count') ? nf(F.image_get_class_count, 'int', ['pointer'])(corlib) : -1;
  console.log('[cal] image_get_class_count -> ' + F.image_get_class_count + ' corlib classes=' + nCorlib);
  if (!have('image_get_class_count')) { send({ error: 'calib fail: image_get_class_count', F: F }); return; }
  var imgCount = nf(F.image_get_class_count, 'int', ['pointer']);

  // image_get_class is the next DO_API after image_get_class_count; try count+1 first,
  // then nearby. Validate jointly with class_get_name, picking the name fn that yields
  // the MOST distinct readable names (rejects constant image/assembly-name fns).
  function tryImageGetClass(gi) {
    var gc = nf(gi, 'pointer', ['pointer', 'uint32']);
    var ks = [];
    for (var z = 0; z < 24; z++) { var k; try { k = gc(corlib, z); } catch (e) { return false; } if (k.isNull()) return false; ks.push(k); }
    // scan class_get_name candidates, log distinct counts, keep the best
    var est = estIdx(48), bestNi = -1, bestD = 0;
    for (var nj = est - 12; nj <= est + 12; nj++) {
      if (nj < 3 || nj >= SORTED.length || isDanger(nj)) continue;
      try {
        var f = nf(nj, 'pointer', ['pointer']), names = {}, bad = 0;
        for (var y = 0; y < ks.length; y++) { var s = readStr(f(ks[y])); if (!isIdent(s)) { bad++; continue; } names[s] = 1; }
        var d = Object.keys(names).length;
        if (d >= 6) console.log('[cal]   namecand gi=' + gi + ' nj=' + nj + ' distinct=' + d + ' bad=' + bad + ' eg=' + JSON.stringify(Object.keys(names).slice(0, 5)));
        if (bad <= 4 && d > bestD) { bestD = d; bestNi = nj; }
      } catch (e) {}
    }
    if (bestNi >= 0 && bestD >= 10) { F.class_get_name = bestNi; return true; }
    return false;
  }
  var igcCandidates = [F.image_get_class_count + 1, F.image_get_class_count + 2, F.image_get_class_count - 1, estIdx(212)];
  for (var gci = 0; gci < igcCandidates.length; gci++) {
    var gi = igcCandidates[gci];
    if (gi < 3 || gi >= SORTED.length || isDanger(gi)) continue;
    if (tryImageGetClass(gi)) { F.image_get_class = gi; break; }
  }
  if (!have('image_get_class')) F.image_get_class = -1;
  console.log('[cal] image_get_class -> ' + F.image_get_class + ' class_get_name -> ' + F.class_get_name);
  if (!have('image_get_class') || !have('class_get_name')) { send({ error: 'calib fail: class enum', F: F }); return; }
  if (!have('image_get_class') || !have('class_get_name')) { send({ error: 'calib fail: class enum', F: F }); return; }
  var getClass = nf(F.image_get_class, 'pointer', ['pointer', 'uint32']);
  var className = nf(F.class_get_name, 'pointer', ['pointer']);

  // sample corlib classes to validate the remaining getters
  var sample = [];
  for (var ci = 0; ci < Math.min(nCorlib, 800) && sample.length < 120; ci++) {
    var k = getClass(corlib, ci);
    if (!k.isNull()) sample.push(k);
  }
  console.log('[cal] sample: ' + sample.slice(0, 10).map(function (k) { return readStr(className(k)); }).join(', '));

  F.class_get_namespace = findFn(50, function (i) {
    var f = nf(i, 'pointer', ['pointer']), ok = 0, sys = 0;
    for (var x = 0; x < sample.length; x++) {
      var s = readStr(f(sample[x]));
      if (s === null) return false;
      if (s === '' || isIdent(s)) ok++;
      if (s === 'System') sys++;
    }
    return ok === sample.length && sys > 2;
  });
  console.log('[cal] class_get_namespace -> ' + F.class_get_namespace);

  F.image_get_name = findFn(208, function (i) { var s = readStr(nf(i, 'pointer', ['pointer'])(corlib)); return s && s.toLowerCase() === 'mscorlib.dll'; });
  F.class_get_image = findFn(68, function (i) {
    var im = nf(i, 'pointer', ['pointer'])(sample[0]);
    if (im.isNull()) return false;
    if (!have('image_get_name')) return imgCount(im) > 0 && imgCount(im) < 500000;
    return readStr(nf(F.image_get_name, 'pointer', ['pointer'])(im)) === 'mscorlib.dll';
  });
  console.log('[cal] image_get_name -> ' + F.image_get_name + ' class_get_image -> ' + F.class_get_image);

  // fields
  F.class_get_fields = findFn(40, function (fi) {
    var gf = nf(fi, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var fld = gf(sample[x], it);
      if (fld.isNull()) continue;
      var ni = findFn(87, function (nj) { return isIdent(readStr(nf(nj, 'pointer', ['pointer'])(fld))); });
      if (ni >= 0) { F.field_get_name = ni; return true; }
    }
    return false;
  });
  var someField = null;
  if (have('class_get_fields')) {
    var gfF = nf(F.class_get_fields, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length && !someField; x++) { var it = Memory.alloc(PS); it.writePointer(NULL); var fl = gfF(sample[x], it); if (!fl.isNull()) someField = fl; }
  }
  if (someField) {
    F.field_get_type = findFn(91, function (ti) {
      var ty = nf(ti, 'pointer', ['pointer'])(someField);
      if (ty.isNull()) return false;
      var ni = findFn(199, function (nj) { var s = readStr(nf(nj, 'pointer', ['pointer'])(ty)); return isIdent(s) && s.indexOf(' ') < 0; });
      if (ni >= 0) { F.type_get_name = ni; return true; }
      return false;
    });
  }
  console.log('[cal] class_get_fields -> ' + F.class_get_fields + ' field_get_name -> ' + F.field_get_name + ' field_get_type -> ' + F.field_get_type + ' type_get_name -> ' + F.type_get_name);

  // methods
  F.class_get_methods = findFn(46, function (mi) {
    var gm = nf(mi, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var m = gm(sample[x], it);
      if (m.isNull()) continue;
      var ni = findFn(138, function (nj) { var s = readStr(nf(nj, 'pointer', ['pointer'])(m)); return isIdent(s) || s === '.ctor' || s === '.cctor'; });
      if (ni >= 0) { F.method_get_name = ni; return true; }
    }
    return false;
  });
  var someMethod = null;
  if (have('class_get_methods')) {
    var gmF = nf(F.class_get_methods, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length && !someMethod; x++) { var it = Memory.alloc(PS); it.writePointer(NULL); var mm = gmF(sample[x], it); if (!mm.isNull()) someMethod = mm; }
  }
  if (someMethod && have('type_get_name')) {
    var tn = nf(F.type_get_name, 'pointer', ['pointer']);
    F.method_get_return_type = findFn(136, function (i) { var ty = nf(i, 'pointer', ['pointer'])(someMethod); return !ty.isNull() && isIdent(readStr(tn(ty)) || ''); });
    F.method_get_param_count = findFn(144, function (i) { var n = nf(i, 'int', ['pointer'])(someMethod); return n >= 0 && n < 100; });
    F.method_get_param = findFn(145, function (i) {
      var pc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer'])(someMethod) : 0;
      if (pc <= 0) return false;
      var ty = nf(i, 'pointer', ['pointer', 'uint32'])(someMethod, 0);
      return !ty.isNull() && isIdent(readStr(tn(ty)) || '');
    });
    F.method_get_param_name = findFn(150, function (i) {
      var pc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer'])(someMethod) : 0;
      if (pc <= 0) return false;
      return isIdent(readStr(nf(i, 'pointer', ['pointer', 'uint32'])(someMethod, 0)));
    });
  }
  console.log('[cal] class_get_methods -> ' + F.class_get_methods + ' method_get_name -> ' + F.method_get_name + ' ret/pc/param/pname -> ' + F.method_get_return_type + '/' + F.method_get_param_count + '/' + F.method_get_param + '/' + F.method_get_param_name);

  // enumerate ALL classes via il2cpp_class_for_each (avoids domain/gc region)
  var all = [];
  var cbCount = 0;
  var cb = new NativeCallback(function (klass, user) { cbCount++; if (!klass.isNull() && all.length < 400000) all.push(klass); }, 'void', ['pointer', 'pointer']);
  F.class_for_each = findFn(27, function (i) {
    all.length = 0; cbCount = 0;
    try { nf(i, 'void', ['pointer', 'pointer'])(cb, NULL); } catch (e) { return false; }
    if (cbCount < 50) return false;
    var good = 0, tst = Math.min(all.length, 20);
    for (var x = 0; x < tst; x++) if (isIdent(readStr(className(all[x])))) good++;
    return good >= tst * 0.7;
  });
  console.log('[cal] class_for_each -> ' + F.class_for_each + ' total classes=' + all.length);

  var needCore = ['class_get_name', 'class_get_methods', 'method_get_name'];
  for (var q = 0; q < needCore.length; q++) if (!have(needCore[q])) { send({ error: 'calib incomplete: ' + needCore[q], F: F }); return; }

  // if class_for_each failed, fall back to corlib-only so we at least emit something
  if (!have('class_for_each') || all.length === 0) {
    console.log('[cal] class_for_each unavailable; dumping corlib only');
    all.length = 0;
    for (var ci2 = 0; ci2 < nCorlib; ci2++) { var kk = getClass(corlib, ci2); if (!kk.isNull()) all.push(kk); }
  }

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
    var klass = all[a];
    if (klass.isNull()) continue;
    nC++;
    if (clsImg && imgName) {
      var inm = readStr(imgName(clsImg(klass)));
      if (inm && inm !== lastImg) { file.write('\n// Image: ' + inm + '\n'); lastImg = inm; }
    }
    var kn = readStr(className(klass)) || '?';
    var ns = clsNs ? (readStr(clsNs(klass)) || '') : '';
    file.write((ns ? 'namespace ' + ns + ' { ' : '') + 'class ' + kn + ' {\n');
    if (clsFields && fldName) {
      var fit = Memory.alloc(PS); fit.writePointer(NULL); var fld;
      while (!(fld = clsFields(klass, fit)).isNull()) {
        var ftn = (fldType && tyName) ? (readStr(tyName(fldType(fld))) || 'var') : 'var';
        file.write('    ' + ftn + ' ' + (readStr(fldName(fld)) || '?') + ';\n');
      }
    }
    var mit = Memory.alloc(PS); mit.writePointer(NULL); var m;
    while (!(m = clsMethods(klass, mit)).isNull()) {
      nM++;
      var rt = (mRet && tyName) ? (readStr(tyName(mRet(m))) || 'void') : 'void';
      var ps = '';
      if (mPc) {
        var pc = mPc(m), parts = [];
        for (var p = 0; p < pc; p++) {
          var ptn = (mParam && tyName) ? (readStr(tyName(mParam(m, p))) || 'var') : 'arg';
          var pn = mPName ? (readStr(mPName(m, p)) || ('a' + p)) : ('a' + p);
          parts.push(ptn + ' ' + pn);
        }
        ps = parts.join(', ');
      }
      var rva = '';
      try { var mp = m.readPointer(); if (!mp.isNull()) rva = ' // RVA 0x' + mp.sub(mod.base).toString(16); } catch (e) {}
      file.write('    ' + rt + ' ' + (readStr(mName(m)) || '?') + '(' + ps + ');' + rva + '\n');
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
