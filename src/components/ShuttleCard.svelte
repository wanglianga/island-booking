<script lang="ts">
  import {
    outboundShuttles,
    returnShuttles,
    selectedOutboundFerryId,
    selectedReturnFerryId,
    selectedOutboundShuttleId,
    selectedReturnShuttleId,
    outboundFerries,
    returnFerries,
  } from '$lib/bookingStore'
  import { Bus, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-svelte'
  import type { ShuttleSchedule } from '$lib/mockData'

  function getConnectionStatus(shuttle: ShuttleSchedule, selectedFerryId: string): 'connected' | 'disconnected' | 'full' {
    if (shuttle.booked >= shuttle.capacity) return 'full'
    if (shuttle.ferryScheduleId === selectedFerryId && shuttle.connectsFerry) return 'connected'
    return 'disconnected'
  }

  function selectOutboundShuttle(id: string) {
    $selectedOutboundShuttleId = $selectedOutboundShuttleId === id ? '' : id
  }

  function selectReturnShuttle(id: string) {
    $selectedReturnShuttleId = $selectedReturnShuttleId === id ? '' : id
  }

  function hasFerryConnectionWarning(shuttle: ShuttleSchedule, selectedFerryId: string): boolean {
    if (!selectedFerryId) return false
    if (shuttle.booked >= shuttle.capacity) return false
    return shuttle.ferryScheduleId !== selectedFerryId || !shuttle.connectsFerry
  }
</script>

<div class="space-y-6">
  <div>
    <div class="flex items-center gap-2 mb-3">
      <Bus size={18} class="text-ocean-500" />
      <h3 class="font-semibold text-gray-800">去程接驳</h3>
    </div>

    {#if !$selectedOutboundFerryId}
      <div class="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
        请先选择船班
      </div>
    {:else if $outboundShuttles.length === 0}
      <div class="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
        暂无接驳车
      </div>
    {:else}
      <div class="space-y-3">
        {#each $outboundShuttles as shuttle (shuttle.id)}
          {@const status = getConnectionStatus(shuttle, $selectedOutboundFerryId)}
          {@const isSelected = $selectedOutboundShuttleId === shuttle.id}
          {@const hasWarning = hasFerryConnectionWarning(shuttle, $selectedOutboundFerryId)}

          <div
            class="bg-white rounded-xl p-4 border-2 transition-colors cursor-pointer {isSelected
              ? 'border-ocean-500'
              : 'border-transparent hover:border-ocean-200'}"
            onclick={() => selectOutboundShuttle(shuttle.id)}
            role="button"
            tabindex={0}
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Clock size={14} class="text-gray-400" />
                <span class="font-medium text-gray-800">{shuttle.time}</span>
                <span class="text-sm text-gray-400">{shuttle.departure}</span>
              </div>

              {#if status === 'connected'}
                <span class="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  可衔接
                </span>
              {:else if status === 'full'}
                <span class="flex items-center gap-1 text-xs font-medium text-sand-600 bg-sand-100 px-2 py-1 rounded-full">
                  已满
                </span>
              {:else}
                <span class="flex items-center gap-1 text-xs font-medium text-coral-500 bg-coral-50 px-2 py-1 rounded-full">
                  <XCircle size={12} />
                  无法衔接
                </span>
              {/if}
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all {status === 'full'
                    ? 'bg-sand-400'
                    : status === 'connected'
                      ? 'bg-green-400'
                      : 'bg-coral-300'}"
                  style="width: {(shuttle.booked / shuttle.capacity) * 100}%"
                ></div>
              </div>
              <span class="text-xs text-gray-400 shrink-0">{shuttle.booked}/{shuttle.capacity}</span>
            </div>

            {#if hasWarning && isSelected}
              <div class="flex items-start gap-2 mt-2 bg-coral-50 border border-coral-100 rounded-lg p-2">
                <AlertTriangle size={14} class="text-coral-500 mt-0.5 shrink-0" />
                <span class="text-xs text-coral-600">
                  该接驳车无法衔接所选船班{shuttle.note ? '：' + shuttle.note : ''}
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div>
    <div class="flex items-center gap-2 mb-3">
      <Bus size={18} class="text-coral-500" />
      <h3 class="font-semibold text-gray-800">回程接驳</h3>
    </div>

    {#if !$selectedReturnFerryId}
      <div class="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
        请先选择船班
      </div>
    {:else if $returnShuttles.length === 0}
      <div class="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
        暂无接驳车
      </div>
    {:else}
      <div class="space-y-3">
        {#each $returnShuttles as shuttle (shuttle.id)}
          {@const status = getConnectionStatus(shuttle, $selectedReturnFerryId)}
          {@const isSelected = $selectedReturnShuttleId === shuttle.id}
          {@const hasWarning = hasFerryConnectionWarning(shuttle, $selectedReturnFerryId)}

          <div
            class="bg-white rounded-xl p-4 border-2 transition-colors cursor-pointer {isSelected
              ? 'border-ocean-500'
              : 'border-transparent hover:border-ocean-200'}"
            onclick={() => selectReturnShuttle(shuttle.id)}
            role="button"
            tabindex={0}
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Clock size={14} class="text-gray-400" />
                <span class="font-medium text-gray-800">{shuttle.time}</span>
                <span class="text-sm text-gray-400">{shuttle.departure}</span>
              </div>

              {#if status === 'connected'}
                <span class="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  可衔接
                </span>
              {:else if status === 'full'}
                <span class="flex items-center gap-1 text-xs font-medium text-sand-600 bg-sand-100 px-2 py-1 rounded-full">
                  已满
                </span>
              {:else}
                <span class="flex items-center gap-1 text-xs font-medium text-coral-500 bg-coral-50 px-2 py-1 rounded-full">
                  <XCircle size={12} />
                  无法衔接
                </span>
              {/if}
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all {status === 'full'
                    ? 'bg-sand-400'
                    : status === 'connected'
                      ? 'bg-green-400'
                      : 'bg-coral-300'}"
                  style="width: {(shuttle.booked / shuttle.capacity) * 100}%"
                ></div>
              </div>
              <span class="text-xs text-gray-400 shrink-0">{shuttle.booked}/{shuttle.capacity}</span>
            </div>

            {#if hasWarning && isSelected}
              <div class="flex items-start gap-2 mt-2 bg-coral-50 border border-coral-100 rounded-lg p-2">
                <AlertTriangle size={14} class="text-coral-500 mt-0.5 shrink-0" />
                <span class="text-xs text-coral-600">
                  该接驳车无法衔接所选船班{shuttle.note ? '：' + shuttle.note : ''}
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
