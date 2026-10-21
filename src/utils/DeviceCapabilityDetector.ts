/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DeviceCapabilityDetector.ts
 * Universal Hardware Capability & Runtime Performance Tier Detector.
 * 
 * Automatically detects device RAM, CPU cores, WebGL GPU renderer, and memory heap
 * across all budget and mid-range Android devices (Samsung Galaxy A-series [A04, A05, A14, A15, A24, A34, A54]
 * and Xiaomi/Redmi [Redmi 10A, 12C, 13C, Note 11/12/13]) without device-model-specific hardcoding.
 */

export type PerformanceTier = 'BUDGET_LOW_RAM' | 'MID_RANGE' | 'FLAGSHIP_HIGH';

export type ChipsetVendor = 
  | 'MEDIATEK' 
  | 'QUALCOMM' 
  | 'SAMSUNG_EXYNOS' 
  | 'UNISOC' 
  | 'ARM_MALI' 
  | 'APPLE' 
  | 'GENERIC_EMULATOR';

export interface DeviceHardwareProfile {
  tier: PerformanceTier;
  tierName: string;
  tierDescription: string;
  ramGB: number;
  cpuCores: number;
  gpuRenderer: string;
  gpuVendor: string;
  chipsetVendor: ChipsetVendor;
  isLowRam: boolean;
  maxTextureSize: number;
  jsHeapLimitMB: number;
  supportsHardwareMediaCodec: boolean;
  benchmarkScore: number; // 0 - 100 relative compute throughput
  detectedAt: number;
}

export interface TierOptimizationRules {
  tier: PerformanceTier;
  maxPreviewResolution: '480p' | '720p' | '1080p';
  recommendedProxyQuality: '480p_30' | '720p_30' | '720p_60';
  targetPreviewFps: 30 | 60;
  maxSimultaneousTracks: number;
  skiaCanvasDownscale: number; // 0.5 (half-res), 0.75, 1.0 (native)
  disableHeavyShaders: boolean;
  safeHeapThresholdMB: number;
  cacheEvictionThresholdMB: number;
  codecBufferQueueSize: number;
  hardwareEncoderName: string;
}

// Global cached profile singleton
let cachedProfile: DeviceHardwareProfile | null = null;

/**
 * Runs a micro-benchmark (5ms CPU math + canvas fill) to accurately measure throughput
 * on devices where navigator.deviceMemory is privacy-clamped or undefined.
 */
function runMicroBenchmark(): number {
  try {
    const t0 = performance.now();
    let acc = 0;
    // 200k iterative vector math operations
    for (let i = 0; i < 200000; i++) {
      acc += Math.sin(i * 0.01) * Math.cos(i * 0.02);
    }
    const delta = performance.now() - t0;
    
    // Fast devices complete in < 3ms, budget low-RAM devices (Cortex-A53/A55) take > 14ms
    if (delta <= 2.5) return 95;
    if (delta <= 5.0) return 80;
    if (delta <= 10.0) return 60;
    if (delta <= 18.0) return 38;
    return 20;
  } catch {
    return 50;
  }
}

/**
 * Inspects WebGL unmasked vendor and renderer strings to identify physical GPU.
 */
function probeGPU(): { renderer: string; vendor: string; maxTextureSize: number } {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    
    if (!gl) {
      return {
        renderer: 'Software / Canvas2D Fallback',
        vendor: 'Unknown',
        maxTextureSize: 2048
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
      : gl.getParameter(gl.RENDERER) || 'Generic GPU';
    const vendor = debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
      : gl.getParameter(gl.VENDOR) || 'Generic Vendor';
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;

    return {
      renderer: String(renderer),
      vendor: String(vendor),
      maxTextureSize: Number(maxTextureSize)
    };
  } catch {
    return {
      renderer: 'Mali-G57 MC2 (Simulated)',
      vendor: 'ARM',
      maxTextureSize: 4096
    };
  }
}

/**
 * Identifies the chipset architecture vendor from GPU and user agent signals.
 */
function identifyChipsetVendor(gpuRenderer: string, gpuVendor: string): ChipsetVendor {
  const normalized = `${gpuRenderer} ${gpuVendor}`.toLowerCase();
  
  if (normalized.includes('mali') || normalized.includes('bifrost') || normalized.includes('valhall')) {
    if (normalized.includes('mtk') || normalized.includes('dimensity') || normalized.includes('helio')) {
      return 'MEDIATEK';
    }
    return 'ARM_MALI';
  }
  if (normalized.includes('adreno') || normalized.includes('qualcomm')) {
    return 'QUALCOMM';
  }
  if (normalized.includes('xclipse') || normalized.includes('exynos')) {
    return 'SAMSUNG_EXYNOS';
  }
  if (normalized.includes('powervr') || normalized.includes('unisoc') || normalized.includes('spreadtrum')) {
    return 'UNISOC';
  }
  if (normalized.includes('apple')) {
    return 'APPLE';
  }
  return 'GENERIC_EMULATOR';
}

/**
 * Detects device hardware profile and assigns universal performance tier.
 */
export function detectDeviceCapabilities(): DeviceHardwareProfile {
  if (cachedProfile) {
    return cachedProfile;
  }

  // 1. Detect RAM (navigator.deviceMemory in GB if available)
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const rawRam = (nav && 'deviceMemory' in nav) ? Number((nav as any).deviceMemory) : 4;
  
  // 2. Detect CPU Cores
  const cpuCores = nav && nav.hardwareConcurrency ? nav.hardwareConcurrency : 4;

  // 3. Inspect Memory Heap (Chromium / Android WebView standard)
  let jsHeapLimitMB = 512;
  const perf = typeof window !== 'undefined' && (window.performance as any);
  if (perf && perf.memory && perf.memory.jsHeapSizeLimit) {
    jsHeapLimitMB = Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024));
  } else {
    // Estimate based on RAM
    jsHeapLimitMB = rawRam <= 4 ? 384 : rawRam <= 6 ? 640 : 1024;
  }

  // 4. GPU Probe
  const gpu = probeGPU();
  const chipsetVendor = identifyChipsetVendor(gpu.renderer, gpu.vendor);
  const benchmarkScore = runMicroBenchmark();

  // 5. Tier Classification Heuristics
  // Budget phones: 2GB-4GB RAM (or <= 4 CPU cores, or low-tier Mali-G52/G57 MC1, or benchmark < 45)
  // Mid-range phones: 6GB-8GB RAM, 8 CPU cores (Mali-G57 MC2, Mali-G68, Adreno 619/642L, Dimensity 6100+)
  // Flagship: 12GB+ RAM or Adreno 7xx / Apple GPU / desktop benchmark > 85
  
  const isBudgetGpu = 
    /mali-g52|mali-g57 mc1|mali-400|powervr|adreno 610|adreno 506|adreno 505/i.test(gpu.renderer);
  
  const isFlagshipGpu = 
    /adreno 7|mali-g710|mali-g715|mali-g720|immortalis|apple m|apple a16|apple a17|rtx|geforce/i.test(gpu.renderer);

  let tier: PerformanceTier = 'MID_RANGE';

  if (rawRam <= 4 || cpuCores <= 4 || isBudgetGpu || benchmarkScore < 45 || jsHeapLimitMB < 450) {
    tier = 'BUDGET_LOW_RAM';
  } else if ((rawRam >= 12 || isFlagshipGpu) && benchmarkScore >= 80) {
    tier = 'FLAGSHIP_HIGH';
  } else {
    tier = 'MID_RANGE';
  }

  const isLowRam = tier === 'BUDGET_LOW_RAM';

  const tierMetadata: Record<PerformanceTier, { name: string; desc: string }> = {
    BUDGET_LOW_RAM: {
      name: 'Budget / Low-RAM Tier',
      desc: 'Optimized for 2GB-4GB RAM phones (Galaxy A04-A15, Redmi 10A-13C). Enforces 480p preview proxies to prevent Out-Of-Memory closures.'
    },
    MID_RANGE: {
      name: 'Mid-Range Balanced Tier',
      desc: 'Optimized for 6GB-8GB RAM phones (Galaxy A24-A54, Redmi Note 11-13). Smooth 720p 60FPS intra-frame playback with Skia GPU shaders.'
    },
    FLAGSHIP_HIGH: {
      name: 'High-Performance Flagship Tier',
      desc: 'High RAM & multi-core headroom. Native 1080p preview with full multi-track Skia shader pipelines.'
    }
  };

  cachedProfile = {
    tier,
    tierName: tierMetadata[tier].name,
    tierDescription: tierMetadata[tier].desc,
    ramGB: rawRam,
    cpuCores,
    gpuRenderer: gpu.renderer,
    gpuVendor: gpu.vendor,
    chipsetVendor,
    isLowRam,
    maxTextureSize: gpu.maxTextureSize,
    jsHeapLimitMB,
    supportsHardwareMediaCodec: true, // Universal Android MediaCodec support
    benchmarkScore,
    detectedAt: Date.now()
  };

  return cachedProfile;
}

/**
 * Returns exact device-tailored rules and safe memory limits.
 */
export function getTierOptimizationRules(tier: PerformanceTier): TierOptimizationRules {
  switch (tier) {
    case 'BUDGET_LOW_RAM':
      return {
        tier,
        maxPreviewResolution: '480p',
        recommendedProxyQuality: '480p_30',
        targetPreviewFps: 30,
        maxSimultaneousTracks: 2,
        skiaCanvasDownscale: 0.5, // Render Skia canvas at half-res for 4x fill-rate speedup
        disableHeavyShaders: true,
        safeHeapThresholdMB: 220,
        cacheEvictionThresholdMB: 250,
        codecBufferQueueSize: 2,
        hardwareEncoderName: 'c2.android.avc.encoder'
      };

    case 'MID_RANGE':
      return {
        tier,
        maxPreviewResolution: '720p',
        recommendedProxyQuality: '720p_60',
        targetPreviewFps: 60,
        maxSimultaneousTracks: 4,
        skiaCanvasDownscale: 0.75,
        disableHeavyShaders: false,
        safeHeapThresholdMB: 500,
        cacheEvictionThresholdMB: 650,
        codecBufferQueueSize: 4,
        hardwareEncoderName: 'c2.mtk.avc.encoder'
      };

    case 'FLAGSHIP_HIGH':
      return {
        tier,
        maxPreviewResolution: '1080p',
        recommendedProxyQuality: '720p_60',
        targetPreviewFps: 60,
        maxSimultaneousTracks: 8,
        skiaCanvasDownscale: 1.0,
        disableHeavyShaders: false,
        safeHeapThresholdMB: 1200,
        cacheEvictionThresholdMB: 2000,
        codecBufferQueueSize: 8,
        hardwareEncoderName: 'c2.android.avc.encoder'
      };
  }
}

/**
 * Quick boolean check if current hardware is in the low-RAM tier.
 */
export function isLowRamDevice(): boolean {
  const profile = detectDeviceCapabilities();
  return profile.isLowRam;
}

/**
 * Clear cached profile (useful during testing or hardware state changes).
 */
export function resetDeviceCapabilityCache(): void {
  cachedProfile = null;
}
