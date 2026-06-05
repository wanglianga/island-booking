import { writable, derived } from 'svelte/store'
import {
  roomTypes,
  roomAvailability,
  ferrySchedules,
  shuttleSchedules,
  activities,
  activitySlots,
  refundRules,
  type RoomType,
  type FerrySchedule,
  type ShuttleSchedule,
  type Activity,
  type ActivitySlot,
  type RefundRule,
} from '$lib/mockData'

export interface ConflictItem {
  type: 'room-suspended' | 'ferry-suspended' | 'shuttle-disconnected' | 'room-change' | 'child-price' | 'activity-full'
  severity: 'error' | 'warning' | 'info'
  message: string
}

export const checkInDate = writable<string>('')
export const checkOutDate = writable<string>('')
export const selectedRoomTypeId = writable<string>('')
export const adults = writable<number>(2)
export const children = writable<number>(0)
export const selectedOutboundFerryId = writable<string>('')
export const selectedReturnFerryId = writable<string>('')
export const selectedOutboundShuttleId = writable<string>('')
export const selectedReturnShuttleId = writable<string>('')
export const selectedActivitySlotKeys = writable<string[]>([])

export const dateRange = derived([checkInDate, checkOutDate], ([$checkIn, $checkOut]) => {
  if (!$checkIn || !$checkOut) return []
  const dates: string[] = []
  const start = new Date($checkIn)
  const end = new Date($checkOut)
  const current = new Date(start)
  while (current < end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
})

export const nights = derived(dateRange, ($range) => $range.length)

export const selectedRoomType = derived(selectedRoomTypeId, ($id) =>
  roomTypes.find((r) => r.id === $id)
)

export const availableRoomTypes = derived(dateRange, ($range) => {
  if ($range.length === 0) return roomTypes
  return roomTypes.filter((rt) =>
    $range.every((date) => {
      const avail = roomAvailability.find(
        (a) => a.roomTypeId === rt.id && a.date === date
      )
      return avail && avail.available > 0
    })
  )
})

export const roomAvailForDates = derived(
  [selectedRoomTypeId, dateRange],
  ([$roomTypeId, $range]) => {
    if (!$roomTypeId || $range.length === 0) return []
    return $range
      .map((date) => {
        const avail = roomAvailability.find(
          (a) => a.roomTypeId === $roomTypeId && a.date === date
        )
        return { date, ...avail }
      })
      .filter(Boolean)
  }
)

export const roomChangeDates = derived(roomAvailForDates, ($avail) =>
  $avail.filter((a: any) => a?.needRoomChange)
)

export const outboundFerries = derived(checkInDate, ($date) => {
  if (!$date) return []
  return ferrySchedules.filter(
    (f) => f.date === $date && f.direction === 'outbound'
  )
})

export const returnFerries = derived(checkOutDate, ($date) => {
  if (!$date) return []
  return ferrySchedules.filter(
    (f) => f.date === $date && f.direction === 'return'
  )
})

export const selectedOutboundFerry = derived(
  [outboundFerries, selectedOutboundFerryId],
  ([$ferries, $id]) => $ferries.find((f) => f.id === $id)
)

export const selectedReturnFerry = derived(
  [returnFerries, selectedReturnFerryId],
  ([$ferries, $id]) => $ferries.find((f) => f.id === $id)
)

export const outboundShuttles = derived(checkInDate, ($date) => {
  if (!$date) return []
  return shuttleSchedules.filter(
    (s) => s.date === $date && s.direction === 'outbound'
  )
})

export const returnShuttles = derived(checkOutDate, ($date) => {
  if (!$date) return []
  return shuttleSchedules.filter(
    (s) => s.date === $date && s.direction === 'return'
  )
})

export const selectedOutboundShuttle = derived(
  [outboundShuttles, selectedOutboundShuttleId],
  ([$shuttles, $id]) => $shuttles.find((s) => s.id === $id)
)

export const selectedReturnShuttle = derived(
  [returnShuttles, selectedReturnShuttleId],
  ([$shuttles, $id]) => $shuttles.find((s) => s.id === $id)
)

export const availableActivitiesForDates = derived(dateRange, ($range) => {
  if ($range.length === 0) return []
  return activities
    .map((act) => {
      const slots = activitySlots.filter(
        (s) => s.activityId === act.id && $range.includes(s.date) && s.remaining > 0
      )
      return { activity: act, slots }
    })
    .filter((a) => a.slots.length > 0)
})

export const conflicts = derived(
  [
    selectedRoomTypeId, dateRange, roomChangeDates,
    checkInDate, checkOutDate,
    outboundFerries, returnFerries,
    selectedOutboundFerry, selectedReturnFerry,
    outboundShuttles, returnShuttles,
    selectedOutboundShuttle, selectedReturnShuttle,
    adults, children, selectedRoomType, selectedActivitySlotKeys,
  ],
  ([
    $roomTypeId, $range, $roomChangeDates,
    $checkIn, $checkOut,
    $outboundFerries, $returnFerries,
    $outFerry, $retFerry,
    $outShuttles, $retShuttles,
    $outShuttle, $retShuttle,
    $adults, $children, $roomType, $actSlotKeys,
  ]) => {
    const items: ConflictItem[] = []

    if ($roomTypeId && $range.length > 0) {
      const allAvail = $range.every((date: string) => {
        const avail = roomAvailability.find(
          (a) => a.roomTypeId === $roomTypeId && a.date === date
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
      if ($roomChangeDates.length > 0) {
        const changeInfo = $roomChangeDates
          .map((a: any) => {
            const targetRoom = roomTypes.find((r) => r.id === a.changeToRoomTypeId)
            return `${a.date} 需换至 ${targetRoom?.name || '其他房型'}`
          })
          .join('、')
        items.push({
          type: 'room-change',
          severity: 'warning',
          message: `连住期间需换房：${changeInfo}`,
        })
      }
    }

    if ($checkIn && $outboundFerries.length > 0 && $outboundFerries.every((f) => f.suspended)) {
      items.push({
        type: 'ferry-suspended',
        severity: 'error',
        message: `${$checkIn} 去程船班全部停航，无法上岛——房间仍有库存，但因船班停航无法完成预订`,
      })
    }
    if ($checkIn && $outboundFerries.length > 0 && $outboundFerries.every((f) => f.suspended) && $roomTypeId) {
      const roomAvail = $range.every((date: string) => {
        const avail = roomAvailability.find(
          (a) => a.roomTypeId === $roomTypeId && a.date === date
        )
        return avail && avail.available > 0
      })
      if (roomAvail) {
        items.push({
          type: 'ferry-suspended',
          severity: 'error',
          message: '⚠ 房间可订但船班停航，订单无法生效——需等待复航或更换出行日期',
        })
      }
    }

    if ($checkOut && $returnFerries.length > 0 && $returnFerries.every((f) => f.suspended)) {
      items.push({
        type: 'ferry-suspended',
        severity: 'error',
        message: `${$checkOut} 回程船班全部停航，无法离岛`,
      })
    }

    if ($outFerry && !$outFerry.suspended) {
      const hasConnecting = $outShuttles.some(
        (s) => s.connectsFerry && s.ferryScheduleId === $outFerry!.id && s.booked < s.capacity
      )
      if (!hasConnecting && $outShuttles.length > 0) {
        items.push({
          type: 'shuttle-disconnected',
          severity: 'warning',
          message: '所选去程船班无可用接驳车衔接，需自行前往民宿',
        })
      }
    }
    if ($outShuttle && !$outShuttle.connectsFerry) {
      items.push({
        type: 'shuttle-disconnected',
        severity: 'warning',
        message: `去程接驳车无法衔接所选船班${$outShuttle.note ? '：' + $outShuttle.note : ''}`,
      })
    }

    if ($retFerry && !$retFerry.suspended) {
      const hasConnecting = $retShuttles.some(
        (s) => s.connectsFerry && s.ferryScheduleId === $retFerry!.id && s.booked < s.capacity
      )
      if (!hasConnecting && $retShuttles.length > 0) {
        items.push({
          type: 'shuttle-disconnected',
          severity: 'warning',
          message: '所选回程船班无可用接驳车衔接，需自行前往码头',
        })
      }
    }
    if ($retShuttle && !$retShuttle.connectsFerry) {
      items.push({
        type: 'shuttle-disconnected',
        severity: 'warning',
        message: `回程接驳车无法衔接所选船班${$retShuttle.note ? '：' + $retShuttle.note : ''}`,
      })
    }

    if ($children > 0 && $roomType) {
      items.push({
        type: 'child-price',
        severity: 'info',
        message: `儿童票价 ¥${$roomType.childPrice}/晚（成人 ¥${$roomType.adultPrice}/晚）`,
      })
    }

    const fullSlots = $actSlotKeys.filter((key: string) => {
      const slot = activitySlots.find(
        (s) => s.activityId + '-' + s.date + '-' + s.time === key
      )
      return slot && slot.remaining <= 0
    })
    if (fullSlots.length > 0) {
      items.push({
        type: 'activity-full',
        severity: 'error',
        message: '所选活动部分时段名额已满',
      })
    }

    return items
  }
)

export const roomStatus = derived(conflicts, ($conflicts) => {
  if ($conflicts.some((c) => c.type === 'room-suspended')) return 'error'
  if ($conflicts.some((c) => c.type === 'room-change')) return 'warning'
  return 'ok'
})

export const ferryStatus = derived(conflicts, ($conflicts) => {
  if ($conflicts.some((c) => c.type === 'ferry-suspended')) return 'error'
  return 'ok'
})

export const shuttleStatus = derived(conflicts, ($conflicts) => {
  if ($conflicts.some((c) => c.type === 'shuttle-disconnected')) return 'warning'
  return 'ok'
})

export const activityStatus = derived(conflicts, ($conflicts) => {
  if ($conflicts.some((c) => c.type === 'activity-full')) return 'error'
  return 'ok'
})

export const totalPrice = derived(
  [selectedRoomType, nights, adults, children, selectedOutboundFerry, selectedReturnFerry],
  ([$roomType, $nights, $adults, $children, $outFerry, $retFerry]) => {
    let total = 0
    if ($roomType && $nights > 0) {
      total += $roomType.adultPrice * $adults * $nights
      total += $roomType.childPrice * $children * $nights
    }
    if ($outFerry) {
      total += $outFerry.adultPrice * $adults
      total += $outFerry.childPrice * $children
    }
    if ($retFerry) {
      total += $retFerry.adultPrice * $adults
      total += $retFerry.childPrice * $children
    }
    return total
  }
)

export const allRefundRules: RefundRule[] = refundRules

export function setCheckIn(date: string) {
  checkInDate.set(date)
  checkOutDate.update(($co) => ($co && $co <= date ? '' : $co))
  selectedOutboundFerryId.set('')
  selectedOutboundShuttleId.set('')
}

export function setCheckOut(date: string) {
  checkOutDate.set(date)
  selectedReturnFerryId.set('')
  selectedReturnShuttleId.set('')
}

export function toggleActivitySlot(key: string) {
  selectedActivitySlotKeys.update((keys) => {
    const idx = keys.indexOf(key)
    if (idx >= 0) {
      return [...keys.slice(0, idx), ...keys.slice(idx + 1)]
    }
    return [...keys, key]
  })
}
