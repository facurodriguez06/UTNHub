"use client";

import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { X, Megaphone } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isAnnouncementActive) {
          setTitle(data.announcementTitle || "Anuncio");
          setMessage(data.announcementMessage || "");
          
          // Check if user already saw this specific announcement
          const lastSeen = localStorage.getItem("lastAnnouncement");
          const currentAnnounceId = data.announcementTitle + data.announcementMessage;
          if (lastSeen !== currentAnnounceId) {
            setIsOpen(true);
          }
        } else {
          setIsOpen(false);
        }
      }
    }, (error) => {
      console.error("Error al escuchar settings global en AnnouncementModal:", error);
    });
    return () => unsub();
  }, []);

  useScrollLock(isOpen);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("lastAnnouncement", title + message);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 shadow-[0_0_10px_rgba(0,0,0,0.02)] animate-fade-in overscroll-none"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[calc(100vw-2rem)] sm:max-w-md shadow-2xl relative border border-[#EDE6DD] animate-fade-in-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#A89F95] hover:bg-[#F5F0EA] hover:text-[#4A433C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-[#F5EFE5] rounded-full flex items-center justify-center mb-6 border border-[#E2D6C2] relative">
             <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BAA91] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8BAA91]"></span>
             </div>
             <Megaphone className="w-8 h-8 text-[#8B7355]" />
          </div>

          <h2 className="text-2xl font-bold text-[#2C2825] mb-3">{title}</h2>
          <p className="text-base text-[#7A6E62] leading-relaxed mb-8">
            {message}
          </p>

          <button
            onClick={handleClose}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8] text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all outline-none"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
