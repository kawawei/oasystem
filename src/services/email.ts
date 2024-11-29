// 郵件服務
export class EmailService {
  private static instance: EmailService

  private constructor() {
    // 私有構造函數
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // 發送任務分配通知
  public async sendTaskAssignment(task: any, assignee: any): Promise<void> {
    // TODO: 實際的郵件發送邏輯
    console.log('發送任務分配郵件', {
      to: assignee.email,
      subject: `新任務分配：${task.title}`,
      content: `
        您被分配了新的任務：
        標題：${task.title}
        開始時間：${task.startDate}
        結束時間：${task.endDate}
        請登錄系統查看詳情。
      `
    })
  }

  // 發送任務提醒
  public async sendTaskReminder(task: any, stage: any): Promise<void> {
    // TODO: 實際的郵件發送邏輯
    console.log('發送任務提醒郵件', {
      to: stage.assignee.map((id: number) => `user${id}@example.com`),
      subject: `任務提醒：${task.title}`,
      content: `
        任務「${task.title}」的「${stage.name}」階段即將開始/結束：
        開始時間：${stage.startDate}
        結束時間：${stage.endDate}
        當前進度：${stage.progress}%
        請及時處理。
      `
    })
  }

  // 發送任務更新通知
  public async sendTaskUpdate(task: any, updateType: string): Promise<void> {
    // TODO: 實際的郵件發送邏輯
    console.log('發送任務更新郵件', {
      to: this.getAllTaskMembers(task),
      subject: `任務更新：${task.title}`,
      content: `
        任務「${task.title}」有新的更新：
        更新類型：${updateType}
        更新時間：${new Date().toLocaleString()}
        請登錄系統查看詳情。
      `
    })
  }

  // 獲取任務所有相關人員的郵箱
  private getAllTaskMembers(task: any): string[] {
    const members = new Set<number>()
    
    // 添加所有階段的負責人
    task.stages.forEach((stage: any) => {
      stage.assignee.forEach((id: number) => members.add(id))
    })
    
    // 添加任務創建者
    members.add(task.createdBy)
    
    // 轉換為郵箱地址（示例）
    return Array.from(members).map(id => `user${id}@example.com`)
  }
}

// 導出單例實例
export const emailService = EmailService.getInstance() 