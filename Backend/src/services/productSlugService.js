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

const ensureProductSlug = async (product, transaction = undefined) => {
  if (!product) return null;
  if (product.slug && String(product.slug).trim()) return String(product.slug).trim();

  const slug = await buildUniqueProductSlug(product.name, product.id);
  await product.update({ slug }, { transaction });
  return slug;
};

const ensureAllProductSlugs = async () => {
  const products = await Product.findAll({
    where: {
      [Op.or]: [
        { slug: null },
        { slug: '' },
      ],
    },
    attributes: ['id', 'name', 'slug'],
    order: [['id', 'ASC']],
  });

  if (!products.length) {
    return { updated: 0 };
  }

  let updated = 0;
  for (const product of products) {
    await ensureProductSlug(product);
    updated += 1;
  }

  return { updated };
};

module.exports = {
  buildUniqueProductSlug,
  ensureProductSlug,
  ensureAllProductSlugs,
};
