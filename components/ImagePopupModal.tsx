"use client";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { X } from "lucide-react";
import { resolveStorageUrl } from "@/lib/storage";

export function ImagePopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [imgErrorMsg, setImgErrorMsg] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isImagePopupActive && data.imagePopupUrl) {
          setImageUrl(data.imagePopupUrl);
          setLinkUrl(data.imagePopupLink || "");
          
          const lastSeen = localStorage.getItem("lastImagePopup");
          const sessionClosed = sessionStorage.getItem("imagePopupClosedThisSession");
          
          if (lastSeen !== data.imagePopupUrl && !sessionClosed) {
            setIsOpen(true);
          }
        } else {
          setIsOpen(false);
        }
      }
    });
    return () => unsub();
  }, []);

  useScrollLock(isOpen);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("imagePopupClosedThisSession", "true");
    if (imageUrl) {
      localStorage.setItem("lastImagePopup", imageUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 shadow-[0_0_10px_rgba(0,0,0,0.02)] animate-fade-in overscroll-none"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="relative max-w-[calc(100vw-2rem)] sm:max-w-2xl w-fit h-fit mx-auto animate-fade-in-up flex flex-col justify-center items-center">
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 z-10 p-2 bg-white rounded-full text-black hover:bg-gray-200 shadow-xl transition-colors outline-none"
        >
          <X className="w-6 h-6" />
        </button>
        
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose} className="flex overflow-hidden rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform outline-none relative bg-white">
            <img 
              src={imageUrl.startsWith("http") ? imageUrl : `https://pub-be009cc7cdca400cb717da8a110bcaa8.r2.dev/${imageUrl}`} 
              alt="Promo" 
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            />
          </a>
        ) : (
          <div className="flex overflow-hidden rounded-2xl shadow-2xl relative bg-white">
            <img 
              src={imageUrl.startsWith("http") ? imageUrl : `https://pub-be009cc7cdca400cb717da8a110bcaa8.r2.dev/${imageUrl}`} 
              alt="Promo" 
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}