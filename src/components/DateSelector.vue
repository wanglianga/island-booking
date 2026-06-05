<template>
  <div class="rounded-2xl border border-ocean-200 bg-white shadow-lg overflow-hidden">
    <div class="bg-gradient-to-r from-ocean-500 to-ocean-600 px-5 py-4 flex items-center gap-3">
      <Calendar class="w-5 h-5 text-white" />
      <h2 class="text-lg font-semibold text-white font-serif">选择入住日期</h2>
      <Waves class="w-5 h-5 text-ocean-200 ml-auto" />
    </div>

    <div class="relative">
      <div class="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-ocean-50 to-transparent" />

      <div class="grid grid-cols-7 gap-px bg-ocean-100 px-3 pt-5 pb-1">
        <div
          v-for="d in weekDays"
          :key="d"
          class="text-center text-xs font-medium text-ocean-600 py-1"
        >
          {{ d }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1.5 px-3 pb-4">
        <div
          v-for="offset in leadingEmptyCells"
          :key="'empty-' + offset"
        />

        <button
          v-for="day in dateGrid"
          :key="day.dateStr"
          class="relative flex flex-col items-center rounded-xl py-2 px-1 transition-all duration-200 cursor-pointer"
          :class="cellClass(day)"
          @click="onDateClick(day.dateStr)"
        >
          <span class="text-xs" :class="day.isSuspended ? 'text-coral-500' : 'text-ocean-400'">
            {{ day.weekDay }}
          </span>
          <span
            class="text-base font-semibold mt-0.5"
            :class="isInSelectedRange(day.dateStr) ? 'text-ocean-700' : day.isSuspended ? 'text-coral-600' : 'text-gray-800'"
          >
            {{ day.dayNum }}
          </span>
          <span
            class="text-[10px] mt-0.5"
            :class="tideClass(day.tideLabel)"
          >
            {{ day.tideLabel }}
          </span>
          <span
            v-if="day.isSuspended"
            class="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral-500"
          />
          <span
            v-if="day.dateStr === store.checkInDate"
            class="absolute bottom-1 left-1/2 -translate-x-1/2"
          >
            <Anchor class="w-3 h-3 text-ocean-500" />
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="store.checkInDate && store.checkOutDate"
      class="mx-4 mb-4 rounded-xl border border-ocean-200 bg-ocean-50 p-3 flex items-center gap-3"
    >
      <div class="flex-1 text-center">
        <div class="text-xs text-ocean-500">入住</div>
        <div class="text-sm font-semibold text-ocean-700">{{ formatDisplay(store.checkInDate) }}</div>
      </div>
      <div class="text-ocean-400">→</div>
      <div class="flex-1 text-center">
        <div class="text-xs text-ocean-500">离店</div>
        <div class="text-sm font-semibold text-ocean-700">{{ formatDisplay(store.checkOutDate) }}</div>
      </div>
      <div class="text-sm text-ocean-600 font-medium">
        {{ store.nights }}晚
      </div>
    </div>
    <div
      v-else-if="store.checkInDate"
      class="mx-4 mb-4 rounded-xl border border-ocean-200 bg-ocean-50 p-3 text-center text-sm text-ocean-600"
    >
      已选入住：{{ formatDisplay(store.checkInDate) }}，请选择离店日期
    </div>
    <div
      v-else
      class="mx-4 mb-4 rounded-xl border border-sand-200 bg-sand-50 p-3 text-center text-sm text-sand-600"
    >
      点击日期选择入住和离店时间
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Anchor, Waves } from 'lucide-vue-next'
import { useBookingStore } from '@/composables/useBookingStore'
import { ferrySchedules } from '@/utils/mockData'

const store = useBookingStore()

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

interface DayInfo {
  dateStr: string
  dayNum: number
  weekDay: string
  tideLabel: string
  isSuspended: boolean
}

const dateGrid = computed<DayInfo[]>(() => {
  const result: DayInfo[] = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const ferries = ferrySchedules.filter((f) => f.date === dateStr)
    const allSuspended = ferries.length > 0 && ferries.every((f) => f.suspended)
    const tide = ferries.find((f) => f.tideInfo)?.tideInfo || ''
    result.push({
      dateStr,
      dayNum: d.getDate(),
      weekDay: weekDays[d.getDay()],
      tideLabel: tide,
      isSuspended: allSuspended,
    })
  }
  return result
})

const leadingEmptyCells = computed(() => {
  const today = new Date()
  return today.getDay()
})

function onDateClick(dateStr: string) {
  const ferries = ferrySchedules.filter((f) => f.date === dateStr)
  const allSuspended = ferries.length > 0 && ferries.every((f) => f.suspended)
  if (allSuspended) return

  if (!store.checkInDate || (store.checkInDate && store.checkOutDate)) {
    store.setCheckIn(dateStr)
    if (store.checkOutDate) {
      store.setCheckOut('')
    }
  } else {
    if (dateStr > store.checkInDate) {
      store.setCheckOut(dateStr)
    } else if (dateStr === store.checkInDate) {
      store.setCheckIn('')
    } else {
      store.setCheckIn(dateStr)
    }
  }
}

function isInSelectedRange(dateStr: string): boolean {
  if (!store.checkInDate || !store.checkOutDate) return false
  return dateStr >= store.checkInDate && dateStr <= store.checkOutDate
}

function isCheckInOrOut(dateStr: string): boolean {
  return dateStr === store.checkInDate || dateStr === store.checkOutDate
}

function cellClass(day: DayInfo): string {
  const classes: string[] = []

  if (day.isSuspended) {
    classes.push('bg-coral-100 border border-coral-200 cursor-not-allowed opacity-70')
    return classes.join(' ')
  }

  if (isCheckInOrOut(day.dateStr)) {
    classes.push('bg-ocean-100 border-2 border-ocean-500 shadow-md scale-105')
  } else if (isInSelectedRange(day.dateStr)) {
    classes.push('bg-ocean-50 border border-ocean-300')
  } else {
    classes.push('bg-white border border-gray-100 hover:border-ocean-300 hover:bg-ocean-50')
  }

  return classes.join(' ')
}

function tideClass(label: string): string {
  if (label === '大潮') return 'text-ocean-500 font-medium'
  if (label === '中潮') return 'text-ocean-400'
  if (label === '小潮') return 'text-ocean-300'
  return 'text-gray-300'
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
</script>
