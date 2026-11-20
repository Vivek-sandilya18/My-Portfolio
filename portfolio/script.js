(function(){
  var doc=document, root=doc.documentElement.style, body=doc.body;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap=typeof gsap!=='undefined';
  if(hasGsap&&typeof ScrollTrigger!=='undefined')gsap.registerPlugin(ScrollTrigger);

  /* ---------- evening palette (sunset -> dusk, never black) ---------- */
  function hex(h){return [1,3,5].map(function(i){return parseInt(h.substr(i,2),16);});}
  function mix(a,b,t){var A=hex(a),B=hex(b);return 'rgb('+A.map(function(v,i){return Math.round(v+(B[i]-v)*t);}).join(',')+')';}
  var A={c1:'#1f3358',c2:'#6b6a86',c3:'#e8855f',c4:'#ffc27a',m1:'#4a3548',m2:'#231a2e',g:'#0a0c12'};
  var B={c1:'#171d45',c2:'#3f3470',c3:'#b0507a',c4:'#f58a5c',m1:'#2c2148',m2:'#1a1433',g:'#07080f'};
  var sun=doc.getElementById('sun'), glow=doc.getElementById('glow'), rays=doc.querySelector('.rays');
  var land=doc.getElementById('land'), hz=doc.getElementById('horizon'), bar=doc.getElementById('progress');
  var P=0,lastP=-1,mx=0,tx=0;

  function paint(){
    var vh=innerHeight, max=Math.max(1,doc.documentElement.scrollHeight-vh);
    P=Math.min(1,scrollY/(max*0.85));
    bar.style.transform='scaleX('+(scrollY/max)+')';
    if(Math.abs(P-lastP)>0.002){
      lastP=P;
      for(var k in A)root.setProperty('--'+k,mix(A[k],B[k],P));
      root.setProperty('--p',P.toFixed(3));
    }
    var horizon=hz.getBoundingClientRect().top;
    var y=horizon-vh*0.40*(1-P)+vh*0.015*P;           /* sun sinks to the horizon */
    sun.style.transform='translate3d('+(mx*-10)+'px,'+(y-sun.offsetHeight/2)+'px,0) scale('+(1+0.3*P)+')';
    glow.style.top=rays.style.top=y+'px';
    land.style.transform='translate3d('+(mx*-18)+'px,0,0) scale(1.03)';
  }

  /* ---------- particles: golden dust, green fireflies, faint stars ---------- */
  var cv=doc.getElementById('fx'), cx=cv.getContext('2d'), S=[],D=[],F=[],M=[];
  function size(){
    cv.width=innerWidth;cv.height=innerHeight;S=[];D=[];F=[];
    for(var i=0;i<Math.round(innerWidth/14);i++)S.push({x:Math.random()*cv.width,y:Math.random()*cv.height*.55,r:Math.random()*1.2+.3,p:Math.random()*6.28,s:Math.random()*.03+.01});
    for(i=0;i<40;i++)D.push({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*2+.6,vy:-(Math.random()*.25+.05),vx:Math.random()*.3-.15,p:Math.random()*6.28});
    for(i=0;i<34;i++)F.push({x:Math.random()*cv.width,y:cv.height*(.6+Math.random()*.38),a:Math.random()*6.28,sp:Math.random()*.01+.004,r:Math.random()*2+1.2,p:Math.random()*6.28});
  }
  function frame(){
    cx.clearRect(0,0,cv.width,cv.height);
    cx.fillStyle='#fbf1de';
    S.forEach(function(s){s.p+=s.s;cx.globalAlpha=P*.5*(.4+.6*Math.abs(Math.sin(s.p)));cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.28);cx.fill();});
    cx.fillStyle='#ffd59a';cx.shadowBlur=14;cx.shadowColor='#ffb25e';
    D.forEach(function(d){d.x+=d.vx;d.y+=d.vy;d.p+=.03;if(d.y<-10){d.y=cv.height+10;d.x=Math.random()*cv.width;}
      cx.globalAlpha=(1-P*.5)*.5*(.4+.6*Math.sin(d.p)*Math.sin(d.p));cx.beginPath();cx.arc(d.x,d.y,d.r,0,6.28);cx.fill();});
    cx.fillStyle='#8cf0a6';cx.shadowColor='#7be495';cx.shadowBlur=18;
    F.forEach(function(f){f.a+=f.sp;f.p+=.04;f.x+=Math.cos(f.a)*.6;f.y+=Math.sin(f.a*1.3)*.4;
      if(f.x<-20)f.x=cv.width+20;if(f.x>cv.width+20)f.x=-20;
      cx.globalAlpha=(.25+.75*P)*Math.max(0,Math.sin(f.p));cx.beginPath();cx.arc(f.x,f.y,f.r,0,6.28);cx.fill();});
    cx.shadowBlur=0;
    if(P>.5&&Math.random()<.003&&M.length<1)M.push({x:Math.random()*cv.width*.7+cv.width*.3,y:Math.random()*cv.height*.25,l:0});
    M=M.filter(function(m){m.x-=10;m.y+=4.4;m.l++;var g=cx.createLinearGradient(m.x,m.y,m.x+100,m.y-44);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');
      cx.globalAlpha=Math.max(0,1-m.l/40);cx.strokeStyle=g;cx.lineWidth=1.6;cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m.x+100,m.y-44);cx.stroke();return m.l<40;});
    cx.globalAlpha=1;
    mx+=(tx-mx)*0.06;
    if(!reduce){paint();requestAnimationFrame(frame);}
  }
  size();paint();frame();
  addEventListener('scroll',function(){if(reduce)requestAnimationFrame(paint);},{passive:true});
  addEventListener('resize',function(){size();paint();});
  addEventListener('mousemove',function(e){tx=e.clientX/innerWidth-.5;});

  /* ---------- hero text: split name into letters ---------- */
  var name=doc.getElementById('name'), txt=name.textContent;
  name.setAttribute('aria-label',txt);
  name.innerHTML=txt.split('').map(function(c){return '<span aria-hidden="true">'+c+'</span>';}).join('');

  function intro(){
    if(!hasGsap||reduce)return;
    var tl=gsap.timeline({defaults:{ease:'power4.out'}});
    tl.from('.pill',{y:30,opacity:0,duration:.8})
      .from('.hi',{y:40,opacity:0,duration:.9},'-=.5')
      .from('#name span',{yPercent:110,rotate:8,opacity:0,duration:1.2,stagger:.09},'-=.6')
      .from('.lead',{y:40,opacity:0,duration:1},'-=.7')
      .from('.scroll',{opacity:0,duration:1},'-=.5');
    gsap.to('#name span',{y:-10,duration:2.6,ease:'sine.inOut',yoyo:true,repeat:-1,stagger:{each:.18,from:'start'},delay:2.5});
  }

  /* ---------- scroll animations ---------- */
  function scrollFx(){
    if(!hasGsap||typeof ScrollTrigger==='undefined'||reduce)return;
    gsap.utils.toArray('.rv').forEach(function(el){
      gsap.from(el,{y:70,opacity:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });
    gsap.utils.toArray('.item').forEach(function(el){
      gsap.from(el,{x:80,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });
    gsap.utils.toArray('.sk span').forEach(function(el,i){
      gsap.from(el,{scale:.6,opacity:0,duration:.6,ease:'back.out(2)',scrollTrigger:{trigger:el.parentNode,start:'top 85%'},delay:(i%8)*.05});
    });
    gsap.from('.tl-line',{scaleY:0,ease:'none',scrollTrigger:{trigger:'.timeline',start:'top 70%',end:'bottom 70%',scrub:true}});
    gsap.to('.marquee .track',{x:'-=200',ease:'none',scrollTrigger:{trigger:'.marquee',start:'top bottom',end:'bottom top',scrub:1}});
    doc.querySelectorAll('[data-n]').forEach(function(el){
      var end=+el.dataset.n,plus=el.dataset.plus,o={v:0};
      ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){
        gsap.to(o,{v:end,duration:1.8,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v)+(plus?'+':'');}});
      }});
    });
  }
  if(!hasGsap)doc.querySelectorAll('[data-n]').forEach(function(el){el.textContent=el.dataset.n+(el.dataset.plus?'+':'');});

  /* ---------- loader ---------- */
  var loader=doc.getElementById('loader'), c=doc.getElementById('count');
  function finish(){loader.classList.add('done');body.classList.remove('loading');intro();scrollFx();setTimeout(paint,50);}
  if(reduce){finish();}else{
    var t0=null;(function go(t){if(!t0)t0=t;var p=Math.min((t-t0)/1600,1);c.textContent=Math.round((1-Math.pow(1-p,3))*100)+'%';if(p<1)requestAnimationFrame(go);else setTimeout(finish,250);})(performance.now());
  }

  /* ---------- active nav + open cursor ---------- */
  var links={};doc.querySelectorAll('header nav a').forEach(function(a){links[a.dataset.s]=a;});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){for(var k in links)links[k].classList.toggle('on',k===e.target.id);}});},{rootMargin:'-45% 0px -50% 0px'});
  ['about','skills','work','contact'].forEach(function(id){io.observe(doc.getElementById(id));});
  var cur=doc.getElementById('cursor');
  addEventListener('mousemove',function(e){cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});
  doc.querySelectorAll('[data-open]').forEach(function(el){
    el.addEventListener('mouseenter',function(){cur.classList.add('show');});
    el.addEventListener('mouseleave',function(){cur.classList.remove('show');});
  });
})();
