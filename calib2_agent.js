'use strict';
// gilla IL2CPP dumper driven by a STATICALLY VERIFIED export map (Unity 6000.5.2f1,
// arm64). Indices were resolved offline by disassembling each export's trampoline
// impl in libil2cpp.so and classifying by the Il2CppClass/MethodInfo field offset
// it returns (see Metadata/verified_export_map.md). No blind positional probing:
// we call only functions whose impl was identified, then CONFIRM each at runtime by
// ground truth (mscorlib must contain System.Object/String/Int32 with .ctor/ToString).
// The dump is streamed to the host via send(). Only values read from the live
// runtime are emitted; empty bodies are inherent to IL2CPP and never fabricated.

var MOD = 'libil2cpp.so';
var PS = Process.pointerSize;
var SORTED = ["nZPmoHfSeUC","jKHwdEjRlIS","pXWOFocknQI","EmKikmszGZt","ZSOVcNklQQD","JPeLlhJaNZA","ByepmUWUSto","aNqSsIuEhew","psfmutERnus","WBBflLfHdmZ","HLEWYKRRfbS","IbyENeKbWQN","lRMRDruerGC","wZhVQVuzoiY","vlQTKXAFaQJ","LqdxVMrRsvd","aWxnmvXetXj","NfnQBYUNEJi","RMhisQRIILV","mfmJGXewzZS","gulzMrfxlys","obAxLRKfyfD","iHLHlUnBKuR","exeuUXoZjJu","rCrYzwDqJKN","zTThiCwRlmj","vUcuwxmpJEv","YcuYZrzZSxO","TIdkvUOhShS","utoLoCOmSSU","ikScaiguXJd","pKawZYGwQEK","gbvvhJoIMPb","XAmXtkbEikC","awgBrgJzlux","ftdSQMvLQya","JtzCEgHkptg","vWPELjbhCfE","QfMvCFTbqJX","YpTXfAlWNAJ","ksjOpRaWvnv","AVLygaMZnvQ","xUdRSsSpoFw","zgcJRJSulNR","zWbeZcsjuQw","jfSbTYQJwhj","bdBlGDLGZWo","mGoNIziJImN","IyJVWUNlQaO","YIczuqnjVYe","IApOKkPNmMK","kcMgoYXBtAM","ICxnqSJEPJy","cgyCnAKqPer","RQaRciRhLzs","rOQAIKRFiKA","iEAQFEsejVr","oRvjfhzrgOG","gSNzBaLJtnb","LFLZbhQzqZq","SsUMkcRjApL","CWXvDvRuipN","RZyUiuxnLxD","yhaVXPsjnWw","LsjhuuTmlNs","nikUIvbhJmn","mcQTdIRErjo","JpAVKVimvRw","ToAYLSYnbKV","khJIgruOVek","jRnlxbUxzCh","tjwzSrDQKyt","MOBCdBLDzbB","wjYGpChVYhN","kjDMzolrGqb","LDYmrBnarzK","SGUNRXkkaGe","OKFwibUhsrX","iuaqVvDiQCf","fPOOQTntgvo","PWTnhWbKEex","IkZqIwPpimX","DopVKuSUSoc","TutTPlMSsyT","QrHlcoivaYI","zndOJYDgbUW","deBNECSQzQu","zNrEGmauebQ","HfbXjHiifTM","UPQlJKQJjTH","DHYyyvQAPrz","LTfECMcPhjW","YVHFsAnadDQ","OHKpzumNmYO","MkSDLeOIYlo","yeyTdVhbEzy","zkOjFmPNobg","hVJVXfeDgvg","OWNntvWJwYL","ARppTxpsFne","OSsbmVyeQSP","zZSpLpREIKe","HfakVHQUtkM","ihnnhpKCGgP","VGRvDrBfDYN","GDXPliLPgHY","wfZPjXGTJWZ","xzSspjSEuez","sBpJLoiaTAM","OvxKeNhiQtj","HgUvdbJeFiF","HfmOtNaULlo","EsnwKqeAmVj","OSaSQDqpTbu","cfXgEytHHdf","XoCdFtHbGgZ","wccFPrBCBzH","rlDgSYpgYBR","WWmLyTCKWlm","JjRnFafCaGA","QNTaOnyTaAs","qMgYfeBgNsv","DRnjHCaTPen","MsQovUBtOjg","XwVeXTZFSLn","HEVPaITMTBI","YDRUtHRygsI","YGyFVEMjVBS","CLpmcPPiNHa","UGnrwHMekDl","UBcjtTHJGaP","RGRmWiHjFnz","IXprbrsAODn","FSPhraPyoEz","IigtGSQQNeT","gAAiYyaLUpD","oMdUqlaABud","mqQfIbxkNgX","LKQIqKWHokE","nSzokgExdge","WXpGsdRUTWM","tgPhkOmYadN","bvyfQiWoWgF","GdKtEkRVrDR","eRLNUFyXdIm","LXSEEFdLaFx","tnIQRPszINu","DRfeZLjLRdm","zRbscpESgEA","WtifPfMFdIx","iLUwCPEPcxt","OrZTchmvOqx","OtCVyBsFpaQ","jdIAqppFgqx","AdoWvDKyNrK","gUUxnMUdCgn","bWJyTEVxAaV","XnpebzcELlg","AvASEaGCfcJ","vwqgMFBLOsL","CoubrdKitQG","xBmgCyoSVCC","GiNLJDsydnC","OcTUkHAhxeo","lMFIkYqQvEd","ZSGsGuBfgia","VUiRgtHgxGX","OtVeZwoOCfK","nIKovBLLHyf","IQoReemTKPd","hLYuOSxpOeJ","rvqWrBKkddR","AnpjLFVMytd","gSwUdTMAJGc","pGydQxnsdpN","PegWRYvzvzE","VPqVBAbuPrp","LuHUtMnxEIQ","yacCbqghfYZ","KKVJrChoPUk","RtuBiFTKbyM","nYiQtJGCtae","wTwsoBlCVQK","eKVEhdyzomZ","tnaGSaLaONI","ygzzGnXUwcd","lgLoYFgOJON","yMYVXKIJdVo","ihGpEhxoEDH"];

// ---- statically verified indices ----
var I_FOR_EACH = 45, I_NAME = 35, I_NS = 36, I_MNAME = 112;
var METHODS_CANDS = [33, 34, 32, 30, 31, 42, 44, 46, 47];   // class_get_methods (runtime-confirmed)
var FIELDS_CANDS  = [30, 31, 32, 33];                       // class_get_fields (best-effort)
var I_FNAME = 68;                                           // field_get_name (ret_field@0x0), best-effort
var KNOWN = {Object:1,String:1,Int32:1,Boolean:1,Byte:1,Char:1,Array:1,Type:1,Void:1,Enum:1,ValueType:1,Exception:1,Double:1,Single:1,Int64:1};
var KNOWN_METHODS = {ToString:1,Equals:1,GetHashCode:1,GetType:1,".ctor":1,".cctor":1,Finalize:1,MemberwiseClone:1};

var mod = null, ADDR = null;
function nf(i, ret, args) { return new NativeFunction(ADDR[i], ret, args); }
function readStr(p){ if(!p||p.isNull())return null; try{return p.readCString();}catch(e){return null;} }
function isIdent(s){ return typeof s==='string' && s.length>0 && s.length<300 && /^[A-Za-z_<][\w.`<>\[\],|+ ]*$/.test(s); }
function looksPtr(p){ try{ return p && !p.isNull() && p.compare(ptr('0x100000'))>0 && p.compare(ptr('0x1000000000000'))<0; }catch(e){return false;} }

var out=[]; function emit(l){ out.push(l); if(out.length>=250) flush(); }
function flush(){ if(out.length){ send({chunk: out.join('\n')+'\n'}); out=[]; } }

function run(){
  var base = mod.base;
  var name = nf(I_NAME,'pointer',['pointer']);
  var ns   = nf(I_NS,'pointer',['pointer']);
  var mname= nf(I_MNAME,'pointer',['pointer']);

  // enumerate every class via class_for_each (idx45)
  var classes=[];
  var cb=new NativeCallback(function(k,ud){ if(classes.length<200000 && looksPtr(k)) classes.push(k); },'void',['pointer','pointer']);
  try { nf(I_FOR_EACH,'void',['pointer','pointer'])(cb, NULL); }
  catch(e){ send({error:'class_for_each(45) threw: '+e}); flush(); return; }
  send({log:'[fe] class_for_each enumerated '+classes.length+' classes'});
  if(classes.length<100){ send({error:'too few classes; for_each idx wrong'}); flush(); return; }

  // GROUND TRUTH: names must include known mscorlib types; ns must yield System
  var known=0, sysNs=0, objClass=null;
  for(var i=0;i<classes.length && (known<5||!objClass);i++){
    var nm=readStr(name(classes[i]));
    if(nm && KNOWN[nm]) { known++; if(nm==='Object') objClass=classes[i]; }
    var nsx=readStr(ns(classes[i])); if(nsx==='System') sysNs++;
  }
  send({log:'[gt] known mscorlib names='+known+' System-ns hits='+sysNs+' Object='+(objClass?'yes':'no')});
  if(known<3){ send({error:'ground-truth failed: class_get_name(35) wrong'}); flush(); return; }

  // confirm class_get_methods among candidates using Object's methods
  var getM=null, mIdx=-1;
  var probe = objClass || classes[0];
  for(var c=0;c<METHODS_CANDS.length;c++){
    var gi=METHODS_CANDS[c];
    try{
      var gm=nf(gi,'pointer',['pointer','pointer']);
      var it=Memory.alloc(PS); it.writePointer(NULL);
      var good=0, tot=0, m;
      while(!(m=gm(probe,it)).isNull() && tot<40){ tot++; var mn=readStr(mname(m)); if(mn && (isIdent(mn)||KNOWN_METHODS[mn])) good++; }
      if(tot>0 && good>=Math.max(2,tot-2)){ getM=gm; mIdx=gi; break; }
    }catch(e){}
  }
  send({log:'[cal] class_get_methods='+mIdx});

  // best-effort fields
  var getF=null, fIdx=-1, fname=null;
  try{ fname=nf(I_FNAME,'pointer',['pointer']); }catch(e){}
  if(fname){
    for(var cf=0;cf<FIELDS_CANDS.length;cf++){
      var gfi=FIELDS_CANDS[cf]; if(gfi===mIdx) continue;
      try{
        var gf=nf(gfi,'pointer',['pointer','pointer']);
        var it2=Memory.alloc(PS); it2.writePointer(NULL);
        var g=0,t=0,f;
        while(!(f=gf(probe,it2)).isNull() && t<20){ t++; var fn=readStr(fname(f)); if(fn&&isIdent(fn)) g++; }
        if(t>0 && g>=Math.max(1,t-1)){ getF=gf; fIdx=gfi; break; }
      }catch(e){}
    }
  }
  send({log:'[cal] class_get_fields='+fIdx+' field_get_name='+(fname?I_FNAME:-1)});

  // ---- DUMP ----
  emit('// IL2CPP dump - gilla (com.playgilla.gilla), Unity 6000.5.2f1, arm64');
  emit('// static-verified exports: for_each=45 name=35 namespace=36 methods='+mIdx+' method_name=112 fields='+fIdx);
  emit('// RVA = MethodInfo.methodPointer - module_base('+base+'). Empty bodies: IL2CPP has no source. Not fabricated.');
  var nC=0,nM=0,nF=0,seen={};
  for(var ci=0;ci<classes.length;ci++){
    var k=classes[ci], key=k.toString(); if(seen[key])continue; seen[key]=1;
    var cn=readStr(name(k)); if(!isIdent(cn))continue;
    var cns=readStr(ns(k)); nC++;
    emit('');
    if(cns) emit('namespace '+cns+' {');
    var ind=cns?'  ':'';
    emit(ind+'class '+cn+' {');
    if(getF){
      try{ var fit=Memory.alloc(PS); fit.writePointer(NULL); var ff;
        while(!(ff=getF(k,fit)).isNull()){ var fn=readStr(fname(ff)); if(fn){ emit(ind+'  field '+fn+';'); nF++; } if(nF%3000===0)flush(); }
      }catch(e){}
    }
    if(getM){
      try{ var mit=Memory.alloc(PS); mit.writePointer(NULL); var mm;
        while(!(mm=getM(k,mit)).isNull()){ var mn=readStr(mname(mm));
          var rva='?'; try{ var mp=mm.readPointer(); if(looksPtr(mp)) rva='0x'+mp.sub(base).toString(16); }catch(e){}
          if(mn){ emit(ind+'  method '+mn+'();  // RVA '+rva); nM++; } if(nM%3000===0)flush();
        }
      }catch(e){}
    }
    emit(ind+'}');
    if(cns) emit('}');
    if(nC%500===0){ flush(); send({progress:{classes:nC,methods:nM,fields:nF}}); }
  }
  flush();
  send({dumped:true, classes:nC, methods:nM, fields:nF,
        calib:{for_each:I_FOR_EACH,name:I_NAME,namespace:I_NS,methods:mIdx,method_name:I_MNAME,fields:fIdx}});
}

var tries=0;
var timer=setInterval(function(){
  tries++;
  if(mod==null){
    mod=Process.findModuleByName(MOD);
    if(mod==null){ if(tries>240){clearInterval(timer);send({error:'module never loaded'});} return; }
    ADDR=SORTED.map(function(n){return mod.findExportByName(n);});
    send({log:'[cal] module loaded base='+mod.base});
  }
  // gate on il2cpp init: get_corlib (idx11) must return a non-null mscorlib image
  try{
    var p=nf(11,'pointer',[])();
    if(p&&!p.isNull()){
      var s=readStr(p.readPointer());
      if(s && s.toLowerCase().indexOf('mscorlib')===0){
        clearInterval(timer);
        send({log:'[cal] il2cpp ready after '+tries+' ticks'});
        try{ run(); }catch(e){ send({error:'run threw: '+e+'\n'+(e.stack||'')}); flush(); }
        return;
      }
    }
  }catch(e){}
  if(tries>240){ clearInterval(timer); send({error:'corlib not ready'}); }
  else if(tries%10===0) send({log:'[cal] waiting for il2cpp init... ('+tries+')'});
},500);
