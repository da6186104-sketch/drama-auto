'use client';

import React from 'react';
import { X, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  StoryboardScene,
  LOCAL_STORYBOARD_ASSETS,
} from '@/lib/microdrama-engine';

interface StoryboardLightboxProps {
  scene: StoryboardScene | null;
  totalScenes: number;
  ratio: '9:16' | '16:9';
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onCopyPrompt: (prompt: string, sceneNumber: number) => void;
}

export default function StoryboardLightbox({
  scene,
  totalScenes,
  ratio,
  onClose,
  onNavigate,
  onCopyPrompt,
}: StoryboardLightboxProps) {
  if (!scene) return null;

  const currentAssetUrl =
    scene.visualVariant === 0
      ? scene.imageUrl
      : LOCAL_STORYBOARD_ASSETS[
          (scene.sceneNumber + scene.visualVariant) %
            LOCAL_STORYBOARD_ASSETS.length
        ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-scene-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[#12151f] border border-white/15 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-300">
            <h3 id="lightbox-scene-title" className="font-bold text-white text-sm font-sans">
              Scene {String(scene.sceneNumber).padStart(2, '0')} dari {totalScenes}
            </h3>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">{scene.phase}</span>
            <span aria-hidden="true">·</span>
            <span>{scene.timecode}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau layar penuh"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div
              className={`relative rounded-xl overflow-hidden border border-white/10 bg-black ${
                ratio === '9:16'
                  ? 'aspect-[9/16] max-h-[420px]'
                  : 'aspect-[16/9] w-full'
              }`}
            >
              <img
                src={currentAssetUrl}
                alt={`Pratinjau Penuh Scene ${scene.sceneNumber}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-xs text-white font-medium drop-shadow">
                {scene.dialogues[0]?.line}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <div className="text-xs text-slate-400 font-mono space-y-1">
              <div>
                Kamera: <span className="text-slate-200">{scene.camera}</span> ({scene.focalLength})
              </div>
              <div>
                Pencahayaan: <span className="text-slate-200">{scene.lightingSetup}</span>
              </div>
              <div>
                Lokasi: <span className="text-slate-200">{scene.setting}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">
                Aksi & Blocking
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {scene.action}
              </p>
            </div>

            <div className="bg-[#090b10] p-3.5 rounded-xl border border-white/10 space-y-2">
              {scene.dialogues.map((d, idx) => (
                <p key={idx} className="text-xs">
                  <strong className="text-white">{d.speaker}:</strong>{' '}
                  <span className="text-slate-300 italic">{d.line}</span>
                </p>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={scene.sceneNumber <= 1}
                  onClick={() => onNavigate('prev')}
                  className="px-3 py-1.5 rounded-lg bg-[#090b10] border border-white/10 text-xs text-slate-200 hover:border-white/25 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Adegan Sebelumnya</span>
                </button>
                <button
                  type="button"
                  disabled={scene.sceneNumber >= totalScenes}
                  onClick={() => onNavigate('next')}
                  className="px-3 py-1.5 rounded-lg bg-[#090b10] border border-white/10 text-xs text-slate-200 hover:border-white/25 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <span>Adegan Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onCopyPrompt(scene.masterPrompt, scene.sceneNumber)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Salin Master Prompt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
