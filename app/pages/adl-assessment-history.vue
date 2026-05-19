<template>
  <div class="max-w-md mx-auto p-4">
    <h2 class="text-xl font-bold text-primary mb-4">📊 ประวัติการประเมิน ADL</h2>
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!records.length" class="text-center py-8 text-gray-500">ยังไม่มีข้อมูล</div>
    <div v-else class="space-y-3">
      <div v-for="rec in records" :key="rec.id" class="bg-base-100 rounded-lg shadow p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-blue-600">📅</span>
          <span class="text-sm font-semibold">{{ formatDate(String(rec.created_at || '')) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div>
            <div class="text-xs text-gray-600 mb-1">คะแนน</div>
            <div class="text-lg font-bold text-blue-600">{{ rec.total_score }} / {{ rec.max_score }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-600 mb-1">ระดับ</div>
            <div class="text-sm font-bold" :class="colorClass(rec)">{{ rec.dependency_level }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());
const loading = ref(true);
const records = ref<Record<string, string | number>[]>([]);

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}
function colorClass(row: Record<string, string | number>) {
  const p = row.max_score ? (Number(row.total_score) / Number(row.max_score)) * 100 : 0;
  if (p >= 80) return "text-green-700";
  if (p >= 60) return "text-yellow-700";
  if (p >= 40) return "text-orange-700";
  return "text-red-700";
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; assessments?: Record<string, Record<string, string | number>> }>(`/api/adl-assessment?pid=${encodeURIComponent(pid.value)}`);
    if (res.success && res.assessments) {
      records.value = Object.values(res.assessments).sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    }
  } finally { loading.value = false; }
});
</script>
