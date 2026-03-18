export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0b1e] to-[#07080f]" />

      {/* Animated blobs */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 animate-pulse"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          animationDuration: "4s",
        }}
      />
      <div
        className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-15 animate-pulse"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
          animationDuration: "6s",
          animationDelay: "1s",
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 animate-pulse"
        style={{
          background: "radial-gradient(circle, #db2777 0%, transparent 70%)",
          animationDuration: "5s",
          animationDelay: "2s",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
