// 行程類型定義
export interface Event {
  id: number;
  title: string;
  type: 'meeting' | 'event' | 'visit' | 'other';
  startTime: string;
  endTime: string;
  location?: string;
  participants: number[];
  reminder?: string;
  remark?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// 行程表單類型
export interface EventForm {
  id?: number;
  title: string;
  type: 'meeting' | 'event' | 'visit' | 'other';
  startTime: string;
  endTime: string;
  location?: string;
  participants: number[];
  reminder?: string;
  remark?: string;
}

// 行程驗證規則
export const eventRules = {
  title: [
    { required: true, message: '請輸入行程標題', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '請選擇行程類型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '請選擇開始時間', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '請選擇結束時間', trigger: 'change' }
  ]
}

// 行程類型選項
export const eventTypeOptions = [
  { label: '會議', value: 'meeting' },
  { label: '活動', value: 'event' },
  { label: '拜訪', value: 'visit' },
  { label: '其他', value: 'other' }
]

// 提醒時間選項
export const reminderOptions = [
  { label: '不提醒', value: '' },
  { label: '開始時', value: '0' },
  { label: '5分鐘前', value: '5' },
  { label: '15分鐘前', value: '15' },
  { label: '30分鐘前', value: '30' },
  { label: '1小時前', value: '60' },
  { label: '2小時前', value: '120' },
  { label: '1天前', value: '1440' }
] 