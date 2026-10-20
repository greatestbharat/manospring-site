import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../server/src/app.js';

let server: http.Server;
const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('🚀 Starting Manospring Comprehensive Test Suite...');

  await new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`✓ Test server running on ${BASE_URL}`);
      resolve();
    });
  });

  let totalTests = 0;
  let passedTests = 0;

  async function test(name: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`  ✓ ${name}`);
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // 1. Health Check
  await test('GET /api/health should return ok: true and service metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.service, 'Manospring Healthcare Platform');
    assert.equal(typeof json.environment, 'string');
  });

  // 2. Specialists Directory
  await test('GET /api/specialists should return verified clinicians with credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/specialists`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.count >= 4);
    assert.ok(Array.isArray(json.specialists));
    const drSharma = json.specialists.find((s: any) => s.id === 'spec-1' || s.id === 'spec_1');
    assert.ok(drSharma);
    assert.equal(drSharma.name, 'Dr. Ananya Sharma');
    assert.ok((drSharma.registrationNumber || drSharma.regNumber || drSharma.council).length > 0);
  });

  // 3. Filter Specialists by Specialty
  await test('GET /api/specialists?specialty=Psychiatrist filters correctly', async () => {
    const res = await fetch(`${BASE_URL}/api/specialists?specialty=Psychiatrist`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.specialists.length > 0);
    assert.ok(json.specialists.every((s: any) => (s.role || s.title || '').includes('Psychiatrist')));
  });

  // 4. Specialist by ID
  await test('GET /api/specialists/spec_1 should return single doctor details', async () => {
    const res = await fetch(`${BASE_URL}/api/specialists/spec_1`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.specialist.id.includes('spec'));
  });

  // 5. AI Chat - Empathetic Conversation
  await test('POST /api/chat should respond with compassionate guidance', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I have been feeling really exhausted and stressed with work lately.',
        history: []
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(typeof json.reply, 'string');
    assert.ok(json.reply.length > 10);
    assert.equal(json.crisis, false);
  });

  // 6. AI Chat - Crisis Detection Escalation
  await test('POST /api/chat should flag acute crisis and escalate 14416 helpline', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I feel like ending my life right now, please help me',
        history: []
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.crisis, true);
    assert.ok(json.reply.includes('14416') || json.reply.includes('112'));
  });

  // 7. Appointment Booking
  let bookedAptId = '';
  let bookedRoomId = '';
  await test('POST /api/appointments should book slot and generate secure room', async () => {
    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        specialistId: 'spec-1',
        specialistName: 'Dr. Ananya Sharma',
        specialistRole: 'Consultant Psychiatrist',
        patientName: 'Test Patient',
        patientEmail: 'test.patient@example.com',
        patientPhone: '+91 99999 88888',
        mode: 'video',
        date: 'Tomorrow',
        timeSlot: '04:00 PM',
        fee: 1800,
        notes: 'Initial evaluation test'
      })
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.appointment.id.startsWith('apt-'));
    assert.ok(json.appointment.roomId.startsWith('mano-'));
    bookedAptId = json.appointment.id;
    bookedRoomId = json.appointment.roomId;
  });

  // 8. Appointment Lookup by ID
  await test('GET /api/appointments/:id retrieves newly booked appointment', async () => {
    const res = await fetch(`${BASE_URL}/api/appointments/${bookedAptId}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.appointment.id, bookedAptId);
    assert.equal(json.appointment.patientEmail, 'test.patient@example.com');
  });

  // 9. Telehealth Room Access
  await test('GET /api/consultations/:roomId retrieves room details', async () => {
    const res = await fetch(`${BASE_URL}/api/consultations/${bookedRoomId}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.room.roomId, bookedRoomId);
  });

  // 10. In-Room Messaging
  await test('POST /api/consultations/:roomId/message records message', async () => {
    const res = await fetch(`${BASE_URL}/api/consultations/${bookedRoomId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'Test Patient',
        text: 'Good afternoon Doctor, I am in the waiting room.'
      })
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.message.text, 'Good afternoon Doctor, I am in the waiting room.');
  });

  // 11. In-Room Clinical Notes
  await test('POST /api/consultations/:roomId/notes saves prescription notes', async () => {
    const res = await fetch(`${BASE_URL}/api/consultations/${bookedRoomId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicalNotes: 'Patient showed positive response to cognitive reframing.',
        prescriptions: ['Sleep hygiene protocol', 'Deep breathing exercises 10m BD']
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.room.clinicalNotes.includes('positive response'));
  });

  // 12. Appointment Cancellation
  await test('PATCH /api/appointments/:id should cancel appointment', async () => {
    const res = await fetch(`${BASE_URL}/api/appointments/${bookedAptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'cancelled',
        paymentStatus: 'refunded'
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.appointment.status, 'cancelled');
  });

  // 13. Contact Care Coordination Inquiry
  await test('POST /api/contact/inquiry submits customer service ticket', async () => {
    const res = await fetch(`${BASE_URL}/api/contact/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavita Nair',
        email: 'kavita@example.com',
        subject: 'Corporate Mental Wellness Plan',
        message: 'Interested in sessions for our engineering team.'
      })
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.ticketId.startsWith('TKT-'));
  });

  // 14. DPDPA Privacy Request
  await test('POST /api/privacy/request submits data rights request', async () => {
    const res = await fetch(`${BASE_URL}/api/privacy/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Arjun Das',
        email: 'arjun@example.com',
        requestType: 'deletion',
        details: 'Please erase my chat session history under DPDPA.'
      })
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.trackingId.startsWith('DPDPA-'));
  });

  // 15. Clinician Authentication Login
  await test('POST /api/auth/login validates doctor portal login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ananya.sharma@manospring.com',
        password: 'password123'
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.user.role, 'clinician');
    assert.ok(typeof json.token, 'string');
  });

  // 16. Static Frontend SPA Delivery
  await test('GET / returns compiled React Vite HTML page', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('<div id="root"></div>'));
    assert.ok(html.includes('Manospring'));
  });

  server.close(() => {
    console.log(`\n🎉 Results: ${passedTests}/${totalTests} tests passed!`);
    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  if (server) server.close();
  process.exit(1);
});
