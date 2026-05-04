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
        "group flex flex-col justify-between h-full w-full flex-1 rounded-xl border border-[#E3DCD2] bg-white p-4 relative overflow-hidden",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1 hover:border-[#B2C7B6] hover:shadow-[0_12px_30px_rgba(139,170,145,0.15)] ring-1 ring-transparent hover:ring-[#8BAA91]/20 scale-100 hover:scale-[1.02]"
      )}
    >
      <div 
        className="absolute top-0 right-0 w-16 h-16 rounded-bl-[40px] opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.25] z-0" 
        style={{ backgroundColor: yc.accent }}
      />
      
      {/* Decorative Blob & Icon */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[2] group-hover:opacity-[0.05] group-hover:-rotate-6 pointer-events-none z-0" style={{ color: yc.accent }}>
        {getSubjectIcon(subject.name, "w-full h-full")}
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full mb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-[#3D3229] text-[15px] leading-snug group-hover:text-[#4A7A52] transition-colors duration-200">
            {subject.name}
          </h3>
          <div 
            className="shrink-0 p-2 rounded-xl transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12 bg-[#F5F0EA] border border-white/50 shadow-sm" 
            style={{ color: yc.accent, backgroundColor: `${yc.accent}12` }}
          >
            {getSubjectIcon(subject.name, "w-4 h-4")}
          </div>
        </div>
          {subject.isElective && (
            <span className="inline-block mt-0 mb-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 rounded-md border border-purple-200">
              Electiva
            </span>
          )}
        <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
          hasNotes 
            ? `${yc.bg} ${yc.text} shadow-sm border border-${yc.text}/10` 
            : 'bg-[#F5F0EA] text-[#A89F95]'
        }`}>
          {hasNotes 
            ? <><FileText className="w-3 h-3" /> {subject.notesCount} apuntes</>
            : <><Inbox className="w-3 h-3" /> Sin apuntes</>
          }
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[13px] font-semibold text-[#8BAA91] mt-4 group-hover:text-[#4A7A52] relative z-10 w-full pt-4 border-t border-[#F5F0EA]/50">
        <span className="transition-colors duration-300">Ver material</span>
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-500 bg-[#F5F0EA] text-[#A89F95] group-hover:shadow-sm group-hover:-translate-y-[2px] group-hover:translate-x-[2px] group-hover:text-white">
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: yc.accent }}
          />
          <ChevronRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}
