/* sample-booth.js: dữ liệu MẪU cho trang gian hàng (/gian-hang/ không có ?s=) và cho chế độ "local".
   Tất cả là dữ liệu giả để xem giao diện: tên doanh nghiệp, sản phẩm, số điện thoại, đường dẫn đều không có thật.
   Trường tùy chọn (trống thì tự ẩn): logo, anh_bia, anh_gioi_thieu, khau_hieu, ma_gian, nhom_san_pham, dia_chi, facebook, website, tiktok, zalo_oa, kenh_khac.
   Ảnh đang là ảnh tạm: thay bằng ảnh thật khi có. */
window.SAMPLE_BOOTH = {
  ten_gian_hang: "Công ty ABC Solutions",
  khau_hieu: "Giải pháp công nghệ đồng hành cùng doanh nghiệp Khánh Hòa.",
  ma_gian: "A01",
  nhom_san_pham: "Công nghệ & chuyển đổi số",
  logo: "",
  anh_bia: "",
  anh_gioi_thieu: "https://picsum.photos/id/1048/1200/960",
  gioi_thieu: "ABC Solutions là doanh nghiệp công nghệ tại Nha Trang, tập trung vào phần mềm quản trị và chuyển đổi số cho doanh nghiệp vừa và nhỏ.\n\nĐây là nội dung mẫu để xem giao diện. Khi gian hàng thật được duyệt, phần này hiện câu chuyện và giới thiệu do chính nhà tài trợ viết.\n\nNhà tài trợ có thể giới thiệu lĩnh vực hoạt động, thế mạnh, khách hàng tiêu biểu và mong muốn kết nối tại buổi Business Matching của chương trình.",
  sdt: "0900000000",
  dia_chi: "Nha Trang, Khánh Hòa",
  facebook: "https://www.facebook.com/",
  website: "https://example.com/",
  tiktok: "",
  zalo_oa: "",
  kenh_khac: "",
  san_pham: [
    { ten: "Phần mềm quản trị doanh nghiệp", anh: "https://picsum.photos/id/1060/900/900", gia: 0, don_vi: "",
      mo_ta: "Quản lý khách hàng, đơn hàng, công nợ và báo cáo trên một nền tảng, dùng được trên điện thoại và máy tính.\n\nLiên hệ để được tư vấn gói phù hợp với quy mô doanh nghiệp." },
    { ten: "Tư vấn chuyển đổi số", anh: "https://picsum.photos/id/1067/900/900", gia: 5000000, don_vi: "buổi",
      mo_ta: "Khảo sát quy trình hiện tại, đề xuất lộ trình số hóa và công cụ phù hợp, kèm tài liệu hướng dẫn cho đội ngũ." },
    { ten: "Tự động hóa quy trình", anh: "https://picsum.photos/id/1043/900/900", gia: 0, don_vi: "",
      mo_ta: "Kết nối các công cụ đang dùng để tự động gửi thông báo, tạo báo cáo và đồng bộ dữ liệu, giảm việc nhập tay." }
  ]
};
