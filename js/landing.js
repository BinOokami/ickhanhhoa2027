/* landing.js: hiệu ứng riêng trang chủ (én bay, câu chuyện, vòng nhiệm kỳ) */

// Người dùng bật "giảm chuyển động": dừng video, giữ ảnh poster
const v=document.getElementById('heroVideo');
if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause();}// Én bay dọc đường giao hero/câu chuyện theo con lăn: cuộn xuống bay sang phải, cuộn lên bay ngược lại; vệt sáng kéo theo sau
const fl=document.getElementById('flight');
if(fl){
  const bird=document.getElementById('flightBird'),trail=document.getElementById('flightTrail'),glow=document.getElementById('flightGlow');
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking=false;
  const draw=()=>{
    ticking=false;
    const top=fl.getBoundingClientRect().top,vh=innerHeight,vw=document.documentElement.clientWidth,bw=bird.offsetWidth;
    // p: 0 khi đường giao vừa ló ở đáy màn hình, 1 khi đi ra mép trên
    const p=still?0.6:Math.min(1,Math.max(0,(vh-top)/(vh+bw*.8)));
    const x=vw*.05+p*(vw*.9-bw), y=0, rot=Math.cos(p*Math.PI*2)*-2;   // y=0: bay đúng trên đường giao
    bird.style.transform='translate3d('+x+'px,'+y+'px,0) rotate('+rot+'deg)';
    trail.style.width=glow.style.width=Math.max(0,x+bw*.04)+'px';   // vệt sáng kết thúc đúng đuôi con chim cuối của đàn
        };
  const req=()=>{if(!ticking){ticking=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
  draw();
}
// Mũi tên cuộn của đoạn kể: hiện/ẩn theo vị trí cuộn
const sw=document.getElementById('storyScroll');
if(sw){
  const t=sw.querySelector('.story__text');
  const upd=()=>{
    sw.classList.toggle('can-up',t.scrollTop>4);
    sw.classList.toggle('can-down',t.scrollTop+t.clientHeight<t.scrollHeight-4);
  };
  t.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
  document.fonts&&document.fonts.ready.then(upd);upd();
}
// Nhiệm kỳ: bấm một người -> ảnh người đó hiện ở giữa, người cũ về vòng ngoài (đổi ngay, không hoạt ảnh)
const tg=document.getElementById('termsStage');
if(tg){
  const SLOTS=[112.5,67.5,17.92,-17.92,-67.5,-112.5,-162.08,162.08];   // 4 người mỗi cột cách đều nhau theo chiều dọc
  const zoneOf=a=>Math.cos(a*Math.PI/180)>0?'t--r':'t--l';
  const btns=[...tg.querySelectorAll('.term')],portrait=document.getElementById('focusPortrait');
  const fy=document.getElementById('focusYear'),fn=document.getElementById('focusName'),fr=document.getElementById('focusRole'),fi=document.getElementById('focusIni');
  let fimg=document.getElementById('focusImg');
  const show=b=>{
    fy.textContent=b.dataset.year;fr.textContent=b.dataset.role;fi.textContent=b.dataset.ini;
    fn.textContent='';const pb=document.createElement('b');pb.textContent=b.dataset.pre;fn.append(pb,' '+b.dataset.name);
    fn.classList.toggle('is-long',b.dataset.name.length>16);
    if(!fimg||!fimg.isConnected){fimg=document.createElement('img');fimg.alt='';fimg.onerror=()=>fimg.remove();portrait.appendChild(fimg)}
    fimg.src=b.dataset.photo;
  };
  show(btns.find(b=>b.classList.contains('is-center')));
  // xếp 8 người còn lại vào 8 vị trí vòng ngoài theo thứ tự năm
  const place=(center)=>{
    btns.filter(b=>b!==center).forEach((b,k)=>{b.style.setProperty('--a',SLOTS[k]);b.classList.remove('t--l','t--r');b.classList.add(zoneOf(SLOTS[k]))});
  };
  btns.forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('is-center'))return;
    const old=btns.find(x=>x.classList.contains('is-center'));
    b.classList.add('is-center');old.classList.remove('is-center');place(b);show(b);
  }));
}
