/* 261117h: 학생 기록 받기(a=get, a=getm)는 Firebase 에서 바로 답한다(서버를 거치지 않는다).
   표식 문서(_on)가 없거나 실패·2.5초 초과면 원래 요청을 그대로 서버로 보낸다. 저장(put)과 선생님용 요청(pw 가 붙은 것)은 건드리지 않는다. */
(function(){try{
  var W=window;if(W.__bfs||!W.fetch||!W.Response)return;W.__bfs=1;var of=W.fetch;
  var DB='projects/h-roadmap/databases/(default)/documents/';
  function dn(smp,key){return DB+(smp?'board_s':'board')+'/'+String(key).replace(/%/g,'%25').replace(/\//g,'%2F')}
  function chkOf(x){try{return JSON.parse((x.found.fields.chk&&x.found.fields.chk.stringValue)||'{}')}catch(e){return {}}}
  function ask(names){var ac=W.AbortController?new AbortController():null,tm=ac?setTimeout(function(){ac.abort()},2500):0;
    return of.call(W,'https://firestore.googleapis.com/v1/projects/h-roadmap/databases/(default)/documents:batchGet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({documents:names}),signal:ac?ac.signal:undefined})
      .then(function(r){clearTimeout(tm);return r.ok?r.json():null}).catch(function(){clearTimeout(tm);return null})}
  var ONX=[0,0];W.__bdn=dn;
  function resp(o){return new W.Response(JSON.stringify(o),{status:200,headers:{'Content-Type':'application/json'}})}
  W.fetch=function(u,o){
    try{
      if(typeof u==='string'&&!o&&u.indexOf('AKfycbyGjwU2U')>0){
        var q=u.split('?')[1]||'',p={};q.split('&').forEach(function(kv){var i=kv.indexOf('=');if(i>0)p[kv.slice(0,i)]=decodeURIComponent(kv.slice(i+1))});
        if((p.a==='get'||p.a==='getm')&&!p.pw){
          var name=String(p.name||'').trim(),smp=/^샘플/.test(name),ds=p.a==='get'?[String(p.date||'')]:String(p.dates||'').split(','),okd=/^\d{4}-\d{1,2}-\d{1,2}$/,seen={},dup=false;
          ds.forEach(function(d){if(seen[d])dup=true;seen[d]=1});
          if(name&&name.length<=12&&ds.length&&ds.length<=12&&!dup&&ds.every(function(d){return okd.test(d)})){
            /* 261117 밤: 이 문서를 "바뀌면 알려 주기"로 지켜보는 중이면(아래 __bsnap) 받아 둔 최신 내용으로 바로 답한다. Firebase 를 다시 읽지 않는다 */
            if(p.a==='get'&&W.__bsnap){var lk=dn(smp,ds[0]+'|'+name),lc=smp?'board_s':'board';
              if(W.__bsnap.live[lc]&&Object.prototype.hasOwnProperty.call(W.__bsnap.d,lk))return Promise.resolve(resp({ok:true,chk:W.__bsnap.d[lk]||{},fs:2}))}
            /* 261117 밤: "Firebase 가 원본" 표시(_on)는 한 번 확인하면 10분 동안 다시 읽지 않는다(하루 읽기 횟수를 절반 가까이 줄임) */
            var sk=smp?1:0,need=!(ONX[sk]>Date.now()),off=need?1:0;
            var names=(need?[dn(smp,'_on')]:[]).concat(ds.map(function(d){return dn(smp,d+'|'+name)})),self=this,args=arguments;
            return ask(names).then(function(a){
              if(!Array.isArray(a)||a.length!==names.length)return of.apply(self,args);
              var by={},i;for(i=0;i<a.length;i++){var x=a[i];if(x.found)by[x.found.name]=x;else if(!x.missing)return of.apply(self,args)}
              if(need){if(!by[names[0]])return of.apply(self,args);ONX[sk]=Date.now()+600000}
              if(p.a==='get'){var g=by[names[off]];return resp({ok:true,chk:g?chkOf(g):{},fs:1})}
              var recs={};ds.forEach(function(d,j){var g2=by[names[j+off]];recs[d]=g2?chkOf(g2):{}});return resp({ok:true,recs:recs,fs:1})});
          }
        }
      }
      /* 261121: 저장(put)도 Firebase 에 바로 쓴다(구글 서버를 거치지 않는다). 표식(_on) 확인·충돌 재시도는 서버와 같은 방식.
         어느 단계든 실패하면 원래 요청을 그대로 서버로 보낸다. 선생님용(pw)은 건드리지 않는다. */
      if(typeof u==='string'&&u.indexOf('AKfycbyGjwU2U')>0&&o&&o.method==='POST'&&typeof o.body==='string'&&!W.__bnoput){
        var pb=null;try{pb=JSON.parse(o.body)}catch(e2){}
        if(pb&&pb.a==='put'&&!pb.pw){var s2=this,a2=arguments;
          return fsPut(pb).then(function(ok){return ok?resp({ok:true,fs:1}):of.apply(s2,a2)},function(){return of.apply(s2,a2)})}
      }
    }catch(e){}
    return of.apply(this,arguments);
  };
  function p1(m,pl){var ac=W.AbortController?new AbortController():null,tm=ac?setTimeout(function(){ac.abort()},4000):0;
    return of.call(W,'https://firestore.googleapis.com/v1/projects/h-roadmap/databases/(default)/documents:'+m,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pl),keepalive:true,signal:ac?ac.signal:undefined})
      .then(function(r){return r.text().then(function(t){clearTimeout(tm);return {c:r.status,b:t}})},function(e){clearTimeout(tm);throw e})}
  function fsPut(p){
    var name=String(p.name||'').trim(),date=String(p.date||''),cls=String(p.cls||''),card=String(p.card||'reg');
    if(!name||name.length>12||!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date))return Promise.resolve(false);
    var smp=/^샘플/.test(name),sk=smp?1:0,key=dn(smp,date+'|'+name),chk=p.chk||{},tries=0;
    function once(){
      var need=!(ONX[sk]>Date.now()),names=(need?[dn(smp,'_on')]:[]).concat([key]);
      return p1('batchGet',{documents:names}).then(function(r){
        if(r.c!==200)return false;
        var a;try{a=JSON.parse(r.b)}catch(e){return false}
        if(!Array.isArray(a)||a.length!==names.length)return false;
        var by={},i;for(i=0;i<a.length;i++){var x=a[i];if(x.found)by[x.found.name]=x.found;else if(!x.missing)return false}
        if(need){if(!by[names[0]])return false;ONX[sk]=Date.now()+600000}
        var cur=by[key],c={},seq=Date.now();
        if(cur){try{c=JSON.parse((cur.fields.chk&&cur.fields.chk.stringValue)||'{}')}catch(e){c={}}if(cur.fields.seq&&cur.fields.seq.integerValue)seq=Number(cur.fields.seq.integerValue)}
        c[card]=chk;
        var f={date:{stringValue:date},cls:{stringValue:cls},name:{stringValue:name},chk:{stringValue:JSON.stringify(c)},t:{stringValue:new Date().toISOString()},seq:{integerValue:String(seq)}};
        return p1('commit',{writes:[{update:{name:key,fields:f},currentDocument:cur?{updateTime:cur.updateTime}:{exists:false}}]}).then(function(r2){
          if(r2.c===200)return true;
          if(/FAILED_PRECONDITION|ALREADY_EXISTS|ABORTED/.test(r2.b)&&++tries<8)return new Promise(function(res){setTimeout(res,80+Math.random()*250*tries)}).then(once);
          return false})
      })}
    return once();
  }
}catch(e){}})();
/* 보드 연동: 보드에서 열린 활동 앱의 점수와 사용 시간을 보드 서버로 보내고, 보드로 돌아가는 버튼을 단다.
   보드에서 이름을 누르고 연 경우에만 동작한다(주소에 bn, bc가 붙어 있음). 그 외에는 아무것도 하지 않는다.
   앱 쪽에서는 <script src=".../board/link.js" data-app="vk"> 한 줄과, 한 판이 끝날 때 BoardLink.score("vk",{p:정답률,ok:통과여부,d:Day}) 호출만 있으면 된다. */
(function(){try{
  var W=window,D=document;if(W.__bl)return;W.__bl=1;
  var cs=D.currentScript,APP=(cs&&cs.getAttribute("data-app"))||"";if(!APP)return;
  /* M1·M2 Reading 화면: 연 Reading 번호를 바로 보드에 남긴다(끝내기 전에도 "Reading N"이 보이게) */
  var OPENR=0;try{var _rm=/\/m[12]-reading\/reading_(\d+)\.html/.exec(location.pathname);if(_rm&&(APP==="m1"||APP==="m2"))OPENR=+_rm[1]}catch(e){}
  var SRV="https://script.google.com/macros/s/AKfycbyGjwU2UXP8hoRLn0VThkus7bj_ZnGc12ByvFXuFDVtPSz-GmyumnDd2CkLSBWJw81I/exec";
  var BOARD="https://nolbada.github.io/board/?back=1",IDLE_MIN=10;
  var ss,ls;try{ss=W.sessionStorage;ls=W.localStorage;ls.getItem("x")}catch(e){return}
  var q=new URLSearchParams(location.search),bn=q.get("bn"),bc=q.get("bc");
  if(bn){
    try{ss.setItem("bl-who",JSON.stringify({n:bn,c:bc||""}))}catch(e){}
    try{q.delete("bn");q.delete("bc");var qs=q.toString();history.replaceState(null,"",location.pathname+(qs?"?"+qs:"")+location.hash)}catch(e){}
  }
  var who=null;try{who=JSON.parse(ss.getItem("bl-who")||"null")}catch(e){}
  if(!who||!who.n){var bn2=ls.getItem("bd-name"),bc2=ls.getItem("bd-cls")||"";if(bn2){who={n:bn2,c:bc2};try{ss.setItem("bl-who",JSON.stringify(who))}catch(e){}}}
  if(!who||!who.n)return;
  /* 지금 보드에 들어와 있는 학생과 같을 때만 기록한다. 다른 학생이 이어 쓰거나 10분 넘게 손을 안 댔으면 멈춘다 */
  function valid(){
    var n=ls.getItem("bd-name"),t=+ls.getItem("bd-t")||0;
    return n===who.n&&Date.now()-t<=IDLE_MIN*60000;
  }
  if(!valid()){try{ss.removeItem("bl-who")}catch(e){}return}
  function pad(n){return("0"+n).slice(-2)}
  function iso(){var d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function hm(){var d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())}
  var date=iso(),st=null,card=null,got=false,acc=0,dirty=false,pend=[],stopped=false,loading=false;
  function load(){
    if(loading)return;loading=true;
    fetch(SRV+"?a=get&date="+date+"&name="+encodeURIComponent(who.n)).then(function(r){return r.json()}).then(function(j){
      if(!j||!j.ok)throw 0;
      card=(j.chk&&j.chk.app)||{};
      var o={};try{o=JSON.parse(card["a_"+APP]||"{}")}catch(e){}
      st=o&&typeof o==="object"?o:{};st.s=+st.s||0;st.n=+st.n||0;
      got=true;loading=false;
      if(OPENR&&+st.d!==OPENR){st.d=OPENR;delete st.p;delete st.ok}
      pend.splice(0).forEach(applyScore);
      dirty=true;if(OPENR)setTimeout(function(){report(false)},1500);
    }).catch(function(){loading=false});
  }
  var AN={bd:"비단챌",rd:"독해33권",vk:"V시그널 K",ve:"V시그널 E",vy:"V시그널 Y",xr:"문장 엑스레이",m1:"M1 리딩",m2:"M2 리딩",g2v1:"중2 문법(기출)"};
  function lastRec(o){
    var d=o.d,ok=o.ok,w,nx="",nn=(+d||0)+1,chk=null;
    if(APP==="vk"||APP==="ve"){w=AN[APP]+" Day "+d+(APP==="ve"?" 7문장 완료":(ok?" 통과":" 한번 더")+(o.p!=null?" "+o.p+"%":""));nx=ok?(nn<=64?AN[APP]+" Day "+nn:AN[APP]+" 끝"):AN[APP]+" Day "+d+" 다시"}
    else if(APP==="m1"||APP==="m2"){w=AN[APP]+" Reading "+d+(ok?" 통과":" 다시 도전");nx=ok?"":AN[APP]+" Reading "+d+" 다시";
      if(ok)chk=fetch("https://nolbada.github.io/via/"+(APP==="m1"?"m1-reading":"m2-reading")+"/reading_"+("0"+nn).slice(-2)+".html",{method:"HEAD"}).then(function(r){nx=r.ok?AN[APP]+" Reading "+nn:AN[APP]+" 끝"}).catch(function(){})}
    else if(APP==="vy"){w="V시그널 Y Day "+d+" 7문장 완성";var nd=null;
      try{var ds=DAYS.map(function(x){return x.d}).sort(function(a,b){return a-b}),dn=JSON.parse(ls.getItem("vsig-y-day-v1")||"{}");nd="";for(var i=0;i<ds.length;i++){if(ds[i]>d&&!dn["D"+ds[i]]){nd=ds[i];break}}}catch(e){}
      nx=nd===null?"":(nd?"V시그널 Y Day "+nd:"V시그널 Y 끝")}
    else if(APP==="g2v1"){w=AN[APP]+" "+d+"단원"+(ok?" 통과":" 다시")+(o.p!=null?" "+o.p+"%":"");nx=ok?"":AN[APP]+" "+d+"단원 다시"}
    else if(APP==="xr"){w=AN[APP]+" "+d+(o.m!=null?" 실수 "+o.m+"개":"");nx=ok?"":d+" 다시"}
    else if(APP==="rd"||APP==="bd"||APP==="vl"||APP==="dv"||APP==="dd"){w=o.w;nx=""}
    else return;
    (chk||Promise.resolve()).then(function(){
      lr=JSON.stringify({w:w,nx:nx,t:hm(),d:date});dirty=true;report(false);
      return fetch(SRV+"?a=get&date=2000-01-01&name="+encodeURIComponent(who.n)).then(function(r){return r.json()}).then(function(j){
        var cd=(j&&j.chk&&j.chk.app)||{};cd["l_"+APP]=lr;
        return fetch(SRV,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify({a:"put",date:"2000-01-01",cls:who.c,name:who.n,card:"app",chk:cd})});
      });
    }).catch(function(){});
  }
  var lr=null;
  function applyScore(o){
    st.n=(st.n||0)+1;
    if(o.p!=null)st.p=o.p;
    if(o.ok!=null)st.ok=o.ok?1:0;
    if(o.w)st.w=o.w;if(o.d!=null)st.d=o.d;
    /* 261117: 비단챌·독해는 그날 끝낸 묶음을 하나만 남기지 않고 차례로 쌓는다(최대 15개). 보드 첫 화면 "비단챌 숙제 기록"에 쓴다 */
    if(o.w&&(APP==="bd"||APP==="rd"||APP==="dd")){var L0=Array.isArray(st.l)?st.l:[];if(!L0.length||L0[L0.length-1].w!==o.w)L0.push({w:String(o.w).slice(0,60),t:hm()});st.l=L0.slice(-15)}if(o.m!=null)st.m=o.m;if(o.secs)st.s=(+st.s||0)+(+o.secs||0);
    st.t=hm();dirty=true;
    lastRec(o);
  }
  function stop(){stopped=true;try{ss.removeItem("bl-who")}catch(e){}var b=D.getElementById("bl-back");if(b)b.remove()}
  /* 묶어 저장(261118): 화면을 닫거나 보드로 돌아갈 때(keep)는 바로 보내고, 그 밖에는 20초에 한 번만 보낸다. 그 사이 바뀐 것은 다음 번에 한꺼번에 간다 */
  var lastRep=0,repT=null,GAP=20000;
  function report(keep){
    if(stopped)return;
    if(!keep&&got){
      var wait=GAP-(Date.now()-lastRep);
      if(wait>0){if(!repT)repT=setTimeout(function(){repT=null;report(false)},wait+50);return}
    }
    if(repT){clearTimeout(repT);repT=null}
    if(!valid()){stop();return}
    if(iso()!==date){date=iso();got=false;st=null;card=null;load();return}
    if(!got){load();return}
    if(!acc&&!dirty)return;
    st.s+=acc;acc=0;st.t=hm();dirty=false;lastRep=Date.now();
    card["a_"+APP]=JSON.stringify(st);if(lr)card["l_"+APP]=lr;
    var body={a:"put",date:date,cls:who.c,name:who.n,card:"app",chk:card};
    fetch(SRV,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body),keepalive:!!keep}).catch(function(){dirty=true});
  }
  W.BoardLink={score:function(app,o){
    if(stopped||app!==APP)return;o=o||{};
    if(got)applyScore(o);else{pend.push(o);load()}
    report(false);
  }};
  /* 사용 시간: 화면이 보이고 30초 안에 손을 댄 시간만 센다 */
  var last=Date.now(),IDLE=30000,tick=0;
  function act(){last=Date.now()}
  ["pointerdown","keydown","scroll","touchstart","click"].forEach(function(e){D.addEventListener(e,act,{passive:true,capture:true})});
  setInterval(function(){
    if(stopped||D.visibilityState!=="visible"||Date.now()-last>IDLE)return;
    acc++;tick++;
    if(tick%30===0){try{ls.setItem("bd-t",String(Date.now()))}catch(e){}}
    if(tick===12||tick%60===0)report(false);
  },1000);
  D.addEventListener("visibilitychange",function(){if(D.visibilityState==="hidden")report(true)});
  W.addEventListener("pagehide",function(){report(true)});
  function mk(){
    if(W.top!==W)return;
    if(!D.body||D.getElementById("bl-back"))return;
    var b=D.createElement("a");b.id="bl-back";b.textContent="‹ 보드";b.href=BOARD;
    b.style.cssText="position:fixed;left:8px;bottom:12px;z-index:2147483000;background:#1d2b36;color:#fff;font:700 14px/1 sans-serif;padding:11px 15px;border-radius:22px;text-decoration:none;opacity:.92;box-shadow:0 2px 8px rgba(0,0,0,.25)";
    b.addEventListener("click",function(){try{report(true);ls.setItem("bd-t",String(Date.now()))}catch(e){}});
    D.body.appendChild(b);
  }
  if(!(cs&&cs.hasAttribute("data-noback"))){if(D.body)mk();else D.addEventListener("DOMContentLoaded",mk)}
  /* 독해 M1·M2: 앱이 localStorage의 <앱>-res 에 남기는 결과 {번호:{p,ok,t}}를 2초마다 살펴, 보드로 아직 안 넘긴 것만 그 자리에서 보낸다.
     목록 화면이든 Reading 화면이든 이 파일이 붙어 있으면 끝내는 순간 번호가 넘어간다. 넘긴 것은 학생별로 이 기기에 기억한다 */
  var RESK={m1:"m1-res",m2:"m2-res"}[APP];
  if(RESK){
    var SK="bl-snap-"+APP,RK="bl-rep-"+APP,snap=null,rep=null;
    try{snap=JSON.parse(ss.getItem(SK)||"null")}catch(e){}
    try{rep=JSON.parse(ls.getItem(RK)||"null")}catch(e){}
    var resNow=function(){var cur={},now={};try{cur=JSON.parse(ls.getItem(RESK)||"{}")||{}}catch(e){}Object.keys(cur).forEach(function(k){var o=cur[k]||{};now[k]=[o.p,o.ok?1:0,o.t||0].join("|")});return {cur:cur,now:now}};
    var r0=resNow();
    if(!rep||rep.n!==who.n||!rep.m){var base={};if(snap){base=snap}else{var lk=+(ls.getItem(APP+"-last")||0);if(!r0.now[lk]){lk=0;Object.keys(r0.now).forEach(function(k){if(+k>lk)lk=+k})}Object.keys(r0.now).forEach(function(k){if(+k!==lk)base[k]=r0.now[k]})}rep={n:who.n,m:base}}
    var resChk=function(){
      if(stopped)return;var r=resNow(),ch=false;
      Object.keys(r.now).sort(function(x,y){return x-y}).forEach(function(k){if(rep.m[k]!==r.now[k]){var o=r.cur[k]||{};rep.m[k]=r.now[k];ch=true;W.BoardLink.score(APP,{p:o.p,ok:o.ok,d:+k,secs:o.t})}});
      if(ch){try{ls.setItem(RK,JSON.stringify(rep))}catch(e){}setTimeout(function(){srvPut(resNow().cur)},1500)}
    };
    resChk();try{ls.setItem(RK,JSON.stringify(rep))}catch(e){}
    /* 261123: 통과 기록을 이름 기준으로 서버(2000-01-01 문서 r_<앱>)에 쌓고, 이 기기에 없으면 되살린다. 서버 기록은 줄지 않는다 */
    var RP="r_"+APP,STK=APP+"-st",LSK=APP+"-last",GU=function(){return SRV+"?a=get&date=2000-01-01&name="+encodeURIComponent(who.n)};
    var mergeRes=function(a,b){var o={};[a,b].forEach(function(s){Object.keys(s||{}).forEach(function(k){var y=s[k],x=o[k];if(!y||typeof y!=="object")return;if(!x||(y.ok&&!x.ok)||(!!y.ok===!!x.ok&&(+y.p||0)>(+x.p||0)))o[k]=y})});return o};
    var srvPut=function(res){
      if(stopped||!res||!Object.keys(res).length)return;
      return fetch(GU()).then(function(r){return r.json()}).then(function(j){
        if(!j||!j.ok)return;var cd=(j.chk&&j.chk.app)||{},old={};try{old=JSON.parse(cd[RP]||"{}")||{}}catch(e){}
        var s=JSON.stringify(mergeRes(old,res));if(s===cd[RP])return;cd[RP]=s;
        return fetch(SRV,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify({a:"put",date:"2000-01-01",cls:who.c,name:who.n,card:"app",chk:cd})})
      }).catch(function(){})
    };
    var restore=function(){
      fetch(GU()).then(function(r){return r.json()}).then(function(j){
        if(!j||!j.ok||stopped)return;var cd=(j.chk&&j.chk.app)||{},rem={};try{rem=JSON.parse(cd[RP]||"{}")||{}}catch(e){}
        var loc=resNow().cur,m=mergeRes(rem,loc);
        var add=Object.keys(m).filter(function(k){return JSON.stringify(m[k])!==JSON.stringify(loc[k])});
        if(add.length){
          ls.setItem(RESK,JSON.stringify(m));
          var sv={};try{sv=JSON.parse(ls.getItem(STK)||"{}")||{}}catch(e){}
          add.forEach(function(k){if(m[k].ok)sv[k]=3;rep.m[k]=[m[k].p,m[k].ok?1:0,m[k].t||0].join("|")});
          ls.setItem(STK,JSON.stringify(sv));ls.setItem(RK,JSON.stringify(rep));
          if(!ls.getItem(LSK)){var mx=0;Object.keys(m).forEach(function(k){if(m[k].ok&&+k>mx)mx=+k});if(mx)ls.setItem(LSK,String(mx))}
          var fk="bl-rst2-"+APP;if(!ss.getItem(fk)){ss.setItem(fk,"1");location.reload();return}
        }
        srvPut(m)
      }).catch(function(){})
    };
    restore();
    setInterval(resChk,2000);
  }
  if(APP==="vy"){
    var YK="vsig-y-day-v1",SKY="bl-snap-vy";
    var ydone=function(){var o={};try{o=JSON.parse(ls.getItem(YK)||"{}")}catch(e){}return Object.keys(o).filter(function(k){return /^D\d+$/.test(k)})};
    var ys=null;try{ys=JSON.parse(ss.getItem(SKY)||"null")}catch(e){}
    if(!ys){ys=ydone();try{ss.setItem(SKY,JSON.stringify(ys))}catch(e){}}
    setInterval(function(){ydone().forEach(function(k){if(ys.indexOf(k)<0){ys.push(k);try{ss.setItem(SKY,JSON.stringify(ys))}catch(e){}W.BoardLink.score("vy",{d:+k.slice(1),ok:true})}})},2000);
  }
  if(APP==="rd"){
    var KV=W.KEY||"",EX=/\/exit\//.test(location.pathname);
    var BN=(D.title||KV).replace(/\s*Exit Test\s*$/i,"").trim();
    var MT=W.META||{};
    var nm=function(u,pid,no){return((MT.secs&&MT.secs[u])||u||"")+" "+((MT.labs&&MT.labs[pid])||no||"")};
    if(!EX){
      var BKK=KV+"bk",SKB2="bl-snap-bk-"+KV,CC="①②③④⑤⑥⑦⑧⑨⑩";
      var bkIn=function(p){var r=[];(p.qs||[]).forEach(function(s,qi){if(!s.opts||!s.opts.length)return;var n=s.opts.length,mk=s.opts.map(function(o){var m=/^(T|F)\b/.exec(o[3]||"");return m?m[1]:null});
        if(mk.every(Boolean)){r.push({qi:qi,s:s,kind:"tf",ans:mk});return}
        if(!(n>=2&&s.opts.every(function(o,k){return o[0]===CC.charAt(k)})))return;
        var ok=[];s.opts.forEach(function(o,k){var t=o[3]||"";if(!/^오답/.test(t)&&/^정답|^[^.。]{0,10}\(정답/.test(t))ok.push(k)});
        if(ok.length===1)r.push({qi:qi,s:s,kind:"mc",ans:ok[0]});else if(ok.length>=2&&ok.length<n)r.push({qi:qi,s:s,kind:"ms",ans:ok})});return r};
      var bkCmp=function(){var all={},res=[];try{all=JSON.parse(ls.getItem(BKK)||"{}")||{}}catch(e){}
        (W.P||[]).forEach(function(p){var st=all[p.id];if(!st||!st.sub)return;var bi=bkIn(p),tot=bi.length;if(!tot)return;var wr=[],ok=0;
          bi.forEach(function(it){var v=(st.a||{})[it.qi],g=false;if(v!=null){if(it.kind==="mc")g=v===it.ans;else if(it.kind==="ms")g=Array.isArray(v)&&v.length===it.ans.length&&it.ans.every(function(a){return v.indexOf(a)>=0});else g=it.ans.every(function(a,k){return v[k]===a})}
            if(g)ok++;else{var m=/(\d+)번/.exec(it.s.at||"");wr.push(m?m[1]:String(it.qi+1))}});
          res.push([p,ok,tot,wr])});return res};
      var bs0=null;try{bs0=JSON.parse(ss.getItem(SKB2)||"null")}catch(e){}
      if(!bs0){try{bs0=bkCmp().map(function(x){return x[0].id})}catch(e){bs0=[]}try{ss.setItem(SKB2,JSON.stringify(bs0))}catch(e){}}
      setInterval(function(){try{bkCmp().forEach(function(x){if(bs0.indexOf(x[0].id)<0){bs0.push(x[0].id);try{ss.setItem(SKB2,JSON.stringify(bs0))}catch(e){}
        W.BoardLink.score("rd",{w:BN+" "+nm(x[0].u,x[0].id,x[0].no)+" 책 문제 "+x[1]+"/"+x[2]+(x[3].length?" · 틀림 "+x[3].map(function(n){return "("+n+")"}).join(""):" · 전부 정답")})}})}catch(e){}},2000);
    }
    if(EX){
      var seenX=null;
      setInterval(function(){
        try{
        var dn=W.done||{},ps=W.P||[],first=!seenX;if(first)seenX={};
        Object.keys(dn).forEach(function(pid){
          var r=dn[pid];if(!r||typeof r.s!=="number")return;
          var sig=r.s+":"+JSON.stringify(r.ok||{});if(seenX[pid]===sig)return;seenX[pid]=sig;if(first)return;
          var p=null;ps.forEach(function(x){if(x.id===pid)p=x});
          var wr=[];if(p&&p.items)p.items.forEach(function(it){if(!(r.ok||{})[it.n])wr.push(it.n)});
          W.BoardLink.score("rd",{w:BN+" "+(p?nm(p.u,pid,p.no):pid)+" Exit test "+(r.s*10)+"점 ("+r.s+"/10) "+(r.s*10>=70?"통과":"재도전")+(wr.length?" · 틀림 "+wr.map(function(n){return "("+n+")"}).join(""):"")});
        });
        }catch(e){}
      },1500);
    }else{
      var SKR="bl-snap-rd-"+KV;
      var cmp=function(){
        var dn={},U0=W.U||{},r=[];try{dn=JSON.parse(ls.getItem(KV+"done")||"{}")||{}}catch(e){}
        Object.keys(U0).forEach(function(u){(U0[u]||[]).forEach(function(p){var c=p.core||[];if(!c.length)return;for(var i=0;i<c.length;i++)if(!dn[p.id+"-c"+i])return;r.push([p.id,nm(u,p.id,p.no)])})});
        return r;
      };
      var sn=null;try{sn=JSON.parse(ss.getItem(SKR)||"null")}catch(e){}
      if(!sn){sn=cmp().map(function(x){return x[0]});try{ss.setItem(SKR,JSON.stringify(sn))}catch(e){}}
      setInterval(function(){
        var cur=cmp(),ids=cur.map(function(x){return x[0]});
        cur.forEach(function(x){if(sn.indexOf(x[0])<0)W.BoardLink.score("rd",{w:BN+" "+x[1]+" 완료"})});
        if(ids.join()!==sn.join()){sn=ids;try{ss.setItem(SKR,JSON.stringify(sn))}catch(e){}}
      },2000);
    }
  }
  if(APP==="bd"){
    var BK=(W.BDC&&W.BDC.book)||"",BMX=(W.BDC&&W.BDC.theme&&W.BDC.theme.max)||0,BID=(location.pathname.split("/bidanchael/")[1]||"").split("/")[0];
    if(BK){
      var KB="bdc_"+BK+"_v1",SKB="bl-snap-bd-"+BK;
      var bs=function(){var m={},s={},rc={};
        try{s=JSON.parse(ls.getItem(KB)||"{}")||{}}catch(e){}
        try{rc=JSON.parse(ls.getItem("bc_rec_"+BID)||"{}")||{}}catch(e){}
        Object.keys(s.m2||{}).forEach(function(b){if(s.m2[b]){var a=+b,z=Math.min(a+9,BMX||a+9),sc="";try{var qs=((W.BDC.blocks||{})[b]||{}).quiz||[],ok=0;qs.forEach(function(q){var x=(s.q||{})[q.no];if(x&&x.ok===true)ok++});if(qs.length)sc=" · 10문제 "+ok+"/"+qs.length}catch(e){}m["m"+b]="비단챌 "+BK+" "+a+"~"+z+"번 완료"+sc}});
        Object.keys(rc).forEach(function(r){var a=(+r)*10+1;m["r"+r]="비단챌 "+BK+" 보충 "+a+"~"+(a+9)+"번 오답 "+((rc[r]||{}).w||0)+"개"});
        return m};
      var bn=null;try{bn=JSON.parse(ss.getItem(SKB)||"null")}catch(e){}
      if(!bn){bn=bs();try{ss.setItem(SKB,JSON.stringify(bn))}catch(e){}}
      setInterval(function(){var c=bs(),ch=false;
        Object.keys(c).forEach(function(k){if(bn[k]!==c[k]){bn[k]=c[k];ch=true;W.BoardLink.score("bd",{w:c[k]})}});
        if(ch){try{ss.setItem(SKB,JSON.stringify(bn))}catch(e){}}
      },2000);
    }
  }
  if(APP==="dv"){
    var WNX=W.WN;
    if(WNX&&typeof WNX.hw==="function"&&!WNX.__bl){
      var OH=WNX.hw;WNX.__bl=1;
      WNX.hw=function(lv,dy,sc){
        try{var s0=String(sc),pr=/\/\d+$/.test(s0);W.BoardLink.score("dv",{d:+dy,w:"데일리보카 "+lv+" Day "+dy+(pr?" 제출 완료 · "+s0:" 진행 중")})}catch(e){}
        return OH.apply(this,arguments);
      };
    }
  }
  load();
}catch(e){}})();

/* 261125: vita 연결 - 학생 홈에서 활동을 눌러 들어온 경우에만 "← 오늘의 학습" 바와 완료 기록을 쓴다. 내용은 vita/nav.js 한 곳에만 있고, 여기서는 불러오기만 한다. 홈에서 들어오지 않았으면 아무것도 하지 않는다. */
(function(){try{
  if(window.__vnav||sessionStorage.getItem('vita-in')!=='1')return;
  var s=document.createElement('script');s.src='https://nolbada.github.io/vita/nav.js';(document.head||document.documentElement).appendChild(s);
}catch(e){}})();
