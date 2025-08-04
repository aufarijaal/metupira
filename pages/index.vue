<script setup lang="ts">
const features = [
    {
        title: 'Smart Expense Tracking',
        description: 'Catat semua pengeluaran dan pemasukan dengan mudah. Kategorisasi otomatis membantu Anda memahami pola keuangan.',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>`
    },
    {
        title: 'Visualisasi Data',
        description: 'Lihat data keuangan Anda dalam bentuk grafik dan diagram yang mudah dipahami. Analisis tren dan buat keputusan lebih baik.',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`
    },
    {
        title: 'Manajemen Kategori',
        description: 'Atur kategori pengeluaran sesuai kebutuhan. Pantau pengeluaran per kategori untuk kontrol anggaran yang lebih baik.',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`
    },
    {
        title: 'Laporan Terperinci',
        description: 'Dapatkan laporan detail tentang kondisi keuangan Anda. Export laporan dalam format yang Anda butuhkan.',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
    }
]

const testimonials = [
    {
        name: 'Budi Santoso',
        role: 'Freelancer',
        content: 'Metu Pira membantu saya melacak pendapatan freelance dengan lebih baik. Sekarang saya bisa melihat pola pemasukan dan membuat keputusan bisnis yang lebih tepat.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi'
    },
    {
        name: 'Siti Rahayu',
        role: 'Ibu Rumah Tangga',
        content: 'Aplikasi yang sangat membantu untuk mengatur keuangan rumah tangga. Fitur kategori dan laporan membuat saya lebih mudah mengontrol pengeluaran keluarga.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti'
    },
    {
        name: 'Ahmad Hidayat',
        role: 'Pengusaha UMKM',
        content: 'Visualisasi data yang bagus dan mudah dipahami. Sangat membantu untuk melihat performa bisnis dan mengambil keputusan strategis.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad'
    }
]
</script>

<template>
    <div class="min-h-screen">
        <!-- Hero Section -->
        <section class="relative bg-indigo-500 overflow-hidden">
            <div class="absolute inset-0 bg-black/10"></div>
            <div class="relative container mx-auto px-6 py-20 md:py-32">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="text-primary-content">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6">
                            Kelola Keuangan Anda dengan Metu Pira
                        </h1>
                        <p class="text-lg md:text-xl mb-8 opacity-90">
                            Platform manajemen keuangan pribadi yang membantu Anda melacak pengeluaran, menganalisis
                            pola
                            keuangan, dan mencapai tujuan finansial Anda.
                        </p>
                        <div class="flex gap-4">
                            <NuxtLink to="/auth/signin" class="btn btn-secondary btn-lg">
                                Masuk
                            </NuxtLink>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <!-- Hero Image Placeholder -->
                        <div
                            class="w-full max-w-lg mx-auto aspect-square rounded-3xl bg-primary-content/10 flex items-center justify-center">
                            <div class="text-8xl text-primary-content/20">
                                <img class="h-[500px]" src="~/assets/img/hero.png" alt="">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-20 bg-base-100">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">Fitur Unggulan</h2>
                    <p class="text-lg text-base-content/70">
                        Berbagai fitur yang memudahkan pengelolaan keuangan Anda
                    </p>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div v-for="feature in features" :key="feature.title"
                        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                        <div class="card-body">
                            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4"
                                v-html="feature.icon">
                            </div>
                            <h3 class="text-xl font-semibold mb-3">{{ feature.title }}</h3>
                            <p class="text-base-content/70">{{ feature.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Screenshots/Demo Section -->
        <section class="py-20 bg-base-200">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">Lihat Metu Pira Beraksi</h2>
                    <p class="text-lg text-base-content/70">
                        Interface yang intuitif dan mudah digunakan
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <!-- Dashboard Preview -->
                    <div class="card bg-base-100 shadow-xl">
                        <figure class="px-6 pt-6">
                            <div class="w-full aspect-video bg-base-200 rounded-xl flex items-center justify-center">
                                <svg class="w-20 h-20 text-base-content/20" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                        </figure>
                        <div class="card-body">
                            <h3 class="card-title">Dashboard Informatif</h3>
                            <p>Lihat ringkasan keuangan Anda dalam sekali pandang</p>
                        </div>
                    </div>
                    <!-- Reports Preview -->
                    <div class="card bg-base-100 shadow-xl">
                        <figure class="px-6 pt-6">
                            <div class="w-full aspect-video bg-base-200 rounded-xl flex items-center justify-center">
                                <svg class="w-20 h-20 text-base-content/20" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </figure>
                        <div class="card-body">
                            <h3 class="card-title">Laporan Detail</h3>
                            <p>Analisis mendalam tentang pola pengeluaran Anda</p>
                        </div>
                    </div>
                    <!-- Categories Preview -->
                    <div class="card bg-base-100 shadow-xl">
                        <figure class="px-6 pt-6">
                            <div class="w-full aspect-video bg-base-200 rounded-xl flex items-center justify-center">
                                <svg class="w-20 h-20 text-base-content/20" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </figure>
                        <div class="card-body">
                            <h3 class="card-title">Manajemen Kategori</h3>
                            <p>Atur kategori sesuai kebutuhan Anda</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="py-20 bg-base-100">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">Apa Kata Pengguna</h2>
                    <p class="text-lg text-base-content/70">
                        Kisah sukses dari pengguna Metu Pira
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div v-for="testimonial in testimonials" :key="testimonial.name"
                        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                        <div class="card-body">
                            <div class="flex items-center mb-4">
                                <div class="avatar placeholder">
                                    <div class="w-12 h-12 rounded-full bg-primary text-primary-content">
                                        <span class="text-lg">{{testimonial.name.split(' ').map(n => n[0]).join('')
                                            }}</span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <h3 class="font-semibold">{{ testimonial.name }}</h3>
                                    <p class="text-sm text-base-content/70">{{ testimonial.role }}</p>
                                </div>
                            </div>
                            <p class="text-base-content/80">{{ testimonial.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-20 bg-primary text-primary-content">
            <div class="container mx-auto px-6 text-center">
                <h2 class="text-3xl md:text-4xl font-bold mb-6">
                    Mulai Kelola Keuangan Anda Sekarang
                </h2>
                <p class="text-lg mb-8 opacity-90">
                    Bergabung dengan ribuan pengguna yang telah merasakan manfaat menggunakan Metu Pira
                </p>
                <div class="flex justify-center gap-4">
                    <NuxtLink to="/auth/signin" class="btn btn-secondary btn-lg">
                        Mulai Gratis
                    </NuxtLink>
                    <a href="#features" class="btn btn-outline btn-lg text-base-100 hover:text-primary-focus">
                        Pelajari Lebih Lanjut
                    </a>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer footer-center p-10 bg-base-200 text-base-content">
            <div>
                <p class="font-bold text-lg">Metu Pira</p>
                <p>Aplikasi Manajemen Keuangan Pribadi</p>
                <p>Copyright © 2025 - All rights reserved</p>
            </div>
            <div>
                <div class="grid grid-flow-col gap-4">
                    <a href="#" class="link link-hover">Tentang</a>
                    <a href="#" class="link link-hover">Kontak</a>
                    <a href="#" class="link link-hover">Kebijakan Privasi</a>
                    <a href="#" class="link link-hover">Syarat & Ketentuan</a>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.from-primary {
    --tw-gradient-from: var(--p);
    --tw-gradient-to: color-mix(in srgb, var(--p) 0%, transparent);
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-primary-focus {
    --tw-gradient-to: var(--pf, var(--p));
}
</style>