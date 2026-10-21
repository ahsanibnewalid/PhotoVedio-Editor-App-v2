import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Scissors, 
  Gauge, 
  Sparkles, 
  Type, 
  Download, 
  RotateCcw,
  RotateCw,
  History,
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Sliders,
  FolderOpen,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Info,
  Layers,
  Wand2,
  SlidersHorizontal,
  Film,
  Music,
  Video,
  Clapperboard,
  ScanFace
} from 'lucide-react';
import { 
  AspectRatioType, 
  FilterType, 
  LutPresetType,
  VideoClipSegment, 
  TextOverlayItem, 
  OverlayCutoutItem, 
  AudioTrackItem 
} from '../types/editor';
import { SAMPLE_MEDIA_LIST, SampleMediaItem } from '../utils/sampleMedia';
import { SkiaShaderRenderer } from './SkiaShaderRenderer';
import { InteractiveTimeline } from './InteractiveTimeline';
import { ExportStudioModalUI } from './ExportStudioModalUI';
import { useTimelineHistory } from '../hooks/useTimelineHistory';

interface NativeEditorSimulatorProps {
  onOpenCodeInspector?: () => void;
}

export const NativeEditorSimulator: React.FC<NativeEditorSimulatorProps> = ({
  onOpenCodeInspector,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active Media selection
  const [activeMedia, setActiveMedia] = useState<SampleMediaItem>(SAMPLE_MEDIA_LIST[0]);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(15.0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Active Tools: split | speed | filter | lut | aicutout | text | audio | media
  const [activeTool, setActiveTool] = useState<'split' | 'speed' | 'filter' | 'lut' | 'aicutout' | 'text' | 'audio' | 'media' | null>('lut');
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');
  const [editingText, setEditingText] = useState<string>('NEON RUNNER');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string | null>(null);
  const [currentFps, setCurrentFps] = useState<number>(60.0);

  // Initial timeline composition snapshot (4-Tracks)
  const initialClips: VideoClipSegment[] = [
    { id: 'clip-1', name: 'Intro Cinematic', startTime: 0, endTime: 7.5, duration: 7.5, color: '#00f2fe' },
    { id: 'clip-2', name: 'Action Climax', startTime: 7.5, endTime: 15.0, duration: 7.5, color: '#38bdf8' },
  ];

  const initialTexts: TextOverlayItem[] = [
    {
      id: 'txt-1',
      text: 'CYBER CITY 2026',
      startTime: 0.5,
      endTime: 6.5,
      xPercent: 50,
      yPercent: 32,
      fontSize: 22,
      color: '#ffffff',
      glow: true,
      layerPosition: 'BEHIND_SUBJECT', // Placed behind the AI subject cutout!
    },
    {
      id: 'txt-2',
      text: '#CAPCUT_NATIVE',
      startTime: 7.0,
      endTime: 14.5,
      xPercent: 50,
      yPercent: 78,
      fontSize: 16,
      color: '#00f2fe',
      glow: true,
      layerPosition: 'IN_FRONT_OF_SUBJECT',
    }
  ];

  const initialCutouts: OverlayCutoutItem[] = [
    {
      id: 'cutout-1',
      name: 'Person 01 (ML Kit)',
      type: 'AI_CUTOUT',
      startTime: 0,
      endTime: 15.0,
      maskActive: true,
      depthOfFieldBlur: 8, // 8px background blur behind subject
      subjectGlow: true,
      glowColor: '#00f2fe',
      xPercent: 50,
      yPercent: 55,
      scale: 1.0,
    }
  ];

  const initialAudio: AudioTrackItem = {
    id: 'audio-master',
    title: 'Synthwave Beats 128BPM',
    startTime: 0,
    duration: 15.0,
    volume: 1.0,
    fadeInSeconds: 1.0,
    fadeOutSeconds: 1.5,
    muted: false,
  };

  // State Management with Undo/Redo
  const {
    state,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    past,
    future,
    jumpToHistoryIndex,
    resetHistory,
    lastUndoDescription,
    nextRedoDescription,
  } = useTimelineHistory({
    initialState: {
      videoClips: initialClips,
      textOverlays: initialTexts,
      overlayCutouts: initialCutouts,
      audioTrack: initialAudio,
      activeFilter: 'NORMAL',
      activeLut: 'TEAL_ORANGE', // Default cinematic Hollywood LUT
      filterIntensity: 1.0,
      playbackSpeed: 1.0,
      aspectRatio: '9:16',
      anamorphicLetterbox: false,
      depthOfFieldBlur: 8,
    }
  });

  // Keep playback speed in sync with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = state.playbackSpeed;
    }
  }, [state.playbackSpeed]);

  // Keyboard Shortcuts for Undo & Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Sync video duration on load
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 15.0;
      setTotalDuration(dur);
      resetHistory({
        videoClips: [
          { id: 'clip-1', name: `${activeMedia.title} (Part A)`, startTime: 0, endTime: dur / 2, duration: dur / 2, color: '#00f2fe' },
          { id: 'clip-2', name: `${activeMedia.title} (Part B)`, startTime: dur / 2, endTime: dur, duration: dur / 2, color: '#38bdf8' },
        ],
        textOverlays: state.textOverlays,
        overlayCutouts: state.overlayCutouts,
        audioTrack: { ...state.audioTrack, duration: dur },
        activeFilter: 'NORMAL',
        activeLut: 'TEAL_ORANGE',
        filterIntensity: 1.0,
        playbackSpeed: 1.0,
        aspectRatio: state.aspectRatio,
        anamorphicLetterbox: state.anamorphicLetterbox,
        depthOfFieldBlur: state.depthOfFieldBlur,
      }, `Loaded "${activeMedia.title}"`);
    }
  };

  // Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setCurrentFps(59.7 + Math.random() * 0.4);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.log('Play interrupted', e));
      setIsPlaying(true);
    }
  };

  const handleSeek = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, []);

  // Speed Change with Variable Curves
  const handleSpeedChange = (speed: number) => {
    pushState(`Set Speed to ${speed}x`, { playbackSpeed: speed });
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Split clip at playhead
  const handleSplitClip = () => {
    const targetClipIndex = state.videoClips.findIndex(
      clip => currentTime > clip.startTime + 0.4 && currentTime < clip.endTime - 0.4
    );

    if (targetClipIndex === -1) return;

    const target = state.videoClips[targetClipIndex];
    const firstHalf: VideoClipSegment = {
      ...target,
      id: `${target.id}_a`,
      endTime: currentTime,
      duration: currentTime - target.startTime,
      name: `${target.name} [Trim A]`,
    };

    const secondHalf: VideoClipSegment = {
      ...target,
      id: `${target.id}_b`,
      startTime: currentTime,
      duration: target.endTime - currentTime,
      name: `${target.name} [Trim B]`,
      color: '#06b6d4',
    };

    const updated = [...state.videoClips];
    updated.splice(targetClipIndex, 1, firstHalf, secondHalf);

    pushState(`Split clip at ${currentTime.toFixed(1)}s`, { videoClips: updated });
    setSelectedClipId(secondHalf.id);
  };

  // 3D LUT Presets
  const handleLutChange = (lut: LutPresetType) => {
    pushState(`Applied 3D LUT: ${lut}`, { activeLut: lut });
  };

  // One-Tap Auto Cinematic Grade
  const handleAutoCinematicGrade = () => {
    pushState(`One-Tap Auto Cinematic Grade Applied`, { 
      activeLut: 'AUTO_CINEMATIC',
      filterIntensity: 1.1,
      anamorphicLetterbox: true,
      depthOfFieldBlur: 10,
    });
  };

  // Toggle Anamorphic 2.39:1 Cinema Bars
  const handleToggleAnamorphic = () => {
    const newVal = !state.anamorphicLetterbox;
    pushState(newVal ? 'Enabled 2.39:1 Cinema Letterbox' : 'Disabled Cinema Letterbox', { 
      anamorphicLetterbox: newVal 
    });
  };

  // AI Cutout Mask Toggle
  const handleToggleAiCutout = () => {
    const isCurrentlyActive = state.overlayCutouts[0]?.maskActive;
    const updated = state.overlayCutouts.map(c => ({
      ...c,
      maskActive: !isCurrentlyActive
    }));
    pushState(!isCurrentlyActive ? 'Enabled On-Device AI Cutout' : 'Disabled AI Cutout Mask', { 
      overlayCutouts: updated 
    });
  };

  // AI Depth-of-field Blur
  const handleDofBlurChange = (val: number) => {
    const updated = state.overlayCutouts.map(c => ({
      ...c,
      depthOfFieldBlur: val
    }));
    pushState(`Adjusted DoF Blur to ${val}px`, { 
      depthOfFieldBlur: val,
      overlayCutouts: updated 
    });
  };

  // Text Layer Position (Behind vs In Front Of Subject)
  const handleToggleTextLayerPosition = (txtId: string) => {
    const updated = state.textOverlays.map(txt => {
      if (txt.id === txtId) {
        const nextPos: 'BEHIND_SUBJECT' | 'IN_FRONT_OF_SUBJECT' = 
          txt.layerPosition === 'BEHIND_SUBJECT' ? 'IN_FRONT_OF_SUBJECT' : 'BEHIND_SUBJECT';
        return { ...txt, layerPosition: nextPos };
      }
      return txt;
    });
    pushState('Toggled Text Layer (Behind/Front Subject)', { textOverlays: updated });
  };

  // Audio Mixer Updates
  const handleAudioVolumeChange = (newVol: number) => {
    pushState(`Set Audio Volume to ${(newVol * 100).toFixed(0)}%`, {
      audioTrack: { ...state.audioTrack, volume: newVol }
    });
  };

  const handleAudioFadeChange = (fadeIn: number, fadeOut: number) => {
    pushState(`Updated Audio Fade In: ${fadeIn}s, Out: ${fadeOut}s`, {
      audioTrack: { ...state.audioTrack, fadeInSeconds: fadeIn, fadeOutSeconds: fadeOut }
    });
  };

  // Filter change
  const handleFilterChange = (newFilter: FilterType) => {
    pushState(`Applied ${newFilter} shader`, { activeFilter: newFilter });
  };

  // Aspect ratio
  const handleAspectRatioChange = (newRatio: AspectRatioType) => {
    pushState(`Switched aspect ratio to ${newRatio}`, { aspectRatio: newRatio });
  };

  // Switch Media Clip
  const handleSelectMedia = (item: SampleMediaItem) => {
    setActiveMedia(item);
    setCustomVideoUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Custom user video upload
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Add new caption
  const handleAddCaption = () => {
    const newId = `txt-${Date.now()}`;
    const newTextItem: TextOverlayItem = {
      id: newId,
      text: editingText || 'NEW CAPTION',
      startTime: currentTime,
      endTime: Math.min(totalDuration, currentTime + 3.0),
      xPercent: 50,
      yPercent: 50,
      fontSize: 20,
      color: '#ffffff',
      glow: true,
      layerPosition: 'BEHIND_SUBJECT',
    };
    pushState(`Added caption "${newTextItem.text}" at ${currentTime.toFixed(1)}s`, {
      textOverlays: [...state.textOverlays, newTextItem],
    });
  };

  // Delete caption
  const handleDeleteCaption = (id: string) => {
    const target = state.textOverlays.find(t => t.id === id);
    const filtered = state.textOverlays.filter(t => t.id !== id);
    pushState(`Deleted caption "${target?.text || id}"`, {
      textOverlays: filtered,
    });
  };

  // Open Export Modal with high-fidelity frame capture
  const handleOpenExportModal = () => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedFrameUrl(dataUrl);
        } else {
          setCapturedFrameUrl(activeMedia.posterUrl);
        }
      } catch (err) {
        setCapturedFrameUrl(activeMedia.posterUrl);
      }
    } else {
      setCapturedFrameUrl(activeMedia.posterUrl);
    }
    setIsExportModalOpen(true);
  };

  // Dimensions based on aspect ratio
  const getViewportDimensions = () => {
    if (state.aspectRatio === '9:16') {
      return isPhoneFrame ? { width: 220, height: 390 } : { width: 260, height: 462 };
    } else if (state.aspectRatio === '16:9') {
      return isPhoneFrame ? { width: 340, height: 191 } : { width: 440, height: 248 };
    } else if (state.aspectRatio === '4:5') {
      return isPhoneFrame ? { width: 240, height: 300 } : { width: 300, height: 375 };
    } else {
      // 1:1 Square
      return isPhoneFrame ? { width: 280, height: 280 } : { width: 340, height: 340 };
    }
  };

  const viewportDims = getViewportDimensions();

  // Format time MM:SS.SS
  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const isCutoutActive = state.overlayCutouts[0]?.maskActive;

  return (
    <div className="flex flex-col bg-[#09090b] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl select-none">
      
      {/* 1. TOP APP BAR */}
      <div className="h-14 px-4 bg-[#0c0c0e] border-b border-zinc-800 flex items-center justify-between gap-2">
        
        {/* Left: Project title & Hardware Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
            <h2 className="text-sm font-bold text-white tracking-tight hidden sm:block">
              NeonReel_Android_01
            </h2>
          </div>
          
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
            <span className="text-[10px] font-mono font-bold text-cyan-400">
              {currentFps.toFixed(1)} FPS
            </span>
            <span className="text-[9px] text-zinc-400 uppercase font-semibold">
              MediaCodec • JSI NPU
            </span>
          </div>
        </div>

        {/* Center: Aspect Ratio & UNDO / REDO / ANAMORPHIC CONTROLS */}
        <div className="flex items-center gap-2">
          
          {/* UNDO / REDO GROUP */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg flex items-center gap-1 text-xs transition ${
                canUndo
                  ? 'text-zinc-200 hover:text-cyan-400 hover:bg-zinc-800 active:scale-95'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
              title={lastUndoDescription ? `Undo: ${lastUndoDescription} (Ctrl+Z)` : 'Undo (Ctrl+Z)'}
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg flex items-center gap-1 text-xs transition ${
                canRedo
                  ? 'text-zinc-200 hover:text-cyan-400 hover:bg-zinc-800 active:scale-95'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
              title={nextRedoDescription ? `Redo: ${nextRedoDescription} (Ctrl+Y)` : 'Redo (Ctrl+Y)'}
            >
              <RotateCw size={15} />
            </button>

            <div className="h-4 w-px bg-zinc-800 mx-0.5" />

            {/* History Panel Drawer Toggle */}
            <button
              onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
              className={`px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs transition ${
                isHistoryDrawerOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Toggle Timeline Action History"
            >
              <History size={14} />
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                {past.length}
              </span>
            </button>
          </div>

          {/* 2.39:1 Cinema Scope Letterbox Toggle */}
          <button
            onClick={handleToggleAnamorphic}
            className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              state.anamorphicLetterbox
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 2.39:1 Anamorphic Cinema Scope Letterbox"
          >
            <Clapperboard size={13} className={state.anamorphicLetterbox ? 'text-amber-400' : 'text-zinc-400'} />
            <span className="text-[10px] font-mono hidden sm:inline">2.39:1 Cinema</span>
          </button>

          {/* Aspect Ratio Selector (9:16, 16:9, 1:1, 4:5) */}
          <div className="hidden sm:flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            {(['9:16', '16:9', '1:1', '4:5'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleAspectRatioChange(ratio)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  state.aspectRatio === ratio
                    ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

        </div>

        {/* Right: Phone Frame Toggle & Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            title={isPhoneFrame ? 'Switch to Studio View' : 'Switch to Android Device Frame'}
          >
            {isPhoneFrame ? <Maximize2 size={16} /> : <Smartphone size={16} />}
          </button>

          <button
            onClick={handleOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-zinc-950 text-xs font-extrabold tracking-wide shadow-[0_0_15px_rgba(0,242,254,0.35)] transition"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ACTION HISTORY DRAWER (Time Travel) */}
      {isHistoryDrawerOpen && (
        <div className="bg-[#121215] border-b border-zinc-800 px-4 py-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History size={14} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Timeline History ({past.length} past, {future.length} future)
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Click any step to time-travel directly
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {past.map((snap, idx) => (
              <button
                key={idx}
                onClick={() => jumpToHistoryIndex(idx)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left shrink-0 transition flex flex-col gap-0.5 group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-cyan-400" />
                  <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
                    {snap.actionDescription}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500">
                  Step #{idx + 1}
                </span>
              </button>
            ))}

            <div className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-400 text-left shrink-0 shadow-[0_0_12px_rgba(0,242,254,0.2)] flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
                <span className="text-[11px] font-bold text-cyan-300">
                  {state.actionDescription}
                </span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 font-semibold uppercase">
                Current Active State
              </span>
            </div>

            {future.map((snap, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-left shrink-0 opacity-60 flex flex-col gap-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                  <span className="text-[11px] font-medium text-zinc-400">
                    {snap.actionDescription}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600">
                  Redoable
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PREVIEW MONITOR AREA (Viewport with Skia Shaders, Depth of Field, AI Subject Cutout) */}
      <div className="relative flex-1 min-h-[390px] lg:min-h-[450px] bg-[#050507] flex items-center justify-center p-4 overflow-hidden">
        
        {/* Ambient background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Device Frame or Canvas */}
        <div 
          className={`relative transition-all duration-300 flex items-center justify-center ${
            isPhoneFrame 
              ? 'p-2 rounded-[36px] bg-[#1a1a1f] border-4 border-zinc-700 shadow-2xl ring-1 ring-zinc-800' 
              : 'rounded-xl overflow-hidden shadow-2xl border border-zinc-800'
          }`}
        >
          {isPhoneFrame && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-3.5 h-3.5 rounded-full bg-black border border-zinc-700/60" />
          )}

          {/* Viewport Canvas Wrapper */}
          <div
            className="relative rounded-[24px] overflow-hidden bg-black flex items-center justify-center shadow-inner"
            style={{
              width: `${viewportDims.width}px`,
              height: `${viewportDims.height}px`,
            }}
          >
            {/* LAYER 1: Main Video Element with Depth-of-Field background blur */}
            <video
              ref={videoRef}
              src={customVideoUrl || activeMedia.videoUrl}
              poster={activeMedia.posterUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              muted={isAudioMuted}
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover transition-all"
              style={{
                filter: `${
                  state.activeFilter === 'GRAYSCALE'
                    ? `grayscale(${100 * state.filterIntensity}%) contrast(1.1)`
                    : state.activeFilter === 'SEPIA'
                    ? `sepia(${100 * state.filterIntensity}%) saturate(1.2)`
                    : state.activeFilter === 'NEON_GLOW'
                    ? `contrast(1.25) saturate(1.4) brightness(1.05)`
                    : 'none'
                } ${isCutoutActive && state.depthOfFieldBlur > 0 ? `blur(${state.depthOfFieldBlur * 0.4}px)` : ''}`,
              }}
            />

            {/* LAYER 2: Text Overlays PLACED BEHIND SUBJECT */}
            {state.textOverlays.map((txt) => {
              if (currentTime >= txt.startTime && currentTime <= txt.endTime && txt.layerPosition === 'BEHIND_SUBJECT') {
                return (
                  <div
                    key={txt.id}
                    className="absolute z-10 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${txt.xPercent}%`,
                      top: `${txt.yPercent}%`,
                    }}
                  >
                    <div className="px-3 py-1 rounded bg-black/60 backdrop-blur-sm border border-cyan-400/40 shadow-lg">
                      <span
                        className="font-black tracking-wider text-center block uppercase"
                        style={{
                          fontSize: `${txt.fontSize}px`,
                          color: txt.color,
                          textShadow: txt.glow ? '0 0 10px #00f2fe, 0 0 20px #00f2fe' : 'none',
                        }}
                      >
                        {txt.text}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* LAYER 3: ON-DEVICE AI SUBJECT CUTOUT OVERLAY */}
            {isCutoutActive && (
              <div 
                className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center"
                style={{
                  maskImage: `radial-gradient(circle at 50% 55%, black 42%, transparent 72%)`,
                  WebkitMaskImage: `radial-gradient(circle at 50% 55%, black 42%, transparent 72%)`,
                }}
              >
                {/* Foreground isolated cutout subject */}
                <img
                  src={activeMedia.posterUrl}
                  alt="AI Cutout Foreground Subject"
                  className="w-full h-full object-cover"
                  style={{
                    filter: `drop-shadow(0 0 12px ${state.overlayCutouts[0].glowColor}) contrast(1.15) brightness(1.05)`,
                  }}
                />
              </div>
            )}

            {/* LAYER 4: Text Overlays PLACED IN FRONT OF SUBJECT */}
            {state.textOverlays.map((txt) => {
              if (currentTime >= txt.startTime && currentTime <= txt.endTime && txt.layerPosition === 'IN_FRONT_OF_SUBJECT') {
                return (
                  <div
                    key={txt.id}
                    className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${txt.xPercent}%`,
                      top: `${txt.yPercent}%`,
                    }}
                  >
                    <div className="px-3 py-1 rounded bg-black/60 backdrop-blur-sm border border-cyan-400/40 shadow-lg">
                      <span
                        className="font-black tracking-wider text-center block uppercase"
                        style={{
                          fontSize: `${txt.fontSize}px`,
                          color: txt.color,
                          textShadow: txt.glow ? '0 0 10px #00f2fe, 0 0 20px #00f2fe' : 'none',
                        }}
                      >
                        {txt.text}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* LAYER 5: Skia GPU Shader Filter + 3D LUT + 2.39:1 Letterbox */}
            <SkiaShaderRenderer
              filterType={state.activeFilter}
              activeLut={state.activeLut}
              filterIntensity={state.filterIntensity}
              width={viewportDims.width}
              height={viewportDims.height}
              anamorphicLetterbox={state.anamorphicLetterbox}
            />

            {/* Center Play / Pause Floating Trigger */}
            <button
              onClick={togglePlayPause}
              className="absolute z-35 p-3.5 rounded-full bg-black/65 hover:bg-black/80 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>

            {/* Bottom Timecode & Badges */}
            <div className="absolute bottom-2.5 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
              <div className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-white/90">
                {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
              </div>

              <div className="flex items-center gap-1.5">
                {isCutoutActive && (
                  <div className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[9px] font-bold text-emerald-300">
                    AI NPU CUTOUT
                  </div>
                )}
                <div className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[9px] font-bold text-cyan-300">
                  {state.activeLut !== 'NONE' ? state.activeLut : state.activeFilter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-TRACK INTERACTIVE TIMELINE (4 Native Tracks) */}
      <InteractiveTimeline
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeek={handleSeek}
        videoClips={state.videoClips}
        textOverlays={state.textOverlays}
        overlayCutouts={state.overlayCutouts}
        audioTrack={state.audioTrack}
        selectedClipId={selectedClipId}
        onSelectClip={setSelectedClipId}
        onSplitClip={handleSplitClip}
        isAudioMuted={isAudioMuted}
        onToggleMute={() => setIsAudioMuted(!isAudioMuted)}
      />

      {/* 4. BOTTOM EDITING TOOLBAR */}
      <div className="bg-[#09090b] border-t border-zinc-800">
        
        {/* Main Tool Categories */}
        <div className="h-14 px-3 flex items-center justify-around overflow-x-auto">
          
          {/* Split */}
          <button
            onClick={handleSplitClip}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-cyan-400 transition shrink-0 px-2"
          >
            <Scissors size={17} className="text-cyan-400" />
            <span className="text-[10px] font-bold">Split</span>
          </button>

          {/* AI Cutout */}
          <button
            onClick={() => setActiveTool(activeTool === 'aicutout' ? null : 'aicutout')}
            className={`flex flex-col items-center justify-center gap-1 transition shrink-0 px-2 ${
              activeTool === 'aicutout' ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ScanFace size={17} className={isCutoutActive ? 'text-emerald-400' : 'text-zinc-400'} />
            <span className="text-[10px] font-bold">AI Cutout</span>
          </button>

          {/* 3D LUTs */}
          <button
            onClick={() => setActiveTool(activeTool === 'lut' ? null : 'lut')}
            className={`flex flex-col items-center justify-center gap-1 transition shrink-0 px-2 ${
              activeTool === 'lut' ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal size={17} />
            <span className="text-[10px] font-bold">3D LUTs</span>
          </button>

          {/* Auto Grade */}
          <button
            onClick={handleAutoCinematicGrade}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-amber-400 transition shrink-0 px-2"
            title="One-tap Auto Cinematic Grade"
          >
            <Wand2 size={17} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-300">Auto Grade</span>
          </button>

          {/* Speed */}
          <button
            onClick={() => setActiveTool(activeTool === 'speed' ? null : 'speed')}
            className={`flex flex-col items-center justify-center gap-1 transition shrink-0 px-2 ${
              activeTool === 'speed' ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gauge size={17} />
            <span className="text-[10px] font-bold">Speed ({state.playbackSpeed}x)</span>
          </button>

          {/* Audio Mixer */}
          <button
            onClick={() => setActiveTool(activeTool === 'audio' ? null : 'audio')}
            className={`flex flex-col items-center justify-center gap-1 transition shrink-0 px-2 ${
              activeTool === 'audio' ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music size={17} />
            <span className="text-[10px] font-bold">Audio</span>
          </button>

          {/* Text */}
          <button
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className={`flex flex-col items-center justify-center gap-1 transition shrink-0 px-2 ${
              activeTool === 'text' ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Type size={17} />
            <span className="text-[10px] font-bold">Text ({state.textOverlays.length})</span>
          </button>

          {/* Media / Clips */}
          <button
            onClick={() => setActiveTool(activeTool === 'media' ? null : 'media')}
            className={`flex flex-col items-center justify-center gap-1 transition shrink-0 px-2 ${
              activeTool === 'media' ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderOpen size={17} />
            <span className="text-[10px] font-bold">Clips</span>
          </button>
        </div>

        {/* Sub-tool panels */}
        {/* SUBTOOL 1: ON-DEVICE AI CUTOUT */}
        {activeTool === 'aicutout' && (
          <div className="p-3 bg-[#121215] border-t border-zinc-800/80 space-y-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanFace size={15} className="text-emerald-400" />
                <span className="text-[11px] font-bold uppercase text-white tracking-wider">
                  Google ML Kit On-Device Segmentation (Offline NPU)
                </span>
              </div>
              <button
                onClick={handleToggleAiCutout}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isCutoutActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{isCutoutActive ? 'Cutout Active' : 'Enable Cutout'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
              {/* Depth of field background blur */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-300 font-semibold mb-1">
                  <span>Depth-of-Field Blur (Background)</span>
                  <span className="font-mono text-cyan-400">{state.depthOfFieldBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={state.depthOfFieldBlur}
                  onChange={(e) => handleDofBlurChange(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Text Layer Ordering with AI Subject */}
              <div>
                <span className="block text-[11px] text-zinc-300 font-semibold mb-1">
                  Text Layering Relative to Subject
                </span>
                <div className="flex gap-2">
                  {state.textOverlays.map(txt => (
                    <button
                      key={txt.id}
                      onClick={() => handleToggleTextLayerPosition(txt.id)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold font-mono border transition ${
                        txt.layerPosition === 'BEHIND_SUBJECT'
                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {txt.text.slice(0, 10)}: {txt.layerPosition === 'BEHIND_SUBJECT' ? 'Behind' : 'In Front'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTOOL 2: 3D LUTS & COLOR GRADING */}
        {activeTool === 'lut' && (
          <div className="p-3 bg-[#121215] border-t border-zinc-800/80 space-y-2.5 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                3D LUT HALD Color Grading Engine
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">Intensity</span>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={state.filterIntensity}
                  onChange={(e) => pushState('Adjusted LUT Intensity', { filterIntensity: parseFloat(e.target.value) })}
                  className="w-20 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'NONE', name: 'Original', desc: 'Rec. 709' },
                { id: 'TEAL_ORANGE', name: 'Teal & Orange', desc: 'Hollywood' },
                { id: 'MOODY_WARM', name: 'Moody Warm', desc: 'Golden Hour' },
                { id: 'FILM_GRAIN', name: 'Film Grain', desc: '35mm Film' },
                { id: 'MATRIX_GREEN', name: 'Matrix Green', desc: 'Cyberpunk' },
                { id: 'ANAMORPHIC_VIGNETTE', name: 'Anamorphic Vig', desc: 'Optical' },
              ].map((lut) => (
                <button
                  key={lut.id}
                  onClick={() => handleLutChange(lut.id as LutPresetType)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                    state.activeLut === lut.id
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.2)] font-bold'
                      : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-400'
                  }`}
                >
                  <span className="text-[11px] font-bold">{lut.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">{lut.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SUBTOOL 3: VARIABLE SPEED CURVE */}
        {activeTool === 'speed' && (
          <div className="p-3 bg-[#121215] border-t border-zinc-800/80 flex items-center justify-center gap-2 overflow-x-auto animate-in slide-in-from-bottom-2">
            {[0.2, 0.5, 1.0, 2.0, 4.0, 10.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition shrink-0 ${
                  state.playbackSpeed === rate
                    ? 'bg-cyan-400 text-zinc-950 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {rate}x {rate === 0.2 ? '(Slow-Mo)' : rate === 10.0 ? '(Hyper)' : ''}
              </button>
            ))}
          </div>
        )}

        {/* SUBTOOL 4: MULTI-TRACK AUDIO MIXER */}
        {activeTool === 'audio' && (
          <div className="p-3 bg-[#121215] border-t border-zinc-800/80 space-y-2.5 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                Multi-Track Audio Mixer & Envelopes
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {state.audioTrack.title}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
              {/* Volume Slider */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Track Gain</span>
                  <span className="font-mono text-emerald-400 font-bold">{(state.audioTrack.volume * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={state.audioTrack.volume}
                  onChange={(e) => handleAudioVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Fade-in envelope */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Fade-In</span>
                  <span className="font-mono text-emerald-400">{state.audioTrack.fadeInSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={state.audioTrack.fadeInSeconds}
                  onChange={(e) => handleAudioFadeChange(parseFloat(e.target.value), state.audioTrack.fadeOutSeconds)}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Fade-out envelope */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Fade-Out</span>
                  <span className="font-mono text-emerald-400">{state.audioTrack.fadeOutSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={state.audioTrack.fadeOutSeconds}
                  onChange={(e) => handleAudioFadeChange(state.audioTrack.fadeInSeconds, parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTOOL 5: TEXT */}
        {activeTool === 'text' && (
          <div className="p-3 bg-[#121215] border-t border-zinc-800/80 space-y-2.5 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                Animated Text & Subtitle Engine
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Can Layer Behind/Above AI Subject
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                placeholder="Enter caption text..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition font-mono uppercase"
              />
              <button
                onClick={handleAddCaption}
                className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus size={14} />
                <span>Add at {currentTime.toFixed(1)}s</span>
              </button>
            </div>

            {/* List of text overlays */}
            {state.textOverlays.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                {state.textOverlays.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 shrink-0 text-xs"
                  >
                    <Type size={12} className="text-amber-400" />
                    <span className="font-semibold text-zinc-200 uppercase font-mono max-w-[100px] truncate">
                      {item.text}
                    </span>
                    <button
                      onClick={() => handleToggleTextLayerPosition(item.id)}
                      className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                        item.layerPosition === 'BEHIND_SUBJECT'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.layerPosition === 'BEHIND_SUBJECT' ? 'Behind' : 'Front'}
                    </button>
                    <button
                      onClick={() => handleDeleteCaption(item.id)}
                      className="p-0.5 rounded text-zinc-500 hover:text-rose-400 transition"
                      title="Delete Caption"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTOOL 6: MEDIA / CLIPS */}
        {activeTool === 'media' && (
          <div className="p-3 bg-[#121215] border-t border-zinc-800/80 space-y-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                Select Native Asset / Clip
              </span>

              <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition border border-zinc-700">
                <FolderOpen size={13} className="text-cyan-400" />
                <span>Pick Custom Video</span>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleCustomFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_MEDIA_LIST.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectMedia(item)}
                  className={`p-2 rounded-xl border text-left transition relative overflow-hidden flex flex-col gap-1 ${
                    activeMedia.id === item.id && !customVideoUrl
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                      : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-xs font-bold text-white truncate">
                    {item.title}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Studio Modal */}
      <ExportStudioModalUI
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        aspectRatio={state.aspectRatio}
        currentFilter={state.activeFilter}
        filterIntensity={state.filterIntensity}
        duration={totalDuration}
        thumbnailUrl={capturedFrameUrl || activeMedia.posterUrl}
        textOverlays={state.textOverlays}
        activeMediaTitle={activeMedia.title}
      />
    </div>
  );
};
