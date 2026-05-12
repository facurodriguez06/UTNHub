"use client";

import { Heart, Code2, Camera, MessageSquare, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-20 py-20 bg-zinc-900 border-t-[8px] border-zinc-900 mt-auto overflow-hidden">
      {/* Background Marquee Decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-black text-white whitespace-nowrap leading-none tracking-tighter">
          UTNHUB UTNHUB UTNHUB
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-white border-4 border-zinc-900 px-5 py-3 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] hover:-translate-y-1 transition-all cursor-default">
              <Image src="/iconNeo-v2.png" alt="UTNHub" width={36} height={36} className="w-9 h-9 object-contain" />
              <h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">UTNHUB</h2>
            </div>
            <p className="text-xl font-black text-white/90 uppercase tracking-tighter leading-none max-w-md flex flex-col gap-2">
              <span>RELAJÁ TU SEMESTRE.</span>
              <span className="inline-flex w-fit bg-emerald-400 text-zinc-900 px-3 py-1 border-[4px] border-zinc-900 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
                LA COMUNIDAD DEFINITIVA DE RESÚMENES.
              </span>
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="https://github.com/facurodriguez06/ApuntesUtn.git" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-3 bg-white border-4 border-zinc-900 p-3 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Code2 className="w-6 h-6 text-zinc-900" strokeWidth={3} />
                <span className="font-black uppercase text-xs tracking-widest text-zinc-900">GitHub</span>
              </a>
              <a 
                href="https://www.instagram.com/utnhub/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-3 bg-yellow-400 border-4 border-zinc-900 p-3 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Camera className="w-6 h-6 text-zinc-900" strokeWidth={3} />
                <span className="font-black uppercase text-xs tracking-widest text-zinc-900">Instagram</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-8">
            <div className="text-left md:text-right space-y-4">
              <p className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">Soporte & Legal</p>
              <nav className="flex flex-col gap-2">
                <Link href="/terminos" className="text-lg font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-tight italic underline decoration-white/20 hover:decoration-emerald-400 underline-offset-4">Términos y Condiciones</Link>
                <Link href="/privacidad" className="text-lg font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-tight italic underline decoration-white/20 hover:decoration-emerald-400 underline-offset-4">Políticas de Privacidad</Link>
                <a href="https://wa.me/5492614994711" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-lg font-black text-emerald-400 hover:text-white transition-colors uppercase tracking-tight italic">
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={3} />
                  WhatsApp Soporte
                </a>
              </nav>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Desarrollado por</p>
                <a href="https://alfadigital.pages.dev/" target="_blank" rel="noopener noreferrer" className="text-sm font-black text-white hover:text-emerald-400 uppercase tracking-tighter flex items-center gap-2">
                  ALFA DIGITAL <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-12 h-12 bg-white border-4 border-zinc-900 flex items-center justify-center font-black text-zinc-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] group hover:-translate-y-1 hover:-translate-x-1 transition-all">
                AD
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} UTNHUB • TODOS LOS DERECHOS RESERVADOS
          </p>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              FRM • MENDOZA • ARGENTINA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
