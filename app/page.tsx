"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { CareerCard } from "@/components/CareerCard";
import { LiveNotesCount } from "@/components/LiveNotesCount";
import { DonationSection } from "@/components/DonationSection";
import { DonationModal } from "@/components/DonationModal";
import { RankingSection } from "@/components/RankingSection";
import { careersData, subjectsData } from "@/lib/data";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isDonationActive, setIsDonationActive] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const totalSubjects = subjectsData.length;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "global"),
      (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : { isDonationActive: true, isDonationPopupActive: true };
        const isSectionActive = data.isDonationActive ?? true;
        const isPopupActive = data.isDonationPopupActive ?? true;
        
        setIsDonationActive(isSectionActive);

        if (isPopupActive) {
          const today = new Date().toISOString().split("T")[0];
          const storedData = localStorage.getItem("donation_modal_stats");
          let stats = storedData ? JSON.parse(storedData) : { count: 0, date: "", closedManually: false };

          if (stats.date !== today) {
            stats = { count: 0, date: today, closedManually: false };
          }

          if (stats.count < 2 && !stats.closedManually) {
            const timer = setTimeout(() => {
              setShowDonationModal(true);
              stats.count += 1;
              localStorage.setItem("donation_modal_stats", JSON.stringify(stats));
            }, 2000);
            
            return () => clearTimeout(timer);
          }
        }
      },
      (error) => {
        console.error("Error al escuchar settings global en home:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative flex-1 flex flex-col overflow-x-hidden bg-[#F7F5F0] selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Decorative Grid Background - Subtle but improved */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'linear-gradient(#d4d4d8 1.5px, transparent 1.5px), linear-gradient(90deg, #d4d4d8 1.5px, transparent 1.5px)', 
             backgroundSize: '48px 48px' 
           }}>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-16 md:py-24">
        
        {/* Interactive Brutalist Hero */}
        <section className="flex flex-col items-center justify-center text-center mb-32 min-h-[60vh] relative">
          
          <div className="inline-flex items-center gap-2 px-6 py-2.5 mb-10 border-4 border-zinc-900 bg-white text-zinc-900 text-xs font-black tracking-[0.2em] uppercase shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-xl transition-all duration-300 cursor-pointer rotate-1 italic">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" strokeWidth={3} />
            De estudiantes para estudiantes
          </div>
          
          <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black text-zinc-900 tracking-tighter leading-[0.85] mb-12 group cursor-default perspective-1000">
            <span className="block transition-all duration-500 hover:scale-105 hover:rotate-2 hover:text-emerald-500 select-none">
              UTN
            </span>
            <span className="block transition-all duration-500 hover:scale-110 hover:-rotate-2 hover:text-yellow-400 select-none drop-shadow-[4px_4px_0px_rgba(24,24,27,1)]">
              HUB
            </span>
          </h1>
          
          <p className="text-xl md:text-3xl text-zinc-800 mb-16 max-w-2xl font-black uppercase tracking-tight leading-none rotate-[-0.5deg]">
            Relajá tu semestre. <br/>
            <span className="bg-emerald-400 border-2 border-zinc-900 px-2 box-decoration-clone">La comunidad definitiva</span> de resúmenes.
          </p>
          
          <div className="w-full max-w-3xl relative group z-30 mb-20">
            <div className="relative bg-white p-2 md:p-3 rounded-none border-[6px] border-zinc-900 shadow-neo-xl group-hover:shadow-[16px_16px_0px_0px_rgba(16,185,129,1)] group-hover:-translate-y-1 transition-all duration-300">
              <GlobalSearchBar />
            </div>
          </div>

          {/* Neo-Brutalist Stats - More aggressive geometry */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-500 translate-x-2 translate-y-2 border-4 border-zinc-900"></div>
              <div className="relative px-8 py-5 bg-zinc-900 text-white border-4 border-zinc-900 hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-default">
                <div className="text-4xl font-black text-emerald-400 mb-1 leading-none"><LiveNotesCount /></div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">Apuntes</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-yellow-400 translate-x-2 translate-y-2 border-4 border-zinc-900"></div>
              <div className="relative px-8 py-5 bg-white text-zinc-900 border-4 border-zinc-900 hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-default">
                <div className="text-4xl font-black mb-1 leading-none">{totalSubjects}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500">Materias</div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-zinc-900 translate-x-2 translate-y-2 border-4 border-zinc-900"></div>
              <div className="relative px-8 py-5 bg-emerald-500 text-zinc-900 border-4 border-zinc-900 hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-default">
                <div className="text-4xl font-black mb-1 leading-none">{careersData.length}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-900">Carreras</div>
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling Marquee Tape - High Impact */}
        <div className="w-[120vw] relative left-1/2 -translate-x-1/2 bg-yellow-400 text-zinc-900 py-6 transform -rotate-3 mb-40 border-y-[6px] border-zinc-900 overflow-hidden flex whitespace-nowrap shadow-[0px_10px_30px_rgba(0,0,0,0.1)]">
          <div className="animate-marquee inline-block font-black text-4xl md:text-5xl uppercase tracking-tighter">
            <span>🚀 APROBÁ TUS FINALES 🚀 APUNTES COLABORATIVOS 🚀 UTNHUB 🚀 SIN PUBLICIDAD 🚀 DE ESTUDIANTES PARA ESTUDIANTES 🚀 </span>
            <span>🚀 APROBÁ TUS FINALES 🚀 APUNTES COLABORATIVOS 🚀 UTNHUB 🚀 SIN PUBLICIDAD 🚀 DE ESTUDIANTES PARA ESTUDIANTES 🚀 </span>
          </div>
        </div>

        {/* Ranking Section - Removed Duplicate Wrapper Header */}
        <div className="mb-32 relative z-20">
          <RankingSection />
        </div>

        {/* Careers Section */}
        <section id="carreras" className="mb-32">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 mb-6 uppercase tracking-tight hover:text-emerald-600 transition-colors cursor-default">
              Elegí tu carrera
            </h2>
            <div className="w-24 h-2 bg-emerald-500 mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {careersData.map((career) => (
              <div key={career.id} className="animate-fade-in-up h-full">
                <CareerCard career={career} />
              </div>
            ))}
          </div>
        </section>

        {isDonationActive && (
          <div className="relative z-20 mt-12 bg-white rounded-none border-4 border-zinc-900 shadow-neo-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <DonationSection />
          </div>
        )}

        {isDonationActive && (
          <DonationModal 
            isOpen={showDonationModal} 
            onClose={() => {
              setShowDonationModal(false);
              const storedData = localStorage.getItem("donation_modal_stats");
              if (storedData) {
                const stats = JSON.parse(storedData);
                stats.closedManually = true;
                localStorage.setItem("donation_modal_stats", JSON.stringify(stats));
              }
            }} 
          />
        )}
      </div>
    </div>
  );
}

