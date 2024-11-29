// 本地存儲服務
export class StorageService {
  private static instance: StorageService
  private readonly prefix: string = 'oa_'

  private constructor() {
    // 私有構造函數
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // 保存數據
  public set(key: string, value: any): void {
    const storageKey = this.getKey(key)
    try {
      const data = JSON.stringify({
        value,
        timestamp: new Date().getTime()
      })
      localStorage.setItem(storageKey, data)
    } catch (error) {
      console.error('Storage save error:', error)
    }
  }

  // 獲取數據
  public get<T>(key: string, defaultValue: T | null = null): T | null {
    const storageKey = this.getKey(key)
    try {
      const data = localStorage.getItem(storageKey)
      if (!data) return defaultValue

      const { value } = JSON.parse(data)
      return value as T
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }

  // 刪除數據
  public remove(key: string): void {
    const storageKey = this.getKey(key)
    localStorage.removeItem(storageKey)
  }

  // 清除所有數據
  public clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  // 獲取完整的存儲鍵名
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }
}

// 導出單例實例
export const storageService = StorageService.getInstance() 