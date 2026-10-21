/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Trending video editor templates optimized for short-form video (TikTok, Instagram Reels, YouTube Shorts)
 * and high-adrenaline MotoVlog action footage.
 */

import { FilterType, AspectRatioType } from '../types/editor';

export interface EditorTemplate {
  id: string;
  title: string;
  category: 'motovlog' | 'action' | 'cinematic' | 'reels';
  duration: number;
  badge: string;
  aspectRatio: AspectRatioType;
  thumbnailUrl: string;
  musicTitle: string;
  musicBpm: number;
  filterPreset: FilterType;
  motoBlurEnabled: boolean;
  letterbox: boolean;
  textTitle: string;
  description: string;
  cutsCount: number;
}

export const SAMPLE_TEMPLATES: EditorTemplate[] = [
  {
    id: 'tpl-motovlog-speed',
    title: 'MotoVlog 60FPS Highway Warp',
    category: 'motovlog',
    duration: 12.0,
    badge: 'MOTO QUICK-PRESET',
    aspectRatio: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    musicTitle: 'Cyber Neon Revs (140 BPM)',
    musicBpm: 140,
    filterPreset: 'NEON_GLOW',
    motoBlurEnabled: true,
    letterbox: true,
    textTitle: 'APEX CORNERING',
    description: 'Instant optical motion blur, high-contrast action LUT, dynamic letterbox bars, and high-speed cuts sync.',
    cutsCount: 6
  },
  {
    id: 'tpl-cyberpunk-drift',
    title: 'Cyberpunk Tokyo Midnight',
    category: 'action',
    duration: 15.0,
    badge: 'TRENDING FX',
    aspectRatio: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    musicTitle: 'Synthwave Velocity (128 BPM)',
    musicBpm: 128,
    filterPreset: 'HIGH_CONTRAST',
    motoBlurEnabled: false,
    letterbox: false,
    textTitle: 'MIDNIGHT TOKYO',
    description: 'Deep violet shadows, cyan highlights, neon edge blooming, and auto-synced beat markers.',
    cutsCount: 8
  },
  {
    id: 'tpl-cinematic-travel',
    title: 'Cinematic Travel 3D LUT',
    category: 'cinematic',
    duration: 14.0,
    badge: 'HOLLYWOOD GRADE',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    musicTitle: 'Ambient Horizon Orchestral',
    musicBpm: 92,
    filterPreset: 'SEPIA',
    motoBlurEnabled: false,
    letterbox: true,
    textTitle: 'GOLDEN COASTLINE',
    description: 'Teal & Orange filmic curve, Kodak 2383 emulation, soft film grain, and 2.39:1 anamorphic crop.',
    cutsCount: 4
  },
  {
    id: 'tpl-skate-slowmo',
    title: 'Action Park 0.5x Slow-Mo',
    category: 'action',
    duration: 10.0,
    badge: 'SPEED RAMP',
    aspectRatio: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520045884218-a66e13385802?auto=format&fit=crop&w=600&q=80',
    musicTitle: 'Heavy Trap Beat Drop',
    musicBpm: 135,
    filterPreset: 'GRAYSCALE',
    motoBlurEnabled: true,
    letterbox: false,
    textTitle: 'KICKFLIP AIR',
    description: 'Dynamic Bezier speed ramp (1.0x → 0.25x slow-mo on trick peak → 2.5x whip-fast recovery).',
    cutsCount: 5
  }
];
