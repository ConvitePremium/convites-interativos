const cfg = window.SITE_CONFIG || {};
const number = String(cfg.whatsapp || "").replace(/\D/g, "");

document.querySelectorAll('.js-whatsapp').forEach(link => {
  const message = link.dataset.message || cfg.mensagemPadrao || "Olá! Quero saber mais.";
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  link.target = "_blank";
  link.rel = "noopener";
});

document.querySelectorAll('.js-demo-link').forEach(link => {
  const key = link.dataset.demo;
  const url = cfg.exemplos && cfg.exemplos[key];
  link.href = url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  if (!url || url.includes('SEU-USUARIO')) {
    link.addEventListener('click', event => {
      event.preventDefault();
      alert('Adicione o link deste convite no arquivo config.js.');
    });
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.cover-link img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    img.parentElement.classList.add('missing-cover');
  });
});


// Alterna automaticamente as capas exibidas dentro do celular do topo.
const phoneSlides = Array.from(document.querySelectorAll('.phone-demo'));
if (phoneSlides.length > 1) {
  let activePhoneSlide = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    window.setInterval(() => {
      phoneSlides[activePhoneSlide].classList.remove('is-active');
      activePhoneSlide = (activePhoneSlide + 1) % phoneSlides.length;
      phoneSlides[activePhoneSlide].classList.add('is-active');
    }, 3500);
  }
}
