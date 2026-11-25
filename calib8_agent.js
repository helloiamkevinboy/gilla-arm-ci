'use strict';
// gilla IL2CPP dumper v8 - decisive Il2CppClass discriminator: byval_arg self-ref.
// Static disasm of libil2cpp.so:
//   idx47 il2cpp_class_get_type = `add x0,x0,#0x20; ret`  -> byval_arg @ class+0x20
//   idx52 il2cpp_class_from_type = `ldr x0,[x0]; ret`     -> type.data is first field
// => a real Il2CppClass's byval_arg.data (at +0x20) points back to the class itself:
//        *(class+0x20) == class
// MethodInfo / strings / random structs cannot satisfy this, so it isolates classes
// cleanly (and the check is a cheap in-buffer comparison, no native call).
// name@0x10, namespace@0x18 are disasm-confirmed getter offsets. Methods read via
// static member-array offsets (0x88/0x120, 0x90/0x12c, 0x80/0x124), MethodInfo.name
// @0x10, methodPointer@0x0. Only live values emitted; nothing fabricated.
var MOD='libil2cpp.so', PS=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35,I_NS=36;
var mod=null,ADDR=null,g_name=null,g_ns=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
var MARR=[[0x88,0x120],[0x90,0x12c],[0x80,0x124],[0x98,0x128]];   // (methods ptr, count) candidates
var out=[]; function emit(l){out.push(l); if(out.length>=500)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}

function run(){
  var base=mod.base;
  g_name=nf(I_NAME,'pointer',['pointer']); g_ns=nf(I_NS,'pointer',['pointer']);
  var ranges=Process.enumerateRanges('r--').filter(function(r){return r.size>=0x4000 && r.size<=0x8000000;});
  send({log:'[scan] ranges='+ranges.length});

  var classes=[], t0=Date.now(), deadline=t0+560000, scannedMB=0, selfrefHits=0;
  for(var ri=0; ri<ranges.length && Date.now()<deadline; ri++){
    var rg=ranges[ri], sz=rg.size, pos=0, rbaseLo=rg.base.and(0xffffffff), rbaseHiNum;
    while(pos<sz && Date.now()<deadline){
      var clen=Math.min(0x100000,sz-pos), buf;
      try{ buf=new Uint8Array(rg.base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
      scannedMB+=clen/1048576;
      var dv=new DataView(buf.buffer);
      for(var off=0; off+0x140<=clen; off+=8){
        // self-ref: qword at off+0x20 must equal this slot's absolute address
        var lo=dv.getUint32(off+0x20,true), hi=dv.getUint32(off+0x24,true);
        if(hi===0) continue;
        var a=rg.base.add(pos+off);
        var sref=ptr(hi).shl(32).or(ptr(lo>>>0));
        if(!sref.equals(a)) continue;
        selfrefHits++;
        // validate name@0x10 / ns@0x18 via reads
        try{
          var np=a.add(0x10).readPointer(); var nm=rs(np); if(!nm||!isId(nm)) continue;
          var sp=a.add(0x18).readPointer(); var ns=rs(sp); if(ns===null)ns=''; if(ns!==''&&!isNs(ns)) continue;
          classes.push({a:a,name:nm,ns:ns});
        }catch(e){}
      }
      pos+=clen;
    }
    if(classes.length>80000){ send({log:'[scan] cap'}); break; }
  }
  // dedup
  var seen={},uniq=[]; for(var i=0;i<classes.length;i++){var k=classes[i].a.toString(); if(!seen[k]){seen[k]=1;uniq.push(classes[i]);}} classes=uniq;
  send({log:'[scan] selfrefHits='+selfrefHits+' validClasses='+classes.length+' scannedMB='+(scannedMB|0)+' in '+((Date.now()-t0)/1000|0)+'s'});
  var nsCount={}; classes.forEach(function(c){nsCount[c.ns]=(nsCount[c.ns]||0)+1;});
  var topNs=Object.keys(nsCount).sort(function(a,b){return nsCount[b]-nsCount[a];}).slice(0,15).map(function(k){return nsCount[k]+':'+(k||'<global>');});
  send({log:'[ns] top namespaces: '+topNs.join(' | ')});
  if(classes.length<30){ send({error:'too few classes: '+classes.length}); flush(); return; }

  // calibrate methods offset-pair on a seed that has methods
  var seed=null; for(var s=0;s<classes.length&&!seed;s++){ if(classes[s].name==='String'||classes[s].name==='Object'||classes[s].name==='Type') seed=classes[s].a; } if(!seed)seed=classes[0].a;
  var mArr=-1,mCnt=-1;
  for(var p=0;p<MARR.length&&mArr<0;p++){ var ao=MARR[p][0],co=MARR[p][1];
    try{ var arr=seed.add(ao).readPointer(), cnt=seed.add(co).readU16();
      if(arr.isNull()||cnt<1||cnt>4000) continue;
      var good=0,tot=Math.min(cnt,8); for(var mi=0;mi<tot;mi++){ var mp=arr.add(mi*PS).readPointer(); if(mp.isNull())break; var mn=rs(mp.add(0x10).readPointer()); if(mn&&(isId(mn)||mn==='.ctor'))good++; }
      if(good>=Math.max(2,tot-1)){ mArr=ao; mCnt=co; }
    }catch(e){}
  }
  send({log:'[cal] method arrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16))});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum=byval_arg self-ref scan; classes='+classes.length+'; methodArrayOff=0x'+(mArr<0?'?':mArr.toString(16))+' countOff=0x'+(mCnt<0?'?':mCnt.toString(16)));
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
  send({dumped:true,classes:nC,methods:nM,calib:{methodArrayOff:mArr,methodCountOff:mCnt}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
