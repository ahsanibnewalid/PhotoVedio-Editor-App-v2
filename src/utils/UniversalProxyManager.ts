/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UniversalProxyManager.ts
 * Universal Dynamic Proxy Management & Hardware Transcode Engine.
 * 
 * Features:
 * 1. Automatic Dynamic Proxy Assignment:
 *    - Automatically forces 480p preview proxies on budget phones (Galaxy A04-A15, Redmi 10A-13C)
 *      to completely prevent Out-Of-Memory (OOM) kills and thermal throttling.
 *    - Assigns 720p 60fps on mid-range devices (Galaxy A24-A54, Redmi Note 11-13).
 *    - Allows 1080p or direct Raw master editing on flagship tier devices.
 * 2. Export Decoupling Architecture:
 *    - The preview proxy is strictly used for real-time viewport playback and timeline scrubbing.
 *    - Final project rendering ALWAYS bypasses the proxy and reconnects directly to the original
 *      uncompressed 4K / 1080p camera master using universal Android `h264_mediacodec` hardware acceleration.
 */

import { ProxySettings, ProxyQuality, ExportSettings } from '../types/editor';
import { 
  DeviceHardwareProfile, 
  detectDeviceCapabilities, 
  getTierOptimizationRules, 
  PerformanceTier 
} from './DeviceCapabilityDetector';

export interface ProxyResolutionSpec {
  quality: ProxyQuality;
  width: number;
  height: number;
  fps: 30 | 60;
  bitrateKbps: number;
  targetTier: PerformanceTier;
  label: string;
  badgeText: string;
  recommendedFor: string;
}

export const PROXY_SPECS: Record<ProxyQuality, ProxyResolutionSpec> = {
  '480p_30': {
    quality: '480p_30',
    width: 854,
    height: 480,
    fps: 30,
    bitrateKbps: 1800,
    targetTier: 'BUDGET_LOW_RAM',
    label: '480p @ 30 FPS',
    badgeText: 'PROXY 480P',
    recommendedFor: 'Budget Low-RAM phones (Galaxy A04-A15, Redmi 10-13). Prevents OOM crashes.'
  },
  '540p_30': {
    quality: '540p_30',
    width: 960,
    height: 540,
    fps: 30,
    bitrateKbps: 2400,
    targetTier: 'BUDGET_LOW_RAM',
    label: '540p @ 30 FPS',
    badgeText: 'PROXY 540P',
    recommendedFor: 'Battery Saver mode on mid & budget devices.'
  },
  '720p_30': {
    quality: '720p_30',
    width: 1280,
    height: 720,
    fps: 30,
    bitrateKbps: 3200,
    targetTier: 'MID_RANGE',
    label: '720p @ 30 FPS',
    badgeText: 'PROXY 720P',
    recommendedFor: 'Standard vlogs and talking heads on 4GB-6GB RAM devices.'
  },
  '720p_60': {
    quality: '720p_60',
    width: 1280,
    height: 720,
    fps: 60,
    bitrateKbps: 5000,
    targetTier: 'MID_RANGE',
    label: '720p @ 60 FPS',
    badgeText: 'PROXY 720P 60FPS',
    recommendedFor: 'High-speed action & moto-vlog footage on 6GB+ RAM devices.'
  }
};

/**
 * Returns optimal default proxy settings tailored specifically for the detected device hardware.
 */
export function getAutomaticProxySettings(profile?: DeviceHardwareProfile): ProxySettings {
  const currentProfile = profile || detectDeviceCapabilities();
  const rules = getTierOptimizationRules(currentProfile.tier);

  return {
    mode: 'PROXY',
    quality: rules.recommendedProxyQuality,
    autoGenerateOnImport: true,
    purgeOnExport: currentProfile.tier === 'BUDGET_LOW_RAM', // Auto purge on budget to free internal flash
    showProxyBadge: true,
    cacheSizeBytes: currentProfile.tier === 'BUDGET_LOW_RAM' ? 120 * 1024 * 1024 : 486 * 1024 * 1024,
    transcodeSpeedMultiplier: currentProfile.chipsetVendor === 'MEDIATEK' ? 3.4 : 3.8
  };
}

/**
 * Checks if incoming imported media requires auto-proxying on this device.
 */
export function shouldGenerateProxy(
  sourceWidth: number, 
  sourceHeight: number, 
  profile?: DeviceHardwareProfile
): { shouldProxy: boolean; reason: string } {
  const currentProfile = profile || detectDeviceCapabilities();
  const is4KOrHigher = sourceWidth >= 3840 || sourceHeight >= 2160;
  const is1080p = sourceWidth >= 1920 || sourceHeight >= 1080;

  if (currentProfile.tier === 'BUDGET_LOW_RAM') {
    if (is1080p || is4KOrHigher) {
      return {
        shouldProxy: true,
        reason: `Budget hardware detected (${currentProfile.ramGB}GB RAM). Auto-generating 480p proxy to ensure safe playback without frame drops.`
      };
    }
  }

  if (currentProfile.tier === 'MID_RANGE') {
    if (is4KOrHigher) {
      return {
        shouldProxy: true,
        reason: '4K 60FPS footage detected. Auto-generating 720p proxy for 60FPS smooth timeline scrubbing.'
      };
    }
  }

  return {
    shouldProxy: false,
    reason: 'Hardware has sufficient headroom for direct preview playback.'
  };
}

/**
 * Generates the FFmpeg-Kit command string to transcode a source video into an intra-frame proxy.
 * Universal support for all Android chipsets using `h264_mediacodec`.
 */
export function buildUniversalProxyTranscodeCommand(
  inputSourcePath: string,
  outputProxyPath: string,
  quality: ProxyQuality,
  profile?: DeviceHardwareProfile
): { command: string; codec: string; estimatedTimeSeconds: number } {
  const currentProfile = profile || detectDeviceCapabilities();
  const spec = PROXY_SPECS[quality] || PROXY_SPECS['720p_60'];

  // Universal hardware acceleration for Android
  const hardwareCodec = currentProfile.chipsetVendor === 'MEDIATEK'
    ? 'h264_mediacodec' // Backed by c2.mtk.avc.encoder
    : currentProfile.chipsetVendor === 'QUALCOMM'
    ? 'h264_mediacodec' // Backed by c2.qcom.avc.encoder
    : 'h264_mediacodec'; // Universal Android NDK hardware encoder

  // Build FFmpeg command with fast intra-GOP (G=15) for instant scrubbing
  const command = [
    '-y',
    '-hwaccel mediacodec',
    `-i "${inputSourcePath}"`,
    `-vf "scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,fps=${spec.fps}"`,
    `-c:v ${hardwareCodec}`,
    `-b:v ${spec.bitrateKbps}k`,
    '-g 15', // Short GOP for sub-frame seek response
    '-pix_fmt yuv420p',
    '-c:a aac -b:a 128k',
    `-movflags +faststart "${outputProxyPath}"`
  ].join(' ');

  return {
    command,
    codec: hardwareCodec,
    estimatedTimeSeconds: Math.round(15 / (currentProfile.tier === 'BUDGET_LOW_RAM' ? 2.2 : 3.8))
  };
}

/**
 * Builds the Master Hardware Export Command.
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * Even if the user previewed and edited using a 480p or 720p proxy, this command
 * ALWAYS links back to the original 4K / 1080p camera master source file!
 */
export interface MasterExportOptions {
  masterSourcePath: string;
  outputPath: string;
  exportSettings: ExportSettings;
  durationSeconds: number;
  lutFilterApplied?: string;
  motionBlurActive?: boolean;
}

export function buildMasterExportCommand(
  options: MasterExportOptions,
  profile?: DeviceHardwareProfile
): { command: string; targetResolution: string; targetBitrate: string } {
  const currentProfile = profile || detectDeviceCapabilities();
  const { masterSourcePath, outputPath, exportSettings, lutFilterApplied } = options;

  let targetWidth = 3840;
  let targetHeight = 2160;
  let bitrateMbps = exportSettings.bitrateMbps || 35;

  if (exportSettings.resolution === '720p') {
    targetWidth = 1280;
    targetHeight = 720;
    bitrateMbps = Math.min(bitrateMbps, 10);
  } else if (exportSettings.resolution === '1080p') {
    targetWidth = 1920;
    targetHeight = 1080;
    bitrateMbps = Math.min(bitrateMbps, 20);
  }

  // Filter chain operating at full sensor raster
  const filters: string[] = [
    `scale=${targetWidth}:${targetHeight}:flags=lanczos`,
    `fps=${exportSettings.frameRate}`
  ];

  if (lutFilterApplied && lutFilterApplied !== 'NONE') {
    filters.push('curves=preset=cross_process');
  }

  const vfString = filters.join(',');
  const codec = exportSettings.codec === 'HEVC_HW' ? 'hevc_mediacodec' : 'h264_mediacodec';

  const command = [
    '-y',
    '-hwaccel mediacodec',
    `-i "${masterSourcePath}"`,
    `-vf "${vfString}"`,
    `-c:v ${codec}`,
    `-b:v ${bitrateMbps}M`,
    '-maxrate ' + (bitrateMbps * 1.3).toFixed(1) + 'M',
    '-bufsize ' + (bitrateMbps * 2).toFixed(1) + 'M',
    '-pix_fmt yuv420p',
    '-c:a aac -b:a 256k',
    `-movflags +faststart "${outputPath}"`
  ].join(' ');

  return {
    command,
    targetResolution: `${targetWidth}x${targetHeight}`,
    targetBitrate: `${bitrateMbps} Mbps (${codec})`
  };
}

/**
 * Estimates storage footprint of proxy files in bytes.
 */
export function estimateProxyFootprintBytes(durationSeconds: number, quality: ProxyQuality): number {
  const spec = PROXY_SPECS[quality] || PROXY_SPECS['720p_60'];
  const bitsPerSecond = spec.bitrateKbps * 1000;
  return Math.round((bitsPerSecond / 8) * durationSeconds);
}

/**
 * Formats bytes to readable human strings.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
