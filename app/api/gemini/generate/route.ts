import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildProceduralDrama,
  calculateSceneCount,
  composeMasterPrompt,
  LOCAL_STORYBOARD_ASSETS,
  MicrodramaProduction,
  StoryboardScene,
  validateDramaInput,
} from '@/lib/microdrama-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = '',
      genre = 'CEO Romance / Balas Dendam',
      durationMinutes = 3,
      ratio = '9:16',
      styleDesc = 'Cinematic realistic Asian drama, 8k, Arri Alexa, shallow depth of field, dramatic lighting',
      useAiEngine = false,
    } = body;

    const validation = validateDramaInput(title, Number(durationMinutes));
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanDuration = Math.max(
      1,
      Math.min(10, Math.round(Number(durationMinutes) || 3))
    );
    const cleanRatio: '9:16' | '16:9' = ratio === '16:9' ? '16:9' : '9:16';

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey =
      Boolean(apiKey) &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      apiKey!.trim().length > 10;

    if (!useAiEngine || !hasValidKey) {
      const procedural = buildProceduralDrama(
        title,
        genre,
        cleanDuration,
        cleanRatio,
        styleDesc
      );
      return NextResponse.json({ production: procedural });
    }

    const totalScenes = calculateSceneCount(cleanDuration);
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Anda adalah Showrunner & Sutradara Microdrama kelas dunia.
Buat skenario produksi lengkap, storyboard, dan Master Prompt terpadu untuk microdrama berjudul: "${title.trim()}".
Genre: ${genre}
Durasi Total: ${cleanDuration} menit (Wajib tepat ${totalScenes} adegan/scenes).
Format Rasio: ${cleanRatio}
Gaya Visual: ${styleDesc}

Pastikan setiap adegan memiliki timecode berurutan hingga ${cleanDuration}:00, fase dramatis (GOLDEN 3-SECOND HOOK, RISING CONFLICT, MIDPOINT REVERSAL, CLIMAX REVEAL, atau CLIFFHANGER TWIST), deskripsi aksi berbahasa Indonesia yang kuat, minimal 2 baris dialog dramatis berbahasa Indonesia, serta efek suara (SFX).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synopsis: {
              type: Type.STRING,
              description: 'Ringkasan cerita & strategi retensi 3-second hook',
            },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  visual: {
                    type: Type.STRING,
                    description:
                      'Detailed English visual description of character appearance and attire for AI consistency',
                  },
                },
                required: ['name', 'role', 'visual'],
              },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  timecode: { type: Type.STRING },
                  phase: { type: Type.STRING },
                  phaseCategory: {
                    type: Type.STRING,
                    description: 'One of: hook, rising, midpoint, climax, twist',
                  },
                  camera: { type: Type.STRING },
                  focalLength: { type: Type.STRING },
                  lightingSetup: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  setting: { type: Type.STRING },
                  action: { type: Type.STRING },
                  dialogues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        speaker: { type: Type.STRING },
                        line: { type: Type.STRING },
                      },
                      required: ['speaker', 'line'],
                    },
                  },
                  sfx: { type: Type.STRING },
                },
                required: [
                  'sceneNumber',
                  'timecode',
                  'phase',
                  'camera',
                  'mood',
                  'setting',
                  'action',
                  'dialogues',
                  'sfx',
                ],
              },
            },
          },
          required: ['synopsis', 'characters', 'scenes'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    if (
      !parsed.scenes ||
      !Array.isArray(parsed.scenes) ||
      parsed.scenes.length === 0
    ) {
      const fallback = buildProceduralDrama(
        title,
        genre,
        cleanDuration,
        cleanRatio,
        styleDesc
      );
      return NextResponse.json({ production: fallback });
    }

    const characters = (parsed.characters || []).map(
      (c: { name: string; role: string; visual: string }, idx: number) => ({
        id: `char-${idx + 1}`,
        name: c.name,
        role: c.role,
        visual: c.visual,
      })
    );

    const scenes: StoryboardScene[] = parsed.scenes.map(
      (s: Record<string, unknown>, idx: number) => {
        const sceneNumber = Number(s.sceneNumber) || idx + 1;
        const timecode = String(s.timecode || '00:00 - 00:20');
        const phase = String(s.phase || 'DRAMATIC BEAT');
        const rawCat = String(s.phaseCategory || '').toLowerCase();
        const phaseCategory: StoryboardScene['phaseCategory'] =
          rawCat === 'hook' ||
          rawCat === 'rising' ||
          rawCat === 'midpoint' ||
          rawCat === 'climax' ||
          rawCat === 'twist'
            ? rawCat
            : idx === 0
              ? 'hook'
              : idx === parsed.scenes.length - 1
                ? 'twist'
                : 'rising';

        const camera = String(s.camera || 'Medium Two-Shot');
        const mood = String(s.mood || 'High Tension');
        const setting = String(s.setting || 'Luxury interior');
        const action = String(s.action || '');
        const sfx = String(s.sfx || 'Dramatic sting');
        const dialogues = Array.isArray(s.dialogues)
          ? (s.dialogues as { speaker: string; line: string }[])
          : [];

        const masterPrompt = composeMasterPrompt({
          sceneNumber,
          timecode,
          phase,
          styleDesc,
          setting,
          camera,
          mood,
          action,
          title: title.trim(),
          characters,
          dialogues,
          sfx,
        });

        return {
          sceneNumber,
          timecode,
          phase,
          phaseCategory,
          camera,
          mood,
          setting,
          action,
          dialogues,
          sfx,
          imageUrl:
            LOCAL_STORYBOARD_ASSETS[idx % LOCAL_STORYBOARD_ASSETS.length],
          visualVariant: 0,
          focalLength: String(s.focalLength || '50mm Anamorphic'),
          lightingSetup: String(
            s.lightingSetup || 'Dramatic Chiaroscuro Key Light'
          ),
          masterPrompt,
        };
      }
    );

    const production: MicrodramaProduction = {
      title: title.trim(),
      genre,
      ratio: cleanRatio,
      styleDesc,
      durationMinutes: cleanDuration,
      totalScenes: scenes.length,
      secPerScene: Math.round((cleanDuration * 60) / scenes.length),
      synopsis: String(parsed.synopsis || ''),
      engineSource: 'gemini',
      characters,
      scenes,
    };

    return NextResponse.json({ production });
  } catch (err) {
    console.warn('Gemini generation fallback:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat memproses permintaan.',
      },
      { status: 500 }
    );
  }
}
