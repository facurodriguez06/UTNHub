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
import { BookOpen, Layers, School, Sparkles, GraduationCap, Hexagon, Coffee } from "lucide-react";

export default function Home() {
  const [isDonationActive, setIsDonationActive] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const totalSubjects = subjectsData.length;

  useEffect(() => {
    // Escuchar cambios globales en Firestore
    const unsubscribe = onSnapshot(
      doc(db, "settings", "global"),
      (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : { isDonationActive: true, isDonationPopupActive: true };
        const isSectionActive = data.isDonationActive ?? true;
        const isPopupActive = data.isDonationPopupActive ?? true;
        
        console.log("Configuración de donaciones:", { section: isSectionActive, popup: isPopupActive });
        setIsDonationActive(isSectionActive);

        if (isPopupActive) {
          const today = new Date().toISOString().split("T")[0];
          const storedData = localStorage.getItem("donation_modal_stats");
          let stats = storedData ? JSON.parse(storedData) : { count: 0, date: "", closedManually: false };

          if (stats.date !== today) {
            stats = { count: 0, date: today, closedManually: false };
          }

          console.log("Contador de popup hoy:", stats.count, "Cerrado manualmente:", stats.closedManually);

          if (stats.count < 2 && !stats.closedManually) {
            console.log("Programando aparición de popup en 2s...");
            const timer = setTimeout(() => {
              setShowDonationModal(true);
              stats.count += 1;
              localStorage.setItem("donation_modal_stats", JSON.stringify(stats));
              console.log("Popup mostrado y contador actualizado.");
            }, 2000);
            
            return () => clearTimeout(timer);
          } else {
            console.log("Límite de popups o usuario lo descartó manualmente por hoy.");
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
    <div className="relative flex-1 flex flex-col overflow-x-hidden">
      
      {/* Decorative blobs — soft ambient light */}
      <div className="blob w-96 h-96 bg-[#C5DBC9] -top-20 -left-40 animate-blob" />
      <div className="blob w-72 h-72 bg-[#E8CFC3] top-60 -right-32 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="blob w-56 h-56 bg-[#D5CCE5] bottom-20 left-1/4 animate-blob" style={{ animationDelay: '4s' }} />

      {/* Floating Elements (Background) */}
      <div className="hidden md:block absolute top-28 left-[10%] text-[#8BAA91] opacity-20 animate-float">
        <GraduationCap size={44} />
      </div>
      <div className="hidden md:block absolute top-40 right-[15%] text-[#9B6B3D] opacity-20 animate-float-slow">
        <Hexagon size={40} />
      </div>
      <div className="hidden md:block absolute top-80 left-[18%] text-[#D84545] opacity-10 animate-float" style={{ animationDelay: '1s' }}>
        <Coffee size={36} />
      </div>
      <div className="hidden md:block absolute top-20 right-[25%] text-[#6B5A8E] opacity-20 animate-float-slow" style={{ animationDelay: '2.5s' }}>
        <Sparkles size={32} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-16 stagger-children">
          <h1 className="text-3xl md:text-[2.75rem] font-extrabold text-[#3D3229] tracking-tight mb-4 leading-[1.15] animate-fade-in-up">
            Tus apuntes, {' '}
            <span className="bg-gradient-to-r from-[#8BAA91] via-[#7CC2A8] to-[#7BA7C2] bg-clip-text text-transparent animate-gradient inline-block pb-2">
              en un solo lugar
            </span>
          </h1>
          <p className="text-base text-[#7A6E62] mb-8 leading-relaxed max-w-md mx-auto animate-fade-in-up">
            Resúmenes, finales y guías compartidos por estudiantes de la UTN. Buscá o subí los tuyos.
          </p>
          
          <div className="w-full">
            <GlobalSearchBar />
          </div>

          {/* Live stats */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 animate-fade-in-up">
            <div className="group/stat flex items-center gap-2 bg-[#E8F0EA] px-3 py-1.5 rounded-full hover:-translate-y-1 hover:shadow-md hover:shadow-[#8BAA91]/20 transition-all duration-300 cursor-default">
              <BookOpen className="w-3 h-3 text-[#4A7A52] group-hover/stat:rotate-12 group-hover/stat:scale-110 transition-transform duration-300" />
              <span className="text-xs font-bold text-[#4A7A52]">
                <LiveNotesCount /> apuntes
              </span>
            </div>
            <div className="group/stat flex items-center gap-2 bg-[#EFEBF5] px-3 py-1.5 rounded-full hover:-translate-y-1 hover:shadow-md hover:shadow-[#6B5A8E]/20 transition-all duration-300 cursor-default">
              <Layers className="w-3 h-3 text-[#6B5A8E] group-hover/stat:-rotate-12 group-hover/stat:scale-110 transition-transform duration-300" />
              <span className="text-xs font-bold text-[#6B5A8E]">{totalSubjects} materias</span>
            </div>
            <div className="group/stat flex items-center gap-2 bg-[#FFF0E5] px-3 py-1.5 rounded-full hover:-translate-y-1 hover:shadow-md hover:shadow-[#9B6B3D]/20 transition-all duration-300 cursor-default">
              <School className="w-3 h-3 text-[#9B6B3D] group-hover/stat:rotate-6 group-hover/stat:scale-110 transition-transform duration-300" />
              <span className="text-xs font-bold text-[#9B6B3D]">{careersData.length} carreras</span>
            </div>
          </div>
        </section>

        {/* Ranking Section */}
        <RankingSection />

        {/* Careers Grid */}
        <section id="carreras">
          <h2 className="text-xl font-extrabold text-[#3D3229] mb-6">Elegí tu carrera</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children items-stretch">
            {careersData.map((career) => (
              <div key={career.id} className="animate-fade-in-up flex h-full">
                <CareerCard career={career} />
              </div>
            ))}
          </div>
        </section>

        {isDonationActive && <DonationSection />}

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
