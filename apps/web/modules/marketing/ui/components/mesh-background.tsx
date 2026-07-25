export function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.055)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(34,211,238,0.08),transparent_38%,rgba(52,211,153,0.055)_72%,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
