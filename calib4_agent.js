'use strict';
// gilla IL2CPP dumper + enumeration finder. class_for_each and image_get_class are
// not usable in the 189-export subset, so we locate the persistent class table by
// direct memory inspection, validated against mscorlib ground truth, then dump.
// Confirmed getters (disasm of libil2cpp.so): get_corlib=11, class_get_name=35
// (ldr[x0,#0x10]), class_get_namespace=36 (ldr[x0,#0x18]), method_get_name=112;
// member-iterators idx28/30/31/32/33/34. Only these getters are *called*; the class
// set comes from reading memory. Emits only live values. No fabrication.
var MOD='libil2cpp.so', PS=8;
var SORTED=["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];
var I_NAME=35,I_NS=36,I_MNAME=112,I_FNAME=68;
var METHODS_CANDS=[34,33,30,32,31,28], FIELDS_CANDS=[30,33,32,28,31];
var KNOWN={Object:1,String:1,Int32:1,Boolean:1,Byte:1,Char:1,Array:1,Type:1,Void:1,Enum:1,ValueType:1,Exception:1,Double:1,Single:1,Int64:1,UInt32:1,IntPtr:1,Delegate:1,Attribute:1};
var KM={ToString:1,Equals:1,GetHashCode:1,GetType:1,".ctor":1,".cctor":1,Finalize:1};
var mod=null,ADDR=null,g_name=null,g_ns=null,g_mname=null,g_fname=null;
function nf(i,r,a){return new NativeFunction(ADDR[i],r,a);}
function rs(p){if(!p||p.isNull())return null;try{return p.readCString();}catch(e){return null;}}
function isId(s){return typeof s==='string'&&s.length>0&&s.length<400&&/^[A-Za-z_<][\w.`<>\[\],|+ ]*$/.test(s);}
function looksPtr(p){try{return p&&!p.isNull()&&p.compare(ptr('0x10000'))>0&&p.compare(ptr('0x1000000000000'))<0;}catch(e){return false;}}
// a plausible Il2CppClass: deref [+0x10] -> readable identifier, [+0x0] (image) looksPtr
function looksClass(k){ if(!looksPtr(k))return false; try{ var nm=g_name(k); var s=rs(nm); if(!s||!isId(s))return false; var img=k.readPointer(); return looksPtr(img); }catch(e){return false;} }
var out=[]; function emit(l){out.push(l); if(out.length>=250)flush();}
function flush(){if(out.length){send({chunk:out.join('\n')+'\n'});out=[];}}
function hex(addr,n){ try{ return addr.readByteArray(n); }catch(e){ return null; } }

function collectFrom(begin,count){ // read an array of Il2CppClass* and keep the valid ones
  var cs=[],known=0;
  for(var i=0;i<count;i++){ var k; try{k=begin.add(i*PS).readPointer();}catch(e){break;}
    if(looksClass(k)){ cs.push(k); var s=rs(g_name(k)); if(KNOWN[s])known++; } }
  return {cs:cs,known:known};
}

function findTable(base){
  // interpretation candidates for the persistent class table
  var tries=[];
  // (a) inline array directly at these RVAs
  [0x68efb70,0x68efb20].forEach(function(r){ tries.push({label:'inline@0x'+r.toString(16),get:function(){return base.add(r);}}); });
  // (b) pointer-to-array at these RVAs (vector begin) with count right after
  [0x68efb20,0x68efb70].forEach(function(r){ tries.push({label:'ptr@0x'+r.toString(16),get:function(){var v=base.add(r).readPointer(); return v;}}); });
  for(var t=0;t<tries.length;t++){
    try{
      var begin=tries[t].get();
      if(!looksPtr(begin)){ send({log:'[tab] '+tries[t].label+' begin not ptr'}); continue; }
      // probe first 64 slots; if many are classes, accept and find extent
      var hits=0,known=0;
      for(var i=0;i<64;i++){ var k; try{k=begin.add(i*PS).readPointer();}catch(e){break;} if(looksClass(k)){hits++; if(KNOWN[rs(g_name(k))])known++;} }
      send({log:'[tab] '+tries[t].label+' first64 classHits='+hits+' known='+known});
      if(hits>=40 && known>=1){
        // grow forward to find count
        var n=0; for(;n<400000;n++){ var k; try{k=begin.add(n*PS).readPointer();}catch(e){break;} if(!looksClass(k)){ // allow small gaps
            var ok=false; for(var g=1;g<=3;g++){ try{var k2=begin.add((n+g)*PS).readPointer(); if(looksClass(k2)){ok=true;break;}}catch(e){} } if(!ok)break; } }
        send({log:'[tab] '+tries[t].label+' extent~='+n});
        if(n>=100){ var r=collectFrom(begin,n); if(r.known>=3) return {label:tries[t].label,cs:r.cs}; }
      }
    }catch(e){ send({log:'[tab] '+tries[t].label+' err '+e}); }
  }
  // (c) scan .bss/.data for a flat run of class pointers
  send({log:'[scan] scanning module data for class-pointer array...'});
  var best=null;
  Process.enumerateRanges('rw-').forEach(function(rg){
    if(best) return;
    if(rg.base.compare(base)<0 || rg.base.compare(base.add(0x8000000))>0) return; // module-ish range
    var size=rg.size>0x800000?0x800000:rg.size;
    var run=0,start=null;
    for(var off=0; off<size; off+=PS){
      var k; try{k=rg.base.add(off).readPointer();}catch(e){ run=0;start=null;continue; }
      if(looksPtr(k) && looksClass(k)){ if(run===0)start=rg.base.add(off); run++; if(run>=64 && !best){ /* candidate */ } }
      else { if(run>=200){ var r=collectFrom(start,run+1); if(r.known>=3){ best={label:'scan@'+start,cs:r.cs}; return;} } run=0;start=null; }
    }
    if(run>=200 && !best){ var r2=collectFrom(start,run+1); if(r2.known>=3) best={label:'scan@'+start,cs:r2.cs}; }
  });
  return best;
}

function run(){
  var base=mod.base;
  g_name=nf(I_NAME,'pointer',['pointer']); g_ns=nf(I_NS,'pointer',['pointer']); g_mname=nf(I_MNAME,'pointer',['pointer']);
  try{g_fname=nf(I_FNAME,'pointer',['pointer']);}catch(e){}

  // diagnostics: hexdump the candidate globals for offline analysis
  [0x68efb20,0x68efb70].forEach(function(r){ var h=hex(base.add(r),64); if(h) send({hexdump:{rva:'0x'+r.toString(16),bytes:Array.from(new Uint8Array(h))}}); });

  var T=findTable(base);
  if(!T){ send({error:'class table not located'}); flush(); return; }
  var classes=T.cs;
  send({log:'[enum] via '+T.label+' -> '+classes.length+' classes'});

  var seed=null; for(var i=0;i<classes.length&&!seed;i++){ var s=rs(g_name(classes[i])); if(s==='Object'||s==='String') seed=classes[i]; }
  var probe=seed||classes[0];
  function pick(cands,val){ for(var c=0;c<cands.length;c++){ var gi=cands[c]; try{ var fn=nf(gi,'pointer',['pointer','pointer']); var it=Memory.alloc(PS); it.writePointer(NULL); var good=0,tot=0,m; while(!(m=fn(probe,it)).isNull()&&tot<40){tot++; if(val(m))good++;} if(tot>0&&good>=Math.max(2,tot-2)) return {idx:gi,fn:fn}; }catch(e){} } return null; }
  var M=pick(METHODS_CANDS,function(m){var s=rs(g_mname(m));return s&&(isId(s)||KM[s]);});
  var F=g_fname?pick(FIELDS_CANDS,function(f){var s=rs(g_fname(f));return s&&isId(s);}):null;
  if(F&&M&&F.idx===M.idx)F=null;
  send({log:'[cal] methods='+(M?M.idx:-1)+' fields='+(F?F.idx:-1)});

  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// enum='+T.label+'; name=35 namespace=36 methods='+(M?M.idx:-1)+' method_name=112 fields='+(F?F.idx:-1));
  emit('// RVA = MethodInfo.methodPointer - base('+base+'). IL2CPP has no C# source; bodies empty by nature. Not fabricated.');
  var nC=0,nM=0,nF=0,seen={};
  for(var ci=0;ci<classes.length;ci++){ var k=classes[ci],key=k.toString(); if(seen[key])continue; seen[key]=1;
    var cn=rs(g_name(k)); if(!isId(cn))continue; var cns=rs(g_ns(k)); nC++;
    emit(''); if(cns)emit('namespace '+cns+' {'); var ind=cns?'  ':'';
    emit(ind+'class '+cn+' {');
    if(F){ try{var fit=Memory.alloc(PS);fit.writePointer(NULL);var ff; while(!(ff=F.fn(k,fit)).isNull()){var fn=rs(g_fname(ff));if(fn){emit(ind+'  field '+fn+';');nF++;}if(nF%4000===0)flush();}}catch(e){} }
    if(M){ try{var mit=Memory.alloc(PS);mit.writePointer(NULL);var mm; while(!(mm=M.fn(k,mit)).isNull()){var mn=rs(g_mname(mm));var rva='?';try{var mp=mm.readPointer();if(looksPtr(mp))rva='0x'+mp.sub(base).toString(16);}catch(e){} if(mn){emit(ind+'  method '+mn+'();  // RVA '+rva);nM++;}if(nM%4000===0)flush();}}catch(e){} }
    emit(ind+'}'); if(cns)emit('}');
    if(nC%1000===0){flush();send({progress:{classes:nC,methods:nM,fields:nF}});}
  }
  flush();
  send({dumped:true,classes:nC,methods:nM,fields:nF,enum:T.label,calib:{methods:(M?M.idx:-1),fields:(F?F.idx:-1)}});
}

var tries=0;
var timer=setInterval(function(){ tries++;
  if(mod==null){ mod=Process.findModuleByName(MOD); if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);}); send({log:'[cal] module loaded base='+mod.base}); }
  try{ var p=nf(11,'pointer',[])(); if(p&&!p.isNull()){ var s=rs(p.readPointer()); if(s&&s.toLowerCase().indexOf('mscorlib')===0){ clearInterval(timer); send({log:'[cal] il2cpp ready after '+tries+' ticks'}); try{run();}catch(e){send({error:'run threw: '+e+'\n'+(e.stack||'')});flush();} return; } } }catch(e){}
  if(tries>240){clearInterval(timer);send({error:'corlib not ready'});} else if(tries%10===0)send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
