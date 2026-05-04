"use client";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useState, useEffect } from "react";
import { Note } from "@/lib/data";
import { X, Check } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow-[0_0_10px_rgba(0,0,0,0.02)] p-4 sm:p-6 overscroll-none"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-[#E3DCD2] overflow-hidden">
        <div className="p-4 border-b border-[#EDE6DD] flex justify-between items-center bg-white rounded-t-2xl shrink-0 z-10">
          <h2 className="text-lg font-bold text-[#3D3229]">Editar Apunte</h2>
          <button onClick={onClose} className="p-2 bg-[#F5F0EA] hover:bg-[#EDE6DD] rounded-xl text-[#7A6E62] transition-colors outline-none"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="p-5 space-y-4 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 focus:border-[#8BAA91]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Autor</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 focus:border-[#8BAA91]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Materia</label>
            <CustomSelect
              value={subjectId}
              onChange={setSubjectId}
              options={validSubjects.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Materia..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Carrera</label>
            <CustomSelect
              value={careerId}
              onChange={setCareerId}
              options={careersData.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Carrera..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Tipo</label>
            <CustomSelect
              value={type}
              onChange={(val) => setType(val as Note["type"])}
              options={["Resumen", "Examen", "Trabajo Práctico", "Guía de Ejercicios"].map(t => ({ value: t, label: t }))}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Carpeta / Agrupación (Opcional)</label>
            <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Ej. Primer Parcial" className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 focus:border-[#8BAA91]" />
            <p className="text-xs text-[#A89F95] mt-1">Si dejas este campo vacío, se mostrará en &quot;General&quot;.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#3D3229] mb-1.5">Puntos de Prioridad (Orden Manual)</label>
            <input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 0)} placeholder="Ej. 1" className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 focus:border-[#8BAA91]" />
            <p className="text-xs text-[#A89F95] mt-1">Un número mayor hará que el apunte aparezca más arriba.</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#EDE6DD] bg-[#FFFBF7] rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-[#7A6E62] hover:bg-[#EDE6DD] rounded-xl transition-all outline-none">Cancelar</button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-[#8BAA91] hover:bg-[#7A9980] text-white text-sm font-bold rounded-xl transition-all shadow-sm outline-none">
            {isSaving ? "Guardando..." : <><Check className="w-4 h-4" /> Guardar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
