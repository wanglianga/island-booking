<template>
  <div class="sticky bottom-0 z-50 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
    <div
      v-if="expanded"
      class="px-4 pt-3 pb-2 border-b border-ocean-100"
    >
      <div class="space-y-2 text-sm text-gray-700">
        <div v-if="store.selectedRoomType && store.nights > 0">
          <span class="text-ocean-600 font-medium">住宿</span>
          <span class="ml-2">
            {{ store.nights }}晚 × {{ store.selectedRoomType.name }} × {{ store.adults }}成人{{ store.children > 0 ? store.children + '儿童' : '' }}
          </span>
        </div>
        <div v-if="store.selectedOutboundFerry">
          <span class="text-ocean-600 font-medium">去程船票</span>
          <span class="ml-2">
            {{ store.selectedOutboundFerry.time }} {{ store.selectedOutboundFerry.departure }} → {{ store.selectedOutboundFerry.arrival }}
            × {{ store.adults }}成人{{ store.children > 0 ? store.children + '儿童' : '' }}
          </span>
        </div>
        <div v-if="store.selectedReturnFerry">
          <span class="text-ocean-600 font-medium">回程船票</span>
          <span class="ml-2">
            {{ store.selectedReturnFerry.time }} {{ store.selectedReturnFerry.departure }} → {{ store.selectedReturnFerry.arrival }}
            × {{ store.adults }}成人{{ store.children > 0 ? store.children + '儿童' : '' }}
          </span>
        </div>
        <div
          v-if="store.children > 0 && store.selectedRoomType"
          class="flex items-center gap-1.5 text-xs text-coral-600"
        >
          <AlertTriangle class="w-3.5 h-3.5" />
          儿童票价 ¥{{ store.selectedRoomType.childPrice }}/晚，与成人差价 ¥{{ store.selectedRoomType.adultPrice - store.selectedRoomType.childPrice }}/晚
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 text-sm text-gray-600">
          <span v-if="store.selectedRoomType && store.nights > 0">
            住宿 ¥{{ roomTotal }}
          </span>
          <span v-if="hasFerry">
            船票 ¥{{ ferryTotal }}
          </span>
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <ShoppingBag class="w-4 h-4 text-ocean-500" />
          <span class="font-serif font-bold text-lg text-ocean-700">
            合计 ¥{{ store.totalPrice }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="p-1.5 rounded-full hover:bg-ocean-50 text-ocean-400 transition-colors"
          @click="expanded = !expanded"
        >
          <ChevronUp v-if="expanded" class="w-5 h-5" />
          <ChevronDown v-else class="w-5 h-5" />
        </button>

        <div class="relative">
          <button
            v-if="hasErrorConflict"
            disabled
            class="flex items-center gap-2 rounded-full px-8 py-3 bg-gray-300 text-gray-500 cursor-not-allowed text-sm font-medium"
          >
            <AlertTriangle class="w-4 h-4" />
            确认预订
          </button>
          <button
            v-else
            class="bg-ocean-500 hover:bg-ocean-600 text-white rounded-full px-8 py-3 text-sm font-medium transition-colors"
          >
            确认预订
          </button>
          <span
            v-if="store.conflicts.length > 0"
            class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-medium"
          >
            {{ store.conflicts.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookingStore } from '@/composables/useBookingStore'
import { ShoppingBag, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-vue-next'

const store = useBookingStore()
const expanded = ref(false)

const roomTotal = computed(() => {
  if (!store.selectedRoomType || store.nights === 0) return 0
  return store.selectedRoomType.adultPrice * store.adults * store.nights
    + store.selectedRoomType.childPrice * store.children * store.nights
})

const ferryTotal = computed(() => {
  let total = 0
  if (store.selectedOutboundFerry) {
    total += store.selectedOutboundFerry.adultPrice * store.adults
    total += store.selectedOutboundFerry.childPrice * store.children
  }
  if (store.selectedReturnFerry) {
    total += store.selectedReturnFerry.adultPrice * store.adults
    total += store.selectedReturnFerry.childPrice * store.children
  }
  return total
})

const hasFerry = computed(() => !!(store.selectedOutboundFerry || store.selectedReturnFerry))

const hasErrorConflict = computed(() => store.conflicts.some(c => c.severity === 'error'))
</script>
