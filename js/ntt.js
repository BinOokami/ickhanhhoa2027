/* ntt.js: vẽ danh sách nhà tài trợ từ /data/ntt.json vào #nttList.
   Thêm NTT = thêm một dòng vào file JSON, không cần sửa HTML/CSS. Hạng: kc | vang | bac | dh.
   Hạng nào chưa có NTT thì không hiện. Chưa có NTT nào: hiện dòng "đang được cập nhật". */
(function () {
  var TIERS = [
    { key: "kc",   name: "Kim Cương" },
    { key: "vang", name: "Vàng" },
    { key: "bac",  name: "Bạc" },
    { key: "dh",   name: "Đồng hành" }
  ];
  var box = document.getElementById("nttList");
  var empty = document.getElementById("nttEmpty");
  if (!box) return;

  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }   // chỉ nhận link http/https

  function tile(it) {
    var url = safeUrl(it.url);
    var el = document.createElement(url ? "a" : "div");
    el.className = "logo";
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener sponsored"; el.title = it.name; }
    el.setAttribute("aria-label", it.name);
    var img = document.createElement("img");
    img.src = it.logo; img.alt = it.name; img.loading = "lazy";
    img.onerror = function () { img.remove(); el.textContent = it.name; };   // ảnh lỗi: hiện chữ tên NTT
    el.appendChild(img);
    return el;
  }

  fetch("/data/ntt.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (d) {
      var items = (d && d.items) || [];
      var shown = 0;
      TIERS.forEach(function (t) {
        var list = items.filter(function (it) { return it.tier === t.key && it.logo; });
        if (!list.length) return;
        shown += list.length;
        var tier = document.createElement("div"); tier.className = "tier tier--" + t.key;
        var h = document.createElement("h3"); h.className = "tier__name"; h.textContent = t.name;
        var logos = document.createElement("div"); logos.className = "tier__logos";
        list.forEach(function (it) { logos.appendChild(tile(it)); });
        tier.appendChild(h); tier.appendChild(logos); box.appendChild(tier);
      });
      if (shown && empty) empty.hidden = true;
    })
    .catch(function () { /* lỗi tải: giữ dòng "đang được cập nhật" */ });
})();
