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
    <div className="relative flex-1 flex flex-col">
      <div
        className="blob w-80 h-80 top-10 -right-32 animate-blob transition-colors duration-700"
        style={{ backgroundColor: yc.accent }}
      />

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="mb-5 flex items-center text-sm text-[#A89F95] gap-1.5">
          <Link href="/" className="hover:text-[#4A7A52] transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#3D3229] font-semibold">{career.shortName}</span>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <CareerIcon className={cn("w-6 h-6", career.pastelText)} />
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D3229] tracking-tight">{career.shortName}</h1>
            </div>
            <p className="text-sm text-[#7A6E62]">
              {isBasicas ? "Materias comunes a todas las ingenierías" : "Plan 2023"} · {filteredSubjects.length} materias {isBasicas ? "" : `en ${yearLabel(activeYear).toLowerCase()}`}
            </p>
          </div>

          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-500", yc.bg, yc.text)}>
            <FileText className="w-3 h-3" />
            {!hasSynced ? "Cargando..." : `${totalNotesThisYear} apuntes disponibles`}
          </div>
        </div>

        {years.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
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
                    "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shrink-0 active:scale-95",
                    isActive ? "text-white shadow-lg" : "bg-white text-[#7A6E62] border border-[#EDE6DD] hover:shadow-sm"
                  )}
                  style={isActive ? { backgroundColor: yearConfigForTab.accent, boxShadow: `0 4px 14px -3px ${yearConfigForTab.accent}40` } : {}}
                >
                  {YearIcon && <YearIcon className="w-4 h-4" />}
                  {yearLabel(year)}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch" key={activeYear}>
          {filteredSubjects.map((subject) => (
            <div 
              key={subject.id} 
              className="flex h-full flex-col w-full"
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
