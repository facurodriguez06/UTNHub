"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Note } from "@/lib/data";
import { resolveStorageUrl } from "@/lib/storage";
import { useToast } from "@/context/ToastContext";
import { db } from "@/lib/firebase/config";
import { doc, writeBatch, increment } from "firebase/firestore";

export function BulkDownloadButton({ notes, label = "Descargar todo", compact = false, customHex }: { notes: Note[]; label?: string; compact?: boolean; customHex?: string }) {
  const [downloading, setDownloaded] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloading) return;
    if (!notes || notes.length === 0) {
      showToast("No hay archivos para descargar.", "error");
      return;
    }

    setDownloaded(true);
    showToast(`Preparando descarga de ${notes.length} archivo(s)...`, "info");

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let hasFiles = false;

      // Incrementar contador de descargas masivas en Firebase
      try {
        const batch = writeBatch(db);
        notes.forEach(note => {
          if (note.id) {
            const noteRef = doc(db, "notes", note.id);
            batch.update(noteRef, {
              downloadCount: increment(1)
            });
          }
        });
        await batch.commit();
      } catch (error) {
        console.error("Error al incrementar descargas masivas:", error);
      }

      // Fetch all files in parallel
      const downloadPromises = notes.map(async (note, i) => {
        if (!note.fileUrl) return null;

        const originalUrl = resolveStorageUrl(note.fileUrl);
        const proxyUrl = `/api/download?url=${encodeURIComponent(originalUrl)}`;

        let filename = note.title ? note.title.replace(/[\\/:*?"<>|]/g, '_') : `documento-${i + 1}`;
        const ext = note.fileType ? note.fileType.toLowerCase() : "pdf";        
        if (!filename.toLowerCase().endsWith(`.${ext}`)) {
          filename += `.${ext}`;
        }

        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error("Fetch failed");
          const blob = await response.blob();
          return { filename, blob, originalUrl, success: true };
        } catch (fetchErr) {
          console.error("Error al obtener el archivo:", filename, fetchErr);    
          return { filename, blob: null, originalUrl, success: false };
        }
      });

      const results = await Promise.all(downloadPromises);

      for (const result of results) {
        if (!result) continue;
        
        if (result.success && result.blob) {
          zip.file(result.filename, result.blob);
          hasFiles = true;
        } else {
          window.open(result.originalUrl, "_blank");
        }
      }

      if (!hasFiles) {
        showToast("Se abrieron los archivos de a uno por error de red.", "error");
        setDownloaded(false);
        return;
      }

      showToast("Comprimiendo archivos (ZIP)...", "info");
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `Apuntes.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      showToast("¡Descarga completada!", "success");
    } catch {
      showToast("Error crítico al generar el archivo ZIP.", "error");
    } finally {
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      title={label}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-95 group/btn
        ${compact ? "px-2.5 py-1.5 text-[11px] font-black gap-1.5 border-2" : "px-4 py-2.5 text-sm font-black gap-2 border-[3px] uppercase tracking-wider"}
        ${downloading
          ? "bg-emerald-100 text-emerald-700 border-emerald-600 opacity-70 cursor-not-allowed"
          : (compact && customHex)
            ? "text-[color:var(--dynamic-color)] bg-[color:var(--dynamic-bg)] border-[color:var(--dynamic-border)] hover:bg-[color:var(--dynamic-hover)] hover:border-[color:var(--dynamic-color)] hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
            : "bg-white text-zinc-900 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(16,185,129,1)]"}
      `}
      style={compact && customHex && !downloading ? {
        "--dynamic-color": customHex,
        "--dynamic-bg": `${customHex}` + "1A",
        "--dynamic-border": `${customHex}` + "40",
        "--dynamic-hover": `${customHex}` + "26"
      } as React.CSSProperties : undefined}
    >
      <Download className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} ${downloading ? "animate-pulse" : "group-hover/btn:scale-110 transition-transform"}`} />     
      {!compact && <span className="inline">{downloading ? "Descargando..." : label}</span>}
      {compact && <span className="sr-only">{label}</span>}
    </button>
  );
}
