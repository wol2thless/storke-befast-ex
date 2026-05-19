<template>
  <div class="p-2">
    <div v-if="latest" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-orange-600">📅</span>
        <span class="text-sm font-semibold">วันที่บันทึกล่าสุด: {{ formatDate(latest.created_at || '') }}</span>
      </div>
      <div class="bg-white rounded-lg p-3 border text-center">
        <div class="text-xs text-gray-600 mb-1">สถานะการรับประทานอาหาร</div>
        <div class="font-bold text-orange-600">{{ statusLabel(latest.status) }}</div>
        <div v-if="latest.note" class="text-xs text-gray-600 mt-1">{{ latest.note }}</div>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-4 mb-4">
      <label v-for="opt in STATUS_OPTIONS" :key="opt.key"
        :class="['flex items-center gap-2 p-2 rounded border cursor-pointer transition-all', selected === opt.key ? 'border-primary bg-primary/10' : 'border-base-200']">
        <input type="radio" name="nutrition-status" :value="opt.key" v-model="selected"
          class="radio radio-primary radio-sm" :disabled="alreadySavedToday" />
        <span class="text-sm font-bold">{{ opt.label }}</span>
      </label>
    </div>

    <textarea class="textarea textarea-bordered w-full mb-3" rows="2"
      placeholder="รายละเอียดเพิ่มเติม" v-model="note" :disabled="alreadySavedToday" />

    <button class="btn btn-success w-full" :disabled="!selected || saving || alreadySavedToday" @click="handleSubmit">
      {{ alreadySavedToday ? "บันทึกได้วันละ 1 ครั้ง" : saving ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
    </button>
    <div v-if="msg" :class="['text-center mt-2 text-sm', msgError ? 'text-error' : 'text-success']">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();
const STATUS_OPTIONS = [
  { key: "normal_full", label: "รับประทานอาหารได้เหมาะสมกับโรค ทานได้ปกติ และครบ 5 หมู่" },
  { key: "normal_notfull", label: "รับประทานอาหารได้เหมาะสมกับโรค ทานได้ปกติ แต่ไม่ครบ 5 หมู่" },
  { key: "less", label: "รับประทานอาหารได้เหมาะสมกับโรค แต่ทานได้น้อย" },
  { key: "cannot", label: "ไม่สามารถรับประทานอาหารได้" },
];
const LABEL_MAP: Record<string, string> = { normal_full: "อาหารครบ 5 หมู่", normal_notfull: "อาหารไม่ครบ 5 หมู่", less: "ทานได้น้อย", cannot: "ไม่สามารถทานได้" };

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
  const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/nutrition-record?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.data?.length) latest.value = res.data[0] ?? null;
}

async function handleSubmit() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/nutrition-record", {
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
