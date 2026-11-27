/* talent.js: form đăng ký tiết mục JCI Khanhhoa Talent */
(function(){
  var form=document.getElementById('formTalent'); if(!form) return;
  var btn=form.querySelector('button[type="submit"]'),msg=document.getElementById('talentMsg'),
      group=document.getElementById('groupField'),groupName=document.getElementById('t-nhom');
  var say=function(t,err){msg.textContent=t;msg.classList.toggle('is-err',!!err)};

  // ô "Tên nhóm" chỉ hiện (và bắt buộc) khi đăng ký nhóm
  var syncKind=function(){var g=form.kind.value==='nhom';group.hidden=!g;groupName.required=g};
  form.addEventListener('change',function(e){if(e.target.name==='kind') syncKind()});
  syncKind();

  // pop-up trạng thái: đang xử lý (không đóng được) -> kết quả (có nút Đóng)
  var ov=document.getElementById('ov'),box=document.getElementById('ovBox'),spin=document.getElementById('ovSpin'),
      txt=document.getElementById('ovText'),ovBtn=document.getElementById('ovBtn');
  var show=function(t,loading){
    txt.textContent=t;spin.hidden=!loading;ovBtn.hidden=loading;
    ov.hidden=false;document.body.style.overflow='hidden';(loading?box:ovBtn).focus();
  };
  var hide=function(){ov.hidden=true;document.body.style.overflow=''};
  ovBtn.addEventListener('click',hide);

  // gửi thành công: GIỮ nguyên nội dung đã điền và khóa nút cho tới khi tải lại trang (F5)
  var sending=false,done=false;
  btn.disabled=false;   // một số trình duyệt nhớ trạng thái khóa sau khi tải lại
  form.addEventListener('submit',async function(e){
    e.preventDefault();
    if(sending||done) return;
    var fd=new FormData(form),t=function(k){return String(fd.get(k)||'').trim()};
    if(t('fullName').length<2) return say('Vui lòng nhập họ và tên.',true);
    if(t('kind')==='nhom'&&!t('groupName')) return say('Vui lòng nhập tên nhóm.',true);
    if(t('performance').length<3) return say('Vui lòng mô tả tiết mục.',true);
    sending=true;btn.disabled=true;say('');
    show('Thông tin đang được xử lý, vui lòng không đóng trang.',true);
    try{
      await API.registerTalent({fullName:t('fullName'),kind:t('kind'),
        groupName:t('kind')==='nhom'?t('groupName'):'',performance:t('performance'),support:t('support'),website:t('website')});
      done=true;
      show(window.APP_CONFIG.MODE==='local'?'Đã ghi nhận thử (chế độ thử), chưa lưu lên máy chủ.':'BTC sẽ sớm liên hệ để hỗ trợ các anh, chị hoàn thiện việc đăng ký.',false);
    }catch(err){
      btn.disabled=false;
      show(err.message||'Có lỗi xảy ra, vui lòng thử lại.',false);
    }
    sending=false;
  });
  // câu báo lỗi tiếng Việt thay cho câu mặc định của trình duyệt ('' = ô hợp lệ)
  var ten=document.getElementById('t-ten'),mota=document.getElementById('t-mota');
  var checkFields=function(){
    var n=ten.value.trim().length,m=mota.value.trim().length;
    ten.setCustomValidity(!ten.value?'Vui lòng nhập họ và tên':n<2?'Vui lòng nhập đầy đủ họ và tên':'');
    groupName.setCustomValidity(form.kind.value==='nhom'&&!groupName.value.trim()?'Vui lòng nhập tên nhóm':'');
    mota.setCustomValidity(!mota.value?'Vui lòng mô tả tiết mục':m<3?'Vui lòng mô tả thêm':'');
  };
  form.addEventListener('input',checkFields);
  form.addEventListener('change',checkFields);
  checkFields();
  // trình duyệt chặn gửi vì thiếu/sai ô: tô đỏ các ô lỗi
  form.addEventListener('invalid',function(){form.classList.add('was-validated')},true);
})();
