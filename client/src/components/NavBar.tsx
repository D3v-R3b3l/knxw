import { BarChart3, Cpu } from "lucide-react";
import { useLocation } from "wouter";

export default function NavBar() {
  const [location, setLocation] = useLocation();

  const links = [
    { path: "/", label: "Revenue Projection", icon: <BarChart3 size={14} /> },
    { path: "/command", label: "Command Dashboard", icon: <Cpu size={14} /> },
  ];

  return (
    <nav className="border-b border-white/8 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">kX</span>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">knXw Labs</span>
        </div>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <button
              key={l.path}
              onClick={() => setLocation(l.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                location === l.path
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {l.icon}
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
