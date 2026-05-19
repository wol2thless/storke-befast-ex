<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold mb-1">ภาพรวมระบบ</h1>
      <p class="text-base-content/60 text-sm">{{ adminStore.adminUser?.name }} ({{ adminStore.adminUser?.role }})</p>
    </div>

    <!-- Month Selector -->
    <div class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-primary">📅</span>
          <span class="font-medium text-sm">เลือกเดือนที่ต้องการดู</span>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-base-content/60">เดือน:</label>
          <select v-model="selectedMonth" class="select select-bordered select-sm w-36" @change="loadStats">
            <option v-for="m in last12Months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else-if="stats">
      <!-- Stats cards -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-primary rounded-lg p-4 text-primary-content">
          <div class="text-2xl mb-1">👥</div>
          <div class="text-2xl font-bold">{{ stats.patients }}</div>
          <div class="text-sm opacity-90">ผู้ป่วยทั้งหมด</div>
        </div>
        <div class="bg-success rounded-lg p-4 text-success-content">
          <div class="text-2xl mb-1">➕</div>
          <div class="text-2xl font-bold">{{ stats.new_patients_this_month }}</div>
          <div class="text-sm opacity-90">ผู้ป่วยใหม่เดือน{{ monthLabel }}</div>
        </div>
        <div class="bg-info rounded-lg p-4 text-info-content">
          <div class="text-2xl mb-1">🧠</div>
          <div class="flex gap-3">
            <div class="text-center"><div class="text-xl font-bold">{{ stats.befast }}</div><div class="text-xs opacity-75">ครั้ง</div></div>
          </div>
          <div class="text-sm opacity-90 mt-1">BEFAST เดือน{{ monthLabel }}</div>
        </div>
        <div class="bg-warning rounded-lg p-4 text-warning-content">
          <div class="text-2xl mb-1">📝</div>
          <div class="flex gap-3">
            <div class="text-center"><div class="text-xl font-bold">{{ stats.satisfaction_month?.records || 0 }}</div><div class="text-xs opacity-75">ครั้ง</div></div>
            <div class="text-center"><div class="text-xl font-bold">{{ stats.satisfaction_month?.people || 0 }}</div><div class="text-xs opacity-75">คน</div></div>
          </div>
          <div class="text-sm opacity-90 mt-1">แบบสอบถามเดือน{{ monthLabel }}</div>
        </div>
      </div>

      <!-- Activity stats (records + people) -->
      <div class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-sm">สรุปกิจกรรมหลัก ({{ monthLabel }})</h4>
          <span class="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded">ครั้ง | คน</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="text-center p-3 bg-success/10 rounded-lg">
            <div class="text-2xl mb-1">🏃</div>
            <div class="flex justify-center gap-3">
              <div><div class="font-bold text-success">{{ stats.exercise_month?.records || 0 }}</div><div class="text-xs text-base-content/60">ครั้ง</div></div>
              <div><div class="font-bold text-success">{{ stats.exercise_month?.people || 0 }}</div><div class="text-xs text-base-content/60">คน</div></div>
            </div>
            <div class="text-xs text-base-content/70 mt-1">ออกกำลังกาย</div>
          </div>
          <div class="text-center p-3 bg-orange-100 rounded-lg">
            <div class="text-2xl mb-1">🥗</div>
            <div class="flex justify-center gap-3">
              <div><div class="font-bold text-orange-600">{{ stats.nutrition_month?.records || 0 }}</div><div class="text-xs text-base-content/60">ครั้ง</div></div>
              <div><div class="font-bold text-orange-600">{{ stats.nutrition_month?.people || 0 }}</div><div class="text-xs text-base-content/60">คน</div></div>
            </div>
            <div class="text-xs text-base-content/70 mt-1">โภชนาการ</div>
          </div>
          <div class="text-center p-3 bg-red-100 rounded-lg">
            <div class="text-2xl mb-1">💊</div>
            <div class="flex justify-center gap-3">
              <div><div class="font-bold text-red-600">{{ stats.medication_month?.records || 0 }}</div><div class="text-xs text-base-content/60">ครั้ง</div></div>
              <div><div class="font-bold text-red-600">{{ stats.medication_month?.people || 0 }}</div><div class="text-xs text-base-content/60">คน</div></div>
            </div>
            <div class="text-xs text-base-content/70 mt-1">ยา</div>
          </div>
          <div class="text-center p-3 bg-purple-100 rounded-lg">
            <div class="text-2xl mb-1">🎬</div>
            <div class="flex justify-center gap-3">
              <div><div class="font-bold text-purple-600">{{ stats.videoViews || 0 }}</div><div class="text-xs text-base-content/60">ครั้ง</div></div>
            </div>
            <div class="text-xs text-base-content/70 mt-1">ดูวิดีโอ</div>
          </div>
        </div>
      </div>

      <!-- Gender distribution donut -->
      <div class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
        <DonutChartVue :data="genderData" title="การกระจายเพศ" type="gender" />
      </div>

      <!-- Age distribution donut -->
      <div v-if="stats.age_distribution?.length" class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
        <DonutChartVue :data="stats.age_distribution.map((d: any) => ({ label: d.age_group, count: d.count }))" title="การกระจายช่วงอายุ" />
      </div>

      <!-- Popular videos horizontal bar -->
      <div class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
        <HorizontalBarVue
          :data="stats.popular_videos?.map((v: any) => ({ label: v.video_title, value: v.view_count })) || []"
          :title="`วิดีโอยอดนิยม (${monthLabel})`"
        />
      </div>

      <!-- BEFAST severity -->
      <div class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-sm">สถิติ BEFAST ({{ monthLabel }})</h4>
          <span class="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded">ครั้ง | คน</span>
        </div>
        <div class="space-y-3">
          <div v-for="sev in befastSeverity" :key="sev.label"
            class="flex justify-between items-center p-3 rounded-lg"
            :class="sev.label === 'มีความเสี่ยงสูง' ? 'bg-error/10' : 'bg-success/10'">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full" :class="sev.label === 'มีความเสี่ยงสูง' ? 'bg-error' : 'bg-success'"></div>
              <div>
                <div class="text-sm font-medium">{{ sev.label }}</div>
                <div class="text-xs text-base-content/60">{{ sev.label === 'มีความเสี่ยงสูง' ? 'ครั้งที่พบอาการ' : 'ครั้งที่ไม่พบอาการ' }}</div>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="text-center">
                <div class="font-bold text-lg" :class="sev.label === 'มีความเสี่ยงสูง' ? 'text-error' : 'text-success'">{{ sev.count }}</div>
                <div class="text-xs text-base-content/60">ครั้ง</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-lg" :class="sev.label === 'มีความเสี่ยงสูง' ? 'text-error' : 'text-success'">{{ sev.people }}</div>
                <div class="text-xs text-base-content/60">คน</div>
              </div>
            </div>
          </div>
          <div class="pt-2 border-t border-base-300 flex justify-between items-center">
            <div class="text-sm text-base-content/70">รวมการประเมินทั้งหมด</div>
            <div class="flex gap-3">
              <div class="text-center"><div class="font-bold text-lg">{{ befastTotal.count }}</div><div class="text-xs text-base-content/60">ครั้ง</div></div>
              <div class="text-center"><div class="font-bold text-lg">{{ befastTotal.people }}</div><div class="text-xs text-base-content/60">คน</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly comparison chart (12 months) -->
      <div class="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
        <ComparisonChartVue :data="stats.monthly_comparison" title="ข้อมูลที่ผู้ป่วยบันทึกทั้งหมด (12 เดือนล่าสุด)" />
      </div>

      <!-- Navigation buttons -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <button class="bg-base-100 rounded-lg shadow p-4 border border-base-300 text-center hover:bg-base-200 transition-colors"
          @click="navigateTo('/admin/dashboard')">
          <div class="text-2xl mx-auto mb-2">👥</div>
          <div class="text-sm font-medium">รายชื่อผู้ป่วย</div>
        </button>
        <button class="bg-base-100 rounded-lg shadow p-4 border border-base-300 text-center hover:bg-base-200 transition-colors"
          @click="navigateTo('/admin/users')">
          <div class="text-2xl mx-auto mb-2">⚙️</div>
          <div class="text-sm font-medium">จัดการเจ้าหน้าที่</div>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

interface MonthCount { month: string; count: number }
interface RecordsPeople { records: number; people: number }
interface DashboardStats {
  patients: number;
  new_patients_this_month: number;
  befast: number;
  videoViews: number;
  exercise_month: RecordsPeople;
  nutrition_month: RecordsPeople;
  medication_month: RecordsPeople;
  behavior_month: RecordsPeople;
  satisfaction_month: RecordsPeople;
  befast_severity_distribution: { severity_level: string; count: number; unique_people: number }[];
  gender_distribution: { gender: string; count: number }[];
  age_distribution: { age_group: string; count: number }[];
  popular_videos: { video_id: number; video_title: string; view_count: number }[];
  monthly_comparison: {
    befast_assessments: MonthCount[];
    adl_assessments: MonthCount[];
    exercise_records: MonthCount[];
    nutrition_records: MonthCount[];
    medication_records: MonthCount[];
    health_behavior: MonthCount[];
    satisfaction_survey: MonthCount[];
    video_views: MonthCount[];
  };
}

const adminStore = useAdminStore();
const loading = ref(true);
const selectedMonth = ref("");
const stats = ref<DashboardStats | null>(null);

// Generate last 12 months list
const last12Months = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
    return { value, label };
  });
});

const monthLabel = computed(() => {
  const m = last12Months.value.find(m => m.value === selectedMonth.value);
  return m?.label || selectedMonth.value;
});

const genderData = computed(() => {
  const dist = (stats.value?.gender_distribution as { gender: string; count: number }[]) || [];
  return dist.map(d => ({
    label: d.gender === "M" || d.gender === "ชาย" ? "ชาย" : d.gender === "F" || d.gender === "หญิง" ? "หญิง" : d.gender,
    count: Number(d.count),
  }));
});

const befastSeverity = computed(() => {
  const dist = (stats.value?.befast_severity_distribution as { severity_level: string; count: number; unique_people: number }[]) || [];
  return dist.map(d => ({ label: d.severity_level, count: Number(d.count), people: Number(d.unique_people) }));
});

const befastTotal = computed(() => ({
  count: befastSeverity.value.reduce((s, d) => s + d.count, 0),
  people: befastSeverity.value.reduce((s, d) => s + d.people, 0),
}));

async function loadStats() {
  loading.value = true;
  try {
    const params = selectedMonth.value ? `?month=${selectedMonth.value}` : "";
    const res = await $fetch<{ success: boolean; data?: DashboardStats }>(`/api/admin/dashboard-stats${params}`);
    if (res.success && res.data) stats.value = res.data;
  } finally { loading.value = false; }
}

onMounted(() => {
  selectedMonth.value = last12Months.value[0]?.value || "";
  loadStats();
});
</script>
