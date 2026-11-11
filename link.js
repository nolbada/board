/* 보드 연동: 보드에서 열린 활동 앱의 점수와 사용 시간을 보드 서버로 보내고, 보드로 돌아가는 버튼을 단다.
   보드에서 이름을 누르고 연 경우에만 동작한다(주소에 bn, bc가 붙어 있음). 그 외에는 아무것도 하지 않는다.
   앱 쪽에서는 <script src=".../board/link.js" data-app="vk"> 한 줄과, 한 판이 끝날 때 BoardLink.score("vk",{p:정답률,ok:통과여부,d:Day}) 호출만 있으면 된다. */
(function(){try{
  var W=window,D=document;if(W.__bl)return;W.__bl=1;
  var cs=D.currentScript,APP=(cs&&cs.getAttribute("data-app"))||"";if(!APP)return;
  var SRV="https://script.google.com/macros/s/AKfycbyGjwU2UXP8hoRLn0VThkus7bj_ZnGc12ByvFXuFDVtPSz-GmyumnDd2CkLSBWJw81I/exec";
  var BOARD="https://nolbada.github.io/board/?back=1",IDLE_MIN=10;
  var ss,ls;try{ss=W.sessionStorage;ls=W.localStorage;ls.getItem("x")}catch(e){return}
  var q=new URLSearchParams(location.search),bn=q.get("bn"),bc=q.get("bc");
  if(bn){
    try{ss.setItem("bl-who",JSON.stringify({n:bn,c:bc||""}))}catch(e){}
    try{q.delete("bn");q.delete("bc");var qs=q.toString();history.replaceState(null,"",location.pathname+(qs?"?"+qs:"")+location.hash)}catch(e){}
  }
  var who=null;try{who=JSON.parse(ss.getItem("bl-who")||"null")}catch(e){}
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
      pend.splice(0).forEach(applyScore);
      dirty=true;
    }).catch(function(){loading=false});
  }
  function applyScore(o){
    st.n=(st.n||0)+1;
    if(o.p!=null)st.p=o.p;
    if(o.ok!=null)st.ok=o.ok?1:0;
    if(o.d!=null)st.d=o.d;
    st.t=hm();dirty=true;
  }
  function stop(){stopped=true;try{ss.removeItem("bl-who")}catch(e){}var b=D.getElementById("bl-back");if(b)b.remove()}
  function report(keep){
    if(stopped)return;
    if(!valid()){stop();return}
    if(iso()!==date){date=iso();got=false;st=null;card=null;load();return}
    if(!got){load();return}
    if(!acc&&!dirty)return;
    st.s+=acc;acc=0;st.t=hm();dirty=false;
    card["a_"+APP]=JSON.stringify(st);
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
    if(!D.body||D.getElementById("bl-back"))return;
    var b=D.createElement("a");b.id="bl-back";b.textContent="‹ 보드";b.href=BOARD;
    b.style.cssText="position:fixed;left:8px;bottom:12px;z-index:2147483000;background:#1d2b36;color:#fff;font:700 14px/1 sans-serif;padding:11px 15px;border-radius:22px;text-decoration:none;opacity:.92;box-shadow:0 2px 8px rgba(0,0,0,.25)";
    b.addEventListener("click",function(){try{report(true);ls.setItem("bd-t",String(Date.now()))}catch(e){}});
    D.body.appendChild(b);
  }
  if(D.body)mk();else D.addEventListener("DOMContentLoaded",mk);
  load();
}catch(e){}})();
