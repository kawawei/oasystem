import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定義類型
interface Employee {
  id: number
  name: string
  department: string
}

interface Schedule {
  id: number
  date: string
  employeeId: number
  shiftType: 'morning' | 'middle' | 'night'
}

interface AttendanceRecord {
  id: number
  employeeId: string
  name: string
  department: string
  date: string
  checkIn: string
  checkOut: string
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave'
  remark: string
}

interface LeaveApplication {
  id: number
  employeeId: string
  name: string
  type: 'personal' | 'sick' | 'annual' | 'marriage'
  startDate: string
  endDate: string
  days: number
  reason: string
  applyTime: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
}

// 創建 store
export const useAttendanceStore = defineStore('attendance', () => {
  // 排班相關
  const schedules = ref<Schedule[]>([])
  const employees = ref<Employee[]>([
    { id: 1, name: '張三', department: '研發部' },
    { id: 2, name: '李四', department: '市場部' },
    { id: 3, name: '王五', department: '行政部' },
    { id: 4, name: '趙六', department: '研發部' }
  ])

  // 出缺勤記錄
  const attendanceRecords = ref<AttendanceRecord[]>([
    {
      id: 1,
      employeeId: 'EMP001',
      name: '張三',
      department: '研發部',
      date: '2024-01-15',
      checkIn: '09:00:00',
      checkOut: '18:00:00',
      status: 'normal',
      remark: ''
    }
  ])

  // 請假申請
  const leaveApplications = ref<LeaveApplication[]>([
    {
      id: 1,
      employeeId: 'EMP001',
      name: '張三',
      type: 'annual',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      days: 3,
      reason: '回家探親',
      applyTime: '2024-01-15 14:30:00',
      status: 'pending'
    }
  ])

  // 排班相關方法
  const addSchedule = (schedule: Omit<Schedule, 'id'>) => {
    const newSchedule = {
      ...schedule,
      id: schedules.value.length + 1
    }
    schedules.value.push(newSchedule)
  }

  const updateSchedule = (id: number, schedule: Partial<Schedule>) => {
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value[index] = { ...schedules.value[index], ...schedule }
    }
  }

  const deleteSchedule = (id: number) => {
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value.splice(index, 1)
    }
  }

  // 出缺勤記錄相關方法
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: attendanceRecords.value.length + 1
    }
    attendanceRecords.value.push(newRecord)
  }

  const updateAttendanceRecord = (id: number, record: Partial<AttendanceRecord>) => {
    const index = attendanceRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      attendanceRecords.value[index] = { ...attendanceRecords.value[index], ...record }
    }
  }

  const deleteAttendanceRecord = (id: number) => {
    const index = attendanceRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      attendanceRecords.value.splice(index, 1)
    }
  }

  // 請假申請相關方法
  const addLeaveApplication = (application: Omit<LeaveApplication, 'id' | 'status' | 'applyTime'>) => {
    const newApplication = {
      ...application,
      id: leaveApplications.value.length + 1,
      status: 'pending' as const,
      applyTime: new Date().toLocaleString()
    }
    leaveApplications.value.push(newApplication)
  }

  const updateLeaveApplication = (id: number, application: Partial<LeaveApplication>) => {
    const index = leaveApplications.value.findIndex(a => a.id === id)
    if (index !== -1) {
      leaveApplications.value[index] = { ...leaveApplications.value[index], ...application }
    }
  }

  const approveLeave = (id: number, comment: string) => {
    updateLeaveApplication(id, { status: 'approved', comment })
  }

  const rejectLeave = (id: number, comment: string) => {
    updateLeaveApplication(id, { status: 'rejected', comment })
  }

  // 統計方法
  const getAttendanceStats = (startDate: string, endDate: string) => {
    const records = attendanceRecords.value.filter(record => {
      const date = record.date
      return date >= startDate && date <= endDate
    })

    return {
      total: records.length,
      normal: records.filter(r => r.status === 'normal').length,
      late: records.filter(r => r.status === 'late').length,
      early: records.filter(r => r.status === 'early').length,
      absent: records.filter(r => r.status === 'absent').length,
      leave: records.filter(r => r.status === 'leave').length
    }
  }

  const getLeaveStats = (startDate: string, endDate: string) => {
    const applications = leaveApplications.value.filter(app => {
      const date = app.startDate
      return date >= startDate && date <= endDate
    })

    return {
      total: applications.length,
      personal: applications.filter(a => a.type === 'personal').length,
      sick: applications.filter(a => a.type === 'sick').length,
      annual: applications.filter(a => a.type === 'annual').length,
      marriage: applications.filter(a => a.type === 'marriage').length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    }
  }

  const getDepartmentStats = () => {
    const departments = [...new Set(employees.value.map(e => e.department))]
    return departments.map(dept => ({
      department: dept,
      count: employees.value.filter(e => e.department === dept).length,
      attendance: attendanceRecords.value.filter(r => 
        r.department === dept && r.status === 'normal'
      ).length,
      leave: leaveApplications.value.filter(a => 
        employees.value.find(e => e.id === Number(a.employeeId))?.department === dept
      ).length
    }))
  }

  return {
    // 狀態
    schedules,
    employees,
    attendanceRecords,
    leaveApplications,

    // 方法
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    addLeaveApplication,
    updateLeaveApplication,
    approveLeave,
    rejectLeave,
    getAttendanceStats,
    getLeaveStats,
    getDepartmentStats
  }
}) 