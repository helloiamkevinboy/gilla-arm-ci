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
function looksPtr(p) { try { return p != null && !p.isNull() && p.compare(ptr('0x100000')) > 0 && p.compare(ptr('0x1000000000000')) < 0; } catch (e) { return false; } }
function inModule(p) { try { return p.compare(mod.base) >= 0 && p.compare(mod.base.add(mod.size)) < 0; } catch (e) { return false; } }
function rdId(p) { if (!looksPtr(p)) return null; try { var s = p.readCString(); if (s && s.length > 0 && s.length < 200 && /^[A-Za-z_<][\x20-\x7e]*$/.test(s)) return s; } catch (e) {} return null; }
function calibrateAndDump() {
  var base = mod.base;
  console.log('[cal] corlib=' + corlib + ' base=' + base);
  var accGi = -1, accBest = 0;
  for (var i = 3; i < SORTED.length; i++) { if (isDanger(i)) continue; try { var gc = nf(i, 'pointer', ['pointer', 'uint32']), seen = {}, vv = 0; for (var z = 0; z < 24; z++) { var k = gc(corlib, z); if (looksPtr(k)) { vv++; seen[k.toString()] = 1; } } if (vv >= 14 && Object.keys(seen).length > accBest) { accBest = Object.keys(seen).length; accGi = i; } } catch (e) {} }
  var getClass = nf(accGi, 'pointer', ['pointer', 'uint32']);
  console.log('[cal] image_get_class=' + accGi);

  // ---- enumerate images: contiguous array, stride 0x48, name char* @+8, typeCount u32 @+0x18 ----
  var STRIDE = 0x48;
  function imgName(img) { var s = rdId(img.add(8)); return s; }
  function imgOk(img) { var n = imgName(img); if (!n) return false; var tc = img.add(0x18).readU32(); return tc > 0 && tc < 200000; }
  var startImg = corlib;
  for (var b = 0; b < 300; b++) { var prev = startImg.sub(STRIDE); if (imgOk(prev)) startImg = prev; else break; }
  var images = [];
  for (var f = 0; f < 600; f++) { var img = startImg.add(f * STRIDE); if (!imgOk(img)) { if (f === 0) continue; else break; } images.push(img); }
  console.log('[cal] images=' + images.length + ': ' + images.map(function (x) { return imgName(x) + '(' + x.add(0x18).readU32() + ')'; }).slice(0, 40).join(' '));

  // ---- sample classes to discover offsets ----
  var ks = [];
  for (var c = 0; c < 4000 && ks.length < 60; c++) { var k = getClass(corlib, c); if (looksPtr(k)) ks.push(k); }

  // methods array: class off P where *P = MethodInfo*[]; MethodInfo+0x0=CODE, +0x10=name char*
  function isMethodInfo(mi) { try { return inModule(mi.add(0).readPointer()) && rdId(mi.add(0x10)) !== null; } catch (e) { return false; } }
  var mArrOff = -1, mCntOff = -1;
  for (var po = 0x40; po <= 0x140 && mArrOff < 0; po += PS) {
    var good = 0;
    for (var x = 0; x < ks.length; x++) { try { var arr = ks[x].add(po).readPointer(); if (looksPtr(arr)) { var mi = arr.readPointer(); if (looksPtr(mi) && isMethodInfo(mi)) good++; } } catch (e) {} }
    if (good >= 25) {
      mArrOff = po;
      // count: a u16 offset whose value equals how many consecutive arr entries are MethodInfo
      for (var co = 0x40; co <= 0x160; co += 2) {
        var okc = 0;
        for (var x2 = 0; x2 < ks.length; x2++) { try { var arr2 = ks[x2].add(po).readPointer(); var cnt = ks[x2].add(co).readU16(); if (looksPtr(arr2) && cnt > 0 && cnt < 4000) { var last = arr2.add((cnt - 1) * PS).readPointer(); var nxt = arr2.add(cnt * PS).readPointer(); if (looksPtr(last) && isMethodInfo(last.readPointer ? last : last)) okc++; } } catch (e) {} }
        if (okc >= 20) { mCntOff = co; break; }
      }
      break;
    }
  }
  console.log('[cal] methods arrOff=0x' + (mArrOff < 0 ? -1 : mArrOff.toString(16)) + ' cntOff=0x' + (mCntOff < 0 ? -1 : mCntOff.toString(16)));

  // fields array: class off whose ptr -> FieldInfo[] (struct stride ~0x20); FieldInfo+0x0=name char*
  var fArrOff = -1, fCntOff = -1, FSTRIDE = 0x20;
  for (var fo = 0x40; fo <= 0x140 && fArrOff < 0; fo += PS) {
    var g2 = 0;
    for (var x3 = 0; x3 < ks.length; x3++) { try { var fa = ks[x3].add(fo).readPointer(); if (looksPtr(fa) && rdId(fa.add(0)) !== null && rdId(fa.add(FSTRIDE)) !== null) g2++; } catch (e) {} }
    if (g2 >= 15) { fArrOff = fo; break; }
  }
  if (fArrOff >= 0) { for (var fco = 0x40; fco <= 0x160; fco += 2) { var okf = 0; for (var x4 = 0; x4 < ks.length; x4++) { try { var fa2 = ks[x4].add(fArrOff).readPointer(); var fc = ks[x4].add(fco).readU16(); if (looksPtr(fa2) && fc >= 0 && fc < 2000) { if (fc === 0 || rdId(fa2.add((fc - 1) * FSTRIDE)) !== null) okf++; } } catch (e) {} } if (okf >= ks.length - 5) { fCntOff = fco; break; } } }
  console.log('[cal] fields arrOff=0x' + (fArrOff < 0 ? -1 : fArrOff.toString(16)) + ' cntOff=0x' + (fCntOff < 0 ? -1 : fCntOff.toString(16)));

  // class name: scan for a direct char* ident offset (may be absent -> use index)
  var nameOff = -1;
  for (var no = 0; no <= 0x40; no += PS) { var nn = {}, bad = 0; for (var x5 = 0; x5 < ks.length; x5++) { var s = rdId(ks[x5].add(no).readPointer()); if (s) nn[s] = 1; else bad++; } if (bad <= 5 && Object.keys(nn).length >= 30) { nameOff = no; break; } }
  console.log('[cal] class nameOff=0x' + (nameOff < 0 ? -1 : nameOff.toString(16)));

  if (mArrOff < 0) { send({ error: 'methods array not found', images: images.length }); return; }

  // ---- DUMP ----
  var outPath = '/data/data/com.playgilla.gilla/gilla_dump.cs';
  var file = new File(outPath, 'w');
  file.write('// IL2CPP struct-dump base=' + base + '\n// methods arr@0x' + mArrOff.toString(16) + ' cnt@0x' + (mCntOff < 0 ? -1 : mCntOff.toString(16)) + ' fields arr@0x' + (fArrOff < 0 ? -1 : fArrOff.toString(16)) + ' cnt@0x' + (fCntOff < 0 ? -1 : fCntOff.toString(16)) + ' nameOff@0x' + (nameOff < 0 ? -1 : nameOff.toString(16)) + '\n');
  var nC = 0, nM = 0;
  for (var ii = 0; ii < images.length; ii++) {
    var img = images[ii]; var inm = imgName(img); var tc = img.add(0x18).readU32();
    file.write('\n// Image: ' + inm + ' (' + tc + ' types)\n');
    for (var ti = 0; ti < tc; ti++) {
      var klass; try { klass = getClass(img, ti); } catch (e) { continue; }
      if (!looksPtr(klass)) continue;
      nC++;
      var cn = (nameOff >= 0 ? (rdId(klass.add(nameOff).readPointer()) || ('Class_' + ti)) : ('Class_' + ti));
      file.write('class ' + cn + ' { // 0x' + klass.sub(base).toString(16) + '\n');
      if (fArrOff >= 0 && fCntOff >= 0) {
        try { var fa = klass.add(fArrOff).readPointer(); var fc = klass.add(fCntOff).readU16(); if (looksPtr(fa) && fc < 2000) { for (var fi = 0; fi < fc; fi++) { var fld = fa.add(fi * FSTRIDE); var fn = rdId(fld.add(0)) || '?'; var foff = fld.add(0x18).readU32(); file.write('    field ' + fn + '; // offset 0x' + foff.toString(16) + '\n'); } } } catch (e) {}
      }
      try {
        var marr = klass.add(mArrOff).readPointer(); var mc = mCntOff >= 0 ? klass.add(mCntOff).readU16() : 0;
        if (looksPtr(marr) && mc > 0 && mc < 4000) {
          for (var mi2 = 0; mi2 < mc; mi2++) {
            var m = marr.add(mi2 * PS).readPointer(); if (!looksPtr(m)) continue; nM++;
            var mn = rdId(m.add(0x10)) || '?'; var mp = m.add(0).readPointer(); var rva = inModule(mp) ? mp.sub(base).toString(16) : '?';
            file.write('    method ' + mn + '(); // RVA 0x' + rva + '\n');
          }
        }
      } catch (e) {}
      file.write('}\n');
    }
  }
  file.flush(); file.close();
  console.log('[+] dumped ' + nC + ' classes, ' + nM + ' methods -> ' + outPath);
  send({ dumped: true, path: outPath, classes: nC, methods: nM, images: images.length });
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
