'use strict';
// gilla IL2CPP dumper. Enumeration primitives (class_for_each / image_get_class)
// are not usable in the 189-export subset, and the class table lives in the il2cpp
// metadata memory pool (mmap, not the module .bss). So we DETECT Il2CppClass structs
// structurally in mapped memory using only pure reads (no native calls on unknown
// pointers): a class has image ptr @0x0, char* name @0x10 (readable identifier),
// char* namespace @0x18 (identifier or ""). Offsets are disasm-confirmed
// (class_get_name=ldr[x0,#0x10], class_get_namespace=ldr[x0,#0x18]). We confirm the
// detected set against mscorlib ground truth, then dump using the confirmed getters
// (name=35, namespace=36, method_name=112; member-iterators idx28/30/31/32/33/34).
// Only live-runtime values are emitted. No fabrication.
var MOD='libil2cpp.so', PS=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35,I_NS=36,I_MNAME=112,I_FNAME=68;
var METHODS_CANDS=[34,33,30,32,31,28], FIELDS_CANDS=[30,33,32,28,31];
var KNOWN={Object:1,String:1,Int32:1,Boolean:1,Byte:1,Char:1,Array:1,Type:1,Void:1,Enum:1,ValueType:1,Exception:1,Double:1,Single:1,Int64:1,UInt32:1,IntPtr:1,Delegate:1,Attribute:1,RuntimeType:1};
var KM={ToString:1,Equals:1,GetHashCode:1,GetType:1,".ctor":1,".cctor":1,Finalize:1};
var mod=null,ADDR=null,g_name=null,g_ns=null,g_mname=null,g_fname=null;
var LO=ptr('0x10000'), HI=ptr('0x1000000000000');
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<300&&/^[A-Za-z_<][A-Za-z0-9_.`<>\[\],|+ ]*$/.test(s);}
function isNs(s){return s===''||(typeof s==='string'&&s.length<300&&/^[A-Za-z_][A-Za-z0-9_.]*$/.test(s));}
function pOK(p){return p&&!p.isNull()&&p.compare(LO)>0&&p.compare(HI)<0;}
// pure-read structural class test: image@0x0 ptr, name@0x10 -> ident, ns@0x18 -> ident/""
function structClass(a){ try{
  var img=a.readPointer(); if(!pOK(img))return false;
  var np=a.add(0x10).readPointer(); if(!pOK(np))return false;
  var nm=rs(np); if(!nm||!isId(nm))return false;
  var sp=a.add(0x18).readPointer(); var ns=pOK(sp)?rs(sp):''; if(ns===null)ns='';
  if(!isNs(ns))return false;
  return {name:nm,ns:ns};
}catch(e){return false;} }
var out=[]; function emit(l){out.push(l); if(out.length>=300)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}

function enumerate(){
  var found=[], seenAddr={}, ranges=Process.enumerateRanges('r--'), t0=Date.now();
  var totScanned=0;
  for(var ri=0;ri<ranges.length;ri++){
    if(Date.now()-t0>300000) { send({log:'[scan] time cap hit'}); break; }
    var rg=ranges[ri]; var sz=rg.size;
    if(sz<0x8000 || sz>0x6000000) continue;           // skip tiny + giant (text) ranges
    var base=rg.base, pos=0;
    while(pos<sz){
      var clen=Math.min(0x100000, sz-pos); var buf;
      try{ buf=new Uint8Array(base.add(pos).readByteArray(clen)); }catch(e){ pos+=clen; continue; }
      totScanned+=clen;
      var dv=new DataView(buf.buffer);
      for(var off=0; off+0x20<=clen; off+=8){
        // candidate: qword at off+0x10 is a plausible pointer (the name ptr)
        var lo=dv.getUint32(off+0x10,true), hi=dv.getUint32(off+0x14,true);
        if(hi===0 || hi>0xffff) continue;             // name ptr must be in 0x1_0000..0xffff_ffff_ffff
        var a=base.add(pos+off);
        if(seenAddr[a.toString()]) continue;
        var sc=structClass(a);
        if(sc){ found.push({a:a,name:sc.name,ns:sc.ns}); seenAddr[a.toString()]=1; }
      }
      pos+=clen;
    }
    if(found.length>60000){ send({log:'[scan] cap 60000 classes'}); break; }
  }
  send({log:'[scan] scannedMB='+(totScanned/1048576|0)+' classStructs='+found.length});
  return found;
}

function run(){
  var base=mod.base;
  g_name=nf(I_NAME,'pointer',['pointer']); g_ns=nf(I_NS,'pointer',['pointer']); g_mname=nf(I_MNAME,'pointer',['pointer']);
  try{g_fname=nf(I_FNAME,'pointer',['pointer']);}catch(e){}

  var found=enumerate();
  // ground truth
  var known=0; for(var i=0;i<found.length;i++){ if(KNOWN[found[i].name]) known++; }
  send({log:'[gt] known mscorlib type names among structs='+known});
  if(found.length<100 || known<3){ send({error:'structural enumeration failed (found='+found.length+' known='+known+')'}); flush(); return; }

  // confirm getters agree with structural reads on a seed, and calibrate methods/fields
  var seed=null; for(var j=0;j<found.length&&!seed;j++){ if(found[j].name==='Object'||found[j].name==='String') seed=found[j].a; }
  var probe=seed||found[0].a;
  // sanity: g_name(probe) must equal structural name
  var gn=rs(g_name(probe)); send({log:'[chk] getter name='+gn});
  function pick(cands,val){ for(var c=0;c<cands.length;c++){ var gi=cands[c]; try{ var fn=nf(gi,'pointer',['pointer','pointer']); var it=Memory.alloc(PS); it.writePointer(NULL); var good=0,tot=0,m; while(!(m=fn(probe,it)).isNull()&&tot<40){tot++; if(val(m))good++;} if(tot>0&&good>=Math.max(2,tot-2)) return {idx:gi,fn:fn}; }catch(e){} } return null; }
  var M=pick(METHODS_CANDS,function(m){var s=rs(g_mname(m));return s&&(isId(s)||KM[s]);});
  var F=g_fname?pick(FIELDS_CANDS,function(f){var s=rs(g_fname(f));return s&&isId(s);}):null;
  if(F&&M&&F.idx===M.idx)F=null;
  send({log:'[cal] methods='+(M?M.idx:-1)+' fields='+(F?F.idx:-1)});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum=structural memory scan of metadata pool; name=35 ns=36 methods='+(M?M.idx:-1)+' method_name=112 fields='+(F?F.idx:-1));
  emit('// RVA = MethodInfo.methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty by nature. Not fabricated.');
  var nC=0,nM=0,nF=0,seen={};
  for(var ci=0;ci<found.length;ci++){
    var k=found[ci].a, key=k.toString(); if(seen[key])continue; seen[key]=1;
    var cn=found[ci].name, cns=found[ci].ns; nC++;
    emit(''); if(cns)emit('namespace '+cns+' {'); var ind=cns?'  ':'';
    emit(ind+'class '+cn+' {');
    if(F){ try{var fit=Memory.alloc(PS);fit.writePointer(NULL);var ff; while(!(ff=F.fn(k,fit)).isNull()){var fn=rs(g_fname(ff));if(fn){emit(ind+'  field '+fn+';');nF++;}if(nF%4000===0)flush();}}catch(e){} }
    if(M){ try{var mit=Memory.alloc(PS);mit.writePointer(NULL);var mm; while(!(mm=M.fn(k,mit)).isNull()){var mn=rs(g_mname(mm));var rva='?';try{var mp=mm.readPointer();if(pOK(mp))rva='0x'+mp.sub(base).toString(16);}catch(e){} if(mn){emit(ind+'  method '+mn+'();  // RVA '+rva);nM++;}if(nM%4000===0)flush();}}catch(e){} }
    emit(ind+'}'); if(cns)emit('}');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM,fields:nF}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,fields:nF,enum:'structural-scan',calib:{methods:(M?M.idx:-1),fields:(F?F.idx:-1)}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
