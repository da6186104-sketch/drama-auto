'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';

interface StudioHeaderProps {
  onCopyAllPrompts: () => void;
  copiedAll: boolean;
  totalScenes: number;
}

export default function StudioHeader({
  onCopyAllPrompts,
  copiedAll,
  totalScenes,
}: StudioHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b10]/90 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-violet-300 transition-colors"
        >
          Microdrama AI Studio
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <a
            href="#panel-produksi"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Panel Produksi
          </a>
          <a
            href="#bible-karakter"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Bible Karakter
          </a>
          <a
            href="#storyboard-workspace"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Storyboard
          </a>
          <a
            href="#panduan-workflow"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Panduan Prompt
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCopyAllPrompts}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tersalin ({totalScenes} Prompt)</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Salin Semua Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
