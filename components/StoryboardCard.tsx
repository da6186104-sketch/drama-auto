'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Pencil,
  Save,
  X,
  Grid,
} from 'lucide-react';
import {
  StoryboardScene,
  LOCAL_STORYBOARD_ASSETS,
} from '@/lib/microdrama-engine';

interface StoryboardCardProps {
  scene: StoryboardScene;
  ratio: '9:16' | '16:9';
  onCopyPrompt: (prompt: string, sceneNumber: number) => void;
  onRegenerateVisual: (sceneNumber: number) => void;
  onUpdateScene: (
    sceneNumber: number,
    updates: {
      action: string;
      camera: string;
      sfx: string;
      line1: string;
      line2: string;
    }
  ) => void;
  onOpenLightbox: (scene: StoryboardScene) => void;
}

const VARIANT_FILTERS = [
  'contrast-105 saturate-105',
  'contrast-110 saturate-90 hue-rotate-6',
  'contrast-115 brightness-95 sepia-[.12]',
  'contrast-105 saturate-125 -hue-rotate-6',
  'contrast-125 saturate-95 brightness-95',
];

export default function StoryboardCard({
  scene,
  ratio,
  onCopyPrompt,
  onRegenerateVisual,
  onUpdateScene,
  onOpenLightbox,
}: StoryboardCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [draftAction, setDraftAction] = useState(scene.action);
  const [draftCamera, setDraftCamera] = useState(scene.camera);
  const [draftSfx, setDraftSfx] = useState(scene.sfx);
  const [draftLine1, setDraftLine1] = useState(
    scene.dialogues[0]?.line || ''
  );
  const [draftLine2, setDraftLine2] = useState(
    scene.dialogues[1]?.line || ''
  );

  const isVertical = ratio === '9:16';
  const filterClass =
    VARIANT_FILTERS[scene.visualVariant % VARIANT_FILTERS.length];
  const currentAssetUrl =
    scene.visualVariant === 0
      ? scene.imageUrl
      : LOCAL_STORYBOARD_ASSETS[
          (scene.sceneNumber + scene.visualVariant) %
            LOCAL_STORYBOARD_ASSETS.length
        ];

  const handleCopy = () => {
    onCopyPrompt(scene.masterPrompt, scene.sceneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setDraftAction(scene.action);
    setDraftCamera(scene.camera);
    setDraftSfx(scene.sfx);
    setDraftLine1(scene.dialogues[0]?.line || '');
    setDraftLine2(scene.dialogues[1]?.line || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateScene(scene.sceneNumber, {
      action: draftAction.trim() || scene.action,
      camera: draftCamera.trim() || scene.camera,
      sfx: draftSfx.trim() || scene.sfx,
      line1: draftLine1.trim() || scene.dialogues[0]?.line || '',
      line2: draftLine2.trim() || scene.dialogues[1]?.line || '',
    });
    setIsEditing(false);
  };

  return (
    <article
      aria-label={`Adegan Storyboard ${scene.sceneNumber}`}
      className="rounded-2xl bg-[#12151f] border border-white/10 p-5 sm:p-6 transition-colors hover:border-white/20 print-card"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Kolom Gambar Visual Storyboard */}
        <div
          className={`flex flex-col shrink-0 ${
            isVertical ? 'lg:w-[240px]' : 'lg:w-[360px]'
          }`}
        >
          <div
            className={`relative rounded-xl overflow-hidden bg-[#090b10] border border-white/10 w-full group ${
              isVertical ? 'aspect-[9/16]' : 'aspect-[16/9]'
            }`}
          >
            {!imgError ? (
              <img
                src={currentAssetUrl}
                alt={`Visual Storyboard Scene ${scene.sceneNumber} - ${scene.phase}`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${filterClass}`}
              />
            ) : (
              /* Resilient Fallback Container (Zero-Broken-Image Policy) */
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 via-violet-950/40 to-slate-950">
                <span className="font-mono text-xs text-violet-300 font-semibold mb-1">
                  SCENE {String(scene.sceneNumber).padStart(2, '0')}
                </span>
                <p className="text-xs text-slate-300 font-medium line-clamp-3">
                  {scene.setting}
                </p>
              </div>
            )}

            {/* Director Rule-of-Thirds Grid Overlay */}
            {showGridOverlay && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3"
              >
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25 flex items-center justify-center">
                  <div className="w-3 h-3 border border-amber-400/70 rounded-full" />
                </div>
                <div className="border-b border-white/25" />
                <div className="border-r border-white/25" />
                <div className="border-r border-white/25" />
                <div />
              </div>
            )}

            {/* Measured Scrim Overlay for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

            {/* Top Camera HUD Metadata */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-white drop-shadow">
              <span className="font-bold tracking-wider">
                SCENE {String(scene.sceneNumber).padStart(2, '0')}
              </span>
              <span className="text-slate-200">{scene.focalLength}</span>
            </div>

            {/* Bottom Timecode & Subtitle Preview */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1.5">
              <p className="text-[11px] text-slate-100 line-clamp-2 leading-tight font-medium drop-shadow">
                {scene.dialogues[0]?.line}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-violet-200 pt-1 border-t border-white/15">
                <span>{scene.timecode}</span>
                <span>{ratio}</span>
              </div>
            </div>
          </div>

          {/* Visual Frame Controls */}
          <div className="mt-2.5 flex items-center justify-between gap-2 no-print">
            <button
              type="button"
              onClick={() => onRegenerateVisual(scene.sceneNumber)}
              aria-label={`Render ulang variasi gambar Scene ${scene.sceneNumber}`}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Render Ulang</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGridOverlay((prev) => !prev)}
                aria-label={`Tampilkan garis komposisi kamera Scene ${scene.sceneNumber}`}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  showGridOverlay
                    ? 'bg-violet-600/30 text-violet-300'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Garis Komposisi Rule of Thirds"
              >
                <Grid className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onOpenLightbox(scene)}
                aria-label={`Perbesar gambar Storyboard Scene ${scene.sceneNumber}`}
                className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Perbesar Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Detail Adegan, Dialog & Master Prompt Terpadu */}
        <div className="flex-1 flex flex-col justify-between space-y-5">
          <div>
            {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono tabular-nums font-bold text-white">
                  Adegan {String(scene.sceneNumber).padStart(2, '0')}
                </span>
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="font-semibold text-amber-300 tracking-wide">
                  {scene.phase}
                </span>
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono tabular-nums text-slate-300">
                  {scene.timecode}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>
                  {scene.camera} · {scene.mood}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    aria-label={`Edit naskah Adegan ${scene.sceneNumber}`}
                    className="text-violet-300 hover:text-violet-200 font-sans font-medium flex items-center gap-1 cursor-pointer no-print"
                  >
                    <Pencil className="w-3 h-3" aria-hidden="true" />
                    <span>Edit Adegan</span>
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              /* Inline Scene Script & Camera Editor */
              <div className="bg-[#090b10] rounded-xl p-4 border border-violet-500/40 mb-4 space-y-3 no-print">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`edit-cam-${scene.sceneNumber}`}
                      className="block text-xs text-slate-400 mb-1"
                    >
                      Sudut Kamera (Camera Blocking)
                    </label>
                    <input
                      id={`edit-cam-${scene.sceneNumber}`}
                      type="text"
                      value={draftCamera}
                      onChange={(e) => setDraftCamera(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-sfx-${scene.sceneNumber}`}
                      className="block text-xs text-slate-400 mb-1"
                    >
                      Efek Suara & Musik (Audio SFX)
                    </label>
                    <input
                      id={`edit-sfx-${scene.sceneNumber}`}
                      type="text"
                      value={draftSfx}
                      onChange={(e) => setDraftSfx(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`edit-action-${scene.sceneNumber}`}
                    className="block text-xs text-slate-400 mb-1"
                  >
                    Deskripsi Aksi & Visualisasi Storyboard
                  </label>
                  <textarea
                    id={`edit-action-${scene.sceneNumber}`}
                    rows={2}
                    value={draftAction}
                    onChange={(e) => setDraftAction(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`edit-line1-${scene.sceneNumber}`}
                      className="block text-xs text-slate-400 mb-1"
                    >
                      Dialog {scene.dialogues[0]?.speaker || 'Karakter 1'}
                    </label>
                    <input
                      id={`edit-line1-${scene.sceneNumber}`}
                      type="text"
                      value={draftLine1}
                      onChange={(e) => setDraftLine1(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-line2-${scene.sceneNumber}`}
                      className="block text-xs text-slate-400 mb-1"
                    >
                      Dialog {scene.dialogues[1]?.speaker || 'Karakter 2'}
                    </label>
                    <input
                      id={`edit-line2-${scene.sceneNumber}`}
                      type="text"
                      value={draftLine2}
                      onChange={(e) => setDraftLine2(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Simpan & Perbarui Prompt</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Deskripsi Aksi */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">
                    Aksi & Blocking Adegan ({scene.lightingSetup})
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {scene.action}
                  </p>
                </div>

                {/* Dialog & Audio */}
                <div className="bg-[#090b10] rounded-xl p-4 border border-white/10 mb-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5 text-xs">
                    <span className="font-semibold text-fuchsia-300">
                      Naskah Dialog & Lip-Sync Bahasa Indonesia
                    </span>
                    <span className="text-slate-400">
                      SFX & Musik: <strong className="text-slate-300 font-normal">{scene.sfx}</strong>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {scene.dialogues.map((d, i) => (
                      <div key={i} className="text-xs leading-relaxed">
                        <span className="font-bold text-white">
                          {d.speaker}:
                        </span>
                        <span className="text-slate-300 italic ml-1.5">
                          {d.line}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Master Prompt Terpadu (Visual + Kamera + Dialog Menyatu) */}
          <div className="bg-[#090b10] rounded-xl p-4 border border-violet-500/30">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-semibold text-violet-300">
                Master Prompt Terpadu (Visual + Kamera + Character Lock + Dialog
                Lip-Sync)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={`Salin Master Prompt Scene ${scene.sceneNumber}`}
                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 no-print"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Prompt Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Salin Master Prompt</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-black/50 p-3.5 rounded-lg border border-white/5 select-all overflow-x-auto">
              {scene.masterPrompt}
            </pre>
          </div>
        </div>
      </div>
    </article>
  );
}
