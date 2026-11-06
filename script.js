const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

$('#anio').textContent = new Date().getFullYear();

/* Navegación */
const nav = $('#nav');
const navBoton = $('#navBoton');
const enCelular = matchMedia('(max-width: 760px)');
let ultimoY = scrollY;
const marcarNav = () => {
  nav.classList.toggle('fija', scrollY > 40);
  /* En el celular la barra se esconde al bajar y regresa al subir, para dejarle la pantalla a las fotos */
  const d = scrollY - ultimoY;
  if (Math.abs(d) < 8) return;
  nav.classList.toggle('oculta', enCelular.matches && d > 0 && scrollY > 300);
  ultimoY = scrollY;
};
addEventListener('scroll', marcarNav, { passive: true });
marcarNav();

function menu(abrir) {
  nav.classList.toggle('abierta', abrir);
  navBoton.setAttribute('aria-expanded', abrir);
  $('span', navBoton).textContent = abrir ? 'Cerrar' : 'Menú';
  document.body.style.overflow = abrir ? 'hidden' : '';
}
navBoton.addEventListener('click', () => menu(!nav.classList.contains('abierta')));
$$('#navLinks a').forEach(a => a.addEventListener('click', () => menu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('abierta')) menu(false); });

const enlaces = $$('#navLinks a');
const seccionActual = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    enlaces.forEach(a => a.classList.toggle('actual', a.hash === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['inicio', 'fotografia', 'mayka', 'video', 'software', 'nosotros', 'servicios', 'contacto']
  .forEach(id => seccionActual.observe(document.getElementById(id)));

/* Portada: las fotos cambian solas */
const heroFotos = $$('#heroFotos img');
if (!sinMovimiento && heroFotos.length > 1) {
  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    const sig = (i + 1) % heroFotos.length;
    if (!heroFotos[sig].complete) { heroFotos[sig].loading = 'eager'; return; }
    heroFotos[i].classList.remove('activa');
    heroFotos[sig].classList.add('activa');
    $('#heroDato').textContent = heroFotos[sig].dataset.pie;
    i = sig;
  }, 6500);
}

/* Galería */
const fotos = window.GALERIA || [];
const galeria = $('#galeria');
let visibles = fotos;

const verMas = $('#verMas');
const INICIALES = 18;

function pintarGaleria(cat, completa = false) {
  const todas = cat === 'todo' ? ordenMezclado : fotos.filter(f => f.cat === cat);
  visibles = cat === 'todo' && !completa ? todas.slice(0, INICIALES) : todas;
  verMas.hidden = visibles.length === todas.length;
  verMas.textContent = `Ver las ${todas.length} fotos`;
  galeria.innerHTML = '';
  let desdeGrande = 8;
  visibles.forEach((f, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'foto';
    /* En el celular, cada tanto una foto horizontal ocupa todo el ancho y rompe las dos columnas */
    if (f.w > f.h * 1.2 && desdeGrande >= 8) { b.classList.add('grande'); desdeGrande = 0; } else desdeGrande++;
    b.style.setProperty('--ar', (f.w / f.h).toFixed(3));
    b.setAttribute('aria-label', 'Ampliar: ' + f.alt);
    const img = new Image();
    img.alt = f.alt;
    img.width = f.w;
    img.height = f.h;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('load', () => img.classList.add('lista'));
    img.src = `img/galeria/${f.id}-m.webp`;
    b.append(img);
    if (f.exif) {
      const s = document.createElement('span');
      s.textContent = f.exif;
      b.append(s);
    }
    b.addEventListener('click', () => abrirVisor(i, b));
    galeria.append(b);
  });
}

/* En "Todo" las categorías se intercalan para que se vea la variedad */
const porCat = {};
fotos.forEach(f => (porCat[f.cat] ||= []).push(f));
const ordenMezclado = [];
const colas = Object.values(porCat).map(c => [...c]);
while (colas.some(c => c.length)) colas.forEach(c => { if (c.length) ordenMezclado.push(c.shift()); });

$$('#filtros button').forEach(b => {
  const cat = b.dataset.cat;
  const n = cat === 'todo' ? fotos.length : (porCat[cat] || []).length;
  const sup = document.createElement('sup');
  sup.textContent = n;
  b.append(sup);
  b.addEventListener('click', () => {
    $$('#filtros button').forEach(o => o.setAttribute('aria-pressed', o === b));
    pintarGaleria(cat);
  });
});
verMas.addEventListener('click', () => {
  const n = visibles.length;
  pintarGaleria('todo', true);
  galeria.children[n].focus({ preventScroll: true });
});
pintarGaleria('todo');

/* Visor */
const visor = $('#visor');
const vImg = new Image();
$('figure', visor).prepend(vImg);
let vIndice = 0;
let vOrigen = null;

function mostrar(i) {
  vIndice = (i + visibles.length) % visibles.length;
  const f = visibles[vIndice];
  vImg.style.aspectRatio = `${f.w} / ${f.h}`;
  vImg.src = `img/galeria/${f.id}.webp`;
  vImg.alt = f.alt;
  $('#vAlt').textContent = f.alt;
  $('#vExif').textContent = f.exif;
  [1, -1].forEach(d => {
    const v = visibles[(vIndice + d + visibles.length) % visibles.length];
    new Image().src = `img/galeria/${v.id}.webp`;
  });
}
function abrirVisor(i, origen) {
  vOrigen = origen;
  mostrar(i);
  visor.showModal();
  document.body.style.overflow = 'hidden';
}
visor.addEventListener('close', () => {
  document.body.style.overflow = '';
  vImg.removeAttribute('src');
  if (vOrigen) vOrigen.focus({ preventScroll: true });
});
$('#vCerrar').addEventListener('click', () => visor.close());
$('#vAnt').addEventListener('click', () => mostrar(vIndice - 1));
$('#vSig').addEventListener('click', () => mostrar(vIndice + 1));
visor.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') mostrar(vIndice - 1);
  if (e.key === 'ArrowRight') mostrar(vIndice + 1);
});
visor.addEventListener('click', e => { if (e.target === visor || e.target.tagName === 'FIGURE') visor.close(); });
let toqueX = null;
visor.addEventListener('touchstart', e => { toqueX = e.changedTouches[0].clientX; }, { passive: true });
visor.addEventListener('touchend', e => {
  if (toqueX === null) return;
  const d = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(d) > 50) mostrar(vIndice + (d < 0 ? 1 : -1));
  toqueX = null;
}, { passive: true });

/* Video: solo se descarga y reproduce el que está en pantalla */
const ahorro = navigator.connection && navigator.connection.saveData;
const clips = $$('.clip').map(fig => {
  const nombre = fig.dataset.video;
  const marco = document.createElement('div');
  marco.className = 'clip-marco';
  const v = document.createElement('video');
  v.poster = `img/video/${nombre}.webp`;
  v.src = `img/video/${nombre}.mp4`;
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'none';
  v.setAttribute('aria-label', $('strong', fig).textContent);
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'clip-sonido';
  const pintar = () => {
    b.innerHTML = `<svg class="i"><use href="#${v.muted ? 'i-mudo' : 'i-sonido'}"/></svg>`;
    b.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Quitar sonido');
  };
  pintar();
  b.addEventListener('click', () => {
    const activar = v.muted;
    clips.forEach(c => { c.v.muted = true; c.pintar(); });
    v.muted = !activar;
    pintar();
    v.play().catch(() => {});
  });
  marco.append(v, b);
  fig.prepend(marco);
  return { v, pintar };
});
if (!sinMovimiento && !ahorro) {
  const reproducir = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: .7 });
  clips.forEach(c => reproducir.observe(c.v));
} else {
  clips.forEach(c => { c.v.controls = true; });
}

/* Carruseles de los proyectos */
$$('.carrusel').forEach(c => {
  const pista = $('.carrusel-pista', c);
  const total = pista.children.length;
  /* Paso real entre capturas: en el celular cada una deja asomar la siguiente */
  const paso = () => (pista.children[1].offsetLeft - pista.children[0].offsetLeft) || pista.clientWidth || 1;
  const actual = () => Math.round(pista.scrollLeft / paso());
  const ir = i => pista.scrollTo({ left: i * paso(), behavior: sinMovimiento ? 'auto' : 'smooth' });
  const boton = (clase, icono, texto, d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'carrusel-b ' + clase;
    b.setAttribute('aria-label', `${texto} de ${c.dataset.nombre}`);
    b.innerHTML = `<svg class="i"><use href="#${icono}"/></svg>`;
    b.addEventListener('click', () => ir(actual() + d));
    return b;
  };
  const ant = boton('ant', 'i-izq', 'Captura anterior', -1);
  const sig = boton('sig', 'i-der', 'Captura siguiente', 1);
  const n = document.createElement('span');
  n.className = 'carrusel-n';
  const pintar = () => {
    const i = actual();
    n.textContent = `${i + 1} / ${total}`;
    ant.disabled = i === 0;
    sig.disabled = i === total - 1;
  };
  pista.addEventListener('scroll', pintar, { passive: true });
  addEventListener('resize', pintar, { passive: true });
  pista.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      ir(actual() + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  c.append(ant, sig, n);
  pintar();
});

/* En el celular los proyectos menores se abren con un botón, igual que la galería */
const rejilla = $('.rejilla');
const verProyectos = $('#verProyectos');
const tarjetas = $$('.tarjeta', rejilla);
rejilla.classList.add('plegada');
verProyectos.textContent = `Ver ${tarjetas.length - 3} proyectos más`;
verProyectos.addEventListener('click', () => {
  rejilla.classList.remove('plegada');
  tarjetas[3].tabIndex = -1;
  tarjetas[3].focus({ preventScroll: true });
});

/* Aparición al hacer scroll */
const aparecer = new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { rootMargin: '0px 0px -40px 0px', threshold: .05 });
/* Se reinicia solo cuando ya salió por completo de la pantalla, para que no se vea desaparecer */
const reiniciar = new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (!e.isIntersecting) e.target.classList.remove('visible'); });
});
$$('.encabezado, .destacado, .tarjeta, .caso-texto, .caso-fotos, .nosotros-fotos, .nosotros-texto, .lista-servicios li, .contacto-texto, .formulario')
  .forEach(el => { el.classList.add('aparece'); aparecer.observe(el); reiniciar.observe(el); });

/* Formulario: valida y abre el correo del visitante */
const formulario = $('#formulario');
const reglas = {
  nombre: v => v.trim() ? '' : 'Escribe tu nombre.',
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Revisa tu correo; debe verse como nombre@correo.com.',
  mensaje: v => v.trim() ? '' : 'Cuéntame en qué te puedo ayudar.',
};
function validar(campo) {
  const msg = reglas[campo.name](campo.value);
  const error = $('#e-' + campo.name);
  error.textContent = msg;
  campo.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (msg) campo.setAttribute('aria-describedby', error.id); else campo.removeAttribute('aria-describedby');
  return !msg;
}
$$('input, textarea', formulario).forEach(c => c.addEventListener('blur', () => { if (c.value) validar(c); }));
formulario.addEventListener('submit', e => {
  e.preventDefault();
  const campos = $$('input, textarea', formulario);
  const malos = campos.filter(c => !validar(c));
  if (malos.length) { malos[0].focus(); return; }
  const d = new FormData(formulario);
  const asunto = encodeURIComponent(`Nuevo mensaje de ${d.get('nombre')} desde el portafolio`);
  const cuerpo = encodeURIComponent(`Nombre: ${d.get('nombre')}\nCorreo: ${d.get('correo')}\n\nMensaje:\n${d.get('mensaje')}`);
  location.href = `mailto:coroneljoseantonio06@gmail.com?subject=${asunto}&body=${cuerpo}`;
});
