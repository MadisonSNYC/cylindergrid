export type VisualFxConfig = {
  enabled: boolean;                // master kill switch (default: false)
  scanlines: boolean;              // overlay subtle scanline texture
  rgbSplitOnHover: boolean;        // CSS-only chromatic aberration on hover/focus
  depthFade: boolean;              // reduce opacity/blur for far tiles
  webglFx: false;                  // reserved: optional R3F/WebGL fx (OFF by default)
  mobileMinCores: number;          // minimum cores to allow fx
};

export const defaultFxConfig: VisualFxConfig = {
  enabled: false,
  scanlines: true,
  rgbSplitOnHover: true,
  depthFade: true,
  webglFx: false,
  mobileMinCores: 6,
};

export function shouldEnableFx(prefersReducedMotion: boolean): boolean {
  if (prefersReducedMotion) return false;
  // Very conservative gating: tiny core count → off
  try {
    const cores = (navigator as any).hardwareConcurrency ?? 4;
    if (cores < defaultFxConfig.mobileMinCores) return false;
  } catch { /* noop */ }
  return true;
}