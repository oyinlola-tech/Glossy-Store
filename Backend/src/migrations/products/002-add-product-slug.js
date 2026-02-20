const { slugify } = require('../../utils/slug');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'products';

    const [slugColumn] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'slug'`
    );
    if (!slugColumn.length) {
      await queryInterface.addColumn(tableName, 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    const [products] = await queryInterface.sequelize.query(
      `SELECT id, name FROM \`${tableName}\` ORDER BY id ASC`
    );
    const used = new Set();
    for (const product of products) {
      const base = slugify(product.name);
      let candidate = base;
      let index = 2;
      while (used.has(candidate)) {
        candidate = `${base}-${index}`;
        index += 1;
      }
      used.add(candidate);
      await queryInterface.sequelize.query(
        `UPDATE \`${tableName}\` SET slug = :slug WHERE id = :id`,
        {
          replacements: { slug: candidate, id: product.id },
        }
      );
    }

    await queryInterface.changeColumn(tableName, 'slug', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface) => {
    const tableName = 'products';
    const [slugColumn] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'slug'`
    );
    if (slugColumn.length) {
      await queryInterface.removeColumn(tableName, 'slug');
    }
  },
};
