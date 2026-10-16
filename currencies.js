/* QueckBiz — World currencies (ISO 4217). Populates #currency and formats money.
   Values are currency codes; formatMoney places the symbol correctly. */
(function () {
  'use strict';

  // [code, symbol, English name, Arabic name]
  var CURRENCIES = [
    ['USD', '$', 'US Dollar', 'دولار أمريكي'],
    ['EUR', '€', 'Euro', 'يورو'],
    ['MAD', 'MAD', 'Moroccan Dirham', 'درهم مغربي'],
    ['AED', 'AED', 'UAE Dirham', 'درهم إماراتي'],
    ['SAR', 'SAR', 'Saudi Riyal', 'ريال سعودي'],
    ['EGP', 'EGP', 'Egyptian Pound', 'جنيه مصري'],
    ['GBP', '£', 'British Pound', 'جنيه إسترليني'],
    ['QAR', 'QAR', 'Qatari Riyal', 'ريال قطري'],
    ['KWD', 'KWD', 'Kuwaiti Dinar', 'دينار كويتي'],
    ['BHD', 'BHD', 'Bahraini Dinar', 'دينار بحريني'],
    ['OMR', 'OMR', 'Omani Rial', 'ريال عماني'],
    ['JOD', 'JOD', 'Jordanian Dinar', 'دينار أردني'],
    ['DZD', 'DZD', 'Algerian Dinar', 'دينار جزائري'],
    ['TND', 'TND', 'Tunisian Dinar', 'دينار تونسي'],
    ['LYD', 'LYD', 'Libyan Dinar', 'دينار ليبي'],
    ['MRU', 'MRU', 'Mauritanian Ouguiya', 'أوقية موريتانية'],
    ['IQD', 'IQD', 'Iraqi Dinar', 'دينار عراقي'],
    ['LBP', 'LBP', 'Lebanese Pound', 'ليرة لبنانية'],
    ['SYP', 'SYP', 'Syrian Pound', 'ليرة سورية'],
    ['YER', 'YER', 'Yemeni Rial', 'ريال يمني'],
    ['SDG', 'SDG', 'Sudanese Pound', 'جنيه سوداني'],
    ['SOS', 'SOS', 'Somali Shilling', 'شلن صومالي'],
    ['DJF', 'DJF', 'Djiboutian Franc', 'فرنك جيبوتي'],
    ['KMF', 'KMF', 'Comorian Franc', 'فرنك قمري'],
    ['ILS', '₪', 'Israeli New Shekel', 'شيكل'],
    ['TRY', '₺', 'Turkish Lira', 'ليرة تركية'],
    ['IRR', 'IRR', 'Iranian Rial', 'ريال إيراني'],
    ['CAD', 'CA$', 'Canadian Dollar', 'دولار كندي'],
    ['AUD', 'A$', 'Australian Dollar', 'دولار أسترالي'],
    ['NZD', 'NZ$', 'New Zealand Dollar', 'دولار نيوزيلندي'],
    ['CHF', 'CHF', 'Swiss Franc', 'فرنك سويسري'],
    ['JPY', '¥', 'Japanese Yen', 'ين ياباني'],
    ['CNY', 'CN¥', 'Chinese Yuan', 'يوان صيني'],
    ['HKD', 'HK$', 'Hong Kong Dollar', 'دولار هونغ كونغ'],
    ['SGD', 'S$', 'Singapore Dollar', 'دولار سنغافوري'],
    ['TWD', 'NT$', 'New Taiwan Dollar', 'دولار تايواني'],
    ['KRW', '₩', 'South Korean Won', 'وون كوري جنوبي'],
    ['INR', '₹', 'Indian Rupee', 'روبية هندية'],
    ['PKR', 'PKR', 'Pakistani Rupee', 'روبية باكستانية'],
    ['BDT', '৳', 'Bangladeshi Taka', 'تاكا بنغلاديشية'],
    ['LKR', 'LKR', 'Sri Lankan Rupee', 'روبية سريلانكية'],
    ['NPR', 'NPR', 'Nepalese Rupee', 'روبية نيبالية'],
    ['AFN', 'AFN', 'Afghan Afghani', 'أفغاني'],
    ['MMK', 'MMK', 'Myanmar Kyat', 'كيات ميانمار'],
    ['THB', '฿', 'Thai Baht', 'بات تايلندي'],
    ['VND', '₫', 'Vietnamese Dong', 'دونغ فيتنامي'],
    ['IDR', 'Rp', 'Indonesian Rupiah', 'روبية إندونيسية'],
    ['MYR', 'RM', 'Malaysian Ringgit', 'رينغيت ماليزي'],
    ['PHP', '₱', 'Philippine Peso', 'بيزو فلبيني'],
    ['KHR', 'KHR', 'Cambodian Riel', 'ريال كمبودي'],
    ['LAK', 'LAK', 'Lao Kip', 'كيب لاوسي'],
    ['BND', 'B$', 'Brunei Dollar', 'دولار بروناي'],
    ['KZT', '₸', 'Kazakhstani Tenge', 'تنغه كازاخستاني'],
    ['UZS', 'UZS', 'Uzbekistani Som', 'سوم أوزبكي'],
    ['TJS', 'TJS', 'Tajikistani Somoni', 'سوموني طاجيكي'],
    ['KGS', 'KGS', 'Kyrgystani Som', 'سوم قيرغيزي'],
    ['TMT', 'TMT', 'Turkmenistani Manat', 'مانات تركماني'],
    ['AZN', '₼', 'Azerbaijani Manat', 'مانات أذربيجاني'],
    ['GEL', '₾', 'Georgian Lari', 'لاري جورجي'],
    ['AMD', '֏', 'Armenian Dram', 'درام أرميني'],
    ['MNT', '₮', 'Mongolian Tugrik', 'توغروغ منغولي'],
    ['SEK', 'kr', 'Swedish Krona', 'كرونة سويدية'],
    ['NOK', 'kr', 'Norwegian Krone', 'كرونة نرويجية'],
    ['DKK', 'kr', 'Danish Krone', 'كرونة دنماركية'],
    ['ISK', 'kr', 'Icelandic Krona', 'كرونة آيسلندية'],
    ['PLN', 'zł', 'Polish Zloty', 'زلوتي بولندي'],
    ['CZK', 'Kč', 'Czech Koruna', 'كورونا تشيكية'],
    ['HUF', 'Ft', 'Hungarian Forint', 'فورنت مجري'],
    ['RON', 'lei', 'Romanian Leu', 'ليو روماني'],
    ['BGN', 'лв', 'Bulgarian Lev', 'ليف بلغاري'],
    ['RSD', 'RSD', 'Serbian Dinar', 'دينار صربي'],
    ['MKD', 'MKD', 'Macedonian Denar', 'دينار مقدوني'],
    ['ALL', 'ALL', 'Albanian Lek', 'ليك ألباني'],
    ['BAM', 'KM', 'Bosnian Mark', 'مارك بوسني'],
    ['MDL', 'MDL', 'Moldovan Leu', 'ليو مولدوفي'],
    ['UAH', '₴', 'Ukrainian Hryvnia', 'هريفنيا أوكرانية'],
    ['BYN', 'BYN', 'Belarusian Ruble', 'روبل بيلاروسي'],
    ['RUB', '₽', 'Russian Ruble', 'روبل روسي'],
    ['ZAR', 'R', 'South African Rand', 'راند جنوب أفريقي'],
    ['NGN', '₦', 'Nigerian Naira', 'نايرا نيجيرية'],
    ['GHS', 'GH₵', 'Ghanaian Cedi', 'سيدي غاني'],
    ['KES', 'KSh', 'Kenyan Shilling', 'شلن كيني'],
    ['TZS', 'TSh', 'Tanzanian Shilling', 'شلن تنزاني'],
    ['UGX', 'USh', 'Ugandan Shilling', 'شلن أوغندي'],
    ['RWF', 'RWF', 'Rwandan Franc', 'فرنك رواندي'],
    ['BIF', 'BIF', 'Burundian Franc', 'فرنك بوروندي'],
    ['ETB', 'ETB', 'Ethiopian Birr', 'بير إثيوبي'],
    ['ERN', 'ERN', 'Eritrean Nakfa', 'ناكفا إريترية'],
    ['XOF', 'CFA', 'West African CFA Franc', 'فرنك أفريقي غربي'],
    ['XAF', 'FCFA', 'Central African CFA Franc', 'فرنك أفريقي أوسط'],
    ['GMD', 'GMD', 'Gambian Dalasi', 'دالاسي غامبي'],
    ['GNF', 'GNF', 'Guinean Franc', 'فرنك غيني'],
    ['SLE', 'SLE', 'Sierra Leonean Leone', 'ليون سيراليوني'],
    ['LRD', 'L$', 'Liberian Dollar', 'دولار ليبيري'],
    ['CVE', 'CVE', 'Cape Verdean Escudo', 'إسكودو الرأس الأخضر'],
    ['STN', 'STN', 'São Tomé Dobra', 'دوبرا ساو تومي'],
    ['MZN', 'MT', 'Mozambican Metical', 'متكال موزمبيقي'],
    ['MWK', 'MK', 'Malawian Kwacha', 'كواشا مالاوية'],
    ['ZMW', 'ZK', 'Zambian Kwacha', 'كواشا زامبية'],
    ['ZWG', 'ZWG', 'Zimbabwe Gold', 'زيمبابوي غولد'],
    ['BWP', 'P', 'Botswanan Pula', 'بولا بوتسوانية'],
    ['NAD', 'N$', 'Namibian Dollar', 'دولار ناميبي'],
    ['SZL', 'SZL', 'Swazi Lilangeni', 'ليلانجيني سوازي'],
    ['LSL', 'LSL', 'Lesotho Loti', 'لوتي ليسوتو'],
    ['AOA', 'Kz', 'Angolan Kwanza', 'كوانزا أنغولية'],
    ['CDF', 'CDF', 'Congolese Franc', 'فرنك كونغولي'],
    ['MGA', 'Ar', 'Malagasy Ariary', 'أرياري مدغشقري'],
    ['MUR', '₨', 'Mauritian Rupee', 'روبية موريشيوسية'],
    ['SCR', 'SCR', 'Seychellois Rupee', 'روبية سيشيلية'],
    ['MXN', 'MX$', 'Mexican Peso', 'بيزو مكسيكي'],
    ['GTQ', 'Q', 'Guatemalan Quetzal', 'كتزال غواتيمالي'],
    ['HNL', 'L', 'Honduran Lempira', 'لمبيرا هندوراسية'],
    ['NIO', 'C$', 'Nicaraguan Córdoba', 'كوردوبا نيكاراغوية'],
    ['CRC', '₡', 'Costa Rican Colón', 'كولون كوستاريكي'],
    ['PAB', 'B/.', 'Panamanian Balboa', 'بالبوا بنمية'],
    ['DOP', 'RD$', 'Dominican Peso', 'بيزو دومينيكاني'],
    ['HTG', 'HTG', 'Haitian Gourde', 'غورد هايتي'],
    ['JMD', 'J$', 'Jamaican Dollar', 'دولار جامايكي'],
    ['TTD', 'TT$', 'Trinidad Dollar', 'دولار ترينيداد'],
    ['BBD', 'Bds$', 'Barbadian Dollar', 'دولار بربادوسي'],
    ['BSD', 'B$', 'Bahamian Dollar', 'دولار باهامي'],
    ['BZD', 'BZ$', 'Belize Dollar', 'دولار بليزي'],
    ['XCD', 'EC$', 'East Caribbean Dollar', 'دولار شرق كاريبي'],
    ['CUP', 'CUP', 'Cuban Peso', 'بيزو كوبي'],
    ['BRL', 'R$', 'Brazilian Real', 'ريال برازيلي'],
    ['ARS', 'AR$', 'Argentine Peso', 'بيزو أرجنتيني'],
    ['CLP', 'CL$', 'Chilean Peso', 'بيزو تشيلي'],
    ['COP', 'CO$', 'Colombian Peso', 'بيزو كولومبي'],
    ['PEN', 'S/', 'Peruvian Sol', 'سول بيروفي'],
    ['UYU', '$U', 'Uruguayan Peso', 'بيزو أوروغواي'],
    ['PYG', '₲', 'Paraguayan Guarani', 'غواراني باراغواي'],
    ['BOB', 'Bs', 'Bolivian Boliviano', 'بوليفيانو بوليفي'],
    ['VES', 'Bs.S', 'Venezuelan Bolívar', 'بوليفار فنزويلي'],
    ['GYD', 'G$', 'Guyanese Dollar', 'دولار غياني'],
    ['SRD', 'SRD', 'Surinamese Dollar', 'دولار سورينامي'],
    ['FJD', 'FJ$', 'Fijian Dollar', 'دولار فيجي'],
    ['PGK', 'PGK', 'Papua New Guinean Kina', 'كينا بابوا غينيا'],
    ['WST', 'WST', 'Samoan Tala', 'تالا ساموية'],
    ['TOP', 'TOP', 'Tongan Paʻanga', 'بانغا تونغية'],
    ['SBD', 'SI$', 'Solomon Islands Dollar', 'دولار جزر سليمان'],
    ['VUV', 'VT', 'Vanuatu Vatu', 'فاتو فانواتية'],
    ['XPF', 'XPF', 'CFP Franc', 'فرنك باسيفيكي'],
    ['MVR', 'MVR', 'Maldivian Rufiyaa', 'روفيه مالديفية'],
    ['BTN', 'BTN', 'Bhutanese Ngultrum', 'نغولترم بوتاني'],
    ['MOP', 'MOP$', 'Macanese Pataca', 'باتاكا ماكاوية'],
    ['GIP', '£', 'Gibraltar Pound', 'جنيه جبل طارق'],
    ['FKP', '£', 'Falkland Pound', 'جنيه فوكلاند'],
    ['SHP', '£', 'Saint Helena Pound', 'جنيه سانت هيلينا'],
    ['AWG', 'Afl.', 'Aruban Florin', 'فلورن أروبي'],
    ['ANG', 'NAf.', 'Netherlands Antillean Guilder', 'غيلدر أنتيلي'],
    ['KYD', 'CI$', 'Cayman Islands Dollar', 'دولار كايمان'],
    ['BMD', 'BD$', 'Bermudian Dollar', 'دولار برمودي']
  ];

  // zero-decimal currencies (no cents)
  var ZERO_DEC = { JPY: 1, KRW: 1, VND: 1, CLP: 1, PYG: 1, UGX: 1, RWF: 1, BIF: 1, DJF: 1, KMF: 1, GNF: 1, VUV: 1, XOF: 1, XAF: 1, XPF: 1, ISK: 1 };
  // three-decimal currencies
  var THREE_DEC = { KWD: 1, BHD: 1, OMR: 1, JOD: 1, TND: 1, LYD: 1, IQD: 1 };

  var MAP = {};
  for (var i = 0; i < CURRENCIES.length; i++) MAP[CURRENCIES[i][0]] = CURRENCIES[i];

  var isAr = (document.documentElement.lang || '').toLowerCase().indexOf('ar') === 0;
  var POPULAR = ['USD', 'EUR', 'MAD', 'AED', 'SAR', 'EGP', 'GBP', 'QAR', 'KWD', 'DZD', 'TND', 'CAD'];

  function optionLabel(c) {
    var name = isAr ? c[3] : c[2];
    return c[0] + ' — ' + name + (c[1] !== c[0] ? ' (' + c[1] + ')' : '');
  }

  function populate(select) {
    if (!select || select.options.length > 0) return;
    var popGroup = document.createElement('optgroup');
    popGroup.label = isAr ? 'الأكثر استخداما' : 'Most used';
    POPULAR.forEach(function (code) {
      var c = MAP[code];
      var o = document.createElement('option');
      o.value = c[0];
      o.textContent = optionLabel(c);
      popGroup.appendChild(o);
    });
    select.appendChild(popGroup);

    var allGroup = document.createElement('optgroup');
    allGroup.label = isAr ? 'جميع العملات' : 'All currencies';
    CURRENCIES.slice().sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }).forEach(function (c) {
      var o = document.createElement('option');
      o.value = c[0];
      o.textContent = optionLabel(c);
      allGroup.appendChild(o);
    });
    select.appendChild(allGroup);

    // restore last used currency
    var saved = null;
    try { saved = localStorage.getItem('qb_currency'); } catch (e) {}
    select.value = (saved && MAP[saved]) ? saved : 'USD';
    select.addEventListener('change', function () {
      try { localStorage.setItem('qb_currency', select.value); } catch (e) {}
    });
  }

  function decimalsFor(code) {
    if (ZERO_DEC[code]) return 0;
    if (THREE_DEC[code]) return 3;
    return 2;
  }

  // Global override: pages call formatMoney(amount, selectValue)
  window.formatMoney = function (amount, code) {
    var n = Number(amount) || 0;
    var c = MAP[code];
    var d = c ? decimalsFor(code) : 2;
    var formatted = n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    if (!c) return (code || '$') + formatted; // legacy fallback (old symbol values)
    var sym = c[1];
    // short symbols prefix (e.g. $100.00) — codes/long symbols suffix (e.g. 100.00 MAD)
    if (sym.length <= 3 && sym !== c[0]) return sym + formatted;
    return formatted + ' ' + sym;
  };

  function init() { populate(document.getElementById('currency')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
