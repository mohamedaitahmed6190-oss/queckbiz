/* QueckBiz invoice extras: templates + colour, signature, payment details,
   shipping/deposit, saved business & clients (this device only), safe output. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var K = { prefs: 'qb_prefs', clients: 'qb_clients', last: 'qb_last_inv', remember: 'qb_remember' };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jget(k, d) { try { var v = JSON.parse(lsGet(k)); return v == null ? d : v; } catch (e) { return d; } }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function safeColor(c) { return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#2563eb'; }
  function safeImg(u) { return /^data:image\/(png|jpeg|webp|svg\+xml|gif);base64,/.test(u || '') ? u : ''; }
  function money(a, cur) { return (typeof window.formatMoney === 'function') ? window.formatMoney(a, cur) : cur + a.toFixed(2); }

  /* ---------- signature ---------- */
  var sigData = '';
  var canvas = $('sigCanvas'), ctx = canvas ? canvas.getContext('2d') : null, drawing = false;
  function sigPos(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }
  function sigInit() {
    if (!canvas) return;
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111827';
    canvas.addEventListener('pointerdown', function (e) { drawing = true; canvas.setPointerCapture(e.pointerId); var p = sigPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); });
    canvas.addEventListener('pointermove', function (e) { if (!drawing) return; var p = sigPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); });
    var end = function () { if (!drawing) return; drawing = false; sigData = canvas.toDataURL('image/png'); persist(); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  }
  function sigClear() { if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); sigData = ''; var f = $('sigFile'); if (f) f.value = ''; persist(); }
  function sigDrawImage(src) {
    var img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var s = Math.min(canvas.width / img.width, canvas.height / img.height);
      var w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      sigData = canvas.toDataURL('image/png'); persist();
    };
    img.src = src;
  }
  function sigUpload(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.size > 1024 * 1024) { alert('Signature image must be smaller than 1MB.'); e.target.value = ''; return; }
    var r = new FileReader(); r.onload = function (ev) { sigDrawImage(ev.target.result); }; r.readAsDataURL(f);
  }

  /* ---------- persistence ---------- */
  var FIELDS = ['bizName', 'bizContact', 'bizAddress', 'payDetails', 'notes', 'currency', 'taxRate', 'tplSelect', 'accentColor'];
  var timer = null;
  function remembering() { return $('rememberChk') && $('rememberChk').checked; }
  function persist() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!remembering()) return;
      var p = {};
      FIELDS.forEach(function (id) { if ($(id)) p[id] = $(id).value; });
      p.sig = sigData;
      lsSet(K.prefs, JSON.stringify(p));
    }, 300);
  }
  function loadPrefs() {
    var rem = lsGet(K.remember);
    if ($('rememberChk')) $('rememberChk').checked = rem !== '0';
    if (rem === '0') return;
    var p = jget(K.prefs, null);
    if (p) {
      FIELDS.forEach(function (id) { if ($(id) && p[id] != null && p[id] !== '') $(id).value = p[id]; });
      if (p.sig && safeImg(p.sig)) { sigData = p.sig; sigDrawImage(p.sig); }
    }
    var last = lsGet(K.last);
    if (last && $('invNumber') && !$('invNumber').value) $('invNumber').value = nextNumber(last);
  }
  function nextNumber(s) {
    var m = String(s).match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return s;
    var n = String(parseInt(m[2], 10) + 1);
    while (n.length < m[2].length) n = '0' + n;
    return m[1] + n + m[3];
  }
  function forgetAll() {
    if (!confirm('Delete the saved business details, signature and clients from this device?')) return;
    [K.prefs, K.clients, K.last, 'qb_logo_data'].forEach(lsDel);
    lsSet(K.remember, '0'); if ($('rememberChk')) $('rememberChk').checked = false;
    sigClear(); if (typeof window.removeLogo === 'function') window.removeLogo(); renderClients();
  }

  /* ---------- saved clients ---------- */
  function renderClients() {
    var sel = $('savedClients'); if (!sel) return;
    var list = jget(K.clients, []);
    sel.innerHTML = '<option value="">— Saved clients —</option>';
    list.forEach(function (c, i) { var o = document.createElement('option'); o.value = i; o.textContent = c.name; sel.appendChild(o); });
  }
  function saveClient() {
    var name = $('clientName').value.trim(); if (!name) { alert('Enter the client name first.'); return; }
    var list = jget(K.clients, []).filter(function (c) { return c.name.toLowerCase() !== name.toLowerCase(); });
    list.unshift({ name: name, address: $('clientAddress').value });
    if (!lsSet(K.clients, JSON.stringify(list.slice(0, 50)))) alert('Could not save on this device (storage is blocked or full).');
    renderClients();
  }
  function pickClient() {
    var i = $('savedClients').value; if (i === '') return;
    var c = jget(K.clients, [])[parseInt(i, 10)]; if (!c) return;
    $('clientName').value = c.name; $('clientAddress').value = c.address || '';
  }
  function deleteClient() {
    var i = $('savedClients').value; if (i === '') return;
    var list = jget(K.clients, []); list.splice(parseInt(i, 10), 1);
    lsSet(K.clients, JSON.stringify(list)); renderClients();
  }

  /* ---------- invoice HTML ---------- */
  function num(id) { var v = parseFloat($(id) && $(id).value); return isFinite(v) ? v : 0; }
  function collect() {
    var items = [], sub = 0;
    document.querySelectorAll('#itemsContainer .row').forEach(function (row) {
      var d = row.querySelector('.item-desc').value || 'Item';
      var q = parseFloat(row.querySelector('.item-qty').value) || 0;
      var p = parseFloat(row.querySelector('.item-price').value) || 0;
      items.push({ d: d, q: q, p: p, t: q * p }); sub += q * p;
    });
    var disc = num('discountRate'), tax = num('taxRate'), ship = num('shipping'), paid = num('paidAmt');
    var discAmt = sub * disc / 100, after = sub - discAmt, taxAmt = after * tax / 100;
    var total = after + taxAmt + ship;
    return {
      biz: $('bizName').value || 'Your Business', contact: $('bizContact').value, addr: $('bizAddress').value,
      client: $('clientName').value || 'Client Name', cAddr: $('clientAddress').value,
      no: $('invNumber').value || 'INV-001', date: $('invDate').value || new Date().toISOString().slice(0, 10), due: $('dueDate').value,
      cur: $('currency').value, items: items, sub: sub, disc: disc, discAmt: discAmt, tax: tax, taxAmt: taxAmt, ship: ship, total: total,
      paid: paid, balance: total - paid, notes: $('notes').value, pay: $('payDetails') ? $('payDetails').value : '',
      tpl: $('tplSelect') ? $('tplSelect').value : 'classic', color: safeColor($('accentColor') ? $('accentColor').value : '#2563eb'),
      logo: safeImg(window.currentLogo), sig: safeImg(sigData)
    };
  }
  function build(d) {
    var a = d.color, tpl = d.tpl, cur = d.cur;
    var H = tpl === 'modern' ? 'background:' + a + ';color:#fff;padding:.65rem .75rem;text-align:'
          : tpl === 'minimal' ? 'color:#111;padding:.65rem .75rem;border-bottom:2px solid #111;text-align:'
          : 'background:#f1f5f9;color:#64748b;padding:.65rem .75rem;border-bottom:2px solid #e2e8f0;text-align:';
    var th = function (t, al) { return '<th style="' + H + al + ';font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">' + t + '</th>'; };
    var td = 'padding:.65rem .75rem;border-bottom:1px solid #e2e8f0;font-size:.9rem;';
    var title = tpl === 'minimal'
      ? '<div style="font-size:1.1rem;font-weight:600;letter-spacing:.35em;color:#111">INVOICE</div>'
      : '<div style="font-size:2rem;font-weight:700;color:' + (tpl === 'modern' ? '#fff' : a) + '">INVOICE</div>';
    var meta = '<div style="text-align:right;font-size:.85rem;' + (tpl === 'modern' ? 'color:#fff' : 'color:#475569') + '"><div><strong>Invoice #:</strong> ' + esc(d.no) + '</div><div><strong>Date:</strong> ' + esc(d.date) + '</div>' + (d.due ? '<div><strong>Due:</strong> ' + esc(d.due) + '</div>' : '') + '</div>';
    var logo = d.logo ? '<div style="flex:1;display:flex;justify-content:center"><img src="' + d.logo + '" alt="Logo" style="max-height:70px;max-width:180px;object-fit:contain"></div>' : '';
    var head = '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.75rem;' + (tpl === 'modern' ? 'background:' + a + ';padding:1.1rem 1.25rem;border-radius:8px;' : tpl === 'minimal' ? 'padding-bottom:1rem;border-bottom:1px solid #111;' : '') + '">' + title + logo + meta + '</div>';
    var lab = 'font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:.4rem';
    var parties = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:1.75rem">' +
      '<div><h4 style="' + lab + '">From</h4><div style="font-size:.875rem;line-height:1.6"><strong>' + esc(d.biz) + '</strong><br>' + esc(d.contact) + '<br>' + nl2br(d.addr) + '</div></div>' +
      '<div><h4 style="' + lab + '">Bill To</h4><div style="font-size:.875rem;line-height:1.6"><strong>' + esc(d.client) + '</strong><br>' + nl2br(d.cAddr) + '</div></div></div>';
    var rows = d.items.map(function (it) {
      return '<tr><td style="' + td + '">' + esc(it.d) + '</td><td style="' + td + 'text-align:right">' + it.q + '</td><td style="' + td + 'text-align:right">' + money(it.p, cur) + '</td><td style="' + td + 'text-align:right">' + money(it.t, cur) + '</td></tr>';
    }).join('');
    var table = '<table style="width:100%;border-collapse:collapse;margin-bottom:1.25rem"><thead><tr>' + th('Description', 'left') + th('Qty', 'right') + th('Price', 'right') + th('Amount', 'right') + '</tr></thead><tbody>' + rows + '</tbody></table>';
    var line = function (l, v) { return '<div style="display:flex;justify-content:space-between;gap:2rem;font-size:.875rem;color:#475569;margin-bottom:.25rem"><span>' + l + '</span><span>' + v + '</span></div>'; };
    var totals = '<div style="margin-left:auto;max-width:300px">' + line('Subtotal', money(d.sub, cur)) +
      (d.disc > 0 ? line('Discount (' + d.disc + '%)', '-' + money(d.discAmt, cur)) : '') +
      (d.tax > 0 ? line('Tax (' + d.tax + '%)', money(d.taxAmt, cur)) : '') +
      (d.ship > 0 ? line('Shipping / fees', money(d.ship, cur)) : '') +
      '<div style="display:flex;justify-content:space-between;gap:2rem;font-size:1.2rem;font-weight:700;margin-top:.4rem;padding-top:.5rem;border-top:2px solid ' + (tpl === 'minimal' ? '#111' : a) + ';color:#0f172a"><span>Total</span><span>' + money(d.total, cur) + '</span></div>' +
      (d.paid > 0 ? line('Paid', '-' + money(d.paid, cur)) + '<div style="display:flex;justify-content:space-between;gap:2rem;font-size:1.05rem;font-weight:700;color:' + (tpl === 'minimal' ? '#111' : a) + '"><span>Balance due</span><span>' + money(d.balance, cur) + '</span></div>' : '') + '</div>';
    var box = 'margin-top:1.5rem;padding:.9rem 1rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;color:#475569;line-height:1.6;';
    var pay = d.pay.trim() ? '<div style="' + box + '"><strong style="color:#0f172a">Payment details</strong><br>' + nl2br(d.pay) + '</div>' : '';
    var notes = d.notes.trim() ? '<div style="margin-top:1.25rem;font-size:.85rem;color:#475569;line-height:1.6"><strong>Notes</strong><br>' + nl2br(d.notes) + '</div>' : '';
    var sig = d.sig ? '<div style="margin-top:2rem;display:flex;justify-content:flex-end"><div style="text-align:center;width:220px"><img src="' + d.sig + '" alt="Signature" style="max-height:70px;max-width:100%"><div style="border-top:1px solid #94a3b8;margin-top:.25rem;padding-top:.25rem;font-size:.75rem;color:#64748b">Authorized signature</div></div></div>' : '';
    return head + parties + table + totals + pay + notes + sig;
  }

  function preview() {
    $('invoiceContent').innerHTML = build(collect());
    $('previewPlaceholder').style.display = 'none';
    $('invoicePreview').style.display = 'block';
  }
  function printIt() {
    preview();
    var no = $('invNumber').value.trim(); if (no && remembering()) lsSet(K.last, no);
    setTimeout(function () {
      var w = window.open('', '_blank'); if (!w) { alert('Allow pop-ups to print or save as PDF.'); return; }
      w.document.write('<html><head><meta charset="utf-8"><title>Invoice ' + esc($('invNumber').value || '') + '</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:Arial,sans-serif;padding:2rem;color:#000}table{width:100%;border-collapse:collapse}@page{margin:14mm}</style></head><body>' + $('invoiceContent').innerHTML + '</body></html>');
      w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 300);
    }, 150);
  }
  function resetAll() {
    ['clientName', 'clientAddress', 'shipping', 'paidAmt'].forEach(function (id) { if ($(id)) $(id).value = ''; });
    $('taxRate').value = '0'; $('discountRate').value = '0';
    var last = lsGet(K.last); $('invNumber').value = last && remembering() ? nextNumber(last) : '';
    $('invDate').valueAsDate = new Date(); var d = new Date(); d.setDate(d.getDate() + 14); $('dueDate').valueAsDate = d;
    var c = $('itemsContainer'); c.innerHTML = ''; if (typeof window.addRow === 'function') window.addRow();
    $('previewPlaceholder').style.display = 'block'; $('invoicePreview').style.display = 'none';
  }

  /* ---------- wire up ---------- */
  window.generatePreview = preview; window.printInvoice = printIt; window.resetForm = resetAll;
  window.qbPro = { sigClear: sigClear, sigUpload: sigUpload, saveClient: saveClient, pickClient: pickClient, deleteClient: deleteClient, forgetAll: forgetAll, persist: persist, toggleRemember: function () { lsSet(K.remember, remembering() ? '1' : '0'); if (remembering()) persist(); }, setColor: function (c) { $('accentColor').value = c; persist(); } };

  function start() {
    sigInit(); renderClients(); loadPrefs();
    FIELDS.forEach(function (id) { var el = $(id); if (el) { el.addEventListener('input', persist); el.addEventListener('change', persist); } });
    window.addEventListener('load', function () { setTimeout(function () { if ($('currency') && jget(K.prefs, {}).currency) { $('currency').value = jget(K.prefs, {}).currency; } }, 50); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
