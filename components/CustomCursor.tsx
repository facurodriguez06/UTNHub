"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const addEventListeners = () => {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseenter", onMouseEnter);
      document.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseup", onMouseUp);
    };

    const removeEventListeners = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
      
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setLinkHovered(!!isClickable);
    };

    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    addEventListeners();
    return () => removeEventListeners();
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] transition-transform duration-75 ease-out mix-blend-difference ${hidden ? 'opacity-0' : 'opacity-100'}`}
      style={{
        transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${clicked ? 0.8 : linkHovered ? 1.5 : 1})`,
      }}
    >
      {/* The main green box */}
      <div className={`w-full h-full border-4 ${linkHovered ? 'bg-emerald-400 border-zinc-900' : 'border-emerald-400'} transition-all duration-200`}>
        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-400 -translate-y-1/2 opacity-30" />
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-emerald-400 -translate-x-1/2 opacity-30" />
      </div>
      
      {/* Trailing dots for extra "AI/System" feel */}
      {!clicked && !linkHovered && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 border border-zinc-900 animate-pulse" />
      )}
    </div>
  );
}