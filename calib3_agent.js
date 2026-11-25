'use strict';
// gilla IL2CPP dumper, enumeration via the GLOBAL CLASS VECTOR (no class_for_each,
// which isn't in the 189-export subset). Static RE of libil2cpp.so found that the
// "set field on the last-registered class" exports (idx124-128) all dereference a
// std::vector<Il2CppClass*> at RVA 0x68efb20:
//     vec   = *(base + 0x68efb20)
//     begin = *(vec + 0)
//     count = *(vec + 8)
//     class[i] = *(begin + i*8)
// We read that array directly (only confirmed getters are *called*), confirm by
// ground truth (System.Object/String/Int32 present), then dump namespace.Class {
// fields; methods();//RVA }. Verified export indices (disasm-confirmed):
//   get_corlib=11, class_get_name=35 (ldr[x0,#0x10]), class_get_namespace=36
//   (ldr[x0,#0x18]), method_get_name=112; member-iterators idx28/30/31/32/33/34
//   (class_get_{events,fields,nested,interfaces,properties,methods}) runtime-picked.
// Only live-runtime values are emitted. No fabrication.

var MOD = 'libil2cpp.so';
var PS = 8;
var CLASS_VEC_RVAS = [0x68efb20, 0x68efb70];   // primary + fallback (both reference the type table)
var SORTED = ["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35, I_NS=36, I_MNAME=112, I_FNAME=68;
var METHODS_CANDS=[34,33,30,32,31,28], FIELDS_CANDS=[30,33,32,28,31,34];
var KNOWN={Object:1,String:1,Int32:1,Boolean:1,Byte:1,Char:1,Array:1,Type:1,Void:1,Enum:1,ValueType:1,Exception:1,Double:1,Single:1,Int64:1,UInt32:1,IntPtr:1};
var KM={ToString:1,Equals:1,GetHashCode:1,GetType:1,".ctor":1,".cctor":1,Finalize:1};
var mod=null, ADDR=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<400&&/^[A-Za-z_<][\w.`<>\[\],|+ ]*$/.test(s);}
function looksPtr(p){try{return p&&!p.isNull()&&p.compare(ptr('0x10000'))>0&&p.compare(ptr('0x1000000000000'))<0;}catch(e){return false;}}
var out=[]; function emit(l){out.push(l); if(out.length>=250)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}

function findVector(base,name){
  for(var r=0;r<CLASS_VEC_RVAS.length;r++){
    try{
      var vec=base.add(CLASS_VEC_RVAS[r]).readPointer();
      if(!looksPtr(vec))continue;
      var begin=vec.readPointer();
      var count=vec.add(8).readU64().toNumber();
      if(!looksPtr(begin)||count<50||count>500000)continue;
      // validate: first entries resolve to known mscorlib type names
      var known=0,ok=0;
      for(var i=0;i<count&&i<400&&(known<3);i++){
        var k=begin.add(i*PS).readPointer(); if(!looksPtr(k))continue;
        var nm=rs(name(k)); if(nm&&isId(nm)){ok++; if(KNOWN[nm])known++;}
      }
      send({log:'[vec] rva=0x'+CLASS_VEC_RVAS[r].toString(16)+' count='+count+' okNames='+ok+' knownHits='+known});
      if(known>=3) return {begin:begin,count:count};
    }catch(e){ send({log:'[vec] rva=0x'+CLASS_VEC_RVAS[r].toString(16)+' err '+e}); }
  }
  return null;
}

function run(){
  var base=mod.base;
  var name=nf(I_NAME,'pointer',['pointer']);
  var ns=nf(I_NS,'pointer',['pointer']);
  var mname=nf(I_MNAME,'pointer',['pointer']);
  var fname=null; try{fname=nf(I_FNAME,'pointer',['pointer']);}catch(e){}

  var V=findVector(base,name);
  if(!V){ send({error:'global class vector not found/validated'}); flush(); return; }
  var begin=V.begin, count=V.count;
  send({log:'[enum] class vector: '+count+' classes @ '+begin});

  // collect class ptrs + find a seed (System.Object) to calibrate methods/fields
  var classes=[], seed=null;
  for(var i=0;i<count;i++){ var k=begin.add(i*PS).readPointer(); if(looksPtr(k)){ classes.push(k); if(!seed){ var nm=rs(name(k)); if(nm==='Object'||nm==='String') seed=k; } } }
  send({log:'[enum] usable class ptrs='+classes.length+' seed='+(seed?'yes':'no')});
  var probe=seed||classes[0];

  function pickIter(cands,validate){
    for(var c=0;c<cands.length;c++){ var gi=cands[c];
      try{ var gm=nf(gi,'pointer',['pointer','pointer']); var it=Memory.alloc(PS); it.writePointer(NULL);
        var good=0,tot=0,m; while(!(m=gm(probe,it)).isNull()&&tot<40){tot++; if(validate(m))good++;}
        if(tot>0&&good>=Math.max(2,tot-2)) return {idx:gi,fn:gm};
      }catch(e){}
    } return null;
  }
  var M=pickIter(METHODS_CANDS,function(m){var s=rs(mname(m));return s&&(isId(s)||KM[s]);});
  var F=fname?pickIter(FIELDS_CANDS,function(f){var s=rs(fname(f));return s&&isId(s);}):null;
  if(F&&M&&F.idx===M.idx)F=null;
  send({log:'[cal] class_get_methods='+(M?M.idx:-1)+' class_get_fields='+(F?F.idx:-1)});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum=global class vector @0x'+CLASS_VEC_RVAS[0].toString(16)+'; name=35 namespace=36 methods='+(M?M.idx:-1)+' method_name=112 fields='+(F?F.idx:-1));
  emit('// RVA = MethodInfo.methodPointer - base('+base+'). IL2CPP has no C# source; bodies are empty by nature. Not fabricated.');
  var nC=0,nM=0,nF=0,seen={};
  for(var ci=0;ci<classes.length;ci++){
    var k=classes[ci],key=k.toString(); if(seen[key])continue; seen[key]=1;
    var cn=rs(name(k)); if(!isId(cn))continue;
    var cns=rs(ns(k)); nC++;
    emit(''); if(cns)emit('namespace '+cns+' {'); var ind=cns?'  ':'';
    emit(ind+'class '+cn+' {');
    if(F){ try{var fit=Memory.alloc(PS);fit.writePointer(NULL);var ff;
      while(!(ff=F.fn(k,fit)).isNull()){var fn=rs(fname(ff));if(fn){emit(ind+'  field '+fn+';');nF++;}if(nF%4000===0)flush();}}catch(e){} }
    if(M){ try{var mit=Memory.alloc(PS);mit.writePointer(NULL);var mm;
      while(!(mm=M.fn(k,mit)).isNull()){var mn=rs(mname(mm));var rva='?';try{var mp=mm.readPointer();if(looksPtr(mp))rva='0x'+mp.sub(base).toString(16);}catch(e){}
        if(mn){emit(ind+'  method '+mn+'();  // RVA '+rva);nM++;}if(nM%4000===0)flush();}}catch(e){} }
    emit(ind+'}'); if(cns)emit('}');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM,fields:nF}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,fields:nF,calib:{name:I_NAME,namespace:I_NS,methods:(M?M.idx:-1),fields:(F?F.idx:-1),method_name:I_MNAME}});
}

var tries=0;
var timer=setInterval(function(){
  tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD);
    if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);});
    send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])();
    if(p&&!p.isNull()){ var s=rs(p.readPointer());
      if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer);
        send({log:'[cal] il2cpp ready after '+tries+' ticks'});
        try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } }
  }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});}
  else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
