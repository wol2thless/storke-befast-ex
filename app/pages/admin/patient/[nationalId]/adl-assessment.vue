<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>
    <h1 class="text-xl font-bold mb-4">📋 ประวัติการประเมิน ADL</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!records.length" class="text-center py-12 text-base-content/50">ไม่มีข้อมูล</div>

    <div v-else class="space-y-3">
      <div v-for="(rec, i) in records" :key="String(rec.id)" class="bg-blue-50 rounded-lg shadow p-4">
        <div class="flex justify-between items-start mb-2">
          <div class="text-xs text-base-content/60">ครั้งที่ {{ records.length - i }}</div>
          <div class="text-xs text-base-content/60">📅 {{ formatDate(String(rec.created_at || '')) }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-center">
          <div class="bg-white rounded-lg p-2">
            <div class="text-xs text-base-content/60 mb-1">คะแนน</div>
            <div class="text-lg font-bold text-blue-600">{{ rec.total_score }} / {{ rec.max_score }}</div>
          </div>
          <div class="bg-white rounded-lg p-2">
            <div class="text-xs text-base-content/60 mb-1">ระดับความสามารถ</div>
            <div class="font-bold text-sm" :class="colorClass(rec)">{{ rec.dependency_level }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const route = useRoute();
const nationalId = String(route.params.nationalId);
const loading = ref(true);
const records = ref<Record<string, string | number>[]>([]);

function formatDate(d: string) {
  return d ? new Date(d).toLocaleString("th-TH") : "-";
}

function colorClass(r: Record<string, string | number>) {
  const p = r.max_score ? (Number(r.total_score) / Number(r.max_score)) * 100 : 0;
  if (p >= 80) return "text-green-700";
  if (p >= 60) return "text-yellow-700";
  if (p >= 40) return "text-orange-700";
  return "text-red-700";
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; assessments?: Record<string, Record<string, string | number>> }>(
      `/api/adl-assessment?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success && res.assessments)
      records.value = Object.values(res.assessments).sort((a, b) =>
        String(b.created_at || "").localeCompare(String(a.created_at || ""))
      );
  } finally { loading.value = false; }
});
</script>
