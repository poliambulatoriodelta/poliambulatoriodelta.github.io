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
//   immagine     (solo eventi, opzionale) percorso immagine per la card evento
// ============================================
const CORSI_EVENTI = [
  {
    id: 'blsd-2026-09-25',
    tipo: 'corso',
    titolo: 'Corso BLSD',
    data: '2026-09-25',
    orario: '',
    descrizione: "Formazione sulle manovre di rianimazione cardiopolmonare e sull'utilizzo del defibrillatore."
  }
  // Aggiungi qui i prossimi corsi o eventi
];

function corsiPad2(n) { return String(n).padStart(2, '0'); }

const CORSI_MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const CORSI_MESI_MIN = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const CORSI_GIORNI = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];

let corsiCalYear, corsiCalMonth;

function corsiEventiConData() {
  return CORSI_EVENTI.map(e => ({ ...e, dateObj: new Date(e.data + 'T00:00:00') }));
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
    }

    grid.appendChild(cella);
  }
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
    list.innerHTML = '<p class="agenda-empty">Nessun appuntamento in programma al momento: contattaci per essere aggiornato sulle prossime date.</p>';
    return;
  }

  list.innerHTML = prossimi.map(ev => `
    <div class="agenda-item">
      <div class="agenda-date">
        <span class="agenda-day">${ev.dateObj.getDate()}</span>
        <span class="agenda-month">${CORSI_MESI_MIN[ev.dateObj.getMonth()]}</span>
      </div>
      <div class="agenda-body">
        <span class="agenda-badge agenda-badge-${ev.tipo}">${ev.tipo === 'corso' ? 'Corso' : 'Evento'}</span>
        <h3>${ev.titolo}</h3>
        <p>${ev.descrizione}</p>
        <span class="agenda-meta">${CORSI_GIORNI[ev.dateObj.getDay()]} ${ev.dateObj.getDate()} ${CORSI_MESI[ev.dateObj.getMonth()]}${ev.orario ? ' · ' + ev.orario : ''}</span>
      </div>
      <a href="#" class="btn btn-sm btn-primary" data-wa-message="Salve, vorrei ricevere informazioni su: ${ev.titolo} del ${ev.dateObj.getDate()} ${CORSI_MESI[ev.dateObj.getMonth()]}.">Richiedi info</a>
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
        <p>Al momento non ci sono eventi una tantum in programma nella sala corsi. Le prossime iniziative saranno pubblicate qui non appena calendarizzate.</p>
        <a href="contatti.html" class="btn btn-outline">Contattaci per informazioni</a>
      </div>`;
    return;
  }

  wrap.innerHTML = `<div class="eventi-grid">${eventi.map(ev => `
    <div class="evento-card">
      ${ev.immagine ? `<img src="${ev.immagine}" alt="${ev.titolo}">` : ''}
      <div class="evento-card-body">
        <span class="agenda-badge agenda-badge-evento">Evento</span>
        <h3>${ev.titolo}</h3>
        <p>${ev.descrizione}</p>
        <span class="agenda-meta">${CORSI_GIORNI[ev.dateObj.getDay()]} ${ev.dateObj.getDate()} ${CORSI_MESI[ev.dateObj.getMonth()]}${ev.orario ? ' · ' + ev.orario : ''}</span>
        <div style="margin-top:16px;">
          <a href="#" class="btn btn-sm btn-primary" data-wa-message="Salve, vorrei ricevere informazioni su: ${ev.titolo} del ${ev.dateObj.getDate()} ${CORSI_MESI[ev.dateObj.getMonth()]}.">Richiedi info</a>
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
