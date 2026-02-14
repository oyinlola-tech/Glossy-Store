const resolveOtpTable = async (queryInterface) => {
  try {
    await queryInterface.describeTable('OTPs');
    return 'OTPs';
  } catch (err) {
    await queryInterface.describeTable('otps');
    return 'otps';
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = await resolveOtpTable(queryInterface);
    await queryInterface.changeColumn(tableName, 'otp_code', {
      type: Sequelize.STRING(128),
      allowNull: false,
    });
  },
};
