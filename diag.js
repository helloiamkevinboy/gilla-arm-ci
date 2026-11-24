'use strict';
// Recon round 2: dump the full export table (to reverse the il2cpp name-scramble)
// and the mapped metadata region (to check whether it's decrypted in place).

function scanHits(pat) {
  var hits = [];
  var rs = Process.enumerateRanges('r--');
  for (var i = 0; i < rs.length; i++) {
    try {
      var h = Memory.scanSync(rs[i].base, rs[i].size, pat);
      for (var j = 0; j < h.length && hits.length < 10; j++) hits.push(h[j].address);
    } catch (e) {}
  }
  return hits;
}

function run() {
  var mod = Process.findModuleByName('libil2cpp.so');
  if (!mod) { console.log('[diag] libil2cpp not loaded'); return false; }
  console.log('[diag] libil2cpp base=' + mod.base + ' size=0x' + mod.size.toString(16));

  // 1) full export table: name + offset-from-base
  var exps = mod.enumerateExports();
  var lines = ['base=' + mod.base];
  for (var i = 0; i < exps.length; i++) {
    lines.push(exps[i].name + '\t' + exps[i].address.sub(mod.base) + '\t' + exps[i].type);
  }
  var fe = new File('/data/local/tmp/exports.txt', 'w');
  fe.write(lines.join('\n')); fe.close();
  console.log('[diag] dumped ' + exps.length + ' exports -> exports.txt');

  // 2) metadata region (the mmap containing the 9EFE10A6 magic)
  var hits = scanHits('9e fe 10 a6');
  console.log('[diag] 9EFE10A6 hits=' + JSON.stringify(hits.map(String)));
  if (hits.length) {
    var a = hits[0];
    var rs = Process.enumerateRanges('r--');
    for (var i = 0; i < rs.length; i++) {
      var end = rs[i].base.add(rs[i].size);
      if (a.compare(rs[i].base) >= 0 && a.compare(end) < 0) {
        console.log('[diag] metadata region base=' + rs[i].base + ' size=0x' + rs[i].size.toString(16) +
                    ' magicOffset=' + a.sub(rs[i].base));
        // sample entropy at magic+0 (header), magic+0x1000, and deep in first half
        [0, 0x1000, 0x100000, 0x400000].forEach(function (off) {
          try {
            var b = new Uint8Array(a.add(off).readByteArray(2048));
            var pr = 0, zero = 0;
            for (var k = 0; k < b.length; k++) { if (b[k] >= 32 && b[k] < 127) pr++; if (b[k] === 0) zero++; }
            console.log('[diag]  off+0x' + off.toString(16) + ': printable%=' + Math.floor(pr * 100 / 2048) +
                        ' zero%=' + Math.floor(zero * 100 / 2048));
          } catch (e) {}
        });
        var fr = new File('/data/local/tmp/meta_region.dat', 'wb');
        fr.write(rs[i].base.readByteArray(rs[i].size)); fr.close();
        console.log('[diag] dumped metadata region (' + rs[i].size + ' bytes) -> meta_region.dat');
        break;
      }
    }
  }
  send({ done: true, exports: exps.length });
  return true;
}

rpc.exports = { run: run };
