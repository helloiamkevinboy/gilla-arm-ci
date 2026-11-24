'use strict';
// Self-calibrating IL2CPP dumper for gilla (Unity 6, renamed + subset exports).
// Identifies the ~18 metadata functions it needs at runtime by probing candidate
// exports and validating observable output (readable class/type/method names,
// "mscorlib.dll", sane counts). Frida converts native access violations during a
// NativeFunction call into catchable JS exceptions, so blind probing is safe.
// No thread attach, no frida-il2cpp-bridge: pure metadata getters.
// driver.py loads this BEFORE resuming the spawned process, so we poll until
// libil2cpp.so is mapped and il2cpp has initialized (corlib resolvable).

var MOD = 'libil2cpp.so';
var PS = Process.pointerSize;
var SORTED = ["nZPmoHfSeUC", "jKHwdEjRlIS", "pXWOFocknQI", "EmKikmszGZt", "ZSOVcNklQQD", "JPeLlhJaNZA", "ByepmUWUSto", "aNqSsIuEhew", "psfmutERnus", "WBBflLfHdmZ", "HLEWYKRRfbS", "IbyENeKbWQN", "lRMRDruerGC", "wZhVQVuzoiY", "vlQTKXAFaQJ", "LqdxVMrRsvd", "aWxnmvXetXj", "NfnQBYUNEJi", "RMhisQRIILV", "mfmJGXewzZS", "gulzMrfxlys", "obAxLRKfyfD", "iHLHlUnBKuR", "exeuUXoZjJu", "rCrYzwDqJKN", "zTThiCwRlmj", "vUcuwxmpJEv", "YcuYZrzZSxO", "TIdkvUOhShS", "utoLoCOmSSU", "ikScaiguXJd", "pKawZYGwQEK", "gbvvhJoIMPb", "XAmXtkbEikC", "awgBrgJzlux", "ftdSQMvLQya", "JtzCEgHkptg", "vWPELjbhCfE", "QfMvCFTbqJX", "YpTXfAlWNAJ", "ksjOpRaWvnv", "AVLygaMZnvQ", "xUdRSsSpoFw", "zgcJRJSulNR", "zWbeZcsjuQw", "jfSbTYQJwhj", "bdBlGDLGZWo", "mGoNIziJImN", "IyJVWUNlQaO", "YIczuqnjVYe", "IApOKkPNmMK", "kcMgoYXBtAM", "ICxnqSJEPJy", "cgyCnAKqPer", "RQaRciRhLzs", "rOQAIKRFiKA", "iEAQFEsejVr", "oRvjfhzrgOG", "gSNzBaLJtnb", "LFLZbhQzqZq", "SsUMkcRjApL", "CWXvDvRuipN", "RZyUiuxnLxD", "yhaVXPsjnWw", "LsjhuuTmlNs", "nikUIvbhJmn", "mcQTdIRErjo", "JpAVKVimvRw", "ToAYLSYnbKV", "khJIgruOVek", "jRnlxbUxzCh", "tjwzSrDQKyt", "MOBCdBLDzbB", "wjYGpChVYhN", "kjDMzolrGqb", "LDYmrBnarzK", "SGUNRXkkaGe", "OKFwibUhsrX", "iuaqVvDiQCf", "fPOOQTntgvo", "PWTnhWbKEex", "IkZqIwPpimX", "DopVKuSUSoc", "TutTPlMSsyT", "QrHlcoivaYI", "zndOJYDgbUW", "deBNECSQzQu", "zNrEGmauebQ", "HfbXjHiifTM", "UPQlJKQJjTH", "DHYyyvQAPrz", "LTfECMcPhjW", "YVHFsAnadDQ", "OHKpzumNmYO", "MkSDLeOIYlo", "yeyTdVhbEzy", "zkOjFmPNobg", "hVJVXfeDgvg", "OWNntvWJwYL", "ARppTxpsFne", "OSsbmVyeQSP", "zZSpLpREIKe", "HfakVHQUtkM", "ihnnhpKCGgP", "VGRvDrBfDYN", "GDXPliLPgHY", "wfZPjXGTJWZ", "xzSspjSEuez", "sBpJLoiaTAM", "OvxKeNhiQtj", "HgUvdbJeFiF", "HfmOtNaULlo", "EsnwKqeAmVj", "OSaSQDqpTbu", "cfXgEytHHdf", "XoCdFtHbGgZ", "wccFPrBCBzH", "rlDgSYpgYBR", "WWmLyTCKWlm", "JjRnFafCaGA", "QNTaOnyTaAs", "qMgYfeBgNsv", "DRnjHCaTPen", "MsQovUBtOjg", "XwVeXTZFSLn", "HEVPaITMTBI", "YDRUtHRygsI", "YGyFVEMjVBS", "CLpmcPPiNHa", "UGnrwHMekDl", "UBcjtTHJGaP", "RGRmWiHjFnz", "IXprbrsAODn", "FSPhraPyoEz", "IigtGSQQNeT", "gAAiYyaLUpD", "oMdUqlaABud", "mqQfIbxkNgX", "LKQIqKWHokE", "nSzokgExdge", "WXpGsdRUTWM", "tgPhkOmYadN", "bvyfQiWoWgF", "GdKtEkRVrDR", "eRLNUFyXdIm", "LXSEEFdLaFx", "tnIQRPszINu", "DRfeZLjLRdm", "zRbscpESgEA", "WtifPfMFdIx", "iLUwCPEPcxt", "OrZTchmvOqx", "OtCVyBsFpaQ", "jdIAqppFgqx", "AdoWvDKyNrK", "gUUxnMUdCgn", "bWJyTEVxAaV", "XnpebzcELlg", "AvASEaGCfcJ", "vwqgMFBLOsL", "CoubrdKitQG", "xBmgCyoSVCC", "GiNLJDsydnC", "OcTUkHAhxeo", "lMFIkYqQvEd", "ZSGsGuBfgia", "VUiRgtHgxGX", "OtVeZwoOCfK", "nIKovBLLHyf", "IQoReemTKPd", "hLYuOSxpOeJ", "rvqWrBKkddR", "AnpjLFVMytd", "gSwUdTMAJGc", "pGydQxnsdpN", "PegWRYvzvzE", "VPqVBAbuPrp", "LuHUtMnxEIQ", "yacCbqghfYZ", "KKVJrChoPUk", "RtuBiFTKbyM", "nYiQtJGCtae", "wTwsoBlCVQK", "eKVEhdyzomZ", "tnaGSaLaONI", "ygzzGnXUwcd", "lgLoYFgOJON", "yMYVXKIJdVo", "ihGpEhxoEDH"];   // 189 renamed il2cpp exports, ascending address order

var mod = null, ADDR = null, corlib = null;
var F = {};

function nf(i, ret, args) { return new NativeFunction(ADDR[i], ret, args); }
function readStr(p) {
  if (p == null || p.isNull()) return null;
  try { return p.readCString(); } catch (e) { return null; }
}
function isIdent(s) { return typeof s === 'string' && s.length > 0 && s.length < 256 && /^[A-Za-z_<][\w.`<>\[\],|+ ]*$/.test(s); }
function have(n) { return F[n] !== undefined && F[n] >= 0; }
var SCALE = SORTED.length / 234.0;
function estIdx(r) { return Math.round(r * SCALE); }
function findFn(refIdx, test) {
  var est = estIdx(refIdx), order = [];
  for (var d = 0; d < SORTED.length; d++) {
    if (est + d < SORTED.length) order.push(est + d);
    if (d > 0 && est - d >= 0) order.push(est - d);
  }
  for (var k = 0; k < order.length; k++) { var i = order[k]; try { if (test(i)) return i; } catch (e) {} }
  return -1;
}

// ---- step 1: get_corlib, also our init-readiness probe ----
function findCorlib() {
  var gi = findFn(13, function (i) {
    var p = nf(i, 'pointer', [])();
    if (p.isNull()) return false;
    for (var off = 0; off <= 8; off += 8) {
      var s = readStr(p.add(off).readPointer());
      if (s && s.toLowerCase().indexOf('mscorlib') === 0) { corlib = p; return true; }
    }
    return false;
  });
  if (gi >= 0) { F.get_corlib = gi; return true; }
  return false;
}

function calibrateAndDump() {
  console.log('[cal] get_corlib -> ' + F.get_corlib + ' (' + SORTED[F.get_corlib] + ') corlib=' + corlib);

  F.image_get_class_count = findFn(211, function (i) { var n = nf(i, 'int', ['pointer'])(corlib); return n > 50 && n < 200000; });
  var nClassCorlib = have('image_get_class_count') ? nf(F.image_get_class_count, 'int', ['pointer'])(corlib) : -1;
  console.log('[cal] image_get_class_count -> ' + F.image_get_class_count + ' corlib classes=' + nClassCorlib);

  F.image_get_class = findFn(212, function (gi) {
    var k0 = nf(gi, 'pointer', ['pointer', 'uint32'])(corlib, 0);
    if (k0.isNull()) return false;
    var ni = findFn(45, function (nj) { return isIdent(readStr(nf(nj, 'pointer', ['pointer'])(k0))); });
    if (ni < 0) return false;
    F.class_get_name = ni; return true;
  });
  console.log('[cal] image_get_class -> ' + F.image_get_class + ' class_get_name -> ' + F.class_get_name);
  if (!have('image_get_class') || !have('class_get_name')) { send({ error: 'calibration failed: class enum', F: F }); return; }

  var getClass = nf(F.image_get_class, 'pointer', ['pointer', 'uint32']);
  var className = nf(F.class_get_name, 'pointer', ['pointer']);
  var sample = [];
  for (var ci = 0; ci < Math.min(nClassCorlib, 600) && sample.length < 80; ci++) {
    var k = getClass(corlib, ci);
    if (!k.isNull()) sample.push({ k: k, name: readStr(className(k)) });
  }
  console.log('[cal] sample: ' + sample.slice(0, 10).map(function (x) { return x.name; }).join(', '));
  function byName(nm) { for (var x = 0; x < sample.length; x++) if (sample[x].name === nm) return sample[x].k; return sample.length ? sample[0].k : null; }

  F.class_get_namespace = findFn(47, function (i) {
    var f = nf(i, 'pointer', ['pointer']), ok = 0, sys = 0;
    for (var x = 0; x < sample.length; x++) {
      var s = readStr(f(sample[x].k));
      if (s === null) return false;
      if (s === '' || isIdent(s)) ok++;
      if (s === 'System') sys++;
    }
    return ok === sample.length && sys > 0;
  });
  console.log('[cal] class_get_namespace -> ' + F.class_get_namespace);

  F.image_get_name = findFn(206, function (i) { var s = readStr(nf(i, 'pointer', ['pointer'])(corlib)); return s && s.toLowerCase() === 'mscorlib.dll'; });
  console.log('[cal] image_get_name -> ' + F.image_get_name);

  // fields
  F.class_get_fields = findFn(38, function (fi) {
    var gf = nf(fi, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var fld = gf(sample[x].k, it);
      if (fld.isNull()) continue;
      var ni = findFn(85, function (nj) { return isIdent(readStr(nf(nj, 'pointer', ['pointer'])(fld))); });
      if (ni >= 0) { F.field_get_name = ni; return true; }
    }
    return false;
  });
  console.log('[cal] class_get_fields -> ' + F.class_get_fields + ' field_get_name -> ' + F.field_get_name);

  var someField = null;
  if (have('class_get_fields')) {
    var gfF = nf(F.class_get_fields, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length && !someField; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var fl = gfF(sample[x].k, it);
      if (!fl.isNull()) someField = fl;
    }
  }
  if (someField) {
    F.field_get_type = findFn(89, function (ti) {
      var ty = nf(ti, 'pointer', ['pointer'])(someField);
      if (ty.isNull()) return false;
      var ni = findFn(201, function (nj) { var s = readStr(nf(nj, 'pointer', ['pointer'])(ty)); return isIdent(s) && s.indexOf(' ') < 0; });
      if (ni >= 0) { F.type_get_name = ni; return true; }
      return false;
    });
  }
  console.log('[cal] field_get_type -> ' + F.field_get_type + ' type_get_name -> ' + F.type_get_name);

  // methods
  F.class_get_methods = findFn(42, function (mi) {
    var gm = nf(mi, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var m = gm(sample[x].k, it);
      if (m.isNull()) continue;
      var ni = findFn(129, function (nj) { var s = readStr(nf(nj, 'pointer', ['pointer'])(m)); return isIdent(s) || s === '.ctor' || s === '.cctor'; });
      if (ni >= 0) { F.method_get_name = ni; return true; }
    }
    return false;
  });
  console.log('[cal] class_get_methods -> ' + F.class_get_methods + ' method_get_name -> ' + F.method_get_name);

  var someMethod = null;
  if (have('class_get_methods')) {
    var gmF = nf(F.class_get_methods, 'pointer', ['pointer', 'pointer']);
    for (var x = 0; x < sample.length && !someMethod; x++) {
      var it = Memory.alloc(PS); it.writePointer(NULL);
      var mm = gmF(sample[x].k, it);
      if (!mm.isNull()) someMethod = mm;
    }
  }
  if (someMethod && have('type_get_name')) {
    var typeName = nf(F.type_get_name, 'pointer', ['pointer']);
    F.method_get_return_type = findFn(126, function (i) { var ty = nf(i, 'pointer', ['pointer'])(someMethod); return !ty.isNull() && isIdent(readStr(typeName(ty)) || ''); });
    F.method_get_param_count = findFn(135, function (i) { var n = nf(i, 'int', ['pointer'])(someMethod); return n >= 0 && n < 100; });
    F.method_get_param = findFn(136, function (i) {
      var pc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer'])(someMethod) : 0;
      if (pc <= 0) return false;
      var ty = nf(i, 'pointer', ['pointer', 'uint32'])(someMethod, 0);
      return !ty.isNull() && isIdent(readStr(typeName(ty)) || '');
    });
    F.method_get_param_name = findFn(138, function (i) {
      var pc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer'])(someMethod) : 0;
      if (pc <= 0) return false;
      return isIdent(readStr(nf(i, 'pointer', ['pointer', 'uint32'])(someMethod, 0)));
    });
  }
  console.log('[cal] method ret/pc/param/pname -> ' + F.method_get_return_type + '/' + F.method_get_param_count + '/' + F.method_get_param + '/' + F.method_get_param_name);

  // domain enumeration
  var imgCount = nf(F.image_get_class_count, 'int', ['pointer']);
  F.domain_get = findFn(75, function (di) {
    var dom = nf(di, 'pointer', [])();
    if (dom.isNull()) return false;
    var found = findFn(77, function (ai) {
      var ga = nf(ai, 'pointer', ['pointer', 'pointer']);
      var cnt = Memory.alloc(PS); cnt.writePointer(NULL);
      var arr = ga(dom, cnt);
      var n = cnt.readPointer().toInt32();
      if (arr.isNull() || n < 1 || n > 20000) return false;
      var first = arr.readPointer();
      if (first.isNull()) return false;
      var gimg = findFn(205, function (ii) {
        var im = nf(ii, 'pointer', ['pointer'])(first);
        return !im.isNull() && imgCount(im) >= 0 && imgCount(im) < 200000;
      });
      if (gimg >= 0) { F.assembly_get_image = gimg; F._dom = dom; F._nasm = n; return true; }
      return false;
    });
    if (found >= 0) { F.domain_get_assemblies = found; return true; }
    return false;
  });
  console.log('[cal] domain_get -> ' + F.domain_get + ' get_assemblies -> ' + F.domain_get_assemblies + ' asm_get_image -> ' + F.assembly_get_image + ' assemblies=' + F._nasm);

  var need = ['domain_get', 'domain_get_assemblies', 'assembly_get_image', 'image_get_class_count', 'image_get_class', 'class_get_name', 'class_get_methods', 'method_get_name'];
  for (var q = 0; q < need.length; q++) if (!have(need[q])) { send({ error: 'incomplete: ' + need[q], F: F }); return; }

  // ---- dump ----
  var getAsm = nf(F.domain_get_assemblies, 'pointer', ['pointer', 'pointer']);
  var asmImage = nf(F.assembly_get_image, 'pointer', ['pointer']);
  var imgName = have('image_get_name') ? nf(F.image_get_name, 'pointer', ['pointer']) : null;
  var clsNs = have('class_get_namespace') ? nf(F.class_get_namespace, 'pointer', ['pointer']) : null;
  var clsFields = have('class_get_fields') ? nf(F.class_get_fields, 'pointer', ['pointer', 'pointer']) : null;
  var fldName = have('field_get_name') ? nf(F.field_get_name, 'pointer', ['pointer']) : null;
  var fldType = have('field_get_type') ? nf(F.field_get_type, 'pointer', ['pointer']) : null;
  var tyName = have('type_get_name') ? nf(F.type_get_name, 'pointer', ['pointer']) : null;
  var clsMethods = nf(F.class_get_methods, 'pointer', ['pointer', 'pointer']);
  var mName = nf(F.method_get_name, 'pointer', ['pointer']);
  var mRet = have('method_get_return_type') ? nf(F.method_get_return_type, 'pointer', ['pointer']) : null;
  var mPc = have('method_get_param_count') ? nf(F.method_get_param_count, 'int', ['pointer']) : null;
  var mParam = have('method_get_param') ? nf(F.method_get_param, 'pointer', ['pointer', 'uint32']) : null;
  var mParamName = have('method_get_param_name') ? nf(F.method_get_param_name, 'pointer', ['pointer', 'uint32']) : null;

  var outPath = '/data/local/tmp/gilla_dump.cs';
  var file = new File(outPath, 'w');
  file.write('// IL2CPP dump (self-calibrated) base=' + mod.base + '\n');
  file.write('// calibrated: ' + JSON.stringify(F) + '\n\n');

  var cntP = Memory.alloc(PS); cntP.writePointer(NULL);
  var arr = getAsm(F._dom, cntP);
  var nAsm = cntP.readPointer().toInt32();
  var nC = 0, nM = 0;
  for (var a = 0; a < nAsm; a++) {
    var asm = arr.add(a * PS).readPointer();
    if (asm.isNull()) continue;
    var img = asmImage(asm);
    if (img.isNull()) continue;
    var iname = imgName ? readStr(imgName(img)) : ('image#' + a);
    var cc = imgCount(img);
    file.write('\n// Image: ' + iname + ' (' + cc + ' classes)\n');
    for (var c = 0; c < cc; c++) {
      var klass = getClass(img, c);
      if (klass.isNull()) continue;
      nC++;
      var kn = readStr(className(klass)) || '?';
      var ns = clsNs ? (readStr(clsNs(klass)) || '') : '';
      file.write((ns ? 'namespace ' + ns + ' { ' : '') + 'class ' + kn + ' {\n');
      if (clsFields && fldName) {
        var fit = Memory.alloc(PS); fit.writePointer(NULL);
        var fld;
        while (!(fld = clsFields(klass, fit)).isNull()) {
          var fn = readStr(fldName(fld)) || '?';
          var ftn = (fldType && tyName) ? (readStr(tyName(fldType(fld))) || 'var') : 'var';
          file.write('    ' + ftn + ' ' + fn + ';\n');
        }
      }
      var mit = Memory.alloc(PS); mit.writePointer(NULL);
      var m;
      while (!(m = clsMethods(klass, mit)).isNull()) {
        nM++;
        var mn = readStr(mName(m)) || '?';
        var rt = (mRet && tyName) ? (readStr(tyName(mRet(m))) || 'void') : 'void';
        var ps = '';
        if (mPc) {
          var pc = mPc(m), parts = [];
          for (var p = 0; p < pc; p++) {
            var ptn = (mParam && tyName) ? (readStr(tyName(mParam(m, p))) || 'var') : 'arg';
            var pn = mParamName ? (readStr(mParamName(m, p)) || ('a' + p)) : ('a' + p);
            parts.push(ptn + ' ' + pn);
          }
          ps = parts.join(', ');
        }
        var rva = '';
        try { var mp = m.readPointer(); if (!mp.isNull()) rva = ' // RVA 0x' + mp.sub(mod.base).toString(16); } catch (e) {}
        file.write('    ' + rt + ' ' + mn + '(' + ps + ');' + rva + '\n');
      }
      file.write('}' + (ns ? ' }' : '') + '\n');
    }
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
    if (mod == null) { if (tries % 10 === 0) console.log('[cal] waiting for ' + MOD + '... (' + tries + ')'); if (tries > 240) { clearInterval(timer); send({ error: 'module never loaded' }); } return; }
    ADDR = SORTED.map(function (n) { return mod.findExportByName(n); });
    console.log('[cal] module loaded base=' + mod.base);
  }
  try {
    if (findCorlib()) {
      clearInterval(timer);
      console.log('[cal] il2cpp ready after ' + tries + ' ticks; calibrating');
      try { calibrateAndDump(); } catch (e) { send({ error: 'dump threw: ' + e + '\n' + (e.stack || '') }); }
    } else if (tries > 240) {
      clearInterval(timer); send({ error: 'il2cpp init / corlib not found after wait', F: F });
    } else if (tries % 10 === 0) { console.log('[cal] waiting for il2cpp init... (' + tries + ')'); }
  } catch (e) { if (tries % 10 === 0) console.log('[cal] probe err: ' + e); }
}, 500);
