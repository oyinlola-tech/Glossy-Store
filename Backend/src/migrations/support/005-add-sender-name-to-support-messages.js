module.exports = {
  up: async (queryInterface, Sequelize) => {
    const supportMessages = await queryInterface.describeTable('support_messages');
    if (!supportMessages.sender_name) {
      await queryInterface.addColumn('support_messages', 'sender_name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE support_messages sm
      LEFT JOIN users u ON u.id = sm.sender_user_id
      LEFT JOIN support_conversations sc ON sc.id = sm.support_conversation_id
      SET sm.sender_name = CASE
        WHEN sm.sender_role = 'guest' THEN COALESCE(NULLIF(sc.guest_name, ''), NULLIF(sc.guest_email, ''), 'Guest')
        ELSE COALESCE(NULLIF(u.name, ''), NULLIF(u.email, ''), 'User')
      END
      WHERE sm.sender_name IS NULL OR sm.sender_name = ''
    `);

    await queryInterface.changeColumn('support_messages', 'sender_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    const supportMessages = await queryInterface.describeTable('support_messages');
    if (supportMessages.sender_name) {
      await queryInterface.removeColumn('support_messages', 'sender_name');
    }
  },
};
