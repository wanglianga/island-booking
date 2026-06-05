<script lang="ts">
  import {
    typhoonModeEnabled,
    typhoonSuspensions,
    pendingAffectedBookings,
    processedAffectedBookings,
    cancelAndRefund,
    postponeBooking,
    rescheduleFerry,
    checkRoomConflict,
    getAvailableFerriesForDate,
    getDateRange,
    addTyphoonSuspension,
    removeTyphoonSuspension,
  } from '$lib/typhoonStore'
  import type { Booking } from '$lib/mockData'
  import {
    CloudRain,
    AlertTriangle,
    CalendarClock,
    XCircle,
    Ship,
    User,
    Users,
    Bed,
    Bus,
    Palmtree,
    Check,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    Calendar,
  } from 'lucide-svelte'

  let expandedOrderId: string | null = null
  let showPostponeModal = false
  let showRescheduleModal = false
  let selectedBooking: Booking | null = null
  let postponeDays = 1
  let selectedOutboundFerryId = ''
  let selectedReturnFerryId = ''
  let conflictMessage = ''
  let showAddSuspension = false
  let newSuspensionDate = ''
  let newSuspensionReason = '台风预警，全天停航'
  const availableDates = getDateRange(14)

  $: availableOutboundFerries = selectedBooking
    ? getAvailableFerriesForDate(selectedBooking.checkInDate, 'outbound')
    : []
  $: availableReturnFerries = selectedBooking
    ? getAvailableFerriesForDate(selectedBooking.checkOutDate, 'return')
    : []

  function toggleExpand(bookingId: string) {
    expandedOrderId = expandedOrderId === bookingId ? null : bookingId
  }

  function handleCancelRefund(booking: Booking) {
    if (confirm(`确认取消订单 ${booking.orderNo} 并全额退款吗？\n\n此操作将同步释放活动名额和接驳车座位。`)) {
      cancelAndRefund(booking.id)
    }
  }

  function openPostponeModal(booking: Booking) {
    selectedBooking = booking
    postponeDays = 1
    conflictMessage = ''
    showPostponeModal = true
  }

  function confirmPostpone() {
    if (!selectedBooking) return

    const newCheckIn = new Date(selectedBooking.checkInDate)
    newCheckIn.setDate(newCheckIn.getDate() + postponeDays)
    const newCheckInStr = newCheckIn.toISOString().split('T')[0]

    const newCheckOut = new Date(selectedBooking.checkOutDate)
    newCheckOut.setDate(newCheckOut.getDate() + postponeDays)
    const newCheckOutStr = newCheckOut.toISOString().split('T')[0]

    const hasConflict = checkRoomConflict(
      selectedBooking.roomTypeId,
      newCheckInStr,
      newCheckOutStr,
      selectedBooking.id
    )

    if (hasConflict) {
      conflictMessage =
        '⚠ 房态冲突：改期后的房间日期与其他订单冲突，请先处理房态冲突（如联系其他客人调整或协调房型），再确认游客改签。'
      return
    }

    const result = postponeBooking(selectedBooking.id, postponeDays)
    if (result.success) {
      showPostponeModal = false
      selectedBooking = null
      conflictMessage = ''
    }
  }

  function openRescheduleModal(booking: Booking) {
    selectedBooking = booking
    selectedOutboundFerryId = ''
    selectedReturnFerryId = ''
    conflictMessage = ''
    showRescheduleModal = true
  }

  function confirmReschedule() {
    if (!selectedBooking) return

    const result = rescheduleFerry(
      selectedBooking.id,
      selectedOutboundFerryId || undefined,
      selectedReturnFerryId || undefined
    )

    if (result.success) {
      showRescheduleModal = false
      selectedBooking = null
    }
  }

  function handleAddSuspension() {
    if (!newSuspensionDate) return
    addTyphoonSuspension(newSuspensionDate, newSuspensionReason)
    newSuspensionDate = ''
    showAddSuspension = false
  }

  function handleRemoveSuspension(date: string) {
    if (confirm(`确认取消 ${date} 的停航设置吗？`)) {
      removeTyphoonSuspension(date)
    }
  }

  function processStatusLabel(status?: string) {
    switch (status) {
      case 'postponed':
        return '已延期'
      case 'refunded':
        return '已退款'
      case 'rescheduled':
        return '已改船班'
      default:
        return '待处理'
    }
  }

  function processStatusColor(status?: string) {
    switch (status) {
      case 'postponed':
        return 'bg-sand-100 text-sand-700'
      case 'refunded':
        return 'bg-gray-100 text-gray-600'
      case 'rescheduled':
        return 'bg-ocean-100 text-ocean-700'
      default:
        return 'bg-coral-100 text-coral-700'
    }
  }
</script>

<div class="space-y-6">
  <div class="bg-gradient-to-r from-coral-500 via-coral-600 to-red-500 rounded-2xl p-6 text-white shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <CloudRain size={28} />
        </div>
        <div>
          <h2 class="text-xl font-bold">台风停航模式</h2>
          <p class="text-coral-100 text-sm">处理因台风等不可抗力导致的停航订单</p>
        </div>
      </div>
      <label class="flex items-center gap-2 cursor-pointer">
        <span class="text-sm">启用</span>
        <div class="relative">
          <input
            type="checkbox"
            class="sr-only"
            bind:checked={$typhoonModeEnabled}
          />
          <div
            class="w-12 h-6 rounded-full transition-colors {$typhoonModeEnabled
              ? 'bg-white'
              : 'bg-white/30'}"
          ></div>
          <div
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-coral-600 rounded-full transition-transform {$typhoonModeEnabled
              ? 'translate-x-6'
              : ''}"
          ></div>
        </div>
      </label>
    </div>

    {#if $typhoonModeEnabled}
      <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold flex items-center gap-2">
            <Calendar size={16} />
            停航日期设置
          </h3>
          <button
            class="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
            onclick={() => (showAddSuspension = !showAddSuspension)}
          >
            <Plus size={14} />
            添加停航
          </button>
        </div>

        {#if showAddSuspension}
          <div class="bg-white/10 rounded-lg p-3 mb-3 space-y-2">
            <div class="flex gap-2">
              <select
                class="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white"
                bind:value={newSuspensionDate}
              >
                <option value="">选择日期</option>
                {#each availableDates as date}
                  <option value={date} class="text-gray-800">{date}</option>
                {/each}
              </select>
              <button
                class="bg-white text-coral-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-coral-50 transition-colors"
                onclick={handleAddSuspension}
              >
                添加
              </button>
            </div>
            <input
              type="text"
              class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-coral-200"
              bind:value={newSuspensionReason}
              placeholder="停航原因"
            />
          </div>
        {/if}

        <div class="space-y-2">
          {#each $typhoonSuspensions as suspension}
            <div class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
              <div class="flex items-center gap-2">
                <AlertTriangle size={14} />
                <span class="text-sm font-medium">{suspension.date}</span>
                <span class="text-xs text-coral-100">{suspension.reason}</span>
              </div>
              <button
                class="text-white/70 hover:text-white p-1"
                onclick={() => handleRemoveSuspension(suspension.date)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          {/each}
          {#if $typhoonSuspensions.length === 0}
            <p class="text-sm text-coral-100 text-center py-2">暂无停航设置</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if $typhoonModeEnabled}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-ocean-800 flex items-center gap-2">
          <AlertTriangle class="text-coral-500" size={20} />
          受影响订单（{$pendingAffectedBookings.length} 待处理）
        </h3>
      </div>

      {#if $pendingAffectedBookings.length === 0}
        <div class="bg-white rounded-xl border border-ocean-100 p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-ocean-50 flex items-center justify-center mx-auto mb-4">
            <Check class="text-ocean-500" size={32} />
          </div>
          <p class="text-ocean-600 font-medium">暂无待处理的受影响订单</p>
          <p class="text-sm text-gray-400 mt-1">所有停航订单均已处理完毕</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each $pendingAffectedBookings as booking}
            <div
              class="bg-white rounded-xl border-2 border-coral-200 overflow-hidden shadow-sm"
            >
              <div
                class="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-coral-50/50 transition-colors"
                onclick={() => toggleExpand(booking.id)}
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center">
                    <AlertTriangle class="text-coral-500" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-ocean-800">{booking.orderNo}</span>
                      <span
                        class="text-xs px-2 py-0.5 rounded-full {processStatusColor(
                          booking.typhoonProcessStatus
                        )}"
                      >
                        {processStatusLabel(booking.typhoonProcessStatus)}
                      </span>
                    </div>
                    <div class="text-sm text-gray-500 flex items-center gap-2">
                      <User size={12} />
                      {booking.guestInfo.name}
                      <span class="text-gray-300">|</span>
                      <Bed size={12} />
                      {booking.roomTypeName}
                      <span class="text-gray-300">|</span>
                      <CalendarClock size={12} />
                      {booking.checkInDate} 至 {booking.checkOutDate}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  {#if booking.activities.length > 0}
                    <span class="text-xs bg-ocean-100 text-ocean-600 px-2 py-1 rounded-full">
                      含活动
                    </span>
                  {/if}
                  {#if booking.outboundShuttleId || booking.returnShuttleId}
                    <span class="text-xs bg-sand-100 text-sand-600 px-2 py-1 rounded-full">
                      含接驳
                    </span>
                  {/if}
                  {#if expandedOrderId === booking.id}
                    <ChevronUp class="text-gray-400" size={20} />
                  {:else}
                    <ChevronDown class="text-gray-400" size={20} />
                  {/if}
                </div>
              </div>

              {#if expandedOrderId === booking.id}
                <div class="border-t border-coral-100 px-4 py-4 bg-coral-50/30">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="space-y-2">
                      <h4 class="text-sm font-semibold text-ocean-700">订单详情</h4>
                      <div class="text-sm text-gray-600 space-y-1">
                        <p class="flex items-center gap-2">
                          <User size={14} class="text-gray-400" />
                          客人：{booking.guestInfo.name}（{booking.guestInfo.phone}）
                        </p>
                        <p class="flex items-center gap-2">
                          <Bed size={14} class="text-gray-400" />
                          房型：{booking.roomTypeName} × {booking.nights}晚
                        </p>
                        <p class="flex items-center gap-2">
                          <Users size={14} class="text-gray-400" />
                          人数：{booking.adults}成人
                          {#if booking.children > 0}+ {booking.children}儿童{/if}
                        </p>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <h4 class="text-sm font-semibold text-ocean-700">关联服务</h4>
                      <div class="text-sm text-gray-600 space-y-1">
                        {#if booking.outboundFerryId}
                          <p class="flex items-center gap-2">
                            <Ship size={14} class="text-gray-400" />
                            去程船班：{booking.checkInDate} {booking.outboundFerryTime}
                          </p>
                        {/if}
                        {#if booking.returnFerryId}
                          <p class="flex items-center gap-2">
                            <Ship size={14} class="text-gray-400" />
                            回程船班：{booking.checkOutDate} {booking.returnFerryTime}
                          </p>
                        {/if}
                        {#if booking.outboundShuttleId || booking.returnShuttleId}
                          <p class="flex items-center gap-2">
                            <Bus size={14} class="text-gray-400" />
                            含接驳车服务
                          </p>
                        {/if}
                        {#if booking.activities.length > 0}
                          <p class="flex items-center gap-2">
                            <Palmtree size={14} class="text-gray-400" />
                            岛上活动：{booking.activities.map((a) => a.activityName).join('、')}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </div>

                  {#if booking.activities.length > 0 || booking.outboundShuttleId || booking.returnShuttleId}
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4">
                      <p class="text-xs text-yellow-700">
                        💡 该订单包含
                        {#if booking.activities.length > 0}岛上活动{/if}
                        {#if booking.activities.length > 0 && (booking.outboundShuttleId || booking.returnShuttleId)}和{/if}
                        {#if booking.outboundShuttleId || booking.returnShuttleId}接驳车{/if}
                        ，处理停航时将同步释放活动名额和接驳座位。
                      </p>
                    </div>
                  {/if}

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sand-500 text-white hover:bg-sand-600 transition-colors font-medium text-sm"
                      onclick={() => openPostponeModal(booking)}
                    >
                      <CalendarClock size={18} />
                      延期入住
                    </button>
                    <button
                      class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-colors font-medium text-sm"
                      onclick={() => handleCancelRefund(booking)}
                    >
                      <XCircle size={18} />
                      取消退款
                    </button>
                    <button
                      class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ocean-500 text-white hover:bg-ocean-600 transition-colors font-medium text-sm"
                      onclick={() => openRescheduleModal(booking)}
                    >
                      <Ship size={18} />
                      改其他船班
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      {#if $processedAffectedBookings.length > 0}
        <div class="mt-6">
          <h3 class="text-lg font-bold text-ocean-800 mb-3 flex items-center gap-2">
            <Check class="text-emerald-500" size={20} />
            已处理订单（{$processedAffectedBookings.length}）
          </h3>
          <div class="space-y-2">
            {#each $processedAffectedBookings as booking}
              <div class="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-medium text-ocean-700">{booking.orderNo}</span>
                  <span class="text-sm text-gray-500">{booking.guestInfo.name}</span>
                </div>
                <span
                  class="text-xs px-2 py-0.5 rounded-full {processStatusColor(
                    booking.typhoonProcessStatus
                  )}"
                >
                  {processStatusLabel(booking.typhoonProcessStatus)}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if showPostponeModal && selectedBooking}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-ocean-800 mb-4">延期入住</h3>
        <p class="text-gray-600 text-sm mb-4">
          订单 {selectedBooking.orderNo} - {selectedBooking.guestInfo.name}
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">延期天数</label>
            <div class="flex items-center gap-3">
              <button
                class="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                onclick={() => (postponeDays = Math.max(1, postponeDays - 1))}
              >
                -
              </button>
              <span class="text-2xl font-bold text-ocean-700 w-12 text-center">{postponeDays}</span>
              <button
                class="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                onclick={() => (postponeDays = Math.min(7, postponeDays + 1))}
              >
                +
              </button>
              <span class="text-sm text-gray-500">天</span>
            </div>
          </div>

          <div class="bg-ocean-50 rounded-lg p-3">
            <p class="text-sm text-ocean-700">
              <span class="font-medium">原入住：</span>{selectedBooking.checkInDate} 至 {selectedBooking.checkOutDate}
            </p>
            <p class="text-sm text-ocean-700 mt-1">
              <span class="font-medium">新入住：</span>
              {(() => {
                const ci = new Date(selectedBooking.checkInDate)
                ci.setDate(ci.getDate() + postponeDays)
                const co = new Date(selectedBooking.checkOutDate)
                co.setDate(co.getDate() + postponeDays)
                return `${ci.toISOString().split('T')[0]} 至 ${co.toISOString().split('T')[0]}`
              })()}
            </p>
          </div>

          {#if conflictMessage}
            <div class="bg-coral-50 border-2 border-coral-400 rounded-lg p-3">
              <p class="text-sm text-coral-700">{conflictMessage}</p>
            </div>
          {/if}

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-xs text-yellow-700">
              💡 延期后将自动释放原活动名额和接驳座位，需重新预订。
            </p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            onclick={() => {
              showPostponeModal = false
              selectedBooking = null
              conflictMessage = ''
            }}
          >
            取消
          </button>
          <button
            class="flex-1 px-4 py-2.5 rounded-xl bg-sand-500 text-white hover:bg-sand-600 transition-colors font-medium"
            onclick={confirmPostpone}
          >
            确认延期
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showRescheduleModal && selectedBooking}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-ocean-800 mb-4">改到其他船班</h3>
        <p class="text-gray-600 text-sm mb-4">
          订单 {selectedBooking.orderNo} - {selectedBooking.guestInfo.name}
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              去程船班（{selectedBooking.checkInDate}）
            </label>
            {#if availableOutboundFerries.length > 0}
              <select
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                bind:value={selectedOutboundFerryId}
              >
                <option value="">暂不选择</option>
                {#each availableOutboundFerries as ferry}
                  <option value={ferry.id}>
                    {ferry.time} - 余座 {ferry.availableSeats}/{ferry.totalSeats}
                  </option>
                {/each}
              </select>
            {:else}
              <p class="text-sm text-coral-600">该日期暂无可用船班</p>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              回程船班（{selectedBooking.checkOutDate}）
            </label>
            {#if availableReturnFerries.length > 0}
              <select
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                bind:value={selectedReturnFerryId}
              >
                <option value="">暂不选择</option>
                {#each availableReturnFerries as ferry}
                  <option value={ferry.id}>
                    {ferry.time} - 余座 {ferry.availableSeats}/{ferry.totalSeats}
                  </option>
                {/each}
              </select>
            {:else}
              <p class="text-sm text-coral-600">该日期暂无可用船班</p>
            {/if}
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-xs text-yellow-700">
              💡 改签船班后将自动释放原活动名额和接驳座位，需重新预订。
            </p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            onclick={() => {
              showRescheduleModal = false
              selectedBooking = null
            }}
          >
            取消
          </button>
          <button
            class="flex-1 px-4 py-2.5 rounded-xl bg-ocean-500 text-white hover:bg-ocean-600 transition-colors font-medium"
            onclick={confirmReschedule}
          >
            确认改签
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
