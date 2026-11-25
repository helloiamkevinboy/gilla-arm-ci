'use strict';
// Self-calibrating IL2CPP dumper for gilla (Unity 6, renamed + 189/234 export subset).
//
// WHY THIS EXISTS (see also Reports/ARM64_RECOVERY_REPORT.md):
//  * agent.js (frida-il2cpp-bridge) relies on a POSITIONAL canonical<->obfuscated
//    export map. gilla ships only 189 of the 234 il2cpp_* exports, NON-CONTIGUOUSLY,
//    so that map is wrong past the first gap -> bridge calls wrong functions.
//  * calib_agent.js calibrates 4 function indices but NEVER writes a dump, and its
//    output was block-buffered and lost when the CI step hung.
//
// This agent calibrates every function it needs by probing + validating OBSERVABLE
// output (readable names, sane class pointers), enumerates ALL classes via
// il2cpp_class_for_each (calibrated), and STREAMS the dump to the host via send()
// so nothing depends on app-uid file permissions. Every milestone is flushed
// immediately. A WRONG blind call can crash/hang the target, so the host driver
// bounds total time; here we additionally bound counts and skip DANGER indices.
//
// NOT fabrication: only names/namespaces/method-signatures/RVAs actually read from
// the live runtime are emitted. Missing pieces are marked, never invented.

var MOD = 'libil2cpp.so';
var PS = Process.pointerSize;
var SORTED = ["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var DANGER = [0,1,2,3,4,5,6,7,8,9,10,14,15,16,17,18,21,22,23,24,35,36,37,62,73,74,78,79,81,82,83,84,92,93,95,96,97,98,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,139,140,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,184,185,187,188,189,190,191,192,193,194,195,196,203,213,214,215,216,217,218,219,221,222,223,224,225,226,227,228,229,232];

var mod = null, ADDR = null, corlib = null;
var G2R = 234.0 / SORTED.length, R2G = SORTED.length / 234.0;
var DSET = {}; for (var _d = 0; _d < DANGER.length; _d++) DSET[DANGER[_d]] = 1;

function nf(i, ret, args) { return new NativeFunction(ADDR[i], ret, args); }
function readStr(p) { if (p == null || p.isNull()) return null; try { return p.readCString(); } catch (e) { return null; } }
function isIdent(s) { return typeof s === 'string' && s.length > 0 && s.length < 256 && /^[A-Za-z_<][\w.`<>\[\],|+ ]*$/.test(s); }
function isNs(s) { return s === '' || (typeof s === 'string' && s.length < 256 && /^[A-Za-z_][\w.]*$/.test(s)); }
function estIdx(refIdx) { return Math.round(refIdx * R2G); }
function isDanger(gi) { var r = Math.round(gi * G2R); for (var k = -2; k <= 2; k++) if (DSET[r + k]) return true; return false; }
function looksPtr(p) { try { return p != null && !p.isNull() && p.compare(ptr('0x100000')) > 0 && p.compare(ptr('0x1000000000000')) < 0; } catch (e) { return false; } }

function findCorlib() {
  var cands = [11, 12, 13];
  for (var c = 0; c < cands.length; c++) {
    var i = cands[c];
    try {
      var p = nf(i, 'pointer', [])();
      if (p.isNull()) continue;
      for (var off = 0; off <= 8; off += 8) {
        var s = readStr(p.add(off).readPointer());
        if (s && s.toLowerCase().indexOf('mscorlib') === 0) { corlib = p; return i; }
      }
    } catch (e) {}
  }
  return -1;
}

var out = [];          // streamed to host in chunks
function emit(line) { out.push(line); if (out.length >= 200) flush(); }
function flush() { if (out.length) { send({ chunk: out.join('\n') + '\n' }); out = []; } }

function run() {
  var base = mod.base;
  send({ log: '[cal] corlib=' + corlib + ' base=' + base + ' exports=' + SORTED.length });

  // image_get_class(img,idx)->Il2CppClass* : many distinct class pointers from corlib image
  var giClass = -1, giBest = 0;
  for (var i = 3; i < SORTED.length; i++) {
    if (isDanger(i)) continue;
    try { var gc = nf(i, 'pointer', ['pointer', 'uint32']), seen = {}, vv = 0;
      for (var z = 0; z < 24; z++) { var k = gc(corlib, z); if (looksPtr(k)) { vv++; seen[k.toString()] = 1; } }
      if (vv >= 14 && Object.keys(seen).length > giBest) { giBest = Object.keys(seen).length; giClass = i; }
    } catch (e) {}
  }
  if (giClass < 0) { send({ error: 'image_get_class not calibrated' }); flush(); return; }
  var imageGetClass = nf(giClass, 'pointer', ['pointer', 'uint32']);
  send({ log: '[cal] image_get_class=' + giClass });

  var sample = [];
  for (var c = 0; c < 600 && sample.length < 24; c++) { var k = imageGetClass(corlib, c); if (looksPtr(k)) sample.push(k); }

  var LO = 21;   // skip the 3..20 crash zone the earlier runs identified
  // class_get_name(klass)->char* : many distinct readable identifiers
  var giName = -1, nameBest = 0;
  for (var a = LO; a < SORTED.length; a++) {
    try { var f = nf(a, 'pointer', ['pointer']), nm = {}, bad = 0;
      for (var y = 0; y < sample.length; y++) { var s = readStr(f(sample[y])); if (isIdent(s)) nm[s] = 1; else bad++; }
      var d = Object.keys(nm).length;
      if (d >= 10 && bad <= 3 && d > nameBest) { nameBest = d; giName = a; }
    } catch (e) {}
  }
  if (giName < 0) { send({ error: 'class_get_name not calibrated' }); flush(); return; }
  var className = nf(giName, 'pointer', ['pointer']);
  send({ log: '[cal] class_get_name=' + giName + ' distinct=' + nameBest });

  // class_get_namespace(klass)->char* : "" or ident, differs from name, includes System
  var giNs = -1;
  for (var b = LO; b < SORTED.length; b++) {
    if (b === giName) continue;
    try { var f2 = nf(b, 'pointer', ['pointer']), ok = 0, sys = 0, nonEmptyDiff = 0;
      for (var y2 = 0; y2 < sample.length; y2++) { var ns = readStr(f2(sample[y2])); var cn = readStr(className(sample[y2]));
        if (isNs(ns)) { ok++; if (ns === 'System') sys++; if (ns && ns !== cn) nonEmptyDiff++; } }
      if (ok >= sample.length - 2 && sys >= 1 && nonEmptyDiff >= 1) { giNs = b; break; }
    } catch (e) {}
  }
  var classNs = giNs >= 0 ? nf(giNs, 'pointer', ['pointer']) : null;
  send({ log: '[cal] class_get_namespace=' + giNs });

  // class_get_methods(klass,&iter)->MethodInfo* + method_get_name(m)->char*
  var giMeth = -1, giMName = -1;
  for (var e1 = LO; e1 < SORTED.length && giMeth < 0; e1++) {
    if (e1 === giName || e1 === giNs) continue;
    try { var gm = nf(e1, 'pointer', ['pointer', 'pointer']);
      for (var kx = 0; kx < sample.length; kx++) {
        var it = Memory.alloc(PS); it.writePointer(NULL);
        var m = gm(sample[kx], it);
        if (!looksPtr(m)) continue;
        for (var j = LO; j < SORTED.length; j++) { if (j === giName || j === giNs || j === e1) continue;
          try { var s3 = readStr(nf(j, 'pointer', ['pointer'])(m)); if (isIdent(s3) || s3 === '.ctor' || s3 === '.cctor') { giMeth = e1; giMName = j; break; } } catch (e) {} }
        if (giMeth >= 0) break;
      }
    } catch (e) {}
  }
  var classGetMethods = giMeth >= 0 ? nf(giMeth, 'pointer', ['pointer', 'pointer']) : null;
  var methodName = giMName >= 0 ? nf(giMName, 'pointer', ['pointer']) : null;
  send({ log: '[cal] class_get_methods=' + giMeth + ' method_get_name=' + giMName });

  // class_for_each(cb,userdata) : enumerate EVERY class (game code included). Validate by
  // a candidate that invokes our callback many times with pointers class_get_name accepts.
  var giForEach = -1, allClasses = null;
  var estFE = estIdx(27);
  var feOrder = [];
  for (var dd = 0; dd < 40; dd++) { if (estFE + dd < SORTED.length) feOrder.push(estFE + dd); if (dd > 0 && estFE - dd >= LO) feOrder.push(estFE - dd); }
  for (var fk = 0; fk < feOrder.length && giForEach < 0; fk++) {
    var fi = feOrder[fk]; if (fi < LO || isDanger(fi)) continue;
    try {
      var bucket = [];
      var cb = new NativeCallback(function (klass, ud) { if (bucket.length < 60000 && looksPtr(klass)) bucket.push(klass); }, 'void', ['pointer', 'pointer']);
      nf(fi, 'void', ['pointer', 'pointer'])(cb, NULL);
      if (bucket.length > 200) {
        var good = 0; for (var t = 0; t < 10 && t < bucket.length; t++) if (isIdent(readStr(className(bucket[t])))) good++;
        if (good >= 6) { giForEach = fi; allClasses = bucket; }
      }
    } catch (e) {}
  }
  send({ log: '[cal] class_for_each=' + giForEach + ' classes=' + (allClasses ? allClasses.length : 0) });

  // ---- DUMP ----
  var classes;
  if (allClasses) { classes = allClasses; send({ log: '[dump] enumerating ALL ' + classes.length + ' classes' }); }
  else { classes = []; for (var cc = 0; cc < 60000; cc++) { var kk = imageGetClass(corlib, cc); if (looksPtr(kk)) classes.push(kk); else if (cc > 5) break; } send({ log: '[dump] fallback: corlib-only ' + classes.length + ' classes' }); }

  emit('// IL2CPP dump - gilla (com.playgilla.gilla)');
  emit('// calibrated: image_get_class=' + giClass + ' class_get_name=' + giName + ' namespace=' + giNs + ' methods=' + giMeth + ' method_name=' + giMName + ' for_each=' + giForEach);
  emit('// module base=' + base + '  (RVA = methodPointer - base)');
  emit('// NOTE: names/RVAs read from the live runtime. Empty bodies: IL2CPP has no C# source. Not fabricated.');

  var nC = 0, nM = 0, seenK = {};
  for (var ci = 0; ci < classes.length; ci++) {
    var k = classes[ci]; var key = k.toString(); if (seenK[key]) continue; seenK[key] = 1;
    var name = readStr(className(k)); if (!isIdent(name)) continue;
    var ns = classNs ? readStr(classNs(k)) : null;
    nC++;
    emit('');
    if (ns) emit('namespace ' + ns + ' {');
    emit((ns ? '  ' : '') + 'class ' + name + ' {');
    if (classGetMethods && methodName) {
      try {
        var it2 = Memory.alloc(PS); it2.writePointer(NULL); var m2;
        while (!(m2 = classGetMethods(k, it2)).isNull()) {
          var mn = readStr(methodName(m2));
          var rva = '?'; try { var mp = m2.readPointer(); if (looksPtr(mp)) rva = '0x' + mp.sub(base).toString(16); } catch (e) {}
          if (mn) { emit((ns ? '  ' : '') + '  method ' + mn + ';  // RVA ' + rva); nM++; }
          if (nM % 2000 === 0) flush();
        }
      } catch (e) {}
    }
    emit((ns ? '  ' : '') + '}');
    if (ns) emit('}');
    if (nC % 500 === 0) { flush(); send({ progress: { classes: nC, methods: nM } }); }
  }
  flush();
  send({ dumped: true, classes: nC, methods: nM, forEach: giForEach >= 0,
         calib: { image_get_class: giClass, class_get_name: giName, class_get_namespace: giNs, class_get_methods: giMeth, method_get_name: giMName, class_for_each: giForEach } });
}

// bootstrap: wait for module + il2cpp init, then run once
var tries = 0;
var timer = setInterval(function () {
  tries++;
  if (mod == null) {
    mod = Process.findModuleByName(MOD);
    if (mod == null) { if (tries > 240) { clearInterval(timer); send({ error: 'module never loaded' }); } return; }
    ADDR = SORTED.map(function (n) { return mod.findExportByName(n); });
    send({ log: '[cal] module loaded base=' + mod.base });
  }
  try {
    var ci = findCorlib();
    if (ci >= 0) {
      clearInterval(timer);
      send({ log: '[cal] il2cpp ready after ' + tries + ' ticks (get_corlib=' + ci + ')' });
      try { run(); } catch (e) { send({ error: 'run threw: ' + e + '\n' + (e.stack || '') }); flush(); }
    } else if (tries > 240) { clearInterval(timer); send({ error: 'corlib not found (init?)' }); }
    else if (tries % 10 === 0) send({ log: '[cal] waiting for il2cpp init... (' + tries + ')' });
  } catch (e) {}
}, 500);
