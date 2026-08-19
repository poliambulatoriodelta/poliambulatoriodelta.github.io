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
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
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
  feedback.style.background = isError ? '#FBE7E0' : '#E4EEEE';
  feedback.style.color = isError ? '#A84F21' : '#0F3D3E';
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

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initMobileNav();
  initBranchBookingButtons();
  initInfoForm();
  initServiceFilter();
});
