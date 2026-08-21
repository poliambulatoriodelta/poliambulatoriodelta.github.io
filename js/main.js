// ============================================
// POLIAMBULATORIO DELTA — Script principale
// ============================================

// --- Numero WhatsApp della struttura (placeholder da confermare) ---
const WHATSAPP_NUMBER = "390952904796"; // formato internazionale senza + né spazi

// Costruisce link WhatsApp con messaggio precompilato
function buildWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

// Popola tutti i link/bottoni con data-wa-message
function initWhatsAppLinks() {
  document.querySelectorAll('[data-wa-message]').forEach(el => {
    const msg = el.getAttribute('data-wa-message');
    el.setAttribute('href', buildWhatsAppLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

// Menu mobile
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!toggle || !mobileNav) return;

  function openNav() {
    mobileNav.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    mobileNav.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (backdrop) backdrop.addEventListener('click', closeNav);

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeNav);
  });
}

// Prenotazione branca specifica -> genera messaggio WhatsApp dinamico
function initBranchBookingButtons() {
  document.querySelectorAll('[data-wa-branch]').forEach(el => {
    const branch = el.getAttribute('data-wa-branch');
    const message = `Salve, vorrei prenotare una visita di ${branch} presso il Poliambulatorio Delta. Potete indicarmi la prima disponibilità?`;
    el.setAttribute('href', buildWhatsAppLink(message));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

// Form richiesta informazioni -> invia riepilogo su WhatsApp
function initInfoForm() {
  const form = document.getElementById('info-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = form.querySelector('#f-nome').value.trim();
    const telefono = form.querySelector('#f-telefono').value.trim();
    const branca = form.querySelector('#f-branca').value;
    const messaggio = form.querySelector('#f-messaggio').value.trim();

    if (!nome || !telefono) {
      showFormFeedback('Compila almeno nome e telefono per procedere.', true);
      return;
    }

    let waText = `Salve, sono ${nome}.`;
    if (branca) waText += ` Sono interessato/a a: ${branca}.`;
    if (messaggio) waText += ` ${messaggio}`;
    waText += ` (Recapito telefonico: ${telefono})`;

    const link = buildWhatsAppLink(waText);
    window.open(link, '_blank', 'noopener,noreferrer');

    showFormFeedback('Richiesta pronta! Si è aperta una chat WhatsApp con il messaggio precompilato: basta premere invia.', false);
    form.reset();
  });
}

function showFormFeedback(text, isError) {
  const feedback = document.getElementById('form-feedback');
  if (!feedback) return;
  feedback.textContent = text;
  feedback.style.display = 'block';
  feedback.style.background = isError ? '#F3E4D8' : '#E3F0F6';
  feedback.style.color = isError ? '#A84F21' : '#004C7A';
}

// Filtro prestazioni per branca (pagina prestazioni)
function initServiceFilter() {
  const filterBar = document.getElementById('service-filter');
  if (!filterBar) return;

  const buttons = filterBar.querySelectorAll('button');
  const groups = document.querySelectorAll('[data-service-group]');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');
      const target = btn.getAttribute('data-filter');

      groups.forEach(group => {
        if (target === 'tutte' || group.getAttribute('data-service-group') === target) {
          group.style.display = '';
        } else {
          group.style.display = 'none';
        }
      });
    });
  });
}

// Lightbox: apre a schermo intero le immagini con classe .lightbox-trigger
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  if (!lightbox || !lightboxImg) return;

  function open(trigger) {
    const src = trigger.getAttribute('data-full') || trigger.querySelector('img').src;
    const alt = trigger.querySelector('img') ? trigger.querySelector('img').alt : '';
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => open(trigger));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(trigger);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}

// Animazione di comparsa dei blocchi durante lo scorrimento
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initMobileNav();
  initBranchBookingButtons();
  initInfoForm();
  initServiceFilter();
  initLightbox();
  initScrollReveal();
});
