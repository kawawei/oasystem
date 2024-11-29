import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Status {
  id: number
  name: string
  color: string
}

interface Area {
  id: number
  cityId: number
  name: string
  salesId?: number  // 負責業務的ID
}

interface City {
  id: number
  name: string
}

interface SalesPerson {
  id: number
  name: string
}

export const useSettingsStore = defineStore('settings', () => {
  // 客戶狀態列表
  const statusList = ref<Status[]>([
    { id: 1, name: '未聯繫', color: '#909399' },
    { id: 2, name: '已聯繫', color: '#409EFF' },
    { id: 3, name: '有意願', color: '#67C23A' },
    { id: 4, name: '待跟進', color: '#E6A23C' },
    { id: 5, name: '無意願', color: '#F56C6C' }
  ])

  // 城市列表
  const cityList = ref<City[]>([
    { id: 1, name: '台北市' },
    { id: 2, name: '新北市' }
  ])

  // 區域列表
  const areaList = ref<Area[]>([
    { id: 1, cityId: 1, name: '信義區', salesId: 1 },
    { id: 2, cityId: 1, name: '大安區', salesId: 2 },
    { id: 3, cityId: 2, name: '板橋區', salesId: 1 },
    { id: 4, cityId: 2, name: '中和區', salesId: 2 }
  ])

  // 業務人員列表
  const salesList = ref<SalesPerson[]>([
    { id: 1, name: '張三' },
    { id: 2, name: '李四' }
  ])

  // 添加狀態
  const addStatus = (name: string, color: string) => {
    const newId = Math.max(...statusList.value.map(s => s.id)) + 1
    statusList.value.push({ id: newId, name, color })
  }

  // 更新狀態
  const updateStatus = (id: number, name: string, color: string) => {
    const index = statusList.value.findIndex(s => s.id === id)
    if (index !== -1) {
      statusList.value[index] = { id, name, color }
    }
  }

  // 刪除狀態
  const deleteStatus = (id: number) => {
    statusList.value = statusList.value.filter(s => s.id !== id)
  }

  // 添加城市
  const addCity = (name: string) => {
    const newId = Math.max(...cityList.value.map(c => c.id)) + 1
    cityList.value.push({ id: newId, name })
  }

  // 添加區域
  const addArea = (cityId: number, name: string, salesId?: number) => {
    const newId = Math.max(...areaList.value.map(a => a.id)) + 1
    areaList.value.push({ id: newId, cityId, name, salesId })
  }

  // 更新區域業務
  const updateAreaSales = (areaId: number, salesId: number) => {
    const area = areaList.value.find(a => a.id === areaId)
    if (area) {
      area.salesId = salesId
    }
  }

  // 根據城市獲取區域
  const getAreasByCity = (cityId: number) => {
    return areaList.value.filter(a => a.cityId === cityId)
  }

  // 根據區域獲取業務
  const getSalesByArea = (areaId: number) => {
    const area = areaList.value.find(a => a.id === areaId)
    if (area?.salesId) {
      return salesList.value.find(s => s.id === area.salesId)
    }
    return null
  }

  return {
    statusList,
    cityList,
    areaList,
    salesList,
    addStatus,
    updateStatus,
    deleteStatus,
    addCity,
    addArea,
    updateAreaSales,
    getAreasByCity,
    getSalesByArea
  }
}) 