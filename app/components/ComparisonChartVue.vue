<template>
  <div>
    <h4 class="font-medium text-sm mb-3 text-base-content">{{ title }}</h4>

    <template v-if="sortedMonths.length === 0">
      <div class="text-center py-4">
        <span class="text-xs text-base-content/60">ไม่มีข้อมูลในระบบ</span>
      </div>
    </template>

    <template v-else>
      <!-- Legend -->
      <div class="flex flex-wrap gap-2 mb-3">
        <div v-for="cat in categories" :key="cat.key" class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full" :class="cat.color"></div>
          <span class="text-xs text-base-content/60">{{ cat.name }}</span>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="m in sortedMonths" :key="m" class="border-b border-base-200 pb-2">
          <div class="text-xs font-medium mb-2 text-base-content/70">{{ formatMonth(m) }}</div>
          <div class="grid grid-cols-4 gap-1">
            <div v-for="cat in categories" :key="cat.key" class="text-center">
              <div
                class="w-full h-6 rounded text-white flex items-center justify-center text-xs font-bold"
                :class="cat.color"
              >
                {{ getCount(cat.key, m) }}
              </div>
              <div class="text-xs text-base-content/60 mt-1 truncate">{{ cat.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface MonthData {
  month: string;
  count: number;
}

interface ComparisonData {
  befast_assessments?: MonthData[];
  adl_assessments?: MonthData[];
  exercise_records?: MonthData[];
  nutrition_records?: MonthData[];
  medication_records?: MonthData[];
  health_behavior?: MonthData[];
  satisfaction_survey?: MonthData[];
  video_views?: MonthData[];
}

const props = defineProps<{
  data: ComparisonData | null | undefined;
  title: string;
}>();

const categories = [
  { key: 'befast_assessments', name: 'BEFAST', color: 'bg-error' },
  { key: 'adl_assessments', name: 'ADL', color: 'bg-info' },
  { key: 'exercise_records', name: 'ออกกำลัง', color: 'bg-success' },
  { key: 'medication_records', name: 'ยา', color: 'bg-warning' },
  { key: 'nutrition_records', name: 'โภชนา', color: 'bg-orange-500' },
  { key: 'health_behavior', name: 'พฤติกรรม', color: 'bg-purple-500' },
  { key: 'satisfaction_survey', name: 'แบบสอบถาม', color: 'bg-accent' },
  { key: 'video_views', name: 'วิดีโอ', color: 'bg-secondary' },
];

const monthNamesShort = ['มค', 'กพ', 'มีค', 'เมย', 'พค', 'มิย', 'กค', 'สค', 'กย', 'ตค', 'พย', 'ธค'];

const sortedMonths = computed(() => {
  if (!props.data) return [];
  const all = new Set<string>();
  for (const cat of categories) {
    const arr = (props.data as Record<string, MonthData[]>)[cat.key] || [];
    arr.forEach(item => all.add(item.month));
  }
  return Array.from(all).sort().reverse().slice(0, 12);
});

function formatMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${monthNamesShort[parseInt(month) - 1]} ${year}`;
}

function getCount(key: string, ym: string): number {
  if (!props.data) return 0;
  const arr = (props.data as Record<string, MonthData[]>)[key] || [];
  return arr.find(item => item.month === ym)?.count || 0;
}
</script>
