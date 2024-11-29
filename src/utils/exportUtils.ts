import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

// 匯出格式類型
type ExportFormat = 'json' | 'excel' | 'csv'

// 匯出工具類
export class ExportUtils {
  // 匯出任務數據
  static async exportTasks(tasks: Task[], format: ExportFormat = 'json', filename?: string) {
    switch (format) {
      case 'json':
        return this.exportAsJson(tasks, filename)
      case 'excel':
        return this.exportAsExcel(tasks, filename)
      case 'csv':
        return this.exportAsCsv(tasks, filename)
      default:
        throw new Error('不支持的匯出格式')
    }
  }

  // 匯出為 JSON
  private static exportAsJson(tasks: Task[], filename = 'tasks.json') {
    const data = JSON.stringify(tasks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    saveAs(blob, filename)
  }

  // 匯出為 Excel
  private static async exportAsExcel(tasks: Task[], filename = 'tasks.xlsx') {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('任務列表')

    // 設置表頭
    worksheet.columns = [
      { header: '任務ID', key: 'id', width: 10 },
      { header: '標題', key: 'title', width: 30 },
      { header: '描述', key: 'description', width: 40 },
      { header: '狀態', key: 'status', width: 15 },
      { header: '優先級', key: 'priority', width: 15 },
      { header: '開始日期', key: 'startDate', width: 15 },
      { header: '結束日期', key: 'endDate', width: 15 },
      { header: '進度', key: 'progress', width: 10 },
      { header: '創建時間', key: 'createdAt', width: 20 },
      { header: '更新時間', key: 'updatedAt', width: 20 }
    ]

    // 添加數據
    tasks.forEach(task => {
      worksheet.addRow({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: `${task.progress}%`,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      })
    })

    // 生成 buffer
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  // 匯出為 CSV
  private static exportAsCsv(tasks: Task[], filename = 'tasks.csv') {
    const csvRows = tasks.map(task => [
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.startDate,
      task.endDate,
      task.progress + '%',
      task.createdAt,
      task.updatedAt
    ])

    const headers = ['ID', '標題', '描述', '狀態', '優先級', '開始日期', '結束日期', '進度', '創建時間', '更新時間']
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, filename)
  }

  // 匯入任務數據
  static async importTasks(file: File): Promise<Task[]> {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'json':
        return this.importFromJson(file)
      case 'xlsx':
        return this.importFromExcel(file)
      case 'csv':
        return this.importFromCsv(file)
      default:
        throw new Error('不支持的文件格式')
    }
  }

  // 從 JSON 匯入
  private static async importFromJson(file: File): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const tasks = JSON.parse(e.target?.result as string)
          resolve(tasks)
        } catch (error) {
          reject(new Error('JSON 解析失敗'))
        }
      }
      reader.onerror = () => reject(new Error('文件讀取失敗'))
      reader.readAsText(file)
    })
  }

  // 從 Excel 匯入
  private static async importFromExcel(file: File): Promise<Task[]> {
    const workbook = new ExcelJS.Workbook()
    const arrayBuffer = await file.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)
    
    const worksheet = workbook.getWorksheet(1)
    if (!worksheet) {
      throw new Error('Excel 文件格式錯誤：找不到工作表')
    }

    const tasks: Task[] = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // 跳過表頭

      const task: Task = {
        id: row.getCell(1).value as number,
        title: row.getCell(2).value as string,
        description: row.getCell(3).value as string,
        status: row.getCell(4).value as TaskStatus,
        priority: row.getCell(5).value as TaskPriority,
        startDate: row.getCell(6).value as string,
        endDate: row.getCell(7).value as string,
        progress: parseInt(row.getCell(8).value as string),
        createdBy: 1,
        createdAt: row.getCell(9).value as string,
        updatedAt: row.getCell(10).value as string,
        stages: []
      }

      tasks.push(task)
    })

    return tasks
  }

  // 從 CSV 匯入
  private static async importFromCsv(file: File): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const rows = text.split('\n').map(row => row.split(','))
          
          const tasks = rows.slice(1).map(row => ({
            id: parseInt(row[0]),
            title: row[1],
            description: row[2],
            status: row[3] as TaskStatus,
            priority: row[4] as TaskPriority,
            startDate: row[5],
            endDate: row[6],
            progress: parseInt(row[7]),
            createdBy: 1,
            createdAt: row[8],
            updatedAt: row[9],
            stages: []
          }))
          
          resolve(tasks)
        } catch (error) {
          reject(new Error('CSV 解析失敗'))
        }
      }
      reader.onerror = () => reject(new Error('文件讀取失敗'))
      reader.readAsText(file)
    })
  }
} 