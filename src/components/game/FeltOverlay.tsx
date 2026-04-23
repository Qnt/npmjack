export function FeltOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[21px] opacity-70 mix-blend-soft-light"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px)',
        backgroundSize: '20px 20px',
      }}
    />
  )
}
