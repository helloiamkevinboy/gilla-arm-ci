'use strict';
// gilla IL2CPP dumper v7 - structural scan + image-frequency clustering.
// v6 over-filtered (assumed image->name@0x0; wrong for this build) and scanned only
// the pool-descriptor regions (which lack class structs). v7:
//  - detect Il2CppClass by pure reads: image@0x0 (any ptr), name@0x10 (identifier),
//    namespace@0x18 (identifier or "").  (name/ns offsets are disasm-confirmed.)
//  - FAST pre-filter: both image@0x0 and name@0x10 must be plausible pointers
//    (checked in the byte buffer, no native calls) before validating -> big speedup.
//  - scan ALL readable ranges (pool-descriptor regions first).
//  - DISCRIMINATE real vs false positives by IMAGE FREQUENCY: real images are shared
//    by many classes; false positives have random unique "image" pointers. Keep
//    classes whose image@0x0 is shared by >= MINFREQ classes. No image-layout assumption.
//  - methods via calibrated struct offsets (MethodInfo.name@0x10, methodPointer@0x0).
// Only live-runtime values emitted. Nothing fabricated.
var MOD='libil2cpp.so', PS=8, POOL_DESC_RVA=0x68efb70, MINFREQ=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35,I_NS=36;
var mod=null,ADDR=null,g_name=null,g_ns=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
function plausHi(hi){return hi>0 && hi<=0xffff;}   // top 32 bits of a mapped pointer
var out=[]; function emit(l){out.push(l); if(out.length>=500)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}

function readClass(a){ try{
  var img=a.readPointer();
  var np=a.add(0x10).readPointer();
  var nm=rs(np); if(!nm||!isId(nm))return null;
  var sp=a.add(0x18).readPointer(); var ns=rs(sp); if(ns===null)ns=''; if(ns!==''&&!isNs(ns))return null;
  return {img:img.toString(),name:nm,ns:ns,a:a};
}catch(e){return null;} }

function run(){
  var base=mod.base;
  g_name=nf(I_NAME,'pointer',['pointer']); g_ns=nf(I_NS,'pointer',['pointer']);
  var ranges=Process.enumerateRanges('r--');
  function rangeOf(p){ for(var i=0;i<ranges.length;i++){ if(p.compare(ranges[i].base)>=0 && p.compare(ranges[i].base.add(ranges[i].size))<0) return ranges[i]; } return null; }
  var seenR={},prio=[];
  try{ var d=base.add(POOL_DESC_RVA); for(var o=0;o<0x400;o+=8){ var q; try{q=d.add(o).readPointer();}catch(e){continue;} if(q&&!q.isNull()){ var rg=rangeOf(q); if(rg&&!seenR[rg.base.toString()]){seenR[rg.base.toString()]=1;prio.push(rg);} } } }catch(e){}
  var rest=ranges.filter(function(r){return !seenR[r.base.toString()] && r.size>=0x8000 && r.size<=0x8000000;});
  var order=prio.concat(rest);
  send({log:'[scan] regions: prio='+prio.length+' rest='+rest.length});

  var cands=[], t0=Date.now(), deadline=t0+560000, scannedMB=0;
  for(var ri=0; ri<order.length && Date.now()<deadline && cands.length<250000; ri++){
    var rg=order[ri], sz=Math.min(rg.size,0x8000000), pos=0;
    while(pos<sz && Date.now()<deadline){
      var clen=Math.min(0x100000,sz-pos), buf;
      try{ buf=new Uint8Array(rg.base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
      scannedMB+=clen/1048576;
      var dv=new DataView(buf.buffer);
      for(var off=0; off+0x40<=clen; off+=8){
        if(!plausHi(dv.getUint32(off+0x14,true))) continue;   // name ptr plausible
        if(!plausHi(dv.getUint32(off+0x4,true))) continue;     // image ptr plausible
        var c=readClass(rg.base.add(pos+off)); if(c){ cands.push(c); if(cands.length>=250000)break; }
      }
      pos+=clen;
    }
  }
  send({log:'[scan] raw candidates='+cands.length+' scannedMB='+(scannedMB|0)+' in '+((Date.now()-t0)/1000|0)+'s'});

  // image-frequency clustering: real images shared by many classes
  var freq={}; for(var j=0;j<cands.length;j++) freq[cands[j].img]=(freq[cands[j].img]||0)+1;
  var good={},realImgs=0; for(var k in freq){ if(freq[k]>=MINFREQ){good[k]=1;realImgs++;} }
  var seen={},classes=[]; for(var m=0;m<cands.length;m++){ if(!good[cands[m].img])continue; var key=cands[m].a.toString(); if(seen[key])continue; seen[key]=1; classes.push(cands[m]); }
  // report top images by size
  var byImg={}; classes.forEach(function(c){ (byImg[c.img]=byImg[c.img]||[]).push(c); });
  var tops=Object.keys(byImg).sort(function(a,b){return byImg[b].length-byImg[a].length;}).slice(0,12)
            .map(function(k){return byImg[k].length+':'+(byImg[k][0].ns||'')+'.'+byImg[k][0].name;});
  send({log:'[filter] realImages='+realImgs+' classes='+classes.length});
  send({log:'[filter] top image groups: '+tops.join(' | ')});
  if(classes.length<30){ send({error:'too few real classes: '+classes.length}); flush(); return; }

  // calibrate method array offset by struct on a seed with methods
  var seed=null; for(var s=0;s<classes.length&&!seed;s++){ if(classes[s].name==='String'||classes[s].name==='Object'||classes[s].name==='Type') seed=classes[s].a; }
  if(!seed) seed=classes[0].a;
  var mArr=-1,mCnt=-1;
  for(var ao=0x78; ao<=0xb8 && mArr<0; ao+=8){ var arr; try{arr=seed.add(ao).readPointer();}catch(e){continue;} if(!arr||arr.isNull())continue;
    for(var co=0x108; co<=0x138; co+=2){ var cnt; try{cnt=seed.add(co).readU16();}catch(e){continue;} if(cnt<1||cnt>4000)continue;
      var good2=0,tot=Math.min(cnt,8),bad=0; try{ for(var mi=0;mi<tot;mi++){ var mp=arr.add(mi*PS).readPointer(); if(mp.isNull()){bad++;continue;} var mn=rs(mp.add(0x10).readPointer()); if(mn&&(isId(mn)||mn==='.ctor'))good2++; else bad++; } }catch(e){bad=tot;}
      if(good2>=Math.max(2,tot-1)&&bad===0){ mArr=ao; mCnt=co; break; } }
  }
  send({log:'[cal] method arrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16))});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum=structural scan + image-frequency filter; classes='+classes.length+'; methodArrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16)));
  emit('// RVA = MethodInfo.methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty. Not fabricated.');
  var nC=0,nM=0;
  for(var c=0;c<classes.length;c++){ var cl=classes[c]; nC++;
    emit(''); if(cl.ns)emit('namespace '+cl.ns+' {'); var ind=cl.ns?'  ':'';
    emit(ind+'class '+cl.name+' {');
    if(mArr>=0){ try{ var arr=cl.a.add(mArr).readPointer(); var cnt=cl.a.add(mCnt).readU16();
      if(arr&&!arr.isNull()&&cnt>0&&cnt<=5000){ for(var mi=0;mi<cnt;mi++){ var mp=arr.add(mi*PS).readPointer(); if(mp.isNull())continue; var mn=rs(mp.add(0x10).readPointer()); var rva='?'; try{var fp=mp.readPointer(); if(fp&&!fp.isNull())rva='0x'+fp.sub(base).toString(16);}catch(e){} if(mn){emit(ind+'  method '+mn+'();  // RVA '+rva);nM++;} } } }catch(e){} }
    emit(ind+'}'); if(cl.ns)emit('}');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,calib:{methodArrayOff:mArr,methodCountOff:mCnt}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
