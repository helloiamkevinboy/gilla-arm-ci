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
function looksPtr(p) { try { return p != null && !p.isNull() && p.compare(ptr('0x100000')) > 0; } catch (e) { return false; } }
function looksPtr(p) { try { return p != null && !p.isNull() && p.compare(ptr('0x100000')) > 0 && p.compare(ptr('0x8000000000')) < 0; } catch (e) { return false; } }
function inModule(p) { try { return p.compare(mod.base) >= 0 && p.compare(mod.base.add(mod.size)) < 0; } catch (e) { return false; } }
function rdStr(p) { if (!looksPtr(p)) return null; try { var s = p.readCString(); if (s && s.length > 0 && s.length < 120 && /^[\x20-\x7e]+$/.test(s)) return s; } catch (e) {} return null; }
function calibrateAndDump() {
  console.log('[cal] get_corlib -> ' + F.get_corlib + ' corlib=' + corlib + ' modbase=' + mod.base + ' modsize=0x' + mod.size.toString(16));

  // image_get_class accessor
  var accGi = -1, accBest = 0;
  for (var i = 3; i < SORTED.length; i++) { if (isDanger(i)) continue; try { var gc = nf(i, 'pointer', ['pointer', 'uint32']), seen = {}, vv = 0; for (var z = 0; z < 24; z++) { var k = gc(corlib, z); if (looksPtr(k)) { vv++; seen[k.toString()] = 1; } } if (vv >= 14 && Object.keys(seen).length > accBest) { accBest = Object.keys(seen).length; accGi = i; } } catch (e) {} }
  F.image_get_class = accGi;
  var getClass = nf(accGi, 'pointer', ['pointer', 'uint32']);
  console.log('[cal] image_get_class=' + accGi + ' distinct=' + accBest);

  var ks = [];
  for (var c = 0; c < 2000 && ks.length < 80; c++) { var k = getClass(corlib, c); if (looksPtr(k)) ks.push(k); }
  console.log('[cal] classes sampled=' + ks.length);

  // dump the struct interpretation for a few classes
  function dumpStruct(tag, obj, maxoff) {
    var out = [];
    for (var off = 0; off < maxoff; off += PS) {
      var line = '0x' + off.toString(16) + ':';
      var p; try { p = obj.add(off).readPointer(); } catch (e) { out.push(line + 'ERR'); continue; }
      var u = obj.add(off).readU32();
      var s = rdStr(p);
      if (s) line += '"' + s + '"';
      else if (inModule(p)) line += 'CODE+0x' + p.sub(mod.base).toString(16);
      else if (looksPtr(p)) { var inner = null; try { inner = p.readPointer(); } catch (e) {} line += 'ptr' + (looksPtr(inner) ? (rdStr(inner) ? '->"' + rdStr(inner) + '"' : '->ptr') : ''); }
      else line += 'u32=' + u;
      out.push(line);
    }
    console.log('[map] ' + tag + ' ' + out.join(' '));
  }

  dumpStruct('class[0]', ks[0], 0xb0);
  dumpStruct('class[20]', ks[20], 0xb0);
  dumpStruct('class[40]', ks[40], 0xb0);

  // find a methods-array: (countOff u16, arrOff ptr) where arr has `count` MethodInfo* each pointing to a struct w/ a CODE ptr
  var found = [];
  for (var coff = 0x80; coff <= 0x140; coff += 2) {
    for (var aoff = 0x80; aoff <= 0x100; aoff += PS) {
      var ok = 0;
      for (var x = 0; x < Math.min(ks.length, 30); x++) {
        try {
          var cnt = ks[x].add(coff).readU16();
          var arr = ks[x].add(aoff).readPointer();
          if (cnt > 0 && cnt < 3000 && looksPtr(arr)) {
            var m0 = arr.readPointer();
            if (looksPtr(m0)) ok++;
          }
        } catch (e) {}
      }
      if (ok >= 20) found.push('cnt@0x' + coff.toString(16) + '/arr@0x' + aoff.toString(16) + '(ok=' + ok + ')');
    }
  }
  console.log('[map] methods-array candidates: ' + found.slice(0, 20).join(' '));

  // for the first class with cnt>0 at a plausible pair, dump a MethodInfo struct
  // try the first candidate
  if (found.length) {
    var m = found[0].match(/cnt@(0x[0-9a-f]+)\/arr@(0x[0-9a-f]+)/);
    var coff = parseInt(m[1], 16), aoff = parseInt(m[2], 16);
    for (var x = 0; x < ks.length; x++) {
      try {
        var cnt = ks[x].add(coff).readU16();
        var arr = ks[x].add(aoff).readPointer();
        if (cnt > 0 && cnt < 3000 && looksPtr(arr)) {
          var mi = arr.readPointer();
          if (looksPtr(mi)) { console.log('[map] class[' + x + '] method_count=' + cnt + ' methods=' + arr + ' mi0=' + mi); dumpStruct('MethodInfo[0]', mi, 0x60); break; }
        }
      } catch (e) {}
    }
  }

  send({ error: 'structmap complete', image_get_class: accGi });
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
