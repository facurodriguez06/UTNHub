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
          setTitle(data.announcementTitle || "ANUNCIO");
          setMessage(data.announcementMessage || "");
          
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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-200"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      
      <div className="relative bg-white p-8 w-full max-w-md border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-zinc-900 flex items-center justify-center text-zinc-900 hover:bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-10"
        >
          <X className="w-6 h-6" strokeWidth={4} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
             <div className="absolute -top-2 -right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-5 w-5 bg-emerald-500 border-2 border-zinc-900"></span>
             </div>
             <Megaphone className="w-10 h-10 text-zinc-900" strokeWidth={3} />
          </div>

          <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase tracking-tighter leading-none italic">{title}</h2>
          <p className="text-lg font-black text-zinc-700 leading-tight mb-8 uppercase tracking-tight">
            {message}
          </p>

          <button
            onClick={handleClose}
            className="w-full py-4 px-6 bg-emerald-400 border-4 border-zinc-900 text-zinc-900 font-black text-xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:bg-emerald-500 transition-all"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
}
