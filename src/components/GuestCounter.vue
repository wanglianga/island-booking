<template>
  <div class="rounded-xl bg-white p-5 shadow-sm border border-ocean-100">
    <div class="flex items-center gap-2 mb-4">
      <User class="w-5 h-5 text-ocean-600" />
      <h3 class="text-lg font-semibold text-ocean-800">游客人数</h3>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <User class="w-4 h-4 text-ocean-500" />
          <span class="text-sm text-gray-700">成人</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            :disabled="store.adults <= 1"
            class="rounded-full w-8 h-8 flex items-center justify-center bg-ocean-100 text-ocean-600 hover:bg-ocean-200 transition-colors"
            :class="{ 'opacity-30 cursor-not-allowed': store.adults <= 1 }"
            @click="store.adults--"
          >
            <Minus class="w-4 h-4" />
          </button>
          <span class="w-6 text-center text-sm font-medium text-ocean-800">{{ store.adults }}</span>
          <button
            :disabled="store.adults >= 6"
            class="rounded-full w-8 h-8 flex items-center justify-center bg-ocean-100 text-ocean-600 hover:bg-ocean-200 transition-colors"
            :class="{ 'opacity-30 cursor-not-allowed': store.adults >= 6 }"
            @click="store.adults++"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Baby class="w-4 h-4 text-ocean-500" />
          <span class="text-sm text-gray-700">儿童</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            :disabled="store.children <= 0"
            class="rounded-full w-8 h-8 flex items-center justify-center bg-ocean-100 text-ocean-600 hover:bg-ocean-200 transition-colors"
            :class="{ 'opacity-30 cursor-not-allowed': store.children <= 0 }"
            @click="store.children--"
          >
            <Minus class="w-4 h-4" />
          </button>
          <span class="w-6 text-center text-sm font-medium text-ocean-800">{{ store.children }}</span>
          <button
            :disabled="store.children >= 4"
            class="rounded-full w-8 h-8 flex items-center justify-center bg-ocean-100 text-ocean-600 hover:bg-ocean-200 transition-colors"
            :class="{ 'opacity-30 cursor-not-allowed': store.children >= 4 }"
            @click="store.children++"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="store.children > 0 && store.selectedRoomType"
      class="mt-3 flex items-start gap-2 rounded-lg bg-coral-50 p-3 text-xs text-coral-600"
    >
      <Info class="w-4 h-4 shrink-0 mt-0.5" />
      <span>儿童票价 ¥{{ store.selectedRoomType.childPrice }}/晚（成人 ¥{{ store.selectedRoomType.adultPrice }}/晚），差价 ¥{{ store.selectedRoomType.adultPrice - store.selectedRoomType.childPrice }}/晚</span>
    </div>

    <div class="mt-4 pt-3 border-t border-ocean-100 text-sm text-ocean-700 font-medium">
      {{ store.adults + store.children }}位游客
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '@/composables/useBookingStore'
import { User, Baby, Minus, Plus, Info } from 'lucide-vue-next'

const store = useBookingStore()
</script>
