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
    <fieldset
      style={{
        marginTop: '1rem',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.875rem',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}
      data-testid="fx-toggle"
    >
      <legend style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
        Visual FX (progressive)
      </legend>
      <label
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
      >
        <input
          id="fx-master"
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        <span>Enable visual FX (master)</span>
      </label>
      <div className={value.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          <input
            id="fx-scanlines"
            type="checkbox"
            checked={value.scanlines}
            onChange={(e) => onChange({ ...value, scanlines: e.target.checked })}
          />
          <span>Scanline overlay</span>
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          <input
            id="fx-rgb-split"
            type="checkbox"
            checked={value.rgbSplitOnHover}
            onChange={(e) => onChange({ ...value, rgbSplitOnHover: e.target.checked })}
          />
          <span>RGB split on hover/focus</span>
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
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
