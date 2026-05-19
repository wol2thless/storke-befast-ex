<template>
  <div class="space-y-3">
    <div v-for="video in videos" :key="video.videoId" class="bg-gray-50 rounded-lg p-3 border">
      <div class="flex items-center justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-base-content text-sm">{{ video.title }}</h4>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs text-red-500 font-bold whitespace-nowrap">ดูแล้ว {{ getViewCount(video.numericId) }} ครั้ง</span>
          <button class="btn btn-primary btn-sm whitespace-nowrap" @click="openVideo(video.youtubeId, video.numericId, video.title)">
            ▶️ ดูวีดีโอ
          </button>
        </div>
      </div>
    </div>

    <!-- Video Overlay Modal -->
    <Teleport to="body">
      <div v-if="activeVideo" class="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
        @click="closeVideo">
        <div class="relative w-full max-w-4xl mx-4" @click.stop>
          <button class="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300 z-10" @click="closeVideo">×</button>
          <div class="aspect-video w-full">
            <iframe :src="`https://www.youtube.com/embed/${activeVideo}?autoplay=1`"
              class="w-full h-full rounded-lg"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ category: string; pid?: string }>();

interface VideoItem {
  videoId: string;
  numericId: number;
  youtubeId: string;
  title: string;
}

const VIDEO_DATA: Record<string, VideoItem[]> = {
  stroke: [
    { videoId: "1", numericId: 1, youtubeId: "sbwXklQK3v8", title: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)" },
    { videoId: "2", numericId: 2, youtubeId: "AJ503g2k9Zc", title: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ" },
  ],
  exercise: [
    { videoId: "100", numericId: 100, youtubeId: "ls0ZUehgiMA", title: "กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]" },
    { videoId: "101", numericId: 101, youtubeId: "eEmeOHis4bE", title: "การออกกำลังกายด้วยตัวเองในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
    { videoId: "102", numericId: 102, youtubeId: "LU1XdGeOwIA", title: "การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
    { videoId: "103", numericId: 103, youtubeId: "6zgNn1alhIM", title: "การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
    { videoId: "104", numericId: 104, youtubeId: "5Fv59zZ9h0w", title: "การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน" },
    { videoId: "105", numericId: 105, youtubeId: "_fG04RU1kJg", title: "การฝึกพูดสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
    { videoId: "106", numericId: 106, youtubeId: "PAG5s56afcU", title: "10 ท่า ทรงตัวมั่นคง ยืนเดินปลอดภัย | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
  ],
  nutrition: [
    { videoId: "200", numericId: 200, youtubeId: "cD7HPKx6Agk", title: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
    { videoId: "201", numericId: 201, youtubeId: "GPnej-kGLd4", title: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
  ],
  medication: [
    { videoId: "300", numericId: 300, youtubeId: "CJKZwk4ayZQ", title: "ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
  ],
  motivation: [
    { videoId: "400", numericId: 400, youtubeId: "9zpZX0Msraw", title: "เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
    { videoId: "401", numericId: 401, youtubeId: "CO7A7SfW838", title: "กำลังใจและแรงบันดาลใจ" },
    { videoId: "402", numericId: 402, youtubeId: "IezdiAqkdCo", title: "พลังใจในการฟื้นฟู" },
  ],
};

const videos = computed(() => VIDEO_DATA[props.category] || []);
const activeVideo = ref<string | null>(null);
const viewCounts = ref<Record<string, number>>({});

async function fetchStats() {
  if (!props.pid) return;
  try {
    const res = await $fetch<{ success: boolean; data?: { video_id: string; view_count: number }[] }>(
      `/api/video-view-stats?pid=${encodeURIComponent(props.pid)}`
    );
    if (res.success && res.data) {
      const map: Record<string, number> = {};
      res.data.forEach(s => { map[String(s.video_id)] = Number(s.view_count) || 0; });
      viewCounts.value = map;
    }
  } catch { /* silent */ }
}

function getViewCount(numericId: number) {
  return viewCounts.value[String(numericId)] || 0;
}

async function openVideo(youtubeId: string, numericId: number, title: string) {
  activeVideo.value = youtubeId;
  if (props.pid) {
    try {
      await $fetch("/api/video-view-log", {
        method: "POST",
        body: { pid: props.pid, video_id: String(numericId), video_title: title }
      });
      await fetchStats();
    } catch { /* silent */ }
  }
}

function closeVideo() {
  activeVideo.value = null;
}

onMounted(fetchStats);
</script>
