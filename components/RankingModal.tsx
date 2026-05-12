"use client";

import { Trophy, Medal, X, Star } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type UploaderStat = {
  name: string;
  count: number;
};

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploaders: UploaderStat[];
}

export function RankingModal({ isOpen, onClose, uploaders }: RankingModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-200">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-2xl bg-white flex flex-col max-h-[85vh] animate-fade-in-scale border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-4 border-zinc-900 bg-emerald-400 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-4 border-zinc-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Trophy className="w-7 h-7 text-zinc-900" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none">Ranking Completo</h2>
              <p className="text-[10px] text-zinc-800 font-black uppercase tracking-widest mt-1 italic">Nuestros mayores colaboradores</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white border-4 border-zinc-900 flex items-center justify-center text-zinc-900 hover:bg-red-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <X className="w-6 h-6" strokeWidth={4} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-zinc-50 custom-scrollbar">
          {uploaders.map((uploader, index) => (
            <div 
              key={uploader.name} 
              className="flex items-center gap-4 bg-white p-4 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <div className={`w-14 h-14 border-4 border-zinc-900 flex items-center justify-center font-black text-2xl
                ${index === 0 ? 'bg-yellow-400' : 
                  index === 1 ? 'bg-zinc-300' : 
                  index === 2 ? 'bg-orange-400' : 
                  'bg-white'}`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-zinc-900 truncate uppercase text-lg leading-tight">{uploader.name}</h3>
                <p className="text-[10px] font-black text-zinc-900 bg-emerald-400 border-2 border-zinc-900 inline-block px-2 py-0.5 mt-1 uppercase tracking-wider">
                  {uploader.count} {uploader.count === 1 ? 'APUNTE' : 'APUNTES'}
                </p>
              </div>
              <div className="flex shrink-0">
                {index < 3 ? (
                  <Medal className={`w-8 h-8 
                    ${index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-zinc-500' : 
                      'text-orange-600'}`} strokeWidth={3}
                  />
                ) : (
                  <Star className="w-6 h-6 text-zinc-300" strokeWidth={3} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
