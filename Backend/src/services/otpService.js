const { OTP } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail, isEmailConfigured } = require('./emailService');

let nonProdFallbackSecret = null;
const getOtpHashSecret = () => {
  const configured = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('OTP hashing secret is not configured');
  }
  if (!nonProdFallbackSecret) {
    nonProdFallbackSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[otp] Using generated in-memory OTP hash secret for non-production mode');
  }
  return nonProdFallbackSecret;
};

const hashOTP = (email, purpose, otpCode) => crypto
  .createHmac('sha256', getOtpHashSecret())
  .update(`${String(email).toLowerCase()}|${purpose}|${otpCode}`)
  .digest('hex');

const safeCompare = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
};

const createOTP = async (email, purpose, userId = null) => {
  // Delete any existing OTPs for this email/purpose
  await OTP.destroy({ where: { email, purpose, verified: false } });

  const otpCode = generateOTP();
  const otpHash = hashOTP(email, purpose, otpCode);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otp = await OTP.create({
    user_id: userId,
    email,
    purpose,
    otp_code: otpHash,
    expires_at,
  });

  // Send email (or log OTP in dev if SMTP not configured)
  const result = await sendOTPEmail(email, otpCode, purpose);
  if (result?.skipped && process.env.NODE_ENV !== 'production' && !isEmailConfigured()) {
    console.warn(`[otp] SMTP not configured. OTP for ${email} (${purpose}): ${otpCode}`);
  }

  return otp;
};

const verifyOTP = async (email, otpCode, purpose) => {
  const otp = await OTP.findOne({
    where: {
      email,
      purpose,
      verified: false,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [['created_at', 'DESC']],
  });

  if (!otp) return null;
  const expectedHash = hashOTP(email, purpose, otpCode);
  if (!safeCompare(otp.otp_code, expectedHash)) {
    return null;
  }

  otp.verified = true;
  await otp.save();
  return otp;
};

module.exports = { createOTP, verifyOTP };
