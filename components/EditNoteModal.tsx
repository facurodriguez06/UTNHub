"use client";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useState, useEffect } from "react";
import { Note } from "@/lib/data";
import { X, Check, Loader2 } from "lucide-react";
import { careersData, subjectsData, getSubjectsByCareer } from "@/lib/data";
import { CustomSelect } from "./CustomSelect";

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSave: (updatedNote: Partial<Note>) => Promise<void>;
}

export function EditNoteModal({ isOpen, onClose, note, onSave }: EditNoteModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [folderName, setFolderName] = useState("");
  const [careerId, setCareerId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [type, setType] = useState<Note["type"]>("Resumen");
  const [priority, setPriority] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setAuthor(note.author || "");
      setFolderName(note.folderName || "");
      setCareerId(note.careerId || "");
      setSubjectId(note.subjectId || "");
      setType(note.type || "Resumen");
      setPriority(note.priority || 0);
    }
  }, [note]);

  // Bloquear scroll de fondo cuando el modal está abierto
  useScrollLock(isOpen);

  if (!isOpen || !note) return null;

  // Filtrar materias por carrera si hay una seleccionada, sino mostrarlas todas pero filtrando duplicados
  const validSubjects = careerId 
    ? getSubjectsByCareer(careerId) 
    : Array.from(new Map(subjectsData.map(s => [s.id, s])).values());

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        title,
        author,
        folderName,
        careerId,
        subjectId,
        type,
        priority,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overscroll-none"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full max-w-lg border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-zinc-900 p-6 text-white flex justify-between items-center border-b-4 border-zinc-900 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">EDITAR APUNTE</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white text-zinc-900 border-2 border-zinc-900 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
        
        {/* Form Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar text-left">
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">TÍTULO DEL APUNTE</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-white border-4 border-zinc-900 px-4 py-3 font-bold text-sm text-zinc-900 outline-none focus:bg-zinc-50 transition-colors" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">AUTOR / COLABORADOR</label>
              <input 
                type="text" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)} 
                className="w-full bg-white border-4 border-zinc-900 px-4 py-3 font-bold text-sm text-zinc-900 outline-none focus:bg-zinc-50 transition-colors" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">MATERIA</label>
                <CustomSelect
                  value={subjectId}
                  onChange={setSubjectId}
                  options={validSubjects.map(s => ({ value: s.id, label: s.name }))}
                  placeholder="SELECCIONAR..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">CARRERA</label>
                <CustomSelect
                  value={careerId}
                  onChange={setCareerId}
                  options={careersData.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="SELECCIONAR..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">TIPO DE CONTENIDO</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val as Note["type"])}
                options={["Resumen", "Examen", "Trabajo Práctico", "Guía de Ejercicios"].map(t => ({ value: t, label: t.toUpperCase() }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">AGRUPACIÓN (OPCIONAL)</label>
              <input 
                type="text" 
                value={folderName} 
                onChange={(e) => setFolderName(e.target.value)} 
                placeholder="EJ: PRIMER PARCIAL" 
                className="w-full bg-white border-4 border-zinc-900 px-4 py-3 font-bold text-sm text-zinc-900 outline-none focus:bg-zinc-50 transition-colors uppercase placeholder:text-zinc-300" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 text-left">PRIORIDAD (ORDEN MANUAL)</label>
              <input 
                type="number" 
                value={priority} 
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)} 
                className="w-full bg-white border-4 border-zinc-900 px-4 py-3 font-bold text-sm text-zinc-900 outline-none focus:bg-zinc-50 transition-colors" 
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-8 border-t-4 border-zinc-900 bg-zinc-50 flex flex-col sm:flex-row gap-4 shrink-0">
          <button 
            onClick={onClose} 
            disabled={isSaving} 
            className="w-full sm:w-1/3 neo-btn bg-white text-zinc-900 py-4 text-xs font-black"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full sm:w-2/3 neo-btn-primary bg-zinc-900 text-white py-4 text-xs font-black flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5 text-emerald-400" strokeWidth={3} />
                GUARDAR CAMBIOS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
