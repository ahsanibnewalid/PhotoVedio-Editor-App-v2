/**
 * CapCut Native Android Systems Architect & Workbench
 * 
 * Provides both:
 * 1. An interactive, live 60 FPS Video & Photo Editor simulator
 * 2. Full production-ready React Native 0.74+ Android source files, Gradle configs, and MediaCodec architecture
 */

import React, { useState } from 'react';
import { 
  Play, 
  Code2, 
  Cpu, 
  Film, 
  Download, 
  Sparkles, 
  Layers, 
  ExternalLink,
  BookOpen,
  Smartphone,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { NativeEditorSimulator } from './components/NativeEditorSimulator';
import { CodeInspector } from './components/CodeInspector';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { EditorScreen } from './screens/EditorScreen';

type TabType = 'editor' | 'simulator' | 'code' | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#00f2fe]/30 selection:text-[#00f2fe]">
      
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-[#00f2fe] flex items-center justify-center shadow-[0_0_18px_rgba(0,242,254,0.4)]">
              <Film size={20} className="text-zinc-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm lg:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>CapCut</span>
                  <span className="text-[#00f2fe]">Native Android</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                  Galaxy A15 5G
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                React Native JSI • Skia GPU Motion Blur • MediaCodec HW • Offline-First
              </p>
            </div>
          </div>

          {/* Navigation View Switcher Tabs */}
          <div className="flex items-center bg-[#121215] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'editor'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} className={activeTab === 'editor' ? 'text-cyan-400' : 'text-zinc-400'} />
              <span>Galaxy A15 Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'simulator'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play size={14} className={activeTab === 'simulator' ? 'text-cyan-400' : 'text-zinc-400'} />
              <span>Studio Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'code'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 size={14} className={activeTab === 'code' ? 'text-cyan-400' : 'text-zinc-400'} />
              <span>Source Code</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'architecture'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu size={14} className={activeTab === 'architecture' ? 'text-cyan-400' : 'text-zinc-400'} />
              <span>Blueprint</span>
            </button>
          </div>

          {/* Top Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition"
            >
              <Code2 size={13} className="text-cyan-400" />
              <span>Inspect All Files (11)</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN WORKBENCH CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Banner with Architectural highlights */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/20 via-zinc-900/40 to-transparent border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
            <span className="font-semibold text-zinc-300">
              Zero WebViews • 100% Android Native Rendering:
            </span>
            <span className="text-cyan-400 font-mono hidden sm:inline">
              Shopify Skia (SkSL) + ExoPlayer MediaCodec + Reanimated 3 UI Thread
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>minSdk 24</span>
            <span>•</span>
            <span>targetSdk 34 (Android 14)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">60.0 FPS Sync</span>
          </div>
        </div>

        {/* View Switching */}
        {activeTab === 'editor' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <EditorScreen onOpenCodeInspector={() => setActiveTab('code')} />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <NativeEditorSimulator onOpenCodeInspector={() => setActiveTab('code')} />
            
            {/* Quick architectural summary under simulator */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  GPU Shaders
                </span>
                <p className="text-xs text-zinc-300 font-semibold">
                  Shopify Skia SkSL Shaders
                </p>
                <p className="text-[11px] text-zinc-500">
                  Neon Glow, Sepia, and Grayscale compute on GPU fragment shaders.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Multi-Track Sync
                </span>
                <p className="text-xs text-zinc-300 font-semibold">
                  Worklets on UI Thread
                </p>
                <p className="text-[11px] text-zinc-500">
                  Reanimated 3 dispatches timeline scrubs with zero JS bridge lag.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Hardware Codec
                </span>
                <p className="text-xs text-zinc-300 font-semibold">
                  Android MediaCodec Surface
                </p>
                <p className="text-[11px] text-zinc-500">
                  Zero-copy decode & encode via hardware OMX/C2 codecs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Android 13+ Storage
                </span>
                <p className="text-xs text-zinc-300 font-semibold">
                  Scoped Storage & SAF
                </p>
                <p className="text-[11px] text-zinc-500">
                  Modern Photo Picker integration with zero storage permission prompts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">
                  React Native Android Deliverables
                </h2>
                <p className="text-xs text-zinc-400">
                  Production-ready source files optimized for 60 FPS hardware acceleration.
                </p>
              </div>
            </div>
            <CodeInspector />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <ArchitectureDiagram />
          </div>
        )}

      </main>

      {/* 3. FOOTER */}
      <footer className="mt-auto border-t border-zinc-800 bg-[#09090b] px-4 py-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CapCut Native Android Video Editor • React Native 0.74+ • Shopify Skia • MediaCodec HW</span>
          <span className="font-mono text-[11px] text-cyan-400/80">Deep Charcoal #09090b • Neon Cyan #00f2fe</span>
        </div>
      </footer>

    </div>
  );
}
