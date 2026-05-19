<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>
    <h1 class="text-xl font-bold mb-4">💊 ประวัติการรับประทานยา</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!records.length" class="text-center py-12 text-base-content/50">ไม่มีข้อมูล</div>

    <div v-else class="space-y-3">
      <div v-for="(rec, i) in records" :key="rec.id" class="bg-red-50 rounded-lg shadow p-4">
        <div class="flex justify-between items-start mb-2">
          <div class="text-xs text-base-content/60">ครั้งที่ {{ records.length - i }}</div>
          <div class="text-xs text-base-content/60">📅 {{ formatDate(rec.created_at) }}</div>
        </div>
        <div class="font-bold text-sm" :class="statusColor(rec.status)">{{ statusLabel(rec.status) }}</div>
        <div v-if="rec.note" class="text-xs text-base-content/60 mt-1">📝 {{ rec.note }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const route = useRoute();
const nationalId = String(route.params.nationalId);
const loading = ref(true);
const records = ref<Record<string, string>[]>([]);

const LABELS: Record<string, string> = {
  taken: "รับประทานครบถ้วน",
  partial: "รับประทานบางส่วน",
  missed: "ลืมรับประทาน",
  stopped: "หยุดรับประทาน",
};

function formatDate(d?: string) { return d ? new Date(d).toLocaleString("th-TH") : "-"; }
function statusLabel(s?: string) { return (s && LABELS[s]) || s || "-"; }
function statusColor(s?: string) {
  if (s === "taken") return "text-green-600";
  if (s === "partial") return "text-yellow-600";
  if (s === "missed" || s === "stopped") return "text-red-600";
  return "text-base-content";
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(
      `/api/medication-record?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success) records.value = res.data || [];
  } finally { loading.value = false; }
});
</script>
