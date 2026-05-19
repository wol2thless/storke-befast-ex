<template>
  <div class="p-2">
    <div v-if="latest" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-red-600">📅</span>
        <span class="text-sm font-semibold">วันที่บันทึกล่าสุด: {{ formatDate(latest.created_at || '') }}</span>
      </div>
      <div class="bg-white rounded-lg p-3 border text-center">
        <div class="font-bold text-red-600">{{ statusLabel(latest.status) }}</div>
        <div v-if="latest.note" class="text-xs text-gray-600 mt-1">{{ latest.note }}</div>
      </div>
    </div>

    <div class="mb-4">
      <div class="font-semibold text-sm mb-2">สถานะการรับประทานยา</div>
      <div class="flex flex-col gap-2">
        <label v-for="opt in STATUS_OPTIONS" :key="opt.key"
          :class="['flex items-center gap-2 p-2 rounded border cursor-pointer', selected === opt.key ? 'border-primary bg-primary/10' : 'border-base-200']">
          <input type="radio" name="med-status" :value="opt.key" v-model="selected"
            class="radio radio-primary radio-sm" :disabled="alreadySavedToday" />
          <span class="text-sm">{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div class="mb-4">
      <div class="font-semibold text-sm mb-2">ช่วงเวลาการรับประทานยา</div>
      <div v-for="mt in MEAL_TIMES" :key="mt.key" class="mb-3">
        <label class="flex items-center gap-2 cursor-pointer mb-1">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm"
            :checked="selectedMealTimes.includes(mt.key)"
            :disabled="alreadySavedToday"
            @change="toggleMealTime(mt.key)" />
          <span class="font-semibold text-sm">{{ mt.label }}</span>
        </label>
        <div v-if="selectedMealTimes.includes(mt.key) && mt.key !== 'before_bed'" class="ml-6 flex flex-wrap gap-2">
          <label v-for="m in MEALS" :key="m.key" class="flex items-center gap-1 text-sm cursor-pointer">
            <input type="checkbox" class="checkbox checkbox-sm"
              :checked="(selectedMeals[mt.key] || []).includes(m.key)"
              :disabled="alreadySavedToday"
              @change="toggleMeal(mt.key, m.key)" />
            {{ m.label }}
          </label>
        </div>
      </div>
    </div>

    <textarea class="textarea textarea-bordered w-full mb-3" rows="2"
      placeholder="รายละเอียดเพิ่มเติม" v-model="note" :disabled="alreadySavedToday" />

    <button class="btn btn-success w-full" :disabled="!canSubmit || saving || alreadySavedToday" @click="handleSubmit">
      {{ alreadySavedToday ? "บันทึกได้วันละ 1 ครั้ง" : saving ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
    </button>
    <div v-if="msg" :class="['text-center mt-2 text-sm', msgError ? 'text-error' : 'text-success']">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();
const STATUS_OPTIONS = [
  { key: "taken", label: "รับประทานยาตามที่แพทย์สั่งครบถ้วน" },
  { key: "partial", label: "รับประทานยาบางส่วน" },
  { key: "missed", label: "ลืมรับประทานยา" },
  { key: "stopped", label: "หยุดรับประทานยา" },
];
const MEAL_TIMES = [
  { key: "before_meal", label: "ก่อนอาหาร" },
  { key: "after_meal", label: "หลังอาหาร" },
  { key: "before_bed", label: "ก่อนนอน" },
];
const MEALS = [
  { key: "breakfast", label: "เช้า" },
  { key: "lunch", label: "เที่ยง" },
  { key: "dinner", label: "เย็น" },
];
const LABEL_MAP: Record<string, string> = { taken: "รับประทานครบถ้วน", partial: "รับประทานบางส่วน", missed: "ลืมรับประทาน", stopped: "หยุดรับประทาน" };

const selected = ref("");
const selectedMealTimes = ref<string[]>([]);
const selectedMeals = ref<Record<string, string[]>>({});
const note = ref("");
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);
const latest = ref<Record<string, string> | null>(null);
const alreadySavedToday = computed(() => !!latest.value?.created_at && latest.value.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
const canSubmit = computed(() => {
  if (!selected.value || !selectedMealTimes.value.length) return false;
  return selectedMealTimes.value.every(mt => mt === "before_bed" || (selectedMeals.value[mt]?.length ?? 0) > 0);
});

function formatDate(d?: string) { return d ? new Date(d).toLocaleString("th-TH") : "-"; }
function statusLabel(s?: string) { return (s && LABEL_MAP[s]) || s || "-"; }

function toggleMealTime(key: string) {
  if (selectedMealTimes.value.includes(key)) {
    selectedMealTimes.value = selectedMealTimes.value.filter(k => k !== key);
    const m = { ...selectedMeals.value }; delete m[key]; selectedMeals.value = m;
  } else {
    selectedMealTimes.value = [...selectedMealTimes.value, key];
    if (key === "before_bed") selectedMeals.value = { ...selectedMeals.value, [key]: [] };
  }
}
function toggleMeal(mealTime: string, mealKey: string) {
  const cur = selectedMeals.value[mealTime] || [];
  selectedMeals.value = { ...selectedMeals.value, [mealTime]: cur.includes(mealKey) ? cur.filter(k => k !== mealKey) : [...cur, mealKey] };
}

async function fetchLatest() {
  if (!props.pid) return;
  const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/medication-record?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.data?.length) latest.value = res.data[0] ?? null;
}

async function handleSubmit() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/medication-record", {
      method: "POST",
      body: { pid: props.pid, status: selected.value, meal_times: selectedMealTimes.value.join(","), meals: JSON.stringify(selectedMeals.value), note: note.value }
    });
    if (res.success) {
      msg.value = "บันทึกข้อมูลสำเร็จ"; msgError.value = false;
      selected.value = ""; selectedMealTimes.value = []; selectedMeals.value = {}; note.value = "";
      await fetchLatest();
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}

onMounted(fetchLatest);
</script>
