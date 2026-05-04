"use client";

import { Search, X, ChevronRight, FileText } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { subjectsData, careersData, yearConfig, type Note } from "@/lib/data";
import { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useScrollLock } from "@/hooks/useScrollLock";

const yearIcons: Record<string, React.ElementType> = { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award };

const tagClass: Record<string, string> = {
  'Resumen': 'tag-resumen',
  'Examen': 'tag-examen',
  'Trabajo Práctico': 'tag-tp',
  'Guía de Ejercicios': 'tag-guia',
};

export function GlobalSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteSortingOrder, setNoteSortingOrder] = useState("newest");

  // Bloquea el scroll del fondo cuando el modal de búsqueda está abierto
  useScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Usamos la tecla "/" (barra diagonal) como atajo rápido universal
      // Verificamos que el usuario no esté escribiendo en un input o textarea
      if (e.key === "/" && e.target instanceof HTMLElement && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") { setIsOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  // Carga de notas desde Firebase solo cuando está abierto
  useEffect(() => {
    if (isOpen) {
      const fetchNotes = async () => {
        try {
          const notesRef = collection(db, "notes");
          const q = query(notesRef, where("status", "==", "approved"));
          const snapshot = await getDocs(q);
          const notesList: Note[] = snapshot.docs.map(noteDoc => {
            const data = noteDoc.data();
            return {
              id: noteDoc.id,
              ...data,
              type: data.type === "Examen Resuelto" ? "Examen" : data.type
            } as Note;
          });
          setNotes(notesList);
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      };

      const fetchSettings = async () => {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const settingsSnap = await getDoc(doc(db, "settings", "global"));
          if (settingsSnap.exists()) {
            setNoteSortingOrder(settingsSnap.data().noteSortingOrder || "newest");
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      };

      fetchNotes();
      fetchSettings();
    }
  }, [isOpen]);

  const { subjectMatches, noteMatches } = useMemo(() => {
    if (!searchQuery.trim()) return { subjectMatches: [], noteMatches: [] };
    const q = searchQuery.toLowerCase();
    
    const subMatches = subjectsData
      .filter(s => s.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(s => {
        const count = notes.filter(n => n.subjectId === s.id).length;
        return { type: 'subject' as const, subject: { ...s, notesCount: count } };
      });
      
    const notMatches = notes
      .filter(n => n.title?.toLowerCase().includes(q) || n.author?.toLowerCase().includes(q))
      .sort((a, b) => {
        if (noteSortingOrder === "oldest") return (a.uploadDate || "").localeCompare(b.uploadDate || "");
        if (noteSortingOrder === "score") {
          const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
          const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
          return scoreB - scoreA;
        }
        if (noteSortingOrder === "alphabetical") return (a.title || "").localeCompare(b.title || "", "es-AR", { numeric: true });
        return (b.uploadDate || "").localeCompare(a.uploadDate || "");
      })
      .slice(0, 5)
      .map(note => {
        const subject = subjectsData.find(s => s.id === note.subjectId) || subjectsData[0];
        return { type: 'note' as const, note, subject };
      });
      
    return { subjectMatches: subMatches, noteMatches: notMatches };
  }, [searchQuery, notes, noteSortingOrder]);

  const hasResults = subjectMatches.length > 0 || noteMatches.length > 0;

  return (
    <>
      <div className="w-full max-w-lg mx-auto animate-fade-in-up">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center w-full h-12 rounded-2xl border border-[#EDE6DD] bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.02)] overflow-hidden hover:border-[#C5DBC9] hover:shadow-md hover:shadow-[#8BAA91]/10 transition-all duration-300 cursor-text group"
        >
          <div className="pl-4 pr-3 flex items-center text-[#A89F95] group-hover:text-[#8BAA91] transition-colors duration-300">
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="flex-1 text-left text-[#A89F95] text-sm group-hover:translate-x-1 transition-transform duration-300">
            Buscar materia o apunte...
          </span>
          <div className="pr-3 hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#A89F95] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
              Buscar rápido
            </span>
            <div className="relative">
              <kbd className="px-2 py-0.5 rounded-md bg-[#F5F0EA] text-[11px] font-bold text-[#A89F95] border border-[#EDE6DD] group-hover:border-[#C5DBC9] group-hover:bg-[#EEF3EF] group-hover:text-[#4A7A52] transition-colors duration-300">
                /
              </kbd>
            </div>
          </div>
        </button>
      </div>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-black/20 shadow-[0_0_10px_rgba(0,0,0,0.02)] px-4"
          onClick={() => { setIsOpen(false); setSearchQuery(""); }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/10 overflow-hidden border border-[#EDE6DD] animate-fade-in-scale"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-[#EDE6DD] bg-gradient-to-r from-white to-[#FFFBF7]">
              <Search className="w-4 h-4 text-[#8BAA91] mr-3 shrink-0" />
              <input
                ref={inputRef} 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar materia, apunte o autor..."
                className="flex-1 outline-none text-base text-[#3D3229] bg-transparent placeholder:text-[#A89F95]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1 rounded-lg hover:bg-[#F5F0EA] text-[#A89F95] transition-colors mr-2 active:scale-90">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="px-2 py-0.5 rounded-lg bg-[#F5F0EA] border border-[#EDE6DD] text-[10px] font-bold text-[#A89F95] cursor-pointer hover:bg-[#EDE6DD] transition-all" onClick={() => { setIsOpen(false); setSearchQuery(""); }}>
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto w-full">
              {searchQuery.trim() === "" ? (
                <div className="px-4 py-10 text-center">
                  <Search className="w-8 h-8 text-[#EDE6DD] mx-auto mb-3" />
                  <p className="text-sm text-[#A89F95]">Escribí algo para buscar entre materias y apuntes</p>
                </div>
              ) : !hasResults ? (
                <div className="px-4 py-10 text-center">
                  <FileText className="w-8 h-8 text-[#EDE6DD] mx-auto mb-3" />
                  <p className="text-sm text-[#A89F95]">No encontramos resultados para &ldquo;{searchQuery}&rdquo;</p>
                </div>
              ) : (
                <div className="py-1.5 flex flex-col group/results">
                  
                  {/* SECCION MATERIAS */}
                  {subjectMatches.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-[11px] font-extrabold text-[#4A7A52] uppercase tracking-wider bg-[#EEF3EF] border-y border-[#D6E5D8] mt-1 mb-2 first:mt-0 shadow-sm">
                        Materias
                      </div>
                      
                      {subjectMatches.map((r, i) => {
                        const yr = r.subject.year;
                        const yc = yearConfig[yr] || yearConfig[1]; /* Fallback si es 'basicas' o config sin año */
                        const YearIcon = yc?.icon ? yearIcons[yc.icon] : null;

                        return (
                          <Link
                            key={"sub-" + i}
                            href={`/carreras/${r.subject.careerId}/materias/${r.subject.id}`}
                            onClick={() => { setIsOpen(false); setSearchQuery(""); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F0EA] transition-all group cursor-pointer animate-fade-in-up"
                          >
                            <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${yc?.bg || "bg-gray-100"}`}>
                              {YearIcon && <YearIcon className={`w-3.5 h-3.5 ${yc?.text || "text-gray-500"}`} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#3D3229] truncate group-hover:text-[#4A7A52] transition-colors">
                                {r.subject.name}
                              </p>
                              <p className="text-[11px] text-[#A89F95] truncate">
                                {`${careersData.find(c => c.id === r.subject.careerId)?.shortName || ""} ${r.subject.careerId === "basicas" ? "" : `· ${yc?.label || ""}`} · ${r.subject.notesCount} apunte${r.subject.notesCount !== 1 ? "s" : ""}`}
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#A89F95] group-hover:text-[#8BAA91] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        );
                      })}
                    </>
                  )}
                  
                  {/* SECCION APUNTES */}
                  {noteMatches.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-[11px] font-extrabold text-[#9C6527] uppercase tracking-wider bg-[#FFF7ED] border-y border-[#F0DDC5] mt-3 mb-2 first:mt-0 shadow-sm">
                        Apuntes
                      </div>
                      
                      {noteMatches.map((r, i) => {
                        const yr = r.subject.year;
                        const yc = yearConfig[yr] || yearConfig[1]; /* Fallback si es 'basicas' o config sin año */
                        const YearIcon = yc?.icon ? yearIcons[yc.icon] : null;

                        return (
                          <Link
                            key={"not-" + i}
                            href={`/carreras/${r.subject.careerId}/materias/${r.subject.id}`}
                            onClick={() => { setIsOpen(false); setSearchQuery(""); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F0EA] transition-all group cursor-pointer animate-fade-in-up"
                          >
                            <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${yc?.bg || "bg-gray-100"}`}>
                              {YearIcon && <YearIcon className={`w-3.5 h-3.5 ${yc?.text || "text-gray-500"}`} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#3D3229] truncate group-hover:text-[#4A7A52] transition-colors">
                                {r.note.title}
                              </p>
                              <p className="text-[11px] text-[#A89F95] truncate">
                                {`en ${r.subject.name} · por ${r.note.author}`}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagClass[r.note.type] || "bg-[#F5F5F5] text-[#A89F95]"}`}>
                              {r.note.type}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#A89F95] group-hover:text-[#8BAA91] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        );
                      })}
                    </>
                  )}
                  
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
