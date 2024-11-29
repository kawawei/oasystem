import { defineStore } from 'pinia'
import { ref } from 'vue'

interface EmailTemplate {
  id: number
  name: string
  subject: string
  content: string
  isDefault: boolean
}

interface EmailConfig {
  id: number
  email: string
  name: string
  isDefault: boolean
}

interface EmailLog {
  id: number
  templateId: number
  configId: number
  customerId: number
  customerName: string
  subject: string
  content: string
  status: 'success' | 'failed'
  sendTime: string
  error?: string
}

export const useEmailStore = defineStore('email', () => {
  // 郵件模板列表
  const templates = ref<EmailTemplate[]>([
    {
      id: 1,
      name: '初次聯繫模板',
      subject: '{{customerName}}，感謝您的關注',
      content: `親愛的 {{customerName}}：

您好！感謝您對我們的關注。

我們是專業的教育機構，提供...

期待與您進一步溝通！

祝 順心
[公司名稱]`,
      isDefault: true
    }
  ])

  // 郵件配置列表
  const configs = ref<EmailConfig[]>([
    {
      id: 1,
      email: 'service@example.com',
      name: '客服部',
      isDefault: true
    }
  ])

  // 郵件發送記錄
  const logs = ref<EmailLog[]>([])

  // 添加模板
  const addTemplate = (template: Omit<EmailTemplate, 'id'>) => {
    const newId = Math.max(...templates.value.map(t => t.id)) + 1
    templates.value.push({ ...template, id: newId })
  }

  // 更新模板
  const updateTemplate = (id: number, template: Partial<EmailTemplate>) => {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templates.value[index] = { ...templates.value[index], ...template }
    }
  }

  // 刪除模板
  const deleteTemplate = (id: number) => {
    templates.value = templates.value.filter(t => t.id !== id)
  }

  // 添加配置
  const addConfig = (config: Omit<EmailConfig, 'id'>) => {
    const newId = Math.max(...configs.value.map(c => c.id)) + 1
    configs.value.push({ ...config, id: newId })
  }

  // 更新配置
  const updateConfig = (id: number, config: Partial<EmailConfig>) => {
    const index = configs.value.findIndex(c => c.id === id)
    if (index !== -1) {
      configs.value[index] = { ...configs.value[index], ...config }
    }
  }

  // 刪除配置
  const deleteConfig = (id: number) => {
    configs.value = configs.value.filter(c => c.id !== id)
  }

  // 添加發送記錄
  const addLog = (log: Omit<EmailLog, 'id'>) => {
    const newId = Math.max(...logs.value.map(l => l.id), 0) + 1
    logs.value.push({ ...log, id: newId })
  }

  // 獲取默認模板
  const getDefaultTemplate = () => {
    return templates.value.find(t => t.isDefault)
  }

  // 獲取默認配置
  const getDefaultConfig = () => {
    return configs.value.find(c => c.isDefault)
  }

  return {
    templates,
    configs,
    logs,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addConfig,
    updateConfig,
    deleteConfig,
    addLog,
    getDefaultTemplate,
    getDefaultConfig
  }
}) 