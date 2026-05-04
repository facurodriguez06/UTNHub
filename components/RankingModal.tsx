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
  // Prevenir scroll en el body cuando el modal está abierto
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#3D3229]/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDE6DD] bg-gradient-to-r from-[#FFFBF7] to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFF8E6] p-2 rounded-xl border border-[#FDEBBA]">
              <Trophy className="w-6 h-6 text-[#F5B041]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#3D3229]">Ranking Completo</h2>
              <p className="text-sm text-[#7A6E62]">Todos nuestros colaboradores</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F0EA] text-[#A89F95] hover:text-[#3D3229] transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-6 space-y-3 bg-[#FCFAEF]/30 no-scrollbar">
          {uploaders.map((uploader, index) => (
            <div 
              key={uploader.name} 
              className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#EDE6DD] hover:shadow-md hover:border-[#8BAA91]/40 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                ${index === 0 ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FFF0B3] text-[#D49A00] border border-[#FFE066] shadow-sm shadow-[#FFE066]/30' : 
                  index === 1 ? 'bg-gradient-to-br from-[#F5F7FA] to-[#E4E7EB] text-[#788291] border border-[#D1D5DB] shadow-sm shadow-[#D1D5DB]/30' : 
                  index === 2 ? 'bg-gradient-to-br from-[#FFF3E6] to-[#FFE0B3] text-[#B87A3D] border border-[#FFD199] shadow-sm shadow-[#FFD199]/30' : 
                  'bg-[#E8F0EA] text-[#4A7A52] border border-[#C5DBC9]'}`}
              >
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#3D3229] truncate">{uploader.name}</h3>
                <p className="text-xs font-semibold text-[#8BAA91] bg-[#E8F0EA] inline-block px-2 py-0.5 rounded-md mt-1">
                  {uploader.count} {uploader.count === 1 ? 'apunte' : 'apuntes'}
                </p>
              </div>
              <div>
                {index < 3 ? (
                  <Medal className={`w-6 h-6 
                    ${index === 0 ? 'text-[#F5B041]' : 
                      index === 1 ? 'text-[#A6ACAF]' : 
                      'text-[#E59866]'}`} 
                  />
                ) : (
                  <Star className="w-5 h-5 text-[#8BAA91]" />
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
