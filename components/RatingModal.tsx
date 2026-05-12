"use client";

import { NoteRating } from "@/lib/data";
import { X, Star, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function RatingModal({
  isOpen,
  onClose,
  ratings,
  onRate,
  noteTitle
}: {
  isOpen: boolean;
  onClose: () => void;
  ratings: NoteRating[];
  onRate: (value: number) => Promise<void>;
  noteTitle: string;
}) {
  const { user } = useAuth();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleRate = async (val: number) => {
    setIsSubmitting(true);
    await onRate(val);
    setIsSubmitting(false);
  };

  const myRating = user ? ratings.find(r => r.uid === user.uid)?.value : 0;
  const average = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length : 0;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-200">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md border-4 border-zinc-900 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none italic">Valoraciones</h3>
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1 truncate">{noteTitle}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white border-4 border-zinc-900 flex items-center justify-center text-zinc-900 hover:bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <X className="w-6 h-6" strokeWidth={4} />
          </button>
        </div>

        {/* User Rating Section */}
        <div className="bg-zinc-50 border-4 border-zinc-900 p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
          <h4 className="text-xs font-black text-zinc-900 mb-4 text-center uppercase tracking-widest">
            {user ? "TU VALORACIÓN" : "INICIÁ SESIÓN PARA VALORAR"}
          </h4>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={!user || isSubmitting}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="focus:outline-none transition-all hover:scale-125 disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredStar ? star <= hoveredStar : star <= (myRating || 0))
                      ? "fill-yellow-400 text-zinc-900"
                      : "text-zinc-200 fill-transparent"
                  )}
                  strokeWidth={3}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Ratings List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h4 className="text-xs font-black text-zinc-900 mb-4 flex items-center justify-between uppercase tracking-widest border-b-4 border-zinc-900 pb-2">
            <span>COMUNIDAD ({ratings.length})</span>
            {ratings.length > 0 && (
              <span className="bg-emerald-400 border-2 border-zinc-900 px-2 py-0.5 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Star className="w-3 h-3 fill-zinc-900" /> {average.toFixed(1)}
              </span>
            )}
          </h4>
          
          {ratings.length === 0 ? (
            <p className="text-center text-xs text-zinc-400 font-black uppercase tracking-widest py-8 italic border-4 border-dashed border-zinc-200">
              Nadie ha valorado este apunte todavía.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {ratings.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3 text-sm font-black text-zinc-900 uppercase tracking-tighter">
                    <div className="w-10 h-10 bg-emerald-400 border-4 border-zinc-900 flex items-center justify-center text-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <User className="w-5 h-5" strokeWidth={3} />
                    </div>
                    <span className="truncate max-w-[150px]">{r.userName}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= r.value ? "fill-yellow-400 text-zinc-900" : "text-zinc-200 fill-transparent"
                        )}
                        strokeWidth={2.5}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
