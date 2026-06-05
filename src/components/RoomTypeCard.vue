<script setup lang="ts">
import { Bed, Users, AlertTriangle, ArrowRight } from 'lucide-vue-next'

interface RoomTypeProp {
  id: string
  name: string
  image: string
  adultPrice: number
  childPrice: number
  maxGuests: number
  description: string
}

const props = defineProps<{
  roomType: RoomTypeProp
  isSelected: boolean
  isAvailable: boolean
  hasRoomChange: boolean
  changeToRoomName?: string
}>()

const emit = defineEmits<{
  select: []
}>()

function handleClick() {
  if (!props.isAvailable) return
  emit('select')
}
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'relative rounded-xl overflow-hidden transition-shadow duration-300',
      isAvailable ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed',
      isSelected ? 'border-2 border-ocean-500 bg-ocean-50/40' : 'border border-gray-200 bg-white',
      !isAvailable && 'grayscale opacity-50',
    ]"
  >
    <div class="relative">
      <img
        :src="roomType.image"
        :alt="roomType.name"
        class="w-full aspect-video object-cover rounded-t-xl"
      />
      <div
        v-if="!isAvailable"
        class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl"
      >
        <span class="text-white font-semibold text-lg">已满</span>
      </div>
    </div>

    <div class="p-4 space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="font-serif font-semibold text-gray-900">{{ roomType.name }}</h3>
        <Bed class="w-4 h-4 text-ocean-400 shrink-0" />
      </div>

      <div>
        <div class="flex items-baseline gap-1">
          <span class="text-ocean-600 font-semibold">¥{{ roomType.adultPrice }}</span>
          <span class="text-gray-500 text-xs">/晚</span>
          <span class="text-gray-400 text-xs ml-1">成人</span>
        </div>
        <div class="flex items-baseline gap-1 text-sm">
          <span class="text-ocean-500">¥{{ roomType.childPrice }}</span>
          <span class="text-gray-400 text-xs">/晚</span>
          <span class="text-gray-400 text-xs ml-1">儿童</span>
        </div>
      </div>

      <div class="flex items-center gap-1 text-gray-500 text-sm">
        <Users class="w-3.5 h-3.5" />
        <span>{{ roomType.maxGuests }}人</span>
      </div>

      <p class="text-sm text-gray-500">{{ roomType.description }}</p>

      <div
        v-if="hasRoomChange"
        class="flex items-center gap-1.5 mt-2"
      >
        <span class="bg-coral-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
          <AlertTriangle class="w-3 h-3" />
          换房
        </span>
        <span class="flex items-center gap-1 text-xs text-coral-600">
          <ArrowRight class="w-3 h-3" />
          {{ changeToRoomName }}
        </span>
      </div>
    </div>
  </div>
</template>
