<template>
  <div class="space-y-8">
    <section v-if="store.outboundFerries.length > 0">
      <h3 class="text-lg font-semibold text-ocean-800 mb-4 flex items-center gap-2">
        <Bus class="w-5 h-5 text-ocean-500" />
        去程接驳
      </h3>
      <template v-if="!store.selectedOutboundFerryId">
        <p class="text-sm text-sand-600">请先选择船班</p>
      </template>
      <template v-else-if="store.outboundShuttles.length === 0">
        <p class="text-sm text-sand-600">暂无接驳车信息</p>
      </template>
      <template v-else>
        <div class="relative pl-6 space-y-4">
          <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-ocean-200" />
          <div
            v-for="shuttle in store.outboundShuttles"
            :key="shuttle.id"
            class="relative"
          >
            <div class="absolute left-[-18px] top-4 w-3 h-3 rounded-full border-2 border-ocean-400 bg-white z-10" />
            <div
              :class="shuttleCardClass(shuttle, store.selectedOutboundShuttleId === shuttle.id)"
              @click="selectShuttle(shuttle, 'outbound')"
            >
              <div class="flex items-center gap-2 text-ocean-700 font-semibold mb-2">
                <Bus class="w-4 h-4 text-ocean-500" />
                <Clock class="w-4 h-4 text-ocean-500" />
                {{ shuttle.time }}
              </div>
              <div class="text-sm text-gray-700 mb-2">
                {{ shuttle.departure }}
              </div>
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{{ shuttle.capacity - shuttle.booked }}/{{ shuttle.capacity }} 余座</span>
                </div>
                <div class="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="capacityBarClass(shuttle)"
                    :style="{ width: capacityPercentage(shuttle) + '%' }"
                  />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="shuttle.connectsFerry && shuttle.booked < shuttle.capacity"
                  class="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  可衔接
                </span>
                <span
                  v-else-if="!shuttle.connectsFerry"
                  class="inline-flex items-center gap-1 bg-coral-50 text-coral-600 text-xs px-2 py-0.5 rounded-full"
                >
                  <XCircle class="w-3.5 h-3.5" />
                  无法衔接
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 bg-sand-100 text-sand-600 text-xs px-2 py-0.5 rounded-full"
                >
                  已满
                </span>
              </div>
              <p
                v-if="!shuttle.connectsFerry && shuttle.note"
                class="text-xs text-coral-500 mt-1"
              >
                {{ shuttle.note }}
              </p>
              <div
                v-if="shuttle.ferryScheduleId === store.selectedOutboundFerryId && !shuttle.connectsFerry"
                class="mt-2 bg-coral-50 border border-coral-200 rounded-lg p-2 flex items-center gap-2"
              >
                <AlertTriangle class="w-4 h-4 text-coral-500 shrink-0" />
                <span class="text-xs text-coral-600">该接驳车无法衔接您所选的去程船班</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>

    <section v-if="store.returnFerries.length > 0">
      <h3 class="text-lg font-semibold text-ocean-800 mb-4 flex items-center gap-2">
        <Bus class="w-5 h-5 text-ocean-500" />
        回程接驳
      </h3>
      <template v-if="!store.selectedReturnFerryId">
        <p class="text-sm text-sand-600">请先选择船班</p>
      </template>
      <template v-else-if="store.returnShuttles.length === 0">
        <p class="text-sm text-sand-600">暂无接驳车信息</p>
      </template>
      <template v-else>
        <div class="relative pl-6 space-y-4">
          <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-ocean-200" />
          <div
            v-for="shuttle in store.returnShuttles"
            :key="shuttle.id"
            class="relative"
          >
            <div class="absolute left-[-18px] top-4 w-3 h-3 rounded-full border-2 border-ocean-400 bg-white z-10" />
            <div
              :class="shuttleCardClass(shuttle, store.selectedReturnShuttleId === shuttle.id)"
              @click="selectShuttle(shuttle, 'return')"
            >
              <div class="flex items-center gap-2 text-ocean-700 font-semibold mb-2">
                <Bus class="w-4 h-4 text-ocean-500" />
                <Clock class="w-4 h-4 text-ocean-500" />
                {{ shuttle.time }}
              </div>
              <div class="text-sm text-gray-700 mb-2">
                {{ shuttle.departure }}
              </div>
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{{ shuttle.capacity - shuttle.booked }}/{{ shuttle.capacity }} 余座</span>
                </div>
                <div class="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="capacityBarClass(shuttle)"
                    :style="{ width: capacityPercentage(shuttle) + '%' }"
                  />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="shuttle.connectsFerry && shuttle.booked < shuttle.capacity"
                  class="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  可衔接
                </span>
                <span
                  v-else-if="!shuttle.connectsFerry"
                  class="inline-flex items-center gap-1 bg-coral-50 text-coral-600 text-xs px-2 py-0.5 rounded-full"
                >
                  <XCircle class="w-3.5 h-3.5" />
                  无法衔接
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 bg-sand-100 text-sand-600 text-xs px-2 py-0.5 rounded-full"
                >
                  已满
                </span>
              </div>
              <p
                v-if="!shuttle.connectsFerry && shuttle.note"
                class="text-xs text-coral-500 mt-1"
              >
                {{ shuttle.note }}
              </p>
              <div
                v-if="shuttle.ferryScheduleId === store.selectedReturnFerryId && !shuttle.connectsFerry"
                class="mt-2 bg-coral-50 border border-coral-200 rounded-lg p-2 flex items-center gap-2"
              >
                <AlertTriangle class="w-4 h-4 text-coral-500 shrink-0" />
                <span class="text-xs text-coral-600">该接驳车无法衔接您所选的回程船班</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Bus, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-vue-next'
import { useBookingStore } from '@/composables/useBookingStore'
import type { ShuttleSchedule } from '@/utils/mockData'

const store = useBookingStore()

function capacityPercentage(shuttle: ShuttleSchedule): number {
  if (shuttle.capacity === 0) return 0
  return Math.round(((shuttle.capacity - shuttle.booked) / shuttle.capacity) * 100)
}

function capacityBarClass(shuttle: ShuttleSchedule): string {
  const remaining = shuttle.capacity - shuttle.booked
  if (remaining <= 0) return 'bg-sand-400'
  if (!shuttle.connectsFerry) return 'bg-coral-400'
  return 'bg-ocean-500'
}

function shuttleCardClass(shuttle: ShuttleSchedule, isSelected: boolean): string {
  const base = 'rounded-xl border p-4 transition-all duration-200 cursor-pointer'
  const remaining = shuttle.capacity - shuttle.booked
  if (!shuttle.connectsFerry) {
    return isSelected
      ? `${base} bg-ocean-50 border-ocean-500 shadow-md`
      : `${base} bg-white border-gray-200 hover:shadow-md`
  }
  if (remaining <= 0) {
    return `${base} bg-sand-100 border-sand-300 cursor-not-allowed hover:shadow-none`
  }
  if (isSelected) {
    return `${base} bg-ocean-50 border-ocean-500 shadow-md`
  }
  return `${base} bg-white border-gray-200 hover:shadow-md`
}

function selectShuttle(shuttle: ShuttleSchedule, direction: 'outbound' | 'return') {
  const remaining = shuttle.capacity - shuttle.booked
  if (remaining <= 0 && shuttle.connectsFerry) return
  if (direction === 'outbound') {
    store.selectedOutboundShuttleId = store.selectedOutboundShuttleId === shuttle.id ? '' : shuttle.id
  } else {
    store.selectedReturnShuttleId = store.selectedReturnShuttleId === shuttle.id ? '' : shuttle.id
  }
}
</script>
