<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
    layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()

const loading = ref(false)
const error = ref('')
const summary = ref('')

const generateSummary = async () => {
    try {
        loading.value = true
        summary.value = ''

        // Fetch transactions from the supabase
        const { data: transactions, error: fetchError } = await supabase
            .from('transactions')
            .select(`
                type,
                amount,
                category_id(
                    name
                ),
                note,
                transaction_at
            `)
            .order('transaction_at', { ascending: false })
            // limit 7 days
            .gte('transaction_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .eq('user_id', user.value?.id)

        if (fetchError) throw fetchError

        const { data, error } = await useFetch('/api/analyze-transactions', {
            method: 'POST',
            body: { transactions: JSON.stringify(transactions) }
        });

        if (error.value) throw error.value
        summary.value = data.value.summary
    } catch (err: any) {
        error.value = err.message || t('components.aiSummarize.failedToGenerateSummary')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="w-full bg-base-100 p-6 rounded-lg shadow-md flex flex-col items-center">
        <button class="btn btn-primary" @click="generateSummary" :disabled="loading">
            <span v-if="loading">{{ $t('common.loading') }}</span>
            <span v-else>
                {{ $t('components.aiSummarize.generateWeeklySummary') }}
            </span>
        </button>

        <!-- showing label powered by gemini with the icon -->
        <div class="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <span class="translate-y-0.5">{{ $t('components.aiSummarize.poweredBy') }}</span>
            <icons-gemini-text-icon />
        </div>

        <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>

        <div v-if="summary" class="mt-4 p-4 bg-base-200 rounded-lg w-full whitespace-pre-wrap text-sm sm:text-base">
            {{ summary }}
        </div>
    </div>
</template>
