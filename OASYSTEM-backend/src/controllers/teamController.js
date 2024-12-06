const { Team, User, TeamMember } = require('../models');

const teamController = {
  // 獲取所有團隊
  getAllTeams: async (req, res) => {
    try {
      const teams = await Team.findAll({
        include: [
          {
            model: User,
            as: 'members',
            through: { attributes: ['role'] }
          },
          {
            model: User,
            as: 'creatorUser',
            attributes: ['id', 'username', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // 格式化數據
      const formattedTeams = teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        creator: team.creator,
        createdAt: team.createdAt,
        members: team.members.map(member => ({
          id: member.id,
          username: member.username,
          email: member.email,
          role: member.TeamMember.role
        })),
        tasks: [] // 如果需要任務數據，也可以在這裡加入
      }));

      res.json(formattedTeams);
    } catch (error) {
      console.error('獲取團隊失敗:', error);
      res.status(500).json({ message: '獲取團隊失敗', error: error.message });
    }
  },

  // 創建團隊
  createTeam: async (req, res) => {
    try {
      const { name, description, members } = req.body;
      const team = await Team.create({
        name,
        description,
        creator: req.user.id
      });

      // 添加創建者為團隊領導
      await TeamMember.create({
        teamId: team.id,
        userId: req.user.id,
        role: 'leader'
      });

      // 添加其他成員
      if (members && members.length > 0) {
        const memberRecords = members.map(userId => ({
          teamId: team.id,
          userId,
          role: 'member'
        }));
        await TeamMember.bulkCreate(memberRecords);
      }

      // 獲取完整的團隊信息（包括成員）
      const createdTeam = await Team.findOne({
        where: { id: team.id },
        include: [
          {
            model: User,
            as: 'members',
            through: { attributes: ['role'] }
          },
          {
            model: User,
            as: 'creatorUser',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      // 格式化返回數據，保持與 getAllTeams 一致的格式
      const formattedTeam = {
        id: createdTeam.id,
        name: createdTeam.name,
        description: createdTeam.description,
        creator: createdTeam.creator,
        createdAt: createdTeam.createdAt,
        members: createdTeam.members.map(member => ({
          id: member.id,
          username: member.username,
          email: member.email,
          role: member.TeamMember.role
        })),
        tasks: []
      };

      res.status(201).json(formattedTeam);
    } catch (error) {
      console.error('創建團隊失敗:', error);
      res.status(500).json({ message: '創建團隊失敗', error: error.message });
    }
  },

  // 獲取特定團隊
  getTeam: async (req, res) => {
    try {
      const team = await Team.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'members',
            through: { attributes: ['role'] }
          },
          {
            model: User,
            as: 'creatorUser'
          }
        ]
      });

      if (!team) {
        return res.status(404).json({ message: '團隊不存在' });
      }

      res.json(team);
    } catch (error) {
      console.error('獲取團隊失敗:', error);
      res.status(500).json({ message: '獲取團隊失敗', error: error.message });
    }
  },

  // 更新團隊
  updateTeam: async (req, res) => {
    try {
      const team = await Team.findOne({
        where: {
          id: req.params.id,
          creator: req.user.id
        }
      });

      if (!team) {
        return res.status(404).json({ message: '團隊不存在或無權限' });
      }

      await team.update(req.body);
      res.json(team);
    } catch (error) {
      console.error('更新團隊失敗:', error);
      res.status(500).json({ message: '更新團隊失敗', error: error.message });
    }
  },

  // 刪除團隊
  deleteTeam: async (req, res) => {
    try {
      const result = await Team.destroy({
        where: {
          id: req.params.id,
          creator: req.user.id
        }
      });

      if (!result) {
        return res.status(404).json({ message: '團隊不存在或無權限' });
      }

      res.json({ message: '團隊已刪除' });
    } catch (error) {
      console.error('刪除團隊失敗:', error);
      res.status(500).json({ message: '刪除團隊失敗', error: error.message });
    }
  },

  // 添加團隊成員
  addMember: async (req, res) => {
    try {
      const { userId, role = 'member' } = req.body;
      const teamMember = await TeamMember.create({
        teamId: req.params.id,
        userId,
        role
      });
      res.status(201).json(teamMember);
    } catch (error) {
      console.error('添加成員失敗:', error);
      res.status(500).json({ message: '添加成員失敗', error: error.message });
    }
  },

  // 移除團隊成員
  removeMember: async (req, res) => {
    try {
      const result = await TeamMember.destroy({
        where: {
          teamId: req.params.id,
          userId: req.params.userId
        }
      });

      if (!result) {
        return res.status(404).json({ message: '成員不存在' });
      }

      res.json({ message: '成員已移除' });
    } catch (error) {
      console.error('移除成員失敗:', error);
      res.status(500).json({ message: '移除成員失敗', error: error.message });
    }
  }
};

module.exports = teamController; 