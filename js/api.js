/* api.js: lớp DUY NHẤT nói chuyện với máy chủ. Các trang chỉ gọi window.API.*
   MODE "local" mô phỏng (không gọi mạng); MODE "live" gọi Supabase (RPC) và n8n/R2 (ảnh). Xem js/config.js.
   Ảnh KHÔNG đi qua máy chủ của mình: trình duyệt xin link đẩy ảnh từ n8n rồi tự PUT thẳng lên R2; đăng ký chỉ gửi URL ảnh. */
(function () {
  var C = window.APP_CONFIG;
  var SERVER_ERR = "Máy chủ báo lỗi, vui lòng thử lại sau.";
  var UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var notConnected = function () { return Object.assign(new Error("Chưa kết nối máy chủ."), { code: "NOT_CONNECTED" }); };

  /* Trả về tên hàm RPC; chưa điền thì báo "chưa kết nối". */
  function rpcName(key) {
    var n = C.RPC && C.RPC[key];
    if (!n) throw notConnected();
    return n;
  }
  /* Gọi TRƯỚC khi làm việc tốn kém (vd tải ảnh), để khỏi tải ảnh rồi mới biết chưa có nơi nhận. */
  function ready(key) { if (C.MODE === "live") rpcName(key); }

  /* noReply: không nhận được câu trả lời (mất mạng, cổng quá tải) nên CHƯA BIẾT máy chủ đã ghi hay chưa */
  var noReply = function () { return Object.assign(new Error(SERVER_ERR), { noReply: true }); };

  /* project: mặc định là project hội chợ; đăng ký tham dự truyền project check-in */
  async function rpc(key, body, project) {
    var name = rpcName(key), res, p = project || { url: C.SUPABASE_URL, key: C.SUPABASE_KEY };
    try {
      res = await fetch(p.url + "/rest/v1/rpc/" + name, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: p.key }, body: JSON.stringify(body)
      });
    } catch (_) { throw noReply(); }
    if (res.status >= 502 && res.status <= 504) throw noReply();
    if (!res.ok) throw new Error(SERVER_ERR);   // mọi lỗi từ máy chủ chỉ báo chung, không nêu chi tiết ra giao diện
    return res.json().catch(function () { return null; });
  }

  /* ---------- ảnh: xin link của n8n rồi tự đẩy thẳng lên R2 ---------- */
  var EXT = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
  function slugify(t) {
    return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }
  /* blob: ảnh đã cắt/nén. subFolder: thư mục con trong R2 (vd "avatar"). base: dùng đặt tên file. Trả về URL lưu vào đăng ký. */
  async function uploadImage(blob, subFolder, base) {
    var type = blob.type || "image/webp";
    var fileName = (slugify(base) || "anh") + "-" + Date.now().toString(36) + "." + (EXT[type] || "webp");
    if (C.MODE === "local") { await sleep(350); return "local://" + subFolder + "/" + fileName; }
    var folder = subFolder ? C.R2_FOLDER + "/" + subFolder : C.R2_FOLDER;   // subFolder rỗng: ảnh nằm thẳng trong thư mục của sự kiện
    try {
      var res = await fetch(C.N8N_IMG_WEBHOOK, {
        method: "POST", headers: { "Content-Type": "application/json" },
        /* KHÔNG gửi "tenant": webhook n8n trả 200 với nội dung RỖNG khi gặp tenant nó chưa biết ("ic2027"), thiếu tenant thì cấp link bình thường (đã thử) */
        body: JSON.stringify({ fileName: fileName, contentType: type, folder: folder })
      });
      if (!res.ok) throw 0;
      var data = await res.json();
      if (Array.isArray(data)) data = data[0];
      var uploadUrl = (data && data.data && data.data.uploadUrl) || (data && data.uploadUrl);
      var fileUrl = (data && data.data && data.data.fileUrl) || (data && data.fileUrl);
      if (!uploadUrl || !fileUrl) throw 0;
      var up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": type }, body: blob });
      if (!up.ok) throw 0;
      return fileUrl;
    } catch (_) { throw new Error(SERVER_ERR); }
  }

  /* ---------- đăng ký tham dự ---------- */
  /* Hàm dang_ky_khach trả {ok:false,error} khi từ chối (vd SĐT đã đăng ký) và {ok:true,code,gala,fee} khi thành công.
     Từ chối -> ném lỗi mang đúng câu báo của máy chủ để form hiện nguyên văn. */
  async function registerGuest(payload) {
    if (C.MODE === "local") { await sleep(700); return { ok: true, local: true, code: "IC-JCIKH27-DEMO00", gala: !!payload.attendGala, fee: payload.galaFee || 0 }; }   // chế độ thử: không lưu gì
    var data = await rpc("dangKyKhach", { p: payload }, { url: C.REG_SUPABASE_URL, key: C.REG_SUPABASE_KEY });
    if (!data) throw noReply();
    if (data.ok === false) throw Object.assign(new Error(data.error || SERVER_ERR), { duplicate: !!data.duplicate });
    return { ok: true, code: data.code || "", gala: !!data.gala, fee: data.fee || 0 };
  }

  /* ---------- đăng ký tiết mục Talent (/talent/): cùng project check-in ---------- */
  async function registerTalent(payload) {
    if (C.MODE === "local") { await sleep(500); return; }
    var data = await rpc("dangKyTalent", { p: payload }, { url: C.REG_SUPABASE_URL, key: C.REG_SUPABASE_KEY });
    if (!data) throw noReply();
    if (data.ok === false) throw new Error(data.error || SERVER_ERR);
  }

  /* Slug "mau" luôn là gian hàng MẪU ở mọi chế độ (không gọi máy chủ, không ghi gì), để xem giao diện kể cả khi MODE "live".
     Slug thật luôn có hậu tố ngẫu nhiên (ten-xxxxx) nên không thể trùng "mau". */
  var isSample = function (slug) { return slug === "mau"; };

  /* ---------- gian hàng (công khai) ---------- */
  /* Trả về dữ liệu gian hàng, hoặc null nếu không có / chưa được duyệt. xem = mã xem trước của Ban tổ chức. */
  async function getBooth(slug, xem) {
    if (isSample(slug) || C.MODE === "local") {
      await sleep(300);
      return isSample(slug) && window.SAMPLE_BOOTH ? Object.assign({ status: "ok" }, window.SAMPLE_BOOTH) : null;
    }
    return rpc("layGianHang", { p_slug: slug, p_xem: xem || null });
  }
  async function sendLead(slug, payload) {
    if (isSample(slug) || C.MODE === "local") { await sleep(500); return; }
    await rpc("guiKhachDeLai", { p_slug: slug, p: payload });
  }

  /* ---------- trang chủ gian hàng (mã quản lý nằm sau dấu #) ---------- */
  async function getOwnerData(slug, token) {
    if (isSample(slug) || C.MODE === "local") {
      await sleep(300);
      if (!isSample(slug) || !UUID.test(token)) return null;
      var now = Date.now();
      return {
        ten_gian_hang: window.SAMPLE_BOOTH ? window.SAMPLE_BOOTH.ten_gian_hang : "Gian hàng mẫu", logo: "", status: "ok", so_lead: 2,
        leads: [
          { ten: "Nguyễn Văn A / Công ty ABC", lien_he: "0905123456", nhu_cau: "Cần báo giá số lượng lớn cho sự kiện cuối năm.", luc: new Date(now - 3600e3).toISOString() },
          { ten: "Trần Thị B", lien_he: "khach@example.com", nhu_cau: "Muốn hẹn gặp trao đổi hợp tác sau lễ.", luc: new Date(now - 86400e3).toISOString() }
        ]
      };
    }
    return rpc("layKhachCuaGianHang", { p_slug: slug, p_token: token });
  }
  async function rotateOwnerToken(slug, token) {
    if (isSample(slug) || C.MODE === "local") { await sleep(300); return { owner_token: crypto.randomUUID() }; }
    return rpc("doiMaQuanLy", { p_slug: slug, p_token: token });
  }

  window.API = { ready: ready, uploadImage: uploadImage, registerGuest: registerGuest, registerTalent: registerTalent, getBooth: getBooth, sendLead: sendLead,
                 getOwnerData: getOwnerData, rotateOwnerToken: rotateOwnerToken, slugify: slugify, UUID: UUID };
})();
