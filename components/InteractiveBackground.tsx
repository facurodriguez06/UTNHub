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

  // Plus sign pattern and Dots pattern as inline SVG data URI
  const plusSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 16v16M16 24h16' stroke='%2310B981' stroke-width='2' stroke-linecap='square'/%3E%3C/svg%3E`;
  const dotsSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='1.5' fill='%2318181B' fill-opacity='0.1'/%3E%3C/svg%3E`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .interactive-bg-container {
          position: fixed;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          overflow: hidden;
        }

        .bg-layer-plus {
          position: absolute;
          inset: -10%;
          background-image: url("data:image/svg+xml,${plusSvg}");
          background-size: 48px 48px;
          opacity: 0.15;
          transition: opacity 0.5s ease;
        }

        .bg-layer-dots {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,${dotsSvg}");
          background-size: 24px 24px;
          opacity: 0.4;
        }

        @media (hover: hover) and (pointer: fine) {
          .bg-layer-plus {
            opacity: 1;
            -webkit-mask-image: radial-gradient(circle 500px at var(--mx, -500px) var(--my, -500px), black 0%, transparent 100%);
            mask-image: radial-gradient(circle 500px at var(--mx, -500px) var(--my, -500px), black 0%, transparent 100%);
          }
        }

        /* Subtle float animation for the background layers */
        @keyframes bgFloat {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 10px); }
          100% { transform: translate(0, 0); }
        }
        
        .animate-bg-slow {
          animation: bgFloat 20s ease-in-out infinite;
        }
      `}} />
      <div className="interactive-bg-container" aria-hidden="true">
        <div className="bg-layer-dots" />
        <div
          ref={spotlightRef}
          className="bg-layer-plus animate-bg-slow"
        />
      </div>
    </>
  );
}
