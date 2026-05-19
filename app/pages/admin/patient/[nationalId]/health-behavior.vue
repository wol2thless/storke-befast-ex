<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>
    <h1 class="text-xl font-bold mb-4">🧘 ประวัติพฤติกรรมสุขภาพ</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="!records.length" class="text-center py-12 text-base-content/50">ไม่มีข้อมูล</div>

    <div v-else class="space-y-4">
      <div v-for="(rec, i) in records" :key="rec.id" class="bg-purple-50 rounded-lg shadow p-4">
        <!-- Header -->
        <div class="flex justify-between items-start mb-3">
          <div class="text-xs text-base-content/60">ครั้งที่ {{ records.length - i }}</div>
          <div class="text-xs text-base-content/60">📅 {{ formatDate(rec.created_at) }}</div>
        </div>

        <!-- Level badge -->
        <div class="mb-3">
          <span class="badge badge-lg font-bold" :class="levelBadge(rec.behaviors)">
            {{ evalLevel(rec.behaviors) }}
          </span>
        </div>

        <!-- Individual behaviors -->
        <div class="space-y-1.5">
          <div v-for="item in getBehaviors(rec.behaviors)" :key="item.key"
            class="flex items-center gap-2 text-sm">
            <span :class="item.ok ? 'text-green-600' : 'text-red-500'">{{ item.ok ? '✅' : '❌' }}</span>
            <span class="text-base-content/80">{{ item.label }}</span>
          </div>
        </div>

        <div v-if="rec.note" class="text-xs text-base-content/60 mt-2">📝 {{ rec.note }}</div>
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

const BEHAVIOR_KEYS = [
  { key: "medication",             label: "รับประทานยาตามแพทย์สั่ง" },
  { key: "control_risk",           label: "ควบคุมปัจจัยเสี่ยง (ความดัน/เบาหวาน/ไขมัน)" },
  { key: "diet_control",           label: "ควบคุมอาหาร" },
  { key: "exercise",               label: "ออกกำลังกายสม่ำเสมอ" },
  { key: "avoid_smoking_alcohol",  label: "หลีกเลี่ยงบุหรี่และแอลกอฮอล์" },
  { key: "warning_symptoms",       label: "สังเกตอาการเตือนโรคหลอดเลือดสมอง" },
  { key: "sleep_enough",           label: "นอนหลับพักผ่อนเพียงพอ" },
  { key: "manage_stress",          label: "จัดการความเครียดได้ดี" },
];

function formatDate(d?: string) { return d ? new Date(d).toLocaleString("th-TH") : "-"; }

function parseBehaviors(b?: string): Record<string, string> {
  if (!b) return {};
  try { return JSON.parse(b); } catch { return {}; }
}

function getBehaviors(b?: string) {
  const obj = parseBehaviors(b);
  return BEHAVIOR_KEYS.map(item => ({
    key: item.key,
    label: item.label,
    ok: obj[item.key] === "follow" || (item.key === "warning_symptoms" && obj[item.key] === "no_symptoms"),
  }));
}

function evalLevel(b?: string) {
  const behaviors = getBehaviors(b);
  const follow = behaviors.filter(x => x.ok).length;
  const pct = (follow / BEHAVIOR_KEYS.length) * 100;
  if (pct >= 90) return "ดีเยี่ยม";
  if (pct >= 75) return "ดี";
  if (pct >= 50) return "พอใช้";
  return "ต้องปรับปรุง";
}

function levelBadge(b?: string) {
  const l = evalLevel(b);
  if (l === "ดีเยี่ยม") return "badge-success";
  if (l === "ดี") return "badge-info";
  if (l === "พอใช้") return "badge-warning";
  return "badge-error";
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(
      `/api/health-behavior?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success) records.value = res.data || [];
  } finally { loading.value = false; }
});
</script>
