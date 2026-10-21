/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ExpandableToolboxDrawer.tsx
 * CapCut-inspired Tier-2 Expandable Toolbox Drawer / Bottom Sheet.
 * Ensures zero features stay hidden as the editor toolset expands.
 * Features categorized grid access to all advanced video, audio, AI, and hardware features.
 */

import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Scissors, 
  Gauge, 
  Music, 
  Type, 
  Film, 
  Layers, 
  Zap, 
  Wind, 
  Sliders, 
  Tv, 
  HardDrive, 
  Download, 
  Radio, 
  Database, 
  ScanFace, 
  Minimize2, 
  Maximize2,
  Check,
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';

export interface ToolboxActionItem {
  id: string;
  name: string;
  category: 'edit' | 'audio' | 'ai' | 'fx' | 'hardware' | 'cloud';
  categoryLabel: string;
  icon: React.ReactNode;
  badge?: string;
  description: string;
  actionTab?: 'filter' | 'text' | 'speed' | 'cutout' | 'transition' | 'audio' | 'aspect';
  onTrigger?: () => void;
}

interface ExpandableToolboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolTab: 'filter' | 'text' | 'speed' | 'cutout' | 'transition' | 'audio' | 'aspect') => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenP2P: () => void;
  onOpenAuth: () => void;
  onOpenTransitionLibrary?: () => void;
  onOpenProxyGenerator?: () => void;
  isProxyActive?: boolean;
  onToggleMotoMacro: () => void;
  isMotoMacroActive: boolean;
  windReductionActive: boolean;
  onToggleWindReduction: () => void;
  anamorphicLetterboxActive: boolean;
  onToggleLetterbox: () => void;
}

export const ExpandableToolboxDrawer: React.FC<ExpandableToolboxDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onOpenTemplates,
  onOpenExport,
  onOpenP2P,
  onOpenAuth,
  onOpenTransitionLibrary,
  onOpenProxyGenerator,
  isProxyActive = true,
  onToggleMotoMacro,
  isMotoMacroActive,
  windReductionActive,
  onToggleWindReduction,
  anamorphicLetterboxActive,
  onToggleLetterbox
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const tools: ToolboxActionItem[] = [
    // Editing & Motion
    {
      id: 'tool-split',
      name: 'Split & Trim',
      category: 'edit',
      categoryLabel: 'Edit & Timing',
      icon: <Scissors size={18} className="text-[#FF9500]" />,
      badge: 'CORE',
      description: 'Split video segments at playhead with millisecond precision.'
    },
    {
      id: 'tool-speed',
      name: 'Speed Curve Ramping',
      category: 'edit',
      categoryLabel: 'Edit & Timing',
      icon: <Gauge size={18} className="text-[#FF9500]" />,
      badge: '0.2x - 10x',
      description: 'Dynamic Bezier curves for slow-motion trick shots and speed ramps.',
      actionTab: 'speed'
    },
    {
      id: 'tool-transitions',
      name: 'GPU Transitions Library',
      category: 'edit',
      categoryLabel: 'Edit & Timing',
      icon: <Sparkles size={18} className="text-cyan-400" />,
      badge: 'SKIA GPU',
      description: 'Dissolve, Slide, Zoom, Moto Whip Pan, and Glitch transition cards.',
      actionTab: 'transition',
      onTrigger: onOpenTransitionLibrary
    },

    // Audio & MotoVlog
    {
      id: 'tool-wind-reduction',
      name: 'Wind Noise Reduction',
      category: 'audio',
      categoryLabel: 'Audio & Acoustics',
      icon: <Wind size={18} className={windReductionActive ? 'text-[#FF9500]' : 'text-emerald-400'} />,
      badge: windReductionActive ? 'ON' : 'OFFLINE AI',
      description: 'High-pass DSP filter stripping motorcycle exhaust and wind turbulence.',
      actionTab: 'audio'
    },
    {
      id: 'tool-audio-waveform',
      name: 'Audio Mixer & Beats',
      category: 'audio',
      categoryLabel: 'Audio & Acoustics',
      icon: <Music size={18} className="text-emerald-400" />,
      badge: '48 kHz',
      description: 'Waveform scrub, volume keyframes, and beat-drop alignment.',
      actionTab: 'audio'
    },

    // AI & Compositing
    {
      id: 'tool-ai-cutout',
      name: 'ML Kit AI Cutout',
      category: 'ai',
      categoryLabel: 'AI & Depth',
      icon: <ScanFace size={18} className="text-pink-400" />,
      badge: '100% NPU',
      description: 'Zero-latency on-device subject segmentation and background isolation.',
      actionTab: 'cutout'
    },
    {
      id: 'tool-text-behind',
      name: 'Text-Behind-Subject',
      category: 'ai',
      categoryLabel: 'AI & Depth',
      icon: <Type size={18} className="text-purple-400" />,
      badge: 'DEPTH 3D',
      description: 'Layer kinetic typography behind foreground subjects with depth buffer.',
      actionTab: 'text'
    },

    // Shaders & Color Grading
    {
      id: 'tool-skia-shaders',
      name: 'Skia GPU Shaders & LUTs',
      category: 'fx',
      categoryLabel: 'Shaders & FX',
      icon: <Film size={18} className="text-cyan-400" />,
      badge: 'SkSL 60FPS',
      description: 'GPU fragment shaders: Neon Glow, Teal & Orange, Sepia, and Film Grain.',
      actionTab: 'filter'
    },
    {
      id: 'tool-motovlog-macro',
      name: 'MotoVlog 1-Tap Macro',
      category: 'fx',
      categoryLabel: 'Shaders & FX',
      icon: <Flame size={18} className="text-[#FF9500]" />,
      badge: isMotoMacroActive ? 'ACTIVE' : 'HOT',
      description: 'Directional motion blur, high-contrast action LUT, and 2.39:1 letterbox.',
      onTrigger: onToggleMotoMacro
    },
    {
      id: 'tool-letterbox',
      name: '2.39:1 Anamorphic Bars',
      category: 'fx',
      categoryLabel: 'Shaders & FX',
      icon: <Tv size={18} className="text-amber-400" />,
      badge: anamorphicLetterboxActive ? 'ENABLED' : 'CINEMA',
      description: 'Top and bottom anamorphic cinema black bars with blue lens streak.',
      onTrigger: onToggleLetterbox
    },

    // Hardware & Device
    {
      id: 'tool-proxy-generator',
      name: 'Auto-Proxy Media Generator',
      category: 'hardware',
      categoryLabel: 'Device & Export',
      icon: <Zap size={18} className="text-[#FF9500]" />,
      badge: isProxyActive ? '720P PROXY' : '4K RAW',
      description: 'Toggle 720p intra-GOP proxy cache vs 4K master for 60 FPS stutter-free timeline scrub.',
      onTrigger: onOpenProxyGenerator
    },
    {
      id: 'tool-export-studio',
      name: 'Hardware Export Studio',
      category: 'hardware',
      categoryLabel: 'Device & Export',
      icon: <Download size={18} className="text-[#FF9500]" />,
      badge: 'MediaCodec',
      description: 'ExoPlayer and FFmpeg hardware acceleration (-c:v h264_mediacodec).',
      onTrigger: onOpenExport
    },
    {
      id: 'tool-p2p-beam',
      name: 'Wi-Fi Direct P2P Beam',
      category: 'hardware',
      categoryLabel: 'Device & Export',
      icon: <Radio size={18} className="text-cyan-400" />,
      badge: 'ZERO DATA',
      description: 'Direct high-speed peer-to-peer sharing between Galaxy devices.',
      onTrigger: onOpenP2P
    },

    // Cloud & Templates
    {
      id: 'tool-templates',
      name: 'Trending Templates',
      category: 'cloud',
      categoryLabel: 'Templates & Sync',
      icon: <Sparkles size={18} className="text-amber-400" />,
      badge: '1-TAP',
      description: 'Pre-synced beat markers, motion blur presets, and text animations.',
      onTrigger: onOpenTemplates
    },
    {
      id: 'tool-supabase-sync',
      name: 'Supabase Offline Sync',
      category: 'cloud',
      categoryLabel: 'Templates & Sync',
      icon: <Database size={18} className="text-emerald-400" />,
      badge: 'OFFLINE-FIRST',
      description: 'Local SQLite/MMKV persistence with automated cloud project backup.',
      onTrigger: onOpenAuth
    }
  ];

  // Filtering
  const filteredTools = tools.filter((tool) => {
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleToolClick = (tool: ToolboxActionItem) => {
    if (tool.onTrigger) {
      tool.onTrigger();
      onClose();
      return;
    }
    if (tool.actionTab) {
      onSelectTool(tool.actionTab);
      onClose();
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Drawer Container (CapCut Matte Dark Surface #18181C) */}
      <div 
        className="w-full max-w-2xl bg-[#141418] border border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Grab Handle for Touch Bottom Sheet */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-700/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#1a1a20]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,149,0,0.3)]">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>CapCut Studio Toolbox</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Tier-2 Actions
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">All tools accessible with zero clipped features</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="px-5 py-3 border-b border-zinc-800/80 bg-[#16161c] space-y-2.5">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search all video editor tools, shaders, AI features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-750 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF9500] transition"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'edit', label: '✂️ Edit & Speed' },
              { id: 'audio', label: '🎙️ Audio & Wind' },
              { id: 'ai', label: '🧠 AI & Cutouts' },
              { id: 'fx', label: '⚡ Shaders & LUTs' },
              { id: 'hardware', label: '📱 Device HW' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-[#FF9500] text-zinc-950 font-black shadow-md'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-750'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid (Zero Hidden Features) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 custom-scrollbar bg-[#111115]">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group p-3.5 rounded-2xl bg-[#18181f] hover:bg-[#20202a] border border-zinc-800/80 hover:border-[#FF9500]/50 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {tool.icon}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white group-hover:text-[#FF9500] transition-colors truncate">
                      {tool.name}
                    </span>
                    {tool.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="text-zinc-500 group-hover:text-white shrink-0">
                <ChevronRight size={15} />
              </div>
            </div>
          ))}

          {filteredTools.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
              No editing tools found matching "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#16161c] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>CapCut Architecture • 14 Features Modularized</span>
          <span className="text-emerald-400 font-bold">Zero Feature Clipping</span>
        </div>

      </div>
    </div>
  );
};

export default ExpandableToolboxDrawer;
