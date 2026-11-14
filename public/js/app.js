/* Akro Sports storefront. Vanilla JS + GSAP. */
(() => {
  'use strict';

  // Set to false once you replace the sample reviews below with real customer reviews.
  const SAMPLE_REVIEWS = true;
  const REVIEWS = [
    { q: 'The fabric breathes properly. Ninety minutes in Kolkata humidity and I was still dry.', n: 'Customer name', c: 'City' },
    { q: 'Ordered for the whole academy. Colours matched, sizes were right, delivery was quick.', n: 'Coach name', c: 'City' },
    { q: 'My son refuses to take the kids kit off. Print has not faded after many washes.', n: 'Parent name', c: 'City' }
  ];
  const CAT_LABEL = { jerseys: 'Club Jerseys', retro: 'Retro Shirts', kits: 'Kids & Full Kits', training: 'Training Wear', jackets: 'Jackets', tracksuits: 'Tracksuits' };
  const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli and Daman & Diu','Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cfg = { whatsapp: '919999999999', freeShipOver: 1999, shipFee: 99, codFee: 50, customFee: 299, razorpay: false };
  let products = [];
  const bySlug = s => products.find(p => p.slug === s);
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  const glowOf = p => (lum(p.design.body) < 0.16 ? p.design.accent : p.design.body);
  const svg = (p, o) => Jersey.svg(p, o || {});
  const priceHTML = p => `${inr(p.price)}${p.compareAt ? `<s>${inr(p.compareAt)}</s>` : ''}`;

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400);
  }

  /* ---------------- cart ---------------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('akro_cart') || '[]'); } catch { cart = []; }
  const saveCart = () => { try { localStorage.setItem('akro_cart', JSON.stringify(cart)); } catch {} updateCount(); };
  const lineKey = l => `${l.slug}|${l.size}|${l.custom ? l.custom.name + '/' + l.custom.number : ''}`;
  const unitPrice = l => { const p = bySlug(l.slug); return p ? p.price + (l.custom ? cfg.customFee : 0) : 0; };
  function totals(method) {
    const subtotal = cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
    const shipping = !cart.length || subtotal >= cfg.freeShipOver ? 0 : cfg.shipFee;
    const cod = method === 'cod' ? cfg.codFee : 0;
    return { subtotal, shipping, cod, total: subtotal + shipping + cod };
  }
  function updateCount() {
    const n = cart.reduce((s, l) => s + l.qty, 0), c = $('#cartCount');
    c.textContent = n; c.classList.toggle('on', n > 0);
  }
  function addToCart(line) {
    const k = lineKey(line), ex = cart.find(l => lineKey(l) === k);
    if (ex) ex.qty = Math.min(20, ex.qty + line.qty); else cart.push(line);
    saveCart();
  }

  /* ---------------- ball animation + cursor ---------------- */
  const BALL = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.5" fill="#fff" stroke="#111" stroke-width="2"/><path d="M20 12l7 5-2.7 8.3h-8.6L13 17z" fill="#111"/><path d="M20 12V3M27 17l9-3M24.3 25.3l5.7 7.7M15.7 25.3L10 33M13 17l-9-3" stroke="#111" stroke-width="2" fill="none"/></svg>`;
  function flyBall(fromEl) {
    if (!hasGsap || reduce) return bump();
    const a = fromEl.getBoundingClientRect(), b = $('#cartBtn').getBoundingClientRect();
    const ball = document.createElement('div'); ball.className = 'fly'; ball.innerHTML = BALL; document.body.appendChild(ball);
    const sx = a.left + a.width / 2 - 13, sy = a.top + a.height / 2 - 13, ex = b.left + b.width / 2 - 13, ey = b.top + b.height / 2 - 13;
    gsap.set(ball, { x: sx, y: sy });
    const peak = Math.min(sy, ey) - 140;
    gsap.timeline({ onComplete: () => { ball.remove(); bump(); } })
      .to(ball, { x: ex, duration: .9, ease: 'power1.inOut' }, 0)
      .to(ball, { y: peak, duration: .42, ease: 'power2.out' }, 0)
      .to(ball, { y: ey, duration: .48, ease: 'bounce.out' }, .42)
      .to(ball, { rotation: 720, scale: .7, duration: .9, ease: 'none' }, 0);
  }
  function bump() { if (hasGsap) gsap.fromTo('#cartBtn', { scale: 1 }, { scale: 1.25, yoyo: true, repeat: 1, duration: .16 }); }

  function initCursor() {
    if (!hasGsap || reduce || matchMedia('(hover:none)').matches) return;
    const c = $('#cursor'); c.innerHTML = BALL;
    const xs = gsap.quickTo(c, 'x', { duration: .35, ease: 'power3' }), ys = gsap.quickTo(c, 'y', { duration: .35, ease: 'power3' });
    const rot = gsap.quickTo(c.firstChild, 'rotation', { duration: .5, ease: 'power3' });
    let lastX = 0, rotv = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      c.classList.add('on'); xs(e.clientX - 22); ys(e.clientY - 22);
      rotv += (e.clientX - lastX) * 1.6; lastX = e.clientX; rot(rotv);
      c.classList.toggle('big', !!e.target.closest('.card,.peg,.arch,button,a,.hero-shirt'));
    });
    document.addEventListener('pointerleave', () => c.classList.remove('on'));
  }

  /* ---------------- swoosh wipe ---------------- */
  function wipe(mid) {
    if (!hasGsap || reduce) { mid(); return; }
    const w = $('#wipe');
    gsap.timeline({ onComplete: () => gsap.set(w, { visibility: 'hidden' }) })
      .set(w, { visibility: 'visible', xPercent: -170, x: 0, skewX: 0 })
      .to(w, { xPercent: 0, skewX: -12, duration: .38, ease: 'power3.in', onComplete: mid })
      .to(w, { xPercent: 170, duration: .5, ease: 'power3.out' });
  }

  /* ---------------- ticker ---------------- */
  function buildTicker() {
    const items = [`Free shipping over ${inr(cfg.freeShipOver)}`, 'Cash on delivery across India', 'Name & number printing', 'UPI · Cards · COD', 'New season kits are live'];
    const one = items.map(t => `<span>${esc(t)}</span>`).join('');
    $('#ticker').innerHTML = one + one + one + one;
    $('#custFee').textContent = inr(cfg.customFee);
    const wa = $('#waLink'); wa.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Hi Akro Sports! I would like to order a jersey.')}`;
  }

  /* ---------------- mega menu ---------------- */
  function buildMega() {
    const cats = Object.keys(CAT_LABEL).filter(c => products.some(p => p.category === c));
    $('#megaList').innerHTML = [['all', 'All Products', products.length], ...cats.map(c => [c, CAT_LABEL[c], products.filter(p => p.category === c).length])]
      .map(([c, l, n], i) => `<a href="#shop" data-cat="${c}" class="${i ? '' : 'on'}"><small>${String(n).padStart(2, '0')}</small>${esc(l)}</a>`).join('');
    const show = c => {
      const p = c === 'all' ? products[0] : products.find(x => x.category === c);
      if (!p) return;
      $('#megaGlow').style.background = glowOf(p);
      $('#megaArt').innerHTML = svg(p);
      $('#megaCap').textContent = `${p.name} ${p.sub}`;
      if (hasGsap) gsap.fromTo('#megaArt svg', { y: 30, opacity: 0, rotate: -3 }, { y: 0, opacity: 1, rotate: 0, duration: .6, ease: 'power3.out' });
      $$('#megaList a').forEach(a => a.classList.toggle('on', a.dataset.cat === c));
    };
    show('all');
    $$('#megaList a').forEach(a => {
      a.addEventListener('mouseenter', () => show(a.dataset.cat));
      a.addEventListener('focus', () => show(a.dataset.cat));
      a.addEventListener('click', e => { e.preventDefault(); closeMega(); setFilter(a.dataset.cat); scrollToEl('#shop'); });
    });
  }
  const openMega = () => { $('#mega').classList.add('open'); document.body.classList.add('lock'); };
  const closeMega = () => { $('#mega').classList.remove('open'); document.body.classList.remove('lock'); };

  function scrollToEl(sel) { const el = $(sel); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }

  /* ---------------- hero showcase ---------------- */
  let heroList = [], heroI = 0, heroTween, heroBusy = false;
  function initHero() {
    const tagged = products.filter(p => p.tag && p.category !== 'retro');
    heroList = [...tagged, ...products.filter(p => !tagged.includes(p) && p.type === 'jersey')].slice(0, 6);
    if (hasGsap) gsap.set('#heroShirt', { xPercent: -50, yPercent: -52 });
    heroShow(0, 1, true);
    $('#heroNext').onclick = () => heroGo(1);
    $('#heroPrev').onclick = () => heroGo(-1);
    $('#heroBtn').onclick = () => openSpot(heroList[heroI]);
    let sx = null, moved = 0;
    const shirt = $('#heroShirt');
    shirt.addEventListener('pointerdown', e => { sx = e.clientX; moved = 0; shirt.setPointerCapture(e.pointerId); });
    shirt.addEventListener('pointermove', e => { if (sx !== null) moved = e.clientX - sx; });
    shirt.addEventListener('pointerup', () => { if (sx === null) return; if (Math.abs(moved) > 60) heroGo(moved < 0 ? 1 : -1); else openSpot(heroList[heroI]); sx = null; });
    shirt.addEventListener('pointercancel', () => { sx = null; });
  }
  function heroFill(i) {
    const p = heroList[i], d = p.design, g = glowOf(p);
    $('#heroBg').style.background = `radial-gradient(ellipse at 50% 58%, ${g} 0%, ${g}88 28%, #0a0a0b 78%)`;
    $('#heroShirt').innerHTML = svg(p);
    $('#heroSub').textContent = `${p.sub}  ·  ${CAT_LABEL[p.category] || ''}`;
    $('#heroName').textContent = p.name;
    $('#heroTag').textContent = p.tagline || '';
    $('#heroPrice').innerHTML = priceHTML(p);
    $('#heroGhost').textContent = p.name.split(' ')[0];
    $('#heroOf').textContent = `${String(i + 1).padStart(2, '0')} / ${String(heroList.length).padStart(2, '0')}`;
    $('#heroNum').textContent = String(i + 1).padStart(2, '0');
  }
  function heroShow(i, dir, first) {
    heroI = (i + heroList.length) % heroList.length;
    if (!hasGsap || first) { heroFill(heroI); } else {
      heroBusy = true;
      gsap.timeline({ onComplete: () => { heroBusy = false; } })
        .to('#heroShirt', { x: -dir * 140, opacity: 0, rotate: -dir * 8, duration: .32, ease: 'power2.in' })
        .to('.hero-copy', { opacity: 0, y: 16, duration: .25 }, 0)
        .add(() => heroFill(heroI))
        .fromTo('#heroShirt', { x: dir * 140, opacity: 0, rotate: dir * 8 }, { x: 0, opacity: 1, rotate: 0, duration: .75, ease: 'power3.out' })
        .fromTo('.hero-copy', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.55');
    }
    if (hasGsap) {
      heroTween && heroTween.kill();
      if (!reduce) heroTween = gsap.fromTo('#heroBar', { strokeDashoffset: 264 }, { strokeDashoffset: 0, duration: 6.5, ease: 'none', onComplete: () => heroGo(1) });
    }
  }
  function heroGo(dir) { if (heroBusy) return; heroShow(heroI + dir, dir); }

  /* ---------------- rack: drag a shirt off the peg ---------------- */
  function buildRail() {
    const list = products.filter(p => p.category === 'jerseys').slice(0, 6);
    const rail = $('#rail-list');
    rail.innerHTML = list.map((p, i) => `<div class="peg" data-slug="${p.slug}" tabindex="0" role="button" aria-label="${esc(p.name)} ${esc(p.sub)}, open">
      <div class="tilt">${svg(p, { hanger: true })}</div>
      <div class="peg-info"><b>${esc(p.name)}</b>${esc(p.sub)} · ${inr(p.price)}</div></div>`).join('');
    $('#railPrev').onclick = () => rail.scrollBy({ left: -rail.clientWidth * .7, behavior: 'smooth' });
    $('#railNext').onclick = () => rail.scrollBy({ left: rail.clientWidth * .7, behavior: 'smooth' });

    $$('.peg', rail).forEach(peg => {
      const tilt = $('.tilt', peg), slug = peg.dataset.slug;
      let sx = 0, sy = 0, dy = 0, drag = false, active = false;
      peg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSpot(bySlug(slug)); } });
      peg.addEventListener('pointerdown', e => { active = true; drag = false; sx = e.clientX; sy = e.clientY; dy = 0; });
      peg.addEventListener('pointermove', e => {
        if (!active) return;
        const mx = e.clientX - sx, my = e.clientY - sy;
        if (!drag && my > 10 && my > Math.abs(mx)) { drag = true; peg.setPointerCapture(e.pointerId); }
        if (drag) { dy = Math.max(0, my); hasGsap ? gsap.set(tilt, { y: dy, rotate: dy * .04 }) : (tilt.style.transform = `translateY(${dy}px)`); }
      });
      const end = () => {
        if (!active) return; active = false;
        if (drag && dy > 110) {
          if (hasGsap) gsap.to(tilt, { y: dy + 40, opacity: 0, duration: .25, onComplete: () => { openSpot(bySlug(slug)); gsap.set(tilt, { y: 0, rotate: 0, opacity: 1 }); } });
          else openSpot(bySlug(slug));
        } else if (drag) {
          hasGsap ? gsap.to(tilt, { y: 0, rotate: 0, duration: .9, ease: 'elastic.out(1,.4)' }) : (tilt.style.transform = '');
        }
        setTimeout(() => { drag = false; }, 0);
      };
      peg.addEventListener('pointerup', end);
      peg.addEventListener('pointercancel', () => { active = false; if (hasGsap) gsap.to(tilt, { y: 0, rotate: 0, duration: .5 }); });
      peg.addEventListener('click', () => { if (dy < 10) openSpot(bySlug(slug)); });
    });
  }

  /* ---------------- pinned horizontal drops ---------------- */
  function buildStory() {
    const picks = ['goa-sunset-third', 'mumbai-midnight-away', 'akro-black-edition-kit'].map(bySlug).filter(Boolean);
    const list = picks.length ? picks : products.slice(0, 3);
    const track = $('#storyTrack');
    track.innerHTML = `<div class="panel intro"><span class="eyebrow">The Drops</span><h2 class="disp" style="margin-top:16px">New on<br><span class="serif">the pitch.</span></h2><p style="color:var(--mute);margin-top:22px;max-width:38ch">Keep scrolling. Limited runs and new colourways, one panel at a time.</p></div>` +
      list.map((p, i) => {
        const g = glowOf(p);
        return `<div class="panel" data-slug="${p.slug}"><div class="bg" style="background:radial-gradient(ellipse at 30% 55%, ${g}cc, #060607 70%)"></div>
          <div class="art"><span class="big disp">${String(i + 1).padStart(2, '0')}</span>${svg(p)}</div>
          <div class="txt"><span class="eyebrow" style="color:#fff">${esc(p.tag || 'Drop')} · ${esc(p.sub)}</span><h3 class="disp">${esc(p.name)}</h3><p>${esc(p.tagline || '')}</p><div class="desc">${esc(p.desc)}</div>
          <div class="hero-meta"><span class="price">${priceHTML(p)}</span><button class="btn" data-open="${p.slug}">Open kit</button></div></div></div>`;
      }).join('');
    $$('[data-open]', track).forEach(b => b.onclick = () => openSpot(bySlug(b.dataset.open)));
    if (!hasGsap || typeof ScrollTrigger === 'undefined') { $('#drops').style.overflowX = 'auto'; return; }
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#drops', pin: true, scrub: .8, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true, onUpdate: s => gsap.set('#storyBar', { scaleX: s.progress }) } });
    $$('.panel .art svg', track).forEach(el => gsap.fromTo(el, { rotate: -8, y: 40 }, { rotate: 6, y: -30, ease: 'none', scrollTrigger: { trigger: '#drops', start: 'top top', end: () => '+=' + dist(), scrub: true } }));
  }

  /* ---------------- shop grid ---------------- */
  let filter = 'all';
  function buildShop() {
    const cats = ['all', ...Object.keys(CAT_LABEL).filter(c => products.some(p => p.category === c))];
    $('#filters').innerHTML = cats.map(c => `<button data-c="${c}" class="${c === filter ? 'on' : ''}">${c === 'all' ? 'All' : CAT_LABEL[c]}</button>`).join('');
    $$('#filters button').forEach(b => b.onclick = () => setFilter(b.dataset.c));
    renderGrid(false);
  }
  function setFilter(c) {
    filter = c;
    $$('#filters button').forEach(b => b.classList.toggle('on', b.dataset.c === c));
    renderGrid(true);
  }
  function renderGrid(animate) {
    const list = filter === 'all' ? products : products.filter(p => p.category === filter);
    $('#grid').innerHTML = list.map(p => `<article class="card" data-slug="${p.slug}" tabindex="0" role="button" aria-label="${esc(p.name)} ${esc(p.sub)}" style="--c:${glowOf(p)}">
      ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}<div class="img">${svg(p)}</div>
      <h4>${esc(p.name)}</h4><div class="sub">${esc(p.sub)}</div><div class="row"><span class="price">${priceHTML(p)}</span><span class="quick">View</span></div></article>`).join('');
    $$('#grid .card').forEach(c => {
      c.onclick = () => openSpot(bySlug(c.dataset.slug));
      c.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } };
    });
    if (hasGsap && animate) gsap.from('#grid .card', { opacity: 0, y: 30, duration: .5, stagger: .04, ease: 'power3.out' });
  }

  /* ---------------- retro archive ---------------- */
  function buildArchive() {
    const list = products.filter(p => p.category === 'retro');
    $('#archNum').textContent = list.length;
    $('#archGrid').innerHTML = list.map(p => `<div class="arch" data-slug="${p.slug}" tabindex="0" role="button" aria-label="${esc(p.name)}">${svg(p, { hanger: true })}<span>${esc(p.name)}<br>${inr(p.price)}</span></div>`).join('');
    $$('#archGrid .arch').forEach(a => { a.onclick = () => openSpot(bySlug(a.dataset.slug)); a.onkeydown = e => { if (e.key === 'Enter') a.click(); }; });
  }

  /* ---------------- custom builder ---------------- */
  let bSel = null;
  function buildBuilder() {
    const opts = products.filter(p => p.type === 'jersey' && p.category !== 'training').slice(0, 8);
    bSel = opts[0];
    $('#swatches').innerHTML = opts.map((p, i) => `<button class="${i ? '' : 'on'}" data-slug="${p.slug}" style="background:${p.design.body};box-shadow:inset -8px 0 0 ${p.design.accent}" aria-label="${esc(p.name)}"></button>`).join('');
    const draw = () => {
      const name = $('#bName').value.toUpperCase().replace(/[^A-Z0-9 .\-]/g, ''), num = $('#bNum').value.replace(/\D/g, '').slice(0, 2);
      $('#bArt').innerHTML = svg(bSel, { back: true, name, number: num });
    };
    $$('#swatches button').forEach(b => b.onclick = () => { bSel = bySlug(b.dataset.slug); $$('#swatches button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    $('#bName').oninput = draw; $('#bNum').oninput = draw;
    $('#bAdd').onclick = () => openSpot(bSel, { custom: { name: $('#bName').value.toUpperCase().trim(), number: $('#bNum').value.replace(/\D/g, '').slice(0, 2) } });
    draw();
  }

  /* ---------------- reviews ---------------- */
  function buildVoices() {
    $('#voiceRow').innerHTML = REVIEWS.map(r => `<div class="voice"><div class="stars" aria-hidden="true">★★★★★</div><q>${esc(r.q)}</q><b>${esc(r.n)}</b><small>${esc(r.c)}${SAMPLE_REVIEWS ? ' · sample text, replace with a real review' : ''}</small></div>`).join('');
  }

  /* ---------------- spotlight (product) ---------------- */
  let cur = null, curSize = '', curQty = 1, lastFocus = null;
  function openSpot(p, pre = {}) {
    if (!p) return;
    wipe(() => buildSpot(p, pre));
  }
  function buildSpot(p, pre) {
    cur = p; curSize = ''; curQty = 1; lastFocus = document.activeElement;
    const canCustom = p.type === 'jersey' || p.type === 'kit';
    const c = pre.custom || null;
    $('#spotGlow').style.background = glowOf(p);
    $('#spotArt').innerHTML = svg(p);
    $('#spotPanel').innerHTML = `
      <span class="eyebrow">${esc(CAT_LABEL[p.category] || '')}${p.tag ? ' · ' + esc(p.tag) : ''}</span>
      <div><h2 class="disp">${esc(p.name)}</h2><div class="eyebrow" style="color:var(--mute);margin-top:10px">${esc(p.sub)}</div></div>
      <div class="tagline">${esc(p.tagline || '')}</div><p class="desc">${esc(p.desc)}</p>
      <div class="price" style="font-size:34px">${priceHTML(p)}</div>
      <div><div class="field-label"><span>Size</span><span id="sizeErr" style="color:var(--red2)"></span></div><div class="sizes" id="sizes">${p.sizes.map(s => `<button data-s="${s}">${s}</button>`).join('')}</div></div>
      ${canCustom ? `<div class="custom-box ${c ? 'on' : ''}" id="cbox"><label class="chk"><input type="checkbox" id="cOn" ${c ? 'checked' : ''}> Add name &amp; number <span style="color:var(--mute);font-weight:700">+${inr(cfg.customFee)}</span></label>
        <div class="custom-fields"><input class="in" id="cName" maxlength="12" placeholder="NAME" value="${esc(c ? c.name : '')}"><input class="in" id="cNum" maxlength="2" inputmode="numeric" placeholder="No." value="${esc(c ? c.number : '')}"></div></div>` : ''}
      <div class="buy-row"><div class="qty"><button id="qm" aria-label="Fewer">−</button><span id="qv">1</span><button id="qp" aria-label="More">+</button></div><button class="btn red" id="addBtn">Add to bag</button></div>
      <div class="perks"><span>Free shipping over ${inr(cfg.freeShipOver)}</span><span>Cash on delivery</span><span>Easy size exchange</span></div>`;
    $('#spotToggle').hidden = !canCustom;
    const showBack = () => {
      const on = canCustom && $('#cOn') && $('#cOn').checked;
      const name = on ? $('#cName').value.toUpperCase().replace(/[^A-Z0-9 .\-]/g, '') : '', num = on ? $('#cNum').value.replace(/\D/g, '').slice(0, 2) : '';
      const back = $('#spotToggle .on').dataset.v === 'back';
      $('#spotArt').innerHTML = svg(p, back ? { back: true, name, number: num } : {});
    };
    $$('#spotToggle button').forEach(b => { b.classList.toggle('on', b.dataset.v === (c ? 'back' : 'front')); b.onclick = () => { $$('#spotToggle button').forEach(x => x.classList.toggle('on', x === b)); showBack(); }; });
    if (c) showBack();
    $$('#sizes button').forEach(b => b.onclick = () => { curSize = b.dataset.s; $$('#sizes button').forEach(x => x.classList.toggle('on', x === b)); $('#sizeErr').textContent = ''; });
    if (canCustom) {
      $('#cOn').onchange = () => { $('#cbox').classList.toggle('on', $('#cOn').checked); if ($('#cOn').checked) { $$('#spotToggle button').forEach(x => x.classList.toggle('on', x.dataset.v === 'back')); } showBack(); };
      const live = () => { $$('#spotToggle button').forEach(x => x.classList.toggle('on', x.dataset.v === 'back')); showBack(); };
      $('#cName').oninput = live; $('#cNum').oninput = live;
    }
    $('#qm').onclick = () => { curQty = Math.max(1, curQty - 1); $('#qv').textContent = curQty; };
    $('#qp').onclick = () => { curQty = Math.min(20, curQty + 1); $('#qv').textContent = curQty; };
    $('#addBtn').onclick = e => {
      if (!curSize) { $('#sizeErr').textContent = 'Pick a size'; if (hasGsap) gsap.fromTo('#sizes', { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' }); return; }
      let custom = null;
      if (canCustom && $('#cOn').checked) {
        const name = $('#cName').value.toUpperCase().replace(/[^A-Z0-9 .\-]/g, '').trim().slice(0, 12), number = $('#cNum').value.replace(/\D/g, '').slice(0, 2);
        if (name || number) custom = { name, number };
      }
      addToCart({ slug: p.slug, size: curSize, qty: curQty, custom });
      flyBall(e.currentTarget);
      setTimeout(() => { closeSpot(); toast('Added to your bag'); }, reduce ? 0 : 950);
    };
    $('#spot').classList.add('open'); document.body.classList.add('lock');
    $('#spot').scrollTop = 0;
    if (hasGsap) {
      gsap.fromTo('#spotArt svg', { y: 60, opacity: 0, rotate: -4 }, { y: 0, opacity: 1, rotate: 0, duration: .9, ease: 'power3.out', delay: .1 });
      gsap.from('#spotPanel > *', { y: 24, opacity: 0, stagger: .05, duration: .55, ease: 'power3.out', delay: .15 });
    }
    $('#spotClose').focus({ preventScroll: true });
  }
  function closeSpot() {
    $('#spot').classList.remove('open');
    if (!$('#drawer').classList.contains('open') && !$('#mega').classList.contains('open')) document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch {}
  }

  /* ---------------- drawer: bag / checkout / done ---------------- */
  const form = { name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', method: 'cod' };
  function openDrawer(view = 'cart') {
    renderDrawer(view);
    $('#drawer').classList.add('open'); $('#scrim').classList.add('on'); document.body.classList.add('lock');
  }
  function closeDrawer() {
    $('#drawer').classList.remove('open'); $('#scrim').classList.remove('on');
    if (!$('#spot').classList.contains('open') && !$('#mega').classList.contains('open')) document.body.classList.remove('lock');
  }
  const head = (title, back) => `<div class="drawer-head">${back ? `<button class="icon-btn" id="dBack" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>` : ''}<h3 class="disp" style="flex:1;${back ? 'margin-left:6px' : ''}">${title}</h3><button class="icon-btn" id="dClose" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>`;

  function renderDrawer(view) {
    const d = $('#drawer');
    if (view === 'cart') {
      const t = totals();
      const left = Math.max(0, cfg.freeShipOver - t.subtotal);
      d.innerHTML = head('Your bag') + (cart.length ? `<div class="drawer-body">${cart.map((l, i) => {
        const p = bySlug(l.slug); if (!p) return '';
        return `<div class="line"><div class="thumb">${svg(p)}</div><div><h5>${esc(p.name)}</h5><small>${esc(p.sub)} · Size ${esc(l.size)}${l.custom ? `<br>Print: ${esc([l.custom.name, l.custom.number].filter(Boolean).join(' '))}` : ''}</small>
          <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Fewer">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="More">+</button></div><button class="rm" data-rm="${i}">Remove</button></div>
          <div class="price" style="font-size:18px">${inr(unitPrice(l) * l.qty)}</div></div>`;
      }).join('')}</div>
        <div class="drawer-foot"><div>${left > 0 ? `<div style="font-size:13px;color:var(--mute)">Add <b style="color:#fff">${inr(left)}</b> more for free shipping</div>` : `<div style="font-size:13px;color:var(--red2)">You have free shipping</div>`}<div class="ship-bar"><i style="width:${Math.min(100, t.subtotal / cfg.freeShipOver * 100)}%"></i></div></div>
        <div class="sum"><div><span>Subtotal</span><span>${inr(t.subtotal)}</span></div><div><span>Shipping</span><span>${t.shipping ? inr(t.shipping) : 'Free'}</span></div></div>
        <button class="btn red block" id="toCheckout">Checkout · ${inr(t.subtotal + t.shipping)}</button></div>`
        : `<div class="drawer-body"><div class="empty"><div class="disp" style="font-size:54px;color:#fff">Empty bag.</div><p>Nothing on the bench yet.</p><button class="btn" id="shopOn">Keep shopping</button></div></div>`);
      $('#dClose').onclick = closeDrawer;
      $$('[data-q]', d).forEach(b => b.onclick = () => { const l = cart[b.dataset.q]; l.qty = Math.min(20, Math.max(1, l.qty + Number(b.dataset.d))); saveCart(); renderDrawer('cart'); });
      $$('[data-rm]', d).forEach(b => b.onclick = () => { cart.splice(b.dataset.rm, 1); saveCart(); renderDrawer('cart'); });
      const co = $('#toCheckout'); if (co) co.onclick = () => renderDrawer('checkout');
      const so = $('#shopOn'); if (so) so.onclick = () => { closeDrawer(); scrollToEl('#shop'); };
    } else if (view === 'checkout') {
      const t = totals(form.method);
      d.innerHTML = head('Checkout', true) + `<div class="drawer-body"><form class="form" id="coForm" novalidate>
        <label>Full name<input class="in" name="name" autocomplete="name" value="${esc(form.name)}"></label>
        <div class="two"><label>Mobile (10 digit)<input class="in" name="phone" inputmode="numeric" autocomplete="tel-national" maxlength="12" value="${esc(form.phone)}"></label><label>Email (optional)<input class="in" name="email" type="email" autocomplete="email" value="${esc(form.email)}"></label></div>
        <label>Address<textarea class="in" name="address" rows="2" autocomplete="street-address">${esc(form.address)}</textarea></label>
        <div class="two"><label>City<input class="in" name="city" autocomplete="address-level2" value="${esc(form.city)}"></label><label>PIN code<input class="in" name="pincode" inputmode="numeric" maxlength="6" autocomplete="postal-code" value="${esc(form.pincode)}"></label></div>
        <label>State<select class="in" name="state" autocomplete="address-level1"><option value="">Select state</option>${STATES.map(s => `<option ${s === form.state ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
        <div class="field-label" style="margin:10px 0 0"><span>Payment</span></div>
        <div class="pay">
          ${cfg.razorpay ? `<label><input type="radio" name="method" value="razorpay" ${form.method === 'razorpay' ? 'checked' : ''}><span>UPI / Card / Netbanking<small>Pay securely online with Razorpay</small></span></label>` : ''}
          <label><input type="radio" name="method" value="cod" ${form.method === 'cod' ? 'checked' : ''}><span>Cash on delivery<small>Pay when it arrives (+${inr(cfg.codFee)} handling)</small></span></label>
          <label><input type="radio" name="method" value="whatsapp" ${form.method === 'whatsapp' ? 'checked' : ''}><span>Order on WhatsApp<small>We confirm and share payment details on chat</small></span></label>
        </div><div class="err" id="err" role="alert"></div></form></div>
        <div class="drawer-foot"><div class="sum" id="sumBox"></div><button class="btn red block" id="place">Place order</button></div>`;
      const fill = () => {
        const t2 = totals(form.method);
        $('#sumBox').innerHTML = `<div><span>Subtotal</span><span>${inr(t2.subtotal)}</span></div><div><span>Shipping</span><span>${t2.shipping ? inr(t2.shipping) : 'Free'}</span></div>${t2.cod ? `<div><span>COD handling</span><span>${inr(t2.cod)}</span></div>` : ''}<div class="tot"><span>Total</span><span>${inr(t2.total)}</span></div>`;
      };
      fill();
      $('#dClose').onclick = closeDrawer; $('#dBack').onclick = () => renderDrawer('cart');
      const f = $('#coForm');
      const sync = () => { const fd = new FormData(f); for (const k of Object.keys(form)) if (fd.has(k)) form[k] = String(fd.get(k)); fill(); };
      f.addEventListener('input', sync); f.addEventListener('change', sync);
      f.addEventListener('submit', e => { e.preventDefault(); place(); });
      $('#place').onclick = place;
      if (!$$('input[name=method]', f).some(r => r.checked)) { form.method = 'cod'; $$('input[name=method]', f).find(r => r.value === 'cod').checked = true; fill(); }
    }
  }

  async function place() {
    const err = $('#err'), btn = $('#place'); err.textContent = '';
    const f = $('#coForm'), fd = new FormData(f); for (const k of Object.keys(form)) if (fd.has(k)) form[k] = String(fd.get(k));
    if (!cart.length) { err.textContent = 'Your bag is empty.'; return; }
    btn.disabled = true; btn.textContent = 'Placing order…';
    try {
      const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: form.method, customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, state: form.state, pincode: form.pincode },
          items: cart.map(l => ({ slug: l.slug, size: l.size, qty: l.qty, custom: l.custom })) }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not place the order.');
      if (j.method === 'razorpay' && j.razorpay) return payRazorpay(j);
      finish(j);
    } catch (e) { err.textContent = e.message; btn.disabled = false; btn.textContent = 'Place order'; }
  }
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load the payment window. Check your connection.')); document.head.appendChild(s); }); }
  async function payRazorpay(j) {
    const err = $('#err'), btn = $('#place');
    try {
      if (!window.Razorpay) await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      const rz = new Razorpay({ key: j.razorpay.key, amount: j.razorpay.amount, currency: j.razorpay.currency, order_id: j.razorpay.orderId, name: 'Akro Sports', description: 'Order ' + j.orderId,
        prefill: { name: form.name, contact: form.phone, email: form.email }, theme: { color: '#e10613' },
        handler: async resp => {
          try {
            const v = await fetch(`/api/orders/${j.orderId}/razorpay-verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resp) });
            const vj = await v.json(); if (!v.ok) throw new Error(vj.error || 'Payment could not be verified.');
            finish(j);
          } catch (e) { err.textContent = e.message + ' Your order ref is ' + j.orderId + '. Message us on WhatsApp if you were charged.'; btn.disabled = false; btn.textContent = 'Place order'; }
        },
        modal: { ondismiss: () => { err.textContent = `Payment was not completed. Order ${j.orderId} is saved. Choose a method and try again.`; btn.disabled = false; btn.textContent = 'Place order'; } } });
      rz.on('payment.failed', () => { err.textContent = 'Payment failed. Please try again or choose another method.'; });
      rz.open();
    } catch (e) { err.textContent = e.message; btn.disabled = false; btn.textContent = 'Place order'; }
  }
  function finish(j) {
    cart = []; saveCart();
    const d = $('#drawer');
    const msg = j.method === 'cod' ? `We'll confirm your order on WhatsApp or call before dispatch. Keep ${inr(j.total)} ready for delivery.`
      : j.method === 'whatsapp' ? 'One last step: send the pre-filled message on WhatsApp so we can confirm your order.' : 'Payment received. We will pack and dispatch your order shortly.';
    d.innerHTML = head('Order placed') + `<div class="drawer-body"><div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h4 class="disp">Full time. <span class="serif">It's yours.</span></h4><div class="eyebrow">Order ${esc(j.orderId)}</div><p style="color:var(--mute);max-width:36ch">${esc(msg)}</p>
      ${j.whatsappUrl ? `<a class="btn red" href="${esc(j.whatsappUrl)}" target="_blank" rel="noopener">Open WhatsApp</a>` : ''}<button class="btn" id="keep">Continue shopping</button></div></div>`;
    $('#dClose').onclick = closeDrawer; $('#keep').onclick = closeDrawer;
    if (j.whatsappUrl) window.open(j.whatsappUrl, '_blank', 'noopener');
  }

  /* ---------------- scroll reveals ---------------- */
  function reveals() {
    if (!hasGsap || typeof ScrollTrigger === 'undefined' || reduce) return;
    gsap.utils.toArray('.sec-head, .archive-top, .builder > *, .cta > *, .voice, .foot-grid').forEach(el =>
      gsap.from(el, { opacity: 0, y: 50, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
    gsap.from('.arch', { opacity: 0, y: 50, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '#archGrid', start: 'top 85%', once: true } });
    gsap.from('.peg', { opacity: 0, y: -60, stagger: .09, duration: .9, ease: 'back.out(1.4)', scrollTrigger: { trigger: '#rail-list', start: 'top 85%', once: true } });
    gsap.to('.mega-word', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.mega-word', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('#heroGhost', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    try {
      const [c, p] = await Promise.all([fetch('/api/config').then(r => r.json()), fetch('/api/products').then(r => r.json())]);
      cfg = { ...cfg, ...c }; products = p;
    } catch (e) {
      document.body.insertAdjacentHTML('afterbegin', '<p style="padding:40px;text-align:center">The store could not load. Please refresh the page.</p>');
      return;
    }
    buildTicker(); buildMega(); initHero(); buildRail(); buildStory(); buildShop(); buildArchive(); buildBuilder(); buildVoices(); updateCount(); initCursor();
    reveals();
    if (hasGsap && typeof ScrollTrigger !== 'undefined') addEventListener('load', () => ScrollTrigger.refresh());

    $('#shopBtn').onclick = openMega; $('#burger').onclick = openMega; $('#megaClose').onclick = closeMega;
    $('#cartBtn').onclick = () => openDrawer('cart'); $('#scrim').onclick = closeDrawer;
    $('#spotClose').onclick = closeSpot;
    addEventListener('keydown', e => { if (e.key === 'Escape') { closeSpot(); closeDrawer(); closeMega(); } });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const h = a.getAttribute('href'); if (h.length < 2 || a.closest('#megaList')) return;
      e.preventDefault(); scrollToEl(h);
    }));
  }
  boot();
})();
