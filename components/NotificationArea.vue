<script setup lang="ts">
import { useNotificationStore } from '~/store/useNotificationStore';

const { notifications, getNotifications } = useNotificationStore();

onMounted(() => {
    getNotifications();
})
</script>

<template>
    <div class="dropdown dropdown-end dropdown-sm">
        <div tabindex="0" role="button" class="btn btn-sm m-1">
            <Icon v-if="notifications.length > 0" size="24" name="ic:outline-notifications-active"
                class="animation-shake" />
            <Icon v-else size="24" name="ic:outline-notifications" />
        </div>
        <ul tabindex="0"
            class="dropdown-content bg-base-300 rounded-box z-[1] w-[400px] p-2 shadow-2xl max-h-[500px] overflow-y-auto space-y-1">
            <li v-if="notifications.length === 0" class="p-4 text-center text-sm text-gray-500">
                {{ $t('components.notification.noNewNotifications') }}
            </li>
            <li v-for="(notification, index) in notifications" :key="index"
                class="bg-base-100 h-16 flex flex-column items-center">
                <NuxtLink v-if="notification.url" :to="notification.url">
                    <div class="p-2 flex items-center gap-2">
                        <Icon v-if="notification.type === 'info'" size="24" name="fluent:info-28-regular"
                            class="text-info" />
                        <Icon v-else-if="notification.type === 'warning'" size="24" name="fluent:warning-28-regular"
                            class="text-warning" />
                        <Icon v-else="notification.type === 'error'" size="24" name="fluent:error-circle-24-regular"
                            class="text-error" />
                        <div class="text-sm">{{ notification.message }}</div>
                    </div>
                </NuxtLink>

                <div v-else class="p-2 flex items-center gap-2">
                    <Icon size="18" name="material-symbols:info-outline" />
                    <div class="text-sm">{{ notification.message }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>
