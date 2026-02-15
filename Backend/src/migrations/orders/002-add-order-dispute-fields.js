module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'orders';

    const addColumnIfMissing = async (columnName, definition) => {
      const [column] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM \`${tableName}\` LIKE '${columnName}'`
      );
      if (!column.length) {
        await queryInterface.addColumn(tableName, columnName, definition);
      }
    };

    await addColumnIfMissing('dispute_status', {
      type: Sequelize.ENUM('none', 'pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'none',
    });
    await addColumnIfMissing('dispute_reason', { type: Sequelize.TEXT, allowNull: true });
    await addColumnIfMissing('dispute_requested_at', { type: Sequelize.DATE, allowNull: true });
    await addColumnIfMissing('dispute_resolved_at', { type: Sequelize.DATE, allowNull: true });
    await addColumnIfMissing('dispute_resolution_note', { type: Sequelize.TEXT, allowNull: true });
  },

  down: async (queryInterface) => {
    const tableName = 'orders';

    const removeColumnIfExists = async (columnName) => {
      const [column] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM \`${tableName}\` LIKE '${columnName}'`
      );
      if (column.length) {
        await queryInterface.removeColumn(tableName, columnName);
      }
    };

    await removeColumnIfExists('dispute_resolution_note');
    await removeColumnIfExists('dispute_resolved_at');
    await removeColumnIfExists('dispute_requested_at');
    await removeColumnIfExists('dispute_reason');
    await removeColumnIfExists('dispute_status');
  },
};
