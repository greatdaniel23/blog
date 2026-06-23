/* ===========================================================
   ALPHA DIGITAL — Agency AI Agent Widget
   Generalized floating chat panel. Configured via data-* attributes
   on its own <script> tag. Same-origin /api/* only — no infra leak.

   Attributes:
     data-agent-id   (required) — numeric agent_id to use
     data-api-url    (optional) — default /api/chat
     data-greeting   (optional) — opening message text
     data-accent     (optional) — CSS hex color for accent (default #10b981 emerald)

   Lead capture:
     When agent response contains [CAPTURE_LEAD] token, the widget strips it
     from displayed text and renders an inline confirm card. User taps
     "Konfirmasi" → POST /api/agency/lead with session_id + source_page.
     On success: thank-you state. On 429: "coba lagi nanti" message.

   Consultation:
     When agent response contains [REQUEST_CONSULTATION] token, the widget strips it
     and renders a consultation confirm card. Requires lead_id from prior lead capture.
     User confirms date/slot → POST /api/agency/consultation with lead_id + date + slot + notes.
     On success: friendly thank-you. On 429: "coba lagi nanti".
   =========================================================== */

(function () {
  'use strict';

  /* ---- Config from data-* attributes ---- */
  var scriptEl = (function () {
    var scripts = document.querySelectorAll('script[data-agent-id]');
    return scripts[scripts.length - 1] || null;
  })();

  var AGENT_ID   = scriptEl ? parseInt(scriptEl.getAttribute('data-agent-id') || '5', 10) : 5;
  var API_URL    = scriptEl ? (scriptEl.getAttribute('data-api-url') || '/api/chat') : '/api/chat';
  var GREETING   = scriptEl
    ? (scriptEl.getAttribute('data-greeting') || 'Halo! Saya asisten Alpha Digital. Ada yang bisa saya bantu soal digital marketing bisnis Anda?')
    : 'Halo! Saya asisten Alpha Digital. Ada yang bisa saya bantu soal digital marketing bisnis Anda?';
  var ACCENT     = scriptEl ? (scriptEl.getAttribute('data-accent') || '#10b981') : '#10b981';

  /* ---- Session ID ---- */
  var sessionId = 'agency-' + Math.random().toString(36).slice(2, 10);

  /* ---- Escape HTML ---- */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /* ---- Conversation message count for throttle gate (min-conversation check) ---- */
  var userMessageCount = 0;

  /* ---- Accumulated conversation context for lead confirm card ---- */
  var leadContext = { name: '', whatsapp: '', email: '', business_type: '', need_summary: '' };

  /* ---- Lead ID returned from /api/agency/lead POST ---- */
  var capturedLeadId = null;

  /* ---- Accumulated consultation context ---- */
  var consultationContext = { preferred_date: '', preferred_slot: '', notes: '' };

  /* ---- Inject styles ---- */
  function injectStyles() {
    if (document.getElementById('aa-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'aa-widget-styles';
    style.textContent = [
      /* Toggle button */
      '#aa-widget-toggle{position:fixed;bottom:24px;right:24px;z-index:99998;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:transform 0.2s,opacity 0.35s;opacity:0;pointer-events:none;background:' + ACCENT + ';}',
      '#aa-widget-toggle.is-ready{opacity:1;pointer-events:auto;}',
      '#aa-widget-toggle:hover{transform:scale(1.08);}',
      '#aa-widget-toggle svg{color:#fff;}',
      /* Panel */
      '#aa-widget-panel{position:fixed;bottom:88px;right:24px;z-index:99999;width:340px;max-width:calc(100vw - 32px);background:#fff;border:2px solid #1e293b;box-shadow:6px 6px 0 #1e293b;display:flex;flex-direction:column;height:520px;max-height:calc(100vh - 120px);transform:translateY(16px) scale(0.97);opacity:0;pointer-events:none;transition:transform 0.22s,opacity 0.22s;}',
      '#aa-widget-panel.aa--open{transform:translateY(0) scale(1);opacity:1;pointer-events:auto;}',
      /* Header */
      '.aa-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:2px solid #e2e8f0;background:#fff;flex-shrink:0;}',
      '.aa-header__left{display:flex;align-items:center;gap:10px;}',
      '.aa-status-dot{width:8px;height:8px;border-radius:50%;background:' + ACCENT + ';flex-shrink:0;}',
      '.aa-agent-name{font-weight:700;font-size:13px;color:#1e293b;font-family:inherit;}',
      '.aa-status-line{font-size:10px;color:#64748b;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;}',
      '.aa-close{background:none;border:none;cursor:pointer;color:#94a3b8;padding:4px;display:flex;align-items:center;justify-content:center;}',
      '.aa-close:hover{color:#1e293b;}',
      /* Transcript */
      '.aa-transcript{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;}',
      /* Messages */
      '.aa-msg--agent{display:flex;flex-direction:column;align-items:flex-start;max-width:85%;}',
      '.aa-msg--user{display:flex;flex-direction:column;align-items:flex-end;align-self:flex-end;max-width:85%;}',
      '.aa-bubble{padding:10px 12px;font-size:13px;line-height:1.5;color:#1e293b;border:2px solid #e2e8f0;background:#f8fafc;white-space:pre-wrap;word-break:break-word;}',
      '.aa-bubble--user{background:' + ACCENT + ';color:#fff;border-color:' + ACCENT + ';}',
      '.aa-bubble--error{background:#fef2f2;color:#b91c1c;border-color:#fca5a5;font-size:12px;}',
      /* Typing dots */
      '.aa-typing{display:inline-flex;gap:4px;padding:10px 14px;border:2px solid #e2e8f0;background:#f8fafc;}',
      '.aa-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:aa-bounce 1.1s infinite both;}',
      '.aa-dot:nth-child(2){animation-delay:.18s;}',
      '.aa-dot:nth-child(3){animation-delay:.36s;}',
      '@keyframes aa-bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}',
      /* Input row */
      '.aa-input-row{display:flex;gap:8px;padding:10px 12px;border-top:2px solid #e2e8f0;flex-shrink:0;background:#fff;}',
      '.aa-input{flex:1;padding:8px 10px;border:2px solid #cbd5e1;font-size:13px;color:#1e293b;background:#fff;outline:none;font-family:inherit;}',
      '.aa-input:focus{border-color:' + ACCENT + ';}',
      '.aa-send{padding:8px 14px;background:' + ACCENT + ';color:#fff;border:2px solid #1e293b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;}',
      '.aa-send:disabled{opacity:0.5;cursor:not-allowed;}',
      /* Lead confirm card */
      '.aa-lead-card{border:2px solid ' + ACCENT + ';background:#f0fdf4;padding:12px;font-size:12px;color:#1e293b;margin-top:6px;max-width:95%;}',
      '.aa-lead-card__title{font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:' + ACCENT + ';margin-bottom:8px;}',
      '.aa-lead-card__field{display:flex;justify-content:space-between;margin-bottom:4px;gap:8px;}',
      '.aa-lead-card__label{color:#64748b;flex-shrink:0;font-family:monospace;}',
      '.aa-lead-card__value{color:#1e293b;font-weight:600;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;}',
      '.aa-lead-card__note{font-size:11px;color:#64748b;margin:8px 0;line-height:1.4;}',
      '.aa-lead-card__btn{width:100%;padding:8px 0;background:' + ACCENT + ';color:#fff;border:2px solid #1e293b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;font-family:inherit;margin-top:8px;}',
      '.aa-lead-card__btn:disabled{opacity:0.5;cursor:not-allowed;}',
      '.aa-thankyou{border:2px solid ' + ACCENT + ';background:#f0fdf4;padding:12px;font-size:13px;color:#1e293b;margin-top:6px;max-width:95%;text-align:center;line-height:1.5;}',
      /* Consultation confirm card */
      '.aa-consult-card{border:2px solid #6366f1;background:#f5f3ff;padding:12px;font-size:12px;color:#1e293b;margin-top:6px;max-width:95%;}',
      '.aa-consult-card__title{font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;margin-bottom:8px;}',
      '.aa-consult-card__label{display:block;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:3px;margin-top:8px;}',
      '.aa-consult-card__input{width:100%;padding:6px 8px;border:2px solid #c7d2fe;font-size:12px;color:#1e293b;background:#fff;outline:none;font-family:inherit;box-sizing:border-box;}',
      '.aa-consult-card__input:focus{border-color:#6366f1;}',
      '.aa-consult-card__slots{display:flex;gap:6px;margin-top:4px;}',
      '.aa-consult-card__slot{flex:1;padding:6px 4px;border:2px solid #c7d2fe;background:#fff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6366f1;cursor:pointer;font-family:inherit;text-align:center;}',
      '.aa-consult-card__slot.aa--selected{background:#6366f1;color:#fff;border-color:#6366f1;}',
      '.aa-consult-card__note{font-size:11px;color:#64748b;margin:8px 0 4px;line-height:1.4;}',
      '.aa-consult-card__btn{width:100%;padding:8px 0;background:#6366f1;color:#fff;border:2px solid #1e293b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;font-family:inherit;margin-top:8px;}',
      '.aa-consult-card__btn:disabled{opacity:0.5;cursor:not-allowed;}',
      '@media(max-width:400px){#aa-widget-panel{width:calc(100vw - 24px);right:12px;}#aa-widget-toggle{bottom:16px;right:16px;}}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ---- Extract lead context from conversation ---- */
  function extractLeadContext(text) {
    var t = String(text || '');
    // Very lightweight heuristics — agent personas confirm data before emitting the token
    var nameM    = t.match(/nama[:\s]+([A-Za-z\s]+?)(?:\n|,|\.)/i);
    var waM      = t.match(/(?:whatsapp|wa|nomor)[:\s]+([0-9+\-\s]{8,20})/i);
    var emailM   = t.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
    var bizM     = t.match(/(?:jenis bisnis|tipe bisnis|property|properti|villa|hotel|restoran)[:\s]+([^\n,\.]{3,50})/i);
    var needM    = t.match(/(?:kebutuhan|butuh|perlu|need|ingin)[:\s]+([^\n\.]{5,100})/i);

    if (nameM)  leadContext.name          = nameM[1].trim();
    if (waM)    leadContext.whatsapp      = waM[1].trim();
    if (emailM) leadContext.email         = emailM[1].trim();
    if (bizM)   leadContext.business_type = bizM[1].trim();
    if (needM)  leadContext.need_summary  = needM[1].trim();
  }

  /* ---- Extract consultation context from conversation ---- */
  function extractConsultationContext(text) {
    var t = String(text || '');
    // Preferred date — look for explicit date mentions
    var dateM = t.match(/(?:tanggal|date)[:\s]+([0-9]{1,2}[\-\/][0-9]{1,2}[\-\/][0-9]{2,4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (!dateM) {
      // Try to find ISO date
      dateM = t.match(/(\d{4}-\d{2}-\d{2})/);
    }
    // Preferred slot — look for slot keywords
    var slotM  = t.match(/\b(pagi|siang|sore)\b/i);
    // Specific time (e.g. "10:00", "13.00")
    var timeM  = !slotM && t.match(/\b([0-9]{1,2})[:\.]([0-9]{2})\b/);

    if (dateM) consultationContext.preferred_date = dateM[1].trim();
    if (slotM) consultationContext.preferred_slot = slotM[1].toLowerCase();
    else if (timeM) consultationContext.preferred_slot = timeM[1] + ':' + timeM[2];
  }

  /* ---- DOM mount ---- */
  function mount() {
    if (document.getElementById('aa-widget-panel')) return;
    injectStyles();

    /* Toggle button */
    var toggle = document.createElement('button');
    toggle.id = 'aa-widget-toggle';
    toggle.setAttribute('aria-label', 'Buka chat asisten Alpha Digital');
    toggle.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg>';
    document.body.appendChild(toggle);

    /* Delayed entrance — 3.5s */
    setTimeout(function () { toggle.classList.add('is-ready'); }, 3500);

    /* Panel */
    var panel = document.createElement('div');
    panel.id = 'aa-widget-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Asisten Alpha Digital');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="aa-header">' +
        '<div class="aa-header__left">' +
          '<span class="aa-status-dot" aria-hidden="true"></span>' +
          '<div>' +
            '<div class="aa-agent-name" id="aa-agent-name">Alpha Digital Assistant</div>' +
            '<div class="aa-status-line">Asisten &middot; Online</div>' +
          '</div>' +
        '</div>' +
        '<button class="aa-close" id="aa-close-btn" aria-label="Tutup chat">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
            '<line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="aa-transcript" id="aa-transcript">' +
        '<div class="aa-msg--agent">' +
          '<div class="aa-bubble">' + esc(GREETING) + '</div>' +
        '</div>' +
      '</div>' +
      '<form class="aa-input-row" id="aa-form" autocomplete="off">' +
        '<input class="aa-input" id="aa-input" type="text" placeholder="Tanya sesuatu..." aria-label="Pesan untuk asisten" autocomplete="off" />' +
        '<button class="aa-send" id="aa-send" type="submit" aria-label="Kirim">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          'Kirim' +
        '</button>' +
      '</form>';
    document.body.appendChild(panel);

    /* State */
    var isOpen = false;
    var transcript  = document.getElementById('aa-transcript');
    var form        = document.getElementById('aa-form');
    var input       = document.getElementById('aa-input');
    var sendBtn     = document.getElementById('aa-send');
    var agentNameEl = document.getElementById('aa-agent-name');

    function openPanel() {
      isOpen = true;
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('aa--open');
      toggle.setAttribute('aria-label', 'Tutup chat asisten Alpha Digital');
      input.focus();
    }

    function closePanel() {
      isOpen = false;
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('aa--open');
      toggle.setAttribute('aria-label', 'Buka chat asisten Alpha Digital');
    }

    toggle.addEventListener('click', function () {
      if (isOpen) { closePanel(); } else { openPanel(); }
    });
    document.getElementById('aa-close-btn').addEventListener('click', closePanel);

    /* ---- Render helpers ---- */
    function appendUserMsg(text) {
      var div = document.createElement('div');
      div.className = 'aa-msg--user';
      div.innerHTML = '<div class="aa-bubble aa-bubble--user">' + esc(text) + '</div>';
      transcript.appendChild(div);
      transcript.scrollTop = transcript.scrollHeight;
    }

    function appendTyping() {
      var div = document.createElement('div');
      div.className = 'aa-msg--agent';
      div.id = 'aa-typing';
      div.innerHTML =
        '<div class="aa-typing">' +
          '<span class="aa-dot"></span><span class="aa-dot"></span><span class="aa-dot"></span>' +
        '</div>';
      transcript.appendChild(div);
      transcript.scrollTop = transcript.scrollHeight;
    }

    function removeTyping() {
      var t = document.getElementById('aa-typing');
      if (t) t.remove();
    }

    function appendError(msg) {
      var div = document.createElement('div');
      div.className = 'aa-msg--agent';
      div.innerHTML = '<div class="aa-bubble aa-bubble--error">' + esc(msg) + '</div>';
      transcript.appendChild(div);
      transcript.scrollTop = transcript.scrollHeight;
    }

    /* ---- Lead confirm card ---- */
    function renderLeadCard(cleanedText) {
      var wrapper = document.createElement('div');
      wrapper.className = 'aa-msg--agent';

      var bubble = document.createElement('div');
      bubble.className = 'aa-bubble';
      bubble.style.whiteSpace = 'pre-wrap';
      bubble.textContent = cleanedText;
      wrapper.appendChild(bubble);

      var card = document.createElement('div');
      card.className = 'aa-lead-card';

      var fields = [
        { label: 'Nama', value: leadContext.name || '—' },
        { label: 'WhatsApp', value: leadContext.whatsapp || '—' },
        { label: 'Email', value: leadContext.email || '—' },
        { label: 'Bisnis', value: leadContext.business_type || '—' },
        { label: 'Kebutuhan', value: leadContext.need_summary || '—' },
      ];

      var html = '<div class="aa-lead-card__title">Konfirmasi Data Kontak</div>';
      fields.forEach(function (f) {
        html +=
          '<div class="aa-lead-card__field">' +
            '<span class="aa-lead-card__label">' + esc(f.label) + '</span>' +
            '<span class="aa-lead-card__value" title="' + esc(f.value) + '">' + esc(f.value) + '</span>' +
          '</div>';
      });
      html += '<div class="aa-lead-card__note">Data ini akan dikirimkan ke tim Alpha Digital untuk menghubungi Anda.</div>';
      html += '<button class="aa-lead-card__btn" id="aa-confirm-btn">Konfirmasi</button>';
      card.innerHTML = html;
      wrapper.appendChild(card);
      transcript.appendChild(wrapper);
      transcript.scrollTop = transcript.scrollHeight;

      /* Confirm button handler */
      var confirmBtn = document.getElementById('aa-confirm-btn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Mengirim...';
          submitLead(card, wrapper);
        });
      }
    }

    function submitLead(card, msgWrapper) {
      var payload = {
        session_id: sessionId,
        source_page: window.location.pathname,
        name: leadContext.name || '',
        whatsapp: leadContext.whatsapp || '',
        email: leadContext.email || '',
        business_type: leadContext.business_type || '',
        need_summary: leadContext.need_summary || '',
        agent_id: AGENT_ID,
        company_url: '',   // honeypot — intentionally empty
      };

      fetch('/api/agency/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (res.status === 429) {
            card.innerHTML = '<div class="aa-lead-card__title" style="color:#b45309;">Terlalu Banyak Permintaan</div>' +
              '<p style="font-size:12px;color:#78350f;line-height:1.5;margin-top:4px;">Maaf, coba lagi nanti. Tim kami tetap bisa dihubungi via WhatsApp: 0881-480-2249.</p>';
            return;
          }
          return res.json().then(function (data) {
            if (data && data.success) {
              // Track lead_id for consultation card
              if (data.id) {
                capturedLeadId = data.id;
              }
              // Replace the card with thank-you
              var thankYou = document.createElement('div');
              thankYou.className = 'aa-thankyou';
              thankYou.innerHTML =
                '<strong>Terima kasih! ✅</strong><br>' +
                'Data Anda sudah kami terima. Tim Alpha Digital akan menghubungi Anda segera.<br><br>' +
                '<span style="font-size:11px;color:#64748b;">Ref: ' + esc(String(data.id || '')) + '</span>';
              msgWrapper.replaceChild(thankYou, card);
              transcript.scrollTop = transcript.scrollHeight;
            } else {
              card.innerHTML = '<div class="aa-lead-card__title" style="color:#b91c1c;">Terjadi Kesalahan</div>' +
                '<p style="font-size:12px;color:#7f1d1d;line-height:1.5;margin-top:4px;">Mohon coba lagi, atau hubungi kami via WhatsApp: 0881-480-2249.</p>';
            }
          });
        })
        .catch(function () {
          card.innerHTML = '<div class="aa-lead-card__title" style="color:#b91c1c;">Koneksi Bermasalah</div>' +
            '<p style="font-size:12px;color:#7f1d1d;line-height:1.5;margin-top:4px;">Periksa koneksi internet Anda dan coba lagi.</p>';
        });
    }

    /* ---- Consultation confirm card ---- */
    function renderConsultationCard(cleanedText) {
      var wrapper = document.createElement('div');
      wrapper.className = 'aa-msg--agent';

      // Show agent text above card if present
      if (cleanedText) {
        var bubble = document.createElement('div');
        bubble.className = 'aa-bubble';
        bubble.style.whiteSpace = 'pre-wrap';
        bubble.textContent = cleanedText;
        wrapper.appendChild(bubble);
      }

      // If no lead captured yet, show a reminder instead
      if (!capturedLeadId) {
        var noLeadNote = document.createElement('div');
        noLeadNote.className = 'aa-consult-card';
        noLeadNote.innerHTML =
          '<div class="aa-consult-card__title">Permintaan Konsultasi</div>' +
          '<p style="font-size:12px;color:#64748b;line-height:1.5;">Sebelum menjadwalkan konsultasi, kami perlu data kontak Anda terlebih dahulu. Silakan lanjutkan percakapan untuk melengkapi data.</p>';
        wrapper.appendChild(noLeadNote);
        transcript.appendChild(wrapper);
        transcript.scrollTop = transcript.scrollHeight;
        return;
      }

      var card = document.createElement('div');
      card.className = 'aa-consult-card';

      // Selected slot state
      var selectedSlot = consultationContext.preferred_slot || '';

      var cardId = 'aa-consult-' + Math.random().toString(36).slice(2, 7);
      card.setAttribute('id', cardId);

      card.innerHTML =
        '<div class="aa-consult-card__title">Konfirmasi Jadwal Konsultasi</div>' +
        '<label class="aa-consult-card__label" for="' + cardId + '-date">Tanggal Pilihan</label>' +
        '<input class="aa-consult-card__input" id="' + cardId + '-date" type="date" ' +
          'value="' + esc(consultationContext.preferred_date || '') + '" ' +
          'min="' + (function () { var d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })() + '" />' +
        '<label class="aa-consult-card__label">Waktu Pilihan</label>' +
        '<div class="aa-consult-card__slots">' +
          '<button type="button" class="aa-consult-card__slot' + (selectedSlot === 'pagi' ? ' aa--selected' : '') + '" data-slot="pagi">Pagi (10:00)</button>' +
          '<button type="button" class="aa-consult-card__slot' + (selectedSlot === 'siang' ? ' aa--selected' : '') + '" data-slot="siang">Siang (13:00)</button>' +
          '<button type="button" class="aa-consult-card__slot' + (selectedSlot === 'sore' ? ' aa--selected' : '') + '" data-slot="sore">Sore (16:00)</button>' +
        '</div>' +
        '<label class="aa-consult-card__label" for="' + cardId + '-notes">Catatan (opsional)</label>' +
        '<input class="aa-consult-card__input" id="' + cardId + '-notes" type="text" placeholder="Topik khusus yang ingin dibahas..." />' +
        '<div class="aa-consult-card__note">Daniel akan mengkonfirmasi waktu dan mengirimkan undangan kalender ke email Anda.</div>' +
        '<button type="button" class="aa-consult-card__btn" id="' + cardId + '-confirm">Kirim Permintaan Konsultasi</button>';

      wrapper.appendChild(card);
      transcript.appendChild(wrapper);
      transcript.scrollTop = transcript.scrollHeight;

      // Wire up slot buttons
      var slotBtns = card.querySelectorAll('.aa-consult-card__slot');
      slotBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          slotBtns.forEach(function (b) { b.classList.remove('aa--selected'); });
          btn.classList.add('aa--selected');
          selectedSlot = btn.getAttribute('data-slot') || '';
        });
      });

      // Wire up confirm button
      var confirmBtn = document.getElementById(cardId + '-confirm');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
          var dateInput = document.getElementById(cardId + '-date');
          var notesInput = document.getElementById(cardId + '-notes');
          var chosenDate = dateInput ? dateInput.value : '';
          var chosenNotes = notesInput ? notesInput.value.trim() : '';

          if (!chosenDate) {
            dateInput && (dateInput.style.borderColor = '#ef4444');
            dateInput && dateInput.focus();
            return;
          }
          if (!selectedSlot) {
            // Highlight slot area
            var slotArea = card.querySelector('.aa-consult-card__slots');
            if (slotArea) slotArea.style.outline = '2px solid #ef4444';
            return;
          }

          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Mengirim...';
          submitConsultation(card, wrapper, chosenDate, selectedSlot, chosenNotes);
        });
      }
    }

    function submitConsultation(card, msgWrapper, preferredDate, preferredSlot, notes) {
      var payload = {
        lead_id: capturedLeadId,
        preferred_date: preferredDate,
        preferred_slot: preferredSlot,
        notes: notes || '',
        timezone: 'Asia/Makassar',
      };

      fetch('/api/agency/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (res.status === 429) {
            card.innerHTML =
              '<div class="aa-consult-card__title" style="color:#b45309;">Terlalu Banyak Permintaan</div>' +
              '<p style="font-size:12px;color:#78350f;line-height:1.5;margin-top:4px;">Maaf, coba lagi nanti. Atau hubungi kami via WhatsApp: 0881-480-2249.</p>';
            return;
          }
          return res.json().then(function (data) {
            if (data && data.success) {
              var thankYou = document.createElement('div');
              thankYou.className = 'aa-thankyou';
              thankYou.style.borderColor = '#6366f1';
              thankYou.style.background = '#f5f3ff';
              thankYou.innerHTML =
                '<strong>Permintaan konsultasi terkirim. ✅</strong><br>' +
                'Daniel akan mengkonfirmasi waktu dan mengirim undangan kalender ke email Anda.<br><br>' +
                '<span style="font-size:11px;color:#64748b;">Ref konsultasi: ' + esc(String(data.id || '')) + '</span>';
              msgWrapper.replaceChild(thankYou, card);
              transcript.scrollTop = transcript.scrollHeight;
            } else {
              card.innerHTML =
                '<div class="aa-consult-card__title" style="color:#b91c1c;">Terjadi Kesalahan</div>' +
                '<p style="font-size:12px;color:#7f1d1d;line-height:1.5;margin-top:4px;">Mohon coba lagi, atau hubungi kami via WhatsApp: 0881-480-2249.</p>';
              var retryBtn = document.createElement('button');
              retryBtn.className = 'aa-consult-card__btn';
              retryBtn.textContent = 'Coba Lagi';
              retryBtn.style.marginTop = '8px';
              retryBtn.addEventListener('click', function () {
                retryBtn.disabled = true;
                submitConsultation(card, msgWrapper, preferredDate, preferredSlot, notes);
              });
              card.appendChild(retryBtn);
            }
          });
        })
        .catch(function () {
          card.innerHTML =
            '<div class="aa-consult-card__title" style="color:#b91c1c;">Koneksi Bermasalah</div>' +
            '<p style="font-size:12px;color:#7f1d1d;line-height:1.5;margin-top:4px;">Periksa koneksi internet Anda dan coba lagi.</p>';
        });
    }

    /* ---- Append agent message — handles [CAPTURE_LEAD] and [REQUEST_CONSULTATION] ---- */
    function appendAgentMsg(text, agentName) {
      var raw = String(text || '');
      var hasCaptureLead        = /\[CAPTURE_LEAD\]/i.test(raw);
      var hasRequestConsultation = /\[REQUEST_CONSULTATION\]/i.test(raw);

      // Strip UI tokens from displayed text
      var cleaned = raw
        .replace(/\[CAPTURE_LEAD\]/gi, '')
        .replace(/\[REQUEST_CONSULTATION\]/gi, '')
        .replace(/\[[A-Z_]+\]/g, '')
        .trim();

      if (hasCaptureLead) {
        renderLeadCard(cleaned);
        return;
      }

      if (hasRequestConsultation) {
        renderConsultationCard(cleaned);
        return;
      }

      var div = document.createElement('div');
      div.className = 'aa-msg--agent';
      div.innerHTML = '<div class="aa-bubble" style="white-space:pre-wrap;">' + esc(cleaned) + '</div>';
      transcript.appendChild(div);
      transcript.scrollTop = transcript.scrollHeight;
    }

    /* ---- Send message ---- */
    function sendMessage(text) {
      var userText = (text || '').trim();
      if (!userText) return;
      input.value = '';
      sendBtn.disabled = true;
      input.disabled = true;
      userMessageCount++;
      appendUserMsg(userText);
      appendTyping();

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: sessionId,
          agent_id: AGENT_ID,
          message: userText,
        }),
      })
        .then(function (res) {
          removeTyping();
          if (!res.ok) {
            appendError('Asisten sedang tidak dapat dijangkau. Coba lagi sebentar.');
            return;
          }
          return res.json().then(function (data) {
            if (data && data.agent_name) {
              agentNameEl.textContent = data.agent_name;
            }
            var responseText = data && data.response ? data.response : '(tidak ada respons)';
            // Extract lead and consultation context from all turns (cumulative)
            extractLeadContext(responseText);
            extractConsultationContext(responseText);
            appendAgentMsg(responseText, data && data.agent_name);
          });
        })
        .catch(function () {
          removeTyping();
          appendError('Tidak dapat terhubung ke asisten. Periksa koneksi Anda.');
        })
        .finally(function () {
          sendBtn.disabled = false;
          input.disabled = false;
          input.focus();
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage(input.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
