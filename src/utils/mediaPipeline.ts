import type { CutoutSettings, ExportPreset, LUTPreset } from '../data/advancedEditor';

/** Platform-neutral command description. Native Android adapters can execute these operations. */
export interface MediaCommand {
  operation: 'export' | 'segment' | 'apply-lut';
  args: Record<string, string | number | boolean>;
}

export function buildExportCommand(preset: ExportPreset, inputUri: string, outputUri: string): MediaCommand {
  return {
    operation: 'export',
    args: {
      inputUri,
      outputUri,
      codec: preset.codec,
      resolution: preset.resolution,
      frameRate: preset.frameRate,
      bitrateMbps: preset.bitrateMbps,
    },
  };
}

export function buildSegmentationCommand(inputUri: string, settings: CutoutSettings): MediaCommand {
  return {
    operation: 'segment',
    args: {
      inputUri,
      enabled: settings.enabled,
      feather: settings.feather,
      backgroundBlur: settings.backgroundBlur,
      layerBehindSubject: settings.layerBehindSubject,
    },
  };
}

export function buildLUTCommand(lut: LUTPreset, intensity = lut.intensity): MediaCommand {
  return {
    operation: 'apply-lut',
    args: { lutId: lut.id, intensity },
  };
}

export const nativeIntegrationStatus = {
  ffmpegKit: 'adapter-ready',
  mlKitSegmentation: 'adapter-ready',
  mediaCodec: 'adapter-ready',
} as const;
