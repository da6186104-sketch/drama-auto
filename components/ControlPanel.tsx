'use client';

import React from 'react';
import {
  Clapperboard,
  Sparkles,
  Printer,
  Download,
  Cpu,
  Zap,
  AlertCircle,
} from 'lucide-react';
import {
  GENRE_OPTIONS,
  VISUAL_STYLE_OPTIONS,
  PRESET_PREMISES,
  calculateSceneCount,
} from '@/lib/microdrama-engine';

interface ControlPanelProps {
  title: string;
  setTitle: (val: string) => void;
  genre: string;
  setGenre: (val: string) => void;
  visualStyle: string;
  setVisualStyle: (val: string) => void;
  durationMinutes: number;
  setDurationMinutes: (val: number) => void;
  useAiEngine: boolean;
  setUseAiEngine: (val: boolean) => void;
  isGenerating: boolean;
  validationError: string | null;
  onGenerate: (e?: React.FormEvent) => void;
  onSelectPreset: (preset: {
    title: string;
    genre: string;
    duration: number;
  }) => void;
  onPrint: () => void;
  onExportMarkdown: () => void;
}

export default function ControlPanel({
  title,
  setTitle,
  genre,
  setGenre,
  visualStyle,
  setVisualStyle,
  durationMinutes,
  setDurationMinutes,
  useAiEngine,
  setUseAiEngine,
  isGenerating,
  validationError,
  onGenerate,
  onSelectPreset,
  onPrint,
  onExportMarkdown,
}: ControlPanelProps) {
  const scenesCount = calculateSceneCount(durationMinutes);
  const secPerScene = Math.round((durationMinutes * 60) / scenesCount);

  return (
    <section
      id="panel-produksi"
      aria-labelledby="heading-panel-produksi"
      className="rounded-2xl bg-[#12151f] border border-white/10 p-6 sm:p-8 mb-8 no-print"
    >
      {/* Studio Workspace Header & Utility Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 mb-6 border-b border-white/10">
        <div>
          <p className="text-xs font-medium text-violet-400 tracking-wide mb-2">
            Pre-Production & AI Directing Suite · Format 9:16 & 16:9
          </p>
          <h1
            id="heading-panel-produksi"
            className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance"
          >
            Generator Naskah, Storyboard Visual & Master Prompt Terpadu
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Rancang struktur dramatis 1 hingga 10 menit lengkap dengan{' '}
            <span className="text-slate-200 font-medium">3-Second Hook</span>,
            kunci konsistensi wajah karakter, naskah dialog Bahasa Indonesia,
            dan prompt kamera siap pakai.
          </p>
        </div>

        {/* Secondary Export & Print Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onExportMarkdown}
            className="px-3.5 py-2 rounded-lg bg-[#1c2130] hover:bg-slate-800 text-xs font-medium text-slate-200 border border-white/10 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
            <span>Unduh Naskah (.MD)</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-2 rounded-lg bg-[#1c2130] hover:bg-slate-800 text-xs font-medium text-slate-200 border border-white/10 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Premise Templates */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">
            Template Premis Cepat:
          </span>
          {PRESET_PREMISES.map((preset) => {
            const isSelected = title === preset.title;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600/25 text-violet-200 border border-violet-500/40'
                    : 'bg-[#090b10] text-slate-300 border border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {preset.title}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onGenerate} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Judul Microdrama */}
          <div className="md:col-span-6">
            <label
              htmlFor="dramaTitle"
              className="block text-xs font-semibold text-slate-300 mb-2"
            >
              Judul Microdrama / Premis Utama{' '}
              <span className="text-rose-400" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="text"
              id="dramaTitle"
              name="dramaTitle"
              required
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'title-error' : undefined}
              placeholder="Contoh: Suamiku Ternyata CEO Miliarder yang Menyamar Jadi Kurir..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#090b10] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
            />
            {validationError && (
              <p
                id="title-error"
                role="alert"
                className="mt-2 text-xs text-rose-400 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* Genre & Tone */}
          <div className="md:col-span-3">
            <label
              htmlFor="dramaGenre"
              className="block text-xs font-semibold text-slate-300 mb-2"
            >
              Genre & Tone Drama
            </label>
            <select
              id="dramaGenre"
              name="dramaGenre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#090b10] border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm cursor-pointer"
            >
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format & Gaya Visual */}
          <div className="md:col-span-3">
            <label
              htmlFor="visualStyle"
              className="block text-xs font-semibold text-slate-300 mb-2"
            >
              Format & Gaya Visual
            </label>
            <select
              id="visualStyle"
              name="visualStyle"
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#090b10] border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm cursor-pointer"
            >
              {VISUAL_STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Duration Slider & Story Engine Mode */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Slider Durasi 1 - 10 Menit */}
          <div className="md:col-span-7 bg-[#090b10] p-4 rounded-xl border border-white/10">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
              <label
                htmlFor="dramaDuration"
                className="text-xs font-semibold text-slate-300"
              >
                Target Durasi Microdrama (1–10 Menit)
              </label>
              <div className="text-xs font-mono tabular-nums text-violet-300 font-semibold">
                <span>{durationMinutes} Menit</span>
                <span className="mx-1.5 text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span>{scenesCount} Adegan Inti</span>
                <span className="mx-1.5 text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="text-slate-400">~{secPerScene} dtk/adegan</span>
              </div>
            </div>

            <input
              type="range"
              id="dramaDuration"
              name="dramaDuration"
              min={1}
              max={10}
              step={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes( parseInt(e.target.value, 10) )}
              className="w-full accent-violet-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between items-center mt-2.5 gap-2">
              {[
                { min: 1, label: '1 Mnt (Shorts/Reels)' },
                { min: 3, label: '3 Mnt (TikTok/Snack)' },
                { min: 5, label: '5 Mnt (Multi-Part)' },
                { min: 10, label: '10 Mnt (Full Episode)' },
              ].map((mark) => (
                <button
                  key={mark.min}
                  type="button"
                  onClick={() => setDurationMinutes(mark.min)}
                  className={`text-[11px] font-mono tabular-nums transition-colors cursor-pointer ${
                    durationMinutes === mark.min
                      ? 'text-violet-300 font-semibold underline underline-offset-4'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mark.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Mesin Pembuat Cerita (Server-Side AI vs Built-in Procedural) */}
          <div className="md:col-span-5 bg-[#090b10] p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Mode Mesin Pembuat Cerita
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                Siap Pakai
              </span>
            </div>

            <div
              role="group"
              aria-label="Pilih Mesin Pembuat Cerita"
              className="grid grid-cols-2 gap-2 p-1 bg-[#12151f] rounded-lg border border-white/5"
            >
              <button
                type="button"
                onClick={() => setUseAiEngine(false)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  !useAiEngine
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Smart Engine Instan</span>
              </button>
              <button
                type="button"
                onClick={() => setUseAiEngine(true)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  useAiEngine
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Gemini AI Showrunner</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 leading-snug">
              {useAiEngine
                ? 'Menggunakan Gemini 3.8 Flash di sisi server untuk meracik dialog dan adegan kustom.'
                : 'Menggunakan Built-in Smart Microdrama Engine berkecepatan tinggi dengan struktur 9 beat.'}
            </p>
          </div>
        </div>

        {/* Tombol Generate */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm tracking-wide shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Clapperboard
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                />
                <span>
                  Merancang Struktur Microdrama & Merender Storyboard...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>
                  Buat Naskah, Storyboard Visual & Master Prompt Sekarang
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
