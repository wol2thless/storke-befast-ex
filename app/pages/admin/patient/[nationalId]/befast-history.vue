<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>
    <h1 class="text-xl font-bold mb-4">🧠 ประวัติ BEFAST</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!records.length" class="text-center py-12 text-base-content/50">ไม่มีข้อมูล</div>

    <div v-else class="space-y-3">
      <div v-for="(rec, i) in records" :key="rec.id"
        class="rounded-lg shadow p-4"
        :class="isRisky(rec.symptoms) ? 'bg-red-50' : 'bg-green-50'">
        <div class="flex justify-between items-start mb-2">
          <div class="text-xs text-base-content/60">ครั้งที่ {{ records.length - i }}</div>
          <div class="text-xs text-base-content/60">📅 {{ formatDate(rec.record_date || rec.created_at) }}</div>
        </div>
        <div class="flex flex-wrap gap-1 mb-2">
          <span v-if="!rec.symptoms || rec.symptoms === 'NONE'"
            class="badge badge-success badge-sm">ปกติ ไม่มีอาการ</span>
          <template v-else>
            <span v-for="s in rec.symptoms.split(',')" :key="s"
              class="badge badge-error badge-sm">{{ SYMPTOM_LABELS[s.trim()] || s.trim() }}</span>
          </template>
        </div>
        <div class="text-xs font-medium" :class="isRisky(rec.symptoms) ? 'text-red-600' : 'text-green-600'">
          {{ isRisky(rec.symptoms) ? '⚠️ มีความเสี่ยงสูง' : '✅ ไม่มีความเสี่ยง' }}
        </div>
        <div v-if="rec.note" class="text-xs text-base-content/60 mt-1">{{ rec.note }}</div>
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

const SYMPTOM_LABELS: Record<string, string> = {
  B: "B - Balance (ทรงตัว)",
  E: "E - Eyes (ตามองเห็น)",
  F: "F - Face (ใบหน้าเบี้ยว)",
  A: "A - Arm (แขนอ่อนแรง)",
  S: "S - Speech (พูดไม่ชัด)",
  T: "T - Time (เวลา)",
  NONE: "ปกติ",
};

function isRisky(symptoms?: string) {
  return symptoms && symptoms !== 'NONE' && symptoms.trim() !== '';
}

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-";
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(
      `/api/befast?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success) records.value = res.data || [];
  } finally { loading.value = false; }
});
</script>
