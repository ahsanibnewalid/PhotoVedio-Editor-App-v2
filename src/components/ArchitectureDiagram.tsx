import React from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  ShieldCheck, 
  HardDrive, 
  Terminal, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* 1. PIPELINE OVERVIEW HERO */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-[#0c0c0e] border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={20} className="text-cyan-400" />
          <h3 className="text-base font-extrabold text-white tracking-wide">
            Zero-Copy Android Hardware Acceleration Architecture
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
          Unlike standard hybrid video editors that suffer from slow JS bridge serialization and CPU memory copying,
          this architecture maintains a <strong>100% native pipeline</strong>. Video frames decode directly into an OpenGL ES
          <code className="text-cyan-400 mx-1">GL_TEXTURE_EXTERNAL_OES</code> texture, apply GPU Skia shaders, and stream into
          <code className="text-cyan-400 mx-1">MediaCodec</code> hardware encoder via native EGLSurfaces.
        </p>

        {/* Visual Pipeline Flowchart */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2">
              <HardDrive size={16} />
            </div>
            <span className="text-[11px] font-bold text-white">Media Asset</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">MP4 / SAF / Scoped</span>
          </div>

          <div className="hidden md:flex justify-center text-zinc-600">
            <ArrowRight size={18} className="text-cyan-400 animate-pulse" />
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2">
              <Cpu size={16} />
            </div>
            <span className="text-[11px] font-bold text-white">MediaCodec Decoder</span>
            <span className="text-[10px] text-cyan-400 font-mono mt-0.5">SurfaceTexture OES</span>
          </div>

          <div className="hidden md:flex justify-center text-zinc-600">
            <ArrowRight size={18} className="text-cyan-400 animate-pulse" />
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,254,0.1)] flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
              <Flame size={16} />
            </div>
            <span className="text-[11px] font-bold text-cyan-300">Skia GPU & ML Kit</span>
            <span className="text-[10px] text-cyan-400 font-mono mt-0.5">3D LUTs + NPU Cutout</span>
          </div>

          <div className="hidden md:flex justify-center text-zinc-600">
            <ArrowRight size={18} className="text-cyan-400 animate-pulse" />
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2">
              <Layers size={16} />
            </div>
            <span className="text-[11px] font-bold text-white">4-Track Timeline</span>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5">Reanimated 3 (60 FPS)</span>
          </div>

          <div className="hidden md:flex justify-center text-zinc-600">
            <ArrowRight size={18} className="text-cyan-400 animate-pulse" />
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-2">
              <Zap size={16} />
            </div>
            <span className="text-[11px] font-bold text-white">FFmpeg MediaCodec</span>
            <span className="text-[10px] text-purple-400 font-mono mt-0.5">-c:v h264_mediacodec</span>
          </div>

        </div>
      </div>

      {/* 2. CORE ARCHITECTURAL PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1 */}
        <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cpu size={16} />
            </div>
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              1. Skia GPU & 3D LUTs
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-zinc-400 leading-normal">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 shrink-0" />
              <span>Uses Android <code>SurfaceView</code> and <code>useTextureView=true</code> to avoid bitmap allocations.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 shrink-0" />
              <span>Compiles SkSL fragment shaders for Teal & Orange 3D LUTs, film grain, and neon blooms.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 shrink-0" />
              <span>One-tap Auto Cinematic Grade with optical vignette and 2.39:1 anamorphic bars.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap size={16} />
            </div>
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              2. On-Device AI Segmentation
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-zinc-400 leading-normal">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <span>100% offline Google ML Kit Subject Segmentation running on device NPU/GPU.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <span>Layer sandwiching: allows text overlay placement <em>behind</em> the segmented subject.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <span>Custom depth-of-field background blur layer behind isolated human subjects.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              3. FFmpeg MediaCodec Export
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-zinc-400 leading-normal">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>Executes <code>-c:v h264_mediacodec</code> with zero RAM frame copies at 18-35 Mbps.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>Presets for Instagram Reels (1080p 60fps), YouTube Long-form, and 4K masters.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>Android 13+ Scoped Storage compliance writing directly to Movies directory.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
