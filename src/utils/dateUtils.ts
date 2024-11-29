export interface DateCell {
  date: string;      // YYYY-MM-DD 格式
  day: number;       // 日期數字
  otherMonth: boolean; // 是否是其他月份的日期
}

export const getMonthDates = (year: number, month: number): DateCell[] => {
  const result: DateCell[] = [];
  
  // 獲取當月第一天
  const firstDay = new Date(year, month - 1, 1);
  // 獲取當月最後一天
  const lastDay = new Date(year, month, 0);
  
  // 計算需要顯示的上個月的天數
  const firstDayWeek = firstDay.getDay();
  const prevMonthDays = firstDayWeek;
  
  // 添加上個月的日期
  if (prevMonthDays > 0) {
    const prevLastDay = new Date(year, month - 1, 0);
    const prevLastDate = prevLastDay.getDate();
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = prevLastDate - i;
      const date = new Date(year, month - 2, day);
      result.push({
        date: date.toISOString().split('T')[0],
        day,
        otherMonth: true
      });
    }
  }
  
  // 添加當月的日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    result.push({
      date: date.toISOString().split('T')[0],
      day,
      otherMonth: false
    });
  }
  
  // 計算需要顯示的下個月的天數
  const totalDays = 42; // 6週 x 7天
  const nextMonthDays = totalDays - result.length;
  
  // 添加下個月的日期
  for (let day = 1; day <= nextMonthDays; day++) {
    const date = new Date(year, month, day);
    result.push({
      date: date.toISOString().split('T')[0],
      day,
      otherMonth: true
    });
  }
  
  return result;
}

// 格式化日期
export const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString()
}

// 格式化日期時間
export const formatDateTime = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString()
}

// 格式化時間
export const formatTime = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 解析日期時間字符串
export const parseDateTime = (dateTimeStr: string): Date => {
  return new Date(dateTimeStr.replace(' ', 'T'));
} 