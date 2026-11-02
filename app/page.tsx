'use client';

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, RotateCcw } from 'lucide-react';
import StudioHeader from '@/components/StudioHeader';
import ControlPanel from '@/components/ControlPanel';
import ProductionBible from '@/components/ProductionBible';
import StoryboardCard from '@/components/StoryboardCard';
import StoryboardLightbox from '@/components/StoryboardLightbox';
import {
  buildProceduralDrama,
  CharacterProfile,
  composeMasterPrompt,
  MicrodramaProduction,
  parseVisualStyleOption,
  StoryboardScene,
  validateDramaInput,
  VISUAL_STYLE_OPTIONS,
} from '@/lib/microdrama-engine';

const INITIAL_STYLE = VISUAL_STYLE_OPTIONS[0].value;
const INITIAL_PARSED = parseVisualStyleOption(INITIAL_STYLE);
const INITIAL_PRODUCTION = buildProceduralDrama(
  'Suamiku Ternyata CEO Miliarder yang Menyamar',
  'CEO Romance / Balas Dendam',
  3,
  INITIAL_PARSED.ratio,
  INITIAL_PARSED.styleDesc
);

type PhaseFilter = 'all' | 'hook' | 'rising' | 'midpoint' | 'climax' | 'twist';

export default function HomePage() {
  const [title, setTitle] = useState(
    'Suamiku Ternyata CEO Miliarder yang Menyamar'
  );
  const [genre, setGenre] = useState('CEO Romance / Balas Dendam');
  const [visualStyle, setVisualStyle] = useState<string>(INITIAL_STYLE);
  const [durationMinutes, setDurationMinutes] = useState<number>(3);
  const [useAiEngine, setUseAiEngine] = useState<boolean>(false);

  const [production, setProduction] =
    useState<MicrodramaProduction>(INITIAL_PRODUCTION);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxSceneNum, setLightboxSceneNum] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const copyTextToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Fallback if clipboard permission restricted in headless browser
    }
    triggerToast(label);
  };

  const handleCopyAllPrompts = () => {
    if (!production.scenes.length) return;
    const joined = production.scenes
      .map((s) => s.masterPrompt)
      .join('\n\n========================================\n\n');
    copyTextToClipboard(
      joined,
      `Semua ${production.scenes.length} Master Prompt berhasil disalin!`
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleCopySinglePrompt = (prompt: string, sceneNumber: number) => {
    copyTextToClipboard(
      prompt,
      `Master Prompt Scene ${sceneNumber} berhasil disalin!`
    );
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const check = validateDramaInput(title, durationMinutes);
    if (!check.valid) {
      setValidationError(check.error || 'Input tidak valid.');
      return;
    }
    setValidationError(null);
    setPhaseFilter('all');
    setSearchQuery('');

    const { ratio, styleDesc } = parseVisualStyleOption(visualStyle);

    if (!useAiEngine) {
      const nextProd = buildProceduralDrama(
        title,
        genre,
        durationMinutes,
        ratio,
        styleDesc
      );
      setProduction(nextProd);
      triggerToast(
        `Berhasil merancang ${nextProd.totalScenes} adegan untuk "${nextProd.title}"!`
      );
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          genre,
          durationMinutes,
          ratio,
          styleDesc,
          useAiEngine: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.production) {
        setProduction(data.production);
        triggerToast(
          `Skenario & ${data.production.totalScenes} adegan selesai dibuat!`
        );
      } else {
        const fallback = buildProceduralDrama(
          title,
          genre,
          durationMinutes,
          ratio,
          styleDesc
        );
        setProduction(fallback);
        triggerToast(
          `Dirender dengan Smart Microdrama Engine (${fallback.totalScenes} adegan).`
        );
      }
    } catch {
      const fallback = buildProceduralDrama(
        title,
        genre,
        durationMinutes,
        ratio,
        styleDesc
      );
      setProduction(fallback);
      triggerToast(
        `Dirender dengan Smart Microdrama Engine (${fallback.totalScenes} adegan).`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: {
    title: string;
    genre: string;
    duration: number;
  }) => {
    setTitle(preset.title);
    setGenre(preset.genre);
    setDurationMinutes(preset.duration);
    setValidationError(null);
    setPhaseFilter('all');
    setSearchQuery('');

    const { ratio, styleDesc } = parseVisualStyleOption(visualStyle);
    const nextProd = buildProceduralDrama(
      preset.title,
      preset.genre,
      preset.duration,
      ratio,
      styleDesc
    );
    setProduction(nextProd);
    triggerToast(`Template "${preset.title}" dimuat (${nextProd.totalScenes} adegan).`);
  };

  const handleUpdateCharacter = (updatedChar: CharacterProfile) => {
    setProduction((prev) => {
      const nextChars = prev.characters.map((c) =>
        c.id === updatedChar.id ? updatedChar : c
      );
      const nextScenes = prev.scenes.map((s) => ({
        ...s,
        masterPrompt: composeMasterPrompt({
          sceneNumber: s.sceneNumber,
          timecode: s.timecode,
          phase: s.phase,
          styleDesc: prev.styleDesc,
          setting: s.setting,
          camera: s.camera,
          mood: s.mood,
          action: s.action,
          title: prev.title,
          characters: nextChars,
          dialogues: s.dialogues,
          sfx: s.sfx,
        }),
      }));
      return {
        ...prev,
        characters: nextChars,
        scenes: nextScenes,
      };
    });
    triggerToast(
      `Character Lock "${updatedChar.name}" diperbarui di semua adegan!`
    );
  };

  const handleRegenerateVisual = (sceneNumber: number) => {
    setProduction((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.sceneNumber === sceneNumber
          ? { ...s, visualVariant: s.visualVariant + 1 }
          : s
      ),
    }));
    triggerToast(`Variasi visual Scene ${sceneNumber} dirender ulang.`);
  };

  const handleUpdateScene = (
    sceneNumber: number,
    updates: {
      action: string;
      camera: string;
      sfx: string;
      line1: string;
      line2: string;
    }
  ) => {
    setProduction((prev) => {
      const nextScenes = prev.scenes.map((s) => {
        if (s.sceneNumber !== sceneNumber) return s;
        const nextDialogues = [
          {
            speaker: s.dialogues[0]?.speaker || prev.characters[0]?.name || 'A',
            line: updates.line1,
          },
          {
            speaker: s.dialogues[1]?.speaker || prev.characters[1]?.name || 'B',
            line: updates.line2,
          },
        ];
        const nextPrompt = composeMasterPrompt({
          sceneNumber: s.sceneNumber,
          timecode: s.timecode,
          phase: s.phase,
          styleDesc: prev.styleDesc,
          setting: s.setting,
          camera: updates.camera,
          mood: s.mood,
          action: updates.action,
          title: prev.title,
          characters: prev.characters,
          dialogues: nextDialogues,
          sfx: updates.sfx,
        });
        return {
          ...s,
          action: updates.action,
          camera: updates.camera,
          sfx: updates.sfx,
          dialogues: nextDialogues,
          masterPrompt: nextPrompt,
        };
      });
      return { ...prev, scenes: nextScenes };
    });
    triggerToast(`Naskah & Master Prompt Adegan ${sceneNumber} diperbarui!`);
  };

  const handleExportMarkdown = () => {
    const lines: string[] = [
      `# ${production.title}`,
      `**Genre:** ${production.genre} | **Format:** ${production.ratio} | **Durasi:** ${production.durationMinutes} Menit (${production.totalScenes} Adegan)`,
      '',
      `## Logline & Strategi Retensi`,
      production.synopsis,
      '',
      `## Character Prompt Lock`,
      ...production.characters.map(
        (c) => `- **${c.name}** (${c.role}): \`${c.visual}\``
      ),
      '',
      `## Storyboard & Master Prompts`,
      ...production.scenes.flatMap((s) => [
        `### Scene ${s.sceneNumber} (${s.timecode}) — ${s.phase}`,
        `- **Kamera & Mood:** ${s.camera} · ${s.mood}`,
        `- **Aksi:** ${s.action}`,
        `- **SFX:** ${s.sfx}`,
        `- **Dialog:**`,
        ...s.dialogues.map((d) => `  - **${d.speaker}:** ${d.line}`),
        '',
        '```text',
        s.masterPrompt,
        '```',
        '',
      ]),
    ];

    const blob = new Blob([lines.join('\n')], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${production.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-storyboard.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Dokumen Naskah & Storyboard (.MD) berhasil diunduh!');
  };

  const filteredScenes = useMemo(() => {
    return production.scenes.filter((scene) => {
      if (phaseFilter !== 'all' && scene.phaseCategory !== phaseFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inAction = scene.action.toLowerCase().includes(q);
        const inPhase = scene.phase.toLowerCase().includes(q);
        const inDialogue = scene.dialogues.some(
          (d) =>
            d.speaker.toLowerCase().includes(q) ||
            d.line.toLowerCase().includes(q)
        );
        return inAction || inPhase || inDialogue;
      }
      return true;
    });
  }, [production.scenes, phaseFilter, searchQuery]);

  const activeLightboxScene: StoryboardScene | null = useMemo(() => {
    if (lightboxSceneNum === null) return null;
    return (
      production.scenes.find((s) => s.sceneNumber === lightboxSceneNum) || null
    );
  }, [lightboxSceneNum, production.scenes]);

  return (
    <div id="top" className="min-h-screen pb-20 bg-[#090b10] text-slate-100">
      <StudioHeader
        onCopyAllPrompts={handleCopyAllPrompts}
        copiedAll={copiedAll}
        totalScenes={production.totalScenes}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Control Panel */}
        <ControlPanel
          title={title}
          setTitle={(val) => {
            setTitle(val);
            if (validationError) setValidationError(null);
          }}
          genre={genre}
          setGenre={setGenre}
          visualStyle={visualStyle}
          setVisualStyle={setVisualStyle}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          useAiEngine={useAiEngine}
          setUseAiEngine={setUseAiEngine}
          isGenerating={isGenerating}
          validationError={validationError}
          onGenerate={handleGenerate}
          onSelectPreset={handleSelectPreset}
          onPrint={() => window.print()}
          onExportMarkdown={handleExportMarkdown}
        />

        {/* Bible Karakter & Ringkasan Produksi */}
        <ProductionBible
          production={production}
          onUpdateCharacter={handleUpdateCharacter}
          onCopyText={copyTextToClipboard}
        />

        {/* Daftar Adegan / Storyboard Workspace */}
        <section
          id="storyboard-workspace"
          aria-labelledby="heading-storyboard"
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2
                id="heading-storyboard"
                className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Storyboard Per Adegan, Gambar Visual & Master Prompt Terpadu
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Menampilkan{' '}
                <strong className="font-mono tabular-nums text-white">
                  {filteredScenes.length}
                </strong>{' '}
                dari{' '}
                <strong className="font-mono tabular-nums text-white">
                  {production.totalScenes}
                </strong>{' '}
                adegan inti · Klik tombol{' '}
                <strong className="text-slate-200">Salin Master Prompt</strong>{' '}
                untuk langsung ditempel ke AI Video/Image Generator.
              </p>
            </div>

            {/* Interactive Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-print">
              <div
                role="group"
                aria-label="Filter Fase Naratif"
                className="flex items-center gap-1 p-1 bg-[#12151f] rounded-xl border border-white/10 overflow-x-auto shrink-0"
              >
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'hook', label: '3s Hook' },
                    { id: 'rising', label: 'Konflik' },
                    { id: 'midpoint', label: 'Titik Balik' },
                    { id: 'climax', label: 'Klimaks' },
                    { id: 'twist', label: 'Plot Twist' },
                  ] as { id: PhaseFilter; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPhaseFilter(tab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      phaseFilter === tab.id
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <label htmlFor="searchScenes" className="sr-only">
                  Cari dialog atau aksi adegan
                </label>
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="searchScenes"
                  type="search"
                  placeholder="Cari dialog / aksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-full sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Storyboard Cards List */}
          {filteredScenes.length > 0 ? (
            <div className="space-y-6">
              {filteredScenes.map((scene) => (
                <StoryboardCard
                  key={`${production.title}-${scene.sceneNumber}`}
                  scene={scene}
                  ratio={production.ratio}
                  onCopyPrompt={handleCopySinglePrompt}
                  onRegenerateVisual={handleRegenerateVisual}
                  onUpdateScene={handleUpdateScene}
                  onOpenLightbox={(s) => setLightboxSceneNum(s.sceneNumber)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#12151f] border border-white/10 p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-white">
                Tidak ada adegan yang cocok dengan filter pencarian saat ini.
              </p>
              <p className="text-xs text-slate-400">
                Reset filter fase naratif atau kata kunci pencarian untuk
                melihat seluruh {production.totalScenes} adegan storyboard.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPhaseFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tampilkan Semua Adegan</span>
              </button>
            </div>
          )}
        </section>

        {/* Panduan Produksi & Workflow Prompt */}
        <section
          id="panduan-workflow"
          aria-labelledby="heading-panduan"
          className="rounded-2xl bg-[#12151f] border border-white/10 p-6 sm:p-8 no-print"
        >
          <h2
            id="heading-panduan"
            className="font-display text-lg font-bold text-white mb-4"
          >
            Panduan Penggunaan Master Prompt Terpadu (AI Video & Lip-Sync)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-white text-sm">
                01. Konsistensi Karakter (Character Lock)
              </h3>
              <p className="text-slate-400">
                Setiap Master Prompt menyertakan blok{' '}
                <code className="text-violet-300">CHARACTER LOCK</code> yang
                identik. Ubah deskripsi fisik karakter di bagian Bible Karakter
                untuk memperbarui seluruh adegan sekaligus secara otomatis.
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-white text-sm">
                02. Kamera & Blocking Sinematik
              </h3>
              <p className="text-slate-400">
                Sudut kamera dirancang mengikuti ritme retensi microdrama:
                Extreme Close-Up di 3 detik pertama, Over-the-Shoulder saat
                eskalasi dialog, dan Dynamic Orbit pada puncak klimaks.
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-white text-sm">
                03. Ekspor Multi-Platform
              </h3>
              <p className="text-slate-400">
                Salin Master Prompt per adegan atau sekaligus untuk ditempel ke
                mesin video AI mendukung lip-sync maupun generator gambar
                storyboard vertikal 9:16 dan layar lebar 16:9.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      <StoryboardLightbox
        scene={activeLightboxScene}
        totalScenes={production.totalScenes}
        ratio={production.ratio}
        onClose={() => setLightboxSceneNum(null)}
        onNavigate={(dir) => {
          if (lightboxSceneNum === null) return;
          const nextNum =
            dir === 'prev'
              ? Math.max(1, lightboxSceneNum - 1)
              : Math.min(production.totalScenes, lightboxSceneNum + 1);
          setLightboxSceneNum(nextNum);
        }}
        onCopyPrompt={handleCopySinglePrompt}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-400/30"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
