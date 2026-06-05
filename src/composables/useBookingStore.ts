import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  roomTypes,
  roomAvailability,
  ferrySchedules,
  shuttleSchedules,
  activities,
  activitySlots,
  refundRules,
  type RoomType,
  type RoomAvailability,
  type FerrySchedule,
  type ShuttleSchedule,
  type Activity,
  type ActivitySlot,
  type RefundRule,
} from '@/utils/mockData'

export interface ConflictItem {
  type: 'room-suspended' | 'ferry-suspended' | 'shuttle-disconnected' | 'room-change' | 'child-price' | 'activity-full'
  severity: 'error' | 'warning' | 'info'
  message: string
}

export const useBookingStore = defineStore('booking', () => {
  const checkInDate = ref('')
  const checkOutDate = ref('')
  const selectedRoomTypeId = ref('')
  const adults = ref(2)
  const children = ref(0)
  const selectedOutboundFerryId = ref('')
  const selectedReturnFerryId = ref('')
  const selectedOutboundShuttleId = ref('')
  const selectedReturnShuttleId = ref('')
  const selectedActivitySlotIds = ref<string[]>([])

  const dateRange = computed(() => {
    if (!checkInDate.value || !checkOutDate.value) return []
    const dates: string[] = []
    const start = new Date(checkInDate.value)
    const end = new Date(checkOutDate.value)
    const current = new Date(start)
    while (current < end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dates
  })

  const nights = computed(() => dateRange.value.length)

  const selectedRoomType = computed<RoomType | undefined>(() =>
    roomTypes.find((r) => r.id === selectedRoomTypeId.value)
  )

  const availableRoomTypes = computed(() => {
    if (dateRange.value.length === 0) return roomTypes
    return roomTypes.filter((rt) =>
      dateRange.value.every((date) => {
        const avail = roomAvailability.find(
          (a) => a.roomTypeId === rt.id && a.date === date
        )
        return avail && avail.available > 0
      })
    )
  })

  const roomAvailForDates = computed(() => {
    if (!selectedRoomTypeId.value || dateRange.value.length === 0) return []
    return dateRange.value.map((date) => {
      const avail = roomAvailability.find(
        (a) => a.roomTypeId === selectedRoomTypeId.value && a.date === date
      )
      return { date, ...avail }
    }).filter(Boolean)
  })

  const roomChangeDates = computed(() =>
    roomAvailForDates.value.filter((a: any) => a?.needRoomChange)
  )

  const outboundFerries = computed<FerrySchedule[]>(() => {
    if (!checkInDate.value) return []
    return ferrySchedules.filter(
      (f) => f.date === checkInDate.value && f.direction === 'outbound'
    )
  })

  const returnFerries = computed<FerrySchedule[]>(() => {
    if (!checkOutDate.value) return []
    return ferrySchedules.filter(
      (f) => f.date === checkOutDate.value && f.direction === 'return'
    )
  })

  const selectedOutboundFerry = computed<FerrySchedule | undefined>(() =>
    outboundFerries.value.find((f) => f.id === selectedOutboundFerryId.value)
  )

  const selectedReturnFerry = computed<FerrySchedule | undefined>(() =>
    returnFerries.value.find((f) => f.id === selectedReturnFerryId.value)
  )

  const outboundShuttles = computed<ShuttleSchedule[]>(() => {
    if (!checkInDate.value) return []
    return shuttleSchedules.filter(
      (s) => s.date === checkInDate.value && s.direction === 'outbound'
    )
  })

  const returnShuttles = computed<ShuttleSchedule[]>(() => {
    if (!checkOutDate.value) return []
    return shuttleSchedules.filter(
      (s) => s.date === checkOutDate.value && s.direction === 'return'
    )
  })

  const selectedOutboundShuttle = computed<ShuttleSchedule | undefined>(() =>
    outboundShuttles.value.find((s) => s.id === selectedOutboundShuttleId.value)
  )

  const selectedReturnShuttle = computed<ShuttleSchedule | undefined>(() =>
    returnShuttles.value.find((s) => s.id === selectedReturnShuttleId.value)
  )

  const availableActivitiesForDates = computed(() => {
    if (dateRange.value.length === 0) return []
    return activities.map((act) => {
      const slots = activitySlots.filter(
        (s) =>
          s.activityId === act.id &&
          dateRange.value.includes(s.date) &&
          s.remaining > 0
      )
      return { activity: act, slots }
    }).filter((a) => a.slots.length > 0)
  })

  const conflicts = computed<ConflictItem[]>(() => {
    const items: ConflictItem[] = []

    if (selectedRoomTypeId.value && dateRange.value.length > 0) {
      const allAvail = dateRange.value.every((date) => {
        const avail = roomAvailability.find(
          (a) => a.roomTypeId === selectedRoomTypeId.value && a.date === date
        )
        return avail && avail.available > 0
      })
      if (!allAvail) {
        items.push({
          type: 'room-suspended',
          severity: 'error',
          message: '所选日期部分房型已满，请更换房型或调整日期',
        })
      }

      if (roomChangeDates.value.length > 0) {
        const changeInfo = roomChangeDates.value.map((a: any) => {
          const targetRoom = roomTypes.find((r) => r.id === a.changeToRoomTypeId)
          return `${a.date} 需换至 ${targetRoom?.name || '其他房型'}`
        }).join('、')
        items.push({
          type: 'room-change',
          severity: 'warning',
          message: `连住期间需换房：${changeInfo}`,
        })
      }
    }

    if (checkInDate.value && outboundFerries.value.length > 0) {
      const allSuspended = outboundFerries.value.every((f) => f.suspended)
      if (allSuspended) {
        items.push({
          type: 'ferry-suspended',
          severity: 'error',
          message: `${checkInDate.value} 去程船班全部停航，无法上岛`,
        })
      }
    }

    if (checkOutDate.value && returnFerries.value.length > 0) {
      const allSuspended = returnFerries.value.every((f) => f.suspended)
      if (allSuspended) {
        items.push({
          type: 'ferry-suspended',
          severity: 'error',
          message: `${checkOutDate.value} 回程船班全部停航，无法离岛`,
        })
      }
    }

    if (selectedOutboundFerry.value && selectedOutboundShuttle.value) {
      if (!selectedOutboundShuttle.value.connectsFerry) {
        items.push({
          type: 'shuttle-disconnected',
          severity: 'warning',
          message: `去程接驳车无法衔接所选船班${selectedOutboundShuttle.value.note ? '：' + selectedOutboundShuttle.value.note : ''}`,
        })
      }
    } else if (selectedOutboundFerry.value && !selectedOutboundFerry.value.suspended) {
      const hasConnectingShuttle = outboundShuttles.value.some(
        (s) => s.connectsFerry && s.ferryScheduleId === selectedOutboundFerry.value!.id && s.booked < s.capacity
      )
      if (!hasConnectingShuttle && outboundShuttles.value.length > 0) {
        items.push({
          type: 'shuttle-disconnected',
          severity: 'warning',
          message: '所选去程船班无可用接驳车衔接，需自行前往民宿',
        })
      }
    }

    if (selectedReturnFerry.value && selectedReturnShuttle.value) {
      if (!selectedReturnShuttle.value.connectsFerry) {
        items.push({
          type: 'shuttle-disconnected',
          severity: 'warning',
          message: `回程接驳车无法衔接所选船班${selectedReturnShuttle.value.note ? '：' + selectedReturnShuttle.value.note : ''}`,
        })
      }
    } else if (selectedReturnFerry.value && !selectedReturnFerry.value.suspended) {
      const hasConnectingShuttle = returnShuttles.value.some(
        (s) => s.connectsFerry && s.ferryScheduleId === selectedReturnFerry.value!.id && s.booked < s.capacity
      )
      if (!hasConnectingShuttle && returnShuttles.value.length > 0) {
        items.push({
          type: 'shuttle-disconnected',
          severity: 'warning',
          message: '所选回程船班无可用接驳车衔接，需自行前往码头',
        })
      }
    }

    if (children.value > 0 && selectedRoomType.value) {
      items.push({
        type: 'child-price',
        severity: 'info',
        message: `儿童票价 ¥${selectedRoomType.value.childPrice}/晚（成人 ¥${selectedRoomType.value.adultPrice}/晚）`,
      })
    }

    const fullActivitySlots = selectedActivitySlotIds.value.filter((slotId) => {
      const slot = activitySlots.find((s) =>
        s.activityId + '-' + s.date + '-' + s.time === slotId
      )
      return slot && slot.remaining <= 0
    })
    if (fullActivitySlots.length > 0) {
      items.push({
        type: 'activity-full',
        severity: 'error',
        message: '所选活动部分时段名额已满',
      })
    }

    return items
  })

  const roomStatus = computed<'ok' | 'warning' | 'error'>(() => {
    if (!selectedRoomTypeId.value || dateRange.value.length === 0) return 'ok'
    if (conflicts.value.some((c) => c.type === 'room-suspended')) return 'error'
    if (conflicts.value.some((c) => c.type === 'room-change')) return 'warning'
    return 'ok'
  })

  const ferryStatus = computed<'ok' | 'warning' | 'error'>(() => {
    if (conflicts.value.some((c) => c.type === 'ferry-suspended')) return 'error'
    return 'ok'
  })

  const shuttleStatus = computed<'ok' | 'warning' | 'error'>(() => {
    if (conflicts.value.some((c) => c.type === 'shuttle-disconnected')) return 'warning'
    return 'ok'
  })

  const activityStatus = computed<'ok' | 'warning' | 'error'>(() => {
    if (conflicts.value.some((c) => c.type === 'activity-full')) return 'error'
    return 'ok'
  })

  const totalPrice = computed(() => {
    let total = 0
    if (selectedRoomType.value && nights.value > 0) {
      total += selectedRoomType.value.adultPrice * adults.value * nights.value
      total += selectedRoomType.value.childPrice * children.value * nights.value
    }
    if (selectedOutboundFerry.value) {
      total += selectedOutboundFerry.value.adultPrice * adults.value
      total += selectedOutboundFerry.value.childPrice * children.value
    }
    if (selectedReturnFerry.value) {
      total += selectedReturnFerry.value.adultPrice * adults.value
      total += selectedReturnFerry.value.childPrice * children.value
    }
    return total
  })

  const allRefundRules = computed<RefundRule[]>(() => refundRules)

  function setCheckIn(date: string) {
    checkInDate.value = date
    if (checkOutDate.value && checkOutDate.value <= date) {
      checkOutDate.value = ''
    }
    selectedOutboundFerryId.value = ''
    selectedOutboundShuttleId.value = ''
  }

  function setCheckOut(date: string) {
    checkOutDate.value = date
    selectedReturnFerryId.value = ''
    selectedReturnShuttleId.value = ''
  }

  function toggleActivitySlot(slotKey: string) {
    const idx = selectedActivitySlotIds.value.indexOf(slotKey)
    if (idx >= 0) {
      selectedActivitySlotIds.value.splice(idx, 1)
    } else {
      selectedActivitySlotIds.value.push(slotKey)
    }
  }

  return {
    checkInDate,
    checkOutDate,
    selectedRoomTypeId,
    adults,
    children,
    selectedOutboundFerryId,
    selectedReturnFerryId,
    selectedOutboundShuttleId,
    selectedReturnShuttleId,
    selectedActivitySlotIds,
    dateRange,
    nights,
    selectedRoomType,
    availableRoomTypes,
    roomAvailForDates,
    roomChangeDates,
    outboundFerries,
    returnFerries,
    selectedOutboundFerry,
    selectedReturnFerry,
    outboundShuttles,
    returnShuttles,
    selectedOutboundShuttle,
    selectedReturnShuttle,
    availableActivitiesForDates,
    conflicts,
    roomStatus,
    ferryStatus,
    shuttleStatus,
    activityStatus,
    totalPrice,
    allRefundRules,
    setCheckIn,
    setCheckOut,
    toggleActivitySlot,
  }
})
