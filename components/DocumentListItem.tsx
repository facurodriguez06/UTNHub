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
  if (isCreator) return "bg-gradient-to-r from-[#FFFDF5] to-[#FFF9E6] border-[#EADAA6] hover:border-[#D4AF37] hover:shadow-[0_8px_24px_rgba(212,175,55,0.15)]";
  switch (type === "Examen Resuelto" ? "Examen" : type) {
    case "Resumen": return "bg-white border-[#E3DCD2] hover:border-[#8BAA91] hover:shadow-[0_8px_24px_rgba(139,170,145,0.12)]";
    case "Examen": return "bg-white border-[#E3DCD2] hover:border-[#D4856A] hover:shadow-[0_8px_24px_rgba(212,133,106,0.12)]";
    case "Trabajo Práctico": return "bg-white border-[#E3DCD2] hover:border-[#9B8BBF] hover:shadow-[0_8px_24px_rgba(155,139,191,0.12)]";
    case "Guía de Ejercicios": return "bg-white border-[#E3DCD2] hover:border-[#7BA7C2] hover:shadow-[0_8px_24px_rgba(123,167,194,0.12)]";
    default: return "bg-white border-[#E3DCD2] hover:border-[#8BAA91] hover:shadow-[0_8px_24px_rgba(139,170,145,0.12)]";
  }
};

const getCreatorTagClass = (type: string) => {
  switch (type === "Examen Resuelto" ? "Examen" : type) {
    case "Resumen": return "bg-[#4A7A52] text-white border border-[#3A6040]";
    case "Examen": return "bg-[#D4856A] text-white border border-[#B36850]";
    case "Trabajo Práctico": return "bg-[#9B8BBF] text-white border border-[#7A6BA3]";
    case "Guía de Ejercicios": return "bg-[#7BA7C2] text-white border border-[#5A87A2]";
    default: return "bg-[#3D3229] text-white";
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
          value,
          createdAt: new Date().toISOString()
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

  const handleDeleteRate = async () => {
    if (!user) return;
    try {
      const noteRef = doc(db, "notes", note.id);
      const noteDoc = await getDoc(noteRef);
      if (noteDoc.exists()) {
        const currentRatings = (noteDoc.data().ratings || []) as NoteRating[];
        const updatedRatings = currentRatings.filter((r) => r.uid !== user.uid);
        await updateDoc(noteRef, { ratings: updatedRatings });
        
        setLocalRatings(updatedRatings);
        showToast("Valoración eliminada correctamente.", "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Error al eliminar la valoración", "error");
    }
  };

  const averageRating = localRatings.length > 0 
    ? localRatings.reduce((acc, r) => acc + r.value, 0) / localRatings.length 
    : 0;

  const handleVisualizar = async () => {
    if (note.fileUrl) {
      // Incrementar contador de vistas en Firebase
      try {
        const noteRef = doc(db, "notes", note.id);
        await updateDoc(noteRef, {
          viewCount: increment(1)
        });
      } catch (error) {
        console.error("Error al incrementar vistas:", error);
      }

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
      className={`group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border rounded-xl hover:-translate-y-[2px] transition-all duration-400 ${!customAuthorStyle ? getBgClass(note.type, isCreatorNote) : ''}`} style={{ animationDelay: `${index * 40}ms`, ...(customAuthorStyle ? { backgroundColor: customAuthorStyle.color + '0a', borderColor: customAuthorStyle.color + '40' } : {}) }}
    >
      <div className="flex items-start gap-3 w-full sm:w-auto sm:flex-1 mb-3 sm:mb-0 min-w-0">
        <div
          style={customAuthorStyle ? { backgroundColor: customAuthorStyle.color + "1A", borderColor: customAuthorStyle.color + "66" } : undefined} className={`mt-0.5 shrink-0 p-2.5 rounded-xl border group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 ${
            isCreatorNote ? "bg-[#FFF4CC] border-[#E2C15F]" : "bg-[#F5F0EA] border-[#EDE6DD]"
          }`}
        >
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            style={customAuthorStyle ? { color: customAuthorStyle.color } : undefined} className={`font-bold text-sm transition-colors break-words ${
              isCreatorNote ? "text-[#7A5A0A] group-hover:text-[#5E4608]" : "text-[#3D3229] group-hover:text-[#4A7A52]"
            }`}
          >
            {note.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-1.5 w-full">
            <span
              style={customAuthorStyle ? { backgroundColor: customAuthorStyle.color + "22", color: customAuthorStyle.color } : undefined} className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                isCreatorNote ? "text-[#7A5A0A] bg-[#FFF0B3]" : "text-[#7A6E62] bg-[#F5F0EA]"
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
            <span className="text-[11px] text-[#A89F95]">{new Date(note.uploadDate).toLocaleDateString("es-AR")}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCreatorNote ? getCreatorTagClass(note.type) : (tagClass[note.type === "Examen Resuelto" ? "Examen" : note.type] || "tag-resumen")}`}>
              {note.type === "Examen Resuelto" ? "Examen" : note.type}
            </span>
            {note.fileSize && <span className="text-[11px] text-[#A89F95] font-medium">{note.fileSize}</span>}
          </div>
        </div>
      </div>

      <div className={`flex flex-row items-center justify-end w-full sm:w-auto gap-2 border-t mt-3 pt-3 sm:mt-0 sm:pt-0 sm:border-transparent flex-wrap sm:flex-nowrap ${isCreatorNote ? "border-[#E7D39A]" : "border-[#EDE6DD]"}`}>
        <button
          onClick={() => setIsRatingModalOpen(true)}
          className={`group/btn flex-1 sm:flex-none flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 ${
            isCreatorNote
              ? "bg-[#FFF4CC] text-[#7A5A0A] hover:bg-[#FFE9A3] hover:text-[#5E4608] border border-[#E2C15F]/50"
              : "bg-white text-[#7A6E62] border border-[#EBE3D5] hover:bg-[#FDFBF7] hover:border-[#DED5C7] hover:text-[#3D3229] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
          }`}
          title="Valorar"
        >
          <Star className={cn("w-3.5 h-3.5 mr-1.5 group-hover/btn:scale-110 transition-transform duration-300", averageRating > 0 ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D5CAC0]")} /> 
          {averageRating > 0 ? averageRating.toFixed(1) : "Valorar"}
        </button>

        <button
          onClick={handleVisualizar}
          className={`group/btn flex-1 sm:flex-none flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 ${
            isCreatorNote
              ? "bg-[#FFF4CC] text-[#7A5A0A] hover:bg-[#FFE9A3] hover:text-[#5E4608] border border-[#E2C15F]/50"
              : "bg-white text-[#7A6E62] border border-[#EBE3D5] hover:bg-[#FDFBF7] hover:border-[#DED5C7] hover:text-[#3D3229] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
          }`}
          title="Previsualizar"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5 group-hover/btn:scale-110 transition-transform duration-300" /> Ver
        </button>

        <button
          onClick={handleDownload}
          className={`group/btn flex-1 sm:flex-none flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold border transition-all duration-300 active:scale-95 ${
            downloaded
              ? "bg-[#E8F0EA] text-[#4A7A52] border-[#C5DBC9] shadow-inner"
              : isCreatorNote
                ? "bg-[#D4AF37] text-white border-[#C29D26] shadow-[0_2px_8px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_16px_rgba(212,175,55,0.35)] hover:-translate-y-1"
                : "bg-[#8BAA91] text-white border-[#7A9880] shadow-[0_2px_8px_rgba(139,170,145,0.25)] hover:shadow-[0_6px_16px_rgba(139,170,145,0.35)] hover:-translate-y-1"
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
        onDeleteRate={handleDeleteRate}
        noteTitle={note.title}
      />
    </div>
  );
}
