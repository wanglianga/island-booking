<script lang="ts">
import { checkInDate, checkOutDate, setCheckIn, setCheckOut, nights } from '$lib/bookingStore'
import { ferrySchedules } from '$lib/mockData'
import { Calendar, Anchor, Waves } from 'lucide-svelte'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

let dates = $state<string[]>([])

$effect(() => {
  const now = new Date()
  const result: string[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    result.push(`${y}-${m}-${day}`)
  }
  dates = result
})

function getTideInfo(date: string): string {
  return ferrySchedules.find(f => f.date === date)?.tideInfo ?? ''
}

function isAllSuspended(date: string): boolean {
  const ferries = ferrySchedules.filter(f => f.date === date)
  return ferries.length > 0 && ferries.every(f => f.suspended)
}

let selectionPhase = $state<'checkin' | 'checkout'>('checkin')

function handleDateClick(date: string) {
  if (!$checkInDate || selectionPhase === 'checkin') {
    setCheckIn(date)
    selectionPhase = 'checkout'
  } else if (date > $checkInDate) {
    setCheckOut(date)
    selectionPhase = 'checkin'
  } else {
    setCheckIn(date)
    selectionPhase = 'checkout'
  }
}

function isInRange(date: string): boolean {
  return !!$checkInDate && !!$checkOutDate && date > $checkInDate && date < $checkOutDate
}

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getWeekday(date: string): string {
  return WEEKDAYS[new Date(date + 'T00:00:00').getDay()]
}
</script>

<div class="rounded-xl bg-white shadow-lg overflow-hidden">
  <div class="bg-gradient-to-r from-ocean-500 to-ocean-700 px-5 py-3 flex items-center gap-2">
    <Calendar size={20} class="text-white" />
    <h2 class="text-white font-serif text-lg font-bold">选择日期</h2>
  </div>

  <div class="p-4">
    <div class="grid grid-cols-7 gap-1.5">
      {#each dates as date}
        {@const tide = getTideInfo(date)}
        {@const suspended = isAllSuspended(date)}
        {@const isStart = $checkInDate === date}
        {@const isEnd = $checkOutDate === date}
        {@const inRange = isInRange(date)}
        {@const selected = isStart || isEnd}

        <button
          onclick={() => handleDateClick(date)}
          class="relative rounded-xl p-1.5 text-center transition-all duration-200 min-h-[64px]
            flex flex-col items-center justify-center gap-0.5
            {suspended && !selected ? 'bg-coral-100' : ''}
            {inRange ? 'bg-ocean-50' : ''}
            {selected ? 'bg-ocean-500 text-white shadow-md scale-[1.08]' : 'hover:bg-ocean-50/50'}"
        >
          <span class="text-[10px] leading-none {selected ? 'text-ocean-100' : 'text-ocean-400'}">
            {getWeekday(date)}
          </span>
          <span class="text-sm font-bold leading-none">{formatDate(date)}</span>
          <span class="text-[9px] leading-none
            {selected ? 'text-ocean-100'
              : tide === '大潮' ? 'text-ocean-700 font-semibold'
              : tide === '中潮' ? 'text-ocean-400'
              : tide === '小潮' ? 'text-sand-500'
              : ''}">
            {tide}
          </span>
          {#if suspended && !selected}
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral-500"></span>
          {/if}
        </button>
      {/each}
    </div>

    {#if $checkInDate}
      <div class="mt-4 p-3 rounded-xl bg-sand-50 border border-sand-200 flex items-center gap-3">
        <Anchor size={18} class="text-ocean-500 shrink-0" />
        <div class="flex-1 text-sm">
          <span class="font-semibold text-ocean-700">{formatDate($checkInDate)}</span>
          <span class="mx-2 text-ocean-400">→</span>
          {#if $checkOutDate}
            <span class="font-semibold text-ocean-700">{formatDate($checkOutDate)}</span>
          {:else}
            <span class="text-ocean-400">选择退房日期</span>
          {/if}
        </div>
        {#if $nights > 0}
          <div class="flex items-center gap-1 text-ocean-600 font-bold">
            <Waves size={16} />
            <span>{$nights}晚</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
