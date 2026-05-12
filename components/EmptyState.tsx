import { FolderOpen, Upload } from "lucide-react";
import Link from "next/link";

export function EmptyState({ careerId, subjectId, year }: { careerId?: string, subjectId?: string, year?: number } = {}) {
  const uploadHref = careerId && subjectId && year ? `/upload?carrera=${careerId}&materia=${subjectId}&anio=${year}` : "/upload";
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border-4 border-dashed border-zinc-400 rounded-2xl animate-fade-in-up">
      <div className="w-16 h-16 rounded-xl border-[3px] border-zinc-900 bg-zinc-100 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] flex items-center justify-center mb-5">
        <FolderOpen className="w-7 h-7 text-zinc-500" />
      </div>
      <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
        Todavía no hay nada acá
      </h3>
      <p className="text-sm text-zinc-600 mb-6 max-w-xs leading-relaxed font-semibold">
        Sé el primero en subir material. Tus compañeros te lo van a agradecer.
      </p>
      <Link 
        href={uploadHref}
        className="inline-flex items-center gap-2 justify-center px-6 py-3 text-sm font-black text-zinc-900 uppercase tracking-wider bg-emerald-400 border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all duration-200"
      >
        <Upload className="w-4 h-4" /> Subir un apunte
      </Link>
    </div>
  );
}
