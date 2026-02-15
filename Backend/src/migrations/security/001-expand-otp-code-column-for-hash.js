const resolveOtpTable = async (queryInterface) => {
  try {
    await queryInterface.describeTable('OTPs');
    return 'OTPs';
  } catch (err) {
    // fall through
  }
  try {
    await queryInterface.describeTable('otps');
    return 'otps';
  } catch (err) {
    return null;
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = await resolveOtpTable(queryInterface);
    if (!tableName) {
      // OTP table not created yet; allow bootstrap sync to create it.
      return;
    }
    await queryInterface.changeColumn(tableName, 'otp_code', {
      type: Sequelize.STRING(128),
      allowNull: false,
    });
  },
};
