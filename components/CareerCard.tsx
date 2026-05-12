"use client";

import Link from "next/link";
import { Career } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Monitor, Cpu, Building2, Cog, FlaskConical, Radio, BookMarked, ArrowUpRight } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Monitor, Cpu, Building2, Cog, FlaskConical, Radio, BookMarked };

export function CareerCard({ career }: { career: Career }) {
  const IconComponent = iconMap[career.icon];

  const content = (
    <div 
      className={cn(
        "group relative flex flex-col h-full w-full rounded-2xl box-border border-4 overflow-hidden",
        "transition-all duration-200 ease-out will-change-transform",
        career.implemented
          ? "bg-white border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(16,185,129,1)] active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
          : "bg-zinc-100 border-zinc-300 shadow-[6px_6px_0px_0px_rgba(212,212,216,1)] opacity-80 cursor-not-allowed"
      )}
    >
      
      {/* Background gentle color fill on hover */}
      {career.implemented && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-200 pointer-events-none",
          career.pastelBg
        )} />
      )}

      {/* Main card content inside wrapper */}
      <div className="p-7 sm:p-8 flex flex-col flex-1 relative z-10 box-border">
        
        <div className="flex justify-between items-start mb-auto">
          
          {/* App-like rounded squircle for icon */}
          <div className={cn(
            "w-[56px] h-[56px] rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden border-2",
            career.implemented ? "bg-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] group-hover:border-emerald-400 group-hover:-translate-y-0.5" : "bg-zinc-200 border-zinc-400 grayscale"
          )}>
            <div className={cn("absolute inset-0 opacity-[0.15] transition-opacity duration-200 group-hover:opacity-[0.25]", career.pastelBg)} />
            {IconComponent && <IconComponent className={cn("w-7 h-7 relative z-10 transition-transform duration-200 group-hover:scale-110", career.implemented ? "text-zinc-900" : "text-zinc-500")} strokeWidth={2.5} />}
          </div>

          {!career.implemented && (
            <span className="inline-flex items-center bg-zinc-200 px-3 py-1 text-[10px] font-black tracking-widest text-zinc-600 uppercase border-2 border-zinc-400 shadow-[2px_2px_0px_0px_rgba(161,161,170,1)]">    
              PRÓXIMAMENTE
            </span>
          )}

          {/* Minimalist Top Right 'Open' symbol */}
          {career.implemented && (
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 relative overflow-hidden",
              "bg-white border-zinc-900 text-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]",
              "group-hover:bg-emerald-400 group-hover:border-zinc-900 group-hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] group-hover:-translate-y-1 group-hover:translate-x-1"
            )}>
              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-all duration-150">
                <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className={cn("absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-150", "text-zinc-900")}>
                <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* Text area is pushed to the bottom logically since mb-auto on header wrapper */}
        <div className="mt-12 flex-1">
          <h3 className={cn(
            "text-2xl font-black uppercase tracking-tight mb-3 transition-colors duration-150 font-serif",
            career.implemented ? "text-zinc-900" : "text-zinc-600"
          )}>
            {career.shortName}
          </h3>
          <p className={cn(
            "text-sm leading-relaxed font-semibold",
            career.implemented ? "text-zinc-700" : "text-zinc-500"
          )}>       
            {career.description}
          </p>
        </div>
      </div>

      {/* Decorative animated base line */}
      {career.implemented && (
        <div className="px-7 sm:px-8 pb-7 relative mt-1 flex">
          <div className={cn(
            "h-2 w-12 rounded-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full opacity-100 bg-emerald-400 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
          )} />
        </div>
      )}
    </div>
  );

  if (!career.implemented) return <div className="h-full w-full">{content}</div>;
  return <Link href={`/carreras/${career.id}`} className="h-full w-full block outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 rounded-2xl">{content}</Link>;
}

