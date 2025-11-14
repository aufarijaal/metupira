<script setup lang="ts">
import { computed } from 'vue'
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
            <v-chart class="w-full h-full" :option="option" autoresize />
        </client-only>
    </div>
</template>
