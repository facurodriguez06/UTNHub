"use client";

import Link from "next/link";
import { Subject, yearConfig } from "@/lib/data";
import { 
  ChevronRight, FileText, Inbox,
  Calculator, Atom, BookOpen, Binary, Cpu, Network, Database, 
  Code2, LineChart, Briefcase, ShieldCheck, Layers, Building2, FlaskConical, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const getSubjectIcon = (name: string, className: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('matemática') || lowerName.includes('álgebra') || lowerName.includes('cálculo') || lowerName.includes('numérico') || lowerName.includes('estadística') || lowerName.includes('probabilidad')) return <Calculator className={className} />;
  if (lowerName.includes('física') || lowerName.includes('mecánica') || lowerName.includes('dinámica')) return <Atom className={className} />;
  if (lowerName.includes('química') || lowerName.includes('termodinámica')) return <FlaskConical className={className} />;
  if (lowerName.includes('integración') || lowerName.includes('sintesis')) return <Zap className={className} />;
  if (lowerName.includes('programación') || lowerName.includes('algoritmo') || lowerName.includes('software') || lowerName.includes('sistemas de')) return <Code2 className={className} />;
  if (lowerName.includes('datos') || lowerName.includes('información') || lowerName.includes('sintaxis')) return <Database className={className} />;
  if (lowerName.includes('redes') || lowerName.includes('comunicación')) return <Network className={className} />;
  if (lowerName.includes('sistemas') || lowerName.includes('arquitectura') || lowerName.includes('operativos') || lowerName.includes('informática') || lowerName.includes('diseño')) return <Cpu className={className} />;
  if (lowerName.includes('electrónica') || lowerName.includes('eléctrica') || lowerName.includes('circuitos') || lowerName.includes('medios')) return <Binary className={className} />;
  if (lowerName.includes('civil') || lowerName.includes('estructuras') || lowerName.includes('construcción') || lowerName.includes('materiales') || lowerName.includes('hormigón') || lowerName.includes('topografía')) return <Building2 className={className} />;
  if (lowerName.includes('economía') || lowerName.includes('gestión') || lowerName.includes('administración') || lowerName.includes('ingeniería y sociedad')) return <LineChart className={className} />;
  if (lowerName.includes('legal') || lowerName.includes('legislación') || lowerName.includes('inglés')) return <Briefcase className={className} />;
  if (lowerName.includes('seguridad') || lowerName.includes('calidad')) return <ShieldCheck className={className} />;
  if (lowerName.includes('proyecto') || lowerName.includes('seminario')) return <Layers className={className} />;

  // Default fallback
  return <BookOpen className={className} />;
};

export function SubjectCard({ subject }: { subject: Subject; careerId?: string }) {
  const hasNotes = subject.notesCount > 0;
  const yc = yearConfig[subject.year] || yearConfig[1];

  return (
    <Link
      href={`/carreras/${subject.careerId}/materias/${subject.id}`}
      className={cn(
        "group flex flex-col justify-between h-full w-full flex-1 rounded-xl border-[3px] border-zinc-900 bg-white p-4 relative overflow-hidden",
        "transition-all duration-200 ease-out will-change-transform",
        "shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
      )}
    >
      {/* Decorative Blob & Icon */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.04] transition-transform duration-500 ease-out group-hover:scale-[2] group-hover:opacity-[0.08] pointer-events-none z-0 text-emerald-500">
        {getSubjectIcon(subject.name, "w-full h-full")}
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full mb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-black text-zinc-900 text-[15px] leading-snug group-hover:text-emerald-600 transition-colors duration-200">
            {subject.name}
          </h3>
          <div 
            className="shrink-0 p-2 rounded-lg transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] group-hover:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] text-zinc-900" 
          >
            {getSubjectIcon(subject.name, "w-4 h-4")}
          </div>
        </div>
          {subject.isElective && (
            <span className="inline-block mt-0 mb-3 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-200 border-2 border-purple-400 shadow-[2px_2px_0px_0px_rgba(168,85,247,0.5)]">
              Electiva
            </span>
          )}
        <div className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-black border-2 ${
          hasNotes 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-600 shadow-[2px_2px_0px_0px_rgba(5,150,105,0.4)]' 
            : 'bg-zinc-100 text-zinc-500 border-zinc-300'
        }`}>
          {hasNotes 
            ? <><FileText className="w-3 h-3" /> {subject.notesCount} apuntes</>
            : <><Inbox className="w-3 h-3" /> Sin apuntes</>
          }
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[13px] font-black text-emerald-600 mt-4 group-hover:text-emerald-700 relative z-10 w-full pt-4 border-t-2 border-zinc-200 uppercase tracking-wide">
        <span className="transition-colors duration-300">Ver material</span>
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] group-hover:bg-emerald-400 group-hover:shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] group-hover:-translate-y-0.5">
          <ChevronRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:scale-110 text-zinc-900" strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}
