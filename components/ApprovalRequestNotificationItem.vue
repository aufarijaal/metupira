<script setup lang="ts">

</script>
<template>
    <div>
        <!-- notification item containing approval request for linked account, allow or deny -->
        <div class="p-4 bg-base-200 rounded-lg shadow hover:bg-base-100 transition">
            <div class="flex items-start">
                <Icon size="20" name="material-symbols:account-circle" class="text-primary mr-2 mt-1" />
                <div>
                    <p class="font-semibold">{{ $t('components.notification.approvalRequest') }}</p>
                    <p class="text-sm text-base-content/70">{{ $t('components.notification.userRequestedLink', {
                        name:
                        'John Doe' }) }}</p>
                    <p class="text-xs text-base-content/50 mt-1">{{ $t('components.notification.minutesAgo', {
                        count: 5
                        }) }}</p>
                    <div class="mt-2 flex gap-2">
                        <button class="btn btn-sm btn-success">{{ $t('components.notification.approve') }}</button>
                        <button class="btn btn-sm btn-error">{{ $t('components.notification.deny') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
