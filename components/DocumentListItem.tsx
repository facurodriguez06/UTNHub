"use client";

import type { Note, NoteRating } from "@/lib/data";
import { FileText, File, FileArchive, Download, Check, User, Eye, Crown, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { resolveStorageUrl } from "@/lib/storage";
import { RatingModal } from "./RatingModal";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { cn } from "@/lib/utils";

const tagClass: Record<string, string> = {
  Resumen: "tag-resumen",
  "Examen": "tag-examen",
  "Trabajo Práctico": "tag-tp",
  "Guía de Ejercicios": "tag-guia",
};

const CREATOR_AUTHOR = "facundo rodriguez";

const normalizeAuthorName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getBgClass = (type: string, isCreator: boolean) => {
  if (isCreator) return "bg-amber-50 border-[3px] border-amber-500 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]";
  return "bg-white border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]";
};

const getCreatorTagClass = (type: string) => {
  switch (type === "Examen Resuelto" ? "Examen" : type) {
    case "Resumen": return "bg-emerald-600 text-white border-2 border-emerald-800";
    case "Examen": return "bg-red-500 text-white border-2 border-red-700";
    case "Trabajo Práctico": return "bg-purple-500 text-white border-2 border-purple-700";
    case "Guía de Ejercicios": return "bg-sky-500 text-white border-2 border-sky-700";
    default: return "bg-zinc-900 text-white border-2 border-zinc-700";
  }
};

export type CustomStyle = { color: string; label: string };
export function DocumentListItem({ note, customStyles = {}, index = 0 }: { note: Note; customStyles?: Record<string, CustomStyle>; index?: number }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [downloaded, setDownloaded] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [localRatings, setLocalRatings] = useState<NoteRating[]>(note.ratings || []);
  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;
  const customAuthorStyle = customStyles?.[normalizeAuthorName(note.author ?? "")];

  const handleRate = async (value: number) => {
    if (!user) return;
    try {
      const noteRef = doc(db, "notes", note.id);
      const noteDoc = await getDoc(noteRef);
      if (noteDoc.exists()) {
        const currentRatings = (noteDoc.data().ratings || []) as NoteRating[];
        const otherRatings = currentRatings.filter((r) => r.uid !== user.uid);
        
        const newRating: NoteRating = {
          uid: user.uid,
          userName: user.displayName || user.email?.split("@")[0] || "Usuario",
          value
        };

        const updatedRatings = [...otherRatings, newRating];
        await updateDoc(noteRef, { ratings: updatedRatings });
        
        setLocalRatings(updatedRatings);
        showToast("¡Gracias por tu valoración!", "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Error al valorar el apunte", "error");
    }
  };

  const averageRating = localRatings.length > 0 
    ? localRatings.reduce((acc, r) => acc + r.value, 0) / localRatings.length 
    : 0;

  const handleVisualizar = () => {
    if (note.fileUrl) {
      window.open(resolveStorageUrl(note.fileUrl), "_blank");
    } else {
      showToast("Este apunte no tiene una URL válida.", "info");
    }
  };

  const handleDownload = async () => {
    if (note.fileUrl) {
      setDownloaded(true);

      // Incrementar contador de descargas en Firebase
      try {
        const noteRef = doc(db, "notes", note.id);
        await updateDoc(noteRef, {
          downloadCount: increment(1)
        });
      } catch (error) {
        console.error("Error al incrementar descargas:", error);
      }

      const url = resolveStorageUrl(note.fileUrl);
      const filename = note.title || "documento";
      
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error de red');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          let downloadName = filename;
          if (note.fileType && !downloadName.toLowerCase().endsWith(note.fileType.toLowerCase())) {
            downloadName += `.${note.fileType.toLowerCase()}`;
          }
          link.download = downloadName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          link.remove();
        });

      setTimeout(() => setDownloaded(false), 2500);
    }
  };

  const getIcon = () => {
    switch (note.fileType) {
      case "PDF":
        return <FileText className="w-4 h-4 text-[#D4856A]" />;
      case "ZIP":
        return <FileArchive className="w-4 h-4 text-[#C4A87D]" />;
      case "DOCX":
      default:
        return <File className="w-4 h-4 text-[#7BA7C2]" />;
    }
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-xl transition-all duration-200 ${!customAuthorStyle ? getBgClass(note.type, isCreatorNote) : 'bg-white border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]'}`} style={{ animationDelay: `${index * 40}ms`, ...(customAuthorStyle ? {} : {}) }}
    >
      <div className="flex items-start gap-3 w-full sm:w-auto sm:flex-1 mb-3 sm:mb-0 min-w-0">
        <div
          style={customAuthorStyle ? { backgroundColor: customAuthorStyle.color + "1A", borderColor: customAuthorStyle.color + "66" } : undefined} className={`mt-0.5 shrink-0 p-2.5 rounded-lg border-2 group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 ${
            isCreatorNote ? "bg-amber-100 border-amber-500" : "bg-zinc-100 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
          }`}
        >
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            style={customAuthorStyle ? { color: customAuthorStyle.color } : undefined} className={`font-black text-sm transition-colors break-words ${
              isCreatorNote ? "text-amber-900 group-hover:text-amber-700" : "text-zinc-900 group-hover:text-emerald-600"
            }`}
          >
            {note.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-1.5 w-full">
            <span
              style={customAuthorStyle ? { backgroundColor: customAuthorStyle.color + "22", color: customAuthorStyle.color } : undefined} className={`inline-flex items-center gap-1 text-xs font-black px-1.5 py-0.5 ${
                isCreatorNote ? "text-amber-900 bg-amber-200" : "text-zinc-700 bg-zinc-200"
              }`}
            >
              <User className="w-2.5 h-2.5" /> {note.author}
            </span>
            {customAuthorStyle && (<span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm" style={{ backgroundColor: customAuthorStyle.color }}><Crown className="w-3 h-3" />{customAuthorStyle.label}</span>)}{isCreatorNote && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-white shadow-sm">
                <Crown className="w-3 h-3" />
                Creador
              </span>
            )}
            <span className="text-[11px] text-zinc-500 font-bold">{new Date(note.uploadDate).toLocaleDateString("es-AR")}</span>
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${isCreatorNote ? getCreatorTagClass(note.type) : (tagClass[note.type === "Examen Resuelto" ? "Examen" : note.type] || "tag-resumen")}`}>
              {note.type === "Examen Resuelto" ? "Examen" : note.type}
            </span>
            {note.fileSize && <span className="text-[11px] text-zinc-500 font-bold">{note.fileSize}</span>}
          </div>
        </div>
      </div>

      <div className={`flex flex-row items-center justify-end w-full sm:w-auto gap-2 border-t-2 mt-3 pt-3 sm:mt-0 sm:pt-0 sm:border-transparent flex-wrap sm:flex-nowrap ${isCreatorNote ? "border-amber-300" : "border-zinc-300"}`}>
        <button
          onClick={() => setIsRatingModalOpen(true)}
          className={`group/btn flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-sm font-black transition-all duration-200 active:scale-95 border-2 ${
            isCreatorNote
              ? "bg-amber-100 text-amber-900 border-amber-500 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]"
              : "bg-white text-zinc-900 border-zinc-900 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
          }`}
          title="Valorar"
        >
          <Star className={cn("w-3.5 h-3.5 mr-1.5 group-hover/btn:scale-110 transition-transform duration-300", averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-zinc-400")} /> 
          {averageRating > 0 ? averageRating.toFixed(1) : "Valorar"}
        </button>

        <button
          onClick={handleVisualizar}
          className={`group/btn flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-sm font-black transition-all duration-200 active:scale-95 border-2 ${
            isCreatorNote
              ? "bg-amber-100 text-amber-900 border-amber-500 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]"
              : "bg-white text-zinc-900 border-zinc-900 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
          }`}
          title="Previsualizar"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5 group-hover/btn:scale-110 transition-transform duration-300" /> Ver
        </button>

        <button
          onClick={handleDownload}
          className={`group/btn flex-1 sm:flex-none flex items-center justify-center px-3.5 py-2 text-sm font-black border-2 transition-all duration-200 active:scale-95 ${
            downloaded
              ? "bg-emerald-100 text-emerald-700 border-emerald-600"
              : isCreatorNote
                ? "bg-amber-500 text-white border-amber-700 shadow-[3px_3px_0px_0px_rgba(120,53,15,1)] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(120,53,15,1)]"
                : "bg-emerald-400 text-zinc-900 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]"
          }`}
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1 animate-checkmark" /> Listo
            </>
          ) : (
            <>
              Descargar <Download className="w-3.5 h-3.5 ml-1.5 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        ratings={localRatings}
        onRate={handleRate}
        noteTitle={note.title}
      />
    </div>
  );
}
