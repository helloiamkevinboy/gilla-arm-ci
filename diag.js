'use strict';
// Custom RE recon: on NATIVE arm64 (redroid), inspect the running game to find
// (a) what libil2cpp exports actually exist, (b) whether the DECRYPTED metadata
// sits in memory in standard format (magic AF1BB1FA), and dump it if so.

function scan(pat) {
  var n = 0, hits = [];
  var rs = Process.enumerateRanges('r--');
  for (var i = 0; i < rs.length; i++) {
    try {
      var h = Memory.scanSync(rs[i].base, rs[i].size, pat);
      for (var j = 0; j < h.length; j++) { n++; if (hits.length < 6) hits.push(h[j].address); }
    } catch (e) {}
  }
  return { n: n, hits: hits };
}

function metaLen(base) {
  var version = base.add(4).readInt();
  var max = 0;
  for (var i = 0; i < 66; i++) {
    var off = base.add(8 + i * 8).readU32();
    var sz = base.add(8 + i * 8 + 4).readU32();
    if (off > 0 && off < 0x8000000 && sz > 0 && sz < 0x8000000 && off + sz > max) max = off + sz;
  }
  return { version: version, length: max };
}

function run() {
  var mod = Process.findModuleByName('libil2cpp.so');
  if (!mod) { console.log('[diag] libil2cpp.so not loaded yet'); return false; }
  console.log('[diag] libil2cpp base=' + mod.base + ' size=0x' + mod.size.toString(16));

  // --- exports: what IS exported? ---
  var exps = mod.enumerateExports();
  console.log('[diag] total exports=' + exps.length);
  var ilish = exps.filter(function (e) { return /il2cpp|metadata|mono|corlib|domain/i.test(e.name); });
  console.log('[diag] il2cpp-ish exports(' + ilish.length + ')=' + JSON.stringify(ilish.slice(0, 30).map(function (e) { return e.name; })));
  console.log('[diag] first 30 export names=' + JSON.stringify(exps.slice(0, 30).map(function (e) { return e.name; })));

  // --- scan for decrypted (AF1BB1FA) and encrypted (9EFE10A6) metadata ---
  var dec = scan('af 1b b1 fa');
  console.log('[diag] decrypted-magic AF1BB1FA count=' + dec.n + ' hits=' + JSON.stringify(dec.hits.map(String)));
  var enc = scan('9e fe 10 a6');
  console.log('[diag] encrypted-magic 9EFE10A6 count=' + enc.n + ' hits=' + JSON.stringify(enc.hits.map(String)));

  // --- dump any valid decrypted metadata buffer ---
  var dumped = false;
  for (var i = 0; i < dec.hits.length && !dumped; i++) {
    try {
      var info = metaLen(dec.hits[i]);
      console.log('[diag] candidate @' + dec.hits[i] + ' version=' + info.version + ' size=' + info.length);
      if (info.version >= 24 && info.version <= 40 && info.length > 0x100000 && info.length < 0x4000000) {
        var f = new File('/data/local/tmp/meta_decrypted.dat', 'wb');
        f.write(dec.hits[i].readByteArray(info.length)); f.close();
        console.log('[diag] *** DUMPED metadata v' + info.version + ' ' + info.length + ' bytes -> /data/local/tmp/meta_decrypted.dat');
        dumped = true;
      }
    } catch (e) { console.log('[diag] parse err ' + e); }
  }

  // --- locate a known metadata identifier string ---
  var needle = Array.prototype.map.call('GillaStashSave', function (c) {
    return ('0' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(' ');
  var s = scan(needle);
  console.log('[diag] "GillaStashSave" count=' + s.n + ' first=' + (s.hits[0] || 'none'));
  send({ done: true, dumped: dumped, exports: exps.length, decCount: dec.n });
  return true;
}

rpc.exports = { run: run };
