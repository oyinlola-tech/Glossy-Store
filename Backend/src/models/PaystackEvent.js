const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaystackEvent = sequelize.define('PaystackEvent', {
  event: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(8),
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  occurred_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = PaystackEvent;
