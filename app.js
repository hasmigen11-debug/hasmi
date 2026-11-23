/* HASMI app — โหลดจาก GitHub Pages โดยไฟล์ Index ใน Apps Script */
document.body.insertAdjacentHTML('beforeend', "<div id=\"splash\">\n  <div class=\"logo\" role=\"img\" aria-label=\"โลโก้ HASMI\"></div>\n  <h1>HASMI</h1>\n  <div class=\"full\">Himpunan Anak Siswa Siswi<br>Membantu Masyarakat Islam</div>\n  <div class=\"bar\"><i></i></div>\n</div>\n\n\n<div id=\"lock\" hidden><div class=\"lockbox\"><div class=\"logo\"></div><h2>HASMI</h2><p>ใส่รหัสผ่านเพื่อเข้าใช้งาน</p>\n  <form id=\"lockForm\" autocomplete=\"off\"><input id=\"pin\" type=\"password\" inputmode=\"numeric\" pattern=\"[0-9]*\" maxlength=\"12\" placeholder=\"••••••\" aria-label=\"รหัสผ่าน\" autocomplete=\"off\">\n  <button class=\"btn\" id=\"pinBtn\" type=\"submit\">เข้าสู่แอป</button></form><div class=\"lockerr\" id=\"lockErr\"></div></div></div>\n<div class=\"topbar\"><div class=\"in\">\n  <button class=\"backbtn\" id=\"back\" hidden aria-label=\"ย้อนกลับ\"></button>\n  <button class=\"brand\" id=\"brand\" title=\"หน้าหลัก\"><span class=\"logo\"></span><b>HASMI</b></button>\n  <div class=\"crumb\" id=\"crumb\"></div>\n  <div class=\"spacer\"></div>\n  <select class=\"tsel\" id=\"month\" style=\"display:none\" aria-label=\"เลือกเดือน\"></select>\n  <span class=\"who\" id=\"who\"></span>\n  <a class=\"tbtn\" id=\"sheetLink\" target=\"_blank\" style=\"display:none\"></a>\n  <button class=\"tbtn\" id=\"refresh\" title=\"ดึงข้อมูลล่าสุด\"></button>\n  <button class=\"tbtn\" id=\"lockBtn\" title=\"ล็อกแอป\"></button>\n</div></div>\n<div class=\"subnav\" id=\"subnav\" style=\"display:none\"><div class=\"in\" id=\"subnavIn\"></div></div>\n\n<main>\n  <div id=\"banner\" class=\"banner\"></div>\n  <section id=\"view\"></section>\n</main>\n\n<div class=\"scrim\" id=\"scrim\">\n  <div class=\"modal\" role=\"dialog\" aria-modal=\"true\">\n    <div class=\"mh\"><h3 id=\"mTitle\"></h3><button id=\"mClose\" aria-label=\"ปิด\"></button></div>\n    <div id=\"mContent\"></div>\n  </div>\n</div>\n<div class=\"toast\" id=\"toast\"></div>");
(function(){ var b = document.getElementById('boot'); if (b) b.remove(); })();

window.__mainParsed = true;
try {
(() => {
  // ================= helpers =================
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const fmt = n => num(n).toLocaleString("th-TH", {maximumFractionDigits: 2});
  const baht = n => "฿" + fmt(n);
  const sc = n => n > 0 ? "pos" : n < 0 ? "neg" : "";
  const TH_M = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const TH_MS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const monthLabel = ym => { const [y,m] = ym.split("-"); return TH_M[+m-1] + " " + (+y + 543); };
  const thDate = d => { if(!/^\d{4}-\d{2}-\d{2}/.test(d||"")) return "-"; const [y,m,dd] = d.split("-"); return `${+dd} ${TH_MS[+m-1]} ${String(+y+543).slice(2)}`; };
  const todayISO = () => { const t = new Date(); t.setMinutes(t.getMinutes()-t.getTimezoneOffset()); return t.toISOString().slice(0,10); };
  const curYM = todayISO().slice(0,7);
  const inPeriod = (d, ym) => ym === "all" || String(d||"").startsWith(ym);
  const TH_WD = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
  const dayLabel = d => { if(!/^\d{4}-\d{2}-\d{2}/.test(d||"")) return "ไม่ระบุวันที่"; const [y,m,dd] = d.split("-").map(Number); const wd = TH_WD[new Date(y, m-1, dd).getDay()];
    const rel = d === todayISO() ? " (วันนี้)" : ""; return `วัน${wd}ที่ ${dd} ${TH_M[m-1]} ${y+543}${rel}`; };
  let balBefore = null;
  const toast = msg => { const t = $("#toast");
    if(balBefore !== null && typeof balances === "function"){ const now = balances().club, d = now - balBefore; balBefore = null;
      if(d && state.data.wallets.length){ msg += ` · เงินชมรม ${baht(now)} (${d > 0 ? "+" : ""}${fmt(d)})`; const pl = $("#balpill"); if(pl){ pl.classList.add("flash"); setTimeout(() => pl.classList.remove("flash"), 1200); } } }
    t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove("show"), 2200); };
  const lines = v => Array.isArray(v) ? v.map(String).filter(s=>s.trim()) : [];
  const absList = v => Array.isArray(v) ? v.filter(x=>x && typeof x === "object").map(x=>({name:String(x.name??""),reason:String(x.reason??"")})).filter(x=>x.name.trim()) : [];

  const P = {
    wallet:'<path d="M3 7a2 2 0 0 1 2-2h12v4"/><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14" r="1.2"/>',
    book:'<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/><path d="M8 7h7M8 10.5h5"/>',
    chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    cup:'<path d="M6 8h12l-1.4 11.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z"/><path d="M5 8h14M9 8l1-5h4"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    box:'<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
    note:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h5"/>',
    check:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    sheet:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
    x:'<path d="M6 6l12 12M18 6 6 18"/>',
    back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    gift:'<rect x="3.5" y="9" width="17" height="11.5" rx="1"/><path d="M12 9v11.5M3.5 13h17M12 9S10.5 4 8 4.5 7.5 9 12 9zM12 9s1.5-5 4-4.5S16.5 9 12 9z"/>',
    cart:'<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M3 4h2l2.4 11h11.2L21 8H6.3"/>',
    minus:'<path d="M5 12h14"/>',
    shop:'<path d="M4 9h16l-1-5H5zM5 9v11h14V9M9 20v-6h6v6"/>',
    padlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    search:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    doc:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    clip:'<path d="M20 11.5 12 19.5a5 5 0 0 1-7-7L13.5 4a3.3 3.3 0 0 1 4.7 4.7L10 16.9a1.7 1.7 0 0 1-2.4-2.4L15 7"/>',
    table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M15 10v10"/>',
  };
  const I = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

  // ---------- slips ----------
  const safeSlipUrl = u => /^https:\/\/(drive|docs)\.google\.com\//.test(u) || /^data:(image\/(png|jpeg|webp|gif)|application\/pdf);base64,/.test(u);
  const slipsOf = (r, k="slips") => Array.isArray(r && r[k]) ? r[k].filter(x => x && safeSlipUrl(String(x.url||""))).map(x => ({url:String(x.url), id:String(x.id||"")})) : [];
  const thumbSrc = s => s.id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(s.id)}&sz=w320` : (/^data:image\//.test(s.url) ? s.url : "");
  const EXPENSE = {
    juice: r => MODULES.juice.calc(r).totalCost + num(r.otherExp),
    activities: r => num(r.used),
    products: r => MODULES.products.calc(r).expense,
    staffdebt: r => num(r.amount),
  };
  const needsSlip = (mod, r) => EXPENSE[mod] && EXPENSE[mod](r) > 0 && !slipsOf(r).length;
  function slipCell(mod, items){
    const all = items.flatMap(slipsOf);
    const missing = items.some(r => needsSlip(mod, r));
    const links = all.map((s,i) => `<a class="slip" href="${esc(s.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("");
    return links || `<span class="meta">-</span>`;
  }
  function thumbHTML(s, removeIdx){ /* removeIdx = "field:index" */
    const src = thumbSrc(s);
    const inner = src ? `<img src="${esc(src)}" alt="สลิป" data-fb="1" loading="lazy">` : `<span class="ph">${I("doc")}เปิดไฟล์</span>`;
    const rm = removeIdx !== undefined ? `<button type="button" class="rm" data-slipdel="${removeIdx}" aria-label="เอาสลิปออก">${I("x")}</button>` : "";
    return `<a class="thumb" href="${esc(s.url)}" target="_blank" rel="noopener">${inner}${rm}</a>`;
  }
  document.addEventListener("error", e => { const t = e.target; if(t && t.tagName === "IMG" && t.dataset.fb){ const ph = document.createElement("span"); ph.className = "ph"; ph.innerHTML = I("doc") + "เปิดไฟล์"; t.replaceWith(ph); } }, true);
  async function prepFile(file){
    let blob = file, name = file.name || "slip", mime = file.type || "";
    if(/^image\/(jpeg|png|webp)$/.test(mime)){
      try{
        const bmp = await createImageBitmap(file), sc2 = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width*sc2); cv.height = Math.round(bmp.height*sc2);
        cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
        const out = await new Promise(r => cv.toBlob(r, "image/jpeg", 0.82));
        if(out && out.size < blob.size){ blob = out; mime = "image/jpeg"; name = name.replace(/\.\w+$/, "") + ".jpg"; }
      }catch(_){}
    }
    if(!/^(image\/|application\/pdf)/.test(mime)) throw new Error("แนบได้เฉพาะรูปภาพหรือ PDF");
    if(blob.size > 10*1024*1024) throw new Error("ไฟล์ใหญ่เกิน 10 MB");
    const dataUrl = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
    return {name, mime, b64: String(dataUrl).split(",")[1]};
  }

  // ---------- products: rounds + sales log ----------
  const unitCostOf = r => num(r.unitCost) > 0 ? num(r.unitCost) : (num(r.qty) ? num(r.cost) / num(r.qty) : 0);
  const salesOf = r => r.batch ? (Array.isArray(r.sales) ? r.sales.filter(x => x && x.date).map(x => ({date:String(x.date), qty:num(x.qty)})) : [])
                               : [{date: r.date || "", qty: num(r.qty)}];   // รายการแบบเก่า = ขายหมดในวันที่บันทึก
  function prodStatus(r){
    const u = unitCostOf(r), ordered = num(r.qty), sold = salesOf(r).reduce((a,x) => a + x.qty, 0), other = num(r.otherExp), price = num(r.price);
    return {unit:u, ordered, sold, left: ordered - sold, capital: ordered*u + other, revenue: sold*price, profitNow: sold*(price - u) - other, profitFull: ordered*(price - u) - other, profit: sold*(price - u) - other};
  }
  function prodIn(r, ym){   // ส่วนของรอบนี้ที่เกิดในเดือน ym (ขายเดือนไหน นับกำไรเดือนนั้น)
    const inM = d => ym === "all" || String(d||"").startsWith(ym);
    const sold = salesOf(r).filter(x => inM(x.date)).reduce((a,x) => a + x.qty, 0);
    const u = unitCostOf(r), other = inM(r.date) ? num(r.otherExp) : 0, revenue = sold*num(r.price), cogs = sold*u;
    return {sold, revenue, cogs, other, expense: cogs + other, profit: revenue - cogs - other, dates: salesOf(r).filter(x => inM(x.date)).map(x => x.date)};
  }

  // ---------- daily grouping ----------
  function byDay(list){
    const m = new Map();
    for(const r of list){ const d = r.date || ""; if(!m.has(d)) m.set(d, []); m.get(d).push(r); }
    return [...m.entries()].sort((a,b) => a[0].localeCompare(b[0])).map(([date, items]) => ({date, items}));
  }

  // ================= modules =================
  const NOTE_TYPES = ["บันทึกการประชุม","ประกาศ","เอกสาร / หนังสือ","ทั่วไป"];
  const TASK_STATUS = ["ยังไม่เริ่ม","กำลังทำ","เสร็จแล้ว"];
  const MODULES = {
    juice: {
      title:"น้ำส้ม",
      fields:[
        {k:"side",label:"ฝ่าย",type:"seg",options:["ชาย","หญิง"],req:true},
        {k:"date",label:"วันที่",type:"date",req:true},
        {k:"cupsIn",label:"รับมากี่แก้ว",type:"num",must:"pos"},
        {k:"cupsSold",label:"ขายได้กี่แก้ว",type:"num",must:"filled"},
        {k:"broken",label:"แก้วมีปัญหา",type:"num",hint:"คืนร้านไม่ได้ · คิดเป็นต้นทุน"},
        {k:"costPerCup",label:"ต้นทุนต่อแก้ว (บาท)",type:"num",remember:true,must:"pos"},
        {k:"pricePerCup",label:"ราคาขายต่อแก้ว (บาท)",type:"num",remember:true,must:"pos"},
        {k:"otherExp",label:"ค่าใช้จ่ายอื่น (บาท)",type:"num",more:true,hint:"เช่น แก้ว หลอด น้ำแข็ง"},
        {k:"note",label:"หมายเหตุ",type:"text",more:true},
        {k:"slips",label:"สลิป",type:"slips",more:true},
      ],
      // ขายไม่หมดและไม่มีปัญหา = คืนร้านได้ → ต้นทุนคิดจาก (ขายได้ + แก้วมีปัญหา) เท่านั้น
      calc: r => { const totalCost = (num(r.cupsSold)+num(r.broken))*num(r.costPerCup), revenue = num(r.cupsSold)*num(r.pricePerCup);
        const left = num(r.cupsIn)-num(r.cupsSold)-num(r.broken);
        return {totalCost, revenue, profit: revenue - totalCost - num(r.otherExp), left, returned: Math.max(0, left)}; },
      calcShow: c => [["เงินที่ได้",baht(c.revenue)],["ต้นทุน",baht(c.totalCost)],["กำไร",baht(c.profit),sc(c.profit)],[c.left < 0 ? "เกินจำนวนที่รับมา" : "คืนร้าน", fmt(c.left) + " แก้ว", c.left < 0 ? "neg" : ""]],
    },
    activities: {
      title:"กิจกรรม",
      fields:[
        {k:"name",label:"ชื่อกิจกรรม",type:"text",req:true},
        {k:"date",label:"วันที่จัด",type:"date",req:true},
        {sect:"งบประมาณและรายได้"},
        {k:"budget",label:"งบที่ตั้งไว้ (บาท)",type:"num",must:"filled"},
        {k:"used",label:"ใช้เงินไป (บาท)",type:"num",must:"filled",hint:"ใส่ 0 ถ้ายังไม่ได้ใช้"},
        {sect:"เก็บเงินจากสต้าฟ"},
        {k:"collect",type:"staffcollect"},
        {k:"needs",type:"hidden"},
        {k:"incOther",label:"รายได้: อื่นๆ",type:"num",more:true},
        {k:"incOtherNote",label:"รายได้อื่นๆ มาจาก",type:"text",more:true},
        {k:"incStaff",label:"รายได้: เก็บจากสต้าฟ (กรอกเอง)",type:"num",hideIf:"collectStaff",more:true},
        {k:"slips",label:"สลิปการใช้จ่าย",type:"slips",more:true},
      ],
      calc: r => { const on = !!r.collectStaff, due = lines(r.staffDue), paid = lines(r.staffPaid), per = num(r.perStaff);
        const collected = on ? paid.length*per : 0, staffInc = on ? collected : num(r.incStaff);
        const income = staffInc + num(r.incOther);
        return {remaining: num(r.budget)-num(r.used), income, net: income - num(r.used), on, due: due.length, paid: paid.length, per, collected, expected: due.length*per, staffInc}; },
      calcShow: c => [["เงินที่เหลือจากงบ",baht(c.remaining),sc(c.remaining)],["รายได้รวม",baht(c.income)],
        ...(c.on ? [["เก็บสต้าฟ (จ่ายแล้ว)", `${c.paid}/${c.due} คน · ${baht(c.collected)}`]] : []),["รายได้ − ใช้ไป",baht(c.net),sc(c.net)]],
    },
    products: {
      title:"สินค้า (รอบสั่ง)",
      fields:[
        {k:"name",label:"ชื่อสินค้า",type:"datalist",req:true,options:() => [...new Set(state.data.products.map(p => String(p.name||"").trim()).filter(Boolean))],hint:"เลือกจากชื่อเดิม หรือพิมพ์ชื่อใหม่"},
        {k:"round",label:"รอบที่",type:"num"},
        {k:"date",label:"วันที่สั่ง",type:"date",req:true},
        {k:"qty",label:"สั่งมากี่อัน",type:"num",must:"pos"},
        {k:"unitCost",label:"ต้นทุนต่ออัน (บาท)",type:"num",must:"pos"},
        {k:"price",label:"ราคาขายต่ออัน (บาท)",type:"num",must:"pos"},
        {k:"sales",label:"บันทึกการขาย",type:"sales"},
        {k:"shop",label:"ทำร้านไหน",type:"text",more:true},
        {k:"otherExp",label:"รายจ่ายอื่น (บาท)",type:"num",more:true,hint:"เช่น ค่าส่ง ค่าแพ็ก"},
        {k:"note",label:"หมายเหตุ",type:"text",more:true},
        {k:"slips",label:"สลิป",type:"slips",more:true},
      ],
      calc: r => { const st = prodStatus(r); return {...st, expense: st.capital, cost: st.capital - num(r.otherExp)}; },
      calcShow: c => [["ทุนทั้งหมด",baht(c.capital)],["ขายแล้ว",`${fmt(c.sold)} / ${fmt(c.ordered)} อัน`],["กำไรตอนนี้",baht(c.profitNow),sc(c.profitNow)],["กำไรถ้าขายหมด",baht(c.profitFull),sc(c.profitFull)]],
    },
    wallets: {
      title:"บัญชี / เงินสด",
      fields:[
        {k:"kind",label:"ประเภท",type:"seg",options:["บัญชีธนาคาร","เงินสด"],req:true},
        {k:"name",label:"ชื่อ",type:"text",req:true,full:true,hint:"เช่น ออมทรัพย์ กรุงไทย xxx-x-xx123 / เงินสดที่เหรัญญิก"},
        {k:"opening",label:"ยอดเงินตอนนี้ (บาท)",type:"num",must:"filled"},
        {k:"asOf",label:"ณ วันที่",type:"date",req:true},
        {k:"note",label:"รายละเอียด",type:"text",full:true,more:true},
      ],
    },
    funds: {
      title:"เงินบริจาค (ได้รับ)",
      fields:[
        {k:"donor",label:"ได้รับจากใคร / ฝ่ายไหน",type:"datalist",req:true,full:true,options:() => [...new Set(state.data.funds.map(f => String(f.donor||"").trim()).filter(Boolean))],hint:"เช่น ผู้ปกครอง, มัสยิด…, ร้าน…, ศิษย์เก่า, โรงเรียน"},
        {k:"purpose",label:"ให้เพื่ออะไร",type:"datalist",req:true,full:true,options:() => [...new Set(state.data.funds.map(f => String(f.purpose||"").trim()).filter(Boolean))],hint:"เช่น ค่ายพัฒนาชุมชน, ซื้อของแจกเด็กกำพร้า, ใช้ทั่วไปในชมรม"},
        {k:"amount",label:"จำนวนเงิน (บาท)",type:"num",must:"pos"},
        {k:"date",label:"วันที่ได้รับ",type:"date",req:true},
        {k:"slips",label:"สลิป / หลักฐาน",type:"slips"},
        {k:"note",label:"หมายเหตุ",type:"text",more:true},
      ],
    },
    fspend: {
      title:"การใช้เงินบริจาค",
      fields:[
        {k:"purpose",label:"ใช้จากเงินบริจาคก้อนไหน (เพื่ออะไร)",type:"donpick",req:true,full:true},
        {k:"item",label:"ใช้ทำอะไร",type:"text",req:true,full:true,hint:"เช่น ซื้อข้าวสารแจกเด็กกำพร้า, ค่ารถไปค่าย"},
        {k:"amount",label:"จำนวนเงิน (บาท)",type:"num",must:"pos"},
        {k:"date",label:"วันที่",type:"date",req:true},
        {k:"slips",label:"สลิป / ใบเสร็จ",type:"slips"},
        {k:"note",label:"หมายเหตุ",type:"text",more:true},
      ],
    },
    moves: {
      title:"เงินเข้า-ออกอื่นๆ",
      fields:[
        {k:"dir",label:"เงินเข้าหรือออก",type:"seg",options:["เงินเข้า","เงินออก"],req:true},
        {k:"date",label:"วันที่",type:"date",req:true},
        {k:"amount",label:"จำนวนเงิน (บาท)",type:"num",must:"pos"},
        {k:"item",label:"รายการ",type:"text",req:true,full:true,hint:"เช่น ซื้ออุปกรณ์ชมรม, ค่าใช้จ่ายทั่วไป"},
        {k:"wallet",label:"เข้า/ออกจาก",type:"walletselect",req:true},
        {k:"note",label:"หมายเหตุ",type:"text",more:true},
        {k:"slips",label:"สลิป",type:"slips",more:true},
      ],
    },
    staffdebt: {
      title:"รายการติดเงินสต้าฟ",
      fields:[
        {k:"date",label:"วันที่ออกเงิน",type:"date",req:true},
        {k:"staff",label:"สต้าฟที่ออกเงิน",type:"staffselect",req:true},
        {k:"item",label:"ค่าอะไร",type:"text",req:true,full:true,hint:"เช่น ค่าน้ำแข็ง ค่ารถ ค่าป้ายไวนิล"},
        {k:"amount",label:"จำนวนเงิน (บาท)",type:"num",must:"pos"},
        {k:"slips",label:"สลิป / ใบเสร็จ",type:"slips"},
        {k:"activity",label:"กิจกรรม / เรื่อง",type:"datalist",more:true,options:() => [...new Set(state.data.activities.map(a => String(a.name||"").trim()).filter(Boolean))]},
        {k:"note",label:"หมายเหตุ",type:"text",more:true},
        {k:"repaid",label:"โอนคืนแล้ว",type:"bool",more:true},
        {k:"repaidDate",label:"วันที่โอนคืน",type:"date",noDefault:true,more:true},
        {k:"repaySlips",label:"สลิปโอนคืน",type:"slips",more:true},
      ],
    },
    staff: {
      title:"สต้าฟ",
      fields:[
        {k:"name",label:"ชื่อ-นามสกุล",type:"text",req:true,full:true},
        {k:"gender",label:"เพศ",type:"select",options:["ชาย","หญิง"]},
        {k:"sid",label:"เลขประจำตัว",type:"text"},
        {k:"klass",label:"ชั้นสามัญ",type:"text",hint:"เช่น 5/10"},
        {k:"rklass",label:"ชั้นศาสนา",type:"text",hint:"เช่น 8/2"},
        {k:"note",label:"หมายเหตุ",type:"text",full:true},
      ],
    },
    att: { title:"เช็คชื่อ", fields:[
      {k:"type",label:"เรื่อง",type:"seg",options:["ขาย","ประชุม","กิจกรรม"],req:true},
      {k:"date",label:"วันที่",type:"date",req:true},
      {k:"title",label:"หัวข้อ / ชื่อกิจกรรม",type:"datalist",req:true,options:() => [...new Set([...state.data.activities.map(a => a.name), ...state.data.att.map(a => a.title)].map(x => String(x||"").trim()).filter(Boolean))]},
      {k:"marks",label:"รายชื่อสตาฟ",type:"marks"},
      {k:"note",label:"หมายเหตุ",type:"text",more:true},
    ]},
    buy: { title:"ของที่ต้องการซื้อ", fields:[
      {k:"name",label:"ต้องการซื้ออะไร",type:"datalist",req:true,full:true,options:() => [...new Set([...state.data.items.map(i => i.name), ...state.data.buy.map(i => i.name)].map(x => String(x||"").trim()).filter(Boolean))]},
      {k:"qty",label:"ต้องการกี่",type:"num",must:"pos"},
      {k:"unit",label:"หน่วย",type:"text",hint:"เช่น ชิ้น แพ็ก ขวด"},
      {k:"cat",label:"ประเภท",type:"seg",options:["ของกิน","ของใช้"],req:true},
      {k:"forWhat",label:"ใช้สำหรับ",type:"datalist",full:true,options:() => state.data.activities.map(a => a.name).filter(Boolean),hint:"เช่น ชื่อกิจกรรม หรือ ใช้ในห้องชมรม (ไม่บังคับ)"},
      {k:"status",type:"hidden"},{k:"boughtQty",type:"hidden"},{k:"boughtDate",type:"hidden"},
      {k:"note",label:"หมายเหตุ",type:"text",more:true},
    ]},
    borrow: { title:"ของที่ยืม", fields:[
      {k:"dir",label:"ประเภท",type:"seg",options:["เรายืมมา","ให้คนอื่นยืมไป"],req:true},
      {k:"name",label:"ของอะไร",type:"datalist",req:true,full:true,options:() => [...new Set([...state.data.items.map(i => i.name), ...state.data.borrow.map(i => i.name)].map(x => String(x||"").trim()).filter(Boolean))]},
      {k:"qty",label:"จำนวน",type:"num",must:"pos"},
      {k:"unit",label:"หน่วย",type:"text"},
      {k:"party",label:"ยืมจากใคร / ให้ใครยืม",type:"text",req:true,full:true,hint:"เช่น ชมรม…, ครู…, มัสยิด…"},
      {k:"date",label:"วันที่ยืม",type:"date",req:true},
      {k:"due",label:"กำหนดคืน",type:"date",noDefault:true},
      {k:"returned",type:"hidden"},{k:"returnDate",type:"hidden"},
      {k:"note",label:"หมายเหตุ",type:"text",more:true},
    ]},
    items: { title:"ของส่วนกลาง", fields:[
      {k:"name",label:"ชื่อของ",type:"text",req:true,full:true},
      {k:"cat",label:"ประเภท",type:"seg",options:["ของกิน","ของใช้"],req:true},
      {k:"qty",label:"จำนวนที่มีตอนนี้",type:"num",must:"filled",hint:"ใส่ 0 ถ้าหมด / ไม่มี"},
      {k:"unit",label:"หน่วย",type:"text",hint:"เช่น ชิ้น แพ็ก ขวด"},
      {k:"note",label:"หมายเหตุ",type:"text",more:true},
    ]},
    cfg: { title:"บทลงโทษ", fields:[
      {k:"key",type:"hidden"},
      {k:"value",label:"บทลงโทษเมื่อขาดโดยไม่มีเหตุผลครบ 5 ครั้ง",type:"long"},
    ]},
  };
  const SECTIONS = {
    ekonomi: { title:"Bendahara", sub:"การเงินและบัญชีชมรม", tabs:[["overview","ภาพรวม","chart"],["kas","เงินชมรม","wallet"],["funds","เงินบริจาค","gift"],["juice","น้ำส้ม","cup"],["activities","กิจกรรม","flag"],["products","สินค้าอื่นๆ","box"],["staffdebt","ติดเงินสต้าฟ","users"]] },
    setia:   { title:"Setia", sub:"งานเลขานุการ", tabs:[["staff","สตาฟ","users"],["fin","รายรับ-รายจ่าย","chart"],["items","ของส่วนกลาง","box"]] },
  };

  // ================= backend =================
  const hasGAS = typeof google !== "undefined" && google.script && google.script.run;
  const demo = { data:Object.fromEntries(Object.keys(MODULES).map(k => [k, []])) };
  function demoCall(fn, mod, rec, id){
    const d = demo.data;
    if(fn === "unlock"){ if(String(mod||"").trim() === "231169"){ demo.unlocked = true; return {ok:true, ...demoCall("getAll")}; } return {ok:false, left:4}; }
    if(fn === "lock"){ demo.unlocked = false; return {locked:true}; }
    if(fn === "getAll" && !demo.unlocked) return {locked:true};
    if(fn === "saveRecords"){ for(const it of rec) demoCall("saveRecord", mod, it.rec, it.id); }
    if(fn === "saveRecord"){ const nid = id || ("d" + Date.now().toString(36) + Math.random().toString(36).slice(2,6)); const prev = d[mod].find(x=>x.id===nid); d[mod] = d[mod].filter(x=>x.id!==nid).concat([{...rec, id:nid, createdAt: prev?.createdAt || new Date().toISOString()}]); }
    if(fn === "deleteRecord") d[mod] = d[mod].filter(x=>x.id!==rec);
    if(fn === "uploadSlip") return {id:"", url:`data:${rec};base64,${id}`};
    return {data: JSON.parse(JSON.stringify(d)), email:"", canWrite:true, demo:true};
  }
  function gs(fn, ...args){
    if(/^(saveRecord|saveRecords|deleteRecord)$/.test(fn) && state.loaded) balBefore = balances().club;
    if(!hasGAS) return new Promise(r => setTimeout(() => r(demoCall(fn, ...args)), 120));
    return new Promise((res, rej) => google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn](...args));
  }

  // ================= state =================
  const state = { route:"home", tab:{ekonomi:"overview", setia:"menu"}, staffTab:"ขาย", finSub:"menu", ecoKind:"รายวัน", itemCat:"all", itemTab:"have", borrowF:"open", month:curYM, data:Object.fromEntries(Object.keys(MODULES).map(k => [k, []])), loaded:false, debtSel:new Set(),
                  noteQ:"", noteType:"all", taskFilter:"open" };
  let canWrite = false, busy = false, isDemo = false;

  const recs = mod => state.data[mod].slice().sort((a,b) => (a.date||"").localeCompare(b.date||"") || String(a.createdAt||"").localeCompare(String(b.createdAt||"")));
  const monthRecs = (mod, ym = state.month) => recs(mod).filter(r => ym === "all" || (r.date||"").startsWith(ym));
  function setBanner(kind, html){ const b = $("#banner"); if(!html){ b.className="banner"; b.innerHTML=""; return; } b.className="banner show "+kind; b.innerHTML=html; }

  // ================= chrome =================
  $("#refresh").innerHTML = I("refresh") + "<span>รีเฟรช</span>";
  $("#sheetLink").innerHTML = I("sheet") + "<span>เปิดชีต</span>";
  $("#mClose").innerHTML = I("x");
  const hist = [];
  const snap = () => ({route: state.route, tab: state.route !== "home" ? state.tab[state.route] : null});
  function pushHist(){ const cur = snap(), last = hist[hist.length-1]; if(!last || last.route !== cur.route || last.tab !== cur.tab) hist.push(cur); if(hist.length > 30) hist.shift(); }
  function goBack(){   // ย้อนกลับ = กลับหน้าแรกทันที
    if($("#scrim").classList.contains("show")){ closeModal(); return; }
    hist.length = 0; state.route = "home"; render(); window.scrollTo(0,0);
  }

  $("#back").innerHTML = I("back") + "<span>ย้อนกลับ</span>";
  $("#back").onclick = goBack;
  $("#brand").onclick = () => { if(state.route !== "home"){ pushHist(); nav("home"); } };

  function allMonths(){
    const s = new Set([curYM]);
    for(const m of ["juice","activities","products"]) for(const r of state.data[m]) if(/^\d{4}-\d{2}/.test(r.date||"")) s.add(r.date.slice(0,7));
    for(const r of state.data.products) for(const x of salesOf(r)) if(/^\d{4}-\d{2}/.test(x.date)) s.add(x.date.slice(0,7));
    return [...s].sort().reverse();
  }
  function renderChrome(){
    const sec = SECTIONS[state.route];
    $("#crumb").innerHTML = sec ? `<span class="sep">/</span><strong>${sec.title}</strong><span class="sep" style="display:none"></span>` : "";
    const sel = $("#month");
    if(state.route === "ekonomi" || (state.route === "setia" && state.tab.setia === "fin")){
      const ms = allMonths(); if(state.month !== "all" && !ms.includes(state.month)) ms.push(state.month);
      sel.innerHTML = ms.map(m => `<option value="${m}">${monthLabel(m)}</option>`).join("") + `<option value="all">ทุกเดือน</option>`;
      sel.value = state.month; sel.style.display = "";
    } else sel.style.display = "none";
    $("#back").hidden = state.route === "home";
    const sn = $("#subnav");
    if(sec){
      sn.style.display = "";
      $("#subnavIn").innerHTML = sec.tabs.map(([k,l,ic]) => `<button data-tab="${k}" class="${state.tab[state.route]===k?"on":""}">${I(ic)}${l}</button>`).join("")
        + (state.loaded && state.data.wallets.length ? (() => { const c = balances().club; return `<span class="balpill" id="balpill" ${state.route === "ekonomi" ? `data-tab="overview"` : `data-tab="fin"`} title="เงินชมรมตอนนี้">${I("wallet")}เงินชมรม <b>${baht(c)}</b></span>`; })() : "");
    } else sn.style.display = "none";
  }
  $("#month").addEventListener("change", e => { state.month = e.target.value; render(); });
  $("#subnavIn").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if(!b || b.dataset.tab === state.tab[state.route]) return; pushHist(); state.tab[state.route] = b.dataset.tab; render(); window.scrollTo(0,0); });
  function nav(route, tab){ state.route = route; if(tab) state.tab[route] = tab; render(); window.scrollTo(0,0); }

  // ================= totals =================
  function totals(ym){
    const sum = (arr, f) => arr.reduce((s,x) => s + f(x), 0);
    const j = monthRecs("juice", ym).map(r => ({r, c: MODULES.juice.calc(r)}));
    const a = monthRecs("activities", ym).map(r => ({r, c: MODULES.activities.calc(r)}));
    const p = state.data.products.map(r => prodIn(r, ym)).filter(x => x.sold || x.other);
    const T = {
      juice:{ n:j.length, cupsIn:sum(j,x=>num(x.r.cupsIn)), cupsSold:sum(j,x=>num(x.r.cupsSold)), cost:sum(j,x=>x.c.totalCost), revenue:sum(j,x=>x.c.revenue), other:sum(j,x=>num(x.r.otherExp)), profit:sum(j,x=>x.c.profit) },
      activities:{ n:a.length, budget:sum(a,x=>num(x.r.budget)), used:sum(a,x=>num(x.r.used)), remaining:sum(a,x=>x.c.remaining), income:sum(a,x=>x.c.income), net:sum(a,x=>x.c.net) },
      products:{ n:p.length, qty:sum(p,x=>x.sold), cost:sum(p,x=>x.cogs), other:sum(p,x=>x.other), revenue:sum(p,x=>x.revenue), expense:sum(p,x=>x.expense), profit:sum(p,x=>x.profit) },
    };
    const mv = state.data.moves.filter(m => ym === "all" || String(m.date||"").startsWith(ym));
    const ex = state.data.funds.filter(f => ym === "all" || String(f.date||"").startsWith(ym));
    T.external = {n: ex.length, amt: ex.reduce((a,f) => a + num(f.amount), 0)};
    T.moves = {n: mv.length, in: mv.filter(m => m.dir !== "เงินออก").reduce((a,m) => a + num(m.amount), 0), out: mv.filter(m => m.dir === "เงินออก").reduce((a,m) => a + num(m.amount), 0)};
    T.income = T.juice.revenue + T.activities.income + T.products.revenue + T.moves.in;
    T.expense = T.juice.cost + T.juice.other + T.activities.used + T.products.expense + T.moves.out;
    T.net = T.income - T.expense;
    return T;
  }

  // ================= render =================
  const tile = (k,v,cls="",h="") => `<div class="tile"><div class="k">${k}</div><div class="v ${cls}">${v}</div>${h?`<div class="h">${h}</div>`:""}</div>`;
  const period = () => state.month === "all" ? "ทุกเดือน" : monthLabel(state.month);
  const addBtn = (mod, label="เพิ่มรายการ") => `<button class="btn primary" data-add="${mod}" ${canWrite?"":"disabled"}>${I("plus")}${label}</button>`;
  const rowAct = (mod, id) => canWrite ? `<button class="btn line sm" data-edit="${mod}" data-id="${esc(id)}">แก้ไข</button>` : "";
  const big = (k, v, cls="", h="", hl=false) => `<div class="big ${hl ? "hl" : ""}"><div class="k">${k}</div><div class="v ${cls}">${v}</div>${h ? `<div class="h">${h}</div>` : ""}</div>`;
  const dayAct = (mod, day, pname="") => day.items.length === 1 ? rowAct(mod, day.items[0].id)
    : `<button class="btn line sm" data-day="${mod}" data-date="${esc(day.date)}" data-pname="${esc(pname)}">${day.items.length} รายการ</button>`;
  const emptyRow = (cols, msg) => `<tr><td colspan="${cols}" class="empty">${state.loaded ? msg : "กำลังโหลดข้อมูล…"}</td></tr>`;

  function render(){
    renderChrome();
    const v = $("#view");
    if(state.route === "home") v.innerHTML = vHome();
    else if(state.route === "ekonomi"){
      const t = state.tab.ekonomi;
      v.innerHTML = t === "overview" ? vOverview() : t === "juice" ? vJuice() : t === "activities" ? vActivities() : t === "staffdebt" ? vDebts() : t === "kas" ? vKas() : t === "funds" ? vFunds() : vProducts();
    } else {
      const t = state.tab.setia;
      v.innerHTML = t === "staff" ? vStaffNew() : t === "fin" ? vFinNew() : t === "items" ? vItems() : vSetiaMenu();
    }
  }

  function vHome(){
    const T = totals(curYM), A = totals("all");
    const pen = Object.values(attStats()).filter(x => x.absent >= PENALTY_AT).length, buy = toBuy().length;
    const ld = v => state.loaded ? v : "…";
    return `<div class="hero"><div class="logo"></div><div><h2>HASMI</h2><p>Himpunan Anak Siswa Siswi Membantu Masyarakat Islam</p></div></div>
    <div class="portals">
      <button class="portal" data-nav="ekonomi">
        <div class="ic">${I("wallet")}</div>
        <h3>Bendahara</h3><div class="d">การเงินและบัญชีชมรม · น้ำส้ม กิจกรรม สินค้า</div>
        <div class="stats"><div>สุทธิเดือนนี้<b class="${sc(T.net)}">${ld(baht(T.net))}</b></div><div>ยอดสะสม<b class="${sc(A.net)}">${ld(baht(A.net))}</b></div></div>
        <span class="go">เข้าสู่ ${I("arrow")}</span>
      </button>
      <button class="portal" data-nav="setia">
        <div class="ic">${I("book")}</div>
        <h3>Setia</h3><div class="d">สตาฟ · รายรับ-รายจ่าย · ของส่วนกลาง</div>
        <div class="stats"><div>สตาฟถึงเกณฑ์ลงโทษ<b class="${pen ? "neg" : ""}">${ld(pen + " คน")}</b></div><div>ของที่ต้องซื้อ<b class="${buy ? "neg" : ""}">${ld(buy + " อย่าง")}</b></div></div>
        <span class="go">เข้าสู่ ${I("arrow")}</span>
      </button>
    </div>`;
  }

  // ---------- Bendahara ----------
  // ---------- เงินชมรม (ยอดตั้งต้น + การเปลี่ยนแปลง คำนวณจากทุกรายการ → ลบรายการ เงินก็กลับมาเอง) ----------
  const moveAmt = m => (m.dir === "เงินออก" ? -1 : 1) * num(m.amount);
  function balances(){
    const W = state.data.wallets;
    const start = W.map(w => w.asOf).filter(Boolean).sort()[0] || "";
    const after = d => !start || String(d||"") >= start;
    const B = {start, hasClub: W.length > 0, open: W.reduce((a,w) => a + num(w.opening), 0)};
    B.juice = state.data.juice.filter(r => after(r.date)).reduce((a,r) => { const c = MODULES.juice.calc(r); return a + c.revenue - c.totalCost - num(r.otherExp); }, 0);
    B.products = state.data.products.reduce((a,r) => { const st = prodStatus(r);
      return a + (after(r.date) ? -st.capital : 0) + salesOf(r).filter(x => after(x.date)).reduce((b,x) => b + x.qty*num(r.price), 0); }, 0);
    B.activities = state.data.activities.filter(r => after(r.date)).reduce((a,r) => { const c = MODULES.activities.calc(r); return a + c.income - num(r.used); }, 0);
    // เงินบริจาค: แยกจากเงินชมรมเด็ดขาด (ไม่นับรวม)
    B.moves = state.data.moves.filter(m => after(m.date)).reduce((a,m) => a + moveAmt(m), 0);
    B.club = B.open + B.juice + B.products + B.activities + B.moves;
    B.donIn = state.data.funds.reduce((a,f) => a + num(f.amount), 0);
    B.donOut = state.data.fspend.reduce((a,f) => a + num(f.amount), 0);
    B.donLeft = B.donIn - B.donOut;
    B.stock = state.data.products.reduce((a,r) => { const st = prodStatus(r); return a + Math.max(0, st.left) * st.unit; }, 0);
    B.owed = state.data.staffdebt.filter(d => !d.repaid).reduce((a,d) => a + num(d.amount), 0);
    return B;
  }
  const sgn = n => (n > 0 ? "+" : "") + fmt(n);
  function balanceCards(){
    const B = balances();
    if(!B.hasClub) return `<div class="startcard"><div><b>เริ่มต้น: ใส่เงินที่ชมรมมีตอนนี้</b><div class="meta">บัญชีธนาคาร และเงินสด เพื่อให้ยอดเงินชมรมอัปเดตอัตโนมัติทุกครั้งที่บันทึก</div></div>
      ${canWrite ? `<button class="btn primary" data-add="wallets">${I("plus")}ใส่ยอดเงินตั้งต้น</button>` : ""}</div>`;
    const line = (k, v, tab) => `<tr ${tab ? `data-tabgo="${tab}" style="cursor:pointer"` : ""}><td>${k}</td><td class="n ${sc(v)}">${sgn(v)}</td></tr>`;
    return `<div class="two"><div class="card"><div class="hd"><h3>${I("wallet")}เงินชมรมตอนนี้</h3><span class="meta">${B.start ? "นับตั้งแต่ " + thDate(B.start) + " · อัปเดตทุกครั้งที่บันทึก/ลบ" : ""}</span></div>
        <table class="bal"><tbody>
          <tr data-tabgo="kas" style="cursor:pointer"><td>ยอดตั้งต้น (บัญชี + เงินสด)</td><td class="n">${fmt(B.open)}</td></tr>
          ${line("น้ำส้ม", B.juice, "juice")}${line("สินค้า (ขายได้ − ทุนที่จ่ายไป)", B.products, "products")}${line("กิจกรรม", B.activities, "activities")}
          ${B.moves ? line("เงินเข้า-ออกอื่นๆ", B.moves, "kas") : ""}
          <tr class="tot"><td>คงเหลือ</td><td class="n ${sc(B.club)}">${baht(B.club)}</td></tr></tbody></table>
        ${B.stock > 0 || B.owed > 0 ? `<div class="bd meta">${B.stock > 0 ? `มีทุนอยู่ในสินค้าที่ยังไม่ขาย ${baht(B.stock)}` : ""}${B.stock > 0 && B.owed > 0 ? " · " : ""}${B.owed > 0 ? `ยังต้องโอนคืนสต้าฟ ${baht(B.owed)}` : ""}</div>` : ""}</div>${donationCard()}</div>`;
  }
  function donationPools(){
    const by = {};
    for(const f of state.data.funds){ const k = String(f.purpose||"").trim() || "(ไม่ระบุ)"; const x = by[k] ??= {name:k, in:0, out:0, donors:new Set()}; x.in += num(f.amount); if(f.donor) x.donors.add(String(f.donor).trim()); }
    for(const f of state.data.fspend){ const k = String(f.purpose||"").trim() || "(ไม่ระบุ)"; const x = by[k] ??= {name:k, in:0, out:0, donors:new Set()}; x.out += num(f.amount); }
    return Object.values(by).map(x => ({...x, left: x.in - x.out})).sort((a,b) => b.left - a.left);
  }
  function donationCard(){
    const B = balances(), P = donationPools();
    return `<div class="card"><div class="hd"><h3>${I("gift")}เงินบริจาค</h3><span class="meta">แยกจากเงินชมรม · ใช้ตามเจตนาผู้บริจาค</span></div>
      ${P.length ? `<table class="bal"><tbody>${P.map(x => `<tr data-tabgo="funds" style="cursor:pointer"><td>${esc(x.name)}<div class="meta">รับ ${fmt(x.in)} · ใช้ ${fmt(x.out)}</div></td><td class="n ${sc(x.left)}">${fmt(x.left)}</td></tr>`).join("")}
        <tr class="tot"><td>คงเหลือรวม</td><td class="n ${sc(B.donLeft)}">${baht(B.donLeft)}</td></tr></tbody></table>`
      : `<div class="bd meta">ยังไม่มีเงินบริจาค ${canWrite ? `<button class="btn line sm" data-add="funds">${I("plus")}บันทึกเงินบริจาค</button>` : ""}</div>`}</div>`;
  }
  function vFunds(){
    const B = balances(), P = donationPools();
    const inM = f => state.month === "all" || String(f.date||"").startsWith(state.month);
    const rec = state.data.funds.filter(inM).sort((a,b) => (b.date||"").localeCompare(a.date||""));
    const sp = state.data.fspend.filter(inM).sort((a,b) => (b.date||"").localeCompare(a.date||""));
    const sl = r => slipsOf(r).map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("") || `<span class="meta">-</span>`;
    const prow = P.map(x => `<tr><td><b>${esc(x.name)}</b><div class="meta">จาก ${esc([...x.donors].join(", ") || "-")}</div></td><td class="n pos">${fmt(x.in)}</td><td class="n neg">${fmt(x.out)}</td><td class="n ${sc(x.left)}"><b>${fmt(x.left)}</b></td></tr>`).join("");
    const rrows = rec.map(f => `<tr><td>${thDate(f.date)}</td><td class="w"><b>${esc(f.donor)}</b>${f.note ? `<div class="meta">${esc(f.note)}</div>` : ""}</td><td class="w">${esc(f.purpose)}</td><td class="n pos"><b>+${fmt(f.amount)}</b></td><td>${sl(f)}</td><td>${rowAct("funds", f.id)}</td></tr>`).join("");
    const srows = sp.map(f => `<tr><td>${thDate(f.date)}</td><td class="w">${esc(f.purpose)}</td><td class="w"><b>${esc(f.item)}</b>${f.note ? `<div class="meta">${esc(f.note)}</div>` : ""}</td><td class="n neg"><b>−${fmt(f.amount)}</b></td><td>${sl(f)}</td><td>${rowAct("fspend", f.id)}</td></tr>`).join("");
    return `<div class="pagehead"><div><h2 class="page">เงินบริจาค</h2><p class="pagesub">แยกจากเงินชมรมและการค้าขาย · ได้มาจากใคร ให้เพื่ออะไร และใช้ไปกับอะไร</p></div>
      ${canWrite ? `<div class="actions"><button class="btn primary big-btn" data-add="funds" style="background:var(--pos)">${I("plus")}ได้รับเงินบริจาค</button><button class="btn primary big-btn" data-add="fspend" style="background:var(--neg)">${I("minus")}ใช้เงินบริจาค</button></div>` : ""}</div>
    <div class="big3">${big("ได้รับทั้งหมด", baht(B.donIn), "pos")}${big("ใช้ไปแล้ว", baht(B.donOut), "neg")}${big("เงินบริจาคคงเหลือ", baht(B.donLeft), sc(B.donLeft), "ไม่รวมกับเงินชมรม", true)}</div>
    <div class="card"><div class="hd"><h3>แยกตามเจตนาผู้บริจาค</h3><span class="meta">ได้รับ − ใช้ไป = เหลือ</span></div>
      <div class="tablewrap"><table><thead><tr><th>เพื่ออะไร</th><th class="n">ได้รับ</th><th class="n">ใช้ไป</th><th class="n">เหลือ</th></tr></thead><tbody>${prow || emptyRow(4, "ยังไม่มีเงินบริจาค")}</tbody></table></div></div>
    <div class="card"><div class="hd"><h3>ได้รับ <span class="meta">${period()}</span></h3></div>
      <div class="tablewrap"><table><thead><tr><th>วันที่</th><th>จากใคร</th><th>เพื่ออะไร</th><th class="n">จำนวนเงิน</th><th>สลิป</th><th></th></tr></thead><tbody>${rrows || emptyRow(6, "ไม่มีรายการในช่วงนี้")}</tbody></table></div></div>
    <div class="card"><div class="hd"><h3>ใช้ไป <span class="meta">${period()}</span></h3></div>
      <div class="tablewrap"><table><thead><tr><th>วันที่</th><th>เงินก้อน</th><th>ใช้ทำอะไร</th><th class="n">จำนวนเงิน</th><th>สลิป</th><th></th></tr></thead><tbody>${srows || emptyRow(6, "ไม่มีรายการในช่วงนี้")}</tbody></table></div></div>`;
  }
  function vKas(){
    const B = balances(), W = state.data.wallets.slice().sort((a,b) => (a.kind === "เงินสด") - (b.kind === "เงินสด"));
    const kt = k => `<span class="tag ${k === "เงินสด" ? "g" : ""}">${esc(k || "-")}</span>`;
    const wrows = W.map(w => `<tr><td><b>${esc(w.name)}</b>${w.note ? `<div class="meta">${esc(w.note)}</div>` : ""}</td><td>${kt(w.kind)}</td><td class="n">${fmt(w.opening)}</td><td>${thDate(w.asOf)}</td><td>${rowAct("wallets", w.id)}</td></tr>`).join("");
    const mv = state.data.moves.filter(m => state.month === "all" || String(m.date||"").startsWith(state.month)).sort((a,b) => (b.date||"").localeCompare(a.date||""));
    const mrows = mv.map(m => { const v = moveAmt(m), sl = slipsOf(m); return `<tr><td>${thDate(m.date)}</td><td class="w">${esc(m.item)}${m.note ? `<div class="meta">${esc(m.note)}</div>` : ""}</td><td>${esc(m.wallet) || "-"}</td>
      <td class="n ${sc(v)}"><b>${sgn(v)}</b></td><td>${sl.map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("")}</td><td>${rowAct("moves", m.id)}</td></tr>`; }).join("");
    return `<div class="pagehead"><div><h2 class="page">เงินชมรม</h2><p class="pagesub">ยอดเงินตั้งต้นของชมรม และเงินเข้า-ออกที่ไม่ใช่น้ำส้ม / สินค้า / กิจกรรม / เงินจากภายนอก</p></div></div>
    <div class="big3">${big("เงินชมรมตอนนี้", baht(B.club), sc(B.club), "อัปเดตทุกครั้งที่บันทึก/ลบ", true)}${big("ยอดตั้งต้น", baht(B.open), "", B.start ? "ณ " + thDate(B.start) : "")}</div>
    <div class="card"><div class="hd"><h3>บัญชี / เงินสด <span class="meta">ยอดตั้งต้น</span></h3>${canWrite ? `<button class="btn primary" data-add="wallets">${I("plus")}เพิ่ม</button>` : ""}</div>
      <div class="tablewrap"><table><thead><tr><th>ชื่อ</th><th>ประเภท</th><th class="n">ยอดตั้งต้น</th><th>ณ วันที่</th><th></th></tr></thead>
      <tbody>${wrows || emptyRow(5, "ยังไม่มี กด “เพิ่ม” เพื่อใส่ยอดเงินที่ชมรมมีตอนนี้")}</tbody>
      ${W.length ? `<tfoot><tr><td colspan="2">รวม</td><td class="n">${fmt(B.open)}</td><td colspan="2"></td></tr></tfoot>` : ""}</table></div></div>
    <div class="card"><div class="hd"><h3>เงินเข้า-ออกอื่นๆ <span class="meta">${period()}</span></h3>${canWrite ? `<button class="btn line" data-add="moves">${I("plus")}บันทึก</button>` : ""}</div>
      <div class="tablewrap"><table><thead><tr><th>วันที่</th><th>รายการ</th><th>บัญชี</th><th class="n">จำนวนเงิน</th><th>สลิป</th><th></th></tr></thead>
      <tbody>${mrows || emptyRow(6, "ไม่มีรายการ (เช่น ซื้ออุปกรณ์ชมรม ค่าใช้จ่ายทั่วไป)")}</tbody></table></div></div>`;
  }

  function vOverview(){
    const T = totals(state.month), A = totals("all");
    const rs = monthRecs("juice");
    const parts = [];
    for(const [lab, list] of [["น้ำส้ม · ฝ่ายชาย", rs.filter(r => sideOf(r) === "ชาย")], ["น้ำส้ม · ฝ่ายหญิง", rs.filter(r => sideOf(r) === "หญิง")], ["น้ำส้ม · ไม่ระบุฝ่าย", rs.filter(r => !sideOf(r))]]){
      if(list.length){ const j = juiceSum(list); parts.push([lab, j.revenue, j.profit, "juice", j.cost + j.other]); }
    }
    productLines(state.month).filter(x => x.name !== "น้ำส้ม").forEach(x => parts.push([x.name, x.revenue, x.profit, "products", x.expense]));
    monthRecs("activities").forEach(r => { const c = MODULES.activities.calc(r); parts.push(["กิจกรรม · " + (r.name || "-"), c.income, c.net, "activities", num(r.used)]); });
    if(T.moves.n) parts.push(["เงินเข้า-ออกอื่นๆ", T.moves.in, T.moves.in - T.moves.out, "kas", T.moves.out]);
    const od = state.data.staffdebt.filter(d => !d.repaid), odT = od.reduce((a,d) => a + num(d.amount), 0);
    const miss = ["juice","activities","products"].reduce((s,m) => s + monthRecs(m).filter(r => needsSlip(m, r)).length, 0);
    const alerts = [odT ? `<span class="alert" data-tabgo="staffdebt">ค้างคืนสต้าฟ ${baht(odT)} (${od.length} รายการ)</span>` : "", miss ? `<span class="alert">ยังไม่แนบสลิป ${miss} รายการ</span>` : ""].join("");
    const months = allMonths().slice().sort();
    const rows = months.map(m => ({m, T: totals(m)})).filter(x => x.T.juice.n + x.T.activities.n + x.T.products.n > 0);
    let cum = 0;
    const hist = rows.map(({m,T}) => { cum += T.net; return `<tr><td>${monthLabel(m)}</td><td class="n">${fmt(T.income)}</td><td class="n">${fmt(T.expense)}</td><td class="n ${sc(T.net)}"><b>${fmt(T.net)}</b></td><td class="n ${sc(cum)}">${fmt(cum)}</td></tr>`; }).reverse().join("");
    return `<div class="pagehead"><div><h2 class="page">ภาพรวม</h2><p class="pagesub">สรุปเงินชมรม และรายรับ-รายจ่าย${period()}</p></div><button class="btn line" data-report="1">${I("doc")}รายงานประจำเดือน</button></div>
    ${balanceCards()}
    <h3 style="font-size:15px;margin:4px 0 10px">${period()}</h3>
    <div class="big3">${big("รายรับ", baht(T.income))}${big("รายจ่าย", baht(T.expense))}${big("กำไร / ขาดทุน", baht(T.net), sc(T.net), "", true)}</div>
    ${alerts ? `<div class="alerts">${alerts}</div>` : ""}
    <div id="reportArea"></div>
    <div class="card"><div class="hd"><h3>เงินเดือนนี้มาจากไหน</h3></div>
      <div class="tablewrap"><table><thead><tr><th>ส่วน</th><th class="n">ทุน (ของที่ขายได้) / ใช้ไป</th><th class="n">เงินที่ได้</th><th class="n">กำไร</th></tr></thead>
      <tbody>${parts.map(([lab, rev, pr, tab, cost]) => `<tr class="click" data-tabgo="${tab}" style="cursor:pointer"><td>${esc(lab)}</td><td class="n neg">${fmt(cost)}</td><td class="n">${fmt(rev)}</td><td class="n ${sc(pr)}"><b>${fmt(pr)}</b></td></tr>`).join("") || emptyRow(4, "ยังไม่มีข้อมูลในเดือนนี้")}</tbody>
      ${parts.length ? `<tfoot><tr><td>รวม</td><td class="n">${fmt(T.expense)}</td><td class="n">${fmt(T.income)}</td><td class="n ${sc(T.net)}">${fmt(T.net)}</td></tr></tfoot>` : ""}</table></div></div>
    ${hist ? `<details class="fold"><summary>ดูย้อนหลังรายเดือน</summary><div class="tablewrap"><table><thead><tr><th>เดือน</th><th class="n">รายรับ</th><th class="n">รายจ่าย</th><th class="n">คงเหลือ</th><th class="n">ยอดสะสม</th></tr></thead><tbody>${hist}</tbody></table></div>
      ${vProductSummary(true)}</details>` : ""}`;
  }
  const SIDES = ["ชาย","หญิง"];
  const sideOf = r => r.side === "หญิง" ? "หญิง" : r.side === "ชาย" ? "ชาย" : "";
  function juiceSum(items){
    return items.reduce((a,r) => { const c = MODULES.juice.calc(r); a.n++; a.cupsIn += num(r.cupsIn); a.cupsSold += num(r.cupsSold); a.broken += num(r.broken); a.returned += c.returned; a.cost += c.totalCost; a.revenue += c.revenue; a.other += num(r.otherExp); a.profit += c.profit; return a; },
      {n:0, cupsIn:0, cupsSold:0, broken:0, returned:0, cost:0, revenue:0, other:0, profit:0});
  }
  function vJuice(){
    const rs = monthRecs("juice"), f = state.juiceSide || "all";
    const M = juiceSum(rs.filter(r => sideOf(r) === "ชาย")), F = juiceSum(rs.filter(r => sideOf(r) === "หญิง")), A = juiceSum(rs);
    const list = rs.filter(r => f === "all" || sideOf(r) === f).slice().reverse();
    const L = juiceSum(list);
    const days = byDay(list).reverse();
    const body = days.map(day => { const d = juiceSum(day.items);
      const sorted = day.items.slice().sort((a,b) => (sideOf(a) === "หญิง") - (sideOf(b) === "หญิง"));
      return `<tr class="dayhead"><td colspan="5">${dayLabel(day.date)}<span class="dsub">${day.items.length} รายการ</span></td><td class="n">${fmt(d.cost + d.other)}</td><td class="n">${fmt(d.revenue)}</td><td class="n ${sc(d.profit)}">${fmt(d.profit)}</td><td colspan="2"></td></tr>` +
      sorted.map(r => { const c = MODULES.juice.calc(r), sd = sideOf(r), sl = slipsOf(r);
      return `<tr><td>${sd ? `<span class="tag ${sd === "หญิง" ? "m" : ""}">${sd}</span>` : `<span class="meta">-</span>`}${r.note ? `<div class="meta" style="white-space:normal;max-width:200px">${esc(r.note)}</div>` : ""}</td>
        <td class="n">${fmt(r.cupsIn)}</td><td class="n">${fmt(r.cupsSold)}</td><td class="n ${num(r.broken) ? "neg" : ""}">${fmt(r.broken)}</td><td class="n">${fmt(c.returned)}</td>
        <td class="n neg">${fmt(c.totalCost + num(r.otherExp))}</td><td class="n"><b>${fmt(c.revenue)}</b></td><td class="n ${sc(c.profit)}">${fmt(c.profit)}</td>
        <td>${sl.length ? sl.map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("") : ""}</td><td>${rowAct("juice", r.id)}</td></tr>`; }).join(""); }).join("");
    const row = (k, g) => `<tr><td>${k}</td><td class="n">${fmt(g(M))}</td><td class="n">${fmt(g(F))}</td><td class="n"><b>${fmt(g(A))}</b></td></tr>`;
    return `<div class="pagehead"><div><h2 class="page">น้ำส้ม</h2><p class="pagesub">${period()}</p></div>${canWrite ? `<button class="btn primary big-btn" data-add="juice">${I("plus")}บันทึกน้ำส้ม</button>` : ""}</div>
    <div class="big3">${big("เงินฝ่ายชาย", baht(M.revenue), "", `ทุน ${baht(M.cost + M.other)} · กำไร ${baht(M.profit)}`)}${big("เงินฝ่ายหญิง", baht(F.revenue), "", `ทุน ${baht(F.cost + F.other)} · กำไร ${baht(F.profit)}`)}${big("ทุนทั้งหมด", baht(A.cost + A.other), "neg", "ต้นทุนแก้วที่ขาย + มีปัญหา + ค่าใช้จ่ายอื่น")}${big("เงินรวมทั้งสองฝ่าย", baht(A.revenue), "", `กำไร ${baht(A.profit)}`, true)}</div>
    <div class="card"><div class="hd"><h3>รายการ</h3><div class="seg">${[["all","ทั้งหมด"],["ชาย","ชาย"],["หญิง","หญิง"]].map(([k,l]) => `<button data-jside="${k}" class="${f===k?"on":""}">${l}</button>`).join("")}</div></div>
      <div class="tablewrap"><table><thead><tr><th>ฝ่าย</th><th class="n">รับมา</th><th class="n">ขายได้</th><th class="n">มีปัญหา</th><th class="n">คืนร้าน</th><th class="n">ทุน</th><th class="n">เงินที่ได้</th><th class="n">กำไร</th><th>สลิป</th><th></th></tr></thead>
      <tbody>${body || emptyRow(10, "ยังไม่มีรายการ กด “บันทึกน้ำส้ม” เพื่อเริ่ม")}</tbody>
      ${list.length ? `<tfoot><tr><td>รวม${f === "all" ? "" : "ฝ่าย" + f}</td><td class="n">${fmt(L.cupsIn)}</td><td class="n">${fmt(L.cupsSold)}</td><td class="n">${fmt(L.broken)}</td><td class="n">${fmt(L.returned)}</td><td class="n">${fmt(L.cost + L.other)}</td><td class="n">${fmt(L.revenue)}</td><td class="n ${sc(L.profit)}">${fmt(L.profit)}</td><td></td><td></td></tr></tfoot>` : ""}</table></div></div>
    ${rs.length ? `<details class="fold"><summary>ดูสรุปแยกฝ่ายแบบละเอียด</summary><div class="tablewrap"><table><thead><tr><th></th><th class="n">ชาย</th><th class="n">หญิง</th><th class="n">รวม</th></tr></thead><tbody>
      ${row("รับมา (แก้ว)", x => x.cupsIn)}${row("ขายได้ (แก้ว)", x => x.cupsSold)}${row("แก้วมีปัญหา", x => x.broken)}${row("คืนร้าน (แก้ว)", x => x.returned)}${row("ต้นทุน", x => x.cost)}${row("ค่าใช้จ่ายอื่น", x => x.other)}${row("เงินที่ได้", x => x.revenue)}${row("กำไร", x => x.profit)}
      </tbody></table></div></details>` : ""}`;
  }

  function vActivities(){
    const T = totals(state.month).activities, rs = monthRecs("activities");
    const cards = rs.slice().reverse().map(r => {
      const c = MODULES.activities.calc(r), sl = slipsOf(r);
      let coll = "";
      if(c.on){
        const due = lines(r.staffDue), paid = new Set(lines(r.staffPaid));
        const cols = staffGroups(due).map(([g, names]) => [g, names.filter(n => due.includes(n))]).filter(([, n]) => n.length);
        const gs2 = g => { const ns = cols.find(([x]) => x === g); const L = ns ? ns[1] : []; const pd = L.filter(n => paid.has(n)).length; return {due: L.length, paid: pd, amt: pd * c.per}; };
        const GM = gs2("ชาย"), GF = gs2("หญิง");
        const gstat = `<div class="gstat"><div>ฝ่ายชาย<b>${GM.paid}/${GM.due} คน · ${baht(GM.amt)}</b></div><div>ฝ่ายหญิง<b>${GF.paid}/${GF.due} คน · ${baht(GF.amt)}</b></div><div class="tot">รวมทั้งสองฝ่าย<b class="pos">${c.paid}/${c.due} คน · ${baht(c.collected)}</b></div></div>`;
        coll = `<div class="collect"><div class="ch"><b>เก็บเงินสต้าฟ คนละ ${baht(c.per)}</b><span>จ่ายแล้ว <b>${c.paid}/${c.due}</b> คน · ได้ <b class="pos">${baht(c.collected)}</b> จาก ${baht(c.expected)}${c.due - c.paid > 0 ? ` · ค้าง <b class="neg">${c.due - c.paid}</b> คน` : ""}</span></div>
          ${gstat}<div class="cols">${cols.map(([g, names]) => `<div><div class="gl">${esc(g)} · จ่ายแล้ว ${names.filter(n => paid.has(n)).length}/${names.length} คน</div><div class="plist">${names.map(n => {
            const i = due.indexOf(n), ok = paid.has(n);
            return canWrite ? `<label class="pill ${ok ? "paid" : "unpaid"}"><input type="checkbox" data-qpaid="${esc(r.id)}" data-i="${i}" ${ok ? "checked" : ""}>${esc(n)}</label>`
                            : `<span class="pill ${ok ? "paid" : "unpaid"}">${esc(n)}</span>`; }).join("")}</div></div>`).join("")}</div></div>`;
      }
      return `<div class="card"><div class="hd"><h3>${esc(r.name) || "(ไม่มีชื่อ)"} <span class="meta">${thDate(r.date)}</span></h3><div class="actions" style="align-items:center">${slipCell("activities",[r])}${rowAct("activities", r.id)}</div></div>
        <div class="bd">
          <div class="tiles" style="margin-bottom:0">${tile("งบที่ตั้งไว้", baht(r.budget))}${tile("ใช้ไป", baht(r.used))}${tile("เงินที่เหลือ", baht(c.remaining), sc(c.remaining))}
            ${tile("รายได้", baht(c.income), "", `สต้าฟ ${fmt(c.staffInc)} · อื่นๆ ${fmt(r.incOther)}${r.incOtherNote ? " (" + esc(r.incOtherNote) + ")" : ""}`)}</div>
          ${coll}
          ${sl.length ? `<div style="margin-top:14px"><div class="meta" style="margin-bottom:6px">สลิปการใช้จ่าย (${sl.length})</div><div class="slipbox">${sl.map(x => thumbHTML(x)).join("")}</div></div>` : ""}</div></div>`;
    }).join("");
    return `<div class="pagehead"><div><h2 class="page">กิจกรรม</h2><p class="pagesub">${period()} · ${T.n} กิจกรรม</p></div>${canWrite ? `<button class="btn primary big-btn" data-add="activities">${I("plus")}เพิ่มกิจกรรม</button>` : ""}</div>
    <div class="big3">${big("ใช้ไป", baht(T.used), "", `จากงบ ${baht(T.budget)}`)}${big("รายได้", baht(T.income))}${big("เงินเหลือจากงบ", baht(T.remaining), sc(T.remaining), "", true)}</div>
    ${cards || `<div class="card empty">${state.loaded ? "ยังไม่มีกิจกรรมในเดือนนี้" : "กำลังโหลดข้อมูล…"}</div>`}`;
  }

  // ---------- ติดเงินสต้าฟ ----------
  function vDebts(){
    const all = state.data.staffdebt, open = all.filter(d => !d.repaid);
    for(const id of [...state.debtSel]) if(!open.some(d => d.id === id)) state.debtSel.delete(id);
    const openTotal = open.reduce((a,d) => a + num(d.amount), 0);
    const people = {}; for(const d of open){ const k = String(d.staff||"(ไม่ระบุ)").trim(); (people[k] ??= []).push(d); }
    const order = Object.keys(people).sort((a,b) => (genderOf(a) === "หญิง") - (genderOf(b) === "หญิง") || a.localeCompare(b, "th"));
    const repaid = all.filter(d => d.repaid && (state.month === "all" || (d.repaidDate||"").startsWith(state.month))).sort((a,b) => (b.repaidDate||"").localeCompare(a.repaidDate||""));
    const sel = open.filter(d => state.debtSel.has(d.id)), selTotal = sel.reduce((a,d) => a + num(d.amount), 0);
    const gtag = n => { const g = genderOf(n); return g ? `<span class="tag ${g === "หญิง" ? "m" : ""}">${g}</span>` : ""; };
    const openRows = order.map(n => {
      const items = people[n].sort((a,b) => (a.date||"").localeCompare(b.date||"")), tot = items.reduce((a,d) => a + num(d.amount), 0);
      const allSel = items.every(d => state.debtSel.has(d.id));
      return `<tr class="grp"><td>${canWrite ? `<input type="checkbox" class="chkbox" data-selstaff="${esc(n)}" ${allSel ? "checked" : ""} aria-label="เลือกทั้งหมดของ ${esc(n)}">` : ""}</td><td colspan="3"><b>${esc(n)}</b> ${gtag(n)} <span class="meta">${items.length} รายการ</span></td><td class="n"><b>${fmt(tot)}</b></td><td colspan="2"></td></tr>` +
        items.map(d => `<tr><td>${canWrite ? `<input type="checkbox" data-sel="${esc(d.id)}" ${state.debtSel.has(d.id) ? "checked" : ""}>` : ""}</td><td>${thDate(d.date)}</td><td class="w">${esc(d.item)}${d.note ? `<div class="meta">${esc(d.note)}</div>` : ""}</td><td>${esc(d.activity)||"-"}</td>
          <td class="n">${fmt(d.amount)}</td><td>${slipCell("staffdebt",[d])}</td><td>${rowAct("staffdebt", d.id)}</td></tr>`).join("");
    }).join("");
    const repRows = repaid.map(d => `<tr><td>${thDate(d.repaidDate)}</td><td><b>${esc(d.staff)}</b> ${gtag(d.staff)}</td><td class="w">${esc(d.item)}</td><td>${esc(d.activity)||"-"}</td><td class="n">${fmt(d.amount)}</td>
      <td>${slipCell("staffdebt",[d])}</td><td>${slipsOf(d,"repaySlips").map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("") || `<span class="meta">-</span>`}</td><td>${rowAct("staffdebt", d.id)}</td></tr>`).join("");
    return `<div class="pagehead"><div><h2 class="page">ติดเงินสต้าฟ</h2><p class="pagesub">สต้าฟออกเงินไปก่อน · ติ้กแล้วบันทึกโอนคืนทีเดียว</p></div>${canWrite ? `<button class="btn primary big-btn" data-add="staffdebt">${I("plus")}สต้าฟออกเงินก่อน</button>` : ""}</div>
    <div class="big3">${big("ชมรมค้างคืน", baht(openTotal), openTotal ? "neg" : "", `${open.length} รายการ · ${order.length} คน`, true)}${big("โอนคืนแล้ว", baht(repaid.reduce((a,d) => a + num(d.amount), 0)), "", period())}</div>
    <div class="card"><div class="hd"><h3>รายการที่ยังไม่ได้คืน</h3><span class="meta">ทุกเดือน</span></div>
      <div class="tablewrap"><table><thead><tr><th style="width:34px"></th><th>วันที่</th><th>ค่าอะไร</th><th>กิจกรรม / เรื่อง</th><th class="n">จำนวนเงิน</th><th>สลิป</th><th></th></tr></thead>
      <tbody>${openRows || emptyRow(7, "ไม่มีรายการค้าง")}</tbody></table></div>
      ${canWrite && open.length ? `<div class="abar"><span>เลือกแล้ว <b>${sel.length}</b> รายการ · <b>${baht(selTotal)}</b></span><div class="actions"><button class="btn line" data-selclear ${sel.length ? "" : "disabled"}>ล้างที่เลือก</button><button class="btn primary" data-repay ${sel.length ? "" : "disabled"}>${I("check")}บันทึกว่าโอนคืนแล้ว</button></div></div>` : ""}
    </div>
    <details class="fold"><summary>ประวัติโอนคืน · ${period()} (${repaid.length})</summary>
      <div class="tablewrap"><table><thead><tr><th>วันที่โอนคืน</th><th>สต้าฟ</th><th>ค่าอะไร</th><th>กิจกรรม / เรื่อง</th><th class="n">จำนวนเงิน</th><th>ใบเสร็จ</th><th>สลิปโอนคืน</th><th></th></tr></thead>
      <tbody>${repRows || emptyRow(8, "ยังไม่มีการโอนคืนในช่วงนี้")}</tbody></table></div></details>`;
  }
  function openRepay(){
    const items = state.data.staffdebt.filter(d => !d.repaid && state.debtSel.has(d.id));
    if(!items.length) return;
    editing = {mod:"__repay", ids: items.map(d => d.id), slipsMap:{repay:[]}, uploading:0};
    const by = {}; items.forEach(d => { const k = String(d.staff||"(ไม่ระบุ)").trim(); by[k] = (by[k]||0) + num(d.amount); });
    const total = items.reduce((a,d) => a + num(d.amount), 0);
    showModal("บันทึกการโอนคืนสต้าฟ", `<form novalidate autocomplete="off"><div class="mb">
      <div class="tablewrap" style="border:1px solid var(--line);border-radius:6px;margin-bottom:14px"><table><thead><tr><th>สต้าฟ</th><th class="n">ยอดโอนคืน</th></tr></thead><tbody>
        ${Object.entries(by).map(([n,v]) => `<tr><td>${esc(n)}</td><td class="n">${fmt(v)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td>รวม ${items.length} รายการ</td><td class="n">${fmt(total)}</td></tr></tfoot></table></div>
      <div class="grid"><div class="f"><label for="f_rdate">วันที่โอนคืน *</label><input id="f_rdate" type="date" value="${todayISO()}"></div><div></div>
      ${slipFieldHTML("repay", "สลิปโอนคืน")}</div></div>
      <div class="mf"><span class="err" id="mErr"></span><div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">ยืนยันโอนคืน</button></div></div></form>`);
  }
  async function submitRepay(){
    if(editing.uploading){ $("#mErr").textContent = "รออัปโหลดสลิปให้เสร็จก่อน"; return; }
    const date = $("#f_rdate").value; if(!date){ $("#mErr").textContent = "กรุณาใส่วันที่โอนคืน"; return; }
    const newSlips = editing.slipsMap.repay.map(s => ({url:s.url, id:s.id}));
    const items = editing.ids.map(id => state.data.staffdebt.find(d => d.id === id)).filter(Boolean)
      .map(d => ({id: d.id, rec: {...recBody(d), repaid: true, repaidDate: date, repaySlips: [...slipsOf(d, "repaySlips"), ...newSlips]}}));
    $("#mSave").disabled = true; $("#mSave").textContent = "กำลังบันทึก…";
    try{ applyServer(await gs("saveRecords", "staffdebt", items)); state.debtSel.clear(); closeModal(); render(); toast(`บันทึกโอนคืน ${items.length} รายการแล้ว`); }
    catch(err){ $("#mSave").disabled = false; $("#mSave").textContent = "ยืนยันโอนคืน"; $("#mErr").textContent = errMsg(err); }
  }

  function productTable(name, items){
    const rows = items.slice().sort((a,b) => num(b.round) - num(a.round) || (b.date||"").localeCompare(a.date||"")).map(r => {
      const st = prodStatus(r), pin = prodIn(r, state.month), pct = st.ordered ? Math.min(100, st.sold / st.ordered * 100) : 0, sl = slipsOf(r);
      return `<tr class="rnd"><td><b>${r.round ? "รอบที่ " + fmt(r.round) : "รอบ"}</b><div class="meta">สั่ง ${thDate(r.date)}${r.shop ? " · " + esc(r.shop) : ""}</div></td>
        <td style="min-width:130px"><b>${fmt(st.sold)}</b> / ${fmt(st.ordered)} อัน<div class="prog"><i style="width:${pct}%"></i></div></td>
        <td class="n ${st.left > 0 ? "" : "meta"}">${st.left > 0 ? fmt(st.left) : "หมดแล้ว"}</td>
        <td class="n">${fmt(st.capital)}<div class="meta">${fmt(st.unit)}/อัน</div></td>
        <td class="n">${fmt(st.revenue)}<div class="meta">${fmt(r.price)}/อัน</div></td>
        <td class="n ${sc(st.profitNow)}"><b>${fmt(st.profitNow)}</b>${state.month !== "all" && pin.sold !== st.sold ? `<div class="meta">เดือนนี้ ${fmt(pin.profit)}</div>` : ""}</td>
        <td class="n meta">${fmt(st.profitFull)}</td>
        <td>${sl.map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("")}</td>
        <td><div class="actions">${canWrite && r.batch && st.left > 0 ? `<button class="btn primary sm" data-sell="${esc(r.id)}">${I("plus")}ขายเพิ่ม</button>` : ""}${rowAct("products", r.id)}</div></td></tr>`;
    }).join("");
    const t = items.reduce((a,r) => { const st = prodStatus(r); a.sold += st.sold; a.left += Math.max(0, st.left); a.p += st.profitNow; a.cap += st.capital; return a; }, {sold:0, left:0, p:0, cap:0});
    return `<div class="card"><div class="hd"><h3>${esc(name)} <span class="meta">ทุนทั้งหมด ${baht(t.cap)} · ขายแล้ว ${fmt(t.sold)} อัน · เหลือ ${fmt(t.left)} อัน · กำไร ${baht(t.p)}</span></h3>
      ${canWrite ? `<button class="btn line sm" data-add="products" data-pname="${esc(name)}">${I("plus")}สั่งรอบใหม่</button>` : ""}</div>
      <div class="tablewrap"><table><thead><tr><th>รอบ</th><th>ขายแล้ว</th><th class="n">เหลือ</th><th class="n">ทุนทั้งหมด</th><th class="n">เงินที่ได้</th><th class="n">กำไรตอนนี้</th><th class="n">ถ้าขายหมด</th><th>สลิป</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>`;
  }

  function vProducts(){
    const T = totals(state.month).products, A = totals("all").products;
    const relevant = state.data.products.filter(r => { const st = prodStatus(r), pin = prodIn(r, state.month); return st.left > 0 || pin.sold || pin.other || state.month === "all" || String(r.date||"").startsWith(state.month); });
    const groups = {};
    for(const r of relevant){ const k = String(r.name||"(ไม่มีชื่อ)").trim(); (groups[k] ??= []).push(r); }
    const names = Object.keys(groups).sort((a,b) => a.localeCompare(b, "th"));
    const stock = state.data.products.reduce((a,r) => { const st = prodStatus(r); return a + Math.max(0, st.left) * st.unit; }, 0);
    const capP = relevant.reduce((a,r) => a + prodStatus(r).capital, 0);
    return `<div class="pagehead"><div><h2 class="page">สินค้าอื่นๆ</h2><p class="pagesub">${period()} · กด “ขายเพิ่ม” ทุกครั้งที่ขายได้ ระบบบวกจำนวนและกำไรให้เอง</p></div>${canWrite ? `<button class="btn primary big-btn" data-add="products">${I("plus")}สั่งสินค้ารอบใหม่</button>` : ""}</div>
    <div class="big3">${big("ทุนทั้งหมด", baht(capP), "neg", "ทุกรอบที่แสดงด้านล่าง")}${big("เงินที่ได้", baht(T.revenue), "", `ขายได้ ${fmt(T.qty)} อัน`)}${big("กำไร", baht(T.profit), sc(T.profit), "ตามจำนวนที่ขายได้")}${big("กำไรรวมทั้งหมด", baht(A.profit), sc(A.profit), stock > 0 ? `ทุนในของที่ยังไม่ขาย ${baht(stock)}` : "", true)}</div>
    ${names.map(n => productTable(n, groups[n])).join("") || `<div class="card empty">${state.loaded ? "ยังไม่มีสินค้า กด “สั่งสินค้ารอบใหม่” เพื่อเริ่ม" : "กำลังโหลดข้อมูล…"}</div>`}`;
  }

  // ---------- ขายเพิ่ม ----------
  function openSell(id){
    const r = state.data.products.find(x => x.id === id); if(!r) return;
    const st = prodStatus(r);
    editing = {mod:"__sell", id};
    showModal(`ขาย${esc(r.name)}${r.round ? " · รอบที่ " + fmt(r.round) : ""}`, `<form novalidate autocomplete="off"><div class="mb">
      <div class="kv"><div><span>ทุนทั้งหมด</span>${baht(st.capital)}</div><div><span>สั่งมา</span>${fmt(st.ordered)} อัน</div><div><span>ขายแล้ว</span>${fmt(st.sold)} อัน</div><div><span>เหลือ</span><b>${fmt(st.left)} อัน</b></div><div><span>กำไรตอนนี้</span>${baht(st.profitNow)}</div></div>
      <div class="grid"><div class="f"><label for="f_sqty">ขายได้เพิ่มกี่อัน *</label><input id="f_sqty" autocomplete="off" type="number" inputmode="numeric" min="1" step="1" max="${Math.max(0, st.left)}"></div>
        <div class="f"><label for="f_sdate">วันที่ขาย</label><input id="f_sdate" type="date" value="${todayISO()}"></div>
        <div class="calc" id="sellCalc"></div></div></div>
      <div class="mf"><span class="err" id="mErr"></span><div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">บันทึกการขาย</button></div></div></form>`);
    updateSellCalc(); $("#f_sqty").focus();
  }
  function updateSellCalc(){
    if(!editing || editing.mod !== "__sell" || !$("#sellCalc")) return;
    const r = state.data.products.find(x => x.id === editing.id); if(!r) return;
    const st = prodStatus(r), q = num($("#f_sqty").value), per = num(r.price) - st.unit;
    $("#sellCalc").innerHTML = [["ขายแล้วรวม", `${fmt(st.sold + q)} / ${fmt(st.ordered)} อัน`], ["เหลือ", fmt(st.left - q) + " อัน", st.left - q < 0 ? "neg" : ""], ["กำไรเพิ่ม", "+" + baht(q*per), "pos"], ["กำไรรวมตอนนี้", baht(st.profitNow + q*per), sc(st.profitNow + q*per)]]
      .map(([k,v,c]) => `<div>${k}<b class="${c||""}">${v}</b></div>`).join("");
  }
  async function submitSell(){
    const r = state.data.products.find(x => x.id === editing.id); if(!r) return;
    const st = prodStatus(r), q = num($("#f_sqty").value), d = $("#f_sdate").value;
    if(!(q > 0)){ $("#mErr").textContent = "กรุณากรอกจำนวนที่ขายได้"; return; }
    if(q > st.left){ $("#mErr").textContent = `เกินจำนวนที่เหลือ (${fmt(st.left)} อัน)`; return; }
    if(!d){ $("#mErr").textContent = "กรุณาใส่วันที่ขาย"; return; }
    $("#mSave").disabled = true; $("#mSave").textContent = "กำลังบันทึก…";
    try{ applyServer(await gs("saveRecord", "products", {...recBody(r), batch: true, sales: [...salesOf(r), {date: d, qty: q}]}, r.id)); closeModal(); render(); toast(`บันทึกขาย ${fmt(q)} อันแล้ว`); }
    catch(err){ $("#mSave").disabled = false; $("#mSave").textContent = "บันทึกการขาย"; $("#mErr").textContent = errMsg(err); }
  }

  // ---------- product summary (monthly) ----------
  function productLines(ym){
    const out = [], J = totals(ym).juice;
    if(J.n) out.push({name:"น้ำส้ม", unit:"แก้ว", qty:J.cupsSold, revenue:J.revenue, expense:J.cost + J.other, profit:J.profit, days:byDay(monthRecs("juice", ym)).length});
    const by = {};
    for(const r of state.data.products){
      const c = prodIn(r, ym); if(!c.sold && !c.other) continue;
      const k = String(r.name||"(ไม่มีชื่อ)").trim();
      const x = by[k] ??= {name:k, unit:"อัน", qty:0, revenue:0, expense:0, profit:0, dates:new Set()};
      x.qty += c.sold; x.revenue += c.revenue; x.expense += c.expense; x.profit += c.profit; c.dates.forEach(d => x.dates.add(d));
    }
    return out.concat(Object.values(by).map(x => ({...x, days:x.dates.size})).sort((a,b) => b.profit - a.profit));
  }
  function vProductSummary(embedded){
    const L = productLines(state.month);
    const tot = L.reduce((a,x) => ({revenue:a.revenue+x.revenue, expense:a.expense+x.expense, profit:a.profit+x.profit}), {revenue:0,expense:0,profit:0});
    const rows = L.map(x => `<tr><td><b>${esc(x.name)}</b></td><td class="n">${x.days}</td><td class="n">${fmt(x.qty)} ${x.unit}</td><td class="n">${fmt(x.revenue)}</td><td class="n">${fmt(x.expense)}</td>
      <td class="n ${sc(x.profit)}"><b>${fmt(x.profit)}</b></td><td class="n">${tot.profit > 0 && x.profit > 0 ? fmt(x.profit / tot.profit * 100) + "%" : "-"}</td></tr>`).join("");
    // matrix: product x month (profit)
    const months = allMonths().slice().sort();
    const names = new Set(); const cell = {};
    for(const m of months) for(const x of productLines(m)){ names.add(x.name); cell[x.name + "|" + m] = x.profit; }
    const activeMonths = months.filter(m => [...names].some(n => cell[n + "|" + m] !== undefined));
    const order = ["น้ำส้ม", ...[...names].filter(n => n !== "น้ำส้ม").sort((a,b) => a.localeCompare(b, "th"))].filter(n => names.has(n));
    const short = m => { const [y,mm] = m.split("-"); return TH_MS[+mm-1] + " " + String(+y+543).slice(2); };
    const mrows = order.map(n => { let t = 0; const tds = activeMonths.map(m => { const v = cell[n + "|" + m]; if(v === undefined) return `<td class="n meta">–</td>`; t += v; return `<td class="n ${sc(v)}">${fmt(v)}</td>`; }).join("");
      return `<tr><td><b>${esc(n)}</b></td>${tds}<td class="n ${sc(t)}"><b>${fmt(t)}</b></td></tr>`; }).join("");
    const colTot = activeMonths.map(m => { const v = order.reduce((a,n) => a + (cell[n + "|" + m] || 0), 0); return `<td class="n ${sc(v)}">${fmt(v)}</td>`; }).join("");
    const grand = order.reduce((a,n) => a + activeMonths.reduce((b,m) => b + (cell[n + "|" + m] || 0), 0), 0);
    if(embedded) return mrows ? `<div class="bd" style="border-top:1px solid var(--line);font-weight:600">กำไรแยกสินค้า รายเดือน</div><div class="tablewrap"><table><thead><tr><th>สินค้า</th>${activeMonths.map(m => `<th class="n">${short(m)}</th>`).join("")}<th class="n">รวม</th></tr></thead>
      <tbody>${mrows}</tbody><tfoot><tr><td>รวมทุกสินค้า</td>${colTot}<td class="n ${sc(grand)}">${fmt(grand)}</td></tr></tfoot></table></div>` : "";
    return `<div class="card"><div class="hd"><h3>${I("box")}สรุปสินค้าทั้งหมด <span class="meta">${period()}</span></h3></div>
      <div class="tablewrap"><table><thead><tr><th>สินค้า</th><th class="n">วันที่ขาย</th><th class="n">จำนวนขาย</th><th class="n">ยอดขาย</th><th class="n">ต้นทุน + รายจ่าย</th><th class="n">กำไร</th><th class="n">สัดส่วนกำไร</th></tr></thead>
      <tbody>${rows || emptyRow(7, "ยังไม่มีการขายสินค้าในช่วงนี้")}</tbody>
      ${L.length ? `<tfoot><tr><td colspan="3">รวม</td><td class="n">${fmt(tot.revenue)}</td><td class="n">${fmt(tot.expense)}</td><td class="n ${sc(tot.profit)}">${fmt(tot.profit)}</td><td></td></tr></tfoot>` : ""}</table></div></div>
    ${mrows ? `<div class="card"><div class="hd"><h3>${I("chart")}กำไรสินค้ารายเดือน <span class="meta">อัปเดตทุกเดือนอัตโนมัติ</span></h3></div>
      <div class="tablewrap"><table><thead><tr><th>สินค้า</th>${activeMonths.map(m => `<th class="n">${short(m)}</th>`).join("")}<th class="n">รวม</th></tr></thead>
      <tbody>${mrows}</tbody><tfoot><tr><td>รวมทุกสินค้า</td>${colTot}<td class="n ${sc(grand)}">${fmt(grand)}</td></tr></tfoot></table></div></div>` : ""}`;
  }

  function buildReport(ym){
    const T = totals(ym), name = ym === "all" ? "ทุกเดือน" : "เดือน" + monthLabel(ym);
    const acts = monthRecs("activities", ym).map(r => { const c = MODULES.activities.calc(r); return `  - ${r.name} (${thDate(r.date)}) งบ ${fmt(r.budget)} ใช้ ${fmt(r.used)} เหลือ ${fmt(c.remaining)} | รายได้ ${fmt(c.income)}${c.on ? ` | เก็บสต้าฟคนละ ${fmt(c.per)} จ่ายแล้ว ${c.paid}/${c.due} คน` : ""}`; }).join("\n");
    const prodLines = productLines(ym).map(x => `  - ${x.name}: ขาย ${fmt(x.qty)} ${x.unit} (${x.days} วัน) · ยอดขาย ${fmt(x.revenue)} · ต้นทุน ${fmt(x.expense)} · กำไร ${fmt(x.profit)}`).join("\n");
    const miss = ["juice","activities","products"].reduce((s,m) => s + monthRecs(m, ym).filter(r => needsSlip(m, r)).length, 0);
    const od = state.data.staffdebt.filter(d => !d.repaid), odT = od.reduce((a,d) => a + num(d.amount), 0);
    const B = balances();
    return `HASMI — รายงานการเงิน ${name}
${B.hasClub ? `เงินชมรมตอนนี้ ${fmt(B.club)} บาท` : ""}${B.donIn ? `\nเงินบริจาค (แยก) คงเหลือ ${fmt(B.donLeft)} บาท` : ""}

[สรุปสินค้าทั้งหมด]
${prodLines || "  - ไม่มีการขาย"}
${(() => { const rs = monthRecs("juice", ym); if(!rs.length) return "  (น้ำส้มไม่มีรายการ)"; const m = juiceSum(rs.filter(r => sideOf(r) === "ชาย")), f = juiceSum(rs.filter(r => sideOf(r) === "หญิง")), a = juiceSum(rs);
  return `  น้ำส้มแยกฝ่าย: ชาย เงิน ${fmt(m.revenue)} กำไร ${fmt(m.profit)} | หญิง เงิน ${fmt(f.revenue)} กำไร ${fmt(f.profit)} | รวม เงิน ${fmt(a.revenue)} กำไร ${fmt(a.profit)}\n  น้ำส้มรับมา ${fmt(a.cupsIn)} · ขายได้ ${fmt(a.cupsSold)} · มีปัญหา ${fmt(a.broken)} · คืนร้าน ${fmt(a.returned)} แก้ว`; })()}
  รวมกำไรจากสินค้า ${fmt(T.juice.profit + T.products.profit)} บาท

[กิจกรรม] ${T.activities.n} รายการ
  งบ ${fmt(T.activities.budget)} · ใช้ ${fmt(T.activities.used)} · เหลือ ${fmt(T.activities.remaining)} · รายได้ ${fmt(T.activities.income)}
${acts || "  - ไม่มีกิจกรรม"}

สรุป: รายรับ ${fmt(T.income)} · รายจ่าย ${fmt(T.expense)} · คงเหลือสุทธิ ${fmt(T.net)} บาท${odT ? `\nค้างคืนสต้าฟ ${fmt(odT)} บาท (${od.length} รายการ)` : ""}${miss ? `\nหมายเหตุ: ยังไม่แนบสลิป ${miss} รายการ` : ""}`;
  }

  // ---------- Setia (old notes view removed) ----------
  function openDay(mod, date, pname){
    const items = state.data[mod].filter(r => (r.date||"") === date && (mod === "products" ? String(r.name||"(ไม่มีชื่อ)").trim() === pname : mod === "juice" && pname ? (sideOf(r) || "-") === pname : true))
      .sort((a,b) => String(a.createdAt||"").localeCompare(String(b.createdAt||"")));
    const body = items.map((r, i) => {
      const c = MODULES[mod].calc(r), sl = slipsOf(r);
      const kv = mod === "juice"
        ? [["ฝ่าย", sideOf(r) || "-"],["รับมา", fmt(r.cupsIn)+" แก้ว"],["ขายได้", fmt(r.cupsSold)+" แก้ว"],["แก้วมีปัญหา", fmt(r.broken)+" แก้ว"],["คืนร้าน", fmt(c.returned)+" แก้ว"],["ต้นทุน/แก้ว", fmt(r.costPerCup)],["ต้นทุน", fmt(c.totalCost)],["ราคา/แก้ว", fmt(r.pricePerCup)],["ค่าใช้จ่ายอื่น", fmt(r.otherExp)],["กำไร", baht(c.profit)]]
        : [["รอบที่", r.round ? fmt(r.round) : "-"],["ร้าน", esc(r.shop)||"-"],["จำนวน", fmt(r.qty)+" อัน"],["ต้นทุนรวม", fmt(c.cost)],["ราคา/ชิ้น", fmt(r.price)],["รายจ่ายอื่น", fmt(r.otherExp)],["กำไร", baht(c.profit)]];
      return `<div class="entry"><div class="eh"><b>รายการที่ ${i+1}</b>${rowAct(mod, r.id)}</div>
        <div class="kv">${kv.map(([k,v]) => `<div><span>${k}</span>${v}</div>`).join("")}</div>
        ${r.note ? `<div class="meta" style="margin-bottom:8px">${esc(r.note)}</div>` : ""}
        ${sl.length ? `<div class="slipbox">${sl.map(x => thumbHTML(x)).join("")}</div>` : needsSlip(mod, r) ? `<span class="tag y">ไม่มีสลิป</span>` : ""}</div>`;
    }).join("");
    showModal(`${mod === "juice" ? "น้ำส้ม" + (pname && pname !== "-" ? " ฝ่าย" + esc(pname) : "") : esc(pname)} · ${thDate(date)}`, `<div class="mb">${body || '<div class="empty">ไม่มีรายการ</div>'}</div>
      <div class="mf"><span class="meta">${items.length} รายการในวันนี้</span>${canWrite ? `<button class="btn primary" data-add="${mod}" ${mod === "juice" ? `data-pside="${esc(pname === "-" ? "" : pname)}"` : `data-pname="${esc(pname)}"`} data-pdate="${esc(date)}">${I("plus")}เพิ่มอีกรายการ</button>` : ""}</div>`);
  }
  function openBulkStaff(){
    editing = {mod:"__bulkstaff"};
    showModal("วางรายชื่อสตาฟหลายคน", `<form novalidate autocomplete="off"><div class="mb"><div class="grid">
      <div class="f"><label for="f_bgender">เพศ</label><select id="f_bgender"><option>ชาย</option><option>หญิง</option></select></div><div></div>
      <div class="f full"><label for="f_bnames">รายชื่อ</label><textarea id="f_bnames" class="long" placeholder="1 คนต่อ 1 บรรทัด: ชื่อ-สกุล, ชั้นสามัญ, ชั้นศาสนา&#10;เช่น  อิลฮาม ซอเร, -, 8/2&#10;หรือคัดลอกคอลัมน์ เลขประจำตัว ถึง ชั้นศาสนา จากชีตมาวางได้เลย"></textarea>
        <span class="hint">1 คนต่อ 1 บรรทัด · ใส่ทีละเพศ · ชื่อที่มีอยู่แล้วจะถูกข้าม · คัดลอกจาก Google Sheet มาวางตรงๆ ได้</span></div></div></div>
      <div class="mf"><span class="err" id="mErr"></span><div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">เพิ่มรายชื่อ</button></div></div></form>`);
    $("#f_bnames").focus();
  }
  async function submitBulkStaff(){
    const gender = $("#f_bgender").value, known = new Set(state.data.staff.map(x => String(x.name).trim()));
    const items = [];
    for(const line of $("#f_bnames").value.split("\n")){
      // รองรับ: "ชื่อ, ชั้นสามัญ, ชั้นศาสนา" หรือคัดลอกจากชีต "เลขประจำตัว  ชื่อ-สกุล  ชั้นสามัญ  ชั้นศาสนา"
      let p = line.split(/\t|,/).map(x => (x||"").trim());
      if(p.some(x => /^(เลขประจำตัว|ชื่อ-สกุล|ชื่อ-นามสกุล|ชั้นสามัญ|ชั้นศาสนา)$/.test(x))) continue;
      let sid = "";
      if(/^\d{3,}$/.test(p[0] || "")){ sid = p[0]; p = p.slice(1); }
      const [name, klass, rklass, sid2] = p;
      if(!sid && /^\d{3,}$/.test(sid2 || "")) sid = sid2;
      if(!name || name === "ชื่อ-สกุล" || known.has(name)) continue; known.add(name);
      items.push({id:null, rec:{name, gender, sid, klass: klass && klass !== "-" ? klass : "", rklass: rklass && rklass !== "-" ? rklass : "", note:""}});
    }
    if(!items.length){ $("#mErr").textContent = "ไม่มีชื่อใหม่ให้เพิ่ม"; return; }
    $("#mSave").disabled = true; $("#mSave").textContent = "กำลังบันทึก…";
    try{ applyServer(await gs("saveRecords", "staff", items)); closeModal(); render(); toast(`เพิ่ม ${items.length} คนแล้ว`); }
    catch(err){ $("#mSave").disabled = false; $("#mSave").textContent = "เพิ่มรายชื่อ"; $("#mErr").textContent = errMsg(err); }
  }

  // ================= Setia (สตาฟ / รายรับ-รายจ่าย / ของส่วนกลาง) =================
  const ATT_TYPES = [["ขาย","การมาขาย"],["ประชุม","การเข้าร่วมประชุม"],["กิจกรรม","การเข้าร่วมกิจกรรม"]];
  const PENALTY_AT = 5, WARN_AT = 3;
  const MARKS = ["มา","ลา","ขาด","-"];
  const hd = (title, sub, actions="") => `<div class="pagehead"><div><h2 class="page">${title}</h2>${sub ? `<p class="pagesub">${sub}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
  const segBtns = (items, cur, attr) => `<div class="seg">${items.map(([k,l]) => `<button ${attr}="${esc(k)}" class="${cur === k ? "on" : ""}">${l}</button>`).join("")}</div>`;
  function attStats(){
    const st = {};
    for(const s of state.data.att || []) for(const m of (Array.isArray(s.marks) ? s.marks : [])){
      const n = String(m.name||"").trim(); if(!n) continue;
      const x = st[n] ??= {ขาย:{มา:0,ลา:0,ขาด:0}, ประชุม:{มา:0,ลา:0,ขาด:0}, กิจกรรม:{มา:0,ลา:0,ขาด:0}, absent:0};
      const tp = x[s.type] ? s.type : "กิจกรรม";
      if(x[tp][m.status] !== undefined) x[tp][m.status]++;
      if(m.status === "ขาด") x.absent++;
    }
    return st;
  }
  const soonActs = () => { const t = todayISO(), lim = new Date(Date.now() + 31*864e5).toISOString().slice(0,10);
    return (state.data.activities || []).filter(a => String(a.date||"").startsWith(curYM) || (a.date >= t && a.date <= lim)).sort((a,b) => (a.date||"").localeCompare(b.date||"")); };
  const itemByName = n => (state.data.items || []).find(i => String(i.name).trim() === String(n).trim());
  function toBuy(){ const s = new Set((state.data.buy || []).filter(b => b.status !== "ซื้อแล้ว").map(b => String(b.name).trim())); for(const a of soonActs()) for(const n of lines(a.needs)){ const it = itemByName(n); if(!it || num(it.qty) <= 0) s.add(n); } return [...s]; }

  function vSetiaMenu(){
    const B = balances(), st = attStats(), pen = Object.values(st).filter(x => x.absent >= PENALTY_AT).length, buy = toBuy().length;
    const card = (tab, icon, title, desc, stats) => `<button class="portal" data-stabgo="${tab}"><div class="ic">${I(icon)}</div><h3>${title}</h3><div class="d">${desc}</div><div class="stats">${stats}</div><span class="go">เปิด ${I("arrow")}</span></button>`;
    return hd("Setia", "เลือกส่วนที่ต้องการ")
    + `<div class="portals">
      ${card("staff","users","สตาฟ","การมาขาย · ประชุม · กิจกรรม", `<div>สตาฟทั้งหมด<b>${state.data.staff.length} คน</b></div><div>ถึงเกณฑ์ลงโทษ<b class="${pen ? "neg" : ""}">${pen} คน</b></div>`)}
      ${card("fin","chart","รายรับ-รายจ่าย","เงินกิจกรรม · อีโคโนมี · บริจาค", `<div>เงินโดยรวม<b class="${sc(B.club)}">${baht(B.club)}</b></div>`)}
      ${card("items","box","ของส่วนกลาง","รายการของ · ของกิน / ของใช้ · ของที่ต้องซื้อ", `<div>ของทั้งหมด<b>${state.data.items.length} อย่าง</b></div><div>ต้องซื้อ<b class="${buy ? "neg" : ""}">${buy} อย่าง</b></div>`)}
    </div>`;
  }

  // ---------- สตาฟ ----------
  // ---------- ตารางเวรขายน้ำส้ม (เสาร์–พุธ) เก็บใน "ตั้งค่า" key = duty:<วัน> ----------
  const DUTY_DAYS = [["เสาร์",6],["อาทิตย์",0],["จันทร์",1],["อังคาร",2],["พุธ",3]];
  const dutyRec = day => state.data.cfg.find(c => c.key === "duty:" + day);
  const dutyNames = day => String((dutyRec(day) || {}).value || "").split("\n").map(x => x.trim()).filter(Boolean);
  const dayOfDate = d => { if(!/^\d{4}-\d{2}-\d{2}/.test(d||"")) return ""; const [y,m,dd] = d.split("-").map(Number); const wd = new Date(y, m-1, dd).getDay(); const f = DUTY_DAYS.find(x => x[1] === wd); return f ? f[0] : ""; };
  function dutyCard(){
    const today = dayOfDate(todayISO());
    const col = ([day]) => { const ns = dutyNames(day), M = ns.filter(n => genderOf(n) !== "หญิง"), F = ns.filter(n => genderOf(n) === "หญิง");
      return `<div class="${day === today ? "today" : ""}"><div class="dh"><b>${day}${day === today ? ` <span class="tag m">วันนี้</span>` : ""}</b>${canWrite ? `<button class="btn line sm" data-duty="${day}">แก้ไข</button>` : ""}</div>
        <div class="meta">${ns.length} คน · ชาย ${M.length} · หญิง ${F.length}</div>
        ${ns.length ? `<div class="dg">ชาย</div><div class="dn">${M.map(esc).join("<br>") || `<span class="meta">-</span>`}</div><div class="dg">หญิง</div><div class="dn">${F.map(esc).join("<br>") || `<span class="meta">-</span>`}</div>` : `<div class="meta" style="margin-top:8px">ยังไม่ได้จัดเวร</div>`}</div>`; };
    return `<div class="card"><div class="hd"><h3>ตารางเวรขายน้ำส้ม <span class="meta">เสาร์ – พุธ</span></h3><span class="meta">เช็คชื่อการมาขาย จะเลือกคนที่อยู่เวรวันนั้นไว้ให้</span></div>
      <div class="duty">${DUTY_DAYS.map(col).join("")}</div></div>`;
  }
  function openDuty(day){
    const cur = new Set(dutyNames(day));
    editing = {mod:"__duty", day};
    const groups = staffGroups([...cur]);
    const box = groups.filter(([, n]) => n.length).map(([g, names]) => `<div class="sgroup"><div class="gh"><span>${esc(g)} · <span data-dcount="${esc(g)}">${names.filter(n => cur.has(n)).length}</span> คน</span></div>
      ${names.map(n => `<label class="srow" style="grid-template-columns:auto 1fr;cursor:pointer" data-dg="${esc(g)}"><input type="checkbox" data-dname="${esc(n)}" ${cur.has(n) ? "checked" : ""}><span>${esc(n)}</span></label>`).join("")}</div>`).join("");
    showModal(`เวรขายน้ำส้ม · วัน${day}`, `<form novalidate autocomplete="off"><div class="mb"><div class="hint" style="margin-bottom:8px">ติ้กคนที่อยู่เวรวัน${day} (ปกติ 7–8 คน)</div>
      ${box ? `<div class="sgrid">${box}</div>` : `<div class="empty">ยังไม่มีรายชื่อสตาฟ</div>`}</div>
      <div class="mf"><span class="err" id="mErr"></span><div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">บันทึก (<span id="dTotal">${cur.size}</span> คน)</button></div></div></form>`);
  }
  async function submitDuty(){
    const day = editing.day, names = [...document.querySelectorAll("[data-dname]:checked")].map(x => x.dataset.dname), rec = dutyRec(day);
    $("#mSave").disabled = true;
    try{ applyServer(await gs("saveRecord", "cfg", {key: "duty:" + day, value: names.join("\n")}, rec ? rec.id : null)); closeModal(); render(); toast(`บันทึกเวรวัน${day} ${names.length} คนแล้ว`); }
    catch(err){ $("#mSave").disabled = false; $("#mErr").textContent = errMsg(err); }
  }

  function vStaffNew(){
    const tab = state.staffTab;
    const top = hd("สตาฟ", `ขาดโดยไม่มีเหตุผลรวมครบ ${PENALTY_AT} ครั้ง (นับรวมทั้ง 3 อย่าง) = ถึงเกณฑ์ลงโทษ`)
      + `<div style="margin-bottom:14px">${segBtns([...ATT_TYPES, ["sum","สรุป & รายชื่อ"]], tab, "data-stab")}</div>`;
    if(tab === "sum") return top + vStaffSum();
    const label = (ATT_TYPES.find(x => x[0] === tab) || [tab, tab])[1];
    const duty = tab === "ขาย" ? dutyCard() : "";
    const L = state.data.att.filter(s => s.type === tab).sort((a,b) => (b.date||"").localeCompare(a.date||""));
    const rows = L.map(s => { const m = Array.isArray(s.marks) ? s.marks : [], c = k => m.filter(x => x.status === k), ab = c("ขาด"), la = c("ลา");
      return `<tr><td>${thDate(s.date)}</td><td class="w"><b>${esc(s.title)}</b>${ab.length ? `<div class="meta">ขาด: <span class="neg">${ab.map(x => esc(x.name)).join(", ")}</span></div>` : ""}${la.length ? `<div class="meta">ลา: ${la.map(x => esc(x.name) + (x.reason ? ` (${esc(x.reason)})` : "")).join(", ")}</div>` : ""}</td>
        <td class="n pos">${c("มา").length}</td><td class="n">${la.length}</td><td class="n ${ab.length ? "neg" : ""}">${ab.length}</td><td>${rowAct("att", s.id)}</td></tr>`; }).join("");
    return top + duty + `<div class="pagehead" style="margin-top:-4px"><h3 style="margin:0;font-size:15px">${label}</h3>${canWrite ? `<button class="btn primary" data-add="att" data-ptype="${tab}">${I("check")}เช็คชื่อ${label.replace("การ","")}</button>` : ""}</div>
      <div class="card"><div class="tablewrap"><table><thead><tr><th>วันที่</th><th>หัวข้อ</th><th class="n">มา</th><th class="n">ลา (มีเหตุผล)</th><th class="n">ขาด</th><th></th></tr></thead>
      <tbody>${rows || emptyRow(6, "ยังไม่มีการเช็คชื่อ")}</tbody></table></div></div>`;
  }
  function vStaffSum(){
    const st = attStats(), cfg = state.data.cfg.find(c => c.key === "penalty"), groups = staffGroups(Object.keys(st));
    const row = n => { const x = st[n] || {ขาย:{มา:0,ขาด:0}, ประชุม:{มา:0,ขาด:0}, กิจกรรม:{มา:0,ขาด:0}, absent:0}, s = state.data.staff.find(y => String(y.name).trim() === n);
      const status = x.absent >= PENALTY_AT ? `<span class="tag m">ถึงเกณฑ์ลงโทษ</span>` : x.absent >= WARN_AT ? `<span class="tag y">ใกล้ครบ</span>` : `<span class="tag g">ปกติ</span>`;
      return `<tr><td><b>${esc(n)}</b>${s && (s.klass || s.rklass) ? `<div class="meta">${[s.klass ? "สามัญ " + esc(s.klass) : "", s.rklass ? "ศาสนา " + esc(s.rklass) : ""].filter(Boolean).join(" · ")}</div>` : ""}</td>${["ขาย","ประชุม","กิจกรรม"].map(k => `<td class="n">${x[k].มา}<span class="meta"> / </span><span class="${x[k].ขาด ? "neg" : ""}">${x[k].ขาด}</span></td>`).join("")}
        <td class="n ${x.absent >= PENALTY_AT ? "neg" : ""}"><b>${x.absent}</b> / ${PENALTY_AT}</td><td>${status}</td><td>${s ? rowAct("staff", s.id) : ""}</td></tr>`; };
    const body = groups.map(([g, names]) => names.length ? `<tr class="dayhead"><td colspan="7">${esc(g)} <span class="dsub">${names.length} คน</span></td></tr>${names.map(row).join("")}` : "").join("");
    const pen = Object.entries(st).filter(([,x]) => x.absent >= PENALTY_AT).map(([n]) => n);
    return `${pen.length ? `<div class="alerts"><span class="alert" style="border-color:#EFD3D3;background:#FBF1F1;color:var(--neg)">ถึงเกณฑ์ลงโทษ: ${pen.map(esc).join(", ")}</span></div>` : ""}
    <div class="card"><div class="hd"><h3>บทลงโทษ</h3>${canWrite ? `<button class="btn line sm" ${cfg ? `data-edit="cfg" data-id="${esc(cfg.id)}"` : `data-add="cfg" data-pkey="penalty"`}>แก้ไข</button>` : ""}</div>
      <div class="bd doc">${cfg && cfg.value ? esc(cfg.value) : `<span class="meta">ยังไม่ได้กำหนด (เช่น ทำความสะอาดห้องชมรม 1 สัปดาห์)</span>`}</div></div>
    <div class="card"><div class="hd"><h3>สรุปการมา <span class="meta">มา / ขาด</span></h3><div class="actions">${canWrite ? `<button class="btn line sm" data-bulkstaff>${I("users")}วางรายชื่อหลายคน</button><button class="btn primary sm" data-add="staff">${I("plus")}เพิ่มสตาฟ</button>` : ""}</div></div>
      <div class="tablewrap"><table><thead><tr><th>ชื่อ</th><th class="n">มาขาย</th><th class="n">ประชุม</th><th class="n">กิจกรรม</th><th class="n">ขาดไม่มีเหตุผล (รวม)</th><th>สถานะ</th><th></th></tr></thead>
      <tbody>${body || emptyRow(7, "ยังไม่มีรายชื่อสตาฟ กด “เพิ่มสตาฟ” หรือ “วางรายชื่อหลายคน”")}</tbody></table></div></div>`;
  }

  // ---------- รายรับ-รายจ่าย (ดึงจาก Bendahara) ----------
  function vFinNew(){
    const sub = state.finSub, ym = state.month, B = balances(), T = totals(ym);
    const acts = monthRecs("activities", ym), Aact = acts.reduce((a,r) => { const c = MODULES.activities.calc(r); a.in += c.income; a.out += num(r.used); return a; }, {in:0, out:0});
    const J = juiceSum(monthRecs("juice", ym)), Pp = T.products;
    const ecoIn = J.revenue + Pp.revenue, ecoCost = J.cost + J.other + Pp.expense;
    const don = state.data.funds.filter(f => inPeriod(f.date, ym)), donIn = don.reduce((a,f) => a + num(f.amount), 0);
    const dsp = state.data.fspend.filter(f => inPeriod(f.date, ym)), donOut = dsp.reduce((a,f) => a + num(f.amount), 0);
    const tabs = `<div style="margin-bottom:14px">${segBtns([["menu","ภาพรวม"],["act","เงินกิจกรรม"],["eco","อีโคโนมี"],["don","เงินบริจาค"]], sub, "data-fsub")}</div>`;
    const top = hd("รายรับ-รายจ่าย", `ข้อมูลจาก Bendahara · ${period()}`, `<button class="btn line" data-report="1">${I("doc")}รายงาน</button>`) + tabs + `<div id="reportArea"></div>`;
    if(sub === "act"){
      const cards = acts.slice().reverse().map(r => { const c = MODULES.activities.calc(r), left = c.income - num(r.used);
        const debts = state.data.staffdebt.filter(d => String(d.activity||"").trim() === String(r.name||"").trim());
        const sl = slipsOf(r);
        return `<div class="card"><div class="hd"><h3>${esc(r.name)} <span class="meta">${thDate(r.date)}${r.budget ? " · งบ " + baht(r.budget) : ""}</span></h3></div>
          <div class="bd"><div class="tiles" style="margin-bottom:12px">${tile("รับมา", baht(c.income), "pos", c.on ? `เก็บสต้าฟ ${c.paid}/${c.due} คน` : "")}${tile("ใช้ไป", baht(r.used), "neg")}${tile("คงเหลือ", baht(left), sc(left))}</div>
          ${debts.length ? `<div class="meta" style="margin-bottom:6px">รายการที่สต้าฟออกเงินก่อน (${debts.length})</div><div class="tablewrap"><table><thead><tr><th>วันที่</th><th>ค่าอะไร</th><th>สต้าฟ</th><th class="n">จำนวน</th><th>คืนแล้ว</th></tr></thead><tbody>
            ${debts.map(d => `<tr><td>${thDate(d.date)}</td><td>${esc(d.item)}</td><td>${esc(d.staff)}</td><td class="n">${fmt(d.amount)}</td><td>${d.repaid ? `<span class="tag g">คืนแล้ว</span>` : `<span class="tag m">ยังไม่คืน</span>`}</td></tr>`).join("")}</tbody></table></div>` : ""}
          ${sl.length ? `<div class="meta" style="margin:10px 0 6px">หลักฐานการใช้จ่าย (${sl.length})</div><div class="slipbox">${sl.map(x => thumbHTML(x)).join("")}</div>` : ""}
          ${r.incOtherNote ? `<div class="meta" style="margin-top:8px">รายได้อื่นๆ มาจาก: ${esc(r.incOtherNote)}</div>` : ""}</div></div>`; }).join("");
      return top + `<div class="big3">${big("รับมา", baht(Aact.in), "pos")}${big("ใช้ไป", baht(Aact.out), "neg")}${big("คงเหลือ", baht(Aact.in - Aact.out), sc(Aact.in - Aact.out), `${acts.length} กิจกรรม`, true)}</div>` + (cards || `<div class="card empty">ยังไม่มีกิจกรรมในช่วงนี้</div>`);
    }
    if(sub === "eco"){
      const kind = state.ecoKind;
      const kseg = `<div style="margin-bottom:14px">${segBtns([["รายวัน","สินค้ารายวัน (น้ำส้ม)"],["พรีออเดอร์","พรีออเดอร์ (สินค้าอื่นๆ)"]], kind, "data-eco")}</div>`;
      if(kind === "รายวัน"){
        const rs = monthRecs("juice", ym), M = juiceSum(rs.filter(r => sideOf(r) === "ชาย")), F = juiceSum(rs.filter(r => sideOf(r) === "หญิง"));
        const days = byDay(rs).reverse().map(d => { const x = juiceSum(d.items); return `<tr><td>${thDate(d.date)}</td><td class="n">${fmt(x.cupsSold)}</td><td class="n neg">${fmt(x.cost + x.other)}</td><td class="n pos">${fmt(x.revenue)}</td><td class="n ${sc(x.profit)}"><b>${fmt(x.profit)}</b></td></tr>`; }).join("");
        return top + kseg + `<div class="big3">${big("ทุน", baht(J.cost + J.other), "neg")}${big("รายรับ", baht(J.revenue), "pos")}${big("กำไร · น้ำส้ม", baht(J.profit), sc(J.profit), `ฝ่ายชาย ${baht(M.profit)} · ฝ่ายหญิง ${baht(F.profit)}`, true)}</div>
          <div class="card"><div class="hd"><h3>น้ำส้มรายวัน</h3></div><div class="tablewrap"><table><thead><tr><th>วันที่</th><th class="n">ขายได้ (แก้ว)</th><th class="n">ทุน</th><th class="n">รายรับ</th><th class="n">กำไร</th></tr></thead><tbody>${days || emptyRow(5, "ยังไม่มีรายการ")}</tbody></table></div></div>`;
      }
      const by = {};
      for(const r of state.data.products){ const c = prodIn(r, ym), st = prodStatus(r); if(!c.sold && !c.other && !inPeriod(r.date, ym)) continue;
        const k = String(r.name||"(ไม่มีชื่อ)").trim(); const x = by[k] ??= {cost:0, rev:0, profit:0, rounds:[]}; x.cost += c.expense; x.rev += c.revenue; x.profit += c.profit; x.rounds.push({r, st}); }
      const cards = Object.entries(by).sort((a,b) => a[0].localeCompare(b[0], "th")).map(([n,x]) => `<div class="card"><div class="hd"><h3>${esc(n)}</h3><span class="meta">ทุน ${baht(x.cost)} · รายรับ ${baht(x.rev)} · <b class="${sc(x.profit)}">กำไร ${baht(x.profit)}</b></span></div>
        <div class="tablewrap"><table><thead><tr><th>รอบ</th><th class="n">สั่งมา</th><th class="n">ขายแล้ว</th><th class="n">ทุนทั้งหมด</th><th class="n">กำไรตอนนี้</th></tr></thead><tbody>
        ${x.rounds.map(({r, st}) => `<tr><td>${r.round ? "รอบที่ " + fmt(r.round) : "-"} <span class="meta">${thDate(r.date)}</span></td><td class="n">${fmt(st.ordered)}</td><td class="n">${fmt(st.sold)}</td><td class="n">${fmt(st.capital)}</td><td class="n ${sc(st.profitNow)}">${fmt(st.profitNow)}</td></tr>`).join("")}</tbody></table></div></div>`).join("");
      return top + kseg + `<div class="big3">${big("ทุน", baht(Pp.expense), "neg")}${big("รายรับ", baht(Pp.revenue), "pos")}${big("กำไร · พรีออเดอร์", baht(Pp.profit), sc(Pp.profit), "", true)}</div>` + (cards || `<div class="card empty">ยังไม่มีสินค้าในช่วงนี้</div>`);
    }
    if(sub === "don"){
      const byP = {}; don.forEach(f => { const k = String(f.purpose||"").trim() || "(ไม่ระบุ)"; (byP[k] ??= {amt:0, d:new Set()}); byP[k].amt += num(f.amount); if(f.donor) byP[k].d.add(String(f.donor).trim()); });
      const rows = don.slice().sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(f => `<tr><td>${thDate(f.date)}</td><td><b>${esc(f.donor)}</b></td><td>${esc(f.purpose)}</td><td class="n pos">+${fmt(f.amount)}</td><td>${slipsOf(f).map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("")}</td></tr>`).join("");
      const urows = dsp.slice().sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(f => `<tr><td>${thDate(f.date)}</td><td>${esc(f.purpose)}</td><td><b>${esc(f.item)}</b></td><td class="n neg">−${fmt(f.amount)}</td><td>${slipsOf(f).map((x,i) => `<a class="slip" href="${esc(x.url)}" target="_blank" rel="noopener">${I("clip")}${i+1}</a>`).join("")}</td></tr>`).join("");
      const P = donationPools();
      return top + `<div class="big3">${big("รับบริจาคมา", baht(donIn), "pos", `${don.length} ครั้ง`)}${big("ใช้จ่ายไป", baht(donOut), "neg", `${dsp.length} รายการ`)}${big("เงินบริจาคคงเหลือ (ทั้งหมด)", baht(B.donLeft), sc(B.donLeft), "แยกจากเงินชมรม", true)}</div>
        ${P.length ? `<div class="card"><div class="hd"><h3>แยกตามเจตนาผู้บริจาค</h3></div><div class="tablewrap"><table><thead><tr><th>เพื่ออะไร</th><th class="n">ได้รับ</th><th class="n">ใช้ไป</th><th class="n">เหลือ</th></tr></thead><tbody>${P.map(x => `<tr><td><b>${esc(x.name)}</b><div class="meta">จาก ${esc([...x.donors].join(", ") || "-")}</div></td><td class="n">${fmt(x.in)}</td><td class="n">${fmt(x.out)}</td><td class="n ${sc(x.left)}"><b>${fmt(x.left)}</b></td></tr>`).join("")}</tbody></table></div></div>` : ""}
        <div class="card"><div class="hd"><h3>รายการใช้จ่าย</h3></div><div class="tablewrap"><table><thead><tr><th>วันที่</th><th>เงินก้อน</th><th>ใช้ทำอะไร</th><th class="n">จำนวน</th><th>หลักฐาน</th></tr></thead><tbody>${urows || emptyRow(5, "ยังไม่มีรายการ")}</tbody></table></div></div>
        ${false ? `<div class="card"><div class="hd"><h3>แยกตามวัตถุประสงค์</h3></div><div class="tablewrap"><table><thead><tr><th>เพื่ออะไร</th><th class="n">ได้รับ</th></tr></thead><tbody>${Object.entries(byP).map(([k,x]) => `<tr><td><b>${esc(k)}</b><div class="meta">จาก ${esc([...x.d].join(", ") || "-")}</div></td><td class="n">${fmt(x.amt)}</td></tr>`).join("")}</tbody></table></div></div>` : ""}
        <div class="card"><div class="hd"><h3>รายการรับบริจาค</h3></div><div class="tablewrap"><table><thead><tr><th>วันที่</th><th>จากใคร</th><th>เพื่ออะไร</th><th class="n">จำนวน</th><th>หลักฐาน</th></tr></thead><tbody>${rows || emptyRow(5, "ยังไม่มีรายการ")}</tbody></table></div></div>`;
    }
    const card = (k, icon, title, rows) => `<button class="portal" data-fsub="${k}"><div class="ic">${I(icon)}</div><h3>${title}</h3><div class="stats">${rows}</div><span class="go">ดูรายละเอียด ${I("arrow")}</span></button>`;
    return top + `<div class="big3">${big("เงินชมรมตอนนี้", baht(B.club), sc(B.club), (B.hasClub ? "" : "ยังไม่ได้ใส่ยอดตั้งต้นที่ Bendahara · ") + `เงินบริจาคแยกอีก ${baht(B.donLeft)}`, true)}${big("รายรับ · " + period(), baht(T.income), "pos")}${big("รายจ่าย · " + period(), baht(T.expense), "neg")}</div>
    <div class="portals" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
      ${card("act","flag","เงินกิจกรรม", `<div>รับมา<b class="pos">${fmt(Aact.in)}</b></div><div>ใช้ไป<b class="neg">${fmt(Aact.out)}</b></div><div>คงเหลือ<b class="${sc(Aact.in - Aact.out)}">${fmt(Aact.in - Aact.out)}</b></div>`)}
      ${card("eco","shop","อีโคโนมี (ค้าขาย)", `<div>ทุน<b class="neg">${fmt(ecoCost)}</b></div><div>รายรับ<b class="pos">${fmt(ecoIn)}</b></div><div>กำไร<b class="${sc(ecoIn - ecoCost)}">${fmt(ecoIn - ecoCost)}</b></div>`)}
      ${card("don","gift","เงินบริจาค (แยก)", `<div>รับมา<b class="pos">${fmt(donIn)}</b></div><div>ใช้ไป<b class="neg">${fmt(donOut)}</b></div><div>คงเหลือ<b class="${sc(B.donLeft)}">${fmt(B.donLeft)}</b></div>`)}
    </div>`;
  }

  // ---------- ของส่วนกลาง ----------
  function vItems(){
    const tab = state.itemTab;
    const pend = state.data.buy.filter(b => b.status !== "ซื้อแล้ว"), outB = state.data.borrow.filter(b => !b.returned);
    const tabs = `<div style="margin-bottom:14px">${segBtns([["have",`ของที่ HASMI มี (${state.data.items.length})`],["buy",`ต้องการซื้อ (${pend.length})`],["borrow",`ของที่ยืม (${outB.length})`]], tab, "data-itab")}</div>`;
    if(tab === "buy") return vBuy(tabs);
    if(tab === "borrow") return vBorrow(tabs);
    const cat = state.itemCat;
    const L = state.data.items.filter(i => cat === "all" || i.cat === cat);
    const grp = c => { const G = L.filter(i => (i.cat || "ของใช้") === c).sort((a,b) => (num(a.qty) > 0) - (num(b.qty) > 0) || String(a.name).localeCompare(String(b.name), "th"));
      if(!G.length) return "";
      return `<tr class="dayhead"><td colspan="4">${c} <span class="dsub">${G.length} อย่าง · หมด ${G.filter(i => num(i.qty) <= 0).length}</span></td></tr>` + G.map(i => { const ok = num(i.qty) > 0;
        return `<tr><td><b>${esc(i.name)}</b>${i.note ? `<div class="meta">${esc(i.note)}</div>` : ""}</td>
          <td><div class="actions" style="align-items:center">${canWrite ? `<button class="btn line sm" data-qty="${esc(i.id)}" data-d="-1" aria-label="ลด">${I("minus")}</button>` : ""}<b style="min-width:42px;text-align:center">${fmt(i.qty)}</b>${canWrite ? `<button class="btn line sm" data-qty="${esc(i.id)}" data-d="1" aria-label="เพิ่ม">${I("plus")}</button>` : ""}<span class="meta">${esc(i.unit||"")}</span></div></td>
          <td>${ok ? `<span class="tag g">มี</span>` : `<span class="tag m">หมด</span>${canWrite ? ` <button class="btn line sm" data-tobuy="${esc(i.name)}" data-tbcat="${esc(i.cat||"")}" data-tbunit="${esc(i.unit||"")}">+ ใส่รายการซื้อ</button>` : ""}`}</td><td>${rowAct("items", i.id)}</td></tr>`; }).join(""); };
    return hd("ของส่วนกลาง", "ของที่ HASMI มีอยู่ · กด − / + เพื่อปรับจำนวน", canWrite ? `<button class="btn primary big-btn" data-add="items">${I("plus")}เพิ่มของ</button>` : "") + tabs
    + `<div class="card"><div class="hd"><h3>ของที่ HASMI มี</h3>${segBtns([["all","ทั้งหมด"],["ของกิน","ของกิน"],["ของใช้","ของใช้"]], cat, "data-icat")}</div>
      <div class="tablewrap"><table><thead><tr><th>ของ</th><th>จำนวน</th><th>สถานะ</th><th></th></tr></thead><tbody>${(cat === "all" ? grp("ของกิน") + grp("ของใช้") : grp(cat)) || emptyRow(4, "ยังไม่มีของ กด “เพิ่มของ”")}</tbody></table></div></div>`;
  }
  function vBuy(tabs){
    const acts = soonActs(), pend = state.data.buy.filter(b => b.status !== "ซื้อแล้ว").sort((a,b) => String(a.name).localeCompare(String(b.name), "th"));
    const done = state.data.buy.filter(b => b.status === "ซื้อแล้ว").sort((a,b) => (b.boughtDate||"").localeCompare(a.boughtDate||""));
    const inList = n => pend.some(b => String(b.name).trim() === String(n).trim());
    const chip = n => { const it = itemByName(n), ok = it && num(it.qty) > 0;
      return `<span class="pill ${ok ? "paid" : "unpaid"}" style="cursor:default">${ok ? "มี" : "ไม่มี"} · ${esc(n)}${!ok && canWrite ? (inList(n) ? ` <span class="meta">(อยู่ในรายการซื้อแล้ว)</span>` : ` <button class="btn line sm" style="padding:0 6px" data-tobuy="${esc(n)}" data-tbfor="${esc("")}">+ ซื้อ</button>`) : ""}</span>`; };
    const actCards = acts.map(a => { const need = lines(a.needs), miss = need.filter(n => { const it = itemByName(n); return !it || num(it.qty) <= 0; });
      return `<div class="card"><div class="hd"><h3>${I("flag")}${esc(a.name)} <span class="meta">${thDate(a.date)}</span></h3><div class="actions" style="align-items:center">${need.length ? (miss.length ? `<span class="tag m">ขาด ${miss.length} อย่าง</span>` : `<span class="tag g">ของครบแล้ว</span>`) : ""}${canWrite ? `<button class="btn line sm" data-needs="${esc(a.id)}">เลือกของที่ต้องใช้</button>` : ""}</div></div>
        <div class="plist">${need.map(chip).join("") || `<span class="meta">ยังไม่ได้เลือกของที่ต้องใช้</span>`}</div></div>`; }).join("");
    const rows = pend.map(b => { const it = itemByName(b.name);
      return `<tr><td><b>${esc(b.name)}</b>${b.note ? `<div class="meta">${esc(b.note)}</div>` : ""}</td><td><span class="tag">${esc(b.cat || "-")}</span></td><td class="n"><b>${fmt(b.qty)}</b> <span class="meta">${esc(b.unit||"")}</span>${num(b.boughtQty) ? `<div class="meta">ซื้อมาแล้ว ${fmt(b.boughtQty)}</div>` : ""}</td>
        <td class="w">${esc(b.forWhat) || `<span class="meta">-</span>`}</td><td class="meta">${it ? `มีอยู่ ${fmt(it.qty)} ${esc(it.unit||"")}` : "ยังไม่มี"}</td>
        <td><div class="actions">${canWrite ? `<button class="btn primary sm" data-bought="${esc(b.id)}">${I("check")}ซื้อแล้ว</button>` : ""}${rowAct("buy", b.id)}</div></td></tr>`; }).join("");
    const drows = done.map(b => `<tr><td>${thDate(b.boughtDate)}</td><td><b>${esc(b.name)}</b></td><td class="n">${fmt(b.boughtQty || b.qty)} ${esc(b.unit||"")}</td><td>${esc(b.forWhat) || "-"}</td><td>${rowAct("buy", b.id)}</td></tr>`).join("");
    return hd("ของส่วนกลาง", "เขียนไว้ก่อนว่าต้องการเท่าไหร่ ซื้อเสร็จกด “ซื้อแล้ว” ระบบจะเพิ่มเข้าของที่ HASMI มีให้เอง", canWrite ? `<button class="btn primary big-btn" data-add="buy">${I("plus")}เพิ่มของที่ต้องการซื้อ</button>` : "") + tabs
    + `<div class="card"><div class="hd"><h3>${I("cart")}รายการที่ต้องซื้อ <span class="meta">${pend.length} อย่าง</span></h3></div>
      <div class="tablewrap"><table><thead><tr><th>ของ</th><th>ประเภท</th><th class="n">ต้องการ</th><th>ใช้สำหรับ</th><th>ตอนนี้</th><th></th></tr></thead><tbody>${rows || emptyRow(6, "ไม่มีของที่ต้องซื้อ")}</tbody></table></div></div>
    <h3 style="font-size:15px;margin:4px 0 10px">กิจกรรมเดือนนี้และที่กำลังจะมา</h3>${actCards || `<div class="card empty">ไม่มีกิจกรรมในเดือนนี้</div>`}
    ${drows ? `<details class="fold"><summary>ซื้อแล้ว (${done.length})</summary><div class="tablewrap"><table><thead><tr><th>วันที่ซื้อ</th><th>ของ</th><th class="n">จำนวน</th><th>ใช้สำหรับ</th><th></th></tr></thead><tbody>${drows}</tbody></table></div></details>` : ""}`;
  }
  function vBorrow(tabs){
    const f = state.borrowF, today = todayISO();
    const L = state.data.borrow.filter(b => f === "all" || (f === "open" ? !b.returned : b.returned)).sort((a,b) => (!!a.returned - !!b.returned) || (a.due||"9999").localeCompare(b.due||"9999"));
    const rows = L.map(b => { const od = !b.returned && b.due && b.due < today;
      return `<tr><td><span class="tag ${b.dir === "ให้คนอื่นยืมไป" ? "y" : ""}">${esc(b.dir || "เรายืมมา")}</span></td><td><b>${esc(b.name)}</b>${b.note ? `<div class="meta">${esc(b.note)}</div>` : ""}</td><td class="n">${fmt(b.qty)} <span class="meta">${esc(b.unit||"")}</span></td>
        <td class="w">${esc(b.party)}</td><td>${thDate(b.date)}</td><td class="${od ? "overdue" : ""}">${b.due ? thDate(b.due) + (od ? " · เลยกำหนด" : "") : "-"}</td>
        <td>${b.returned ? `<span class="tag g">คืนแล้ว ${thDate(b.returnDate)}</span>` : canWrite ? `<button class="btn primary sm" data-return="${esc(b.id)}">${I("check")}คืนแล้ว</button>` : `<span class="tag m">ยังไม่คืน</span>`}</td><td>${rowAct("borrow", b.id)}</td></tr>`; }).join("");
    const od = state.data.borrow.filter(b => !b.returned && b.due && b.due < today).length;
    return hd("ของส่วนกลาง", "ของที่เรายืมมา และของที่ให้คนอื่นยืมไป", canWrite ? `<button class="btn primary big-btn" data-add="borrow">${I("plus")}เพิ่มรายการยืม</button>` : "") + tabs
    + (od ? `<div class="alerts"><span class="alert" style="border-color:#EFD3D3;background:#FBF1F1;color:var(--neg)">เลยกำหนดคืน ${od} รายการ</span></div>` : "")
    + `<div class="card"><div class="hd"><h3>ของที่ยืม</h3>${segBtns([["open","ยังไม่คืน"],["done","คืนแล้ว"],["all","ทั้งหมด"]], f, "data-bf")}</div>
      <div class="tablewrap"><table><thead><tr><th>ประเภท</th><th>ของ</th><th class="n">จำนวน</th><th>ยืมจาก / ให้ใคร</th><th>วันที่ยืม</th><th>กำหนดคืน</th><th>สถานะ</th><th></th></tr></thead><tbody>${rows || emptyRow(8, f === "open" ? "ไม่มีของที่ยังไม่คืน" : "ไม่มีรายการ")}</tbody></table></div></div>`;
  }
  function openBought(id){
    const b = state.data.buy.find(x => x.id === id); if(!b) return;
    const it = itemByName(b.name), left = Math.max(0, num(b.qty));
    editing = {mod:"__bought", id};
    showModal(`ซื้อแล้ว · ${esc(b.name)}`, `<form novalidate autocomplete="off"><div class="mb">
      <div class="kv"><div><span>ต้องการ</span>${fmt(left)} ${esc(b.unit||"")}</div><div><span>ตอนนี้มีอยู่</span>${it ? fmt(it.qty) + " " + esc(it.unit||"") : "ยังไม่มีในรายการของ"}</div></div>
      <div class="grid"><div class="f"><label for="f_bq">ซื้อมาได้กี่ *</label><input id="f_bq" type="number" inputmode="decimal" min="0" step="any" value="${esc(left)}" autocomplete="off"></div>
        <div class="f"><label for="f_bd">วันที่ซื้อ</label><input id="f_bd" type="date" value="${todayISO()}"></div>
        <div class="f full"><label class="chk"><input type="checkbox" id="f_badd" checked>เพิ่มเข้า “ของที่ HASMI มี” ด้วย${it ? ` (จะเป็น ${fmt(num(it.qty) + left)} ${esc(it.unit||"")})` : " (สร้างรายการใหม่)"}</label></div></div></div>
      <div class="mf"><span class="err" id="mErr"></span><div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">บันทึก</button></div></div></form>`);
  }
  async function submitBought(){
    const b = state.data.buy.find(x => x.id === editing.id); if(!b) return;
    const q = num($("#f_bq").value), d = $("#f_bd").value || todayISO(), add = $("#f_badd").checked;
    if(!(q > 0)){ $("#mErr").textContent = "กรุณากรอกจำนวนที่ซื้อ"; $("#f_bq").closest(".f").classList.add("bad"); return; }
    $("#mSave").disabled = true;
    try{
      if(add){ const it = itemByName(b.name);
        if(it) await gs("saveRecord", "items", {...recBody(it), qty: num(it.qty) + q}, it.id);
        else await gs("saveRecord", "items", {name: b.name, cat: b.cat || "ของใช้", qty: q, unit: b.unit || "", note: ""}, null); }
      const remain = num(b.qty) - q;
      const res = await gs("saveRecord", "buy", {...recBody(b), qty: remain > 0 ? remain : num(b.qty), status: remain > 0 ? "รอซื้อ" : "ซื้อแล้ว", boughtQty: num(b.boughtQty) + q, boughtDate: d}, b.id);
      applyServer(res); closeModal(); render(); toast(remain > 0 ? `ซื้อแล้ว ${fmt(q)} · ยังต้องซื้ออีก ${fmt(remain)}` : `ซื้อ ${b.name} ครบแล้ว${add ? " · เพิ่มเข้าของที่มีแล้ว" : ""}`);
    }catch(err){ $("#mSave").disabled = false; $("#mErr").textContent = errMsg(err); }
  }
  function openNeeds(id){
    const a = state.data.activities.find(x => x.id === id); if(!a) return;
    const need = new Set(lines(a.needs));
    editing = {mod:"__needs", id};
    const grp = c => { const L = state.data.items.filter(i => (i.cat || "ของใช้") === c).sort((x,y) => String(x.name).localeCompare(String(y.name), "th"));
      return L.length ? `<div class="sgroup"><div class="gh"><span>${c}</span></div>${L.map(i => `<div class="srow"><span>${esc(i.name)} <span class="meta">${num(i.qty) > 0 ? `มี ${fmt(i.qty)} ${esc(i.unit||"")}` : `<span class="neg">ไม่มี</span>`}</span></span><label><input type="checkbox" data-need="${esc(i.name)}" ${need.has(String(i.name).trim()) ? "checked" : ""}>ต้องใช้</label><span></span></div>`).join("")}</div>` : ""; };
    const extra = [...need].filter(n => !itemByName(n));
    showModal(`ของที่ต้องใช้ · ${esc(a.name)}`, `<form novalidate autocomplete="off"><div class="mb">
      <div class="sgrid">${grp("ของกิน")}${grp("ของใช้")}</div>
      ${state.data.items.length ? "" : `<div class="empty">ยังไม่มีรายการของ เพิ่มของก่อนที่หน้า “ของส่วนกลาง”</div>`}
      <div class="f full" style="margin-top:12px"><label for="f_needx">ของอื่นที่ยังไม่มีในรายการ (1 อย่างต่อบรรทัด)</label><textarea id="f_needx">${esc(extra.join("\n"))}</textarea><span class="hint">ของที่ยังไม่มีในรายการจะขึ้นสีแดง “ต้องซื้อ”</span></div></div>
      <div class="mf"><span class="err" id="mErr"></span><div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">บันทึก</button></div></div></form>`);
  }
  async function submitNeeds(){
    const a = state.data.activities.find(x => x.id === editing.id); if(!a) return;
    const picked = [...document.querySelectorAll("[data-need]:checked")].map(x => x.dataset.need);
    const extra = $("#f_needx").value.split("\n").map(x => x.trim()).filter(Boolean);
    $("#mSave").disabled = true;
    try{ applyServer(await gs("saveRecord", "activities", {...recBody(a), needs:[...new Set([...picked, ...extra])]}, a.id)); closeModal(); render(); toast("บันทึกของที่ต้องใช้แล้ว"); }
    catch(err){ $("#mSave").disabled = false; $("#mErr").textContent = errMsg(err); }
  }
  function defaultMark(r, n){
    if(r.type === "ขาย"){ const day = dayOfDate(r.date || todayISO()), ns = day ? dutyNames(day) : []; return ns.includes(String(n).trim()) ? "มา" : "-"; }
    return "มา";
  }
  function rerenderMarks(){
    if(!editing || editing.mod !== "att") return;
    const type = (document.querySelector('input[name="r_type"]:checked') || {}).value, date = ($("#f_date") || {}).value;
    const keepMarks = (editing.mnames || []).map((n,i) => ({name:n, status:(document.querySelector(`input[name="m_${i}"]:checked`) || {}).value || "-", reason:(($(`[data-ri="${i}"]`) || {}).value || "")}));
    const f = MODULES.att.fields.find(x => x.type === "marks"), w = $("#marksWrap");
    // วันที่/เรื่องเปลี่ยน (รายการใหม่) → เริ่มจากเวรของวันใหม่ ; กดแสดงทุกคน → เก็บสถานะเดิมไว้
    const marks = editing.keepOnRerender ? keepMarks : (editing.id ? keepMarks : []);
    editing.keepOnRerender = false;
    if(w) w.outerHTML = marksHTML(f, {id: editing.id, type, date, marks});
  }
  function applyDutyMarks(){
    if(!editing || editing.mod !== "att" || editing.id) return;
    const type = (document.querySelector('input[name="r_type"]:checked') || {}).value, date = ($("#f_date") || {}).value;
    (editing.mnames || []).forEach((n,i) => { const st = defaultMark({type, date}, n), r0 = document.querySelector(`input[name="m_${i}"][value="${st}"]`); if(r0) r0.checked = true; const ri = $(`[data-ri="${i}"]`); if(ri) ri.hidden = true; });
  }
  function marksHTML(f, r){
    const v = r[f.k], cur = Array.isArray(v) ? v : [], by = Object.fromEntries(cur.map(m => [String(m.name).trim(), m]));
    // เวรขาย: แสดงเฉพาะคนที่อยู่เวรวันนั้น (+ คนที่บันทึกไว้แล้ว) เว้นแต่กด "แสดงทุกคน"
    const day = r.type === "ขาย" ? dayOfDate(r.date || todayISO()) : "", duty = day ? dutyNames(day) : [];
    const onlyDuty = duty.length > 0 && !editing.showAllMarks;
    const keep = new Set([...duty, ...cur.filter(m => m.status && m.status !== "-").map(m => String(m.name).trim())]);
    let groups = staffGroups(cur.map(m => m.name));
    if(onlyDuty) groups = groups.map(([g, ns]) => [g, ns.filter(n => keep.has(n))]);
    editing.mnames = groups.flatMap(([, n]) => n); let i = 0;
    const cls = s => ({"มา":"ok","ลา":"leave","ขาด":"abs"})[s] || "na";
    const box = groups.filter(([, n]) => n.length).map(([g, names]) => `<div class="sgroup"><div class="gh"><span>${esc(g)} · ${names.length} คน</span><span class="mini"><button type="button" data-markall="${esc(g)}" data-st="มา">มาทุกคน</button><button type="button" data-markall="${esc(g)}" data-st="-">ล้าง</button></span></div>
      ${names.map(n => { const k = i++, m = by[n], st = m ? m.status : (r.id ? "-" : defaultMark(r, n));
        return `<div class="mrow" data-g="${esc(g)}" data-i="${k}"><span class="mn">${esc(n)}</span><span class="mseg">${MARKS.map(s => `<label><input type="radio" name="m_${k}" value="${s}" ${s === st ? "checked" : ""}><span class="s-${cls(s)}">${s === "-" ? "–" : s}</span></label>`).join("")}</span>
          <input class="mreason" autocomplete="off" data-ri="${k}" placeholder="เหตุผล" value="${esc(m ? m.reason : "")}" ${st === "ลา" || st === "ขาด" ? "" : "hidden"}></div>`; }).join("")}</div>`).join("");
    const dutyBar = r.type === "ขาย" ? `<div class="toolbar" style="margin-bottom:8px;justify-content:space-between">
      <span class="meta">${duty.length ? `เวรวัน${day}: ${duty.length} คน${onlyDuty ? " · แสดงเฉพาะคนอยู่เวร" : " · แสดงสตาฟทั้งหมด"}` : day ? `วัน${day}ยังไม่ได้จัดเวร · แสดงสตาฟทั้งหมด` : "วันนี้ไม่ใช่วันขาย (เสาร์–พุธ) · แสดงสตาฟทั้งหมด"}</span>
      ${duty.length ? `<button type="button" class="btn line sm" data-marksall>${onlyDuty ? "แสดงสตาฟทั้งหมด (มีคนมาแทน)" : "แสดงเฉพาะคนอยู่เวร"}</button>` : ""}</div>` : "";
    return `<div class="f full" id="marksWrap"><label>${f.label}</label>${dutyBar}<div class="hint" style="margin-bottom:6px">มา · ลา (มีเหตุผล ต้องใส่เหตุผล) · ขาด (ไม่มีเหตุผล นับเข้าเกณฑ์ลงโทษ) · – (ไม่เกี่ยว / ไม่ได้อยู่เวร)</div>
      ${box ? `<div class="sgrid">${box}</div>` : `<div class="empty" style="padding:14px;border:1px dashed var(--line);border-radius:6px">ยังไม่มีรายชื่อสตาฟ เพิ่มได้ที่ สตาฟ › สรุป & รายชื่อ</div>`}</div>`;
  }
  // ================= modal & forms =================
  let editing = null;
  function showModal(title, html){ $("#mTitle").innerHTML = title; $("#mContent").innerHTML = html; $("#scrim").classList.add("show"); }
  function closeModal(){ $("#scrim").classList.remove("show"); editing = null; }
  $("#mClose").onclick = closeModal;
  $("#scrim").addEventListener("mousedown", e => { if(e.target.id === "scrim") closeModal(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape" && $("#scrim").classList.contains("show")) closeModal(); });

  const absRow = x => `<div class="absrow"><input placeholder="ชื่อ-นามสกุล" data-an value="${esc(x.name)}"><input placeholder="เหตุผล" data-ar value="${esc(x.reason)}"><button type="button" class="btn danger sm" data-absdel aria-label="ลบแถว">${I("x")}</button></div>`;
  const defaultDate = () => (state.route === "ekonomi" && state.month !== "all" && state.month !== curYM) ? state.month + "-01" : todayISO();
  function fieldHTML(f, r){
    if(f.sect) return `<div class="sect">${f.sect}</div>`;
    const v = r[f.k], hint = f.hint ? `<span class="hint">${f.hint}</span>` : "", req = f.req ? " *" : "";
    if(f.type === "lines") return `<div class="f full"><label for="f_${f.k}">${f.label}</label><textarea id="f_${f.k}">${esc(lines(v).join("\n"))}</textarea>${hint}</div>`;
    if(f.type === "long") return `<div class="f full"><label for="f_${f.k}">${f.label}${req}</label><textarea class="long" id="f_${f.k}">${esc(v)}</textarea>${hint}</div>`;
    if(f.type === "textarea") return `<div class="f full"><label for="f_${f.k}">${f.label}${req}</label><textarea id="f_${f.k}">${esc(v)}</textarea>${hint}</div>`;
    if(f.type === "select") return `<div class="f ${f.full?"full":""}"><label for="f_${f.k}">${f.label}</label><select id="f_${f.k}">${f.options.map(o => `<option ${o===(v||f.options[0])?"selected":""}>${esc(o)}</option>`).join("")}</select></div>`;
    if(f.type === "slips"){ editing.slipsMap[f.k] = slipsOf(r, f.k); return slipFieldHTML(f.k, f.label); }
    if(f.type === "bool") return `<div class="f full" id="w_${f.k}"><label class="chk"><input type="checkbox" id="f_${f.k}" ${v ? "checked" : ""}>${f.label}</label></div>`;
    if(f.type === "staffselect"){
      const groups = staffGroups(v ? [v] : []);
      return `<div class="f" id="w_${f.k}"><label for="f_${f.k}">${f.label}${req}</label><select id="f_${f.k}"><option value="">— เลือกสต้าฟ —</option>
        ${groups.map(([g, names]) => names.length ? `<optgroup label="${esc(g)}">${names.map(n => `<option ${n===v?"selected":""}>${esc(n)}</option>`).join("")}</optgroup>` : "").join("")}</select>
        ${state.data.staff.length ? hint : `<span class="hint">ยังไม่มีรายชื่อสต้าฟ เพิ่มได้ที่ Setia › รายชื่อสต้าฟ</span>`}</div>`;
    }
    if(editing && editing.mod === "att" && f.k === "type" && v){
      const info = {"ขาย":["cup","เช็คชื่อการมาขายน้ำส้ม","แสดงเฉพาะคนอยู่เวรวันนั้น"],"ประชุม":["users","เช็คชื่อการเข้าร่วมประชุม","แสดงสตาฟทั้งหมด"],"กิจกรรม":["flag","เช็คชื่อการเข้าร่วมกิจกรรม","แสดงสตาฟทั้งหมด"]}[v] || ["check", "เช็คชื่อ", ""];
      return `<div class="f full"><div class="atthead att-${esc(v)}">${I(info[0])}${info[1]}<span class="sub">${info[2]}</span></div><input type="radio" name="r_type" value="${esc(v)}" checked hidden></div>`;
    }
    if(editing && editing.mod === "att" && f.k === "title"){
      const t = r.type;
      if(t === "กิจกรรม"){ const acts = state.data.activities.slice().sort((a,b) => (b.date||"").localeCompare(a.date||""));
        return `<div class="f"><label for="f_title">กิจกรรมไหน *</label><select id="f_title"><option value="">— เลือกกิจกรรม —</option>${acts.map(a => `<option value="${esc(a.name)}" ${a.name === v ? "selected" : ""}>${esc(a.name)}${a.date ? " · " + thDate(a.date) : ""}</option>`).join("")}${v && !acts.some(a => a.name === v) ? `<option selected>${esc(v)}</option>` : ""}</select>${acts.length ? "" : `<span class="hint">ยังไม่มีกิจกรรม เพิ่มได้ที่ Bendahara › กิจกรรม</span>`}</div>`; }
      const val = v || (t === "ขาย" ? "ขายน้ำส้ม" : "");
      return `<div class="f"><label for="f_title">${t === "ประชุม" ? "หัวข้อประชุม" : "หัวข้อ"} *</label><input id="f_title" type="text" autocomplete="off" value="${esc(val)}" placeholder="${t === "ประชุม" ? "เช่น ประชุมวางแผนกิจกรรมเดือนธันวาคม" : ""}"></div>`;
    }
    if(f.type === "datalist"){
      const opts = f.options();
      return `<div class="f" id="w_${f.k}"><label for="f_${f.k}">${f.label}${req}</label><input id="f_${f.k}" list="dl_${f.k}" value="${esc(v)}" autocomplete="off"><datalist id="dl_${f.k}">${opts.map(o => `<option value="${esc(o)}">`).join("")}</datalist>${hint}</div>`;
    }
    if(f.type === "staffcollect") return staffCollectHTML(r);
    if(f.type === "hidden") return "";
    if(f.type === "donpick"){
      const P = donationPools();
      return `<div class="f full"><label for="f_purpose">${f.label} *</label><select id="f_purpose"><option value="">— เลือกเงินบริจาคก้อนไหน —</option>
        ${P.map(x => `<option value="${esc(x.name)}" ${x.name === v ? "selected" : ""}>${esc(x.name)} · เหลือ ${fmt(x.left + (x.name === v ? num(r.amount) : 0))} บาท</option>`).join("")}${v && !P.some(x => x.name === v) ? `<option selected>${esc(v)}</option>` : ""}</select>
        ${P.length ? "" : `<span class="hint">ยังไม่มีเงินบริจาค บันทึกเงินที่ได้รับก่อน</span>`}</div>`;
    }
    if(f.type === "marks") return marksHTML(f, r);
    if(f.type === "walletselect"){
      const W = state.data.wallets, kinds = ["บัญชีธนาคาร","เงินสด"];
      return `<div class="f full"><label for="f_${f.k}">${f.label}${req}</label><select id="f_${f.k}"><option value="">— เลือก —</option>
        ${kinds.map(k => { const l = W.filter(w => w.kind === k); return l.length ? `<optgroup label="${k}">${l.map(w => `<option ${w.name === v ? "selected" : ""}>${esc(w.name)}</option>`).join("")}</optgroup>` : ""; }).join("")}
        ${v && !W.some(w => w.name === v) ? `<option selected>${esc(v)}</option>` : ""}</select>
        ${W.length ? "" : `<span class="hint">ยังไม่มีบัญชี เพิ่มได้ที่ “บัญชี / เงินสด” ด้านบนของหน้านี้</span>`}</div>`;
    }
    if(f.type === "sales"){ editing.sales = r.id || r.batch ? salesOf(r).map(x => ({...x})) : [];
      return `<div class="f full"><label>${f.label}</label><div id="salesBox"></div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button type="button" class="btn line sm" data-saleadd>${I("plus")}เพิ่มการขาย</button><span class="hint">ครั้งต่อไปกดปุ่ม “ขายเพิ่ม” ในตารางได้เลย</span></div></div>`; }
    if(f.type === "seg") return `<div class="f full"><label>${f.label}${req}</label><div class="segpick">${f.options.map(o => `<label><input type="radio" name="r_${f.k}" value="${esc(o)}" ${o === v ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div></div>`;
    if(f.type === "absent"){ const rows = absList(v); if(!rows.length) rows.push({name:"",reason:""});
      return `<div class="f full"><label>${f.label}</label><div data-abs="${f.k}">${rows.map(absRow).join("")}</div><div><button type="button" class="btn line sm" data-absadd="${f.k}">${I("plus")}เพิ่มคน</button></div></div>`; }
    const type = f.type === "num" ? `type="number" inputmode="decimal" step="any" min="0"` : f.type === "date" ? `type="date"` : `type="text"`;
    const val = (v === undefined || v === null || v === "") ? (f.type === "date" && !f.noDefault ? defaultDate() : "") : v;
    return `<div class="f ${f.full?"full":""}" id="w_${f.k}" ${f.hideIf && r[f.hideIf] ? "hidden" : ""}><label for="f_${f.k}">${f.label}${req}</label><input id="f_${f.k}" name="${esc((editing && editing.mod) || "x")}-${f.k}" ${type} value="${esc(val)}" autocomplete="off">${hint}</div>`;
  }
  function slipFieldHTML(k, label){
    return `<div class="f full"><label>${label}</label><div class="slipbox" id="slipBox_${k}"></div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label class="btn line sm" style="cursor:pointer">${I("clip")}แนบสลิป<input type="file" data-slipin="${k}" accept="image/*,application/pdf" multiple hidden></label>
      <span class="hint" id="slipStatus_${k}">รูปถ่ายหรือ PDF · แนบได้หลายไฟล์</span></div></div>`;
  }
  function renderSalesBox(){ const b = $("#salesBox"); if(!b || !editing || !editing.sales) return;
    b.innerHTML = editing.sales.map((x,i) => `<div class="salerow"><input type="date" data-sd="${i}" value="${esc(x.date)}"><input type="number" min="0" inputmode="numeric" placeholder="ขายได้กี่อัน" data-sq="${i}" value="${x.qty ? esc(x.qty) : ""}"><button type="button" class="btn danger sm" data-saledel="${i}" aria-label="ลบ">${I("x")}</button></div>`).join("") || `<div class="hint" style="margin-bottom:6px">ยังไม่มีการขาย</div>`; }
  function syncSales(){ if(editing && editing.sales) editing.sales = [...document.querySelectorAll("[data-sd]")].map(el => ({date: el.value, qty: num((document.querySelector(`[data-sq="${el.dataset.sd}"]`) || {}).value)})); }
  function renderSlipBox(){ if(!editing || !editing.slipsMap) return; for(const k of Object.keys(editing.slipsMap)){ const b = $("#slipBox_" + k); if(b) b.innerHTML = editing.slipsMap[k].map((s,i) => thumbHTML(s, k + ":" + i)).join(""); } }

  // ---------- staff helpers ----------
  function staffGroups(extraNames = []){
    const list = state.data.staff.slice().sort((a,b) => String(a.name).localeCompare(String(b.name), "th"));
    const known = new Set(list.map(x => String(x.name).trim()));
    const groups = [["ชาย", list.filter(x => x.gender !== "หญิง")], ["หญิง", list.filter(x => x.gender === "หญิง")]].map(([g, l]) => [g, l.map(x => String(x.name).trim()).filter(Boolean)]);
    const extra = [...new Set(extraNames.map(x => String(x).trim()).filter(n => n && !known.has(n)))];
    if(extra.length) groups.push(["อื่นๆ (ไม่อยู่ในรายชื่อ)", extra]);
    return groups;
  }
  function genderOf(name){ const x = state.data.staff.find(s => String(s.name).trim() === String(name).trim()); return x ? (x.gender === "หญิง" ? "หญิง" : "ชาย") : ""; }
  function staffCollectHTML(r){
    const on = !!r.collectStaff, due = new Set(lines(r.staffDue)), paid = new Set(lines(r.staffPaid));
    const groups = staffGroups([...due, ...paid]);
    editing.cnames = groups.flatMap(([, n]) => n);
    let idx = 0;
    const box = groups.filter(([, n]) => n.length).map(([g, names]) => `<div class="sgroup"><div class="gh"><span>${esc(g)} · ${names.length} คน <span class="meta" data-gsum="${esc(g)}"></span></span>
        <span class="mini"><button type="button" data-dueall="${esc(g)}">ต้องจ่ายทุกคน</button><button type="button" data-duenone="${esc(g)}">ล้าง</button></span></div>
        ${names.map(n => { const i = idx++; return `<div class="srow" data-g="${esc(g)}"><span>${esc(n)}</span>
          <label><input type="checkbox" data-due="${i}" ${due.has(n) ? "checked" : ""}>ต้องจ่าย</label>
          <label><input type="checkbox" data-paid="${i}" ${paid.has(n) ? "checked" : ""}>จ่ายแล้ว</label></div>`; }).join("")}</div>`).join("");
    return `<div class="f full"><label class="chk"><input type="checkbox" id="f_collectStaff" ${on ? "checked" : ""}>กิจกรรมนี้เก็บเงินจากสต้าฟ (แสดงรายชื่อสต้าฟทั้งหมดให้ติ้ก)</label>
      <div id="collectBox" ${on ? "" : "hidden"} style="margin-top:10px">
        <div id="collSum" class="gstat" style="border:1px solid var(--line);border-radius:6px;overflow:hidden;margin-bottom:10px"></div>
        <div class="f" style="max-width:220px;margin-bottom:10px"><label for="f_perStaff">เก็บคนละ (บาท)</label><input id="f_perStaff" autocomplete="off" type="number" inputmode="decimal" step="any" min="0" value="${esc(r.perStaff || "")}"></div>
        ${box ? `<div class="sgrid">${box}</div>` : `<div class="empty" style="padding:14px;border:1px dashed var(--line);border-radius:6px">ยังไม่มีรายชื่อสต้าฟ เพิ่มได้ที่ Setia › รายชื่อสต้าฟ</div>`}
      </div></div>`;
  }
  const recBody = r => { const {id, createdAt, updatedAt, updatedBy, ...rest} = r; return rest; };
  const hasVal = v => Array.isArray(v) ? v.length > 0 : typeof v === "number" ? v !== 0 : typeof v === "boolean" ? v : String(v ?? "").trim() !== "";
  const latest = list => list.slice().sort((a,b) => String(b.createdAt||"").localeCompare(String(a.createdAt||"")) || (b.date||"").localeCompare(a.date||""))[0];
  function openForm(mod, id, preset){
    const M = MODULES[mod];
    let r = id ? (state.data[mod].find(x => x.id === id) || {}) : {...(preset || {})};
    if(!id){ const last = latest(state.data[mod]); if(last) for(const f of M.fields) if(f.remember && r[f.k] === undefined && hasVal(last[f.k])) r[f.k] = last[f.k]; }
    if(mod === "products" && id && !r.batch) r = {...r, batch: true, sales: salesOf(r)};
    if(mod === "products" && id && !(num(r.unitCost) > 0) && num(r.cost) > 0 && num(r.qty) > 0) r = {...r, unitCost: Math.round(num(r.cost) / num(r.qty) * 100) / 100};
    editing = {mod, id: id || null, r, slipsMap: {}, uploading: 0};
    const main = M.fields.filter(f => !f.more), more = M.fields.filter(f => f.more);
    const moreOpen = more.some(f => hasVal(r[f.k]));
    const moreHTML = more.length ? `<details class="more" ${moreOpen ? "open" : ""}><summary>เพิ่มเติม (ไม่บังคับ): ${more.map(f => f.label.replace(/\s*\(.*?\)/g, "")).join(" · ")}</summary><div class="grid">${more.map(f => fieldHTML(f, r)).join("")}</div></details>` : "";
    const attTitle = mod === "att" ? ({"ขาย":"เช็คชื่อ · ขายน้ำส้ม","ประชุม":"เช็คชื่อ · ประชุม","กิจกรรม":"เช็คชื่อ · กิจกรรม"}[r.type] || "เช็คชื่อ") + (id ? " (แก้ไข)" : "") : "";
    showModal(attTitle || `${id ? "แก้ไข" : "บันทึก"}${M.title}`, `<form id="mForm" novalidate autocomplete="off"><div class="mb"><div class="grid" id="mGrid">${main.map(f => fieldHTML(f, r)).join("")}${M.calc ? `<div class="calc" id="mCalc"></div>` : ""}${moreHTML}</div></div>
      <div class="mf"><div class="actions" style="align-items:center">${id && canWrite ? `<button type="button" class="btn danger" data-del="${mod}" data-id="${esc(id)}">ลบ</button>` : ""}<span class="err" id="mErr"></span></div>
      <div class="actions"><button type="button" class="btn line" data-close>ยกเลิก</button><button type="submit" class="btn primary" id="mSave">บันทึก</button></div></div></form>`);
    renderSalesBox(); updateCalc(); renderSlipBox();
    const first = $("#mGrid input:not([type=radio]):not([type=checkbox]), #mGrid textarea"); if(first && M.fields[0].type !== "seg") first.focus();
  }
  function readForm(){
    const M = MODULES[editing.mod], out = {};
    for(const f of M.fields){
      if(f.sect) continue;
      if(f.type === "hidden"){ out[f.k] = (editing.r || {})[f.k] ?? ""; continue; }
      if(f.type === "marks"){ out[f.k] = (editing.mnames || []).map((n,i) => ({name:n, status:(document.querySelector(`input[name="m_${i}"]:checked`) || {}).value || "", reason:(($(`[data-ri="${i}"]`) || {}).value || "").trim()})).filter(m => m.status && m.status !== "-"); continue; }
      if(f.type === "slips") out[f.k] = (editing.slipsMap[f.k] || []).map(s => ({url:s.url, id:s.id}));
      else if(f.type === "sales"){ out[f.k] = [...document.querySelectorAll("[data-sd]")].map(el => ({date: el.value, qty: num((document.querySelector(`[data-sq="${el.dataset.sd}"]`) || {}).value)})).filter(x => x.date && x.qty > 0); out.batch = true; }
      else if(f.type === "seg") out[f.k] = (document.querySelector(`input[name="r_${f.k}"]:checked`) || {}).value || "";
      else if(f.type === "bool") out[f.k] = !!($(`#f_${f.k}`) || {}).checked;
      else if(f.type === "staffcollect"){
        out.collectStaff = !!$("#f_collectStaff").checked;
        out.perStaff = num(($("#f_perStaff") || {}).value);
        const names = editing.cnames || [];
        out.staffDue = names.filter((n,i) => { const d = document.querySelector(`[data-due="${i}"]`); return d && d.checked; });
        out.staffPaid = names.filter((n,i) => { const d = document.querySelector(`[data-paid="${i}"]`); return d && d.checked; });
      }
      else if(f.type === "absent") out[f.k] = [...document.querySelectorAll(`[data-abs="${f.k}"] .absrow`)].map(row => ({name: row.querySelector("[data-an]").value.trim(), reason: row.querySelector("[data-ar]").value.trim()})).filter(x => x.name);
      else if(f.type === "lines") out[f.k] = $(`#f_${f.k}`).value.split("\n").map(s => s.trim()).filter(Boolean);
      else if(f.type === "num"){ const raw = $(`#f_${f.k}`).value; out[f.k] = raw === "" ? 0 : num(raw); }
      else if(f.type === "long" || f.type === "textarea") out[f.k] = $(`#f_${f.k}`).value.replace(/\s+$/,"");
      else out[f.k] = $(`#f_${f.k}`).value.trim();
    }
    return out;
  }
  function updateCollSum(){
    const box = $("#collSum"); if(!box || !editing) return;
    const per = num(($("#f_perStaff") || {}).value), st = {};
    document.querySelectorAll(".srow[data-g]").forEach(row => { const g = row.dataset.g, d = row.querySelector("[data-due]"), p = row.querySelector("[data-paid]"); if(!d) return;
      const x = st[g] ??= {due:0, paid:0}; if(d.checked) x.due++; if(p && p.checked) x.paid++; });
    document.querySelectorAll("[data-gsum]").forEach(el => { const x = st[el.dataset.gsum] || {due:0, paid:0}; el.textContent = `· จ่ายแล้ว ${x.paid}/${x.due}`; });
    const M = st["ชาย"] || {due:0, paid:0}, F = st["หญิง"] || {due:0, paid:0}, A = Object.values(st).reduce((a,x) => ({due:a.due + x.due, paid:a.paid + x.paid}), {due:0, paid:0});
    box.innerHTML = `<div>ฝ่ายชาย<b>${M.paid}/${M.due} คน · ${baht(M.paid*per)}</b></div><div>ฝ่ายหญิง<b>${F.paid}/${F.due} คน · ${baht(F.paid*per)}</b></div><div class="tot">รวมทั้งสองฝ่าย<b class="pos">${A.paid}/${A.due} คน · ${baht(A.paid*per)}</b></div>`;
  }
  function updateCalc(){
    updateCollSum();
    if(!editing || !MODULES[editing.mod] || !MODULES[editing.mod].calc || !$("#mCalc")) return;
    const M = MODULES[editing.mod], c = M.calc(readForm());
    $("#mCalc").innerHTML = M.calcShow(c).map(([k,v,cls]) => `<div>${k}<b class="${cls||""}">${v}</b></div>`).join("");
  }
  $("#mContent").addEventListener("input", () => { updateCalc(); updateSellCalc(); });
  $("#mContent").addEventListener("change", async e => {
    if(!editing) return;
    const t = e.target;
    // staff collection toggles
    if(t.id === "f_collectStaff"){
      $("#collectBox").hidden = !t.checked; const w = $("#w_incStaff"); if(w) w.hidden = t.checked;
      if(t.checked && !document.querySelector("[data-due]:checked")) document.querySelectorAll("[data-due]").forEach(x => x.checked = true);
      updateCalc(); return;
    }
    if(t.dataset.paid !== undefined && t.checked){ const d = document.querySelector(`[data-due="${t.dataset.paid}"]`); if(d) d.checked = true; updateCalc(); return; }
    if(t.dataset.due !== undefined && !t.checked){ const pd = document.querySelector(`[data-paid="${t.dataset.due}"]`); if(pd) pd.checked = false; updateCalc(); return; }
    if(editing.mod === "products" && !editing.id && t.id === "f_name"){
      const name = t.value.trim(), same = state.data.products.filter(p => String(p.name||"").trim() === name);
      if(same.length){ const last = latest(same);
        const fill = (k, v) => { const el = $("#f_" + k); if(el && !el.value && hasVal(v)) el.value = v; };
        fill("price", last.price); fill("unitCost", last.unitCost); fill("shop", last.shop); fill("round", Math.max(...same.map(p => num(p.round))) + 1); updateCalc(); }
      return;
    }
    if(editing.mod === "att" && (t.id === "f_date" || t.name === "r_type")){ editing.showAllMarks = false; rerenderMarks(); return; }
    if(t.dataset.dname !== undefined){ const g = t.closest("[data-dg]").dataset.dg, c = document.querySelector(`[data-dcount="${CSS.escape(g)}"]`);
      if(c) c.textContent = document.querySelectorAll(`[data-dg="${CSS.escape(g)}"] input:checked`).length; $("#dTotal").textContent = document.querySelectorAll("[data-dname]:checked").length; return; }
    if(/^m_\d+$/.test(t.name || "")){ const ri = $(`[data-ri="${t.name.slice(2)}"]`); if(ri){ ri.hidden = !(t.value === "ลา" || t.value === "ขาด"); if(!ri.hidden) ri.focus(); } return; }
    if(t.dataset.slipin === undefined) return;
    const k = t.dataset.slipin, files = [...t.files]; t.value = "";
    const ed = editing, st = $("#slipStatus_" + k), save = $("#mSave");
    for(const file of files){
      ed.uploading++; save.disabled = true; st.textContent = `กำลังอัปโหลด ${file.name}…`;
      try{ const p = await prepFile(file); const res = await gs("uploadSlip", p.name, p.mime, p.b64); if(editing === ed){ (ed.slipsMap[k] ||= []).push({url:res.url, id:res.id||""}); renderSlipBox(); } st.textContent = "แนบแล้ว"; }
      catch(err){ st.textContent = "แนบไม่สำเร็จ: " + String(err && err.message || err).slice(0,120); }
      finally{ ed.uploading--; if(editing === ed && !ed.uploading) save.disabled = false; }
    }
  });
  $("#mContent").addEventListener("click", async e => {
    if(e.target.closest("[data-close]")){ closeModal(); return; }
    if(e.target.closest("[data-saleadd]")){ syncSales(); editing.sales.push({date: todayISO(), qty: ""}); renderSalesBox(); const q = document.querySelectorAll("[data-sq]"); if(q.length) q[q.length-1].focus(); return; }
    const sdl = e.target.closest("[data-saledel]"); if(sdl){ syncSales(); editing.sales.splice(+sdl.dataset.saledel, 1); renderSalesBox(); updateCalc(); return; }
    if(e.target.closest("[data-marksall]")){ editing.showAllMarks = !editing.showAllMarks; editing.keepOnRerender = true; rerenderMarks(); return; }
    const ma = e.target.closest("[data-markall]");
    if(ma){ document.querySelectorAll(".mrow").forEach(row => { if(row.dataset.g !== ma.dataset.markall) return; const r0 = row.querySelector(`input[value="${ma.dataset.st}"]`); if(r0) r0.checked = true; const ri = row.querySelector(".mreason"); if(ri) ri.hidden = true; }); return; }
    const sd = e.target.closest("[data-slipdel]");
    if(sd){ e.preventDefault(); const [k, i] = sd.dataset.slipdel.split(":"); editing.slipsMap[k].splice(+i, 1); renderSlipBox(); return; }
    const da = e.target.closest("[data-dueall],[data-duenone]");
    if(da){ const g = da.dataset.dueall ?? da.dataset.duenone, on = da.dataset.dueall !== undefined;
      document.querySelectorAll(".srow").forEach(row => { if(row.dataset.g !== g) return; row.querySelector("[data-due]").checked = on; if(!on) row.querySelector("[data-paid]").checked = false; });
      updateCalc(); return; }
    const add = e.target.closest("[data-absadd]");
    if(add){ const box = document.querySelector(`[data-abs="${add.dataset.absadd}"]`); box.insertAdjacentHTML("beforeend", absRow({name:"",reason:""})); box.lastElementChild.querySelector("input").focus(); return; }
    const del = e.target.closest("[data-absdel]");
    if(del){ const box = del.closest("[data-abs]"); del.closest(".absrow").remove(); if(!box.children.length) box.insertAdjacentHTML("beforeend", absRow({name:"",reason:""})); return; }
    const cn = e.target.closest("[data-copynote]");
    if(cn){ const n = state.data.notes.find(x => x.id === cn.dataset.copynote); if(n) copyText(noteText(n)); return; }
    const ed = e.target.closest("[data-edit]"); if(ed){ openForm(ed.dataset.edit, ed.dataset.id); return; }
    const d = e.target.closest("[data-del]"); if(d){ await doDelete(d); return; }
    const ad = e.target.closest("[data-add]"); if(ad){ openForm(ad.dataset.add, null, presetFrom(ad)); return; }
  });
  function presetFrom(el){ const p = {}; if(el.dataset.pname) p.name = el.dataset.pname; if(el.dataset.pside) p.side = el.dataset.pside; if(el.dataset.pkind) p.kind = el.dataset.pkind; if(el.dataset.ptype) p.type = el.dataset.ptype; if(el.dataset.pkey) p.key = el.dataset.pkey; if(el.dataset.pdate) p.date = el.dataset.pdate; return p; }
  $("#mContent").addEventListener("submit", async e => {
    e.preventDefault();
    if(!editing) return;
    if(editing.mod === "__repay") return submitRepay();
    if(editing.mod === "__sell") return submitSell();
    if(editing.mod === "__bulkstaff") return submitBulkStaff();
    if(editing.mod === "__needs") return submitNeeds();
    if(editing.mod === "__duty") return submitDuty();
    if(editing.mod === "__bought") return submitBought();
    const M = MODULES[editing.mod], data = readForm();
    if(editing.mod === "products"){ const sold = (data.sales || []).reduce((a,x) => a + x.qty, 0); if(sold > num(data.qty)){ $("#mErr").textContent = `ขายรวม ${fmt(sold)} อัน เกินจำนวนที่สั่งมา`; return; } }
    if(!validateForm(M)) return;
    if(editing.uploading){ $("#mErr").textContent = "รออัปโหลดสลิปให้เสร็จก่อน"; return; }
    const mod = editing.mod;
    $("#mSave").disabled = true; $("#mSave").textContent = "กำลังบันทึก…";
    try{
      applyServer(await gs("saveRecord", mod, data, editing.id));
      if(["juice","activities","products"].includes(mod) && data.date && state.month !== "all" && !data.date.startsWith(state.month)) state.month = data.date.slice(0,7);
      closeModal(); render(); toast("บันทึกแล้ว");
    }catch(err){ $("#mSave").disabled = false; $("#mSave").textContent = "บันทึก"; $("#mErr").textContent = errMsg(err); }
  });
  // ช่องที่ต้องกรอก: req = ห้ามว่าง · must:"pos" = ต้องมากกว่า 0 · must:"filled" = ห้ามว่าง (ใส่ 0 ได้)
  function validateForm(M){
    document.querySelectorAll("#mGrid .f.bad").forEach(x => { x.classList.remove("bad"); const n = x.querySelector(".need"); if(n) n.remove(); });
    const checks = M.fields.filter(f => f.req || f.must).map(f => ({k:f.k, type:f.type, must:f.must || (f.type === "num" ? "pos" : "text")}));
    if(editing.mod === "activities" && $("#f_collectStaff") && $("#f_collectStaff").checked) checks.push({k:"perStaff", type:"num", must:"pos"});
    const bad = [];
    document.querySelectorAll("#mGrid .mrow.bad").forEach(x => { x.classList.remove("bad"); x.querySelectorAll(".need").forEach(n => n.remove()); });
    if(editing.mod === "att") (editing.mnames || []).forEach((n,i) => { const st = (document.querySelector(`input[name="m_${i}"]:checked`) || {}).value; const ri = $(`[data-ri="${i}"]`);
      if(st === "ลา" && !(ri && ri.value.trim())){ const w = $(`.mrow[data-i="${i}"]`); w.classList.add("bad"); w.insertAdjacentHTML("beforeend", `<span class="need">ลา ต้องใส่เหตุผล</span>`); bad.push(w); } });
    for(const c of checks){
      let wrap, ok;
      if(c.type === "seg"){ const r = document.querySelector(`input[name="r_${c.k}"]`); if(!r) continue; wrap = r.closest(".f"); ok = !!document.querySelector(`input[name="r_${c.k}"]:checked`); }
      else { const el = $("#f_" + c.k); if(!el || el.closest("[hidden]")) continue; wrap = el.closest(".f"); const raw = String(el.value).trim();
        ok = c.must === "pos" ? raw !== "" && num(raw) > 0 : c.must === "filled" ? raw !== "" && num(raw) >= 0 : raw !== ""; }
      if(!ok && wrap){ bad.push(wrap); wrap.classList.add("bad");
        wrap.insertAdjacentHTML("beforeend", `<span class="need">${c.type === "seg" ? "กรุณาเลือกก่อน" : c.must === "pos" ? "กรุณากรอกก่อน (มากกว่า 0)" : c.must === "filled" ? "กรุณากรอกก่อน (ใส่ 0 ได้)" : "กรุณากรอกก่อน"}</span>`); }
    }
    if(bad.length){ $("#mErr").textContent = `กรอกช่องสีแดงให้ครบก่อนบันทึก (${bad.length} ช่อง)`; const d = bad[0].closest("details"); if(d) d.open = true; bad[0].scrollIntoView({block:"center", behavior:"smooth"}); const inp = bad[0].querySelector("input:not([type=radio]),select,textarea"); if(inp) inp.focus({preventScroll:true}); return false; }
    return true;
  }
  $("#mContent").addEventListener("input", e => { const w = e.target.closest && e.target.closest(".f.bad"); if(w){ w.classList.remove("bad"); const n = w.querySelector(".need"); if(n) n.remove(); } });
  function errMsg(err){
    const m = String((err && err.message) || err || "");
    if(/LOCKED/.test(m)){ setTimeout(() => showLock("หมดเวลาการใช้งาน กรุณาใส่รหัสผ่านอีกครั้ง"), 0); return "หมดเวลาการใช้งาน กรุณาใส่รหัสผ่านใหม่"; }
    if(/สิทธิ์|permission|access/i.test(m)) return "บันทึกไม่ได้ — คุณมีสิทธิ์ดูอย่างเดียว";
    if(/lock|timed out|หมดเวลา/i.test(m)) return "มีคนกำลังบันทึกอยู่ ลองใหม่อีกครั้ง";
    return "ไม่สำเร็จ: " + m.slice(0,140);
  }
  async function copyText(t){
    try{ await navigator.clipboard.writeText(t); toast("คัดลอกแล้ว"); }
    catch(_){ const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); toast("คัดลอกแล้ว"); }catch(__){ toast("คัดลอกไม่ได้"); } ta.remove(); }
  }
  const pendingDel = new Set();
  async function doDelete(btn){
    const key = btn.dataset.del + "/" + btn.dataset.id;
    if(!pendingDel.has(key)){ pendingDel.add(key); const old = btn.textContent; btn.textContent = "ยืนยันลบ?"; setTimeout(() => { pendingDel.delete(key); if(btn.isConnected) btn.textContent = old; }, 3000); return; }
    pendingDel.delete(key); btn.disabled = true;
    try{ applyServer(await gs("deleteRecord", btn.dataset.del, btn.dataset.id)); if($("#scrim").classList.contains("show")) closeModal(); render(); toast("ลบแล้ว"); }
    catch(err){ btn.disabled = false; toast(errMsg(err)); }
  }

  // ================= view events =================
  $("#view").addEventListener("click", async e => {
    const nv = e.target.closest("[data-nav]"); if(nv){ pushHist(); if(nv.dataset.nav === "setia") state.tab.setia = "menu"; nav(nv.dataset.nav); return; }
    const tg = e.target.closest("[data-tabgo]"); if(tg){ pushHist(); nav("ekonomi", tg.dataset.tabgo); return; }
    const a = e.target.closest("[data-add]"); if(a){ openForm(a.dataset.add, null, presetFrom(a)); return; }
    const sg = e.target.closest("[data-stabgo]"); if(sg){ pushHist(); nav("setia", sg.dataset.stabgo); return; }
    const stb = e.target.closest("[data-stab]"); if(stb){ state.staffTab = stb.dataset.stab; render(); return; }
    const fs = e.target.closest("[data-fsub]"); if(fs){ state.finSub = fs.dataset.fsub; render(); window.scrollTo(0,0); return; }
    const eco = e.target.closest("[data-eco]"); if(eco){ state.ecoKind = eco.dataset.eco; render(); return; }
    const icat = e.target.closest("[data-icat]"); if(icat){ state.itemCat = icat.dataset.icat; render(); return; }
    const itb = e.target.closest("[data-itab]"); if(itb){ state.itemTab = itb.dataset.itab; render(); return; }
    const bff = e.target.closest("[data-bf]"); if(bff){ state.borrowF = bff.dataset.bf; render(); return; }
    const tb = e.target.closest("[data-tobuy]"); if(tb){ openForm("buy", null, {name: tb.dataset.tobuy, cat: tb.dataset.tbcat || undefined, unit: tb.dataset.tbunit || undefined, status: "รอซื้อ"}); return; }
    const bo = e.target.closest("[data-bought]"); if(bo){ openBought(bo.dataset.bought); return; }
    const rt = e.target.closest("[data-return]");
    if(rt){ const r = state.data.borrow.find(x => x.id === rt.dataset.return); if(!r) return;
      if(rt.dataset.confirm !== "1"){ rt.dataset.confirm = "1"; rt.textContent = "ยืนยันคืน?"; setTimeout(() => { if(rt.isConnected){ rt.dataset.confirm = ""; rt.innerHTML = I("check") + "คืนแล้ว"; } }, 3000); return; }
      rt.disabled = true; try{ applyServer(await gs("saveRecord", "borrow", {...recBody(r), returned: true, returnDate: todayISO()}, r.id)); render(); toast(`คืน ${r.name} แล้ว`); }catch(err){ toast(errMsg(err)); render(); } return; }
    const dty = e.target.closest("[data-duty]"); if(dty){ openDuty(dty.dataset.duty); return; }
    const nds = e.target.closest("[data-needs]"); if(nds){ openNeeds(nds.dataset.needs); return; }
    const qb = e.target.closest("[data-qty]");
    if(qb){ const it = state.data.items.find(x => x.id === qb.dataset.qty); if(!it) return; const nq = Math.max(0, num(it.qty) + num(qb.dataset.d)); if(nq === num(it.qty)) return;
      qb.disabled = true; try{ applyServer(await gs("saveRecord", "items", {...recBody(it), qty: nq}, it.id)); render(); toast(`${it.name}: ${fmt(nq)} ${it.unit||""}`); }catch(err){ toast(errMsg(err)); render(); } return; }
    const sl = e.target.closest("[data-sell]"); if(sl){ openSell(sl.dataset.sell); return; }
    const js = e.target.closest("[data-jside]"); if(js){ state.juiceSide = js.dataset.jside; render(); return; }
    if(e.target.closest("[data-bulkstaff]")){ openBulkStaff(); return; }
    if(e.target.closest("[data-repay]")){ openRepay(); return; }
    if(e.target.closest("[data-selclear]")){ state.debtSel.clear(); render(); return; }
    const dy = e.target.closest("[data-day]"); if(dy){ openDay(dy.dataset.day, dy.dataset.date, dy.dataset.pname); return; }
    const ed = e.target.closest("[data-edit]"); if(ed){ openForm(ed.dataset.edit, ed.dataset.id); return; }
    const d = e.target.closest("[data-del]"); if(d){ await doDelete(d); return; }
    const op = e.target.closest("[data-open]"); if(op){ openNote(op.dataset.open); return; }
    const tf = e.target.closest("[data-tf]"); if(tf){ state.taskFilter = tf.dataset.tf; render(); return; }
    const rp = e.target.closest("[data-report]");
    if(rp){ $("#reportArea").innerHTML = `<div class="card bd"><textarea class="reportbox" id="reportTxt" readonly></textarea>
        <div style="margin-top:8px;display:flex;gap:10px;align-items:center"><button class="btn primary" data-copy="1">${I("copy")}คัดลอกรายงาน</button><span class="meta">นำไปวางในกลุ่มไลน์ของชมรมได้ทันที</span></div></div>`;
      $("#reportTxt").value = buildReport(state.month); return; }
    if(e.target.closest("[data-copy]")) copyText($("#reportTxt").value);
  });
  $("#view").addEventListener("input", e => {
    if(e.target.id === "noteQ"){ state.noteQ = e.target.value; renderNoteList(); }
  });
  $("#view").addEventListener("change", async e => {
    if(e.target.id === "noteType"){ state.noteType = e.target.value; renderNoteList(); return; }
    const t = e.target;
    if(t.dataset.sel !== undefined){ t.checked ? state.debtSel.add(t.dataset.sel) : state.debtSel.delete(t.dataset.sel); render(); return; }
    if(t.dataset.selstaff !== undefined){
      state.data.staffdebt.filter(d => !d.repaid && String(d.staff||"(ไม่ระบุ)").trim() === t.dataset.selstaff).forEach(d => t.checked ? state.debtSel.add(d.id) : state.debtSel.delete(d.id));
      render(); return; }
    if(t.dataset.qpaid !== undefined){
      const r = state.data.activities.find(x => x.id === t.dataset.qpaid); if(!r) return;
      const due = lines(r.staffDue), name = due[+t.dataset.i]; if(!name) return;
      const paid = new Set(lines(r.staffPaid)); t.checked ? paid.add(name) : paid.delete(name);
      t.disabled = true;
      try{ applyServer(await gs("saveRecord", "activities", {...recBody(r), staffPaid: due.filter(n => paid.has(n))}, r.id)); render(); toast(t.checked ? `${name} จ่ายแล้ว` : `ยกเลิก ${name}`); }
      catch(err){ toast(errMsg(err)); render(); }
      return;
    }
    const s = e.target.closest("[data-status]");
    if(s){
      const t = state.data.tasks.find(x => x.id === s.dataset.status); if(!t) return;
      const {id, createdAt, updatedAt, updatedBy, ...rest} = t;
      s.disabled = true;
      try{ applyServer(await gs("saveRecord", "tasks", {...rest, status: s.value}, id)); render(); toast("อัปเดตสถานะแล้ว"); }
      catch(err){ s.disabled = false; toast(errMsg(err)); render(); }
    }
  });

  // ================= data =================
  function applyServer(res){
    if(!res || !res.data) return;
    for(const m of Object.keys(MODULES)) state.data[m] = Array.isArray(res.data[m]) ? res.data[m] : [];
    state.loaded = true; canWrite = !!res.canWrite; isDemo = !!res.demo;
    $("#who").textContent = res.email || "";
    if(res.sheetUrl && canWrite){ const a = $("#sheetLink"); a.href = res.sheetUrl; a.style.display = ""; }
    if(isDemo) setBanner("warn", "โหมดตัวอย่าง: ทดลองกรอกได้ แต่ข้อมูลจะไม่ถูกบันทึก ใช้งานจริงผ่านลิงก์ Google Apps Script ของชมรม");
    else setBanner(canWrite ? "" : "info", canWrite ? "" : "คุณมีสิทธิ์ดูอย่างเดียว หากต้องการบันทึกข้อมูล ให้เจ้าของชีตเพิ่มคุณเป็น “ผู้แก้ไข”");
  }
  // ---------- รหัสผ่าน ----------
  let unlocked = false;
  function showLock(msg){
    unlocked = false; closeModal(); $("#lock").hidden = false; $("#lockErr").textContent = msg || ""; $("#pin").value = "";
    setTimeout(() => { try{ $("#pin").focus(); }catch(_){} }, 50);
  }
  const isLockedErr = err => /LOCKED/.test(String((err && err.message) || err || ""));
  $("#lockForm").addEventListener("submit", async e => {
    e.preventDefault();
    const pin = $("#pin").value.trim(); if(!pin) return;
    $("#pinBtn").disabled = true; $("#pinBtn").textContent = "กำลังตรวจสอบ…";
    try{
      const res = await gs("unlock", pin);
      if(res && res.ok){ unlocked = true; $("#lock").hidden = true; applyServer(res); render(); toast("ยินดีต้อนรับ"); }
      else { const box = $(".lockbox"); box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); $("#pin").value = "";
        $("#lockErr").textContent = res && res.wait ? "ใส่รหัสผิดหลายครั้ง กรุณารอ 10 นาที" : `รหัสผ่านไม่ถูกต้อง${res && res.left !== undefined ? ` (ลองได้อีก ${res.left} ครั้ง)` : ""}`; }
    }catch(err){ $("#lockErr").textContent = "ตรวจสอบไม่ได้: " + String(err && err.message || err).slice(0,120); }
    finally{ $("#pinBtn").disabled = false; $("#pinBtn").textContent = "เข้าสู่แอป"; }
  });
  $("#lockBtn").innerHTML = I("padlock") + "<span>ล็อก</span>";
  $("#lockBtn").addEventListener("click", async () => { try{ await gs("lock"); }catch(_){} hist.length = 0; state.route = "home"; render(); showLock(); });

  async function load(manual){
    if(busy || !unlocked) return; busy = true;
    try{ const res = await gs("getAll"); if(res && res.locked){ showLock("หมดเวลาการใช้งาน กรุณาใส่รหัสผ่านอีกครั้ง"); return; } applyServer(res); if(editing) renderChrome(); else if(document.activeElement && document.activeElement.id === "noteQ"){ renderChrome(); renderNoteList(); } else render(); if(manual) toast("อัปเดตแล้ว"); }
    catch(err){ if(isLockedErr(err)){ showLock("หมดเวลาการใช้งาน กรุณาใส่รหัสผ่านอีกครั้ง"); return; } state.loaded = true; setBanner("warn", "โหลดข้อมูลไม่ได้: " + esc(String(err && err.message || err).slice(0,160))); render(); }
    finally{ busy = false; }
  }
  $("#refresh").addEventListener("click", () => load(true));

  // ================= start =================
  window.__appStarted = true;
  render();
  showLock();   // เปิดแอปทุกครั้งต้องใส่รหัสผ่าน
  setTimeout(() => { $("#splash").classList.add("out"); setTimeout(() => $("#splash").remove(), 500); }, 3000);
  setInterval(() => { if(!editing && !document.hidden && !$("#scrim").classList.contains("show")) load(); }, 60000);
})();
} catch (err) { window.hasmiFail("เริ่มไม่ได้: " + (err && err.message || err) + (err && err.stack ? " @ " + String(err.stack).split("\n")[1] : "")); }
