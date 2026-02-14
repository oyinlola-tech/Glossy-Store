const { OTP } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail } = require('./emailService');

const getOtpHashSecret = () => process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || 'otp-default-secret';

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

  // Send email
  await sendOTPEmail(email, otpCode, purpose);

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
