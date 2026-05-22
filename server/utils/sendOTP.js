/**
 * OTP Sender Utility
 * Sends OTP via Twilio WhatsApp API (no DLT required) when configured,
 * otherwise falls back to development mock mode.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID    — Account SID from Twilio console
 *   TWILIO_AUTH_TOKEN     — Auth token from Twilio console
 *   TWILIO_WHATSAPP_FROM  — WhatsApp-enabled number e.g. +14155238886 (sandbox)
 *                           or your approved Twilio WhatsApp Business number
 */

const twilio = require('twilio');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isTwilioConfigured = () => {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  );
};

// ─── Twilio WhatsApp Provider ─────────────────────────────────────────────────
const sendViaTwilioWhatsApp = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio WhatsApp credentials are not configured.');
  }

  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body: `Your Nio Tea verification code is: *${otp}*\n\nValid for 10 minutes. Do not share this with anyone.`,
    from: `whatsapp:${from}`,
    to:   `whatsapp:+91${phone}`,
  });
};

// ─── Mock Provider (Development) ─────────────────────────────────────────────
const sendViaMock = async (phone, otp) => {
  console.log(`\n💬 [DEV OTP] WhatsApp → Phone: +91${phone}  OTP: ${otp}\n`);
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const sendOTP = async (phone, otp) => {
  if (isTwilioConfigured()) {
    await sendViaTwilioWhatsApp(phone, otp);
    return { provider: 'twilio' };
  }

  await sendViaMock(phone, otp);
  return { provider: 'mock' };
};

// OTP is always verified locally against the DB-stored value — no external call needed.
const verifyOTPWithProvider = async (_phone, otp, expectedOtp) => {
  return { ok: otp === expectedOtp, message: 'Invalid OTP. Please try again.' };
};

module.exports = { generateOTP, sendOTP, verifyOTPWithProvider, isTwilioConfigured };
