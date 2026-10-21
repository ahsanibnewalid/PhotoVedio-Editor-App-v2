/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Skia GLSL / SkSL Directional Motion Blur Shader
 * Optimized for real-time 60 FPS GPU execution on Android (Samsung Galaxy A15 5G Mali-G57 MC2 GPU)
 * and WebGL 2.0 / Canvas 2D fallback for instant web simulator preview.
 */

/**
 * Production SkSL (Skia Shading Language) Shader for @shopify/react-native-skia
 * Applies directional motion blur along a velocity vector (angle + speed).
 * Uses sample weighting to create realistic optical camera shutter drag (180° shutter rule).
 */
export const MOTION_BLUR_SKSL = `
uniform shader image;
uniform float2 uVelocity;     // Directional blur vector (dx, dy in pixels)
uniform float uSamples;       // Sampling iterations (typically 10.0 - 16.0)
uniform float uIntensity;     // Blur strength multiplier (0.0 - 1.0)

half4 main(float2 xy) {
    float samples = max(uSamples, 1.0);
    float2 stepVector = (uVelocity * uIntensity) / samples;
    
    half4 accumulatedColor = half4(0.0);
    float totalWeight = 0.0;
    
    // Centered multi-tap sample loop
    for (float i = 0.0; i < 16.0; i += 1.0) {
        if (i >= samples) break;
        
        // Normalized position from -0.5 to +0.5
        float progress = (i / (samples - 1.0)) - 0.5;
        float2 sampleCoord = xy + (uVelocity * uIntensity * progress);
        
        // Quadratic falloff weighting (brighter in center, soft tails)
        float weight = 1.0 - abs(progress * 1.6);
        weight = clamp(weight, 0.1, 1.0);
        
        accumulatedColor += image.eval(sampleCoord) * weight;
        totalWeight += weight;
    }
    
    return accumulatedColor / totalWeight;
}
`;

/**
 * WebGL Fragment Shader equivalent for browser canvas real-time hardware acceleration
 */
export const MOTION_BLUR_WEBGL_FRAG = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uVelocity;
uniform float uIntensity;
uniform float uSamples;
uniform vec2 uResolution;
varying vec2 vTexCoord;

void main() {
    float samples = max(uSamples, 1.0);
    vec2 normalizedVelocity = (uVelocity * uIntensity) / uResolution;
    
    vec4 sum = vec4(0.0);
    float totalWeight = 0.0;
    
    for (float i = 0.0; i < 16.0; i += 1.0) {
        if (i >= samples) break;
        float t = (i / (samples - 1.0)) - 0.5;
        vec2 coord = vTexCoord + normalizedVelocity * t;
        float weight = 1.0 - abs(t * 1.5);
        sum += texture2D(uTexture, clamp(coord, 0.0, 1.0)) * weight;
        totalWeight += weight;
    }
    
    gl_FragColor = sum / totalWeight;
}
`;

/**
 * Pre-configured Motion Blur presets for action cameras and moto-vlogging
 */
export const MOTO_BLUR_PRESETS = {
  OFF: {
    id: 'off',
    name: 'Disabled',
    angle: 0,
    velocity: 0,
    intensity: 0.0,
    samples: 4,
    description: 'Crisp raw sensor output without shutter blur'
  },
  MOTO_CRUISE: {
    id: 'cruise',
    name: 'Moto City Cruise',
    angle: 25, // Subtle forward angle
    velocity: 16,
    intensity: 0.55,
    samples: 10,
    description: 'Natural 180° shutter speed emulation for urban riding (40-60 km/h)'
  },
  HIGHWAY_RUSH: {
    id: 'highway',
    name: 'Highway Warp (100+ km/h)',
    angle: 15, // Forward horizontal drift
    velocity: 28,
    intensity: 0.85,
    samples: 14,
    description: 'High velocity tunnel vision effect with asphalt streaking'
  },
  LEAN_CORNERING: {
    id: 'cornering',
    name: 'Apex Lean Angle',
    angle: 45, // Diagonal asphalt blur
    velocity: 34,
    intensity: 0.95,
    samples: 16,
    description: 'Aggressive diagonal dynamic motion blur for knee-down apex curves'
  }
};

/**
 * Real-time 2D Canvas Fallback Renderer for fast Web preview
 * Simulates directional blur on an HTML5 2D Canvas context
 */
export function applyCanvasDirectionalBlur(
  ctx,
  sourceCanvasOrVideo,
  width,
  height,
  angleDegrees = 25,
  velocityMagnitude = 20,
  intensity = 0.8,
  samples = 8
) {
  if (intensity <= 0.01 || velocityMagnitude <= 0.5) {
    ctx.drawImage(sourceCanvasOrVideo, 0, 0, width, height);
    return;
  }

  const rad = (angleDegrees * Math.PI) / 180;
  const dx = Math.cos(rad) * velocityMagnitude * intensity;
  const dy = Math.sin(rad) * velocityMagnitude * intensity;

  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.drawImage(sourceCanvasOrVideo, 0, 0, width, height);

  const stepX = dx / samples;
  const stepY = dy / samples;
  const alphaStep = 0.45 / samples;

  ctx.globalAlpha = alphaStep;
  for (let i = 1; i <= samples; i++) {
    const offsetX = stepX * i;
    const offsetY = stepY * i;
    ctx.drawImage(sourceCanvasOrVideo, offsetX, offsetY, width, height);
    ctx.drawImage(sourceCanvasOrVideo, -offsetX, -offsetY, width, height);
  }
  ctx.restore();
}

export default {
  MOTION_BLUR_SKSL,
  MOTION_BLUR_WEBGL_FRAG,
  MOTO_BLUR_PRESETS,
  applyCanvasDirectionalBlur
};
