/* Cấu hình chung cho mọi trang.
   Khóa SUPABASE_KEY dạng "publishable" được phép công khai (dữ liệu đã khóa bằng RLS, trình duyệt chỉ gọi được các hàm RPC).
   Hạ tầng dùng lại NGUYÊN VẸN từ trang hội chợ cũ: cùng Supabase (không đổi database), cùng webhook n8n xin link đẩy ảnh, cùng R2;
   chỉ đổi TENANT và R2_FOLDER.

   MODE "local": mô phỏng, KHÔNG gọi mạng (ảnh và đăng ký đều giả lập, không lưu gì).
   MODE "live":  gửi thật.

   RPC: tên các hàm Supabase. Trang gian hàng dùng đúng 4 hàm cũ (đã kiểm tra bằng truy vấn pg_proc, anon gọi được):
     lay_gian_hang(p_slug, p_xem) · gui_khach_de_lai(p_slug, p) · lay_khach_cua_gian_hang(p_slug, p_token) · doi_ma_quan_ly(p_slug, p_token)
   dangKyKhach (đăng ký THAM DỰ ở trang chủ) nằm ở project Supabase KHÁC: project của ứng dụng check-in (REG_SUPABASE_*),
   ghi một chiều qua hàm dang_ky_khach (xem files/dang-ky-khach.sql). Các hàm gian hàng còn lại vẫn ở project hội chợ (SUPABASE_*).
   Để trống tên hàm = ở MODE "live" form báo "chưa kết nối" thay vì gửi bừa. */
window.APP_CONFIG = {
  MODE: "live",
  SUPABASE_URL: "https://ezumzkgsbdophewlxbey.supabase.co",
  SUPABASE_KEY: "sb_publishable_qvTN__UNXzQXIm6cUvCr_w_1fZgBLZK",
  REG_SUPABASE_URL: "https://zidiidhpnzanyazkybjh.supabase.co",   // project check-in (đăng ký tham dự)
  REG_SUPABASE_KEY: "sb_publishable_7ahlJVZ6hngjkIdY02eK8w_YFsJxLBq",
  N8N_IMG_WEBHOOK: "https://binn8nauto.io.vn/webhook/dang-ky-gian-img", // xin presigned URL để trình duyệt tự đẩy ảnh lên R2
  TENANT: "ic2027",
  R2_FOLDER: "ic-jcikhanhhoa-2027",              // thư mục trong bucket chuyendoiso-assets/uploads/
  RPC: {
    dangKyTalent: "dang_ky_talent",               // đăng ký tiết mục (/talent/): hàm ở project check-in
    dangKyKhach: "dang_ky_khach",                 // đăng ký tham dự (form ở trang chủ): hàm ở project check-in
    layGianHang: "lay_gian_hang",                 // /gian-hang/?s=
    guiKhachDeLai: "gui_khach_de_lai",            // khách để lại thông tin cho gian hàng
    layKhachCuaGianHang: "lay_khach_cua_gian_hang", // /chu-gian-hang/?s=#mã
    doiMaQuanLy: "doi_ma_quan_ly"                 // đổi mã quản lý
  }
};
