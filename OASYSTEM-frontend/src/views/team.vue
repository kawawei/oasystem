<template>
  <div class="team-container">
    <!-- 頁面標題 -->
    <div class="page-header glass-light">
      <h2><i class="fas fa-users"></i> 團隊管理</h2>
      <!-- 重新設計的創建按鈕 -->
      <el-button 
        class="create-team-btn glass-button" 
        @click="showCreateTeamDialog">
        <span class="btn-content">
          <i class="fas fa-plus-circle"></i>
          <span>創建團隊</span>
        </span>
      </el-button>
    </div>

    <!-- 團隊管理卡片 -->
    <el-card class="team-card glass">
      <!-- 團隊列表和切換 -->
      <el-tabs v-model="activeTeam" @tab-click="handleTeamChange" class="custom-tabs">
        <el-tab-pane 
          v-for="team in teams" 
          :key="team.id" 
          :label="team.name.length > 4 ? team.name.slice(0, 4) + '...' : team.name"
          :name="team.id.toString()"
          :aria-label="team.name">
          <!-- 團隊信息卡片 -->
          <div class="team-info glass-light">
            <div class="team-header">
              <div class="team-title">
                <i class="fas fa-users-cog"></i>
                <h3>{{ team.name }}</h3>
                <el-tag v-if="team.creator === currentUserId" size="small" type="success">
                  <i class="fas fa-crown" style="color: #FFD700; margin-right: 4px; font-size: 12px;"></i>
                  創建者
                </el-tag>
              </div>
              <el-button type="success" size="small" @click="showAddMemberDialog(team.id)">
                <i class="fas fa-user-plus"></i> 添加成員
              </el-button>
            </div>
            
            <!-- 團隊統計信息 -->
            <div class="team-stats">
              <div class="stat-item">
                <i class="fas fa-users"></i>
                <span>{{ team.members.length }} 位成員</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-tasks"></i>
                <span>{{ team.tasks?.length || 0 }} 個任務</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-calendar-alt"></i>
                <span>創建於 {{ formatDate(team.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 團隊成員列表 -->
          <div class="team-members">
            <h4><i class="fas fa-user-friends"></i> 團隊</h4>
            <el-table 
              :data="team.members" 
              style="width: 100%"
              class="custom-table">
              <el-table-column width="60">
                <template #default="scope">
                  <el-avatar :size="40" :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(scope.row.username)}&background=random`"></el-avatar>
                </template>
              </el-table-column>
              <el-table-column prop="username" label="用戶名"></el-table-column>
              <el-table-column prop="email" label="郵箱"></el-table-column>
              <el-table-column prop="role" label="角色" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'" size="small">
                    {{ scope.row.role === 'admin' ? '管理員' : '成員' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Apple 風格的創建團隊對話框 -->
    <el-dialog 
      v-model="createTeamDialogVisible"
      :show-close="false"
      width="460px"
      class="create-team-dialog">
      <div class="dialog-content">
        <!-- 頂部圖標 -->
        <div class="dialog-icon">
          <div class="icon-bg">
            <i class="fas fa-rocket"></i>
          </div>
        </div>

        <!-- 主要內容 -->
        <div class="dialog-body">
          <h3>創建團隊</h3>
          <p class="subtitle">開始一段新的協作之旅</p>

          <el-form 
            :model="newTeam" 
            :rules="teamRules" 
            ref="teamForm"
            :validate-on-rule-change="false">
            <el-form-item prop="name">
              <el-input 
                v-model="newTeam.name" 
                class="team-name-input"
                :placeholder="inputPlaceholder"
                @focus="handleInputFocus"
                @blur="handleInputBlur">
              </el-input>
            </el-form-item>
          </el-form>

          <div class="dialog-footer">
            <button 
              class="cancel-btn" 
              @click="createTeamDialogVisible = false">
              取消
            </button>
            <button 
              class="confirm-btn" 
              @click="createTeam">
              建立團隊
            </button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加成員對話框 -->
    <el-dialog 
      v-model="addMemberDialogVisible"
      width="460px"
      class="add-member-dialog"
      :append-to-body="true"
      :destroy-on-close="true"
      :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="dialog-icon">
          <div class="icon-bg">
            <el-icon><UserFilled /></el-icon>
          </div>
        </div>
        
        <div class="dialog-body">
          <h3>添加成員</h3>
          <p class="subtitle">選擇添加成員的方式</p>
          
          <!-- 添加方式選擇 -->
          <div class="add-method-tabs">
            <div 
              class="method-tab" 
              :class="{ active: addMethod === 'email' }"
              @click="addMethod = 'email'">
              <el-icon><Message /></el-icon>
              <span>郵箱邀請</span>
            </div>
            <div 
              class="method-tab"
              :class="{ active: addMethod === 'qr' }"
              @click="addMethod = 'qr'">
              <el-icon><Promotion /></el-icon>
              <span>QR Code</span>
            </div>
          </div>
          
          <!-- 郵箱邀請表單 -->
          <el-form 
            v-if="addMethod === 'email'"
            :model="newMember" 
            :rules="memberRules" 
            ref="memberForm"
            class="email-form">
            <el-form-item prop="email" class="member-input">
              <el-input 
                v-model="newMember.email" 
                placeholder="請輸入成員郵箱"
                :prefix-icon="Message">
              </el-input>
            </el-form-item>
          </el-form>
          
          <!-- QR Code 顯示區域 -->
          <div v-else class="qr-code-area">
            <div class="qr-wrapper">
              <img :src="teamInviteQRCode" alt="邀請二維碼" />
            </div>
            <p class="qr-tip">掃描二維碼加入團隊</p>
          </div>
          
          <div class="dialog-footer">
            <button class="cancel-btn" @click="addMemberDialogVisible = false">
              取消
            </button>
            <button 
              v-if="addMethod === 'email'"
              class="confirm-btn" 
              @click="addMember">
              <el-icon><UserFilled /></el-icon>
              發送邀請
            </button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { useStore } from 'vuex'  // 導入 useStore
import { ref, onMounted, watch } from 'vue'  // 導入 ref 和 onMounted
import { Plus, Message, UserFilled, Promotion } from '@element-plus/icons-vue'
import QRCode from 'qrcode'

// 創建一個 axios 實例
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
});

export default {
  name: 'TeamManagement',
  components: {
    Plus,
    Message,
    UserFilled,
    Promotion
  },
  setup() {  // 使用 setup 函數
    const store = useStore()  // 獲取 store 實例
    const activeTeam = ref('')

    const handleTeamChange = (tab) => {
      if (tab && tab.name) {
        store.commit('setCurrentTeam', tab.name)
      }
    }

    return {
      activeTeam,
      handleTeamChange,
      Plus,
      Message,
      UserFilled,
      Promotion
    }
  },
  data() {
    return {
      teams: [],
      createTeamDialogVisible: false,
      addMemberDialogVisible: false,
      currentTeamId: null,
      newTeam: {
        name: ''
      },
      newMember: {
        email: ''
      },
      inputPlaceholder: '輸入團隊名稱',
      isError: false,
      teamRules: {
        name: [
          { required: true, trigger: 'change' }
        ]
      },
      memberRules: {
        email: [
          { required: true, message: '請輸入郵箱地址', trigger: 'blur' },
          { type: 'email', message: '請輸入正確的郵箱地址', trigger: 'blur' },
          { 
            validator: async (rule, value, callback) => {
              if (!value) {
                callback();
                return;
              }
              try {
                // 可以在這裡添加額外的郵箱驗證邏輯
                callback();
              } catch (error) {
                callback(new Error('郵箱驗證失敗'));
              }
            }, 
            trigger: 'blur' 
          }
        ]
      },
      currentUserId: null,
      addMethod: 'email',
      teamInviteQRCode: ''
    }
  },
  methods: {
    async fetchTeams() {
      try {
        console.log('Fetching teams...');
        const response = await api.get('/api/teams', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Teams response:', response.data);
        this.teams = response.data;
      } catch (error) {
        console.error('Error fetching teams:', error);
        this.$message.error('獲取團隊列表失敗');
      }
    },
    showCreateTeamDialog() {
      this.createTeamDialogVisible = true;
      this.newTeam.name = '';
      this.inputPlaceholder = '輸入團隊名稱';
      this.isError = false;
      if (this.$refs.teamForm) {
        this.$refs.teamForm.resetFields();
      }
    },
    showAddMemberDialog(teamId) {
      this.addMemberDialogVisible = true;
      this.currentTeamId = teamId;
      this.newMember.email = '';
      this.addMethod = 'email';
      this.generateQRCode(teamId);
    },
    handleInputFocus() {
      if (this.isError) {
        this.inputPlaceholder = '輸入團隊名稱';
        this.isError = false;
      }
    },
    handleInputBlur() {
      if (!this.newTeam.name.trim() && !this.isError) {
        this.inputPlaceholder = '輸入團隊名';
      }
    },
    async createTeam() {
      try {
        const response = await api.post('/api/teams', this.newTeam, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // 確保新團隊數據格式正確
        const newTeam = {
          ...response.data,
          members: response.data.members || [],
          tasks: response.data.tasks || []
        };
        
        // 更新本地數據
        this.teams = [newTeam, ...this.teams];
        this.activeTeam = String(newTeam.id);
        
        this.createTeamDialogVisible = false;
        this.$message.success('創建團隊功');
      } catch (error) {
        console.error('Error creating team:', error);
        this.$message.error(error.response?.data?.message || '創建團隊失敗');
      }
    },
    async addMember() {
      try {
        await this.$refs.memberForm.validate();
        await api.post('/api/teams/members', {
          teamId: this.currentTeamId,
          email: this.newMember.email
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.addMemberDialogVisible = false;
        this.$message.success('添加成員成功');
        this.fetchTeams();
      } catch (error) {
        console.error('Add member error:', error);
        if (error.response?.data?.errors?.email) {
          this.$message.error(error.response.data.errors.email[0]);
        } else if (error.response?.data?.message) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('添加成員失敗，請稍後重試');
        }
      }
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    },
    async generateQRCode(teamId) {
      try {
        console.log('Generating QR code for team:', teamId);
        const inviteUrl = `${window.location.origin}/join-team/${teamId}`;
        console.log('Invite URL:', inviteUrl);
        this.teamInviteQRCode = await QRCode.toDataURL(inviteUrl);
        console.log('QR code generated successfully');
      } catch (error) {
        console.error('Error generating QR code:', error);
        this.$message.error('生成邀請碼失敗');
      }
    }
  },
  created() {
    console.log('Team component created');
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.currentUserId = user.id;
    }
    this.fetchTeams();
  },
  watch: {
    addMemberDialogVisible(newVal) {
      console.log('Dialog visibility changed:', newVal);
    }
  }
}
</script>

<style scoped>
.team-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  border-radius: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
}

.team-info {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.team-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-title i {
  font-size: 24px;
  color: #409EFF;
}

.team-title h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.team-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.stat-item i {
  color: #409EFF;
}

.team-members {
  margin-top: 24px;
}

.team-members h4 {
  margin-bottom: 16px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header) {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 毛璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

/* 自定義話框樣式 */
:deep(.custom-dialog .el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.custom-dialog .el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.custom-dialog .el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}

/* 添加新的樣式 */
.create-team-btn {
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  color: white;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);
}

.create-team-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 199, 89, 0.3);
}

.create-team-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.2);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-content i {
  font-size: 1.2rem;
}

/* 更新對話框樣式 */
.create-team-dialog :deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.create-team-dialog :deep(.el-dialog) {
  background: transparent !important;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: none;
  padding: 0;
  margin: 0 !important;
}

.create-team-dialog :deep(.el-dialog__header),
.create-team-dialog :deep(.el-dialog__body) {
  padding: 0;
  margin: 0;
  background: transparent;
}

.dialog-content {
  background: linear-gradient(135deg, #2B3A67, #5C258D);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.dialog-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.icon-bg {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #4CAF50, #45B649);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.icon-bg i {
  font-size: 36px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dialog-body h3 {
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 8px 0 32px;
}

.team-name-input {
  margin-bottom: 40px;
}

.team-name-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none !important;
  border-radius: 12px;
  height: 52px;
  transition: all 0.3s ease;
}

.team-name-input :deep(.el-input__wrapper.is-error) {
  border-color: rgba(255, 59, 48, 0.4);
  background: rgba(255, 59, 48, 0.15);
}

.team-name-input :deep(.el-input__inner) {
  height: 52px;
  font-size: 16px;
  color: white;
  padding: 0 20px;
}

.team-name-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.team-name-input.is-error :deep(.el-input__inner::placeholder) {
  color: rgba(255, 59, 48, 0.8);
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.cancel-btn, .confirm-btn {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.confirm-btn {
  background: #4CAF50;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.confirm-btn:hover {
  background: #45B649;
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
}

/* 更新動畫效果 */
.create-team-dialog :deep(.el-dialog) {
  transform: scale(0.95);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.create-team-dialog :deep(.el-dialog.dialog-fade-enter-active) {
  transform: scale(1);
  opacity: 1;
}

/* 除錯���提示關樣式 */
.team-name-input :deep(.el-form-item__error) {
  display: none;
}

.team-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-title .el-tag {
  margin-left: 8px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

/* 自定義籤樣式 */
.custom-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.custom-tabs :deep(.el-tabs__nav) {
  border: none !important;
}

.custom-tabs :deep(.el-tabs__item) {
  height: 32px;
  line-height: 32px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  border: none;
  margin: 4px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 80px;
  max-width: 160px;
  text-align: center;
}

.custom-tabs :deep(.el-tabs__item:hover) {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.08);
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: white;
  background: linear-gradient(135deg, #409EFF, #36D1DC);
  font-weight: 600;  /* 活動標籤更粗 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 移除底部線條 */
.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

/* 移除默認的藍色條 */
.custom-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

/* 標籤內容區域樣式 */
.custom-tabs :deep(.el-tabs__content) {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

/* 標籤文字樣式 */
.custom-tabs :deep(.el-tabs__item span) {
  display: inline-block;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  letter-spacing: 0.5px;
}

/* 可選：添加懸停時顯示完整名稱提示 */
.custom-tabs :deep(.el-tabs__item) {
  position: relative;
}

.custom-tabs :deep(.el-tabs__item:hover)::after {
  content: attr(aria-label);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

/* 添加成員按鈕樣 */
.team-header :deep(.el-button) {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border: none;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-header :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 199, 89, 0.3);
}

.team-header :deep(.el-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.2);
}

.team-header :deep(.el-button i) {
  font-size: 16px;
  margin-right: 4px;
}

/* 創建者標籤樣式 */
.team-title :deep(.el-tag) {
  height: 32px;  /* 再增加一點高度 */
  line-height: 32px;
  padding: 0 16px;  /* 增加內邊距 */
  font-size: 15px;  /* 增加字體大小 */
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  color: white;
  border-radius: 10px;  /* 增加圓 */
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;  /* 增加間距 */
}

/* 懸浮效果 */
.team-title :deep(.el-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(52, 199, 89, 0.3);
}

/* 添加成員對話框樣式 */
.add-member-dialog :deep(.el-dialog) {
  background: transparent !important;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: none;
  padding: 0;
  margin: 0 !important;
}

.add-member-dialog :deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.add-member-dialog :deep(.el-dialog__header) {
  display: none;
}

.add-member-dialog :deep(.el-dialog__body) {
  padding: 0;
  margin: 0;
}

.add-member-dialog .dialog-content {
  background: linear-gradient(135deg, #2B3A67, #5C258D);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.add-member-dialog .dialog-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.add-member-dialog .icon-bg {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #409EFF, #36D1DC);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(64, 158, 255, 0.2);
}

.add-member-dialog .icon-bg i {
  font-size: 32px;
  color: white;
}

.add-member-dialog h3 {
  font-size: 24px;
  text-align: center;
  margin: 0;
  color: white;
}

.add-member-dialog .subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0 24px;
}

.add-member-dialog .member-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none !important;
  border-radius: 12px;
  height: 52px;
}

.add-member-dialog .member-input :deep(.el-input__inner) {
  color: white;
  height: 52px;
  font-size: 16px;
  padding: 0 20px;
}

.add-member-dialog .member-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.add-member-dialog .member-input :deep(.el-input__prefix-inner i) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.add-member-dialog .dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.add-member-dialog .cancel-btn, .add-member-dialog .confirm-btn {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-member-dialog .cancel-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.add-member-dialog .cancel-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.add-member-dialog .confirm-btn {
  background: #4CAF50;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.add-member-dialog .confirm-btn:hover {
  background: #45B649;
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
}

/* 更新動畫效果 */
.add-member-dialog :deep(.el-dialog) {
  transform: scale(0.95);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.add-member-dialog :deep(.el-dialog.dialog-fade-enter-active) {
  transform: scale(1);
  opacity: 1;
}

/* 除錯誤提示相關樣式 */
.add-member-dialog .member-input :deep(.el-form-item__error) {
  display: none;
}

/* 添加方式選擇樣式 */
.add-method-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.method-tab {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.method-tab:hover {
  background: rgba(255, 255, 255, 0.15);
}

.method-tab.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* QR Code 區域 */
.qr-code-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.qr-wrapper {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.qr-wrapper img {
  width: 200px;
  height: 200px;
  display: block;
}

.qr-tip {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 16px;
  font-size: 14px;
}
</style>
