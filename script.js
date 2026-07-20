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
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.model-media img, .hero-demo img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    img.parentElement.classList.add('missing-cover');
  });
});
