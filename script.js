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

// Galeria por categoria: mantém o carrossel original da vitrine.
const modelosOverlay = document.getElementById('modelosOverlay');
const modelosStage = document.getElementById('modelosStage');
const modelosTitle = document.getElementById('modelosTitle');
const modelosPosition = document.getElementById('modelosPosition');
const nomesCategorias = { infantil:'Convites Infantis', quinzeAnos:'Convites de 15 Anos', casamento:'Convites de Casamento' };
const capasCategorias = { infantil:'assets/capa-infantil.webp', quinzeAnos:'assets/capa-15anos.webp', casamento:'assets/capa-casamento.webp' };
let categoriaAtual = 'infantil';
let modeloAtual = 0;
let galeriaTrigger = null;
function itensDaCategoria(categoria) {
  const definidos = cfg.galerias && cfg.galerias[categoria];
  const antigo = cfg.exemplos && cfg.exemplos[categoria] || '';
  const padrao = capasCategorias[categoria];
  const itens = Array.from({length:3}, (_, i) => {
    const info = Array.isArray(definidos) ? definidos[i] || {} : {};
    return { titulo: info.titulo || `Modelo ${i+1}`, capa: info.capa || padrao,
      link: info.link || (i === 0 ? antigo : '') };
  });
  itens.push({titulo:'Crie seu próprio modelo', personalizado:true});
  return itens;
}
// Os cartões são criados uma única vez: recriá-los a cada clique impedia a transição CSS.
const camadasModelos = [
  {x:0,y:0,angle:0,scale:1},
  {x:36,y:4,angle:8,scale:.97},
  {x:-36,y:8,angle:-8,scale:.94},
  {x:52,y:12,angle:12,scale:.91}
];
let cartoesModelos = [];
let animandoModelos = false;
function posicaoModelo(offset){
  const c=camadasModelos[offset];
  return `translateX(calc(-50% + ${c.x}px)) translateY(${c.y}px) rotate(${c.angle}deg) scale(${c.scale})`;
}
function aplicarCamada(card,offset){
  card.style.transform=posicaoModelo(offset);
  card.style.zIndex=String(10-offset);
  card.setAttribute('aria-hidden',offset===0?'false':'true');
  card.tabIndex=offset===0?0:-1;
}
function renderizarModelos(){
  const itens=itensDaCategoria(categoriaAtual);
  modelosStage.replaceChildren();cartoesModelos=[];animandoModelos=false;
  itens.forEach((item,index)=>{
    const card=document.createElement('button');
    card.type='button';card.className='modelo-card';
    card.setAttribute('aria-label',item.titulo);
    if(item.personalizado){
      card.classList.add('modelo-personalizado');
      card.innerHTML='<span class="modelo-personalizado-icone">✦</span><strong>Crie seu próprio modelo</strong><small>Um convite exclusivo com o seu tema e suas cores</small><span class="modelo-acao">Personalizar meu convite →</span>';
    }else{
      const img=document.createElement('img');img.src=item.capa;img.alt='Capa do '+item.titulo;
      card.appendChild(img);
      const info=document.createElement('span');info.className='modelo-caption';
      const titulo=document.createElement('strong');titulo.textContent=item.titulo;
      const detalhe=document.createElement('small');detalhe.textContent=item.link?'Toque para abrir o convite →':'Exemplo em preparação';
      info.append(titulo,detalhe);card.appendChild(info);
    }
    card.addEventListener('click',()=>{
      if(animandoModelos||index!==modeloAtual)return;
      if(item.personalizado){fecharModelos();abrirPedido({preventDefault(){},currentTarget:galeriaTrigger});return;}
      if(!item.link){alert('Este exemplo ainda será adicionado. Use as setas para ver outros modelos.');return;}
      window.open(item.link,'_blank','noopener,noreferrer');
    });
    cartoesModelos.push(card);modelosStage.appendChild(card);
  });
  cartoesModelos.forEach((card,index)=>aplicarCamada(card,(index-modeloAtual+4)%4));
  modelosPosition.textContent=`${modeloAtual+1} de ${itens.length}`;
}
function navegarModelos(direcao){
  if(animandoModelos||modelosOverlay.hidden)return;
  animandoModelos=true;
  const anterior=modeloAtual;
  const proximo=(anterior+direcao+4)%4;
  const duracao=680;
  const saida=cartoesModelos[anterior];
  // A capa da frente sai pela lateral, liberando a que vem de trás.
  // Os demais cartões animam de sua camada atual até a próxima.
  const animacoes=[];
  cartoesModelos.forEach((card,index)=>{
    const origem=(index-anterior+4)%4;
    const destino=(index-proximo+4)%4;
    const inicial=posicaoModelo(origem);
    const final=posicaoModelo(destino);
    card.style.transition='none';
    if(index===anterior){
      card.style.zIndex='30';
      const lateral=direcao===1?-1:1;
      const meio=`translateX(calc(-50% + ${lateral*155}px)) translateY(-15px) rotate(${lateral*15}deg) scale(1.035)`;
      animacoes.push(card.animate([
        {transform:inicial,offset:0,opacity:1},
        {transform:meio,offset:.46,opacity:.95},
        {transform:final,offset:1,opacity:1}
      ],{duration:duracao,easing:'ease-in-out',fill:'forwards'}));
    }else{
      card.style.zIndex=String(10-destino);
      animacoes.push(card.animate([
        {transform:inicial,opacity:origem===3?.87:1},
        {transform:final,opacity:1}
      ],{duration:duracao,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'}));
    }
  });
  modeloAtual=proximo;
  modelosPosition.textContent=`${modeloAtual+1} de 4`;
  Promise.all(animacoes.map(a=>a.finished.catch(()=>{}))).then(()=>{
    animacoes.forEach(a=>a.cancel());
    cartoesModelos.forEach((card,index)=>{
      aplicarCamada(card,(index-modeloAtual+4)%4);
      card.style.transition='';card.style.opacity='';
    });
    animandoModelos=false;
  });
}
function abrirModelos(e){
  e.preventDefault();galeriaTrigger=e.currentTarget;
  categoriaAtual=e.currentTarget.dataset.demo;modeloAtual=0;
  modelosTitle.textContent=nomesCategorias[categoriaAtual];
  modelosOverlay.hidden=false;document.body.classList.add('modelos-open');
  renderizarModelos();document.getElementById('modelosClose').focus();
}
function fecharModelos(){
  modelosOverlay.hidden=true;document.body.classList.remove('modelos-open');
  if(galeriaTrigger)galeriaTrigger.focus();
}
document.querySelectorAll('.js-category-link').forEach(link=>link.addEventListener('click',abrirModelos));
document.getElementById('modelosClose').addEventListener('click',fecharModelos);
modelosOverlay.addEventListener('click',e=>{if(e.target===modelosOverlay)fecharModelos();});
document.getElementById('modelosPrev').addEventListener('click',()=>{navegarModelos(-1);});
document.getElementById('modelosNext').addEventListener('click',()=>{navegarModelos(1);});
document.addEventListener('keydown',e=>{
  if(modelosOverlay.hidden)return;
  if(e.key==='Escape')fecharModelos();
  if(e.key==='ArrowRight'){navegarModelos(1);}
  if(e.key==='ArrowLeft'){navegarModelos(-1);}
});
let touchX=0;
modelosStage.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;},{passive:true});
modelosStage.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>45){navegarModelos(delta<0?1:-1);}},{passive:true});

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
