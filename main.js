(function(){
var ids=["index","about","programs","how-we-work","gallery","donate","contact","admin"];
function show(h){
 if(ids.indexOf(h)<0)h="index";
 ids.forEach(function(i){var e=document.getElementById("p-"+i);if(e){if(i===h){e.removeAttribute("hidden");e.style.display="block"}else{e.setAttribute("hidden","");e.style.display="none"}}});
 var links=document.querySelectorAll("nav a");
 for(var k=0;k<links.length;k++){links[k].classList.toggle("on",links[k].getAttribute("href")==="#"+h)}
 try{window.scrollTo(0,0)}catch(e){}
}
document.addEventListener("click",function(ev){
 var a=ev.target.closest?ev.target.closest("a"):null;
 if(!a)return;
 var href=a.getAttribute("href")||"";
 if(href.charAt(0)==="#"&&ids.indexOf(href.slice(1))>-1){ev.preventDefault();show(href.slice(1))}
});
show(location.hash.slice(1)||"index");
})();

(function(){
document.querySelectorAll(".pay dd").forEach(function(d){
 if(d.textContent.charAt(0)==="[")return;
 var b=document.createElement("button");b.className="cp";b.type="button";b.textContent="Copy";
 b.onclick=function(){try{navigator.clipboard.writeText(d.firstChild.textContent).then(function(){b.textContent="Copied";setTimeout(function(){b.textContent="Copy"},1500)})}catch(e){}};
 d.appendChild(b);
});
})();

(function(){
var d=document;
d.documentElement.classList.add("js");
var sel=".box,.pay,.tease,.steps li,.glance div,.final h2,.final p,blockquote,.tl div,.kenya>div,.pg h1,.pg .lead,section>.wrap>h2";
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;t.classList.add("in");io.unobserve(t);setTimeout(function(){t.classList.remove("rv","in");t.style.removeProperty("--d")},1200)})},{threshold:.12});
d.querySelectorAll(sel).forEach(function(t){if(t.closest(".hd"))return;var i=Array.prototype.indexOf.call(t.parentNode.children,t);t.style.setProperty("--d",Math.min(i,6)*.09+"s");t.classList.add("rv");io.observe(t)});
d.addEventListener("pointermove",function(e){var b=e.target.closest?e.target.closest(".box,.pay"):null;if(!b)return;var r=b.getBoundingClientRect();b.style.setProperty("--mx",e.clientX-r.left+"px");b.style.setProperty("--my",e.clientY-r.top+"px")});
var hd=d.querySelector(".hd"),orbs=[];
[[".hd",-60,-80,"#E3A72F",.3,260],[".hd",null,null,"#4FB07A",.28,320],[".final",null,null,"#E3A72F",.22,240]].forEach(function(c,i){var host=d.querySelector(c[0]);if(!host)return;var o=d.createElement("div");o.className="orb";o.style.cssText="width:"+c[5]+"px;height:"+c[5]+"px;background:"+c[3]+";opacity:"+c[4]+";"+(i==0?"top:-60px;right:8%;":i==1?"bottom:-90px;left:4%;animation-delay:-5s;":"top:-60px;right:12%;");host.insertBefore(o,host.firstChild);if(i<2)orbs.push(o)});
if(hd)hd.addEventListener("pointermove",function(e){var r=hd.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;orbs.forEach(function(o,i){o.style.marginLeft=(x*(i?-70:90))+"px";o.style.marginTop=(y*(i?-50:70))+"px"})});
var bar=d.getElementById("bar");addEventListener("scroll",function(){var h=d.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+"%"},{passive:true});
d.querySelectorAll(".glance b").forEach(function(b){var m=b.textContent.match(/^(\d{1,2})(\D.*)$/);if(!m)return;var n=+m[1],suf=m[2],o=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;o.disconnect();var t0=performance.now();(function st(t){var p=Math.min((t-t0)/1100,1);b.textContent=Math.max(1,Math.round(n*p))+suf;if(p<1)requestAnimationFrame(st)})(t0)});o.observe(b)});
})();

(function(){
/* ---- settings: fill these three after creating your Supabase project (see supabase-setup.sql) ---- */
var CFG={SUPABASE_URL:"https://prcpdggafjtgqvtmosst.supabase.co",SUPABASE_ANON_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY3BkZ2dhZmp0Z3F2dG1vc3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NDA3ODYsImV4cCI6MjEwNzQxNjc4Nn0.ptM7Vn5khSEyO-z_V-O96QJA_PjNMKI4v_h3F3aPQa0",ADMIN_EMAIL:"josephmusambi2@gmail.com",BUCKET:"photos"};
var IMG_BASE="images/",EXT=[".jpg",".jpeg",".webp",".png"];
var REMOTE=!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&CFG.ADMIN_EMAIL);
var LS="gmf_slots_v1",SS="gmf_admin_session",PREVIEW_HASH=537930444679565;
var PAGES={index:"Home",about:"About",programs:"Programs","how-we-work":"How we work",gallery:"Gallery",donate:"Donate",contact:"Contact"};
var slots={},byslot={},els=[],seen={};

function cyrb(s){var a=0xdeadbeef,b=0x41c6ce57;for(var i=0,c;i<s.length;i++){c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return 4294967296*(2097151&b)+(a>>>0)}

/* ---- collect photo spaces ---- */
document.querySelectorAll(".ph[data-img]").forEach(function(el){
 var pg=(el.closest(".page")||{id:"p-index"}).id.replace("p-",""),k=el.getAttribute("data-x")?"x-"+el.getAttribute("data-x"):pg+"-"+el.getAttribute("data-img");
 if(seen[k]){seen[k]++;k+="-"+seen[k]}else seen[k]=1;
 el.setAttribute("data-slot",k);el.setAttribute("data-page",pg);
 var sp=el.querySelector("span");el.setAttribute("data-def",sp&&sp.lastChild?sp.lastChild.textContent:"");
 byslot[k]=el;els.push(el);
});

/* ---- showing placeholders and photos ---- */
function placeholder(el,text){el.classList.remove("has");el.setAttribute("role","img");el.setAttribute("aria-label","Photo: "+text);el.textContent="";var sp=document.createElement("span"),b=document.createElement("b");b.textContent="Photo here";sp.appendChild(b);sp.appendChild(document.createTextNode(text));el.appendChild(sp)}
function showImg(el,url,text,fail){var im=new Image();im.onload=function(){im.alt=text;im.loading="lazy";el.textContent="";el.appendChild(im);el.classList.add("has");el.removeAttribute("role");el.removeAttribute("aria-label")};im.onerror=fail||function(){};im.src=url}
function localTry(el,text,i){if(i==null){var ds=el.getAttribute("data-src");if(ds)return showImg(el,ds,text,function(){localTry(el,text,0)});i=0}if(i>=EXT.length)return;showImg(el,IMG_BASE+el.getAttribute("data-img")+EXT[i],text,function(){localTry(el,text,i+1)})}
function apply(el){
 var s=slots[el.getAttribute("data-slot")]||{},text=s.label||el.getAttribute("data-def"),gone=!!s.hidden,p=el.parentNode;
 el.classList.toggle("gone",gone);
 if(p&&(p.classList.contains("tease")||p.classList.contains("hero")))p.classList.toggle("solo",gone);
 if(gone)return;
 placeholder(el,text);
 if(s.image_url)showImg(el,s.image_url,text,function(){localTry(el,text)});else localTry(el,text);
}

/* ---- storage: Supabase when configured, otherwise this browser only ---- */
function H(extra){var K=CFG.SUPABASE_ANON_KEY,h={apikey:K},t=tok();if(t)h.Authorization="Bearer "+t;else if(K.indexOf("eyJ")===0)h.Authorization="Bearer "+K;for(var k in extra)h[k]=extra[k];return h}
function tok(){try{var o=JSON.parse(sessionStorage.getItem(SS));if(o&&o.exp>Date.now())return o.t}catch(e){}return null}
function authed(){return REMOTE?!!tok():(function(){try{return sessionStorage.getItem(SS)==="local"}catch(e){return false}})()}
function load(){
 if(REMOTE){
  return fetch(CFG.SUPABASE_URL+"/rest/v1/site_slots?select=*",{headers:H()}).then(function(r){return r.ok?r.json():[]}).then(function(a){a.forEach(function(r){slots[r.slug]={label:r.label,hidden:r.hidden,image_url:r.image_url}})}).catch(function(){});
 }
 try{slots=JSON.parse(localStorage.getItem(LS))||{}}catch(e){slots={}}
 return Promise.resolve();
}
function persist(k){
 var s=slots[k];
 if(!REMOTE){try{localStorage.setItem(LS,JSON.stringify(slots));return Promise.resolve()}catch(e){return Promise.reject(new Error("This browser is out of space. Remove a photo or connect Supabase."))}}
 return fetch(CFG.SUPABASE_URL+"/rest/v1/site_slots",{method:"POST",headers:H({"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify({slug:k,label:s.label||null,hidden:!!s.hidden,image_url:s.image_url||null,updated_at:new Date().toISOString()})}).then(function(r){if(r.status===401||r.status===403){var e=new Error("Your session ended. Sign in again.");e.auth=1;throw e}if(!r.ok)throw new Error("Could not save. Try again.")});
}
function prep(file,max,q){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var r=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej(new Error("Could not read that image."))},"image/jpeg",q)};im.onerror=function(){rej(new Error("That file is not an image."))};im.src=u})}
function upload(k,file){
 if(!REMOTE)return prep(file,1100,.78).then(function(b){return new Promise(function(res){var fr=new FileReader();fr.onload=function(){res(fr.result)};fr.readAsDataURL(b)})});
 return prep(file,1600,.85).then(function(b){var path=k+"-"+Date.now()+".jpg";return fetch(CFG.SUPABASE_URL+"/storage/v1/object/"+CFG.BUCKET+"/"+path,{method:"POST",headers:H({"Content-Type":"image/jpeg","x-upsert":"true"}),body:b}).then(function(r){if(r.status===401||r.status===403){var e=new Error("Your session ended. Sign in again.");e.auth=1;throw e}if(!r.ok)throw new Error("Upload failed. Try again.");return CFG.SUPABASE_URL+"/storage/v1/object/public/"+CFG.BUCKET+"/"+path})});
}
function signIn(pw){
 if(!REMOTE)return new Promise(function(res,rej){if(cyrb(pw)===PREVIEW_HASH){try{sessionStorage.setItem(SS,"local")}catch(e){}res()}else rej(new Error("That password is not right."))});
 return fetch(CFG.SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:CFG.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:CFG.ADMIN_EMAIL,password:pw})}).then(function(r){return r.json().then(function(j){if(!j.access_token)throw new Error("That password is not right.");try{sessionStorage.setItem(SS,JSON.stringify({t:j.access_token,exp:Date.now()+((j.expires_in||3600)-60)*1000}))}catch(e){}})});
}

/* ---- the dashboard ---- */
var root;
function msg(t,bad){var m=document.getElementById("admMsg");if(!m)return;m.textContent=t;m.className=bad?"bad":"ok"}
function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function btn(t,fn,cls){var b=mk("button","abtn"+(cls?" "+cls:""),t);b.type="button";b.onclick=fn;return b}
function fail(e){if(e&&e.auth){try{sessionStorage.removeItem(SS)}catch(x){}render(e.message);return}msg(e&&e.message?e.message:"Something went wrong.",1)}
function change(k,patch,okMsg,again){
 var old=slots[k]||{};slots[k]=Object.assign({},old,patch);
 persist(k).then(function(){apply(byslot[k]);msg(okMsg);if(again)render()}).catch(function(e){slots[k]=old;fail(e)});
}
function render(note){
 root=document.getElementById("admRoot");if(!root)return;root.textContent="";
 if(!authed()){
  var f=mk("form","alogin"),l=mk("label",null,"Admin password"),i=mk("input");i.type="password";i.autocomplete="current-password";i.required=true;i.id="admPw";l.setAttribute("for","admPw");
  var go=mk("button","btn","Sign in");go.type="submit";var er=mk("p","aerr",note||"");er.setAttribute("role","alert");
  f.append(l,i,go,er);
  if(!REMOTE)f.appendChild(mk("p","anote","Preview mode: Supabase is not connected yet, so changes you make here are saved in this browser only and visitors will not see them."));
  f.onsubmit=function(ev){ev.preventDefault();go.disabled=true;signIn(i.value).then(function(){render()}).catch(function(e){go.disabled=false;er.textContent=e.message;i.select()})};
  root.appendChild(f);return;
 }
 var bar=mk("div","abar");
 bar.append(mk("p","anote",REMOTE?"Changes go live for every visitor as soon as they save.":"Preview mode: changes are saved in this browser only. Connect Supabase to publish for everyone."),btn("Sign out",function(){try{sessionStorage.removeItem(SS)}catch(e){}render()},"ghost"));
 root.appendChild(bar);
 var m=mk("p","ok","Edit the text, add a photo, or hide a space. Each change saves on its own.");m.id="admMsg";m.setAttribute("role","status");root.appendChild(m);payAdmin();slidesAdmin();
 Object.keys(PAGES).forEach(function(pg){
  var list=els.filter(function(e){return e.getAttribute("data-page")===pg});if(!list.length)return;
  root.appendChild(mk("h2",null,PAGES[pg]));
  list.forEach(function(el){
   var k=el.getAttribute("data-slot"),s=slots[k]||{},row=mk("div","arow"+(s.hidden?" off":"")),th=mk("div","athumb");
   var src=s.image_url||(el.classList.contains("has")&&el.querySelector("img")?el.querySelector("img").src:"");
   if(src){var im=mk("img");im.src=src;im.alt="";th.appendChild(im)}else th.textContent=s.hidden?"Hidden":"No photo";
   var body=mk("div","abody"),lab=mk("label",null,"Text on this space"),inp=mk("input");inp.type="text";inp.value=s.label||el.getAttribute("data-def");inp.id="t-"+k;lab.setAttribute("for",inp.id);
   inp.onchange=function(){change(k,{label:inp.value.trim()},"Text saved.")};
   var bs=mk("div","abtns"),fi=mk("input");fi.type="file";fi.accept="image/*";fi.hidden=true;
   fi.onchange=function(){var f=fi.files[0];if(!f)return;msg("Uploading...");upload(k,f).then(function(u){change(k,{image_url:u,hidden:false},"Photo saved.",1)}).catch(fail)};
   bs.append(btn(s.image_url?"Replace photo":"Upload photo",function(){fi.click()}),fi);
   if(s.image_url)bs.appendChild(btn("Remove photo",function(){change(k,{image_url:null},"Photo removed.",1)},"ghost"));
   bs.appendChild(btn(s.hidden?"Show this space":"Hide this space",function(){change(k,{hidden:!s.hidden},s.hidden?"Space is back on the site.":"Space hidden from the site.",1)},"ghost"));
   body.append(lab,inp,bs);row.append(th,body);root.appendChild(row);
  });
 });
}


/* ---- payment details (admin controlled, can be switched off) ---- */
var PHONE="+254 724 487430",PTEL="+254724487430";
function pcfg(){var s=slots.payments||{},c={};try{c=JSON.parse(s.label)||{}}catch(e){}return{c:c,on:!!s.label&&!s.hidden}}
function payRender(){
 var b=document.getElementById("payBox");if(!b)return;b.textContent="";var p=pcfg(),c=p.c;
 var gs=[["M-Pesa",[["Paybill / Till",c.till],["Account name",c.mname]]],["Bank transfer",[["Bank",c.bank],["Account name",c.bname],["Account no.",c.bno]]]].map(function(g){return[g[0],g[1].filter(function(r){return r[1]})]}).filter(function(g){return g[1].length});
 var g=mk("div","grid");
 if(p.on&&gs.length){gs.forEach(function(x){var d=mk("div","pay"),dl=mk("dl");d.appendChild(mk("h3",null,x[0]));x[1].forEach(function(r){dl.appendChild(mk("dt",null,r[0]));var dd=mk("dd",null,r[1]),cp=mk("button","cp","Copy");cp.type="button";cp.onclick=function(){try{navigator.clipboard.writeText(r[1]);cp.textContent="Copied";setTimeout(function(){cp.textContent="Copy"},1500)}catch(e){}};dd.appendChild(cp);dl.appendChild(dd)});d.appendChild(dl);g.appendChild(d)})}
 else{var d=mk("div","pay"),q=mk("p",null,"To donate, please call or WhatsApp us on "+PHONE+" and we will guide you step by step.");d.appendChild(mk("h3",null,"Give by phone"));d.appendChild(q);
  var a1=mk("a","btn alt","Call "+PHONE);a1.href="tel:"+PTEL;var a2=mk("a","btn alt","WhatsApp us");a2.href="https://wa.me/"+PTEL.slice(1);a2.target="_blank";a2.rel="noopener";d.append(a1,a2);g.appendChild(d)}
 b.appendChild(g);
}
function payAdmin(){
 var p=pcfg(),c=p.c,box=mk("div","apay");box.appendChild(mk("h2",null,"Payment details"));
 box.appendChild(mk("p","anote","Turn this on to show M-Pesa and bank details on the Donate page. Turned off, visitors only see your phone number."));
 var tl=mk("label","atog"),tg=mk("input");tg.type="checkbox";tg.checked=p.on;tl.append(tg,document.createTextNode(" Show payment details on the Donate page"));box.appendChild(tl);
 var F=[["till","M-Pesa Paybill / Till number"],["mname","M-Pesa account name"],["bank","Bank name"],["bname","Bank account name"],["bno","Bank account number"]],ins={};
 F.forEach(function(f){var l=mk("label",null,f[1]),i=mk("input");i.type="text";i.value=c[f[0]]||"";i.id="pay-"+f[0];l.setAttribute("for",i.id);ins[f[0]]=i;box.append(l,i)});
 function save(){var v={};F.forEach(function(f){v[f[0]]=ins[f[0]].value.trim()});var old=slots.payments;slots.payments={label:JSON.stringify(v),hidden:!tg.checked};
  persist("payments").then(function(){payRender();msg(tg.checked?"Payment details saved and showing on the site.":"Saved. Payment details are hidden; visitors see your phone number.")}).catch(function(e){slots.payments=old;fail(e)})}
 tg.onchange=save;box.appendChild(btn("Save payment details",save));root.appendChild(box);
}

/* ---- home slider photos (upload from admin, no file naming) ---- */
function slidesApply(){document.querySelectorAll(".sl").forEach(function(el,n){var s=slots["slide-"+(n+1)]||{};if(s.image_url){el.dataset.adm=1;el.style.backgroundImage="url("+s.image_url+")"}})}
function slidesAdmin(){
 root.appendChild(mk("h2",null,"Home slider photos"));
 root.appendChild(mk("p","anote","Click Upload on a slide and choose a photo. No renaming needed. Wide landscape photos look best."));
 for(var n=1;n<=4;n++)(function(n){
  var k="slide-"+n,s=slots[k]||{},row=mk("div","arow"),th=mk("div","athumb");
  if(s.image_url){var im=mk("img");im.src=s.image_url;im.alt="";th.appendChild(im)}else th.textContent="No photo";
  var body=mk("div","abody"),bs=mk("div","abtns"),fi=mk("input");fi.type="file";fi.accept="image/*";fi.hidden=true;
  function save(patch,t){var old=slots[k]||{};slots[k]=Object.assign({},old,patch);persist(k).then(function(){slidesApply();msg(t);render()}).catch(function(e){slots[k]=old;fail(e)})}
  fi.onchange=function(){var f=fi.files[0];if(!f)return;msg("Uploading...");upload(k,f).then(function(u){save({image_url:u},"Slide "+n+" photo saved.")}).catch(fail)};
  bs.append(btn(s.image_url?"Replace photo":"Upload photo",function(){fi.click()}),fi);
  if(s.image_url)bs.appendChild(btn("Remove photo",function(){save({image_url:null},"Slide "+n+" photo removed. Reload the page to see the colour slide.")},"ghost"));
  body.append(mk("p",null,"Slide "+n),bs);row.append(th,body);root.appendChild(row);
 })(n);
}
var ready=load().then(function(){els.forEach(apply);payRender();slidesApply();if(document.getElementById("p-admin"))render()});
window.GMF={get slots(){return slots},byslot:byslot,els:els,apply:apply,persist:persist,upload:upload,authed:authed,remote:REMOTE,CFG:CFG,H:H,mk:mk,ready:ready};
document.addEventListener("click",function(ev){var a=ev.target.closest?ev.target.closest("a"):null;if(a&&a.getAttribute("href")==="#admin")setTimeout(render,0)});
})();

(function(){
var d=document,h=d.querySelector("header .wrap"),nav=d.querySelector("nav");
var b=d.createElement("button");b.className="menu";b.type="button";b.setAttribute("aria-label","Open menu");b.setAttribute("aria-expanded","false");b.innerHTML="&#9776;";h.insertBefore(b,h.firstChild);
var sc=d.createElement("div");sc.className="scrim";d.body.appendChild(sc);
function set(o){d.body.classList.toggle("open",o);b.setAttribute("aria-expanded",o);b.innerHTML=o?"&times;":"&#9776;"}
b.onclick=function(){set(!d.body.classList.contains("open"))};sc.onclick=function(){set(false)};
nav.addEventListener("click",function(e){if(e.target.closest("a"))set(false)});
d.addEventListener("keydown",function(e){if(e.key==="Escape")set(false)});
var sl=d.querySelectorAll(".sl"),dt=d.querySelector(".dots"),i=0,t;
if(!sl.length)return;
sl.forEach(function(el,n){
 var ex=[".jpg",".jpeg",".png",".webp"],k=0;(function tr(){if(k>=ex.length)return;var im=new Image();im.onload=function(){if(!el.dataset.adm)el.style.backgroundImage="url(slide"+(n+1)+ex[k]+")"};im.onerror=function(){k++;tr()};im.src="slide"+(n+1)+ex[k]})();
 var x=d.createElement("button");x.type="button";x.setAttribute("aria-label","Slide "+(n+1));x.onclick=function(){go(n);auto()};dt.appendChild(x);
});
function go(n){i=n;sl.forEach(function(e,k){e.classList.toggle("on",k===n)});dt.childNodes.forEach(function(e,k){e.classList.toggle("on",k===n)})}
function auto(){clearInterval(t);t=setInterval(function(){go((i+1)%sl.length)},3000)}
go(0);auto();
})();

(function(){
var d=document,pgs=d.querySelectorAll(".pg");if(!pgs.length)return;
pgs.forEach(function(p){var s=d.createElement("div");s.className="slider";s.setAttribute("aria-hidden","true");for(var i=1;i<=4;i++){var e=d.createElement("div");e.className="sl s"+i+(i===1?" on":"");s.appendChild(e)}p.insertBefore(s,p.firstChild)});
var n=0;setInterval(function(){n=(n+1)%4;pgs.forEach(function(p){p.querySelectorAll(".sl").forEach(function(e,k){e.classList.toggle("on",k===n)})})},3000);
})();
