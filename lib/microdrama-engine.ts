export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  visual: string;
}

export interface DialogueLine {
  speaker: string;
  line: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  timecode: string;
  phase: string;
  phaseCategory: 'hook' | 'rising' | 'midpoint' | 'climax' | 'twist';
  camera: string;
  mood: string;
  setting: string;
  action: string;
  dialogues: DialogueLine[];
  sfx: string;
  imageUrl: string;
  visualVariant: number;
  focalLength: string;
  lightingSetup: string;
  masterPrompt: string;
}

export interface MicrodramaProduction {
  title: string;
  genre: string;
  ratio: '9:16' | '16:9';
  styleDesc: string;
  durationMinutes: number;
  totalScenes: number;
  secPerScene: number;
  synopsis: string;
  engineSource: 'instant' | 'gemini';
  characters: CharacterProfile[];
  scenes: StoryboardScene[];
}

export const GENRE_OPTIONS = [
  {
    value: 'CEO Romance / Balas Dendam',
    label: 'CEO Romance & Balas Dendam',
  },
  {
    value: 'Thriller / Misteri Perselingkuhan',
    label: 'Thriller & Misteri Keluarga',
  },
  {
    value: 'Horor Urban / Mistis',
    label: 'Horor Urban & Mistis',
  },
  {
    value: 'Sci-Fi / Time Loop',
    label: 'Sci-Fi & Time Loop',
  },
  {
    value: 'Drama Keluarga / Menguras Air Mata',
    label: 'Drama Keluarga & Air Mata',
  },
  {
    value: 'Komedi Satir / Plot Twist',
    label: 'Komedi Satir & Plot Twist',
  },
] as const;

export const VISUAL_STYLE_OPTIONS = [
  {
    value:
      '9:16|Cinematic realistic Asian drama, 8k, Arri Alexa, shallow depth of field, dramatic lighting',
    label: 'Vertikal 9:16 — Sinematik Realistis',
    ratio: '9:16' as const,
  },
  {
    value:
      '9:16|Korean drama aesthetic, soft warm lighting, ultra detailed, 85mm lens, photorealistic',
    label: 'Vertikal 9:16 — K-Drama Aesthetic',
    ratio: '9:16' as const,
  },
  {
    value:
      '9:16|Dark moody thriller cinematography, neon rim light, high contrast, 35mm film grain',
    label: 'Vertikal 9:16 — Moody Thriller',
    ratio: '9:16' as const,
  },
  {
    value:
      '9:16|Webtoon manhwa anime style, vibrant colors, expressive faces, Makoto Shinkai lighting',
    label: 'Vertikal 9:16 — Anime / Manhwa',
    ratio: '9:16' as const,
  },
  {
    value:
      '16:9|Cinematic widescreen movie still, photorealistic, anamorphic lens, dramatic color grading',
    label: 'Horizontal 16:9 — Film Layar Lebar',
    ratio: '16:9' as const,
  },
] as const;

export const PRESET_PREMISES = [
  {
    title: 'Suamiku Ternyata CEO Miliarder yang Menyamar',
    genre: 'CEO Romance / Balas Dendam',
    duration: 3,
  },
  {
    title: 'Rahasia di Balik Pintu Kamar Kos Nomor 7',
    genre: 'Horor Urban / Mistis',
    duration: 2,
  },
  {
    title: 'Terjebak di Hari Pernikahan Mantan Selama 99 Kali',
    genre: 'Sci-Fi / Time Loop',
    duration: 5,
  },
  {
    title: 'Anak Kandung yang Dibuang Kembali Sebagai Pemilik Rumah Sakit',
    genre: 'Drama Keluarga / Menguras Air Mata',
    duration: 4,
  },
] as const;

export const LOCAL_STORYBOARD_ASSETS = [
  '/images/scene_hook_confrontation.jpg',
  '/images/scene_inciting_corridor.jpg',
  '/images/scene_secret_call.jpg',
  '/images/scene_midpoint_arrival.jpg',
  '/images/scene_climax_twist.jpg',
] as const;

export function calculateSceneCount(minutes: number): number {
  const safeVal = Number.isFinite(minutes) ? minutes : 3;
  const clamped = Math.max(1, Math.min(10, Math.round(safeVal)));
  const map: Record<number, number> = {
    1: 4,
    2: 6,
    3: 9,
    4: 11,
    5: 13,
    6: 15,
    7: 17,
    8: 19,
    9: 21,
    10: 24,
  };
  return map[clamped] ?? 9;
}

export function formatTimecode(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const rem = (safeSeconds % 60).toString().padStart(2, '0');
  return `${m}:${rem}`;
}

export function parseVisualStyleOption(optionValue: string): {
  ratio: '9:16' | '16:9';
  styleDesc: string;
} {
  const parts = optionValue.split('|');
  const ratio = parts[0] === '16:9' ? '16:9' : '9:16';
  const styleDesc =
    parts[1]?.trim() ||
    'Cinematic realistic Asian drama, 8k, Arri Alexa, shallow depth of field, dramatic lighting';
  return { ratio, styleDesc };
}

export function validateDramaInput(
  title: string,
  durationMinutes: number
): { valid: boolean; error?: string } {
  const trimmed = (title ?? '').trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Judul atau premis utama microdrama wajib diisi terlebih dahulu.',
    };
  }
  if (trimmed.length < 4) {
    return {
      valid: false,
      error: 'Judul terlalu pendek. Masukkan minimal 4 karakter.',
    };
  }
  if (
    typeof durationMinutes !== 'number' ||
    Number.isNaN(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 10
  ) {
    return {
      valid: false,
      error: 'Durasi microdrama harus berada di rentang 1 hingga 10 menit.',
    };
  }
  return { valid: true };
}

export function composeMasterPrompt(params: {
  sceneNumber: number;
  timecode: string;
  phase: string;
  styleDesc: string;
  setting: string;
  camera: string;
  mood: string;
  action: string;
  title: string;
  characters: CharacterProfile[];
  dialogues: DialogueLine[];
  sfx: string;
}): string {
  const charLock = params.characters
    .slice(0, 2)
    .map((c, idx) => `${idx + 1}) ${c.name}: ${c.visual}.`)
    .join(' ');

  const visualDesc = `${params.styleDesc}. Scene featuring ${params.characters[0]?.visual || 'protagonist'} and ${params.characters[1]?.visual || 'antagonist'} in ${params.setting}. ${params.camera}, ${params.mood} atmosphere. Action: ${params.action}.`;

  const dialogueBlock = params.dialogues
    .map((d, idx) => {
      const tone =
        idx === 0
          ? 'berbicara dengan nada penuh emosi'
          : 'merespons dengan ekspresi terguncang';
      return `- ${d.speaker} (${tone}): ${d.line}`;
    })
    .join('\n');

  return `[SCENE ${params.sceneNumber} | ${params.timecode} | ${params.phase}]
VISUAL & CAMERA: ${visualDesc}
CHARACTER LOCK: ${charLock}
ACTION & BLOCKING: ${params.action} terkait "${params.title}". Ekspresi mikro sangat intens dan emosional.
DIALOGUE & LIP-SYNC:
${dialogueBlock}
AUDIO & SFX: ${params.sfx}.`;
}

export function getGenreCharacters(genre: string): CharacterProfile[] {
  if (genre.includes('Horor')) {
    return [
      {
        id: 'char-a',
        name: 'Risa (23)',
        role: 'Penghuni Baru',
        visual:
          '23-year-old Indonesian woman, pale anxious expression, shoulder-length black hair, wearing an oversized slate cardigan',
      },
      {
        id: 'char-b',
        name: 'Ibu Darmi / Sosok Bayangan',
        role: 'Penjaga Kos Misterius',
        visual:
          'Eerie elderly figure with hollow piercing eyes standing in dim hallway light, traditional faded dark batik',
      },
      {
        id: 'char-c',
        name: 'Pak Hendra (55)',
        role: 'Saksi Kunci Masa Lalu',
        visual:
          '55-year-old paranormal investigator, weathered face, holding an old brass lantern and leather journal',
      },
    ];
  }

  if (genre.includes('Sci-Fi')) {
    return [
      {
        id: 'char-a',
        name: 'Kael (27)',
        role: 'Penjelajah Waktu',
        visual:
          '27-year-old Indonesian man, futuristic minimalist dark trench coat, glowing chrono-wristwatch, determined gaze',
      },
      {
        id: 'char-b',
        name: 'Elena (25)',
        role: 'Target Penyelamatan',
        visual:
          '25-year-old woman, tailored ivory evening dress, surprised emotional eyes, warm cinematic rim lighting',
      },
      {
        id: 'char-c',
        name: 'Komandan Vance (48)',
        role: 'Pengawas Garis Waktu',
        visual:
          '48-year-old authority figure, sleek obsidian tactical suit, silver temples, cold analytical demeanor',
      },
    ];
  }

  if (genre.includes('Keluarga')) {
    return [
      {
        id: 'char-a',
        name: 'Laras (26)',
        role: 'Anak Kandung yang Terbuang',
        visual:
          '26-year-old Indonesian woman, dignified resilient expression, neat low bun, wearing a clean white doctor coat over formal attire',
      },
      {
        id: 'char-b',
        name: 'Siska (25)',
        role: 'Anak Angkat Manipulatif',
        visual:
          '25-year-old woman, glamorous designer dress, arrogant smirk turning into panic, diamond necklace',
      },
      {
        id: 'char-c',
        name: 'Nyonya Ratna (54)',
        role: 'Ibu Kepala Keluarga',
        visual:
          '54-year-old aristocratic matriarch, tearful regretful eyes, emerald kebaya modern suit',
      },
    ];
  }

  return [
    {
      id: 'char-a',
      name: 'Arka (28)',
      role: 'Protagonis Utama',
      visual:
        '28-year-old Indonesian man, sharp jawline, intense dark eyes, neat comma hair, wearing a humble faded jacket over a tailored white shirt',
    },
    {
      id: 'char-b',
      name: 'Nadia (26)',
      role: 'Lawan Main / Antagonis',
      visual:
        '26-year-old Indonesian woman, elegant fierce expression, long wavy dark hair, wearing a luxury maroon blazer and pearl earrings',
    },
    {
      id: 'char-c',
      name: 'Tuan Wijaya (52)',
      role: 'Kunci Rahasia / Otoritas',
      visual:
        '52-year-old authoritative conglomerate figure, silver-streaked hair, bespoke black three-piece suit, holding a gold cane',
    },
  ];
}

interface NarrativeBeat {
  phase: string;
  phaseCategory: 'hook' | 'rising' | 'midpoint' | 'climax' | 'twist';
  cam: string;
  focalLength: string;
  lightingSetup: string;
  mood: string;
  sfx: string;
  setting: string;
  assetIndex: number;
  buildAction: (charA: string, charB: string, charC: string, title: string) => string;
  dialogA: string;
  dialogB: string;
}

const NARRATIVE_BEATS: NarrativeBeat[] = [
  {
    phase: 'GOLDEN 3-SECOND HOOK',
    phaseCategory: 'hook',
    cam: 'Extreme Close-Up to Fast Zoom Out',
    focalLength: '35mm Prime f/1.4',
    lightingSetup: 'High-Contrast Warm Chandelier & Hard Rim',
    mood: 'Shocking, High Tension',
    sfx: 'Suara tamparan keras / Gelas pecah + Bass Drop dramatis',
    setting: 'Luxury grand lobby with marble floors and dramatic chandelier lighting',
    assetIndex: 0,
    buildAction: (charA, _charB, _charC, title) =>
      `Konfrontasi langsung yang mempermalukan ${charA} di depan umum terkait premis "${title}"`,
    dialogA:
      '"Kau pikir dengan menghinaku hari ini, kau bisa menghapus kenyataan siapa yang sebenarnya memegang kendali di sini?!"',
    dialogB:
      '"Jangan mimpi di siang bolong! Orang sepertimu bahkan tidak pantas menginjakkan kaki di ruangan ini!"',
  },
  {
    phase: 'INCITING INCIDENT (PEMICU)',
    phaseCategory: 'hook',
    cam: 'Medium Two-Shot, Over-the-Shoulder',
    focalLength: '50mm Anamorphic',
    lightingSetup: 'Cross-Key Corridor Practicals',
    mood: 'Humiliation & Secret Restraint',
    sfx: 'Bisik-bisik kerumunan + Detak jantung intens',
    setting: 'Crowded high-end corridor with onlookers watching in disbelief',
    assetIndex: 1,
    buildAction: (charA, charB) =>
      `${charB} melempar dokumen bukti di hadapan ${charA}, memicu ketegangan emosional di depan para saksi`,
    dialogA:
      '"Simpan kata-katamu baik-baik. Dalam lima menit, kau sendiri yang akan berlutut meminta maaf."',
    dialogB: '"Terserah! Kita lihat saja siapa yang akan hancur lebih dulu!"',
  },
  {
    phase: 'RISING CONFLICT (ESKALASI AWAL)',
    phaseCategory: 'rising',
    cam: 'Low Angle Push-In',
    focalLength: '85mm Portrait f/1.8',
    lightingSetup: 'Cool Rain Window Bokeh + Warm Side Key',
    mood: 'Mysterious & Suspenseful',
    sfx: 'Nada dering telepon eksklusif + Musik string tegang',
    setting: 'Dimly lit VIP lounge with rain-streaked glass windows in the background',
    assetIndex: 2,
    buildAction: (charA) =>
      `${charA} mengeluarkan akses otoritas rahasia yang tidak disadari oleh orang di sekitarnya`,
    dialogA:
      '"Halo. Batalkan semua kontrak kerja sama sekarang juga. Mereka baru saja melewati batas."',
    dialogB:
      '"Siapa yang kau telepon? Berhenti berakting seolah kau punya kuasa!"',
  },
  {
    phase: 'COMPLICATION (TEKANAN PUNCAK)',
    phaseCategory: 'rising',
    cam: 'Dutch Angle Close-Up',
    focalLength: '28mm Wide Close-Up',
    lightingSetup: 'Hard Top Spot + Deep Shadows',
    mood: 'Intense & Claustrophobic',
    sfx: 'Riser sinematik meninggi + Langkah sepatu cepat',
    setting: 'Grand banquet hall entrance with security guards stepping forward',
    assetIndex: 1,
    buildAction: (charA) =>
      `Situasi makin terdesak ketika petugas keamanan dan saksi mulai mengepung ${charA}`,
    dialogA:
      '"Sentuh aku satu jari saja, maka seluruh karier yang kalian banggakan akan lenyap malam ini."',
    dialogB: '"Usir dia sekarang! Aku tidak mau melihat wajahnya lagi!"',
  },
  {
    phase: 'MIDPOINT REVERSAL (TITIK BALIK)',
    phaseCategory: 'midpoint',
    cam: 'Wide Tracking Shot, Slow Motion',
    focalLength: '40mm Cinema Prime',
    lightingSetup: 'Backlit Double Doors + Rain Reflections',
    mood: 'Awe & Sudden Silence',
    sfx: 'Suara pintu ganda terbuka keras + Hening seketika',
    setting: 'Red carpet entrance with luxury black sedans visible outside the glass doors',
    assetIndex: 3,
    buildAction: (_charA, _charB, charC) =>
      `Kedatangan ${charC} dengan pengawalan ketat yang langsung menghentikan seluruh kekacauan`,
    dialogA:
      '"Kalian datang tepat waktu. Jelaskan pada mereka siapa pemilik sebenarnya tempat ini."',
    dialogB:
      '"T-Tuan?! Kenapa Anda justru membungkuk hormat di hadapan orang ini?!"',
  },
  {
    phase: 'DARK NIGHT / DEEPENING SECRET',
    phaseCategory: 'midpoint',
    cam: 'Close-Up Eye Level, Shallow DOF',
    focalLength: '85mm Macro Cinema',
    lightingSetup: 'Moody Chiaroscuro Side Light',
    mood: 'Emotional & Piercing',
    sfx: 'Melodi piano dingin dan mencekam',
    setting: 'Private executive office overlooking city skyline at night',
    assetIndex: 2,
    buildAction: (_charA, _charB, _charC, title) =>
      `Pengungkapan bukti otentik tentang pengorbanan dan rahasia tersembunyi di balik "${title}"`,
    dialogA:
      '"Selama tiga tahun aku diam dan menyembunyikan semuanya demi melindungimu, tapi hari ini topeng itu selesai."',
    dialogB:
      '"Tidak mungkin... Jadi semua dana dan kekuasaan selama ini berasal darimu?!"',
  },
  {
    phase: 'CLIMAX REVEAL (PUNCAK KONFLIK)',
    phaseCategory: 'climax',
    cam: 'Dynamic Orbit Shot 360',
    focalLength: '35mm Master Anamorphic',
    lightingSetup: 'Stage LED Backlight + Camera Flashes',
    mood: 'Triumphant & Dramatic',
    sfx: 'Orkestra epik meledak + Kilatan lampu kamera pers',
    setting: 'Main stage of a press conference or luxury ballroom with giant LED screen',
    assetIndex: 0,
    buildAction: () =>
      'Layar utama dan dokumen resmi terbuka, membuktikan kebenaran mutlak di hadapan seluruh tamu VIP',
    dialogA:
      '"Sekarang baca dengan lantang nama yang tertulis di akta kepemilikan utama itu!"',
    dialogB:
      '"Maafkan aku! Aku benar-benar buta selama ini, tolong beri aku satu kesempatan lagi!"',
  },
  {
    phase: 'AFTERMATH & RECKONING',
    phaseCategory: 'climax',
    cam: 'High Angle Looking Down',
    focalLength: '50mm Prime',
    lightingSetup: 'Cold Overhead Corridor Strip Light',
    mood: 'Cold Justice',
    sfx: 'Langkah kaki tegas menjauh di lantai marmer',
    setting: 'Polished marble hallway with dramatic long shadows',
    assetIndex: 3,
    buildAction: (charA, charB) =>
      `${charA} merapikan pakaiannya dengan tenang sementara ${charB} terduduk menyesal`,
    dialogA:
      '"Kesempatan itu sudah kuhancurkan saat kau memilih mengkhianati kepercayaanku."',
    dialogB: '"Jangan pergi... Aku baru sadar betapa berharganya dirimu!"',
  },
  {
    phase: 'CLIFFHANGER / FINAL PLOT TWIST',
    phaseCategory: 'twist',
    cam: 'Extreme Close-Up with Sudden Cut to Black',
    focalLength: '100mm Telephoto Close-Up',
    lightingSetup: 'Midnight Helipad Rim Light & City Neon Glow',
    mood: 'Jaw-dropping Twist',
    sfx: 'Stinger suara misterius + Nafas terkejut',
    setting: 'Rooftop helipad at midnight with city neon lights glowing below',
    assetIndex: 4,
    buildAction: (charA) =>
      `Pesan terenkripsi masuk ke ponsel ${charA} yang mengungkap bahwa dalang sesungguhnya masih mengintai`,
    dialogA:
      '"Permainan baru saja dimulai... Jadi dia belum tahu kalau rahasia terbesarnya ada di tanganku."',
    dialogB:
      '"(Suara dari telepon) Kau pikir ini sudah berakhir? Lihat siapa yang berdiri di balik bayangan itu."',
  },
];

export function buildProceduralDrama(
  rawTitle: string,
  genre: string,
  durationMinutes: number,
  ratio: '9:16' | '16:9',
  styleDesc: string
): MicrodramaProduction {
  const title = rawTitle.trim() || 'Suamiku Ternyata CEO Miliarder yang Menyamar';
  const clampedDuration = Math.max(1, Math.min(10, Math.round(durationMinutes || 3)));
  const totalScenes = calculateSceneCount(clampedDuration);
  const totalSeconds = clampedDuration * 60;
  const secPerScene = Math.round(totalSeconds / totalScenes);

  const characters = getGenreCharacters(genre);
  const [charA, charB, charC] = characters;

  const generatedScenes: StoryboardScene[] = [];
  let currentSec = 0;

  for (let i = 0; i < totalScenes; i++) {
    const beatIndex = Math.min(
      NARRATIVE_BEATS.length - 1,
      Math.floor((i / totalScenes) * NARRATIVE_BEATS.length)
    );
    const baseBeat = NARRATIVE_BEATS[beatIndex];
    const partVariation =
      i % 2 === 1 && totalScenes > 9 ? ' (Lanjutan Intensifikasi)' : '';

    const startSec = currentSec;
    const endSec =
      i === totalScenes - 1
        ? totalSeconds
        : Math.min(totalSeconds, currentSec + secPerScene);
    currentSec = endSec;

    const sceneNumber = i + 1;
    const timecode = `${formatTimecode(startSec)} - ${formatTimecode(endSec)}`;
    const isEven = i % 2 === 0;
    const speaker1 = isEven ? charA.name : charB.name;
    const speaker2 = isEven ? charB.name : charA.name;
    const line1 = isEven ? baseBeat.dialogA : baseBeat.dialogB;
    const line2 = isEven ? baseBeat.dialogB : baseBeat.dialogA;

    const actionText = baseBeat.buildAction(
      charA.name,
      charB.name,
      charC.name,
      title
    );

    const dialogues: DialogueLine[] = [
      { speaker: speaker1, line: line1 },
      { speaker: speaker2, line: line2 },
    ];

    const phaseLabel = `${baseBeat.phase}${partVariation}`;

    const masterPrompt = composeMasterPrompt({
      sceneNumber,
      timecode,
      phase: phaseLabel,
      styleDesc,
      setting: baseBeat.setting,
      camera: baseBeat.cam,
      mood: baseBeat.mood,
      action: actionText,
      title,
      characters,
      dialogues,
      sfx: baseBeat.sfx,
    });

    const imageUrl =
      LOCAL_STORYBOARD_ASSETS[
        baseBeat.assetIndex % LOCAL_STORYBOARD_ASSETS.length
      ];

    const finalAction = actionText.includes(title)
      ? actionText
      : `${actionText} — dalam alur "${title}"`;

    generatedScenes.push({
      sceneNumber,
      timecode,
      phase: phaseLabel,
      phaseCategory: baseBeat.phaseCategory,
      camera: baseBeat.cam,
      mood: baseBeat.mood,
      setting: baseBeat.setting,
      action: finalAction,
      dialogues,
      sfx: baseBeat.sfx,
      imageUrl,
      visualVariant: 0,
      focalLength: baseBeat.focalLength,
      lightingSetup: baseBeat.lightingSetup,
      masterPrompt,
    });
  }

  const synopsis = `Microdrama ${ratio === '9:16' ? 'vertikal' : 'layar lebar'} berintensitas tinggi berjudul "${title}". Dirancang menggunakan formula 3-Second Hook pada adegan pembuka untuk mengunci rasa penasaran penonton, diikuti eskalasi konflik bertahap setiap ${secPerScene} detik, pembalikan status di pertengahan durasi, dan ditutup dengan Plot Twist menggantung untuk memicu retensi penuh.`;

  return {
    title,
    genre,
    ratio,
    styleDesc,
    durationMinutes: clampedDuration,
    totalScenes,
    secPerScene,
    synopsis,
    engineSource: 'instant',
    characters,
    scenes: generatedScenes,
  };
}
