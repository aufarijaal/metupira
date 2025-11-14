<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '~/composables/useTheme'
import type { CategoryData } from '~/types'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import { use as EchartsUse } from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { PieChart } from 'echarts/charts';

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
    PieChart
]);

const props = defineProps<{
    data: CategoryData[]
}>()

const { isDark } = useTheme()
const { t } = useI18n()

const option = computed(() => ({
    tooltip: {
        trigger: 'item',
        backgroundColor: isDark.value ? '#1e1e1e' : '#ffffff',
        borderColor: isDark.value ? '#666666' : '#e5e5e5',
        textStyle: {
            color: isDark.value ? '#e5e5e5' : '#333333'
        },
        formatter: (params: any) => {
            const value = params.value.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
            return `${params.name}: ${value} (${params.percent}%)`
        }
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        type: 'scroll',
        pageButtonPosition: 'end',
        pageButtonGap: 5,
        pageFormatter: '{current}/{total}',
        textStyle: {
            color: isDark.value ? '#e5e5e5' : '#333333'
        },
        pageTextStyle: {
            color: isDark.value ? '#e5e5e5' : '#333333'
        },
        pageIconColor: isDark.value ? '#ff6b6b' : '#ef4444',
        pageIconInactiveColor: isDark.value ? '#1e1e1e' : '#ffffff',
    },
    series: [
        {
            name: t('components.chart.expenseCategories'),
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: true,
            padAngle: 2,
            label: {
                show: false,
                position: 'center',
                color: isDark.value ? '#e5e5e5' : '#333333'
            },
            emphasis: {
                focus: 'self',
                label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isDark.value ? '#e5e5e5' : '#333333'
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                scale: true,
                scaleSize: 5
            },
            labelLine: {
                show: false
            },
            data: props.data.map(item => ({
                ...item,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: isDark.value ? '#374151' : '#f3f4f6',
                }
            }))
        }
    ]
}))
</script>

<template>
    <v-chart class="w-full h-[400px]" :option="option" autoresize />
</template>
