import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  BookmarkPlus,
  BookmarkCheck,
  Smartphone,
  Tv,
  Globe,
  Check
} from 'lucide-react';
import { FilterType, AspectRatioType, TextOverlayItem, ExportPreset } from '../types/editor';
import { SkiaShaderRenderer } from './SkiaShaderRenderer';

interface ExportStudioModalUIProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatioType;
  currentFilter: FilterType;
  filterIntensity: number;
  duration: number;
  thumbnailUrl: string | null;
  textOverlays: TextOverlayItem[];
  activeMediaTitle: string;
}

const DEFAULT_PRESETS: ExportPreset[] = [
  {
    id: 'instagram-reel',
    name: 'Instagram Reel / TikTok',
    description: '1080p 60fps at 15 Mbps CBR for high viral motion fidelity',
    resolution: '1080p',
    frameRate: 60,
    bitrateMbps: 15,
    codec: 'H264_HW',
    targetPlatform: 'reels',
  },
  {
    id: 'youtube-longform',
    name: 'YouTube Long-form',
    description: '1080p 60fps at 18 Mbps high quality for desktop & TV playback',
    resolution: '1080p',
    frameRate: 60,
    bitrateMbps: 18,
    codec: 'H264_HW',
    targetPlatform: 'youtube',
  },
  {
    id: 'youtube-4k',
    name: 'YouTube 4K Cinema',
    description: '4K 2160p 60fps at 35 Mbps HEVC/H.265 maximum clarity',
    resolution: '4k',
    frameRate: 60,
    bitrateMbps: 35,
    codec: 'HEVC_HW',
    targetPlatform: 'youtube',
  },
  {
    id: 'web-compact',
    name: 'Web / Twitter Fast Stream',
    description: '720p 30fps at 8 Mbps for ultra-fast mobile cellular delivery',
    resolution: '720p',
    frameRate: 30,
    bitrateMbps: 8,
    codec: 'H264_HW',
    targetPlatform: 'twitter',
  },
];

const PRESETS_STORAGE_KEY = 'capcut_native_export_presets_v1';

export const ExportStudioModalUI: React.FC<ExportStudioModalUIProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  currentFilter,
  filterIntensity,
  duration,
  thumbnailUrl,
  textOverlays,
  activeMediaTitle,
}) => {
  // Preset list with localStorage persistence
  const [presets, setPresets] = useState<ExportPreset[]>(() => {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_PRESETS;
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('instagram-reel');
  const [isSavingPreset, setIsSavingPreset] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');

  // Hardware export parameters
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [frameRate, setFrameRate] = useState<30 | 60>(60);
  const [codec, setCodec] = useState<'H264_HW' | 'HEVC_HW'>('H264_HW');
  const [bitrate, setBitrate] = useState<number>(15); // Mbps

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>('Idle');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [outputFile, setOutputFile] = useState<string>('');

  // Apply a preset
  const handleApplyPreset = (preset: ExportPreset) => {
    setSelectedPresetId(preset.id);
    setResolution(preset.resolution);
    setFrameRate(preset.frameRate);
    setBitrate(preset.bitrateMbps);
    setCodec(preset.codec);
  };

  // When manually changing parameters, detach preset if it no longer matches
  const handleResolutionChange = (res: '1080p' | '720p' | '4k') => {
    setResolution(res);
    setSelectedPresetId(null);
    if (res === '1080p' && bitrate < 15) setBitrate(15);
    else if (res === '720p' && bitrate > 15) setBitrate(10);
    else if (res === '4k' && bitrate < 25) setBitrate(35);
  };

  const handleFrameRateChange = (fps: 30 | 60) => {
    setFrameRate(fps);
    setSelectedPresetId(null);
  };

  const handleBitrateChange = (newBitrate: number) => {
    setBitrate(newBitrate);
    setSelectedPresetId(null);
  };

  // Save current settings as custom preset
  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: ExportPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || `${resolution} ${frameRate}fps at ${bitrate} Mbps`,
      resolution,
      frameRate,
      bitrateMbps: bitrate,
      codec,
      targetPlatform: 'custom',
      isCustom: true,
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    setSelectedPresetId(newPreset.id);
    setIsSavingPreset(false);
    setNewPresetName('');
    setNewPresetDesc('');

    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save preset to localStorage', err);
    }
  };

  // Delete custom preset
  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    if (selectedPresetId === id) {
      setSelectedPresetId('instagram-reel');
      handleApplyPreset(DEFAULT_PRESETS[0]);
    }
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      // ignore
    }
  };

  // Estimated file size in Megabytes
  const estimatedSizeMb = ((duration * bitrate) / 8).toFixed(1);

  // Run hardware-accelerated MediaCodec export simulation
  const startHardwareExport = () => {
    setIsExporting(true);
    setProgress(0);
    setIsCompleted(false);

    const stages = [
      { pct: 15, msg: 'Initializing Android MediaCodec surface decoder...' },
      { pct: 35, msg: `Compiling Skia ${currentFilter} GPU shader pipelines...` },
      { pct: 60, msg: `Rendering composition frames at ${frameRate} FPS on EGLSurface...` },
      { pct: 85, msg: 'Muxing AVC video and AAC audio tracks via MediaMuxer...' },
      { pct: 100, msg: 'Finalizing MP4 container into Scoped Storage...' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      const stage = stages.find(s => currentStep * 4 <= s.pct) || stages[stages.length - 1];
      setCurrentStage(stage.msg);
      setProgress(Math.min(100, currentStep * 4));

      if (currentStep * 4 >= 100) {
        clearInterval(interval);
        const timestamp = Date.now().toString().slice(-6);
        setOutputFile(`/storage/emulated/0/Movies/CapCut_${resolution}_${frameRate}fps_${timestamp}.mp4`);
        setIsExporting(false);
        setIsCompleted(true);
      }
    }, 120);
  };

  const handleReset = () => {
    setIsExporting(false);
    setProgress(0);
    setIsCompleted(false);
    setIsSavingPreset(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#09090b]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Android Hardware Export Studio
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Platform Presets & MediaCodec Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-80px)]">
          {!isExporting && !isCompleted ? (
            <>
              {/* 1. HIGH-FIDELITY COMPOSITION PREVIEW THUMBNAIL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    <Eye size={13} className="text-cyan-400" />
                    <span>Final Render Frame Preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <Sparkles size={11} className="text-cyan-400" />
                      Skia Shader: {currentFilter}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {resolution} • {aspectRatio}
                    </span>
                  </div>
                </div>

                {/* Preview Thumbnail Canvas Container */}
                <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center shadow-lg group">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Render Composition Preview"
                      className="absolute inset-0 w-full h-full object-cover select-none"
                      style={{
                        filter:
                          currentFilter === 'GRAYSCALE'
                            ? `grayscale(${100 * filterIntensity}%) contrast(1.1)`
                            : currentFilter === 'SEPIA'
                            ? `sepia(${100 * filterIntensity}%) saturate(1.2)`
                            : currentFilter === 'NEON_GLOW'
                            ? `contrast(1.25) saturate(1.4) brightness(1.05)`
                            : 'none',
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
                      <Film size={28} className="text-zinc-600" />
                      <span className="text-xs font-mono">Frame buffer rendered</span>
                    </div>
                  )}

                  {/* Skia GPU Shader Filter Overlay Simulation */}
                  <SkiaShaderRenderer
                    filterType={currentFilter}
                    filterIntensity={filterIntensity}
                    width={480}
                    height={224}
                  />

                  {/* Rendered Text Overlays on Thumbnail */}
                  {textOverlays.map((txt) => (
                    <div
                      key={txt.id}
                      className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${txt.xPercent}%`,
                        top: `${txt.yPercent}%`,
                      }}
                    >
                      <div className="px-2.5 py-0.5 rounded bg-black/65 backdrop-blur-sm border border-cyan-400/40 shadow-lg">
                        <span
                          className="font-black tracking-wider text-center block uppercase text-xs"
                          style={{
                            color: txt.color,
                            textShadow: txt.glow ? '0 0 10px #00f2fe, 0 0 15px #00f2fe' : 'none',
                          }}
                        >
                          {txt.text}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-zinc-700/80 text-[10px] font-mono text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                    <span>GPU Texture (GL_TEXTURE_EXTERNAL_OES)</span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-cyan-300">
                    <span>Aspect: {aspectRatio}</span>
                  </div>
                </div>
              </div>

              {/* 2. EXPORT PRESETS CONFIGURATION SECTION */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    <Sliders size={13} className="text-cyan-400" />
                    <span>Platform & Hardware Presets</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSavingPreset(!isSavingPreset)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <BookmarkPlus size={13} />
                    <span>Save Current as Preset</span>
                  </button>
                </div>

                {/* Inline Save Preset Form */}
                {isSavingPreset && (
                  <form 
                    onSubmit={handleSaveCustomPreset}
                    className="p-3 rounded-xl bg-zinc-900 border border-cyan-500/30 space-y-2.5 animate-in slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                      <span>Save Current Profile ({resolution} • {frameRate}fps • {bitrate}Mbps)</span>
                      <button 
                        type="button" 
                        onClick={() => setIsSavingPreset(false)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Preset Name (e.g., Gaming 60FPS HQ)"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newPresetDesc}
                        onChange={(e) => setNewPresetDesc(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSavingPreset(false)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold transition flex items-center gap-1"
                      >
                        <BookmarkCheck size={13} />
                        <span>Save Preset</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Preset Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    const isReel = preset.targetPlatform === 'reels';
                    const isYoutube = preset.targetPlatform === 'youtube';

                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-2 relative group ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-cyan-400'
                            : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isReel ? (
                              <Smartphone size={14} className={isSelected ? 'text-cyan-400' : 'text-zinc-400'} />
                            ) : isYoutube ? (
                              <Tv size={14} className={isSelected ? 'text-cyan-400' : 'text-zinc-400'} />
                            ) : (
                              <Globe size={14} className={isSelected ? 'text-cyan-400' : 'text-zinc-400'} />
                            )}
                            <div>
                              <span className={`text-xs font-bold block ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                                {preset.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 line-clamp-1">
                                {preset.description}
                              </span>
                            </div>
                          </div>

                          {/* Delete for custom presets */}
                          {preset.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded transition"
                              title="Delete custom preset"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Specs Pill footer */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800/80">
                          <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-zinc-400'}>
                            {preset.resolution.toUpperCase()} • {preset.frameRate} FPS
                          </span>
                          <span className="text-zinc-400">
                            {preset.bitrateMbps} Mbps {preset.codec === 'HEVC_HW' ? 'HEVC' : 'AVC'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Composition Summary Pill */}
              <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Aspect Ratio</span>
                  <span className="text-xs font-bold text-cyan-400">{aspectRatio}</span>
                </div>
                <div className="border-x border-zinc-800">
                  <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Duration</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{duration.toFixed(1)}s</span>
                </div>
                <div className="border-r border-zinc-800">
                  <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Estimated Size</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">~{estimatedSizeMb} MB</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Hardware Enc</span>
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    {codec === 'HEVC_HW' ? 'HEVC / C2' : 'AVC / OMX'}
                  </span>
                </div>
              </div>

              {/* 3. HARDWARE SPEC OVERRIDES */}
              <div className="space-y-3 pt-1 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Hardware Parameters Override
                  </span>
                  {!selectedPresetId && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Custom Active
                    </span>
                  )}
                </div>

                {/* Resolution Selector */}
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['720p', '1080p', '4k'] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => handleResolutionChange(res)}
                        className={`py-2 px-3 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                          resolution === res
                            ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold'
                            : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="text-xs uppercase">{res}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {res === '1080p' ? '1080x1920' : res === '720p' ? '720x1280' : '2160x3840'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framerate & Bitrate Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Framerate */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Frame Rate
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {([30, 60] as const).map((fps) => (
                        <button
                          key={fps}
                          type="button"
                          onClick={() => handleFrameRateChange(fps)}
                          className={`py-2 px-3 rounded-lg border text-center transition ${
                            frameRate === fps
                              ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                              : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          <span className="text-xs">{fps} FPS</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bitrate Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      <span>Bitrate</span>
                      <span className="font-mono text-cyan-400">{bitrate} Mbps</span>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="range"
                        min="6"
                        max="40"
                        step="1"
                        value={bitrate}
                        onChange={(e) => handleBitrateChange(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Hardware Codec Parameters */}
              <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                    <HardDrive size={14} className="text-cyan-400" />
                    <span>Android MediaCodec Profile</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">
                    {codec === 'HEVC_HW' ? 'c2.android.hevc.encoder' : 'OMX.qcom.video.encoder.avc'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                  <span>Selected Profile:</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {selectedPresetId ? presets.find(p => p.id === selectedPresetId)?.name : 'Custom Hardware Preset'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Input Buffer:</span>
                  <span className="font-mono text-emerald-400 font-medium">COLOR_FormatSurface (Zero-Copy)</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={startHardwareExport}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-[#00f2fe] hover:brightness-110 active:scale-[0.99] text-zinc-950 text-xs font-black tracking-wide uppercase shadow-[0_0_20px_rgba(0,242,254,0.35)] transition flex items-center justify-center gap-2"
              >
                <Cpu size={16} />
                <span>Start Hardware Encode ({resolution.toUpperCase()} • {frameRate} FPS)</span>
              </button>
            </>
          ) : isExporting ? (
            /* Progress State */
            <div className="py-8 flex flex-col items-center text-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {progress}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Rendering Composition ({resolution.toUpperCase()} • {frameRate} FPS)
                </h4>
                <p className="text-xs text-zinc-400 font-mono h-5">
                  {currentStage}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-[#00f2fe] transition-all duration-150 shadow-[0_0_10px_#00f2fe]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between w-full text-[10px] text-zinc-500 font-mono px-1">
                <span>Preset: {selectedPresetId || 'Custom'}</span>
                <span>HW Accel: ENABLED</span>
              </div>
            </div>
          ) : (
            /* Completed State */
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={40} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">
                  Hardware Export Successful!
                </h4>
                <p className="text-xs text-zinc-400">
                  Rendered at {frameRate} FPS using MediaCodec hardware encoder.
                </p>
              </div>

              {/* Output path box */}
              <div className="w-full p-3 rounded-xl bg-[#09090b] border border-zinc-800 text-left space-y-1">
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Android Scoped Storage Location
                </div>
                <div className="text-[11px] font-mono text-cyan-400 break-all select-all">
                  {outputFile}
                </div>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition"
                >
                  Return to Editor
                </button>
                <a
                  href="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  download={`CapCut_Exported_${resolution}_${frameRate}FPS.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download size={14} />
                  <span>Download MP4</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
