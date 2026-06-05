<script lang="ts">
  import {
    selectedRoomType,
    nights,
    adults,
    children,
    selectedOutboundFerry,
    selectedReturnFerry,
    totalPrice,
    conflicts,
  } from '$lib/bookingStore'
  import {
    ShoppingBag,
    AlertTriangle,
    ChevronUp,
    ChevronDown,
  } from 'lucide-svelte'

  let expanded = $state(false)

  let hasErrorConflict = $derived($conflicts.some((c) => c.severity === 'error'))
  let hasFerrySuspended = $derived($conflicts.some((c) => c.type === 'ferry-suspended'))
  let errorCount = $derived($conflicts.filter((c) => c.severity === 'error').length)

  let roomSubtotal = $derived(
    $selectedRoomType && $nights > 0
      ? $selectedRoomType.adultPrice * $adults * $nights +
        $selectedRoomType.childPrice * $children * $nights
      : 0
  )

  let outboundFerrySubtotal = $derived(
    $selectedOutboundFerry
      ? $selectedOutboundFerry.adultPrice * $adults +
        $selectedOutboundFerry.childPrice * $children
      : 0
  )

  let returnFerrySubtotal = $derived(
    $selectedReturnFerry
      ? $selectedReturnFerry.adultPrice * $adults +
        $selectedReturnFerry.childPrice * $children
      : 0
  )

  let hasRoomAvailWithFerrySuspended = $derived(
    hasFerrySuspended && $selectedRoomType && $nights > 0
  )
</script>

<div class="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-50">
  {#if expanded}
    <div class="px-4 pt-3 pb-2 border-b border-gray-100">
      <div class="space-y-1.5">
        {#if $selectedRoomType && $nights > 0}
          <div class="flex justify-between text-xs text-gray-500">
            <span>{$selectedRoomType.name} × {$nights}晚（{$adults}成人{#if $children > 0} + {$children}儿童{/if}）</span>
            <span class="font-serif font-bold text-ocean-700">¥{roomSubtotal}</span>
          </div>
        {/if}
        {#if $selectedOutboundFerry}
          <div class="flex justify-between text-xs text-gray-500">
            <span>去程船班 × {$adults}成人{#if $children > 0} + {$children}儿童{/if}</span>
            <span class="font-serif font-bold text-ocean-700">¥{outboundFerrySubtotal}</span>
          </div>
        {/if}
        {#if $selectedReturnFerry}
          <div class="flex justify-between text-xs text-gray-500">
            <span>回程船班 × {$adults}成人{#if $children > 0} + {$children}儿童{/if}</span>
            <span class="font-serif font-bold text-ocean-700">¥{returnFerrySubtotal}</span>
          </div>
        {/if}
      </div>

      {#if hasRoomAvailWithFerrySuspended}
        <div class="mt-2 flex items-start gap-1.5 rounded-lg bg-coral-50 px-3 py-2 border border-coral-200">
          <AlertTriangle size={14} class="text-coral-500 mt-0.5 shrink-0" />
          <span class="text-[11px] text-coral-600 leading-relaxed">房间仍有库存但船班停航，订单无法生效，需等待复航或更换出行日期</span>
        </div>
      {/if}

      {#if $conflicts.length > 0}
        <div class="mt-2 space-y-1">
          {#each $conflicts as conflict}
            <div class="flex items-start gap-1.5">
              <AlertTriangle size={11} class={conflict.severity === 'error' ? 'text-coral-500' : 'text-sand-500'} />
              <span class="text-[10px] {conflict.severity === 'error' ? 'text-coral-600' : 'text-sand-600'} leading-relaxed">{conflict.message}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div class="flex items-center justify-between px-4 py-3">
    <div class="flex items-center gap-3">
      <button
        class="flex items-center gap-1 text-ocean-400 text-xs hover:text-ocean-600 transition-colors"
        onclick={() => expanded = !expanded}
      >
        <ShoppingBag size={14} />
        <span>明细</span>
        {#if expanded}
          <ChevronDown size={12} />
        {:else}
          <ChevronUp size={12} />
        {/if}
      </button>
      <div class="flex items-baseline gap-1">
        <span class="text-xs text-gray-400">合计</span>
        <span class="font-serif font-bold text-xl text-ocean-700">¥{$totalPrice}</span>
      </div>
    </div>

    <div class="relative">
      {#if hasErrorConflict}
        <button
          disabled
          class="flex items-center gap-2 rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
        >
          <AlertTriangle size={16} />
          {#if hasFerrySuspended}
            无法预订：船班停航
          {:else}
            存在冲突，无法预订
          {/if}
        </button>
      {:else}
        <button class="rounded-xl bg-ocean-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-ocean-600 active:bg-ocean-700 transition-colors shadow-sm">
          确认预订
        </button>
      {/if}
      {#if errorCount > 0}
        <span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-coral-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
          {errorCount}
        </span>
      {/if}
    </div>
  </div>
</div>
