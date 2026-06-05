<script lang="ts">
  import {
    roomStatus,
    ferryStatus,
    shuttleStatus,
    activityStatus,
    conflicts,
  } from '$lib/bookingStore'
  import {
    Bed,
    Ship,
    Bus,
    Palmtree,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
  } from 'lucide-svelte'

  let expanded = $state(false)
  let hasConflicts = $derived($conflicts.length > 0)

  const statusCards = $derived([
    { label: '房间', icon: Bed, status: $roomStatus, color: 'ocean' },
    { label: '船班', icon: Ship, status: $ferryStatus, color: 'ocean' },
    { label: '接驳', icon: Bus, status: $shuttleStatus, color: 'ocean' },
    { label: '活动', icon: Palmtree, status: $activityStatus, color: 'ocean' },
  ])

  function statusColor(status: string) {
    if (status === 'ok') return 'text-emerald-500'
    if (status === 'warning') return 'text-sand-500'
    return 'text-coral-500'
  }

  function statusBg(status: string) {
    if (status === 'ok') return 'bg-emerald-50'
    if (status === 'warning') return 'bg-sand-50'
    return 'bg-coral-50'
  }

  function borderColor(severity: string) {
    if (severity === 'error') return 'border-l-coral-500'
    if (severity === 'warning') return 'border-l-sand-500'
    return 'border-l-ocean-400'
  }

  function conflictIconColor(severity: string) {
    if (severity === 'error') return 'text-coral-500'
    if (severity === 'warning') return 'text-sand-500'
    return 'text-ocean-400'
  }
</script>

<div class="space-y-4">
  <div class="flex items-center gap-3">
    <h2 class="text-lg font-bold text-ocean-700 tracking-wide">联动状态</h2>
    <div class="flex-1 h-px bg-gradient-to-r from-ocean-300 to-transparent"></div>
    <span class="text-ocean-300 text-xl leading-none select-none">〜</span>
  </div>

  <div class="grid grid-cols-4 gap-3">
    {#each statusCards as card}
      <div class="flex flex-col items-center gap-2 rounded-xl bg-white/80 p-3 shadow-sm border border-ocean-100/60">
        <div class="w-10 h-10 rounded-full bg-ocean-50 flex items-center justify-center">
          <card.icon size={20} class="text-ocean-500" />
        </div>
        <span class="text-xs text-gray-500 font-medium">{card.label}</span>
        <div class="{statusBg(card.status)} rounded-full px-2 py-0.5 flex items-center gap-1">
          {#if card.status === 'ok'}
            <CheckCircle2 size={12} class="text-emerald-500" />
            <span class="text-[10px] font-medium text-emerald-600">正常</span>
          {:else if card.status === 'warning'}
            <AlertTriangle size={12} class="text-sand-500" />
            <span class="text-[10px] font-medium text-sand-600">注意</span>
          {:else}
            <AlertCircle size={12} class="text-coral-500" />
            <span class="text-[10px] font-medium text-coral-600">异常</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if hasConflicts}
    <div class="bg-white/80 rounded-xl border border-ocean-100/60 shadow-sm overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ocean-700 hover:bg-ocean-50/50 transition-colors"
        onclick={() => expanded = !expanded}
      >
        <span class="flex items-center gap-2">
          <AlertTriangle size={14} class="text-sand-500" />
          冲突详情（{$conflicts.length}）
        </span>
        {#if expanded}
          <ChevronUp size={16} class="text-ocean-400" />
        {:else}
          <ChevronDown size={16} class="text-ocean-400" />
        {/if}
      </button>

      {#if expanded}
        <div class="px-4 pb-3 space-y-2">
          {#each $conflicts as conflict}
            <div class="flex items-start gap-2 border-l-3 {borderColor(conflict.severity)} pl-3 py-1.5 rounded-r bg-gray-50/50">
              {#if conflict.severity === 'error'}
                <AlertCircle size={14} class="text-coral-500 mt-0.5 shrink-0" />
              {:else if conflict.severity === 'warning'}
                <AlertTriangle size={14} class="text-sand-500 mt-0.5 shrink-0" />
              {:else}
                <AlertCircle size={14} class="text-ocean-400 mt-0.5 shrink-0" />
              {/if}
              <span class="text-xs text-gray-700 leading-relaxed">{conflict.message}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
