<script lang="ts">
  import { adults, children, selectedRoomType } from '$lib/bookingStore'
  import { User, Baby, Minus, Plus, Info } from 'lucide-svelte'

  function adjustAdults(delta: number) {
    $adults = Math.max(1, Math.min(6, $adults + delta))
  }

  function adjustChildren(delta: number) {
    $children = Math.max(0, Math.min(4, $children + delta))
  }

  let showChildInfo = $derived($children > 0 && $selectedRoomType)
  let priceDiff = $derived(
    $selectedRoomType ? $selectedRoomType.adultPrice - $selectedRoomType.childPrice : 0
  )
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between bg-white rounded-xl p-4">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-ocean-50 flex items-center justify-center">
        <User size={18} class="text-ocean-500" />
      </div>
      <div>
        <div class="font-medium text-gray-800">成人</div>
        <div class="text-xs text-gray-400">1-6 位</div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button
        onclick={() => adjustAdults(-1)}
        disabled={$adults <= 1}
        class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-ocean-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={16} />
      </button>
      <span class="w-6 text-center font-semibold text-gray-800">{$adults}</span>
      <button
        onclick={() => adjustAdults(1)}
        disabled={$adults >= 6}
        class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-ocean-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>

  <div class="flex items-center justify-between bg-white rounded-xl p-4">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-coral-50 flex items-center justify-center">
        <Baby size={18} class="text-coral-500" />
      </div>
      <div>
        <div class="font-medium text-gray-800">儿童</div>
        <div class="text-xs text-gray-400">0-4 位</div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button
        onclick={() => adjustChildren(-1)}
        disabled={$children <= 0}
        class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-coral-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={16} />
      </button>
      <span class="w-6 text-center font-semibold text-gray-800">{$children}</span>
      <button
        onclick={() => adjustChildren(1)}
        disabled={$children >= 4}
        class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-coral-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>

  {#if showChildInfo}
    <div class="flex items-start gap-2 bg-coral-50 border border-coral-100 rounded-xl p-3">
      <Info size={16} class="text-coral-500 mt-0.5 shrink-0" />
      <div class="text-sm text-coral-600">
        儿童票价 ¥{$selectedRoomType!.childPrice}/晚，比成人低 ¥{priceDiff}/晚
      </div>
    </div>
  {/if}
</div>
