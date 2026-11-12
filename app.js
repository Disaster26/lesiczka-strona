(function(){
  var d=document;

  // menu mobilne
  var burger=d.getElementById('burger'), menu=d.getElementById('menu');
  function zamknij(){menu.classList.remove('otw');burger.setAttribute('aria-expanded','false');d.body.style.overflow=''}
  if(burger&&menu){
    burger.addEventListener('click',function(){
      var otw=!menu.classList.contains('otw');
      menu.classList.toggle('otw',otw);burger.setAttribute('aria-expanded',String(otw));d.body.style.overflow=otw?'hidden':'';
    });
    menu.addEventListener('click',function(e){if(e.target.closest('a'))zamknij()});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('otw'))zamknij()});
    window.addEventListener('resize',function(){if(window.innerWidth>980&&menu.classList.contains('otw'))zamknij()});
  }

  // przeciąganie myszą (palec działa natywnie przez przewijanie)
  function przeciagaj(el,klasaNa){
    var x0=0,s0=0,ciag=false,ruch=false;
    el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button'))return;ciag=true;ruch=false;x0=e.clientX;s0=el.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!ciag)return;var dx=e.clientX-x0;if(Math.abs(dx)>4){ruch=true;klasaNa.classList.add('ciag')}if(ruch){el.scrollLeft=s0-dx;e.preventDefault()}});
    window.addEventListener('pointerup',function(){if(!ciag)return;ciag=false;klasaNa.classList.remove('ciag');if(ruch&&el._snap)el._snap();setTimeout(function(){ruch=false},0)});
    el.addEventListener('click',function(e){if(ruch){e.preventDefault();e.stopPropagation()}},true);
    el.addEventListener('dragstart',function(e){e.preventDefault()});
  }

  // karuzele w kartach (1 zdjęcie na ekran)
  d.querySelectorAll('[data-kar]').forEach(function(k){
    var tor=k.querySelector('.tor'), n=tor.children.length, licz=k.querySelector('.licznik');
    var bl=k.querySelector('.kar-btn.l'), bp=k.querySelector('.kar-btn.p');
    function idx(){return Math.round(tor.scrollLeft/tor.clientWidth)}
    function idz(i){i=Math.max(0,Math.min(n-1,i));tor.scrollTo({left:i*tor.clientWidth,behavior:'smooth'})}
    function stan(){var i=idx();if(licz)licz.textContent=(i+1)+'/'+n;if(bl)bl.disabled=i===0;if(bp)bp.disabled=i===n-1}
    tor._snap=function(){idz(idx())};
    tor.addEventListener('scroll',function(){window.requestAnimationFrame(stan)},{passive:true});
    k.querySelectorAll('.kar-btn').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();idz(idx()+ +b.dataset.k)})});
    k.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();idz(idx()+1)}if(e.key==='ArrowLeft'){e.preventDefault();idz(idx()-1)}});
    przeciagaj(tor,k);
    stan();
  });

  // galerie pasmowe (naturalne proporcje zdjęć)
  d.querySelectorAll('[data-pasmo]').forEach(function(p){
    var gal=p.querySelector('.gal'), licz=p.querySelector('.licz'), figs=gal.querySelectorAll('figure');
    var sc=p.dataset.strz?d.getElementById(p.dataset.strz):p;
    var bl=sc.querySelector('[data-g="-1"]'), bp=sc.querySelector('[data-g="1"]');
    przeciagaj(gal,gal);
    function krok(k){var f=figs[0];gal.scrollBy({left:k*Math.max(280,(f?f.getBoundingClientRect().width+14:320)),behavior:'smooth'})}
    function stan(){
      var max=gal.scrollWidth-gal.clientWidth-2;
      if(bl)bl.disabled=gal.scrollLeft<=2; if(bp)bp.disabled=gal.scrollLeft>=max;
      if(licz){var r=gal.getBoundingClientRect(),i=0;figs.forEach(function(f,j){if(f.getBoundingClientRect().left<r.left+r.width*.5)i=j});licz.textContent=(i+1)+' / '+figs.length}
    }
    if(bl)bl.addEventListener('click',function(){krok(-1)});
    if(bp)bp.addEventListener('click',function(){krok(1)});
    gal.addEventListener('scroll',function(){window.requestAnimationFrame(stan)},{passive:true});
    gal.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();krok(1)}if(e.key==='ArrowLeft'){e.preventDefault();krok(-1)}});
    window.addEventListener('resize',stan);stan();
  });

  // filtr kontynentów (kafle i lista krajów)
  d.querySelectorAll('[data-filtry]').forEach(function(g){
    var zakres=d.getElementById(g.dataset.filtry);
    g.querySelectorAll('.filtr').forEach(function(f){
      f.addEventListener('click',function(){
        var k=f.dataset.f;
        g.querySelectorAll('.filtr').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
        zakres.querySelectorAll('[data-k]').forEach(function(t){t.hidden=t.hasAttribute('data-tylko')?(!k||t.dataset.k!==k):(!!k&&t.dataset.k!==k)});
        zakres.querySelectorAll('[data-grupa]').forEach(function(gr){gr.hidden=![].some.call(gr.querySelectorAll('[data-k]'),function(t){return !t.hidden})});
        var p=zakres.querySelector('details.pozost');if(p&&k)p.open=true;
      });
    });
  });

  // film z YouTube dopiero po kliknięciu (bez ciasteczek przed kliknięciem)
  d.querySelectorAll('[data-yt]').forEach(function(b){
    b.addEventListener('click',function(){
      var f=d.createElement('iframe');f.className='yt-ramka';f.title=b.dataset.tytul||'Film';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
      f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0';b.replaceWith(f);
    });
  });

  // podgląd zdjęć w pełnej rozdzielczości: strzałki, palec, klawiatura, powiększenie
  var linki=[].slice.call(d.querySelectorAll('a[data-lb]'));
  if(linki.length){
    var lb=d.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Podgląd zdjęcia');
    lb.innerHTML='<div class="lb-gora"><span class="lb-licz"></span><button class="lb-zamknij" type="button" aria-label="Zamknij podgląd"><svg class="ik" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg></button></div>'+
      '<div class="lb-scena"><img alt=""><button class="lb-nav l" type="button" aria-label="Poprzednie zdjęcie"><svg class="ik"><use href="#s-lewo"/></svg></button><button class="lb-nav p" type="button" aria-label="Następne zdjęcie"><svg class="ik"><use href="#s-prawo"/></svg></button></div>'+
      '<div class="lb-dol"></div>';
    d.body.appendChild(lb);
    var im=lb.querySelector('img'), lic=lb.querySelector('.lb-licz'), dol=lb.querySelector('.lb-dol'), grupa=[], cur=0, ostatni=null, skala=1, tx=0, ty=0;
    function grupaDla(a){var g=a.closest('[data-lb-grupa]');return g?[].slice.call(g.querySelectorAll('a[data-lb]')):[a]}
    function zastosuj(){im.style.transform=skala>1?'translate('+tx+'px,'+ty+'px) scale('+skala+')':'';lb.classList.toggle('zoom',skala>1)}
    function pokaz(i){
      cur=(i+grupa.length)%grupa.length;var a=grupa[cur],img=a.querySelector('img');
      skala=1;tx=ty=0;zastosuj();
      im.src=a.getAttribute('href');im.alt=img?img.alt:'';
      lic.textContent=grupa.length>1?(cur+1)+' / '+grupa.length:'';
      var pod=a.dataset.podpis||'';dol.innerHTML='';if(pod){dol.textContent=pod}
      lb.querySelectorAll('.lb-nav').forEach(function(b){b.hidden=grupa.length<2});
      var nx=grupa[(cur+1)%grupa.length];if(nx){var pre=new Image();pre.src=nx.getAttribute('href')}
    }
    function otworz(a){ostatni=a;grupa=grupaDla(a);lb.classList.add('otw');d.body.style.overflow='hidden';pokaz(grupa.indexOf(a));lb.querySelector('.lb-zamknij').focus()}
    function zamk(){lb.classList.remove('otw');d.body.style.overflow='';im.removeAttribute('src');if(ostatni)ostatni.focus()}
    linki.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();otworz(a)})});
    lb.querySelector('.lb-zamknij').addEventListener('click',zamk);
    lb.querySelector('.lb-nav.l').addEventListener('click',function(){pokaz(cur-1)});
    lb.querySelector('.lb-nav.p').addEventListener('click',function(){pokaz(cur+1)});
    d.addEventListener('keydown',function(e){if(!lb.classList.contains('otw'))return;if(e.key==='Escape')zamk();if(e.key==='ArrowRight')pokaz(cur+1);if(e.key==='ArrowLeft')pokaz(cur-1);
      if(e.key==='Tab'){var f=[].slice.call(lb.querySelectorAll('button:not([hidden])'));var i=f.indexOf(d.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});
    // powiększenie kliknięciem / podwójnym dotknięciem, przesuwanie palcem
    var p0=null,t0=0,ruch=false;
    im.addEventListener('click',function(e){if(ruch)return;if(skala>1){skala=1;tx=ty=0}else{var r=im.getBoundingClientRect();skala=2.2;tx=(r.left+r.width/2-e.clientX)*1.2;ty=(r.top+r.height/2-e.clientY)*1.2}zastosuj()});
    var sc=lb.querySelector('.lb-scena');
    sc.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;p0={x:e.clientX,y:e.clientY,tx:tx,ty:ty};ruch=false;t0=Date.now()});
    sc.addEventListener('pointermove',function(e){if(!p0)return;var dx=e.clientX-p0.x,dy=e.clientY-p0.y;if(Math.abs(dx)>6||Math.abs(dy)>6)ruch=true;if(skala>1&&ruch){tx=p0.tx+dx;ty=p0.ty+dy;zastosuj()}});
    sc.addEventListener('pointerup',function(e){if(!p0)return;var dx=e.clientX-p0.x,dy=e.clientY-p0.y;
      if(skala===1&&ruch&&Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){pokaz(cur+(dx<0?1:-1))}
      else if(skala===1&&ruch&&dy>90&&Math.abs(dy)>Math.abs(dx)){zamk()}
      p0=null;setTimeout(function(){ruch=false},0)});
    sc.addEventListener('click',function(e){if(e.target===sc&&!ruch)zamk()});
  }

  // formularz: w wersji testowej bez wysyłki
  var f=d.getElementById('form');
  if(f&&f.dataset.test==='1')f.addEventListener('submit',function(e){e.preventDefault();d.getElementById('formInfo').hidden=false});

  var rok=d.getElementById('rok');if(rok)rok.textContent=new Date().getFullYear();
})();
