/* booth.js: trang gian hàng.
   /gian-hang/            = trang MẪU (dữ liệu giả trong js/sample-booth.js)
   /gian-hang/?s=<slug>   = trang gian hàng thật (đọc qua API.getBooth). Link xem trước của Ban tổ chức: ?s=<slug>&xem=<mã>
   Mọi dữ liệu người dùng nhập đều hiển thị bằng textContent (không chèn HTML). */
const $ = id => document.getElementById(id);
const showPage = () => document.documentElement.classList.remove("is-loading");
const q = new URLSearchParams(location.search);
const SLUG = (q.get("s") || "").trim();
const XEM = (q.get("xem") || "").trim();

const DEFAULT_COVER = "/assets/hero-poster.jpg";   // ảnh bìa mặc định (cam JCI)
const DEFAULT_PIC = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a83c00"/><stop offset="1" stop-color="#fe6301"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>');

/* ======================== thông báo thay cho trang ======================== */
/* Thay phần thân bằng một thông báo, giữ nguyên nền, thanh menu và chân trang. */
function showMessage(title, text, actions) {
  document.title = title + " · IC JCI Khanhhoa 2027";
  ["notice", "mbar"].forEach(id => $(id) && $(id).remove());
  document.querySelector("main")?.remove();
  const hero = $("top");
  hero.className = "hero nf";
  hero.innerHTML = '<img class="bg" alt=""><div class="wrap"><div class="nf-card glass-light"><div class="notice-ic">?</div><h1></h1><p></p><div class="nf-actions"></div></div></div>';
  hero.querySelector("img").src = DEFAULT_COVER;
  hero.querySelector("h1").textContent = title;
  hero.querySelector("p").textContent = text;
  const box = hero.querySelector(".nf-actions");
  actions.forEach(a => {
    const l = document.createElement("a");
    l.className = "btn" + (a.outline ? " btn--line" : "");
    l.href = a.href; l.textContent = a.label;
    box.appendChild(l);
  });
  showPage();
}

/* ======================== tải dữ liệu ======================== */
let LIVE = null;
if (SLUG) {
  try {
    LIVE = await API.getBooth(SLUG, XEM);
  } catch (err) {
    const off = err && err.code === "NOT_CONNECTED";
    showMessage(off ? "Chưa kết nối dữ liệu" : "Chưa tải được trang",
      off ? "Trang gian hàng chưa được kết nối với máy chủ dữ liệu." : "Vui lòng kiểm tra kết nối mạng rồi thử lại.",
      [{ label: "Thử lại", href: location.href }, { label: "Về trang chủ", href: "/", outline: true }]);
    throw err;
  }
  if (LIVE && LIVE.cho_duyet) {   // có gian hàng nhưng chưa được duyệt: hàm chỉ trả tên + logo
    showMessage("Trang của bạn đang được xác minh", "Vui lòng trở lại sau.",
      [{ label: "Tải lại trang", href: location.href }, { label: "Về trang chủ", href: "/", outline: true }]);
    throw new Error("booth-pending");
  }
  if (!LIVE) {
    showMessage("Không có gian hàng này", "Gian hàng này chưa được đăng ký. Vui lòng kiểm tra lại mã QR hoặc đường dẫn.",
      [{ label: "Về trang chủ", href: "/" }, { label: "Xem trang mẫu", href: "/gian-hang/", outline: true }]);
    throw new Error("slug-not-found");
  }
}

/* Dữ liệu máy chủ -> dạng trang đang dùng; trường ảnh trống thì dùng ảnh mặc định */
function normalizeLive(d) {
  return {
    ...d,
    anh_gioi_thieu: d.anh_gioi_thieu || "",
    kenh_khac: d.kenh_khac_link || d.kenh_khac || "",
    san_pham: (d.san_pham || []).map(p => ({ ...p, anh: p.anh || DEFAULT_PIC, don_vi: p.don_vi || "", mo_ta: p.mo_ta || "", gia: p.gia ?? null }))
  };
}
const B = LIVE ? normalizeLive(LIVE) : window.SAMPLE_BOOTH;

/* ======================== tiện ích ======================== */
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const set = (id, text) => { $(id).textContent = text; };
const svgIcon = id => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("class", "ico"); const u = document.createElementNS("http://www.w3.org/2000/svg", "use"); u.setAttribute("href", "#" + id); s.appendChild(u); return s; };
const isUrl = v => /^https?:\/\//i.test(v || "");

/* Khung ảnh: vừa chiều cao, căn giữa; ảnh hẹp hơn khung -> 2 bên là nền mờ của chính ảnh; ảnh rộng hơn -> cắt đều 2 bên */
function frame(src, alt, ratioCls = "r-43") {
  const f = el("div", "mf " + ratioCls);
  const bg = el("div", "mf-bg"); bg.style.backgroundImage = `url("${String(src).replace(/"/g, "%22")}")`;
  const img = el("img", "mf-img"); img.src = src; img.alt = alt || ""; img.loading = "lazy"; img.decoding = "async";
  f.appendChild(bg); f.appendChild(img);
  return f;
}
/* SĐT: di động 10 số -> "090 00 00 000"; cố định 11 số (02x) -> "0258 3822 346" */
function phoneView(v) {
  const d = String(v || "").replace(/\D/g, "");
  if (d.length === 10) return d.replace(/(\d{3})(\d{2})(\d{2})(\d{3})/, "$1 $2 $3 $4");
  if (d.length === 11 && d.startsWith("02")) return d.replace(/(\d{4})(\d{4})(\d{3})/, "$1 $2 $3");
  return d;
}
const tidy = t => String(t || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{2,}/g, "\n").trim();
const hasPrice = p => Number.isFinite(+p.gia) && +p.gia > 0;
const money = v => Math.round(+v).toLocaleString("vi-VN") + "đ";
const priceText = p => money(p.gia) + (p.don_vi ? " / " + p.don_vi : "");
/* Rút gọn chữ: chỉ hiện "Xem thêm" khi chữ thật sự bị cắt */
function clampWithMore(textEl, btn) {
  const check = () => { if (!textEl.classList.contains("open")) btn.hidden = textEl.scrollHeight <= textEl.clientHeight + 2; };
  btn.onclick = () => { const o = textEl.classList.toggle("open"); btn.textContent = o ? "Thu gọn" : "Xem thêm"; };
  check(); addEventListener("resize", check); if (document.fonts) document.fonts.ready.then(check);
}
function monogram(name) {
  const ini = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase().replace(/[<&>]/g, "");
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="44" fill="#a83c00"/><text x="100" y="125" font-family="sans-serif" font-size="80" font-weight="700" fill="#fed222" text-anchor="middle">${ini}</text></svg>`);
}

/* ======================== hiển thị ======================== */
if (LIVE && LIVE.status === "pending") {
  const bn = document.createElement("div");
  bn.textContent = "Bản xem trước. Gian hàng chưa được công khai";
  bn.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:200;background:#fed222;color:#3a2604;text-align:center;font:700 13px/1 system-ui,sans-serif;padding:8px 12px";
  document.body.appendChild(bn);
}
if (SLUG) $("notice")?.remove();   // chỉ trang mẫu mới có hộp thông báo "dữ liệu mẫu"

const products = (B.san_pham || []).slice(0, 5);
const logo = B.logo || monogram(B.ten_gian_hang);
document.title = B.ten_gian_hang + " · IC JCI Khanhhoa 2027";
["bigLogo", "floatLogo"].forEach(id => { $(id).src = logo; $(id).alt = "Logo " + B.ten_gian_hang; });
["logoName", "floatName"].forEach(id => set(id, B.ten_gian_hang));
$("cover").src = B.anh_bia || DEFAULT_COVER;

/* Banner */
const words = B.ten_gian_hang.trim().split(/\s+/), h1 = $("heroName");
if (words.length > 2) {
  const tail = words.slice(-2).join(" ");
  h1.append(words.slice(0, -2).join(" ") + " ");
  h1.appendChild(el("em", tail.length > 16 ? "long" : null, tail));
} else h1.textContent = B.ten_gian_hang;
if (B.khau_hieu) set("slogan", B.khau_hieu); else $("slogan").hidden = true;
set("logoGroup", B.nhom_san_pham || "Gian hàng nhà tài trợ");
$("heroCall").href = "tel:" + B.sdt;
[["Gian hàng", B.ma_gian], ["Lĩnh vực", B.nhom_san_pham]].forEach(([k, v]) => {
  if (!v) return; const f = el("div", "fact glass"); f.appendChild(el("small", null, k)); f.appendChild(el("b", null, v)); $("facts").appendChild(f);
});
if (!$("facts").children.length) $("facts").remove();

/* Câu chuyện */
set("intro", tidy(B.gioi_thieu));
clampWithMore($("intro"), $("introMore"));
const aboutImg = B.anh_gioi_thieu || (products[0] && products[0].anh) || DEFAULT_PIC;
$("aboutPhoto").prepend(frame(aboutImg, B.ten_gian_hang, "r-54"));
set("floatSub", (B.nhom_san_pham ? B.nhom_san_pham + " · " : "") + "IC 26/12/2026");

/* Sản phẩm nổi bật + chi tiết */
$("highlights").style.setProperty("--n", Math.max(1, products.length));
products.forEach((p, i) => {
  const n = String(i + 1).padStart(2, "0"), id = "sp-" + (i + 1);
  const card = el("a", "hl glass rv"); card.href = "#" + id;
  const media = frame(p.anh || DEFAULT_PIC, p.ten, "r-1");
  media.appendChild(el("span", "num", n));
  const body = el("div", "body");
  body.appendChild(el("h3", null, p.ten));
  if (p.mo_ta) body.appendChild(el("p", "clamp", p.mo_ta.replace(/\s*\n+\s*/g, " ")));
  body.appendChild(el("div", "price" + (hasPrice(p) ? "" : " ask"), hasPrice(p) ? priceText(p) : "Liên hệ"));
  const go = el("span", "go", "Xem chi tiết"); go.appendChild(svgIcon("b-arrow")); body.appendChild(go);
  card.appendChild(media); card.appendChild(body);
  card.addEventListener("click", e => {
    e.preventDefault();
    const t = $(id); t.scrollIntoView({ behavior: "smooth", block: "center" });
    t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    setTimeout(() => t.classList.remove("flash"), 1800);
  });
  $("highlights").appendChild(card);

  const row = el("article", "dt rv"); row.id = id;
  const m = el("div", "dt-media"); m.appendChild(frame(p.anh || DEFAULT_PIC, p.ten, "r-43"));
  const tx = el("div", "dt-text");
  tx.appendChild(el("div", "no", n));
  tx.appendChild(el("h3", null, p.ten));
  if (p.mo_ta) {
    const d = el("p", "desc clamp", tidy(p.mo_ta)); const b = el("button", "more-btn", "Xem thêm"); b.hidden = true;
    tx.appendChild(d); tx.appendChild(b); requestAnimationFrame(() => clampWithMore(d, b));
  }
  const pr = el("div", "dt-price");
  if (hasPrice(p)) {
    pr.appendChild(el("small", null, "Giá"));
    const b = el("b", null, money(p.gia));
    if (p.don_vi) b.appendChild(el("span", null, " / " + p.don_vi));
    pr.appendChild(b);
  } else { const a = el("a", "ask-btn"); a.href = "#ket-noi"; a.append(svgIcon("b-chat"), "Liên hệ để báo giá"); pr.appendChild(a); }
  tx.appendChild(pr);
  row.appendChild(m); row.appendChild(tx);
  $("details").appendChild(row);
});
if (!products.length) { $("san-pham").remove(); $("chi-tiet").remove(); }

$("leadPic").src = DEFAULT_COVER;
$("eventPic").src = DEFAULT_COVER;

/* Liên hệ gian hàng: SĐT, địa chỉ + các kênh (trống thì ẩn) */
function ctItem(icon, label, value, href) {
  const row = el(href ? "a" : "div", "ct glass");
  if (href) { row.href = href; if (isUrl(href)) { row.target = "_blank"; row.rel = "noopener noreferrer"; } }
  const ic = el("div", "ic"); ic.appendChild(svgIcon(icon));
  const tx = el("div"); tx.appendChild(el("small", null, label)); tx.appendChild(el("b", null, value));
  row.appendChild(ic); row.appendChild(tx); $("ctList").appendChild(row);
}
ctItem("b-phone", "Điện thoại", phoneView(B.sdt), "tel:" + B.sdt);
if (B.dia_chi) ctItem("b-pin", "Địa chỉ", B.dia_chi);
function channelName(url) {
  const h = (url.match(/^https?:\/\/([^/]+)/i) || [, ""])[1].replace(/^www\./, "").toLowerCase();
  const map = { "shopee.vn": "Shopee", "lazada.vn": "Lazada", "youtube.com": "YouTube", "youtu.be": "YouTube", "zalo.me": "Zalo OA", "instagram.com": "Instagram", "tiki.vn": "Tiki" };
  return map[h] || h || "Kênh khác";
}
const socials = [
  ["b-fb", "Facebook", B.facebook], ["b-web", "Website", B.website], ["b-tiktok", "TikTok", B.tiktok], ["b-chat", "Zalo OA", B.zalo_oa],
  ["b-link", B.kenh_khac ? (B.kenh_khac_ten || channelName(B.kenh_khac)) : "", B.kenh_khac]
].filter(s => isUrl(s[2]));
socials.forEach(([ic, label, url]) => {
  const a = el("a", "soc glass"); a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
  a.append(svgIcon(ic), label); $("ctSocial").appendChild(a);
});
if (!socials.length) $("ctSocial").remove();

/* Thanh liên hệ nhanh trên điện thoại */
const mb = $("mbar");
const a1 = el("a"); a1.href = "tel:" + B.sdt; a1.append(svgIcon("b-phone"), "Gọi"); mb.appendChild(a1);
const a3 = el("a", "more"); a3.href = "#ket-noi"; a3.append(svgIcon("b-chat"), "Liên hệ"); mb.appendChild(a3);
const a4 = el("a", "more"); a4.href = "#"; a4.id = "shareBtnM"; a4.setAttribute("role", "button"); a4.append(svgIcon("b-share"), "Chia sẻ"); mb.appendChild(a4);

/* Thông báo trang mẫu: đóng bằng nút, bấm ra ngoài hoặc phím Esc */
const notice = $("notice");
if (notice) {
  const close = () => { notice.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = e => { if (e.key === "Escape") close(); };
  $("noticeOk").onclick = close;
  notice.addEventListener("click", e => { if (e.target === notice) close(); });
  document.addEventListener("keydown", onKey);
  $("noticeOk").focus();
}

/* Hiệu ứng xuất hiện */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll(".rv").forEach(n => io.observe(n));

/* ======================== form khách để lại thông tin ======================== */
$("showTerms").onclick = e => { e.preventDefault(); $("termsBox").open = true; };
$("nhucau").addEventListener("input", e => set("cnt", e.target.value.length));
[["ten", "e-ten"], ["lienhe", "e-lienhe"], ["nhucau", "e-nhucau"]].forEach(([id, err]) =>
  $(id).addEventListener("input", () => { set(err, ""); set("e-submit", ""); }));
$("dongy").addEventListener("change", () => { set("e-dongy", ""); set("e-submit", ""); });
function looksLikeContact(v) {
  v = v.trim();
  return /@/.test(v) ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v.replace(/\D/g, "").length >= 9 || /zalo\.me\//i.test(v);
}
$("leadForm").addEventListener("submit", async e => {
  e.preventDefault();
  const errs = {};
  if (!$("ten").value.trim()) errs.ten = "Vui lòng nhập họ tên hoặc tên đơn vị.";
  if (!looksLikeContact($("lienhe").value)) errs.lienhe = "Nhập số điện thoại (ít nhất 9 số), Zalo hoặc email hợp lệ.";
  if ($("nhucau").value.trim().length < 5) errs.nhucau = "Vui lòng mô tả ngắn nhu cầu của bạn.";
  if (!$("dongy").checked) errs.dongy = "Bạn cần tích đồng ý để gửi thông tin.";
  ["ten", "lienhe", "nhucau", "dongy"].forEach(k => set("e-" + k, errs[k] || ""));
  set("e-submit", "");
  if (Object.keys(errs).length) return;

  if (!SLUG) { $("leadForm").hidden = true; $("done").hidden = false; return; }   // trang mẫu: không gửi đi đâu
  if (!LIVE || LIVE.status !== "ok") {                                               // bản xem trước (chưa duyệt)
    set("e-submit", "Đây là bản xem trước nên chưa nhận thông tin khách. Trang sẽ nhận khi gian hàng được duyệt.");
    return;
  }
  const btn = $("leadBtn"), label = btn.textContent;
  btn.disabled = true; btn.textContent = "Đang gửi…";
  try {
    await API.sendLead(SLUG, { ten: $("ten").value.trim(), lien_he: $("lienhe").value.trim(), nhu_cau: $("nhucau").value.trim(), dong_y: true });
    $("leadForm").hidden = true; $("done").hidden = false;
  } catch (err) {
    set("e-submit", err && err.code === "NOT_CONNECTED" ? "Chưa kết nối máy chủ nhận thông tin." : "Máy chủ báo lỗi, vui lòng thử lại sau.");
  } finally { btn.disabled = false; btn.textContent = label; }
});

/* ======================== chia sẻ: QR + sao chép + chia sẻ qua ứng dụng ======================== */
/* Link chia sẻ luôn là link công khai (không bao giờ kèm mã xem trước ?xem=) */
const SHARE_URL = location.origin + "/gian-hang/" + (SLUG ? "?s=" + encodeURIComponent(SLUG) : "");
function drawQR(canvas, text, size) {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte"); qr.make();
  const n = qr.getModuleCount(), quiet = 4, cell = Math.floor(size / (n + quiet * 2));
  const px = cell * (n + quiet * 2);
  canvas.width = canvas.height = px;
  const g = canvas.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, px, px);
  g.fillStyle = "#000";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    if (qr.isDark(r, c)) g.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
}
const shareModal = $("shareModal");
let lastFocus = null;
function openShare(e) {
  if (e) e.preventDefault();
  lastFocus = document.activeElement;
  set("shareName", B.ten_gian_hang);
  $("shareLink").value = SHARE_URL;
  drawQR($("qrCanvas"), SHARE_URL, 440);
  $("shareNative").hidden = !navigator.share;
  shareModal.hidden = false;
  document.body.style.overflow = "hidden";
  $("shareClose").focus();
}
function closeShare() {
  shareModal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$("shareBtn").addEventListener("click", openShare);
$("shareBtnM").addEventListener("click", openShare);
$("shareClose").addEventListener("click", closeShare);
shareModal.addEventListener("click", e => { if (e.target === shareModal) closeShare(); });
addEventListener("keydown", e => { if (e.key === "Escape" && !shareModal.hidden) closeShare(); });
$("shareLink").addEventListener("focus", e => e.target.select());
$("shareCopy").addEventListener("click", async () => {
  const btn = $("shareCopy");
  try { await navigator.clipboard.writeText(SHARE_URL); } catch (_) { $("shareLink").select(); document.execCommand("copy"); }
  btn.textContent = "Đã sao chép ✓";
  setTimeout(() => { btn.textContent = "Sao chép"; }, 2200);
});
$("shareNative").addEventListener("click", async () => {
  try { await navigator.share({ title: B.ten_gian_hang, text: B.ten_gian_hang + " · IC JCI Khanhhoa 2027", url: SHARE_URL }); }
  catch (_) { /* người dùng đóng bảng chia sẻ: bỏ qua */ }
});
$("shareDl").addEventListener("click", () => {
  const c = document.createElement("canvas");
  drawQR(c, SHARE_URL, 1200);            // bản lớn để in
  c.toBlob(b => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "qr-" + (SLUG || "gian-hang-mau") + ".png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, "image/png");
});

/* Mọi thứ đã dựng xong: chờ ảnh bìa tải (tối đa 2 giây) rồi mới hiện trang, để không bị giật */
const coverEl = $("cover");
if (coverEl && coverEl.src) await Promise.race([coverEl.decode().catch(() => {}), new Promise(r => setTimeout(r, 2000))]);
showPage();
