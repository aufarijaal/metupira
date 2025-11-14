<script setup lang="ts">
import { useOneSignal } from "@onesignal/onesignal-vue3";

const onesignal = useOneSignal();
const user = useSupabaseUser();
const client = useSupabaseClient();

async function requestPermissionAndSaveId() {
    console.log("Requesting notification permission...");
    await onesignal.Notifications.requestPermission();
    const permission = await onesignal.Notifications.permission;
    console.log("Notification permission:", permission);

    const playerId = await onesignal.User.PushSubscription.id;
    console.log("✅ OneSignal Player ID:", playerId);

    if (playerId) {

        await client.from('user_devices').insert({
            user_id: user.value?.id,
            onesignal_player_id: playerId,
            device_type: navigator.userAgent,
            last_active_at: new Date().toISOString()
        }).then(({ error }) => {
            if (error) {
                console.error("Error saving OneSignal Player ID to database:", error);
            } else {
                console.log("Successfully saved OneSignal Player ID to database.");
            }
        });
    }
}
</script>

<template>
    <div>
        <button :disabled="onesignal.Notifications.permission" class="btn btn-primary"
            @click="requestPermissionAndSaveId">
            {{ onesignal.Notifications.permission ? $t('components.buttonNotification.notificationsEnabled') :
                $t('components.buttonNotification.enableNotifications') }}
        </button>
    </div>
</template>
