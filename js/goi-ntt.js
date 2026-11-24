/* goi-ntt.js: dựng trang /nha-tai-tro/ từ /data/goi-ntt.json (4 gói, bảng quyền lợi, hiện vật, quy trình).
   Sửa giá hay quyền lợi: sửa file JSON, không cần sửa HTML. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  /* chống rớt chữ lẻ: dính 2 từ cuối (3 từ nếu từ cuối rất ngắn) bằng khoảng trắng không ngắt */
  var nb = function (t) { return String(t).replace(/ (\S+) (\S{1,3})$/, " $1 $2").replace(/ (\S+)$/, " $1"); };
  var esc2 = esc; esc = function (t) { return esc2(nb(t == null ? "" : t)); };
  var cell = function (v) {
    if (v === "Có") return '<span class="y" aria-label="Có">✓</span>';
    if (v === "Không") return '<span class="n" aria-label="Không">—</span>';
    return esc(v);
  };

  function render(d) {
    /* 4 thẻ gói */
    $("goiList").innerHTML = d.goi.map(function (g) {
      return '<article class="gcard' + (g.noibat ? " gcard--hot" : "") + (g.kc ? " gcard--kc" : "") + '">' +
        '<h3 class="gcard__n"><span>' + esc(g.ten) + '</span></h3>' +
        '<div class="gcard__p">' + esc(g.gia) + '<span> triệu</span></div>' +
        '<ul class="gcard__l"><li>' + esc(g.gala) + '</li></ul>' +
        (g.ghi ? '<div class="gcard__t">' + esc(g.ghi) + '</div>' : "") + '</article>';
    }).join("");

    /* tab chọn gói (chỉ có tác dụng trên điện thoại; máy tính hiện đủ 4 cột) */
    $("goiTabs").innerHTML = d.goi.map(function (g, i) {
      return '<button type="button" role="tab" class="tab' + (i === 0 ? " is-on" : "") + '" data-col="' + (i + 2) + '" aria-selected="' + (i === 0) + '">' + esc(g.ten.replace("NTT ", "")) + '</button>';
    }).join("");

    /* bảng quyền lợi: mỗi nhóm một bảng */
    var head = '<tr><th scope="col">Quyền lợi</th>' + d.goi.map(function (g) { return '<th scope="col">' + esc(g.ten) + '</th>'; }).join("") + '</tr>';
    $("qlList").innerHTML = d.nhom.map(function (n) {
      return '<h3 class="nt__label grp">' + esc(n.ten) + '</h3><div class="qwrap"><table class="qt-table" data-col="2">' + head +
        n.dong.map(function (r) {
          var hl = /^(Khu vực gian hàng|Hỗ trợ xây dựng landing page)/.test(r[0]);
          return '<tr' + (hl ? ' class="hl"' : '') + '>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + cell(c) + '</td>'; }).join("") + '</tr>';
        }).join("") + '</table></div>';
    }).join("");
    $("qlNote").textContent = d.luuy || "";

    $("goiTabs").addEventListener("click", function (e) {
      var b = e.target.closest(".tab"); if (!b) return;
      [].forEach.call($("goiTabs").children, function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", x === b); });
      [].forEach.call(document.querySelectorAll(".qt-table"), function (t) { t.setAttribute("data-col", b.dataset.col); });
    });

    /* hiện vật */
    $("hvPct").textContent = d.hienvat.tyle;
    $("hvMota").textContent = d.hienvat.mota;
    $("hvLuuy").innerHTML = d.hienvat.luuy.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("hvList").innerHTML = '<h3 class="card__t">Các hạng mục hiện vật cần hỗ trợ</h3><dl>' +
      d.hienvat.hangmuc.map(function (h) { return "<dt>" + esc(h[0]) + "</dt><dd>" + esc(h[1]) + "</dd>"; }).join("") + "</dl>";

    /* quy trình */
    $("steps").innerHTML = d.buoc.map(function (s) {
      return "<li><div><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div></li>";
    }).join("");
  }

  fetch("/data/goi-ntt.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(render)
    .catch(function () {
      var m = '<p class="nt__note">Không tải được nội dung. Vui lòng tải lại trang hoặc xem hồ sơ mời tài trợ ở nút phía trên.</p>';
      $("goiList").innerHTML = m;
    });

  var cp = $("stkCopy");
  if (cp) cp.addEventListener("click", function () {
    var v = $("stk").textContent.trim();
    var done = function () { cp.textContent = "Đã sao chép"; setTimeout(function () { cp.textContent = "Sao chép"; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () { cp.textContent = "Chọn và sao chép"; }); else cp.textContent = "Chọn và sao chép";
  });
})();
