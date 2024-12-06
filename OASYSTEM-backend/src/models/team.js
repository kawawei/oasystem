module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creator: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'Teams',
    timestamps: true
  });

  Team.associate = (models) => {
    Team.belongsTo(models.User, {
      foreignKey: 'creator',
      as: 'creatorUser'
    });

    Team.belongsToMany(models.User, {
      through: {
        model: models.TeamMember,
        unique: false
      },
      foreignKey: 'teamId',
      otherKey: 'userId',
      as: 'members'
    });

    Team.hasMany(models.Task, {
      foreignKey: 'teamId',
      as: 'tasks'
    });
  };

  return Team;
}; 