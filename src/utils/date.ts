import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export const formatDate = (date: string | Date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: zhTW })
} 