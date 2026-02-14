const { User, Referral } = require('../models');
const {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  verifyLoginOTPSchema,
  forgotPasswordSchema,
  resendOTPSchema,
  resetPasswordSchema,
  changePasswordSchema,
  confirmDeleteAccountSchema,
} = require('../validations/authValidation');
const { createOTP, verifyOTP } = require('../services/otpService');
const { generateToken } = require('../utils/jwtHelper');
const { sendWelcomeEmail, sendDeviceChangeEmail } = require('../services/emailService');

const validateBody = (schema, body) => schema.validate(body, { abortEarly: true, stripUnknown: true });
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

exports.register = async (req, res, next) => {
  try {
    const { error, value } = validateBody(registerSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { password, name, referralCode } = value;
    const email = normalizeEmail(value.email);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // Create user (email not verified yet)
    const user = await User.create({
      email,
      password_hash: password,
      name,
      email_verified: false,
    });

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ where: { referral_code: referralCode } });
      if (referrer) {
        user.referred_by = referrer.id;
        await user.save();
        await Referral.create({
          referrer_user_id: referrer.id,
          referred_user_id: user.id,
          referral_code: referralCode,
        });
      }
    }

    // Create OTP for registration
    await createOTP(email, 'registration', user.id);

    res.status(201).json({ message: 'Registration successful. Please verify your email with OTP.' });
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { error, value } = validateBody(verifyOTPSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { otp, purpose } = value;
    const email = normalizeEmail(value.email);

    const verified = await verifyOTP(email, otp, purpose);
    if (!verified) return res.status(400).json({ error: 'Invalid or expired OTP' });

    if (purpose === 'registration') {
      await User.update({ email_verified: true }, { where: { id: verified.user_id } });
      const user = await User.findByPk(verified.user_id);
      await sendWelcomeEmail(user.email, user.name);
    }

    // For login purpose, token will be issued separately after OTP verification
    if (purpose === 'login' || purpose === 'forgot_password') {
      // In login case, we might want to issue token directly here, or handle separately
      // We'll handle login in a separate endpoint
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = validateBody(loginSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { password } = value;
    const email = normalizeEmail(value.email);
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses social login. Please login via social.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const ip = req.ip;
    const lastIp = user.last_login_ip;
    const isPrivilegedUser = user.role === 'admin' || Boolean(user.is_super_admin);

    if (isPrivilegedUser) {
      await createOTP(user.email, 'login', user.id);
      return res.json({ needOtp: true, message: 'Admin access requires OTP verification' });
    }

    if (lastIp && lastIp !== ip) {
      // New device detected - send OTP
      await sendDeviceChangeEmail(user.email, ip);
      await createOTP(user.email, 'login', user.id);
      return res.json({ needOtp: true, message: 'OTP sent to your email' });
    }

    // Same device - login successful
    user.last_login_ip = ip;
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_super_admin: user.is_super_admin } });
  } catch (err) {
    next(err);
  }
};

exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { error, value } = validateBody(verifyLoginOTPSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const email = normalizeEmail(value.email);
    const { otp } = value;
    const verified = await verifyOTP(email, otp, 'login');
    if (!verified) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = await User.findByPk(verified.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.last_login_ip = req.ip;
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_super_admin: user.is_super_admin } });
  } catch (err) {
    next(err);
  }
};

// Forgot password: request OTP
exports.forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = validateBody(forgotPasswordSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const email = normalizeEmail(value.email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the account exists, an OTP has been sent to the email address' });
    }

    await createOTP(email, 'forgot_password', user.id);
    res.json({ message: 'If the account exists, an OTP has been sent to the email address' });
  } catch (err) {
    next(err);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { error, value } = validateBody(resendOTPSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const email = normalizeEmail(value.email);
    const { purpose } = value;
    const user = await User.findOne({ where: { email } });

    if (purpose === 'registration') {
      if (!user) return res.status(404).json({ error: 'User not found for registration OTP' });
      if (user.email_verified) return res.status(400).json({ error: 'Email is already verified' });
      await createOTP(email, 'registration', user.id);
      return res.json({ message: 'OTP resent successfully' });
    }

    if (purpose === 'login') {
      if (!user) return res.status(404).json({ error: 'User not found for login OTP' });
      if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });
      await createOTP(email, 'login', user.id);
      return res.json({ message: 'OTP resent successfully' });
    }

    if (user) {
      await createOTP(email, 'forgot_password', user.id);
    }
    return res.json({ message: 'If the account exists, an OTP has been sent to the email address' });
  } catch (err) {
    next(err);
  }
};

// Reset password with OTP
exports.resetPassword = async (req, res, next) => {
  try {
    const { error, value } = validateBody(resetPasswordSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const email = normalizeEmail(value.email);
    const { otp, newPassword } = value;
    const verified = await verifyOTP(email, otp, 'forgot_password');
    if (!verified) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = await User.findByPk(verified.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password_hash = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

// Change password (authenticated)
exports.changePassword = async (req, res, next) => {
  try {
    const { error, value } = validateBody(changePasswordSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { currentPassword, newPassword } = value;
    const user = req.user;
    if (!user.password_hash) {
      return res.status(400).json({ error: 'Password change is unavailable for social login accounts' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password_hash = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// Request account deletion (sends OTP)
exports.requestDeleteAccount = async (req, res, next) => {
  try {
    const user = req.user;
    await createOTP(user.email, 'delete_account', user.id);
    res.json({ message: 'OTP sent to your email for confirmation' });
  } catch (err) {
    next(err);
  }
};

// Confirm delete account with OTP
exports.confirmDeleteAccount = async (req, res, next) => {
  try {
    const { error, value } = validateBody(confirmDeleteAccountSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { otp } = value;
    const user = req.user;
    const verified = await verifyOTP(user.email, otp, 'delete_account');
    if (!verified) return res.status(400).json({ error: 'Invalid or expired OTP' });

    await user.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.googleCallback = async (req, res) => {
  const authPayload = req.user;
  if (!authPayload?.token || !authPayload?.user) {
    return res.status(401).json({ error: 'Google authentication failed' });
  }
  return res.json({
    token: authPayload.token,
    user: {
      id: authPayload.user.id,
      name: authPayload.user.name,
      email: authPayload.user.email,
      role: authPayload.user.role,
      is_super_admin: authPayload.user.is_super_admin,
    },
  });
};

exports.appleCallback = async (req, res) => {
  const authPayload = req.user;
  if (!authPayload?.token || !authPayload?.user) {
    return res.status(401).json({ error: 'Apple authentication failed' });
  }
  return res.json({
    token: authPayload.token,
    user: {
      id: authPayload.user.id,
      name: authPayload.user.name,
      email: authPayload.user.email,
      role: authPayload.user.role,
      is_super_admin: authPayload.user.is_super_admin,
    },
  });
};
