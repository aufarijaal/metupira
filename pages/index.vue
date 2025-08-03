<script setup lang="ts">

</script>

<template>
    <div>
        <h1 class="text-3xl font-bold text-center mt-10">Metu Pira</h1>
        <p class="text-center mt-4">
            Welcome to Metu Pira, your go-to platform for managing your personal finances with ease and efficiency.
            <br />
            <strong>Get started by signing in or creating a new account!</strong>
        </p>
        <div class="flex justify-center mt-6">
            <NuxtLink to="/auth/signin" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Go to Sign In
            </NuxtLink>
        </div>
    </div>
</template>