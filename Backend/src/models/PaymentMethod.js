const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider: {
    type: DataTypes.ENUM('squad'),
    allowNull: false,
    defaultValue: 'squad',
  },
  type: {
    type: DataTypes.ENUM('card'),
    allowNull: false,
    defaultValue: 'card',
  },
  brand: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  last4: {
    type: DataTypes.STRING(4),
    allowNull: true,
  },
  exp_month: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  exp_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  token_encrypted: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  token_fingerprint: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = PaymentMethod;
