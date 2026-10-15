/* Visual editor: edit the real site in place. Admin only; needs main.js (window.GMF). */
(function(){
var G=window.GMF;if(!G)return;
var d=document,FLAG="gmf_edit",mk=G.mk,pending={},editing=false,sel=null,txt=[];
var SEL="h1,h2,h3,h4,p,blockquote,li>b,li>span,.glance b,.glance span,.btn,.hero small,.amts span,.fcol a,.fbar span,.fcol>span";
var SKIP=".ph,#payBox,#p-admin,.flogo,.fwa,.fadm,.brand,nav,.dots,.xtra,#edBar,#edTb,.edadd,.xtxt,.vbox";
var OK={B:1,STRONG:1,I:1,EM:1,U:1,BR:1,A:1};

/* keep only simple formatting and safe links in saved text */
function clean(html){
 var t=d.createElement("template");t.innerHTML=html;
 (function w(n){Array.prototype.slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3)return;if(c.nodeType!==1){c.remove();return}
  if(!OK[c.tagName]){w(c);if(c.tagName==="DIV"&&c.previousSibling)c.parentNode.insertBefore(d.createElement("br"),c);while(c.firstChild)c.parentNode.insertBefore(c.firstChild,c);c.remove();return}
  Array.prototype.slice.call(c.attributes).forEach(function(a){var ok=c.tagName==="A"&&(a.name==="href"||a.name==="target"||a.name==="rel");if(ok&&a.name==="href"&&!/^(https?:|tel:|mailto:|#)/i.test(a.value.trim()))ok=false;if(!ok)c.removeAttribute(a.name)});
  w(c)})})(t.content);
 return t.innerHTML;
}

/* give every editable text a stable key: page + position */
function collect(root){
 var cnt={},out=[];
 root.querySelectorAll(SEL).forEach(function(el){
  if(el.closest(SKIP)||el.querySelector(SEL))return;
  var pg=el.closest(".page"),g=pg?pg.id.replace("p-",""):"footer";
  cnt[g]=(cnt[g]||0)+1;out.push([el,g+"-"+cnt[g]]);
 });
 return out;
}
collect(d).forEach(function(x){x[0].setAttribute("data-ek",x[1]);txt.push(x[0])});
d.querySelectorAll("[data-xt]").forEach(function(el){el.setAttribute("data-ek","xt-"+el.getAttribute("data-xt"));txt.push(el)});
function applyText(){
 txt.forEach(function(el,i){var s=G.slots["txt_"+el.getAttribute("data-ek")];if(!s||s.label==null)return;
  if(el.matches(".glance b")){var c=el.cloneNode(true);el.replaceWith(c);txt[i]=el=c}
  el.innerHTML=clean(s.label)});
}

/* extra photo frames added from the editor */
function frames(){try{return JSON.parse((G.slots.frames||{}).label)||[]}catch(e){return[]}}
function setFrames(a){G.slots.frames={label:JSON.stringify(a),hidden:false};dirty("frames")}
function fx(el){if(el.getAttribute("data-x")&&!editing&&!(G.slots[el.getAttribute("data-slot")]||{}).image_url)el.classList.add("gone")}
function build(f){
 if(G.byslot["x-"+f.id]){fx(G.byslot["x-"+f.id]);return G.byslot["x-"+f.id]}
 var pg=d.getElementById("p-"+f.page),w=pg&&pg.querySelectorAll("section>.wrap")[f.sec];if(!w)return null;
 var xt=w.querySelector(".xtra");if(!xt){xt=mk("div","xtra");var a=w.querySelector(".edadd");a?w.insertBefore(xt,a):w.appendChild(xt)}
 var el=mk("div","ph"),k="x-"+f.id;
 el.setAttribute("data-img",k);el.setAttribute("data-slot",k);el.setAttribute("data-page",f.page);el.setAttribute("data-def","Photo");el.setAttribute("data-x",f.id);
 G.byslot[k]=el;G.els.push(el);xt.appendChild(el);G.apply(el);fx(el);return el;
}
d.querySelectorAll(".page:not(#p-admin) section:not(.pg):not(.hd):not(.final)>.wrap").forEach(function(w){
 var pg=w.closest(".page"),box=mk("div","edadd");
 function loc(){return{id:Date.now().toString(36),page:pg.id.replace("p-",""),sec:Array.prototype.indexOf.call(pg.querySelectorAll("section>.wrap"),w)}}
 function ab(t,fn){var b=mk("button","edb",t);b.type="button";b.onclick=fn;box.appendChild(b)}
 function addT(tag){var f=loc();f.tag=tag;var a=texts();a.push(f);setTexts(a);var el=buildT(f);if(!el)return;var k="txt_xt-"+f.id;G.slots[k]={label:clean(el.innerHTML),hidden:false};dirty(k);select(el);el.focus()}
 ab("+ Add image frame",function(){var f=loc(),a=frames();a.push(f);setFrames(a);var el=build(f);if(el){select(el);fi.click()}});
 ab("+ Add text",function(){addT("p")});
 ab("+ Add heading",function(){addT("h2")});
 w.appendChild(box);
});

/* extra text blocks added from the editor */
function texts(){try{return JSON.parse((G.slots.texts||{}).label)||[]}catch(e){return[]}}
function setTexts(a){G.slots.texts={label:JSON.stringify(a),hidden:false};dirty("texts")}
function buildT(f){
 var ex=d.querySelector('[data-xt="'+f.id+'"]');if(ex)return ex;
 var pg=d.getElementById("p-"+f.page),w=pg&&pg.querySelectorAll("section>.wrap")[f.sec];if(!w)return null;
 var xt=w.querySelector(".xtxt");if(!xt){xt=mk("div","xtxt");var a=w.querySelector(".xtra")||w.querySelector(".edadd");a?w.insertBefore(xt,a):w.appendChild(xt)}
 var el=mk(f.tag==="h2"?"h2":"p"),s=G.slots["txt_xt-"+f.id];
 el.setAttribute("data-xt",f.id);el.setAttribute("data-ek","xt-"+f.id);
 el.innerHTML=s&&s.label!=null?clean(s.label):(f.tag==="h2"?"New heading":"New text");
 xt.appendChild(el);txt.push(el);if(editing)el.contentEditable="true";return el;
}

/* bottom bar + photo toolbar */
var bar=mk("div",null);bar.id="edBar";
var stat=mk("p","st","Click any text to edit it. Click a photo space for photo tools.");
function B(t,fn,g){var b=mk("button",g?"g":"",t);b.type="button";b.onclick=fn;return b}
var aBtn=B("Apply changes",applyAll);
bar.append(mk("b",null,"Editing"),aBtn,B("Discard",function(){if(!count()||confirm("Throw away unsaved changes?")){pending={};location.reload()}},1),B("Download code",bakeCode,1),B("Exit editor",exit,1),stat);
var tb=mk("div",null);tb.id="edTb";
var fi=mk("input");fi.type="file";fi.accept="image/*";fi.hidden=true;
var bDel=B("Delete frame",function(){if(!sel)return;var id=sel.getAttribute("data-x");setFrames(frames().filter(function(f){return f.id!==id}));var k=sel.getAttribute("data-slot");delete G.byslot[k];G.els.splice(G.els.indexOf(sel),1);sel.remove();select(null)},1);
var bHide=B("Hide space",toggleHide,1),bRem=B("Remove photo",function(){patch({image_url:null})},1);
var bUp=B("Upload / replace photo",function(){fi.click()});
var bDelT=B("Delete this text",function(){if(!sel||!sel.hasAttribute("data-xt"))return;var id=sel.getAttribute("data-xt");setTexts(texts().filter(function(f){return f.id!==id}));var i=txt.indexOf(sel);if(i>-1)txt.splice(i,1);var x=sel.parentNode;sel.remove();if(x&&!x.children.length)x.remove();select(null)},1);
tb.append(bUp,bRem,bHide,bDel,bDelT,fi);
d.body.append(bar,tb);
fi.onchange=function(){var f=fi.files[0],el=sel;fi.value="";if(!f||!el)return;say("Uploading photo…");
 G.upload(el.getAttribute("data-slot"),f).then(function(u){patch({image_url:u,hidden:false},el);say("Photo added. Press Apply changes to publish.")}).catch(function(e){say(e.message||"Upload failed",1)})};
function patch(p,el){el=el||sel;if(!el)return;var k=el.getAttribute("data-slot");G.slots[k]=Object.assign({},G.slots[k],p);G.apply(el);dirty(k);place()}
function toggleHide(){if(!sel)return;var h=!(G.slots[sel.getAttribute("data-slot")]||{}).hidden;patch({hidden:h});bHide.textContent=h?"Show space":"Hide space"}
function select(el){if(sel)sel.classList.remove("sel");sel=el;if(el){el.classList.add("sel");var isT=el.hasAttribute("data-xt");bUp.style.display=bRem.style.display=bHide.style.display=isT?"none":"";bDelT.style.display=isT?"":"none";bDel.style.display=!isT&&el.getAttribute("data-x")?"":"none";bHide.textContent=(G.slots[el.getAttribute("data-slot")]||{}).hidden?"Show space":"Hide space"}place()}
function place(){if(!sel||!editing){tb.style.display="none";return}var r=sel.getBoundingClientRect();tb.style.display="flex";tb.style.top=Math.max(8,Math.min(innerHeight-tb.offsetHeight-80,r.top+8))+"px";tb.style.left=Math.max(8,Math.min(innerWidth-tb.offsetWidth-8,r.left+8))+"px"}
addEventListener("scroll",place,{passive:true});addEventListener("resize",place);
function say(t,bad){stat.textContent=t;stat.className="st"+(bad?" bad":"")}
function count(){return Object.keys(pending).length}
function dirty(k){pending[k]=1;aBtn.textContent="Apply changes ("+count()+")"}

/* saving */
function save(ks){
 if(!G.remote)return G.persist(ks[0]);
 var now=new Date().toISOString(),rows=ks.map(function(k){var s=G.slots[k]||{};return{slug:k,label:s.label==null?null:s.label,hidden:!!s.hidden,image_url:s.image_url||null,updated_at:now}});
 return fetch(G.CFG.SUPABASE_URL+"/rest/v1/site_slots",{method:"POST",headers:G.H({"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(rows)}).then(function(r){
  if(r.status===401||r.status===403)throw new Error("Your session ended. Open Admin, sign in again, then press Apply changes.");
  if(!r.ok)throw new Error("Could not save. Check your connection and try again.")});
}
function applyAll(){
 var ks=Object.keys(pending);if(!ks.length){say("Nothing to apply yet.");return}
 aBtn.disabled=true;say("Saving…");
 save(ks).then(function(){
  pending={};aBtn.textContent="Apply changes";
  return syncGit().then(function(on){say(on?"Done. Live site updated and your code saved to GitHub (GitHub Pages can take about a minute to show it).":G.remote?"Done. Your live site is updated.":"Saved in this browser only (Supabase is not connected).")},
   function(err){say("Live site is updated, but saving to GitHub failed: "+(err.message||"unknown error"),1)});
 }).catch(function(err){say(err.message||"Could not save.",1)}).then(function(){aBtn.disabled=false});
}

/* ---- bake every edit into the code files ---- */
function loadZip(){return window.JSZip?Promise.resolve():new Promise(function(ok,no){var s=d.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";s.onload=ok;s.onerror=function(){no(new Error("Could not load the zip tool. Check your connection."))};d.head.appendChild(s)})}
function bake(){
 var imgs={};
 return fetch("index.html",{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("Could not read index.html from the site.");return r.text()}).then(function(src){
  var doc=new DOMParser().parseFromString(src,"text/html");
  doc.querySelectorAll(".xtra,.xtxt").forEach(function(x){x.remove()});
  collect(doc).forEach(function(x){var s=G.slots["txt_"+x[1]];if(s&&s.label!=null)x[0].innerHTML=clean(s.label)});
  var seen={};
  doc.querySelectorAll(".ph[data-img]").forEach(function(el){
   var pg=(el.closest(".page")||{id:"p-index"}).id.replace("p-",""),k=pg+"-"+el.getAttribute("data-img");
   if(seen[k]){seen[k]++;k+="-"+seen[k]}else seen[k]=1;
   bakeSlot(el,k,G.slots[k]||{});
  });
  texts().forEach(function(f){
   var w=doc.getElementById("p-"+f.page);w=w&&w.querySelectorAll("section>.wrap")[f.sec];if(!w)return;
   var xt=w.querySelector(".xtxt");if(!xt){xt=doc.createElement("div");xt.className="xtxt";w.appendChild(xt)}
   var el=doc.createElement(f.tag==="h2"?"h2":"p"),s=G.slots["txt_xt-"+f.id];el.setAttribute("data-xt",f.id);
   el.innerHTML=s&&s.label!=null?clean(s.label):(f.tag==="h2"?"New heading":"New text");xt.appendChild(el);
  });
  frames().forEach(function(f){
   var w=doc.getElementById("p-"+f.page);w=w&&w.querySelectorAll("section>.wrap")[f.sec];if(!w)return;
   var xt=w.querySelector(".xtra");if(!xt){xt=doc.createElement("div");xt.className="xtra";w.appendChild(xt)}
   var el=doc.createElement("div");el.className="ph";el.setAttribute("role","img");el.setAttribute("aria-label","Photo");el.setAttribute("data-img","x-"+f.id);el.setAttribute("data-x",f.id);
   el.innerHTML="<span><b>Photo here</b>Photo</span>";xt.appendChild(el);bakeSlot(el,"x-"+f.id,G.slots["x-"+f.id]||{});
  });
  for(var n=1;n<=4;n++){var s=G.slots["slide-"+n];if(s&&s.image_url)imgs["slide"+n+".jpg"]=s.image_url}
  var names=Object.keys(imgs),html="<!DOCTYPE html>\n"+doc.documentElement.outerHTML;
  return Promise.all(names.map(function(nm){return fetch(imgs[nm]).then(function(r){if(!r.ok)throw new Error("Could not read a photo.");return r.blob()})})).then(function(bl){
   var out={"index.html":new Blob([html],{type:"text/html"})};names.forEach(function(nm,i){out[nm]=bl[i]});return out;
  });
 });
 function bakeSlot(el,k,s){
  if(s.hidden){el.classList.add("gone");var p=el.parentNode;if(p&&(p.classList.contains("tease")||p.classList.contains("hero")))p.classList.add("solo")}
  if(s.label){var sp=el.querySelector("span");if(sp&&sp.lastChild){sp.lastChild.textContent=s.label;el.setAttribute("aria-label","Photo: "+s.label)}el.setAttribute("data-def",s.label)}
  if(s.image_url&&!s.hidden){var path="images/"+k+".jpg";imgs[path]=s.image_url;el.setAttribute("data-src",path)}
 }
}
function bakeCode(){
 say("Preparing your code…");
 Promise.all([bake(),loadZip()]).then(function(a){
  var z=new JSZip();Object.keys(a[0]).forEach(function(f){z.file(f,a[0][f])});
  z.file("READ-ME.txt","Copy index.html, the images folder and any slideN.jpg files into your project (replace the old index.html), then upload to GitHub.\nPayment details are not included; they stay in your admin dashboard.");
  return z.generateAsync({type:"blob"});
 }).then(function(b){var l=d.createElement("a");l.href=URL.createObjectURL(b);l.download="gituma-updated-code.zip";d.body.appendChild(l);l.click();l.remove();say("Downloaded. Copy the files into your project folder and upload to GitHub.")}).catch(function(err){say(err.message||"Could not prepare the code.",1)});
}

/* ---- automatic save to GitHub (token stays in this browser only) ---- */
var GHK="gmf_gh";
function ghcfg(){try{var c=JSON.parse(localStorage.getItem(GHK));return c&&c.repo&&c.token?c:null}catch(e){return null}}
function b64(blob){return new Promise(function(ok,no){var r=new FileReader();r.onload=function(){ok(r.result.split(",")[1])};r.onerror=no;r.readAsDataURL(blob)})}
function gitSha(blob){return blob.arrayBuffer().then(function(buf){var h=new TextEncoder().encode("blob "+buf.byteLength+"\0"),all=new Uint8Array(h.length+buf.byteLength);all.set(h);all.set(new Uint8Array(buf),h.length);return crypto.subtle.digest("SHA-1",all)}).then(function(x){return Array.prototype.map.call(new Uint8Array(x),function(b){return("0"+b.toString(16)).slice(-2)}).join("")})}
function ghx(c,path,opt){opt=opt||{};opt.headers=Object.assign({Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"},opt.headers||{});opt.cache="no-store";return fetch("https://api.github.com/repos/"+c.repo+"/contents/"+path,opt)}
function ghErr(r){if(r.status===401||r.status===403)return new Error("GitHub refused the token. It needs Contents: Read and write on this repo, and must not be expired.");if(r.status===404)return new Error("GitHub could not find that repo. Check the owner/name.");return new Error("GitHub error "+r.status+".")}
function pushOne(c,path,blob){
 return Promise.all([ghx(c,path),gitSha(blob)]).then(function(a){
  var r=a[0];if(r.status!==404&&!r.ok)throw ghErr(r);
  return(r.status===404?Promise.resolve(null):r.json()).then(function(j){
   if(j&&j.sha===a[1])return;
   return b64(blob).then(function(data){var body={message:"Update "+path+" (visual editor)",content:data};if(j&&j.sha)body.sha=j.sha;
    return ghx(c,path,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(w){if(!w.ok)throw ghErr(w)})});
  });
 });
}
function syncGit(){
 var c=ghcfg();if(!c)return Promise.resolve(false);
 say("Updating your code on GitHub…");
 return bake().then(function(files){var p=Promise.resolve();Object.keys(files).forEach(function(f){p=p.then(function(){return pushOne(c,f,files[f])})});return p}).then(function(){return true});
}

/* editing behaviour */
d.addEventListener("input",function(e){var el=editing&&e.target.closest&&e.target.closest("[data-ek]");if(!el)return;var k="txt_"+el.getAttribute("data-ek");G.slots[k]={label:clean(el.innerHTML),hidden:false};dirty(k)});
d.addEventListener("paste",function(e){if(!editing||!e.target.closest||!e.target.closest("[data-ek]"))return;e.preventDefault();d.execCommand("insertText",false,(e.clipboardData||window.clipboardData).getData("text/plain"))});
d.addEventListener("keydown",function(e){if(!editing||e.key!=="Enter"||!e.target.closest||!e.target.closest("[data-ek]"))return;e.preventDefault();if(e.target.closest("p,blockquote"))d.execCommand("insertLineBreak")});
d.addEventListener("click",function(e){
 if(!editing)return;var t=e.target;if(!t.closest)return;
 if(t.closest("#edBar,#edTb,.edadd"))return;
 var a=t.closest("a");if(a&&!a.closest("header")&&!a.classList.contains("fadm")){e.preventDefault();e.stopImmediatePropagation()}
 var ph=t.closest(".ph"),xt=t.closest("[data-xt]");if(ph){e.preventDefault();select(ph)}else if(xt){select(xt)}else if(!t.closest("[data-ek]"))select(null);
},true);
addEventListener("beforeunload",function(e){if(count()){e.preventDefault();e.returnValue=""}});

function enter(){
 if(!G.authed())return;editing=true;d.body.classList.add("editing");
 try{sessionStorage.setItem(FLAG,"1")}catch(e){}
 txt.forEach(function(el){el.contentEditable="true"});
 d.querySelectorAll(".ph[data-x]").forEach(G.apply);
 bar.style.display="flex";
}
function exit(){if(count()&&!confirm("You have unsaved changes. Leave without applying them?"))return;try{sessionStorage.removeItem(FLAG)}catch(e){}pending={};location.reload()}

/* "Open visual editor" card on the Admin page */
var ar=d.getElementById("admRoot");
if(ar){
 var vb=mk("div","vbox"),go=mk("button",null,"Open visual editor");go.type="button";
 var dl=mk("button",null,"Download updated code");dl.type="button";dl.style.marginLeft=".5rem";dl.onclick=bakeCode;
 vb.append(mk("h2",null,"Visual editor"),mk("p",null,"Opens your real website with editing switched on. Click any text to change it, click a photo space to upload, remove or hide a photo, add new image frames, then press Apply changes to publish."),go,dl);
 var gb=mk("div","ghbox");vb.appendChild(gb);
 function drawGh(){
  gb.textContent="";var c=ghcfg();gb.appendChild(mk("h3",null,"Auto-save my code to GitHub"));
  if(c){gb.appendChild(mk("p",null,"Connected to "+c.repo+". Every time you press Apply changes, your code files on GitHub are updated too."));
   var off=mk("button",null,"Disconnect");off.type="button";off.onclick=function(){try{localStorage.removeItem(GHK)}catch(x){}drawGh()};gb.appendChild(off);return}
  gb.appendChild(mk("p",null,"Optional. Paste a GitHub token once and the editor will update your code on GitHub for you. The token is kept only in this browser, never in your website."));
  var r=mk("input"),t=mk("input"),s=mk("button",null,"Connect"),m=mk("p","anote","");
  r.type="text";r.placeholder="owner/repository-name";r.setAttribute("aria-label","GitHub repository");t.type="password";t.placeholder="GitHub token";t.autocomplete="off";t.setAttribute("aria-label","GitHub token");s.type="button";
  s.onclick=function(){var repo=r.value.trim().replace(/^https?:\/\/github\.com\//,"").replace(/\.git$/,"").replace(/\/$/,""),tok=t.value.trim();if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!tok){m.textContent="Enter the repo as owner/name and paste the token.";return}
   m.textContent="Checking…";ghx({repo:repo,token:tok},"index.html").then(function(x){if(!x.ok)throw ghErr(x);try{localStorage.setItem(GHK,JSON.stringify({repo:repo,token:tok}))}catch(z){}drawGh()}).catch(function(er){m.textContent=er.message})};
  gb.append(r,t,s,m);
 }
 drawGh();
 go.onclick=function(){var a=d.createElement("a");a.href="#index";d.body.appendChild(a);a.click();a.remove();enter()};
 ar.parentNode.insertBefore(vb,ar);
 var vis=function(){vb.style.display=G.authed()?"":"none"};
 new MutationObserver(vis).observe(ar,{childList:true});vis();
}

G.ready.then(function(){
 var fl=frames().map(function(f){return f.id}),tl=texts().map(function(f){return f.id});
 d.querySelectorAll(".ph[data-x]").forEach(function(el){if(fl.indexOf(el.getAttribute("data-x"))<0){var k=el.getAttribute("data-slot");delete G.byslot[k];var i=G.els.indexOf(el);if(i>-1)G.els.splice(i,1);el.remove()}});
 d.querySelectorAll("[data-xt]").forEach(function(el){if(tl.indexOf(el.getAttribute("data-xt"))<0){var i=txt.indexOf(el);if(i>-1)txt.splice(i,1);el.remove()}});
 frames().forEach(build);texts().forEach(buildT);applyText();
 var f=null;try{f=sessionStorage.getItem(FLAG)}catch(e){}
 if(f&&G.authed())enter();
});
})();
