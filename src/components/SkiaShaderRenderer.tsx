import React, { useRef, useEffect } from 'react';
import { FilterType, LutPresetType } from '../types/editor';

interface SkiaShaderRendererProps {
  filterType: FilterType;
  activeLut?: LutPresetType;
  filterIntensity: number;
  width: number;
  height: number;
  anamorphicLetterbox?: boolean;
}

/**
 * Simulates Shopify React Native Skia GPU shader rendering,
 * SkSL fragment shaders, 3D LUT color transforms, and 2.39:1 Anamorphic Letterbox.
 */
export const SkiaShaderRenderer: React.FC<SkiaShaderRendererProps> = ({
  filterType,
  activeLut = 'NONE',
  filterIntensity,
  width,
  height,
  anamorphicLetterbox = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const renderSkiaGpuEffects = () => {
      t += 0.04;
      ctx.clearRect(0, 0, width, height);

      // 1. NEON GLOW SHADER (SkSL High-Pass Bloom simulation)
      if (filterType === 'NEON_GLOW') {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.max(width, height) * 0.7;

        const radialGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
        const pulse = 0.2 + Math.sin(t) * 0.08;
        
        radialGrad.addColorStop(0, 'rgba(0, 242, 254, 0.02)');
        radialGrad.addColorStop(0.5, `rgba(0, 242, 254, ${0.14 * filterIntensity * pulse})`);
        radialGrad.addColorStop(0.85, `rgba(0, 242, 254, ${0.35 * filterIntensity})`);
        radialGrad.addColorStop(1, `rgba(2, 6, 23, ${0.65 * filterIntensity})`);

        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);

        // Scanline simulation from SkSL shader
        ctx.fillStyle = `rgba(0, 242, 254, ${0.05 * filterIntensity})`;
        const lineSpacing = 6;
        for (let y = 0; y < height; y += lineSpacing) {
          ctx.fillRect(0, y, width, 1);
        }

        // Cyan HUD corner accents
        ctx.strokeStyle = `rgba(0, 242, 254, ${0.5 * filterIntensity})`;
        ctx.lineWidth = 1.5;
        const borderLen = 22;
        
        ctx.beginPath();
        ctx.moveTo(12, 12 + borderLen);
        ctx.lineTo(12, 12);
        ctx.lineTo(12 + borderLen, 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width - 12 - borderLen, height - 12);
        ctx.lineTo(width - 12, height - 12);
        ctx.lineTo(width - 12, height - 12 - borderLen);
        ctx.stroke();
      }

      // 2. VIGNETTE SHADER
      if (filterType === 'VIGNETTE' || activeLut === 'ANAMORPHIC_VIGNETTE') {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.max(width, height) * 0.75;
        const vigGrad = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.75 * filterIntensity})`);

        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. 35mm FILM GRAIN SHADER (Dynamic GPU noise)
      if (activeLut === 'FILM_GRAIN') {
        const grainIntensity = 0.08 * filterIntensity;
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const len = data.length;
        for (let i = 0; i < len; i += 16) {
          const noise = (Math.random() - 0.5) * 255 * grainIntensity;
          data[i] = 230 + noise;
          data[i + 1] = 220 + noise;
          data[i + 2] = 200 + noise;
          data[i + 3] = Math.abs(noise);
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // 4. 2.39:1 CINEMATIC ANAMORPHIC LETTERBOX BARS
      if (anamorphicLetterbox) {
        // Calculate cinema scope bar height based on 2.39:1 ratio
        const cinemaHeight = width / 2.39;
        const barHeight = Math.max(16, (height - cinemaHeight) / 2);

        ctx.fillStyle = '#000000';
        // Top black bar
        ctx.fillRect(0, 0, width, barHeight);
        // Bottom black bar
        ctx.fillRect(0, height - barHeight, width, barHeight);

        // Thin anamorphic blue lens flare line indicator
        ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.fillRect(0, barHeight, width, 1);
        ctx.fillRect(0, height - barHeight - 1, width, 1);
      }

      animationFrameId = requestAnimationFrame(renderSkiaGpuEffects);
    };

    renderSkiaGpuEffects();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [filterType, activeLut, filterIntensity, width, height, anamorphicLetterbox]);

  // Color grading layer with mix-blend-mode for 3D LUTs
  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="pointer-events-none absolute inset-0 z-20"
      />

      {/* 3D LUT Color Matrix / Grading Overlay */}
      {activeLut === 'TEAL_ORANGE' && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.22) 0%, rgba(247, 127, 0, 0.24) 100%)',
            mixBlendMode: 'color',
            opacity: filterIntensity,
          }}
        />
      )}

      {activeLut === 'MOODY_WARM' && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundColor: 'rgba(217, 119, 6, 0.2)',
            mixBlendMode: 'color-burn',
            opacity: filterIntensity,
          }}
        />
      )}

      {activeLut === 'MATRIX_GREEN' && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.3) 100%)',
            mixBlendMode: 'screen',
            opacity: filterIntensity,
          }}
        />
      )}

      {activeLut === 'AUTO_CINEMATIC' && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.12) 0%, rgba(14, 116, 144, 0.22) 100%)',
            mixBlendMode: 'soft-light',
            opacity: filterIntensity,
          }}
        />
      )}

      {/* Basic Color Filters */}
      {filterType === 'SEPIA' && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundColor: `rgba(180, 120, 40, ${0.2 * filterIntensity})`,
            mixBlendMode: 'color',
          }}
        />
      )}

      {filterType === 'GRAYSCALE' && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundColor: `rgba(120, 120, 130, ${0.15 * filterIntensity})`,
            mixBlendMode: 'saturation',
          }}
        />
      )}
    </>
  );
};
