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
    <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFFBF7] transition-all duration-700 ease-in-out ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="relative flex flex-col items-center justify-center animate-fade-in-up">
        
        <div className="relative flex items-center justify-center mb-6">
           <Image 
               src="/icon-optimized.webp" 
               alt="UTNHub Logo" 
               width={80}
               height={80}
               className="w-20 h-20 object-contain drop-shadow-md" 
            />
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <span className="font-extrabold text-3xl tracking-tight text-[#3D3229] leading-none">
            UTN<span className="text-[#8BAA91]">Hub</span>
          </span>
          
          <div className="relative w-40 h-1 bg-[#EDE6DD] rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[#8BAA91] rounded-full origin-left animate-[progress_1.5s_ease-in-out_forwards]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
