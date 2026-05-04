"use client";

import { NoteRating } from "@/lib/data";
import { X, Star, User } from "lucide-react";
import { useState } from "react";
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

  if (!isOpen || typeof document === "undefined") return null;

  const handleRate = async (val: number) => {
    setIsSubmitting(true);
    await onRate(val);
    setIsSubmitting(false);
  };

  const myRating = user ? ratings.find(r => r.uid === user.uid)?.value : 0;
  const average = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length : 0;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#2C2825]/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border border-[#EDE6DD] p-6 shadow-2xl animate-fade-in-up max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#3D3229]">Valoraciones</h3>
            <p className="text-sm text-[#7A6E62] line-clamp-1">{noteTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-[#F9F7F4] hover:bg-[#F5EFE5] text-[#7A6E62] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Rating Section */}
        <div className="bg-[#F9F7F4] rounded-2xl p-4 mb-4 border border-[#EDE6DD]">
          <h4 className="text-sm font-bold text-[#4A433C] mb-2 text-center">
            {user ? "Tu valoración" : "Iniciá sesión para valorar"}
          </h4>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={!user || isSubmitting}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    (hoveredStar ? star <= hoveredStar : star <= (myRating || 0))
                      ? "fill-[#D4AF37] text-[#D4AF37]"
                      : "text-[#D5CAC0] fill-transparent"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Ratings List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h4 className="text-sm font-bold text-[#4A433C] mb-3 flex items-center justify-between">
            <span>Comunidad ({ratings.length})</span>
            {ratings.length > 0 && <span className="text-[#8BAA91] flex items-center gap-1"><Star className="w-3 h-3 fill-[#8BAA91]" /> {average.toFixed(1)}</span>}
          </h4>
          
          {ratings.length === 0 ? (
            <p className="text-center text-sm text-[#A89F95] py-4">Nadie ha valorado este apunte todavía. ¡Sé el primero!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {ratings.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-[#EDE6DD] rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#3D3229]">
                    <div className="w-8 h-8 bg-[#F5F0EA] rounded-full flex items-center justify-center text-[#7A6E62]">
                      <User className="w-4 h-4" />
                    </div>
                    {r.userName}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-3 h-3",
                          star <= r.value ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#E5DCD3] fill-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
