/* form.js: form đăng ký tham dự (cắt ảnh, pop-up, gửi) */
// ===== Form đăng ký =====
// Gửi qua window.API (js/api.js): ảnh đã cắt -> xin link từ n8n -> tự đẩy thẳng lên R2 -> chỉ gửi URL ảnh (avatarUrl) kèm thông tin đăng ký.
// Chế độ (thử/thật) và tên hàm RPC đặt ở js/config.js.
(function(){
  const form=document.getElementById('formDangKy'); if(!form) return;
  const btn=form.querySelector('button[type="submit"]');
  const ov=document.getElementById('ov'),box=document.getElementById('ovBox'),spin=document.getElementById('ovSpin'),
        txt=document.getElementById('ovText'),ovBtn=document.getElementById('ovBtn');
  // Không khóa theo giờ: form mở ngay khi trang được publish (mở sớm hay muộn chỉ phụ thuộc lúc publish).
  let sending=false;

  // mã chống trùng: sinh 1 lần khi tải trang, gửi kèm; server dùng làm khóa idempotency (server vẫn phải tự chặn trùng theo SĐT/email)
  const key=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now().toString(36)+Math.random().toString(36).slice(2));

  // thông báo lỗi tiếng Việt cho kiểm tra bắt buộc/định dạng
  form.querySelectorAll('input[required],select[required]').forEach(el=>{
    el.addEventListener('invalid',()=>{
      el.setCustomValidity('');
      let m='';
      if(el.validity.valueMissing) m=el.dataset.required||'Vui lòng nhập thông tin này.';
      else if(el.validity.patternMismatch||el.validity.typeMismatch) m=el.dataset.invalid||'Thông tin chưa đúng định dạng.';
      if(m) el.setCustomValidity(m);
      form.classList.add('was-validated');
    });
    el.addEventListener('input',()=>el.setCustomValidity(''));
    el.addEventListener('change',()=>el.setCustomValidity(''));
  });

  // ===== Thông tin chuyển khoản Gala: hiện khi tick, nội dung chuyển khoản ghép theo tên người tham dự =====
  const gala=document.getElementById('f-gala'),bank=document.getElementById('galaBank'),memo=document.getElementById('bankMemo'),fName=document.getElementById('f-ten');
  const noAccent=t=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/\s+/g,' ').trim();
  const updateMemo=()=>{memo.textContent='JCI Khanhhoa - '+(noAccent(fName.value)||'[Tên người tham dự]')+' - GALA'};
  const FEE={member:450000,guest:500000},fmt=n=>n.toLocaleString('vi-VN')+' VNĐ',priceEl=document.getElementById('galaPrice');
  const who=()=>{const r=form.querySelector('input[name="memberType"]:checked');return r?r.value:''};
  const updatePrice=()=>{const w=who();priceEl.innerHTML=w?'<b>'+fmt(FEE[w])+'</b> / '+(w==='member'?'hội viên JCI Khanhhoa':'khách mời'):'';
    gala.disabled=!w;document.getElementById('galaBox').classList.toggle('is-locked',!w);if(!w){gala.checked=false;bank.hidden=true}};
  
  form.querySelectorAll('input[name="memberType"]').forEach(r=>r.addEventListener('change',updatePrice));
  updatePrice();
  gala.addEventListener('change',()=>{bank.hidden=!gala.checked;updateMemo()});
  fName.addEventListener('input',updateMemo);updateMemo();
  bank.addEventListener('click',async e=>{
    const b=e.target.closest('.copybtn');if(!b)return;
    const text=document.getElementById(b.dataset.copy).textContent,old=b.textContent;
    try{await navigator.clipboard.writeText(text)}catch(_){const r=document.createRange();r.selectNodeContents(document.getElementById(b.dataset.copy));const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('copy');s.removeAllRanges()}
    b.textContent='Đã chép ✓';setTimeout(()=>{b.textContent=old},1800);
  });

  // ===== Pop-up điều khoản =====
  const terms=document.getElementById('termsDlg'),termsOpen=document.getElementById('termsOpen'),termsClose=document.getElementById('termsClose');
  const openTerms=()=>{terms.hidden=false;document.body.style.overflow='hidden';termsClose.focus()};
  const closeTerms=()=>{terms.hidden=true;document.body.style.overflow='';termsOpen.focus()};
  termsOpen.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openTerms()});
  termsClose.addEventListener('click',closeTerms);
  terms.addEventListener('click',e=>{if(e.target===terms)closeTerms()});
  terms.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeTerms()}});

  // ===== Ảnh chân dung: chọn -> khung kéo/zoom -> cắt vuông 512x512 =====
  const av=document.getElementById('f-avatar'),avBox=document.getElementById('avatarBox'),thumb=document.getElementById('avatarThumb'),
        nameEl=document.getElementById('avatarName'),hint=document.getElementById('avatarHint');
  const HINT0=hint.textContent;
  const cropEl=document.getElementById('crop'),stage=document.getElementById('cropStage'),cv=document.getElementById('cropCanvas'),
        zoomEl=document.getElementById('cropZoom'),cx2d=cv.getContext('2d');
  const N=cv.width,OUT=512,R=N/2-14;
  let croppedBlob=null,thumbUrl=null,uploaded=null;
  const c={img:null,iw:0,ih:0,base:1,zoom:1,x:0,y:0};   // x,y: điểm của ảnh (toạ độ ảnh) đang nằm giữa khung

  const setErr=m=>{hint.textContent=m||HINT0;hint.classList.toggle('upload__err',!!m);avBox.classList.toggle('is-err',!!m)};
  const clamp=()=>{const s=c.base*c.zoom,hw=N/2/s;c.x=Math.min(Math.max(c.x,hw),c.iw-hw);c.y=Math.min(Math.max(c.y,hw),c.ih-hw)};
  const draw=()=>{
    const s=c.base*c.zoom;
    cx2d.fillStyle='#000';cx2d.fillRect(0,0,N,N);
    cx2d.drawImage(c.img,N/2-c.x*s,N/2-c.y*s,c.iw*s,c.ih*s);
    cx2d.save();cx2d.fillStyle='rgba(0,0,0,.58)';cx2d.beginPath();cx2d.rect(0,0,N,N);cx2d.arc(N/2,N/2,R,0,Math.PI*2);cx2d.fill('evenodd');cx2d.restore();
    cx2d.save();cx2d.strokeStyle='rgba(255,255,255,.9)';cx2d.lineWidth=3;cx2d.beginPath();cx2d.arc(N/2,N/2,R,0,Math.PI*2);cx2d.stroke();cx2d.restore();
  };
  const setZoom=z=>{c.zoom=Math.min(4,Math.max(1,z));zoomEl.value=c.zoom;clamp();draw()};
  const openCrop=()=>{cropEl.hidden=false;document.body.style.overflow='hidden';stage.focus()};
  const closeCrop=()=>{cropEl.hidden=true;document.body.style.overflow='';if(c.img&&c.img.close)c.img.close();c.img=null;av.value=''};

  av.addEventListener('change',async()=>{
    const f=av.files[0]; if(!f) return;
    if(!/^image\/(jpeg|png|webp)$/.test(f.type)){av.value='';setErr('Ảnh phải là JPG, PNG hoặc WebP.');return}
    if(f.size>5*1024*1024){av.value='';setErr('Ảnh lớn hơn 5MB, vui lòng chọn ảnh nhỏ hơn.');return}
    try{
      let img;
      try{img=await createImageBitmap(f,{imageOrientation:'from-image'})}   // tự xoay đúng chiều theo EXIF
      catch(_){img=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(f);i.onload=()=>{URL.revokeObjectURL(u);ok(i)};i.onerror=no;i.src=u})}
      c.img=img;c.iw=img.width;c.ih=img.height;c.base=Math.max(N/c.iw,N/c.ih);c.zoom=1;c.x=c.iw/2;c.y=c.ih/2;
      zoomEl.value=1;setErr('');clamp();draw();openCrop();
    }catch(_){av.value='';setErr('Không đọc được ảnh này, vui lòng chọn ảnh khác.')}
  });
  // kéo để di chuyển
  let drag=null;
  stage.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,ox:c.x,oy:c.y};stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{
    if(!drag) return;
    const k=N/stage.getBoundingClientRect().width,s=c.base*c.zoom;
    c.x=drag.ox-(e.clientX-drag.x)*k/s;c.y=drag.oy-(e.clientY-drag.y)*k/s;clamp();draw();
  });
  const endDrag=()=>{drag=null};
  stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  // zoom bằng con lăn / thanh trượt / phím
  stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(c.zoom*(e.deltaY<0?1.08:1/1.08))},{passive:false});
  zoomEl.addEventListener('input',()=>setZoom(parseFloat(zoomEl.value)));
  stage.addEventListener('keydown',e=>{
    const step=24/(c.base*c.zoom);
    if(e.key==='ArrowLeft')c.x-=step;else if(e.key==='ArrowRight')c.x+=step;else if(e.key==='ArrowUp')c.y-=step;else if(e.key==='ArrowDown')c.y+=step;
    else if(e.key==='+'||e.key==='=')return setZoom(c.zoom*1.1);else if(e.key==='-')return setZoom(c.zoom/1.1);else return;
    e.preventDefault();clamp();draw();
  });
  document.getElementById('cropCancel').addEventListener('click',closeCrop);
  cropEl.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeCrop()}});
  document.getElementById('cropOk').addEventListener('click',()=>{
    const o=document.createElement('canvas');o.width=o.height=OUT;const ox=o.getContext('2d'),s=c.base*c.zoom*OUT/N;
    ox.fillStyle='#fff';ox.fillRect(0,0,OUT,OUT);
    ox.drawImage(c.img,OUT/2-c.x*s,OUT/2-c.y*s,c.iw*s,c.ih*s);
    const done=b=>{
      if(!b){setErr('Không cắt được ảnh, vui lòng thử lại.');closeCrop();return}
      croppedBlob=b;
      if(thumbUrl)URL.revokeObjectURL(thumbUrl);
      thumbUrl=URL.createObjectURL(b);thumb.style.backgroundImage='url("'+thumbUrl+'")';thumb.classList.add('has-img');
      nameEl.textContent='Đã chỉnh ảnh';hint.textContent='Bấm vào đây để chọn ảnh khác.';hint.classList.remove('upload__err');avBox.classList.remove('is-err');
      closeCrop();
    };
    // ưu tiên WebP (nhẹ), trình duyệt không xuất được WebP thì dùng JPEG
    o.toBlob(b=>{if(b&&b.type==='image/webp')done(b);else o.toBlob(done,'image/jpeg',0.92)},'image/webp',0.9);
  });

  // ===== Pop-up xử lý =====
  const show=(msg,{loading=false,closable=false,onClose}={})=>{
    txt.textContent=msg;spin.hidden=!loading;ovBtn.hidden=!closable;
    ovBtn.onclick=closable?()=>{hide();onClose&&onClose()}:null;
    ov.hidden=false;document.body.style.overflow='hidden';box.focus();
  };
  const hide=()=>{ov.hidden=true;document.body.style.overflow=''};
  // đang gửi thì Esc và click nền không đóng được
  document.addEventListener('keydown',e=>{if(sending&&e.key==='Escape'){e.preventDefault();e.stopPropagation()}},true);
  ov.addEventListener('click',e=>{if(sending)e.stopPropagation()});

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(sending) return;                       // bấm đúp: bỏ qua
    if(form.website&&form.website.value){return}   // ô bẫy bot có dữ liệu: bỏ qua, không gửi
    if(!croppedBlob){setErr('Vui lòng chọn và chỉnh ảnh chân dung để làm thiệp mời.');avBox.scrollIntoView({block:'center',behavior:'smooth'});return}
    try{ API.ready('dangKyKhach') }          // chế độ thật mà chưa có nơi nhận: báo ngay, chưa tải ảnh lên
    catch(err){ show('Biểu mẫu chưa được kết nối nơi nhận đăng ký. Chưa có thông tin nào được gửi đi.',{closable:true}); return }
    sending=true;btn.disabled=true;           // khóa ngay, trước khi gọi mạng
    show('Thông tin đang được xử lý, vui lòng không đóng trang.',{loading:true});
    const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(Object.assign(new Error('timeout'),{name:'AbortError'})),ms))]);
    try{
      const fd=new FormData(form),t=k=>String(fd.get(k)||'').trim();
      const payload={fullName:t('fullName'),salutation:(t('salutation')==='khac'?'':t('salutation')),phone:t('phone'),email:t('email'),
        role:t('role'),organizationTitle:t('organizationTitle'),
        memberType:who(),attendGala:document.getElementById('f-gala').checked,galaFee:document.getElementById('f-gala').checked?FEE[who()]:0,consent:true,idempotencyKey:key};
      const r=await withTimeout((async()=>{
        // chỉ tải ảnh lên một lần cho mỗi ảnh đã cắt (gửi lại sau lỗi không tải lại)
        if(!uploaded||uploaded.blob!==croppedBlob) uploaded={blob:croppedBlob,url:await API.uploadImage(croppedBlob,'avatar',payload.fullName)};
        payload.avatarUrl=uploaded.url;
        return API.registerGuest(payload);
      })(),30000);
      sending=false;                          // thành công: nút Gửi vẫn khóa để không gửi lại
      // không hiện mã/QR ở đây: thiệp mời kèm mã check-in sẽ gửi qua email
      show(r&&r.local?'Đã ghi nhận thử (chế độ thử). Thông tin CHƯA được lưu lên máy chủ.':'Đã đăng ký thành công. Thiệp mời sẽ sớm được gửi qua mail của '+((payload.salutation?payload.salutation+' ':'')+payload.fullName)+'.',{closable:true});
    }catch(err){
      sending=false;
      show(err.name==='AbortError'?'Mạng chậm. Vui lòng kiểm tra email/Zalo trước khi đăng ký lại.':(err.message||'Có lỗi xảy ra, vui lòng thử lại.'),
           {closable:true,onClose:()=>{btn.disabled=false}});
    }
  });
})();
