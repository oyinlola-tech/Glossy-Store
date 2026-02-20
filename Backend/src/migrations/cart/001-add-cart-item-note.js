module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'cart_items';
    const [rows] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'note'`
    );
    if (rows.length > 0) return;
    await queryInterface.addColumn(tableName, 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
