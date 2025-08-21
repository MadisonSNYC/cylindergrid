
type FxState = {
  enabled: boolean;
  scanlines: boolean;
  rgbSplitOnHover: boolean;
  depthFade: boolean;
};

export default function FxToggle({
  value,
  onChange,
}: {
  value: FxState;
  onChange: (v: FxState) => void;
}) {
  return (
    <fieldset className="mt-4 space-y-2 text-sm text-white/90" data-testid="fx-toggle">
      <legend className="mb-1 font-medium">Visual FX (progressive)</legend>
      <label className="flex items-center gap-2">
        <input
          id="fx-master"
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        <span>Enable visual FX (master)</span>
      </label>
      <div className={value.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
        <label className="flex items-center gap-2">
          <input
            id="fx-scanlines"
            type="checkbox"
            checked={value.scanlines}
            onChange={(e) => onChange({ ...value, scanlines: e.target.checked })}
          />
          <span>Scanline overlay</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            id="fx-rgb-split"
            type="checkbox"
            checked={value.rgbSplitOnHover}
            onChange={(e) => onChange({ ...value, rgbSplitOnHover: e.target.checked })}
          />
          <span>RGB split on hover/focus</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            id="fx-depth-fade"
            type="checkbox"
            checked={value.depthFade}
            onChange={(e) => onChange({ ...value, depthFade: e.target.checked })}
          />
          <span>Depth fade (far tiles)</span>
        </label>
      </div>
      <p className="text-xs text-white/60">
        FX auto-disables on reduced-motion or low-core devices. Defaults to OFF.
      </p>
    </fieldset>
  );
}