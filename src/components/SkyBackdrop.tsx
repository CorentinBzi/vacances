/**
 * Fixed "summer sky" backdrop behind every screen: azure-to-warm-horizon
 * gradient, a pulsing sun glow, and three slowly drifting clouds.
 */
export function SkyBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="sky-gradient" />
      <div className="sun-glow" />
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />
    </div>
  );
}
