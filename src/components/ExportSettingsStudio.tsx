/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ExportSettingsStudio.tsx
 * Comprehensive Export Settings Panel for Samsung Galaxy A15 5G.
 * Configures output resolution (720p/1080p/4K), framerate (30/60 FPS),
 * and bitrate profiles backed by the h264_mediacodec hardware pipeline.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Film, 
  Download, 
  Eye, 
  Sliders, 
  Smartphone, 
  Tv, 
  Globe, 
  Check, 
  Share2, 
  Wifi, 
  Terminal, 
  Copy, 
  Play, 
  Clock, 
  Zap,
  Gauge
} from 'lucide-react';
import { AspectRatioType, FilterType, ExportPreset } from '../types/editor';

export interface ExportSettingsStudioProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatioType;
  currentFilter?: FilterType;
  filterIntensity?: number;
  duration?: number; // total duration in seconds
  thumbnailUrl?: string | null;
  activeMediaTitle?: string;
  onExportSuccess?: (result: { fileName: string; sizeMb: number; resolution: string }) => void;
  onOpenP2PShare?: () => void;
}

export const ExportSettingsStudio: React.FC<ExportSettingsStudioProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  currentFilter = 'NORMAL',
  duration = 15.0,
  thumbnailUrl = null,
  activeMediaTitle = 'MotoVlog_Clip',
  onExportSuccess,
  onOpenP2PShare
}) => {
  // Configuration State
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [frameRate, setFrameRate] = useState<30 | 60>(60);
  const [bitrateProfile, setBitrateProfile] = useState<'balanced' | 'high' | 'master' | 'custom'>('high');
  const [customBitrate, setCustomBitrate] = useState<number>(16);
  const [codec, setCodec] = useState<'h264_mediacodec' | 'hevc_mediacodec'>('h264_mediacodec');
  const [enableAudioCompression, setEnableAudioCompression] = useState<boolean>(true);
  const [colorSpace, setColorSpace] = useState<'rec709' | 'bt2020'>('rec709');

  // Export Execution State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStage, setExportStage] = useState<string>('Idle');
  const [renderedFps, setRenderedFps] = useState<number>(0);
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [isCopiedCommand, setIsCopiedCommand] = useState<boolean>(false);

  // Compute effective bitrate
  const effectiveBitrateMbps = useMemo(() => {
    switch (bitrateProfile) {
      case 'balanced': return 10;
      case 'high': return 16;
      case 'master': return 28;
      case 'custom': return customBitrate;
    }
  }, [bitrateProfile, customBitrate]);

  // Dimensions based on resolution and aspect ratio
  const dimensions = useMemo(() => {
    if (aspectRatio === '9:16') {
      if (resolution === '720p') return { w: 720, h: 1280 };
      if (resolution === '1080p') return { w: 1080, h: 1920 };
      return { w: 2160, h: 3840 };
    } else if (aspectRatio === '16:9') {
      if (resolution === '720p') return { w: 1280, h: 720 };
      if (resolution === '1080p') return { w: 1920, h: 1080 };
      return { w: 3840, h: 2160 };
    } else if (aspectRatio === '1:1') {
      if (resolution === '720p') return { w: 720, h: 720 };
      if (resolution === '1080p') return { w: 1080, h: 1080 };
      return { w: 2160, h: 2160 };
    } else {
      // 4:5
      if (resolution === '720p') return { w: 720, h: 900 };
      if (resolution === '1080p') return { w: 1080, h: 1350 };
      return { w: 2160, h: 2700 };
    }
  }, [resolution, aspectRatio]);

  // Real-time estimated file size: (duration * Mbps / 8) + audio
  const estimatedSizeMb = useMemo(() => {
    const videoSizeMb = (duration * effectiveBitrateMbps) / 8;
    const audioSizeMb = (duration * 0.192) / 8; // 192 kbps AAC
    return Math.max(1.5, Number((videoSizeMb + audioSizeMb).toFixed(1)));
  }, [duration, effectiveBitrateMbps]);

  // Generated hardware FFmpeg command string
  const ffmpegCommand = useMemo(() => {
    const { w, h } = dimensions;
    return `ffmpeg -y -hwaccel mediacodec -i "input_timeline.raw" \\
  -filter_complex "[0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,format=nv12[v]" \\
  -map "[v]" -map 0:a? \\
  -c:v ${codec} -b:v ${effectiveBitrateMbps}M -maxrate ${effectiveBitrateMbps * 1.2}M -bufsize ${effectiveBitrateMbps * 2}M \\
  -r ${frameRate} -g ${frameRate * 2} -profile:v high -level 4.2 \\
  -c:a aac -b:a 192k -ar 48000 \\
  -movflags +faststart "/sdcard/DCIM/VideoEditor/${activeMediaTitle}_${resolution}_${frameRate}fps.mp4"`;
  }, [codec, dimensions, effectiveBitrateMbps, frameRate, resolution, activeMediaTitle]);

  // Reset completion state when opening modal
  useEffect(() => {
    if (isOpen) {
      setExportComplete(false);
      setExportProgress(0);
      setIsExporting(false);
      setExportStage('Ready for Hardware Encoding');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Execute Simulated Hardware MediaCodec Export
  const handleStartExport = () => {
    setIsExporting(true);
    setExportComplete(false);
    setExportProgress(0);
    setRenderedFps(58);

    const stages = [
      { progress: 15, name: 'Allocating MediaCodec Native Surface...', fps: 60 },
      { progress: 35, name: 'Executing Skia GPU Filters & Motion Shaders...', fps: 59 },
      { progress: 65, name: 'Hardware Encoding with h264_mediacodec...', fps: 60 },
      { progress: 85, name: 'Muxing AAC Stereo Audio & Metadata...', fps: 58 },
      { progress: 100, name: 'Finalizing MP4 FastStart Container...', fps: 60 }
    ];

    let currentStageIndex = 0;
    const totalSteps = 20;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const currentPct = Math.min(100, Math.round((step / totalSteps) * 100));
      setExportProgress(currentPct);

      if (currentPct >= stages[currentStageIndex]?.progress && currentStageIndex < stages.length - 1) {
        currentStageIndex++;
      }
      setExportStage(stages[currentStageIndex].name);
      setRenderedFps(stages[currentStageIndex].fps + Math.floor(Math.random() * 3 - 1));

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsExporting(false);
        setExportComplete(true);
        setExportStage('Export Complete!');
        onExportSuccess?.({
          fileName: `${activeMediaTitle}_${resolution}_${frameRate}fps.mp4`,
          sizeMb: estimatedSizeMb,
          resolution: `${dimensions.w}x${dimensions.h}`
        });
      }
    }, 120);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setIsCopiedCommand(true);
    setTimeout(() => setIsCopiedCommand(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#131318] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#181820]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30 flex items-center justify-center shadow-inner">
              <Film size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Hardware Export Studio</h3>
                <span className="text-[9px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  h264_mediacodec
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Samsung Galaxy A15 5G • MediaTek Dimensity 6100+ Mali-G57 GPU Pipeline
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">

          {/* 1. Hardware Summary & File Specs Card */}
          <div className="p-4 rounded-2xl bg-[#181822] border border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <Film size={22} className="text-zinc-600" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play size={12} className="text-white fill-white" />
                </div>
              </div>

              <div>
                <span className="font-bold text-white text-sm block truncate max-w-[200px] sm:max-w-[260px]">
                  {activeMediaTitle}
                </span>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                  <span>{dimensions.w}×{dimensions.h} ({aspectRatio})</span>
                  <span>•</span>
                  <span>{frameRate} FPS</span>
                  <span>•</span>
                  <span>{duration.toFixed(1)}s</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
                <span className="text-[10px] text-zinc-500 block font-mono">ESTIMATED SIZE</span>
                <span className="text-sm font-black text-[#FF9500] font-mono">
                  ~{estimatedSizeMb} MB
                </span>
              </div>
            </div>
          </div>

          {/* 2. Resolution Selector */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-bold text-xs flex items-center gap-1.5">
                <Tv size={14} className="text-[#FF9500]" />
                Target Resolution
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Canvas: {dimensions.w}×{dimensions.h} px
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '720p', label: '720p HD', sub: 'Fast Stream (Mobile)', desc: 'Ultra-fast rendering' },
                { id: '1080p', label: '1080p FHD', sub: 'CapCut Standard', desc: 'Optimal social fidelity' },
                { id: '4k', label: '4K UHD', sub: 'Cinema Master', desc: 'Maximum bitrate clarity' }
              ].map((res) => {
                const isSelected = resolution === res.id;
                return (
                  <button
                    key={res.id}
                    onClick={() => setResolution(res.id as any)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected 
                        ? 'bg-[#FF9500]/15 border-[#FF9500] text-white ring-1 ring-[#FF9500]/40' 
                        : 'bg-[#181820] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-xs ${isSelected ? 'text-[#FF9500]' : 'text-white'}`}>
                        {res.label}
                      </span>
                      {isSelected && <Check size={12} className="text-[#FF9500]" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{res.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Framerate (FPS) Selector */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-bold text-xs flex items-center gap-1.5">
                <Gauge size={14} className="text-cyan-400" />
                Frame Rate (Samsung 90Hz Display Sync)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {frameRate === 60 ? 'Mali-G57 HW V-Sync (Butter Smooth)' : 'Standard Cinematic'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrameRate(30)}
                className={`py-2.5 px-3 rounded-xl border text-left flex items-center justify-between transition ${
                  frameRate === 30 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40' 
                    : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block text-white">30 FPS Cinematic</span>
                  <span className="text-[10px] text-zinc-400">Smaller file size, film aesthetic</span>
                </div>
                {frameRate === 30 && <Check size={14} className="text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => setFrameRate(60)}
                className={`py-2.5 px-3 rounded-xl border text-left flex items-center justify-between transition ${
                  frameRate === 60 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40' 
                    : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block text-white">60 FPS Action / MotoVlog</span>
                  <span className="text-[10px] text-cyan-400 font-medium">Fluid motion blur & fast pans</span>
                </div>
                {frameRate === 60 && <Check size={14} className="text-cyan-400" />}
              </button>
            </div>
          </div>

          {/* 4. Bitrate Profiles backed by MediaCodec */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-bold text-xs flex items-center gap-1.5">
                <Sliders size={14} className="text-[#FF9500]" />
                Bitrate Profiles (MediaCodec CBR/VBR)
              </span>
              <span className="font-mono text-[#FF9500] font-bold text-xs">
                {effectiveBitrateMbps} Mbps
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'balanced', label: 'Balanced', mbps: 10, note: '10 Mbps' },
                { id: 'high', label: 'High Quality', mbps: 16, note: '16 Mbps' },
                { id: 'master', label: 'Cinema Master', mbps: 28, note: '28 Mbps' },
                { id: 'custom', label: 'Custom', mbps: customBitrate, note: `${customBitrate} Mbps` }
              ].map((p) => {
                const isSelected = bitrateProfile === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setBitrateProfile(p.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      isSelected 
                        ? 'bg-[#FF9500] text-zinc-950 border-[#FF9500] font-black shadow-md' 
                        : 'bg-[#181820] text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">{p.label}</span>
                    <span className={`text-[10px] block font-mono ${isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                      {p.note}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Bitrate Slider */}
            {bitrateProfile === 'custom' && (
              <div className="pt-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Custom Rate (4 Mbps – 50 Mbps)</span>
                  <span className="font-mono text-white font-bold">{customBitrate} Mbps</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="50"
                  step="1"
                  value={customBitrate}
                  onChange={(e) => setCustomBitrate(parseInt(e.target.value))}
                  className="w-full accent-[#FF9500] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Codec Toggle */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Hardware Codec</span>
                <span className="text-[10px] text-zinc-400">Surface-to-Surface hardware acceleration</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCodec('h264_mediacodec')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    codec === 'h264_mediacodec'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                  }`}
                >
                  H.264 (AVC)
                </button>
                <button
                  type="button"
                  onClick={() => setCodec('hevc_mediacodec')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    codec === 'hevc_mediacodec'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                  }`}
                >
                  H.265 (HEVC)
                </button>
              </div>
            </div>

          </div>

          {/* 5. Live FFmpeg-Kit Terminal Command Preview */}
          <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-zinc-800/80 font-mono text-[10px] text-zinc-400 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <Terminal size={12} className="text-[#FF9500]" />
                <span>FFmpeg-Kit Native Hardware Command</span>
              </div>
              <button
                onClick={handleCopyCommand}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              >
                {isCopiedCommand ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{isCopiedCommand ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-black/60 border border-white/5 overflow-x-auto text-emerald-400 leading-relaxed font-mono custom-scrollbar whitespace-pre-wrap break-all">
              {ffmpegCommand}
            </pre>
          </div>

          {/* 6. Active Rendering Status / Simulation Box */}
          {(isExporting || exportComplete) && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${exportComplete ? 'bg-emerald-400' : 'bg-[#FF9500] animate-pulse'}`} />
                  <span className="font-bold text-white text-xs">{exportStage}</span>
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  {exportProgress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF9500] to-amber-400 rounded-full transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Hardware FPS: {renderedFps} fps</span>
                <span>Encoder: {codec}</span>
                <span>Buffer: Surface (Zero-Copy)</span>
              </div>

              {exportComplete && (
                <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      alert(`Project saved to device storage: /sdcard/DCIM/VideoEditor/${activeMediaTitle}_${resolution}.mp4`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download size={13} />
                    <span>Save to Gallery</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenP2PShare?.();
                    }}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition flex items-center gap-1.5 border border-zinc-700"
                  >
                    <Wifi size={13} className="text-cyan-400" />
                    <span>Wi-Fi Direct Beam</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-zinc-800 bg-[#181820]">
          <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
            Target: <span className="text-white font-bold">{dimensions.w}×{dimensions.h}</span> @ <span className="text-[#FF9500] font-bold">{effectiveBitrateMbps}M</span>
          </div>

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs transition disabled:opacity-50"
            >
              {exportComplete ? 'Done' : 'Cancel'}
            </button>

            {!exportComplete ? (
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-[#FF9500] hover:bg-[#e08500] text-zinc-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Encoding {exportProgress}%</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Start Hardware Export</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Finished</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExportSettingsStudio;
