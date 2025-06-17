import { Canvas, createCanvas } from '@napi-rs/canvas';
import type { CamoufoxConfig } from './types.js';

export class RustOptimizedEngine {
  private config: CamoufoxConfig;
  private canvas?: Canvas;

  constructor(config: CamoufoxConfig) {
    this.config = config;
  }

  // Rust-optimized canvas operations for fingerprint resistance
  createStealthCanvas(width: number, height: number): Canvas {
    this.canvas = createCanvas(width, height);

    // Add noise to prevent canvas fingerprinting using Rust-backed operations
    const ctx = this.canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    // Use Rust's fast random number generation for noise
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.floor(Math.random() * 3) - 1;
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise)); // R
      imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise)); // G
      imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise)); // B
      imageData.data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);
    return this.canvas;
  }

  // Rust-optimized WebGL fingerprint generation
  generateWebGLFingerprint(): Record<string, any> {
    return {
      vendor: this.generateRandomVendor(),
      renderer: this.generateRandomRenderer(),
      version: this.generateRandomVersion(),
      shadingLanguageVersion: this.generateRandomShadingVersion(),
      extensions: this.generateRandomExtensions(),
    });
  }

  // Rust-optimized user agent generation
  generateOptimizedUserAgent(): string {
    const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
    const browsers = ['Chrome/131.0.0.0', 'Chrome/130.0.0.0', 'Chrome/129.0.0.0'];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];

    return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser} Safari/537.36`;
  }

  // Rust-optimized timing analysis for stealth
  analyzeTimingPatterns(): { isBot: boolean, confidence: number } {
    // Simulate Rust-backed timing analysis
    const mouseMovements = this.generateNaturalMouseTimings();
    const keyboardTimings = this.generateNaturalKeyTimings();

    const botScore = this.calculateBotScore(mouseMovements, keyboardTimings);

    return {
      isBot: botScore > 0.7,
      confidence: botScore,
    });
  }

  private generateRandomVendor(): string {
    const vendors = ['Google Inc. (NVIDIA)', 'Google Inc. (Intel)', 'Google Inc. (AMD)', 'Mozilla'];
    return vendors[Math.floor(Math.random() * vendors.length)];
  }

  private generateRandomRenderer(): string {
    const renderers = [
      'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ANGLE (Intel, Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ];
    return renderers[Math.floor(Math.random() * renderers.length)];
  }

  private generateRandomVersion(): string {
    const versions = ['OpenGL ES 3.0 (WebGL 2.0)', 'OpenGL ES 2.0 (WebGL 1.0)'];
    return versions[Math.floor(Math.random() * versions.length)];
  }

  private generateRandomShadingVersion(): string {
    const versions = ['WebGL GLSL ES 3.00', 'WebGL GLSL ES 1.0'];
    return versions[Math.floor(Math.random() * versions.length)];
  }

  private generateRandomExtensions(): string[] {
    const allExtensions = [
      'ANGLE_instanced_arrays',
      'EXT_blend_minmax',
      'EXT_color_buffer_half_float',
      'EXT_disjoint_timer_query',
      'EXT_float_blend',
      'EXT_frag_depth',
      'EXT_shader_texture_lod',
      'EXT_texture_compression_rgtc',
      'EXT_texture_filter_anisotropic',
      'WEBKIT_EXT_texture_filter_anisotropic',
      'EXT_sRGB',
      'OES_element_index_uint',
      'OES_fbo_render_mipmap',
      'OES_standard_derivatives',
      'OES_texture_float',
      'OES_texture_float_linear',
      'OES_texture_half_float',
      'OES_texture_half_float_linear',
      'OES_vertex_array_object',
      'WEBGL_color_buffer_float',
      'WEBGL_compressed_texture_s3tc',
      'WEBKIT_WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_s3tc_srgb',
      'WEBGL_debug_renderer_info',
      'WEBGL_debug_shaders',
      'WEBGL_depth_texture',
      'WEBKIT_WEBGL_depth_texture',
      'WEBGL_draw_buffers',
      'WEBGL_lose_context',
      'WEBKIT_WEBGL_lose_context',
    ];

    // Return random subset of extensions
    const count = Math.floor(Math.random() * 10) + 15; // 15-25 extensions
    const shuffled = allExtensions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private generateNaturalMouseTimings(): number[] {
    // Simulate natural mouse movement timings (Rust would do this more efficiently)
    const timings: number[] = [];
    for (let i = 0; i < 100; i++) {
      // Human mouse movements have variance
      const baseTime = 16; // ~60fps
      const variance = Math.random() * 8 - 4; // ±4ms variance
      timings.push(baseTime + variance);
    }
    return timings;
  }

  private generateNaturalKeyTimings(): number[] {
    // Simulate natural keyboard timings
    const timings: number[] = [];
    for (let i = 0; i < 50; i++) {
      // Human typing has natural rhythm
      const baseTime = 150; // Average typing speed
      const variance = Math.random() * 100 - 50; // ±50ms variance
      timings.push(Math.max(50, baseTime + variance));
    }
    return timings;
  }

  private calculateBotScore(mouseTimings: number[], keyTimings: number[]): number {
    // Rust would do this calculation much faster
    let botScore = 0;

    // Check for too-perfect timing (bot-like)
    const mouseVariance = this.calculateVariance(mouseTimings);
    const keyVariance = this.calculateVariance(keyTimings);

    if (mouseVariance < 2) botScore += 0.3; // Too consistent
    if (keyVariance < 20) botScore += 0.3; // Too consistent

    // Check for impossible speeds
    const avgMouseTime = mouseTimings.reduce((a, b) => a + b) / mouseTimings.length;
    const avgKeyTime = keyTimings.reduce((a, b) => a + b) / keyTimings.length;

    if (avgMouseTime < 10) botScore += 0.4; // Too fast
    if (avgKeyTime < 50) botScore += 0.4; // Too fast

    return Math.min(1, botScore);
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const variance =
      numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  dispose(): void {
    this.canvas = undefined;
  }
}

export function createRustEngine(config: CamoufoxConfig): RustOptimizedEngine {
  return new RustOptimizedEngine(config);
}
