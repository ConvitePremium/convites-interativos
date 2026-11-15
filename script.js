const cfg = window.SITE_CONFIG || {};
const number = String(cfg.whatsapp || "").replace(/\D/g, "");

// Todos os botões de pedido abrem o formulário, nunca o WhatsApp diretamente.
const pedidoOverlay = document.getElementById('pedidoOverlay');
const pedidoForm = document.getElementById('pedidoForm');
const pedidoClose = document.getElementById('pedidoClose');
let pedidoTrigger = null;
function abrirPedido(event) {
  event.preventDefault();
  pedidoTrigger = event.currentTarget;
  pedidoOverlay.hidden = false;
  document.body.classList.add('pedido-open');
  pedidoForm.elements.nome.focus();
}
function fecharPedido() {
  pedidoOverlay.hidden = true;
  document.body.classList.remove('pedido-open');
  if (pedidoTrigger) pedidoTrigger.focus();
}
document.querySelectorAll('.js-whatsapp').forEach(link => {
  link.removeAttribute('target');
  link.setAttribute('href', '#pedido');
  link.addEventListener('click', abrirPedido);
});
pedidoClose.addEventListener('click', fecharPedido);
pedidoOverlay.addEventListener('click', event => { if (event.target === pedidoOverlay) fecharPedido(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !pedidoOverlay.hidden) fecharPedido(); });
document.querySelectorAll('.pedido-info').forEach(button => {
  button.addEventListener('click', () => {
    const detail = document.getElementById(button.getAttribute('aria-controls'));
    detail.hidden = !detail.hidden;
    button.setAttribute('aria-expanded', String(!detail.hidden));
    button.textContent = detail.hidden ? 'Saiba mais' : 'Ocultar explicação';
  });
});
const PRECO_CONVITE_CENTAVOS = 9990;
const PRECO_SAVE_CENTAVOS = 1990;
const PRECO_ALBUM_CENTAVOS = 3990;
const PRECO_COMBO_CENTAVOS = 14500;
const reais = centavos => (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
function calcularPedido() {
  const save = pedidoForm.elements.save.checked;
  const album = pedidoForm.elements.album.checked;
  const adicionais = (save ? PRECO_SAVE_CENTAVOS : 0) + (album ? PRECO_ALBUM_CENTAVOS : 0);
  const subtotal = PRECO_CONVITE_CENTAVOS + adicionais;
  const combo = save && album;
  const total = combo ? PRECO_COMBO_CENTAVOS : subtotal;
  return { save, album, adicionais, subtotal, combo, desconto: subtotal - total, total };
}
function atualizarTotal() {
  const pedido = calcularPedido();
  const resumo = document.getElementById('pedidoTotal');
  resumo.textContent = 'Convite: ' + reais(PRECO_CONVITE_CENTAVOS) +
    ' | Adicionais: ' + reais(pedido.adicionais) +
    (pedido.combo ? ' | Valor original: ' + reais(pedido.subtotal) +
      ' | Desconto combo: -' + reais(pedido.desconto) : '') +
    ' | Total: ' + reais(pedido.total);
  const promo = document.getElementById('pedidoCombo');
  promo.hidden = !pedido.combo;
  document.getElementById('pedidoComboOriginal').textContent = reais(pedido.subtotal);
  document.getElementById('pedidoComboFinal').textContent = reais(pedido.total);
}
pedidoForm.elements.save.addEventListener('change', atualizarTotal);
pedidoForm.elements.album.addEventListener('change', atualizarTotal);
atualizarTotal();
pedidoForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!pedidoForm.reportValidity()) return;
  if (!number) { alert('Configure o número do WhatsApp no config.js.'); return; }
  const fields = pedidoForm.elements;
  const [ano, mes, dia] = fields.data.value.split('-');
  const pedido = calcularPedido();
  const adicionais = [];
  if (pedido.save) adicionais.push('Save the Date - ' + reais(PRECO_SAVE_CENTAVOS));
  if (pedido.album) adicionais.push('Álbum Online + QR Code de Mesa - ' + reais(PRECO_ALBUM_CENTAVOS));
  const mensagem = [
    '*Olá! Quero solicitar meu convite personalizado.*',
    '',
    '*Nome da aniversariante:* ' + fields.nome.value.trim(),
    '*Idade:* ' + fields.idade.value + ' anos',
    '*Data da festa:* ' + dia + '/' + mes + '/' + ano,
    '*Horário:* ' + fields.horario.value,
    '*Tema e cores:* ' + fields.tema.value.trim(),
    '',
    '*Convite personalizado:* ' + reais(PRECO_CONVITE_CENTAVOS),
    '',
    '*Adicionais:*',
    ...(adicionais.length ? adicionais.map(a => '- ' + a) : ['Nenhum']),
    '*Subtotal dos adicionais:* ' + reais(pedido.adicionais),
    ...(pedido.combo ? [
      '*Valor original:* ' + reais(pedido.subtotal),
      '*Combo promocional (9% OFF):* -' + reais(pedido.desconto)
    ] : []),
    '*VALOR TOTAL DO PEDIDO:* ' + reais(pedido.total),
    '',
    'Aguardo as próximas orientações. Obrigada!'
  ].join('\n');
  const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(mensagem);
  const novaAba = window.open(url, '_blank', 'noopener,noreferrer');
  if (!novaAba) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Abrir WhatsApp';
    link.className = 'pedido-fallback';
    const anterior = pedidoForm.querySelector('.pedido-fallback');
    if (anterior) anterior.remove();
    pedidoForm.appendChild(link);
    alert('Seu navegador bloqueou a nova aba. Use o botão Abrir WhatsApp no formulário.');
  }
});

document.querySelectorAll('.js-demo-link').forEach(link => {
  const url = cfg.exemplos && cfg.exemplos[link.dataset.demo];
  link.href = url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  if (!url || url.includes('SEU-USUARIO')) link.addEventListener('click', e => { e.preventDefault(); alert('Adicione o link deste convite no arquivo config.js.'); });
});

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const slides = [...document.querySelectorAll('.phone-slide')];
const dots = [...document.querySelectorAll('.slide-dots button')];
let currentSlide = 0;
function showSlide(index) {
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  currentSlide = index;
}
dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
if (slides.length > 1) setInterval(() => showSlide((currentSlide + 1) % slides.length), 3500);

document.querySelectorAll('.cover-link img').forEach(img => img.addEventListener('error', () => {
  img.alt = 'Imagem indisponível';
  img.style.opacity = '.2';
}));


// Carrossel dos exemplos no celular: prévia do próximo card + indicadores sincronizados.
const exampleCarousel = document.getElementById('exampleCarousel');
const exampleCards = exampleCarousel ? [...exampleCarousel.querySelectorAll('.example-card')] : [];
const exampleDots = [...document.querySelectorAll('.example-dots button')];
const dragHint = document.querySelector('.drag-hint');
let exampleScrollTimer;

function setActiveExample(index) {
  exampleDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

function nearestExampleIndex() {
  if (!exampleCarousel || !exampleCards.length) return 0;
  const left = exampleCarousel.scrollLeft;
  let closest = 0;
  let distance = Infinity;
  exampleCards.forEach((card, index) => {
    const current = Math.abs(card.offsetLeft - left - 20);
    if (current < distance) { distance = current; closest = index; }
  });
  return closest;
}

if (exampleCarousel && exampleCards.length) {
  setActiveExample(0);
  exampleCarousel.addEventListener('scroll', () => {
    clearTimeout(exampleScrollTimer);
    exampleScrollTimer = setTimeout(() => {
      const index = nearestExampleIndex();
      setActiveExample(index);
      if (dragHint) dragHint.style.opacity = '0';
    }, 90);
  }, { passive: true });

  exampleDots.forEach((dot, index) => dot.addEventListener('click', () => {
    exampleCards[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveExample(index);
    if (dragHint) dragHint.style.opacity = '0';
  }));
}
