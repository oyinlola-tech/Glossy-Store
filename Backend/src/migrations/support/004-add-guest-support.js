module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('support_conversations', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('support_conversations', 'guest_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('support_conversations', 'guest_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('support_conversations', 'guest_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addIndex('support_conversations', ['guest_token'], {
      name: 'idx_support_conversations_guest_token',
      unique: true,
    });

    await queryInterface.changeColumn('support_messages', 'sender_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('support_messages', 'sender_role', {
      type: Sequelize.ENUM('user', 'admin', 'guest'),
      allowNull: false,
    });
    await queryInterface.changeColumn('support_messages', 'recipient_role', {
      type: Sequelize.ENUM('user', 'admin', 'guest'),
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('support_conversations', 'idx_support_conversations_guest_token');
    await queryInterface.removeColumn('support_conversations', 'guest_token');
    await queryInterface.removeColumn('support_conversations', 'guest_email');
    await queryInterface.removeColumn('support_conversations', 'guest_name');
    await queryInterface.changeColumn('support_conversations', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('support_messages', 'recipient_role', {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false,
    });
    await queryInterface.changeColumn('support_messages', 'sender_role', {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false,
    });
    await queryInterface.changeColumn('support_messages', 'sender_user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
