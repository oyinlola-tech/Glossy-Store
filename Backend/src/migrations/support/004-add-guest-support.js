module.exports = {
  up: async (queryInterface, Sequelize) => {
    const supportConversation = await queryInterface.describeTable('support_conversations');
    if (supportConversation.user_id && supportConversation.user_id.allowNull === false) {
      await queryInterface.changeColumn('support_conversations', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!supportConversation.guest_name) {
      await queryInterface.addColumn('support_conversations', 'guest_name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!supportConversation.guest_email) {
      await queryInterface.addColumn('support_conversations', 'guest_email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!supportConversation.guest_token) {
      await queryInterface.addColumn('support_conversations', 'guest_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (supportConversation.guest_token && !supportConversation.guest_token?.unique) {
      await queryInterface.addIndex('support_conversations', ['guest_token'], {
        name: 'idx_support_conversations_guest_token',
        unique: true,
      });
    }

    const supportMessages = await queryInterface.describeTable('support_messages');
    if (supportMessages.sender_user_id && supportMessages.sender_user_id.allowNull === false) {
      await queryInterface.changeColumn('support_messages', 'sender_user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
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
