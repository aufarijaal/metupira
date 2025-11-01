<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
});

useHead({
    title: "Settings",
    meta: [{ name: "description", content: "User settings page" }],
});
</script>

<template>
    <div class="min-h-screen p-6 space-y-6">
        <!-- Enable Notifications -->
        <div class="bg-base-100 p-6 rounded-box shadow">
            <h2 class="text-2xl font-bold mb-4">Enable Notifications</h2>
            <client-only>
                <button-notification-enablement />
            </client-only>
        </div>

        <!-- Delete Account -->
        <div class="bg-base-100 p-6 rounded-box shadow">
            <h2 class="text-2xl font-bold mb-4">Delete Account</h2>
            <p class="mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button class="btn btn-error">Delete Account</button>
        </div>
    </div>
</template>
