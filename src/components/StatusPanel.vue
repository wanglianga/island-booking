<script setup lang="ts">
import { ref } from 'vue'
import { useBookingStore } from '@/composables/useBookingStore'
import { Bed, Ship, Bus, Palmtree, AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-vue-next'

const store = useBookingStore()
const expanded = ref(false)

const statusItems = [
  { key: 'room' as const, label: '房间', icon: Bed, status: store.roomStatus },
  { key: 'ferry' as const, label: '船班', icon: Ship, status: store.ferryStatus },
  { key: 'shuttle' as const, label: '接驳', icon: Bus, status: store.shuttleStatus },
  { key: 'activity' as const, label: '活动', icon: Palmtree, status: store.activityStatus },
]

function statusColor(status: 'ok' | 'warning' | 'error') {
  if (status === 'error') return 'coral'
  if (status === 'warning') return 'sand'
  return 'green'
}

function borderColorClass(status: 'ok' | 'warning' | 'error') {
  if (status === 'error') return 'border-l-coral-500'
  if (status === 'warning') return 'border-l-sand-500'
  return 'border-l-green-500'
}

function severityBorderColorClass(severity: 'error' | 'warning' | 'info') {
  if (severity === 'error') return 'border-l-coral-500'
  if (severity === 'warning') return 'border-l-sand-500'
  return 'border-l-ocean-500'
}

function severityIconColor(severity: 'error' | 'warning' | 'info') {
  if (severity === 'error') return 'text-coral-500'
  if (severity === 'warning') return 'text-sand-500'
  return 'text-ocean-500'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <div class="h-px flex-1 bg-ocean-200" />
      <h2 class="font-serif text-lg font-semibold text-ocean-800 flex items-center gap-2">
        <span class="text-ocean-400">〰</span>
        联动状态
        <span class="text-ocean-400">〰</span>
      </h2>
      <div class="h-px flex-1 bg-ocean-200" />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="item in statusItems"
        :key="item.key"
        :class="[
          'bg-white rounded-xl p-4 border-l-4 shadow-sm flex flex-col items-center gap-2 transition-all duration-200',
          borderColorClass(item.status),
        ]"
      >
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center',
            item.status === 'error' ? 'bg-coral-50' : item.status === 'warning' ? 'bg-sand-50' : 'bg-green-50',
          ]"
        >
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5',
              item.status === 'error' ? 'text-coral-500' : item.status === 'warning' ? 'text-sand-500' : 'text-green-500',
            ]"
          />
        </div>

        <span class="text-sm text-gray-600 font-medium">{{ item.label }}</span>

        <div class="flex items-center gap-1">
          <CheckCircle2 v-if="item.status === 'ok'" class="w-4 h-4 text-green-600" />
          <AlertTriangle v-else-if="item.status === 'warning'" class="w-4 h-4 text-sand-600" />
          <AlertCircle v-else class="w-4 h-4 text-coral-600" />

          <span
            :class="[
              'text-xs font-medium',
              item.status === 'ok' ? 'text-green-600' : item.status === 'warning' ? 'text-sand-600' : 'text-coral-600',
            ]"
          >
            {{ item.status === 'ok' ? '正常' : item.status === 'warning' ? '注意' : '异常' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="store.conflicts.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        @click="expanded = !expanded"
      >
        <span class="text-sm font-medium text-gray-700">冲突详情</span>
        <component :is="expanded ? ChevronUp : ChevronDown" class="w-4 h-4 text-gray-400" />
      </button>

      <div
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :style="{ maxHeight: expanded ? store.conflicts.length * 80 + 'px' : '0px' }"
      >
        <div class="px-4 pb-3 space-y-2">
          <div
            v-for="(conflict, index) in store.conflicts"
            :key="index"
            :class="[
              'flex items-start gap-2 rounded-lg border-l-4 bg-gray-50 px-3 py-2',
              severityBorderColorClass(conflict.severity),
            ]"
          >
            <AlertCircle
              v-if="conflict.severity === 'error'"
              :class="['w-4 h-4 mt-0.5 shrink-0', severityIconColor(conflict.severity)]"
            />
            <AlertTriangle
              v-else-if="conflict.severity === 'warning'"
              :class="['w-4 h-4 mt-0.5 shrink-0', severityIconColor(conflict.severity)]"
            />
            <CheckCircle2
              v-else
              :class="['w-4 h-4 mt-0.5 shrink-0', severityIconColor(conflict.severity)]"
            />
            <span class="text-sm text-gray-700">{{ conflict.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
