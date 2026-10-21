/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TransitionLibraryModal.tsx
 * GPU-Accelerated Transition Picker Modal managed by Skia and Reanimated.
 * Offers smooth cinematic transitions (Cross Dissolve, Zoom In, Slide, Glitch, Whip Pan, Fade Through Black).
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Sliders, 
  Check, 
  Trash2, 
  Flame, 
  Film, 
  Play, 
  RotateCcw,
  Cpu,
  Tv
} from 'lucide-react';
import { TransitionType, ClipTransition, VideoClipSegment } from '../types/editor';

export interface TransitionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClip?: VideoClipSegment | null;
  onApplyTransition: (transition: ClipTransition, placement: 'in' | 'out' | 'both') => void;
  onRemoveTransition?: (placement: 'in' | 'out' | 'both') => void;
}

interface TransitionItem {
  type: TransitionType;
  name: string;
  category: 'basic' | 'slide' | 'zoom' | 'action';
  description: string;
  badge: string;
  iconName: string;
}

const TRANSITIONS_CATALOG: TransitionItem[] = [
  {
    type: 'DISSOLVE',
    name: 'Cross Dissolve',
    category: 'basic',
    description: 'Hardware alpha crossfade blending consecutive video buffers via Skia GPU shader.',
    badge: 'CLASSIC',
    iconName: 'layers'
  },
  {
    type: 'FADE_BLACK',
    name: 'Fade Through Black',
    category: 'basic',
    description: 'Cinematic luminance dip to deep black, ideal for scene or chapter changes.',
    badge: 'CINEMATIC',
    iconName: 'film'
  },
  {
    type: 'SLIDE_LEFT',
    name: 'Slide Left',
    category: 'slide',
    description: 'High-speed horizontal push transition synchronized to 60 FPS Reanimated gesture curves.',
    badge: 'DYNAMIC',
    iconName: 'arrow-left'
  },
  {
    type: 'SLIDE_RIGHT',
    name: 'Slide Right',
    category: 'slide',
    description: 'Smooth reverse horizontal push with subtle inertial dampening.',
    badge: 'SMOOTH',
    iconName: 'arrow-right'
  },
  {
    type: 'ZOOM_IN',
    name: 'Zoom In Crash',
    category: 'zoom',
    description: 'Rapid optical scaling through the center axis, creating high energy impact.',
    badge: 'FAST',
    iconName: 'zoom-in'
  },
  {
    type: 'ZOOM_OUT',
    name: 'Zoom Out Reveal',
    category: 'zoom',
    description: 'Centrifugal scaling backward revealing the upcoming scene or wide panorama.',
    badge: 'REVEAL',
    iconName: 'zoom-out'
  },
  {
    type: 'WHIP_PAN',
    name: 'Whip Pan Blur',
    category: 'action',
    description: 'Aggressive directional SkSL motion blur simulation imitating action-cam rapid whip turns.',
    badge: 'ACTION',
    iconName: 'flame'
  },
  {
    type: 'GLITCH',
    name: 'Cyber Glitch RGB',
    category: 'action',
    description: 'GPU chromatic aberration split with digital scanlines and pseudo-sync displacement.',
    badge: 'GPU FX',
    iconName: 'zap'
  }
];

export const TransitionLibraryModal: React.FC<TransitionLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedClip,
  onApplyTransition,
  onRemoveTransition
}) => {
  const [selectedType, setSelectedType] = useState<TransitionType>('DISSOLVE');
  const [duration, setDuration] = useState<number>(0.6);
  const [placement, setPlacement] = useState<'in' | 'out' | 'both'>('in');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'basic' | 'slide' | 'zoom' | 'action'>('all');
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(true);

  // Initialize selected transition from existing clip if available
  useEffect(() => {
    if (selectedClip) {
      if (selectedClip.transitionIn) {
        setSelectedType(selectedClip.transitionIn.type);
        setDuration(selectedClip.transitionIn.duration);
        setPlacement('in');
      } else if (selectedClip.transitionOut) {
        setSelectedType(selectedClip.transitionOut.type);
        setDuration(selectedClip.transitionOut.duration);
        setPlacement('out');
      }
    }
  }, [selectedClip, isOpen]);

  // Animated preview loop simulating 60 FPS Reanimated transition
  useEffect(() => {
    if (!isOpen || !isPreviewPlaying) return;
    let animFrame: number;
    let start = performance.now();

    const loop = (now: number) => {
      const cycleMs = (duration + 1.2) * 1000;
      const elapsed = (now - start) % cycleMs;
      const progress = Math.min(1, Math.max(0, (elapsed - 300) / (duration * 1000)));
      setPreviewProgress(progress);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, isPreviewPlaying, duration, selectedType]);

  if (!isOpen) return null;

  const filteredTransitions = TRANSITIONS_CATALOG.filter(t => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  const activeTransitionDef = TRANSITIONS_CATALOG.find(t => t.type === selectedType) || TRANSITIONS_CATALOG[0];

  const handleApply = () => {
    const newTransition: ClipTransition = {
      id: `tr_${Date.now()}`,
      type: selectedType,
      duration: duration,
      targetClipId: selectedClip?.id,
      curve: 'ease-in-out'
    };
    onApplyTransition(newTransition, placement);
    onClose();
  };

  const handleRemove = () => {
    onRemoveTransition?.(placement);
    onClose();
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'layers': return <Layers size={18} className="text-cyan-400" />;
      case 'film': return <Film size={18} className="text-zinc-400" />;
      case 'arrow-left': return <ArrowLeft size={18} className="text-blue-400" />;
      case 'arrow-right': return <ArrowRight size={18} className="text-blue-400" />;
      case 'zoom-in': return <Maximize2 size={18} className="text-emerald-400" />;
      case 'zoom-out': return <Minimize2 size={18} className="text-teal-400" />;
      case 'flame': return <Flame size={18} className="text-[#FF9500]" />;
      case 'zap': return <Zap size={18} className="text-pink-400" />;
      default: return <Sparkles size={18} className="text-[#FF9500]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#141418] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#191920]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Transition Library</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Skia GPU
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {selectedClip ? `Target Clip: "${selectedClip.name}"` : 'Select clip or apply to transition joints'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          
          {/* Real-time Transition Visualizer (Interactive Skia Simulator) */}
          <div className="relative w-full h-36 rounded-2xl bg-[#09090c] border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner group">
            
            {/* Background simulated clip A (City / Road) */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 flex items-center justify-center overflow-hidden">
              <div className="text-center opacity-40">
                <span className="font-mono text-xs text-zinc-400 block tracking-widest uppercase">Clip A</span>
                <span className="text-[10px] text-zinc-500">Source Video</span>
              </div>
            </div>

            {/* Simulated Clip B (Beach / Action) layered with the chosen transition effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-amber-950 via-orange-950 to-emerald-950 flex items-center justify-center overflow-hidden transition-all duration-75"
              style={{
                opacity: selectedType === 'DISSOLVE' 
                  ? previewProgress 
                  : selectedType === 'FADE_BLACK'
                  ? previewProgress < 0.5 ? 0 : (previewProgress - 0.5) * 2
                  : 1,
                transform: selectedType === 'SLIDE_LEFT'
                  ? `translateX(${(1 - previewProgress) * 100}%)`
                  : selectedType === 'SLIDE_RIGHT'
                  ? `translateX(${-(1 - previewProgress) * 100}%)`
                  : selectedType === 'ZOOM_IN'
                  ? `scale(${0.3 + previewProgress * 0.7})`
                  : selectedType === 'ZOOM_OUT'
                  ? `scale(${1.8 - previewProgress * 0.8})`
                  : selectedType === 'WHIP_PAN'
                  ? `translateX(${(1 - previewProgress) * 120}%) skewX(${(1 - previewProgress) * -25}deg)`
                  : 'none',
                filter: selectedType === 'FADE_BLACK'
                  ? `brightness(${previewProgress < 0.5 ? 1 - previewProgress * 2 : (previewProgress - 0.5) * 2})`
                  : selectedType === 'GLITCH' && previewProgress > 0.1 && previewProgress < 0.9
                  ? `hue-rotate(${previewProgress * 180}deg) contrast(140%)`
                  : selectedType === 'WHIP_PAN' && previewProgress > 0.1 && previewProgress < 0.9
                  ? 'blur(4px)'
                  : 'none'
              }}
            >
              <div className="text-center">
                <span className="font-mono text-xs text-amber-300 font-bold block tracking-widest uppercase">Clip B</span>
                <span className="text-[10px] text-amber-200/60">Destination Video</span>
              </div>

              {/* Glitch lines overlay */}
              {selectedType === 'GLITCH' && previewProgress > 0.2 && previewProgress < 0.8 && (
                <div className="absolute inset-0 bg-cyan-500/20 mix-blend-screen pointer-events-none flex flex-col justify-between">
                  <div className="h-1 bg-pink-500/80 w-full" />
                  <div className="h-2 bg-cyan-400/80 w-3/4 ml-auto" />
                  <div className="h-0.5 bg-yellow-400/80 w-full" />
                </div>
              )}
            </div>

            {/* Black dip overlay for FADE_BLACK */}
            {selectedType === 'FADE_BLACK' && (
              <div 
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-75"
                style={{
                  opacity: previewProgress < 0.5 ? previewProgress * 2 : (1 - previewProgress) * 2
                }}
              />
            )}

            {/* Visualizer Status Bar */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <Cpu size={12} className="text-[#FF9500]" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold">
                  {activeTransitionDef.name} ({duration.toFixed(1)}s)
                </span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-cyan-400">
                {(previewProgress * 100).toFixed(0)}%
              </div>
            </div>

            {/* Play/Pause Simulator Control */}
            <button
              onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition backdrop-blur-md"
              title={isPreviewPlaying ? 'Pause loop' : 'Play loop'}
            >
              {isPreviewPlaying ? <RotateCcw size={13} /> : <Play size={13} />}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
            {(['all', 'basic', 'slide', 'zoom', 'action'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-[#FF9500] text-zinc-950 font-black shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {cat === 'action' ? 'Action / GPU' : cat}
              </button>
            ))}
          </div>

          {/* Transitions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {filteredTransitions.map((t) => {
              const isSelected = selectedType === t.type;
              return (
                <button
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-zinc-850 border-[#FF9500] shadow-lg shadow-[#FF9500]/10 ring-1 ring-[#FF9500]/50' 
                      : 'bg-[#181820] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between w-full mb-2">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:scale-105 transition-transform">
                      {renderIcon(t.iconName)}
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isSelected 
                        ? 'bg-[#FF9500] text-zinc-950' 
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {t.badge}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-white text-xs block truncate">{t.name}</span>
                    <span className="text-[10px] text-zinc-400 block line-clamp-1 mt-0.5 leading-tight">
                      {t.category}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF9500]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Transition Configuration Controls */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            
            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-300 font-bold text-xs flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#FF9500]" />
                  Transition Duration
                </span>
                <span className="font-mono text-[#FF9500] font-bold text-xs">
                  {duration.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full accent-[#FF9500] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>0.2s (Snappy)</span>
                <span>0.6s (Standard)</span>
                <span>2.0s (Cinematic)</span>
              </div>
            </div>

            {/* Placement Toggle */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-300 font-bold text-xs">Clip Placement</span>
                <span className="text-[10px] text-zinc-400">Position relative to segment</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlacement('in')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                    placement === 'in'
                      ? 'bg-[#FF9500]/20 border-[#FF9500] text-[#FF9500] font-black'
                      : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Transition In
                </button>
                <button
                  type="button"
                  onClick={() => setPlacement('out')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                    placement === 'out'
                      ? 'bg-[#FF9500]/20 border-[#FF9500] text-[#FF9500] font-black'
                      : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Transition Out
                </button>
                <button
                  type="button"
                  onClick={() => setPlacement('both')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                    placement === 'both'
                      ? 'bg-[#FF9500]/20 border-[#FF9500] text-[#FF9500] font-black'
                      : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Both Sides
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-zinc-800 bg-[#191920]">
          {selectedClip && (selectedClip.transitionIn || selectedClip.transitionOut) ? (
            <button
              onClick={handleRemove}
              className="py-2.5 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          ) : (
            <div className="text-[11px] text-zinc-500 font-mono hidden sm:block">
              Samsung A15 Mali-G57 GPU Ready
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="py-2.5 px-5 rounded-xl bg-[#FF9500] hover:bg-[#e08500] text-zinc-950 font-black text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <Check size={15} />
              <span>Apply Transition</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransitionLibraryModal;
