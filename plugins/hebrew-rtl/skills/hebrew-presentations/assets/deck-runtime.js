/* deck-runtime.js v1.0 - navigation, click-by-click builds, grid, presenter view,
   edit mode (persisted), QR (offline), request-to-Claude, print.
   No network calls. Needs vendor/qrcode.js loaded before it (global `qrcode`).
   Do NOT put a closing script tag inside this file (it is inlined into HTML). */
(function () {
  'use strict';
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var TOKEN = params.get('token') || '';
  var stage = Q('#stage');
  if (!stage) return;
  var idx = 0, step = 0, scale = 1, editing = false, serverOK = false, sel = null, dirty = false;
  var hist = [], histPos = -1, saveTimer = null, pw = null, bc = null, barTimer = null;
  var isPresenter = params.get('presenter') === '1';
  var isPrint = params.has('print');
  var DECK_ID = 'deck-' + (stage.getAttribute('data-title') || 'x');

  function slides() { return QA('.slide', stage); }
  function maxStep(sl) { var m = 0; QA('[data-b]', sl).forEach(function (e) { m = Math.max(m, +e.getAttribute('data-b') || 0); }); return m; }
  function cur() { return slides()[idx]; }
  function slideTitle(sl) { var h = Q('h1,h2,h3', sl); return h ? h.textContent.trim().slice(0, 80) : ''; }

  /* ---------- rendering ---------- */
  function applySteps(sl, s) { QA('[data-b]', sl).forEach(function (e) { e.classList.toggle('on', (+e.getAttribute('data-b') || 0) <= s); }); }
  function fit(root) {
    QA('.fit', root).forEach(function (el) {
      el.style.fontSize = '';
      var fs = parseFloat(getComputedStyle(el).fontSize), min = fs * 0.5;
      var maxh = +el.getAttribute('data-maxh') || ({ H1: 330, H2: 260, H3: 150 }[el.tagName] || 400);
      var g = 80;
      while (g-- > 0 && fs > min && (el.offsetHeight > maxh || el.scrollWidth > el.clientWidth + 1)) { fs -= 2; el.style.fontSize = fs + 'px'; }
    });
  }
  function renderQR(root) {
    QA('[data-qr-url]', root).forEach(function (box) {
      if (box.querySelector('svg') || typeof qrcode === 'undefined') return;
      try {
        var q = qrcode(0, 'M'); q.addData(box.getAttribute('data-qr-url')); q.make();
        box.innerHTML = q.createSvgTag({ scalable: true, margin: 0 });
        var s = box.querySelector('svg'); if (s) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'QR: ' + box.getAttribute('data-qr-url')); }
      } catch (e) { box.textContent = 'QR?'; }
    });
  }
  function counterText() {
    var n = slides().length, ms = maxStep(cur());
    return (idx + 1) + ' / ' + n + (ms ? ' · צעד ' + step + '/' + ms : '');
  }
  function render() {
    var ss = slides();
    if (idx >= ss.length) idx = ss.length - 1;
    if (idx < 0) idx = 0;
    ss.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
    var sl = ss[idx];
    var ms = maxStep(sl);
    if (step > ms) step = ms;
    applySteps(sl, step);
    fit(sl);
    var c = Q('#ui-ctr'); if (c) c.textContent = counterText();
    var nn = Q('#ui-notes'); if (nn) { var a = Q('.notes', sl); nn.textContent = a ? a.textContent.trim() : '(אין הערות לשקופית זו)'; }
    try { history.replaceState(null, '', '#' + (idx + 1) + '.' + step); } catch (e) {}
    pushPresenter();
  }
  function show(i, s) { idx = i; step = s || 0; render(); }
  function next() {
    var ms = maxStep(cur());
    if (step < ms) step++; else if (idx < slides().length - 1) { idx++; step = 0; }
    render();
  }
  function prev() {
    if (step > 0) step--; else if (idx > 0) { idx--; step = maxStep(cur()); }
    render();
  }
  function resize() {
    scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.setProperty('--scale', scale);
  }

  /* ---------- history / save ---------- */
  function cleanStageHTML() {
    var c = stage.cloneNode(true);
    QA('.guide', c).forEach(function (e) { e.remove(); });
    QA('.active,.sel,.on', c).forEach(function (e) { e.classList.remove('active', 'sel', 'on'); if (!e.getAttribute('class')) e.removeAttribute('class'); });
    QA('[contenteditable]', c).forEach(function (e) { e.removeAttribute('contenteditable'); });
    c.style.removeProperty('--scale');
    if (!c.getAttribute('style')) c.removeAttribute('style');
    return c.innerHTML;
  }
  function serialize() {
    var html = document.documentElement.cloneNode(true);
    var st = html.querySelector('#stage'); st.innerHTML = cleanStageHTML();
    st.removeAttribute('style');
    ['#ui', '.pv'].forEach(function (s) { var e = html.querySelector(s); if (e) e.remove(); });
    html.querySelector('body').removeAttribute('class');
    return '<!doctype html>\n' + html.outerHTML;
  }
  function snapshot() {
    var s = { html: cleanStageHTML(), idx: idx };
    hist = hist.slice(0, histPos + 1); hist.push(s); if (hist.length > 100) hist.shift(); histPos = hist.length - 1;
  }
  function restore(s) {
    stage.innerHTML = s.html; idx = s.idx; sel = null; hideTB();
    renderQR(stage); render(); buildGrid(); scheduleSave();
  }
  function undo() { if (histPos > 0) { histPos--; restore(hist[histPos]); } }
  function redo() { if (histPos < hist.length - 1) { histPos++; restore(hist[histPos]); } }
  function commit() { snapshot(); buildGrid(); scheduleSave(); }
  function setSaveLabel(t) { var e = Q('#ui-save'); if (e) e.textContent = t; }
  function scheduleSave() {
    dirty = true; setSaveLabel(serverOK ? 'שומר...' : 'לא נשמר לקובץ (מצב קובץ): לחצו "הורד HTML"');
    if (!serverOK) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      fetch('/__save', { method: 'POST', headers: { 'X-Deck-Token': TOKEN, 'Content-Type': 'text/html;charset=utf-8' }, body: serialize() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); dirty = false; setSaveLabel('נשמר ✓ ' + new Date().toLocaleTimeString('he-IL')); })
        .catch(function (e) { setSaveLabel('שגיאת שמירה: ' + e.message + ' (הורידו HTML)'); });
    }, 450);
  }
  function download() {
    var b = new Blob([serialize()], { type: 'text/html;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = (stage.getAttribute('data-title') || 'deck') + '.html'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); dirty = false; setSaveLabel('הורד');
  }

  /* ---------- request to Claude ---------- */
  function sendRequest(kind, text) {
    var sl = cur(), file = stage.getAttribute('data-file') || 'deck.html';
    var clone = sl.cloneNode(true); QA('.active,.sel', clone).forEach(function (e) { e.classList.remove('active', 'sel'); });
    var payload = { kind: kind, slide: idx + 1, slideId: sl.id || '', title: slideTitle(sl), text: text, html: clone.outerHTML.slice(0, 8000), ts: new Date().toISOString() };
    var prompt = 'בקשה לשינוי במצגת "' + (stage.getAttribute('data-title') || '') + '" (' + file + ')\n' +
      'שקופית ' + payload.slide + (payload.slideId ? ' (' + payload.slideId + ')' : '') + ': ' + payload.title + '\n' +
      'סוג: ' + kind + '\nהבקשה: ' + text + '\n' +
      'בצע את השינוי במקור (content.json או קובץ ה-HTML), בנה מחדש, ובדוק בצילום מסך.';
    try { navigator.clipboard.writeText(prompt); } catch (e) {}
    if (serverOK) {
      return fetch('/__request', { method: 'POST', headers: { 'X-Deck-Token': TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.ok ? 'נשלח לקובץ הבקשות. הפרומפט גם הועתק ללוח.' : 'השרת דחה (' + r.status + '). הפרומפט הועתק ללוח, הדביקו אותו ל-Claude.'; })
        .catch(function () { return 'השרת לא ענה. הפרומפט הועתק ללוח, הדביקו אותו ל-Claude.'; });
    }
    return Promise.resolve('מצב קובץ (אין שרת שמירה): הפרומפט הועתק ללוח. הדביקו אותו ל-Claude.');
  }

  /* ---------- UI chrome ---------- */
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in (attrs || {})) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function buildUI() {
    var ui = el('div', { id: 'ui' });
    ui.innerHTML =
      '<div class="ui-badge" id="ui-badge" hidden></div>' +
      '<div class="ui-save" id="ui-save"></div>' +
      '<div class="ui-notes" id="ui-notes" aria-live="polite"></div>' +
      '<div class="ui-bar" id="ui-bar"><div class="in" role="toolbar" aria-label="שליטה במצגת">' +
      '<button id="b-prev" aria-label="שקופית קודמת" title="קודם (→)"><span class="ico-arrow" style="transform:none">❯</span></button>' +
      '<span class="ctr" id="ui-ctr" aria-live="polite"></span>' +
      '<button id="b-next" aria-label="שקופית הבאה" title="הבא (←)"><span class="ico-arrow" style="transform:none">❮</span></button>' +
      '<span class="sep"></span>' +
      '<button id="b-grid" title="רשת שקופיות (G)">רשת</button>' +
      '<button id="b-full" title="מסך מלא (F)">מסך מלא</button>' +
      '<button id="b-notes" aria-pressed="false" title="הערות דובר (N)">הערות</button>' +
      '<button id="b-pres" title="תצוגת מגיש (P)">תצוגת מגיש</button>' +
      '<span class="sep"></span>' +
      '<button id="b-edit" aria-pressed="false" title="מצב עריכה (E)">עריכה</button>' +
      '<button id="b-req" title="בקשה ל-Claude">בקשה ל-Claude</button>' +
      '</div></div>' +
      '<div class="ui-edit" id="ui-edit">' +
      '<button id="e-text">+ תיבת טקסט</button><button id="e-img">+ תמונה / החלפה</button><button id="e-qr">+ קוד QR מקישור</button>' +
      '<button id="e-new">+ שקופית חדשה (בתיאור)</button><button id="e-dup">שכפול שקופית</button><button id="e-del">מחיקת שקופית</button>' +
      '<button id="e-undo">ביטול (Ctrl+Z)</button><button id="e-redo">שחזור (Ctrl+Y)</button><button id="e-dl">הורד HTML</button>' +
      '<input type="file" id="e-file" accept="image/*" hidden></div>' +
      '<div class="ui-tb" id="ui-tb"><select id="t-font" aria-label="גופן"></select>' +
      '<input type="number" id="t-size" min="10" max="400" aria-label="גודל"><input type="color" id="t-color" aria-label="צבע">' +
      '<button id="t-bold" aria-label="מודגש"><b>B</b></button><button id="t-del" aria-label="מחק">מחק</button></div>' +
      '<div class="ui-grid" id="ui-grid"></div>' +
      '<div class="ui-modal" id="ui-modal"><div class="box" role="dialog" aria-modal="true"><div id="m-title" style="font-weight:800;font-size:19px"></div>' +
      '<div id="m-body"></div><div class="hint" id="m-hint"></div><div class="row"><button id="m-ok">אישור</button><button id="m-cancel">ביטול</button></div></div></div>';
    document.body.appendChild(ui);
    var f = Q('#t-font');
    ['Heebo', 'Assistant', 'Rubik', 'Frank Ruhl Libre', 'David', 'Gisha', 'Segoe UI', 'Arial'].forEach(function (n) { f.appendChild(el('option', { value: n }, n)); });
    Q('#b-prev').onclick = prev; Q('#b-next').onclick = next;
    Q('#b-grid').onclick = toggleGrid; Q('#b-full').onclick = toggleFull;
    Q('#b-notes').onclick = toggleNotes; Q('#b-pres').onclick = openPresenter;
    Q('#b-edit').onclick = toggleEdit; Q('#b-req').onclick = openRequest;
    Q('#e-text').onclick = addText; Q('#e-img').onclick = function () { Q('#e-file').click(); };
    Q('#e-file').onchange = onFile; Q('#e-qr').onclick = addQR; Q('#e-new').onclick = newSlide;
    Q('#e-dup').onclick = dupSlide; Q('#e-del').onclick = delSlide;
    Q('#e-undo').onclick = undo; Q('#e-redo').onclick = redo; Q('#e-dl').onclick = download;
    Q('#t-font').onchange = function () { styleSel('fontFamily', '"' + this.value + '", "Segoe UI", Arial, sans-serif'); };
    Q('#t-size').onchange = function () { if (sel) sel.classList.remove('fit'); styleSel('fontSize', this.value + 'px'); };
    Q('#t-color').onchange = function () { styleSel('color', this.value); };
    Q('#t-bold').onclick = function () { if (!sel) return; var b = parseInt(getComputedStyle(sel).fontWeight, 10) >= 700; styleSel('fontWeight', b ? '400' : '800'); };
    Q('#t-del').onclick = function () { delSel(); };
    var bd = stage.getAttribute('data-built'), tt = stage.getAttribute('data-total');
    if (bd && tt) { var b = Q('#ui-badge'); b.hidden = false; b.textContent = 'נבנית: ' + bd + ' מתוך ' + tt; }
  }
  function modal(title, bodyHTML, hint, onOk) {
    var m = Q('#ui-modal'); Q('#m-title').textContent = title; Q('#m-body').innerHTML = bodyHTML; Q('#m-hint').textContent = hint || '';
    m.classList.add('show');
    var f = Q('#m-body input,#m-body textarea'); if (f) setTimeout(function () { f.focus(); }, 30);
    Q('#m-ok').onclick = function () { var v = f ? f.value : ''; m.classList.remove('show'); onOk(v); };
    Q('#m-cancel').onclick = function () { m.classList.remove('show'); };
  }
  function openRequest() {
    modal('בקשה ל-Claude על שקופית ' + (idx + 1), '<textarea id="m-t" placeholder="למשל: קצר את הכותרת והגדל את המספר"></textarea>',
      serverOK ? 'הבקשה נכתבת לקובץ שהסשן עוקב אחריו, ומועתקת גם ללוח.' : 'מצב קובץ: הפרומפט יועתק ללוח. הדביקו אותו ל-Claude.', function (v) {
        if (!v.trim()) return; sendRequest('edit-slide', v.trim()).then(function (msg) { setSaveLabel(msg); Q('#ui-save').style.display = 'block'; });
      });
  }

  /* ---------- grid ---------- */
  function buildGrid() {
    var g = Q('#ui-grid'); if (!g) return; g.innerHTML = '';
    slides().forEach(function (s, i) {
      var t = el('div', { class: 'thumb' + (i === idx ? ' cur' : ''), draggable: editing ? 'true' : 'false', 'data-i': i, tabindex: 0, role: 'button', 'aria-label': 'שקופית ' + (i + 1) });
      var mini = el('div', { class: 'mini' }); var c = s.cloneNode(true); c.classList.add('active'); QA('.on,.sel', c).forEach(function (e) { e.classList.remove('on', 'sel'); }); mini.appendChild(c);
      t.appendChild(mini); t.appendChild(el('span', { class: 'num' }, String(i + 1)));
      t.appendChild(el('div', { class: 'acts' }, '<button data-a="dup">שכפל</button><button data-a="del">מחק</button>'));
      g.appendChild(t);
    });
    var w = (g.firstChild ? g.firstChild.clientWidth : 300) || 300; QA('.thumb .mini', g).forEach(function (m) { m.style.transform = 'scale(' + (w / 1920) + ')'; });
  }
  function toggleGrid(force) {
    var g = Q('#ui-grid'), on = typeof force === 'boolean' ? force : !g.classList.contains('show');
    g.classList.toggle('show', on); if (on) { buildGrid(); }
  }
  function gridEvents() {
    var g = Q('#ui-grid'), dragI = null;
    g.addEventListener('click', function (e) {
      var t = e.target.closest('.thumb'); if (!t) { toggleGrid(false); return; }
      var i = +t.getAttribute('data-i'), a = e.target.getAttribute('data-a');
      if (a === 'dup') { idx = i; dupSlide(); return; }
      if (a === 'del') { idx = i; delSlide(); return; }
      toggleGrid(false); show(i, 0);
    });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('thumb')) { toggleGrid(false); show(+e.target.getAttribute('data-i'), 0); } });
    g.addEventListener('dragstart', function (e) { var t = e.target.closest('.thumb'); if (!t || !editing) return; dragI = +t.getAttribute('data-i'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(dragI)); } catch (x) {} });
    g.addEventListener('dragover', function (e) { var t = e.target.closest('.thumb'); if (t && dragI !== null) { e.preventDefault(); QA('.dragover', g).forEach(function (x) { x.classList.remove('dragover'); }); t.classList.add('dragover'); } });
    g.addEventListener('drop', function (e) {
      var t = e.target.closest('.thumb'); if (!t || dragI === null) return; e.preventDefault();
      var to = +t.getAttribute('data-i'), ss = slides(), mv = ss[dragI];
      if (to !== dragI) { var ref = ss[to]; if (dragI < to) ref.after(mv); else ref.before(mv); idx = slides().indexOf(mv); step = 0; render(); commit(); }
      dragI = null; buildGrid();
    });
  }

  /* ---------- fullscreen / notes / presenter ---------- */
  function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
  function toggleNotes() { var n = Q('#ui-notes'), on = n.classList.toggle('show'); Q('#b-notes').setAttribute('aria-pressed', on); }
  function openPresenter() {
    var u = location.href.split('#')[0].split('?')[0] + '?presenter=1' + (TOKEN ? '&token=' + TOKEN : '');
    pw = window.open(u, 'deckpresenter', 'width=1280,height=760'); setTimeout(pushPresenter, 700);
  }
  function pushPresenter() {
    var msg = { deck: DECK_ID, type: 'state', idx: idx, step: step };
    if (pw && !pw.closed) { try { pw.postMessage(msg, '*'); } catch (e) {} }
    if (bc) bc.postMessage(msg);
  }
  function presenterBoot() {
    document.body.classList.add('presenter');
    var pv = el('div', { class: 'pv' });
    pv.innerHTML = '<div class="top"><div class="timer" id="pv-timer">00:00</div><div id="pv-rem"></div><div id="pv-ctr"></div>' +
      '<button id="pv-prev">הקודם</button><button id="pv-next">הבא</button><button id="pv-reset">אפס טיימר</button></div>' +
      '<div class="cur" id="pv-cur"></div><div class="side"><div class="nxt" id="pv-nxt"></div><div class="pnotes" id="pv-notes"></div></div>';
    document.body.appendChild(pv);
    var started = null, mins = +stage.getAttribute('data-minutes') || 0;
    function send(d) { var m = { deck: DECK_ID, type: 'cmd', delta: d }; if (window.opener) { try { window.opener.postMessage(m, '*'); return; } catch (e) {} } if (bc) bc.postMessage(m); }  /* one channel only: both would advance twice */
    Q('#pv-prev').onclick = function () { send(-1); }; Q('#pv-next').onclick = function () { send(1); };
    Q('#pv-reset').onclick = function () { started = Date.now(); };
    function paint(box, i, s) {
      var sl = slides()[i]; box.innerHTML = '';
      if (!sl) return; var m = el('div', { class: 'mini' }), c = sl.cloneNode(true); c.classList.add('active'); applySteps(c, s); m.appendChild(c); box.appendChild(m);
      m.style.transform = 'scale(' + (box.clientWidth / 1920) + ')';
    }
    function onState(st) {
      if (!started) started = Date.now();
      var ss = slides(), sl = ss[st.idx]; idx = st.idx; step = st.step;
      paint(Q('#pv-cur'), st.idx, st.step);
      var ms = maxStep(sl), ni = st.idx, ns = st.step + 1;
      if (ns > ms) { ni = st.idx + 1; ns = 0; }
      paint(Q('#pv-nxt'), ni, ns);
      var a = Q('.notes', sl); Q('#pv-notes').textContent = a ? a.textContent.trim() : '(אין הערות)';
      Q('#pv-ctr').textContent = 'שקופית ' + (st.idx + 1) + ' מתוך ' + ss.length + (ms ? ' · צעד ' + st.step + '/' + ms : '');
    }
    window.addEventListener('message', function (e) { var d = e.data; if (d && d.deck === DECK_ID && d.type === 'state') onState(d); });
    if (bc) bc.onmessage = function (e) { var d = e.data; if (d && d.type === 'state') onState(d); };
    document.addEventListener('keydown', function (e) {
      if (['ArrowLeft', ' ', 'Enter', 'PageDown', 'ArrowDown'].indexOf(e.key) >= 0) { e.preventDefault(); send(1); }
      if (['ArrowRight', 'PageUp', 'Backspace', 'ArrowUp'].indexOf(e.key) >= 0) { e.preventDefault(); send(-1); }
    });
    setInterval(function () {
      if (!started) return; var t = Math.floor((Date.now() - started) / 1000), tm = Q('#pv-timer');
      tm.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
      if (mins) { var r = mins * 60 - t; Q('#pv-rem').textContent = r >= 0 ? 'נותרו ' + Math.floor(r / 60) + ' דק׳ ' + (r % 60) + ' ש׳' : 'חריגה של ' + Math.floor(-r / 60) + ' דק׳'; tm.classList.toggle('over', r < 0); }
    }, 500);
    if (window.opener) window.opener.postMessage({ deck: DECK_ID, type: 'hello' }, '*');
    if (bc) bc.postMessage({ deck: DECK_ID, type: 'hello' });
  }

  /* ---------- edit mode ---------- */
  var EDITABLE = '[data-edit],h1,h2,h3,p,li,blockquote,cite,.tb,.num,.label,.note,.sub,.kicker,.t,.d,.v,.barrow,img,.qr-box,.media,.step';
  function toggleEdit() {
    editing = !editing; document.body.classList.toggle('editing', editing); Q('#b-edit').setAttribute('aria-pressed', editing);
    if (editing) { if (!hist.length) snapshot(); document.body.classList.add('barzone'); setSaveLabel(serverOK ? 'מחובר לשרת שמירה: שמירה אוטומטית' : 'מצב קובץ: אין שמירה אוטומטית, השתמשו ב"הורד HTML"'); }
    else { selectEl(null); document.body.classList.remove('barzone'); render(); }
    buildGrid();
  }
  function selectEl(e) {
    if (sel) sel.classList.remove('sel'); sel = e; hideTB();
    if (sel) { sel.classList.add('sel'); showTB(); }
  }
  function hideTB() { var t = Q('#ui-tb'); if (t) t.classList.remove('show'); }
  function showTB() {
    var t = Q('#ui-tb'); if (!sel) return;
    var r = sel.getBoundingClientRect(), cs = getComputedStyle(sel);
    t.classList.add('show');
    t.style.top = Math.max(8, r.top - t.offsetHeight - 10) + 'px';
    t.style.left = Math.min(innerWidth - t.offsetWidth - 8, Math.max(8, r.left)) + 'px';
    Q('#t-size').value = Math.round(parseFloat(cs.fontSize));
    var m = cs.color.match(/\d+/g) || [0, 0, 0]; Q('#t-color').value = '#' + m.slice(0, 3).map(function (n) { return (+n).toString(16).padStart(2, '0'); }).join('');
    var fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), f = Q('#t-font');
    if (!QA('option', f).some(function (o) { return o.value === fam; })) f.appendChild(el('option', { value: fam }, fam)); f.value = fam;
  }
  function styleSel(prop, val) { if (!sel) return; sel.style[prop] = val; commit(); showTB(); }
  function delSel() { if (!sel) return; var e = sel; selectEl(null); e.remove(); commit(); }
  function unitOf(target) {
    var sl = cur(); var n = target.closest(EDITABLE);
    while (n && !sl.contains(n)) n = n.parentElement && n.parentElement.closest(EDITABLE);
    if (!n || n === sl) return null;
    return n;
  }
  function stageRect(e) { var s = stage.getBoundingClientRect(), r = e.getBoundingClientRect(); return { l: (r.left - s.left) / scale, t: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale }; }
  function getD(e) { return [parseFloat(e.getAttribute('data-dx')) || 0, parseFloat(e.getAttribute('data-dy')) || 0]; }
  function setD(e, x, y) { e.setAttribute('data-dx', x); e.setAttribute('data-dy', y); e.style.translate = x + 'px ' + y + 'px'; }
  function guides(sl, xs, ys) {
    QA('.guide', sl).forEach(function (g) { g.remove(); });
    xs.forEach(function (x) { var g = el('div', { class: 'guide v' }); g.style.insetInlineStart = 'auto'; g.style.left = x + 'px'; sl.appendChild(g); });
    ys.forEach(function (y) { var g = el('div', { class: 'guide h' }); g.style.top = y + 'px'; sl.appendChild(g); });
  }
  function editEvents() {
    stage.addEventListener('pointerdown', function (ev) {
      if (!editing || ev.button !== 0) return;
      var u = unitOf(ev.target);
      if (u && u.isContentEditable) return;
      if (!u) { selectEl(null); return; }
      selectEl(u);
      var sl = cur(), start = { x: ev.clientX, y: ev.clientY }, d0 = getD(u), r0 = stageRect(u), moved = false;
      var cand = { x: [960, 140, 1780], y: [540, 96, 984] };
      QA(EDITABLE, sl).forEach(function (o) { if (o === u || u.contains(o) || o.contains(u)) return; var r = stageRect(o); cand.x.push(r.l, r.l + r.w / 2, r.l + r.w); cand.y.push(r.t, r.t + r.h / 2, r.t + r.h); });
      function mv(e) {
        var dx = (e.clientX - start.x) / scale, dy = (e.clientY - start.y) / scale;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return; moved = true;
        var gx = [], gy = [], L = r0.l + dx, T = r0.t + dy, W = r0.w, H = r0.h;
        var bx = null, by = null;
        [0, W / 2, W].forEach(function (o) { cand.x.forEach(function (c) { var dd = c - (L + o); if (Math.abs(dd) <= 10 && (bx === null || Math.abs(dd) < Math.abs(bx.d))) bx = { d: dd, c: c }; }); });
        [0, H / 2, H].forEach(function (o) { cand.y.forEach(function (c) { var dd = c - (T + o); if (Math.abs(dd) <= 10 && (by === null || Math.abs(dd) < Math.abs(by.d))) by = { d: dd, c: c }; }); });
        if (bx) { dx += bx.d; gx.push(bx.c); } else dx = Math.round((r0.l + dx) / 10) * 10 - r0.l;
        if (by) { dy += by.d; gy.push(by.c); } else dy = Math.round((r0.t + dy) / 10) * 10 - r0.t;
        setD(u, Math.round(d0[0] + dx), Math.round(d0[1] + dy)); guides(sl, gx, gy); showTB();
      }
      function up() { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); QA('.guide', sl).forEach(function (g) { g.remove(); }); if (moved) commit(); }
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    });
    stage.addEventListener('dblclick', function (ev) {
      if (!editing) return; var u = unitOf(ev.target); if (!u || /^(IMG)$/.test(u.tagName) || u.classList.contains('qr-box') || u.classList.contains('media')) return;
      var before = u.innerHTML; u.classList.remove('fit'); u.setAttribute('contenteditable', 'true'); u.focus();
      var r = document.createRange(); r.selectNodeContents(u); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      function done() { u.removeEventListener('blur', done); u.removeAttribute('contenteditable'); if (u.innerHTML !== before) commit(); showTB(); }
      u.addEventListener('blur', done);
      u.addEventListener('paste', function (e) { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
    });
  }
  function addText() {
    var d = el('div', { class: 'tb', 'data-edit': '' }, 'טקסט חדש'); d.style.insetInlineStart = '700px'; d.style.insetBlockStart = '420px';
    cur().appendChild(d); selectEl(d); commit();
  }
  function onFile() {
    var f = this.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () {
      var u = rd.result, s = sel;
      if (s && s.tagName === 'IMG') s.src = u;
      else if (s && (s.classList.contains('media') || s.classList.contains('full'))) { s.innerHTML = '<img alt="" src="' + u + '">'; }
      else { var i = el('img', { class: 'tb', 'data-edit': '', alt: '', src: u }); i.style.width = '640px'; i.style.insetInlineStart = '600px'; i.style.insetBlockStart = '260px'; cur().appendChild(i); selectEl(i); }
      commit();
    };
    rd.readAsDataURL(f); this.value = '';
  }
  function addQR() {
    modal('קוד QR מקישור', '<input type="text" id="m-u" dir="ltr" placeholder="https://...">', 'נוצר בדפדפן, בלי רשת.', function (u) {
      if (!u.trim()) return; var b = el('div', { class: 'tb qr-box', 'data-edit': '', 'data-qr-url': u.trim() }); b.style.width = '360px'; b.style.height = '360px'; b.style.padding = '24px';
      b.style.insetInlineStart = '200px'; b.style.insetBlockStart = '520px'; cur().appendChild(b); renderQR(cur()); selectEl(b); commit();
    });
  }
  function newSlide() {
    modal('שקופית חדשה: תארו במילים', '<textarea id="m-d" placeholder="למשל: שקופית עם המספר 70% ושורה שמסבירה מה הוא מודד"></textarea>',
      'נוצרת שקופית טיוטה, והתיאור נשלח ל-Claude (קובץ בקשות או לוח) כדי שימלא אותה.', function (v) {
        if (!v.trim()) return; var s = el('section', { class: 'slide l-statement', 'data-new': '1' }, '<h2 class="fit">' + v.trim().slice(0, 80).replace(/</g, '&lt;') + '</h2><p class="muted">שקופית טיוטה, ממתינה ל-Claude</p><aside class="notes"></aside>');
        cur().after(s); idx++; step = 0; render(); commit(); sendRequest('new-slide', v.trim()).then(function (m) { setSaveLabel(m); });
      });
  }
  function dupSlide() { var s = cur(), c = s.cloneNode(true); c.classList.remove('active'); if (c.id) c.id = c.id + '-copy'; s.after(c); idx++; step = 0; render(); commit(); }
  function delSlide() { if (slides().length < 2) return; var s = cur(); s.remove(); if (idx >= slides().length) idx = slides().length - 1; step = 0; render(); commit(); }

  /* ---------- keyboard ---------- */
  function keys() {
    document.addEventListener('keydown', function (e) {
      var tg = e.target; if (tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))) { if (e.key === 'Escape') { tg.blur(); } return; }
      var k = e.key, ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && (k === 'z' || k === 'Z')) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (ctrl && (k === 'y' || k === 'Y')) { e.preventDefault(); redo(); return; }
      if (editing && sel && (k === 'Delete')) { e.preventDefault(); delSel(); return; }
      if (editing && sel && k.indexOf('Arrow') === 0) { e.preventDefault(); var d = getD(sel), n = e.shiftKey ? 10 : 1; if (k === 'ArrowLeft') d[0] -= n; if (k === 'ArrowRight') d[0] += n; if (k === 'ArrowUp') d[1] -= n; if (k === 'ArrowDown') d[1] += n; setD(sel, d[0], d[1]); commit(); return; }
      if (k === 'Escape') { if (Q('#ui-modal.show')) Q('#ui-modal').classList.remove('show'); else if (Q('#ui-grid.show')) toggleGrid(false); else if (sel) selectEl(null); return; }
      if (['ArrowLeft', ' ', 'Enter', 'PageDown', 'ArrowDown'].indexOf(k) >= 0) { e.preventDefault(); next(); }
      else if (['ArrowRight', 'PageUp', 'Backspace', 'ArrowUp'].indexOf(k) >= 0) { e.preventDefault(); prev(); }
      else if (k === 'Home') { show(0, 0); } else if (k === 'End') { show(slides().length - 1, 0); }
      else if (k === 'g' || k === 'G') toggleGrid(); else if (k === 'f' || k === 'F') toggleFull();
      else if (k === 'n' || k === 'N') toggleNotes(); else if (k === 'p' || k === 'P') openPresenter(); else if (k === 'e' || k === 'E') toggleEdit();
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    resize(); addEventListener('resize', function () { resize(); if (Q('#ui-grid.show')) buildGrid(); });
    renderQR(stage);
    if (typeof BroadcastChannel !== 'undefined') { try { bc = new BroadcastChannel(DECK_ID); } catch (e) {} }
    if (isPresenter) { presenterBoot(); render(); return; }
    if (isPrint) { document.body.classList.add('print'); }
    if (params.has('clean')) document.body.classList.add('clean');
    if (params.get('shot') === 'full') document.body.classList.add('shotfull');
    var m = (location.hash || '').match(/#(\d+)(?:\.(\d+))?/); if (m) { idx = Math.max(0, +m[1] - 1); step = +(m[2] || 0); }
    buildUI(); gridEvents(); editEvents(); keys();
    window.addEventListener('message', function (e) {
      var d = e.data; if (!d || d.deck !== DECK_ID) return;
      if (d.type === 'cmd') { d.delta > 0 ? next() : prev(); } else if (d.type === 'hello') pushPresenter();
    });
    if (bc) bc.onmessage = function (e) { var d = e.data; if (!d || d.deck !== DECK_ID) return; if (d.type === 'cmd') { d.delta > 0 ? next() : prev(); } else if (d.type === 'hello') pushPresenter(); };
    stage.addEventListener('click', function (e) { if (editing || e.target.closest('a')) return; next(); });
    document.addEventListener('mousemove', function (e) {
      if (editing) return; document.body.classList.add('barzone'); clearTimeout(barTimer);
      barTimer = setTimeout(function () { document.body.classList.remove('barzone'); }, 2500);
    });
    if (location.protocol.indexOf('http') === 0) {
      fetch('/__ping', { headers: { 'X-Deck-Token': TOKEN } }).then(function (r) { serverOK = r.ok; }).catch(function () {});
    }
    render();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (isPrint) slides().forEach(fit); render(); });
    if (isPrint) { slides().forEach(function (s) { s.style.display = 'block'; fit(s); s.style.display = ''; }); }
    window.addEventListener('beforeunload', function (e) { if (dirty && !serverOK) { e.preventDefault(); e.returnValue = ''; } });
  }
  window.Deck = {
    show: show, next: next, prev: prev, count: function () { return slides().length; }, steps: function (i) { return maxStep(slides()[i]); },
    serialize: serialize, ready: function () { return (document.fonts && document.fonts.ready) || Promise.resolve(); }, fitAll: function () { slides().forEach(function (s) { var d = s.style.display; s.style.display = 'block'; fit(s); s.style.display = d; }); },
    toggleEdit: toggleEdit, toggleGrid: toggleGrid, state: function () { return { idx: idx, step: step, editing: editing }; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
