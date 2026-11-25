/* khung.js: ghép ảnh người dùng vào khung, chạy hoàn toàn trên trình duyệt (không tải ảnh lên máy chủ). */
(function(){
  var SIZE=1500, ZMIN=.2, ZMAX=4;
  var $=function(id){return document.getElementById(id)};
  var stage=$('stage'), cv=$('cv'), ctx=cv.getContext('2d');
  var file=$('file'), zoom=$('zoom'), box=$('kh');
  var frame=new Image(), img=null;
  var st={x:SIZE/2,y:SIZE/2,z:1,rot:0,flip:1,base:1};   // z: hệ số trên mức phủ kín khung; rot: độ

  function draw(){
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,SIZE,SIZE);
    if(img){
      var s=st.base*st.z;
      ctx.save();
      ctx.translate(st.x,st.y);
      ctx.rotate(st.rot*Math.PI/180);
      ctx.scale(st.flip*s,s);
      ctx.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);
      ctx.restore();
    }
    if(frame.complete&&frame.naturalWidth) ctx.drawImage(frame,0,0,SIZE,SIZE);
  }
  function setEnabled(on){
    document.querySelectorAll('[data-need-img]').forEach(function(e){e.disabled=!on});
    box.classList.toggle('has-img',on);
  }
  function reset(){
    // phủ kín khung theo cạnh ngắn của ảnh sau khi xoay
    var q=(st.rot%180!==0), w=q?img.naturalHeight:img.naturalWidth, h=q?img.naturalWidth:img.naturalHeight;
    st.base=SIZE/Math.min(w,h); st.z=1; st.x=st.y=SIZE/2; zoom.value=1; draw();
  }
  function load(f){
    if(!f||!/^image\//.test(f.type)){alert('Vui lòng chọn một tệp ảnh (JPG, PNG, WEBP...).');return}
    var url=URL.createObjectURL(f), im=new Image();
    im.onload=function(){
      img=im; st.rot=0; st.flip=1; setEnabled(true); reset(); URL.revokeObjectURL(url);
    };
    im.onerror=function(){URL.revokeObjectURL(url);alert('Không đọc được ảnh này. Bạn thử ảnh khác (JPG hoặc PNG) nhé.')};
    im.src=url;
  }
  function setZ(z){st.z=Math.min(ZMAX,Math.max(ZMIN,z)); zoom.value=st.z; draw()}

  // chọn ảnh
  ['pick','pick2'].forEach(function(id){$(id).addEventListener('click',function(){file.click()})});
  file.addEventListener('change',function(){load(file.files[0]);file.value=''});
  // kéo thả tệp vào khung
  stage.addEventListener('dragover',function(e){e.preventDefault()});
  stage.addEventListener('drop',function(e){e.preventDefault();if(e.dataTransfer.files[0])load(e.dataTransfer.files[0])});

  // kéo ảnh, chụm 2 ngón để thu phóng
  var ptrs={}, pinch0=0, z0=1;
  function scaleOf(){return SIZE/cv.getBoundingClientRect().width}
  cv.addEventListener('pointerdown',function(e){
    if(!img)return; cv.setPointerCapture(e.pointerId); ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    stage.classList.add('is-drag');
    var k=Object.keys(ptrs); if(k.length===2){var a=ptrs[k[0]],b=ptrs[k[1]];pinch0=Math.hypot(a.x-b.x,a.y-b.y);z0=st.z}
  });
  cv.addEventListener('pointermove',function(e){
    var p=ptrs[e.pointerId]; if(!p||!img)return;
    var k=Object.keys(ptrs);
    if(k.length===1){var f=scaleOf(); st.x+=(e.clientX-p.x)*f; st.y+=(e.clientY-p.y)*f; p.x=e.clientX; p.y=e.clientY; draw()}
    else if(k.length===2){
      p.x=e.clientX; p.y=e.clientY;
      var a=ptrs[k[0]],b=ptrs[k[1]],d=Math.hypot(a.x-b.x,a.y-b.y); if(pinch0) setZ(z0*d/pinch0);
    }
  });
  function up(e){delete ptrs[e.pointerId]; pinch0=0; if(!Object.keys(ptrs).length)stage.classList.remove('is-drag')}
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',function(e){if(!img)return;e.preventDefault();setZ(st.z*(e.deltaY<0?1.08:1/1.08))},{passive:false});

  // nút
  zoom.addEventListener('input',function(){setZ(parseFloat(zoom.value))});
  $('zin').addEventListener('click',function(){setZ(st.z*1.15)});
  $('zout').addEventListener('click',function(){setZ(st.z/1.15)});
  $('rl').addEventListener('click',function(){st.rot-=90;draw()});
  $('rr').addEventListener('click',function(){st.rot+=90;draw()});
  $('fl').addEventListener('click',function(){st.flip*=-1;draw()});
  $('rs').addEventListener('click',function(){if(!img)return;st.rot=0;st.flip=1;reset()});

  // tải về
  $('dl').addEventListener('click',function(){
    if(!img)return;
    cv.toBlob(function(b){
      if(!b){alert('Không tạo được ảnh. Bạn thử lại nhé.');return}
      var u=URL.createObjectURL(b), a=document.createElement('a');
      a.href=u; a.download='avatar-jci-khanhhoa-2027.png'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){URL.revokeObjectURL(u)},4000);
      $('ok').style.display='block';
    },'image/png');
  });

  cv.width=cv.height=SIZE; setEnabled(false);
  frame.onload=draw; frame.src='/assets/avatar-frame.png'; draw();
})();
