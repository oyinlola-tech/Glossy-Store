const { Cart, CartItem, ProductVariant, Product, ProductImage, ProductColor, ProductSize } = require('../models');
const {
  cartItemIdParamSchema,
  addToCartSchema,
  updateCartItemSchema,
} = require('../validations/cartValidation');

const validateBody = (schema, body) => schema.validate(body, { abortEarly: true, stripUnknown: true });
const validateParams = (schema, params) => schema.validate(params, { abortEarly: true, convert: true, stripUnknown: true });

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        include: [{
          model: ProductVariant,
          include: [
            { model: Product, include: [{ model: ProductImage }] },
            { model: ProductColor },
            { model: ProductSize },
          ],
        }],
      }],
    });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { error, value } = validateBody(addToCartSchema, req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { productVariantId, productId, quantity, note } = value;
    const noteValue = note ? String(note).trim() : null;
    const parsedQuantity = Number(quantity);
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    let variant = null;
    if (productVariantId) {
      variant = await ProductVariant.findByPk(productVariantId);
    } else if (productId) {
      variant = await ProductVariant.findOne({
        where: { product_id: productId },
        order: [['stock', 'DESC'], ['id', 'ASC']],
      });

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (!variant) {
        variant = await ProductVariant.create({
          product_id: product.id,
          stock: Number(product.stock || 0),
          price_adjustment: 0,
          color_id: null,
          size_id: null,
          image_id: null,
        });
      } else if (Number(variant.stock) <= 0 && Number(product.stock || 0) > 0) {
        variant.stock = Number(product.stock || 0);
        await variant.save();
      }
    }

    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }
    if (Number(variant.stock) <= 0) {
      return res.status(409).json({ error: 'This product is out of stock' });
    }

    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cart_id: cart.id, product_variant_id: variant.id },
      defaults: { quantity: parsedQuantity, note: noteValue },
    });
    if (!created) {
      if (Number(cartItem.quantity) + parsedQuantity > Number(variant.stock)) {
        return res.status(409).json({ error: `Only ${variant.stock} units available` });
      }
      cartItem.quantity += parsedQuantity;
      if (noteValue) {
        cartItem.note = noteValue;
      }
      await cartItem.save();
    } else if (parsedQuantity > Number(variant.stock)) {
      await cartItem.destroy();
      return res.status(409).json({ error: `Only ${variant.stock} units available` });
    }
    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const paramValidation = validateParams(cartItemIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const bodyValidation = validateBody(updateCartItemSchema, req.body);
    if (bodyValidation.error) return res.status(400).json({ error: bodyValidation.error.details[0].message });
    const { quantity, note } = bodyValidation.value;
    const noteValue = note ? String(note).trim() : null;
    const cartItem = await CartItem.findOne({
      where: { id: paramValidation.value.itemId },
      include: [{ model: Cart, where: { user_id: req.user.id } }],
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    const variant = await ProductVariant.findByPk(cartItem.product_variant_id);
    if (!variant) return res.status(404).json({ error: 'Product variant not found' });
    if (Number(quantity) > Number(variant.stock)) {
      return res.status(409).json({ error: `Only ${variant.stock} units available` });
    }

    cartItem.quantity = Number(quantity);
    if (noteValue !== null) {
      cartItem.note = noteValue;
    }
    await cartItem.save();
    res.json(cartItem);
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const paramValidation = validateParams(cartItemIdParamSchema, req.params);
    if (paramValidation.error) return res.status(400).json({ error: paramValidation.error.details[0].message });
    const cartItem = await CartItem.findOne({
      where: { id: paramValidation.value.itemId },
      include: [{ model: Cart, where: { user_id: req.user.id } }],
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    await cartItem.destroy();
    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
};
