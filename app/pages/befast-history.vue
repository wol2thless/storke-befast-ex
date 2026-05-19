<template>
  <div class="max-w-md mx-auto p-4">
    <h2 class="text-xl font-bold text-primary mb-4">📋 ประวัติการประเมิน BEFAST</h2>
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!records.length" class="text-center py-8 text-gray-500">ยังไม่มีข้อมูล</div>
    <div v-else class="space-y-3">
      <div v-for="rec in records" :key="rec.id" class="bg-base-100 rounded-lg shadow p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-amber-600">📅</span>
          <span class="text-sm font-semibold text-gray-700">{{ formatDate(rec.record_date || rec.created_at) }}</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="s in (rec.symptoms || '').split(',')" :key="s"
            class="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
            {{ SYMPTOM_LABELS[s] || s }}
          </span>
        </div>
        <div v-if="rec.note" class="text-sm text-gray-600 mt-2">หมายเหตุ: {{ rec.note }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());

const SYMPTOM_LABELS: Record<string, string> = {
  B: "Balance (ทรงตัวไม่ได้)", E: "Eyes (ตามัว)", F: "Face (หน้าเบี้ยว)",
  A: "Arm (แขนขาอ่อนแรง)", S: "Speech (พูดลำบาก)", T: "Time (รีบไป รพ.)", NONE: "อาการทั่วไปปกติ"
};

const loading = ref(true);
const records = ref<Record<string, string>[]>([]);

function formatDate(d?: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/befast?pid=${encodeURIComponent(pid.value)}`);
    if (res.success && res.data) records.value = res.data;
  } finally { loading.value = false; }
});
</script>
