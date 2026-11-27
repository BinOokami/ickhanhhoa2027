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

  var sending=false;
  form.addEventListener('submit',async function(e){
    e.preventDefault();
    if(sending) return;
    var fd=new FormData(form),t=function(k){return String(fd.get(k)||'').trim()};
    if(t('fullName').length<2) return say('Vui lòng nhập họ và tên.',true);
    if(t('kind')==='nhom'&&!t('groupName')) return say('Vui lòng nhập tên nhóm.',true);
    if(t('performance').length<3) return say('Vui lòng mô tả tiết mục.',true);
    sending=true;btn.disabled=true;say('Đang gửi...');
    try{
      await API.registerTalent({fullName:t('fullName'),kind:t('kind'),
        groupName:t('kind')==='nhom'?t('groupName'):'',performance:t('performance'),support:t('support'),website:t('website')});
      form.reset();syncKind();form.classList.remove('was-validated');
      say(window.APP_CONFIG.MODE==='local'?'Đã ghi nhận thử (chế độ thử), chưa lưu lên máy chủ.':'BTC sẽ sớm liên hệ để hỗ trợ các anh, chị hoàn thiện việc đăng ký.');
    }catch(err){
      say(err.message||'Có lỗi xảy ra, vui lòng thử lại.',true);
    }
    sending=false;btn.disabled=false;
  });
  // trình duyệt chặn gửi vì thiếu/sai ô: tô đỏ các ô lỗi
  form.addEventListener('invalid',function(){form.classList.add('was-validated')},true);
})();
