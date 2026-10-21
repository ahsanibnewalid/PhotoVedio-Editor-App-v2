import React, { useRef, useState } from 'react';
import { 
  Film, 
  Music, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Scissors, 
  Volume2, 
  VolumeX,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';
import { VideoClipSegment, TextOverlayItem, OverlayCutoutItem, AudioTrackItem } from '../types/editor';

interface InteractiveTimelineProps {
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  videoClips: VideoClipSegment[];
  textOverlays: TextOverlayItem[];
  overlayCutouts: OverlayCutoutItem[];
  audioTrack: AudioTrackItem;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onSplitClip: () => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  currentTime,
  totalDuration,
  onSeek,
  videoClips,
  textOverlays,
  overlayCutouts,
  audioTrack,
  selectedClipId,
  onSelectClip,
  onSplitClip,
  isAudioMuted,
  onToggleMute,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // Dynamic pixels per second based on zoom level
  const basePixelsPerSec = 44;
  const pixelsPerSec = basePixelsPerSec * zoomLevel;
  const timelineContentWidth = Math.max(650, totalDuration * pixelsPerSec + 140);

  // Playhead position in px
  const playheadLeftPx = currentTime * pixelsPerSec;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsScrubbing(true);
    handleScrub(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    handleScrub(e);
  };

  const handlePointerUp = () => {
    setIsScrubbing(false);
  };

  const handleScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    // Account for 76px track label header
    const clickX = e.clientX - rect.left + scrollLeft - 76;
    const newTime = Math.max(0, Math.min(totalDuration, clickX / pixelsPerSec));
    onSeek(newTime);
  };

  // Generate ruler markers
  const ticks = Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => i);

  return (
    <div 
      className="flex flex-col bg-[#121215] border-t border-zinc-800 select-none text-xs"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#09090b] border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
            4-Track Native Timeline
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-400 font-semibold border border-cyan-500/20">
            {currentTime.toFixed(2)}s / {totalDuration.toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSplitClip}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium border border-zinc-700 transition"
            title="Split clip at playhead"
          >
            <Scissors size={12} className="text-cyan-400" />
            <span>Split</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-1 rounded text-[11px] border transition ${
              isAudioMuted 
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-400' 
                : 'bg-zinc-800/80 border-zinc-700 text-emerald-400'
            }`}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <div className="h-3 w-px bg-zinc-800 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] text-zinc-500 font-mono w-7 text-center">
            {zoomLevel.toFixed(1)}x
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Main 4-Tracks Container with Scroll */}
      <div 
        ref={containerRef}
        className="relative overflow-x-auto overflow-y-hidden cursor-crosshair h-56 flex"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Left Fixed 4-Track Header Badges */}
        <div className="sticky left-0 z-30 w-20 bg-[#09090b]/95 backdrop-blur-sm border-r border-zinc-800 flex flex-col shrink-0">
          <div className="h-6 border-b border-zinc-800/80 flex items-center justify-center text-[10px] font-mono text-zinc-500">
            TC RULER
          </div>

          {/* Track 1: Text */}
          <div className="h-10 border-b border-zinc-800/50 flex flex-col items-center justify-center gap-0.5 text-zinc-400 px-1 bg-amber-950/5">
            <div className="flex items-center gap-1">
              <Type size={11} className="text-amber-400" />
              <span className="text-[9px] font-bold tracking-tight">T1: TEXT</span>
            </div>
            <span className="text-[8px] text-zinc-500 font-mono">Subtitles</span>
          </div>

          {/* Track 2: Overlay / AI Cutout */}
          <div className="h-11 border-b border-zinc-800/50 flex flex-col items-center justify-center gap-0.5 text-zinc-400 px-1 bg-cyan-950/10">
            <div className="flex items-center gap-1">
              <Sparkles size={11} className="text-cyan-400" />
              <span className="text-[9px] font-bold tracking-tight">T2: CUTOUT</span>
            </div>
            <span className="text-[8px] text-cyan-400/80 font-mono">ML Kit NPU</span>
          </div>

          {/* Track 3: Video Clips */}
          <div className="h-13 border-b border-zinc-800/50 flex flex-col items-center justify-center gap-0.5 text-zinc-400 px-1 bg-blue-950/10">
            <div className="flex items-center gap-1">
              <Film size={11} className="text-blue-400" />
              <span className="text-[9px] font-bold tracking-tight">T3: VIDEO</span>
            </div>
            <span className="text-[8px] text-zinc-500 font-mono">MediaCodec</span>
          </div>

          {/* Track 4: Audio Mixer */}
          <div className="h-11 flex flex-col items-center justify-center gap-0.5 text-zinc-400 px-1 bg-emerald-950/10">
            <div className="flex items-center gap-1">
              <Music size={11} className="text-emerald-400" />
              <span className="text-[9px] font-bold tracking-tight">T4: AUDIO</span>
            </div>
            <span className="text-[8px] text-emerald-400/80 font-mono">Mixer • Fade</span>
          </div>
        </div>

        {/* Scrollable Tracks Canvas */}
        <div 
          className="relative h-full flex flex-col select-none" 
          style={{ width: `${timelineContentWidth}px` }}
        >
          {/* Timecode Ruler */}
          <div className="h-6 border-b border-zinc-800/80 relative bg-[#09090b]/50">
            {ticks.map((sec) => (
              <div
                key={sec}
                className="absolute top-0 flex flex-col items-start"
                style={{ left: `${sec * pixelsPerSec}px` }}
              >
                <div className="w-px h-2.5 bg-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-500 -ml-1 mt-0.5">
                  {sec}s
                </span>
                {sec < totalDuration && (
                  <div
                    className="absolute top-0 w-px h-1.5 bg-zinc-700/80"
                    style={{ left: `${pixelsPerSec / 2}px` }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* TRACK 1: TEXT / SUBTITLES TRACK */}
          <div className="h-10 border-b border-zinc-800/40 relative flex items-center px-1 bg-amber-950/5">
            {textOverlays.map((txt) => {
              const textLeft = txt.startTime * pixelsPerSec;
              const textWidth = Math.max(44, (txt.endTime - txt.startTime) * pixelsPerSec);

              return (
                <div
                  key={txt.id}
                  className="absolute h-7 rounded bg-amber-950/40 border border-amber-500/50 flex items-center justify-between px-2 gap-1 overflow-hidden hover:border-amber-400 transition"
                  style={{
                    left: `${textLeft}px`,
                    width: `${textWidth}px`,
                  }}
                >
                  <div className="flex items-center gap-1 truncate">
                    <Type size={10} className="text-amber-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-amber-200 truncate font-mono">
                      "{txt.text}"
                    </span>
                  </div>
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-900/60 text-amber-300 shrink-0">
                    {txt.layerPosition === 'BEHIND_SUBJECT' ? 'Behind Subject' : 'Top'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TRACK 2: OVERLAY / AI CUTOUT / STICKER TRACK */}
          <div className="h-11 border-b border-zinc-800/40 relative flex items-center px-1 bg-cyan-950/10">
            {overlayCutouts.map((cutout) => {
              const cutoutLeft = cutout.startTime * pixelsPerSec;
              const cutoutWidth = Math.max(60, (cutout.endTime - cutout.startTime) * pixelsPerSec);

              return (
                <div
                  key={cutout.id}
                  className={`absolute h-8 rounded-md border flex items-center justify-between px-2 gap-1 overflow-hidden transition ${
                    cutout.maskActive
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                      : 'bg-zinc-900 border-zinc-700 opacity-70'
                  }`}
                  style={{
                    left: `${cutoutLeft}px`,
                    width: `${cutoutWidth}px`,
                  }}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles size={11} className="text-cyan-400 shrink-0" />
                    <span className="text-[10px] font-bold text-cyan-200 truncate font-mono">
                      {cutout.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {cutout.depthOfFieldBlur > 0 && (
                      <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        DoF: {cutout.depthOfFieldBlur}px
                      </span>
                    )}
                    <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      AI MASK
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TRACK 3: MAIN VIDEO TRACK */}
          <div className="h-13 border-b border-zinc-800/40 relative flex items-center px-1 bg-blue-950/10">
            {videoClips.map((clip) => {
              const clipWidth = Math.max(40, clip.duration * pixelsPerSec);
              const clipLeft = clip.startTime * pixelsPerSec;
              const isSelected = selectedClipId === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip.id);
                  }}
                  className={`absolute h-10 rounded-md overflow-hidden flex items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-blue-400 bg-zinc-900 shadow-md shadow-blue-900/30'
                      : 'bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/60'
                  }`}
                  style={{
                    left: `${clipLeft}px`,
                    width: `${clipWidth}px`,
                    backgroundColor: isSelected ? '#152238' : '#18181f',
                  }}
                >
                  <div className="w-1.5 h-full bg-blue-400 hover:w-2 transition-all cursor-ew-resize shrink-0" />

                  <div className="flex-1 h-full px-2 flex items-center justify-between overflow-hidden gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Film size={11} className="text-blue-400 shrink-0" />
                      <span className="text-[10px] font-semibold text-zinc-200 truncate">
                        {clip.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-blue-300/70 shrink-0">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  <div className="w-1.5 h-full bg-blue-400 hover:w-2 transition-all cursor-ew-resize shrink-0" />
                </div>
              );
            })}
          </div>

          {/* TRACK 4: AUDIO MIXER TRACK */}
          <div className="h-11 relative flex items-center px-1 bg-emerald-950/10">
            <div 
              className="h-8 rounded bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between px-2 gap-1 overflow-hidden relative"
              style={{ width: `${totalDuration * pixelsPerSec}px` }}
            >
              {/* Fade-in visual ramp */}
              {audioTrack.fadeInSeconds > 0 && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10 border-r border-emerald-400/40"
                  style={{ width: `${audioTrack.fadeInSeconds * pixelsPerSec}px` }}
                >
                  <span className="text-[8px] font-mono text-emerald-300 pl-1">
                    +{audioTrack.fadeInSeconds}s Fade
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0 z-10">
                <Music size={11} className="text-emerald-400 shrink-0 mr-1" />
                <span className="text-[9px] font-bold text-emerald-300 font-mono">
                  {audioTrack.title} ({(audioTrack.volume * 100).toFixed(0)}%)
                </span>
              </div>

              {/* Animated / Simulated Audio Waveform Bars */}
              <div className="flex items-center gap-1 overflow-hidden flex-1 mx-2">
                {Array.from({ length: Math.floor((totalDuration * pixelsPerSec) / 8) }).map((_, i) => {
                  const heightPct = 25 + Math.sin(i * 0.5) * 45 + ((i % 4) * 8);
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-sm shrink-0 transition-all ${
                        isAudioMuted ? 'bg-zinc-600 h-1.5' : 'bg-emerald-400'
                      }`}
                      style={{ height: `${isAudioMuted ? 4 : Math.min(22, Math.max(4, heightPct * 0.28 * audioTrack.volume))}px` }}
                    />
                  );
                })}
              </div>

              {/* Fade-out visual ramp */}
              {audioTrack.fadeOutSeconds > 0 && (
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-10 border-l border-emerald-400/40"
                  style={{ width: `${audioTrack.fadeOutSeconds * pixelsPerSec}px` }}
                >
                  <span className="text-[8px] font-mono text-emerald-300 pr-1 text-right block">
                    -{audioTrack.fadeOutSeconds}s Fade
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FIXED / SYNCHRONIZED PLAYHEAD NEEDLE */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{
              left: `${playheadLeftPx}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-3.5 h-3.5 bg-cyan-400 rounded-sm rotate-45 shadow-[0_0_10px_#00f2fe] border border-white/60 -mt-0.5" />
            <div className="w-0.5 flex-1 bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
          </div>
        </div>
      </div>
    </div>
  );
};
