<script setup lang="ts">

</script>

<template>
    <div class="dropdown dropdown-end dropdown-sm">
        <div tabindex="0" role="button" class="btn btn-sm m-1">
            <Icon size="24" name="material-symbols:notifications-outline" />
            <!-- <Icon size="24" name="material-symbols:notifications-unread-outline" /> -->
        </div>
        <ul tabindex="0"
            class="dropdown-content bg-base-300 rounded-box z-[1] w-[400px] p-2 shadow-2xl max-h-[500px] overflow-y-auto">
            <!-- Notification list placeholder along with mark all as read button -->
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-lg">Notifications</span>
                <button class="btn btn-xs btn-outline">Mark all as read</button>
            </div>
            <li class="mb-2 p-2 bg-base-200 rounded-lg shadow hover:bg-base-100 transition">
                <!-- Show a message that Notification feature is on development -->
                <div class="flex items center">
                    <Icon size="20" name="material-symbols:construction" class="text-primary mr-2 mt-1" />
                    <div>
                        <p class="font-semibold">Notification Feature Coming Soon!</p>
                        <p class="text-sm text-base-content/70">We're working hard to bring you notifications for
                            important updates and activities.</p>
                        <p class="text-xs text-base-content/50 mt-1">Stay tuned!</p>
                    </div>
                </div>

                <!-- <div class="flex items-start">
                    <Icon size="20" name="material-symbols:payment" class="text-primary mr-2 mt-1" />
                    <div>
                        <p class="font-semibold">New Transaction Added</p>
                        <p class="text-sm text-base-content/70">You have added a new transaction of IDR 500,000.</p>
                        <p class="text-xs text-base-content/50 mt-1">2 hours ago</p>
                    </div>
                </div>
                <ApprovalRequestNotificationItem /> -->
            </li>
        </ul>
    </div>
</template>
