/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TemplatePickerModalUI.tsx
 * Modal for browsing and instantly applying trending video templates with 1-tap:
 * auto-configures Skia GPU filters, MotoVlog motion blur macros, 2.39:1 letterbox,
 * and multi-track audio sync.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Play, 
  Check, 
  Film, 
  Music, 
  Gauge, 
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_TEMPLATES, EditorTemplate } from '../data/sampleTemplates';

interface TemplatePickerModalUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: EditorTemplate) => void;
  currentTemplateId?: string;
}

export const TemplatePickerModalUI: React.FC<TemplatePickerModalUIProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<EditorTemplate | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? SAMPLE_TEMPLATES
    : SAMPLE_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#121217] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#16161c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Sparkles size={20} className="text-zinc-950 font-black" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Trending Editor Templates</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  1-Tap Auto Setup
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Pre-configured Skia shaders, MotoVlog blur, speed ramps, and audio beat sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/50 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Presets' },
            { id: 'motovlog', label: '🏍️ MotoVlog & Action' },
            { id: 'cinematic', label: '🎬 Cinematic 3D LUT' },
            { id: 'action', label: '⚡ Fast Cuts & Speed Ramp' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
          {filteredTemplates.map((template) => {
            const isApplied = currentTemplateId === template.id;

            return (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredTemplate(template)}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isApplied
                    ? 'border-orange-500 bg-orange-950/20 ring-2 ring-orange-500/50'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
              >
                {/* Thumbnail image with badges */}
                <div className="relative h-40 overflow-hidden bg-zinc-950">
                  <img
                    src={template.thumbnailUrl}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-zinc-950/80 text-orange-400 border border-orange-500/40 backdrop-blur-md">
                      {template.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-300 bg-zinc-950/80 border border-zinc-700 backdrop-blur-md">
                      {template.aspectRatio}
                    </span>
                  </div>

                  {/* MotoBlur indicator */}
                  {template.motoBlurEnabled && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-zinc-950 shadow-md">
                      <Gauge size={12} />
                      <span>Skia Blur</span>
                    </div>
                  )}

                  {/* Bottom title inside thumbnail */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h3 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                      {template.title}
                    </h3>
                  </div>
                </div>

                {/* Content description */}
                <div className="p-3.5 flex flex-col gap-2.5 flex-1 justify-between text-xs">
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <Music size={12} className="text-orange-400" />
                      <span>{template.musicTitle}</span>
                    </div>
                    <span className="font-mono text-cyan-400">{template.cutsCount} Cut Beats</span>
                  </div>

                  {/* Action Apply Button */}
                  <button
                    className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                      isApplied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-zinc-800 group-hover:bg-orange-500 group-hover:text-zinc-950 text-zinc-200'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check size={14} />
                        <span>Currently Active</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Template</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TemplatePickerModalUI;
