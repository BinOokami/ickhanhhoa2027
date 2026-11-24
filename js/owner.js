/* Trang chủ gian hàng xem khách quan tâm. Vào bằng link: /chu-gian-hang/?s=<slug>#<owner_token>
   Mã nằm sau dấu # nên không gửi lên máy chủ; được nhớ trong localStorage của thiết bị. Mọi dữ liệu hiển thị bằng textContent (không chèn HTML).
   Dữ liệu lấy qua window.API (js/api.js): getOwnerData, rotateOwnerToken. Dùng thử ở chế độ local: /chu-gian-hang/?s=mau#<một UUID bất kỳ>. */
(function () {
  const $ = id => document.getElementById(id);
  const SLUG = (new URLSearchParams(location.search).get("s") || "").trim();
  const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const LS_KEY = "ic2027_owner_" + SLUG;
  let TOKEN = "", DATA = null;

  const show = id => ["stLoading", "stAsk", "stMain", "stErr"].forEach(x => { $(x).hidden = x !== id; });
  function showError(title, msg) { $("errTitle").textContent = title; $("errMsg").textContent = msg; show("stErr"); }

  const publicLink = () => `${location.origin}/gian-hang/?s=${encodeURIComponent(SLUG)}`;
  const ownerLink = t => `${location.origin}/chu-gian-hang/?s=${encodeURIComponent(SLUG)}#${t}`;

  function askForToken(msg) {
    $("askMsg").textContent = msg || $("askMsg").textContent;
    $("tokIn").value = ""; $("askErr").textContent = "";
    show("stAsk");
  }

  async function load(token, fromUser, triedSaved) {
    show("stLoading");
    let data;
    try { data = await API.getOwnerData(SLUG, token); }
    catch (_) { showError("Chưa tải được trang", "Máy chủ báo lỗi, vui lòng thử lại sau."); return; }
    if (!data) {
      const saved = localStorage.getItem(LS_KEY);
      // Link sai mã (cũ/sai) nhưng máy này đã lưu mã đúng: dùng mã đã lưu, không làm mất nó
      if (!triedSaved && saved && saved !== token && UUID.test(saved)) {
        history.replaceState(null, "", `?s=${encodeURIComponent(SLUG)}`);
        return load(saved, false, true);
      }
      if (saved === token) localStorage.removeItem(LS_KEY);   // chỉ xóa khi chính mã đã lưu bị hết hiệu lực
      askForToken("Mã quản lý không đúng hoặc đã hết hiệu lực (có thể link đã được đổi). Hãy dán mã mới từ email gần nhất của Ban tổ chức.");
      if (fromUser) $("askErr").textContent = "Mã chưa đúng, vui lòng kiểm tra lại.";
      return;
    }
    TOKEN = token; DATA = data;
    localStorage.setItem(LS_KEY, token);
    render();
  }

  const STATUS = { ok: ["Đang công khai", "ok"], pending: ["Đang chờ duyệt", "pending"], hidden: ["Đã ẩn", ""] };

  function contactNode(v) {
    const t = String(v || "").trim();
    const a = document.createElement("a");
    a.className = "lead-contact";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) a.href = "mailto:" + t;
    else if (/^https?:\/\/(www\.)?zalo\.me\//i.test(t)) { a.href = t; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else if (t.replace(/\D/g, "").length >= 9) a.href = "tel:" + t.replace(/[^\d+]/g, "");
    else { const s = document.createElement("span"); s.className = "lead-contact"; s.textContent = t; return s; }
    a.textContent = t;
    return a;
  }

  function render() {
    const d = DATA;
    $("pageTitle").textContent = "Khách quan tâm gian hàng của bạn";
    $("ownName").textContent = d.ten_gian_hang || "";
    const logo = $("ownLogo");
    if (d.logo && /^https:\/\//.test(d.logo)) { logo.src = d.logo; logo.hidden = false; } else logo.hidden = true;
    const [txt, cls] = STATUS[d.status] || ["", ""];
    const b = $("ownStatus"); b.textContent = txt; b.className = "badge " + cls;
    $("ownPublic").value = publicLink();
    $("ownCount").textContent = d.so_lead || 0;

    const leads = d.leads || [];
    let hint = "";
    if (d.status !== "ok") hint = "Gian hàng chưa được công khai nên chưa nhận thông tin khách.";
    else if ((d.so_lead || 0) > leads.length) hint = `Đang hiển thị ${leads.length} khách mới nhất. Tải CSV để lấy đủ danh sách hiện có.`;
    $("ownHint").textContent = hint; $("ownHint").hidden = !hint;

    const box = $("leadList"); box.textContent = "";
    if (!leads.length) {
      const e = document.createElement("div"); e.className = "empty";
      e.textContent = d.status === "ok" ? "Chưa có khách nào để lại thông tin. Danh sách sẽ hiện ở đây khi có khách mới." : "Chưa có khách nào.";
      box.appendChild(e);
    }
    leads.forEach(l => {
      const it = document.createElement("div"); it.className = "lead-item";
      const top = document.createElement("div"); top.className = "lead-top";
      const n = document.createElement("b"); n.textContent = l.ten;
      const tm = document.createElement("time"); tm.dateTime = l.luc;
      tm.textContent = new Date(l.luc).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
      top.append(n, tm);
      const need = document.createElement("div"); need.className = "lead-need"; need.textContent = l.nhu_cau;
      it.append(top, need, contactNode(l.lien_he));
      box.appendChild(it);
    });
    $("rotated").hidden = true;
    show("stMain");
  }

  /* ---------- sao chép ---------- */
  function wireCopy(btnId, inputId) {
    $(btnId).addEventListener("click", async () => {
      const inp = $(inputId), btn = $(btnId), old = btn.textContent;
      try { await navigator.clipboard.writeText(inp.value); } catch (_) { inp.select(); document.execCommand("copy"); }
      btn.textContent = "Đã sao chép ✓"; setTimeout(() => { btn.textContent = old; }, 2000);
    });
  }
  wireCopy("copyPublic", "ownPublic"); wireCopy("copyNew", "newLink");

  /* ---------- tải CSV ---------- */
  function csvCell(v) {
    let s = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;            // chặn chèn công thức khi mở bằng Excel
    return '"' + s.replace(/"/g, '""') + '"';
  }
  $("btnCsv").addEventListener("click", () => {
    const rows = [["Thời gian", "Họ tên / đơn vị", "Phương thức liên hệ", "Nhu cầu"]];
    (DATA.leads || []).forEach(l => rows.push([new Date(l.luc).toLocaleString("vi-VN"), l.ten, l.lien_he, l.nhu_cau]));
    const csv = "\ufeff" + rows.map(r => r.map(csvCell).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "khach-" + SLUG + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  $("btnReload").addEventListener("click", () => load(TOKEN));

  /* ---------- thoát: xóa mã đã nhớ khỏi thiết bị này ---------- */
  $("btnLogout").addEventListener("click", () => {
    localStorage.removeItem(LS_KEY);
    TOKEN = ""; DATA = null;
    history.replaceState(null, "", `?s=${encodeURIComponent(SLUG)}`);      // bỏ mã khỏi thanh địa chỉ
    $("leadList").textContent = ""; $("ownName").textContent = ""; $("ownPublic").value = ""; $("newLink").value = "";
    askForToken("Đã thoát khỏi thiết bị này. Muốn xem lại khách, hãy mở link trong email của Ban tổ chức.");
  });

  /* ---------- hộp thoại (thay cho confirm/alert của trình duyệt) ---------- */
  function dialog({ title, text, okLabel, cancelLabel, danger, info }) {
    return new Promise(resolve => {
      const bg = $("dlg"), ok = $("dlgOk"), cancel = $("dlgCancel"), ic = $("dlgIcon");
      $("dlgTitle").textContent = title; $("dlgText").textContent = text;
      ok.textContent = okLabel || "Đồng ý"; cancel.textContent = cancelLabel || "Hủy";
      cancel.hidden = !!info;
      ok.className = "btn" + (danger ? " btn-warn" : "");
      ic.className = "dlg-ic" + (info ? " info" : "");
      const prev = document.activeElement;
      const done = v => {
        bg.hidden = true; document.body.style.overflow = "";
        ok.onclick = cancel.onclick = bg.onclick = null; removeEventListener("keydown", onKey);
        if (prev && prev.focus) prev.focus();
        resolve(v);
      };
      const onKey = e => { if (e.key === "Escape") done(false); };
      ok.onclick = () => done(true); cancel.onclick = () => done(false);
      bg.onclick = e => { if (e.target === bg) done(false); };
      addEventListener("keydown", onKey);
      bg.hidden = false; document.body.style.overflow = "hidden";
      (info ? ok : cancel).focus();                 // mặc định focus vào nút an toàn
    });
  }

  /* ---------- đổi link quản lý ---------- */
  $("btnRotate").addEventListener("click", async () => {
    const yes = await dialog({
      title: "Đổi link quản lý?",
      text: "Link cũ (trong email) sẽ hết hiệu lực ngay.\nBạn cần lưu lại link mới sau khi đổi.",
      okLabel: "Đổi link", cancelLabel: "Hủy", danger: true
    });
    if (!yes) return;
    const btn = $("btnRotate"); btn.disabled = true;
    try {
      const r = await API.rotateOwnerToken(SLUG, TOKEN);
      if (!r || !r.owner_token) { showError("Không đổi được", "Mã hiện tại đã hết hiệu lực. Vui lòng mở lại link mới nhất."); return; }
      TOKEN = r.owner_token; localStorage.setItem(LS_KEY, TOKEN);
      history.replaceState(null, "", `?s=${encodeURIComponent(SLUG)}#${TOKEN}`);
      $("newLink").value = ownerLink(TOKEN); $("rotated").hidden = false;
    } catch (_) { await dialog({ title: "Đổi link chưa được", text: "Máy chủ báo lỗi, vui lòng thử lại sau.", okLabel: "Đã hiểu", info: true }); }
    finally { btn.disabled = false; }
  });

  /* ---------- nhập mã tay ---------- */
  function submitToken() {
    const t = $("tokIn").value.trim().replace(/^#?t?=?/, "");
    if (!UUID.test(t)) { $("askErr").textContent = "Mã không đúng định dạng. Hãy dán đủ đoạn mã trong link."; return; }
    history.replaceState(null, "", `?s=${encodeURIComponent(SLUG)}#${t}`);
    load(t, true);
  }
  $("tokGo").addEventListener("click", submitToken);
  $("tokIn").addEventListener("keydown", e => { if (e.key === "Enter") submitToken(); });

  /* ---------- khởi động ---------- */
  if (!SLUG) { showError("Link chưa đúng", "Đường dẫn thiếu mã gian hàng. Vui lòng mở lại link trong email của Ban tổ chức."); return; }
  const fromHash = location.hash.slice(1).replace(/^t=/, "");
  const token = UUID.test(fromHash) ? fromHash : (localStorage.getItem(LS_KEY) || "");
  if (UUID.test(token)) load(token); else askForToken();
})();
