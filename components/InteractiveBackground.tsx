"use client";

import { useEffect, useRef, useCallback } from "react";

export function InteractiveBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!tickingRef.current) {
      window.requestAnimationFrame(() => {
        if (spotlightRef.current) {
          const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
          
          spotlightRef.current.style.setProperty("--mx", `${clientX}px`);
          spotlightRef.current.style.setProperty("--my", `${clientY}px`);
        }
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove as EventListener);
    window.addEventListener("touchmove", handleMove as EventListener, { passive: true });
    window.addEventListener("touchstart", handleMove as EventListener, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMove as EventListener);
      window.removeEventListener("touchmove", handleMove as EventListener);
      window.removeEventListener("touchstart", handleMove as EventListener);
    };
  }, [handleMove]);

  // Dot grid pattern as inline SVG data URI
  const dotSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='1.8' fill='%238BAA91'/%3E%3C/svg%3E`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .interactive-bg-pattern {
          position: fixed;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background-image: url("data:image/svg+xml,${dotSvg}");
          background-size: 28px 28px;
          background-repeat: repeat;
          opacity: 0.15; /* Base visibility for mobile */
          transition: opacity 0.5s ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .interactive-bg-pattern {
            opacity: 1; /* Reset opacity since mask will handle it */
            -webkit-mask-image: radial-gradient(circle 350px at var(--mx, -350px) var(--my, -350px), black 0%, transparent 100%);
            mask-image: radial-gradient(circle 350px at var(--mx, -350px) var(--my, -350px), black 0%, rgba(0,0,0,0.05) 100%);
          }
        }
      `}} />
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="interactive-bg-pattern"
      />
    </>
  );
}
