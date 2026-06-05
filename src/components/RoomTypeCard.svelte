<script lang="ts">
  import { Bed, Users, AlertTriangle, ArrowRight } from 'lucide-svelte'
  import type { RoomType } from '$lib/mockData'

  let {
    roomType,
    isSelected = false,
    isAvailable = true,
    hasRoomChange = false,
    changeToRoomName = '',
    onselect,
  }: {
    roomType: RoomType
    isSelected?: boolean
    isAvailable?: boolean
    hasRoomChange?: boolean
    changeToRoomName?: string
    onselect?: () => void
  } = $props()

  let cardClass = $derived(
    [
      'relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2',
      isSelected ? 'border-ocean-500 shadow-lg shadow-ocean-500/20' : 'border-transparent hover:border-ocean-200',
      !isAvailable ? 'grayscale opacity-50 cursor-not-allowed' : '',
    ].join(' ')
  )
</script>

<div class={cardClass} onclick={() => isAvailable && onselect?.()} role="button" tabindex={0}>
  <div class="relative h-40 overflow-hidden">
    <img src={roomType.image} alt={roomType.name} class="w-full h-full object-cover" />
    {#if hasRoomChange}
      <div class="absolute top-2 left-2 flex items-center gap-1 bg-coral-500 text-white text-xs font-medium px-2 py-1 rounded-full">
        <AlertTriangle size={12} />
        <span>换房</span>
        <ArrowRight size={12} />
        <span>{changeToRoomName}</span>
      </div>
    {/if}
    {#if !isAvailable}
      <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span class="bg-coral-500 text-white text-lg font-bold px-4 py-2 rounded-lg">已满</span>
      </div>
    {/if}
  </div>

  <div class="p-4 bg-white">
    <div class="flex items-center gap-2 mb-2">
      <Bed size={18} class="text-ocean-500" />
      <h3 class="font-semibold text-gray-800">{roomType.name}</h3>
    </div>

    <p class="text-sm text-gray-500 mb-3 line-clamp-2">{roomType.description}</p>

    <div class="flex items-center gap-4 mb-2">
      <div class="text-ocean-600 font-bold">
        <span class="text-xs text-gray-400 font-normal">成人 </span>¥{roomType.adultPrice}
        <span class="text-xs text-gray-400 font-normal">/晚</span>
      </div>
      <div class="text-coral-500 font-bold">
        <span class="text-xs text-gray-400 font-normal">儿童 </span>¥{roomType.childPrice}
        <span class="text-xs text-gray-400 font-normal">/晚</span>
      </div>
    </div>

    <div class="flex items-center gap-1 text-xs text-gray-400">
      <Users size={14} />
      <span>最多 {roomType.maxGuests} 人</span>
    </div>
  </div>
</div>
