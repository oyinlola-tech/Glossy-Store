module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('paystack_events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      event: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },
      customer_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      occurred_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('paystack_events', ['event'], {
      name: 'idx_paystack_events_event',
    });
    await queryInterface.addIndex('paystack_events', ['reference'], {
      name: 'idx_paystack_events_reference',
    });
    await queryInterface.addIndex('paystack_events', ['customer_email'], {
      name: 'idx_paystack_events_customer_email',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('paystack_events');
  },
};
