"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "SELECCIONAR...", disabled = false, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === String(value));

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border-4 border-zinc-900 px-4 py-3 text-sm font-black transition-all bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-tight ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        }`}
      >
        <span className={`block truncate pr-2 ${selectedOption ? "text-zinc-900" : "text-zinc-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-zinc-900 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} strokeWidth={3} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[60] w-full mt-2 bg-white border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-fade-in">
          <ul className="max-h-60 overflow-y-auto scroll-smooth custom-scrollbar">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-xs text-center text-zinc-400 font-black uppercase tracking-widest italic">No hay opciones</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 text-xs cursor-pointer transition-colors border-b-2 border-zinc-100 last:border-b-0 ${
                    String(value) === String(option.value) 
                      ? "bg-zinc-900 text-white font-black" 
                      : "text-zinc-900 font-black hover:bg-zinc-100 uppercase tracking-tighter"
                  }`}
                >
                  <span className="truncate pr-2">{option.label}</span>
                  {String(value) === String(option.value) && <Check className="w-4 h-4 shrink-0 text-emerald-400" strokeWidth={4} />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
