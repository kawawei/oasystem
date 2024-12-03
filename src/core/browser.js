// 瀏覽器核心功能
export class BrowserCore {
  constructor() {
    this.extensions = new Map()
    this.apis = {
      storage: new StorageAPI(),
      tabs: new TabsAPI(),
      auth: new AuthAPI()
    }
  }

  // 註冊擴展
  registerExtension(id, manifest) {
    // 驗證擴展
    // 初始化擴展
    // 分配權限
  }

  // 提供 API 接口
  getAPI(name) {
    return this.apis[name]
  }
} 