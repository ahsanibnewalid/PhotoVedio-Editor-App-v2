/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ProxyGenerator.tsx
 * Professional CapCut-style Proxy Generation & Media Cache Engine.
 * Tailored for mid-range Android hardware (Samsung Galaxy A15 5G / Dimensity 6100+ / Mali-G57 MC2).
 * 
 * Provides an instant toggle between 'Original High-Res' (4K 60FPS HEVC) and
 * 'Auto-Proxy' (720p H.264 intra-frame edit cache) for butter-smooth 60 FPS timeline scrubbing.
 * Final export through FFmpeg-Kit hardware MediaCodec always automatically links to the 4K master.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Zap, 
  Gauge, 
  HardDrive, 
  Check, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Film, 
  AlertTriangle, 
  Layers, 
  Smartphone, 
  ArrowRight, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Flame,
  BatteryCharging
} from 'lucide-react';
import { ProxySettings, ProxyMode, ProxyQuality } from '../types/editor';
import { 
  DeviceHardwareProfile, 
  detectDeviceCapabilities, 
  getTierOptimizationRules 
} from '../utils/DeviceCapabilityDetector';
import { PROXY_SPECS, buildUniversalProxyTranscodeCommand } from '../utils/UniversalProxyManager';
import { DeviceThrottleState } from '../hooks/useDeviceThrottle';

interface ProxyGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  proxySettings: ProxySettings;
  onUpdateSettings: (settings: Partial<ProxySettings>) => void;
  activeMediaTitle?: string;
  videoDuration?: number;
  deviceProfile?: DeviceHardwareProfile;
  throttleState?: DeviceThrottleState;
}

export const ProxyGenerator: React.FC<ProxyGeneratorProps> = ({
  isOpen,
  onClose,
  proxySettings,
  onUpdateSettings,
  activeMediaTitle = 'Moto Highway Warp',
  videoDuration = 15.0,
  deviceProfile,
  throttleState
}) => {
  // Detected hardware profile fallback
  const profile = deviceProfile || detectDeviceCapabilities();
  const optimizationRules = getTierOptimizationRules(profile.tier);

  // Transcode simulation state
  const [isTranscoding, setIsTranscoding] = useState<boolean>(false);
  const [transcodeProgress, setTranscodeProgress] = useState<number>(100);
  const [transcodeStage, setTranscodeStage] = useState<string>('Proxy Ready (Cache Hit)');
  const [cachePurgedToast, setCachePurgedToast] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<ProxyQuality>(proxySettings.quality);

  useEffect(() => {
    setSelectedQuality(proxySettings.quality);
  }, [proxySettings.quality]);

  if (!isOpen) return null;

  // Handle Transcode Simulation
  const handleStartTranscode = () => {
    setIsTranscoding(true);
    setTranscodeProgress(0);
    setTranscodeStage('MediaExtractor: Parsing 4K HEVC bitstream...');

    const stages = [
      { at: 15, msg: 'Demuxing audio track & indexing sync keyframes...' },
      { at: 35, msg: 'MediaCodec Surface: Downscaling 3840x2160 -> 1280x720 NV12...' },
      { at: 65, msg: 'c2.mtk.avc.encoder: HW encoding 60FPS intra-frame stream...' },
      { at: 85, msg: 'MediaMuxer: Writing fast-seek MP4 proxy to app cache...' },
      { at: 100, msg: 'Proxy Generation Complete (60 FPS Locked)' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setTranscodeProgress((prev) => {
        const next = prev + 5;
        const matchingStage = stages.find(s => next >= s.at && s.at > (prev));
        if (matchingStage) {
          setTranscodeStage(matchingStage.msg);
        }

        if (next >= 100) {
          clearInterval(interval);
          setIsTranscoding(false);
          setTranscodeStage('Proxy Ready (1280x720 @ 60FPS)');
          onUpdateSettings({ mode: 'PROXY', quality: selectedQuality });
          return 100;
        }
        return next;
      });
      currentStep++;
    }, 120);
  };

  // Handle Purge Cache
  const handlePurgeCache = () => {
    onUpdateSettings({ cacheSizeBytes: 0 });
    if (throttleState?.triggerPurge) {
      throttleState.triggerPurge();
    }
    setCachePurgedToast(true);
    setTimeout(() => {
      setCachePurgedToast(false);
    }, 2800);
  };

  const isProxyActive = proxySettings.mode === 'PROXY';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Surface (CapCut Dark Charcoal #141418) */}
      <div 
        className="w-full max-w-2xl bg-[#141418] border border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Touch Bottom Sheet on Mobile */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-700/80" />
        </div>

        {/* 1. Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#1A1A22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9500]/25 to-amber-600/10 text-[#FF9500] border border-[#FF9500]/30 flex items-center justify-center shadow-[0_0_15px_rgba(255,149,0,0.3)]">
              <Zap size={18} className="fill-[#FF9500]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wide">
                  Universal Performance & Proxy Engine
                </h3>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  profile.tier === 'BUDGET_LOW_RAM'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                    : profile.tier === 'MID_RANGE'
                    ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                }`}>
                  {profile.tierName}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Universal hardware acceleration across Samsung Galaxy A-series & Redmi devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-[#111115]">
          
          {/* A. Master Mode Toggle: Auto-Proxy vs Original High-Res */}
          <div className="bg-[#181820] p-1.5 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row gap-2">
            
            {/* Auto-Proxy Mode (Recommended) */}
            <button
              onClick={() => onUpdateSettings({ mode: 'PROXY' })}
              className={`flex-1 p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                isProxyActive
                  ? 'bg-gradient-to-br from-[#FF9500]/15 via-zinc-900 to-zinc-900 border-[#FF9500] shadow-[0_0_20px_rgba(255,149,0,0.25)]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isProxyActive ? 'bg-[#FF9500] text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <Zap size={14} className={isProxyActive ? 'fill-zinc-950' : ''} />
                  </div>
                  <div>
                    <span className={`text-xs font-black block ${isProxyActive ? 'text-white' : 'text-zinc-300'}`}>
                      Auto-Proxy ({PROXY_SPECS[selectedQuality]?.label || 'Fast Intra-Frame'})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {profile.tier === 'BUDGET_LOW_RAM' ? 'Anti-Crash Mode (Recommended)' : 'Recommended for Editing'}
                    </span>
                  </div>
                </div>

                {isProxyActive && (
                  <span className="px-2 py-0.5 rounded-md bg-[#FF9500] text-zinc-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    ACTIVE
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed">
                Zero lag scrub with instant seeking. Bypasses heavy 4K decompression on device RAM.
              </p>
            </button>

            {/* Original High-Res Mode */}
            <button
              onClick={() => onUpdateSettings({ mode: 'ORIGINAL' })}
              className={`flex-1 p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                !isProxyActive
                  ? 'bg-gradient-to-br from-cyan-500/15 via-zinc-900 to-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    !isProxyActive ? 'bg-cyan-400 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <Film size={14} />
                  </div>
                  <div>
                    <span className={`text-xs font-black block ${!isProxyActive ? 'text-white' : 'text-zinc-300'}`}>
                      Original High-Res (4K Raw)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Camera Master 3840x2160</span>
                  </div>
                </div>

                {!isProxyActive && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    ACTIVE
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed">
                Direct playback of raw 4K camera files. High RAM pressure; low-RAM devices may experience frame drops.
              </p>
            </button>

          </div>

          {/* B. Live Hardware Performance Benchmark Card */}
          <div className="bg-[#181820] rounded-2xl border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={15} className="text-[#FF9500]" />
                <span className="text-xs font-bold text-white">
                  Universal Runtime Hardware Profile
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[280px]">
                {profile.ramGB}GB RAM • {profile.cpuCores} Cores • {profile.chipsetVendor}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Metric 1: Timeline FPS */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Target FPS</span>
                  <Gauge size={12} className={isProxyActive ? 'text-emerald-400' : 'text-amber-400'} />
                </div>
                <div className="mt-1">
                  <span className={`text-base font-black font-mono ${
                    isProxyActive ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {isProxyActive ? `${optimizationRules.targetPreviewFps} FPS` : '~24-30 FPS'}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    {isProxyActive ? 'Hardware Locked' : 'Stutter On Seek'}
                  </span>
                </div>
              </div>

              {/* Metric 2: Memory RAM Footprint */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>RAM Heap</span>
                  <HardDrive size={12} className={
                    throttleState?.pressureLevel === 'CRITICAL' ? 'text-rose-400' :
                    throttleState?.pressureLevel === 'WARNING' ? 'text-amber-400' : 'text-cyan-400'
                  } />
                </div>
                <div className="mt-1">
                  <span className={`text-base font-black font-mono ${
                    isProxyActive ? 'text-cyan-400' : 'text-rose-400'
                  }`}>
                    {throttleState ? `${throttleState.usedHeapMB} MB` : (isProxyActive ? '180 MB' : '1,420 MB')}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    Safe Limit: {optimizationRules.safeHeapThresholdMB} MB
                  </span>
                </div>
              </div>

              {/* Metric 3: Thermals & Memory Pressure */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Pressure</span>
                  <Flame size={12} className={
                    throttleState?.pressureLevel === 'CRITICAL' ? 'text-rose-400' :
                    throttleState?.pressureLevel === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                  } />
                </div>
                <div className="mt-1">
                  <span className={`text-base font-black font-mono ${
                    throttleState?.pressureLevel === 'CRITICAL' ? 'text-rose-400' :
                    throttleState?.pressureLevel === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {throttleState?.pressureLevel || 'NORMAL'}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    {isProxyActive ? 'Thermal Safe' : 'High Thermal Load'}
                  </span>
                </div>
              </div>

              {/* Metric 4: Hardware Codec */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Codec HW</span>
                  <Cpu size={12} className="text-purple-400" />
                </div>
                <div className="mt-1">
                  <span className="text-xs font-black font-mono text-purple-300 block truncate">
                    {optimizationRules.hardwareEncoderName}
                  </span>
                  <span className="text-[9px] text-zinc-500 block truncate">
                    {profile.gpuRenderer.split(' ')[0]}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* C. Proxy Quality Profiles */}
          <div className="bg-[#181820] rounded-2xl border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-cyan-400" />
                <span className="text-xs font-bold text-white">Proxy Transcoding Profiles</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Universal H.264 Fast-GOP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                {
                  id: '480p_30' as ProxyQuality,
                  label: '480p @ 30 FPS',
                  tag: 'Low-RAM Anti-Crash',
                  bitrate: '1.8 Mbps',
                  recommended: profile.tier === 'BUDGET_LOW_RAM',
                  desc: 'Recommended for Galaxy A04-A15 & Redmi 10-13 (2GB-4GB RAM). Zero OOM closures.'
                },
                {
                  id: '540p_30' as ProxyQuality,
                  label: '540p @ 30 FPS',
                  tag: 'Battery Saver',
                  bitrate: '2.4 Mbps',
                  recommended: false,
                  desc: 'Ultra low battery drain; edit on remaining 5% battery with sub-frame seek.'
                },
                {
                  id: '720p_30' as ProxyQuality,
                  label: '720p @ 30 FPS',
                  tag: 'Standard Vlog',
                  bitrate: '3.2 Mbps',
                  recommended: false,
                  desc: 'Balanced proxy for general vlogs and multi-track cuts on 4GB-6GB phones.'
                },
                {
                  id: '720p_60' as ProxyQuality,
                  label: '720p @ 60 FPS',
                  tag: 'MotoVlog Action',
                  bitrate: '5.0 Mbps',
                  recommended: profile.tier === 'MID_RANGE' || profile.tier === 'FLAGSHIP_HIGH',
                  desc: 'High frame-rate proxy preserving rapid cornering and Skia motion blur.'
                }
              ].map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuality(q.id);
                    onUpdateSettings({ quality: q.id });
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedQuality === q.id
                      ? 'bg-zinc-850 border-[#FF9500] text-white shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${selectedQuality === q.id ? 'text-[#FF9500]' : 'text-zinc-200'}`}>
                        {q.label}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {q.bitrate}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-black uppercase text-cyan-400 block">
                        {q.tag}
                      </span>
                      {q.recommended && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-[#FF9500] border border-[#FF9500]/30">
                          BEST
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1.5 line-clamp-2">
                      {q.desc}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {q.id === '480p_30' ? '~3.4 MB' : q.id === '540p_30' ? '~4.5 MB' : q.id === '720p_30' ? '~6.0 MB' : '~9.4 MB'}
                    </span>
                    {selectedQuality === q.id && <Check size={13} className="text-[#FF9500]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. Interactive Transcode Pipeline Status & Generator Button */}
          <div className="bg-[#181820] rounded-2xl border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className={`text-emerald-400 ${isTranscoding ? 'animate-spin' : ''}`} />
                <span className="text-xs font-bold text-white">MediaCodec Hardware Transcode Pipeline</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Current Media: {activeMediaTitle} ({videoDuration}s)
              </span>
            </div>

            {/* Progress Bar & Stage Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Clock size={12} className="text-[#FF9500]" />
                  <span>{transcodeStage}</span>
                </span>
                <span className="font-bold text-[#FF9500]">{transcodeProgress}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF9500] via-amber-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${transcodeProgress}%` }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>MediaCodec HW Acceleration: 3.4x Realtime</span>
              </div>

              <button
                onClick={handleStartTranscode}
                disabled={isTranscoding}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md ${
                  isTranscoding
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#FF9500] hover:bg-[#FFA51A] text-zinc-950 font-black active:scale-95'
                }`}
              >
                <RefreshCw size={13} className={isTranscoding ? 'animate-spin' : ''} />
                <span>{isTranscoding ? 'Transcoding Proxy...' : 'Regenerate Proxy Cache'}</span>
              </button>
            </div>
          </div>

          {/* E. Storage & Cache Management */}
          <div className="bg-[#181820] rounded-2xl border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={15} className="text-purple-400" />
                <span className="text-xs font-bold text-white">Proxy Storage & Cache</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                App Internal Cache Dir
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white font-mono">
                    {proxySettings.cacheSizeBytes > 0 ? '486.2 MB' : '0 MB'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">/ 128 GB Internal Storage</span>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {proxySettings.cacheSizeBytes > 0 ? '3 proxy files cached for current project' : 'Cache is empty'}
                </span>
              </div>

              <button
                onClick={handlePurgeCache}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-500/40 text-zinc-300 border border-zinc-750 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 size={13} />
                <span>Purge Cache</span>
              </button>
            </div>

            {/* Quick Automation Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Automatically generate 720p proxy upon importing &gt;1080p footage</span>
                <input
                  type="checkbox"
                  checked={proxySettings.autoGenerateOnImport}
                  onChange={(e) => onUpdateSettings({ autoGenerateOnImport: e.target.checked })}
                  className="accent-[#FF9500] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Display "PROXY 720P" status badge in preview viewport</span>
                <input
                  type="checkbox"
                  checked={proxySettings.showProxyBadge}
                  onChange={(e) => onUpdateSettings({ showProxyBadge: e.target.checked })}
                  className="accent-[#FF9500] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Automatically delete proxies after project export completes</span>
                <input
                  type="checkbox"
                  checked={proxySettings.purgeOnExport}
                  onChange={(e) => onUpdateSettings({ purgeOnExport: e.target.checked })}
                  className="accent-[#FF9500] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>

            {cachePurgedToast && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={14} />
                <span>Proxy cache cleared. Storage reclaimed instantly.</span>
              </div>
            )}
          </div>

          {/* F. Export Guarantee Reassurance Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-cyan-950/30 border border-emerald-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-300 block">
                Master Export Guarantee (No Quality Loss)
              </span>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                Proxies are used strictly during real-time timeline editing and previewing to protect frame rate and battery life. 
                When rendering through <span className="text-white font-bold">Export Studio</span>, our hardware FFmpeg pipeline automatically re-links to the full original 4K camera master.
              </p>
            </div>
          </div>

        </div>

        {/* 3. Footer Bar */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-[#1A1A22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isProxyActive ? 'bg-[#FF9500] animate-pulse' : 'bg-cyan-400'}`} />
            <span className="text-xs font-mono font-bold text-zinc-300">
              {isProxyActive ? 'MODE: AUTO-PROXY 720P (SMOOTH)' : 'MODE: ORIGINAL 4K (MASTER)'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#FF9500] hover:bg-[#FFA51A] text-zinc-950 font-black text-xs transition shadow-md active:scale-95"
          >
            Apply & Return
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProxyGenerator;
