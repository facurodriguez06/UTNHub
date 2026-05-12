"use client";

import {
  UploadCloud,
  Check,
  FileType,
  BookOpen,
  X,
  Upload,
  FileText,
  Pencil,
  Building2,
  User,
  RefreshCw,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { careersData, yearConfig, getSubjectsByCareerAndYear, getSubjectsByCareer } from "@/lib/data";
import { db } from "@/lib/firebase/config";
import { CustomSelect } from "./CustomSelect";
import { useAuth } from "@/context/AuthContext";

export function UploadModule() {
  const searchParams = useSearchParams();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [carrera, setCarrera] = useState("");
  const [anio, setAnio] = useState("");
  const [materia, setMateria] = useState("");
  const [tipo, setTipo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams) {
      const initCarrera = searchParams.get("carrera");
      const initAnio = searchParams.get("anio");
      const initMateria = searchParams.get("materia");
      if (initCarrera) setCarrera(initCarrera);
      if (initAnio) setAnio(initAnio);
      if (initMateria) setMateria(initMateria);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !author) {
      const defaultName = user.displayName || (user.email ? user.email.split('@')[0] : "");
      if (defaultName) {
        setAuthor(defaultName);
      }
    }
  }, [user, author]);

  const sanitize = (input: string, maxLen = 120): string =>
    input.replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "").trim().slice(0, maxLen);

  const ALLOWED_TYPES = [".pdf", ".doc", ".docx", ".xlsx", ".zip", ".rar", ".jpg", ".jpeg", ".png"];
  const MAX_SIZE_MB = 50;

  const handleFileSelect = (selectedFiles: FileList | null) => {
    setError("");
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    
    Array.from(selectedFiles).forEach(selectedFile => {
      const ext = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;

      if (!ALLOWED_TYPES.includes(ext)) {
        setError(`"${selectedFile.name}" no es válido. Solo: ${ALLOWED_TYPES.join(", ")}`);
        return;
      }

      if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${selectedFile.name}" excede los ${MAX_SIZE_MB}MB permitidos.`);
        return;
      }
      
      validFiles.push(selectedFile);
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      if (!title && validFiles.length > 0) {
        if (validFiles.length === 1) {
          setTitle(validFiles[0].name.split(".").slice(0, -1).join("."));
        } else {
          setTitle("");
        }
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFiles([]);
    setTitle("");
    setAuthor("");
    setCarrera("");
    setAnio("");
    setMateria("");
    setTipo("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    const cleanTitle = sanitize(title);
    const cleanAuthor = sanitize(author) || "Anonimo";
    const isTitleInvalid = files.length === 1 && !cleanTitle;

    if (files.length === 0 || isTitleInvalid || !carrera || (carrera !== "basicas" && !anio) || !materia || !tipo) {
      setError("Completa todos los campos obligatorios antes de subir.");
      return;
    }

    setIsUploading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const progressStep = 90 / files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileTitle = file.name.split(".").slice(0, -1).join(".");
        if (cleanTitle && cleanTitle !== "Lote de Apuntes de Materia" && cleanTitle !== fileTitle) {
          fileTitle = files.length > 1 ? `${cleanTitle} (Parte ${i + 1})` : cleanTitle;
        }

        const presignRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folder: 'notes',
            title: fileTitle,
            fileName: file.name,
            contentType: file.type || 'application/octet-stream'
          })
        });

        if (!presignRes.ok) {
          const errText = await presignRes.text();
          throw new Error(`Error obteniendo permisos de subida: ${errText}`);
        }

        const presignData = await presignRes.json();
        if (!presignData?.url) {
          throw new Error('El servidor no devolvió una URL válida para subir el archivo.');
        }

        let uploadRes;
        try {
          uploadRes = await fetch(presignData.url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file
          });
        } catch (fetchError: unknown) {
          console.error("Fetch error completo:", fetchError);
          if (fetchError instanceof Error && fetchError.message === 'Failed to fetch') {
            throw new Error("El navegador bloqueó la subida (Error de CORS).");
          }
          throw fetchError;
        }

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Error al transferir el archivo ${file.name}.`);
        }

        const uploadResult = {
          url: presignData.path,
          path: presignData.path,
          secure_url: presignData.path,
          provider: 'r2'
        };

        const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";

        const newNote = {
          title: fileTitle,
          author: cleanAuthor,
          uploadDate: today,
          type:
            tipo === "resumen"
              ? "Resumen"
              : tipo === "examen"
                ? "Examen"
                : tipo === "tp"
                  ? "Trabajo Práctico"
                  : "Guía de Ejercicios",
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          fileType: fileExt === "DOC" ? "DOCX" : fileExt,
          fileUrl: uploadResult.path || uploadResult.url || uploadResult.secure_url,
          status: "pending",
          careerId: availableSubjects.find((s) => s.id === materia)?.careerId || carrera,
          subjectId: materia,
          year: availableSubjects.find((s) => s.id === materia)?.year || parseInt(anio, 10) || 1,
        };
        await addDoc(collection(db, "notes"), newNote);
        
        try {
          const subjectName = availableSubjects.find((s) => s.id === materia)?.name || materia;
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: fileTitle,
              author: cleanAuthor,
              subject: subjectName,
              type: newNote.type
            })
          }).catch(e => console.error("Error en fetch a /api/notify:", e));
        } catch (notifyError) {
          console.error("Error al intentar notificar:", notifyError);
        }

        setUploadProgress(5 + progressStep * (i + 1));
      }

      setUploadProgress(100);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        resetForm();
      }, 4000);
    } catch (err: unknown) {
      console.error("DETALLE DEL ERROR:", err);
      const message = err instanceof Error ? err.message : "Hubo un problema al subir.";
      setError(message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 300);
    }
  };

  const isValid = files.length > 0 && (files.length > 1 ? true : sanitize(title) !== "") && carrera && (carrera === "basicas" ? true : anio) && materia && tipo;

  const selectedCareer = careersData.find((career) => career.id === carrera);
  const availableYears = selectedCareer
    ? [
        ...Array.from({ length: selectedCareer.maxYears }, (_, index) => index + 1),
        ...(carrera !== "basicas" ? [99] : [])
      ]
    : [];
  const availableSubjects = 
    carrera === "basicas" 
      ? getSubjectsByCareer("basicas") 
      : (carrera && anio ? getSubjectsByCareerAndYear(carrera, parseInt(anio, 10)) : []);

  const handleCarreraChange = (value: string) => {
    setCarrera(value);
    if (value === "basicas") {
      setAnio("1");
    } else {
      setAnio("");
    }
    setMateria("");
  };

  const handleAnioChange = (value: string) => {
    setAnio(value);
    setMateria("");
  };

  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white border-4 border-zinc-900 overflow-hidden animate-fade-in-scale shadow-[12px_12px_0px_0px_rgba(16,185,129,1)]">
        <div className="h-4 bg-emerald-400 border-b-4 border-zinc-900" />
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="w-20 h-20 border-4 border-zinc-900 bg-emerald-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 transform -rotate-3">
            <Check className="w-10 h-10 text-emerald-700 animate-checkmark" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase italic tracking-tighter">¡SUBIDA EXITOSA!</h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-black uppercase tracking-widest border-l-4 border-emerald-400 pl-4 py-2 text-left">
            GRACIAS POR COLABORAR. <br />
            TUS COMPAÑEROS TE LO AGRADECERÁN.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto group">
      <div className="absolute -inset-4 bg-zinc-900/5 border-4 border-dashed border-zinc-200 -z-10 transform rotate-1 group-hover:rotate-0 transition-transform" />

      <div className="relative bg-white border-4 border-zinc-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] z-10 overflow-hidden">
        <div className="h-3 bg-emerald-400 border-b-4 border-zinc-900" />

        <div className="p-8 border-b-4 border-zinc-900 bg-zinc-50">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 border-4 border-zinc-900 bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transform -rotate-2">
              <Upload className="w-6 h-6 text-zinc-900" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none mb-1">SUBIR APUNTE</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 border border-zinc-900" />
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">SISTEMA DE COLABORACIÓN ABIERTA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {files.length === 0 ? (
            <div
              className={`relative flex flex-col items-center justify-center w-full py-16 px-6 border-4 border-dashed transition-all duration-300 cursor-pointer group/drop ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] -translate-y-2"
                  : "border-zinc-300 bg-zinc-50/50 hover:bg-emerald-50/50 hover:border-emerald-500 hover:shadow-[8px_8px_0px_0px_rgba(16,185,129,0.1)]"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleFileSelect(event.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 transform transition-transform group-hover/drop:rotate-6 group-hover/drop:scale-110">
                <UploadCloud className="w-10 h-10 text-zinc-900" strokeWidth={3} />
              </div>
              <p className="text-lg text-zinc-900 font-black uppercase italic tracking-tighter mb-2">ARRASTRA TUS ARCHIVOS</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6 text-center leading-relaxed">
                PDF, DOCX, XLSX, ZIP, RAR, JPG O PNG <br/> (LÍMITE: 50MB POR ARCHIVO)
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border-4 border-emerald-500 text-[10px] text-emerald-700 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]">
                ¡MÚLTIPLE SELECCIÓN SOPORTADA!
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xlsx,.zip,.rar,.jpg,.jpeg,.png"
                onChange={(event) => handleFileSelect(event.target.files)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b-4 border-zinc-100 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">COLA DE SUBIDA</p>
                  <span className="text-xl font-black text-zinc-900 italic uppercase tracking-tighter">
                    {files.length} ARCHIVO{files.length > 1 ? 'S' : ''} LISTO{files.length > 1 ? 'S' : ''}
                  </span>
                </div>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-zinc-900 transition-all shadow-[4px_4px_0px_0px_rgba(52,211,153,1)]"
                 >
                   <Upload className="w-4 h-4" /> AGREGAR MÁS
                 </button>
                 <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xlsx,.zip,.rar,.jpg,.jpeg,.png"
                    onChange={(event) => handleFileSelect(event.target.files)}
                  />
              </div>
              
              <div className="max-h-[220px] overflow-y-auto pr-2 flex flex-col gap-4 no-scrollbar custom-scrollbar">
                {files.map((selectedFile, index) => (
                  <div key={`${selectedFile.name}-${index}`} className="flex items-center gap-4 p-4 bg-zinc-50 border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] animate-fade-in-scale group/item hover:bg-white transition-colors">
                    <div className="w-10 h-10 bg-white border-2 border-zinc-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/item:bg-emerald-400 transition-colors">
                      <FileText className="w-5 h-5 text-zinc-900" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-900 truncate uppercase tracking-tight">{selectedFile.name}</p>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest italic">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 bg-white hover:bg-rose-600 text-zinc-400 hover:text-white border-2 border-zinc-900 transition-all active:scale-90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                <span className="w-2 h-2 bg-zinc-900" /> TÍTULO {files.length > 1 ? "( OPCIONAL )" : ""}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-emerald-500 transition-colors">
                  <Pencil className="w-5 h-5" strokeWidth={3} />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="EJ. RESUMEN COMPLETO PRIMER PARCIAL"
                  className="w-full pl-14 pr-6 py-4 bg-white border-4 border-zinc-900 text-sm text-zinc-900 font-black uppercase tracking-widest placeholder:text-zinc-200 focus:outline-none focus:bg-zinc-50 focus:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all"
                />
              </div>
              {files.length > 1 && (
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest italic">
                  * SI SE DEJA VACÍO SE USARÁ EL NOMBRE ORIGINAL DE CADA ARCHIVO.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label htmlFor="author" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                <span className="w-2 h-2 bg-zinc-900" /> AUTOR ( OPCIONAL )
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-emerald-500 transition-colors">
                  <User className="w-5 h-5" strokeWidth={3} />
                </div>
                <input
                  id="author"
                  name="author"
                  type="text"
                  autoComplete="name"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="TU NOMBRE O ALIAS"
                  maxLength={50}
                  className="w-full pl-14 pr-6 py-4 bg-white border-4 border-zinc-900 text-sm text-zinc-900 font-black uppercase tracking-widest placeholder:text-zinc-200 focus:outline-none focus:bg-zinc-50 focus:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-4 border-t-4 border-zinc-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                  <span className="w-2 h-2 bg-zinc-900" /> CARRERA
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                    <Building2 className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <CustomSelect
                    value={carrera}
                    onChange={handleCarreraChange}
                    options={careersData.map((career) => ({ value: career.id, label: career.shortName }))}
                    placeholder="ELEGIR..."
                    className="pl-14"
                  />
                </div>
              </div>

              {carrera !== "basicas" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                    <span className="w-2 h-2 bg-zinc-900" /> AÑO
                  </label>
                  <CustomSelect
                    value={anio}
                    onChange={handleAnioChange}
                    disabled={!carrera}
                    options={availableYears.map((year) => ({ value: String(year), label: yearConfig[year]?.label || `Año ${year}` }))}
                    placeholder="ELEGIR..."
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                  <span className="w-2 h-2 bg-zinc-900" /> MATERIA
                </label>
                <CustomSelect
                  value={materia}
                  onChange={setMateria}
                  disabled={!carrera || !anio}
                  options={availableSubjects.map((subject) => ({ value: subject.id, label: subject.name }))}
                  placeholder="BUSCAR MATERIA..."
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                  <span className="w-2 h-2 bg-zinc-900" /> CATEGORÍA
                </label>
                <CustomSelect
                  value={tipo}
                  onChange={setTipo}
                  options={[
                    { value: "resumen", label: "RESUMEN" },
                    { value: "examen", label: "EXAMEN" },
                    { value: "tp", label: "TRABAJO PRÁCTICO" },
                    { value: "guia", label: "GUÍA DE EJERCICIOS" },
                  ]}
                  placeholder="ELEGIR..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t-4 border-zinc-900 bg-zinc-50">
          {isUploading && (
            <div className="w-full mb-8 animate-fade-in">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] italic animate-pulse">TRANSMITIENDO DATOS...</span>
                <span className="text-xl font-black text-zinc-900 italic tracking-tighter">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-6 bg-white border-4 border-zinc-900 overflow-hidden shadow-inner p-1">
                <div
                  className="h-full bg-emerald-400 border-r-4 border-zinc-900 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-4 p-5 mb-8 bg-rose-50 border-4 border-rose-600 text-rose-600 font-black uppercase tracking-widest text-xs animate-shake shadow-[6px_6px_0px_0px_rgba(225,29,72,0.1)]">
              <div className="w-10 h-10 bg-rose-600 border-2 border-zinc-900 flex items-center justify-center shrink-0 text-white">
                <X className="w-6 h-6" strokeWidth={3} />
              </div>
              <p className="leading-tight">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={resetForm}
              disabled={isUploading}
              className="w-full sm:w-auto px-10 py-5 bg-white border-4 border-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
            >
              LIMPIAR FORMULARIO
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isUploading}
              className={`w-full flex-1 group/btn flex items-center justify-center gap-4 py-5 text-sm font-black transition-all border-4 uppercase tracking-widest ${
                isValid && !isUploading
                  ? "bg-emerald-400 text-zinc-900 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                  : "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed"
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" strokeWidth={3} /> PROCESANDO...
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    INICIAR SUBIDA <UploadCloud className="w-6 h-6 group-hover/btn:-translate-y-1 transition-transform" strokeWidth={3} />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
