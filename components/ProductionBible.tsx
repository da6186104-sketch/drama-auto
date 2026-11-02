'use client';

import React, { useState } from 'react';
import { Copy, Check, Pencil, Save, X } from 'lucide-react';
import {
  CharacterProfile,
  MicrodramaProduction,
} from '@/lib/microdrama-engine';

interface ProductionBibleProps {
  production: MicrodramaProduction;
  onUpdateCharacter: (updated: CharacterProfile) => void;
  onCopyText: (text: string, label: string) => void;
}

export default function ProductionBible({
  production,
  onUpdateCharacter,
  onCopyText,
}: ProductionBibleProps) {
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [draftChar, setDraftChar] = useState<CharacterProfile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const startEditing = (char: CharacterProfile) => {
    setEditingCharId(char.id);
    setDraftChar({ ...char });
  };

  const cancelEditing = () => {
    setEditingCharId(null);
    setDraftChar(null);
  };

  const saveCharacter = () => {
    if (draftChar && draftChar.name.trim() && draftChar.visual.trim()) {
      onUpdateCharacter({
        ...draftChar,
        name: draftChar.name.trim(),
        role: draftChar.role.trim() || 'Karakter',
        visual: draftChar.visual.trim(),
      });
    }
    setEditingCharId(null);
    setDraftChar(null);
  };

  const handleCopyChar = (char: CharacterProfile) => {
    onCopyText(
      `${char.name} (${char.role}): ${char.visual}`,
      `Character Lock ${char.name} berhasil disalin!`
    );
    setCopiedId(char.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      id="bible-karakter"
      aria-labelledby="heading-bible-karakter"
      className="rounded-2xl bg-[#12151f] border border-white/10 p-6 sm:p-8 print-card"
    >
      {/* Top Production Summary Header with Clean Unboxed Metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium mb-2">
            <span className="text-violet-400 font-semibold">
              {production.genre}
            </span>
            <span aria-hidden="true">·</span>
            <span>Format {production.ratio}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Durasi {production.durationMinutes} Menit
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Total {production.totalScenes} Adegan Storyboard
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Rata-rata {production.secPerScene} dtk/adegan
            </span>
          </div>
          <h2
            id="heading-bible-karakter"
            className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance"
          >
            {production.title}
          </h2>
        </div>

        <div className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
          Mesin Aktif:{' '}
          <span className="text-slate-200 font-semibold">
            {production.engineSource === 'gemini'
              ? 'Gemini 3.8 Showrunner'
              : 'Smart Microdrama Engine'}
          </span>
        </div>
      </div>

      {/* Two-Column Split: Logline & Character Prompt Lock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: Logline & Strategi Retensi */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-amber-300 mb-2">
              01. Logline & Strategi Retensi Penonton
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {production.synopsis}
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between items-center font-mono tabular-nums">
              <span>00:00 – 00:03</span>
              <span className="text-slate-200">Golden 3-Second Hook</span>
            </div>
            <div className="flex justify-between items-center font-mono tabular-nums">
              <span>Pertengahan</span>
              <span className="text-slate-200">Midpoint Status Reversal</span>
            </div>
            <div className="flex justify-between items-center font-mono tabular-nums">
              <span>Penutup Episode</span>
              <span className="text-slate-200">Cliffhanger Plot Twist</span>
            </div>
          </div>
        </div>

        {/* Column 2: Kunci Konsistensi Visual Karakter */}
        <div className="lg:col-span-8 lg:border-l lg:border-white/10 lg:pl-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-cyan-300">
                02. Kunci Konsistensi Visual Karakter (Character Prompt Lock)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deskripsi fisik & pakaian bahasa Inggris ini dikunci otomatis ke
                setiap Master Prompt agar wajah tetap konsisten di semua adegan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {production.characters.map((char) => {
              const isEditing = editingCharId === char.id && draftChar;

              return (
                <div
                  key={char.id}
                  className="p-4 rounded-xl bg-[#090b10] border border-white/10 flex flex-col justify-between gap-3"
                >
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <div>
                        <label
                          htmlFor={`char-name-${char.id}`}
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Nama & Usia Karakter
                        </label>
                        <input
                          id={`char-name-${char.id}`}
                          type="text"
                          value={draftChar.name}
                          onChange={(e) =>
                            setDraftChar({ ...draftChar, name: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`char-role-${char.id}`}
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Peran Naratif
                        </label>
                        <input
                          id={`char-role-${char.id}`}
                          type="text"
                          value={draftChar.role}
                          onChange={(e) =>
                            setDraftChar({ ...draftChar, role: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded bg-[#12151f] border border-white/15 text-xs text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`char-visual-${char.id}`}
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Visual Prompt Lock (English)
                        </label>
                        <textarea
                          id={`char-visual-${char.id}`}
                          rows={3}
                          value={draftChar.visual}
                          onChange={(e) =>
                            setDraftChar({
                              ...draftChar,
                              visual: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded bg-[#12151f] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                          <span>Batal</span>
                        </button>
                        <button
                          type="button"
                          onClick={saveCharacter}
                          className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white cursor-pointer flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" aria-hidden="true" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <span className="font-bold text-sm text-white">
                            {char.name}
                          </span>
                          <span className="text-[11px] text-cyan-300 font-medium">
                            {char.role}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs font-mono leading-relaxed">
                          {char.visual}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 no-print">
                        <button
                          type="button"
                          onClick={() => startEditing(char)}
                          aria-label={`Ubah karakter ${char.name}`}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          <span>Ubah Lock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyChar(char)}
                          aria-label={`Salin visual lock ${char.name}`}
                          className="text-[11px] text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === char.id ? (
                            <>
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" aria-hidden="true" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
