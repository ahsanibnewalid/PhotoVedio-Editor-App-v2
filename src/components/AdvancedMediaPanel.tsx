import React, { useMemo, useState } from 'react';
import { CINEMATIC_SETTINGS_PLACEHOLDER } from '../data/editorDefaults';
import { EXPORT_PRESETS, LUT_PRESETS } from '../data/advancedEditor';
import { buildExportCommand, buildLUTCommand, buildSegmentationCommand } from '../utils/mediaPipeline';

export const AdvancedMediaPanel: React.FC = () => {
  const [lutId, setLutId] = useState(LUT_PRESETS[0].id);
  const [lutIntensity, setLutIntensity] = useState(LUT_PRESETS[0].intensity);
  const [cutout, setCutout] = useState(false);
  const [presetId, setPresetId] = useState(EXPORT_PRESETS[0].id);

  const lut = useMemo(() => LUT_PRESETS.find((item) => item.id === lutId) ?? LUT_PRESETS[0], [lutId]);
  const preset = useMemo(() => EXPORT_PRESETS.find((item) => item.id === presetId) ?? EXPORT_PRESETS[0], [presetId]);
  const exportCommand = buildExportCommand(preset, 'content://input', 'content://output');
  const lutCommand = buildLUTCommand(lut, lutIntensity);
  const cutoutCommand = buildSegmentationCommand('content://input', {
    enabled: cutout,
    feather: 0.15,
    backgroundBlur: 0,
    layerBehindSubject: true,
  });

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Advanced Media Tools</h3>
        <p className="text-xs text-zinc-500">Ported from the v1 editor engine and kept behind platform-neutral adapters.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs text-zinc-400">LUT
          <select className="mt-1 w-full rounded bg-zinc-900 p-2 text-xs text-white" value={lutId} onChange={(e) => setLutId(e.target.value)}>
            {LUT_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-zinc-400">Intensity
          <input className="mt-3 w-full" type="range" min="0" max="1" step="0.05" value={lutIntensity} onChange={(e) => setLutIntensity(Number(e.target.value))} />
        </label>
        <label className="text-xs text-zinc-400">Export preset
          <select className="mt-1 w-full rounded bg-zinc-900 p-2 text-xs text-white" value={presetId} onChange={(e) => setPresetId(e.target.value)}>
            {EXPORT_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-300">
        <input type="checkbox" checked={cutout} onChange={(e) => setCutout(e.target.checked)} /> Subject cutout / ML segmentation
      </label>
      <div className="grid gap-2 md:grid-cols-3 text-[10px] font-mono text-zinc-500">
        <code>LUT: {JSON.stringify(lutCommand.args)}</code>
        <code>Cutout: {JSON.stringify(cutoutCommand.args)}</code>
        <code>Export: {JSON.stringify(exportCommand.args)}</code>
      </div>
    </section>
  );
};
