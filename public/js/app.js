/**
 * MANOSPRING — Complete Interactive Application Client
 * Architecture: Clean Vanilla JS, REST APIs, WebRTC Video/Audio, AI Chat Engine, DPDPA Workflows
 */

// Application State
const AppState = {
  specialists: [],
  appointments: [],
  currentSpecialist: null,
  activeBooking: {
    specialistId: '',
    specialistName: '',
    specialistAvatar: '👩🏽‍⚕️',
    fee: 1000,
    mode: 'Video',
    date: '',
    timeSlot: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    ageGroup: '25–34',
    reason: '',
    consentGranted: false,
    paymentMethod: 'UPI (Google Pay)',
    step: 1
  },
  embeddedChat: {
    history: [],
    turns: 0,
    busy: false,
    suggested: false
  },
  floatingChat: {
    history: [],
    turns: 0,
    busy: false,
    suggested: false
  },
  consultation: {
    activeRoomId: 'MANO-DEMO-ROOM',
    inCall: false,
    cameraOn: true,
    micOn: true,
    screenShareOn: false,
    localStream: null,
    timerInterval: null,
    timerSeconds: 45 * 60,
    messages: []
  },
  auth: {
    role: 'guest', // 'guest' | 'patient' | 'clinician'
    user: null,
    token: null
  }
};

// Utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showToast(message, duration = 3500) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDateDefaults();
  loadSpecialists();
  loadAppointments();
  setupEventListeners();
  checkUrlParams();
});

function initDateDefaults() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  AppState.activeBooking.date = tomorrow;
}

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    openConsultationRoom(room);
  }
}

// ==========================================================================
// SPECIALISTS DIRECTORY & FILTERING
// ==========================================================================

async function loadSpecialists() {
  const grid = $('#specialists-grid');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><div class="typing-indicator" style="margin: 0 auto 12px;"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>Loading verified specialists...</div>';

  try {
    const res = await fetch('/api/specialists');
    const data = await res.json();
    if (data.ok && Array.isArray(data.specialists)) {
      AppState.specialists = data.specialists;
      renderSpecialists(AppState.specialists);
    } else {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Could not load specialists. Please refresh.</p>';
    }
  } catch (err) {
    console.error('Error fetching specialists:', err);
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Failed to connect to the specialist directory.</p>';
  }
}

function renderSpecialists(list) {
  const grid = $('#specialists-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; color: var(--text-muted);"><h3>No specialists match this filter</h3><p style="margin-top: 6px;">Try selecting "All" or searching for a general condition.</p><button class="btn btn-soft btn-sm" onclick="setCategoryFilter(\'all\')" style="margin-top: 12px;">Show All Specialists</button></div>';
    return;
  }

  grid.innerHTML = list.map(doc => `
    <article class="doctor-card" data-id="${doc.id}">
      <div>
        <div class="doc-top-row">
          <div class="doc-avatar">${doc.avatar || '👨🏽‍⚕️'}</div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <h3 class="doc-name">${escapeHTML(doc.name)}</h3>
              <span class="badge badge-verified" style="font-size: 10px; padding: 2px 6px;">✓ Verified</span>
            </div>
            <div class="doc-role">${escapeHTML(doc.title.split('—')[0])}</div>
            <div class="doc-reg">${escapeHTML(doc.degrees.split('—')[0])} · ${escapeHTML(doc.experienceYears)}+ yrs exp</div>
          </div>
        </div>

        <div class="doc-tags">
          ${doc.specialties.slice(0, 3).map(s => `<span class="doc-tag">${escapeHTML(s)}</span>`).join('')}
        </div>
      </div>

      <div class="doc-bottom-row">
        <div class="doc-price">
          ₹${doc.fees.video || 1000}
          <small>per 45-min video</small>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="openDoctorBio('${doc.id}')">Bio</button>
          <button class="btn btn-primary btn-sm" onclick="startBooking('${doc.id}')">Book ↗</button>
        </div>
      </div>
    </article>
  `).join('');
}

let activeCategoryFilter = 'all';

function setCategoryFilter(category, btnElement) {
  activeCategoryFilter = category;
  if (btnElement) {
    $$('.segment-pill').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
  } else {
    $$('.segment-pill').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase().includes(category));
    });
  }
  filterSpecialists();
}

function filterSpecialists() {
  const search = $('#filter-search') ? $('#filter-search').value.toLowerCase().trim() : '';

  let filtered = AppState.specialists.filter(doc => {
    const matchesCategory = activeCategoryFilter === 'all' ||
      doc.title.toLowerCase().includes(activeCategoryFilter.toLowerCase()) ||
      doc.specialties.some(s => s.toLowerCase().includes(activeCategoryFilter.toLowerCase()));

    const matchesSearch = !search ||
      doc.name.toLowerCase().includes(search) ||
      doc.title.toLowerCase().includes(search) ||
      doc.specialties.some(s => s.toLowerCase().includes(search));

    return matchesCategory && matchesSearch;
  });

  renderSpecialists(filtered);
}

function toggleMobileDrawer(force) {
  const drawer = $('#mobile-drawer');
  if (!drawer) return;
  const isOpen = typeof force === 'boolean' ? force : !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
}
function resetFilters() {
  activeCategoryFilter = 'all';
  if ($('#filter-search')) $('#filter-search').value = '';
  $$('.segment-pill').forEach(btn => btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === 'all'));
  renderSpecialists(AppState.specialists);
}

function openDoctorBio(docId) {
  const doc = AppState.specialists.find(d => d.id === docId);
  if (!doc) return;

  $('#bio-modal-title').textContent = doc.name;
  $('#bio-modal-content').innerHTML = `
    <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap;">
      <div class="doc-avatar-large" style="width: 80px; height: 80px; font-size: 38px;">${doc.avatar}</div>
      <div>
        <h3 style="font-size: 22px; margin-bottom: 4px;">${escapeHTML(doc.name)}</h3>
        <p style="color: var(--primary); font-weight: 600; margin-bottom: 4px;">${escapeHTML(doc.title)}</p>
        <p style="font-size: 13px; color: var(--text-muted);">${escapeHTML(doc.degrees)}</p>
        <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; background: #eaf3ed; padding: 4px 10px; border-radius: var(--radius-full); font-size: 12px; color: var(--primary);">
          <span>🏛️</span> Registered with <strong>${escapeHTML(doc.council)}</strong> (Reg No: <strong>${escapeHTML(doc.regNumber)}</strong>)
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-subtle); margin-bottom: 8px;">Clinical Background & Philosophy</h4>
      <p style="font-size: 14px; line-height: 1.65; color: var(--text-main);">${escapeHTML(doc.bio)}</p>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-subtle); margin-bottom: 8px;">Areas of Clinical Expertise</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${doc.specialties.map(s => `<span class="badge badge-sage" style="font-size: 12px; padding: 6px 12px;">${escapeHTML(s)}</span>`).join('')}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--bg-page); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
      <div>
        <span style="font-size: 12px; color: var(--text-subtle);">Video Session</span>
        <strong style="display: block; font-size: 16px; color: var(--primary);">₹${doc.fees.video}</strong>
      </div>
      <div>
        <span style="font-size: 12px; color: var(--text-subtle);">Audio Session</span>
        <strong style="display: block; font-size: 16px; color: var(--primary);">₹${doc.fees.audio}</strong>
      </div>
      <div>
        <span style="font-size: 12px; color: var(--text-subtle);">Chat Session</span>
        <strong style="display: block; font-size: 16px; color: var(--primary);">₹${doc.fees.chat || 700}</strong>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 12px;">
      <button class="btn btn-outline" onclick="closeModal('bio-modal')">Close</button>
      <button class="btn btn-primary" onclick="closeModal('bio-modal'); startBooking('${doc.id}')">Book Appointment with ${doc.name.split(' ')[1] || doc.name} →</button>
    </div>
  `;

  openModal('bio-modal');
}

// ==========================================================================
// APPOINTMENT BOOKING WIZARD
// ==========================================================================

function startBooking(specialistId = null) {
  const doc = AppState.specialists.find(d => d.id === specialistId) || AppState.specialists[0];
  if (doc) {
    AppState.activeBooking.specialistId = doc.id;
    AppState.activeBooking.specialistName = doc.name;
    AppState.activeBooking.specialistAvatar = doc.avatar;
    AppState.activeBooking.fee = doc.fees.video;
    AppState.activeBooking.timeSlot = doc.availableSlots?.[0] || '10:30 AM';
  }

  AppState.activeBooking.step = 1;
  renderBookingStep();
  openModal('booking-modal');
}

function renderBookingStep() {
  const body = $('#booking-wizard-content');
  const step = AppState.activeBooking.step;

  // Update step indicator
  $$('.wizard-step').forEach((el, index) => {
    el.classList.toggle('active', index < step);
  });

  if (step === 1) {
    // Step 1: Specialist, Mode, Date, Slot
    const docOptions = AppState.specialists.map(d => `
      <option value="${d.id}" ${d.id === AppState.activeBooking.specialistId ? 'selected' : ''}>
        ${escapeHTML(d.name)} — ${escapeHTML(d.title)} (₹${d.fees.video})
      </option>
    `).join('');

    const currentDoc = AppState.specialists.find(d => d.id === AppState.activeBooking.specialistId) || AppState.specialists[0];
    const slots = currentDoc ? currentDoc.availableSlots : ['10:30 AM', '11:15 AM', '2:00 PM', '4:30 PM', '6:00 PM'];

    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 16px; margin-bottom: 4px;">Select Specialist & Preferred Slot</h4>
        <p style="font-size: 13px; color: var(--text-muted);">Choose a qualified clinician and time that fits your schedule.</p>
      </div>

      <div class="form-group">
        <label class="form-label">Healthcare Professional</label>
        <select id="book-specialist-select" class="form-select" onchange="onBookingSpecialistChange(this.value)">
          ${docOptions}
        </select>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Consultation Mode</label>
          <select id="book-mode-select" class="form-select" onchange="onBookingModeChange(this.value)">
            <option value="Video" ${AppState.activeBooking.mode === 'Video' ? 'selected' : ''}>Video Call (Recommended)</option>
            <option value="Audio" ${AppState.activeBooking.mode === 'Audio' ? 'selected' : ''}>Voice Call</option>
            <option value="Chat" ${AppState.activeBooking.mode === 'Chat' ? 'selected' : ''}>Secure Text Chat</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Preferred Date</label>
          <input type="date" id="book-date-input" class="form-input" min="${new Date().toISOString().slice(0, 10)}" value="${AppState.activeBooking.date}" onchange="AppState.activeBooking.date = this.value">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Available Time Slots</label>
        <div class="slot-selection-grid">
          ${slots.map(s => `
            <button type="button" class="time-slot-btn ${AppState.activeBooking.timeSlot === s ? 'selected' : ''}" onclick="selectBookingSlot('${s}')">
              ${escapeHTML(s)}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="background: var(--bg-page); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 12px; color: var(--text-subtle);">Consultation Fee:</span>
          <strong style="display: block; font-size: 18px; color: var(--primary);">₹${AppState.activeBooking.fee}</strong>
        </div>
        <span style="font-size: 11px; color: var(--text-muted); text-align: right;">Includes 45-minute teleconsultation & digital prescription</span>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" class="btn btn-outline" onclick="closeModal('booking-modal')">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="goToBookingStep(2)">Proceed to Patient Details →</button>
      </div>
    `;
  } else if (step === 2) {
    // Step 2: Patient Info & DPDPA Telemedicine Consent
    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 16px; margin-bottom: 4px;">Patient Information & Consent</h4>
        <p style="font-size: 13px; color: var(--text-muted);">In compliance with the India Telemedicine Practice Guidelines 2020 and DPDPA 2023.</p>
      </div>

      <form id="patient-details-form" onsubmit="submitPatientDetails(event)">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Patient Full Name *</label>
            <input type="text" id="pt-name" class="form-input" required placeholder="e.g. Arjun Sharma" value="${escapeHTML(AppState.activeBooking.patientName)}">
          </div>
          <div class="form-group">
            <label class="form-label">Age Bracket *</label>
            <select id="pt-age" class="form-select" required>
              <option value="18–24" ${AppState.activeBooking.ageGroup === '18–24' ? 'selected' : ''}>18–24 years</option>
              <option value="25–34" ${AppState.activeBooking.ageGroup === '25–34' ? 'selected' : ''}>25–34 years</option>
              <option value="35–44" ${AppState.activeBooking.ageGroup === '35–44' ? 'selected' : ''}>35–44 years</option>
              <option value="45–59" ${AppState.activeBooking.ageGroup === '45–59' ? 'selected' : ''}>45–59 years</option>
              <option value="60+" ${AppState.activeBooking.ageGroup === '60+' ? 'selected' : ''}>60+ years</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">WhatsApp / Mobile Number *</label>
            <input type="tel" id="pt-phone" class="form-input" required placeholder="+91 98765 43210" pattern="[0-9 +()-]{10,18}" value="${escapeHTML(AppState.activeBooking.patientPhone)}">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address (Optional)</label>
            <input type="email" id="pt-email" class="form-input" placeholder="you@example.com" value="${escapeHTML(AppState.activeBooking.patientEmail)}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Primary Concern or Reason for Consultation</label>
          <textarea id="pt-reason" class="form-textarea" rows="3" placeholder="Briefly share what you would like to discuss (e.g. anxiety, sleep issues, medication review)...">${escapeHTML(AppState.activeBooking.reason)}</textarea>
        </div>

        <div style="background: #fdfaf7; border: 1px solid #fae6dc; padding: 14px 16px; border-radius: var(--radius-sm); margin-bottom: 20px;">
          <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; font-size: 12px; color: var(--text-main); line-height: 1.5;">
            <input type="checkbox" id="pt-consent" required ${AppState.activeBooking.consentGranted ? 'checked' : ''} style="margin-top: 3px;">
            <span><strong>Informed Telemedicine Consent (DPDPA 2023 & NMC Guidelines):</strong> I explicitly consent to receive an online clinical consultation from a licensed specialist. I understand that online consultations have limitations and are not for acute life-threatening emergencies. I consent to confidential processing of health records strictly for care coordination.</span>
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <button type="button" class="btn btn-outline" onclick="goToBookingStep(1)">← Back</button>
          <button type="submit" class="btn btn-primary">Proceed to Payment →</button>
        </div>
      </form>
    `;
  } else if (step === 3) {
    // Step 3: Payment Simulation / Checkout
    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 16px; margin-bottom: 4px;">Review & Payment</h4>
        <p style="font-size: 13px; color: var(--text-muted);">Secure payment processed in Indian Rupees (INR) with 256-bit SSL encryption.</p>
      </div>

      <div style="background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
          <span style="color: var(--text-muted);">Specialist:</span>
          <strong>${escapeHTML(AppState.activeBooking.specialistName)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
          <span style="color: var(--text-muted);">Date & Time:</span>
          <strong>${escapeHTML(AppState.activeBooking.date)} · ${escapeHTML(AppState.activeBooking.timeSlot)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
          <span style="color: var(--text-muted);">Consultation Mode:</span>
          <strong>${escapeHTML(AppState.activeBooking.mode)} Call</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
          <span style="color: var(--text-muted);">Patient Name:</span>
          <strong>${escapeHTML(AppState.activeBooking.patientName)}</strong>
        </div>
        <div style="border-top: 1px solid var(--border-light); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 700;">Total Amount Due:</span>
          <strong style="font-size: 22px; color: var(--primary);">₹${AppState.activeBooking.fee}</strong>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Select Payment Method</label>
        <div style="display: grid; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); cursor: pointer; background: white;">
            <input type="radio" name="pay-method" value="UPI (Google Pay / PhonePe)" checked onchange="AppState.activeBooking.paymentMethod = this.value">
            <span style="font-size: 13px; font-weight: 600;">📱 UPI Instant Pay (Google Pay, PhonePe, Paytm, BHIM)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); cursor: pointer; background: white;">
            <input type="radio" name="pay-method" value="Credit/Debit Card (Visa/Mastercard/RuPay)" onchange="AppState.activeBooking.paymentMethod = this.value">
            <span style="font-size: 13px; font-weight: 600;">💳 Credit / Debit Cards (Visa, Mastercard, RuPay)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); cursor: pointer; background: white;">
            <input type="radio" name="pay-method" value="Net Banking" onchange="AppState.activeBooking.paymentMethod = this.value">
            <span style="font-size: 13px; font-weight: 600;">🏦 Net Banking (All Indian Banks)</span>
          </label>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
        <button type="button" class="btn btn-outline" onclick="goToBookingStep(2)">← Back</button>
        <button type="button" class="btn btn-primary" id="btn-pay-confirm" onclick="processPayment()">
          Pay ₹${AppState.activeBooking.fee} & Confirm Booking 🔒
        </button>
      </div>
    `;
  } else if (step === 4) {
    // Step 4: Booking Confirmed & Digital Receipt
    const appt = AppState.activeBooking.createdAppointment;
    body.innerHTML = `
      <div style="text-align: center; padding: 10px 0 24px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #e6f4ea; color: #137333; font-size: 32px; display: grid; place-items: center; margin: 0 auto 16px;">
          ✓
        </div>
        <h3 style="font-size: 24px; margin-bottom: 6px;">Appointment Confirmed!</h3>
        <p style="font-size: 14px; color: var(--text-muted);">Your teleconsultation has been securely booked and registered.</p>
        <span class="badge badge-sage" style="margin-top: 8px; font-size: 13px; padding: 6px 14px;">
          Booking Reference: <strong>${escapeHTML(appt.id)}</strong>
        </span>
      </div>

      <div style="background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
          <div>
            <span style="color: var(--text-subtle); display: block;">Doctor:</span>
            <strong>${escapeHTML(appt.doctorName)}</strong>
          </div>
          <div>
            <span style="color: var(--text-subtle); display: block;">Date & Time:</span>
            <strong>${escapeHTML(appt.date)} at ${escapeHTML(appt.timeSlot)}</strong>
          </div>
          <div>
            <span style="color: var(--text-subtle); display: block;">Consultation Type:</span>
            <strong>${escapeHTML(appt.mode)} Teleconsultation</strong>
          </div>
          <div>
            <span style="color: var(--text-subtle); display: block;">Payment Status:</span>
            <strong style="color: #137333;">Paid (₹${appt.fee}) · ${escapeHTML(appt.paymentId)}</strong>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn btn-primary btn-lg" onclick="closeModal('booking-modal'); openConsultationRoom('${appt.roomId}')">
          🎥 Enter Teleconsultation Room Now
        </button>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" style="flex: 1;" onclick="downloadAppointmentReceipt('${appt.id}')">
            📥 Download Digital Receipt
          </button>
          <button class="btn btn-outline" style="flex: 1;" onclick="closeModal('booking-modal'); switchPortalTab('appointments')">
            View in My Portal
          </button>
        </div>
      </div>
    `;
  }
}

function onBookingSpecialistChange(specId) {
  const doc = AppState.specialists.find(d => d.id === specId);
  if (!doc) return;
  AppState.activeBooking.specialistId = doc.id;
  AppState.activeBooking.specialistName = doc.name;
  AppState.activeBooking.specialistAvatar = doc.avatar;
  const modeKey = AppState.activeBooking.mode.toLowerCase().includes('audio') ? 'audio' :
                  AppState.activeBooking.mode.toLowerCase().includes('chat') ? 'chat' : 'video';
  AppState.activeBooking.fee = doc.fees[modeKey] || doc.fees.video;
  AppState.activeBooking.timeSlot = doc.availableSlots?.[0] || '10:30 AM';
  renderBookingStep();
}

function onBookingModeChange(mode) {
  AppState.activeBooking.mode = mode;
  const doc = AppState.specialists.find(d => d.id === AppState.activeBooking.specialistId);
  if (doc) {
    const modeKey = mode.toLowerCase().includes('audio') ? 'audio' :
                    mode.toLowerCase().includes('chat') ? 'chat' : 'video';
    AppState.activeBooking.fee = doc.fees[modeKey] || doc.fees.video;
  }
  renderBookingStep();
}

function selectBookingSlot(slot) {
  AppState.activeBooking.timeSlot = slot;
  renderBookingStep();
}

function goToBookingStep(step) {
  if (step === 2) {
    if (!AppState.activeBooking.date) {
      showToast('Please choose an appointment date.');
      return;
    }
    if (!AppState.activeBooking.timeSlot) {
      showToast('Please choose a time slot.');
      return;
    }
  }
  AppState.activeBooking.step = step;
  renderBookingStep();
}

function submitPatientDetails(e) {
  e.preventDefault();
  const name = $('#pt-name').value.trim();
  const phone = $('#pt-phone').value.trim();
  const age = $('#pt-age').value;
  const email = $('#pt-email') ? $('#pt-email').value.trim() : '';
  const reason = $('#pt-reason') ? $('#pt-reason').value.trim() : '';
  const consent = $('#pt-consent') ? $('#pt-consent').checked : false;

  if (!name || !phone) {
    showToast('Please provide your name and phone number.');
    return;
  }

  if (!consent) {
    showToast('Please accept the telemedicine consent to continue.');
    return;
  }

  AppState.activeBooking.patientName = name;
  AppState.activeBooking.patientPhone = phone;
  AppState.activeBooking.ageGroup = age;
  AppState.activeBooking.patientEmail = email;
  AppState.activeBooking.reason = reason;
  AppState.activeBooking.consentGranted = consent;

  AppState.activeBooking.step = 3;
  renderBookingStep();
}

async function processPayment() {
  const btn = $('#btn-pay-confirm');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="typing-dot" style="display:inline-block; margin-right:4px;"></span> Processing Secure Payment...';
  }

  try {
    const payload = {
      specialistId: AppState.activeBooking.specialistId,
      patientName: AppState.activeBooking.patientName,
      patientPhone: AppState.activeBooking.patientPhone,
      patientEmail: AppState.activeBooking.patientEmail,
      ageGroup: AppState.activeBooking.ageGroup,
      mode: AppState.activeBooking.mode,
      date: AppState.activeBooking.date,
      timeSlot: AppState.activeBooking.timeSlot,
      reason: AppState.activeBooking.reason,
      consentGranted: AppState.activeBooking.consentGranted,
      paymentMethod: AppState.activeBooking.paymentMethod
    };

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      AppState.activeBooking.createdAppointment = data.appointment;
      AppState.activeBooking.step = 4;
      renderBookingStep();
      loadAppointments(); // Refresh portal
    } else {
      showToast(data.error || 'Payment could not be processed. Please try again.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = `Pay ₹${AppState.activeBooking.fee} & Confirm Booking 🔒`;
      }
    }
  } catch (err) {
    console.error('Booking error:', err);
    showToast('Connection error. Please try again.');
    if (btn) {
      btn.disabled = false;
      btn.textContent = `Pay ₹${AppState.activeBooking.fee} & Confirm Booking 🔒`;
    }
  }
}

function downloadAppointmentReceipt(apptId) {
  const appt = AppState.activeBooking.createdAppointment || AppState.appointments.find(a => a.id === apptId);
  if (!appt) return;

  const receiptContent = `=====================================================
MANOSPRING HEALTHCARE — TELEMEDICINE BOOKING RECEIPT
Compliant with Telemedicine Practice Guidelines India 2020
=====================================================
Receipt / Booking Ref: ${appt.id}
Generated on: ${new Date().toLocaleString('en-IN')}

PATIENT DETAILS:
Patient Name: ${appt.patientName}
Mobile Number: ${appt.patientPhone}
Age Group: ${appt.ageGroup || '18-45'}
Email: ${appt.patientEmail || 'N/A'}

CLINICIAN DETAILS:
Specialist: ${appt.doctorName}
Title: ${appt.doctorTitle}
Consultation Mode: ${appt.mode} Teleconsultation
Scheduled Date: ${appt.date}
Scheduled Time: ${appt.timeSlot}
Room ID: ${appt.roomId}

PAYMENT SUMMARY:
Payment Reference: ${appt.paymentId}
Payment Mode: ${appt.paymentMethod}
Amount Paid: INR ₹${appt.fee}
Status: Confirmed / Paid

CLINICAL INSTRUCTIONS:
1. Please join the consultation room 5 minutes before scheduled time.
2. Keep headphones ready for clear, confidential audio.
3. Have any previous prescriptions or medical records accessible.
4. Telemedicine Room Link: ${window.location.origin}/consultation?room=${appt.roomId}

=====================================================
Emergency Notice: In crisis, call 112 or Tele-MANAS at 14416.
=====================================================`;

  const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Manospring-Receipt-${appt.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Receipt downloaded successfully.');
}

// ==========================================================================
// DYNAMIC AI CHAT ENGINE (Embedded & Floating)
// ==========================================================================

async function sendAiMessage(target, rawText) {
  const text = (rawText || '').trim();
  if (!text) return;

  const isFloat = target === 'floating';
  const chatState = isFloat ? AppState.floatingChat : AppState.embeddedChat;
  const container = isFloat ? $('#float-chat-messages') : $('#embedded-chat-messages');
  const inputEl = isFloat ? $('#float-chat-input') : $('#embedded-chat-input');
  const sendBtn = isFloat ? $('#float-chat-send') : $('#embedded-chat-send');

  if (chatState.busy) return;
  chatState.busy = true;

  if (inputEl) inputEl.value = '';
  if (sendBtn) sendBtn.disabled = true;

  // Append user bubble
  appendChatBubble(container, text, 'user');
  chatState.history.push({ role: 'user', content: text });
  chatState.turns++;

  // Show typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator';
  typingEl.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatState.history.slice(-16).map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await res.json();
    typingEl.remove();

    if (data.urgent) {
      appendChatBubble(container, data.reply, 'urgent');
      chatState.history.push({ role: 'assistant', content: data.reply });
      openEmergencyModal();
      return;
    }

    const replyText = data.reply || "I'm listening and here to support you. What else has been feeling challenging?";
    appendChatBubble(container, replyText, 'ai');
    chatState.history.push({ role: 'assistant', content: replyText });

    // Suggest professional consultation after 8-10 turns or if requested
    if (data.suggestAppointment && !chatState.suggested) {
      chatState.suggested = true;
      appendAppointmentSuggestion(container);
    }
  } catch (err) {
    console.error('AI chat error:', err);
    typingEl.remove();
    appendChatBubble(container, "I'm having a brief connection pause, but I'm here. If you're experiencing deep distress, remember our certified clinicians and national support line 14416 are available.", 'ai');
  } finally {
    chatState.busy = false;
    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) inputEl.focus();
    container.scrollTop = container.scrollHeight;
  }
}

function appendChatBubble(container, text, type) {
  if (!container) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  bubble.innerHTML = escapeHTML(text).replace(/\n/g, '<br>');
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendAppointmentSuggestion(container) {
  const box = document.createElement('div');
  box.style.background = '#eaf3ed';
  box.style.border = '1px solid #c9ded2';
  box.style.borderRadius = 'var(--radius-md)';
  box.style.padding = '14px 16px';
  box.style.margin = '8px 0';
  box.innerHTML = `
    <div style="font-size: 13px; font-weight: 700; color: var(--primary-dark); margin-bottom: 4px;">
      🌿 Consider speaking with a professional
    </div>
    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
      We have talked through a few things together. A confidential session with a certified psychiatrist or psychologist can provide personalized, in-depth care.
    </p>
    <button class="btn btn-primary btn-sm" onclick="startBooking()">
      Explore Specialists & Book a Session →
    </button>
  `;
  container.appendChild(box);
  container.scrollTop = container.scrollHeight;
}

function triggerTriageChip(topic) {
  const map = {
    'anxiety': "I've been feeling extremely anxious and overwhelmed lately, and it's hard to relax.",
    'sleep': "I have trouble falling asleep at night. My mind keeps racing for hours.",
    'burnout': "I feel completely burned out and exhausted from work and daily expectations.",
    'depression': "I have been feeling very low, sad, and unmotivated for the past few weeks.",
    'adhd': "I'm having intense trouble concentrating, staying organized, and finishing daily tasks."
  };

  const message = map[topic] || `I'd like some guidance regarding ${topic}.`;
  
  // Smooth scroll to AI section and send
  const section = $('#ai-assistant-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
  
  setTimeout(() => {
    sendAiMessage('embedded', message);
  }, 400);
}

function toggleFloatingChat(forceState) {
  const widget = $('#floating-widget');
  if (!widget) return;
  const isOpen = typeof forceState === 'boolean' ? forceState : !widget.classList.contains('open');
  widget.classList.toggle('open', isOpen);

  if (isOpen) {
    const input = $('#float-chat-input');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

function resetChat(target) {
  const isFloat = target === 'floating';
  const chatState = isFloat ? AppState.floatingChat : AppState.embeddedChat;
  const container = isFloat ? $('#float-chat-messages') : $('#embedded-chat-messages');

  chatState.history = [];
  chatState.turns = 0;
  chatState.busy = false;
  chatState.suggested = false;

  if (container) {
    container.innerHTML = `
      <div class="chat-bubble ai">
        Hello, I'm Manospring Guide. 🌿 I'm here to listen, offer supportive wellness perspectives, and help you find the right care. You can share whatever is on your mind at your own pace.
      </div>
      <div class="chat-quick-options">
        <button class="chat-quick-btn" onclick="sendAiMessage('${target}', 'I feel anxious and overwhelmed')">Feeling anxious</button>
        <button class="chat-quick-btn" onclick="sendAiMessage('${target}', 'I am having trouble sleeping')">Sleep difficulties</button>
        <button class="chat-quick-btn" onclick="sendAiMessage('${target}', 'I feel low and lonely')">Feeling low</button>
        <button class="chat-quick-btn" onclick="sendAiMessage('${target}', 'How do I choose between a psychiatrist and psychologist?')">Choosing a specialist</button>
      </div>
    `;
  }
  showToast('Chat history cleared.');
}

// ==========================================================================
// VIRTUAL CONSULTATION ROOM (Telehealth Experience)
// ==========================================================================

async function openConsultationRoom(roomId = 'MANO-DEMO-ROOM') {
  AppState.consultation.activeRoomId = roomId;

  try {
    const res = await fetch(`/api/consultation/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.room) {
        renderConsultationRoom(data.room);
      }
    } else {
      // Fallback demo room
      renderConsultationRoom({
        roomId,
        doctorName: 'Dr. Ananya Sharma',
        patientName: 'Guest Patient',
        mode: 'Video',
        messages: [
          { id: 'm1', sender: 'system', text: 'Secure Teleconsultation Session active.', time: 'System' },
          { id: 'm2', sender: 'doctor', text: 'Welcome to your Manospring session. I am ready to begin.', time: '10:30 AM' }
        ],
        clinicalNotes: 'Initial consultation impression.',
        prescriptions: []
      });
    }
  } catch (err) {
    console.error('Error fetching room:', err);
  }

  // Scroll to room view
  const roomSection = $('#consultation-room-section');
  if (roomSection) {
    roomSection.scrollIntoView({ behavior: 'smooth' });
    startConsultationMedia();
    startSessionTimer();
  }
}

function renderConsultationRoom(room) {
  $('#room-doctor-name').textContent = room.doctorName;
  $('#room-patient-name').textContent = room.patientName;
  $('#room-id-tag').textContent = room.roomId;

  if ($('#room-clinical-notes-input')) {
    $('#room-clinical-notes-input').value = room.clinicalNotes || '';
  }

  // Render in-session chat
  const chatBox = $('#room-chat-messages');
  if (chatBox) {
    chatBox.innerHTML = room.messages.map(m => `
      <div style="margin-bottom: 10px; font-size: 13px;">
        <span style="font-weight: 700; color: ${m.sender === 'doctor' ? 'var(--primary)' : m.sender === 'system' ? '#8a6d3b' : 'var(--text-main)'}; font-size: 11px;">
          ${m.sender === 'doctor' ? room.doctorName : m.sender === 'system' ? 'SYSTEM' : 'You'} (${m.time})
        </span>
        <div style="background: ${m.sender === 'system' ? '#fff9e6' : 'var(--bg-page)'}; padding: 8px 12px; border-radius: 8px; margin-top: 2px;">
          ${escapeHTML(m.text)}
        </div>
      </div>
    `).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

async function startConsultationMedia() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      AppState.consultation.localStream = stream;
      const videoEl = $('#self-video-preview');
      if (videoEl) {
        videoEl.srcObject = stream;
      }
    }
  } catch (e) {
    console.log('Webcam not accessible or permission denied, using simulated stream avatar.');
  }
}

function toggleMediaTrack(type) {
  if (type === 'video') {
    AppState.consultation.cameraOn = !AppState.consultation.cameraOn;
    const btn = $('#btn-toggle-cam');
    if (btn) btn.classList.toggle('active', !AppState.consultation.cameraOn);
    if (AppState.consultation.localStream) {
      AppState.consultation.localStream.getVideoTracks().forEach(t => t.enabled = AppState.consultation.cameraOn);
    }
    showToast(AppState.consultation.cameraOn ? 'Camera turned on' : 'Camera turned off');
  } else if (type === 'audio') {
    AppState.consultation.micOn = !AppState.consultation.micOn;
    const btn = $('#btn-toggle-mic');
    if (btn) btn.classList.toggle('active', !AppState.consultation.micOn);
    if (AppState.consultation.localStream) {
      AppState.consultation.localStream.getAudioTracks().forEach(t => t.enabled = AppState.consultation.micOn);
    }
    showToast(AppState.consultation.micOn ? 'Microphone unmuted' : 'Microphone muted');
  } else if (type === 'screen') {
    AppState.consultation.screenShareOn = !AppState.consultation.screenShareOn;
    const btn = $('#btn-toggle-screen');
    if (btn) btn.classList.toggle('active', AppState.consultation.screenShareOn);
    showToast(AppState.consultation.screenShareOn ? 'Screen sharing active' : 'Screen sharing stopped');
  }
}

function startSessionTimer() {
  if (AppState.consultation.timerInterval) clearInterval(AppState.consultation.timerInterval);
  AppState.consultation.timerSeconds = 45 * 60; // 45 min

  const timerEl = $('#session-countdown-timer');
  AppState.consultation.timerInterval = setInterval(() => {
    AppState.consultation.timerSeconds--;
    if (AppState.consultation.timerSeconds <= 0) {
      clearInterval(AppState.consultation.timerInterval);
      showToast('Scheduled session time has concluded.');
      return;
    }
    const mins = Math.floor(AppState.consultation.timerSeconds / 60);
    const secs = AppState.consultation.timerSeconds % 60;
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }, 1000);
}

async function sendRoomChatMessage(e) {
  e.preventDefault();
  const input = $('#room-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  const roomId = AppState.consultation.activeRoomId;
  try {
    const res = await fetch(`/api/consultation/${roomId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'patient', text })
    });

    const data = await res.json();
    if (data.ok && data.message) {
      const chatBox = $('#room-chat-messages');
      const msgDiv = document.createElement('div');
      msgDiv.style.marginBottom = '10px';
      msgDiv.style.fontSize = '13px';
      msgDiv.innerHTML = `
        <span style="font-weight: 700; color: var(--text-main); font-size: 11px;">You (${data.message.time})</span>
        <div style="background: var(--bg-page); padding: 8px 12px; border-radius: 8px; margin-top: 2px;">
          ${escapeHTML(data.message.text)}
        </div>
      `;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch (err) {
    console.error('Error sending room message:', err);
  }
}

async function saveClinicalNotes() {
  const notes = $('#room-clinical-notes-input') ? $('#room-clinical-notes-input').value : '';
  const roomId = AppState.consultation.activeRoomId;

  try {
    const res = await fetch(`/api/consultation/${roomId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicalNotes: notes })
    });
    if (res.ok) {
      showToast('Clinical summary and prescription notes saved.');
    }
  } catch (err) {
    showToast('Failed to save notes.');
  }
}

function downloadSessionSummary() {
  const roomId = AppState.consultation.activeRoomId;
  const notes = $('#room-clinical-notes-input') ? $('#room-clinical-notes-input').value : 'Routine teleconsultation conducted.';

  const docName = $('#room-doctor-name') ? $('#room-doctor-name').textContent : 'Consultant Psychiatrist';
  const patientName = $('#room-patient-name') ? $('#room-patient-name').textContent : 'Patient';

  const doc = `=====================================================
MANOSPRING HEALTHCARE — DIGITAL CONSULTATION SUMMARY
Format Aligned with NMC Telemedicine Practice Guidelines 2020
=====================================================
Session ID: ${roomId}
Consultation Date: ${new Date().toLocaleDateString('en-IN')}
Time: ${new Date().toLocaleTimeString('en-IN')}

PRACTITIONER:
Clinician: ${docName}
Facility: Manospring Virtual Telehealth Clinic, Bengaluru

PATIENT:
Name: ${patientName}
Mode: Video Teleconsultation (Encrypted)

CLINICAL IMPRESSION & RECOMMENDATIONS:
${notes}

GENERAL ADVICE & LIFESTYLE HYGIENE:
- Ensure consistent daily sleep and wake schedule.
- Maintain adequate hydration and physical activity.
- Follow up in 14 days or earlier if distress exacerbates.

CRISIS NOTICE:
Telemedicine is not designed for psychiatric emergencies.
In acute crisis, call 112 or Tele-MANAS (14416).
=====================================================`;

  const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Manospring-Clinical-Summary-${roomId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Consultation summary downloaded.');
}

function endConsultation() {
  if (confirm('Are you sure you want to end this consultation session?')) {
    if (AppState.consultation.localStream) {
      AppState.consultation.localStream.getTracks().forEach(t => t.stop());
    }
    if (AppState.consultation.timerInterval) {
      clearInterval(AppState.consultation.timerInterval);
    }
    showToast('Consultation ended.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================================================
// PATIENT PORTAL & CLINICIAN WORKSPACE
// ==========================================================================

async function loadAppointments() {
  try {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    if (data.ok && Array.isArray(data.appointments)) {
      AppState.appointments = data.appointments;
      renderPortalAppointments();
      renderClinicianWorkspace();
    }
  } catch (err) {
    console.error('Error fetching appointments:', err);
  }
}

function renderPortalAppointments() {
  const container = $('#patient-appointments-list');
  if (!container) return;

  if (AppState.appointments.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><p>You do not have any scheduled appointments.</p><button class="btn btn-primary btn-sm" onclick="startBooking()" style="margin-top: 10px;">Book a Session</button></div>';
    return;
  }

  container.innerHTML = AppState.appointments.map(a => `
    <div class="appointment-card">
      <div class="appt-info-main">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <h4 style="margin: 0;">${escapeHTML(a.doctorName)}</h4>
          <span class="badge ${a.status === 'confirmed' ? 'badge-green' : 'badge-amber'}">
            ${a.status.toUpperCase()}
          </span>
        </div>
        <p style="font-size: 13px; color: var(--primary); margin-bottom: 6px;">${escapeHTML(a.doctorTitle)}</p>
        <div class="appt-info-meta">
          <span>📅 ${escapeHTML(a.date)}</span>
          <span>⏰ ${escapeHTML(a.timeSlot)}</span>
          <span>📹 ${escapeHTML(a.mode)} Consultation</span>
          <span>Ref: <strong>${escapeHTML(a.id)}</strong></span>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button class="btn btn-primary btn-sm" onclick="openConsultationRoom('${a.roomId}')">
          Enter Room ↗
        </button>
        <button class="btn btn-outline btn-sm" onclick="downloadAppointmentReceipt('${a.id}')">
          Receipt
        </button>
        <button class="btn btn-subtle btn-sm" onclick="cancelAppointment('${a.id}')" title="Cancel or Reschedule">
          Cancel
        </button>
      </div>
    </div>
  `).join('');
}

function renderClinicianWorkspace() {
  const tableBody = $('#clinician-appointments-table');
  if (!tableBody) return;

  tableBody.innerHTML = AppState.appointments.map(a => `
    <tr>
      <td>
        <strong>${escapeHTML(a.patientName)}</strong>
        <span style="display: block; font-size: 11px; color: var(--text-muted);">${escapeHTML(a.ageGroup || 'Adult')} · ${escapeHTML(a.patientPhone)}</span>
      </td>
      <td>
        ${escapeHTML(a.date)}<br>
        <span style="font-size: 11px; color: var(--text-muted);">${escapeHTML(a.timeSlot)}</span>
      </td>
      <td>
        <span class="badge badge-sage">${escapeHTML(a.mode)}</span>
      </td>
      <td>
        <div style="max-width: 240px; font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          ${escapeHTML(a.aiPreSummary || a.reason || 'General evaluation')}
        </div>
      </td>
      <td>
        <span class="badge badge-green">${escapeHTML(a.status)}</span>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openConsultationRoom('${a.roomId}')">
          Start Session
        </button>
      </td>
    </tr>
  `).join('');
}

async function cancelAppointment(id) {
  if (!confirm(`Are you sure you want to cancel appointment ${id}? You will receive a full refund within 48 hours.`)) return;

  try {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });
    if (res.ok) {
      showToast('Appointment cancelled successfully.');
      loadAppointments();
    }
  } catch (err) {
    showToast('Failed to cancel appointment.');
  }
}

function switchPortalTab(tabId) {
  $$('.portal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  $$('.portal-tab-content').forEach(c => c.style.display = c.id === `tab-${tabId}` ? 'block' : 'none');
}

// Clinician Login Simulation
async function handleClinicianLogin(e) {
  e.preventDefault();
  const email = $('#clinician-email').value.trim();
  const password = $('#clinician-password').value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'clinician' })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      AppState.auth.role = 'clinician';
      AppState.auth.user = data.user;
      closeModal('clinician-login-modal');
      showToast(`Welcome back, ${data.user.name}`);
      switchPortalTab('clinician');
      $('#portal-section').scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(data.error || 'Invalid clinician credentials.');
    }
  } catch (err) {
    showToast('Connection error during login.');
  }
}

// ==========================================================================
// DPDPA 2023 PRIVACY & DATA RIGHTS
// ==========================================================================

async function submitPrivacyRequest(e) {
  e.preventDefault();
  const type = $('#privacy-req-type').value;
  const fullName = $('#privacy-req-name').value.trim();
  const email = $('#privacy-req-email').value.trim();
  const phone = $('#privacy-req-phone').value.trim();
  const details = $('#privacy-req-details').value.trim();

  try {
    const res = await fetch('/api/privacy/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, fullName, email, phone, details })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      closeModal('privacy-request-modal');
      showToast(`Request submitted! Reference ID: ${data.ticketId}. Our DPO will respond within 72 hours.`);
    } else {
      showToast(data.error || 'Submission failed.');
    }
  } catch (err) {
    showToast('Connection error.');
  }
}

// ==========================================================================
// CONTACT US FORM
// ==========================================================================

async function submitContactForm(e) {
  e.preventDefault();
  const name = $('#contact-name').value.trim();
  const email = $('#contact-email').value.trim();
  const phone = $('#contact-phone') ? $('#contact-phone').value.trim() : '';
  const message = $('#contact-message').value.trim();

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      e.target.reset();
      showToast(data.message || 'Message sent! We will reach out shortly.');
    } else {
      showToast(data.error || 'Failed to submit form.');
    }
  } catch (err) {
    showToast('Network error.');
  }
}

// ==========================================================================
// MODAL CONTROLLER
// ==========================================================================

function openModal(modalId) {
  const el = $(`#${modalId}`);
  if (el) {
    el.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const el = $(`#${modalId}`);
  if (el) {
    el.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function openEmergencyModal() {
  openModal('emergency-modal');
}

// ==========================================================================
// EVENT LISTENERS & SETUP
// ==========================================================================

function setupEventListeners() {
  // Modal Close on backdrop click & ESC
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal-overlay.show').forEach(m => closeModal(m.id));
      toggleFloatingChat(false);
    }
  });

  // Embedded chat submit
  const embForm = $('#embedded-chat-form');
  if (embForm) {
    embForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#embedded-chat-input');
      if (input) sendAiMessage('embedded', input.value);
    });
  }

  // Floating chat submit
  const floatForm = $('#float-chat-form');
  if (floatForm) {
    floatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#float-chat-input');
      if (input) sendAiMessage('floating', input.value);
    });
  }

  // Room chat form
  const roomForm = $('#room-chat-form');
  if (roomForm) {
    roomForm.addEventListener('submit', sendRoomChatMessage);
  }

  // Filter inputs
  ['filter-specialty', 'filter-mode', 'filter-language'].forEach(id => {
    const el = $(`#${id}`);
    if (el) el.addEventListener('change', filterSpecialists);
  });

  const searchInput = $('#filter-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(filterSpecialists, 250);
    });
  }

  // Portal tabs
  $$('.portal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchPortalTab(tab.dataset.tab));
  });

  // Room tabs
  $$('.room-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.room-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabName = btn.dataset.roomTab;
      $('#room-tab-chat').style.display = tabName === 'chat' ? 'flex' : 'none';
      $('#room-tab-notes').style.display = tabName === 'notes' ? 'flex' : 'none';
    });
  });
}
