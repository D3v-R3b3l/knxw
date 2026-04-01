import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080b14]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="glass-card rounded-2xl border border-white/10 p-10 text-center max-w-lg mx-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse" />
            <AlertCircle className="relative h-16 w-16 text-red-400" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>404</h1>

        <h2 className="text-xl font-semibold text-white/70 mb-4">
          Page Not Found
        </h2>

        <p className="text-white/40 mb-8 leading-relaxed text-sm">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}
