<script setup lang="ts">
import { useNotificationStore } from '~/store/useNotificationStore';

const { notifications } = useNotificationStore();
</script>

<template>
    <div class="dropdown dropdown-end dropdown-sm">
        <div tabindex="0" role="button" class="btn btn-sm m-1">
            <Icon v-if="notifications.length > 0" size="24" name="material-symbols:notifications-unread-outline"
                class="animation-shake" />
            <Icon v-else size="24" name="material-symbols:notifications-outline" />
        </div>
        <ul tabindex="0"
            class="dropdown-content bg-base-300 rounded-box z-[1] w-[400px] p-2 shadow-2xl max-h-[500px] overflow-y-auto space-y-1">
            <li v-if="notifications.length === 0" class="p-4 text-center text-sm text-gray-500">
                No new notifications
            </li>
            <li v-for="(notification, index) in notifications" :key="index" class="bg-base-100 h-10">
                <NuxtLink v-if="notification.url" :to="notification.url">
                    <div class="p-2 flex items-center gap-2">
                        <Icon size="18" name="material-symbols:info-outline" />
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
