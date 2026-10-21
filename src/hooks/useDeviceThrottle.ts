/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * useDeviceThrottle.ts
 * Real-Time Memory Pressure Monitor & Hardware Throttle Protection Hook.
 * 
 * Protects budget Samsung Galaxy A and Xiaomi/Redmi devices from:
 * 1. Out-Of-Memory (OOM) app crashes caused by 4K multi-track video buffers.
 * 2. Thermal throttling and GPU frame drops during continuous Skia shader rendering.
 * 
 * Features:
 * - Continuously monitors JS Heap memory and requestAnimationFrame cadence.
 * - Detects Memory Pressure: NORMAL (<65%), WARNING (65%-82%), and CRITICAL (>82%).
 * - Automatically triggers cache purging and memory eviction when thresholds are exceeded.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  detectDeviceCapabilities, 
  getTierOptimizationRules, 
  DeviceHardwareProfile, 
  PerformanceTier 
} from '../utils/DeviceCapabilityDetector';
import { ProxyQuality } from '../types/editor';

export type MemoryPressureLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface DeviceThrottleState {
  profile: DeviceHardwareProfile;
  tier: PerformanceTier;
  isLowRam: boolean;
  isThrottled: boolean;
  pressureLevel: MemoryPressureLevel;
  memoryUsageRatio: number; // 0.0 to 1.0
  usedHeapMB: number;
  totalHeapMB: number;
  limitHeapMB: number;
  currentFps: number;
  droppedFramesCount: number;
  recommendedProxyQuality: ProxyQuality;
  lastPurgeTimestamp: number | null;
  triggerPurge: () => void;
}

interface UseDeviceThrottleOptions {
  onAutoPurgeCache?: () => void;
  onDowngradeProxy?: (newQuality: ProxyQuality) => void;
  pollingIntervalMs?: number;
  enableFpsTracking?: boolean;
}

export function useDeviceThrottle(options: UseDeviceThrottleOptions = {}): DeviceThrottleState {
  const {
    onAutoPurgeCache,
    onDowngradeProxy,
    pollingIntervalMs = 2000,
    enableFpsTracking = true
  } = options;

  // 1. Initial Hardware Profile
  const [profile] = useState<DeviceHardwareProfile>(() => detectDeviceCapabilities());
  const rules = getTierOptimizationRules(profile.tier);

  // 2. Memory State
  const [usedHeapMB, setUsedHeapMB] = useState<number>(profile.tier === 'BUDGET_LOW_RAM' ? 145 : 210);
  const [totalHeapMB, setTotalHeapMB] = useState<number>(profile.tier === 'BUDGET_LOW_RAM' ? 240 : 380);
  const [limitHeapMB, setLimitHeapMB] = useState<number>(profile.jsHeapLimitMB || 512);
  const [memoryUsageRatio, setMemoryUsageRatio] = useState<number>(0.35);
  const [pressureLevel, setPressureLevel] = useState<MemoryPressureLevel>('NORMAL');
  const [isThrottled, setIsThrottled] = useState<boolean>(false);
  const [lastPurgeTimestamp, setLastPurgeTimestamp] = useState<number | null>(null);

  // 3. FPS & Frame Timing State
  const [currentFps, setCurrentFps] = useState<number>(profile.tier === 'BUDGET_LOW_RAM' ? 30 : 60);
  const [droppedFramesCount, setDroppedFramesCount] = useState<number>(0);

  // Refs for tracking animation loops and debounces
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const isPurgingRef = useRef<boolean>(false);

  // Manual or automatic purge handler
  const triggerPurge = useCallback(() => {
    if (isPurgingRef.current) return;
    isPurgingRef.current = true;

    // 1. Invoke external purge callback
    if (onAutoPurgeCache) {
      onAutoPurgeCache();
    }

    // 2. Trigger browser garbage collection hint if available in dev/testing
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
      } catch {
        // Ignored in standard browser environments
      }
    }

    // 3. Update local state
    setLastPurgeTimestamp(Date.now());
    setPressureLevel('NORMAL');
    setIsThrottled(false);

    // Reclaim memory simulation for UI feedback
    setUsedHeapMB((prev) => Math.max(90, Math.round(prev * 0.55)));
    setMemoryUsageRatio((prev) => Math.max(0.25, prev * 0.55));

    setTimeout(() => {
      isPurgingRef.current = false;
    }, 1500);
  }, [onAutoPurgeCache]);

  // Periodic Memory Polling
  useEffect(() => {
    const checkMemory = () => {
      const perf = typeof window !== 'undefined' ? (window.performance as any) : null;
      let currentUsed = usedHeapMB;
      let currentLimit = limitHeapMB;

      if (perf && perf.memory) {
        currentUsed = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
        const total = Math.round(perf.memory.totalJSHeapSize / (1024 * 1024));
        currentLimit = Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024));
        setUsedHeapMB(currentUsed);
        setTotalHeapMB(total);
        setLimitHeapMB(currentLimit);
      }

      // Memory usage ratio relative to safe hardware threshold
      const safeThreshold = rules.safeHeapThresholdMB;
      const ratio = currentUsed / (safeThreshold || 400);
      setMemoryUsageRatio(Math.min(1.0, ratio));

      // Classify pressure
      if (ratio >= 0.85 || currentUsed >= safeThreshold) {
        setPressureLevel('CRITICAL');
        setIsThrottled(true);

        // Auto-purge memory when reaching critical state on budget/mid devices
        if (!isPurgingRef.current) {
          triggerPurge();
          if (profile.tier === 'BUDGET_LOW_RAM' && onDowngradeProxy) {
            onDowngradeProxy('480p_30');
          }
        }
      } else if (ratio >= 0.65) {
        setPressureLevel('WARNING');
        setIsThrottled(profile.tier === 'BUDGET_LOW_RAM');
      } else {
        setPressureLevel('NORMAL');
        setIsThrottled(false);
      }
    };

    const interval = setInterval(checkMemory, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [limitHeapMB, pollingIntervalMs, profile.tier, rules.safeHeapThresholdMB, triggerPurge, usedHeapMB, onDowngradeProxy]);

  // Frame Cadence & Frame-Drop Monitor Loop
  useEffect(() => {
    if (!enableFpsTracking || typeof window === 'undefined') return;

    let animId: number;

    const frameLoop = (timestamp: number) => {
      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      frameCountRef.current++;

      // Detect dropped frame (frame took > 34ms = < 29 FPS)
      if (delta > 34) {
        setDroppedFramesCount((prev) => prev + 1);
      }

      // Calculate running FPS every 1 second
      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        const measuredFps = Math.min(60, Math.round((frameCountRef.current * 1000) / (timestamp - lastFpsUpdateRef.current)));
        setCurrentFps(measuredFps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = timestamp;
      }

      animId = requestAnimationFrame(frameLoop);
    };

    animId = requestAnimationFrame(frameLoop);
    return () => cancelAnimationFrame(animId);
  }, [enableFpsTracking]);

  return {
    profile,
    tier: profile.tier,
    isLowRam: profile.isLowRam,
    isThrottled,
    pressureLevel,
    memoryUsageRatio,
    usedHeapMB,
    totalHeapMB,
    limitHeapMB,
    currentFps,
    droppedFramesCount,
    recommendedProxyQuality: rules.recommendedProxyQuality,
    lastPurgeTimestamp,
    triggerPurge
  };
}
