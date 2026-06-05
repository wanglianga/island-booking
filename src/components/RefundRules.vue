<template>
  <div class="rounded-xl border border-ocean-200 bg-white overflow-hidden">
    <button
      class="w-full flex items-center justify-between px-5 py-4 hover:bg-ocean-50 transition-colors"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2">
        <FileText class="w-5 h-5 text-ocean-600" />
        <span class="text-lg font-semibold text-ocean-800">退改规则</span>
      </div>
      <component :is="expanded ? ChevronUp : ChevronDown" class="w-5 h-5 text-ocean-400" />
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-in-out overflow-hidden"
      leave-active-class="transition-all duration-300 ease-in-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[2000px] opacity-100"
      leave-from-class="max-h-[2000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="expanded" class="px-5 pb-5">
        <div class="space-y-3">
          <div
            v-for="rule in store.allRefundRules"
            :key="rule.id"
            :class="[
              'rounded-lg border p-4',
              rule.category === 'weather'
                ? 'border-ocean-200 bg-ocean-50'
                : 'border-gray-100 bg-gray-50',
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <component
                  :is="rule.category === 'weather' ? Shield : categoryIcon(rule.category)"
                  :class="[
                    'w-4 h-4',
                    rule.category === 'weather' ? 'text-ocean-600' : 'text-ocean-500',
                  ]"
                />
                <span class="font-medium text-ocean-800">{{ rule.label }}</span>
              </div>
              <span
                v-if="rule.category === 'weather'"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-ocean-100 text-ocean-700"
              >
                不可抗力
              </span>
              <span
                v-else
                :class="[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  severityClass(rule.severity),
                ]"
              >
                {{ severityLabel(rule.severity) }}
              </span>
            </div>

            <p class="text-sm text-ocean-700 mb-3">{{ rule.description }}</p>

            <div class="flex flex-wrap gap-4 text-xs text-ocean-600">
              <div class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                <span>截止时间：入住前{{ rule.deadlineHours }}小时</span>
              </div>
              <div class="flex items-center gap-1">
                <Percent class="w-3.5 h-3.5" />
                <span>逾期扣款：{{ rule.penaltyPercent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBookingStore } from '@/composables/useBookingStore'
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Percent,
  Shield,
  AlertTriangle,
} from 'lucide-vue-next'
import type { Component } from 'vue'

const store = useBookingStore()
const expanded = ref(false)

function categoryIcon(category: string): Component {
  const map: Record<string, Component> = {
    room: FileText,
    ferry: AlertTriangle,
    shuttle: FileText,
    activity: FileText,
  }
  return map[category] || FileText
}

function severityClass(severity: 'relaxed' | 'moderate' | 'strict'): string {
  const map: Record<string, string> = {
    relaxed: 'bg-green-50 text-green-700',
    moderate: 'bg-sand-50 text-sand-600',
    strict: 'bg-coral-50 text-coral-600',
  }
  return map[severity] || ''
}

function severityLabel(severity: 'relaxed' | 'moderate' | 'strict'): string {
  const map: Record<string, string> = {
    relaxed: '宽松',
    moderate: '中等',
    strict: '严格',
  }
  return map[severity] || ''
}
</script>
