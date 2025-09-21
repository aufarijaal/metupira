<script setup lang="ts">

</script>
<template>
    <div>
        <!-- notification item containing approval request for linked account, allow or deny -->
        <div class="p-4 bg-base-200 rounded-lg shadow hover:bg-base-100 transition">
            <div class="flex items-start">
                <Icon size="20" name="material-symbols:account-circle" class="text-primary mr-2 mt-1" />
                <div>
                    <p class="font-semibold">Approval Request</p>
                    <p class="text-sm text-base-content/70">User John Doe has requested to link their account.</p>
                    <p class="text-xs text-base-content/50 mt-1">5 minutes ago</p>
                    <div class="mt-2 flex gap-2">
                        <button class="btn btn-sm btn-success">Approve</button>
                        <button class="btn btn-sm btn-error">Deny</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
