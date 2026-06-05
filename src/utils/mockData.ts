export interface RoomType {
  id: string
  name: string
  image: string
  adultPrice: number
  childPrice: number
  maxGuests: number
  description: string
}

export interface RoomAvailability {
  roomTypeId: string
  date: string
  available: number
  needRoomChange: boolean
  changeToRoomTypeId?: string
}

export interface FerrySchedule {
  id: string
  date: string
  direction: 'outbound' | 'return'
  departure: string
  arrival: string
  time: string
  adultPrice: number
  childPrice: number
  suspended: boolean
  suspendReason?: string
  totalSeats: number
  availableSeats: number
  tideInfo?: string
}

export interface ShuttleSchedule {
  id: string
  date: string
  direction: 'outbound' | 'return'
  ferryScheduleId: string
  departure: string
  time: string
  capacity: number
  booked: number
  connectsFerry: boolean
  note?: string
}

export interface Activity {
  id: string
  name: string
  image: string
  description: string
}

export interface ActivitySlot {
  activityId: string
  date: string
  time: string
  totalQuota: number
  remaining: number
}

export interface RefundRule {
  id: string
  category: string
  label: string
  description: string
  severity: 'relaxed' | 'moderate' | 'strict'
  deadlineHours: number
  penaltyPercent: number
}

function generateDates(days: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const dates = generateDates(14)

export const roomTypes: RoomType[] = [
  {
    id: 'rt-seaview',
    name: '海景大床房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=island%20resort%20seaview%20bedroom%20tropical%20blue%20ocean%20view%20wooden%20interior&image_size=landscape_16_9',
    adultPrice: 680,
    childPrice: 380,
    maxGuests: 2,
    description: '面朝大海，推窗即见碧波，适合情侣或小家庭',
  },
  {
    id: 'rt-garden',
    name: '花园双床房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=island%20garden%20twin%20bedroom%20tropical%20plants%20cozy%20resort&image_size=landscape_16_9',
    adultPrice: 520,
    childPrice: 280,
    maxGuests: 3,
    description: '花园环绕，双床适合好友或亲子出行',
  },
  {
    id: 'rt-family',
    name: '家庭套房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=island%20family%20suite%20spacious%20tropical%20resort%20living%20room&image_size=landscape_16_9',
    adultPrice: 980,
    childPrice: 480,
    maxGuests: 4,
    description: '独立客厅加卧室，全家出游首选',
  },
  {
    id: 'rt-stargazing',
    name: '星空帐篷房',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glamping%20stargazing%20tent%20island%20night%20sky%20luxury%20camping&image_size=landscape_16_9',
    adultPrice: 450,
    childPrice: 250,
    maxGuests: 2,
    description: '仰望星空，亲近自然，独特露营体验',
  },
]

export const roomAvailability: RoomAvailability[] = [
  ...dates.map((date, i) => ({ roomTypeId: 'rt-seaview', date, available: i === 3 ? 0 : i === 5 ? 1 : 3, needRoomChange: i === 5, changeToRoomTypeId: i === 5 ? 'rt-garden' : undefined })),
  ...dates.map((date, i) => ({ roomTypeId: 'rt-garden', date, available: i === 2 ? 0 : 2, needRoomChange: false })),
  ...dates.map((date, i) => ({ roomTypeId: 'rt-family', date, available: i === 4 ? 1 : 2, needRoomChange: i === 6, changeToRoomTypeId: i === 6 ? 'rt-seaview' : undefined })),
  ...dates.map((date, i) => ({ roomTypeId: 'rt-stargazing', date, available: i === 1 ? 0 : 4, needRoomChange: false })),
]

const tideInfo: Record<number, string> = {
  0: '大潮',
  1: '中潮',
  2: '小潮',
  3: '大潮',
  4: '中潮',
  5: '小潮',
  6: '大潮',
  7: '大潮',
  8: '中潮',
  9: '小潮',
  10: '大潮',
  11: '中潮',
  12: '小潮',
  13: '大潮',
}

export const ferrySchedules: FerrySchedule[] = [
  ...dates.map((date, i) => ({
    id: `f-out-${i}`,
    date,
    direction: 'outbound' as const,
    departure: ' mainland码头',
    arrival: ' island码头',
    time: '08:30',
    adultPrice: 120,
    childPrice: 60,
    suspended: i === 3,
    suspendReason: i === 3 ? '台风预警，全天停航' : undefined,
    totalSeats: 80,
    availableSeats: i === 3 ? 0 : i === 5 ? 3 : i === 8 ? 0 : 40 - i * 2,
    tideInfo: tideInfo[i],
  })),
  ...dates.map((date, i) => ({
    id: `f-out2-${i}`,
    date,
    direction: 'outbound' as const,
    departure: 'mainland码头',
    arrival: 'island码头',
    time: '13:00',
    adultPrice: 120,
    childPrice: 60,
    suspended: i === 3,
    suspendReason: i === 3 ? '台风预警，全天停航' : undefined,
    totalSeats: 60,
    availableSeats: i === 3 ? 0 : i === 8 ? 2 : 30 - i,
    tideInfo: tideInfo[i],
  })),
  ...dates.map((date, i) => ({
    id: `f-ret-${i}`,
    date,
    direction: 'return' as const,
    departure: 'island码头',
    arrival: 'mainland码头',
    time: '11:00',
    adultPrice: 120,
    childPrice: 60,
    suspended: i === 3,
    suspendReason: i === 3 ? '台风预警，全天停航' : undefined,
    totalSeats: 80,
    availableSeats: i === 3 ? 0 : 35 - i * 2,
    tideInfo: tideInfo[i],
  })),
  ...dates.map((date, i) => ({
    id: `f-ret2-${i}`,
    date,
    direction: 'return' as const,
    departure: 'island码头',
    arrival: 'mainland码头',
    time: '16:30',
    adultPrice: 120,
    childPrice: 60,
    suspended: i === 3,
    suspendReason: i === 3 ? '台风预警，全天停航' : undefined,
    totalSeats: 60,
    availableSeats: i === 3 ? 0 : 28 - i,
    tideInfo: tideInfo[i],
  })),
]

export const shuttleSchedules: ShuttleSchedule[] = [
  ...dates.map((date, i) => ({
    id: `s-out-${i}`,
    date,
    direction: 'outbound' as const,
    ferryScheduleId: `f-out-${i}`,
    departure: 'island码头',
    time: '09:15',
    capacity: 20,
    booked: i === 2 ? 20 : i === 5 ? 18 : 10 + i,
    connectsFerry: i !== 3 && i !== 7,
    note: i === 7 ? '该班次接驳车检修，无法衔接' : i === 3 ? '船班停航，接驳车停运' : undefined,
  })),
  ...dates.map((date, i) => ({
    id: `s-out2-${i}`,
    date,
    direction: 'outbound' as const,
    ferryScheduleId: `f-out2-${i}`,
    departure: 'island码头',
    time: '13:45',
    capacity: 15,
    booked: i === 5 ? 15 : 8 + i,
    connectsFerry: i !== 3,
    note: i === 3 ? '船班停航，接驳车停运' : undefined,
  })),
  ...dates.map((date, i) => ({
    id: `s-ret-${i}`,
    date,
    direction: 'return' as const,
    ferryScheduleId: `f-ret-${i}`,
    departure: '民宿区',
    time: '10:15',
    capacity: 20,
    booked: i === 2 ? 20 : 8 + i,
    connectsFerry: i !== 3 && i !== 7,
    note: i === 7 ? '该班次接驳车检修，无法衔接' : i === 3 ? '船班停航，接驳车停运' : undefined,
  })),
  ...dates.map((date, i) => ({
    id: `s-ret2-${i}`,
    date,
    direction: 'return' as const,
    ferryScheduleId: `f-ret2-${i}`,
    departure: '民宿区',
    time: '15:45',
    capacity: 15,
    booked: 6 + i,
    connectsFerry: i !== 3,
    note: i === 3 ? '船班停航，接驳车停运' : undefined,
  })),
]

export const activities: Activity[] = [
  {
    id: 'act-snorkeling',
    name: '珊瑚浮潜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=snorkeling%20coral%20reef%20tropical%20fish%20clear%20blue%20water&image_size=landscape_16_9',
    description: '专业教练带队，探索近海珊瑚群',
  },
  {
    id: 'act-sunset',
    name: '日落巡航',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunset%20cruise%20sailing%20boat%20golden%20horizon%20island&image_size=landscape_16_9',
    description: '傍晚乘帆船出海，赏海岛落日',
  },
  {
    id: 'act-fishing',
    name: '海钓体验',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sea%20fishing%20boat%20ocean%20tackle%20rod%20catch&image_size=landscape_16_9',
    description: '资深船长指导，感受海钓乐趣',
  },
  {
    id: 'act-kayak',
    name: '皮划艇环岛',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kayaking%20around%20island%20turquoise%20water%20adventure&image_size=landscape_16_9',
    description: '双人皮划艇，近距离感受海岸线',
  },
]

export const activitySlots: ActivitySlot[] = [
  ...dates.flatMap((date, i) => [
    { activityId: 'act-snorkeling', date, time: '09:00', totalQuota: 12, remaining: Math.max(0, 12 - i * 2) },
    { activityId: 'act-snorkeling', date, time: '14:00', totalQuota: 12, remaining: Math.max(0, 12 - i) },
    { activityId: 'act-sunset', date, time: '17:30', totalQuota: 20, remaining: Math.max(0, 20 - i * 3) },
    { activityId: 'act-fishing', date, time: '06:00', totalQuota: 8, remaining: i === 2 || i === 5 ? 0 : Math.max(0, 8 - i) },
    { activityId: 'act-kayak', date, time: '10:00', totalQuota: 16, remaining: Math.max(0, 16 - i * 2) },
  ]),
]

export const refundRules: RefundRule[] = [
  {
    id: 'rr-room-relaxed',
    category: 'room',
    label: '房间退改',
    description: '入住前48小时可全额退款，24-48小时退50%，24小时内不可退',
    severity: 'moderate',
    deadlineHours: 48,
    penaltyPercent: 50,
  },
  {
    id: 'rr-ferry-strict',
    category: 'ferry',
    label: '船票退改',
    description: '开航前24小时可退80%，12-24小时退50%，12小时内不可退',
    severity: 'strict',
    deadlineHours: 24,
    penaltyPercent: 50,
  },
  {
    id: 'rr-shuttle-moderate',
    category: 'shuttle',
    label: '接驳车退改',
    description: '出发前12小时可全额退，12小时内不可退',
    severity: 'moderate',
    deadlineHours: 12,
    penaltyPercent: 100,
  },
  {
    id: 'rr-activity-relaxed',
    category: 'activity',
    label: '活动退改',
    description: '活动开始前24小时可全额退，12-24小时退70%，12小时内不可退',
    severity: 'relaxed',
    deadlineHours: 24,
    penaltyPercent: 30,
  },
  {
    id: 'rr-weather',
    category: 'weather',
    label: '天气原因',
    description: '因台风等不可抗力导致停航，全额退款，不影响信用',
    severity: 'relaxed',
    deadlineHours: 0,
    penaltyPercent: 0,
  },
]
