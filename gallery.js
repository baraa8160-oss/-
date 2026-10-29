/* gallery.js – معرض الصور والفيديوهات
   إضافة فقط: لا يحذف ولا يعدّل أي قسم آخر. يخفي محتوى #gallery القديم (يبقى في الصفحة)
   ويعرض التصميم الجديد. للتراجع احذف سطر <script src="gallery.js"> من index.html. */
(function () {
  'use strict';

  /* ===== المحتوى: عدّله من هنا ===== */
  var PHOTOS = [
    { src: 'FB_IMG_1793278465702.jpg', alt: 'شعار حركة البناء الوطني والرقم التعريفي للحملة الانتخابية 04', cap: 'الرقم التعريفي للحملة الانتخابية 04', feat: true },
    { src: 'IMG_20261010_152642.jpg', alt: 'المترشح نوري عنقاق', cap: 'المترشح نوري عنقاق' },
    { src: 'IMG_20261027_152608.jpg', alt: 'صورة من النشاطات', cap: 'صور من النشاطات' }
  ];
  /* أضف فيديو هكذا: { src: 'video1.mp4', poster: 'poster1.jpg', title: 'عنوان الفيديو' } */
  var VIDEOS = [];
  var SOON_VIDEOS = 3;

  var CSS = `
section#gallery.gx-on{position:relative;overflow:hidden;color:#fff;border:0;border-radius:24px;background:radial-gradient(circle at 85% 0,rgba(255,255,255,.12),transparent 38%),linear-gradient(160deg,#043d2a 0%,#075b3b 55%,#0a6b46 100%);box-shadow:0 18px 44px rgba(4,61,42,.35);padding:clamp(22px,4vw,42px) clamp(14px,3vw,30px)}
section#gallery.gx-on>*:not(.gx-root){display:none!important}
.gx-root{max-width:1040px;margin:0 auto;font-family:inherit;text-align:center}
.gx-head h2{margin:0;font-size:clamp(26px,5.4vw,42px);line-height:1.3;font-weight:800;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,.3)}
.gx-flag{display:flex;width:132px;height:5px;margin:12px auto;border-radius:5px;overflow:hidden}
.gx-flag i{flex:1}.gx-flag i:nth-child(1){background:#14a36b}.gx-flag i:nth-child(2){background:#fff}.gx-flag i:nth-child(3){background:#d71935}
.gx-head p{margin:0 auto;max-width:560px;font-size:clamp(14px,3.6vw,18px);line-height:1.8;color:#e6f2ea}
.gx-tabs{display:flex;justify-content:center;gap:10px;margin:22px 0 20px}
.gx-tabs button{font:inherit;font-weight:700;font-size:15px;color:#fff;padding:11px 22px;min-width:130px;border:1px solid rgba(255,255,255,.4);border-bottom:3px solid transparent;border-radius:999px;background:rgba(255,255,255,.08);cursor:pointer}
.gx-tabs button[aria-selected=true]{background:#fff;color:#075b3b;border-bottom-color:#d71935;box-shadow:0 6px 16px rgba(0,0,0,.25)}
.gx-panel[hidden]{display:none}
.gx-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.gx-vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.gx-card{margin:0;background:#fff;color:#043d2a;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.25)}
.gx-feat{grid-column:1/-1;width:100%;max-width:620px;justify-self:center}
.gx-zoom{display:block;width:100%;margin:0;padding:0;border:0;background:#fff;cursor:zoom-in}
.gx-zoom img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:50% 22%}
.gx-feat .gx-zoom img{aspect-ratio:auto;object-fit:contain}
.gx-card figcaption{padding:11px 10px 13px;font-size:14px;font-weight:700;line-height:1.6;border-top:3px solid #f1f5f2}
.gx-card small{display:block;font-weight:400;color:#5b7a6a}
.gx-soon{grid-column:1/-1}
.gx-ph{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;font-size:44px;color:#075b3b;background:repeating-linear-gradient(45deg,#f4f8f5,#f4f8f5 12px,#e9f2ec 12px,#e9f2ec 24px);border-bottom:2px dashed #b9d4c4}
.gx-vid video{display:block;width:100%;aspect-ratio:16/9;background:#000}
@media(min-width:720px){.gx-grid{grid-template-columns:repeat(3,1fr);gap:18px}.gx-soon{grid-column:auto}}
@media(hover:hover){.gx-card{transition:transform .25s ease,box-shadow .25s ease}.gx-card:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(0,0,0,.32)}}
.gx-lb{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;background:rgba(2,18,12,.94)}
.gx-lb[hidden]{display:none!important}
.gx-lb img{max-width:96vw;max-height:80vh;object-fit:contain;border-radius:10px;background:#fff}
.gx-lb p{margin:0;color:#fff;font-size:15px}
.gx-x{position:absolute;top:12px;left:12px;width:44px;height:44px;border:0;border-radius:50%;font-size:28px;line-height:1;color:#043d2a;background:#fff;cursor:pointer}`;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function photoCard(p) {
    return '<figure class="gx-card' + (p.feat ? ' gx-feat' : '') + '">' +
      '<button type="button" class="gx-zoom" data-src="' + esc(p.src) + '" data-cap="' + esc(p.cap) + '" aria-label="تكبير الصورة: ' + esc(p.cap) + '">' +
      '<img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async"></button>' +
      '<figcaption>' + esc(p.cap) + '</figcaption></figure>';
  }

  function soonCard(icon, title, sub, extra) {
    return '<div class="gx-card ' + (extra || '') + '"><div class="gx-ph" aria-hidden="true">' + icon + '</div>' +
      '<figcaption>' + title + '<small>' + sub + '</small></figcaption></div>';
  }

  function videoCard(v) {
    return '<figure class="gx-card gx-vid"><video controls playsinline preload="metadata"' +
      (v.poster ? ' poster="' + esc(v.poster) + '"' : '') + '><source src="' + esc(v.src) + '"></video>' +
      '<figcaption>' + esc(v.title || 'فيديو') + '</figcaption></figure>';
  }

  function build(sec) {
    var st = document.createElement('style');
    st.id = 'gx-style';
    st.textContent = CSS;
    document.head.appendChild(st);

    var photos = PHOTOS.map(photoCard).join('') +
      soonCard('▧', 'صورة قادمة قريبًا', 'صور إضافية', 'gx-soon');
    var vids = VIDEOS.map(videoCard).join('');
    if (!VIDEOS.length) {
      for (var i = 0; i < SOON_VIDEOS; i++) vids += soonCard('▶', 'فيديو قادم قريبًا', 'فيديوهات الحملة');
    }

    var root = document.createElement('div');
    root.className = 'gx-root';
    root.innerHTML =
      '<header class="gx-head"><h2>معرض الصور والفيديوهات</h2>' +
      '<span class="gx-flag" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<p>لحظات من الميدان ... من أجل قجال الأفضل</p></header>' +
      '<div class="gx-tabs" role="tablist" aria-label="أقسام المعرض">' +
      '<button type="button" role="tab" id="gx-t1" aria-selected="true" aria-controls="gx-p1" data-t="1">▧ الصور</button>' +
      '<button type="button" role="tab" id="gx-t2" aria-selected="false" aria-controls="gx-p2" data-t="2">▶ الفيديوهات</button></div>' +
      '<div class="gx-panel" id="gx-p1" role="tabpanel" aria-labelledby="gx-t1"><div class="gx-grid">' + photos + '</div></div>' +
      '<div class="gx-panel" id="gx-p2" role="tabpanel" aria-labelledby="gx-t2" hidden><div class="gx-vgrid">' + vids + '</div></div>';
    sec.appendChild(root);

    /* تبديل الصور / الفيديوهات */
    root.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-t]');
      if (tab) {
        ['1', '2'].forEach(function (n) {
          var on = tab.getAttribute('data-t') === n;
          root.querySelector('#gx-t' + n).setAttribute('aria-selected', on ? 'true' : 'false');
          root.querySelector('#gx-p' + n).hidden = !on;
        });
        return;
      }
      var z = e.target.closest('.gx-zoom');
      if (z) openLb(z.getAttribute('data-src'), z.getAttribute('data-cap'));
    });

    /* عرض الصورة كاملة بدون قصّ */
    var lb = document.createElement('div');
    lb.className = 'gx-lb';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button type="button" class="gx-x" aria-label="إغلاق">×</button><img alt=""><p></p>';
    document.body.appendChild(lb);
    var lbi = lb.querySelector('img'), lbp = lb.querySelector('p');
    function openLb(src, cap) {
      lbi.src = src; lbi.alt = cap; lbp.textContent = cap;
      lb.hidden = false; document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lb.hidden = true; lbi.removeAttribute('src'); document.body.style.overflow = '';
    }
    lb.addEventListener('click', function (e) { if (e.target !== lbi) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

    sec.classList.add('gx-on');
  }

  function init() {
    var sec = document.getElementById('gallery');
    if (!sec || sec.getAttribute('data-gx')) return;
    sec.setAttribute('data-gx', '1');
    try {
      build(sec);
    } catch (err) { /* عند أي خطأ يبقى المعرض القديم ظاهرًا */
      var r = sec.querySelector('.gx-root'); if (r) r.remove();
      sec.classList.remove('gx-on');
      if (window.console) console.error('gallery.js:', err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();