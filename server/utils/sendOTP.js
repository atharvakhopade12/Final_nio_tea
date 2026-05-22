/**
 * OTP Sender Utility
 * Sends OTP via Twilio Verify WhatsApp (no DLT, no sandbox opt-in required)
 * when configured, otherwise falls back to development mock mode.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID        — Account SID from Twilio console
 *   TWILIO_AUTH_TOKEN         — Auth token from Twilio console
 *   TWILIO_VERIFY_SERVICE_SID — Verify Service SID (starts with VA...)
 *                               Create at: console.twilio.com → Verify → Services
 */

const twilio = require('twilio');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isTwilioConfigured = () => {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
};

// ─── Twilio Verify WhatsApp Provider ─────────────────────────────────────────
// Uses Twilio Verify — no sandbox opt-in needed, works for any WhatsApp number.
const sendViaTwilioVerify = async (phone) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: `+91${phone}`, channel: 'whatsapp' });
};

const checkViaTwilioVerify = async (phone, code) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const result = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: `+91${phone}`, code });
  return {
    ok: result.status === 'approved',
    message: result.status === 'approved' ? 'OTP verified.' : 'Invalid or expired OTP.',
  };
};

// ─── Mock Provider (Development) ─────────────────────────────────────────────
const sendViaMock = async (phone, otp) => {
  console.log(`\n💬 [DEV OTP] WhatsApp → Phone: +91${phone}  OTP: ${otp}\n`);
};

// ─── Main Exports ─────────────────────────────────────────────────────────────
const sendOTP = async (phone, otp) => {
  if (isTwilioConfigured()) {
    await sendViaTwilioVerify(phone); // Twilio generates & sends OTP internally
    return { provider: 'twilio' };
  }
  await sendViaMock(phone, otp);
  return { provider: 'mock' };
};

// For Twilio: verify via Twilio Verify API (ignores expectedOtp).
// For mock:   compare locally against DB-stored OTP.
const verifyOTPWithProvider = async (phone, otp, expectedOtp) => {
  if (isTwilioConfigured()) {
    return checkViaTwilioVerify(phone, otp);
  }
  return { ok: otp === expectedOtp, message: 'Invalid OTP. Please try again.' };
};

module.exports = { generateOTP, sendOTP, verifyOTPWithProvider, isTwilioConfigured };
