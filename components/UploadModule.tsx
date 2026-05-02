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
  Send,
  Building2,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { careersData, yearConfig, getSubjectsByCareerAndYear, getSubjectsByCareer } from "@/lib/data";
import { db } from "@/lib/firebase/config";
import { CustomSelect } from "./CustomSelect";
import { useAuth } from "@/context/AuthContext";

type UploadApiResponse = {
  url?: string;
  error?: string;
};

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
  }, [user]);

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
      // Si suben múltiples archivos y no había título
      if (!title && validFiles.length > 0) {
        if (validFiles.length === 1) {
          setTitle(validFiles[0].name.split(".").slice(0, -1).join("."));
        } else {
          setTitle(""); // Dejarlo vacío para que se usen los nombres originales de los archivos en la subida
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

      // Si sube un solo archivo y el titulo limpiado queda vacío, es error.
      // Si sube varios archivos, el título es opcional.
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
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
          
          // Si el usuario introdujo un título manual general, le agregamos "Parte X". 
          // Si no, o si prefiere el nombre original, cae a usar el nombre del archivo sin extensión.
          let fileTitle = file.name.split(".").slice(0, -1).join(".");
          if (cleanTitle && cleanTitle !== "Lote de Apuntes de Materia" && cleanTitle !== fileTitle) {
            fileTitle = files.length > 1 ? `${cleanTitle} (Parte ${i + 1})` : cleanTitle;
          }

          // 1. Solicitar URL firmada al servidor
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

          // 2. Subir directamente el archivo a Cloudflare R2
          let uploadRes;
          try {
            uploadRes = await fetch(presignData.url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            });
          } catch (fetchError: any) {
            console.error("Fetch error completo:", fetchError);
            if (fetchError.message === 'Failed to fetch') {
              throw new Error("El navegador bloqueó la subida (Error de CORS). Por favor, asegurate de haber configurado las políticas CORS en tu bucket de Cloudflare R2 como te indicó el asistente.");
            }
            throw fetchError;
          }

          if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Error al transferir el archivo ${file.name} al almacenamiento externo. Estado: ${uploadRes.status}. Detalle: ${errText}`);
          }

          // 3. Resultado simulado idéntico a la API anterior
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
            year: availableSubjects.find((s) => s.id === materia)?.year || parseInt(anio, 10) || 1,          };
        await addDoc(collection(db, "notes"), newNote);
        
        // Notificar a Discord (no bloqueante para no romper la subida)
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
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-[#C5DBC9] overflow-hidden animate-fade-in-scale shadow-lg shadow-[#8BAA91]/10">
        <div className="h-1.5 bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8]" />
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0EA] flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-[#4A7A52] animate-checkmark" />
          </div>
          <h2 className="text-xl font-extrabold text-[#3D3229] mb-2">Gracias por colaborar</h2>
          <p className="text-sm text-[#7A6E62] leading-relaxed">
            Tu apunte fue subido con exito.
            <br />
            Tus companeros te lo van a agradecer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="blob w-52 h-52 bg-[#C5DBC9] -top-16 -left-16 animate-blob" />
      <div className="blob w-40 h-40 bg-[#D5CCE5] -bottom-16 -right-16 animate-blob" style={{ animationDelay: "3s" }} />

      <div className="relative bg-white/95 shadow-[0_0_10px_rgba(0,0,0,0.02)] rounded-2xl border border-[#E3DCD2] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10">
        <div className="h-1.5 rounded-t-[15px] bg-gradient-to-r from-[#8BAA91] via-[#7CC2A8] to-[#7BA7C2]" />

        <div className="p-5 border-b border-[#EDE6DD]">
          <div className="flex items-center gap-2.5">
            <div className="group/icon w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center shadow-sm shadow-[#8BAA91]/10 hover:shadow-md transition-all duration-300">
              <Upload className="w-4 h-4 text-[#4A7A52] group-hover/icon:-translate-y-1 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#3D3229]">Subir apunte</h2>
              <p className="text-xs text-[#A89F95]">Comparti tu material y ayuda a la cursada.</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {files.length === 0 ? (
            <div
              className={`relative flex flex-col items-center justify-center w-full py-10 px-4 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group/drop ${
                isDragging
                  ? "border-[#8BAA91] bg-[#E8F0EA] scale-[1.01] shadow-lg shadow-[#8BAA91]/20"
                  : "border-[#EDE6DD] bg-[#FFFBF7] hover:bg-[#F5F0EA] hover:border-[#8BAA91]/50 hover:shadow-md hover:-translate-y-0.5"
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
              <UploadCloud className="w-10 h-10 text-[#A89F95] mb-3 group-hover/drop:text-[#8BAA91] group-hover/drop:scale-110 group-hover/drop:-translate-y-1 transition-all duration-300" />
              <p className="text-sm text-[#7A6E62] font-semibold mb-1">Arrastra archivos o hace click</p>
              <p className="text-xs text-[#A89F95] mb-2">PDF, DOCX, XLSX, ZIP, RAR, JPG o PNG (Max. 50MB)</p>
              <p className="text-[10px] text-[#4A7A52] font-bold bg-[#E8F0EA] px-2 py-1 rounded-md group-hover/drop:bg-[#D6E5D8] transition-colors duration-300">¡Podés seleccionar varios a la vez!</p>
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
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1 mb-1">
                 <span className="text-sm font-bold text-[#3D3229]">{files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}</span>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#8BAA91] hover:text-[#4A7A52] hover:underline"
                 >
                   + Agregar más
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
              
              <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-2 no-scrollbar">
                {files.map((selectedFile, index) => (
                  <div key={`${selectedFile.name}-${index}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8F0EA] border border-[#C5DBC9] animate-fade-in-scale shrink-0">
                    <FileText className="w-5 h-5 text-[#4A7A52]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#3D3229] truncate">{selectedFile.name}</p>
                      <p className="text-xs text-[#4A7A52]">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#C5DBC9] text-[#4A7A52] transition-all active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                  <Pencil className="w-3.5 h-3.5 text-[#A89F95]" /> Título {files.length > 1 ? "(Opcional)" : ""}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Resumen completo primer parcial"
                  className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] placeholder:text-[#A89F95] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all"
                />
                {files.length > 1 && (
                  <p className="mt-1.5 text-xs text-[#7A6E62]">
                    Dejalo vacío para mantener el nombre original de cada archivo.
                  </p>
                )}
            </div>

            <div>
              <label htmlFor="author" className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <Pencil className="w-3.5 h-3.5 text-[#A89F95]" /> Tu nombre (opcional)
              </label>
              <input
                id="author"
                name="author"
                type="text"
                autoComplete="name"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Ej. Juan Perez"
                maxLength={50}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] placeholder:text-[#A89F95] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#A89F95]" /> Carrera
              </label>
              <CustomSelect
                value={carrera}
                onChange={handleCarreraChange}
                options={careersData.map((career) => ({ value: career.id, label: career.shortName }))}
                placeholder="Seleccionar..."
              />
            </div>

            {carrera !== "basicas" && (
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#A89F95]" /> Año
                </label>
                <CustomSelect
                  value={anio}
                  onChange={handleAnioChange}
                  disabled={!carrera}
                  options={availableYears.map((year) => ({ value: String(year), label: yearConfig[year]?.label || `Año ${year}` }))}
                  placeholder="Seleccionar..."
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#A89F95]" /> Materia
              </label>
              <CustomSelect
                value={materia}
                onChange={setMateria}
                disabled={!carrera || !anio}
                options={availableSubjects.map((subject) => ({ value: subject.id, label: subject.name }))}
                placeholder="Seleccionar..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <FileType className="w-3.5 h-3.5 text-[#A89F95]" /> Tipo
              </label>
              <CustomSelect
                value={tipo}
                onChange={setTipo}
                options={[
                  { value: "resumen", label: "Resumen" },
                  { value: "examen", label: "Examen" },
                  { value: "tp", label: "Trabajo Práctico" },
                  { value: "guia", label: "Guía de Ejercicios" },
                ]}
                placeholder="Seleccionar..."
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3 border-t border-[#EDE6DD] bg-[#FFFBF7] rounded-b-[15px]">
          {isUploading && (
            <div className="w-full space-y-1.5 animate-fade-in">
              <div className="flex justify-between text-[11px] font-bold text-[#4A7A52]">
                <span>Subiendo archivo...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8F0EA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs font-semibold text-[#8E5A5A] bg-[#F5E8E8] px-3 py-2 rounded-xl border border-[#E2CECE] animate-shake">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={resetForm}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-semibold text-[#7A6E62] hover:text-[#3D3229] rounded-xl hover:bg-[#F5F0EA] transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isUploading}
              className={`group/btn inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 active:scale-95 ${
                isValid && !isUploading
                  ? "bg-gradient-to-r from-[#8BAA91] to-[#6A8F70] text-white shadow-sm shadow-[#8BAA91]/20 hover:shadow-md hover:shadow-[#8BAA91]/30 hover:-translate-y-0.5 border border-[#597A5E]"
                  : "bg-[#EAE4DB] text-[#A89F95] cursor-not-allowed border border-[#DED5C7]"
              }`}
            >
              {isUploading ? (
                <>
                  <UploadCloud className="w-4 h-4 animate-bounce" /> Subiendo...
                </>
              ) : (
                <>
                  Subir Apunte <UploadCloud className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
