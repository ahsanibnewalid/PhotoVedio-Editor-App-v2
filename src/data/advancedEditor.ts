export type HardwareCodec = 'H264_HW' | 'HEVC_HW';
export type Resolution = '720p' | '1080p' | '4k';
export type TargetPlatform = 'reels' | 'youtube' | 'twitter' | 'master';

export interface LUTPreset {
  id: string;
  name: string;
  intensity: number;
  description: string;
}

export interface CutoutSettings {
  enabled: boolean;
  feather: number;
  backgroundBlur: number;
  layerBehindSubject: boolean;
}

export interface CinematicSettings {
  anamorphic: boolean;
  aspectRatio: '16:9' | '9:16' | '1:1' | '2.39:1';
  filmGrain: number;
  vignette: number;
  neonBloom: number;
}

export interface ExportPreset {
  id: string;
  name: string;
  resolution: Resolution;
  frameRate: 30 | 60;
  bitrateMbps: number;
  codec: HardwareCodec;
  targetPlatform: TargetPlatform;
}

export const LUT_PRESETS: LUTPreset[] = [
  { id: 'teal-orange', name: 'Teal & Orange', intensity: 0.8, description: 'Cinematic contrast with warm skin tones.' },
  { id: 'cinema', name: 'Cinema', intensity: 0.75, description: 'Soft highlights and film-style contrast.' },
  { id: 'clean', name: 'Clean', intensity: 0.65, description: 'Neutral color with controlled contrast.' },
];

export const EXPORT_PRESETS: ExportPreset[] = [
  { id: 'reels', name: 'Reels / Shorts', resolution: '1080p', frameRate: 60, bitrateMbps: 15, codec: 'H264_HW', targetPlatform: 'reels' },
  { id: 'youtube', name: 'YouTube', resolution: '1080p', frameRate: 60, bitrateMbps: 18, codec: 'H264_HW', targetPlatform: 'youtube' },
  { id: 'youtube-4k', name: 'YouTube 4K', resolution: '4k', frameRate: 60, bitrateMbps: 35, codec: 'HEVC_HW', targetPlatform: 'youtube' },
  { id: 'web', name: 'Web Compact', resolution: '720p', frameRate: 30, bitrateMbps: 8, codec: 'H264_HW', targetPlatform: 'twitter' },
];

export const DEFAULT_CINEMATIC: CinematicSettings = {
  anamorphic: false,
  aspectRatio: '16:9',
  filmGrain: 0,
  vignette: 0.15,
  neonBloom: 0,
};

export const DEFAULT_CUTOUT: CutoutSettings = {
  enabled: false,
  feather: 0.15,
  backgroundBlur: 0,
  layerBehindSubject: true,
};
