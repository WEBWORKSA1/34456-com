/* 34456.com core: layout, theme, consent, forms, video, utilities */
(function(){
  'use strict';
  var R = document.body.getAttribute('data-root') || '';
  var PAGE = document.body.getAttribute('data-page') || '';

  /* ---------- Site config (edit here) ---------- */
  window.SITE = {
    name: '34456',
    tagline: 'Money, by the numbers',
    interestUrl: 'https://web.works/contact',
    // Optional instant-payment links. Leave '' to use the pledge form only.
    pay: { paypal: '', stripe: '', buymeacoffee: '' }
  };

  /* Inbox is assembled at runtime and never printed on the page. */
  function inbox(){ return ['1askrowbew'.split('').reverse().join(''), 'moc.liamg'.split('').reverse().join('')].join(String.fromCharCode(64)); }
  window.__inbox = inbox;

  /* ---------- Header / footer ---------- */
  var NAV = [
    ['tools/index.html','Tools','tools'],
    ['salary.html','$34,456 Pay','salary'],
    ['guides/index.html','Guides','guides'],
    ['videos.html','Videos','videos'],
    ['contests.html','Contests','contests'],
    ['support.html','Support','support']
  ];
  var hdr = document.getElementById('site-header');
  if (hdr) {
    hdr.className = 'hdr';
    hdr.innerHTML = '<div class="wrap">' +
      '<a class="logo" href="'+R+'index.html" aria-label="34456 home"><span class="ico" aria-hidden="true">#</span><span><b>34·456</b><small>MONEY, BY THE NUMBERS</small></span></a>' +
      '<button class="iconbtn burger" aria-label="Open menu" aria-expanded="false">☰</button>' +
      '<nav class="nav" aria-label="Main">' + NAV.map(function(n){return '<a href="'+R+n[0]+'"'+(PAGE===n[2]?' class="on" aria-current="page"':'')+'>'+n[1]+'</a>';}).join('') +
      '<a class="cta" href="'+R+'get-matched.html">Free Pay Review</a>' +
      '<button class="iconbtn" id="themeBtn" aria-label="Toggle dark/light theme">🌓</button></nav></div>';
    var b = hdr.querySelector('.burger'), nav = hdr.querySelector('.nav');
    b.addEventListener('click', function(){ var o = nav.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  }
  var ftr = document.getElementById('site-footer');
  if (ftr) {
    var y = new Date().getFullYear();
    ftr.className = 'ftr';
    ftr.innerHTML = '<div class="wrap"><div class="grid g4">' +
      '<div><a class="logo" href="'+R+'index.html"><span class="ico">#</span><span><b>34·456</b><small>MONEY, BY THE NUMBERS</small></span></a><p class="muted small">Free salary, paycheck and money calculators, plain-English guides and smart tools that help you earn, keep and grow more. Estimates only — not financial, tax or legal advice.</p></div>' +
      '<div><h4>Calculators</h4><a href="'+R+'salary.html">Salary ↔ Hourly</a><a href="'+R+'tools/take-home.html">Take-Home Pay</a><a href="'+R+'tools/loan.html">Loan &amp; Mortgage</a><a href="'+R+'tools/compound.html">Compound Interest</a><a href="'+R+'tools/budget.html">50/30/20 Budget</a><a href="'+R+'tools/offer.html">Job Offer Compare</a><a href="'+R+'tools/freelance.html">Freelance Rate</a><a href="'+R+'tools/negotiator.html">Raise Script Builder</a><a href="'+R+'tools/number-lab.html">Number Lab</a></div>' +
      '<div><h4>Get involved</h4><a href="'+R+'get-matched.html">Free Pay Review</a><a href="'+R+'contests.html">Contests &amp; Prizes</a><a href="'+R+'careers.html">Careers &amp; Talent</a><a href="'+R+'support.html">Support Us</a><a href="'+R+'advertise.html">Advertise &amp; Partner</a><a href="'+R+'videos.html">Video Library</a><a href="'+R+'guides/index.html">Guides</a></div>' +
      '<div><h4>Company</h4><a href="'+R+'about.html">About</a><a href="'+R+'contact.html">Contact</a><a href="'+R+'privacy.html">Privacy Policy</a><a href="'+R+'terms.html">Terms of Use</a><a href="'+R+'disclaimer.html">Disclaimer &amp; Trademark</a><a href="'+R+'privacy.html#cookies">Cookie Policy</a><a href="'+SITE.interestUrl+'" rel="noopener" target="_blank">Buy / Sponsor this domain</a></div>' +
      '</div><div class="legal">© '+y+' 34456.com. All rights reserved. Original content, code and design of this website are protected by copyright. “34456” is used here only as a descriptive domain name; no trademark rights are claimed in the number itself, and this site is not affiliated with any company, product, part number, postal code or entertainment property that uses the same digits. Calculations are estimates for education only. See our <a style="display:inline" href="'+R+'disclaimer.html">Disclaimer</a>.</div></div>';
  }

  /* ---------- Theme ---------- */
  try { var t = localStorage.getItem('theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch(e){}
  document.addEventListener('click', function(e){
    if (e.target && e.target.id === 'themeBtn') {
      var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', cur);
      try { localStorage.setItem('theme', cur); } catch(e){}
    }
  });

  /* ---------- Cookie notice ---------- */
  var ck = document.createElement('div');
  ck.className = 'cookie'; ck.setAttribute('role','dialog'); ck.setAttribute('aria-label','Cookie notice');
  ck.innerHTML = '<b>Cookies &amp; ads</b><p class="small muted" style="margin:.4em 0 .8em">We use cookies to run this site, measure traffic and show ads through Google AdSense. Google and its partners may use cookies to personalise ads. <a href="'+R+'privacy.html#cookies">Learn more</a>.</p><button class="btn pri" data-ck="1">Accept</button> <button class="btn" data-ck="0">Essential only</button>';
  document.body.appendChild(ck);
  var ckv = null; try { ckv = localStorage.getItem('ck'); } catch(e){}
  if (!ckv) ck.classList.add('show');
  ck.addEventListener('click', function(e){ var v = e.target.getAttribute('data-ck'); if (v !== null) { try{localStorage.setItem('ck', v);}catch(x){} ck.classList.remove('show');
    if (v === '0') { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; } } });
  if (ckv === '0') { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if (x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target);} }); }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });

  /* ---------- Lite YouTube embeds ---------- */
  document.querySelectorAll('.yt[data-id]').forEach(function(el){
    var id = el.getAttribute('data-id');
    el.innerHTML = '<img loading="lazy" alt="'+(el.getAttribute('data-title')||'Video')+'" src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg">';
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
    function play(){ el.classList.add('on'); el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="'+(el.getAttribute('data-title')||'Video')+'" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'; }
    el.addEventListener('click', play); el.addEventListener('keydown', function(e){ if(e.key==='Enter') play(); });
  });

  /* ---------- Hidden-inbox mail links ---------- */
  document.querySelectorAll('[data-mail]').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault();
      var s = encodeURIComponent(a.getAttribute('data-mail') || '34456.com inquiry');
      window.location.href = 'mai'+'lto:' + inbox() + '?subject=' + s; });
  });

  /* ---------- Forms (all go to the hidden inbox) ---------- */
  document.querySelectorAll('form[data-form]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var box = f.querySelector('.msg') || (function(){ var d=document.createElement('div'); d.className='msg'; f.appendChild(d); return d; })();
      box.className = 'msg';
      if (f.querySelector('.hp input') && f.querySelector('.hp input').value) return; // bot trap
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var data = {}; new FormData(f).forEach(function(v,k){ if (k.indexOf('_hp')!==0) data[k] = data[k] ? data[k]+', '+v : v; });
      data._subject = '[34456.com] ' + (f.getAttribute('data-form')) + ' — ' + (data.name || data.email || 'new submission');
      data._template = 'table'; data._captcha = 'false';
      data.page = location.href;
      var btn = f.querySelector('[type=submit]'); if (btn){ btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Sending…'; }
      fetch('https://formsubmit.co/ajax/' + inbox(), { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(data) })
        .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return {ok:r.ok, j:j}; }); })
        .then(function(res){
          if (res.ok) { box.className='msg ok'; box.textContent = f.getAttribute('data-ok') || 'Thank you! Your submission was received. We reply within 1–2 business days.'; f.reset();
            if (f.getAttribute('data-next')) setTimeout(function(){ location.href = R + f.getAttribute('data-next'); }, 900); }
          else throw new Error('send');
        })
        .catch(function(){ box.className='msg err'; box.innerHTML = 'We could not send that right now. Please try again, or <a href="#" id="mf">email us directly</a>.';
          var m = box.querySelector('#mf'); if (m) m.addEventListener('click', function(ev){ ev.preventDefault(); location.href='mai'+'lto:'+inbox()+'?subject='+encodeURIComponent(data._subject)+'&body='+encodeURIComponent(JSON.stringify(data,null,2)); }); })
        .then(function(){ if (btn){ btn.disabled=false; btn.textContent = btn.dataset.t; } });
    });
  });

  /* ---------- Multi-step forms ---------- */
  document.querySelectorAll('[data-steps]').forEach(function(f){
    var steps = f.querySelectorAll('.step'), bar = f.querySelectorAll('.steps i'), i = 0;
    function show(n){ steps.forEach(function(s,k){ s.hidden = k!==n; }); bar.forEach(function(b,k){ b.classList.toggle('on', k<=n); }); i=n; }
    f.addEventListener('click', function(e){
      if (e.target.matches('[data-next-step]')) { e.preventDefault();
        var ok = true; steps[i].querySelectorAll('input,select,textarea').forEach(function(x){ if(!x.checkValidity()){ ok=false; x.reportValidity(); } });
        if (ok) show(Math.min(i+1, steps.length-1)); }
      if (e.target.matches('[data-prev-step]')) { e.preventDefault(); show(Math.max(i-1,0)); }
    });
    show(0);
  });

  /* ---------- Share ---------- */
  document.querySelectorAll('[data-share]').forEach(function(b){
    b.addEventListener('click', function(){
      var d = { title: document.title, url: location.href };
      if (navigator.share) navigator.share(d).catch(function(){});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function(){ b.textContent = 'Link copied ✓'; });
    });
  });

  /* ---------- Year stamps ---------- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
