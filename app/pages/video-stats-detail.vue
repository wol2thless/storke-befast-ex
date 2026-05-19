<template>
  <div class="max-w-md mx-auto p-4">
    <h2 class="text-xl font-bold text-primary mb-4">📊 สถิติการรับชมวิดีโอ</h2>
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!stats.length" class="text-center py-8 text-gray-500">ยังไม่มีข้อมูลการรับชมวิดีโอ</div>
    <div v-else class="space-y-3">
      <div v-for="(stat, idx) in stats" :key="String(stat.video_id)"
        class="bg-base-100 rounded-lg shadow p-4 flex items-center gap-3">
        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
          {{ idx + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate">{{ stat.video_title || stat.video_id }}</div>
          <div class="text-xs text-gray-500">รับชม {{ stat.view_count }} ครั้ง</div>
        </div>
        <span class="badge badge-primary">{{ stat.view_count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());
const loading = ref(true);
const stats = ref<Record<string, string | number>[]>([]);

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: Record<string, string | number>[] }>(`/api/video-view-stats?pid=${encodeURIComponent(pid.value)}`);
    if (res.success) stats.value = res.data || [];
  } finally { loading.value = false; }
});
</script>
