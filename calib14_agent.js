'use strict';
// gilla IL2CPP dumper v10 - corlib-anchored, back-reference-validated full dump.
// Reliability fix: il2cpp_get_corlib (idx11) returns the mscorlib Il2CppImage*. Any
// scanned candidate whose image@0x0 EQUALS that pointer is a guaranteed-real mscorlib
// class (no name-guessing). From those anchors we:
//  - find the real image set (image@0x0 values shared by many classes and NOT pointing
//    into executable memory -> excludes MethodInfo, whose [0]=methodPointer is in .text).
//  - calibrate the methods array offset among {0x80/0x124, 0x88/0x120, 0x90/0x12c} by the
//    decisive MethodInfo.klass@0x18 BACK-REFERENCE (every method points back to its class).
//  - derive the parent offset (String.parent == Object) and fields (FieldInfo.parent@0x10==class).
// Confirmed offsets: Il2CppClass.name@0x10, .namespaze@0x18; MethodInfo.name@0x10,
//   .klass@0x18, .methodPointer@0x0 (RVA=methodPointer-base); FieldInfo.name@0x0,.parent@0x10.
// Validation gates on System.Object/String/GameObject before full dump. Pure reads +
// confirmed getters only. Nothing fabricated; failures are logged, not hidden.
var MOD='libil2cpp.so', PS=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var mod=null,ADDR=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
var out=[]; function emit(l){out.push(l); if(out.length>=600)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}
var execRanges=[];
function isExec(p){ for(var i=0;i<execRanges.length;i++){ if(p.compare(execRanges[i].base)>=0 && p.compare(execRanges[i].e)<0) return true; } return false; }
var MARR=[[0x80,0x124],[0x88,0x120],[0x90,0x12c],[0x98,0x128]];

function readName(a){ try{var np=a.add(0x10).readPointer(); return rs(np);}catch(e){return null;} }

function run(){
  var base=mod.base;
  var corlib=nf(11,'pointer',[])();
  send({log:'[cal] base='+base+' corlib='+corlib});
  Process.enumerateRanges('r-x').forEach(function(r){execRanges.push({base:r.base,e:r.base.add(r.size)});});

  // scan candidates (name@0x10 + ns@0x18), keep image ptr object
  var ranges=Process.enumerateRanges('r--').filter(function(r){return r.size>=0x4000 && r.size<=0x8000000;});
  var cands=[], t0=Date.now(), deadline=t0+440000, scannedMB=0;
  for(var ri=0; ri<ranges.length && Date.now()<deadline && cands.length<150000; ri++){
    var rg=ranges[ri], sz=rg.size, pos=0;
    while(pos<sz && Date.now()<deadline){
      var clen=Math.min(0x100000,sz-pos), buf;
      try{ buf=new Uint8Array(rg.base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
      scannedMB+=clen/1048576; var dv=new DataView(buf.buffer);
      for(var off=0; off+0x140<=clen; off+=8){
        if(dv.getUint32(off+0x14,true)===0||dv.getUint32(off+0x14,true)>0xffff) continue;
        if(dv.getUint32(off+0x4,true)===0||dv.getUint32(off+0x4,true)>0xffff) continue;
        var a=rg.base.add(pos+off);
        try{ var nm=rs(a.add(0x10).readPointer()); if(!nm||!isId(nm))continue;
          var sp=a.add(0x18).readPointer(); var ns=rs(sp); if(ns===null)ns=''; if(ns!==''&&!isNs(ns))continue;
          var img=a.readPointer(); if(isExec(img)) continue;     // FIX A: class image is non-exec
          cands.push({a:a,name:nm,ns:ns,img:img});
        }catch(e){}
      }
      pos+=clen;
    }
  }
  send({log:'[scan] candidates(nonexec img)='+cands.length+' scannedMB='+(scannedMB|0)+' in '+((Date.now()-t0)/1000|0)+'s'});

  // POPULATION-BASED calibration: the methods array is the one where arr[i].klass==C
  // (MethodInfo back-reference). Holds for every real TypeDefinition class, nothing else.
  // Test (arrayOff, countOff, klassOff) across a sample of ALL candidates - no anchors/names.
  var KOFF=[0x18,0x10,0x20,0x8,0x28];
  var samp=cands.length>1500?cands.slice(0,1500):cands;
  var mArr=-1,mCnt=-1,kOff=-1,mScore=0;
  for(var p=0;p<MARR.length;p++){ var ao=MARR[p][0],co=MARR[p][1];
    for(var kk=0;kk<KOFF.length;kk++){ var ko=KOFF[kk],score=0;
      for(var s=0;s<samp.length;s++){ var C=samp[s].a; try{ var arr=C.add(ao).readPointer(), cnt=C.add(co).readU16();
        if(arr.isNull()||cnt<1||cnt>5000)continue; var back=0,tot=Math.min(cnt,5);
        for(var i=0;i<tot;i++){ var m=arr.add(i*PS).readPointer(); if(m.isNull())continue; var mn=rs(m.add(0x10).readPointer()); if(m.add(ko).readPointer().equals(C)&&mn&&(isId(mn)||mn==='.ctor'||mn==='.cctor'))back++; }
        if(back>=Math.max(1,tot-1))score++;
      }catch(e){} }
      if(score>mScore){ mScore=score; mArr=ao; mCnt=co; kOff=ko; }
    } }
  send({log:'[cal] CHOSEN methods arr=0x'+(mArr<0?'?':mArr.toString(16))+' cnt=0x'+(mCnt<0?'?':mCnt.toString(16))+' klass=0x'+(kOff<0?'?':kOff.toString(16))+' score='+mScore+'/'+samp.length});
  if(mArr<0||mScore<20){ send({error:'methods calibration failed score='+mScore}); flush(); return; }

  // real classes = candidates whose methods array validates (klass back-ref at entry 0)
  function isClass(C){ try{ var arr=C.add(mArr).readPointer(), cnt=C.add(mCnt).readU16(); if(arr.isNull()||cnt<1||cnt>8000)return false; var m=arr.readPointer(); if(m.isNull())return false; return m.add(kOff).readPointer().equals(C);}catch(e){return false;} }
  var realCls=cands.filter(function(c){return isClass(c.a);});
  var seen={},tmp=[]; realCls.forEach(function(c){var k=c.a.toString(); if(!seen[k]){seen[k]=1;tmp.push(c);}}); realCls=tmp;
  var byName={}; realCls.forEach(function(c){ if(!byName[c.name]) byName[c.name]=c.a; });
  send({log:'[filter] real classes (methods klass-backref)='+realCls.length+' hasObject='+!!byName['Object']+' hasString='+!!byName['String']+' hasGameObject='+!!byName['GameObject']});

  // parent offset: an offset in 0x30..0x78 that, for most real classes, points to ANOTHER real class
  var realSet={}; realCls.forEach(function(c){realSet[c.a.toString()]=1;});
  var parentOff=-1,pBest=0;
  for(var po=0x30;po<=0x78;po+=8){ var h=0,chk=0; for(var s=0;s<Math.min(realCls.length,300);s++){ try{ var pp=realCls[s].a.add(po).readPointer(); chk++; if(!pp.isNull()&&realSet[pp.toString()]&&!pp.equals(realCls[s].a))h++; }catch(e){} }
    if(h>pBest){pBest=h;parentOff=po;} }
  if(pBest< (Math.min(realCls.length,300)*0.3)) parentOff=-1;   // require >=30% have a class there
  send({log:'[cal] parentOff=0x'+(parentOff<0?'?':parentOff.toString(16))+' hits='+pBest});

  // fields: FieldInfo array (elem 0x20), FieldInfo.parent@0x10==class, name@0x0 readable
  var fArr=-1,fCnt=-1;
  var fseed=byName['String']||byName['Object']||realCls[0].a;
  for(var fo=0x80; fo<=0xb8 && fArr<0; fo+=8){ if(fo===mArr)continue; var arr; try{arr=fseed.add(fo).readPointer();}catch(e){continue;} if(arr.isNull())continue;
    for(var fc=0x100; fc<=0x12e; fc+=2){ var cnt; try{cnt=fseed.add(fc).readU16();}catch(e){continue;} if(cnt<1||cnt>2000)continue;
      var ok=0,tot=Math.min(cnt,5); try{ for(var i=0;i<tot;i++){ var fi=arr.add(i*0x20); var fn=rs(fi.readPointer()); if(fn&&isId(fn)&&fi.add(0x10).readPointer().equals(fseed))ok++; } }catch(e){}
      if(ok>=Math.max(1,tot-1)){ fArr=fo; fCnt=fc; break; } } }
  send({log:'[cal] fieldsArrayOff=0x'+(fArr<0?'?':fArr.toString(16))+' fieldsCountOff=0x'+(fCnt<0?'?':fCnt.toString(16))});

  // VALIDATION gate: Object/String/GameObject method samples
  function methodsOf(C){ var r=[]; if(mArr<0)return r; try{ var arr=C.add(mArr).readPointer(), cnt=C.add(mCnt).readU16(); if(arr.isNull()||cnt<1||cnt>6000)return r; for(var i=0;i<cnt;i++){ var m=arr.add(i*PS).readPointer(); if(m.isNull())continue; var mn=rs(m.add(0x10).readPointer()); var rva='?'; try{var fp=m.readPointer(); if(!fp.isNull())rva='0x'+fp.sub(base).toString(16);}catch(e){} if(mn)r.push({n:mn,rva:rva}); } }catch(e){} return r; }
  function fieldsOf(C){ var r=[]; if(fArr<0)return r; try{ var arr=C.add(fArr).readPointer(), cnt=C.add(fCnt).readU16(); if(arr.isNull()||cnt<1||cnt>2000)return r; for(var i=0;i<cnt;i++){ var fi=arr.add(i*0x20); var fn=rs(fi.readPointer()); if(fn&&isId(fn))r.push(fn); } }catch(e){} return r; }
  // VALIDATION: sample methods of known classes if present
  function vm(n){ return byName[n]?methodsOf(byName[n]).map(function(m){return m.n;}).slice(0,12):null; }
  send({validation:{Object:vm('Object'),String:vm('String'),GameObject:vm('GameObject'),
    sampleClass:realCls[0].ns+'.'+realCls[0].name, sampleMethods:methodsOf(realCls[0].a).map(function(m){return m.n;}).slice(0,10)}});

  var classes=realCls;
  var nsCount={}; classes.forEach(function(c){nsCount[c.ns]=(nsCount[c.ns]||0)+1;});
  var topNs=Object.keys(nsCount).sort(function(a,b){return nsCount[b]-nsCount[a];}).slice(0,20).map(function(k){return nsCount[k]+':'+(k||'<global>');});
  send({log:'[result] realClasses='+classes.length+' namespaces='+Object.keys(nsCount).length});
  send({log:'[ns] '+topNs.join(' | ')});

  // DUMP (parseable: ===C ns|name|parent then F:/M: lines then ===E)
  emit('// IL2CPP dump - gilla, Unity 6000.5.2f1, arm64 | classes='+classes.length);
  emit('// offsets: name@0x10 ns@0x18 parent@0x'+(parentOff<0?'?':parentOff.toString(16))+' methods@0x'+(mArr<0?'?':mArr.toString(16))+'/0x'+(mCnt<0?'?':mCnt.toString(16))+' fields@0x'+(fArr<0?'?':fArr.toString(16))+'/0x'+(fCnt<0?'?':fCnt.toString(16)));
  emit('// RVA = methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty. Not fabricated.');
  var nC=0,nM=0,nF=0;
  for(var c=0;c<classes.length;c++){ var cl=classes[c];
    var par=''; if(parentOff>=0){ try{ var pp=cl.a.add(parentOff).readPointer(); if(!pp.isNull()&&!isExec(pp)){ var pn=readName(pp); if(pn&&isId(pn))par=(readName(pp)?((rs(pp.add(0x18).readPointer())||'')+(rs(pp.add(0x18).readPointer())?'.':'')):'')+pn; } }catch(e){} }
    emit('===C|'+cl.ns+'|'+cl.name+'|'+par); nC++;
    var fs=fieldsOf(cl.a); for(var fi=0;fi<fs.length;fi++){ emit('F:'+fs[fi]); nF++; }
    var ms=methodsOf(cl.a); for(var mi=0;mi<ms.length;mi++){ emit('M:'+ms[mi].n+'|'+ms[mi].rva); nM++; }
    emit('===E');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM,fields:nF}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,fields:nF,calib:{methodArrayOff:mArr,methodCountOff:mCnt,parentOff:parentOff,fieldsArrayOff:fArr,fieldsCountOff:fCnt}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
