/* 34456.com calculation engines + tool UIs. Pure functions first, UI bindings after. */
var C34 = (function(){
  'use strict';
  /* ---------- formatting ---------- */
  function money(n, cur, dec){ cur = cur || 'USD'; if (!isFinite(n)) n = 0;
    return new Intl.NumberFormat(cur==='CAD'?'en-CA':'en-US', {style:'currency', currency:cur, minimumFractionDigits: dec===undefined?2:dec, maximumFractionDigits: dec===undefined?2:dec}).format(n); }
  function num(n, d){ return new Intl.NumberFormat('en-US',{maximumFractionDigits:d===undefined?2:d}).format(n); }
  function pct(n){ return (n*100).toFixed(1) + '%'; }
  function v(id){ var el = document.getElementById(id); if (!el) return 0; var x = parseFloat(String(el.value).replace(/[^0-9.\-]/g,'')); return isFinite(x) ? x : 0; }
  function s(id){ var el = document.getElementById(id); return el ? el.value : ''; }
  function set(id, html){ var el = document.getElementById(id); if (el) el.innerHTML = html; }

  /* ---------- salary conversion ---------- */
  var PER = { hour:'Hourly', day:'Daily', week:'Weekly', biweek:'Bi-weekly', semimonth:'Semi-monthly', month:'Monthly', quarter:'Quarterly', year:'Annual' };
  function convert(amount, per, hpw, dpw, holidays, vacation){
    hpw = hpw || 40; dpw = dpw || 5;
    var hpd = hpw / dpw, days = 52 * dpw, annual;
    switch(per){
      case 'hour': annual = amount * hpw * 52; break;
      case 'day': annual = amount * days; break;
      case 'week': annual = amount * 52; break;
      case 'biweek': annual = amount * 26; break;
      case 'semimonth': annual = amount * 24; break;
      case 'month': annual = amount * 12; break;
      case 'quarter': annual = amount * 4; break;
      default: annual = amount;
    }
    var off = (holidays||0) + (vacation||0), workDays = Math.max(days - off, 1);
    function table(a, wd){ return { hour: a / (wd * hpd), day: a / wd, week: a/52, biweek: a/26, semimonth: a/24, month: a/12, quarter: a/4, year: a }; }
    // Unadjusted: every weekday paid as worked. Adjusted: same annual pay spread over days actually worked.
    var un = table(annual, days), adj = table(annual, workDays);
    if (per === 'hour' || per === 'day') { // hourly/daily pay is only earned on days worked
      var a2 = per==='hour' ? amount * hpd * workDays : amount * workDays; adj = table(a2, workDays); adj.hour = per==='hour'?amount:adj.hour; adj.day = per==='day'?amount:adj.day; }
    return { annual: annual, un: un, adj: adj, workDays: workDays, hours: workDays * hpd };
  }

  /* ---------- US 2026 federal (IRS Rev. Proc. 2025-32) ---------- */
  var US = {
    std: { single:16100, mfj:32200, hoh:24150 },
    br: {
      single: [[12400,.10],[50400,.12],[105700,.22],[201775,.24],[256225,.32],[640600,.35],[Infinity,.37]],
      mfj:    [[24800,.10],[100800,.12],[211400,.22],[403550,.24],[512450,.32],[768700,.35],[Infinity,.37]],
      hoh:    [[17700,.10],[67450,.12],[105700,.22],[201750,.24],[256200,.32],[640600,.35],[Infinity,.37]]
    },
    ssRate:.062, ssBase:184500, medRate:.0145, addMed:.009, addMedT:{single:200000,mfj:250000,hoh:200000}
  };
  function bracketTax(taxable, brs){ var t=0, prev=0, marg=brs[0][1]; for (var i=0;i<brs.length;i++){ var top=brs[i][0], r=brs[i][1]; if (taxable>prev){ t += (Math.min(taxable,top)-prev)*r; marg=r; } prev=top; } return {tax:t, marginal:marg}; }
  function usTax(gross, status, pretax, statePct){
    status = status || 'single'; pretax = pretax || 0;
    var taxable = Math.max(gross - pretax - US.std[status], 0);
    var fed = bracketTax(taxable, US.br[status]);
    var ss = Math.min(gross, US.ssBase) * US.ssRate;
    var med = gross * US.medRate + Math.max(gross - US.addMedT[status], 0) * US.addMed;
    var state = Math.max(gross - pretax, 0) * (statePct||0)/100;
    var total = fed.tax + ss + med + state;
    return { gross:gross, pretax:pretax, taxable:taxable, federal:fed.tax, marginal:fed.marginal, ss:ss, medicare:med, state:state, total:total, net: gross - pretax - total, eff: gross? total/gross:0 };
  }

  /* ---------- Canada 2026 federal (CRA indexed amounts) ---------- */
  var CA = { br:[[58523,.14],[117045,.205],[181440,.26],[258482,.29],[Infinity,.33]], bpa:16452, cea:1501,
    cppRate:.0595, cppBaseRate:.0495, cppExempt:3500, ympe:74600, cpp2Rate:.04, yampe:85000, eiRate:.0163, eiMax:68900 };
  function caTax(gross, provPct, pretax){
    pretax = pretax || 0;
    var cppEarn = Math.max(Math.min(gross, CA.ympe) - CA.cppExempt, 0);
    var cpp = cppEarn * CA.cppRate, cppBase = cppEarn * CA.cppBaseRate, cppEnh = cpp - cppBase;
    var cpp2 = Math.max(Math.min(gross, CA.yampe) - CA.ympe, 0) * CA.cpp2Rate;
    var ei = Math.min(gross, CA.eiMax) * CA.eiRate;
    var taxable = Math.max(gross - pretax - cppEnh - cpp2, 0);
    var f = bracketTax(taxable, CA.br);
    var credits = (CA.bpa + Math.min(CA.cea, gross) + cppBase + ei) * .14;
    var federal = Math.max(f.tax - credits, 0);
    var prov = taxable * (provPct||0)/100;
    var total = federal + prov + cpp + cpp2 + ei;
    return { gross:gross, pretax:pretax, taxable:taxable, federal:federal, marginal:f.marginal, prov:prov, cpp:cpp+cpp2, ei:ei, total:total, net: gross - pretax - total, eff: gross? total/gross : 0 };
  }

  /* ---------- loans ---------- */
  function loan(P, ratePct, years, extra){
    var r = ratePct/100/12, n = Math.round(years*12), pay = r ? P*r/(1-Math.pow(1+r,-n)) : P/n;
    var bal = P, rows = [], totInt = 0, m = 0; extra = extra||0;
    while (bal > 0.005 && m < 1200){ var i = bal*r, p = Math.min(pay + extra - i, bal); if (p <= 0) break; bal -= p; totInt += i; m++; rows.push({m:m, int:i, prin:p, bal:bal}); }
    return { payment: pay, months: m, totalInterest: totInt, total: P + totInt, rows: rows };
  }

  /* ---------- compound growth ---------- */
  function compound(P, monthly, years, ratePct, freq){
    freq = freq || 12; var out = [P], bal = P, rM;
    // convert nominal rate compounded `freq` times/yr to an effective monthly rate
    rM = Math.pow(1 + ratePct/100/freq, freq/12) - 1;
    for (var m=1; m<=years*12; m++){ bal = bal*(1+rM) + monthly; if (m%12===0) out.push(bal); }
    return { final: bal, contributed: P + monthly*years*12, interest: bal - P - monthly*years*12, series: out };
  }

  /* ---------- number facts ---------- */
  var ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],
      TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function words(n){ if (n===0) return 'zero'; if (n<0) return 'negative '+words(-n);
    function h(x){ var w=''; if (x>=100){ w+=ONES[Math.floor(x/100)]+' hundred'; x%=100; if(x) w+=' and '; } if (x>=20){ w+=TENS[Math.floor(x/10)]; if(x%10) w+='-'+ONES[x%10]; } else if (x) w+=ONES[x]; return w; }
    var sc=['',' thousand',' million',' billion',' trillion'], parts=[], i=0;
    while (n>0 && i<sc.length){ var c=n%1000; if (c) parts.unshift(h(c)+sc[i]); n=Math.floor(n/1000); i++; }
    return parts.join(', '); }
  function factorize(n){ var f=[], d=2; while (d*d<=n){ while(n%d===0){ f.push(d); n/=d; } d++; } if (n>1) f.push(n); return f; }
  function divisors(n){ var a=[], b=[]; for (var i=1;i*i<=n;i++){ if (n%i===0){ a.push(i); if (i!==n/i) b.unshift(n/i); } } return a.concat(b); }
  function roman(n){ if (n<1||n>3999) return '—'; var m=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']], r=''; m.forEach(function(p){ while(n>=p[0]){ r+=p[1]; n-=p[0]; } }); return r; }
  function facts(n){
    var f = factorize(n), d = divisors(n), sum = d.reduce(function(a,b){return a+b;},0) - n, ds = String(n).split('').reduce(function(a,b){return a+ +b;},0);
    var fib = (function(){ var a=0,b=1; while(b<n){ var t=a+b; a=b; b=t; } return b===n || n===0; })();
    return { n:n, words:words(n), prime: n>1 && f.length===1, factors:f, divisors:d, divisorSum:sum,
      kind: sum===n?'perfect':(sum>n?'abundant':'deficient'), even: n%2===0, digitSum: ds, digitalRoot: n? 1+(n-1)%9 : 0,
      bin: n.toString(2), oct: n.toString(8), hex: n.toString(16).toUpperCase(), roman: roman(n),
      square: Math.sqrt(n), cube: Math.cbrt(n), palindrome: String(n)===String(n).split('').reverse().join(''), fibonacci: fib };
  }

  /* ---------- tiny canvas charts ---------- */
  function css(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'; }
  function lineChart(canvas, series, labels, opts){
    if (!canvas) return; opts = opts || {};
    var dpr = window.devicePixelRatio||1, W = canvas.clientWidth || 600, H = opts.h || 280;
    canvas.width = W*dpr; canvas.height = H*dpr; canvas.style.height = H+'px';
    var g = canvas.getContext('2d'); g.scale(dpr,dpr); g.clearRect(0,0,W,H);
    var pad = {l:64,r:14,t:14,b:28}, max = 0;
    series.forEach(function(sr){ sr.data.forEach(function(y){ if (y>max) max=y; }); }); max = max || 1;
    var len = series[0].data.length, X = function(i){ return pad.l + (W-pad.l-pad.r) * (len>1? i/(len-1) : 0); }, Y = function(y){ return H - pad.b - (H-pad.t-pad.b) * y/max; };
    g.strokeStyle = css('--line'); g.fillStyle = css('--muted'); g.font = '11px Inter, sans-serif'; g.lineWidth = 1;
    for (var k=0;k<=4;k++){ var yy = Y(max*k/4); g.beginPath(); g.moveTo(pad.l,yy); g.lineTo(W-pad.r,yy); g.stroke(); g.fillText(opts.fmt? opts.fmt(max*k/4) : num(max*k/4,0), 4, yy+4); }
    var step = Math.ceil(len/8); for (var i=0;i<len;i+=step) g.fillText(labels? labels[i] : i, X(i)-6, H-8);
    series.forEach(function(sr){ g.strokeStyle = sr.color; g.lineWidth = 2.5; g.beginPath(); sr.data.forEach(function(y,i){ i? g.lineTo(X(i),Y(y)) : g.moveTo(X(i),Y(y)); }); g.stroke();
      if (sr.fill){ g.lineTo(X(len-1),Y(0)); g.lineTo(X(0),Y(0)); g.closePath(); g.globalAlpha=.12; g.fillStyle=sr.color; g.fill(); g.globalAlpha=1; } });
  }
  function stackBar(el, parts){ if (!el) return; var tot = parts.reduce(function(a,p){return a+Math.max(p.v,0);},0)||1;
    el.innerHTML = '<div class="bar">'+parts.map(function(p){ return '<i title="'+p.k+'" style="width:'+(Math.max(p.v,0)/tot*100)+'%;background:'+p.c+'"></i>'; }).join('')+'</div><div class="legend">'+parts.map(function(p){ return '<span style="--c:'+p.c+'">'+p.k+' '+pct(Math.max(p.v,0)/tot)+'</span>'; }).join('')+'</div>'; }
  var COL = ['#7c5cff','#22d3ee','#f59e0b','#ef4444','#22c55e','#ec4899'];

  return { money:money, num:num, pct:pct, v:v, s:s, set:set, PER:PER, convert:convert, usTax:usTax, caTax:caTax, US:US, CA:CA, loan:loan, compound:compound, facts:facts, words:words, lineChart:lineChart, stackBar:stackBar, COL:COL };
})();
if (typeof module !== 'undefined') module.exports = C34;

/* ======================= UI bindings ======================= */
(function(){
  if (typeof document === 'undefined') return;
  var $ = C34, M = $.money;
  function on(ids, fn){ ids.forEach(function(id){ var el = document.getElementById(id); if (el){ el.addEventListener('input', fn); el.addEventListener('change', fn); } }); fn(); }
  function qp(k){ return new URLSearchParams(location.search).get(k); }

  /* ---- Salary converter (salary.html + home widget) ---- */
  if (document.getElementById('sAmt')) {
    var q = parseFloat(qp('amount')), qper = qp('per');
    if (isFinite(q) && q > 0) document.getElementById('sAmt').value = q;
    if (qper && $.PER[qper]) document.getElementById('sPer').value = qper;
    on(['sAmt','sPer','sHpw','sDpw','sHol','sVac'], function(){
      var amt = $.v('sAmt'), per = $.s('sPer'), r = $.convert(amt, per, $.v('sHpw')||40, $.v('sDpw')||5, $.v('sHol'), $.v('sVac'));
      $.set('sHead', M(r.un.hour));
      $.set('sSub', M(amt, 'USD', amt % 1 ? 2 : 0) + ' ' + ($.PER[per]||'').toLowerCase() + ' ≈ <b>' + M(r.un.hour) + '/hour</b> · ' + M(r.un.month) + '/month · ' + M(r.annual, 'USD', 0) + '/year');
      var rows = Object.keys($.PER).map(function(k){ return '<tr><td>'+$.PER[k]+'</td><td class="n">'+M(r.un[k])+'</td><td class="n">'+M(r.adj[k])+'</td></tr>'; }).join('');
      $.set('sTable', rows);
      var t = $.usTax(r.annual, 'single', 0, 0);
      $.set('sTax', 'Estimated 2026 US federal take-home (single, no state tax): <b>' + M(t.net, 'USD', 0) + '/yr</b> (' + M(t.net/12, 'USD', 0) + '/mo). Effective rate ' + $.pct(t.eff) + '. <a href="tools/take-home.html?gross=' + Math.round(r.annual) + '">Full take-home breakdown →</a>');
      // dynamic headline for programmatic pages
      var h = document.getElementById('sTitle');
      if (h && per === 'year') { h.textContent = M(amt, 'USD', 0) + ' a year is how much an hour?'; document.title = M(amt,'USD',0) + ' a Year Is How Much an Hour? (2026) | 34456.com'; }
      var near = document.getElementById('sNear');
      if (near && per === 'year') { var base = Math.round(r.annual/1000)*1000, out = ''; for (var i=-5;i<=6;i++){ var a = base + i*2000; if (a>0) out += '<a class="pill" href="?amount='+a+'&per=year">'+M(a,'USD',0)+'</a> '; } near.innerHTML = out; }
      var cmp = document.getElementById('sCmp');
      if (cmp) { var fmw = 7.25 * 2080; cmp.innerHTML = 'That is <b>' + $.num(r.annual/fmw,1) + '×</b> the US federal minimum wage ($7.25/hr full-time = ' + M(fmw,'USD',0) + '/yr).'; }
    });
  }

  /* ---- Take-home pay ---- */
  if (document.getElementById('tGross')) {
    var g0 = parseFloat(qp('gross')); if (isFinite(g0)) document.getElementById('tGross').value = g0;
    on(['tGross','tCountry','tStatus','tState','tPre','tFreq'], function(){
      var g = $.v('tGross'), c = $.s('tCountry'), pre = $.v('tPre'), st = $.v('tState'), f = parseFloat($.s('tFreq'))||12;
      document.getElementById('usOnly').hidden = c !== 'US';
      document.getElementById('stLabel').textContent = c === 'US' ? 'State/local income tax rate (%)' : 'Provincial tax rate on taxable income (%)';
      var r = c === 'US' ? $.usTax(g, $.s('tStatus'), pre, st) : $.caTax(g, st, pre), cur = c === 'US' ? 'USD' : 'CAD';
      $.set('tNet', M(r.net/f, cur));
      $.set('tNetSub', 'per pay period (' + f + '×/yr) · ' + M(r.net, cur, 0) + ' per year');
      var lines = c === 'US'
        ? [['Gross pay', g], ['Pre-tax deductions (401k, HSA…)', -pre], ['Federal income tax', -r.federal], ['Social Security (6.2%)', -r.ss], ['Medicare (1.45%+)', -r.medicare], ['State / local tax', -r.state], ['Take-home pay', r.net]]
        : [['Gross pay', g], ['Pre-tax deductions (RRSP…)', -pre], ['Federal income tax', -r.federal], ['Provincial tax', -r.prov], ['CPP / CPP2', -r.cpp], ['EI premiums', -r.ei], ['Take-home pay', r.net]];
      $.set('tTable', lines.map(function(l,i){ return '<tr'+(i===lines.length-1?' style="font-weight:700"':'')+'><td>'+l[0]+'</td><td class="n">'+M(l[1],cur,0)+'</td><td class="n">'+M(l[1]/f,cur)+'</td></tr>'; }).join(''));
      $.set('tK', '<div class="kpi"><span>Effective tax</span><b>'+$.pct(r.eff)+'</b></div><div class="kpi"><span>Marginal federal</span><b>'+$.pct(r.marginal)+'</b></div><div class="kpi"><span>Monthly net</span><b>'+M(r.net/12,cur,0)+'</b></div><div class="kpi"><span>Hourly net (2,080h)</span><b>'+M(r.net/2080,cur)+'</b></div>');
      var parts = c === 'US' ? [{k:'Take-home',v:r.net,c:'#22c55e'},{k:'Federal',v:r.federal,c:'#7c5cff'},{k:'FICA',v:r.ss+r.medicare,c:'#22d3ee'},{k:'State',v:r.state,c:'#f59e0b'},{k:'Pre-tax',v:pre,c:'#ec4899'}]
        : [{k:'Take-home',v:r.net,c:'#22c55e'},{k:'Federal',v:r.federal,c:'#7c5cff'},{k:'Provincial',v:r.prov,c:'#f59e0b'},{k:'CPP+EI',v:r.cpp+r.ei,c:'#22d3ee'},{k:'Pre-tax',v:pre,c:'#ec4899'}];
      $.stackBar(document.getElementById('tBar'), parts);
    });
  }

  /* ---- Loan / mortgage ---- */
  if (document.getElementById('lAmt')) {
    on(['lAmt','lRate','lYears','lExtra'], function(){
      var r = $.loan($.v('lAmt'), $.v('lRate'), $.v('lYears')||1, $.v('lExtra')), base = $.loan($.v('lAmt'), $.v('lRate'), $.v('lYears')||1, 0);
      $.set('lPay', M(r.payment + $.v('lExtra')));
      $.set('lK', '<div class="kpi"><span>Total interest</span><b>'+M(r.totalInterest,'USD',0)+'</b></div><div class="kpi"><span>Total paid</span><b>'+M(r.total,'USD',0)+'</b></div><div class="kpi"><span>Payoff</span><b>'+Math.floor(r.months/12)+'y '+(r.months%12)+'m</b></div><div class="kpi"><span>Interest saved</span><b>'+M(base.totalInterest-r.totalInterest,'USD',0)+'</b></div>');
      var yrs = [], bal = [], cumI = [], ci = 0; r.rows.forEach(function(x,i){ ci += x.int; if ((i+1)%12===0 || i===r.rows.length-1){ yrs.push('Y'+Math.ceil((i+1)/12)); bal.push(x.bal); cumI.push(ci); } });
      $.lineChart(document.getElementById('lChart'), [{data:bal,color:'#7c5cff',fill:true},{data:cumI,color:'#f59e0b'}], yrs, {fmt:function(n){return M(n,'USD',0);}});
      var tb = ''; for (var i=0;i<yrs.length;i++) tb += '<tr><td>'+yrs[i]+'</td><td class="n">'+M(cumI[i],'USD',0)+'</td><td class="n">'+M(bal[i],'USD',0)+'</td></tr>';
      $.set('lTable', tb);
    });
  }

  /* ---- Compound interest ---- */
  if (document.getElementById('cP')) {
    on(['cP','cM','cY','cR','cF','cV'], function(){
      var P=$.v('cP'), m=$.v('cM'), y=Math.max(1,Math.round($.v('cY'))), r=$.v('cR'), f=parseFloat($.s('cF'))||12, vv=$.v('cV');
      var mid=$.compound(P,m,y,r,f), lo=$.compound(P,m,y,Math.max(r-vv,0),f), hi=$.compound(P,m,y,r+vv,f), contrib=[];
      for (var i=0;i<=y;i++) contrib.push(P + m*12*i);
      $.set('cOut', M(mid.final,'USD',0));
      $.set('cK', '<div class="kpi"><span>You contribute</span><b>'+M(mid.contributed,'USD',0)+'</b></div><div class="kpi"><span>Interest earned</span><b>'+M(mid.interest,'USD',0)+'</b></div><div class="kpi"><span>At '+Math.max(r-vv,0)+'%</span><b>'+M(lo.final,'USD',0)+'</b></div><div class="kpi"><span>At '+(r+vv)+'%</span><b>'+M(hi.final,'USD',0)+'</b></div><div class="kpi"><span>Rule of 72 doubling</span><b>'+(r?$.num(72/r,1)+' yrs':'—')+'</b></div>');
      var labels = mid.series.map(function(_,i){ return 'Y'+i; });
      $.lineChart(document.getElementById('cChart'), [{data:hi.series,color:'#22d3ee'},{data:mid.series,color:'#7c5cff',fill:true},{data:lo.series,color:'#f59e0b'},{data:contrib,color:'#9aa6c4'}], labels, {fmt:function(n){return M(n,'USD',0);}});
    });
  }

  /* ---- 50/30/20 budget ---- */
  if (document.getElementById('bNet')) {
    on(['bNet','bNeeds','bWants','bSave'], function(){
      var n=$.v('bNet'), a=$.v('bNeeds'), b=$.v('bWants'), c=$.v('bSave'), t=a+b+c;
      $.set('bWarn', Math.abs(t-100)>0.01 ? '⚠ Your split adds up to '+t+'% — adjust to 100%.' : '');
      var parts=[{k:'Needs',v:n*a/100,c:'#7c5cff'},{k:'Wants',v:n*b/100,c:'#22d3ee'},{k:'Savings & debt',v:n*c/100,c:'#22c55e'}];
      $.stackBar(document.getElementById('bBar'), parts);
      $.set('bK', parts.map(function(p){ return '<div class="kpi"><span>'+p.k+'</span><b>'+M(p.v,'USD',0)+'/mo</b></div>'; }).join('') + '<div class="kpi"><span>Saved per year</span><b>'+M(n*c/100*12,'USD',0)+'</b></div>');
      var em = n*a/100*6; $.set('bTip', 'Emergency-fund target (6 months of needs): <b>'+M(em,'USD',0)+'</b>. At your savings rate you reach it in <b>'+(c? $.num(em/(n*c/100),1) : '∞')+' months</b>.');
    });
  }

  /* ---- Job offer comparison ---- */
  if (document.getElementById('o1b')) {
    on(['o1b','o1x','o1m','o1v','o1c','o1p','o2b','o2x','o2m','o2v','o2c','o2p'], function(){
      function calc(p){ var base=$.v(p+'b'), bonus=$.v(p+'x'), match=base*$.v(p+'m')/100, ben=$.v(p+'v'), commute=$.v(p+'c'), pto=$.v(p+'p');
        var total = base+bonus+match+ben, hours = Math.max((260-pto)*8 + commute*48, 1); return {total:total, hourly: total/hours, hours:hours}; }
      var a=calc('o1'), b=calc('o2'), win = a.hourly>=b.hourly ? 'Offer A' : 'Offer B';
      $.set('oOut', '<table><tr><th></th><th class="n">Offer A</th><th class="n">Offer B</th></tr><tr><td>Total compensation</td><td class="n">'+M(a.total,'USD',0)+'</td><td class="n">'+M(b.total,'USD',0)+'</td></tr><tr><td>Hours incl. commute</td><td class="n">'+$.num(a.hours,0)+'</td><td class="n">'+$.num(b.hours,0)+'</td></tr><tr><td><b>True hourly value</b></td><td class="n"><b>'+M(a.hourly)+'</b></td><td class="n"><b>'+M(b.hourly)+'</b></td></tr></table><p class="callout"><b>'+win+'</b> pays more per hour of your life by <b>'+M(Math.abs(a.hourly-b.hourly))+'/hr</b> ('+M(Math.abs(a.hourly-b.hourly)*Math.min(a.hours,b.hours),'USD',0)+'/yr equivalent).</p>');
    });
  }

  /* ---- Freelance rate ---- */
  if (document.getElementById('fNet')) {
    on(['fNet','fExp','fTax','fHrs','fWeeks','fMargin'], function(){
      var net=$.v('fNet'), exp=$.v('fExp'), tax=$.v('fTax')/100, hrs=$.v('fHrs')||1, wk=Math.max(52-$.v('fWeeks'),1), mg=$.v('fMargin')/100;
      var gross = (net/(1-Math.min(tax,.9)) + exp) * (1+mg), bill = hrs*wk, rate = gross/bill;
      $.set('fOut', M(rate)); $.set('fK', '<div class="kpi"><span>Day rate (8h)</span><b>'+M(rate*8,'USD',0)+'</b></div><div class="kpi"><span>Weekly</span><b>'+M(rate*hrs,'USD',0)+'</b></div><div class="kpi"><span>Revenue needed</span><b>'+M(gross,'USD',0)+'</b></div><div class="kpi"><span>Billable hours/yr</span><b>'+$.num(bill,0)+'</b></div><div class="kpi"><span>Salary equivalent</span><b>'+M(rate*bill/(1+mg)*(1-tax),'USD',0)+' net</b></div>');
    });
  }

  /* ---- Number Lab ---- */
  if (document.getElementById('nIn')) {
    var nq = parseInt(qp('n'),10); if (nq > 0) document.getElementById('nIn').value = nq;
    on(['nIn'], function(){
      var n = Math.floor(Math.abs($.v('nIn'))); if (!n || n > 1e12) { $.set('nOut','<p class="muted">Enter a whole number between 1 and 1,000,000,000,000.</p>'); return; }
      var f = $.facts(n), cnt = {}; f.factors.forEach(function(p){ cnt[p]=(cnt[p]||0)+1; });
      var fac = Object.keys(cnt).map(function(p){ return p + (cnt[p]>1?'<sup>'+cnt[p]+'</sup>':''); }).join(' × ');
      var conv = $.convert(n,'year',40,5,0,0);
      var rows = [['In words', f.words],['Prime?', f.prime?'Yes — prime':'No'],['Prime factorization', fac],['Number of divisors', f.divisors.length],['Divisors', f.divisors.length<=40? f.divisors.join(', ') : f.divisors.slice(0,40).join(', ')+' …'],['Sum of proper divisors', $.num(f.divisorSum,0)+' ('+f.kind+')'],['Even / odd', f.even?'Even':'Odd'],['Digit sum / digital root', f.digitSum+' / '+f.digitalRoot],['Binary', f.bin],['Octal', f.oct],['Hexadecimal', '0x'+f.hex],['Roman numeral', f.roman],['Square root', $.num(f.square,4)],['Cube root', $.num(f.cube,4)],['Palindrome?', f.palindrome?'Yes':'No'],['Fibonacci number?', f.fibonacci?'Yes':'No'],['As an annual salary', M(n,'USD',0)+'/yr ≈ '+M(conv.un.hour)+'/hr · '+M(conv.un.month)+'/mo']];
      $.set('nOut', '<div class="tablewrap"><table>'+rows.map(function(r){ return '<tr><th style="width:38%">'+r[0]+'</th><td>'+r[1]+'</td></tr>'; }).join('')+'</table></div>');
    });
  }

  /* ---- Raise / negotiation script builder ---- */
  if (document.getElementById('gRole')) {
    var outScript = '', outPrompt = '';
    on(['gRole','gNow','gAsk','gWin','gType','gTone','gName'], function(){
      var role=$.s('gRole')||'my role', now=$.v('gNow'), ask=$.v('gAsk'), wins=($.s('gWin')||'').split(/\n|;/).map(function(x){return x.trim();}).filter(Boolean), type=$.s('gType'), tone=$.s('gTone'), name=$.s('gName')||'[Manager]';
      var inc = now? (ask-now)/now : 0, w = wins.length ? wins : ['[your strongest measurable result]','[a problem you solved]','[a responsibility you took on]'];
      var open = tone==='direct' ? 'I want to discuss my compensation.' : (tone==='warm' ? 'Thank you for making time — I really value working here and want to talk about my growth and compensation.' : 'I’d like to talk about my compensation and how it reflects the value I bring.');
      var body = type==='offer'
        ? 'Hi '+name+',\n\nThank you for the offer for the '+role+' position — I’m excited about the team and the work. '+(now? 'Based on the scope of the role, market data for similar positions, and the results I bring, I’m looking for a base salary of '+M(ask,'USD',0)+' (the current offer is '+M(now,'USD',0)+'). ':'')+'\n\nA few reasons I’m confident in that number:\n'+w.map(function(x){return '• '+x;}).join('\n')+'\n\nIf we can reach '+M(ask,'USD',0)+', I’m ready to accept and get started. I’m also open to discussing a signing bonus or an earlier performance review if base flexibility is limited.\n\nBest regards'
        : 'Hi '+name+',\n\n'+open+' Over the past year in my role as '+role+' I have:\n'+w.map(function(x){return '• '+x;}).join('\n')+'\n\n'+(now? 'Given these results and current market rates, I’m requesting an adjustment from '+M(now,'USD',0)+' to '+M(ask,'USD',0)+' ('+$.pct(inc)+'). ':'')+'Could we schedule 20 minutes this week to discuss? I’m happy to share the market data I’ve gathered.\n\nThank you';
      outScript = body;
      outPrompt = 'Act as an expert salary negotiation coach. I am a '+role+' '+(type==='offer'?'with a job offer of ':'currently earning ')+M(now,'USD',0)+' and I want '+M(ask,'USD',0)+'. My key results: '+w.join('; ')+'. Tone: '+tone+'. 1) Critique my target using market logic, 2) write a short '+(type==='offer'?'counter-offer email':'raise-request email')+', 3) give me 3 likely objections with word-for-word responses, 4) list non-salary items I can negotiate.';
      $.set('gOut', '<pre style="white-space:pre-wrap;font-family:inherit;margin:0">'+outScript.replace(/</g,'&lt;')+'</pre>');
      $.set('gPrompt', '<pre style="white-space:pre-wrap;font-family:inherit;margin:0">'+outPrompt.replace(/</g,'&lt;')+'</pre>');
      $.set('gK', '<div class="kpi"><span>Increase asked</span><b>'+$.pct(inc)+'</b></div><div class="kpi"><span>Extra per year</span><b>'+M(ask-now,'USD',0)+'</b></div><div class="kpi"><span>Over 10 years*</span><b>'+M((ask-now)*10*1.15,'USD',0)+'</b></div>');
    });
    document.querySelectorAll('[data-copy]').forEach(function(b){ b.addEventListener('click', function(){ var t = b.getAttribute('data-copy')==='prompt'? outPrompt : outScript; if (navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ b.textContent='Copied ✓'; setTimeout(function(){ b.textContent = b.getAttribute('data-label'); },1500); }); }); });
  }
})();
