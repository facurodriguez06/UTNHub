"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retraso intencionado de 1.5s para que se vea la animación
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F7F5F0] bg-texture-grain transition-all duration-700 ease-in-out ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="relative flex flex-col items-center justify-center animate-fade-in-up px-8 py-10 bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)]">
        
        <Image 
          src="/iconNeo-v2.png" 
          alt="UTNHub Logo" 
          width={104}
          height={104}
          className="w-24 h-24 object-contain mb-6 drop-shadow-[6px_6px_0px_rgba(24,24,27,0.18)]" 
        />
        
        <div className="flex flex-col items-center gap-4">
          <span className="font-black text-3xl tracking-tighter text-zinc-900 leading-none uppercase italic">
            UTN<span className="text-emerald-500">Hub</span>
          </span>
          
          <div className="relative w-44 h-2 bg-zinc-900 border-2 border-zinc-900 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-emerald-400 origin-left animate-[progress_1.5s_ease-in-out_forwards]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
