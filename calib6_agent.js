'use strict';
// gilla IL2CPP dumper v6 - clean structural recovery.
// v5 proved Il2CppClass structs are detectable in the metadata pool (image@0x0,
// name@0x10, namespace@0x18) but matched 41k false positives and missed game classes.
// v6 fixes it:
//  1) STRONG filter: a real class's image@0x0 must itself be a valid Il2CppImage
//     (image->name @0x0 is a readable ".dll"/identifier) AND that image must be
//     shared by many classes. Random structs fail this.
//  2) TARGET the metadata pool: read the pool descriptor at base+0x68efb70 for its
//     region pointers and scan those first (fast, complete), then other ranges.
//  3) methods/fields by DIRECT STRUCT READ (iterator exports didn't calibrate):
//     calibrate (arrayOffset,countOffset) on a known class, then read arrays.
// MethodInfo: methodPointer@0x0, name@0x10.  FieldInfo: name@0x0.
// All pure reads except the confirmed name/namespace getters. Nothing fabricated.
var MOD='libil2cpp.so', PS=8, POOL_DESC_RVA=0x68efb70;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35,I_NS=36;
var LO=ptr('0x10000'), HI=ptr('0x1000000000000');
var mod=null,ADDR=null,g_name=null,g_ns=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
function isImgName(s){return typeof s==='string'&&s.length>2&&s.length<128&&/^[A-Za-z0-9_.\-]+$/.test(s);}
function pOK(p){return p&&!p.isNull()&&p.compare(LO)>0&&p.compare(HI)<0;}
var out=[]; function emit(l){out.push(l); if(out.length>=400)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}

function readClass(a){ try{
  var img=a.readPointer(); if(!pOK(img))return null;
  var np=a.add(0x10).readPointer(); if(!pOK(np))return null;
  var nm=rs(np); if(!nm||!isId(nm))return null;
  var sp=a.add(0x18).readPointer(); var ns=pOK(sp)?rs(sp):''; if(ns===null)ns=''; if(!isNs(ns))return null;
  // STRONG: image must look like a real Il2CppImage (name @0x0 readable)
  var imgNameP=img.readPointer(); if(!pOK(imgNameP))return null;
  var imgNm=rs(imgNameP); if(!isImgName(imgNm))return null;
  return {img:img.toString(),imgNm:imgNm,name:nm,ns:ns,a:a};
}catch(e){return null;} }

function scanRange(base,size,sink,cap,deadline){
  var pos=0;
  while(pos<size){
    if(Date.now()>deadline) return false;
    var clen=Math.min(0x100000,size-pos), buf;
    try{ buf=new Uint8Array(base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
    var dv=new DataView(buf.buffer);
    for(var off=0; off+0x40<=clen; off+=8){
      var hi=dv.getUint32(off+0x14,true); if(hi===0||hi>0xffff) continue; // name ptr plausible
      var c=readClass(base.add(pos+off)); if(c){ sink.push(c); if(sink.length>=cap) return true; }
    }
    pos+=clen;
  }
  return true;
}

function run(){
  var base=mod.base;
  g_name=nf(I_NAME,'pointer',['pointer']); g_ns=nf(I_NS,'pointer',['pointer']);
  var corlib=null; try{corlib=nf(11,'pointer',[])();}catch(e){}

  // gather candidate scan regions: pool descriptor pointers first, then all r-- ranges
  var ranges=Process.enumerateRanges('r--');
  function rangeOf(p){ for(var i=0;i<ranges.length;i++){ if(p.compare(ranges[i].base)>=0 && p.compare(ranges[i].base.add(ranges[i].size))<0) return ranges[i]; } return null; }
  var prio=[], seenR={};
  try{ var d=base.add(POOL_DESC_RVA);
    for(var o=0;o<0x400;o+=8){ var q; try{q=d.add(o).readPointer();}catch(e){continue;} if(pOK(q)){ var rg=rangeOf(q); if(rg&&!seenR[rg.base.toString()]){seenR[rg.base.toString()]=1; prio.push(rg);} } }
  }catch(e){}
  send({log:'[pool] descriptor-referenced regions='+prio.length});
  // order: prio first, then the rest (size-filtered)
  var rest=ranges.filter(function(r){return !seenR[r.base.toString()] && r.size>=0x8000 && r.size<=0x6000000;});
  var order=prio.concat(rest);

  var cands=[], t0=Date.now(), deadline=t0+560000;
  for(var i=0;i<order.length;i++){ if(Date.now()>deadline){send({log:'[scan] time cap'});break;}
    if(cands.length>=120000) break;
    scanRange(order[i].base, Math.min(order[i].size,0x6000000), cands, 120000, deadline);
  }
  send({log:'[scan] raw candidates='+cands.length+' in '+((Date.now()-t0)/1000|0)+'s'});

  // filter by image frequency (real images shared by many classes)
  var freq={}; for(var j=0;j<cands.length;j++) freq[cands[j].img]=(freq[cands[j].img]||0)+1;
  var goodImg={}, imgName={}; var realImgs=0;
  for(var k in freq){ if(freq[k]>=5){ goodImg[k]=1; realImgs++; } }
  var classes=cands.filter(function(c){return goodImg[c.img];});
  // dedup by address
  var seen={}, uniq=[]; for(var m=0;m<classes.length;m++){ var key=classes[m].a.toString(); if(!seen[key]){seen[key]=1; uniq.push(classes[m]); imgName[classes[m].img]=classes[m].imgNm;} }
  classes=uniq;
  var imgset={}; classes.forEach(function(c){imgset[c.imgNm]=1;});
  send({log:'[filter] realImages='+realImgs+' classes='+classes.length+' assemblies='+Object.keys(imgset).join(',').slice(0,300)});
  var known=0; classes.forEach(function(c){if(c.name==='Object'||c.name==='String'||c.name==='Int32'||c.name==='GameObject'||c.name==='MonoBehaviour')known++;});
  if(classes.length<50){ send({error:'too few real classes after filter: '+classes.length}); flush(); return; }

  // calibrate method array by struct on a seed with known methods
  var seed=null; for(var s=0;s<classes.length&&!seed;s++){ if(classes[s].name==='String'||classes[s].name==='Object') seed=classes[s].a; }
  var mArr=-1,mCnt=-1;
  if(seed){
    for(var ao=0x78; ao<=0xb8 && mArr<0; ao+=8){ var arr; try{arr=seed.add(ao).readPointer();}catch(e){continue;} if(!pOK(arr))continue;
      for(var co=0x108; co<=0x138; co+=2){ var cnt; try{cnt=seed.add(co).readU16();}catch(e){continue;} if(cnt<1||cnt>4000)continue;
        var good=0,tot=Math.min(cnt,8); try{ for(var mi=0;mi<tot;mi++){ var mp=arr.add(mi*PS).readPointer(); if(!pOK(mp))break; var mn=rs(mp.add(0x10).readPointer()); if(mn&&(isId(mn)||mn==='.ctor'))good++; } }catch(e){}
        if(good>=Math.max(2,tot-1)){ mArr=ao; mCnt=co; break; } }
    }
  }
  send({log:'[cal] method arrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16))});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum=filtered structural scan; classes='+classes.length+'; method arrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16)));
  emit('// RVA = MethodInfo.methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty. Not fabricated.');
  var nC=0,nM=0;
  for(var c=0;c<classes.length;c++){ var cl=classes[c];
    nC++; emit(''); emit('// Assembly: '+cl.imgNm);
    if(cl.ns)emit('namespace '+cl.ns+' {'); var ind=cl.ns?'  ':'';
    emit(ind+'class '+cl.name+' {');
    if(mArr>=0){ try{ var arr=cl.a.add(mArr).readPointer(); var cnt=cl.a.add(mCnt).readU16();
      if(pOK(arr)&&cnt>0&&cnt<=5000){ for(var mi=0;mi<cnt;mi++){ var mp=arr.add(mi*PS).readPointer(); if(!pOK(mp))continue; var mn=rs(mp.add(0x10).readPointer()); var rva='?'; try{var fp=mp.readPointer(); if(pOK(fp))rva='0x'+fp.sub(base).toString(16);}catch(e){} if(mn){emit(ind+'  method '+mn+'();  // RVA '+rva);nM++;} } } }catch(e){} }
    emit(ind+'}'); if(cl.ns)emit('}');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,assemblies:Object.keys(imgset).length,calib:{methodArrayOff:mArr,methodCountOff:mCnt}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
