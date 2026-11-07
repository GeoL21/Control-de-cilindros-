/* Reporte JPG de la ronda (1800 px de ancho). Lo usan la app y la página de firma.
   F = { realiza: firma, recibe: firma }, donde firma es:
     { tipo:'dedo', img: <canvas o imagen> }        firma hecha con el dedo
     { tipo:'huella', nombre, fecha }               firmada con huella
     { tipo:'pendiente' }                           falta firmar con huella
     { tipo:'nocoincide', nota }                    la persona dijo que no coincide
     { tipo:'vacia' }                               sin firma
   D.codigo (opcional): código de verificación de la ronda. */
(function () {
  const unidadDe = g => g === 'Dioxicarbomed' ? 'MPa' : 'PSI';
  let logoImg = null;
  function cargarImg(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }

  window.dibujarRonda = async function (D, A, F) {
    try { await Promise.race([Promise.all([document.fonts.load('700 28px "Plus Jakarta Sans"'), document.fonts.load('400 28px "Plus Jakarta Sans"')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
    if (!logoImg) logoImg = await cargarImg('logo.jpg'); const logo = logoImg;
    const F_ = '"Plus Jakarta Sans",system-ui,Arial,sans-serif', VINO = '#6A1B3A', W = 1800, M = 60, CW = W - 2 * M, PAD = 14, LH = 34, FS = 26;
    const cols = [['Fecha', 195], ['Tipo de gas', 250], ['Serial del cilindro', 270], ['Presión interna', 235], ['Ubicación', 260], ['Observación', CW - 1210]];
    const wrap = (ctx, text, w) => { const out = []; String(text || '').split('\n').forEach(par => { let line = '';
      par.split(/\s+/).forEach(word => {
        while (ctx.measureText(word).width > w) { let i = 1; while (i < word.length && ctx.measureText(word.slice(0, i + 1)).width <= w) i++;
          if (line) { out.push(line); line = ''; } out.push(word.slice(0, i)); word = word.slice(i); }
        const t = line ? line + ' ' + word : word; if (ctx.measureText(t).width <= w) line = t; else { out.push(line); line = word; } });
      out.push(line); }); return out.length ? out : ['']; };
    const m = document.createElement('canvas').getContext('2d');
    m.font = '700 32px ' + F_; const lugarL = wrap(m, D.lugar, CW);
    m.font = '400 ' + FS + 'px ' + F_;
    const filas = D.items.map(i => { const cel = [A.fecha, i.gas, i.serial, i.presion + ' ' + unidadDe(i.gas), i.ubicacion, i.obs || '—'];
      const L = cel.map((t, k) => wrap(m, t, cols[k][1] - 2 * PAD)); return { L, h: Math.max(...L.map(l => l.length)) * LH + 2 * PAD }; });
    const infoBottom = 375 + lugarL.length * 42, tableTop = infoBottom + 30, HEAD = 64;
    const sumRows = filas.reduce((a, f) => a + f.h, 0);
    const conCodigo = !!D.codigo;
    const sigTop = tableTop + HEAD + sumRows + 110, H = sigTop + 440 + (conCodigo ? 40 : 0);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.textBaseline = 'top';
    const g = x.createLinearGradient(0, 0, W, 210); g.addColorStop(0, VINO); g.addColorStop(1, '#4E1229'); x.fillStyle = g; x.fillRect(0, 0, W, 210);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(M + 75, 105, 76, 0, 7); x.fill();
    if (logo) { x.save(); x.beginPath(); x.arc(M + 75, 105, 72, 0, 7); x.clip(); x.drawImage(logo, M + 3, 33, 144, 144); x.restore(); }
    x.fillStyle = 'rgba(255,255,255,.88)'; x.font = '600 30px ' + F_; x.fillText('Clínica Reina Catalina', M + 190, 50);
    x.fillStyle = '#fff'; x.font = '800 54px ' + F_; x.fillText('Control de cilindros de gas', M + 190, 92);
    x.textAlign = 'right'; x.font = '600 26px ' + F_; x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText('Ronda ' + A.id, W - M, 58);
    x.font = '700 34px ' + F_; x.fillStyle = '#fff'; x.fillText(A.fecha + ' · ' + A.hora, W - M, 100); x.textAlign = 'left';
    const lab = (t, px, py) => { x.font = '600 22px ' + F_; x.fillStyle = '#8a7680'; x.fillText(t, px, py); };
    lab('Sede', M, 250); x.font = '700 34px ' + F_; x.fillStyle = VINO; x.fillText(D.sede, M, 282);
    lab('Fecha y hora de la ronda', M + 700, 250); x.font = '700 34px ' + F_; x.fillStyle = '#26181D'; x.fillText(A.fecha + ' · ' + A.hora, M + 700, 282);
    lab('Lugar donde se hace la ronda', M, 335); x.font = '700 32px ' + F_; x.fillStyle = '#26181D';
    lugarL.forEach((t, i) => x.fillText(t, M, 370 + i * 42));
    let y = tableTop, cx = M; x.fillStyle = VINO; x.fillRect(M, y, CW, HEAD); x.font = '700 24px ' + F_; x.fillStyle = '#fff';
    cols.forEach(([t, w]) => { x.fillText(t, cx + PAD, y + 19); cx += w; }); y += HEAD;
    filas.forEach((f, n) => { x.fillStyle = n % 2 ? '#F7F1F3' : '#fff'; x.fillRect(M, y, CW, f.h); cx = M;
      f.L.forEach((lines, k) => { x.fillStyle = '#26181D'; x.font = (k === 1 ? '700 ' : '400 ') + FS + 'px ' + F_; lines.forEach((t, i) => x.fillText(t, cx + PAD, y + PAD + i * LH + 3)); cx += cols[k][1]; });
      y += f.h; });
    x.strokeStyle = '#CDB5BF'; x.lineWidth = 2; x.strokeRect(M, tableTop, CW, HEAD + sumRows);
    let yy = tableTop + HEAD; cx = M; cols.slice(0, -1).forEach(([t, w]) => { cx += w; x.beginPath(); x.moveTo(cx, tableTop); x.lineTo(cx, tableTop + HEAD + sumRows); x.stroke(); });
    filas.forEach(f => { yy += f.h; x.beginPath(); x.moveTo(M, yy); x.lineTo(M + CW, yy); x.stroke(); });
    x.font = '600 28px ' + F_; x.fillStyle = '#26181D'; x.fillText('Total de cilindros registrados: ', M, y + 30);
    const tw = x.measureText('Total de cilindros registrados: ').width; x.font = '800 28px ' + F_; x.fillStyle = VINO; x.fillText(String(D.items.length), M + tw, y + 30);
    const bw = (CW - 60) / 2;
    // Huella dibujada (arcos) para las firmas biométricas
    const huella = (cx0, cy0, col) => { x.save(); x.strokeStyle = col; x.lineWidth = 3.5; x.lineCap = 'round'; const cy = cy0 + 30;
      [[10, .15, .85], [18, .05, .95], [26, 0, 1], [34, -.02, .9], [42, .05, .75]].forEach(([r, a, b]) => { x.beginPath(); x.ellipse(cx0, cy, r * .8, r, 0, Math.PI * (1 + a), Math.PI * (2 + b - 1)); x.stroke(); });
      [[10, 0, .5], [18, .15, .6], [26, .2, .55]].forEach(([r, a, b]) => { x.beginPath(); x.ellipse(cx0, cy, r * .8, r, 0, Math.PI * a, Math.PI * b); x.stroke(); });
      x.restore(); };
    const firma = (px, f, nombre, rol) => { f = f || { tipo: 'vacia' }; x.strokeStyle = '#CDB5BF'; x.lineWidth = 2; x.strokeRect(px, sigTop, bw, 230);
      x.textAlign = 'center';
      if (f.tipo === 'dedo' && f.img) {
        const e = f.img, ew = e.width || e.naturalWidth, eh = e.height || e.naturalHeight, s = Math.min((bw - 40) / ew, 200 / eh), w = ew * s, h = eh * s;
        x.drawImage(e, px + (bw - w) / 2, sigTop + 10 + (210 - h) / 2, w, h);
      } else if (f.tipo === 'huella') {
        x.fillStyle = '#E4F3EC'; x.fillRect(px + 2, sigTop + 2, bw - 4, 226); huella(px + bw / 2, sigTop + 34, '#2E7D5B');
        x.font = '800 32px ' + F_; x.fillStyle = '#22694B'; x.fillText('Firmado con huella', px + bw / 2, sigTop + 112);
        x.font = '600 24px ' + F_; x.fillStyle = '#2c5d45'; x.fillText(f.fecha || '', px + bw / 2, sigTop + 156);
        x.font = '500 20px ' + F_; x.fillText('Firma electrónica (Ley 527 de 1999)', px + bw / 2, sigTop + 190);
      } else if (f.tipo === 'pendiente') {
        x.fillStyle = '#FFF3DC'; x.fillRect(px + 2, sigTop + 2, bw - 4, 226); huella(px + bw / 2, sigTop + 40, '#B87300');
        x.font = '800 30px ' + F_; x.fillStyle = '#8A5200'; x.fillText('Pendiente de firma con huella', px + bw / 2, sigTop + 122);
      } else if (f.tipo === 'nocoincide') {
        x.fillStyle = '#FCEBEA'; x.fillRect(px + 2, sigTop + 2, bw - 4, 226);
        x.font = '800 30px ' + F_; x.fillStyle = '#B3261E'; x.fillText('No coincide con lo recibido', px + bw / 2, sigTop + 40);
        x.font = '500 22px ' + F_; wrap(x, f.nota || '', bw - 60).slice(0, 4).forEach((t, i) => x.fillText(t, px + bw / 2, sigTop + 92 + i * 30));
      }
      x.strokeStyle = '#26181D'; x.lineWidth = 2; x.beginPath(); x.moveTo(px + 40, sigTop + 250); x.lineTo(px + bw - 40, sigTop + 250); x.stroke();
      x.font = '700 32px ' + F_; x.fillStyle = '#26181D'; x.fillText(nombre, px + bw / 2, sigTop + 262);
      x.font = '600 24px ' + F_; x.fillStyle = VINO; x.fillText(rol, px + bw / 2, sigTop + 306); x.textAlign = 'left'; };
    firma(M, F.recibe, D.recibe, 'Firma del servicio (recibe)');
    firma(M + bw + 60, F.realiza, D.realiza, 'Firma de quien realiza la ronda');
    x.textAlign = 'center'; x.font = '400 22px ' + F_; x.fillStyle = '#8a7680';
    if (conCodigo) { x.font = '700 24px ' + F_; x.fillStyle = '#26181D'; x.fillText('Código de verificación: ' + D.codigo, W / 2, H - 92); x.font = '400 22px ' + F_; x.fillStyle = '#8a7680'; }
    x.fillText('Clínica Reina Catalina · Control de cilindros de gas · ' + A.id, W / 2, H - 46);
    x.fillStyle = VINO; x.fillRect(0, H - 12, W, 12);
    return c.toDataURL('image/jpeg', 0.93);
  };
})();
