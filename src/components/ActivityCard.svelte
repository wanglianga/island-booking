<script lang="ts">
  import {
    dateRange,
    availableActivitiesForDates,
    selectedActivitySlotKeys,
    toggleActivitySlot,
  } from '$lib/bookingStore'
  import { Palmtree, Clock, Users, Check } from 'lucide-svelte'
  import type { ActivitySlot } from '$lib/mockData'

  function getSlotKey(slot: ActivitySlot): string {
    return `${slot.activityId}-${slot.date}-${slot.time}`
  }

  function isSlotSelected(slot: ActivitySlot): boolean {
    return $selectedActivitySlotKeys.includes(getSlotKey(slot))
  }

  function isSlotFull(slot: ActivitySlot): boolean {
    return slot.remaining <= 0
  }

  function isSlotLow(slot: ActivitySlot): boolean {
    return slot.remaining > 0 && slot.remaining <= slot.totalQuota * 0.3
  }

  function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
</script>

{#if $dateRange.length === 0}
  <div class="text-sm text-gray-400 bg-gray-50 rounded-xl p-6 text-center">
    请先选择入住和离店日期
  </div>
{:else if $availableActivitiesForDates.length === 0}
  <div class="text-sm text-gray-400 bg-gray-50 rounded-xl p-6 text-center">
    所选日期暂无可用活动
  </div>
{:else}
  <div class="space-y-4">
    {#each $availableActivitiesForDates as { activity, slots } (activity.id)}
      <div class="bg-white rounded-2xl overflow-hidden">
        <div class="relative h-36">
          <img src={activity.image} alt={activity.name} class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div class="absolute bottom-3 left-4 flex items-center gap-2">
            <Palmtree size={18} class="text-white" />
            <h3 class="font-semibold text-white">{activity.name}</h3>
          </div>
        </div>

        <div class="p-4">
          <p class="text-sm text-gray-500 mb-3">{activity.description}</p>

          <div class="space-y-2">
            {#each slots as slot (getSlotKey(slot))}
              {@const full = isSlotFull(slot)}
              {@const low = isSlotLow(slot)}
              {@const selected = isSlotSelected(slot)}
              {@const key = getSlotKey(slot)}

              <div
                class="flex items-center gap-3 rounded-lg p-3 transition-colors {full
                  ? 'bg-coral-100 opacity-60'
                  : low
                    ? 'bg-sand-100'
                    : 'bg-gray-50 hover:bg-ocean-50'}"
              >
                <button
                  onclick={() => toggleActivitySlot(key)}
                  disabled={full}
                  class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors {selected
                    ? 'bg-ocean-500 border-ocean-500'
                    : full
                      ? 'border-gray-300 cursor-not-allowed'
                      : 'border-gray-300 hover:border-ocean-400'}"
                >
                  {#if selected}
                    <Check size={12} class="text-white" />
                  {/if}
                </button>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <Clock size={12} class="text-gray-400" />
                    <span class="text-sm font-medium text-gray-700">{formatShortDate(slot.date)}</span>
                    <span class="text-sm text-gray-500">{slot.time}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full {full
                        ? 'bg-coral-400'
                        : low
                          ? 'bg-sand-400'
                          : 'bg-ocean-400'}"
                      style="width: {((slot.totalQuota - slot.remaining) / slot.totalQuota) * 100}%"
                    ></div>
                  </div>
                  <div class="flex items-center gap-0.5">
                    <Users size={10} class="text-gray-400" />
                    <span class="text-xs {full ? 'text-coral-500 font-medium' : 'text-gray-400'}">
                      {slot.remaining}/{slot.totalQuota}
                    </span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
