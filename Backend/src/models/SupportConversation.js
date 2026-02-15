const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportConversation = sequelize.define('SupportConversation', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guest_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guest_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guest_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SupportConversation;
