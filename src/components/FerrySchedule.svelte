<script lang="ts">
  import {
    checkInDate, checkOutDate,
    outboundFerries, returnFerries,
    selectedOutboundFerryId, selectedReturnFerryId,
  } from '$lib/bookingStore'
  import type { FerrySchedule as FerryScheduleType } from '$lib/mockData'
  import { Ship, Anchor, AlertTriangle, Waves, Clock, Users, Lock } from 'lucide-svelte'

  function seatPercent(f: FerryScheduleType): number {
    if (f.totalSeats === 0) return 0
    return Math.round((f.availableSeats / f.totalSeats) * 100)
  }

  function cardClass(f: FerryScheduleType, selected: boolean): string {
    if (f.suspended) return 'rounded-xl border p-4 bg-coral-50 border-coral-400 opacity-75'
    if (f.availableSeats === 0) return 'rounded-xl border p-4 bg-sand-100 border-sand-300'
    if (selected) return 'rounded-xl border p-4 bg-ocean-50 border-ocean-500 shadow-md'
    return 'rounded-xl border p-4 bg-white border-gray-200 hover:shadow-md transition-shadow'
  }

  function selectFerry(f: FerryScheduleType, dir: 'outbound' | 'return') {
    if (dir === 'outbound') {
      const current = $selectedOutboundFerryId
      selectedOutboundFerryId.set(f.id === current ? '' : f.id)
    } else {
      const current = $selectedReturnFerryId
      selectedReturnFerryId.set(f.id === current ? '' : f.id)
    }
  }


</script>

<div class="space-y-8">
  <section>
    <h3 class="text-lg font-semibold text-ocean-800 mb-4 flex items-center gap-2">
      <Ship class="w-5 h-5 text-ocean-500" />
      去程船班
    </h3>

    {#if !$checkInDate}
      <p class="text-sm text-sand-600 flex items-center gap-2">
        <Anchor class="w-4 h-4" />
        请先选择入住日期
      </p>
    {:else if $outboundFerries.length > 0 && $outboundFerries.every(f => f.suspended)}
      <div class="bg-coral-50 border-2 border-coral-400 rounded-xl p-4 flex items-start gap-3 mb-4">
        <AlertTriangle class="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
        <div>
          <span class="text-coral-600 font-semibold block">去程船班全部停航，无法上岛</span>
          <span class="text-coral-500 text-sm">房间仍有库存但因船班停航无法完成预订，需等待复航或更换出行日期</span>
        </div>
      </div>
    {/if}

    {#if $checkInDate && $outboundFerries.length > 0}
      <div class="relative pl-6 space-y-4">
        <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-ocean-200"></div>
        {#each $outboundFerries as ferry (ferry.id)}
          <div class="relative">
            <div class="absolute left-[-18px] top-4 w-3 h-3 rounded-full border-2 border-ocean-400 bg-white z-10"></div>
            <div class="{cardClass(ferry, $selectedOutboundFerryId === ferry.id)}" onclick={() => selectFerry(ferry, 'outbound')} role="button" tabindex="0">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2 text-ocean-700 font-semibold">
                  <Clock class="w-4 h-4 text-ocean-500" />
                  {ferry.time}
                </div>
                <button class="p-1 rounded hover:bg-ocean-100 text-ocean-400 hover:text-ocean-600 transition-colors" onclick={(e) => e.stopPropagation()}>
                  <Lock class="w-4 h-4" />
                </button>
              </div>
              <div class="text-sm text-gray-700 mb-2">
                {ferry.departure} → {ferry.arrival}
              </div>
              {#if ferry.tideInfo}
                <div class="flex items-center gap-1.5 text-xs text-ocean-500 mb-3">
                  <Waves class="w-3.5 h-3.5" />
                  {ferry.tideInfo}
                </div>
              {/if}
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" /> 余座</span>
                  <span>{ferry.availableSeats}/{ferry.totalSeats}</span>
                </div>
                <div class="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                  <div class="h-full bg-ocean-500 rounded-full transition-all" style="width: {seatPercent(ferry)}%"></div>
                </div>
              </div>
              <div class="text-sm">
                <span class="text-ocean-700 font-semibold">¥{ferry.adultPrice}/人</span>
                <span class="text-xs text-gray-400 ml-2">儿童 ¥{ferry.childPrice}</span>
              </div>
              {#if ferry.suspended && ferry.suspendReason}
                <div class="mt-2 text-xs text-coral-500">{ferry.suspendReason}</div>
              {/if}
              {#if ferry.suspended}
                <span class="absolute top-3 right-3 bg-coral-500 text-white text-xs px-2 py-0.5 rounded-full">停航</span>
              {:else if ferry.availableSeats === 0}
                <span class="absolute top-3 right-3 bg-sand-400 text-white text-xs px-2 py-0.5 rounded-full">已满</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section>
    <h3 class="text-lg font-semibold text-ocean-800 mb-4 flex items-center gap-2">
      <Ship class="w-5 h-5 text-ocean-500" />
      回程船班
    </h3>

    {#if !$checkOutDate}
      <p class="text-sm text-sand-600 flex items-center gap-2">
        <Anchor class="w-4 h-4" />
        请先选择离店日期
      </p>
    {:else if $returnFerries.length > 0 && $returnFerries.every(f => f.suspended)}
      <div class="bg-coral-50 border-2 border-coral-400 rounded-xl p-4 flex items-start gap-3 mb-4">
        <AlertTriangle class="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
        <div>
          <span class="text-coral-600 font-semibold block">回程船班全部停航，无法离岛</span>
          <span class="text-coral-500 text-sm">需等待复航或调整离店日期</span>
        </div>
      </div>
    {/if}

    {#if $checkOutDate && $returnFerries.length > 0}
      <div class="relative pl-6 space-y-4">
        <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-ocean-200"></div>
        {#each $returnFerries as ferry (ferry.id)}
          <div class="relative">
            <div class="absolute left-[-18px] top-4 w-3 h-3 rounded-full border-2 border-ocean-400 bg-white z-10"></div>
            <div class="{cardClass(ferry, $selectedReturnFerryId === ferry.id)}" onclick={() => selectFerry(ferry, 'return')} role="button" tabindex="0">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2 text-ocean-700 font-semibold">
                  <Clock class="w-4 h-4 text-ocean-500" />
                  {ferry.time}
                </div>
                <button class="p-1 rounded hover:bg-ocean-100 text-ocean-400 hover:text-ocean-600 transition-colors" onclick={(e) => e.stopPropagation()}>
                  <Lock class="w-4 h-4" />
                </button>
              </div>
              <div class="text-sm text-gray-700 mb-2">
                {ferry.departure} → {ferry.arrival}
              </div>
              {#if ferry.tideInfo}
                <div class="flex items-center gap-1.5 text-xs text-ocean-500 mb-3">
                  <Waves class="w-3.5 h-3.5" />
                  {ferry.tideInfo}
                </div>
              {/if}
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" /> 余座</span>
                  <span>{ferry.availableSeats}/{ferry.totalSeats}</span>
                </div>
                <div class="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                  <div class="h-full bg-ocean-500 rounded-full transition-all" style="width: {seatPercent(ferry)}%"></div>
                </div>
              </div>
              <div class="text-sm">
                <span class="text-ocean-700 font-semibold">¥{ferry.adultPrice}/人</span>
                <span class="text-xs text-gray-400 ml-2">儿童 ¥{ferry.childPrice}</span>
              </div>
              {#if ferry.suspended && ferry.suspendReason}
                <div class="mt-2 text-xs text-coral-500">{ferry.suspendReason}</div>
              {/if}
              {#if ferry.suspended}
                <span class="absolute top-3 right-3 bg-coral-500 text-white text-xs px-2 py-0.5 rounded-full">停航</span>
              {:else if ferry.availableSeats === 0}
                <span class="absolute top-3 right-3 bg-sand-400 text-white text-xs px-2 py-0.5 rounded-full">已满</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
