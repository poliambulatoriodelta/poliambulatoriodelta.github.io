// ============================================
// CORSI ED EVENTI — dati appuntamenti
// Per aggiungere un nuovo corso o evento, inserisci un nuovo oggetto
// in questo array: verrà mostrato automaticamente nel calendario,
// nella sezione "Prossimi appuntamenti" e (se tipo:'evento') tra gli
// eventi in sala corsi. Non serve modificare nient'altro.
//
// Campi:
//   id           identificativo univoco (stringa)
//   tipo         'corso' (ricorrente) oppure 'evento' (una tantum)
//   titolo       nome del corso/evento
//   data         data in formato 'YYYY-MM-DD'
//   orario       fascia oraria, es. '9:00–13:00' — lasciare '' se non definita
//   descrizione  breve descrizione mostrata in agenda e nel calendario
//   titolo_en / descrizione_en  versione inglese, usata nelle pagine in /en/
//   immagine     (solo eventi, opzionale) percorso immagine per la card evento
// ============================================
const CORSI_EVENTI = [
  {
    id: 'blsd-2026-11-27',
    tipo: 'corso',
    titolo: 'Corso BLSD + PBLSD',
    titolo_en: 'BLSD + PBLSD Course',
    data: '2026-11-27',
    orario: '15:30',
    descrizione: "Formazione sulle manovre di rianimazione cardiopolmonare e sull'utilizzo del defibrillatore. Quota di partecipazione € 60,00.",
    descrizione_en: "Training in cardiopulmonary resuscitation and in the use of the defibrillator. Participation fee € 60.00."
  },
  {
    id: 'checkup-2026-11-20',
    tipo: 'evento',
    titolo: 'Giornata Check-Up Base',
    titolo_en: 'Basic Check-Up Day',
    data: '2026-11-20',
    orario: '8:00',
    descrizione: "Giornata dedicata ai Check-Up Base Completo: visita medica generale, elettrocardiogramma, spirometria e analisi del sangue.",
    descrizione_en: "A day dedicated to the Complete Basic Check-Up: general medical examination, electrocardiogram, spirometry and blood tests."
  },
  {
    id: 'primo-soccorso-2026-11-07',
    tipo: 'corso',
    titolo: 'Corso di Primo Soccorso',
    titolo_en: 'First Aid Course',
    data: '2026-11-07',
    orario: '9:00–13:00',
    descrizione: "Percorso formativo dedicato alle principali tecniche e procedure di primo soccorso.",
    descrizione_en: "A training course dedicated to the main first aid techniques and procedures."
  },
  {
    id: 'primo-soccorso-domestico-2026-11-19',
    tipo: 'corso',
    titolo: 'Corso di Primo Soccorso Domestico',
    titolo_en: 'Home First Aid Course',
    data: '2026-11-19',
    orario: '17:00–19:00',
    descrizione: "Corso dedicato alle principali situazioni di emergenza che possono verificarsi in casa e alle relative modalità di intervento.",
    descrizione_en: "A course dedicated to the main emergency situations that can occur at home and how to deal with them."
  }
  // Aggiungi qui i prossimi corsi o eventi
];

// Lingua della pagina (le pagine in /en/ hanno <html lang="en">)
const CORSI_EN = document.documentElement.lang === 'en';

function corsiPad2(n) { return String(n).padStart(2, '0'); }

const CORSI_MESI = CORSI_EN
  ? ['January','February','March','April','May','June','July','August','September','October','November','December']
  : ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const CORSI_MESI_MIN = CORSI_EN
  ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  : ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const CORSI_GIORNI = CORSI_EN
  ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  : ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];

// Testi dell'interfaccia nelle due lingue
const CORSI_TXT = CORSI_EN ? {
  vaiA: 'Go to: ',
  nessuno: 'No dates scheduled at the moment: contact us to be kept up to date on upcoming dates.',
  corso: 'Course', evento: 'Event',
  info: 'Request info',
  wa: (titolo, giorno, mese) => `Hello, I would like to receive information about: ${titolo} on ${giorno} ${mese}.`,
  nessunEvento: 'There are currently no one-off events scheduled in the training room. Upcoming initiatives will be published here as soon as they are scheduled.',
  contattaci: 'Contact us for information'
} : {
  vaiA: 'Vai a: ',
  nessuno: 'Nessun appuntamento in programma al momento: contattaci per essere aggiornato sulle prossime date.',
  corso: 'Corso', evento: 'Evento',
  info: 'Richiedi info',
  wa: (titolo, giorno, mese) => `Salve, vorrei ricevere informazioni su: ${titolo} del ${giorno} ${mese}.`,
  nessunEvento: 'Al momento non ci sono eventi una tantum in programma nella sala corsi. Le prossime iniziative saranno pubblicate qui non appena calendarizzate.',
  contattaci: 'Contattaci per informazioni'
};

let corsiCalYear, corsiCalMonth;

function corsiEventiConData() {
  return CORSI_EVENTI.map(e => ({
    ...e,
    titolo: (CORSI_EN && e.titolo_en) || e.titolo,
    descrizione: (CORSI_EN && e.descrizione_en) || e.descrizione,
    dateObj: new Date(e.data + 'T00:00:00')
  }));
}

function corsiOggi() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function corsiTrovaMesePredefinito() {
  const oggi = corsiOggi();
  const prossimi = corsiEventiConData().filter(e => e.dateObj >= oggi).sort((a, b) => a.dateObj - b.dateObj);
  if (prossimi.length) return { anno: prossimi[0].dateObj.getFullYear(), mese: prossimi[0].dateObj.getMonth() };
  return { anno: oggi.getFullYear(), mese: oggi.getMonth() };
}

function renderCalendario(anno, mese) {
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('calendar-label');
  if (!grid || !label) return;

  corsiCalYear = anno;
  corsiCalMonth = mese;
  label.textContent = `${CORSI_MESI[mese]} ${anno}`;

  grid.innerHTML = '';
  const primoGiorno = new Date(anno, mese, 1).getDay(); // 0=Dom..6=Sab
  const offsetLunedi = (primoGiorno + 6) % 7; // 0=Lun..6=Dom
  const giorniNelMese = new Date(anno, mese + 1, 0).getDate();
  const eventi = corsiEventiConData();

  for (let i = 0; i < offsetLunedi; i++) {
    const vuoto = document.createElement('div');
    vuoto.className = 'cal-day cal-day-empty';
    grid.appendChild(vuoto);
  }

  for (let giorno = 1; giorno <= giorniNelMese; giorno++) {
    const dataStr = `${anno}-${corsiPad2(mese + 1)}-${corsiPad2(giorno)}`;
    const eventiGiorno = eventi.filter(e => e.data === dataStr);

    const cella = document.createElement('div');
    cella.className = 'cal-day' + (eventiGiorno.length ? ' cal-day-active' : '');

    const num = document.createElement('span');
    num.className = 'cal-day-num';
    num.textContent = giorno;
    cella.appendChild(num);

    if (eventiGiorno.length) {
      const dots = document.createElement('span');
      dots.className = 'cal-dots';
      eventiGiorno.forEach(ev => {
        const dot = document.createElement('span');
        dot.className = 'cal-dot cal-dot-' + ev.tipo;
        dot.setAttribute('title', ev.titolo);
        dots.appendChild(dot);
      });
      cella.appendChild(dots);

      cella.setAttribute('role', 'button');
      cella.setAttribute('tabindex', '0');
      cella.setAttribute('aria-label', CORSI_TXT.vaiA + eventiGiorno.map(e => e.titolo).join(', '));
      const idsGiorno = eventiGiorno.map(e => e.id);
      const vaiAgliEventiDelGiorno = () => corsiVaiAEvento(idsGiorno);
      cella.addEventListener('click', vaiAgliEventiDelGiorno);
      cella.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vaiAgliEventiDelGiorno(); }
      });
    }

    grid.appendChild(cella);
  }
}

// Porta l'utente alla scheda del corso/evento corrispondente al giorno cliccato nel calendario
function corsiVaiAEvento(ids) {
  let target = null;
  for (const id of ids) {
    target = document.getElementById('agenda-item-' + id) || document.getElementById('evento-item-' + id);
    if (target) break;
  }
  if (!target) {
    target = document.getElementById('appuntamenti');
  }
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add('cal-target-highlight');
  setTimeout(() => target.classList.remove('cal-target-highlight'), 1600);
}

function initCalendario() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const { anno, mese } = corsiTrovaMesePredefinito();
  renderCalendario(anno, mese);

  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    let m = corsiCalMonth - 1, y = corsiCalYear;
    if (m < 0) { m = 11; y--; }
    renderCalendario(y, m);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    let m = corsiCalMonth + 1, y = corsiCalYear;
    if (m > 11) { m = 0; y++; }
    renderCalendario(y, m);
  });
}

function renderAgenda() {
  const list = document.getElementById('agenda-list');
  if (!list) return;

  const oggi = corsiOggi();
  const prossimi = corsiEventiConData().filter(e => e.dateObj >= oggi).sort((a, b) => a.dateObj - b.dateObj);

  if (!prossimi.length) {
    list.innerHTML = `<p class="agenda-empty">${CORSI_TXT.nessuno}</p>`;
    return;
  }

  list.innerHTML = prossimi.map(ev => `
    <div class="agenda-item" id="agenda-item-${ev.id}">
      <div class="agenda-date">
        <span class="agenda-day">${ev.dateObj.getDate()}</span>
        <span class="agenda-month">${CORSI_MESI_MIN[ev.dateObj.getMonth()]}</span>
      </div>
      <div class="agenda-body">
        <span class="agenda-badge agenda-badge-${ev.tipo}">${ev.tipo === 'corso' ? CORSI_TXT.corso : CORSI_TXT.evento}</span>
        <h3>${ev.titolo}</h3>
        <p>${ev.descrizione}</p>
        <span class="agenda-meta">${CORSI_GIORNI[ev.dateObj.getDay()]} ${ev.dateObj.getDate()} ${CORSI_MESI[ev.dateObj.getMonth()]}${ev.orario ? ' · ' + ev.orario : ''}</span>
      </div>
      <a href="#" class="btn btn-sm btn-primary" data-wa-message="${CORSI_TXT.wa(ev.titolo, ev.dateObj.getDate(), CORSI_MESI[ev.dateObj.getMonth()])}">${CORSI_TXT.info}</a>
    </div>
  `).join('');

  if (typeof initWhatsAppLinks === 'function') initWhatsAppLinks();
}

function renderEventiSalaCorsi() {
  const wrap = document.getElementById('eventi-list');
  if (!wrap) return;

  const eventi = corsiEventiConData().filter(e => e.tipo === 'evento').sort((a, b) => a.dateObj - b.dateObj);

  if (!eventi.length) {
    wrap.innerHTML = `
      <div class="eventi-empty">
        <p>${CORSI_TXT.nessunEvento}</p>
        <a href="contatti.html" class="btn btn-outline">${CORSI_TXT.contattaci}</a>
      </div>`;
    return;
  }

  wrap.innerHTML = `<div class="eventi-grid">${eventi.map(ev => `
    <div class="evento-card" id="evento-item-${ev.id}">
      ${ev.immagine ? `<img src="${ev.immagine}" alt="${ev.titolo}">` : ''}
      <div class="evento-card-body">
        <span class="agenda-badge agenda-badge-evento">${CORSI_TXT.evento}</span>
        <h3>${ev.titolo}</h3>
        <p>${ev.descrizione}</p>
        <span class="agenda-meta">${CORSI_GIORNI[ev.dateObj.getDay()]} ${ev.dateObj.getDate()} ${CORSI_MESI[ev.dateObj.getMonth()]}${ev.orario ? ' · ' + ev.orario : ''}</span>
        <div style="margin-top:16px;">
          <a href="#" class="btn btn-sm btn-primary" data-wa-message="${CORSI_TXT.wa(ev.titolo, ev.dateObj.getDate(), CORSI_MESI[ev.dateObj.getMonth()])}">${CORSI_TXT.info}</a>
        </div>
      </div>
    </div>
  `).join('')}</div>`;

  if (typeof initWhatsAppLinks === 'function') initWhatsAppLinks();
}

document.addEventListener('DOMContentLoaded', () => {
  initCalendario();
  renderAgenda();
  renderEventiSalaCorsi();
});
