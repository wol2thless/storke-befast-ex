<template>
  <div class="p-2">
    <div v-if="latest" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-green-600">📅</span>
        <span class="text-sm font-semibold">วันที่บันทึกล่าสุด: {{ formatDate(latest.created_at || '') }}</span>
      </div>
      <div class="bg-white rounded-lg p-3 border text-center">
        <div class="text-xs text-gray-600 mb-1">สถานะการออกกำลังกาย</div>
        <div class="font-bold text-green-600">{{ statusLabel(latest.status) }}</div>
        <div v-if="latest.note" class="text-xs text-gray-600 mt-1">{{ latest.note }}</div>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-4 mb-4">
      <label v-for="ex in STATUS_OPTIONS" :key="ex.key"
        :class="['flex items-center gap-2 p-2 rounded border cursor-pointer transition-all', selected === ex.key ? 'border-primary bg-primary/10' : 'border-base-200']">
        <input type="radio" name="exercise-status" :value="ex.key" v-model="selected"
          class="radio radio-primary radio-sm" :disabled="alreadySavedToday" />
        <span class="text-sm font-bold">{{ ex.label }}</span>
      </label>
    </div>

    <textarea class="textarea textarea-bordered w-full mb-3" rows="2"
      placeholder="รายละเอียดเพิ่มเติม" v-model="note" :disabled="alreadySavedToday" />

    <button class="btn btn-success w-full" :disabled="!selected || saving || alreadySavedToday" @click="handleSubmit">
      {{ alreadySavedToday ? "บันทึกได้วันละ 1 ครั้ง" : saving ? "กำลังบันทึก..." : "บันทึกกิจกรรม" }}
    </button>
    <div v-if="msg" :class="['text-center mt-2 text-sm', msgError ? 'text-error' : 'text-success']">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();
const STATUS_OPTIONS = [
  { key: "daily", label: "ทำทุกวัน (อย่างน้อย 30 นาที)" },
  { key: "regular", label: "ทำสม่ำเสมอ (30นาที/วัน และทำ 3 ครั้ง/สัปดาห์)" },
  { key: "none", label: "ไม่ได้ทำ" },
];
const LABEL_MAP: Record<string, string> = { daily: "ทำทุกวัน", regular: "ทำสม่ำเสมอ", none: "ไม่ได้ทำ" };

const selected = ref("");
const note = ref("");
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);
const latest = ref<Record<string, string> | null>(null);
const alreadySavedToday = computed(() => !!latest.value?.created_at && latest.value.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));

function formatDate(d?: string) { return d ? new Date(d).toLocaleString("th-TH") : "-"; }
function statusLabel(s?: string) { return (s && LABEL_MAP[s]) || s || "-"; }

async function fetchLatest() {
  if (!props.pid) return;
  const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/exercise-record?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.data?.length) latest.value = res.data[0] ?? null;
}

async function handleSubmit() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/exercise-record", {
      method: "POST", body: { pid: props.pid, status: selected.value, note: note.value }
    });
    if (res.success) {
      msg.value = "บันทึกข้อมูลสำเร็จ"; msgError.value = false;
      selected.value = ""; note.value = "";
      await fetchLatest();
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}

onMounted(fetchLatest);
</script>
