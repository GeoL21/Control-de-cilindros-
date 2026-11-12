/* Firma con huella (llaves de acceso / WebAuthn). La usan la app y la página de firma.
   La huella nunca sale del celular: el teléfono firma un reto del servidor con una llave
   que solo se usa poniendo el dedo (o la cara / el PIN del equipo). */
(function () {
  const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const deB64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
  function soporte() {
    if (!window.PublicKeyCredential || !navigator.credentials) throw new Error('Este navegador no permite firmar con huella. Ábrelo en Chrome (Android) o Safari (iPhone) actualizado.');
  }
  window.Huella = {
    disponible: () => !!(window.PublicKeyCredential && navigator.credentials),
    /** Crea la llave en este equipo. reto = { id, reto } del servidor. */
    async crear(reto, nombre) {
      soporte();
      const c = await navigator.credentials.create({ publicKey: {
        challenge: deB64u(reto.reto), rp: { id: location.hostname, name: 'Clínica Reina Catalina' },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: nombre, displayName: nombre },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
        timeout: 90000, attestation: 'none' } });
      if (!c.response.getPublicKey) throw new Error('Este navegador no entrega la llave. Actualiza Chrome.');
      return { retoId: reto.id, credId: c.id, alg: c.response.getPublicKeyAlgorithm(), spki: b64u(c.response.getPublicKey()), clientDataJSON: b64u(c.response.clientDataJSON) };
    },
    /** Firma el reto con una de las llaves de la persona (llaves = lista de IDs). */
    async firmar(reto, llaves) {
      soporte();
      const a = await navigator.credentials.get({ publicKey: {
        challenge: deB64u(reto.reto), rpId: location.hostname, userVerification: 'required', timeout: 90000,
        allowCredentials: (llaves || []).map(id => ({ type: 'public-key', id: deB64u(id) })) } });
      return { retoId: reto.id, credId: a.id, authenticatorData: b64u(a.response.authenticatorData), clientDataJSON: b64u(a.response.clientDataJSON), signature: b64u(a.response.signature) };
    },
    /** Texto claro para los errores del teléfono. */
    error(e) {
      if (e && e.name === 'NotAllowedError') return 'Se canceló o no se reconoció la huella. Intenta de nuevo.';
      if (e && e.name === 'InvalidStateError') return 'Este celular ya tiene una huella registrada para esta persona.';
      if (e && e.name === 'SecurityError') return 'Abre el enlace en Chrome o Safari (no dentro de otra app).';
      return (e && e.message) || String(e);
    }
  };

  /** Firma una ronda con el enlace de un solo uso (k) y actualiza el JPG. api(accion, datos) devuelve data. */
  window.firmarRonda = async function (api, k, alPaso) {
    const info = await api('firmaInfo', { k });
    if (!info.llaves.length) throw new Error(info.firmante.nombre + ' aún no ha registrado su huella. Pide la invitación al administrador.');
    alPaso && alPaso('huella', info);
    const reto = await api('firmaReto', { k });
    const f = await Huella.firmar(reto, info.llaves);
    alPaso && alPaso('enviando', info);
    const out = await api('firmaFirmar', Object.assign({ k }, f));
    // JPG nuevo con la firma (si falla, la firma ya quedó guardada en el servidor)
    try { const j = await rehacerJpg(api, out.jpg, out.render); out.url = j.url; out.imagen = j.imagen; }
    catch (e) { out.errorJpg = e.message; }
    return { info, out };
  };

  /** Vuelve a dibujar el JPG con el estado de las firmas que dice el servidor (R) y lo sube con el permiso t. */
  window.rehacerJpg = async function (api, t, R) {
    const F = {};
    for (const rol of ['realiza', 'recibe']) {
      const x = R.firmas[rol];
      if (x.tipo === 'dedo' && x.img) x.img = await new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = x.img; });
      F[rol] = x.tipo === 'dedo' && !x.img ? { tipo: 'vacia' } : x;
    }
    const jpg = await dibujarRonda({ sede: R.sede, lugar: R.lugar, items: R.items, realiza: R.realiza, recibe: R.recibe, codigo: R.codigo }, { id: R.id, fecha: R.fecha, hora: R.hora }, F);
    const j = await api('firmaJpg', { t, imagen: jpg });
    return { url: j.url, imagen: jpg };
  };

  /** Código de verificación de la ronda: el mismo cálculo que hace el servidor (resumenRonda_). */
  window.codigoRonda = async function (r) {
    const L = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().substring(0, n);
    const u = g => g === 'Dioxicarbomed' ? 'MPa' : 'PSI';
    const canon = JSON.stringify([r.id, r.sede, L(r.fecha, 20), L(r.hora, 20), L(r.lugar, 120), L(r.realiza, 60), L(r.recibe, 60),
      r.items.map(i => [L(i.gas, 40), L(i.serial, 60), L(i.presion, 20) + ' ' + u(L(i.gas, 40)), L(i.ubicacion, 80), L(i.obs, 500)])]);
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canon)))].map(b => b.toString(16).padStart(2, '0')).join('');
    return (h.substring(0, 4) + '-' + h.substring(4, 8)).toUpperCase();
  };
})();
