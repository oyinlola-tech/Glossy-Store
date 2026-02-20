const { Op } = require('sequelize');
const { Product } = require('../models');
const { slugify } = require('../utils/slug');

const buildUniqueProductSlug = async (name, excludeProductId = null) => {
  const baseSlug = slugify(name);
  const where = {
    slug: {
      [Op.like]: `${baseSlug}%`,
    },
  };

  if (excludeProductId) {
    where.id = { [Op.ne]: Number(excludeProductId) };
  }

  const rows = await Product.findAll({
    where,
    attributes: ['slug'],
  });
  const existing = new Set(rows.map((row) => String(row.slug)));
  if (!existing.has(baseSlug)) return baseSlug;

  let index = 2;
  while (existing.has(`${baseSlug}-${index}`)) {
    index += 1;
  }
  return `${baseSlug}-${index}`;
};

module.exports = { buildUniqueProductSlug };
