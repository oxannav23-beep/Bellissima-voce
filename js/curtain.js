// Bellissima voce — кулисы первого экрана (ткань: assets/curtain, Pixabay)
(function () {
  /* Кулиса, подхваченная шнуром: ширина сужается к подхвату и расширяется к полу,
     складки сходятся к подхвату. Свет, тени и блеск ворса — как у бархата. */
  var TIE = .6; // высота подхвата (доля)
  function widthAt(t) {
    if (t < TIE) return .2 + .8 * Math.pow(Math.cos(t / TIE * Math.PI / 2), 1.25);
    return .2 + .32 * Math.pow((t - TIE) / (1 - TIE), 1.3);
  }
  /* Ткань — настоящее фото бархата (assets/curtain, Pixabay).
     Каждую строку фото «сжимаем» до ширины кулисы на этой высоте —
     так складки естественно сходятся к подхвату, как у настоящей подхваченной шторы. */
  var TEX = new Image();
  TEX.src = 'assets/curtain/velvet-660078.jpg';
  function drawDrape(canvas, seed) {
    if (!TEX.complete || !TEX.naturalWidth) return;
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (!W || !H) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var tw = TEX.naturalWidth, th = TEX.naturalHeight;
    var sw = Math.min(tw * .3, W * .8), sx = (seed % 7) / 7 * (tw - sw);   // какой кусок ткани берём
    ctx.filter = 'saturate(.9) hue-rotate(-6deg) brightness(1.35) contrast(.92)'; // ближе к винному
    for (var y = 0; y < H; y++) {
      var t = y / H, w = widthAt(t) * W;
      var sy = Math.min(th - 1, (.06 + t * .88) * th);
      // нижний край кулисы слегка расходится веером
      ctx.drawImage(TEX, sx, sy, sw, 1, 0, y, w + 1, 1);
    }
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-atop';
    for (var y2 = 0; y2 < H; y2 += 2) {                                       // тень у внутреннего края — объём
      var w2 = widthAt(y2 / H) * W, g = ctx.createLinearGradient(w2 - W * .14, 0, w2, 0);
      g.addColorStop(0, 'rgba(20,0,4,0)'); g.addColorStop(1, 'rgba(20,0,4,.4)');
      ctx.fillStyle = g; ctx.fillRect(Math.max(0, w2 - W * .14), y2, W * .14 + 1, 2);
    }
    var v = ctx.createLinearGradient(0, 0, 0, H);                              // сверху и у пола темнее
    v.addColorStop(0, 'rgba(20,0,4,.35)'); v.addColorStop(.12, 'rgba(20,0,4,0)');
    v.addColorStop(.85, 'rgba(20,0,4,0)'); v.addColorStop(1, 'rgba(20,0,4,.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    // ---- Витой золотой шнур-подхват и кисть: рисуем как настоящие ----
    var ty = TIE * H, tw = widthAt(TIE) * W;
    var k = Math.min(1, Math.max(.42, r.width / 300)) * dpr;          // масштаб кисти
    var rs = seed * 7 + 3; function rr() { rs = (rs * 16807) % 2147483647; return rs / 2147483647; }
    // шнур: вдоль кривой — косые «витки» с бликом
    function ropePoint(t) { var x0 = -4 * dpr, y0 = ty - 12 * k, cx = tw * .5, cy = ty + 8 * k, x1 = tw, y1 = ty;
      return { x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1 }; }
    ctx.save();
    ctx.shadowColor = 'rgba(30,5,0,.55)'; ctx.shadowBlur = 6 * k; ctx.shadowOffsetY = 3 * k;
    ctx.strokeStyle = '#6b4e1e'; ctx.lineWidth = 7 * k; ctx.lineCap = 'round';
    ctx.beginPath(); for (var i = 0; i <= 30; i++) { var p = ropePoint(i / 30); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke();
    ctx.restore();
    var turns = Math.max(14, Math.round(tw / (2.6 * k)));
    for (var j = 0; j < turns; j++) {
      var a = ropePoint(j / turns), b = ropePoint(Math.min(1, (j + 1) / turns)), ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang + .75);
      var gr = ctx.createLinearGradient(0, -4 * k, 0, 4 * k);
      gr.addColorStop(0, '#5e441a'); gr.addColorStop(.35, '#f4dea2'); gr.addColorStop(.6, '#c9a456'); gr.addColorStop(1, '#5a4018');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * k, 4.4 * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // кисть
    var cx0 = tw - 1 * k, top = ty + 2 * k;
    ctx.save();
    ctx.shadowColor = 'rgba(30,5,0,.5)'; ctx.shadowBlur = 10 * k; ctx.shadowOffsetX = 3 * k; ctx.shadowOffsetY = 5 * k;
    // петля
    ctx.strokeStyle = '#a9873f'; ctx.lineWidth = 2.4 * k;
    ctx.beginPath(); ctx.moveTo(cx0, top); ctx.lineTo(cx0, top + 10 * k); ctx.stroke();
    // юбка из нитей
    var skTop = top + 44 * k, skLen = 92 * k, w0 = 10 * k, w1 = 19 * k, n = Math.round(150 * Math.min(1, k / dpr + .2));
    ctx.fillStyle = 'rgba(70,45,10,.85)';                              // тёмная подложка — глубина между нитями
    ctx.beginPath(); ctx.moveTo(cx0 - w0, skTop); ctx.lineTo(cx0 + w0, skTop); ctx.lineTo(cx0 + w1, skTop + skLen); ctx.lineTo(cx0 - w1, skTop + skLen); ctx.closePath(); ctx.fill();
    ctx.shadowColor = 'transparent';
    for (var q = 0; q < n; q++) {
      var u = rr() * 2 - 1, len = skLen * (.9 + rr() * .12), sway = (rr() - .5) * 3 * k;
      var xa = cx0 + u * w0, xb = cx0 + u * w1 + sway;
      var light = Math.max(0, 1 - Math.abs(u - .25) * 1.15);          // блик чуть правее центра (свет со сцены)
      var c1 = Math.round(120 + 120 * light + rr() * 15), c2 = Math.round(85 + 100 * light + rr() * 10), c3 = Math.round(30 + 60 * light);
      ctx.strokeStyle = 'rgb(' + c1 + ',' + c2 + ',' + c3 + ')';
      ctx.lineWidth = (.7 + rr() * .5) * k;
      ctx.beginPath(); ctx.moveTo(xa, skTop); ctx.quadraticCurveTo((xa + xb) / 2 + sway, skTop + len * .5, xb, skTop + len); ctx.stroke();
    }
    // тень к кончикам нитей
    var tip = ctx.createLinearGradient(0, skTop, 0, skTop + skLen * 1.05);
    tip.addColorStop(0, 'rgba(40,20,0,.25)'); tip.addColorStop(.25, 'rgba(40,20,0,0)'); tip.addColorStop(.8, 'rgba(40,20,0,0)'); tip.addColorStop(1, 'rgba(40,20,0,.35)');
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx0 - w0, skTop); ctx.lineTo(cx0 + w0, skTop); ctx.lineTo(cx0 + w1 + 3 * k, skTop + skLen * 1.06); ctx.lineTo(cx0 - w1 - 3 * k, skTop + skLen * 1.06); ctx.closePath(); ctx.clip();
    ctx.fillStyle = tip; ctx.fillRect(cx0 - w1 - 3 * k, skTop, (w1 + 3 * k) * 2, skLen * 1.06); ctx.restore();

    // головка: шарик + «луковица», обмотанная нитью
    function metal(x0, x1) { var g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#5a4018'); g.addColorStop(.3, '#b8924a'); g.addColorStop(.55, '#f6e3ad'); g.addColorStop(.7, '#d4b067'); g.addColorStop(1, '#5e441a'); return g; }
    ctx.fillStyle = metal(cx0 - 6 * k, cx0 + 6 * k);
    ctx.beginPath(); ctx.ellipse(cx0, top + 14 * k, 5.5 * k, 5.5 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = metal(cx0 - 12 * k, cx0 + 12 * k);
    ctx.beginPath(); ctx.moveTo(cx0 - 4 * k, top + 19 * k);
    ctx.bezierCurveTo(cx0 - 15 * k, top + 24 * k, cx0 - 14 * k, top + 38 * k, cx0 - 11 * k, top + 42 * k);
    ctx.lineTo(cx0 + 11 * k, top + 42 * k);
    ctx.bezierCurveTo(cx0 + 14 * k, top + 38 * k, cx0 + 15 * k, top + 24 * k, cx0 + 4 * k, top + 19 * k); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,45,10,.45)'; ctx.lineWidth = .6 * k;      // витки нити на головке
    for (var h = top + 21 * k; h < top + 41 * k; h += 1.6 * k) { ctx.beginPath(); ctx.moveTo(cx0 - 13 * k, h); ctx.quadraticCurveTo(cx0, h + 1.4 * k, cx0 + 13 * k, h); ctx.stroke(); }
    // плетёный поясок
    ctx.fillStyle = metal(cx0 - 12 * k, cx0 + 12 * k); ctx.fillRect(cx0 - 11.5 * k, top + 41 * k, 23 * k, 4 * k);
    ctx.strokeStyle = 'rgba(70,45,10,.6)'; ctx.lineWidth = .7 * k;
    for (var b2 = -11; b2 < 11; b2 += 2.2) { ctx.beginPath(); ctx.moveTo(cx0 + b2 * k, top + 41 * k); ctx.lineTo(cx0 + (b2 + 1.6) * k, top + 45 * k); ctx.stroke(); }
    ctx.restore();

  }
  function drawAll() {
    document.querySelectorAll('.drape canvas').forEach(function (c, i) { drawDrape(c, i ? 97 : 31); });
  }
  if (TEX.complete) drawAll(); else TEX.onload = drawAll;
  window.addEventListener('load', drawAll);   // после загрузки шрифтов/вёрстки — точный размер
  // перерисовываем только при реальной смене размера (на телефоне прокрутка тоже шлёт resize)
  var rt, lastW = innerWidth, lastH = innerHeight;
  window.addEventListener('resize', function () {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
    lastW = innerWidth; lastH = innerHeight;
    clearTimeout(rt); rt = setTimeout(drawAll, 200);
  });
})();