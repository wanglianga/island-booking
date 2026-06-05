<script setup lang="ts">
import { Palmtree, Clock, Users, Check } from 'lucide-vue-next'
import { useBookingStore } from '@/composables/useBookingStore'

const store = useBookingStore()

function slotKey(activityId: string, date: string, time: string) {
  return `${activityId}-${date}-${time}`
}

function isSelected(activityId: string, date: string, time: string) {
  return store.selectedActivitySlotIds.includes(slotKey(activityId, date, time))
}

function quotaWidth(remaining: number, total: number) {
  return `${Math.max(0, (remaining / total) * 100)}%`
}
</script>

<template>
  <section>
    <div class="flex items-center gap-2 mb-4">
      <Palmtree class="w-5 h-5 text-ocean-500" />
      <h2 class="font-serif font-semibold text-lg text-gray-900">岛上活动</h2>
    </div>

    <div v-if="store.dateRange.length === 0" class="text-center py-8 text-gray-400">
      请先选择入住日期
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="{ activity, slots } in store.availableActivitiesForDates"
        :key="activity.id"
        class="rounded-xl overflow-hidden border border-gray-200 bg-white"
      >
        <img
          :src="activity.image"
          :alt="activity.name"
          class="w-full h-32 object-cover rounded-t-xl"
        />

        <div class="p-4 space-y-3">
          <h3 class="font-serif font-semibold text-gray-900">{{ activity.name }}</h3>
          <p class="text-sm text-gray-500">{{ activity.description }}</p>

          <div class="space-y-2">
            <div
              v-for="slot in slots"
              :key="slotKey(activity.id, slot.date, slot.time)"
              @click="slot.remaining > 0 && store.toggleActivitySlot(slotKey(activity.id, slot.date, slot.time))"
              :class="[
                'relative flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                slot.remaining <= 0
                  ? 'bg-coral-100 cursor-not-allowed'
                  : slot.remaining <= 3
                    ? 'bg-sand-100'
                    : 'bg-gray-50 hover:bg-gray-100',
                isSelected(activity.id, slot.date, slot.time) && 'border-2 border-ocean-500',
                !isSelected(activity.id, slot.date, slot.time) && 'border-2 border-transparent',
              ]"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-gray-700">{{ slot.date }}</span>
                  <Clock class="w-3.5 h-3.5 text-ocean-400" />
                  <span class="text-gray-700">{{ slot.time }}</span>
                </div>

                <div class="mt-1.5 flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-ocean-500 rounded-full transition-all"
                      :style="{ width: quotaWidth(slot.remaining, slot.totalQuota) }"
                    />
                  </div>
                  <span
                    v-if="slot.remaining <= 0"
                    class="text-xs text-coral-500 font-medium shrink-0"
                  >
                    已满
                  </span>
                  <span
                    v-else-if="slot.remaining <= 3"
                    class="text-xs text-sand-600 font-medium shrink-0"
                  >
                    仅剩{{ slot.remaining }}位
                  </span>
                  <span
                    v-else
                    class="text-xs text-gray-400 shrink-0"
                  >
                    余{{ slot.remaining }}位
                  </span>
                </div>
              </div>

              <div
                :class="[
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                  isSelected(activity.id, slot.date, slot.time)
                    ? 'bg-ocean-500 border-ocean-500'
                    : 'border-gray-300',
                ]"
              >
                <Check
                  v-if="isSelected(activity.id, slot.date, slot.time)"
                  class="w-3.5 h-3.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
