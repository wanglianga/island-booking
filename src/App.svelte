<script lang="ts">
  import { selectedRoomTypeId, dateRange } from '$lib/bookingStore'
  import { roomTypes, roomAvailability } from '$lib/mockData'
  import DateSelector from '$components/DateSelector.svelte'
  import RoomTypeCard from '$components/RoomTypeCard.svelte'
  import GuestCounter from '$components/GuestCounter.svelte'
  import FerrySchedule from '$components/FerrySchedule.svelte'
  import ShuttleCard from '$components/ShuttleCard.svelte'
  import ActivityCard from '$components/ActivityCard.svelte'
  import StatusPanel from '$components/StatusPanel.svelte'
  import RefundRules from '$components/RefundRules.svelte'
  import OrderSummary from '$components/OrderSummary.svelte'

  let roomCards = $derived(
    roomTypes.map((rt) => {
      const isAvailable =
        $dateRange.length === 0 ||
        $dateRange.every((date) => {
          const avail = roomAvailability.find(
            (a) => a.roomTypeId === rt.id && a.date === date
          )
          return avail && avail.available > 0
        })

      const hasRoomChange =
        $dateRange.length > 0 &&
        $dateRange.some((date) => {
          const avail = roomAvailability.find(
            (a) => a.roomTypeId === rt.id && a.date === date
          )
          return avail?.needRoomChange
        })

      const changeToRoomName = (() => {
        if (!hasRoomChange) return undefined
        const changeAvail = roomAvailability.find(
          (a) =>
            a.roomTypeId === rt.id &&
            $dateRange.includes(a.date) &&
            a.needRoomChange
        )
        if (!changeAvail?.changeToRoomTypeId) return undefined
        return roomTypes.find((r) => r.id === changeAvail.changeToRoomTypeId)?.name
      })()

      return { roomType: rt, isSelected: $selectedRoomTypeId === rt.id, isAvailable, hasRoomChange, changeToRoomName }
    })
  )

  function selectRoom(id: string) {
    selectedRoomTypeId.set($selectedRoomTypeId === id ? '' : id)
  }
</script>

<div class="min-h-screen bg-sand-50">
  <header class="bg-gradient-to-r from-ocean-600 via-ocean-500 to-ocean-400 text-white">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🏝️</div>
          <div>
            <h1 class="font-serif text-2xl font-bold tracking-wide">海岛联订</h1>
            <p class="text-ocean-100 text-sm">民宿 · 船班 · 接驳 · 活动 一站式预订</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-ocean-100 text-sm">
          <span class="hidden sm:inline">民宿联盟</span>
          <span class="text-ocean-300">|</span>
          <span class="hidden sm:inline">轮渡客服</span>
          <span class="text-ocean-300">|</span>
          <span class="hidden sm:inline">游客中心</span>
        </div>
      </div>
    </div>
  </header>

  <div class="relative overflow-hidden">
    <svg class="w-full h-8 text-ocean-500" viewBox="0 0 1440 32" preserveAspectRatio="none">
      <path d="M0,16 C240,32 480,0 720,16 C960,32 1200,0 1440,16 L1440,0 L0,0 Z" fill="currentColor"/>
    </svg>
  </div>

  <main class="max-w-7xl mx-auto px-4 pb-24">
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 min-w-0 space-y-6">
        <DateSelector />
        <section>
          <h2 class="text-lg font-serif font-semibold text-ocean-800 mb-3">选择房型</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each roomCards as card (card.roomType.id)}
              <RoomTypeCard
                roomType={card.roomType}
                isSelected={card.isSelected}
                isAvailable={card.isAvailable}
                hasRoomChange={card.hasRoomChange}
                changeToRoomName={card.changeToRoomName}
                onselect={() => selectRoom(card.roomType.id)}
              />
            {/each}
          </div>
        </section>
        <GuestCounter />
        <FerrySchedule />
        <ShuttleCard />
        <ActivityCard />
        <RefundRules />
      </div>
      <aside class="lg:w-80 shrink-0">
        <div class="lg:sticky lg:top-4 space-y-4">
          <StatusPanel />
        </div>
      </aside>
    </div>
  </main>
  <OrderSummary />
</div>
