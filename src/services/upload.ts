// 文件上傳服務
export class UploadService {
  private static instance: UploadService

  private constructor() {}

  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }

  // 上傳圖片
  async uploadImage(file: File): Promise<string> {
    // TODO: 實際的圖片上傳邏輯
    // 這裡先用 Base64 模擬
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 上傳文件
  async uploadFile(file: File): Promise<{
    url: string
    name: string
    size: number
  }> {
    // TODO: 實際的文件上傳邏輯
    // 這裡先用模擬數據
    return {
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }
  }

  // 驗證文件
  validateFile(file: File, options: {
    maxSize?: number
    allowedTypes?: string[]
  } = {}) {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options

    if (file.size > maxSize) {
      throw new Error(`文件大小不能超過 ${maxSize / 1024 / 1024}MB`)
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error('不支持的文件類型')
    }

    return true
  }
}

export const uploadService = UploadService.getInstance() 