module.exports = (sequelize, DataTypes) => {
  const TeamMember = sequelize.define('TeamMember', {
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Teams',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('leader', 'member'),
      defaultValue: 'member'
    }
  }, {
    tableName: 'TeamMembers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['teamId', 'userId']
      }
    ]
  });

  TeamMember.associate = (models) => {
    TeamMember.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });
    TeamMember.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return TeamMember;
}; 