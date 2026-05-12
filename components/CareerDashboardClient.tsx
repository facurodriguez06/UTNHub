"use client";

import { useEffect, useState } from "react";
import { careersData, yearConfig, getSubjectsByCareerAndYear, getSubjectsByCareer } from "@/lib/data";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { SubjectCard } from "@/components/SubjectCard";
import {
  ChevronRight,
  FileText,
  Sprout,
  BookOpen,
  Microscope,
  Rocket,
  GraduationCap,
  Award,
  Monitor,
  Cpu,
  Building2,
  Cog,
  FlaskConical,
  BookMarked,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const yearIcons: Record<string, React.ElementType> = { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award };
const careerIcons: Record<string, React.ElementType> = { Monitor, Cpu, Building2, Cog, FlaskConical, BookMarked };

export function CareerDashboardClient({
  careerId,
  initialNoteCounts,
}: {
  careerId: string;
  initialNoteCounts: Record<string, number>;
}) {
  const [activeYear, setActiveYear] = useState(1);
  const [realNoteCounts, setRealNoteCounts] = useState<Record<string, number>>(initialNoteCounts);
  const [hasSynced, setHasSynced] = useState(false);

  const yc = yearConfig[activeYear];
  const isBasicas = careerId === "basicas";
  const filteredSubjects = isBasicas ? getSubjectsByCareer(careerId) : getSubjectsByCareerAndYear(careerId, activeYear);

  useEffect(() => {
    const notesQuery = query(
      collection(db, 'notes'),
      where('careerId', 'in', careerId === 'basicas' ? ['basicas'] : [careerId, 'basicas']),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (querySnapshot) => {
        const counts: Record<string, number> = {};

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const subjectId = typeof data.subjectId === "string" ? data.subjectId : "";
          if (subjectId) {
            counts[subjectId] = (counts[subjectId] || 0) + 1;
          }
        });

        // Only update if we actually got data or if it's a real server update
        // this avoids the '0' flicker if the local cache is empty initially
        if (!querySnapshot.empty || querySnapshot.metadata.fromCache === false) {
          setRealNoteCounts(counts);
        }
        setHasSynced(true);
      },
      (error) => {
        console.error("Error syncing note counts:", error);
        setHasSynced(true);
      }
    );

    return unsubscribe;
  }, [careerId]);

  const career = careersData.find((item) => item.id === careerId);

  if (!career) {
    return null;
  }

  const totalNotesThisYear = filteredSubjects.reduce((accumulator, subject) => {
    return accumulator + (realNoteCounts[subject.id] || 0);
  }, 0);

  const years = isBasicas ? [] : Array.from({ length: career.maxYears }, (_, index) => index + 1);
  if (!isBasicas) years.push(99);
  const CareerIcon = careerIcons[career.icon] || Monitor;

  const yearLabel = (year: number) => {
    if (isBasicas) return `Nivel ${year}`;
    return yearConfig[year]?.label || `${year}º Año`;
  };

  return (
    <div className="relative flex-1 flex flex-col bg-[#F7F5F0] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Neo-Brutalist Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center text-sm text-zinc-500 gap-1.5">
          <Link href="/" className="hover:text-emerald-600 font-bold transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-900 font-black uppercase">{career.shortName}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl border-[3px] border-zinc-900 bg-white shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] flex items-center justify-center">
                <CareerIcon className="w-6 h-6 text-zinc-900" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight uppercase">{career.shortName}</h1>
            </div>
            <p className="text-sm text-zinc-600 font-semibold">
              {isBasicas ? "Materias comunes a todas las ingenierías" : "Plan 2023"} · {filteredSubjects.length} materias {isBasicas ? "" : `en ${yearLabel(activeYear).toLowerCase()}`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 text-zinc-900 border-[3px] border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] text-xs font-black uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            {!hasSynced ? "Cargando..." : `${totalNotesThisYear} apuntes disponibles`}
          </div>
        </div>

        {/* Year Tabs */}
        {years.length > 1 && (
          <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-1">
            {years.map((year) => {
              const yearConfigForTab = yearConfig[year];
              if (!yearConfigForTab) return null;

              const isActive = activeYear === year;
              const YearIcon = yearIcons[yearConfigForTab.icon];

              return (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-black transition-all duration-200 shrink-0 active:scale-95 border-[3px] uppercase tracking-wider",
                    isActive 
                      ? "bg-zinc-900 text-emerald-400 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] -translate-y-1" 
                      : "bg-white text-zinc-700 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(16,185,129,1)]"
                  )}
                >
                  {YearIcon && <YearIcon className="w-4 h-4" />}
                  {yearLabel(year)}
                </button>
              );
            })}
          </div>
        )}

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch" key={activeYear}>
          {filteredSubjects.map((subject) => (
            <div 
              key={subject.id} 
              className="flex h-full flex-col w-full animate-fade-in-up"
            >
              <SubjectCard
                subject={{
                  ...subject,
                  notesCount: realNoteCounts[subject.id] || 0,
                }}
                careerId={careerId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
