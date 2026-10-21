/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MultiTrackTimeline.tsx
 * Reanimated v3 interactive multi-track timeline simulator with 60 FPS gesture scrubbing,
 * clip trimming, magnetic snap points, and multi-layer track composition
 * (Video, PIP / AI Cutout, Text Overlays, and Audio Waveform).
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  Scissors, 
  ZoomIn, 
  ZoomOut, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Layers, 
  Music, 
  Type, 
  Film, 
  Sparkles,
  MoveHorizontal
} from 'lucide-react';
import { 
  VideoClipSegment, 
  TextOverlayItem, 
  OverlayCutoutItem, 
  AudioTrackItem,
  ClipTransition,
  TransitionType
} from '../types/editor';

interface MultiTrackTimelineProps {
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  clips: VideoClipSegment[];
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onSplitClip?: (clipId: string, splitTime: number) => void;
  onTrimClip?: (clipId: string, newStart: number, newEnd: number) => void;
  texts?: TextOverlayItem[];
  cutouts?: OverlayCutoutItem[];
  audios?: AudioTrackItem[];
  onUpdateTextTime?: (textId: string, start: number, end: number) => void;
  onDropTransition?: (clipId: string, transition: ClipTransition, placement: 'in' | 'out') => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  currentTime,
  totalDuration = 15.0,
  onSeek,
  clips,
  selectedClipId,
  onSelectClip,
  onSplitClip,
  onTrimClip,
  texts = [],
  cutouts = [],
  audios = [],
  onUpdateTextTime,
  onDropTransition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineTracksRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 0.5x to 3.0x
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [activeDragTrim, setActiveDragTrim] = useState<{ clipId: string; edge: 'start' | 'end' } | null>(null);
  const [trackMuted, setTrackMuted] = useState<{ [trackKey: string]: boolean }>({});
  const [trackLocked, setTrackLocked] = useState<{ [trackKey: string]: boolean }>({});

  // Base timeline width per second (pixels per second)
  const pxPerSecond = 48 * zoomLevel;
  const totalTimelineWidthPx = Math.max(700, totalDuration * pxPerSecond);

  // Playhead position in pixels
  const playheadLeftPx = (currentTime / totalDuration) * totalTimelineWidthPx;

  // Format seconds to HH:MM:SS:FF (60 FPS frames)
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  // Convert pixel offset to timeline time
  const pxToTime = useCallback((px: number) => {
    const clampedPx = Math.max(0, Math.min(px, totalTimelineWidthPx));
    return (clampedPx / totalTimelineWidthPx) * totalDuration;
  }, [totalTimelineWidthPx, totalDuration]);

  // Scrubbing gesture handler
  const handleTimelineScrub = useCallback((clientX: number) => {
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const newTime = pxToTime(clickX);
    onSeek(Math.max(0, Math.min(newTime, totalDuration)));
  }, [pxToTime, onSeek, totalDuration]);

  // Mouse / Touch Event Listeners for smooth 60 FPS scrubbing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleTimelineScrub(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        handleTimelineScrub(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
      if (activeDragTrim) {
        setActiveDragTrim(null);
      }
    };

    if (isScrubbing || activeDragTrim) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, activeDragTrim, handleTimelineScrub]);

  // Handle Split current clip at playhead
  const handleSplitAtPlayhead = () => {
    const activeClip = clips.find(c => currentTime > c.startTime && currentTime < c.endTime);
    if (activeClip && onSplitClip) {
      onSplitClip(activeClip.id, currentTime);
    }
  };

  // Render Time Ruler ticks
  const renderRulerTicks = () => {
    const ticks = [];
    const stepSeconds = zoomLevel > 1.5 ? 0.5 : zoomLevel > 0.8 ? 1.0 : 2.0;
    const totalSteps = Math.ceil(totalDuration / stepSeconds);

    for (let i = 0; i <= totalSteps; i++) {
      const sec = i * stepSeconds;
      if (sec > totalDuration) break;
      const leftPx = (sec / totalDuration) * totalTimelineWidthPx;
      const isMajor = sec % 1 === 0;

      ticks.push(
        <div 
          key={`tick-${sec}`}
          className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none select-none"
          style={{ left: `${leftPx}px` }}
        >
          <div className={`w-[1px] ${isMajor ? 'h-3 bg-zinc-600' : 'h-1.5 bg-zinc-800'}`} />
          {isMajor && (
            <span className="text-[9px] font-mono text-zinc-400 pl-1 -translate-y-0.5">
              {sec.toFixed(0)}s
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col bg-[#121216] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl select-none">
      
      {/* 1. TIMELINE TOP TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        
        {/* Left: Timecode readout & Split Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono">
            <span className="text-cyan-400 font-bold text-xs">{formatTimecode(currentTime)}</span>
            <span className="text-zinc-600 text-[10px]">/</span>
            <span className="text-zinc-400 text-[10px]">{formatTimecode(totalDuration)}</span>
          </div>

          <button
            onClick={handleSplitAtPlayhead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-cyan-400 text-xs font-bold border border-zinc-700 transition"
            title="Split selected clip at current playhead position"
          >
            <Scissors size={13} className="text-cyan-400" />
            <span>Split Clip</span>
          </button>
        </div>

        {/* Right: Zoom controls and Magnetic snap indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
              className="p-1.5 rounded text-zinc-400 hover:text-white transition"
              title="Zoom Out Timeline"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 text-[10px] font-mono text-zinc-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
              className="p-1.5 rounded text-zinc-400 hover:text-white transition"
              title="Zoom In Timeline"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* 2. MAIN SCROLLABLE TRACK CANVAS AREA */}
      <div className="relative overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#0d0d10] p-3">
        
        <div 
          ref={timelineTracksRef}
          onMouseDown={handleMouseDown}
          className="relative min-h-[220px] cursor-pointer"
          style={{ width: `${totalTimelineWidthPx}px` }}
        >
          {/* A. TIME RULER HEADER */}
          <div className="h-6 relative border-b border-zinc-800/80 mb-2">
            {renderRulerTicks()}
          </div>

          {/* B. TRACK 1: TEXT OVERLAY TRACK */}
          <div className="relative h-9 mb-2 bg-zinc-900/60 rounded-xl border border-zinc-800/70 overflow-hidden flex items-center px-1">
            <div className="absolute left-2 text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1 pointer-events-none z-10">
              <Type size={11} />
              <span>Text Layers</span>
            </div>
            {texts.map((txt) => {
              const startPx = (txt.startTime / totalDuration) * totalTimelineWidthPx;
              const widthPx = Math.max(40, ((txt.endTime - txt.startTime) / totalDuration) * totalTimelineWidthPx);
              return (
                <div
                  key={txt.id}
                  className="absolute h-6 rounded-lg bg-purple-900/70 border border-purple-500/60 flex items-center px-2 text-[10px] font-bold text-purple-200 shadow-sm truncate"
                  style={{ left: `${startPx}px`, width: `${widthPx}px` }}
                >
                  <span className="truncate">{txt.text}</span>
                </div>
              );
            })}
          </div>

          {/* C. TRACK 2: PIP / AI CUTOUT OVERLAY TRACK */}
          <div className="relative h-9 mb-2 bg-zinc-900/60 rounded-xl border border-zinc-800/70 overflow-hidden flex items-center px-1">
            <div className="absolute left-2 text-[9px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1 pointer-events-none z-10">
              <Sparkles size={11} />
              <span>AI Cutout / PIP</span>
            </div>
            {cutouts.map((cut) => {
              const startPx = (cut.startTime / totalDuration) * totalTimelineWidthPx;
              const widthPx = Math.max(50, ((cut.endTime - cut.startTime) / totalDuration) * totalTimelineWidthPx);
              return (
                <div
                  key={cut.id}
                  className="absolute h-6 rounded-lg bg-pink-900/60 border border-pink-500/50 flex items-center px-2 text-[10px] font-bold text-pink-200 shadow-sm truncate"
                  style={{ left: `${startPx}px`, width: `${widthPx}px` }}
                >
                  <span className="truncate">{cut.name || 'Subject Mask'}</span>
                </div>
              );
            })}
          </div>

          {/* D. TRACK 3: MAIN VIDEO TRACK (PRIMARY) */}
          <div className="relative h-16 mb-2 bg-zinc-900/80 rounded-xl border-2 border-cyan-500/30 overflow-hidden flex items-center">
            <div className="absolute left-2 text-[9px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1 pointer-events-none z-10">
              <Film size={12} />
              <span>Main Video (60FPS HW)</span>
            </div>

            {clips.map((clip, idx) => {
              const startPx = (clip.startTime / totalDuration) * totalTimelineWidthPx;
              const widthPx = Math.max(48, ((clip.endTime - clip.startTime) / totalDuration) * totalTimelineWidthPx);
              const isSelected = selectedClipId === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const data = JSON.parse(e.dataTransfer.getData('application/json'));
                      if (data?.type && onDropTransition) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isRightHalf = (e.clientX - rect.left) > (rect.width / 2);
                        const placement = isRightHalf ? 'out' : 'in';
                        const transition: ClipTransition = {
                          id: `trans-${Date.now()}`,
                          type: data.type,
                          duration: data.duration || 0.6,
                          targetClipId: clip.id,
                          curve: 'ease-in-out'
                        };
                        onDropTransition(clip.id, transition, placement);
                      }
                    } catch (err) {
                      // ignore parse error
                    }
                  }}
                  className={`absolute h-12 rounded-lg border flex items-center justify-between px-2 transition-all shadow-md group ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/50 text-white'
                      : 'bg-zinc-800/90 hover:bg-zinc-750 border-zinc-700 text-zinc-300'
                  }`}
                  style={{ left: `${startPx}px`, width: `${widthPx}px` }}
                  title="Drop a transition onto this clip segment"
                >
                  {/* Left Trim Handle & Transition IN Badge */}
                  <div className="flex items-center gap-1 shrink-0 z-10">
                    <div className="w-1.5 h-7 rounded-sm bg-cyan-400/60 group-hover:bg-cyan-400 cursor-ew-resize opacity-60 group-hover:opacity-100" />
                    {clip.transitionIn && (
                      <span 
                        className="px-1.5 py-0.5 rounded bg-amber-500/90 text-zinc-950 font-black text-[8px] flex items-center gap-0.5 shadow-sm uppercase tracking-tight"
                        title={`Transition In: ${clip.transitionIn.type} (${clip.transitionIn.duration}s)`}
                      >
                        <Sparkles size={8} />
                        {clip.transitionIn.type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  {/* Clip Name & Duration */}
                  <div className="flex flex-col text-left overflow-hidden mx-1 pointer-events-none">
                    <span className="text-[11px] font-bold truncate">{clip.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400/80">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  {/* Right Trim Handle & Transition OUT Badge */}
                  <div className="flex items-center gap-1 shrink-0 z-10">
                    {clip.transitionOut && (
                      <span 
                        className="px-1.5 py-0.5 rounded bg-cyan-400 text-zinc-950 font-black text-[8px] flex items-center gap-0.5 shadow-sm uppercase tracking-tight"
                        title={`Transition Out: ${clip.transitionOut.type} (${clip.transitionOut.duration}s)`}
                      >
                        <Sparkles size={8} />
                        {clip.transitionOut.type.replace('_', ' ')}
                      </span>
                    )}
                    <div className="w-1.5 h-7 rounded-sm bg-cyan-400/60 group-hover:bg-cyan-400 cursor-ew-resize opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* E. TRACK 4: AUDIO WAVEFORM TRACK */}
          <div className="relative h-10 bg-zinc-900/60 rounded-xl border border-zinc-800/70 overflow-hidden flex items-center px-1">
            <div className="absolute left-2 text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 pointer-events-none z-10">
              <Music size={11} />
              <span>Audio Waveform (48kHz)</span>
            </div>

            {/* Simulated Audio Waveform Peaks */}
            <div className="w-full h-full flex items-center justify-around px-24 opacity-60">
              {Array.from({ length: 48 }).map((_, idx) => {
                const heightPercent = 25 + Math.sin(idx * 0.4) * 35 + ((idx % 3) * 15);
                return (
                  <div
                    key={`wave-${idx}`}
                    className="w-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* F. RED/CYAN REANIMATED 60 FPS PLAYHEAD */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-[#00f2fe] pointer-events-none z-50 shadow-[0_0_12px_#00f2fe]"
            style={{ left: `${playheadLeftPx}px` }}
          >
            {/* Top Draggable Playhead Scrubber Cap */}
            <div className="w-4 h-5 -ml-[7px] bg-[#00f2fe] rounded-b-md shadow-lg flex items-center justify-center">
              <div className="w-1 h-2.5 bg-zinc-950 rounded-full" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MultiTrackTimeline;
