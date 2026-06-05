<template>
  <div class="space-y-8">
    <section>
      <h3 class="text-lg font-semibold text-ocean-800 mb-4 flex items-center gap-2">
        <Ship class="w-5 h-5 text-ocean-500" />
        去程船班
      </h3>
      <template v-if="!store.checkInDate">
        <p class="text-sm text-sand-600 flex items-center gap-2">
          <Anchor class="w-4 h-4" />
          请先选择入住/离店日期
        </p>
      </template>
      <template v-else>
        <div
          v-if="store.outboundFerries.length > 0 && store.outboundFerries.every(f => f.suspended)"
          class="bg-coral-50 border border-coral-400 rounded-xl p-4 flex items-center gap-3 mb-4"
        >
          <AlertTriangle class="w-5 h-5 text-coral-500 shrink-0" />
          <span class="text-coral-600 font-medium">该日期去程船班全部停航，无法上岛</span>
        </div>
        <div class="relative pl-6 space-y-4">
          <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-ocean-200" />
          <div
            v-for="ferry in store.outboundFerries"
            :key="ferry.id"
            class="relative"
          >
            <div class="absolute left-[-18px] top-4 w-3 h-3 rounded-full border-2 border-ocean-400 bg-white z-10" />
            <div
              :class="ferryCardClass(ferry, store.selectedOutboundFerryId === ferry.id)"
              @click="selectFerry(ferry, 'outbound')"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2 text-ocean-700 font-semibold">
                  <Clock class="w-4 h-4 text-ocean-500" />
                  {{ ferry.time }}
                </div>
                <button
                  class="p-1 rounded hover:bg-ocean-100 text-ocean-400 hover:text-ocean-600 transition-colors"
                  @click.stop
                >
                  <Lock class="w-4 h-4" />
                </button>
              </div>
              <div class="text-sm text-gray-700 mb-2">
                {{ ferry.departure }} → {{ ferry.arrival }}
              </div>
              <div v-if="ferry.tideInfo" class="flex items-center gap-1.5 text-xs text-ocean-500 mb-3">
                <Waves class="w-3.5 h-3.5" />
                {{ ferry.tideInfo }}
              </div>
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span class="flex items-center gap-1">
                    <Users class="w-3.5 h-3.5" />
                    余座
                  </span>
                  <span>{{ ferry.availableSeats }}/{{ ferry.totalSeats }}</span>
                </div>
                <div class="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-ocean-500 rounded-full transition-all"
                    :style="{ width: seatPercentage(ferry) + '%' }"
                  />
                </div>
              </div>
              <div class="text-sm">
                <span class="text-ocean-700 font-semibold">¥{{ ferry.adultPrice }}/人</span>
                <span class="text-xs text-gray-400 ml-2">儿童 ¥{{ ferry.childPrice }}</span>
              </div>
              <div v-if="ferry.suspended" class="mt-2 text-xs text-coral-500">
                {{ ferry.suspendReason }}
              </div>
              <span
                v-if="ferry.suspended"
                class="absolute top-3 right-3 bg-coral-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                停航
              </span>
              <span
                v-else-if="ferry.availableSeats === 0"
                class="absolute top-3 right-3 bg-sand-400 text-white text-xs px-2 py-0.5 rounded-full"
              >
                已满
              </span>
            </div>
          </div>
        </div>
      </template>
    </section>

    <section>
      <h3 class="text-lg font-semibold text-ocean-800 mb-4 flex items-center gap-2">
        <Ship class="w-5 h-5 text-ocean-500" />
        回程船班
      </h3>
      <template v-if="!store.checkOutDate">
        <p class="text-sm text-sand-600 flex items-center gap-2">
          <Anchor class="w-4 h-4" />
          请先选择入住/离店日期
        </p>
      </template>
      <template v-else>
        <div
          v-if="store.returnFerries.length > 0 && store.returnFerries.every(f => f.suspended)"
          class="bg-coral-50 border border-coral-400 rounded-xl p-4 flex items-center gap-3 mb-4"
        >
          <AlertTriangle class="w-5 h-5 text-coral-500 shrink-0" />
          <span class="text-coral-600 font-medium">该日期回程船班全部停航，无法离岛</span>
        </div>
        <div class="relative pl-6 space-y-4">
          <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-ocean-200" />
          <div
            v-for="ferry in store.returnFerries"
            :key="ferry.id"
            class="relative"
          >
            <div class="absolute left-[-18px] top-4 w-3 h-3 rounded-full border-2 border-ocean-400 bg-white z-10" />
            <div
              :class="ferryCardClass(ferry, store.selectedReturnFerryId === ferry.id)"
              @click="selectFerry(ferry, 'return')"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2 text-ocean-700 font-semibold">
                  <Clock class="w-4 h-4 text-ocean-500" />
                  {{ ferry.time }}
                </div>
                <button
                  class="p-1 rounded hover:bg-ocean-100 text-ocean-400 hover:text-ocean-600 transition-colors"
                  @click.stop
                >
                  <Lock class="w-4 h-4" />
                </button>
              </div>
              <div class="text-sm text-gray-700 mb-2">
                {{ ferry.departure }} → {{ ferry.arrival }}
              </div>
              <div v-if="ferry.tideInfo" class="flex items-center gap-1.5 text-xs text-ocean-500 mb-3">
                <Waves class="w-3.5 h-3.5" />
                {{ ferry.tideInfo }}
              </div>
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span class="flex items-center gap-1">
                    <Users class="w-3.5 h-3.5" />
                    余座
                  </span>
                  <span>{{ ferry.availableSeats }}/{{ ferry.totalSeats }}</span>
                </div>
                <div class="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-ocean-500 rounded-full transition-all"
                    :style="{ width: seatPercentage(ferry) + '%' }"
                  />
                </div>
              </div>
              <div class="text-sm">
                <span class="text-ocean-700 font-semibold">¥{{ ferry.adultPrice }}/人</span>
                <span class="text-xs text-gray-400 ml-2">儿童 ¥{{ ferry.childPrice }}</span>
              </div>
              <div v-if="ferry.suspended" class="mt-2 text-xs text-coral-500">
                {{ ferry.suspendReason }}
              </div>
              <span
                v-if="ferry.suspended"
                class="absolute top-3 right-3 bg-coral-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                停航
              </span>
              <span
                v-else-if="ferry.availableSeats === 0"
                class="absolute top-3 right-3 bg-sand-400 text-white text-xs px-2 py-0.5 rounded-full"
              >
                已满
              </span>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Ship, Anchor, AlertTriangle, Waves, Clock, Users, Lock } from 'lucide-vue-next'
import { useBookingStore } from '@/composables/useBookingStore'
import type { FerrySchedule } from '@/utils/mockData'

const store = useBookingStore()

function seatPercentage(ferry: FerrySchedule): number {
  if (ferry.totalSeats === 0) return 0
  return Math.round((ferry.availableSeats / ferry.totalSeats) * 100)
}

function ferryCardClass(ferry: FerrySchedule, isSelected: boolean): string {
  const base = 'rounded-xl border p-4 transition-all duration-200 cursor-pointer'
  if (ferry.suspended) {
    return `${base} bg-coral-50 border-coral-400 opacity-75 cursor-not-allowed hover:shadow-none`
  }
  if (ferry.availableSeats === 0) {
    return `${base} bg-sand-100 border-sand-300 cursor-not-allowed hover:shadow-none`
  }
  if (isSelected) {
    return `${base} bg-ocean-50 border-ocean-500 shadow-md`
  }
  return `${base} bg-white border-gray-200 hover:shadow-md`
}

function selectFerry(ferry: FerrySchedule, direction: 'outbound' | 'return') {
  if (ferry.suspended || ferry.availableSeats === 0) return
  if (direction === 'outbound') {
    store.selectedOutboundFerryId = store.selectedOutboundFerryId === ferry.id ? '' : ferry.id
  } else {
    store.selectedReturnFerryId = store.selectedReturnFerryId === ferry.id ? '' : ferry.id
  }
}
</script>
