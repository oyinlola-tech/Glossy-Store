module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_methods', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      provider: {
        type: Sequelize.ENUM('squad'),
        allowNull: false,
        defaultValue: 'squad',
      },
      type: {
        type: Sequelize.ENUM('card'),
        allowNull: false,
        defaultValue: 'card',
      },
      brand: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      last4: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      exp_month: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      exp_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      token_encrypted: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      token_fingerprint: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('payment_methods', ['user_id'], { name: 'idx_payment_methods_user_id' });
    await queryInterface.addIndex('payment_methods', ['user_id', 'is_default'], { name: 'idx_payment_methods_user_default' });
    await queryInterface.addIndex('payment_methods', ['token_fingerprint'], { unique: true, name: 'uq_payment_methods_token_fingerprint' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payment_methods');
  },
};
