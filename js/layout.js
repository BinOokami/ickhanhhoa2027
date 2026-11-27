/* layout.js: thanh menu và chân trang DÙNG CHUNG cho mọi trang.
   Mỗi trang chỉ cần 2 ô trống: <div id="site-nav"></div> (đầu trang) và <div id="site-foot"></div> (cuối trang),
   rồi nạp file này ở cuối <body>. Sửa menu/chân trang ở ĐÂY là đổi cả website.
   Link neo (#...) tự thêm "/" phía trước khi đang ở trang con, để bấm là quay về trang chủ rồi cuộn tới đúng mục. */
(function () {
  var path = location.pathname;
  var home = /^\/(index\.html)?$/.test(path);
  var a = function (hash) { return (home ? '' : '/') + hash; };
  var here = function (prefix) { return path.indexOf(prefix) === 0 ? ' aria-current="page"' : ''; };

  // cụm logo đơn vị (thứ tự: YBA HCM → JCI Vietnam → JCI Khanhhoa), nằm đầu thanh menu bên trái
  var PARTNERS =
    '<a class="nav__partners" href="#top" aria-label="Về đầu trang">' +
      '<img src="/assets/doi-tac/yba-hcm.png" alt="Hội Doanh nhân trẻ TP. Hồ Chí Minh (YBA HCM)" width="144" height="140">' +
      '<img src="/assets/doi-tac/jci-vietnam.png" alt="JCI Vietnam" width="291" height="140">' +
      '<img src="/assets/doi-tac/jci-khanhhoa.png" alt="JCI Khanhhoa" width="292" height="140">' +
    '</a>';

  var NAV =
    '<header class="nav" id="nav">' +
    '<nav class="nav__bar" aria-label="Điều hướng chính">' +
      '<div class="nav__side nav__side--l">' +
        '<button type="button" class="nav__burger" id="navBurger" aria-label="Mở menu" aria-expanded="false" aria-controls="navDrawer"><i></i><i></i><i></i></button>' +
        PARTNERS +
        '<a class="nav__link" href="' + a('#ve-jci') + '">JCI Khanhhoa</a>' +
        '<a class="nav__link" href="' + a('#ban-dieu-hanh-2027') + '">Ban điều hành 2027</a>' +
        '<a class="nav__link" href="' + a('#noi-dung-chuong-trinh') + '">Agenda</a>' +
      '</div>' +
      '<a class="nav__logo" href="#top" aria-label="Lead Together: về đầu trang">' +
        '<img src="/assets/logo-lead-together-nobg.webp" alt="Logo nhiệm kỳ 2027 JCI Khanhhoa, Lead Together" width="720" height="630"></a>' +
      '<div class="nav__side nav__side--r">' +
        '<a class="nav__link" href="' + a('#cau-chuyen') + '">Lead Together</a>' +
        '<a class="nav__link" href="/khung-hinh/" target="_blank" rel="noopener"' + here('/khung-hinh') + '>Khung avatar</a>' +
        '<a class="nav__link" href="' + a('#nha-tai-tro') + '">Nhà tài trợ</a>' +
        /* TẠM ẨN: mục Gian hàng, chờ hoàn tất tích hợp. Mở lại bằng cách bỏ chú thích 2 dòng "Gian hàng" (nav + drawer)
        // '<a class="nav__link" href="/gian-hang/" target="_blank" rel="noopener"' + here('/gian-hang') + '>Gian hàng</a>' +
        */
        '<a class="nav__link" href="#lien-he">Liên hệ</a>' +
        '<a class="btn" href="' + a('#dang-ky') + '">Tham dự</a>' +
      '</div>' +
    '</nav></header>';

  var ico = function (id) { return '<svg aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>'; };
  var FOOT =
    '<footer class="foot" id="lien-he" aria-label="Thông tin liên hệ">' +
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
      '<symbol id="i-pin" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></symbol>' +
      '<symbol id="i-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/></g></symbol>' +
      '<symbol id="i-phone" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></symbol>' +
      '<symbol id="i-globe" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></g></symbol>' +
      '<symbol id="i-fb" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z"/></symbol>' +
    '</svg>' +
    '<div class="foot__inner">' +
      // trái: thông tin JCI Khanhhoa (quan trọng hơn)
      '<div class="foot__col foot__col--jci">' +
        '<a class="foot__logo" href="https://www.jcikhanhhoa.org/" target="_blank" rel="noopener" aria-label="JCI Khanhhoa"><img src="/assets/logo-jci-khanhhoa.webp" alt="Logo JCI Khanhhoa" width="480" height="480" loading="lazy"></a>' +
        '<div>' +
          '<h2 class="foot__title">Về JCI Khanhhoa</h2>' +
          '<p class="foot__tag">Môi trường phát triển dành cho những nhà lãnh đạo trẻ.</p>' +
          '<ul class="foot__list">' +
            '<li>' + ico('globe') + '<a href="https://www.jcikhanhhoa.org/" target="_blank" rel="noopener">jcikhanhhoa.org</a></li>' +
            '<li>' + ico('fb') + '<a href="https://www.facebook.com/JCIKhanhHoa" target="_blank" rel="noopener">facebook.com/JCIKhanhHoa</a></li>' +
            '<li>' + ico('pin') + '<span>Nha Trang, Khánh Hòa, Việt Nam</span></li>' +
            '<li>' + ico('mail') + '<a href="mailto:jcikhanhhoa@gmail.com">jcikhanhhoa@gmail.com</a></li>' +
            '<li>' + ico('phone') + '<a href="tel:0772727872">0772727872</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      // phải: ban tổ chức sự kiện
      '<div class="foot__col">' +
        '<h2 class="foot__title">Về chương trình</h2>' +
        '<div class="foot__people">' +
          '<div class="foot__person">' +
            '<div class="foot__row"><p class="foot__who">ED Trần An Bình</p><a class="foot__tel" href="tel:0792200375">' + ico('phone') + '079 22 00 375</a></div>' +
            '<p class="foot__role">Event Director</p>' +
            '<a class="foot__mail" href="mailto:binnovasolutions.vn@gmail.com">' + ico('mail') + 'binnovasolutions.vn@gmail.com</a>' +
          '</div>' +
          '<div class="foot__person">' +
            '<div class="foot__row"><p class="foot__who">VED Bảo Lê</p><a class="foot__tel" href="tel:0935751276">' + ico('phone') + '0935 751 276</a></div>' +
            '<p class="foot__role">Hỗ trợ khách mời &amp; Gian hàng</p>' +
          '</div>' +
          '<div class="foot__person">' +
            '<div class="foot__row"><p class="foot__who">VED Thục Vy</p><a class="foot__tel" href="tel:0706031947">' + ico('phone') + '0706 031 947</a></div>' +
            '<p class="foot__role">Điều phối sự kiện</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="foot__bottom"><p>&copy; 2026 JCI Khanhhoa &middot; 2027 JCI Khanhhoa Inauguration Ceremony &middot; Lead Together</p><p class="foot__credit">Thiết kế và phát triển bởi ED Trần An Bình</p></div></footer>';

  var put = function (id, html) {
    var slot = document.getElementById(id);
    if (!slot) return null;
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var el = tpl.content.firstElementChild;
    slot.replaceWith(el);
    return el;
  };
  var nav = put('site-nav', NAV);
  put('site-foot', FOOT);

  // menu rút gọn trên màn hẹp: bấm nút ba gạch thì ngăn kéo trượt ra từ bên trái (cùng danh sách link với thanh menu rộng)
  var DRAWER =
    '<div class="drawer" id="navDrawer" hidden>' +
      '<div class="drawer__bg" data-close></div>' +
      '<aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">' +
        '<div class="drawer__head"><span>Menu</span><button type="button" class="drawer__x" data-close aria-label="Đóng menu">&times;</button></div>' +
        '<nav class="drawer__links">' +
          '<a href="' + a('#ve-jci') + '">Về JCI Khanhhoa</a>' +
          '<a href="' + a('#noi-dung-chuong-trinh') + '">Agenda</a>' +
          '<a href="' + a('#ban-dieu-hanh-2027') + '">Ban điều hành 2027</a>' +
          '<a href="' + a('#cau-chuyen') + '">Lead Together</a>' +
          '<a href="/khung-hinh/" target="_blank" rel="noopener"' + here('/khung-hinh') + '>Khung avatar</a>' +
          '<a href="' + a('#nha-tai-tro') + '">Nhà tài trợ</a>' +
          /* TẠM ẨN: Gian hàng (xem chú thích ở nav)
          '<a href="/gian-hang/" target="_blank" rel="noopener"' + here('/gian-hang') + '>Gian hàng</a>' +
          */
          '<a href="#lien-he">Thông tin liên hệ</a>' +
        '</nav>' +
        '<div class="drawer__contact">' +
          '<a href="tel:0792200375"><b>Hotline</b><span>079 22 00 375</span></a>' +
          '<a href="mailto:binnovasolutions.vn@gmail.com"><b>Email</b><span>binnovasolutions.vn@gmail.com</span></a>' +
        '</div>' +
      '</aside>' +
    '</div>';
  var burger = document.getElementById('navBurger');
  if (nav && burger) {
    document.body.insertAdjacentHTML('beforeend', DRAWER);
    var drawer = document.getElementById('navDrawer');
    var setOpen = function (open) {
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) drawer.querySelector('.drawer__links a').focus(); else burger.focus();
    };
    burger.addEventListener('click', function () { setOpen(drawer.hidden); });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || e.target.closest('a')) setOpen(false);
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) setOpen(false); });
    addEventListener('resize', function () { if (innerWidth > 1140 && !drawer.hidden) setOpen(false); });
  }

  // chỉ hiện thanh menu sau khi phông chữ tải xong (hoặc tối đa 1,2 giây) để chữ không đổi độ rộng làm menu giật lúc mở trang
  if (nav) {
    var ready = function () { nav.classList.add('is-ready'); };
    var fonts = document.fonts && document.fonts.ready;
    if (fonts) { Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1200); })]).then(ready, ready); } else ready();
  }

  // thanh menu đặc dần khi cuộn khỏi đầu trang
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-solid', window.scrollY > 40);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }
})();
