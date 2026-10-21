/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MotoBloggerButton.tsx
 * Dedicated high-visibility orange quick-action button for the editor bottom toolbar.
 * Instantly applies a 1-tap macro combining:
 * 1. Skia GPU Directional Motion Blur (optical shutter speed drag)
 * 2. High-contrast Action 3D LUT color grading (vibrant saturation, deep asphalt blacks)
 * 3. Cinematic 2.39:1 anamorphic letterbox framing
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Gauge, 
  Settings2, 
  Check, 
  Sliders, 
  Sparkles,
  Eye,
  Film
} from 'lucide-react';

export interface MotoMacroSettings {
  isEnabled: boolean;
  blurIntensity: number; // 0.0 - 1.0
  blurAngle: number;     // degrees (0 = horizontal, 45 = lean)
  lutPreset: 'VIBRANT_ACTION' | 'ASPHALT_BURN' | 'MIDNIGHT_WARP';
  enableLetterbox: boolean;
  shutterAngleEmulation: '180deg' | '270deg' | '360deg';
}

interface MotoBloggerButtonProps {
  isActive: boolean;
  onToggle: (newState: boolean) => void;
  settings?: MotoMacroSettings;
  onUpdateSettings?: (settings: Partial<MotoMacroSettings>) => void;
}

export const MotoBloggerButton: React.FC<MotoBloggerButtonProps> = ({
  isActive,
  onToggle,
  settings = {
    isEnabled: false,
    blurIntensity: 0.85,
    blurAngle: 25,
    lutPreset: 'VIBRANT_ACTION',
    enableLetterbox: true,
    shutterAngleEmulation: '180deg'
  },
  onUpdateSettings
}) => {
  const [showConfigPopover, setShowConfigPopover] = useState(false);

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!isActive);
  };

  const handleGearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfigPopover(prev => !prev);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Main MotoVlog Quick-Action Button */}
      <button
        onClick={handleMainClick}
        title="1-Tap MotoVlog Macro: Directional Skia Blur + Action 3D LUT + 2.39:1 Letterbox"
        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 select-none shadow-lg ${
          isActive
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-zinc-950 shadow-[0_0_20px_rgba(249,115,22,0.6)] border-2 border-amber-300 ring-2 ring-orange-400/40'
            : 'bg-zinc-900/90 hover:bg-zinc-800 text-orange-400 border border-orange-500/40 hover:border-orange-400/80 hover:shadow-[0_0_14px_rgba(249,115,22,0.25)]'
        }`}
      >
        {/* Animated glowing backdrop ring when active */}
        {isActive && (
          <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 blur-sm opacity-70 -z-10 animate-pulse" />
        )}

        {/* Icon with flame / speedometer dynamic vibe */}
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
          isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-orange-500/10 text-orange-400'
        }`}>
          {isActive ? (
            <Flame size={15} className="font-extrabold animate-bounce" />
          ) : (
            <Gauge size={15} className="text-orange-400" />
          )}
        </div>

        {/* Label and Status */}
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider">
              MOTO VLOG
            </span>
            <span className={`text-[9px] px-1 py-0.5 rounded font-black uppercase ${
              isActive 
                ? 'bg-zinc-950/25 text-zinc-950' 
                : 'bg-orange-400/15 text-orange-400 border border-orange-400/30'
            }`}>
              {isActive ? 'ON' : 'MACRO'}
            </span>
          </div>
          <span className={`text-[9px] font-medium tracking-tight mt-0.5 ${
            isActive ? 'text-zinc-900/80 font-semibold' : 'text-zinc-400'
          }`}>
            Skia Blur • LUT • 2.39:1
          </span>
        </div>

        {/* Mini settings opener icon */}
        <span
          onClick={handleGearClick}
          className={`p-1 -mr-1 rounded-md transition ${
            isActive 
              ? 'hover:bg-zinc-950/20 text-zinc-950' 
              : 'hover:bg-zinc-750 text-zinc-400 hover:text-orange-300'
          }`}
          title="Tweak Moto Blur & Shutter Settings"
        >
          <Settings2 size={13} />
        </span>
      </button>

      {/* Quick Settings Floating Popover */}
      {showConfigPopover && (
        <div 
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 bg-[#121216] border border-orange-500/30 rounded-2xl p-4 shadow-2xl z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-orange-500/15 text-orange-400">
                <Gauge size={14} />
              </div>
              <span className="font-bold text-white text-[12px]">MotoVlog Shutter Engine</span>
            </div>
            <button 
              onClick={() => setShowConfigPopover(false)}
              className="text-zinc-400 hover:text-white text-xs font-mono px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Intensity Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-zinc-300 font-medium">Motion Blur Intensity</span>
                <span className="text-orange-400 font-mono font-bold">
                  {Math.round(settings.blurIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.blurIntensity}
                onChange={(e) => onUpdateSettings?.({ blurIntensity: parseFloat(e.target.value) })}
                className="w-full accent-orange-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-400 mt-1 font-mono">
                <span>Subtle (ND8)</span>
                <span>Medium (ND16)</span>
                <span>Hyper-Warp</span>
              </div>
            </div>

            {/* Shutter Angle Emulation */}
            <div>
              <span className="text-[11px] text-zinc-300 font-medium block mb-1.5">
                Shutter Angle (Optical Drag)
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                {(['180deg', '270deg', '360deg'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => onUpdateSettings?.({ shutterAngleEmulation: angle })}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                      settings.shutterAngleEmulation === angle
                        ? 'bg-orange-500 text-zinc-950 border-orange-400'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {angle === '180deg' ? '180° Cine' : angle === '270deg' ? '270° Action' : '360° Max'}
                  </button>
                ))}
              </div>
            </div>

            {/* Letterbox Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Film size={13} className="text-orange-400" />
                <span className="text-[11px] text-zinc-200">2.39:1 Anamorphic Bars</span>
              </div>
              <button
                onClick={() => onUpdateSettings?.({ enableLetterbox: !settings.enableLetterbox })}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.enableLetterbox ? 'bg-orange-500' : 'bg-zinc-750'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.enableLetterbox ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Apply & Close Button */}
            <button
              onClick={() => {
                if (!isActive) onToggle(true);
                setShowConfigPopover(false);
              }}
              className="w-full mt-2 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Check size={14} />
              <span>{isActive ? 'Update Macro' : 'Activate 1-Tap Moto Preset'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoBloggerButton;
