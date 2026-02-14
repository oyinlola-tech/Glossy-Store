const { Category } = require('../models');

const toTree = (categories) => {
  const byId = new Map();
  const roots = [];

  categories.forEach((category) => {
    byId.set(category.id, { ...category.toJSON(), subcategories: [] });
  });

  byId.forEach((category) => {
    if (category.parent_id && byId.has(category.parent_id)) {
      byId.get(category.parent_id).subcategories.push(category);
    } else {
      roots.push(category);
    }
  });

  return roots;
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });

    const includeTree = String(req.query.tree || 'true').toLowerCase() !== 'false';
    if (includeTree) {
      return res.json({ categories: toTree(categories) });
    }

    return res.json({ categories });
  } catch (err) {
    return next(err);
  }
};
