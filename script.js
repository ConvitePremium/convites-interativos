const cfg = window.SITE_CONFIG || {};
const number = String(cfg.whatsapp || "").replace(/\D/g, "");

document.querySelectorAll('.js-whatsapp').forEach(link => {
  const message = link.dataset.message || cfg.mensagemPadrao || "Olá! Quero saber mais sobre os convites interativos.";
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  link.target = "_blank";
  link.rel = "noopener";
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
