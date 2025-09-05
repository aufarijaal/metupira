<script setup lang="ts">
const props = defineProps<{
    selectedRange: string,
    dateRange: {
        start: string | null,
        end: string | null
    }
}>()

const emit = defineEmits<{
    (e: 'update:selectedRange', value: string): void
    (e: 'update:dateRange', value: { start: string | null, end: string | null }): void
}>()
</script>

<template>
    <div class="flex flex-col sm:flex-row gap-4">
        <!-- Custom date range -->
        <div v-if="selectedRange === 'custom'" class="flex gap-2">
            <input type="date" :value="dateRange.start"
                @input="(e) => emit('update:dateRange', { ...dateRange, start: (e.target as HTMLInputElement).value })"
                class="input input-bordered input-sm" :max="dateRange.end" />
            <span class="text-sm self-center">to</span>
            <input type="date" :value="dateRange.end"
                @input="(e) => emit('update:dateRange', { ...dateRange, end: (e.target as HTMLInputElement).value })"
                class="input input-bordered input-sm" :min="dateRange.start" />
        </div>

        <!-- Range selector -->
        <select :value="selectedRange"
            @change="(e) => emit('update:selectedRange', (e.target as HTMLSelectElement).value)"
            class="select select-bordered select-sm">
            <option value="custom">Custom Range</option>
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="daily">Last 30 days</option>
            <option value="weekly">Last 12 weeks</option>
            <option value="monthly">Last 12 months</option>
        </select>
    </div>
</template>
