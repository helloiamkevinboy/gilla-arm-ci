'use strict';
// gilla IL2CPP dumper v9 - SELF-CALIBRATING from anchor classes (no layout guessing).
// Prior versions guessed Il2CppClass offsets (byval_arg self-ref @0x20, etc.) and
// failed. v9 derives the layout at runtime:
//   1. scan memory for candidates: ptr@0x10 -> readable identifier (name), confirmed offset.
//   2. ANCHORS = candidates whose name is unmistakably a real type (Object, String,
//      GameObject, Transform, MonoBehaviour, Int32, ...). These are real Il2CppClass.
//   3. derive SELF-REF offset: the offset in 0x28..0x70 where *(anchor+off)==anchor
//      for most anchors (element_class/castClass point to the class itself). This is
//      exact for THIS build. Also collect the anchors' image@0x0 pointers (real images).
//   4. filter ALL candidates by that self-ref (and/or membership in the real-image set)
//      -> clean class list. 5. derive method array/count offsets from an anchor.
//   6. dump namespace.Class { methods();//RVA }.
// name@0x10 is disasm-confirmed; everything else is runtime-derived. Nothing fabricated.
var MOD='libil2cpp.so', PS=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35,I_NS=36;
var ANCHORS={Object:1,String:1,Int32:1,Boolean:1,Double:1,Single:1,Byte:1,Char:1,Type:1,Array:1,Exception:1,GameObject:1,Transform:1,MonoBehaviour:1,Vector3:1,Component:1,Enum:1,ValueType:1,Delegate:1};
var mod=null,ADDR=null,g_name=null,g_ns=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
var out=[]; function emit(l){out.push(l); if(out.length>=500)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}

function run(){
  var base=mod.base;
  g_name=nf(I_NAME,'pointer',['pointer']); g_ns=nf(I_NS,'pointer',['pointer']);
  var ranges=Process.enumerateRanges('r--').filter(function(r){return r.size>=0x4000 && r.size<=0x8000000;});
  send({log:'[scan] ranges='+ranges.length});

  var cands=[], t0=Date.now(), deadline=t0+480000, scannedMB=0;
  for(var ri=0; ri<ranges.length && Date.now()<deadline && cands.length<120000; ri++){
    var rg=ranges[ri], sz=rg.size, pos=0;
    while(pos<sz && Date.now()<deadline){
      var clen=Math.min(0x100000,sz-pos), buf;
      try{ buf=new Uint8Array(rg.base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
      scannedMB+=clen/1048576; var dv=new DataView(buf.buffer);
      for(var off=0; off+0x140<=clen; off+=8){
        if(dv.getUint32(off+0x14,true)===0||dv.getUint32(off+0x14,true)>0xffff) continue; // name ptr hi plausible
        if(dv.getUint32(off+0x4,true)===0||dv.getUint32(off+0x4,true)>0xffff) continue;   // image ptr hi plausible
        var a=rg.base.add(pos+off);
        try{ var nm=rs(a.add(0x10).readPointer()); if(!nm||!isId(nm))continue;
          var sp=a.add(0x18).readPointer(); var ns=rs(sp); if(ns===null)ns=''; if(ns!==''&&!isNs(ns))continue;
          cands.push({a:a,name:nm,ns:ns,img:a.readPointer().toString()});
        }catch(e){}
      }
      pos+=clen;
    }
  }
  send({log:'[scan] candidates='+cands.length+' scannedMB='+(scannedMB|0)+' in '+((Date.now()-t0)/1000|0)+'s'});

  // anchors
  var anchors=cands.filter(function(c){return ANCHORS[c.name] && (c.ns===''||c.ns==='System'||c.ns==='UnityEngine');});
  send({log:'[anchor] count='+anchors.length+' eg='+anchors.slice(0,6).map(function(c){return c.ns+'.'+c.name;}).join(',')});
  if(anchors.length<3){ send({error:'too few anchors: '+anchors.length}); flush(); return; }

  // derive self-ref offset: offset where *(anchor+off)==anchor for most anchors
  var selfOff=-1, bestHits=0;
  for(var off=0x28; off<=0x78; off+=8){ var hits=0;
    for(var i=0;i<anchors.length;i++){ try{ if(anchors[i].a.add(off).readPointer().equals(anchors[i].a)) hits++; }catch(e){} }
    if(hits>bestHits){ bestHits=hits; selfOff=off; }
  }
  var imgSet={}; anchors.forEach(function(c){imgSet[c.img]=1;});
  send({log:'[cal] selfRefOff=0x'+(selfOff<0?'?':selfOff.toString(16))+' anchorHits='+bestHits+'/'+anchors.length+' anchorImages='+Object.keys(imgSet).length});

  // filter real classes
  var classes;
  if(bestHits>=Math.max(3,(anchors.length*0.6)|0)){
    classes=cands.filter(function(c){ try{return c.a.add(selfOff).readPointer().equals(c.a);}catch(e){return false;} });
    send({log:'[filter] by selfRef@0x'+selfOff.toString(16)+' -> '+classes.length});
  } else {
    // fallback: frequency of image + membership in anchor image set, extended by popular images
    var freq={}; cands.forEach(function(c){freq[c.img]=(freq[c.img]||0)+1;});
    var good={}; for(var k in freq){ if(freq[k]>=20||imgSet[k]) good[k]=1; }
    classes=cands.filter(function(c){return good[c.img];});
    send({log:'[filter] by image freq/anchorset -> '+classes.length});
  }
  // dedup
  var seen={},uniq=[]; classes.forEach(function(c){var k=c.a.toString(); if(!seen[k]){seen[k]=1;uniq.push(c);}}); classes=uniq;
  var nsCount={}; classes.forEach(function(c){nsCount[c.ns]=(nsCount[c.ns]||0)+1;});
  var topNs=Object.keys(nsCount).sort(function(a,b){return nsCount[b]-nsCount[a];}).slice(0,18).map(function(k){return nsCount[k]+':'+(k||'<global>');});
  send({log:'[result] classes='+classes.length+' namespaces='+Object.keys(nsCount).length});
  send({log:'[ns] '+topNs.join(' | ')});
  if(classes.length<30){ send({error:'too few classes after filter: '+classes.length}); flush(); return; }

  // methods: derive (arrayOff,countOff) on an anchor with methods (String/Object)
  var seed=null; for(var s=0;s<classes.length&&!seed;s++){ if(classes[s].name==='String'||classes[s].name==='Object') seed=classes[s].a; } if(!seed)seed=anchors[0].a;
  var mArr=-1,mCnt=-1;
  for(var ao=0x78; ao<=0xb8 && mArr<0; ao+=8){ var arr; try{arr=seed.add(ao).readPointer();}catch(e){continue;} if(arr.isNull())continue;
    for(var co=0x108; co<=0x138; co+=2){ var cnt; try{cnt=seed.add(co).readU16();}catch(e){continue;} if(cnt<1||cnt>4000)continue;
      var good=0,tot=Math.min(cnt,8); try{ for(var mi=0;mi<tot;mi++){ var mp=arr.add(mi*PS).readPointer(); if(mp.isNull())break; var mn=rs(mp.add(0x10).readPointer()); if(mn&&(isId(mn)||mn==='.ctor'))good++; } }catch(e){}
      if(good>=Math.max(2,tot-1)){ mArr=ao; mCnt=co; break; } } }
  send({log:'[cal] methodArrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16))});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum=anchor-calibrated self-ref@0x'+(selfOff<0?'?':selfOff.toString(16))+'; classes='+classes.length+'; methodArrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16)));
  emit('// RVA = MethodInfo.methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty. Not fabricated.');
  var nC=0,nM=0;
  for(var c=0;c<classes.length;c++){ var cl=classes[c]; nC++;
    emit(''); if(cl.ns)emit('namespace '+cl.ns+' {'); var ind=cl.ns?'  ':'';
    emit(ind+'class '+cl.name+' {');
    if(mArr>=0){ try{ var arr=cl.a.add(mArr).readPointer(), cnt=cl.a.add(mCnt).readU16();
      if(!arr.isNull()&&cnt>0&&cnt<=6000){ for(var mi=0;mi<cnt;mi++){ var mp=arr.add(mi*PS).readPointer(); if(mp.isNull())continue; var mn=rs(mp.add(0x10).readPointer()); var rva='?'; try{var fp=mp.readPointer(); if(!fp.isNull())rva='0x'+fp.sub(base).toString(16);}catch(e){} if(mn){emit(ind+'  method '+mn+'();  // RVA '+rva);nM++;} } } }catch(e){} }
    emit(ind+'}'); if(cl.ns)emit('}');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,calib:{selfRefOff:selfOff,methodArrayOff:mArr,methodCountOff:mCnt}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
