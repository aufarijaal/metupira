<script setup lang="ts">
defineProps<{
    title?: string
    message?: string
    timestamp?: string
}>()
</script>

<template>
    <div>
        <!-- General purpose notification item with configurable title and content -->
        <div class="p-4 bg-base-200 rounded-lg shadow hover:bg-base-100 transition">
            <div class="flex items-start">
                <Icon size="20" name="material-symbols:info" class="text-primary mr-2 mt-1" />
                <div>
                    <p class="font-semibold">{{ title || $t('components.notification.notificationTitle') }}</p>
                    <p class="text-sm text-base-content/70">{{ message || $t('components.notification.generalMessage')
                        }}
                    </p>
                    <p class="text-xs text-base-content/50 mt-1">{{ timestamp || $t('components.notification.justNow')
                        }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
