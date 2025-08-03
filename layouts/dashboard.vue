<template>
    <div class="h-screen bg-base-200 flex overflow-hidden">
        <!-- Mobile Overlay -->
        <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            @click="toggleMobileMenu"></div>

        <!-- Sidebar -->
        <aside :class="[
            'fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-base-100 shadow-lg transform transition-transform duration-300 ease-in-out flex-shrink-0',
            'lg:transform-none',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            !isSidebarOpen && 'lg:w-16'
        ]">
            <div class="flex flex-col h-full">
                <!-- Logo/Brand -->
                <div class="flex items-center justify-between p-4 border-b border-base-300">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                        </div>
                        <transition name="fade">
                            <span v-if="isSidebarOpen" class="text-xl font-bold text-base-content">
                                Dashboard
                            </span>
                        </transition>
                    </div>

                    <!-- Desktop Toggle -->
                    <button @click="toggleSidebar" class="hidden lg:flex btn btn-ghost btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <!-- Mobile Close -->
                    <button @click="toggleMobileMenu" class="lg:hidden btn btn-ghost btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-4 space-y-2">
                    <div v-for="item in menuItems" :key="item.id" class="relative">
                        <button @click="selectMenuItem(item)" :class="[
                            'w-full flex items-center rounded-lg transition-colors duration-200',
                            isSidebarOpen ? 'space-x-3 px-3 py-2' : 'justify-center py-3',
                            activeMenuItem === item.id
                                ? 'bg-primary text-primary-content'
                                : 'text-base-content hover:bg-base-200'
                        ]">
                            <div class="w-5 h-5 flex-shrink-0" v-html="item.icon"></div>
                            <transition name="fade">
                                <span v-if="isSidebarOpen" class="text-sm font-medium">
                                    {{ item.name }}
                                </span>
                            </transition>
                        </button>
                    </div>
                </nav>

                <!-- User Profile -->
                <div class="p-4 border-t border-base-300">
                    <div class="flex items-center space-x-3">
                        <div class="avatar">
                            <div class="w-10 h-10 rounded-full">
                                <ClientOnly>
                                    <img :src="user?.user_metadata.picture" alt="User Avatar">
                                </ClientOnly>
                            </div>
                        </div>
                        <transition name="fade">
                            <div v-if="isSidebarOpen" class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-base-content truncate">{{ user?.user_metadata.name }}
                                </p>
                                <p class="text-xs text-base-content/70 truncate">{{ user?.user_metadata.email }}</p>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Header -->
            <header class="bg-base-100 shadow-sm border-b border-base-300 p-4 flex-shrink-0">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <!-- Mobile Menu Toggle -->
                        <button @click="toggleMobileMenu" class="lg:hidden btn btn-ghost btn-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h1 class="text-2xl font-bold text-base-content">
                            {{ getCurrentPageTitle() }}
                        </h1>
                    </div>

                    <!-- Header Actions -->
                    <div class="flex items-center space-x-2">
                        <ThemeController />
                        <button @click="handleSignOut" :disabled="isSigningOut" class="btn btn-ghost btn-xs">
                            <span>{{ isSigningOut ? 'Signing out...' : 'Sign out' }}</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto p-0 lg:p-6">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { MenuItem } from '~/types/menu'

// Auth composable
const { user, signOut: handleSignOut } = useAuth()

// Reactive state
const isSidebarOpen = ref<boolean>(true)
const isMobileMenuOpen = ref<boolean>(false)
const activeMenuItem = ref<string>('dashboard')
const isSigningOut = ref(false)

// Menu items
const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
    },
    {
        id: 'add-transaction',
        name: 'Add Transaction',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/></svg>'
    },
    {
        id: 'categories',
        name: 'Categories',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12A6 6 0 0110 4zM7.293 9.293a1 1 0 011.414-1.414l2.586 2.586a1 1 0 010 1.414l-2.586 2.586a1 1 0 01-1.414-1.414L9.586 11H5a1 1 0 110-2h4.586L7.293 9.293z"/></svg>'
    },
    {
        id: 'profile',
        name: 'Profile',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12A6 6 0 0110 4zM4.293 15.707A1 1 0 015.414 14H14.586a1 1 0 01.707.293l2.586-2.586A1.5 1.5 0 0017.5 10h-15a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.207-1.465L4.293 15.707z"/></svg>'
    },
    {
        id: 'reports',
        name: 'Reports',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3.1727,17 L16,17 C17,17,18,16,18,15 L18,4 C18,3,17,2,16,2 L4,2 C3,2,2,3,2,4 L2,15 C2,16,3,17,4,17 L3.1727,17 Z M4,4 L16,4 L16,15 L4,15 L4,4 Z M6,6 L8,6 L8,8 L6,8 L6,6 Z M10,6 L14,6 L14,8 L10,8 L10,6 Z M6,10 L14,10 L14,12 L6,12 L6,10 Z"/></svg>'
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>'
    },
]

// Methods
const toggleSidebar = (): void => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const toggleMobileMenu = (): void => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const router = useRouter()

const selectMenuItem = (item: MenuItem): void => {
    activeMenuItem.value = item.id
    // Close mobile menu when item is selected
    if (isMobileMenuOpen.value) {
        isMobileMenuOpen.value = false
    }
    // Handle navigation
    const route = item.id === 'dashboard' ? '/dashboard' : `/dashboard/${item.id}`
    router.push(route)
}

const getCurrentPageTitle = (): string => {
    const item = menuItems.find(item => item.id === activeMenuItem.value)
    return item?.name || 'Dashboard'
}

const getCurrentPageIcon = (): string => {
    const item = menuItems.find(item => item.id === activeMenuItem.value)
    return item?.icon || menuItems[0].icon
}

// Handle window resize
const handleResize = (): void => {
    if (window.innerWidth >= 1024) {
        isMobileMenuOpen.value = false
    }
}

// Lifecycle
onMounted(() => {
    window.addEventListener('resize', handleResize)
    // Set initial sidebar state based on screen size
    if (window.innerWidth >= 1024) {
        isSidebarOpen.value = true
    } else {
        isSidebarOpen.value = false
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Custom transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
}

/* Ensure proper overflow handling */
.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
</style>