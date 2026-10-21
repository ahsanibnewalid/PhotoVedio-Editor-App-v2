/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EditorScreen.tsx
 * CapCut-inspired Professional Video Editor Layout for Samsung Galaxy A15 5G.
 * 
 * Architectural Highlights:
 * 1. CapCut Dark-Mode Aesthetic: Matte charcoal surface layers (#121212, #18181C),
 *    vibrant CapCut orange (#FF9500) primary actions, and high-contrast typography.
 * 2. Edge-to-Edge Safe Area Insets: Protects against Infinity-U punch-hole camera
 *    cutout and waterfall curved edges.
 * 3. Two-Tier Expandable Toolbar Architecture (Zero Features Clipped):
 *    - Tier 1: Horizontal primary scrolling dock (Split, Speed, Audio, Text, Effects, MotoVlog, More...)
 *    - Tier 2: Expandable Toolbox Bottom Sheet revealing all advanced modules.
 * 4. 60 FPS Reanimated & Hardware MediaCodec Execution with live Skia GPU shaders,
 *    directional motion blur, and sub-frame timeline scrubbing.
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Scissors, 
  Gauge, 
  Sparkles, 
  Type, 
  Music, 
  Smartphone, 
  Layers, 
  Radio, 
  Database, 
  Film, 
  Sliders, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Share2, 
  Tv,
  Wind,
  MoreHorizontal,
  Flame,
  Volume2,
  VolumeX,
  X,
  ScanFace,
  Shuffle,
  Zap
} from 'lucide-react';

import { PreviewViewport } from '../components/PreviewViewport';
import { MultiTrackTimeline } from '../components/MultiTrackTimeline';
import { MotoBloggerButton, MotoMacroSettings } from '../components/MotoBloggerButton';
import { TemplatePickerModalUI } from '../components/TemplatePickerModalUI';
import { SocialAuthModalUI } from '../components/SocialAuthModalUI';
import { OfflineP2PModalUI } from '../components/OfflineP2PModalUI';
import { ExportStudioModalUI } from '../components/ExportStudioModalUI';
import { ExportSettingsStudio } from '../components/ExportSettingsStudio';
import { TransitionLibraryModal } from '../components/TransitionLibraryModal';
import { TransitionSelector } from '../components/TransitionSelector';
import { ExpandableToolboxDrawer } from '../components/ExpandableToolboxDrawer';
import { ProxyGenerator } from '../components/ProxyGenerator';
import { useDeviceThrottle } from '../hooks/useDeviceThrottle';
import { detectDeviceCapabilities, DeviceHardwareProfile } from '../utils/DeviceCapabilityDetector';
import { getAutomaticProxySettings, PROXY_SPECS } from '../utils/UniversalProxyManager';
import { SAMPLE_MEDIA_LIST, SampleMediaItem } from '../utils/sampleMedia';
import { EditorTemplate } from '../data/sampleTemplates';
import { 
  AspectRatioType, 
  FilterType, 
  LutPresetType, 
  VideoClipSegment, 
  TextOverlayItem, 
  OverlayCutoutItem, 
  AudioTrackItem,
  ClipTransition,
  TransitionType,
  ProxySettings
} from '../types/editor';

interface EditorScreenProps {
  onOpenCodeInspector?: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({ onOpenCodeInspector }) => {
  // Active media clip
  const [activeMedia, setActiveMedia] = useState<SampleMediaItem>(SAMPLE_MEDIA_LIST[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [isSamsungA15Frame, setIsSamsungA15Frame] = useState<boolean>(true);
  const [showSafeAreaGuides, setShowSafeAreaGuides] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(15.0);

  // Color Filter & Shader settings
  const [filterType, setFilterType] = useState<FilterType>('NORMAL');
  const [filterIntensity, setFilterIntensity] = useState<number>(0.85);
  const [activeLut, setActiveLut] = useState<LutPresetType>('NONE');

  // MotoVlog Macro State
  const [motoSettings, setMotoSettings] = useState<MotoMacroSettings>({
    isEnabled: false,
    blurIntensity: 0.85,
    blurAngle: 25,
    lutPreset: 'VIBRANT_ACTION',
    enableLetterbox: true,
    shutterAngleEmulation: '180deg'
  });

  // Audio & Wind Reduction State
  const [windReductionActive, setWindReductionActive] = useState<boolean>(true);
  const [audioVolume, setAudioVolume] = useState<number>(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Timeline Composition Clips with default transition
  const [clips, setClips] = useState<VideoClipSegment[]>([
    { 
      id: 'clip-1', 
      name: 'Moto Highway Warp', 
      startTime: 0, 
      endTime: 7.5, 
      duration: 7.5, 
      color: '#00f2fe' 
    },
    { 
      id: 'clip-2', 
      name: 'Apex Cornering', 
      startTime: 7.5, 
      endTime: 15.0, 
      duration: 7.5, 
      color: '#38bdf8',
      transitionIn: {
        id: 'trans-init',
        type: 'DISSOLVE',
        duration: 0.6,
        targetClipId: 'clip-2',
        curve: 'ease-in-out'
      }
    }
  ]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');

  // Text Overlays
  const [texts, setTexts] = useState<TextOverlayItem[]>([
    {
      id: 'txt-1',
      text: 'MOTO WARP 60FPS',
      startTime: 0.5,
      endTime: 7.0,
      xPercent: 50,
      yPercent: 28,
      fontSize: 22,
      color: '#ffffff',
      glow: true,
      layerPosition: 'BEHIND_SUBJECT'
    },
    {
      id: 'txt-2',
      text: '#GALAXY_A15_5G',
      startTime: 7.2,
      endTime: 14.8,
      xPercent: 50,
      yPercent: 78,
      fontSize: 16,
      color: '#FF9500',
      glow: true,
      layerPosition: 'IN_FRONT_OF_SUBJECT'
    }
  ]);

  // AI Cutouts
  const [cutouts, setCutouts] = useState<OverlayCutoutItem[]>([
    {
      id: 'cut-1',
      name: 'Rider Subject Cutout',
      type: 'AI_CUTOUT',
      startTime: 0,
      endTime: 15.0,
      maskActive: true,
      depthOfFieldBlur: 8,
      subjectGlow: true,
      glowColor: '#00f2fe',
      xPercent: 50,
      yPercent: 50,
      scale: 1.0
    }
  ]);

  // Modal Dialogs
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isToolboxDrawerOpen, setIsToolboxDrawerOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);

  // Real-Time Hardware Capability & Memory Pressure Throttle Hook
  const throttleState = useDeviceThrottle({
    onAutoPurgeCache: () => {
      setProxySettings(prev => ({ ...prev, cacheSizeBytes: 0 }));
    },
    onDowngradeProxy: (downgradedQuality) => {
      setProxySettings(prev => ({ ...prev, quality: downgradedQuality }));
    }
  });

  // Proxy settings state (automatically configured based on detected hardware tier)
  const [proxySettings, setProxySettings] = useState<ProxySettings>(() => getAutomaticProxySettings());

  // Active Contextual Tool Sub-panel: Tier 1 selection
  const [activeToolTab, setActiveToolTab] = useState<'filter' | 'text' | 'speed' | 'cutout' | 'transition' | 'audio' | 'aspect' | null>(null);

  // Transition Handlers
  const handleApplyTransition = (transition: ClipTransition, placement: 'in' | 'out') => {
    if (!selectedClipId) return;
    setClips(prev => prev.map(clip => {
      if (clip.id === selectedClipId) {
        return placement === 'in'
          ? { ...clip, transitionIn: transition }
          : { ...clip, transitionOut: transition };
      }
      return clip;
    }));
  };

  const handleRemoveTransition = (clipId: string, placement: 'in' | 'out') => {
    setClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        return placement === 'in'
          ? { ...clip, transitionIn: undefined }
          : { ...clip, transitionOut: undefined };
      }
      return clip;
    }));
  };

  const handleDropTransition = (clipId: string, transition: ClipTransition, placement: 'in' | 'out') => {
    setClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        return placement === 'in'
          ? { ...clip, transitionIn: transition }
          : { ...clip, transitionOut: transition };
      }
      return clip;
    }));
    setSelectedClipId(clipId);
  };

  // Real-time Active Transition calculation for PreviewViewport rendering
  const activeTransitionEffect = (() => {
    for (const clip of clips) {
      if (clip.transitionIn) {
        const transStart = clip.startTime;
        const transEnd = clip.startTime + clip.transitionIn.duration;
        if (currentTime >= transStart && currentTime <= transEnd) {
          const progress = (currentTime - transStart) / clip.transitionIn.duration;
          return { type: clip.transitionIn.type, progress };
        }
      }
      if (clip.transitionOut) {
        const transStart = clip.endTime - clip.transitionOut.duration;
        const transEnd = clip.endTime;
        if (currentTime >= transStart && currentTime <= transEnd) {
          const progress = (currentTime - transStart) / clip.transitionOut.duration;
          return { type: clip.transitionOut.type, progress };
        }
      }
    }
    return null;
  })();

  // Toggle MotoVlog 1-tap macro
  const handleToggleMotoMacro = () => {
    const nextState = !motoSettings.isEnabled;
    setMotoSettings(prev => ({ ...prev, isEnabled: nextState }));
    if (nextState) {
      setFilterType('NEON_GLOW');
      setActiveLut('TEAL_ORANGE');
    } else {
      setFilterType('NORMAL');
      setActiveLut('NONE');
    }
  };

  // 1-Tap Template Apply
  const handleApplyTemplate = (template: EditorTemplate) => {
    setAspectRatio(template.aspectRatio);
    setFilterType(template.filterPreset);
    if (template.motoBlurEnabled) {
      setMotoSettings(prev => ({ ...prev, isEnabled: true }));
      setActiveLut('TEAL_ORANGE');
    }
    setTexts(prev => [
      {
        ...prev[0],
        text: template.textTitle,
      },
      ...prev.slice(1)
    ]);
  };

  // Timeline Split at current playhead
  const handleSplitClip = (clipId: string, splitTime: number) => {
    const targetIdx = clips.findIndex(c => c.id === clipId);
    if (targetIdx === -1) return;
    const original = clips[targetIdx];
    if (splitTime <= original.startTime || splitTime >= original.endTime) return;

    const firstSegment: VideoClipSegment = {
      ...original,
      id: `${original.id}-a`,
      name: `${original.name} (Part 1)`,
      endTime: splitTime,
      duration: splitTime - original.startTime
    };

    const secondSegment: VideoClipSegment = {
      ...original,
      id: `${original.id}-b`,
      name: `${original.name} (Part 2)`,
      startTime: splitTime,
      duration: original.endTime - splitTime
    };

    const updated = [...clips];
    updated.splice(targetIdx, 1, firstSegment, secondSegment);
    setClips(updated);
    setSelectedClipId(secondSegment.id);
  };

  // Step 1 Frame (1/60th of a second)
  const handleStepFrame = (direction: 'prev' | 'next') => {
    const frameTime = 1 / 60;
    setCurrentTime(prev => {
      const target = direction === 'next' ? prev + frameTime : prev - frameTime;
      return Math.max(0, Math.min(target, totalDuration));
    });
  };

  const selectedClip = clips.find(c => c.id === selectedClipId);

  return (
    <div className="flex flex-col w-full bg-[#121212] text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden select-none">
      
      {/* 1. TOP CAPCUT PROFESSIONAL HEADER BAR */}
      <header className="px-4 py-2.5 bg-[#18181C] border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Device Profile & Safe Insets Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProxyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-xs font-bold text-zinc-300 transition"
            title={`${throttleState.profile.tierName}: ${throttleState.profile.ramGB}GB RAM, ${throttleState.profile.cpuCores} Cores, ${throttleState.profile.gpuRenderer}. Click to optimize.`}
          >
            <Smartphone size={13} className="text-[#FF9500]" />
            <span className="truncate max-w-[95px] sm:max-w-none">
              {throttleState.profile.tier === 'BUDGET_LOW_RAM' ? 'Budget Low-RAM' : throttleState.profile.tier === 'MID_RANGE' ? 'Mid-Range' : 'Flagship'}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">{throttleState.profile.ramGB}GB</span>
            {throttleState.pressureLevel !== 'NORMAL' && (
              <span className={`px-1 py-0.2 rounded text-[8px] font-black uppercase ${
                throttleState.pressureLevel === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-zinc-950'
              }`}>
                {throttleState.pressureLevel}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSamsungA15Frame(!isSamsungA15Frame)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
              isSamsungA15Frame
                ? 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Toggle Samsung Bezel Frame with punch-hole cutout"
          >
            {isSamsungA15Frame ? 'Bezel: On' : 'Bezel: Off'}
          </button>

          <button
            onClick={() => setShowSafeAreaGuides(!showSafeAreaGuides)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
              showSafeAreaGuides
                ? 'bg-purple-950/60 text-purple-400 border-purple-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Safe area guides protecting notch and curved waterfall margins"
          >
            Safe Insets
          </button>
        </div>

        {/* Center: Resolution Pill, Proxy Status & Aspect Ratio Selector */}
        <div className="flex items-center gap-2">
          {/* Proxy Mode Toggle / Indicator */}
          <button
            onClick={() => setIsProxyModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
              proxySettings.mode === 'PROXY'
                ? 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/40 hover:bg-[#FF9500]/25'
                : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/25'
            }`}
            title="Configure Auto-Proxy & 4K scrubbing performance"
          >
            <Zap size={12} className={proxySettings.mode === 'PROXY' ? 'fill-[#FF9500]' : ''} />
            <span className="font-mono">
              {proxySettings.mode === 'PROXY' 
                ? (proxySettings.quality === '480p_30' ? 'PROXY: 480P' : proxySettings.quality === '540p_30' ? 'PROXY: 540P' : 'PROXY: 720P')
                : 'RAW: 4K'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-750 font-mono text-[11px] font-bold text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500] animate-pulse" />
            <span>1080P</span>
            <span className="text-zinc-500">60FPS</span>
          </div>

          <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-[11px] font-bold">
            {(['9:16', '16:9', '1:1', '4:5'] as AspectRatioType[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  aspectRatio === ratio
                    ? 'bg-[#FF9500] text-zinc-950 font-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Templates, Wi-Fi Direct, Supabase, and CapCut Vibrant Orange Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition shadow-sm"
          >
            <Sparkles size={13} className="text-[#FF9500]" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            onClick={() => setIsP2PModalOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 transition"
            title="Beam video offline via Wi-Fi Direct"
          >
            <Radio size={14} />
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 transition"
            title="Supabase Offline-First Account & Sync"
          >
            <Database size={14} />
          </button>

          {/* Primary CapCut Vibrant Orange Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FF9500] hover:bg-[#FFA51A] active:scale-95 text-zinc-950 font-black text-xs shadow-[0_0_18px_rgba(255,149,0,0.4)] transition"
          >
            <Download size={14} className="stroke-[2.8]" />
            <span>Export</span>
          </button>
        </div>

      </header>

      {/* 2. MAIN CENTER WORKBENCH (VIEWPORT + TIMELINE) */}
      <div className="p-3 sm:p-5 flex flex-col gap-4 bg-[#121212]">
        
        {/* Preview Viewport Container */}
        <div className="flex justify-center w-full py-0.5">
          <PreviewViewport
            videoUrl={activeMedia.videoUrl}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            duration={totalDuration}
            onTimeUpdate={(t) => setCurrentTime(t)}
            aspectRatio={aspectRatio}
            filterType={filterType}
            filterIntensity={filterIntensity}
            activeLut={activeLut}
            motoBlurEnabled={motoSettings.isEnabled}
            motoBlurIntensity={motoSettings.blurIntensity}
            motoBlurAngle={motoSettings.blurAngle}
            anamorphicLetterbox={motoSettings.enableLetterbox}
            activeTransitionEffect={activeTransitionEffect}
            texts={texts}
            cutouts={cutouts}
            showSafeAreaGuides={showSafeAreaGuides}
            isSamsungA15Frame={isSamsungA15Frame}
            proxyMode={proxySettings.mode}
            proxyQuality={proxySettings.quality}
            showProxyBadge={proxySettings.showProxyBadge}
          />
        </div>

        {/* Transport Controls Bar */}
        <div className="flex items-center justify-between max-w-lg mx-auto w-full px-4 py-1.5 bg-[#1A1A20] rounded-2xl border border-zinc-800 shadow-md">
          {/* Step Frame Backward */}
          <button
            onClick={() => handleStepFrame('prev')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition hover:bg-zinc-800"
            title="Step 1 Frame Back (1/60s)"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Timecode Readout */}
          <div className="font-mono text-xs font-bold text-zinc-300">
            <span className="text-[#FF9500]">{currentTime.toFixed(2)}s</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-zinc-400">{totalDuration.toFixed(1)}s</span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#FF9500] hover:bg-[#FFA51A] text-zinc-950 font-black flex items-center justify-center shadow-[0_0_16px_rgba(255,149,0,0.35)] transition transform active:scale-95"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-zinc-950" />}
          </button>

          {/* Active Features Status */}
          <div className="flex items-center gap-1.5">
            {windReductionActive && (
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                WIND DSP
              </span>
            )}
            {motoSettings.isEnabled && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/40">
                MOTO MACRO
              </span>
            )}
          </div>

          {/* Step Frame Forward */}
          <button
            onClick={() => handleStepFrame('next')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition hover:bg-zinc-800"
            title="Step 1 Frame Forward (1/60s)"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 3. MULTI-TRACK INTERACTIVE TIMELINE */}
        <MultiTrackTimeline
          currentTime={currentTime}
          totalDuration={totalDuration}
          onSeek={(newTime) => setCurrentTime(newTime)}
          clips={clips}
          selectedClipId={selectedClipId}
          onSelectClip={(id) => setSelectedClipId(id)}
          onSplitClip={handleSplitClip}
          onDropTransition={handleDropTransition}
          texts={texts}
          cutouts={cutouts}
        />

        {/* 4. TWO-TIER SCALABLE TOOLBAR (PREVENTS HIDDEN FEATURES) */}
        
        {/* TIER 1: PRIMARY HORIZONTAL SCROLLING DOCK */}
        <div className="w-full bg-[#1A1A22] border border-zinc-800/90 rounded-2xl p-2 shadow-xl">
          <div className="flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-0.5">
            
            {/* 1. MotoVlog 1-Tap Quick Action */}
            <div className="shrink-0 pr-1">
              <MotoBloggerButton
                isActive={motoSettings.isEnabled}
                onToggle={handleToggleMotoMacro}
                settings={motoSettings}
                onUpdateSettings={(updated) => setMotoSettings(prev => ({ ...prev, ...updated }))}
              />
            </div>

            <div className="h-7 w-[1px] bg-zinc-800 shrink-0 mx-1" />

            {/* 2. Split Button */}
            <button
              onClick={() => handleSplitClip(selectedClipId || clips[0]?.id, currentTime)}
              className="flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5 text-[#FF9500]">
                <Scissors size={15} />
              </div>
              <span className="text-[10px] font-bold">Split</span>
            </button>

            {/* 3. Speed Button */}
            <button
              onClick={() => setActiveToolTab(activeToolTab === 'speed' ? null : 'speed')}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition group ${
                activeToolTab === 'speed' ? 'bg-zinc-800 text-[#FF9500]' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5">
                <Gauge size={15} className={activeToolTab === 'speed' ? 'text-[#FF9500]' : 'text-zinc-300'} />
              </div>
              <span className="text-[10px] font-bold">Speed</span>
            </button>

            {/* 4. Transitions Button */}
            <button
              onClick={() => setActiveToolTab(activeToolTab === 'transition' ? null : 'transition')}
              className={`flex flex-col items-center justify-center min-w-[62px] py-1 px-2 rounded-xl transition group ${
                activeToolTab === 'transition' ? 'bg-zinc-800 text-cyan-400' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5">
                <Sparkles size={15} className={activeToolTab === 'transition' ? 'text-cyan-400' : 'text-zinc-300'} />
              </div>
              <span className="text-[10px] font-bold">Transition</span>
            </button>

            {/* 5. Audio & Wind DSP Button */}
            <button
              onClick={() => setActiveToolTab(activeToolTab === 'audio' ? null : 'audio')}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition group ${
                activeToolTab === 'audio' ? 'bg-zinc-800 text-emerald-400' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5">
                <Music size={15} className={activeToolTab === 'audio' ? 'text-emerald-400' : 'text-zinc-300'} />
              </div>
              <span className="text-[10px] font-bold">Audio</span>
            </button>

            {/* 6. Text & Subtitle Button */}
            <button
              onClick={() => setActiveToolTab(activeToolTab === 'text' ? null : 'text')}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition group ${
                activeToolTab === 'text' ? 'bg-zinc-800 text-purple-400' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5">
                <Type size={15} className={activeToolTab === 'text' ? 'text-purple-400' : 'text-zinc-300'} />
              </div>
              <span className="text-[10px] font-bold">Text</span>
            </button>

            {/* 7. Shaders & Effects Button */}
            <button
              onClick={() => setActiveToolTab(activeToolTab === 'filter' ? null : 'filter')}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition group ${
                activeToolTab === 'filter' ? 'bg-zinc-800 text-cyan-400' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5">
                <Film size={15} className={activeToolTab === 'filter' ? 'text-cyan-400' : 'text-zinc-300'} />
              </div>
              <span className="text-[10px] font-bold">Effects</span>
            </button>

            {/* 8. AI Cutout Button */}
            <button
              onClick={() => setActiveToolTab(activeToolTab === 'cutout' ? null : 'cutout')}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition group ${
                activeToolTab === 'cutout' ? 'bg-zinc-800 text-pink-400' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-850 group-hover:bg-zinc-750 flex items-center justify-center mb-0.5">
                <Layers size={15} className={activeToolTab === 'cutout' ? 'text-pink-400' : 'text-zinc-300'} />
              </div>
              <span className="text-[10px] font-bold">Cutout</span>
            </button>

            <div className="h-7 w-[1px] bg-zinc-800 shrink-0 mx-1" />

            {/* 9. TIER 2 TRIGGER: "..." MORE / EXPANDABLE TOOLBOX DRAWER */}
            <button
              onClick={() => setIsToolboxDrawerOpen(true)}
              className="flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white transition border border-zinc-700/80 shadow-md group shrink-0"
              title="Open Full CapCut Toolbox (All 14 Features)"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-900 group-hover:bg-zinc-850 flex items-center justify-center mb-0.5 text-[#FF9500]">
                <MoreHorizontal size={18} />
              </div>
              <span className="text-[10px] font-black text-[#FF9500]">More</span>
            </button>

          </div>
        </div>

        {/* 5. CONTEXTUAL SUB-PANELS (EXPANDS WHEN ANY TOOL IS CLICKED) */}
        
        {/* A. TRANSITIONS STUDIO SUB-PANEL */}
        {activeToolTab === 'transition' && (
          <div className="animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Video Transitions Studio</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTransitionModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <Sparkles size={12} />
                  <span>Open GPU Library Modal</span>
                </button>
                <button 
                  onClick={() => setActiveToolTab(null)}
                  className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-zinc-800"
                >
                  Close ✕
                </button>
              </div>
            </div>
            <TransitionSelector
              selectedClip={selectedClip}
              onApplyTransition={handleApplyTransition}
              onRemoveTransition={handleRemoveTransition}
            />
          </div>
        )}

        {/* B. SPEED CURVE & RAMPING SUB-PANEL */}
        {activeToolTab === 'speed' && (
          <div className="p-4 bg-[#181820] rounded-2xl border border-zinc-800 space-y-3 text-xs animate-in fade-in duration-150 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#FF9500]" />
                <span className="font-bold text-white">Speed Curve & Multiplier</span>
              </div>
              <button 
                onClick={() => setActiveToolTab(null)}
                className="text-zinc-400 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[0.25, 0.5, 1.0, 1.5, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`py-2 px-2.5 rounded-xl font-bold border transition ${
                    playbackSpeed === spd
                      ? 'bg-[#FF9500] text-zinc-950 border-[#FF9500] font-black shadow-md'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-750 hover:border-zinc-600'
                  }`}
                >
                  {spd}x {spd < 1 ? 'Slow' : spd > 1 ? 'Fast' : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
              <span>Bezier Curve Smoothing: Enabled</span>
              <span className="text-[#FF9500] font-mono font-bold">Optical Flow 60FPS</span>
            </div>
          </div>
        )}

        {/* C. AUDIO & WIND REDUCTION SUB-PANEL */}
        {activeToolTab === 'audio' && (
          <div className="p-4 bg-[#181820] rounded-2xl border border-zinc-800 space-y-3.5 text-xs animate-in fade-in duration-150 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-emerald-400" />
                <span className="font-bold text-white">Audio Mixer & Moto Wind Reduction</span>
              </div>
              <button onClick={() => setActiveToolTab(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* Wind Reduction DSP Toggle */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wind size={16} />
                </div>
                <div>
                  <span className="font-bold text-white block">Motorcycle Wind Reduction DSP</span>
                  <span className="text-[10px] text-zinc-400">High-pass filter suppresses highway wind buffeting</span>
                </div>
              </div>
              <button
                onClick={() => setWindReductionActive(!windReductionActive)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  windReductionActive 
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' 
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {windReductionActive ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-zinc-300 font-medium">Master Track Volume</span>
                <span className="text-emerald-400 font-mono font-bold">{Math.round(audioVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={audioVolume}
                onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* D. SKIA SHADERS & COLOR SUB-PANEL */}
        {activeToolTab === 'filter' && (
          <div className="p-4 bg-[#181820] rounded-2xl border border-zinc-800 space-y-3 text-xs animate-in fade-in duration-150 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-cyan-400" />
                <span className="font-bold text-white">Skia GPU Color Grading Filter</span>
              </div>
              <button onClick={() => setActiveToolTab(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'NORMAL', label: 'Raw Sensor' },
                { id: 'NEON_GLOW', label: 'Neon Cyber' },
                { id: 'HIGH_CONTRAST', label: 'Vibrant Action' },
                { id: 'SEPIA', label: 'Vintage 70s' },
                { id: 'GRAYSCALE', label: 'Monochrome' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as FilterType)}
                  className={`py-2 px-2.5 rounded-xl font-bold border transition ${
                    filterType === f.id
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-md font-black'
                      : 'bg-zinc-850 text-zinc-300 border-zinc-750 hover:border-zinc-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Intensity slider */}
            <div className="pt-1">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Shader Intensity</span>
                <span className="text-cyan-400 font-mono">{Math.round(filterIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={filterIntensity}
                onChange={(e) => setFilterIntensity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* E. TEXT & DEPTH SUB-PANEL */}
        {activeToolTab === 'text' && (
          <div className="p-4 bg-[#181820] rounded-2xl border border-zinc-800 space-y-3 text-xs animate-in fade-in duration-150 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={16} className="text-purple-400" />
                <span className="font-bold text-white">Subtitle Text & Depth Layering</span>
              </div>
              <button onClick={() => setActiveToolTab(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={texts[0]?.text || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setTexts(prev => [
                    { ...prev[0], text: val },
                    ...prev.slice(1)
                  ]);
                }}
                className="flex-1 bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-2 text-white font-bold"
                placeholder="Enter title text..."
              />
              <button
                onClick={() => {
                  const currentPos = texts[0]?.layerPosition;
                  const newPos: 'BEHIND_SUBJECT' | 'IN_FRONT_OF_SUBJECT' = 
                    currentPos === 'BEHIND_SUBJECT' ? 'IN_FRONT_OF_SUBJECT' : 'BEHIND_SUBJECT';
                  setTexts(prev => [
                    { ...prev[0], layerPosition: newPos },
                    ...prev.slice(1)
                  ]);
                }}
                className={`px-3 py-2 rounded-xl font-bold text-xs border transition ${
                  texts[0]?.layerPosition === 'BEHIND_SUBJECT'
                    ? 'bg-purple-900/60 text-purple-300 border-purple-500 shadow-sm'
                    : 'bg-zinc-850 text-zinc-300 border-zinc-750'
                }`}
              >
                {texts[0]?.layerPosition === 'BEHIND_SUBJECT' ? 'Behind Subject' : 'In Front'}
              </button>
            </div>
          </div>
        )}

        {/* F. AI CUTOUT SUB-PANEL */}
        {activeToolTab === 'cutout' && (
          <div className="p-4 bg-[#181820] rounded-2xl border border-zinc-800 space-y-3 text-xs animate-in fade-in duration-150 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanFace size={16} className="text-pink-400" />
                <span className="font-bold text-white">ML Kit Offline Subject Segmentation</span>
              </div>
              <button onClick={() => setActiveToolTab(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-750">
              <div>
                <span className="font-bold text-white block">On-Device NPU Mask</span>
                <span className="text-[10px] text-zinc-400">Zero cloud latency background isolation</span>
              </div>
              <button
                onClick={() => {
                  setCutouts(prev => prev.map(c => ({ ...c, maskActive: !c.maskActive })));
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  cutouts[0]?.maskActive 
                    ? 'bg-pink-500 text-zinc-950 font-black shadow-md' 
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {cutouts[0]?.maskActive ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        )}

        {/* G. ASPECT RATIO & FRAMING SUB-PANEL */}
        {activeToolTab === 'aspect' && (
          <div className="p-4 bg-[#181820] rounded-2xl border border-zinc-800 space-y-3 text-xs animate-in fade-in duration-150 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 size={16} className="text-[#FF9500]" />
                <span className="font-bold text-white">Aspect Ratio & Canvas Framing</span>
              </div>
              <button onClick={() => setActiveToolTab(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['9:16', '16:9', '1:1', '4:5'] as AspectRatioType[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`py-2 px-2 rounded-xl font-bold border transition ${
                    aspectRatio === r
                      ? 'bg-[#FF9500] text-zinc-950 border-[#FF9500] font-black'
                      : 'bg-zinc-850 text-zinc-300 border-zinc-750 hover:border-zinc-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 6. MODALS & TIER-2 EXPANDABLE TOOLBOX DRAWER */}
      
      {/* Expandable Toolbox Drawer (Tier 2 - All 14 Advanced Tools) */}
      <ExpandableToolboxDrawer
        isOpen={isToolboxDrawerOpen}
        onClose={() => setIsToolboxDrawerOpen(false)}
        onSelectTool={(toolTab) => setActiveToolTab(toolTab)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenP2P={() => setIsP2PModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenTransitionLibrary={() => setIsTransitionModalOpen(true)}
        onOpenProxyGenerator={() => setIsProxyModalOpen(true)}
        isProxyActive={proxySettings.mode === 'PROXY'}
        onToggleMotoMacro={handleToggleMotoMacro}
        isMotoMacroActive={motoSettings.isEnabled}
        windReductionActive={windReductionActive}
        onToggleWindReduction={() => setWindReductionActive(!windReductionActive)}
        anamorphicLetterboxActive={motoSettings.enableLetterbox}
        onToggleLetterbox={() => setMotoSettings(prev => ({ ...prev, enableLetterbox: !prev.enableLetterbox }))}
      />

      {/* GPU Transition Library Modal */}
      <TransitionLibraryModal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        selectedClip={selectedClip}
        onApplyTransition={(tr, placement) => {
          if (placement === 'both') {
            handleApplyTransition(tr, 'in');
            handleApplyTransition(tr, 'out');
          } else {
            handleApplyTransition(tr, placement);
          }
        }}
        onRemoveTransition={(placement) => {
          if (!selectedClipId) return;
          if (placement === 'both') {
            handleRemoveTransition(selectedClipId, 'in');
            handleRemoveTransition(selectedClipId, 'out');
          } else {
            handleRemoveTransition(selectedClipId, placement);
          }
        }}
      />

      {/* Templates Modal */}
      <TemplatePickerModalUI
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      {/* Offline-First Supabase Auth Modal with Guest Skip */}
      <SocialAuthModalUI
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onContinueAsGuest={() => setIsAuthModalOpen(false)}
      />

      {/* Wi-Fi Direct P2P Modal */}
      <OfflineP2PModalUI
        isOpen={isP2PModalOpen}
        onClose={() => setIsP2PModalOpen(false)}
        projectName={`${activeMedia.title.replace(/\s+/g, '_')}_60FPS.mp4`}
      />

      {/* Comprehensive Hardware MediaCodec Export Studio */}
      <ExportSettingsStudio
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        aspectRatio={aspectRatio}
        currentFilter={filterType}
        filterIntensity={filterIntensity}
        duration={totalDuration}
        thumbnailUrl={activeMedia.posterUrl}
        activeMediaTitle={activeMedia.title}
        onOpenP2PShare={() => {
          setIsExportModalOpen(false);
          setIsP2PModalOpen(true);
        }}
      />

      {/* Auto-Proxy & 4K Performance Generator Modal */}
      <ProxyGenerator
        isOpen={isProxyModalOpen}
        onClose={() => setIsProxyModalOpen(false)}
        proxySettings={proxySettings}
        onUpdateSettings={(updated) => setProxySettings(prev => ({ ...prev, ...updated }))}
        activeMediaTitle={activeMedia.title}
        videoDuration={totalDuration}
        deviceProfile={throttleState.profile}
        throttleState={throttleState}
      />

    </div>
  );
};

export default EditorScreen;
