'use strict';
// gilla IL2CPP dumper v11 - derive the image offset from anchors (don't assume 0x0).
// v10 found 367 structs with [0x0]==corlib but no Object/String, because it (a) assumed
// image@0x0 and (b) pre-filtered by [0x0] non-exec, dropping real classes whose 0x0 isn't
// the image. v11: scan by name@0x10 + namespace@0x18 only; find Object/String/GameObject
// anchors by (name,ns) and CONFIRM with the getters class_get_name(35)/namespace(36);
// derive IMAGE OFFSET = the offset where Object[+off]==corlib (and String[+off]==corlib);
// derive MethodInfo.klass offset (where method[+off]==its class) and the methods array
// offset together; derive parent (String.parent==Object). Then group real classes by the
// real image offset, validate (Object has ToString...), and dump. Pure reads + getters.
// Confirmed: name@0x10, ns@0x18; get_corlib=idx11. Everything else derived. Not fabricated.
var MOD='libil2cpp.so', PS=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var mod=null,ADDR=null,g_name=null,g_ns=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
var out=[]; function emit(l){out.push(l); if(out.length>=600)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}
var execRanges=[]; function isExec(p){for(var i=0;i<execRanges.length;i++){if(p.compare(execRanges[i].b)>=0&&p.compare(execRanges[i].e)<0)return true;}return false;}

function run(){
  var base=mod.base, corlib=nf(11,'pointer',[])();
  g_name=nf(35,'pointer',['pointer']); g_ns=nf(36,'pointer',['pointer']);
  Process.enumerateRanges('r-x').forEach(function(r){execRanges.push({b:r.base,e:r.base.add(r.size)});});
  send({log:'[cal] base='+base+' corlib='+corlib});

  var ranges=Process.enumerateRanges('r--').filter(function(r){return r.size>=0x4000 && r.size<=0x8000000;});
  var cands=[], t0=Date.now(), deadline=t0+420000, scannedMB=0;
  for(var ri=0; ri<ranges.length && Date.now()<deadline && cands.length<160000; ri++){
    var rg=ranges[ri], sz=rg.size, pos=0;
    while(pos<sz && Date.now()<deadline){
      var clen=Math.min(0x100000,sz-pos), buf;
      try{ buf=new Uint8Array(rg.base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
      scannedMB+=clen/1048576; var dv=new DataView(buf.buffer);
      for(var off=0; off+0x140<=clen; off+=8){
        if(dv.getUint32(off+0x14,true)===0||dv.getUint32(off+0x14,true)>0xffff) continue; // name ptr plausible
        var a=rg.base.add(pos+off);
        try{ var nm=rs(a.add(0x10).readPointer()); if(!nm||!isId(nm))continue;
          var sp=a.add(0x18).readPointer(); var ns=rs(sp); if(ns===null)ns=''; if(ns!==''&&!isNs(ns))continue;
          cands.push({a:a,name:nm,ns:ns});
        }catch(e){}
      }
      pos+=clen;
    }
  }
  send({log:'[scan] candidates='+cands.length+' scannedMB='+(scannedMB|0)+' in '+((Date.now()-t0)/1000|0)+'s'});

  // anchors by (name,ns), confirmed via getters (getter name/ns must equal struct name/ns)
  var want=[['Object','System'],['String','System'],['Int32','System'],['ValueType','System'],['Type','System'],['GameObject','UnityEngine'],['Component','UnityEngine'],['Transform','UnityEngine']];
  var anchor={};
  for(var i=0;i<cands.length;i++){ var c=cands[i];
    for(var w=0;w<want.length;w++){ if(c.name===want[w][0] && c.ns===want[w][1] && !anchor[c.name]){
      try{ if(rs(g_name(c.a))===c.name && (rs(g_ns(c.a))||'')===c.ns){ anchor[c.name]=c.a; } }catch(e){}
    } }
  }
  var have=Object.keys(anchor);
  send({log:'[anchor] confirmed='+have.join(',')});
  if(!anchor['Object']){ send({error:'no confirmed Object anchor; cands with name=Object: '+cands.filter(function(c){return c.name==='Object';}).length}); flush(); return; }

  // derive IMAGE offset: where Object[+off]==corlib (and String agrees if present)
  var imgOff=-1;
  for(var o=0;o<=0x40;o+=8){ try{ if(anchor['Object'].add(o).readPointer().equals(corlib)){ if(!anchor['String']||anchor['String'].add(o).readPointer().equals(corlib)){ imgOff=o; break; } } }catch(e){} }
  send({log:'[cal] imageOff=0x'+(imgOff<0?'?(corlib not found in Object struct 0..0x40)':imgOff.toString(16))});

  // derive methods array offset + MethodInfo.klass offset together, using Object/String
  var MARR=[[0x80,0x124],[0x88,0x120],[0x90,0x12c],[0x98,0x128],[0xa0,0x130]];
  var KOFF=[0x18,0x10,0x20,0x8];
  var mArr=-1,mCnt=-1,kOff=-1;
  var seedKeys=have.slice(0,6);
  for(var p=0;p<MARR.length&&mArr<0;p++){ var ao=MARR[p][0],co=MARR[p][1];
    for(var kk=0;kk<KOFF.length&&mArr<0;kk++){ var ko=KOFF[kk], agree=0,checked=0;
      for(var h=0;h<seedKeys.length;h++){ var C=anchor[seedKeys[h]]; try{ var arr=C.add(ao).readPointer(), cnt=C.add(co).readU16(); if(arr.isNull()||cnt<1||cnt>5000)continue; checked++; var back=0,tot=Math.min(cnt,6); for(var x=0;x<tot;x++){ var m=arr.add(x*PS).readPointer(); if(m.isNull())continue; if(m.add(ko).readPointer().equals(C)){ var mn=rs(m.add(0x10).readPointer()); if(mn&&(isId(mn)||mn==='.ctor'||mn==='.cctor'))back++; } } if(back>=Math.max(1,tot-1))agree++; }catch(e){} }
      if(checked>=2 && agree>=Math.max(2,checked-1)){ mArr=ao; mCnt=co; kOff=ko; }
    }
  }
  send({log:'[cal] methods arrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16))+' klassOff=0x'+(kOff<0?'?':kOff.toString(16))});

  // parent offset: String.parent==Object
  var parentOff=-1;
  if(anchor['String']&&anchor['Object']){ for(var po=0x30;po<=0x78;po+=8){ try{ if(anchor['String'].add(po).readPointer().equals(anchor['Object'])){parentOff=po;break;} }catch(e){} } }
  send({log:'[cal] parentOff=0x'+(parentOff<0?'?':parentOff.toString(16))});

  // fields: FieldInfo array (elem 0x20), FieldInfo.parent@0x10==class, name@0x0 readable
  var fArr=-1,fCnt=-1; var FS=anchor['String']||anchor['Object'];
  for(var fo=0x80; fo<=0xb8 && fArr<0; fo+=8){ if(fo===mArr)continue; var arr; try{arr=FS.add(fo).readPointer();}catch(e){continue;} if(arr.isNull())continue;
    for(var fc=0x100; fc<=0x12e; fc+=2){ var cnt; try{cnt=FS.add(fc).readU16();}catch(e){continue;} if(cnt<1||cnt>2000)continue;
      var ok=0,tot=Math.min(cnt,5); try{ for(var x=0;x<tot;x++){ var fi=arr.add(x*0x20); var fn=rs(fi.readPointer()); if(fn&&isId(fn)&&fi.add(0x10).readPointer().equals(FS))ok++; } }catch(e){}
      if(ok>=Math.max(1,tot-1)){ fArr=fo; fCnt=fc; break; } } }
  send({log:'[cal] fieldsArrayOff=0x'+(fArr<0?'?':fArr.toString(16))+' fieldsCountOff=0x'+(fCnt<0?'?':fCnt.toString(16))});

  function methodsOf(C){ var r=[]; if(mArr<0)return r; try{ var arr=C.add(mArr).readPointer(), cnt=C.add(mCnt).readU16(); if(arr.isNull()||cnt<1||cnt>8000)return r; for(var i=0;i<cnt;i++){ var m=arr.add(i*PS).readPointer(); if(m.isNull())continue; var mn=rs(m.add(0x10).readPointer()); var rva='?'; try{var fp=m.readPointer(); if(!fp.isNull())rva='0x'+fp.sub(base).toString(16);}catch(e){} if(mn)r.push({n:mn,rva:rva}); } }catch(e){} return r; }
  function fieldsOf(C){ var r=[]; if(fArr<0)return r; try{ var arr=C.add(fArr).readPointer(), cnt=C.add(fCnt).readU16(); if(arr.isNull()||cnt<1||cnt>2000)return r; for(var i=0;i<cnt;i++){ var fn=rs(arr.add(i*0x20).readPointer()); if(fn&&isId(fn))r.push(fn); } }catch(e){} return r; }
  var vObj=methodsOf(anchor['Object']).map(function(m){return m.n;});
  send({validation:{Object_methods:vObj.slice(0,24), count:vObj.length, Object_fields:fieldsOf(anchor['Object']).slice(0,10)}});
  if(imgOff<0){ send({error:'image offset not found; cannot group classes reliably'}); flush(); return; }

  // real classes: group by image@imgOff; keep images shared by >=5 classes and non-exec
  var freq={}; cands.forEach(function(c){ try{ var im=c.a.add(imgOff).readPointer(); c.img=im; if(!isExec(im)) freq[im.toString()]=(freq[im.toString()]||0)+1; }catch(e){} });
  var realImg={}; for(var k in freq){ if(freq[k]>=5) realImg[k]=1; } realImg[corlib.toString()]=1;
  var seen={}, classes=[];
  cands.forEach(function(c){ if(!c.img||isExec(c.img))return; if(!realImg[c.img.toString()])return; var key=c.a.toString(); if(seen[key])return; seen[key]=1; classes.push(c); });
  // require a valid methods array (klass backref) OR zero methods OR corlib image
  if(mArr>=0&&kOff>=0){ classes=classes.filter(function(c){ if(c.img.equals(corlib))return true; try{ var arr=c.a.add(mArr).readPointer(), cnt=c.a.add(mCnt).readU16(); if(cnt===0)return true; if(arr.isNull()||cnt<0||cnt>8000)return false; var m=arr.readPointer(); if(m.isNull())return true; return m.add(kOff).readPointer().equals(c.a);}catch(e){return false;} }); }
  var nsCount={}; classes.forEach(function(c){nsCount[c.ns]=(nsCount[c.ns]||0)+1;});
  var topNs=Object.keys(nsCount).sort(function(a,b){return nsCount[b]-nsCount[a];}).slice(0,22).map(function(k){return nsCount[k]+':'+(k||'<global>');});
  send({log:'[result] realClasses='+classes.length+' namespaces='+Object.keys(nsCount).length});
  send({log:'[ns] '+topNs.join(' | ')});
  if(classes.length<30){ send({error:'too few classes: '+classes.length}); flush(); return; }

  emit('// IL2CPP dump - gilla, Unity 6000.5.2f1, arm64 | classes='+classes.length);
  emit('// offsets: name@0x10 ns@0x18 image@0x'+imgOff.toString(16)+' parent@0x'+(parentOff<0?'?':parentOff.toString(16))+' methods@0x'+(mArr<0?'?':mArr.toString(16))+'/0x'+(mCnt<0?'?':mCnt.toString(16))+' klass@0x'+(kOff<0?'?':kOff.toString(16))+' fields@0x'+(fArr<0?'?':fArr.toString(16))+'/0x'+(fCnt<0?'?':fCnt.toString(16)));
  emit('// RVA = methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty. Not fabricated.');
  var nC=0,nM=0,nF=0;
  for(var c=0;c<classes.length;c++){ var cl=classes[c];
    var par=''; if(parentOff>=0){ try{ var pp=cl.a.add(parentOff).readPointer(); if(!pp.isNull()&&!isExec(pp)){ var pn=rs(pp.add(0x10).readPointer()); if(pn&&isId(pn)){ var pns=rs(pp.add(0x18).readPointer())||''; par=(pns?pns+'.':'')+pn; } } }catch(e){} }
    emit('===C|'+cl.ns+'|'+cl.name+'|'+par); nC++;
    var fs=fieldsOf(cl.a); for(var fi=0;fi<fs.length;fi++){ emit('F:'+fs[fi]); nF++; }
    var ms=methodsOf(cl.a); for(var mi=0;mi<ms.length;mi++){ emit('M:'+ms[mi].n+'|'+ms[mi].rva); nM++; }
    emit('===E');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM,fields:nF}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,fields:nF,calib:{imageOff:imgOff,methodArrayOff:mArr,methodCountOff:mCnt,klassOff:kOff,parentOff:parentOff,fieldsArrayOff:fArr,fieldsCountOff:fCnt}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
