import { writable, derived, get } from 'svelte/store'
import {
  mockBookings,
  mockTyphoonSuspensions,
  type Booking,
  type TyphoonSuspension,
} from '$lib/mockData'
import {
  ferrySchedules,
  shuttleSchedules,
  activitySlots,
  roomAvailability,
} from '$lib/mockData'

export const typhoonModeEnabled = writable<boolean>(true)

export const typhoonSuspensions = writable<TyphoonSuspension[]>([...mockTyphoonSuspensions])

export const bookings = writable<Booking[]>([...mockBookings])

export const localActivitySlots = writable([...activitySlots])
export const localShuttleSchedules = writable([...shuttleSchedules])
export const localRoomAvailability = writable([...roomAvailability])

export const affectedBookings = derived([bookings, typhoonSuspensions], ([$bookings, $suspensions]) => {
  const suspendedDates = $suspensions.map((s) => s.date)
  return $bookings.filter((b) => {
    const checkInSuspended = suspendedDates.includes(b.checkInDate)
    const checkOutSuspended = suspendedDates.includes(b.checkOutDate)
    return checkInSuspended || checkOutSuspended
  })
})

export const pendingAffectedBookings = derived(affectedBookings, ($affected) => {
  return $affected.filter((b) => b.typhoonProcessStatus === 'pending' || !b.typhoonProcessStatus)
})

export const processedAffectedBookings = derived(affectedBookings, ($affected) => {
  return $affected.filter((b) => b.typhoonProcessStatus && b.typhoonProcessStatus !== 'pending')
})

export function addTyphoonSuspension(date: string, reason: string, affectedDirection: 'all' | 'outbound' | 'return' = 'all') {
  typhoonSuspensions.update((suspensions) => {
    const existing = suspensions.find((s) => s.date === date)
    if (existing) {
      return suspensions.map((s) => (s.date === date ? { ...s, reason, affectedDirection } : s))
    }
    return [...suspensions, { date, reason, affectedDirection }]
  })

  bookings.update((bs) => {
    return bs.map((b) => {
      const isAffected = b.checkInDate === date || b.checkOutDate === date
      if (isAffected && !b.typhoonAffected) {
        return {
          ...b,
          typhoonAffected: true,
          typhoonProcessStatus: 'pending',
          status: 'suspended' as const,
          suspensionReason: reason,
        }
      }
      return b
    })
  })
}

export function removeTyphoonSuspension(date: string) {
  typhoonSuspensions.update((suspensions) => suspensions.filter((s) => s.date !== date))

  bookings.update((bs) => {
    return bs.map((b) => {
      if (b.checkInDate === date || b.checkOutDate === date) {
        return {
          ...b,
          typhoonAffected: false,
          typhoonProcessStatus: undefined,
          status: 'confirmed' as const,
          suspensionReason: undefined,
        }
      }
      return b
    })
  })
}

export function checkRoomConflict(
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
): boolean {
  const $roomAvailability = get(localRoomAvailability)
  const $bookings = get(bookings)

  const dateRange: string[] = []
  const start = new Date(checkInDate)
  const end = new Date(checkOutDate)
  const current = new Date(start)
  while (current < end) {
    dateRange.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  for (const date of dateRange) {
    const avail = $roomAvailability.find((a) => a.roomTypeId === roomTypeId && a.date === date)
    if (!avail || avail.available <= 0) {
      return true
    }
  }

  for (const booking of $bookings) {
    if (excludeBookingId && booking.id === excludeBookingId) continue
    if (booking.status === 'cancelled') continue
    if (booking.roomTypeId !== roomTypeId) continue

    const bookingStart = new Date(booking.checkInDate)
    const bookingEnd = new Date(booking.checkOutDate)
    const newStart = new Date(checkInDate)
    const newEnd = new Date(checkOutDate)

    if (newStart < bookingEnd && newEnd > bookingStart) {
      return true
    }
  }

  return false
}

function releaseActivitySlots(booking: Booking) {
  localActivitySlots.update((slots) => {
    return slots.map((slot) => {
      const matchingActivity = booking.activities.find(
        (act) => act.activityId === slot.activityId && act.date === slot.date && act.time === slot.time
      )
      if (matchingActivity) {
        return {
          ...slot,
          remaining: slot.remaining + matchingActivity.guests,
        }
      }
      return slot
    })
  })
}

function releaseShuttleSeats(booking: Booking) {
  localShuttleSchedules.update((shuttles) => {
    return shuttles.map((shuttle) => {
      if (booking.outboundShuttleId === shuttle.id || booking.returnShuttleId === shuttle.id) {
        const totalGuests = booking.adults + booking.children
        return {
          ...shuttle,
          booked: Math.max(0, shuttle.booked - totalGuests),
        }
      }
      return shuttle
    })
  })
}

export function cancelAndRefund(bookingId: string) {
  bookings.update((bs) => {
    return bs.map((b) => {
      if (b.id === bookingId) {
        releaseActivitySlots(b)
        releaseShuttleSeats(b)
        return {
          ...b,
          status: 'cancelled' as const,
          typhoonProcessStatus: 'refunded' as const,
        }
      }
      return b
    })
  })
}

export function postponeBooking(bookingId: string, daysToPostpone: number): { success: boolean; conflict?: boolean } {
  const $bookings = get(bookings)
  const booking = $bookings.find((b) => b.id === bookingId)
  if (!booking) return { success: false }

  const newCheckIn = new Date(booking.checkInDate)
  newCheckIn.setDate(newCheckIn.getDate() + daysToPostpone)
  const newCheckInStr = newCheckIn.toISOString().split('T')[0]

  const newCheckOut = new Date(booking.checkOutDate)
  newCheckOut.setDate(newCheckOut.getDate() + daysToPostpone)
  const newCheckOutStr = newCheckOut.toISOString().split('T')[0]

  const hasConflict = checkRoomConflict(booking.roomTypeId, newCheckInStr, newCheckOutStr, bookingId)
  if (hasConflict) {
    return { success: false, conflict: true }
  }

  releaseActivitySlots(booking)
  releaseShuttleSeats(booking)

  bookings.update((bs) => {
    return bs.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          checkInDate: newCheckInStr,
          checkOutDate: newCheckOutStr,
          typhoonProcessStatus: 'postponed' as const,
          status: 'confirmed' as const,
          typhoonAffected: false,
          suspensionReason: undefined,
          outboundFerryId: undefined,
          outboundFerryTime: undefined,
          returnFerryId: undefined,
          returnFerryTime: undefined,
          outboundShuttleId: undefined,
          returnShuttleId: undefined,
          activities: [],
        }
      }
      return b
    })
  })

  return { success: true }
}

export function rescheduleFerry(
  bookingId: string,
  newOutboundFerryId?: string,
  newReturnFerryId?: string
): { success: boolean; conflict?: boolean } {
  const $bookings = get(bookings)
  const booking = $bookings.find((b) => b.id === bookingId)
  if (!booking) return { success: false }

  const newOutboundFerry = newOutboundFerryId
    ? ferrySchedules.find((f) => f.id === newOutboundFerryId)
    : undefined
  const newReturnFerry = newReturnFerryId
    ? ferrySchedules.find((f) => f.id === newReturnFerryId)
    : undefined

  releaseActivitySlots(booking)
  releaseShuttleSeats(booking)

  bookings.update((bs) => {
    return bs.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          typhoonProcessStatus: 'rescheduled' as const,
          status: 'confirmed' as const,
          typhoonAffected: false,
          suspensionReason: undefined,
          outboundFerryId: newOutboundFerry?.id,
          outboundFerryTime: newOutboundFerry?.time,
          returnFerryId: newReturnFerry?.id,
          returnFerryTime: newReturnFerry?.time,
          outboundShuttleId: undefined,
          returnShuttleId: undefined,
          activities: [],
        }
      }
      return b
    })
  })

  return { success: true }
}

export function getAvailableFerriesForDate(date: string, direction: 'outbound' | 'return') {
  return ferrySchedules.filter(
    (f) => f.date === date && f.direction === direction && !f.suspended && f.availableSeats > 0
  )
}

export function getDateRange(days: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}
