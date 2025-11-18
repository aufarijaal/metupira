<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartData } from '~/types'
import { useTheme } from '~/composables/useTheme'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import { use as EchartsUse } from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { LineChart } from 'echarts/charts';

// Import the tooltip, rectangular coordinate system and dataset components
import {
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    LegendComponent,
} from 'echarts/components';

// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';

// Register the required components
EchartsUse([
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    LabelLayout,
    UniversalTransition,
    LegendComponent,
    LineChart,
]);


const props = defineProps<{
    data: ChartData
}>()

const { isDark } = useTheme()
const { t } = useI18n()

// Dialog state
const isDialogOpen = ref(false)
const selectedDate = ref('')
const selectedExpense = ref(0)
const selectedIncome = ref(0)
const selectedTransactions = ref<any[]>([])
const loadingTransactions = ref(false)

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const parseDateString = (dateStr: string) => {
    // 1. Split the components: ["10", "Nov", "2025"]
    const [dayStr, monthStr, yearStr] = dateStr.split(' ');

    // 2. Map the month abbreviation to its index (0-11)
    const monthAbbreviations = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    // Find the 0-indexed month number
    const monthIndex = monthAbbreviations.findIndex(m => m === monthStr);

    // 3. Create the Date object
    if (monthIndex > -1) {
        // The Date constructor uses (year, monthIndex (0-11), day)
        const dateObject = new Date(
            Number(yearStr),
            monthIndex,
            Number(dayStr)
        );
        return dateObject;
    }

    // Return null or throw an error if parsing failed
    return null;
};

// Fetch transactions for selected date
const fetchTransactionsForDate = async (date: string) => {
    loadingTransactions.value = true
    try {
        // Parse the date string (format: DD/MM/YYYY)
        const startDate = parseDateString(date)
        startDate!.setHours(0, 0, 0, 0)

        const endDate = parseDateString(date)
        endDate!.setHours(23, 59, 59, 999)

        const { data, error } = await supabase
            .from('transactions')
            .select(`
                id,
                type,
                amount,
                note,
                transaction_at,
                categories (
                    name
                )
            `)
            .eq('user_id', user.value?.id)
            .gte('transaction_at', startDate.toISOString())
            .lte('transaction_at', endDate.toISOString())
            .order('transaction_at', { ascending: false })

        console.log(startDate.toISOString())
        console.log(endDate.toISOString())

        if (error) throw error

        selectedTransactions.value = (data || []).map((t: any) => ({
            ...t,
            category_name: t.categories?.name || 'Uncategorized'
        }))

        console.log(
            data
        )
    } catch (error) {
        console.error('Error fetching transactions:', error)
        selectedTransactions.value = []
    } finally {
        loadingTransactions.value = false
    }
}

// Handle chart click
const handleChartClick = async (params: any) => {
    if (params.componentType === 'series') {
        const dataIndex = params.dataIndex
        selectedDate.value = props.data.dates[dataIndex]
        selectedExpense.value = props.data.expense[dataIndex]
        selectedIncome.value = props.data.income[dataIndex]
        isDialogOpen.value = true

        // Fetch transactions for the selected date
        await fetchTransactionsForDate(selectedDate.value)
    }
}

const option = computed(() => ({
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: isDark.value ? '#1e1e1e' : '#ffffff'
            }
        },
        backgroundColor: isDark.value ? '#1e1e1e' : '#ffffff',
        borderColor: isDark.value ? '#666666' : '#e5e5e5',
        textStyle: {
            color: isDark.value ? '#e5e5e5' : '#333333'
        },
        formatter: (params: any[]) => {
            const date = props.data.dates[params[0].dataIndex]
            return `${date}<br />${params.map((param) => {
                const value = param.value.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })
                return `${param.seriesName}: ${value}`
            }).join('<br />')}`
        }
    },
    legend: {
        data: [t('components.chart.expense'), t('components.chart.income')],
        top: 0,
        textStyle: {
            color: isDark.value ? '#e5e5e5' : '#333'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        top: 30
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.data.dates,
        axisLine: {
            show: true,
            lineStyle: {
                color: isDark.value ? '#666' : '#333'
            }
        },
        axisLabel: {
            show: true,
            rotate: 45,
            color: isDark.value ? '#e5e5e5' : '#333',
            formatter: (value: string) => {
                try {
                    // Split the date string and rearrange it to ensure proper parsing
                    const [day, month, year] = value.split('/');
                    const date = new Date(Number(year), Number(month) - 1, Number(day));

                    if (isNaN(date.getTime())) {
                        return value; // Return original value if parsing fails
                    }

                    return new Intl.DateTimeFormat('id-ID', {
                        day: 'numeric',
                        month: 'short'
                    }).format(date);
                } catch (e) {
                    return value; // Return original value if any error occurs
                }
            }
        }
    },
    yAxis: {
        type: 'value',
        axisLine: {
            show: true,
            lineStyle: {
                color: isDark.value ? '#666666' : '#333333'
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
                color: isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
        },
        axisLabel: {
            show: true,
            color: isDark.value ? '#e5e5e5' : '#333333',
            formatter: (value: number) => {
                return value.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    notation: 'compact'
                })
            }
        }
    },
    series: [
        {
            name: t('components.chart.expense'),
            type: 'line',
            smooth: true,
            symbolSize: 8,
            data: props.data.expense,
            itemStyle: {
                color: isDark.value ? '#ff6b6b' : '#ef4444'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: isDark.value ? 'rgba(255,107,107,0.3)' : 'rgba(239,68,68,0.3)'
                    }, {
                        offset: 1,
                        color: isDark.value ? 'rgba(255,107,107,0.05)' : 'rgba(239,68,68,0.05)'
                    }]
                }
            }
        },
        {
            name: t('components.chart.income'),
            type: 'line',
            smooth: true,
            symbolSize: 8,
            data: props.data.income,
            itemStyle: {
                color: isDark.value ? '#51cf66' : '#22c55e'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: isDark.value ? 'rgba(81,207,102,0.3)' : 'rgba(34,197,94,0.3)'
                    }, {
                        offset: 1,
                        color: isDark.value ? 'rgba(81,207,102,0.05)' : 'rgba(34,197,94,0.05)'
                    }]
                }
            }
        }
    ]
}))
</script>

<template>
    <div class="w-full h-[400px]">
        <client-only>
            <v-chart class="w-full h-full" :option="option" autoresize @click="handleChartClick" />
        </client-only>

        <!-- Dialog Modal -->
        <dialog class="modal" :class="{ 'modal-open': isDialogOpen }">
            <div class="modal-box max-w-3xl w-full mx-4">
                <h3 class="font-bold text-base sm:text-lg mb-4">
                    {{ $t('transaction.transactionDate') }}: {{ selectedDate }}
                </h3>

                <!-- Summary Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div class="stat bg-error/10 rounded-lg p-3 sm:p-4">
                        <div class="stat-title text-error text-xs sm:text-sm">{{ $t('common.expense') }}</div>
                        <div class="stat-value text-lg sm:text-2xl text-error">
                            {{ selectedExpense.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }) }}
                        </div>
                    </div>
                    <div class="stat bg-success/10 rounded-lg p-3 sm:p-4">
                        <div class="stat-title text-success text-xs sm:text-sm">{{ $t('common.income') }}</div>
                        <div class="stat-value text-lg sm:text-2xl text-success">
                            {{ selectedIncome.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }) }}
                        </div>
                    </div>
                </div>

                <!-- Transaction Details -->
                <div v-if="loadingTransactions" class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>

                <div v-else-if="selectedTransactions.length === 0" class="text-center py-8 text-base-content/60 text-sm">
                    {{ $t('transaction.noTransactionsFound') }}
                </div>

                <div v-else class="space-y-2 sm:space-y-3 max-h-60 sm:max-h-96 overflow-y-auto">
                    <div v-for="transaction in selectedTransactions" :key="transaction.id"
                        class="card bg-base-200 shadow-sm">
                        <div class="card-body p-3 sm:p-4">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                                <div class="flex-1">
                                    <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                        <span :class="[
                                            'badge badge-sm sm:badge-md',
                                            transaction.type === 'income' ? 'badge-success' : 'badge-error'
                                        ]">
                                            {{ transaction.type === 'income' ? $t('common.income') :
                                                $t('common.expense') }}
                                        </span>
                                        <span class="badge badge-outline badge-sm sm:badge-md">{{ transaction.category_name }}</span>
                                    </div>
                                    <p class="text-xs sm:text-sm text-base-content/70 break-words">{{ transaction.note }}</p>
                                </div>
                                <div :class="[
                                    'text-base sm:text-xl font-bold mt-1 sm:mt-0 sm:ml-4 shrink-0',
                                    transaction.type === 'income' ? 'text-success' : 'text-error'
                                ]">
                                    {{ transaction.amount.toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-action mt-4 sm:mt-6">
                    <button class="btn btn-sm sm:btn-md w-full sm:w-auto" @click="isDialogOpen = false">{{ $t('common.close') }}</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="isDialogOpen = false">
                <button>{{ $t('common.close') }}</button>
            </form>
        </dialog>
    </div>
</template>
