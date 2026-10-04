'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import {
  Palette,
  X,
  Check,
  Type,
  Moon,
  Sun,
  Sparkles,
  Sliders,
  Monitor,
} from 'lucide-react';

export type ThemePaletteId =
  | 'canvas'
  | 'emerald'
  | 'sapphire'
  | 'rose'
  | 'midnight';

export type FontSizeScale = 'compact' | 'standard' | 'comfortable';

export interface ThemePreset {
  id: ThemePaletteId;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  surfaceBg: string;
  isDark: boolean;
  swatches: string[];
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'canvas',
    name: 'Clinical Canvas (Default)',
    tagline: 'Modern Canvas EHR styling with purple & sky accents',
    primaryColor: '#7c3aed',
    accentColor: '#0284c7',
    surfaceBg: '#ffffff',
    isDark: false,
    swatches: ['#7c3aed', '#0284c7', '#38bdf8', '#f8fafc'],
  },
  {
    id: 'emerald',
    name: 'Emerald & Mint (DOH Healthcare)',
    tagline: 'Soothing clinical teal and Philippine healthcare green',
    primaryColor: '#059669',
    accentColor: '#0d9488',
    surfaceBg: '#ffffff',
    isDark: false,
    swatches: ['#059669', '#0d9488', '#34d399', '#f0fdf4'],
  },
  {
    id: 'sapphire',
    name: 'Ocean Sapphire (Hospital Blue)',
    tagline: 'Traditional clinical EHR cobalt and icy navy',
    primaryColor: '#2563eb',
    accentColor: '#0284c7',
    surfaceBg: '#ffffff',
    isDark: false,
    swatches: ['#2563eb', '#0284c7', '#60a5fa', '#f0f9ff'],
  },
  {
    id: 'rose',
    name: 'Warm Rose (Maternal & Wellness)',
    tagline: 'Warm rose and blush tones tailored for Ob-Gyn care',
    primaryColor: '#e11d48',
    accentColor: '#db2777',
    surfaceBg: '#ffffff',
    isDark: false,
    swatches: ['#e11d48', '#db2777', '#fb7185', '#fff1f2'],
  },
  {
    id: 'midnight',
    name: 'Midnight Clinical (Dark Mode)',
    tagline: 'High-contrast dark clinical theme for night shifts',
    primaryColor: '#38bdf8',
    accentColor: '#818cf8',
    surfaceBg: '#090d16',
    isDark: true,
    swatches: ['#090d16', '#1e293b', '#38bdf8', '#818cf8'],
  },
];

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: ThemePaletteId;
  onSelectTheme: (id: ThemePaletteId) => void;
  activeFontSize: FontSizeScale;
  onSelectFontSize: (scale: FontSizeScale) => void;
}

export function ThemeCustomizerModal({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  activeFontSize,
  onSelectFontSize,
}: ThemeCustomizerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Theme, Color Palette & Typography
              </h2>
              <p className="text-xs text-slate-500">
                Instantly customize clinical color palette and typography density
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label="Close theme modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Color Palette Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>Clinical Color Palettes</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Changes apply instantly across the whole UI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = activeThemeId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectTheme(preset.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    {/* Swatches Visual */}
                    <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                      <div className="flex gap-1">
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.swatches[0] }}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.swatches[1] }}
                        />
                      </div>
                      <div className="flex gap-1">
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.swatches[2] }}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.swatches[3] }}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white shrink-0">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                        {preset.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Font Sizing & Information Density */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-blue-600" />
                <span>Font Sizing & Screen Information Density</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Tailored for multi-window workstations
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'compact',
                  title: 'Compact (88%)',
                  desc: 'High data density for large monitors & multi-pane charts',
                  badge: 'Power User',
                },
                {
                  id: 'standard',
                  title: 'Standard (100%)',
                  desc: 'Optimal clinical balance for standard desktop use',
                  badge: 'Recommended',
                },
                {
                  id: 'comfortable',
                  title: 'Comfortable (112%)',
                  desc: 'Larger typography and relaxed line heights for tablets',
                  badge: 'Accessible',
                },
              ].map((opt) => {
                const isSelected = activeFontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectFontSize(opt.id as FontSizeScale)}
                    className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {opt.title}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        {opt.desc}
                      </p>
                    </div>
                    <span className="mt-3 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 font-mono">
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Live Preview Sample Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Typography & Theme Sample
            </span>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 leading-tight">
                Metro Health PH &bull; Dr. Florence Espinosa, MD (PRC 0098412)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Obstetrics & Gynecology Clinical Encounter. Patient Andrea Dizon (42Y / F),
                PhilHealth Konsulta PIN: 12-345678901-2. Anteverted uterus 7.8 x 4.5 cm with
                endometrial stripe 14.2mm. Progestin therapy and follow-up consultation ordered.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              onSelectTheme('canvas');
              onSelectFontSize('standard');
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Reset to Default Style
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
}
