module.exports = {
  async up(queryInterface, Sequelize) {
    // 創建筆記表
    await queryInterface.createTable('Notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      format: {
        type: Sequelize.ENUM('richtext', 'markdown'),
        defaultValue: 'richtext'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 創建標籤表
    await queryInterface.createTable('Tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 創建筆記標籤關聯表
    await queryInterface.createTable('NoteTags', {
      noteId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Notes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NoteTags');
    await queryInterface.dropTable('Tags');
    await queryInterface.dropTable('Notes');
  }
}; 