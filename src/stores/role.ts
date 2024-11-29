import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Role {
  id: number
  name: string
  description: string
  users: number
  status: 'active' | 'inactive'
}

export const useRoleStore = defineStore('role', () => {
  // 角色列表
  const roleList = ref<Role[]>([
    {
      id: 1,
      name: '超級管理員',
      description: '系統最高權限角色',
      users: 1,
      status: 'active'
    },
    {
      id: 2,
      name: '部門主管',
      description: '部門管理權限',
      users: 5,
      status: 'active'
    },
    {
      id: 3,
      name: '一般員工',
      description: '基本操作權限',
      users: 20,
      status: 'active'
    }
  ])

  // 添加角色
  const addRole = (role: Omit<Role, 'id'>) => {
    const newRole = {
      ...role,
      id: Math.max(...roleList.value.map(r => r.id)) + 1,
      users: 0
    }
    roleList.value.push(newRole)
  }

  // 更新角色
  const updateRole = (id: number, role: Partial<Role>) => {
    const index = roleList.value.findIndex(r => r.id === id)
    if (index !== -1) {
      roleList.value[index] = { ...roleList.value[index], ...role }
    }
  }

  // 刪除角色
  const deleteRole = (id: number) => {
    const index = roleList.value.findIndex(r => r.id === id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
    }
  }

  return {
    roleList,
    addRole,
    updateRole,
    deleteRole
  }
}) 