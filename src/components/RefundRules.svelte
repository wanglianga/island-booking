<script lang="ts">
  import { allRefundRules } from '$lib/bookingStore'
  import {
    FileText,
    ChevronDown,
    ChevronUp,
    Clock,
    Percent,
    Shield,
    AlertTriangle,
  } from 'lucide-svelte'
  import type { RefundRule } from '$lib/mockData'

  let isExpanded = $state(false)

  function severityConfig(severity: RefundRule['severity']) {
    switch (severity) {
      case 'relaxed':
        return { label: '宽松', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      case 'moderate':
        return { label: '适中', bg: 'bg-sand-100', text: 'text-sand-600', border: 'border-sand-200' }
      case 'strict':
        return { label: '严格', bg: 'bg-coral-50', text: 'text-coral-500', border: 'border-coral-200' }
    }
  }

  function isWeatherRule(rule: RefundRule): boolean {
    return rule.category === 'weather'
  }
</script>

<div class="bg-white rounded-2xl overflow-hidden">
  <button
    class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    onclick={() => isExpanded = !isExpanded}
  >
    <div class="flex items-center gap-2">
      <FileText size={18} class="text-ocean-500" />
      <span class="font-semibold text-gray-800">退改规则</span>
    </div>
    {#if isExpanded}
      <ChevronUp size={18} class="text-gray-400" />
    {:else}
      <ChevronDown size={18} class="text-gray-400" />
    {/if}
  </button>

  {#if isExpanded}
    <div class="px-4 pb-4 space-y-3">
      {#each allRefundRules as rule (rule.id)}
        {@const config = severityConfig(rule.severity)}
        {@const weather = isWeatherRule(rule)}

        <div class="rounded-xl p-4 border {weather ? 'bg-ocean-50 border-ocean-200' : `${config.bg} ${config.border}`}">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              {#if weather}
                <Shield size={16} class="text-ocean-500" />
              {:else if rule.severity === 'strict'}
                <AlertTriangle size={16} class={config.text} />
              {:else}
                <FileText size={16} class={config.text} />
              {/if}
              <span class="font-medium {weather ? 'text-ocean-700' : 'text-gray-800'}">{rule.label}</span>
            </div>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full {config.bg} {config.text}">
              {config.label}
            </span>
          </div>

          <p class="text-sm {weather ? 'text-ocean-600' : 'text-gray-600'} mb-2">{rule.description}</p>

          <div class="flex items-center gap-4">
            {#if rule.deadlineHours > 0}
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                <span>截止 {rule.deadlineHours}小时前</span>
              </div>
            {/if}
            {#if rule.penaltyPercent > 0}
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <Percent size={12} />
                <span>违约金 {rule.penaltyPercent}%</span>
              </div>
            {:else}
              <div class="flex items-center gap-1 text-xs text-green-500">
                <Shield size={12} />
                <span>全额退款</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
