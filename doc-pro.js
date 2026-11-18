/* QueckBiz document extras (invoice, receipt, estimate, proforma, credit note, purchase order):
   templates + colour, signature, payment details, shipping/deposit, saved business & contacts
   (this device only), escaped output. Language and document type come from the <script> tag. */
(function () {
  'use strict';
  var SCRIPT = document.currentScript;
  var TYPE = (SCRIPT && SCRIPT.getAttribute('data-doc')) || 'invoice';
  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  if (!/^(en|fr|ar)$/.test(LANG)) LANG = 'en';
  var RTL = LANG === 'ar';
  var $ = function (id) { return document.getElementById(id); };

  var DOCS = {
    invoice:       { no: 'invNumber', date: 'invDate', extra: [['dueDate', 'due']], content: 'invoiceContent', preview: 'invoicePreview', print: 'printInvoice', prefix: 'INV-001', last: 'qb_last_inv', from: 'from', to: 'billTo', notes: 'notes', notesLbl: 'notes', biz: { name: 'bizName', contact: 'bizContact', addr: 'bizAddress' }, party: { name: 'clientName', addr: 'clientAddress' }, ship: 1, paid: 1, pay: 1, clients: 'clients' },
    estimate:      { no: 'estNumber', date: 'estDate', extra: [['validDate', 'valid']], content: 'estContent', preview: 'estPreview', print: 'printEstimate', prefix: 'EST-001', last: 'qb_last_est', from: 'from', to: 'preparedFor', notes: 'terms', notesLbl: 'terms', biz: { name: 'bizName', contact: 'bizContact', addr: 'bizAddress' }, party: { name: 'clientName', addr: 'clientAddress' }, ship: 1, clients: 'clients' },
    proforma:      { no: 'profNumber', date: 'profDate', extra: [['expiryDate', 'expiry']], content: 'profContent', preview: 'profPreview', print: 'printProforma', prefix: 'PRO-001', last: 'qb_last_pro', from: 'from', to: 'billTo', notes: 'notes', notesLbl: 'notes', biz: { name: 'bizName', contact: 'bizContact', addr: 'bizAddress' }, party: { name: 'clientName', addr: 'clientAddress' }, ship: 1, pay: 1, clients: 'clients' },
    creditnote:    { no: 'cnNumber', date: 'cnDate', extra: [['origInv', 'origInv']], content: 'cnContent', preview: 'cnPreview', print: 'printCN', prefix: 'CN-001', last: 'qb_last_cn', from: 'from', to: 'creditTo', notes: 'notes', notesLbl: 'notes', blocks: [['reason', 'reason']], totalKey: 'creditTotal', color: '#dc2626', biz: { name: 'bizName', contact: 'bizContact', addr: 'bizAddress' }, party: { name: 'clientName', addr: 'clientAddress' }, clients: 'clients' },
    purchaseorder: { no: 'poNumber', date: 'poDate', extra: [['deliveryDate', 'delivery']], content: 'poContent', preview: 'poPreview', print: 'printPO', prefix: 'PO-001', last: 'qb_last_po', from: 'buyer', to: 'vendor', notes: 'terms', notesLbl: 'terms', sku: 1, ship: 1, shipExists: 1, biz: { name: 'buyerName', contact: 'buyerContact', addr: 'buyerAddress' }, party: { name: 'vendorName', addr: 'vendorAddress' }, clients: 'suppliers' },
    moroccan:      { no: 'invNumber', date: 'invDate', extra: [['dueDate', 'due']], content: 'invoiceContent', preview: 'invoicePreview', print: 'printInvoice', prefix: 'FAC-001', last: 'qb_last_ma', from: 'from', to: 'billTo', notes: 'notes', notesLbl: 'payTerms', biz: { name: 'bizName', contact: 'bizContact', addr: 'bizAddress' }, party: { name: 'clientName', addr: 'clientAddress' }, ship: 1, paid: 1, pay: 1, clients: 'clients', ht: 1, words: 1, legal: 1 },
    deliverynote:  { no: 'dnNumber', date: 'dnDate', extra: [['orderRef', 'orderRef'], ['transport', 'transport']], content: 'dnContent', preview: 'dnPreview', print: 'printDN', prefix: 'BL-001', last: 'qb_last_dn', from: 'seller', to: 'deliverTo', notes: 'notes', notesLbl: 'notes', biz: { name: 'bizName', contact: 'bizContact', addr: 'bizAddress' }, party: { name: 'clientName', addr: 'clientAddress' }, clients: 'clients', noPrice: 1, sku: 1, legal: 1 },
    receipt:       { no: 'recNumber', date: 'recDate', extra: [['payment', 'paymentMethod']], content: 'receiptContent', preview: 'receiptPreview', print: 'printReceipt', prefix: 'R-001', last: 'qb_last_rec', from: 'from', to: 'customer', notes: 'thanks', notesLbl: 'thanks', receipt: 1, biz: { name: 'bizName', addr: 'bizAddress' }, party: { name: 'customer' } }
  };
  var C = DOCS[TYPE] || DOCS.invoice;

  var T = {
    en: {
      title: { moroccan: 'INVOICE', deliverynote: 'DELIVERY NOTE', invoice: 'INVOICE', estimate: 'ESTIMATE', proforma: 'PROFORMA INVOICE', creditnote: 'CREDIT NOTE', purchaseorder: 'PURCHASE ORDER', receipt: 'RECEIPT' },
      noLbl: { moroccan: 'Invoice #', deliverynote: 'Delivery note #', invoice: 'Invoice #', estimate: 'Estimate #', proforma: 'Proforma #', creditnote: 'Credit note #', purchaseorder: 'PO #', receipt: 'Receipt #' },
      date: 'Date', due: 'Due', valid: 'Valid until', expiry: 'Expires', delivery: 'Delivery', origInv: 'Original invoice', paymentMethod: 'Payment', reason: 'Reason',
      from: 'From', billTo: 'Bill To', preparedFor: 'Prepared for', creditTo: 'Credit to', buyer: 'Buyer', vendor: 'Vendor', customer: 'Customer',
      desc: 'Description', item: 'Item', sku: 'SKU', qty: 'Qty', price: 'Price', amount: 'Amount',
      subtotal: 'Subtotal', discount: 'Discount', tax: 'Tax', shipping: 'Shipping / fees', total: 'Total', creditTotal: 'Credit total', paid: 'Paid', balance: 'Balance due',
      payDetails: 'Payment details', notes: 'Notes', terms: 'Terms & conditions', thanks: '', signature: 'Authorized signature',
      ice: 'ICE', ifNo: 'Tax ID (IF)', rc: 'Trade register (RC)', tp: 'Business tax (Patente)', clientIce: 'Client ICE', subtotalHT: 'Total excl. VAT', taxMA: 'VAT', totalTTC: 'Total incl. VAT', payTerms: 'Payment terms', words: 'This invoice is closed at the amount of:',
      seller: 'Sender', deliverTo: 'Deliver to', orderRef: 'Order ref.', transport: 'Carrier / vehicle', totalQty: 'Total quantity', deliveredBy: 'Delivered by (stamp & signature)', receivedBy: 'Received by (name, date, stamp & signature)', goodCond: 'Goods received in good condition',
      bizDef: 'Your Business', partyDef: 'Client Name', guest: 'Guest', itemDef: 'Item', powered: 'Powered by QueckBiz',
      cardTitle: 'Style, payment & saved details', template: 'Template', tplClassic: 'Classic', tplModern: 'Modern (colour header)', tplMinimal: 'Minimal (black & white)', accent: 'Accent colour',
      shipUi: 'Shipping / extra fees (not taxed)', paidUi: 'Amount already paid (deposit)', payUi: 'Payment details (bank, IBAN/RIB, PayPal…)', payPh: 'Bank: ...\nIBAN / RIB: ...\nPayPal: ...',
      clients: 'Saved clients', suppliers: 'Saved suppliers', saveClient: '+ Save this client', saveSupplier: '+ Save this supplier', delSel: 'Delete selected', needName: 'Enter the name first.',
      sigUi: 'Signature (optional): draw with finger/mouse or upload an image', clear: 'Clear', upSig: 'Upload signature', sigBig: 'Signature image must be smaller than 1MB.',
      remember: 'Remember my business details, signature and contacts on this device only', forget: 'Forget saved data', confirmForget: 'Delete the saved business details, signature and contacts from this device?',
      popup: 'Allow pop-ups to print or save as PDF.', storeFail: 'Could not save on this device (storage is blocked or full).'
    },
    fr: {
      title: { moroccan: 'FACTURE', deliverynote: 'BON DE LIVRAISON', invoice: 'FACTURE', estimate: 'DEVIS', proforma: 'FACTURE PROFORMA', creditnote: 'NOTE DE CRÉDIT', purchaseorder: 'BON DE COMMANDE', receipt: 'REÇU' },
      noLbl: { moroccan: 'N° de facture', deliverynote: 'N° de bon de livraison', invoice: 'N° de facture', estimate: 'N° de devis', proforma: 'N° de proforma', creditnote: 'N° de note de crédit', purchaseorder: 'N° de commande', receipt: 'N° de reçu' },
      date: 'Date', due: 'Échéance', valid: 'Valable jusqu\'au', expiry: 'Expire le', delivery: 'Livraison', origInv: 'Facture d\'origine', paymentMethod: 'Paiement', reason: 'Motif',
      from: 'De', billTo: 'Facturer à', preparedFor: 'Destinataire', creditTo: 'Crédité à', buyer: 'Acheteur', vendor: 'Fournisseur', customer: 'Client',
      desc: 'Description', item: 'Article', sku: 'Réf.', qty: 'Qté', price: 'Prix', amount: 'Montant',
      subtotal: 'Sous-total', discount: 'Remise', tax: 'Taxe', shipping: 'Livraison / frais', total: 'Total', creditTotal: 'Total de l\'avoir', paid: 'Payé', balance: 'Reste à payer',
      payDetails: 'Coordonnées de paiement', notes: 'Notes', terms: 'Conditions générales', thanks: '', signature: 'Signature autorisée',
      ice: 'ICE', ifNo: 'IF', rc: 'RC', tp: 'Patente', clientIce: 'ICE du client', subtotalHT: 'Total HT', taxMA: 'TVA', totalTTC: 'Total TTC', payTerms: 'Conditions de règlement', words: 'Arrêtée la présente facture à la somme de :',
      seller: 'Expéditeur', deliverTo: 'Livré à', orderRef: 'Réf. commande', transport: 'Transporteur / véhicule', totalQty: 'Quantité totale', deliveredBy: 'Livré par (cachet et signature)', receivedBy: 'Reçu par (nom, date, cachet et signature)', goodCond: 'Marchandise reçue en bon état',
      bizDef: 'Votre entreprise', partyDef: 'Nom du client', guest: 'Client', itemDef: 'Article', powered: 'Propulsé par QueckBiz',
      cardTitle: 'Style, paiement et données enregistrées', template: 'Modèle', tplClassic: 'Classique', tplModern: 'Moderne (en-tête coloré)', tplMinimal: 'Minimal (noir et blanc)', accent: 'Couleur d\'accent',
      shipUi: 'Livraison / frais supplémentaires (hors taxe)', paidUi: 'Montant déjà payé (acompte)', payUi: 'Coordonnées de paiement (banque, IBAN/RIB, PayPal…)', payPh: 'Banque : ...\nIBAN / RIB : ...\nPayPal : ...',
      clients: 'Clients enregistrés', suppliers: 'Fournisseurs enregistrés', saveClient: '+ Enregistrer ce client', saveSupplier: '+ Enregistrer ce fournisseur', delSel: 'Supprimer la sélection', needName: 'Saisissez d\'abord le nom.',
      sigUi: 'Signature (facultatif) : dessinez au doigt ou à la souris, ou importez une image', clear: 'Effacer', upSig: 'Importer une signature', sigBig: 'L\'image de la signature doit faire moins de 1 Mo.',
      remember: 'Mémoriser mes informations, ma signature et mes contacts sur cet appareil uniquement', forget: 'Effacer les données enregistrées', confirmForget: 'Supprimer de cet appareil les informations, la signature et les contacts enregistrés ?',
      popup: 'Autorisez les pop-ups pour imprimer ou enregistrer en PDF.', storeFail: 'Enregistrement impossible sur cet appareil (stockage bloqué ou plein).'
    },
    ar: {
      title: { moroccan: 'فاتورة', deliverynote: 'سند التسليم', invoice: 'فاتورة', estimate: 'عرض سعر', proforma: 'فاتورة أولية', creditnote: 'إشعار دائن', purchaseorder: 'أمر شراء', receipt: 'إيصال' },
      noLbl: { moroccan: 'رقم الفاتورة', deliverynote: 'رقم سند التسليم', invoice: 'رقم الفاتورة', estimate: 'رقم العرض', proforma: 'رقم الفاتورة الأولية', creditnote: 'رقم الإشعار', purchaseorder: 'رقم الأمر', receipt: 'رقم الإيصال' },
      date: 'التاريخ', due: 'الاستحقاق', valid: 'صالح حتى', expiry: 'ينتهي في', delivery: 'التسليم', origInv: 'الفاتورة الأصلية', paymentMethod: 'طريقة الدفع', reason: 'السبب',
      from: 'من', billTo: 'إلى', preparedFor: 'إلى', creditTo: 'إلى', buyer: 'المشتري', vendor: 'المورد', customer: 'العميل',
      desc: 'الوصف', item: 'الصنف', sku: 'الرمز', qty: 'الكمية', price: 'السعر', amount: 'المبلغ',
      subtotal: 'المجموع الفرعي', discount: 'خصم', tax: 'ضريبة', shipping: 'الشحن / رسوم', total: 'الإجمالي', creditTotal: 'إجمالي الإشعار', paid: 'المدفوع', balance: 'المتبقي',
      payDetails: 'تفاصيل الدفع', notes: 'ملاحظات', terms: 'الشروط والأحكام', thanks: '', signature: 'التوقيع المعتمد',
      ice: 'ICE', ifNo: 'التعريف الجبائي', rc: 'السجل التجاري', tp: 'الضريبة المهنية', clientIce: 'ICE العميل', subtotalHT: 'المجموع دون احتساب الضريبة', taxMA: 'الضريبة على القيمة المضافة', totalTTC: 'المجموع مع احتساب الضريبة', payTerms: 'شروط الأداء', words: '',
      seller: 'المرسل', deliverTo: 'يُسلَّم إلى', orderRef: 'مرجع الطلب', transport: 'الناقل / المركبة', totalQty: 'مجموع الكميات', deliveredBy: 'المسلِّم (الختم والتوقيع)', receivedBy: 'المستلِم (الاسم، التاريخ، الختم والتوقيع)', goodCond: 'تم استلام البضاعة في حالة جيدة',
      bizDef: 'شركتك', partyDef: 'اسم العميل', guest: 'زبون', itemDef: 'صنف', powered: 'بواسطة QueckBiz',
      cardTitle: 'الأسلوب والدفع والبيانات المحفوظة', template: 'القالب', tplClassic: 'كلاسيكي', tplModern: 'عصري (ترويسة ملونة)', tplMinimal: 'بسيط (أبيض وأسود)', accent: 'اللون الرئيسي',
      shipUi: 'الشحن / رسوم إضافية (بدون ضريبة)', paidUi: 'المبلغ المدفوع مسبقاً (عربون)', payUi: 'تفاصيل الدفع (البنك، IBAN/RIB، PayPal…)', payPh: 'البنك: ...\nIBAN / RIB: ...\nPayPal: ...',
      clients: 'العملاء المحفوظون', suppliers: 'الموردون المحفوظون', saveClient: '+ حفظ هذا العميل', saveSupplier: '+ حفظ هذا المورد', delSel: 'حذف المحدد', needName: 'أدخل الاسم أولاً.',
      sigUi: 'التوقيع (اختياري): ارسم بإصبعك أو بالفأرة، أو ارفع صورة', clear: 'مسح', upSig: 'رفع توقيع', sigBig: 'يجب أن يكون حجم صورة التوقيع أقل من 1 ميغابايت.',
      remember: 'تذكّر بيانات نشاطي وتوقيعي وجهات الاتصال على هذا الجهاز فقط', forget: 'مسح البيانات المحفوظة', confirmForget: 'حذف بيانات النشاط والتوقيع وجهات الاتصال المحفوظة من هذا الجهاز؟',
      popup: 'اسمح بالنوافذ المنبثقة للطباعة أو الحفظ كـ PDF.', storeFail: 'تعذّر الحفظ على هذا الجهاز (التخزين محظور أو ممتلئ).'
    }
  }[LANG];

  var K = { prefs: 'qb_prefs', clients: 'qb_clients', last: C.last, remember: 'qb_remember' };
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jget(k, d) { try { var v = JSON.parse(lsGet(k)); return v == null ? d : v; } catch (e) { return d; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function safeColor(c) { return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#2563eb'; }
  function safeImg(u) { return /^data:image\/(png|jpeg|webp|svg\+xml|gif);base64,/.test(u || '') ? u : ''; }
  function money(a, cur) { return (typeof window.formatMoney === 'function') ? window.formatMoney(a, cur) : cur + ' ' + a.toFixed(2); }
  function val(id) { var e = $(id); return e ? e.value : ''; }
  function num(id) { var v = parseFloat(val(id)); return isFinite(v) ? v : 0; }
  var START = RTL ? 'right' : 'left', END = RTL ? 'left' : 'right';

  /* ---------- card (built here so every page/language shares it) ---------- */
  function buildCard() {
    var old = $('proCard'); if (old) old.remove();
    var anchor = $('itemsContainer'); if (!anchor) return;
    var card = anchor.closest ? anchor.closest('.card') : null; if (!card) return;
    var sw = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#111827'].map(function (c) {
      return '<button type="button" class="btn btn-secondary" style="padding:.35rem .6rem" data-qbcolor="' + c + '" aria-label="' + c + '"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + c + '"></span></button>';
    }).join('');
    var h = '<div class="card" id="proCard"><h3 style="margin-bottom:1rem;font-size:1.1rem"><span>' + esc(T.cardTitle) + '</span></h3><div class="grid-2">';
    h += '<div><label for="tplSelect">' + esc(T.template) + '</label><select id="tplSelect"><option value="classic">' + esc(T.tplClassic) + '</option><option value="modern">' + esc(T.tplModern) + '</option><option value="minimal">' + esc(T.tplMinimal) + '</option></select></div>';
    h += '<div><label for="accentColor">' + esc(T.accent) + '</label><div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap"><input type="color" id="accentColor" value="' + (C.color || '#2563eb') + '" style="width:48px;height:40px;padding:2px">' + sw + '</div></div>';
    if (C.ship && !C.shipExists) h += '<div><label for="shipping">' + esc(T.shipUi) + '</label><input type="number" id="shipping" min="0" step="0.01" placeholder="0.00"></div>';
    if (C.paid) h += '<div><label for="paidAmt">' + esc(T.paidUi) + '</label><input type="number" id="paidAmt" min="0" step="0.01" placeholder="0.00"></div>';
    if (C.pay) h += '<div style="grid-column:1/-1"><label for="payDetails">' + esc(T.payUi) + '</label><textarea id="payDetails" placeholder="' + esc(T.payPh) + '"></textarea></div>';
    if (C.clients) {
      var saveLbl = C.clients === 'suppliers' ? T.saveSupplier : T.saveClient, listLbl = T[C.clients];
      h += '<div style="grid-column:1/-1"><label for="savedClients">' + esc(listLbl) + '</label><div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center"><select id="savedClients" style="flex:1;min-width:180px"><option value="">— ' + esc(listLbl) + ' —</option></select><button type="button" class="btn btn-secondary" id="qbSaveClient"><span>' + esc(saveLbl) + '</span></button><button type="button" class="btn btn-secondary" id="qbDelClient"><span>' + esc(T.delSel) + '</span></button></div></div>';
    }
    h += '<div style="grid-column:1/-1"><label>' + esc(T.sigUi) + '</label><canvas id="sigCanvas" width="480" height="140" style="width:100%;max-width:480px;height:auto;border:1px dashed #94a3b8;border-radius:8px;background:#fff;touch-action:none;display:block"></canvas><div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem;align-items:center"><button type="button" class="btn btn-secondary" id="qbSigClear"><span>' + esc(T.clear) + '</span></button><input type="file" id="sigFile" accept="image/png,image/jpeg,image/webp" style="display:none"><button type="button" class="btn btn-secondary" id="qbSigUp"><span>&#128193; ' + esc(T.upSig) + '</span></button></div></div>';
    h += '<div style="grid-column:1/-1;display:flex;gap:.75rem;flex-wrap:wrap;align-items:center"><label style="display:flex;align-items:center;gap:.5rem;margin:0;cursor:pointer"><input type="checkbox" id="rememberChk" checked style="width:auto;margin:0"> ' + esc(T.remember) + '</label><button type="button" class="btn btn-danger" id="qbForget"><span>' + esc(T.forget) + '</span></button></div>';
    h += '</div></div>';
    card.insertAdjacentHTML('beforebegin', h);
  }

  /* ---------- signature ---------- */
  var sigData = '', canvas, ctx, drawing = false;
  function sigPos(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) }; }
  function sigInit() {
    canvas = $('sigCanvas'); if (!canvas) return; ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111827';
    canvas.addEventListener('pointerdown', function (e) { drawing = true; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} var p = sigPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); });
    canvas.addEventListener('pointermove', function (e) { if (!drawing) return; var p = sigPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); });
    var end = function () { if (!drawing) return; drawing = false; sigData = canvas.toDataURL('image/png'); persist(); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  }
  function sigClear() { if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); sigData = ''; var f = $('sigFile'); if (f) f.value = ''; persist(); }
  function sigDrawImage(src) {
    var img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var s = Math.min(canvas.width / img.width, canvas.height / img.height), w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      sigData = canvas.toDataURL('image/png'); persist();
    };
    img.src = src;
  }
  function sigUpload(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.size > 1024 * 1024) { alert(T.sigBig); e.target.value = ''; return; }
    var r = new FileReader(); r.onload = function (ev) { sigDrawImage(ev.target.result); }; r.readAsDataURL(f);
  }

  /* ---------- persistence ---------- */
  // logical key -> element id. Business details are shared by every document type.
  function fieldMap() {
    var m = { bizName: C.biz.name, bizAddress: C.biz.addr, currency: 'currency', taxRate: 'taxRate', tplSelect: 'tplSelect', accentColor: 'accentColor', payDetails: 'payDetails' };
    if (C.biz.contact) m.bizContact = C.biz.contact;
    ['bizIce', 'bizIf', 'bizRc', 'bizTp'].forEach(function (id) { if ($(id)) m[id] = id; });
    m['n_' + TYPE] = C.notes;
    return m;
  }
  var timer = null;
  function remembering() { return $('rememberChk') && $('rememberChk').checked; }
  function persist() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!remembering()) return;
      var p = jget(K.prefs, {}), m = fieldMap();
      Object.keys(m).forEach(function (k) { if ($(m[k])) p[k] = $(m[k]).value; });
      p.sig = sigData; lsSet(K.prefs, JSON.stringify(p));
    }, 300);
  }
  function loadPrefs() {
    var rem = lsGet(K.remember);
    if ($('rememberChk')) $('rememberChk').checked = rem !== '0';
    if (rem === '0') return;
    var p = jget(K.prefs, null);
    if (p) {
      var m = fieldMap();
      Object.keys(m).forEach(function (k) { var el = $(m[k]); if (el && p[k] != null && p[k] !== '') el.value = p[k]; });
      if (p.sig && safeImg(p.sig)) { sigData = p.sig; sigDrawImage(p.sig); }
    }
    var last = lsGet(K.last); if (last && $(C.no) && !$(C.no).value) $(C.no).value = nextNumber(last);
  }
  function nextNumber(s) {
    var m = String(s).match(/^(.*?)(\d+)(\D*)$/); if (!m) return s;
    var n = String(parseInt(m[2], 10) + 1); while (n.length < m[2].length) n = '0' + n;
    return m[1] + n + m[3];
  }
  function forgetAll() {
    if (!confirm(T.confirmForget)) return;
    [K.prefs, K.clients, K.last, 'qb_logo_data'].forEach(lsDel);
    lsSet(K.remember, '0'); if ($('rememberChk')) $('rememberChk').checked = false;
    sigClear(); if (typeof window.removeLogo === 'function') window.removeLogo(); renderClients();
  }

  /* ---------- saved contacts ---------- */
  function renderClients() {
    var sel = $('savedClients'); if (!sel) return;
    var lbl = T[C.clients];
    sel.innerHTML = '<option value="">— ' + esc(lbl) + ' —</option>';
    jget(K.clients, []).forEach(function (c, i) { var o = document.createElement('option'); o.value = i; o.textContent = c.name; sel.appendChild(o); });
  }
  function saveClient() {
    var name = val(C.party.name).trim(); if (!name) { alert(T.needName); return; }
    var list = jget(K.clients, []).filter(function (c) { return c.name.toLowerCase() !== name.toLowerCase(); });
    list.unshift({ name: name, address: val(C.party.addr), ice: val('clientIce') });
    if (!lsSet(K.clients, JSON.stringify(list.slice(0, 50)))) alert(T.storeFail);
    renderClients();
  }
  function pickClient() {
    var i = $('savedClients').value; if (i === '') return;
    var c = jget(K.clients, [])[parseInt(i, 10)]; if (!c) return;
    $(C.party.name).value = c.name; if ($(C.party.addr)) $(C.party.addr).value = c.address || ''; if ($('clientIce')) $('clientIce').value = c.ice || '';
  }
  function deleteClient() {
    var i = $('savedClients').value; if (i === '') return;
    var list = jget(K.clients, []); list.splice(parseInt(i, 10), 1); lsSet(K.clients, JSON.stringify(list)); renderClients();
  }

  /* ---------- amount in words (French) ---------- */
  var U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  var TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  function b100(n, term) {
    if (n < 17) return U[n];
    if (n < 20) return 'dix-' + U[n - 10];
    if (n < 70) { var t = Math.floor(n / 10), u = n % 10; return TENS[t] + (u === 1 ? ' et un' : u ? '-' + U[u] : ''); }
    if (n < 80) { var v = n - 60; return 'soixante' + (v === 11 ? ' et onze' : '-' + b100(v)); }
    var w = n - 80; return w === 0 ? 'quatre-vingt' + (term ? 's' : '') : 'quatre-vingt-' + b100(w);
  }
  function w3(n, term) {
    var h = Math.floor(n / 100), r = n % 100, out = [];
    if (h) out.push(h === 1 ? 'cent' : U[h] + ' cent' + (r === 0 && term ? 's' : ''));
    if (r) out.push(b100(r, term));
    return out.join(' ');
  }
  function frWords(n) {
    if (n === 0) return 'zéro';
    var b = Math.floor(n / 1e9), m = Math.floor(n % 1e9 / 1e6), k = Math.floor(n % 1e6 / 1e3), r = n % 1e3, o = [];
    if (b) o.push(w3(b, false) + ' milliard' + (b > 1 ? 's' : ''));
    if (m) o.push(w3(m, false) + ' million' + (m > 1 ? 's' : ''));
    if (k) o.push(k === 1 ? 'mille' : w3(k, false) + ' mille');
    if (r) o.push(w3(r, true));
    return o.join(' ');
  }
  function amountWords(total, cur) {
    var t = Math.round(total * 100) / 100, i = Math.floor(t), c = Math.round((t - i) * 100);
    var names = { MAD: ['dirham', 'dirhams', 'centime', 'centimes'], EUR: ['euro', 'euros', 'centime', 'centimes'], USD: ['dollar', 'dollars', 'cent', 'cents'] }[cur] || [cur, cur, '', ''];
    var s = frWords(i) + (i >= 1e6 && i % 1e6 === 0 ? ' de ' : ' ') + (i > 1 ? names[1] : names[0]);
    if (c > 0 && names[2]) s += ' et ' + frWords(c) + ' ' + (c > 1 ? names[3] : names[2]);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------- document HTML ---------- */
  function collect() {
    var items = [], sub = 0;
    document.querySelectorAll('#itemsContainer .row').forEach(function (row) {
      var pe = row.querySelector('.item-price'), q = parseFloat(row.querySelector('.item-qty').value) || 0, p = pe ? (parseFloat(pe.value) || 0) : 0, sk = row.querySelector('.item-sku');
      items.push({ d: row.querySelector('.item-desc').value || T.itemDef, sku: sk ? (sk.value || '-') : '', q: q, p: p, t: q * p }); sub += q * p;
    });
    var disc = num('discountRate'), tax = num('taxRate'), ship = C.ship ? num('shipping') : 0, paid = C.paid ? num('paidAmt') : 0;
    var discAmt = sub * disc / 100, after = sub - discAmt, taxAmt = after * tax / 100, total = after + taxAmt + ship;
    return {
      biz: val(C.biz.name) || T.bizDef, contact: C.biz.contact ? val(C.biz.contact) : '', addr: val(C.biz.addr),
      party: val(C.party.name) || (C.receipt ? T.guest : T.partyDef), pAddr: C.party.addr ? val(C.party.addr) : '',
      no: val(C.no) || C.prefix, date: val(C.date) || new Date().toISOString().slice(0, 10),
      extra: C.extra.map(function (x) { return [T[x[1]], val(x[0])]; }).filter(function (x) { return x[1]; }),
      blocks: (C.blocks || []).map(function (x) { return [T[x[1]], val(x[0])]; }).filter(function (x) { return x[1]; }),
      cur: val('currency'), items: items, sub: sub, disc: disc, discAmt: discAmt, tax: tax, taxAmt: taxAmt, ship: ship, total: total, paid: paid, balance: total - paid,
      notes: val(C.notes), pay: C.pay ? val('payDetails') : '', tpl: val('tplSelect') || 'classic', color: safeColor(val('accentColor') || '#2563eb'),
      legal: C.legal ? [[T.ice, val('bizIce')], [T.ifNo, val('bizIf')], [T.rc, val('bizRc')], [T.tp, val('bizTp')]].filter(function (x) { return x[1].trim(); }) : [], pIce: val('clientIce'),
      qtySum: items.reduce(function (a, i) { return a + i.q; }, 0),
      logo: safeImg(window.currentLogo), sig: safeImg(sigData)
    };
  }
  function build(d) {
    var a = d.color, tpl = d.tpl, cur = d.cur, ink = tpl === 'minimal' ? '#111' : a;
    var H = tpl === 'modern' ? 'background:' + a + ';color:#fff;padding:.6rem .5rem;text-align:'
          : tpl === 'minimal' ? 'color:#111;padding:.6rem .5rem;border-bottom:2px solid #111;text-align:'
          : 'background:#f1f5f9;color:#64748b;padding:.6rem .5rem;border-bottom:2px solid #e2e8f0;text-align:';
    var th = function (t, al) { return '<th style="' + H + al + ';font-size:.72rem;text-transform:uppercase;letter-spacing:' + (RTL ? '0' : '.5px') + '">' + esc(t) + '</th>'; };
    var td = 'padding:.6rem .5rem;border-bottom:1px solid #e2e8f0;font-size:.9rem;';
    var ttl = T.title[TYPE];
    var title = tpl === 'minimal' ? '<div style="font-size:1.1rem;font-weight:600;letter-spacing:' + (RTL ? '0' : '.35em') + ';color:#111">' + esc(ttl) + '</div>'
      : '<div style="font-size:' + (C.receipt ? '1.5rem' : '2rem') + ';font-weight:700;color:' + (tpl === 'modern' ? '#fff' : a) + '">' + esc(ttl) + '</div>';
    var metaRows = '<div><strong>' + esc(T.noLbl[TYPE]) + ':</strong> ' + esc(d.no) + '</div><div><strong>' + esc(T.date) + ':</strong> ' + esc(d.date) + '</div>' +
      d.extra.map(function (x) { return '<div><strong>' + esc(x[0]) + ':</strong> ' + esc(x[1]) + '</div>'; }).join('');
    var meta = '<div style="text-align:' + END + ';font-size:.85rem;color:' + (tpl === 'modern' ? '#fff' : '#475569') + '">' + metaRows + '</div>';
    var logo = d.logo ? '<div style="flex:1;display:flex;justify-content:center"><img src="' + d.logo + '" alt="Logo" style="max-height:70px;max-width:180px;object-fit:contain"></div>' : '';
    var head = '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.75rem;' + (tpl === 'modern' ? 'background:' + a + ';padding:1.1rem 1.25rem;border-radius:8px;' : tpl === 'minimal' ? 'padding-bottom:1rem;border-bottom:1px solid #111;' : '') + '">' + title + logo + meta + '</div>';
    var lab = 'font-size:.72rem;text-transform:uppercase;letter-spacing:' + (RTL ? '0' : '1px') + ';color:#64748b;margin-bottom:.4rem';
    var left = '<div><h4 style="' + lab + '">' + esc(T[C.from]) + '</h4><div style="font-size:.875rem;line-height:1.6"><strong>' + esc(d.biz) + '</strong>' + (d.contact ? '<br>' + esc(d.contact) : '') + (d.addr ? '<br>' + nl2br(d.addr) : '') + (d.legal.length ? '<br><span style="font-size:.78rem;color:#64748b">' + d.legal.map(function (x) { return esc(x[0]) + ': ' + esc(x[1]); }).join(' · ') + '</span>' : '') + '</div></div>';
    var right = '<div><h4 style="' + lab + '">' + esc(T[C.to]) + '</h4><div style="font-size:.875rem;line-height:1.6"><strong>' + esc(d.party) + '</strong>' + (d.pAddr ? '<br>' + nl2br(d.pAddr) : '') + (d.pIce.trim() ? '<br><span style="font-size:.78rem;color:#64748b">' + esc(T.clientIce) + ': ' + esc(d.pIce) + '</span>' : '') + '</div></div>';
    var parties = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:1.75rem">' + left + right + '</div>';
    var rows = d.items.map(function (it) {
      return '<tr><td style="' + td + '">' + esc(it.d) + '</td>' + (C.sku ? '<td style="' + td + '">' + esc(it.sku) + '</td>' : '') + '<td style="' + td + 'text-align:' + END + '">' + it.q + '</td>' + (C.noPrice ? '' : '<td style="' + td + 'text-align:' + END + '">' + money(it.p, cur) + '</td><td style="' + td + 'text-align:' + END + '">' + money(it.t, cur) + '</td>') + '</tr>';
    }).join('');
    var table = '<div style="overflow-x:auto;margin-bottom:1.25rem"><table style="width:100%;min-width:' + (C.noPrice ? '0' : '340px') + ';border-collapse:collapse"><thead><tr>' + th(C.receipt ? T.item : T.desc, START) + (C.sku ? th(T.sku, START) : '') + th(T.qty, END) + (C.noPrice ? '' : th(T.price, END) + th(T.amount, END)) + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    var line = function (l, v) { return '<div style="display:flex;justify-content:space-between;gap:2rem;font-size:.875rem;color:#475569;margin-bottom:.25rem"><span>' + esc(l) + '</span><span>' + v + '</span></div>'; };
    var totals = C.noPrice ? '<div style="margin-' + START + ':auto;max-width:300px;font-weight:700;font-size:1rem;border-top:2px solid ' + ink + ';padding-top:.5rem;display:flex;justify-content:space-between;gap:2rem"><span>' + esc(T.totalQty) + '</span><span>' + d.qtySum + '</span></div>' : '<div style="margin-' + START + ':auto;max-width:300px">' + line(C.ht ? T.subtotalHT : T.subtotal, money(d.sub, cur)) +
      (d.disc > 0 ? line(T.discount + ' (' + d.disc + '%)', '-' + money(d.discAmt, cur)) : '') +
      (d.tax > 0 || C.ht ? line((C.ht ? T.taxMA : T.tax) + ' (' + d.tax + '%)', money(d.taxAmt, cur)) : '') +
      (d.ship > 0 ? line(T.shipping, money(d.ship, cur)) : '') +
      '<div style="display:flex;justify-content:space-between;gap:2rem;font-size:1.2rem;font-weight:700;margin-top:.4rem;padding-top:.5rem;border-top:2px solid ' + ink + ';color:#0f172a"><span>' + esc(C.ht ? T.totalTTC : T[C.totalKey || 'total']) + '</span><span>' + money(d.total, cur) + '</span></div>' +
      (d.paid > 0 ? line(T.paid, '-' + money(d.paid, cur)) + '<div style="display:flex;justify-content:space-between;gap:2rem;font-size:1.05rem;font-weight:700;color:' + ink + '"><span>' + esc(T.balance) + '</span><span>' + money(d.balance, cur) + '</span></div>' : '') + '</div>';
    var words = (C.words && LANG === 'fr') ? '<div style="margin-top:1.25rem;font-size:.85rem;color:#0f172a;line-height:1.6"><em>' + esc(T.words) + '</em> <strong>' + esc(amountWords(d.total, cur)) + '</strong></div>' : '';
    var box = 'margin-top:1.5rem;padding:.9rem 1rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;color:#475569;line-height:1.6;';
    var blocks = d.blocks.map(function (b) { return '<div style="' + box + '"><strong style="color:#0f172a">' + esc(b[0]) + ':</strong> ' + esc(b[1]) + '</div>'; }).join('');
    var pay = d.pay.trim() ? '<div style="' + box + '"><strong style="color:#0f172a">' + esc(T.payDetails) + '</strong><br>' + nl2br(d.pay) + '</div>' : '';
    var notes = '';
    if (d.notes.trim()) notes = C.receipt ? '<div style="margin-top:1.5rem;text-align:center;font-size:.8rem;color:#94a3b8">' + nl2br(d.notes) + '<br>' + esc(T.powered) + '</div>'
      : '<div style="margin-top:1.25rem;font-size:.85rem;color:#475569;line-height:1.6"><strong>' + esc(T[C.notesLbl]) + '</strong><br>' + nl2br(d.notes) + '</div>';
    var sig = C.noPrice ? '<div style="margin-top:2rem;display:grid;grid-template-columns:1fr 1fr;gap:2rem;font-size:.8rem;color:#64748b"><div style="min-height:90px;border-top:1px solid #94a3b8;padding-top:.3rem">' + esc(T.deliveredBy) + (d.sig ? '<br><img src="' + d.sig + '" alt="" style="max-height:60px;max-width:100%">' : '') + '</div><div style="min-height:90px;border-top:1px solid #94a3b8;padding-top:.3rem">' + esc(T.receivedBy) + '<br><span style="font-size:.72rem">' + esc(T.goodCond) + ' ☐</span></div></div>' : d.sig ? '<div style="margin-top:2rem;display:flex;justify-content:flex-' + 'end"><div style="text-align:center;width:220px"><img src="' + d.sig + '" alt="" style="max-height:70px;max-width:100%"><div style="border-top:1px solid #94a3b8;margin-top:.25rem;padding-top:.25rem;font-size:.75rem;color:#64748b">' + esc(T.signature) + '</div></div></div>' : '';
    return '<div dir="' + (RTL ? 'rtl' : 'ltr') + '"' + (C.receipt ? ' style="max-width:460px;margin:0 auto"' : '') + '>' + head + parties + table + totals + words + blocks + pay + notes + sig + '</div>';
  }

  function preview() {
    $(C.content).innerHTML = build(collect());
    $('previewPlaceholder').style.display = 'none'; $(C.preview).style.display = 'block';
  }
  function printIt() {
    preview();
    var no = val(C.no).trim(); if (no && remembering()) lsSet(K.last, no);
    setTimeout(function () {
      var w = window.open('', '_blank'); if (!w) { alert(T.popup); return; }
      w.document.write('<html dir="' + (RTL ? 'rtl' : 'ltr') + '"><head><meta charset="utf-8"><title>' + esc(T.title[TYPE] + ' ' + no) + '</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:Arial,sans-serif;padding:2rem;color:#000}table{width:100%;border-collapse:collapse}@page{margin:14mm}</style></head><body>' + $(C.content).innerHTML + '</body></html>');
      w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 300);
    }, 150);
  }

  /* ---------- Word / Excel export: real .docx / .xlsx built in the browser (nothing is uploaded) ---------- */
  var XL = { word: 'Word (.docx)', excel: 'Excel (.xlsx)' };
  var CRCT = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRCT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zipParts(files) {
    var enc = new TextEncoder(), parts = [], cd = [], off = 0;
    files.forEach(function (f) {
      var nm = enc.encode(f[0]), data = enc.encode(f[1]), crc = crc32(data);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 0x21, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true);
      parts.push(new Uint8Array(h.buffer), nm, data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
      cd.push(new Uint8Array(c.buffer), nm);
      off += 30 + nm.length + data.length;
    });
    var size = cd.reduce(function (a, p) { return a + p.length; }, 0);
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
    return parts.concat(cd, [new Uint8Array(e.buffer)]);
  }
  function xe(s) { return esc(String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')); }
  function model(d) {
    var hdr = [C.receipt ? T.item : T.desc].concat(C.sku ? [T.sku] : []).concat([T.qty]).concat(C.noPrice ? [] : [T.price, T.amount]);
    var items = d.items.map(function (it) { return [it.d].concat(C.sku ? [it.sku] : []).concat([it.q]).concat(C.noPrice ? [] : [it.p, it.t]); });
    var totals = [];
    if (!C.noPrice) {
      totals.push([T.subtotal, d.sub, 0]);
      if (d.disc > 0) totals.push([T.discount + ' (' + d.disc + '%)', -d.discAmt, 0]);
      if (d.tax > 0 || C.ht) totals.push([(C.ht ? T.taxMA : T.tax) + ' (' + d.tax + '%)', d.taxAmt, 0]);
      if (d.ship > 0) totals.push([T.shipping, d.ship, 0]);
      totals.push([C.ht ? T.totalTTC : T[C.totalKey || 'total'], d.total, 1]);
      if (d.paid > 0) { totals.push([T.paid, -d.paid, 0]); totals.push([T.balance, d.balance, 1]); }
    }
    var info = [[T.noLbl[TYPE], d.no], [T.date, d.date]].concat(d.extra);
    var who = [[T[C.from], [d.biz, d.contact, d.addr].concat(d.legal.map(function (x) { return x[0] + ': ' + x[1]; })).filter(Boolean).join('\n')],
               [T[C.to], [d.party, d.pAddr].filter(Boolean).join('\n')]];
    var after = [];
    if (d.pay.trim()) after.push([T.payDetails, d.pay]);
    if (d.notes.trim()) after.push([T[C.notesLbl] || T.notes, d.notes]);
    return { title: T.title[TYPE], info: info, who: who, hdr: hdr, items: items, totals: totals, after: after, nc: hdr.length };
  }
  function makeXlsx(m, d) {
    var col = function (i) { return String.fromCharCode(65 + i); }, r = 0, rows = '';
    var S = function (i, t, st) { return '<c r="' + col(i) + r + '" t="inlineStr"' + (st ? ' s="' + st + '"' : '') + '><is><t xml:space="preserve">' + xe(t) + '</t></is></c>'; };
    var N = function (i, v, st) { return '<c r="' + col(i) + r + '" s="' + (st || 2) + '"><v>' + (isFinite(v) ? v : 0) + '</v></c>'; };
    var row = function (cells) { r++; rows += '<row r="' + r + '">' + cells.call(null) + '</row>'; };
    var blank = function () { r++; };
    r++; rows += '<row r="' + r + '">' + S(0, m.title, 1) + '</row>';
    m.info.forEach(function (x) { r++; rows += '<row r="' + r + '">' + S(0, x[0], 1) + S(1, x[1]) + '</row>'; });
    blank();
    m.who.forEach(function (x) { r++; rows += '<row r="' + r + '">' + S(0, x[0], 1) + S(1, x[1]) + '</row>'; });
    blank();
    r++; rows += '<row r="' + r + '">' + m.hdr.map(function (h, i) { return S(i, h, 1); }).join('') + '</row>';
    m.items.forEach(function (it) {
      r++; rows += '<row r="' + r + '">' + it.map(function (v, i) { var isText = (i === 0) || (C.sku && i === 1); return isText ? S(i, v) : (i === m.nc - 3 && !C.noPrice || i === m.nc - 1 && C.noPrice) ? N(i, v, 0) : N(i, v, 2); }).join('') + '</row>';
    });
    m.totals.forEach(function (x) { r++; rows += '<row r="' + r + '">' + S(m.nc - 2, x[0], x[2] ? 1 : 0) + N(m.nc - 1, x[1], x[2] ? 3 : 2) + '</row>'; });
    blank();
    m.after.forEach(function (x) { r++; rows += '<row r="' + r + '">' + S(0, x[0], 1) + '</row>'; r++; rows += '<row r="' + r + '">' + S(0, x[1]) + '</row>'; });
    var cols = '<cols><col min="1" max="1" width="48" customWidth="1"/><col min="2" max="' + Math.max(m.nc, 2) + '" width="16" customWidth="1"/></cols>';
    var NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', RN = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    var name = xe(String(m.title).replace(/[\\\/?*\[\]:]/g, '').slice(0, 31) || 'Sheet1');
    var P = 'http://schemas.openxmlformats.org/package/2006/relationships';
    return zipParts([
      ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + P + '"><Relationship Id="rId1" Type="' + RN + '/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="' + NS + '" xmlns:r="' + RN + '"><sheets><sheet name="' + name + '" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + P + '"><Relationship Id="rId1" Type="' + RN + '/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="' + RN + '/styles" Target="styles.xml"/></Relationships>'],
      ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="' + NS + '"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="2" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
      ['xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="' + NS + '"><sheetViews><sheetView workbookViewId="0"' + (RTL ? ' rightToLeft="1"' : '') + '/></sheetViews>' + cols + '<sheetData>' + rows + '</sheetData></worksheet>']
    ]);
  }
  function makeDocx(m, d) {
    var W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', bidi = RTL ? '<w:bidi/>' : '';
    var run = function (t, b, sz) {
      return String(t == null ? '' : t).split('\n').map(function (ln, i) {
        return '<w:r><w:rPr>' + (b ? '<w:b/>' : '') + (sz ? '<w:sz w:val="' + sz + '"/>' : '') + (RTL ? '<w:rtl/>' : '') + '</w:rPr>' + (i ? '<w:br/>' : '') + '<w:t xml:space="preserve">' + xe(ln) + '</w:t></w:r>';
      }).join('');
    };
    var para = function (inner, jc) { return '<w:p><w:pPr>' + bidi + (jc ? '<w:jc w:val="' + jc + '"/>' : '') + '</w:pPr>' + inner + '</w:p>'; };
    var body = para(run(m.title, 1, 40));
    m.info.forEach(function (x) { body += para(run(x[0] + ': ', 1) + run(x[1])); });
    body += para('');
    m.who.forEach(function (x) { body += para(run(x[0] + ': ', 1) + run(x[1])); });
    body += para('');
    var widths = [], rest = m.nc - 1, first = m.nc <= 2 ? 6000 : 4000, each = Math.floor((9000 - first) / Math.max(rest, 1));
    for (var i = 0; i < m.nc; i++) widths.push(i === 0 ? first : each);
    var bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (k) { return '<w:' + k + ' w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'; }).join('');
    var numJc = RTL ? 'left' : 'right';
    var cell = function (w, inner, fill, span) { return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (span ? '<w:gridSpan w:val="' + span + '"/>' : '') + (fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + fill + '"/>' : '') + '</w:tcPr>' + inner + '</w:tc>'; };
    var tbl = '<w:tbl><w:tblPr>' + (RTL ? '<w:bidiVisual/>' : '') + '<w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>' + bd + '</w:tblBorders></w:tblPr><w:tblGrid>' + widths.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join('') + '</w:tblGrid>';
    tbl += '<w:tr>' + m.hdr.map(function (h, i) { return cell(widths[i], para(run(h, 1)), 'E2E8F0'); }).join('') + '</w:tr>';
    m.items.forEach(function (it) {
      tbl += '<w:tr>' + it.map(function (v, i) { var txt = (i === 0 || (C.sku && i === 1)); return cell(widths[i], para(run(txt ? v : (i >= m.nc - 2 && !C.noPrice ? money(v, d.cur) : String(v))), txt ? null : numJc)); }).join('') + '</w:tr>';
    });
    m.totals.forEach(function (x) {
      var span = m.nc - 1, w1 = widths.slice(0, span).reduce(function (a, b) { return a + b; }, 0);
      tbl += '<w:tr>' + cell(w1, para(run(x[0], x[2]), numJc), null, span) + cell(widths[m.nc - 1], para(run(money(x[1], d.cur), x[2]), numJc)) + '</w:tr>';
    });
    tbl += '</w:tbl>';
    body += tbl + para('');
    m.after.forEach(function (x) { body += para(run(x[0], 1)) + para(run(x[1])); });
    var P = 'http://schemas.openxmlformats.org/package/2006/relationships', RN = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    return zipParts([
      ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
      ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + P + '"><Relationship Id="rId1" Type="' + RN + '/officeDocument" Target="word/document.xml"/></Relationships>'],
      ['word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="' + W + '"><w:body>' + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>']
    ]);
  }
  function exportDoc(kind) {
    var d = collect(), ex = kind === 'excel', m = model(d);
    var no = (val(C.no) || C.prefix).trim().replace(/[^\w.-]+/g, '_');
    var parts = ex ? makeXlsx(m, d) : makeDocx(m, d);
    var blob = new Blob(parts, { type: ex ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = TYPE + '-' + no + (ex ? '.xlsx' : '.docx');
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    var n = val(C.no).trim(); if (n && remembering()) lsSet(K.last, n);
  }
  function addExportButtons() {
    var printBtn = document.querySelector('button[onclick^="' + C.print + '("]'); if (!printBtn || $('qbExportWord')) return;
    [['qbExportWord', 'word', '📄 '], ['qbExportExcel', 'excel', '📊 ']].reverse().forEach(function (b) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-secondary'; btn.id = b[0];
      btn.innerHTML = '<span>' + b[2] + XL[b[1]] + '</span>'; btn.addEventListener('click', function () { exportDoc(b[1]); });
      printBtn.parentNode.insertBefore(btn, printBtn.nextSibling);
    });
  }
  var origReset = window.resetForm;
  function resetAll() {
    var keep = {}, ids = ['tplSelect', 'accentColor', 'payDetails', 'currency', 'bizIce', 'bizIf', 'bizRc', 'bizTp'].concat(Object.keys(C.biz).map(function (k) { return C.biz[k]; }));
    ids.forEach(function (id) { if ($(id)) keep[id] = $(id).value; });
    if (typeof origReset === 'function') origReset();
    Object.keys(keep).forEach(function (id) { $(id).value = keep[id]; });
    ['shipping', 'paidAmt'].forEach(function (id) { if ($(id)) $(id).value = ''; });
    var last = lsGet(K.last); if ($(C.no)) $(C.no).value = last && remembering() ? nextNumber(last) : '';
    $('previewPlaceholder').style.display = 'block'; $(C.preview).style.display = 'none';
    if ($('savedClients')) $('savedClients').value = '';
  }

  /* ---------- wire up ---------- */
  window.generatePreview = preview; window[C.print] = printIt; window.resetForm = resetAll;
  window.qbPro = { persist: persist, amountWords: amountWords };

  function start() {
    buildCard(); sigInit(); renderClients(); loadPrefs(); addExportButtons();
    var on = function (id, ev, fn) { var e = $(id); if (e) e.addEventListener(ev, fn); };
    on('qbSaveClient', 'click', saveClient); on('qbDelClient', 'click', deleteClient); on('savedClients', 'change', pickClient);
    on('qbSigClear', 'click', sigClear); on('qbSigUp', 'click', function () { $('sigFile').click(); }); on('sigFile', 'change', sigUpload);
    on('qbForget', 'click', forgetAll);
    on('rememberChk', 'change', function () { lsSet(K.remember, remembering() ? '1' : '0'); if (remembering()) persist(); });
    document.querySelectorAll('[data-qbcolor]').forEach(function (b) { b.addEventListener('click', function () { $('accentColor').value = b.getAttribute('data-qbcolor'); persist(); }); });
    Object.keys(fieldMap()).forEach(function (k) { var el = $(fieldMap()[k]); if (el) { el.addEventListener('input', persist); el.addEventListener('change', persist); } });
    window.addEventListener('load', function () { setTimeout(function () { var p = jget(K.prefs, {}); if ($('currency') && p.currency && lsGet(K.remember) !== '0') $('currency').value = p.currency; }, 50); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
