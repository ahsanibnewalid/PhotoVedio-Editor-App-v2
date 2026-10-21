/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TransitionSelector.tsx
 * Interactive Video Transition component.
 * Allows users to preview, customize, and either:
 * 1. Drag and drop transitions directly onto MultiTrackTimeline clip segments/joints
 * 2. Apply via 1-tap to the currently selected timeline segment
 */

import React, { useState } from 'react';
import { 
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
  Move,
  Flame,
  Film
} from 'lucide-react';
import { TransitionType, ClipTransition, VideoClipSegment } from '../types/editor';

export interface TransitionDefinition {
  type: TransitionType;
  name: string;
  category: 'basic' | 'slide' | 'zoom' | 'action';
  description: string;
  badge: string;
  icon: React.ReactNode;
  previewClass: string;
}

export const TRANSITION_LIBRARY: TransitionDefinition[] = [
  {
    type: 'DISSOLVE',
    name: 'Cross Dissolve',
    category: 'basic',
    description: 'Smooth optical alpha crossfade between consecutive video frames.',
    badge: 'CLASSIC',
    icon: <Layers size={18} className="text-cyan-400" />,
    previewClass: 'animate-pulse'
  },
  {
    type: 'FADE_BLACK',
    name: 'Fade Through Black',
    category: 'basic',
    description: 'Cinematic dip to pitch black, ideal for scene or chapter changes.',
    badge: 'CINEMATIC',
    icon: <Film size={18} className="text-zinc-400" />,
    previewClass: 'bg-black'
  },
  {
    type: 'SLIDE_LEFT',
    name: 'Push Slide Left',
    category: 'slide',
    description: 'Dynamic horizontal wipe pushing the outgoing frame to the left.',
    badge: 'DYNAMIC',
    icon: <ArrowLeft size={18} className="text-blue-400" />,
    previewClass: 'hover:-translate-x-2'
  },
  {
    type: 'SLIDE_RIGHT',
    name: 'Push Slide Right',
    category: 'slide',
    description: 'High-speed directional wipe sweeping the incoming frame rightward.',
    badge: 'DYNAMIC',
    icon: <ArrowRight size={18} className="text-blue-400" />,
    previewClass: 'hover:translate-x-2'
  },
  {
    type: 'ZOOM_IN',
    name: 'Warp Zoom In',
    category: 'zoom',
    description: 'Impactful crash zoom punching forward into the subject.',
    badge: 'ACTION',
    icon: <Maximize2 size={18} className="text-amber-400" />,
    previewClass: 'hover:scale-110'
  },
  {
    type: 'ZOOM_OUT',
    name: 'Rapid Zoom Out',
    category: 'zoom',
    description: 'Snappy reverse zoom pulling back to reveal wide environment.',
    badge: 'ACTION',
    icon: <Minimize2 size={18} className="text-amber-400" />,
    previewClass: 'hover:scale-95'
  },
  {
    type: 'WHIP_PAN',
    name: 'Moto Whip Pan',
    category: 'action',
    description: 'Directional speed-blurred whip camera rotation for motorcycle vlog cuts.',
    badge: 'MOTO SPECIAL',
    icon: <Flame size={18} className="text-orange-500" />,
    previewClass: 'hover:skew-x-6'
  },
  {
    type: 'GLITCH',
    name: 'Digital Glitch',
    category: 'action',
    description: 'Cyberpunk RGB split with chromatic aberration and sync tears.',
    badge: 'FX WARP',
    icon: <Zap size={18} className="text-purple-400" />,
    previewClass: 'hover:skew-y-2'
  }
];

interface TransitionSelectorProps {
  selectedClip?: VideoClipSegment | null;
  onApplyTransition: (transition: ClipTransition, position: 'in' | 'out') => void;
  onRemoveTransition?: (clipId: string, position: 'in' | 'out') => void;
}

export const TransitionSelector: React.FC<TransitionSelectorProps> = ({
  selectedClip,
  onApplyTransition,
  onRemoveTransition
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<TransitionType>('DISSOLVE');
  const [duration, setDuration] = useState<number>(0.6); // seconds
  const [placement, setPlacement] = useState<'in' | 'out'>('in');
  const [draggedTransition, setDraggedTransition] = useState<TransitionType | null>(null);

  const filteredList = selectedCategory === 'all'
    ? TRANSITION_LIBRARY
    : TRANSITION_LIBRARY.filter(t => t.category === selectedCategory);

  const activeTransition = TRANSITION_LIBRARY.find(t => t.type === selectedType) || TRANSITION_LIBRARY[0];

  // Drag start handler for dropping onto timeline segments
  const handleDragStart = (e: React.DragEvent, type: TransitionType) => {
    setDraggedTransition(type);
    const payload = JSON.stringify({
      type,
      duration,
      placement
    });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleApplyClick = () => {
    if (!selectedClip) return;
    const transition: ClipTransition = {
      id: `trans-${Date.now()}`,
      type: selectedType,
      duration,
      targetClipId: selectedClip.id,
      curve: 'ease-in-out'
    };
    onApplyTransition(transition, placement);
  };

  const currentClipTransition = placement === 'in' 
    ? selectedClip?.transitionIn 
    : selectedClip?.transitionOut;

  return (
    <div className="w-full bg-[#121217] border border-zinc-800 rounded-2xl p-4 shadow-xl text-xs space-y-4 select-none">
      
      {/* Top Header & Selected Clip Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="font-black text-white text-xs block">Video Transitions Studio</span>
            <span className="text-[10px] text-zinc-400">
              Drag & Drop onto MultiTrack timeline cuts or click 1-Tap Apply
            </span>
          </div>
        </div>

        {/* Selected Clip Pill */}
        {selectedClip ? (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900 border border-cyan-500/30 text-[11px]">
            <span className="text-zinc-400">Target Clip:</span>
            <span className="font-bold text-cyan-400 truncate max-w-[120px]">{selectedClip.name}</span>
          </div>
        ) : (
          <div className="text-[10px] text-amber-400/90 font-medium bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
            Select a timeline segment or drag transition directly
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold pb-1 custom-scrollbar">
        {[
          { id: 'all', label: 'All Transitions' },
          { id: 'basic', label: 'Classic Dissolves' },
          { id: 'slide', label: 'Slides & Pushes' },
          { id: 'zoom', label: 'Dynamic Zooms' },
          { id: 'action', label: 'Moto & Action FX' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-zinc-950 font-black shadow-sm'
                : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-750'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Transition Cards (Draggable!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {filteredList.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => setSelectedType(item.type)}
              className={`group relative p-3 rounded-xl border flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-150 ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400/40 text-white shadow-md'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {/* Drag handle hint */}
              <div className="absolute top-2 right-2 text-zinc-500 group-hover:text-zinc-300">
                <Move size={12} />
              </div>

              {/* Icon & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center justify-center transition-transform group-hover:scale-105">
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-[11px] block leading-tight">{item.name}</span>
                  <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {item.badge}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2 mb-2">
                {item.description}
              </p>

              {/* Drag indicator chip */}
              <div className="w-full py-1 text-center text-[9px] font-mono rounded bg-zinc-950/60 text-zinc-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/50 transition">
                {isSelected ? '✓ Selected (Tap Apply)' : 'Drag to Clip'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transition Properties Controls: Placement, Duration, and 1-Tap Apply */}
      <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Placement Toggle: Transition In vs Transition Out */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium text-[11px]">Placement:</span>
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setPlacement('in')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                placement === 'in' 
                  ? 'bg-cyan-500 text-zinc-950' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Clip Start (In)
            </button>
            <button
              onClick={() => setPlacement('out')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                placement === 'out' 
                  ? 'bg-cyan-500 text-zinc-950' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Clip End (Out)
            </button>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-medium text-[11px]">Duration:</span>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-24 sm:w-32 accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-cyan-400 font-bold text-xs min-w-[36px]">
            {duration.toFixed(1)}s
          </span>
        </div>

        {/* Action Buttons: 1-Tap Apply & Remove */}
        <div className="flex items-center gap-2 ml-auto">
          {currentClipTransition && selectedClip && (
            <button
              onClick={() => onRemoveTransition?.(selectedClip.id, placement)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition"
              title="Remove transition from selected clip"
            >
              <Trash2 size={13} />
              <span>Remove</span>
            </button>
          )}

          <button
            onClick={handleApplyClick}
            disabled={!selectedClip}
            className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition ${
              selectedClip
                ? 'bg-gradient-to-r from-cyan-500 to-[#00f2fe] hover:from-cyan-400 hover:to-cyan-300 text-zinc-950 shadow-[0_0_14px_rgba(0,242,254,0.3)]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <Check size={14} className="stroke-[2.5]" />
            <span>Apply {activeTransition.name}</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default TransitionSelector;
