const { User } = require('../models');

const seedSuperAdminFromEnv = async () => {
  const {
    SUPER_ADMIN_NAME,
    SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD,
  } = process.env;

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    return;
  }

  const email = String(SUPER_ADMIN_EMAIL).trim().toLowerCase();
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      name: SUPER_ADMIN_NAME || email.split('@')[0],
      password_hash: SUPER_ADMIN_PASSWORD,
      role: 'admin',
      is_super_admin: true,
      email_verified: true,
    },
  });

  if (!created) {
    user.name = SUPER_ADMIN_NAME || user.name;
    user.password_hash = SUPER_ADMIN_PASSWORD;
    user.role = 'admin';
    user.is_super_admin = true;
    user.email_verified = true;
    await user.save();
  }
};

module.exports = { seedSuperAdminFromEnv };
